document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.querySelector('.btn-back');
    const sections = document.querySelectorAll('.section');
    const pinpoint = document.querySelector('.pinpoint');
    const mapContainer = document.querySelector('.map');
    const mapContent = document.querySelector('.map-blocks');

    // 📌 Полная блокировка выделения и масштабирования
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.touchAction = 'none';

    // --- Previous Page ---
    let previousPage = document.referrer || '/main.html';

    // --- Map State ---
    const mapState = { pinpointX: null, pinpointY: null, time: '' };

    const loadPinpoint = () => {
        const saved = JSON.parse(sessionStorage.getItem('mapState'));
        if (saved) Object.assign(mapState, saved);

        if (mapState.pinpointX === null || mapState.pinpointY === null) {
            // центр по всей карте
            const rect = mapContent.getBoundingClientRect();
            pinpoint.style.left = rect.width / 2 - pinpoint.offsetWidth / 2 + 'px';
            pinpoint.style.top = rect.height / 2 - pinpoint.offsetHeight / 2 + 'px';
        } else {
            pinpoint.style.left = mapState.pinpointX + 'px';
            pinpoint.style.top = mapState.pinpointY + 'px';
        }
    };

    const savePinpoint = () => {
        mapState.pinpointX = parseInt(pinpoint.style.left) || 0;
        mapState.pinpointY = parseInt(pinpoint.style.top) || 0;
        sessionStorage.setItem('mapState', JSON.stringify(mapState));
    };

    loadPinpoint();

    // --- Grid Overlay ---
    const gridCanvas = document.createElement('canvas');
    gridCanvas.classList.add('grid-overlay');
    mapContent.appendChild(gridCanvas);
    const ctx = gridCanvas.getContext('2d');

    const drawGrid = () => {
        const step = 50;
        gridCanvas.width = mapContent.scrollWidth;
        gridCanvas.height = mapContent.scrollHeight;
        ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= gridCanvas.width; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, gridCanvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= gridCanvas.height; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(gridCanvas.width, y);
            ctx.stroke();
        }
    };

    drawGrid();
    window.addEventListener('resize', drawGrid);

    // --- Pinpoint Drag & Click ---
    let isDragging = false, offsetX = 0, offsetY = 0;

    pinpoint.addEventListener('pointerdown', e => {
        isDragging = true;
        offsetX = e.clientX - pinpoint.offsetLeft;
        offsetY = e.clientY - pinpoint.offsetTop;
        pinpoint.setPointerCapture(e.pointerId);
        pinpoint.style.cursor = 'grabbing';
    });

    pinpoint.addEventListener('pointermove', e => {
        if (!isDragging) return;
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        pinpoint.style.left = `${x}px`;
        pinpoint.style.top = `${y}px`;
    });

    pinpoint.addEventListener('pointerup', e => {
        if (isDragging) {
            isDragging = false;
            pinpoint.style.cursor = 'grab';
            savePinpoint();
        } else {
            // Ввод времени
            const input = document.createElement('input');
            input.type = 'time';
            input.value = mapState.time || '';
            input.style.position = 'absolute';
            input.style.top = (pinpoint.offsetTop + 20) + 'px';
            input.style.left = (pinpoint.offsetLeft - 20) + 'px';
            document.body.appendChild(input);
            input.focus();
            input.addEventListener('change', () => {
                mapState.time = input.value;
                savePinpoint();
                input.remove();
            });
            input.addEventListener('blur', () => input.remove());
        }
    });

    // --- Button Back ---
    let backTimer = null, longPress = false, scale = 1;

    const resetBackBtn = () => { backBtn.style.transform = 'scale(1)'; scale = 1; };

    backBtn.addEventListener('pointerdown', () => {
        longPress = false;
        navigator.vibrate?.(50);

        backTimer = setTimeout(() => {
            longPress = true;
            let elapsed = 0;
            const interval = setInterval(() => {
                if (!longPress) return clearInterval(interval);
                scale += 0.05;
                backBtn.style.transform = `scale(${scale})`;
                navigator.vibrate?.(30);
                elapsed += 200;
                if (elapsed >= 2000) {
                    clearInterval(interval);
                    window.location.href = previousPage;
                }
            }, 200);
        }, 500);
    });

    backBtn.addEventListener('pointerup', () => {
        clearTimeout(backTimer);
        if (!longPress) navigator.vibrate?.(50);
        resetBackBtn();
    });

    // --- Sections Click ---
    sections.forEach(section => {
        section.addEventListener('click', () => {
            section.style.transition = 'transform 0.2s';
            section.style.transform = 'scale(1.1)';
            setTimeout(() => {
                section.style.transform = 'scale(1)';
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = 0;
                overlay.style.left = 0;
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = '#fff';
                overlay.style.opacity = 0;
                overlay.style.transition = 'opacity 0.4s';
                document.body.appendChild(overlay);
                requestAnimationFrame(() => {
                    overlay.style.opacity = 1;
                    setTimeout(() => window.location.href = '/main.html', 400);
                });
            }, 200);
        });
    });
});
