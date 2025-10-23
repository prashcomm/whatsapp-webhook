// OnRender WhatsApp Webhook Forwarder v2
// Forwards Prowtext webhooks to Emergent backend
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'smbhav_webhook_verify_2025';
const BACKEND_URL = process.env.BACKEND_URL || 'https://smbhav-chatbot.emergent.host/api/whatsapp/webhook';

console.log('='.repeat(80));
console.log('WhatsApp Webhook Forwarder v2 Starting...');
console.log('='.repeat(80));
console.log(`Port: ${PORT}`);
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Verify Token: ${VERIFY_TOKEN}`);
console.log('='.repeat(80));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    backend: BACKEND_URL,
    verifyToken: VERIFY_TOKEN
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Webhook forwarder is working!',
    timestamp: new Date().toISOString(),
    queryParams: req.query,
    headers: req.headers
  });
});

// Webhook verification (GET)
app.get('/', (req, res) => {
  // Try both query params formats
  const mode = req.query['hub.mode'] || req.query.mode;
  const token = req.query['hub.verify_token'] || req.query.verify_token || req.query.token;
  const challenge = req.query['hub.challenge'] || req.query.challenge;

  console.log('\n' + '='.repeat(80));
  console.log('📋 WEBHOOK VERIFICATION/HEALTH CHECK (GET)');
  console.log('='.repeat(80));
  console.log(`Query params:`, JSON.stringify(req.query, null, 2));
  console.log(`User-Agent: ${req.headers['user-agent']}`);
  console.log(`Mode: ${mode}`);
  console.log(`Token received: ${token}`);
  console.log(`Expected token: ${VERIFY_TOKEN}`);
  console.log(`Challenge: ${challenge}`);

  // If no query params at all, this might be a health check from Prowtext
  if (Object.keys(req.query).length === 0) {
    console.log('ℹ️  No query params - treating as health check');
    console.log('='.repeat(80) + '\n');
    return res.status(200).json({ 
      status: 'ready',
      message: 'Webhook endpoint is ready',
      backend: BACKEND_URL
    });
  }

  // Proper verification
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ VERIFICATION SUCCESSFUL');
    console.log('='.repeat(80) + '\n');
    res.status(200).send(challenge);
  } else {
    console.log('❌ VERIFICATION FAILED - Token mismatch or missing params');
    console.log('='.repeat(80) + '\n');
    res.status(403).send('Forbidden');
  }
});

// Webhook handler (POST)
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString();
  
  console.log('\n' + '='.repeat(80));
  console.log(`📨 WEBHOOK RECEIVED at ${timestamp}`);
  console.log('='.repeat(80));
  
  // Log the full webhook payload
  console.log('Webhook Payload:');
  console.log(JSON.stringify(req.body, null, 2));
  
  // Extract key information
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const metadata = value?.metadata;
    const messages = value?.messages;
    
    if (metadata) {
      console.log('\n📱 Metadata:');
      console.log(`  Display Phone: ${metadata.display_phone_number}`);
      console.log(`  Phone Number ID: ${metadata.phone_number_id}`);
    }
    
    if (messages && messages.length > 0) {
      console.log('\n💬 Messages:');
      messages.forEach((msg, idx) => {
        console.log(`  [${idx + 1}] From: ${msg.from}`);
        console.log(`      Type: ${msg.type}`);
        console.log(`      Text: ${msg.text?.body || 'N/A'}`);
        console.log(`      ID: ${msg.id}`);
      });
    }
  } catch (e) {
    console.log('⚠️  Could not parse webhook details:', e.message);
  }
  
  // Always respond 200 to webhook source immediately
  console.log('\n✅ Responding 200 OK to webhook source');
  res.status(200).json({ status: 'received' });
  
  // Forward to backend asynchronously
  console.log('\n🔄 Forwarding to backend...');
  console.log(`   Backend URL: ${BACKEND_URL}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OnRender-Forwarder/2.0'
      },
      body: JSON.stringify(req.body),
      timeout: 30000 // 30 second timeout
    });
    
    const duration = Date.now() - startTime;
    const responseText = await response.text();
    
    console.log('\n📬 Backend Response:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Body: ${responseText}`);
    
    if (response.ok) {
      console.log('✅ Message forwarded successfully to backend');
    } else {
      console.error('❌ Backend returned error');
    }
    
  } catch (error) {
    console.error('\n❌ Error forwarding to backend:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  }
  
  console.log('='.repeat(80) + '\n');
});

// Handle HEAD requests
app.head('/', (req, res) => {
  console.log('HEAD request received');
  res.status(200).end();
});

// 404 handler
app.use((req, res) => {
  console.log(`⚠️  404 - Not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 WhatsApp Webhook Forwarder v2 is RUNNING');
  console.log('='.repeat(80));
  console.log(`Listening on port: ${PORT}`);
  console.log(`Webhook endpoint: /`);
  console.log(`Health check: /health`);
  console.log(`Forwarding to: ${BACKEND_URL}`);
  console.log('='.repeat(80) + '\n');
});
