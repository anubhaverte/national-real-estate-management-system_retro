# National Real Estate Management Portal

A full-stack E-Governance Real Estate Platform styled with an authentic early-2000s retro aesthetic, featuring a robust FastAPI & MySQL backend, multi-role access control, media management, itemized tax/stamp duty checkout, and a printable Digital Title Deed generator.

---

## 🌟 Key Features

- **Digital Title Deed & E-Stamping Certificate Generator**: Automatically calculates State Stamp Duty (5% / 1%), Registration Fees, and generates an official printable Title Deed (`DEED-2026-XXXXXXXX`) with watermark seals and signature blocks (`@media print` supported).
- **Property Inspection & Real-World Specifications**: Property details view showing BHK (1 to 4+), Built-up Area (Sq. Ft.), Price per Sq. Ft., Amenities (Elevator, Power Backup, Security, Parking), and Government Verification Badges.
- **Media Uploads**: High-resolution property photo and video walkthrough uploads per listing.
- **Role-Based Workflows**:
  - **Buyer**: Property finder with BHK/SqFt filters, inspection modal, tax checkout, and deed history.
  - **Seller**: Active listing management, photo/video uploads, edit modal, and transaction ledger.
  - **Admin**: Platform analytics, full user ledger, all transaction deeds, and CSV export.
- **Authentic 2000s E-Gov UI**: Table-based layouts, marquee notice tickers, vintage color scheme (`#003366` Navy & `#800000` Maroon), beveled 3D buttons, and persistent city skyline background.
- **Secure Architecture**: Parameterized SQLAlchemy ORM queries, bcrypt password hashing, and JWT stored in `HttpOnly` cookies.

---

## 📁 Directory Structure

```
real_estate_system/
├── client/                      # Frontend SPA
│   ├── index.html               # Main HTML with Hero skyline layout & Modals
│   ├── index.css                # 2000s E-Gov styles & @media print Deed layout
│   ├── app.js                   # Client logic (Auth, Search, Checkout, Deed Renderer)
│   ├── skyline.jpg              # Retro skyline background graphic
│   ├── gov_housing.jpg          # Early 2000s clip art graphic
│   └── no_image.jpg             # Placeholder graphic
├── server/                      # FastAPI Backend
│   ├── app/
│   │   ├── main.py              # Application entrypoint & static mounts
│   │   ├── models.py            # SQLAlchemy Database Models
│   │   ├── schemas.py           # Pydantic validation schemas
│   │   ├── database.py          # MySQL Engine connection
│   │   ├── dependencies.py      # Auth & Role verification dependencies
│   │   ├── auth.py              # JWT token generation & password hashing
│   │   ├── migrate_db.py        # Database migration script
│   │   └── routers/             # API Route handlers
│   │       ├── auth.py
│   │       ├── properties.py
│   │       ├── transactions.py
│   │       └── admin.py
│   ├── uploads/                 # Uploaded property photos & videos
│   ├── requirements.txt         # Dependencies list
│   ├── init_db.py               # DB table creator
│   └── seed.py                  # Seed initial properties & demo accounts
├── README.md                    # Project documentation & GitHub push guide
└── VERIFICATION.md              # E2E Verification Checklist
```

