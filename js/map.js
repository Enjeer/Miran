class CustomMap {
    constructor(containerId = 'map-container') {
        this.containerId = containerId;
        this.container = null;
        this.mapImage = null;
        this.markers = [];
        this.userMarker = null;
        
        // Географические координаты углов карты
        this.config = {
            // Левый верхний угол карты в географических координатах
            northWest: { lat: 53.902387, lng: 27.976511 },
            // Правый нижний угол карты в географических координатах  
            southEast: { lat: 53.901266, lng: 27.977455 },
            // Размеры карты в пикселях
            width: 800,
            height: 600
        };
        
        this.init();
    }

    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error('Map container not found:', this.containerId);
            return;
        }

        this.render();
        this.setupEventListeners();
        this.startGeolocationTracking();
        this.loadMarkers();
    }

    render() {
        this.container.innerHTML = `
            <div class="custom-map">
                <div class="map-header">
                    <h3>Карта объекта</h3>
                    <div class="map-controls">
                        <button class="btn-control" id="zoom-in">+</button>
                        <button class="btn-control" id="zoom-out">-</button>
                        <button class="btn-control" id="locate-user">📍</button>
                        <button class="btn-control" id="add-marker">📌</button>
                    </div>
                </div>
                <div class="map-wrapper">
                    <div class="map-image-container">
                        <img src="/media/images/map-background.jpg" alt="Карта" class="map-image" id="map-image">
                        <div class="markers-container" id="markers-container"></div>
                    </div>
                </div>
                <div class="map-status" id="map-status">
                    Загрузка карты...
                </div>
            </div>
        `;

        this.mapImage = document.getElementById('map-image');
        this.setupMapImage();
    }

    setupMapImage() {
        this.mapImage.onload = () => {
            this.updateStatus('Карта загружена');
            this.config.width = this.mapImage.offsetWidth;
            this.config.height = this.mapImage.offsetHeight;
            this.renderMarkers(); // Перерисовываем метки после загрузки карты
        };

        this.mapImage.onerror = () => {
            this.updateStatus('Ошибка загрузки карты');
            this.mapImage.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23515558"/><text x="400" y="300" text-anchor="middle" fill="%23C4D200" font-family="Arial" font-size="20">Карта объекта</text></svg>';
        };
    }

    // Конвертация географических координат в пиксели на карте
    geoToPixel(lat, lng) {
        const bounds = this.config;
        
        // Вычисляем относительное положение по долготе (X)
        const lngRange = bounds.southEast.lng - bounds.northWest.lng;
        const lngRatio = (lng - bounds.northWest.lng) / lngRange;
        const x = lngRatio * bounds.width;
        
        // Вычисляем относительное положение по широте (Y)
        const latRange = bounds.northWest.lat - bounds.southEast.lat;
        const latRatio = (bounds.northWest.lat - lat) / latRange;
        const y = latRatio * bounds.height;
        
        return { x, y };
    }

    // Конвертация пикселей в географические координаты
    pixelToGeo(x, y) {
        const bounds = this.config;
        
        // Вычисляем географические координаты из пикселей
        const lngRatio = x / bounds.width;
        const lng = bounds.northWest.lng + (lngRatio * (bounds.southEast.lng - bounds.northWest.lng));
        
        const latRatio = y / bounds.height;
        const lat = bounds.northWest.lat - (latRatio * (bounds.northWest.lat - bounds.southEast.lat));
        
        return { lat, lng };
    }

    setupEventListeners() {
        // Кнопки управления
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoom(0.8));
        document.getElementById('locate-user')?.addEventListener('click', () => this.locateUser());
        document.getElementById('add-marker')?.addEventListener('click', () => this.enableMarkerMode());

        // Клик по карте для добавления меток
        this.mapImage?.addEventListener('click', (e) => {
            if (this.markerModeEnabled) {
                const rect = this.mapImage.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Конвертируем пиксели в географические координаты
                const geoCoords = this.pixelToGeo(x, y);
                this.addMarkerAtPosition(geoCoords.lat, geoCoords.lng);
                this.disableMarkerMode();
            }
        });

        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        let isDragging = false;
        let startX, startY, scrollLeft, scrollTop;

        const mapContainer = this.container.querySelector('.map-image-container');

        mapContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX - mapContainer.offsetLeft;
            startY = e.pageY - mapContainer.offsetTop;
            scrollLeft = mapContainer.scrollLeft;
            scrollTop = mapContainer.scrollTop;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - mapContainer.offsetLeft;
            const y = e.pageY - mapContainer.offsetTop;
            const walkX = (x - startX) * 2;
            const walkY = (y - startY) * 2;
            mapContainer.scrollLeft = scrollLeft - walkX;
            mapContainer.scrollTop = scrollTop - walkY;
        });
    }

    // Геолокация
    startGeolocationTracking() {
        if (!navigator.geolocation) {
            this.updateStatus('Геолокация не поддерживается');
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handleGeolocation(position),
            (error) => this.handleGeolocationError(error),
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 30000
            }
        );
    }

    handleGeolocation(position) {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Конвертируем GPS координаты в пиксели на карте
        const pixelCoords = this.geoToPixel(latitude, longitude);
        
        this.updateUserMarker(pixelCoords.x, pixelCoords.y, accuracy);
        this.updateStatus(`Позиция: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        
        // Сохраняем последнюю позицию
        this.lastPosition = { lat: latitude, lng: longitude };
    }

    handleGeolocationError(error) {
        const errors = {
            1: 'Доступ к геолокации запрещен',
            2: 'Позиция недоступна',
            3: 'Таймаут запроса'
        };
        this.updateStatus(`Ошибка геолокации: ${errors[error.code] || 'Неизвестная ошибка'}`);
    }

    // Метки с географическими координатами
    addMarkerAtPosition(lat, lng, title = 'Новая метка') {
        const marker = {
            id: Date.now(),
            lat,
            lng,
            title,
            timestamp: new Date()
        };

        this.markers.push(marker);
        this.renderMarkers();
        this.saveMarkers();

        console.log(`Добавлена метка: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        return marker;
    }

    renderMarkers() {
        const container = document.getElementById('markers-container');
        if (!container || !this.mapImage) return;

        container.innerHTML = this.markers.map(marker => {
            // Конвертируем географические координаты в пиксели
            const pixelCoords = this.geoToPixel(marker.lat, marker.lng);
            
            return `
                <div class="map-marker" style="left: ${pixelCoords.x}px; top: ${pixelCoords.y}px;" 
                     data-marker-id="${marker.id}">
                    <div class="marker-pin">📌</div>
                    <div class="marker-tooltip">${marker.title}</div>
                </div>
            `;
        }).join('');

        // Добавляем обработчики для меток
        container.querySelectorAll('.map-marker').forEach(markerEl => {
            markerEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showMarkerInfo(markerEl.dataset.markerId);
            });
        });
    }

    updateUserMarker(x, y, accuracy) {
        let userMarkerEl = document.getElementById('user-marker');
        
        if (!userMarkerEl) {
            userMarkerEl = document.createElement('div');
            userMarkerEl.id = 'user-marker';
            userMarkerEl.className = 'user-marker';
            document.getElementById('markers-container').appendChild(userMarkerEl);
        }

        userMarkerEl.style.left = `${x}px`;
        userMarkerEl.style.top = `${y}px`;
        
        // Круг точности (в пикселях)
        let accuracyCircle = document.getElementById('accuracy-circle');
        if (!accuracyCircle) {
            accuracyCircle = document.createElement('div');
            accuracyCircle.id = 'accuracy-circle';
            accuracyCircle.className = 'accuracy-circle';
            document.getElementById('markers-container').appendChild(accuracyCircle);
        }

        // Конвертируем метры точности в пиксели
        const accuracyInPixels = this.metersToPixels(accuracy);
        accuracyCircle.style.width = `${accuracyInPixels * 2}px`;
        accuracyCircle.style.height = `${accuracyInPixels * 2}px`;
        accuracyCircle.style.left = `${x - accuracyInPixels}px`;
        accuracyCircle.style.top = `${y - accuracyInPixels}px`;
    }

    // Конвертация метров в пиксели на карте
    metersToPixels(meters) {
        // Вычисляем масштаб карты (метров на пиксель)
        const latDistance = this.calculateDistance(
            this.config.northWest.lat, this.config.northWest.lng,
            this.config.southEast.lat, this.config.northWest.lng
        );
        const metersPerPixelLat = latDistance / this.config.height;
        
        const lngDistance = this.calculateDistance(
            this.config.northWest.lat, this.config.northWest.lng,
            this.config.northWest.lat, this.config.southEast.lng
        );
        const metersPerPixelLng = lngDistance / this.config.width;
        
        // Используем среднее значение
        const avgMetersPerPixel = (metersPerPixelLat + metersPerPixelLng) / 2;
        
        return meters / avgMetersPerPixel;
    }

    // Расчет расстояния между двумя точками в метрах (формула гаверсинусов)
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Радиус Земли в метрах
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Режим добавления меток
    enableMarkerMode() {
        this.markerModeEnabled = true;
        this.mapImage.style.cursor = 'crosshair';
        this.updateStatus('Кликните на карте чтобы добавить метку');
    }

    disableMarkerMode() {
        this.markerModeEnabled = false;
        this.mapImage.style.cursor = 'grab';
        this.updateStatus('Готово');
    }

    // Вспомогательные методы
    zoom(factor) {
        const currentTransform = this.mapImage.style.transform || 'scale(1)';
        const currentScale = parseFloat(currentTransform.replace('scale(', '')) || 1;
        const newScale = currentScale * factor;
        this.mapImage.style.transform = `scale(${newScale})`;
    }

    locateUser() {
        if (this.lastPosition) {
            const pixelCoords = this.geoToPixel(this.lastPosition.lat, this.lastPosition.lng);
            const userMarker = document.getElementById('user-marker');
            if (userMarker) {
                userMarker.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }
    }

    showMarkerInfo(markerId) {
        const marker = this.markers.find(m => m.id == markerId);
        if (marker) {
            alert(`Метка: ${marker.title}\nКоординаты: ${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}\nВремя: ${marker.timestamp.toLocaleString()}`);
        }
    }

    updateStatus(message) {
        const statusEl = document.getElementById('map-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    saveMarkers() {
        localStorage.setItem('map-markers', JSON.stringify(this.markers));
    }

    loadMarkers() {
        const saved = localStorage.getItem('map-markers');
        if (saved) {
            this.markers = JSON.parse(saved);
            // Перерисуем метки после загрузки карты
            if (this.mapImage.complete) {
                this.renderMarkers();
            }
        }
    }

    // Очистка
    destroy() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
        }
    }
}