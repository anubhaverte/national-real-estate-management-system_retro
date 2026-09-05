from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine, Base
from .routers import auth, properties, transactions, admin

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Real Estate Management System API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(transactions.router)
app.include_router(admin.router)

# Mount static files for the frontend if the directory exists
client_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "client")
if os.path.exists(client_dir):
    app.mount("/", StaticFiles(directory=client_dir, html=True), name="static")

# Mount uploads directory for media
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
