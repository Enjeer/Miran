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

    // --- Инициализация положения pinpoint в центре с плавным перемещением ---
    const centerPinpoint = () => {
        const rect = pinpoint.getBoundingClientRect();
        pinpoint.style.position = 'absolute';
        // Плавный переход
        pinpoint.style.transition = 'left 0.5s ease, top 0.5s ease';
        pinpoint.style.left = `${window.innerWidth / 2 - rect.width / 2}px`;
        pinpoint.style.top = `${window.innerHeight / 2 - rect.height / 2}px`;
    };

    // Вызываем при загрузке страницы с небольшой задержкой
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(centerPinpoint, 100); // чтобы элемент успел отрендериться
    });

    // --- Pinpoint Drag & Click ---
    let isDragging = false, offsetX = 0, offsetY = 0;

    pinpoint.addEventListener('pointerdown', e => {
        isDragging = true;
        offsetX = e.clientX - pinpoint.offsetLeft;
        offsetY = e.clientY - pinpoint.offsetTop;
        pinpoint.setPointerCapture(e.pointerId);
        // Отключаем переход во время перетаскивания
        pinpoint.style.transition = 'none';
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
            // Возвращаем плавность после завершения перетаскивания
            pinpoint.style.transition = 'left 0.3s ease, top 0.3s ease';
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

    // --- Обновляем положение при изменении размеров окна ---
    window.addEventListener('resize', centerPinpoint);


    // --- История страниц ---
    const pageHistory = JSON.parse(sessionStorage.getItem('pageHistory')) || [];

    // Функция для перехода на страницу
    function navigateTo(url) {
        pageHistory.push(window.location.href); // сохраняем текущую страницу
        sessionStorage.setItem('pageHistory', JSON.stringify(pageHistory));
        window.location.href = url;
    }

    // Функция для "Назад"
    function goBack() {
        if (pageHistory.length > 0) {
            const prev = pageHistory.pop();
            sessionStorage.setItem('pageHistory', JSON.stringify(pageHistory));
            window.location.href = prev;
        } else {
            // если истории нет — на главную
            window.location.href = '/main.html';
        }
    }

    // Пример использования
    backBtn.addEventListener('click', () => {
        goBack();
    });


    // --- Sections Click ---
    sections.forEach(section => {
        section.addEventListener('click', () => {
            const sectionName = section.textContent.trim(); // Получаем A1, B2 и т.д.
            localStorage.setItem('selectedSection', sectionName);

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
                        window.location.href = '/inspection.html';
                    }, 400);
                });
            }, 200);
        });
    });

});
