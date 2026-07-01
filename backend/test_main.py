from fastapi.testclient import TestClient
import pytest
from main import app, clients_db

# Create a clean TestClient instance for testing
client = TestClient(app)

@pytest.fixture(autouse=True)
def run_before_and_after_tests():
    # Clear the database before each test
    clients_db.clear()
    yield

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Client Management API is running"}

def test_create_client_success():
    payload = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "mobile": "1234567890",
        "address": "123 Main Street"
    }
    response = client.post("/api/clients", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["message"] == "Client added successfully"
    assert data["client"]["name"] == "John Doe"
    assert data["client"]["id"] == 1

def test_create_client_invalid_email():
    payload = {
        "name": "John Doe",
        "email": "invalid-email",
        "mobile": "1234567890",
        "address": "123 Main Street"
    }
    response = client.post("/api/clients", json=payload)
    assert response.status_code == 422  # Unprocessable Entity (FastAPI validation error)

def test_create_client_invalid_mobile():
    payload = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "mobile": "12345",  # Too short
        "address": "123 Main Street"
    }
    response = client.post("/api/clients", json=payload)
    assert response.status_code == 422

def test_get_all_clients():
    # Verify starting state
    response = client.get("/api/clients")
    assert response.status_code == 200
    assert response.json()["count"] == 0

    # Add a client
    client.post("/api/clients", json={
        "name": "Jane Doe",
        "email": "jane@example.com",
        "mobile": "+1 (555) 019-2834",
        "address": "456 Elm Street"
    })

    # Verify counts
    response = client.get("/api/clients")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert len(data["clients"]) == 1
    assert data["clients"][0]["name"] == "Jane Doe"

def test_get_client_by_id():
    # Seed a client
    client.post("/api/clients", json={
        "name": "Alice Smith",
        "email": "alice@example.com",
        "mobile": "0987654321",
        "address": "789 Pine Road"
    })

    # Retrieve client
    response = client.get("/api/clients/1")
    assert response.status_code == 200
    assert response.json()["client"]["name"] == "Alice Smith"

    # Retrieve non-existent client
    response = client.get("/api/clients/999")
    assert response.status_code == 404

def test_delete_client():
    # Seed a client
    client.post("/api/clients", json={
        "name": "Bob Jones",
        "email": "bob@example.com",
        "mobile": "9876543210",
        "address": "321 Oak Avenue"
    })

    # Delete client
    response = client.delete("/api/clients/1")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Verify it is gone
    response = client.get("/api/clients/1")
    assert response.status_code == 404
