# AVE REST API Documentation

Base URL: `/api/v1`

## Endpoints

### Health & Metrics
- `GET /api/v1/health` - Check API and Z3 status.
- `GET /api/v1/dashboard/summary` - Metrics overview for total actions, verified count, blocked count, average latency.

### Gateway
- `POST /api/v1/gateway/execute` - Intercept and verify tool execution.
  - Request Body:
    ```json
    {
      "agent_id": "uuid",
      "tool": "transfer_money",
      "arguments": {
        "transfer_amount": 75000,
        "manager_approval": false
      }
    }
    ```
- `POST /api/v1/gateway/retry` - Retry a previously blocked action with corrected parameters.

### Actions
- `GET /api/v1/actions` - Query list of intercepted actions.
- `GET /api/v1/actions/{id}` - Get full action details including parameters and verification runs.

### Policies
- `GET /api/v1/policies` - List active and disabled policies.
- `POST /api/v1/policies` - Create new policy.
- `GET /api/v1/policies/{id}` - Policy details.
- `PUT /api/v1/policies/{id}` - Update policy.
- `DELETE /api/v1/policies/{id}` - Delete policy.

### Verification Runs & Violations
- `GET /api/v1/verifications` - Query verification runs log.
- `GET /api/v1/violations` - Query blocked policy violations.

### Audit Logs & Agents
- `GET /api/v1/audit-logs` - Query audit history.
- `GET /api/v1/agents` - Query registered agents.
- `POST /api/v1/agents` - Register agent.
