document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.querySelector('.btn-back');
    const finishBtn = document.querySelector('.btn-finish');
    const workplaces = document.querySelectorAll('.section-inner .workplace');

    const popupWorkplace = document.querySelector('.popup-workplace');
    const popupFinish = document.querySelector('.popup-finish');

    // --- Показать/скрыть popup ---
    const showPopup = (popup) => {
        if (popup) popup.style.display = 'flex';
    };
    const hidePopup = (popup) => {
        if (popup) popup.style.display = 'none';
    };

    // --- Popup на workplace ---
    workplaces.forEach(wp => {
        wp.addEventListener('click', () => showPopup(popupWorkplace));
    });

    // --- Popup на кнопку завершить ---
    if (finishBtn) {
        finishBtn.addEventListener('click', () => showPopup(popupFinish));
    }

    // --- Кнопки Отмена ---
    document.querySelectorAll('.popup-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            hidePopup(btn.closest('.popup-overlay'));
        });
    });

    // --- Back button ---
    let backTimer = null, longPress = false;
    let scale = 1;

    const resetBackBtn = () => {
        backBtn.style.transition = 'transform 0.2s ease';
        backBtn.style.transform = 'scale(1)';
        scale = 1;
    };

    backBtn.addEventListener('pointerdown', () => {
        longPress = false;
        navigator.vibrate?.(50);

        backTimer = setTimeout(() => {
            longPress = true;
            let startTime = null;

            const animateScale = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;

                scale = 1 + 0.01 * (elapsed / 200);
                backBtn.style.transition = 'transform 0.1s ease';
                backBtn.style.transform = `scale(${scale})`;

                navigator.vibrate?.(30);

                if (elapsed < 1000 && longPress) {
                    requestAnimationFrame(animateScale);
                } else if (elapsed >= 1000) {
                    window.location.href = document.referrer || '/main.html';
                }
            };

            requestAnimationFrame(animateScale);
        }, 500);
    });

    backBtn.addEventListener('pointerup', () => {
        clearTimeout(backTimer);
        longPress = false;
        navigator.vibrate?.(50);
        resetBackBtn();
    });

    // --- Подтягиваем название секции ---
    const sectionName = localStorage.getItem('selectedSection') || 'Секция';
    const sectionSpan = document.querySelector('.section-naming span');
    if (sectionSpan) {
        sectionSpan.textContent = `Зона ${sectionName}`;
    }
});
