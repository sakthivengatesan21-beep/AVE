import logging
from app.core.database import SessionLocal, engine, Base
from app.models.domain import Agent, Policy

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed Agents if none exist
        if db.query(Agent).count() == 0:
            agents = [
                Agent(
                    id="agent-expense-01",
                    name="Expense & Payment Agent",
                    description="Handles customer refunds, transaction limits, and ledger operations.",
                    status="active"
                ),
                Agent(
                    id="agent-db-01",
                    name="Database Admin Agent",
                    description="Automates record management and database maintenance tasks.",
                    status="active"
                ),
                Agent(
                    id="agent-support-01",
                    name="Customer Support Bot",
                    description="Assists customers with billing queries and account adjustments.",
                    status="active"
                )
            ]
            db.add_all(agents)
            logger.info("Seeded initial agents.")

        # Seed Policies if none exist
        if db.query(Policy).count() == 0:
            policies = [
                Policy(
                    id="pol-refund-01",
                    name="Refund Limit",
                    description="Refund amount must not exceed the original payment amount.",
                    policy_type="numeric_constraint",
                    tool_name="issue_refund",
                    constraint_definition="refund_amount <= original_payment",
                    severity="high",
                    enabled=True
                ),
                Policy(
                    id="pol-transfer-01",
                    name="Transfer Limit",
                    description="Transfers above 50000 require manager approval.",
                    policy_type="approval_constraint",
                    tool_name="transfer_money",
                    constraint_definition="transfer_amount <= 50000 OR manager_approval == true",
                    severity="critical",
                    enabled=True
                ),
                Policy(
                    id="pol-db-01",
                    name="Production Database Protection",
                    description="AI agents must not delete production records.",
                    policy_type="environment_constraint",
                    tool_name="delete_record",
                    constraint_definition='environment != "production" OR operation != "DELETE"',
                    severity="critical",
                    enabled=True
                )
            ]
            db.add_all(policies)
            logger.info("Seeded initial policies.")

        db.commit()
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
