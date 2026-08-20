from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# Agent Schemas
class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[str] = "active"

class AgentCreate(AgentBase):
    id: Optional[str] = None

class AgentResponse(AgentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Policy Schemas
class PolicyBase(BaseModel):
    name: str
    description: Optional[str] = None
    policy_type: str
    tool_name: str
    constraint_definition: str
    severity: Optional[str] = "high"
    enabled: Optional[bool] = True

class PolicyCreate(PolicyBase):
    id: Optional[str] = None

class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    policy_type: Optional[str] = None
    tool_name: Optional[str] = None
    constraint_definition: Optional[str] = None
    severity: Optional[str] = None
    enabled: Optional[bool] = None

class PolicyResponse(PolicyBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Action & Gateway Schemas
class GatewayExecuteRequest(BaseModel):
    agent_id: Optional[str] = "agent-expense-01"
    tool: str
    arguments: Dict[str, Any]

class GatewayRetryRequest(BaseModel):
    action_id: str
    corrected_arguments: Dict[str, Any]

class ActionResponse(BaseModel):
    id: str
    agent_id: Optional[str]
    tool_name: str
    arguments: Dict[str, Any]
    status: str
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# Verification Schemas
class RepairGuidance(BaseModel):
    field: Optional[str] = None
    constraint: Optional[str] = None
    suggestion: str

class VerificationResultSchema(BaseModel):
    status: str  # verified | blocked | error
    solver: str = "z3"
    result: str  # SAT | UNSAT | ERROR
    policy_id: Optional[str] = None
    policy_name: Optional[str] = None
    constraint: Optional[str] = None
    reason: Optional[str] = None
    repair_guidance: Optional[Dict[str, Any]] = None
    verification_time_ms: float
    execution_result: Optional[Any] = None

class VerificationRunResponse(BaseModel):
    id: str
    action_id: str
    policy_id: Optional[str]
    result: str
    solver: str
    constraint_evaluated: str
    runtime_state: Dict[str, Any]
    verification_time_ms: float
    reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Violation Schemas
class ViolationResponse(BaseModel):
    id: str
    action_id: str
    policy_id: Optional[str]
    severity: str
    reason: str
    actual_values: Dict[str, Any]
    expected_condition: str
    repair_guidance: Dict[str, Any]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: str
    action_id: Optional[str]
    event_type: str
    details: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


# Dashboard Summary Schema
class DashboardSummaryResponse(BaseModel):
    total_actions: int
    verified_actions: int
    blocked_actions: int
    avg_latency_ms: float
    active_policies: int
    active_agents: int
    recent_activity: List[Dict[str, Any]]
