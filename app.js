// Import Express.js and fetch
const express = require('express');
const fetch = require('node-fetch');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN || 'smbhav_webhook_verify_2025';
const aiSystemUrl = 'https://smbhav-chatbot.emergent.host/api/webhook/whatsapp';

// Route for GET requests (webhook verification)
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests (incoming messages)
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  // Forward to AI system
  try {
    console.log('Forwarding to AI system...');
    const response = await fetch(aiSystemUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': req.headers['x-hub-signature-256'] || ''
      },
      body: JSON.stringify(req.body)
    });

    console.log('AI System Response Status:', response.status);
    
    if (response.ok) {
      console.log('Message forwarded successfully to AI system');
    } else {
      console.error('AI System Error:', response.statusText);
    }

  } catch (error) {
    console.error('Error forwarding to AI system:', error.message);
  }

  // Always respond 200 to Meta
  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nWhatsApp Webhook Proxy listening on port ${port}\n`);
  console.log(`Forwarding to: ${aiSystemUrl}\n`);
});
