const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// 📁 Папка с публичными файлами
const publicDir = path.join(__dirname, 'public');

// Раздача статики
app.use(express.static(publicDir));

// PWA
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(publicDir, 'manifest.json'));
});
app.get('/sw.js', (req, res) => {
  res.sendFile(path.join(publicDir, 'sw.js'));
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'PIB PWA', timestamp: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
  const requestPath = req.path;

  // Проверка основных страниц
  const pages = ['index.html', 'main.html', 'auth.html', 'map.html', 'chat.html', 'profile.html'];
  for (const page of pages) {
    if (requestPath.includes(page.replace('.html', ''))) {
      return res.sendFile(path.join(publicDir, page));
    }
  }

  // Проверка существующих файлов
  const filePath = path.join(publicDir, requestPath);
  if (fs.existsSync(filePath) && !requestPath.includes('..')) {
    return res.sendFile(filePath);
  }

  // fallback на index.html
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PIB PWA Server running on port ${PORT}`);
});
