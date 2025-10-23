# WhatsApp Webhook Forwarder v2 for OnRender

This is an improved webhook forwarder that receives webhooks from Prowtext and forwards them to your Emergent backend.

## Improvements in v2

✅ **Better logging** - See exactly what webhooks are received
✅ **Immediate 200 response** - Responds instantly to Prowtext
✅ **Async forwarding** - Forwards to backend without blocking
✅ **Detailed diagnostics** - Logs phone numbers, message IDs, metadata
✅ **Health check endpoint** - `/health` for monitoring
✅ **Error handling** - Proper error catching and logging

## Deployment to OnRender

### Step 1: Copy Files

Copy these files to your OnRender project:
- `app.js`
- `package.json`
- `README.md`

### Step 2: Environment Variables (Optional)

In OnRender dashboard, set these environment variables:
- `BACKEND_URL` = `https://smbhav-chatbot.emergent.host/api/webhook/whatsapp`
- `VERIFY_TOKEN` = `smbhav_webhook_verify_2025`
- `PORT` = (leave blank, OnRender sets this automatically)

**Note:** These have defaults, so you don't need to set them unless you want to change them.

### Step 3: Deploy

Push to your OnRender repo or use OnRender's auto-deploy. The app will start automatically.

### Step 4: Configure Prowtext Webhook

In your Prowtext dashboard, set the webhook URL to:
```
https://whatsapp-webhook-80q8.onrender.com/
```

**IMPORTANT:** Make sure you're setting this in **Prowtext dashboard**, NOT in Meta/Facebook Business Manager!

## Testing

### Test Webhook Verification
```bash
curl "https://whatsapp-webhook-80q8.onrender.com/?hub.mode=subscribe&hub.verify_token=smbhav_webhook_verify_2025&hub.challenge=test123"
```
Expected: `test123`

### Test Health Check
```bash
curl https://whatsapp-webhook-80q8.onrender.com/health
```
Expected: `{"status":"healthy",...}`

## Logs

In OnRender dashboard, check the logs. You should see:
- `📋 WEBHOOK VERIFICATION REQUEST` when Meta/Prowtext verifies
- `📨 WEBHOOK RECEIVED` when messages arrive
- `🔄 Forwarding to backend...` when forwarding
- `✅ Message forwarded successfully` when complete

## Key Features

### 1. Immediate Response
Returns 200 OK to Prowtext immediately (within milliseconds) to prevent timeouts.

### 2. Async Backend Call
Forwards to backend in the background after responding to Prowtext.

### 3. Detailed Logging
Logs show:
- Full webhook payload
- Phone number ID from metadata
- Message details (sender, text, ID)
- Backend response status
- Timing information

### 4. Error Handling
Catches and logs all errors without crashing.

## Troubleshooting

### Issue: Verification fails
**Check:** Verify token matches in both OnRender env vars and Prowtext dashboard

### Issue: No webhooks received
**Check:** 
1. Is webhook URL correct in Prowtext dashboard?
2. Check OnRender logs - any errors?
3. Try health check endpoint to confirm app is running

### Issue: Backend not receiving messages
**Check OnRender logs:**
- Do you see "📨 WEBHOOK RECEIVED"?
- Do you see "🔄 Forwarding to backend..."?
- What's the backend response status?

### Issue: Messages arrive but backend times out
**This is OK!** The forwarder responds 200 to Prowtext immediately, then forwards to backend. If backend takes time, Prowtext still gets 200 OK.

## Architecture

```
Prowtext/Meta
    ↓
OnRender Forwarder (this app)
    ↓ (returns 200 immediately)
    ↓ (then forwards asynchronously)
    ↓
Emergent Backend
    ↓
Process with AI
    ↓
Send response via Prowtext API
    ↓
User receives message
```

## Important Notes

1. **Don't set webhook in Meta Business Manager** - Use Prowtext dashboard only
2. **This URL should be in Prowtext, not Meta:** `https://whatsapp-webhook-80q8.onrender.com/`
3. **Backend URL is hardcoded** but can be overridden with env var
4. **Logs are your friend** - Check OnRender logs to diagnose issues

## Contact

If issues persist after deployment, check:
1. OnRender logs (shows webhook activity)
2. Emergent backend logs (shows processing)
3. Prowtext dashboard (webhook configuration)
