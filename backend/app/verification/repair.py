from typing import Dict, Any, Optional

def generate_repair_guidance(
    tool_name: str,
    constraint_str: str,
    arguments: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Analyzes constraint and runtime arguments to generate structured repair guidance.
    """
    if tool_name == "issue_refund":
        refund_amount = arguments.get("refund_amount", 0)
        original_payment = arguments.get("original_payment", 0)
        if refund_amount > original_payment:
            return {
                "field": "refund_amount",
                "constraint": f"<= {original_payment}",
                "suggestion": f"Reduce the refund_amount from {refund_amount} to a value less than or equal to the original payment of {original_payment}.",
                "expected_condition": "refund_amount <= original_payment",
                "actual_values": {
                    "refund_amount": refund_amount,
                    "original_payment": original_payment
                }
            }

    elif tool_name == "transfer_money":
        transfer_amount = arguments.get("transfer_amount", 0)
        manager_approval = arguments.get("manager_approval", False)
        if transfer_amount > 50000 and not manager_approval:
            return {
                "field": "transfer_amount",
                "constraint": "<= 50000 or manager_approval == true",
                "suggestion": f"Reduce the transfer amount from {transfer_amount} to 50,000 or set manager_approval to true.",
                "expected_condition": "transfer_amount <= 50000 OR manager_approval == true",
                "actual_values": {
                    "transfer_amount": transfer_amount,
                    "manager_approval": manager_approval
                }
            }

    elif tool_name == "delete_record":
        environment = arguments.get("environment", "")
        operation = arguments.get("operation", "")
        if environment == "production" and operation == "DELETE":
            return {
                "field": "environment",
                "constraint": "environment != 'production' or operation != 'DELETE'",
                "suggestion": "Deletion of production records is forbidden. Execute deletion in staging/development or change operation.",
                "expected_condition": 'environment != "production" OR operation != "DELETE"',
                "actual_values": {
                    "environment": environment,
                    "operation": operation
                }
            }

    # Fallback generic repair guidance generator
    return {
        "field": None,
        "constraint": constraint_str,
        "suggestion": f"Modify action arguments to satisfy formal constraint: {constraint_str}",
        "expected_condition": constraint_str,
        "actual_values": arguments
    }
