"""
Test script for Qualcomm AI Hub Flask Service
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:5001"

def test_health():
    """Test health check endpoint"""
    print("\n" + "="*60)
    print("🔍 Testing Health Check Endpoint")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_predict_compliant():
    """Test prediction with compliant scenario (on time)"""
    print("\n" + "="*60)
    print("🧪 Test Case 1: Compliant (On Time)")
    print("="*60)
    
    scheduled_time = datetime.now()
    actual_time = scheduled_time + timedelta(minutes=5)  # 5 min delay (within 30 min)
    
    data = {
        "waktu_konsumsi_seharusnya": scheduled_time.isoformat() + "Z",
        "timestamp_konsumsi_aktual": actual_time.isoformat() + "Z",
        "aksi": "Terima"
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(f"{BASE_URL}/predict", json=data, timeout=30)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        result = response.json()
        expected = "Patuh"
        actual = result.get("kepatuhan")
        
        if actual == expected:
            print(f"\n✅ PASSED: Expected '{expected}', got '{actual}'")
            return True
        else:
            print(f"\n❌ FAILED: Expected '{expected}', got '{actual}'")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_predict_non_compliant_delay():
    """Test prediction with non-compliant scenario (late)"""
    print("\n" + "="*60)
    print("🧪 Test Case 2: Non-Compliant (Late - 60 minutes)")
    print("="*60)
    
    scheduled_time = datetime.now()
    actual_time = scheduled_time + timedelta(minutes=60)  # 60 min delay (exceeds 30 min)
    
    data = {
        "waktu_konsumsi_seharusnya": scheduled_time.isoformat() + "Z",
        "timestamp_konsumsi_aktual": actual_time.isoformat() + "Z",
        "aksi": "Terima"
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(f"{BASE_URL}/predict", json=data, timeout=30)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        result = response.json()
        expected = "Tidak Patuh"
        actual = result.get("kepatuhan")
        
        if actual == expected:
            print(f"\n✅ PASSED: Expected '{expected}', got '{actual}'")
            return True
        else:
            print(f"\n❌ FAILED: Expected '{expected}', got '{actual}'")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_predict_non_compliant_rejected():
    """Test prediction with non-compliant scenario (rejected)"""
    print("\n" + "="*60)
    print("🧪 Test Case 3: Non-Compliant (Rejected)")
    print("="*60)
    
    scheduled_time = datetime.now()
    actual_time = scheduled_time + timedelta(minutes=0)  # On time but rejected
    
    data = {
        "waktu_konsumsi_seharusnya": scheduled_time.isoformat() + "Z",
        "timestamp_konsumsi_aktual": actual_time.isoformat() + "Z",
        "aksi": "Tolak"
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(f"{BASE_URL}/predict", json=data, timeout=30)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        result = response.json()
        expected = "Tidak Patuh"
        actual = result.get("kepatuhan")
        
        if actual == expected:
            print(f"\n✅ PASSED: Expected '{expected}', got '{actual}'")
            return True
        else:
            print(f"\n❌ FAILED: Expected '{expected}', got '{actual}'")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("🚀 Starting Qualcomm AI Hub Flask Service Tests")
    print("="*60)
    
    results = {
        "Health Check": test_health(),
        "Compliant (On Time)": test_predict_compliant(),
        "Non-Compliant (Late)": test_predict_non_compliant_delay(),
        "Non-Compliant (Rejected)": test_predict_non_compliant_rejected()
    }
    
    print("\n" + "="*60)
    print("📊 Test Results Summary")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name:.<50} {status}")
    
    total = len(results)
    passed = sum(results.values())
    failed = total - passed
    
    print("\n" + "-"*60)
    print(f"Total: {total} | Passed: {passed} | Failed: {failed}")
    print("="*60)
    
    return failed == 0

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
