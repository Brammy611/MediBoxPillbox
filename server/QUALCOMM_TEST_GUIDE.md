# 🧪 QUALCOMM AI INFERENCE TEST GUIDE

## Prerequisites
Make sure both services are running:

### 1. Start Flask Service (Terminal 1)
```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server\python-service
.\venv\Scripts\Activate.ps1
python app.py
```

Wait for: `* Running on http://127.0.0.1:5001`

### 2. Run the Inference Test (Terminal 2)
```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server
node test-qualcomm-inference.js
```

## What to Expect

### Timeline:
1. **0-5 seconds:** Test log created and sent to Flask
2. **5-60 seconds:** Flask sends request to Qualcomm AI Hub
3. **30-300 seconds:** Qualcomm AI Hub processes inference (queue dependent)
4. **Result returned:** Kepatuhan classification saved to database

### During the Test:
1. **Watch the terminal** - You'll see "⏳ This may take several minutes..."
2. **Open your Qualcomm AI Hub Dashboard** - https://app.aihub.qualcomm.com/jobs
3. **Look for new job** with Model ID: `mq885klzq`
4. **Monitor job status** in the dashboard while waiting

### Success Indicators:
✅ Terminal shows: "🎉 SUCCESS! USING QUALCOMM AI MODEL!"
✅ Dashboard shows: Job status changes from "QUEUED" → "RUNNING" → "COMPLETED"
✅ Method field: "qualcomm-ai" (not "fallback")
✅ Job ID displayed in terminal

### If Using Fallback:
⚠️ Terminal shows: "FALLBACK METHOD USED"
- Check Flask terminal for errors
- Verify Qualcomm AI Hub API key is correct
- Check if model `mq885klzq` is accessible

## Timeout Settings:
- **Node.js → Flask:** 10 minutes (600 seconds)
- **Flask → Qualcomm AI Hub:** Waits indefinitely with `job.wait()`

## Troubleshooting:

### Flask Not Running:
```
❌ Error: ECONNREFUSED
Solution: Start Flask service (see step 1 above)
```

### Timeout After 10 Minutes:
```
❌ TIMEOUT: Inference took longer than 10 minutes
Reason: Qualcomm AI Hub queue is very busy
Action: Check dashboard for job status - it may still complete
```

### Model Access Error:
```
❌ Model mq885klzq not found
Solution: Verify model ID and API key in .env
```

## Quick Verification:
Before running the test, verify services:

```powershell
# Check Flask
Invoke-RestMethod "http://127.0.0.1:5001/health"

# Should return:
# {
#   "status": "healthy",
#   "model_id": "mq885klzq",
#   "qualcomm_configured": true
# }
```

## Dashboard Monitoring:
While test is running:
1. Go to: https://app.aihub.qualcomm.com/jobs
2. You should see a new job appear with:
   - Model: DeepSleep_Model (mq885klzq)
   - Status: QUEUED → RUNNING → COMPLETED
   - Input: Your test data
   - Output: Compliance classification

## Expected Output:
```
🧪 QUALCOMM AI INFERENCE TEST - WITH 10 MINUTE TIMEOUT
✅ Connected to MongoDB
✅ Using patient: [ObjectId]
✅ Test log created: [ObjectId]

🤖 CALLING QUALCOMM AI HUB...
⏳ This may take several minutes (up to 10 minutes timeout)
👀 WATCH YOUR DASHBOARD: https://app.aihub.qualcomm.com/jobs

[... waiting ...]

✅ INFERENCE COMPLETE!
⏱️  Duration: 45.23 seconds

📊 RESULT:
   Kepatuhan:   Tidak Patuh
   Confidence:  0.5
   Method:      qualcomm-ai  ← SUCCESS!
   Delay:       12 minutes
   Job ID:      jp8z8rjxp

🔗 View job: https://app.aihub.qualcomm.com/jobs/jp8z8rjxp

🎉 SUCCESS! USING QUALCOMM AI MODEL!
```

## Ready to Test?
Run: `node test-qualcomm-inference.js`
