const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// 📁 Папка с публичными файлами (корень проекта)
const publicDir = path.join(__dirname, '..');

// Раздача статики (css, js, media и т.д.)
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

// SPA fallback: отдаём соответствующие HTML или index.html
app.get('*', (req, res) => {
  const requestPath = req.path;

  // Определяем какой файл отдавать
  let fileToServe = 'index.html';

  if (requestPath === '/auth' || requestPath === '/auth.html') {
    fileToServe = 'auth.html';
  } else if (requestPath === '/main' || requestPath === '/main.html') {
    fileToServe = 'main.html';
  } else if (requestPath === '/map' || requestPath === '/map.html') {
    fileToServe = 'map.html';
  } else {
    // Проверяем, существует ли физический файл в публичной папке
    const filePath = path.join(publicDir, requestPath);
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
