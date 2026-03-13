from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.models.expense import Expense, ExpenseCategory
from app.schemas.expense_schema import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseCategoryCreate,
    ExpenseCategoryResponse,
)
from app.services.expense_service import auto_categorize_expense


router = APIRouter()


@router.post("/", response_model=ExpenseResponse)
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "accountant")),
):
    category, auto_cat = auto_categorize_expense(db, user.organization_id, payload.description)
    
    expense = Expense(
        organization_id=user.organization_id,
        description=payload.description,
        amount=payload.amount,
        date=payload.date,
        category=payload.category if payload.category else category,
        auto_categorized=auto_cat if not payload.category else False,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("/", response_model=list[ExpenseResponse])
def list_expenses(
    category: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Expense).filter(Expense.organization_id == user.organization_id)
    if category:
        query = query.filter(Expense.category == category)
    return query.order_by(Expense.date.desc()).all()


@router.post("/categories", response_model=ExpenseCategoryResponse)
def create_expense_category(
    payload: ExpenseCategoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "accountant")),
):
    cat = ExpenseCategory(
        organization_id=user.organization_id,
        name=payload.name,
        rule_pattern=payload.rule_pattern,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.get("/categories", response_model=list[ExpenseCategoryResponse])
def list_expense_categories(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(ExpenseCategory).filter(ExpenseCategory.organization_id == user.organization_id).all()
