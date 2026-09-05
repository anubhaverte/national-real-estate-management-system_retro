# 🏛️ National Real Estate Management Portal (E-Governance Edition)

<p align="center">
  <img src="client/skyline.jpg" alt="National Real Estate Portal Banner" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white" alt="Python Version" />
  <img src="https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Database-MySQL%208.0-4479A1?logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Frontend-Vanilla%20HTML%2FCSS%2FJS-E34F26?logo=html5&logoColor=white" alt="Frontend" />
  <img src="https://img.shields.io/badge/Security-Strict%20CORS%20%26%20JWT-red" alt="Security" />
  <img src="https://img.shields.io/badge/UI%20Aesthetic-Early%202000s%20E--Gov-003366" alt="Retro UI" />
</p>

A full-stack, enterprise-grade **Real Estate & Title Deed Management System** designed as a government-style national registry. It merges modern backend security (FastAPI, SQLAlchemy ORM, MySQL, JWT-in-HttpOnly-cookies, strict CORS origin controls) with an authentic **early-2000s Indian E-Governance retro aesthetic** (classic `#003366` Navy / `#800000` Maroon color scheme, marquee tickers, bevelled 3D buttons, and persistent city skyline background).

---

## 🌟 Highlights & Features

### 📜 1. Legal Digital Title Deed & E-Stamping Generator
- **Statutory Financial Breakdown**: Real-time computation of State Stamp Duty (5% for Sale / 1% for Lease), State Registration Fees (1% / flat ₹500), and Portal E-Stamping Fee (₹1,000).
- **Official E-Deed Certificate**: Generates an authentic digital conveyance title deed / lease agreement with:
  - Unique Deed Certificate Number (`DEED-2026-XXXXXXXX`)
  - Department of Revenue stamp duty watermark & registration seals
  - Transferor (Seller) & Transferee (Buyer) digital signature blocks
- **Printable Deed Support**: Built-in `@media print` CSS layout allowing one-click physical A4 deed printing (`window.print()`).

### 🔍 2. Real-World Property Specifications & Inspection
- **Deep Inspection Modal**: Inspect listing photos, video walkthroughs, and detailed property metrics without page reloads.
- **Granular Parameters**: Number of Bedrooms (1 to 4+ BHK), Built-up Area in Sq. Ft., Calculated Price per Sq. Ft., and Government Verification Badges (`GOVT VERIFIED LISTING`).
- **Amenities Ledger**: Parking, Elevator, Power Backup, 24x7 Security, and Garden.

### 👥 3. Multi-Role Portals
| Role | Capabilities |
|---|---|
| **Buyer Portal** | Filter properties by City, BHK, Min Sq. Ft., and Budget. Inspect listings, execute itemized checkouts, and view generated title deed records. |
| **Seller / Agent Portal** | Publish listings with BHK, Sq. Ft., amenities, and photo/video uploads. Edit active listings and monitor transaction ledgers. |
| **Administrator Console** | System analytics (Total listings, sold vs rented ratios, active inventory), full user directory, transaction audit logs, and CSV data export. |

### 🔒 4. Production-Ready Security Hardening
- **Strict JWT Key Enforcement**: Fails loudly at startup if `SECRET_KEY` is missing in the environment.
- **Whitelisted CORS**: Origin whitelisting via `ALLOWED_ORIGINS` environment configuration with credential support.
- **Password Security**: Passwords hashed with `bcrypt`.
- **Relational Integrity**: Foreign keys and database transactions managed via SQLAlchemy.

---

## 🏗️ Architecture & Technology Stack

```
                                  ┌───────────────────────────┐
                                  │   Early 2000s Web Client  │
                                  │ (HTML5 / Vanilla JS / CSS) │
                                  └─────────────┬─────────────┘
                                                │ JSON / REST + Cookies
                                                ▼
                                  ┌───────────────────────────┐
                                  │      FastAPI Backend      │
                                  │ (Auth, Routers, Security) │
                                  └─────────────┬─────────────┘
                                                │ SQLAlchemy ORM
                                                ▼
                                  ┌───────────────────────────┐
                                  │      MySQL 8 Database     │
                                  │ (Users, Props, Deeds, Tx) │
                                  └───────────────────────────┘
```

- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy 2.0, PyJWT, Passlib (Bcrypt), Python-Multipart
- **Frontend**: Vanilla JavaScript (SPA modal architecture), Semantic HTML, Custom Retro CSS & Print Stylesheet
- **Database**: MySQL 8.0 (with connection pooling and schema migrations)
- **Media Engine**: Static file streaming for high-resolution property photos & videos

---

## 📂 Project Structure

```
national-real-estate-management-system/
├── client/                      # Frontend Single Page Application
│   ├── index.html               # Main SPA portal with skyline hero & modal overlays
│   ├── index.css                # Retro 2000s styling, component themes & print rules
│   ├── app.js                   # Client controller (Auth, Search, Checkout, Deed Engine)
│   ├── skyline.jpg              # City skyline background graphic
│   ├── gov_housing.jpg          # Government housing clip art
│   └── no_image.jpg             # Placeholder image
├── server/                      # FastAPI Application
│   ├── app/
│   │   ├── main.py              # Application entrypoint & CORS middleware
│   │   ├── models.py            # SQLAlchemy database models (Users, Agents, Properties, Transactions)
│   │   ├── schemas.py           # Pydantic request & response validation schemas
│   │   ├── database.py          # Database session management
│   │   ├── dependencies.py      # JWT authentication & role-based route guards
│   │   ├── auth.py              # Password hashing & JWT token signer
│   │   ├── migrate_db.py        # Database migration script
│   │   └── routers/             # API Route controllers
│   │       ├── auth.py          # Login, Register, Logout, Me endpoints
│   │       ├── properties.py    # CRUD, Filters, Photo/Video upload
│   │       ├── transactions.py  # Tax computation & Digital Deed execution
│   │       └── admin.py         # Metrics, User directory, CSV exports
│   ├── uploads/                 # Storage for uploaded listing media
│   ├── requirements.txt         # Production Python dependencies
│   ├── init_db.py               # Database table initializer
│   ├── seed.py                  # Initial seed data generator
│   └── .env.example             # Safe environment configuration template
├── .gitignore                   # Excludes .venv, cache, and sensitive local files
├── README.md                    # Project documentation
└── VERIFICATION.md              # E2E Verification checklist & test log
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Python 3.10 or higher**
- **MySQL Server 8.0** running on `localhost:3306`

---

### 2. Clone the Repository
```bash
git clone https://github.com/anubhaverte/national-real-estate-management-system_retro.git
cd national-real-estate-management-system_retro
```

---

### 3. Configure Environment Variables
Inside the `server/` directory, copy `.env.example` to `.env`:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your local database credentials and a strong secret key:
```env
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=real_estate_system

# Generate a strong key (e.g. using: python -c "import secrets; print(secrets.token_urlsafe(32))")
SECRET_KEY=your_generated_secret_key

# Allowed CORS origins
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000,http://localhost:5500,http://127.0.0.1:5500
```

---

### 4. Install Dependencies & Initialize Database
```bash
cd server

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Create database tables & seed sample data
python init_db.py
python seed.py
```

---

### 5. Launch the Server
```bash
uvicorn app.main:app --reload --port 8000
```

Open your browser and navigate to:
👉 **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@gov.in` | `admin123` | Full audit logs, stats, CSV transaction export, user directory |
| **Seller / Agent** | `seller@example.com` | `seller123` | Property listing, media management, transaction history |
| **Buyer** | `buyer@example.com` | `buyer123` | Property search, detailed inspection, checkout & title deed generation |

---

## 📡 REST API Reference Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new Buyer or Seller account | Public |
| `POST` | `/api/auth/login` | Authenticate user & set JWT HttpOnly cookie | Public |
| `POST` | `/api/auth/logout` | Invalidate session | Authenticated |
| `GET` | `/api/auth/me` | Fetch active user profile | Authenticated |
| `GET` | `/api/properties/` | Search properties with filters (`city`, `bhk`, `min_sqft`, `max_price`) | Public |
| `GET` | `/api/properties/{id}` | Get complete property specifications | Public |
| `POST` | `/api/properties/` | Add a new listing | Seller |
| `POST` | `/api/properties/{id}/media` | Upload listing photo and video | Seller |
| `POST` | `/api/transactions/` | Execute transaction & generate Digital Title Deed | Buyer |
| `GET` | `/api/transactions/{id}` | Retrieve specific Title Deed & tax receipt | Buyer / Seller / Admin |
| `GET` | `/api/admin/stats` | Platform inventory & volume metrics | Admin |
| `GET` | `/api/admin/transactions/export/csv` | Download full transaction ledger as CSV | Admin |

---

## 📄 Digital Title Deed Sample Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             GOVERNMENT OF INDIA • DEPARTMENT OF REVENUE                     │
│         CERTIFICATE OF PROPERTY TITLE DEED & CONVEYANCE                     │
│               STAMP DUTY PAID UNDER INDIAN STAMP ACT, 1899                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Certificate No: DEED-2026-A8F3C19B        Date: 05/09/2026, 09:30 PM        │
│ Stamp Duty: ₹2,50,000 (5.0%)              Payment Mode: State Bank NetBanking│
├─────────────────────────────────────────────────────────────────────────────┤
│ Property: 12-B Nehru Road, Mumbai (3 BHK • 1,650 Sq. Ft. • Verified Title)  │
│ First Party (Transferor): Kumar Properties (Contact: 9876543210)            │
│ Second Party (Transferee): Suresh Kumar (buyer@example.com)                 │
│ Consideration Amount: ₹50,00,000 | Grand Total Paid: ₹53,01,000             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Digitally Signed]               [Digitally Signed]       [E-SEALED]        │
│ First Party                      Second Party             Registrar of Deeds│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ License & Attribution
Distributed under the **MIT License**. Created as a reference implementation of secure full-stack web applications with retro UI styling.
