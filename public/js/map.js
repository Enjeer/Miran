document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.querySelector('.btn-back');
    const sections = document.querySelectorAll('.section');
    const pinpoint = document.querySelector('.pinpoint');

    // Для хранения предыдущей страницы
    let previousPage = document.referrer || '/main.html';

    // Для хранения позиции и времени
    const mapState = {
        pinpointX: null,
        pinpointY: null,
        time: ''
    };

    // --- Кнопка назад ---
    let backPressTimer = null;
    let longPressActive = false;

    backBtn.addEventListener('pointerdown', () => {
        longPressActive = false;
        // короткий feedback через 50ms
        navigator.vibrate?.(50);

        backPressTimer = setTimeout(() => {
            longPressActive = true;
            // длинная вибрация каждые 200ms на 2 секунды
            let elapsed = 0;
            const interval = setInterval(() => {
                navigator.vibrate?.(30); // короткая вибрация
                elapsed += 200;
                if (!longPressActive || elapsed >= 2000) {
                    clearInterval(interval);
                    // После 2 секунд - переход
                    window.location.href = previousPage;
                }
            }, 200);
        }, 500); // если держим более 0.5s
    });

    backBtn.addEventListener('pointerup', () => {
        clearTimeout(backPressTimer);
        if (!longPressActive) {
            // короткое нажатие - только feedback
            navigator.vibrate?.(50);
        }
    });

    // --- Клик по секциям ---
    sections.forEach(section => {
        section.addEventListener('click', () => {
            // Эффект "приближения"
            section.style.transition = 'transform 0.2s';
            section.style.transform = 'scale(1.1)';
            setTimeout(() => {
                section.style.transform = 'scale(1)';
                // Переход на новую страницу с эффектом fade
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
                        // Здесь можно выбрать страницу для перехода
                        window.location.href = '/main.html';
                    }, 400);
                });
            }, 200);
        });
    });

    // --- Pinpoint логика ---
    let isDragging = false;
    let offsetX, offsetY;

    const loadPinpoint = () => {
        const savedState = JSON.parse(sessionStorage.getItem('mapState'));
        if (savedState) {
            mapState.pinpointX = savedState.pinpointX;
            mapState.pinpointY = savedState.pinpointY;
            mapState.time = savedState.time;
            if (mapState.pinpointX !== null) {
                pinpoint.style.left = mapState.pinpointX + 'px';
                pinpoint.style.top = mapState.pinpointY + 'px';
            }
        }
    };

    const savePinpoint = () => {
        mapState.pinpointX = parseInt(pinpoint.style.left) || 0;
        mapState.pinpointY = parseInt(pinpoint.style.top) || 0;
        sessionStorage.setItem('mapState', JSON.stringify(mapState));
    };

    loadPinpoint();

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
            // Если это просто клик - ввод времени
            const timeInput = document.createElement('input');
            timeInput.type = 'time';
            timeInput.value = mapState.time || '';
            timeInput.style.position = 'absolute';
            timeInput.style.top = (pinpoint.offsetTop + 20) + 'px';
            timeInput.style.left = (pinpoint.offsetLeft - 20) + 'px';
            document.body.appendChild(timeInput);
            timeInput.focus();

            timeInput.addEventListener('change', () => {
                mapState.time = timeInput.value;
                savePinpoint();
                document.body.removeChild(timeInput);
            });

            timeInput.addEventListener('blur', () => {
                if (document.body.contains(timeInput)) document.body.removeChild(timeInput);
            });
        }
    });
});
