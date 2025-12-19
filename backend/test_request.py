import requests

url = "http://127.0.0.1:5000/predict"

# Example resume text
data = {
    "resume_text": "I have 3 years of experience in Python, Flask, and Machine Learning."
}

response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print("Response:", response.json())
