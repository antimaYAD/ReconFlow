from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api.routes import auth, reconciliation, invoices, expenses, reports

import app.models  # noqa: F401


def create_app() -> FastAPI:
    app = FastAPI(title="ReconFlow API")

    @app.on_event("startup")
    def _startup() -> None:
        Base.metadata.create_all(bind=engine)

    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"] ,
            allow_headers=["*"],
        )

    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(reconciliation.router, prefix="/api/reconciliation", tags=["reconciliation"])
    app.include_router(invoices.router, prefix="/api/invoices", tags=["invoices"])
    app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
    app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
