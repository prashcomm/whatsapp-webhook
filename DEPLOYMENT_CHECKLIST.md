# OnRender Webhook Forwarder v2 - Deployment Checklist

## 📋 Step-by-Step Deployment

### ✅ Step 1: Deploy to OnRender

1. Go to your OnRender dashboard: https://dashboard.render.com/
2. Find your webhook service: `whatsapp-webhook-80q8`
3. Update the code with new files:
   - Replace `app.js` with the new version
   - Replace `package.json` with the new version
   - Add `README.md` and `DEPLOYMENT_CHECKLIST.md` (optional)
4. Save and deploy

**OR** if using Git:
```bash
git add app.js package.json README.md
git commit -m "Update webhook forwarder to v2"
git push
```
OnRender will auto-deploy.

### ✅ Step 2: Verify Deployment

Wait 2-3 minutes for deployment, then test:

**Test 1: Health Check**
```bash
curl https://whatsapp-webhook-80q8.onrender.com/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T...",
  "backend": "https://smbhav-chatbot.emergent.host/api/webhook/whatsapp"
}
```

**Test 2: Webhook Verification**
```bash
curl "https://whatsapp-webhook-80q8.onrender.com/?hub.mode=subscribe&hub.verify_token=smbhav_webhook_verify_2025&hub.challenge=test123"
```
Expected response: `test123`

### ✅ Step 3: Configure Prowtext Webhook

**CRITICAL:** Make sure this is set in **Prowtext dashboard**, NOT Meta Business Manager!

1. Go to Prowtext dashboard (pinbot.ai)
2. Navigate to Webhook settings
3. Set webhook URL to:
   ```
   https://whatsapp-webhook-80q8.onrender.com/
   ```
4. Set verify token to:
   ```
   smbhav_webhook_verify_2025
   ```
5. **Important:** Make sure this is configured for Phone Number ID: `898590410001158`
6. Save configuration

### ✅ Step 4: Test End-to-End Flow

**Send a WhatsApp message to: +91 98189 50601**

Test message: "Hello, when is Amazon Smbhav?"

**Expected flow:**
1. You send message to Prowtext number
2. Prowtext webhook calls OnRender
3. OnRender logs show "📨 WEBHOOK RECEIVED"
4. OnRender forwards to Emergent backend
5. Backend processes with AI
6. Backend sends response via Prowtext API
7. **You receive reply on the SAME Prowtext number (+91 98189 50601)** ✅

### ✅ Step 5: Check Logs

**OnRender Logs:**
Go to OnRender dashboard → Your service → Logs

You should see:
```
📨 WEBHOOK RECEIVED at 2025-10-22T...
Webhook Payload:
{
  "entry": [...]
}

📱 Metadata:
  Display Phone: 15556358217
  Phone Number ID: 844226535431886

💬 Messages:
  [1] From: 919810086483
      Type: text
      Text: Hello, when is Amazon Smbhav?
      ID: wamid...

✅ Responding 200 OK to webhook source

🔄 Forwarding to backend...
   Backend URL: https://smbhav-chatbot.emergent.host/api/webhook/whatsapp

📬 Backend Response:
   Status: 200
   Duration: 95ms
   Body: {"status":"ok","received":1}

✅ Message forwarded successfully to backend
```

**Emergent Backend Logs:**
Check your backend logs to see processing.

## 🔍 Troubleshooting

### Issue: Health check fails
**Problem:** OnRender app not running
**Fix:** Check OnRender deployment logs for errors

### Issue: Webhook verification fails
**Problem:** Token mismatch
**Fix:** Ensure verify token is `smbhav_webhook_verify_2025` in both OnRender and Prowtext

### Issue: No webhooks received
**Problem:** Webhook URL not configured in Prowtext
**Fix:** 
1. Double-check Prowtext dashboard has correct URL
2. Make sure it's configured for the RIGHT phone number (898590410001158)
3. **CRITICAL:** Webhook should be in Prowtext dashboard, NOT Meta Business Manager

### Issue: Webhooks received but backend times out
**This is OK!** OnRender responds 200 immediately to Prowtext, then forwards to backend. Even if backend takes time, Prowtext gets confirmation.

### Issue: Still receiving replies on Meta test number
**Problem:** Webhook might still be configured in Meta Business Manager
**Fix:**
1. Go to Meta Business Manager: https://business.facebook.com/
2. Find WhatsApp settings
3. **Remove or disable** any webhook configuration there
4. **Only use** Prowtext dashboard for webhook configuration

## 🎯 Expected Behavior After Deployment

✅ Send message to +91 98189 50601
✅ Prowtext calls OnRender webhook
✅ OnRender responds 200 immediately
✅ OnRender forwards to Emergent backend
✅ Backend processes with AI
✅ Backend sends via Prowtext API
✅ **Reply comes from +91 98189 50601** (same number)

## 📞 Key Point

**The critical difference:**
- **Before:** Webhook might be configured in Meta → replies from Meta test number
- **After:** Webhook configured in Prowtext → replies from Prowtext number

Make absolutely sure the webhook URL `https://whatsapp-webhook-80q8.onrender.com/` is configured in **Prowtext dashboard** for Phone Number ID `898590410001158`.

## ✅ Success Criteria

1. Health endpoint returns `{"status":"healthy"}`
2. OnRender logs show webhook activity
3. Backend logs show message processing
4. **Most important:** Replies come from +91 98189 50601, NOT +1 (555) 635-8217

If all 4 criteria are met, the integration is working correctly! 🎉
