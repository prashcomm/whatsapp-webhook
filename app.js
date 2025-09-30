const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

const VERIFY_TOKEN = "smbhav_webhook_verify_2025";
const AI_SYSTEM_URL = "https://event-ai-helper.preview.emergentagent.com/api/webhook/whatsapp";

app.get('/webhook', (req, res) => {
  console.log('Webhook verification request received');
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      console.log('Verification failed');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

app.post('/webhook', async (req, res) => {
  console.log('Incoming WhatsApp message received');
  console.log('Payload:', JSON.stringify(req.body, null, 2));

  try {
    const response = await fetch(AI_SYSTEM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': req.headers['x-hub-signature-256'] || ''
      },
      body: JSON.stringify(req.body)
    });

    console.log('AI System Response Status:', response.status);
    
    if (response.ok) {
      console.log('Message forwarded successfully');
    } else {
      console.error('AI System Error:', response.statusText);
    }

    res.status(200).json({ status: 'received' });

  } catch (error) {
    console.error('Error forwarding to AI system:', error);
    res.status(200).json({ status: 'error' });
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'WhatsApp Webhook Proxy Active',
    target: AI_SYSTEM_URL
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('WhatsApp Webhook Proxy listening on port', port);
});

module.exports = app;
