import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    actions = relationship("Action", back_populates="agent")


class Policy(Base):
    __tablename__ = "policies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    policy_type = Column(String(100), nullable=False)
    tool_name = Column(String(100), nullable=False)
    constraint_definition = Column(Text, nullable=False)
    severity = Column(String(50), default="high")
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Action(Base):
    __tablename__ = "actions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=True)
    tool_name = Column(String(100), nullable=False)
    arguments = Column(JSON, nullable=False)
    status = Column(String(50), nullable=False)  # VERIFIED, BLOCKED, EXECUTED, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    agent = relationship("Agent", back_populates="actions")
    verification_runs = relationship("VerificationRun", back_populates="action")
    violations = relationship("Violation", back_populates="action")
    audit_logs = relationship("AuditLog", back_populates="action")


class VerificationRun(Base):
    __tablename__ = "verification_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    action_id = Column(String(36), ForeignKey("actions.id"), nullable=False)
    policy_id = Column(String(36), ForeignKey("policies.id"), nullable=True)
    result = Column(String(50), nullable=False)  # SAT, UNSAT, ERROR
    solver = Column(String(50), default="z3")
    constraint_evaluated = Column(Text, nullable=False)
    runtime_state = Column(JSON, nullable=False)
    verification_time_ms = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    action = relationship("Action", back_populates="verification_runs")
    policy = relationship("Policy")


class Violation(Base):
    __tablename__ = "violations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    action_id = Column(String(36), ForeignKey("actions.id"), nullable=False)
    policy_id = Column(String(36), ForeignKey("policies.id"), nullable=True)
    severity = Column(String(50), nullable=False)
    reason = Column(Text, nullable=False)
    actual_values = Column(JSON, nullable=False)
    expected_condition = Column(Text, nullable=False)
    repair_guidance = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    action = relationship("Action", back_populates="violations")
    policy = relationship("Policy")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    action_id = Column(String(36), ForeignKey("actions.id"), nullable=True)
    event_type = Column(String(100), nullable=False)
    details = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    action = relationship("Action", back_populates="audit_logs")
