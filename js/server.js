const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, 'public');

// Раздача статических файлов
app.use(express.static(publicDir));

// PWA файлы
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(publicDir, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(publicDir, 'sw.js'));
});

// API для проверки
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'PIB PWA', timestamp: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
  let fileToServe = 'index.html';

  if (req.path === '/auth' || req.path === '/auth.html') {
    fileToServe = 'auth.html';
  } else if (req.path === '/main' || req.path === '/main.html') {
    fileToServe = 'main.html';
  } else if (req.path === '/map' || req.path === '/map.html') {
    fileToServe = 'map.html';
  } else {
    const filePath = path.join(publicDir, req.path);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }

  res.sendFile(path.join(publicDir, fileToServe));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PIB PWA Server running on port ${PORT}`);
  console.log(`📱 Local: http://localhost:${PORT}`);
});
