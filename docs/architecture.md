# Asynchronous Verification Engine (AVE) - Architecture Documentation

## Architecture Overview

AVE sits as an inline deterministic policy enforcement gateway between AI agents (or LLMs) and high-privilege external tools/APIs.

```
+--------------+        1. Tool Call       +------------------------+
|  AI Agent    | ------------------------> |    AVE Gateway         |
+--------------+                           +------------------------+
       ^                                               |
       | 6b. Blocked + Repair Guidance                 | 2. Extract State & Resolve Policy
       +------------------------------------+          v
                                           +------------------------+
                                           | Verification Engine    |
                                           | (Z3 SMT Solver)        |
                                           +------------------------+
                                                       |
                                            3. SAT (ALLOW) / UNSAT (BLOCK)
                                                       v
                                           +------------------------+
                                           | Simulated Tool Exec    |
                                           +------------------------+
                                                       |
                                            4. Audit Logging & Persist
                                                       v
                                           +------------------------+
                                           | Database & Dashboard   |
                                           +------------------------+
```

## Why Z3 SMT Formal Verification over LLM Judgment?

1. **Determinism**: LLM judges can produce hallucinated or inconsistent decisions. Z3 provides mathematical proof of constraint satisfiability.
2. **Zero Infiltration**: Blocked actions are guaranteed by formal solver state never to reach external execution layers.
3. **Structured Repair**: When Z3 determines an action is UNSAT, exact counterexamples and variable bounds can be converted into deterministic repair guidance.

## Core Verification Flow

1. **Intercept**: Tool call request received at `/api/v1/gateway/execute`.
2. **State Extraction**: Action arguments (e.g. `transfer_amount`, `manager_approval`) extracted and typed.
3. **Policy Resolution**: Active policies matching the target tool are retrieved from storage.
4. **Z3 AST Translation**: Formal constraint strings (e.g. `refund_amount <= original_payment`) are safely parsed into Z3 expressions without dynamic code evaluation.
5. **Solver Execution**: Z3 checks `Solver.check()`.
   - **SAT**: Action satisfies all constraints. Execution continues to tool.
   - **UNSAT**: Policy violation. Tool execution is bypassed. Structured repair guidance generated.
6. **Persistence**: Action, verification run result, violation details, and audit log event persisted in database.
