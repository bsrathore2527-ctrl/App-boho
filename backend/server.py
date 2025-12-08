from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class LogLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"

class LogType(str, Enum):
    CONFIG_CHANGE = "config_change"
    RISK_EVENT = "risk_event"
    VIOLATION = "violation"
    SYSTEM = "system"

# Models
class RiskConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default="current_config")
    daily_max_loss: float = Field(description="Maximum daily loss allowed")
    daily_max_profit: float = Field(description="Daily profit target")
    max_trades_per_day: int = Field(description="Maximum number of trades allowed per day")
    max_position_size: float = Field(description="Maximum position size")
    stop_loss_percentage: float = Field(description="Stop loss percentage")
    consecutive_loss_limit: int = Field(description="Maximum consecutive losses allowed")
    cooldown_after_loss: int = Field(description="Cooldown period in minutes after a loss")
    trailing_profit_enabled: bool = Field(default=False)
    trailing_profit_step: float = Field(default=0.0)
    side_lock: Optional[str] = Field(default=None, description="BUY or SELL lock")
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class RiskConfigUpdate(BaseModel):
    daily_max_loss: float
    daily_max_profit: float
    max_trades_per_day: int
    max_position_size: float
    stop_loss_percentage: float
    consecutive_loss_limit: int
    cooldown_after_loss: int
    trailing_profit_enabled: bool = False
    trailing_profit_step: float = 0.0
    side_lock: Optional[str] = None

class RiskStatus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default="current_status")
    current_pnl: float = Field(default=0.0)
    trades_today: int = Field(default=0)
    consecutive_losses: int = Field(default=0)
    max_loss_hit: bool = Field(default=False)
    max_profit_hit: bool = Field(default=False)
    position_size: float = Field(default=0.0)
    in_cooldown: bool = Field(default=False)
    cooldown_until: Optional[str] = None
    violations: List[str] = Field(default_factory=list)
    last_trade_time: Optional[str] = None
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class RiskStatusUpdate(BaseModel):
    current_pnl: Optional[float] = None
    trades_today: Optional[int] = None
    consecutive_losses: Optional[int] = None
    max_loss_hit: Optional[bool] = None
    max_profit_hit: Optional[bool] = None
    position_size: Optional[float] = None
    in_cooldown: Optional[bool] = None
    cooldown_until: Optional[str] = None
    violations: Optional[List[str]] = None
    last_trade_time: Optional[str] = None

class LogEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    level: LogLevel
    type: LogType
    message: str
    details: Optional[Dict[str, Any]] = None

class LogEntryCreate(BaseModel):
    level: LogLevel
    type: LogType
    message: str
    details: Optional[Dict[str, Any]] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "Risk Management Dashboard API"}

# Risk Configuration Endpoints
@api_router.get("/risk-config", response_model=RiskConfig)
async def get_risk_config():
    config = await db.risk_config.find_one({"id": "current_config"}, {"_id": 0})
    if not config:
        # Return default config
        default_config = RiskConfig(
            id="current_config",
            daily_max_loss=5000.0,
            daily_max_profit=10000.0,
            max_trades_per_day=10,
            max_position_size=50000.0,
            stop_loss_percentage=2.0,
            consecutive_loss_limit=3,
            cooldown_after_loss=15,
            trailing_profit_enabled=False,
            trailing_profit_step=0.5
        )
        await db.risk_config.insert_one(default_config.model_dump())
        return default_config
    return RiskConfig(**config)

@api_router.put("/risk-config", response_model=RiskConfig)
async def update_risk_config(config_update: RiskConfigUpdate):
    config_data = config_update.model_dump()
    config_data["id"] = "current_config"
    config_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.risk_config.update_one(
        {"id": "current_config"},
        {"$set": config_data},
        upsert=True
    )
    
    # Log the configuration change
    log_entry = LogEntry(
        level=LogLevel.INFO,
        type=LogType.CONFIG_CHANGE,
        message="Risk configuration updated",
        details=config_data
    )
    await db.logs.insert_one(log_entry.model_dump())
    
    return RiskConfig(**config_data)

# Risk Status Endpoints
@api_router.get("/risk-status", response_model=RiskStatus)
async def get_risk_status():
    status = await db.risk_status.find_one({"id": "current_status"}, {"_id": 0})
    if not status:
        default_status = RiskStatus(id="current_status")
        await db.risk_status.insert_one(default_status.model_dump())
        return default_status
    return RiskStatus(**status)

@api_router.put("/risk-status", response_model=RiskStatus)
async def update_risk_status(status_update: RiskStatusUpdate):
    current_status = await db.risk_status.find_one({"id": "current_status"}, {"_id": 0})
    
    if not current_status:
        current_status = RiskStatus(id="current_status").model_dump()
    
    # Update only provided fields
    update_data = status_update.model_dump(exclude_none=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    for key, value in update_data.items():
        current_status[key] = value
    
    await db.risk_status.update_one(
        {"id": "current_status"},
        {"$set": current_status},
        upsert=True
    )
    
    return RiskStatus(**current_status)

@api_router.post("/risk-status/reset")
async def reset_risk_status():
    default_status = RiskStatus(id="current_status")
    await db.risk_status.update_one(
        {"id": "current_status"},
        {"$set": default_status.model_dump()},
        upsert=True
    )
    
    log_entry = LogEntry(
        level=LogLevel.INFO,
        type=LogType.SYSTEM,
        message="Risk status reset to default"
    )
    await db.logs.insert_one(log_entry.model_dump())
    
    return {"message": "Risk status reset successfully"}

# Logs Endpoints
@api_router.get("/logs", response_model=List[LogEntry])
async def get_logs(limit: int = 100, log_type: Optional[str] = None):
    query = {}
    if log_type:
        query["type"] = log_type
    
    logs = await db.logs.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return [LogEntry(**log) for log in logs]

@api_router.post("/logs", response_model=LogEntry)
async def create_log(log_create: LogEntryCreate):
    log_entry = LogEntry(**log_create.model_dump())
    await db.logs.insert_one(log_entry.model_dump())
    return log_entry

@api_router.delete("/logs")
async def clear_logs():
    result = await db.logs.delete_many({})
    return {"message": f"Deleted {result.deleted_count} log entries"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()