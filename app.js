const express = require('express');
const fetch = require('node-fetch'); // You may need to install: npm install node-fetch
const app = express();

// Middleware
app.use(express.json());

// Configuration
const VERIFY_TOKEN = \"smbhav_webhook_verify_2025\";
const AI_SYSTEM_URL = \"https://event-ai-helper.preview.emergentagent.com/api/webhook/whatsapp\";

// GET route for webhook verification
app.get('/webhook', (req, res) => {
  console.log('Webhook verification request received');
  console.log('Query params:', req.query);

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      console.log('Verification failed - token mismatch');
      res.sendStatus(403);
    }
  } else {
    console.log('Verification failed - missing parameters');
    res.sendStatus(400);
  }
});

// POST route for incoming messages - forward to AI system
app.post('/webhook', async (req, res) => {
  console.log('Incoming WhatsApp message received');
  console.log('Payload:', JSON.stringify(req.body, null, 2));

  try {
    // Forward the webhook payload to our AI system
    const response = await fetch(AI_SYSTEM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any relevant headers
        'X-Hub-Signature-256': req.headers['x-hub-signature-256'] || '',
        'User-Agent': 'WhatsApp-Webhook-Proxy'
      },
      body: JSON.stringify(req.body)
    });

    console.log('AI System Response Status:', response.status);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log('AI System Response:', responseData);
      
      // Return success to Meta
      res.status(200).json({ status: 'forwarded_successfully' });
    } else {
      console.error('AI System Error:', response.statusText);
      // Still return 200 to Meta to acknowledge receipt
      res.status(200).json({ status: 'received_but_processing_failed' });
    }

  } catch (error) {
    console.error('Error forwarding to AI system:', error);
    
    // Always return 200 to Meta to acknowledge we received the webhook
    // This prevents Meta from retrying and flooding our logs
    res.status(200).json({ status: 'received_but_error_occurred' });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'WhatsApp Webhook Proxy Active',
    target: AI_SYSTEM_URL,
    verify_token_configured: !!VERIFY_TOKEN
  });
});

// Health check specifically for render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`WhatsApp Webhook Proxy listening on port ${port}`);
  console.log(`Forwarding to: ${AI_SYSTEM_URL}`);
  console.log(`Verify token configured: ${VERIFY_TOKEN ? 'Yes' : 'No'}`);
});

module.exports = app;"
