# ml_service/tests/test_api.py
"""
Automated tests for AgroAware ML Service API
Run with: pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from api import app

client = TestClient(app)


class TestHealthEndpoint:
    """Tests for the health check endpoint"""
    
    def test_home_returns_200(self):
        """Test that home endpoint returns 200 status"""
        response = client.get("/")
        assert response.status_code == 200
    
    def test_home_returns_status(self):
        """Test that home endpoint returns correct status message"""
        response = client.get("/")
        data = response.json()
        assert "status" in data
        assert "ML Service Running" in data["status"]
    
    def test_home_shows_model_type(self):
        """Test that home endpoint shows model type"""
        response = client.get("/")
        data = response.json()
        assert "model" in data
        assert "Ensemble" in data["model"]


class TestPredictEndpoint:
    """Tests for the crop prediction endpoint"""
    
    def test_predict_valid_input(self):
        """Test prediction with valid input data"""
        payload = {
            "N": 90,
            "P": 42,
            "K": 43,
            "ph": 6.5,
            "temperature": 25.0,
            "rainfall": 200.0
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "predicted_crop" in data
        assert "confidence" in data
        assert "top_3" in data
    
    def test_predict_returns_top3(self):
        """Test that prediction returns top 3 crops"""
        payload = {
            "N": 90,
            "P": 42,
            "K": 43,
            "ph": 6.5,
            "temperature": 25.0,
            "rainfall": 200.0
        }
        response = client.post("/predict", json=payload)
        data = response.json()
        assert len(data["top_3"]) == 3
        for crop in data["top_3"]:
            assert "crop" in crop
            assert "confidence" in crop
    
    def test_predict_confidence_range(self):
        """Test that confidence is in valid range (0-100)"""
        payload = {
            "N": 50,
            "P": 50,
            "K": 50,
            "ph": 7.0,
            "temperature": 30.0,
            "rainfall": 150.0
        }
        response = client.post("/predict", json=payload)
        data = response.json()
        assert 0 <= data["confidence"] <= 100
    
    def test_predict_missing_field(self):
        """Test prediction fails with missing required field"""
        payload = {
            "N": 90,
            "P": 42,
            # Missing K, ph, temperature, rainfall
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 422  # Validation error
    
    def test_predict_edge_values(self):
        """Test prediction with edge case values"""
        payload = {
            "N": 0,
            "P": 0,
            "K": 0,
            "ph": 7.0,
            "temperature": 20.0,
            "rainfall": 100.0
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 200


class TestFertilizerEndpoint:
    """Tests for the fertilizer recommendation endpoint"""
    
    def test_fertilizer_valid_input(self):
        """Test fertilizer recommendation with valid input"""
        payload = {
            "crop": "rice",
            "N": 40,
            "P": 20,
            "K": 30
        }
        response = client.post("/fertilizer", json=payload)
        assert response.status_code == 200
    
    def test_fertilizer_missing_crop(self):
        """Test fertilizer fails without crop name"""
        payload = {
            "N": 40,
            "P": 20,
            "K": 30
        }
        response = client.post("/fertilizer", json=payload)
        assert response.status_code == 422


class TestRagEndpoints:
    """Tests for RAG endpoints"""
    
    def test_rag_ask_no_document(self):
        """Test RAG ask endpoint when no document is indexed"""
        payload = {"question": "What is crop rotation?"}
        response = client.post("/rag/ask", json=payload)
        assert response.status_code == 200
        data = response.json()
        # Should return error since no document is indexed
        assert data["status"] == "error" or "No document" in data.get("message", "")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
