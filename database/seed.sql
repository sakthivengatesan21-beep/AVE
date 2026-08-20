-- SQL Schema & Seed Data for Asynchronous Verification Engine (AVE)

-- Enable UUID extension if PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policies Table
CREATE TABLE IF NOT EXISTS policies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    policy_type VARCHAR(100) NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    constraint_definition TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'high',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actions Table
CREATE TABLE IF NOT EXISTS actions (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36) REFERENCES agents(id),
    tool_name VARCHAR(100) NOT NULL,
    arguments JSONB NOT NULL,
    status VARCHAR(50) NOT NULL, -- VERIFIED, BLOCKED, EXECUTED, FAILED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Verification Runs Table
CREATE TABLE IF NOT EXISTS verification_runs (
    id VARCHAR(36) PRIMARY KEY,
    action_id VARCHAR(36) REFERENCES actions(id),
    policy_id VARCHAR(36) REFERENCES policies(id),
    result VARCHAR(50) NOT NULL, -- SAT, UNSAT, ERROR
    solver VARCHAR(50) DEFAULT 'z3',
    constraint_evaluated TEXT NOT NULL,
    runtime_state JSONB NOT NULL,
    verification_time_ms FLOAT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Violations Table
CREATE TABLE IF NOT EXISTS violations (
    id VARCHAR(36) PRIMARY KEY,
    action_id VARCHAR(36) REFERENCES actions(id),
    policy_id VARCHAR(36) REFERENCES policies(id),
    severity VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    actual_values JSONB NOT NULL,
    expected_condition TEXT NOT NULL,
    repair_guidance JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    action_id VARCHAR(36) REFERENCES actions(id),
    event_type VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_actions_agent_id ON actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status);
CREATE INDEX IF NOT EXISTS idx_verification_runs_action_id ON verification_runs(action_id);
CREATE INDEX IF NOT EXISTS idx_violations_action_id ON violations(action_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_id ON audit_logs(action_id);

-- Seed Agents
INSERT INTO agents (id, name, description, status) VALUES
('agent-expense-01', 'Expense & Payment Agent', 'Handles customer refunds, transaction limits, and ledger operations.', 'active'),
('agent-db-01', 'Database Admin Agent', 'Automates record management and database maintenance tasks.', 'active'),
('agent-support-01', 'Customer Support Bot', 'Assists customers with billing queries and account adjustments.', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Policies
INSERT INTO policies (id, name, description, policy_type, tool_name, constraint_definition, severity, enabled) VALUES
('pol-refund-01', 'Refund Limit', 'Refund amount must not exceed the original payment amount.', 'numeric_constraint', 'issue_refund', 'refund_amount <= original_payment', 'high', true),
('pol-transfer-01', 'Transfer Limit', 'Transfers above 50000 require manager approval.', 'approval_constraint', 'transfer_money', 'transfer_amount <= 50000 OR manager_approval == true', 'critical', true),
('pol-db-01', 'Production Database Protection', 'AI agents must not delete production records.', 'environment_constraint', 'delete_record', 'environment != "production" OR operation != "DELETE"', 'critical', true)
ON CONFLICT (id) DO NOTHING;
