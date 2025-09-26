#!/usr/bin/env python3
"""
AgriCure Backend-Frontend Integration Verification Script

This script verifies that the complete integration is working correctly.
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:8080"

def test_backend_health():
    """Test if backend is healthy and responding"""
    print("🔍 Testing Backend Health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend Health: {data.get('status', 'unknown')}")
            return True
        else:
            print(f"❌ Backend Health Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend Health Check Error: {str(e)}")
        return False

def test_ml_model_status():
    """Test if ML model is loaded and working"""
    print("\n🧠 Testing ML Model Status...")
    try:
        response = requests.get(f"{BACKEND_URL}/status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('model_loaded'):
                print(f"✅ ML Model: {data.get('model_type', 'Unknown')} - Loaded")
                return True
            else:
                print("⚠️ ML Model: Not Loaded")
                return False
        else:
            print(f"❌ Model Status Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Model Status Check Error: {str(e)}")
        return False

def test_basic_prediction():
    """Test basic fertilizer prediction"""
    print("\n🌱 Testing Basic Prediction...")
    try:
        test_data = {
            "Temperature": 25,
            "Humidity": 80,
            "Moisture": 40,
            "Soil_Type": "Loamy",
            "Crop_Type": "Rice",
            "Nitrogen": 85,
            "Potassium": 45,
            "Phosphorous": 35,
            "pH": 6.5
        }
        
        response = requests.post(
            f"{BACKEND_URL}/predict", 
            json=test_data, 
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            fertilizer = data.get('fertilizer', 'Unknown')
            confidence = data.get('confidence', 0)
            print(f"✅ Basic Prediction: {fertilizer} ({confidence:.2f}% confidence)")
            return True
        else:
            print(f"❌ Basic Prediction Failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Basic Prediction Error: {str(e)}")
        return False

def test_enhanced_prediction():
    """Test enhanced fertilizer prediction"""
    print("\n🚀 Testing Enhanced Prediction...")
    try:
        test_data = {
            "Temperature": 25,
            "Humidity": 80,
            "Moisture": 40,
            "Soil_Type": "Loamy",
            "Crop_Type": "Rice",
            "Nitrogen": 85,
            "Potassium": 45,
            "Phosphorous": 35,
            "pH": 6.5
        }
        
        response = requests.post(
            f"{BACKEND_URL}/predict-enhanced", 
            json=test_data, 
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            predictions = data.get('predictions', {})
            primary = predictions.get('Primary_Fertilizer', 'Unknown')
            secondary = predictions.get('Secondary_Fertilizer', 'Unknown')
            print(f"✅ Enhanced Prediction - Primary: {primary}, Secondary: {secondary}")
            return True
        else:
            print(f"❌ Enhanced Prediction Failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Enhanced Prediction Error: {str(e)}")
        return False

def test_llm_enhanced_prediction():
    """Test LLM-enhanced prediction"""
    print("\n🤖 Testing LLM-Enhanced Prediction...")
    try:
        test_data = {
            "Temperature": 25,
            "Humidity": 80,
            "Moisture": 40,
            "Soil_Type": "Loamy",
            "Crop_Type": "Rice",
            "Nitrogen": 85,
            "Potassium": 45,
            "Phosphorous": 35,
            "pH": 6.5,
            "Sowing_Date": "2024-01-15",
            "Field_Size": 1.0,
            "Field_Unit": "hectares",
            "Bulk_Density_g_cm3": 1.3,
            "Sampling_Depth_cm": 15.0
        }
        
        response = requests.post(
            f"{BACKEND_URL}/predict-llm-enhanced", 
            json=test_data, 
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            primary_fert = data.get('primary_fertilizer', {})
            cost_est = data.get('cost_estimate', {})
            primary_name = primary_fert.get('name', 'Unknown')
            total_cost = cost_est.get('total', '₹0')
            print(f"✅ LLM Enhanced: {primary_name}, Cost: {total_cost}")
            return True
        else:
            print(f"⚠️ LLM Enhancement: Not available ({response.status_code})")
            return False
    except Exception as e:
        print(f"⚠️ LLM Enhancement: Not available - {str(e)}")
        return False

def test_soil_data_integration():
    """Test soil data integration"""
    print("\n🌍 Testing Soil Data Integration...")
    try:
        # Test coordinates for New Delhi, India
        test_data = {
            "latitude": 28.6139,
            "longitude": 77.2090
        }
        
        response = requests.post(
            f"{BACKEND_URL}/soil-data", 
            json=test_data, 
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            soil_type = data.get('soil_type', 'Unknown')
            confidence = data.get('confidence', 0)
            print(f"✅ Soil Data: {soil_type} ({confidence * 100:.1f}% confidence)")
            return True
        else:
            print(f"❌ Soil Data Integration Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Soil Data Integration Error: {str(e)}")
        return False

def test_frontend_accessibility():
    """Test if frontend is accessible"""
    print("\n🖥️ Testing Frontend Accessibility...")
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        if response.status_code == 200:
            print(f"✅ Frontend: Accessible at {FRONTEND_URL}")
            return True
        else:
            print(f"❌ Frontend: Not accessible ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Frontend Error: {str(e)}")
        return False

def run_integration_verification():
    """Run complete integration verification"""
    print("=" * 60)
    print("🌾 AGRICURE INTEGRATION VERIFICATION")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Frontend URL: {FRONTEND_URL}")
    print("=" * 60)
    
    tests = [
        ("Backend Health", test_backend_health),
        ("ML Model Status", test_ml_model_status),
        ("Basic Prediction", test_basic_prediction),
        ("Enhanced Prediction", test_enhanced_prediction),
        ("LLM Enhancement", test_llm_enhanced_prediction),
        ("Soil Data Integration", test_soil_data_integration),
        ("Frontend Access", test_frontend_accessibility),
    ]
    
    results = []
    for test_name, test_func in tests:
        result = test_func()
        results.append((test_name, result))
        time.sleep(1)  # Brief pause between tests
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 INTEGRATION VERIFICATION RESULTS")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<25} {status}")
    
    print("-" * 60)
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - INTEGRATION SUCCESSFUL! 🎉")
        print("✅ AgriCure Backend-Frontend integration is fully operational")
        print("✅ All ML prediction services are working")
        print("✅ System is ready for production use")
    elif passed >= total * 0.8:
        print("\n✅ INTEGRATION MOSTLY SUCCESSFUL")
        print("⚠️ Some optional features may not be available")
        print("✅ Core functionality is operational")
    else:
        print("\n❌ INTEGRATION HAS ISSUES")
        print("⚠️ Please check failed tests and retry")
    
    print("\n" + "=" * 60)
    print("🌱 AgriCure - Smart Farming with AI")
    print("=" * 60)

if __name__ == "__main__":
    run_integration_verification()