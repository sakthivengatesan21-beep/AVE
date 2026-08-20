from datetime import datetime
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from app.models.domain import Agent, Policy, Action, VerificationRun, Violation, AuditLog
from app.verification.engine import verify_action
from app.services.simulated_tools import execute_simulated_tool

def execute_gateway_workflow(
    db: Session,
    agent_id: Optional[str],
    tool_name: str,
    arguments: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Executes the complete AVE core gateway pipeline:
    Agent -> Gateway -> Extract Params -> Resolve Policies -> Z3 Verification -> ALLOW/BLOCK -> Tool Execution / Audit Persistence
    """
    # 1. Validate agent
    agent = None
    if agent_id:
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        agent = db.query(Agent).first()
        agent_id = agent.id if agent else "agent-expense-01"

    # 2. Record intercepted action
    action = Action(
        agent_id=agent_id,
        tool_name=tool_name,
        arguments=arguments,
        status="PENDING"
    )
    db.add(action)
    db.flush()  # assign action.id

    # Audit log: ACTION_RECEIVED
    db.add(AuditLog(
        action_id=action.id,
        event_type="ACTION_RECEIVED",
        details={
            "agent_id": agent_id,
            "tool": tool_name,
            "arguments": arguments
        }
    ))

    # 3. Resolve applicable policies
    policies = db.query(Policy).filter(
        Policy.tool_name == tool_name,
        Policy.enabled == True
    ).all()

    policy_dicts = [
        {
            "id": p.id,
            "name": p.name,
            "constraint_definition": p.constraint_definition,
            "severity": p.severity
        }
        for p in policies
    ]

    # Audit log: POLICY_RESOLVED
    db.add(AuditLog(
        action_id=action.id,
        event_type="POLICY_RESOLVED",
        details={
            "tool": tool_name,
            "applicable_policies_count": len(policies),
            "policy_names": [p.name for p in policies]
        }
    ))

    # 4. Perform Z3 Verification
    verification_res = verify_action(
        action={"tool": tool_name, "arguments": arguments},
        applicable_policies=policy_dicts
    )

    is_sat = (verification_res["status"] == "verified")

    # Record Verification Run
    v_run = VerificationRun(
        action_id=action.id,
        policy_id=verification_res.get("policy_id"),
        result=verification_res["result"],
        solver=verification_res["solver"],
        constraint_evaluated=verification_res.get("constraint") or "None",
        runtime_state=arguments,
        verification_time_ms=verification_res["verification_time_ms"],
        reason=verification_res.get("reason")
    )
    db.add(v_run)

    execution_output = None

    if is_sat:
        # ALLOW decision -> Execute simulated external tool
        action.status = "VERIFIED"

        tool_res = execute_simulated_tool(tool_name, arguments)
        execution_output = tool_res
        action.status = "EXECUTED"
        action.completed_at = datetime.utcnow()

        # Audit log: ACTION_VERIFIED & ACTION_COMPLETED
        db.add(AuditLog(
            action_id=action.id,
            event_type="ACTION_VERIFIED",
            details={
                "solver": verification_res["solver"],
                "latency_ms": verification_res["verification_time_ms"]
            }
        ))
        db.add(AuditLog(
            action_id=action.id,
            event_type="ACTION_COMPLETED",
            details=tool_res
        ))

    else:
        # BLOCK decision -> Never execute external tool
        action.status = "BLOCKED"
        action.completed_at = datetime.utcnow()

        # Record Violation
        repair = verification_res.get("repair_guidance") or {}
        policy_obj = db.query(Policy).filter(Policy.id == verification_res.get("policy_id")).first()
        severity = policy_obj.severity if policy_obj else "high"

        violation = Violation(
            action_id=action.id,
            policy_id=verification_res.get("policy_id"),
            severity=severity,
            reason=verification_res.get("reason", "Policy violation detected"),
            actual_values=repair.get("actual_values", arguments),
            expected_condition=repair.get("expected_condition", verification_res.get("constraint") or ""),
            repair_guidance=repair
        )
        db.add(violation)

        # Audit log: ACTION_BLOCKED
        db.add(AuditLog(
            action_id=action.id,
            event_type="ACTION_BLOCKED",
            details={
                "policy_id": verification_res.get("policy_id"),
                "policy_name": verification_res.get("policy_name"),
                "reason": verification_res.get("reason"),
                "repair_guidance": repair
            }
        ))

    db.commit()
    db.refresh(action)

    return {
        "action_id": action.id,
        "status": action.status,
        "decision": "ALLOW" if is_sat else "BLOCK",
        "solver": verification_res["solver"],
        "result": verification_res["result"],
        "policy_id": verification_res.get("policy_id"),
        "policy_name": verification_res.get("policy_name"),
        "constraint": verification_res.get("constraint"),
        "reason": verification_res.get("reason"),
        "repair_guidance": verification_res.get("repair_guidance"),
        "verification_time_ms": verification_res["verification_time_ms"],
        "execution_result": execution_output
    }
