import time
import logging
import z3
from typing import Dict, Any, List, Optional
from app.verification.parser import parse_constraint_to_z3
from app.verification.repair import generate_repair_guidance

logger = logging.getLogger(__name__)

def verify_action(
    action: Dict[str, Any],
    applicable_policies: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Main interface to verify an action against applicable formal policies using Z3 SMT solver.

    action dict shape:
      {
        "tool": "issue_refund",
        "arguments": {"refund_amount": 15000, "original_payment": 10000}
      }

    applicable_policies list item shape:
      {
        "id": "pol-refund-01",
        "name": "Refund Limit",
        "constraint_definition": "refund_amount <= original_payment",
        "severity": "high"
      }
    """
    start_time = time.perf_counter()
    tool_name = action.get("tool", "")
    arguments = action.get("arguments", {})

    if not applicable_policies:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "verified",
            "solver": "z3",
            "result": "SAT",
            "policy_id": None,
            "policy_name": None,
            "constraint": None,
            "reason": "No applicable policies found for this tool.",
            "repair_guidance": None,
            "verification_time_ms": max(elapsed_ms, 1.0)
        }

    for policy in applicable_policies:
        policy_id = policy.get("id")
        policy_name = policy.get("name")
        constraint_str = policy.get("constraint_definition", "")

        try:
            # Parse constraint and bind parameters
            constraint_z3_expr, runtime_assertions = parse_constraint_to_z3(constraint_str, arguments)

            solver = z3.Solver()
            # Add runtime argument bindings (e.g., refund_amount == 15000)
            for assertion in runtime_assertions:
                solver.add(assertion)

            # Add policy constraint
            solver.add(constraint_z3_expr)

            res = solver.check()
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

            if res == z3.sat:
                continue  # Passed this policy constraint, evaluate next policy
            elif res == z3.unsat:
                repair = generate_repair_guidance(tool_name, constraint_str, arguments)
                reason = repair.get("suggestion", f"Action violates policy '{policy_name}' constraint: {constraint_str}")

                return {
                    "status": "blocked",
                    "solver": "z3",
                    "result": "UNSAT",
                    "policy_id": policy_id,
                    "policy_name": policy_name,
                    "constraint": constraint_str,
                    "reason": reason,
                    "repair_guidance": repair,
                    "verification_time_ms": max(elapsed_ms, 1.0)
                }
            else:
                return {
                    "status": "error",
                    "solver": "z3",
                    "result": "UNKNOWN",
                    "policy_id": policy_id,
                    "policy_name": policy_name,
                    "constraint": constraint_str,
                    "reason": "Z3 solver could not determine satisfiability.",
                    "repair_guidance": None,
                    "verification_time_ms": max(elapsed_ms, 1.0)
                }

        except Exception as e:
            logger.exception(f"Error evaluating policy {policy_name}: {e}")
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            return {
                "status": "error",
                "solver": "z3",
                "result": "ERROR",
                "policy_id": policy_id,
                "policy_name": policy_name,
                "constraint": constraint_str,
                "reason": f"Policy parsing/evaluation error: {str(e)}",
                "repair_guidance": None,
                "verification_time_ms": max(elapsed_ms, 1.0)
            }

    # All policies passed
    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
    return {
        "status": "verified",
        "solver": "z3",
        "result": "SAT",
        "policy_id": applicable_policies[0].get("id") if applicable_policies else None,
        "policy_name": applicable_policies[0].get("name") if applicable_policies else None,
        "constraint": applicable_policies[0].get("constraint_definition") if applicable_policies else None,
        "reason": None,
        "repair_guidance": None,
        "verification_time_ms": max(elapsed_ms, 1.0)
    }
