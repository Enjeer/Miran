document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.querySelector('.btn-back');
    const sections = document.querySelectorAll('.section');
    const pinpoint = document.querySelector('.pinpoint');
    const mapContainer = document.querySelector('.map');

    // 📌 Предотвращаем выделение текста и масштабирование
    document.body.style.userSelect = 'none';
    document.body.style.touchAction = 'none';
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('gesturestart', e => e.preventDefault());

    // --- PWA ---
    let deferredPrompt;
    const installBtnContainer = document.getElementById('installButton');
    if (installBtnContainer) {
        const installBtn = installBtnContainer.querySelector('button');
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtnContainer.style.display = 'block';
        });
        installBtn.addEventListener('click', async () => {
            installBtnContainer.style.display = 'none';
            if (deferredPrompt) {
                deferredPrompt.prompt();
                await deferredPrompt.userChoice;
                deferredPrompt = null;
            }
        });
    }

    // --- Previous Page ---
    let previousPage = document.referrer || '/main.html';

    // --- Map State ---
    const mapState = { pinpointX: null, pinpointY: null, time: '' };

    // --- Pinpoint Setup ---
    const loadPinpoint = () => {
        const saved = JSON.parse(sessionStorage.getItem('mapState'));
        if (saved) Object.assign(mapState, saved);

        if (mapState.pinpointX === null || mapState.pinpointY === null) {
            // Если нет позиции, ставим в центр
            const rect = mapContainer.getBoundingClientRect();
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
    gridCanvas.style.position = 'absolute';
    gridCanvas.style.top = '0';
    gridCanvas.style.left = '0';
    gridCanvas.style.width = '100%';
    gridCanvas.style.height = '100%';
    gridCanvas.style.pointerEvents = 'none';
    mapContainer.appendChild(gridCanvas);
    const ctx = gridCanvas.getContext('2d');

    const drawGrid = () => {
        const step = 50;
        gridCanvas.width = mapContainer.offsetWidth;
        gridCanvas.height = mapContainer.offsetHeight;
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

    window.addEventListener('resize', drawGrid);
    drawGrid();

    // --- Pinpoint Drag & Click ---
    let isDragging = false, offsetX = 0, offsetY = 0;
    pinpoint.addEventListener('pointerdown', e => {
        isDragging = true;
        offsetX = e.clientX - pinpoint.offsetLeft;
        offsetY = e.clientY - pinpoint.offsetTop;
        pinpoint.setPointerCapture(e.pointerId);
    });

    pinpoint.addEventListener('pointermove', e => {
        if (isDragging) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            pinpoint.style.left = x + 'px';
            pinpoint.style.top = y + 'px';
        }
    });

    pinpoint.addEventListener('pointerup', e => {
        if (isDragging) {
            isDragging = false;
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
                document.body.removeChild(input);
            });
            input.addEventListener('blur', () => {
                if (document.body.contains(input)) document.body.removeChild(input);
            });
        }
    });

    // --- Button Back ---
    let backTimer = null, longPress = false;
    let scale = 1;

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
                if (elapsed >= 1000) {
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
                    setTimeout(() => {
                        window.location.href = '/main.html'; // изменить под секцию
                    }, 400);
                });
            }, 200);
        });
    });
});
