import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.domain import Action, VerificationRun, Violation, AuditLog

client = TestClient(app)

def test_api_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert "Z3" in data["solver"]


def test_dashboard_summary():
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_actions" in data
    assert "verified_actions" in data
    assert "blocked_actions" in data


def test_gateway_execution_end_to_end():
    db = SessionLocal()
    initial_actions_count = db.query(Action).count()

    # 1. Valid Transfer Execution -> SAT & EXECUTED
    res_valid = client.post("/api/v1/gateway/execute", json={
        "agent_id": "agent-expense-01",
        "tool": "transfer_money",
        "arguments": {"transfer_amount": 40000, "manager_approval": False}
    })
    assert res_valid.status_code == 200
    data_valid = res_valid.json()
    assert data_valid["decision"] == "ALLOW"
    assert data_valid["result"] == "SAT"
    assert data_valid["execution_result"] is not None
    assert data_valid["execution_result"]["success"] is True

    # 2. Blocked Transfer Execution -> UNSAT & BLOCKED
    res_blocked = client.post("/api/v1/gateway/execute", json={
        "agent_id": "agent-expense-01",
        "tool": "transfer_money",
        "arguments": {"transfer_amount": 75000, "manager_approval": False}
    })
    assert res_blocked.status_code == 200
    data_blocked = res_blocked.json()
    assert data_blocked["decision"] == "BLOCK"
    assert data_blocked["result"] == "UNSAT"
    assert data_blocked["execution_result"] is None
    assert data_blocked["repair_guidance"] is not None

    # 3. Verify Database Records
    new_actions_count = db.query(Action).count()
    assert new_actions_count == initial_actions_count + 2

    action_id = data_blocked["action_id"]
    violation = db.query(Violation).filter(Violation.action_id == action_id).first()
    assert violation is not None
    assert "transfer_amount" in violation.repair_guidance["field"]

    v_run = db.query(VerificationRun).filter(VerificationRun.action_id == action_id).first()
    assert v_run is not None
    assert v_run.result == "UNSAT"

    audit_logs = db.query(AuditLog).filter(AuditLog.action_id == action_id).all()
    event_types = [log.event_type for log in audit_logs]
    assert "ACTION_RECEIVED" in event_types
    assert "ACTION_BLOCKED" in event_types
    db.close()


def test_gateway_retry_flow():
    # Submit invalid transfer
    res_blocked = client.post("/api/v1/gateway/execute", json={
        "agent_id": "agent-expense-01",
        "tool": "transfer_money",
        "arguments": {"transfer_amount": 80000, "manager_approval": False}
    })
    action_id = res_blocked.json()["action_id"]

    # Submit retry with corrected parameters
    res_retry = client.post("/api/v1/gateway/retry", json={
        "action_id": action_id,
        "corrected_arguments": {"transfer_amount": 45000, "manager_approval": False}
    })
    assert res_retry.status_code == 200
    data_retry = res_retry.json()
    assert data_retry["decision"] == "ALLOW"
    assert data_retry["result"] == "SAT"
    assert data_retry["execution_result"] is not None
