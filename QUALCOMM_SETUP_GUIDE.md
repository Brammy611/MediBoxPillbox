# 🚀 Qualcomm AI Hub Integration - Complete Setup Guide

## 📋 Architecture Overview

```
┌─────────────────┐      HTTP/JSON      ┌──────────────────┐
│   Node.js API   │ ──────────────────> │  Flask Service   │
│   (Port 5000)   │ <────────────────── │   (Port 5001)    │
└─────────────────┘                      └──────────────────┘
        │                                         │
        │                                         │
        ▼                                         ▼
┌─────────────────┐                      ┌──────────────────┐
│    MongoDB      │                      │ Qualcomm AI Hub  │
│  (Kepatuhan)    │                      │  (Model Inference)│
└─────────────────┘                      └──────────────────┘
```

**Flow:**
1. MongoDB Change Stream detects new log
2. Node.js calls Flask service: `POST http://127.0.0.1:5001/predict`
3. Flask service prepares input features
4. Flask submits job to Qualcomm AI Hub
5. Qualcomm AI Hub returns prediction
6. Flask returns result to Node.js
7. Node.js saves to kepatuhan collection

---

## 🛠️ Installation Steps

### Step 1: Install Python Dependencies

```powershell
# Navigate to python-service directory
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server\python-service

# Run quick start script (automatic setup)
.\start.ps1
```

**Or manual setup:**

```powershell
# Create virtual environment
python -m venv venv

# Activate (PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure Qualcomm AI Hub

```bash
# Login to Qualcomm AI Hub
qai-hub configure

# When prompted, enter API token:
# bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d
```

**Verify configuration:**
```bash
# List your models
qai-hub list-models

# Check specific model
qai-hub get-model --model-id mq885klzq
```

### Step 3: Start Flask Service

**Option A: Quick Start (Recommended)**
```powershell
.\start.ps1
```

**Option B: Manual Start**
```powershell
# Activate venv first
.\venv\Scripts\Activate.ps1

# Run Flask app
python app.py
```

Server akan berjalan di: `http://127.0.0.1:5001`

### Step 4: Verify Flask Service

**Health Check:**
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://127.0.0.1:5001/health"
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Qualcomm AI Hub Compliance Service",
  "model_id": "mq885klzq",
  "qualcomm_configured": true,
  "qai_hub_installed": true
}
```

### Step 5: Test Predictions

**Run test suite:**
```powershell
python test_service.py
```

Expected output:
```
✅ Health Check...................... PASSED
✅ Compliant (On Time)............... PASSED
✅ Non-Compliant (Late).............. PASSED
✅ Non-Compliant (Rejected).......... PASSED

Total: 4 | Passed: 4 | Failed: 0
```

### Step 6: Start Node.js Backend

**In new terminal:**
```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server
npm run dev
```

Node.js will automatically connect to Flask service.

---

## 🧪 Testing the Integration

### Test 1: Direct Flask API Call

```powershell
$body = @{
    waktu_konsumsi_seharusnya = "2025-01-13T10:00:00.000Z"
    timestamp_konsumsi_aktual = "2025-01-13T10:05:00.000Z"
    aksi = "Terima"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5001/predict" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Test 2: Via Node.js API

```powershell
# Trigger manual compliance processing
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server
node manual-process-compliance.js
```

Watch for:
```
🤖 Calling Python Flask service...
✅ Qualcomm AI prediction: Patuh (confidence: 0.95)
📊 Method: qualcomm-ai
```

### Test 3: Real-time Monitoring

Insert a test log in MongoDB and watch real-time processing:

```javascript
// MongoDB Shell or Compass
db.logs.insertOne({
  patient: ObjectId("674eaa222222222222222222"),
  patient_id: ObjectId("674eaa222222222222222222"),
  aksi: "Terima",
  waktu_konsumsi_seharusnya: new Date("2025-01-13T10:00:00Z"),
  timestamp_konsumsi_aktual: new Date("2025-01-13T10:05:00Z"),
  timestamp: new Date()
})
```

Check Node.js console for:
```
📡 NEW LOG DETECTED
🤖 Calling Python service...
✅ Classified: Patuh (confidence: 0.95, method: qualcomm-ai)
💾 Saved to kepatuhan collection
```

---

## 📊 Model Information

### Model Details
- **Model ID**: `mq885klzq`
- **Type**: Binary Classification
- **Task**: Medication Compliance Prediction
- **Framework**: Qualcomm AI Hub

### Input Format
```python
# Features (shape: 1x2)
[
  delay_minutes,  # Float: difference in minutes
  action_flag     # Float: 1.0 = Terima, 0.0 = Tolak
]

# Example:
[[5.0, 1.0]]  # 5 min delay, accepted
```

### Output Format
```python
# Binary prediction (shape: 1x1)
[0.87]  # Confidence score

# Interpretation:
# > 0.5 = "Patuh" (Compliant)
# ≤ 0.5 = "Tidak Patuh" (Non-compliant)
```

---

## 🔧 Troubleshooting

### Issue 1: Flask service not starting

**Error:** `Address already in use: 127.0.0.1:5001`

**Solution:**
```powershell
# Find process using port 5001
netstat -ano | findstr :5001

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in config.py
FLASK_PORT = 5002
```

### Issue 2: `qai-hub` not configured

**Error:** `Qualcomm AI Hub not configured`

**Solution:**
```bash
qai-hub configure
# Enter API token when prompted
```

### Issue 3: Model not found

**Error:** `Model mq885klzq not found`

**Solution:**
1. Verify model exists:
   ```bash
   qai-hub list-models
   ```
2. Check model access:
   ```bash
   qai-hub get-model --model-id mq885klzq
   ```
3. Ensure API token has permission

### Issue 4: Python service unreachable from Node.js

**Error in Node.js:** `ECONNREFUSED 127.0.0.1:5001`

**Solution:**
1. Check Flask is running:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:5001/health"
   ```
2. Verify firewall allows localhost connection
3. Check `.env` has correct URL:
   ```
   PYTHON_SERVICE_URL=http://127.0.0.1:5001
   ```

### Issue 5: Predictions always use fallback

**Symptoms:**
```
⚠️ Python service unavailable, using fallback
method: "fallback"
```

**Solution:**
1. Check Flask logs for errors
2. Verify `qai-hub` configuration:
   ```bash
   qai-hub configure --check
   ```
3. Test model inference:
   ```bash
   qai-hub submit-inference-job --model-id mq885klzq --input test_input.npy
   ```

---

## 📈 Performance Optimization

### 1. Use Async Processing

For high-volume scenarios, implement async job queue:

```python
# Install Celery
pip install celery redis

# Use Celery for async predictions
from celery import Celery

celery = Celery('tasks', broker='redis://localhost:6379')

@celery.task
def predict_async(data):
    return qualcomm_predict(data)
```

### 2. Add Caching

Cache predictions for repeated inputs:

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_predict(input_hash):
    return qualcomm_predict(input_data)
```

### 3. Batch Processing

Process multiple logs at once:

```bash
POST http://127.0.0.1:5001/batch-predict
```

### 4. Production Deployment

Use Gunicorn for production:

```bash
# Install
pip install gunicorn

# Run with workers
gunicorn -w 4 -b 127.0.0.1:5001 app:app
```

---

## 📝 Environment Variables

### Python Service (`.env`)
```env
QUALCOMM_MODEL_ID=mq885klzq
QUALCOMM_API_KEY=bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d
PYTHON_SERVICE_PORT=5001
PYTHON_SERVICE_HOST=127.0.0.1
```

### Node.js Service (`server/.env`)
```env
PYTHON_SERVICE_URL=http://127.0.0.1:5001
USE_PYTHON_SERVICE=true
QUALCOMM_MODEL_ID=mq885klzq
QUALCOMM_API_KEY=bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d
```

---

## 🎯 Success Checklist

- [ ] Python 3.8+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Qualcomm AI Hub configured (`qai-hub configure`)
- [ ] Model accessible (`qai-hub get-model --model-id mq885klzq`)
- [ ] Flask service running (port 5001)
- [ ] Health check passes (`/health` returns 200)
- [ ] Test predictions successful (`python test_service.py`)
- [ ] Node.js can reach Flask (`qualcommAIService.js`)
- [ ] Real-time monitoring active
- [ ] Kepatuhan collection receiving predictions

---

## 📚 Additional Resources

- [Qualcomm AI Hub Docs](https://aihub.qualcomm.com/docs)
- [qai-hub GitHub](https://github.com/quic/ai-hub-models)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

**Status**: Ready for deployment! 🚀
