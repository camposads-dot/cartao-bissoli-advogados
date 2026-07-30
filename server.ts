import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// SERVER-SIDE PERSISTENT STORE (Shared between Mobile, Desktop and all Clients)
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'server_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoreItem {
  value: any;
  updatedAt: number;
}

let memoryStore: Record<string, StoreItem> = {};

// Load existing store from disk on boot
if (fs.existsSync(STORE_FILE)) {
  try {
    const content = fs.readFileSync(STORE_FILE, 'utf-8');
    memoryStore = JSON.parse(content);
  } catch (err) {
    console.error('Error loading server store file:', err);
    memoryStore = {};
  }
}

function saveStoreToDisk() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server store file:', err);
  }
}

// Active Server-Sent Events (SSE) clients for instant real-time sync
const sseClients: Set<express.Response> = new Set();

// 1. SSE REAL-TIME SYNC STREAM
app.get('/api/sync/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

function broadcastChange(key: string, value: any, updatedAt: number) {
  const payload = JSON.stringify({ key, value, updatedAt });
  for (const clientResponse of sseClients) {
    try {
      clientResponse.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(clientResponse);
    }
  }
}

// 2. GET ALL STORED DATA (PULL)
app.get('/api/sync/pull', (req, res) => {
  res.json({
    status: 'ok',
    store: memoryStore,
    serverTime: Date.now(),
  });
});

// 3. PUSH UPDATED DATA (PUSH)
app.post('/api/sync/push', (req, res) => {
  const { key, value, updatedAt } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'Missing key' });
  }

  const newTime = updatedAt || Date.now();
  const current = memoryStore[key];

  // Update memory store if new or newer
  if (!current || newTime >= current.updatedAt) {
    memoryStore[key] = {
      value,
      updatedAt: newTime,
    };
    saveStoreToDisk();
    broadcastChange(key, value, newTime);
  }

  res.json({ status: 'ok', updatedAt: memoryStore[key].updatedAt });
});

// 4. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', sseClients: sseClients.size });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Central Sync Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
