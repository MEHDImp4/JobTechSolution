import requests

url = 'http://localhost:8000/api/auth/login/'
data = {
    'email': 'admin@jobtech.com',
    'password': 'password123'
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
    print(f"Cookies: {response.cookies.get_dict()}")
except Exception as e:
    print(f"Error: {e}")
