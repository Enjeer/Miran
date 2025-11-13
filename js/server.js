const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для статических файлов
app.use(express.static(__dirname));

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
  res.json({ status: 'OK', service: 'PIB PWA' });
});

// SPA routing - все остальные пути ведут на index.html
app.get('*', (req, res) => {
  // Определяем какой HTML файл отдавать
  const requestPath = req.path;
  
  if (requestPath === '/' || requestPath === '/index.html') {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else if (requestPath === '/auth' || requestPath === '/auth.html') {
    res.sendFile(path.join(__dirname, 'auth.html'));
  } else if (requestPath === '/main' || requestPath === '/main.html') {
    res.sendFile(path.join(__dirname, 'main.html'));
  } else if (requestPath === '/map' || requestPath === '/map.html') {
    res.sendFile(path.join(__dirname, 'map.html'));
  } else {
    // Для любых других путей пробуем найти файл, иначе 404
    const filePath = path.join(__dirname, requestPath);
    if (require('fs').existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Page not found');
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 PIB PWA Server running on port ${PORT}`);
  console.log(`📱 PWA available at: http://localhost:${PORT}`);
});