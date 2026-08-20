from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any

from app.core.database import get_db, engine
from app.models.domain import Agent, Policy, Action, VerificationRun, Violation, AuditLog
from app.schemas.schemas import (
    AgentResponse, AgentCreate,
    PolicyResponse, PolicyCreate, PolicyUpdate,
    ActionResponse, GatewayExecuteRequest, GatewayRetryRequest,
    VerificationRunResponse, ViolationResponse, AuditLogResponse,
    DashboardSummaryResponse
)
from app.services.gateway_service import execute_gateway_workflow
from app.verification.engine import verify_action
import z3

router = APIRouter()

# Health Endpoint
@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db_ok = True
        db.execute(func.now())
    except Exception:
        db_ok = False

    z3_version = z3.get_version_string()

    return {
        "status": "healthy" if db_ok else "unhealthy",
        "database_connected": db_ok,
        "verification_engine": "active",
        "solver": f"Z3 SMT Solver {z3_version}",
        "environment": "production"
    }

# Dashboard Summary Endpoint
@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_actions = db.query(Action).count()
    verified_actions = db.query(Action).filter(Action.status.in_(["VERIFIED", "EXECUTED"])).count()
    blocked_actions = db.query(Action).filter(Action.status == "BLOCKED").count()

    avg_latency = db.query(func.avg(VerificationRun.verification_time_ms)).scalar() or 0.0
    active_policies = db.query(Policy).filter(Policy.enabled == True).count()
    active_agents = db.query(Agent).filter(Agent.status == "active").count()

    recent_actions = db.query(Action).order_by(Action.created_at.desc()).limit(10).all()
    recent_activity = [
        {
            "id": a.id,
            "time": a.created_at.strftime("%H:%M:%S"),
            "agent": a.agent.name if a.agent else "System Agent",
            "tool": a.tool_name,
            "status": a.status,
            "arguments": a.arguments
        }
        for a in recent_actions
    ]

    return DashboardSummaryResponse(
        total_actions=total_actions,
        verified_actions=verified_actions,
        blocked_actions=blocked_actions,
        avg_latency_ms=round(avg_latency, 2),
        active_policies=active_policies,
        active_agents=active_agents,
        recent_activity=recent_activity
    )

# Gateway Execute Endpoint
@router.post("/gateway/execute")
def gateway_execute(req: GatewayExecuteRequest, db: Session = Depends(get_db)):
    result = execute_gateway_workflow(
        db=db,
        agent_id=req.agent_id,
        tool_name=req.tool,
        arguments=req.arguments
    )
    return result

# Gateway Retry Endpoint
@router.post("/gateway/retry")
def gateway_retry(req: GatewayRetryRequest, db: Session = Depends(get_db)):
    previous_action = db.query(Action).filter(Action.id == req.action_id).first()
    if not previous_action:
        raise HTTPException(status_code=404, detail="Original action not found")

    # Record RETRY_STARTED in audit logs
    db.add(AuditLog(
        action_id=previous_action.id,
        event_type="RETRY_STARTED",
        details={
            "original_action_id": previous_action.id,
            "corrected_arguments": req.corrected_arguments
        }
    ))
    db.commit()

    # Re-run gateway workflow for corrected action
    retry_result = execute_gateway_workflow(
        db=db,
        agent_id=previous_action.agent_id,
        tool_name=previous_action.tool_name,
        arguments=req.corrected_arguments
    )
    return retry_result

# Actions Endpoints
@router.get("/actions", response_model=List[ActionResponse])
def list_actions(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Action)
    if status:
        query = query.filter(Action.status == status)
    actions = query.order_by(Action.created_at.desc()).limit(limit).all()
    return actions

@router.get("/actions/{id}")
def get_action_detail(id: str, db: Session = Depends(get_db)):
    action = db.query(Action).filter(Action.id == id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    v_runs = db.query(VerificationRun).filter(VerificationRun.action_id == id).all()
    violations = db.query(Violation).filter(Violation.action_id == id).all()
    logs = db.query(AuditLog).filter(AuditLog.action_id == id).order_by(AuditLog.created_at.asc()).all()

    return {
        "action": ActionResponse.from_orm(action),
        "agent": AgentResponse.from_orm(action.agent) if action.agent else None,
        "verification_runs": [VerificationRunResponse.from_orm(v) for v in v_runs],
        "violations": [ViolationResponse.from_orm(v) for v in violations],
        "audit_logs": [AuditLogResponse.from_orm(l) for l in logs]
    }

# Policies Endpoints
@router.get("/policies", response_model=List[PolicyResponse])
def list_policies(db: Session = Depends(get_db)):
    return db.query(Policy).order_by(Policy.created_at.desc()).all()

@router.post("/policies", response_model=PolicyResponse)
def create_policy(req: PolicyCreate, db: Session = Depends(get_db)):
    policy = Policy(
        id=req.id,
        name=req.name,
        description=req.description,
        policy_type=req.policy_type,
        tool_name=req.tool_name,
        constraint_definition=req.constraint_definition,
        severity=req.severity or "high",
        enabled=req.enabled if req.enabled is not None else True
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

@router.get("/policies/{id}", response_model=PolicyResponse)
def get_policy(id: str, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy

@router.put("/policies/{id}", response_model=PolicyResponse)
def update_policy(id: str, req: PolicyUpdate, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    if req.name is not None: policy.name = req.name
    if req.description is not None: policy.description = req.description
    if req.policy_type is not None: policy.policy_type = req.policy_type
    if req.tool_name is not None: policy.tool_name = req.tool_name
    if req.constraint_definition is not None: policy.constraint_definition = req.constraint_definition
    if req.severity is not None: policy.severity = req.severity
    if req.enabled is not None: policy.enabled = req.enabled

    db.commit()
    db.refresh(policy)
    return policy

@router.delete("/policies/{id}")
def delete_policy(id: str, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    db.delete(policy)
    db.commit()
    return {"status": "success", "message": f"Policy {id} deleted successfully"}

# Verifications Endpoints
@router.get("/verifications", response_model=List[VerificationRunResponse])
def list_verifications(
    result: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(VerificationRun)
    if result:
        query = query.filter(VerificationRun.result == result)
    return query.order_by(VerificationRun.created_at.desc()).limit(limit).all()

@router.get("/verifications/{id}", response_model=VerificationRunResponse)
def get_verification(id: str, db: Session = Depends(get_db)):
    v_run = db.query(VerificationRun).filter(VerificationRun.id == id).first()
    if not v_run:
        raise HTTPException(status_code=404, detail="Verification run not found")
    return v_run

# Violations Endpoints
@router.get("/violations", response_model=List[ViolationResponse])
def list_violations(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Violation).order_by(Violation.created_at.desc()).limit(limit).all()

@router.get("/violations/{id}", response_model=ViolationResponse)
def get_violation(id: str, db: Session = Depends(get_db)):
    violation = db.query(Violation).filter(Violation.id == id).first()
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return violation

# Audit Logs Endpoint
@router.get("/audit-logs", response_model=List[AuditLogResponse])
def list_audit_logs(limit: int = 100, db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()

# Agents Endpoints
@router.get("/agents", response_model=List[AgentResponse])
def list_agents(db: Session = Depends(get_db)):
    return db.query(Agent).order_by(Agent.created_at.desc()).all()

@router.post("/agents", response_model=AgentResponse)
def create_agent(req: AgentCreate, db: Session = Depends(get_db)):
    agent = Agent(
        id=req.id,
        name=req.name,
        description=req.description,
        status=req.status or "active"
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent
