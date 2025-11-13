const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Special handling for PWA files
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'sw.js'));
});

// API routes для будущего функционала
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'PIB PWA', timestamp: new Date().toISOString() });
});

// SPA routing - все остальные пути ведут на index.html
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
  } else if (requestPath !== '/' && requestPath !== '/index.html') {
    // Проверяем существует ли запрашиваемый файл
    const filePath = path.join(__dirname, requestPath);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  
  res.sendFile(path.join(__dirname, fileToServe));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PIB PWA Server running on port ${PORT}`);
  console.log(`📱 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
});