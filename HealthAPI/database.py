import os

import asyncpg
from dotenv import load_dotenv

load_dotenv()

pool: asyncpg.Pool | None = None


async def connect_db():
    global pool
    pool = await asyncpg.create_pool(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        min_size=2,
        max_size=10,
    )
    print("PostgreSQL connected successfully")


async def disconnect_db():
    global pool
    if pool:
        await pool.close()
        print("PostgreSQL pool closed")


def get_pool() -> asyncpg.Pool:
    if pool is None:
        raise RuntimeError("Database pool is not initialized")
    return pool
