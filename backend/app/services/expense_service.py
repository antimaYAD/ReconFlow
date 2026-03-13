import re
from sqlalchemy.orm import Session

from app.models.expense import ExpenseCategory


def auto_categorize_expense(db: Session, organization_id, description: str) -> tuple[str, bool]:
    categories = db.query(ExpenseCategory).filter(ExpenseCategory.organization_id == organization_id).all()

    for cat in categories:
        if cat.rule_pattern:
            if re.search(cat.rule_pattern, description, re.IGNORECASE):
                return cat.name, True

    default_rules = {
        r"\b(uber|lyft|taxi|cab)\b": "Travel Expense",
        r"\b(aws|azure|cloud|hosting|server)\b": "Cloud Infrastructure",
        r"\b(office depot|staples|supplies)\b": "Office Supplies",
        r"\b(hotel|airbnb|accommodation)\b": "Travel Expense",
        r"\b(restaurant|food|meal|lunch|dinner)\b": "Meals & Entertainment",
        r"\b(software|saas|subscription)\b": "Software & Subscriptions",
    }

    for pattern, category in default_rules.items():
        if re.search(pattern, description, re.IGNORECASE):
            return category, True

    return "Uncategorized", False
