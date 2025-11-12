# 🐍 Qualcomm AI Hub Flask Microservice

Flask backend untuk inference menggunakan Qualcomm AI Hub model.

## 📋 Prerequisites

- Python 3.8+ installed
- Qualcomm AI Hub account dengan model sudah di-upload
- Model ID: `mq885klzq`
- API Key: `bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d`

## 🚀 Setup Instructions

### Step 1: Create Virtual Environment (Recommended)

```bash
# Windows PowerShell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server\python-service
python -m venv venv
.\venv\Scripts\Activate.ps1

# Or Windows CMD
python -m venv venv
venv\Scripts\activate.bat
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

**Required packages:**
- `flask` - Web framework
- `flask-cors` - CORS support
- `qai-hub` - Qualcomm AI Hub SDK
- `python-dotenv` - Environment variables
- `numpy` - Array operations

### Step 3: Configure Qualcomm AI Hub

Login to your Qualcomm AI Hub account:

```bash
qai-hub configure
```

This will prompt for your API token. Use: `bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d`

Or configure via environment variable (already in `.env` file):
```bash
export QAI_HUB_API_TOKEN=bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d
```

### Step 4: Verify Model Access

```bash
# List your models
qai-hub list-models

# Get model info
qai-hub get-model --model-id mq885klzq
```

### Step 5: Start Flask Server

```bash
python app.py
```

Server akan berjalan di `http://127.0.0.1:5001`

## 📡 API Endpoints

### 1. Health Check
```bash
GET http://127.0.0.1:5001/health

Response:
{
  "status": "healthy",
  "service": "Qualcomm AI Hub Compliance Service",
  "model_id": "mq885klzq",
  "qualcomm_configured": true,
  "qai_hub_installed": true
}
```

### 2. Single Prediction
```bash
POST http://127.0.0.1:5001/predict
Content-Type: application/json

{
  "waktu_konsumsi_seharusnya": "2025-01-13T10:00:00.000Z",
  "timestamp_konsumsi_aktual": "2025-01-13T10:05:00.000Z",
  "aksi": "Terima"
}

Response:
{
  "success": true,
  "kepatuhan": "Patuh",
  "confidence": 0.95,
  "method": "qualcomm-ai",
  "job_id": "..."
}
```

### 3. Batch Prediction
```bash
POST http://127.0.0.1:5001/batch-predict
Content-Type: application/json

{
  "logs": [
    {
      "waktu_konsumsi_seharusnya": "2025-01-13T10:00:00.000Z",
      "timestamp_konsumsi_aktual": "2025-01-13T10:05:00.000Z",
      "aksi": "Terima"
    },
    ...
  ]
}
```

## 🧪 Testing

### Test with curl:

```bash
# Windows PowerShell
$body = @{
    waktu_konsumsi_seharusnya = "2025-01-13T10:00:00.000Z"
    timestamp_konsumsi_aktual = "2025-01-13T10:05:00.000Z"
    aksi = "Terima"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5001/predict" -Method POST -Body $body -ContentType "application/json"
```

### Test with Python:

```python
import requests

data = {
    "waktu_konsumsi_seharusnya": "2025-01-13T10:00:00.000Z",
    "timestamp_konsumsi_aktual": "2025-01-13T10:05:00.000Z",
    "aksi": "Terima"
}

response = requests.post("http://127.0.0.1:5001/predict", json=data)
print(response.json())
```

## 🔧 Troubleshooting

### Issue: `qai-hub` not configured

**Solution:**
```bash
qai-hub configure
# Enter API token when prompted
```

### Issue: Model not found (404)

**Solution:**
1. Verify model ID: `qai-hub get-model --model-id mq885klzq`
2. Check if model is deployed
3. Confirm API key has access to the model

### Issue: Import error for `qai_hub`

**Solution:**
```bash
pip install qai-hub --upgrade
```

### Issue: Flask server won't start

**Solution:**
```bash
# Check if port 5001 is available
netstat -ano | findstr :5001

# Or change port in config.py
FLASK_PORT=5002
```

## 📊 Model Input Format

Your Qualcomm AI Hub model expects:
- **Input shape**: `(1, 2)` - 2 features
- **Features**:
  1. `delay_minutes` (float): Difference between actual and scheduled time
  2. `action` (float): 1.0 for "Terima", 0.0 for "Tolak"

**Output**:
- Binary classification: `[0.0-1.0]`
- `> 0.5` = "Patuh" (Compliant)
- `<= 0.5` = "Tidak Patuh" (Non-compliant)

## 🔄 Integration with Node.js

Node.js backend (`qualcommAIService.js`) automatically calls this Flask service:

```javascript
// Node.js side (automatic)
const response = await axios.post('http://127.0.0.1:5001/predict', {
  waktu_konsumsi_seharusnya: "...",
  timestamp_konsumsi_aktual: "...",
  aksi: "Terima"
});
```

## 📝 Environment Variables

Create `.env` file:
```env
QUALCOMM_MODEL_ID=mq885klzq
QUALCOMM_API_KEY=bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d
PYTHON_SERVICE_PORT=5001
PYTHON_SERVICE_HOST=127.0.0.1
```

## 🚀 Production Deployment

For production, consider:
1. Use **Gunicorn** instead of Flask dev server
2. Add **request rate limiting**
3. Implement **caching** for repeated predictions
4. Use **async job queue** (Celery) for batch processing
5. Add **monitoring** (Prometheus, Grafana)

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 127.0.0.1:5001 app:app
```

## 📚 References

- [Qualcomm AI Hub Documentation](https://aihub.qualcomm.com/docs)
- [qai-hub Python SDK](https://github.com/quic/ai-hub-models)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

**Status**: Ready for testing! Start Flask server first, then Node.js backend will automatically connect.
