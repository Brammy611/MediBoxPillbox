# Gemini API Error: "fetch failed" - Troubleshooting Guide

## Error Details
```
[Gemini API Error] TypeError: fetch failed
```

## Common Causes & Solutions

### 1. 🌐 Network/Firewall Issues (Most Common)

#### A. Proxy/VPN Blocking
If you're behind a corporate proxy or VPN:

```bash
# Windows - Set proxy environment variables
set HTTPS_PROXY=http://your-proxy:port
set HTTP_PROXY=http://your-proxy:port

# Or add to .env file:
HTTPS_PROXY=http://your-proxy:port
HTTP_PROXY=http://your-proxy:port
```

#### B. Firewall Blocking
- Windows Defender or antivirus may be blocking outbound connections
- Check Windows Firewall settings
- Temporarily disable to test (then re-enable)

#### C. VPN Issues
- Try disconnecting VPN temporarily
- Some VPNs block Google APIs

### 2. 🔑 API Key Issues

#### Check API Key Validity
```bash
# Test API key directly
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY"
```

#### Get New API Key
1. Go to https://aistudio.google.com/apikey
2. Create new API key
3. Update `.env` file

### 3. 🌍 DNS Resolution Issues

#### Test DNS
```bash
# Windows
nslookup generativelanguage.googleapis.com

# If fails, try changing DNS to Google DNS:
# 8.8.8.8 and 8.8.4.4
```

### 4. 🚀 Quick Fixes to Try (In Order)

#### Fix 1: Update Node.js fetch (Add fetch polyfill)
```bash
npm install node-fetch
```

Then update `geminiChatController.js`:
```javascript
// Add at top of file
const fetch = require('node-fetch');
global.fetch = fetch;
```

#### Fix 2: Use axios instead of built-in fetch
Create a custom fetch wrapper with better error handling.

#### Fix 3: Add timeout and retry logic
The SDK might be timing out - add retry mechanism.

#### Fix 4: Check Node.js version
```bash
node --version
# Gemini SDK requires Node.js 18+
# Update if needed
```

### 5. 🔧 Immediate Solution (Apply Now)

Update the Gemini controller to handle network errors better and add retry logic.

## Testing Commands

```bash
# Test 1: Check if Google APIs are reachable
ping generativelanguage.googleapis.com

# Test 2: Test with curl
curl https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY

# Test 3: Run our test script
node test-chatbot-endpoint.js
```

## Environment Check

Make sure your `.env` has:
```
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.0-flash
```

## Still Not Working?

1. Check if you're in China or a restricted region (Gemini API may be blocked)
2. Try using a different network (mobile hotspot)
3. Contact your network admin about allowing googleapis.com
4. Use a VPN that doesn't block Google services
