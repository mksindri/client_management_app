from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, field_validator
import re
import uvicorn
from typing import List

app = FastAPI(title="Client Management API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
clients_db: List[dict] = []

class ClientModel(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    address: str

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        """Validate that name is not blank and has valid characters"""
        if not v or not v.strip():
            raise ValueError('Name cannot be blank')
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        return v.strip()

    @field_validator('mobile')
    @classmethod
    def validate_mobile(cls, v):
        """Validate that mobile has sufficient digits (10-15 digits)"""
        # Remove common separators
        cleaned = re.sub(r'[\s\-\+\(\)]', '', v)
        
        if not cleaned.isdigit():
            raise ValueError('Mobile number must contain only digits (and optional separators)')
        
        if len(cleaned) < 10:
            raise ValueError('Mobile number must have at least 10 digits')
        
        if len(cleaned) > 15:
            raise ValueError('Mobile number must not exceed 15 digits')
        
        return v

    @field_validator('address')
    @classmethod
    def validate_address(cls, v):
        """Validate that address is not blank"""
        if not v or not v.strip():
            raise ValueError('Address cannot be blank')
        if len(v.strip()) < 5:
            raise ValueError('Address must be at least 5 characters long')
        return v.strip()

class ClientResponse(ClientModel):
    id: int

@app.get("/")
async def root():
    return {"message": "Client Management API is running"}

@app.post("/api/clients")
async def create_client(client: ClientModel):
    """Create a new client with validation"""
    try:
        # Create client object
        new_client = {
            "id": len(clients_db) + 1,
            "name": client.name,
            "email": client.email,
            "mobile": client.mobile,
            "address": client.address
        }
        clients_db.append(new_client)
        return {
            "status": "success",
            "message": "Client added successfully",
            "client": new_client
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/clients")
async def get_all_clients():
    """Retrieve all clients"""
    return {
        "status": "success",
        "count": len(clients_db),
        "clients": clients_db
    }

@app.get("/api/clients/{client_id}")
async def get_client(client_id: int):
    """Retrieve a specific client by ID"""
    for client in clients_db:
        if client["id"] == client_id:
            return {
                "status": "success",
                "client": client
            }
    raise HTTPException(status_code=404, detail="Client not found")

@app.delete("/api/clients/{client_id}")
async def delete_client(client_id: int):
    """Delete a client by ID"""
    global clients_db
    for idx, client in enumerate(clients_db):
        if client["id"] == client_id:
            deleted_client = clients_db.pop(idx)
            return {
                "status": "success",
                "message": "Client deleted successfully",
                "client": deleted_client
            }
    raise HTTPException(status_code=404, detail="Client not found")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)