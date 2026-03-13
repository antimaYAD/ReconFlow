# ReconFlow - Financial Reconciliation SaaS Platform

A production-ready SaaS platform for automating financial reconciliation, accounts payable/receivable, expense categorization, and financial reporting.

---

## Tech Stack

**Backend**
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL (production) / SQLite (local dev)
- Pandas for financial data processing
- JWT authentication
- Pydantic for validation

**Frontend**
- Next.js (React)
- Tailwind CSS
- Recharts for dashboards
- Axios for API communication

**Infrastructure**
- Docker Compose
- Cloud-ready (AWS compatible)

---

## Features

### Core Modules

1. **Financial Reconciliation Engine**
   - Upload bank CSV and payment gateway CSV
   - Auto-match transactions using multiple strategies (exact match, reference match, fuzzy match)
   - Detect mismatches and missing records
   - Generate reconciliation status reports

2. **Accounts Payable Automation**
   - Upload vendor invoices
   - OCR invoice data extraction (vendor, invoice number, amount, dates)
   - Track payment status
   - Identify overdue invoices

3. **Accounts Receivable Automation**
   - Track customer invoices
   - Monitor payment status
   - Detect overdue payments
   - Customer payment dashboard

4. **Expense Categorization**
   - Auto-categorize transactions using rule-based engine
   - Custom categorization rules
   - Export categorized expense reports (CSV)

5. **Financial Reporting**
   - Real-time dashboard with charts
   - Transaction summaries
   - Expense breakdown
   - Reconciliation status
   - CSV export for transactions and expenses

6. **Multi-Tenant Architecture**
   - Organization workspaces
   - Role-based access control (Admin, Accountant, Viewer)
   - Secure file uploads
   - Audit logs

---

## Local Development Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- npm

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:
- **API**: http://127.0.0.1:8000
- **Docs**: http://127.0.0.1:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the Next.js dev server
npm run dev
```

The frontend will be available at:
- **Frontend**: http://localhost:3000

---

## Production Deployment (Docker)

### Prerequisites

- Docker Desktop installed

### Run with Docker Compose

```bash
# Build and start all services (PostgreSQL + FastAPI + Next.js)
docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql+psycopg://reconflow:reconflow@db:5432/reconflow
JWT_SECRET_KEY=your-secret-key-change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user and organization
- `POST /api/auth/login` - Login (returns JWT token)

### Reconciliation
- `POST /api/reconciliation/run` - Run reconciliation (upload bank + gateway CSV)

### Invoices (AP/AR)
- `POST /api/invoices/upload-ocr` - Extract invoice data via OCR
- `POST /api/invoices/` - Create invoice
- `GET /api/invoices/` - List invoices (filter by type/status)
- `GET /api/invoices/overdue` - List overdue invoices

### Expenses
- `POST /api/expenses/` - Create expense (auto-categorized)
- `GET /api/expenses/` - List expenses
- `POST /api/expenses/categories` - Create custom category rule
- `GET /api/expenses/categories` - List categories

### Reports
- `GET /api/reports/dashboard-summary` - Dashboard metrics
- `GET /api/reports/transactions/export-csv` - Export transactions CSV
- `GET /api/reports/expenses/export-csv` - Export expenses CSV

---

## Database Schema

### Core Tables

- `organizations` - Multi-tenant organizations
- `users` - User accounts with roles
- `transactions` - Normalized transaction records
- `reconciliation_results` - Reconciliation match results
- `invoices` - AP/AR invoices
- `expenses` - Expense records
- `expense_categories` - Custom categorization rules
- `file_uploads` - File upload tracking
- `bank_accounts` - Bank account metadata
- `audit_logs` - Audit trail

---

## User Roles

- **Admin** - Full access to all features
- **Accountant** - Can upload files, run reconciliations, manage invoices/expenses
- **Viewer** - Read-only access to reports and dashboards

---

## Reconciliation Matching Algorithm

The reconciliation engine uses a three-tier matching strategy:

1. **Exact Match**: Transaction ID + Amount + Date
2. **Reference Match**: Reference ID + Amount
3. **Fuzzy Match**: Date tolerance (±2 days) + Amount tolerance (±$0.50)

Results are categorized as:
- `matched` - Successfully matched
- `missing_in_bank` - Present in gateway, missing in bank
- `missing_in_gateway` - Present in bank, missing in gateway
- `amount_mismatch` - Matched but amounts differ

---

## Expense Auto-Categorization

Built-in rules:
- `Uber/Lyft/Taxi` → Travel Expense
- `AWS/Azure/Cloud` → Cloud Infrastructure
- `Office Depot/Staples` → Office Supplies
- `Hotel/Airbnb` → Travel Expense
- `Restaurant/Food` → Meals & Entertainment
- `Software/SaaS` → Software & Subscriptions

Custom rules can be added via the API.

---

## Security

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt
- **CORS Protection** - Configurable origins
- **Multi-Tenant Isolation** - Organization-scoped queries
- **Role-Based Access Control** - Endpoint-level permissions

---

## UI Design Philosophy

Inspired by Morgan Stanley's enterprise fintech aesthetic:
- Minimalist financial interface
- Dark blue (#0A1D3A), white, gray palette
- Clean professional typography
- Smooth transitions
- Responsive layout

---

## Future Enhancements

- [ ] PDF bank statement parsing
- [ ] Advanced OCR with ML models
- [ ] Email payment reminders
- [ ] Excel export (XLSX)
- [ ] PDF report generation
- [ ] Redis caching layer
- [ ] Celery background tasks
- [ ] Real-time notifications
- [ ] Subscription billing integration
- [ ] Advanced analytics dashboards

---

## License

MIT

---

## Support

For issues or questions, please open a GitHub issue.
