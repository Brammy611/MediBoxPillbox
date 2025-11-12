# ⚡ Quick Start - Qualcomm AI Hub Integration

## 🚀 Start Services (2 Steps)

### 1️⃣ Start Flask Python Service (Terminal 1)

```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server\python-service
.\start.ps1
```

**Wait for:**
```
✅ Successfully configured Qualcomm AI Hub
🚀 Flask server starting on http://127.0.0.1:5001
```

### 2️⃣ Start Node.js Backend (Terminal 2)

```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server
npm run dev
```

**Wait for:**
```
✅ [Compliance Monitor] Real-time monitoring active!
MongoDB Connected...
```

## ✅ Verify Integration

**Test Python service:**
```powershell
Invoke-RestMethod "http://127.0.0.1:5001/health"
```

**Test end-to-end:**
```powershell
cd server
node manual-process-compliance.js
```

**Expected output:**
```
🤖 Calling Python Flask service...
✅ [1/240] Log xxx: Patuh (confidence: 0.95)
📊 Method: qualcomm-ai  # ← Should see this!
```

## 📦 Files Created

```
server/python-service/
├── app.py                  # Flask application
├── config.py               # Configuration
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── README.md               # Detailed documentation
├── start.ps1              # Quick start script
└── test_service.py        # Test suite
```

## 🔑 Key Configuration

**Model ID:** `mq885klzq`  
**API Key:** `bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d`  
**Flask Port:** `5001`  
**Node.js Port:** `5000`

## 🎯 What's Next?

1. **First time setup:** Run `qai-hub configure` (done by start.ps1)
2. **Test predictions:** Run `python test_service.py`
3. **Monitor logs:** Watch both terminal outputs
4. **Check database:** Query `kepatuhan` collection for `method: "qualcomm-ai"`

## 🐛 Quick Fixes

**Flask won't start?**
```powershell
# Kill any process on port 5001
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

**Qualcomm not configured?**
```bash
qai-hub configure
# Enter: bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d
```

**Still using fallback?**
- Check Flask logs for errors
- Verify model exists: `qai-hub list-models`
- Test connection: `Invoke-RestMethod "http://127.0.0.1:5001/health"`

---

**📖 Full Documentation:** See `QUALCOMM_SETUP_GUIDE.md`
