# Vitto — MSME Lending Decision System

A lightweight, end-to-end lending decision system that accepts MSME business profiles and loan inputs, runs them through a credit decision engine, and surfaces a structured decision with reasoning.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Application DB | MongoDB (via Mongoose) |
| Decision / Audit DB | PostgreSQL |
| Containerisation | Docker + Docker Compose |

---

## Quick Start

### Option 1 — Docker Compose (Recommended)

```bash
git clone <your-repo-url>
cd vitto-lending
docker-compose up --build
```

- Frontend: http://localhost:3000  
- Backend API: http://localhost:5000/api

### Option 2 — Manual Setup

**Prerequisites:** Node.js 18+, MongoDB running, PostgreSQL running

**Backend**
```bash
cd backend
cp .env.example .env        # fill in your DB credentials
npm install
npm run dev                 # runs on :5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev                 # runs on :3000
```

---

## API Reference

### `POST /api/apply`
Submit a complete loan application. Returns an instant credit decision.

**Request Body**
```json
{
  "ownerName": "Rajan Mehta",
  "pan": "ABCDE1234F",
  "businessType": "retail",
  "monthlyRevenue": 500000,
  "loanAmount": 2500000,
  "tenureMonths": 24,
  "loanPurpose": "Working capital expansion"
}
```

**Response (200 — Decision Made)**
```json
{
  "success": true,
  "applicationId": "VTO-1715123456789-A1B2C3",
  "decision": "APPROVED",
  "creditScore": 725,
  "reasonCodes": ["HEALTHY_FINANCIALS", "STRONG_REPAYMENT_CAPACITY"],
  "details": {
    "emiEstimate": 104166.67,
    "revenueToEMIRatio": 4.8,
    "loanToRevenueRatio": 5.0
  },
  "submittedAt": "2026-05-07T10:00:00.000Z"
}
```

**Response (422 — Validation Error)**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "One or more fields are invalid",
  "details": [
    { "field": "pan", "message": "Invalid PAN format. Expected format: ABCDE1234F" }
  ]
}
```

### `GET /api/application/:id`
Fetch status and metadata for a submitted application.

### `GET /api/history?limit=20`
Returns recent decisions from the PostgreSQL audit trail.

### `GET /api/health`
Health check endpoint.

---

## Business Types Accepted

`retail` · `manufacturing` · `services` · `trading` · `food_beverage` · `agriculture` · `other`

---

## Credit Decision Logic

### Score Range: 300 – 900 (Approval threshold: ≥ 600)

The score is computed as: `300 + (earnedPoints / 600) × 600`

### Scoring Components

| Component | Max Points | Description |
|---|---|---|
| Revenue-to-EMI Ratio | 200 | Monthly revenue ÷ estimated monthly EMI |
| Loan-to-Revenue Multiple | 200 | Loan amount ÷ monthly revenue |
| Tenure Risk | 100 | Sweet spot: 6–36 months |
| Business Type Factor | 100 | Stability proxy by sector |

#### Revenue-to-EMI Ratio Thresholds
| Ratio | Points | Reasoning |
|---|---|---|
| ≥ 5× | 200 | EMI < 20% of revenue — very safe |
| 3–5× | 150 | Comfortable repayment capacity |
| 2–3× | 100 | Tight but viable |
| 1.5–2× | 50 | High risk |
| < 1.5× | 0 | Unsustainable |

> EMI is calculated as a simplified flat-rate: `loanAmount / tenureMonths`. No interest rate is applied — this is a proxy for relative repayment burden, not precise amortisation.

#### Loan-to-Revenue Multiple Thresholds
| Multiple | Points | Reasoning |
|---|---|---|
| < 6× | 200 | Small, conservative ask |
| 6–12× | 150 | Reasonable |
| 12–24× | 100 | Moderate risk |
| 24–36× | 50 | Aggressive |
| > 36× | 0 | Excessive |

#### Tenure Risk
| Range | Points | Reasoning |
|---|---|---|
| 6–36 months | 100 | Sweet spot — medium term |
| 37–60 months | 80 | Acceptable |
| 3–5 months | 60 | Very short — cash flow risk |
| 61–120 months | 50 | Long-term risk |
| < 3 or > 120 | 0 | Outlier |

#### Business Type Factor
| Type | Points |
|---|---|
| Services, Trading | 100 |
| Retail, Food & Beverage | 80 |
| Other | 70 |
| Manufacturing, Agriculture | 60 |

### Hard Reject Conditions (override score)
These trigger an automatic rejection regardless of computed score:
- Revenue-to-EMI ratio < 1.0 (borrower literally cannot service the EMI)
- Loan amount > 50× monthly revenue (data inconsistency / fraud signal)
- Monthly revenue ≤ 0

---

## Reason Codes

| Code | Meaning |
|---|---|
| `HEALTHY_FINANCIALS` | All metrics within acceptable range |
| `STRONG_REPAYMENT_CAPACITY` | Revenue-to-EMI ≥ 5× |
| `LOW_CREDIT_RISK` | Very small loan relative to revenue |
| `CONSERVATIVE_LOAN_REQUEST` | Loan < 6× monthly revenue |
| `LOW_REVENUE_TO_EMI` | Revenue-to-EMI < 1.5 |
| `CANNOT_SERVICE_EMI` | Revenue-to-EMI < 1.0 — hard reject |
| `HIGH_LOAN_RATIO` | Loan > 36× monthly revenue |
| `EXCESSIVE_LOAN_AMOUNT` | Loan > 50× revenue — hard reject |
| `DATA_INCONSISTENCY` | Loan amount wildly disproportionate |
| `ZERO_OR_NEGATIVE_REVENUE` | Invalid revenue input |
| `TENURE_TOO_SHORT` | Tenure < 3 months |
| `TENURE_TOO_LONG` | Tenure > 120 months |
| `INSUFFICIENT_CREDITWORTHINESS` | Score below threshold |

---

## Edge Case Handling

| Scenario | Handling |
|---|---|
| Missing fields | 422 with per-field `details` array |
| Negative revenue | `express-validator` rejects; engine also hard-rejects |
| Malformed PAN | Regex `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/` validated server-side |
| Non-numeric loan amount | `isFloat` validator catches it |
| Huge loan vs tiny revenue | `DATA_INCONSISTENCY` + `EXCESSIVE_LOAN_AMOUNT` codes + hard reject |
| Very short tenure (1 month) | Allowed but scored low; extreme EMI burden visible in ratio |
| Partial form submission | All 7 fields required; partial inputs get `VALIDATION_ERROR` |

---

## Database Design

**MongoDB** (`applications` collection) — stores raw application input, status lifecycle, and a reference to the PostgreSQL decision record. Chosen for flexible document storage of free-form fields like `loanPurpose`.

**PostgreSQL** (`decisions` + `audit_logs` tables) — stores structured decision outputs and full audit trail with timestamps. Chosen for its relational strengths: querying, aggregations, and tamper-evident logs.

---

## Rate Limiting

- Decision endpoint (`POST /api/apply`): 30 requests / 15 min per IP  
- All other endpoints: 200 requests / 15 min per IP

---

## Project Structure

```
vitto-lending/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB + PostgreSQL connections
│   │   ├── middleware/      # Validation + rate limiting
│   │   ├── models/          # Mongoose Application model
│   │   ├── routes/          # Express API routes
│   │   ├── services/        # Decision engine + audit service
│   │   └── index.js         # Express app entry
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # ApplicationForm, DecisionResult, ScoreRing
│   │   ├── utils/           # API helper
│   │   ├── App.jsx
│   │   └── index.css
│   ├── Dockerfile
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## Deployment

**Backend** → Deploy to [Render](https://render.com) as a Web Service. Set environment variables from `.env.example`.

**Frontend** → Deploy to [Vercel](https://vercel.com). Set `VITE_API_URL` to your Render backend URL.

**Databases** → Use MongoDB Atlas (free tier) + Render PostgreSQL (free tier).
