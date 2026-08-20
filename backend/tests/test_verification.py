import pytest
from app.verification.engine import verify_action

def test_refund_policies():
    policy = {
        "id": "pol-refund-01",
        "name": "Refund Limit",
        "constraint_definition": "refund_amount <= original_payment",
        "severity": "high"
    }

    # Valid refund -> SAT
    res_valid = verify_action(
        {"tool": "issue_refund", "arguments": {"refund_amount": 5000, "original_payment": 10000}},
        [policy]
    )
    assert res_valid["status"] == "verified"
    assert res_valid["result"] == "SAT"

    # Invalid refund -> UNSAT & Repair guidance
    res_invalid = verify_action(
        {"tool": "issue_refund", "arguments": {"refund_amount": 15000, "original_payment": 10000}},
        [policy]
    )
    assert res_invalid["status"] == "blocked"
    assert res_invalid["result"] == "UNSAT"
    assert res_invalid["repair_guidance"] is not None
    assert res_invalid["repair_guidance"]["field"] == "refund_amount"


def test_transfer_policies():
    policy = {
        "id": "pol-transfer-01",
        "name": "Transfer Limit",
        "constraint_definition": "transfer_amount <= 50000 OR manager_approval == true",
        "severity": "critical"
    }

    # Low amount no approval -> SAT
    res1 = verify_action(
        {"tool": "transfer_money", "arguments": {"transfer_amount": 40000, "manager_approval": False}},
        [policy]
    )
    assert res1["status"] == "verified"
    assert res1["result"] == "SAT"

    # High amount no approval -> UNSAT
    res2 = verify_action(
        {"tool": "transfer_money", "arguments": {"transfer_amount": 75000, "manager_approval": False}},
        [policy]
    )
    assert res2["status"] == "blocked"
    assert res2["result"] == "UNSAT"

    # High amount WITH approval -> SAT
    res3 = verify_action(
        {"tool": "transfer_money", "arguments": {"transfer_amount": 75000, "manager_approval": True}},
        [policy]
    )
    assert res3["status"] == "verified"
    assert res3["result"] == "SAT"


def test_database_protection_policy():
    policy = {
        "id": "pol-db-01",
        "name": "Production DB Protection",
        "constraint_definition": 'environment != "production" OR operation != "DELETE"',
        "severity": "critical"
    }

    # Prod DELETE -> UNSAT
    res_prod_del = verify_action(
        {"tool": "delete_record", "arguments": {"environment": "production", "operation": "DELETE"}},
        [policy]
    )
    assert res_prod_del["status"] == "blocked"
    assert res_prod_del["result"] == "UNSAT"

    # Staging DELETE -> SAT
    res_stg_del = verify_action(
        {"tool": "delete_record", "arguments": {"environment": "staging", "operation": "DELETE"}},
        [policy]
    )
    assert res_stg_del["status"] == "verified"
    assert res_stg_del["result"] == "SAT"

    # Prod SELECT -> SAT
    res_prod_sel = verify_action(
        {"tool": "delete_record", "arguments": {"environment": "production", "operation": "SELECT"}},
        [policy]
    )
    assert res_prod_sel["status"] == "verified"
    assert res_prod_sel["result"] == "SAT"
