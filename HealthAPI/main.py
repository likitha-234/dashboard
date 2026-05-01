from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import connect_db, disconnect_db
from routes import appointments, doctors, patients, pharmacy, revenue, stats

app = FastAPI(title="HealthAPI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()


@app.get("/")
async def root():
    return {"status": "ok", "service": "HealthAPI"}


app.include_router(stats.router)
app.include_router(appointments.router)
app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(revenue.router)
app.include_router(pharmacy.router)
