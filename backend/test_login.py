"""
Test login endpoint directly
"""
import requests
import json

API_BASE = "http://127.0.0.1:8000"

# Test login
print("\n" + "="*60)
print("Testing Login Endpoint")
print("="*60 + "\n")

payload = {
    "email": "test@example.com",
    "password": "test123"
}

print(f"Sending POST to {API_BASE}/api/auth/login")
print(f"Payload: {json.dumps(payload, indent=2)}\n")

try:
    response = requests.post(
        f"{API_BASE}/api/auth/login",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}\n")
    print(f"Response Body:")
    print(json.dumps(response.json(), indent=2))
    
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'response'):
        print(f"Response: {e.response.text}")
