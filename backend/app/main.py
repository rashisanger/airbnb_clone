from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .auth import router as auth_router
from .database import Base, engine
from .routers import bookings, favorites, listings, host
from .seed import seed_database

app = FastAPI(title="Airbnb Clone API")

# Create database tables
Base.metadata.create_all(bind=engine)

# CORS - Update with your Vercel URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://airbnb-clone.vercel.app",  # Replace with your actual Vercel URL
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database on startup
try:
    seed_database()
    print("✅ Database seeded successfully on startup")
except Exception as e:
    print(f"⚠️ Error during seeding: {e}")

# Routers
app.include_router(auth_router)
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(favorites.router)
app.include_router(host.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}