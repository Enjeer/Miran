document.addEventListener('DOMContentLoaded', () => {

    const popupWorkplace = document.querySelector('.popup-workplace');
    const popupCompare = document.querySelector('.popup-compare');
    const popupViolation = document.querySelector('.popup-violation');

    const btnCompareClose = document.querySelector('.popup-compare-close');
    const btnNext = document.querySelector('.popup-compare-next');
    const btnViolation = document.querySelector('.popup-compare-log');
    const backBtn = document.querySelector('.btn-back');

    const imgEth = document.querySelector('.img-eth');
    const direction = document.querySelector('.directions');

    const compareStepsContainer = document.querySelector('.compare-steps');

    const violationComment = document.querySelector('.violation-comment');
    const violationBtns = document.querySelectorAll('.violation-grid button');
    const violationPhotoBtn = document.querySelector('.violation-photo-btn');
    const violationPhotoInput = document.querySelector('.violation-photo-input');
    const violationSubmit = document.querySelector('.violation-submit');

    const workplaces = document.querySelectorAll('.section-inner .workplace');

    const sectionName = document.querySelector('.section-naming');
    const headerName = sectionName.querySelector('span');

    headerName.innerHTML = localStorage.getItem('selectedSection');
    

    // ==========================
    // Настройки шагов
    // ==========================
    const TOTAL_STEPS = 2;
    let currentStep = 0;
    let currentWorkplace = null;

    const stepsData = Array(TOTAL_STEPS).fill(null).map(() => ({
        ok: true,
        comment: "",
        photo: null
    }));

    const images = [
        "/media/images/static/ethalon-front.png",
        "/media/images/static/ethalon-bottom-left.png"
    ];

    const directions = [
        "/media/images/static/bottom.png",
        "/media/images/static/bottom-left.png"
    ];

    // ==========================
    // Динамические точки
    // ==========================
    function createDots() {
        compareStepsContainer.innerHTML = '';
        for (let i = 0; i < TOTAL_STEPS; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            compareStepsContainer.appendChild(dot);
        }
    }
    createDots();

    function updateSlide() {
        imgEth.style.backgroundImage = `url(${images[currentStep]})`;
        direction.style.backgroundImage = `url(${directions[currentStep]})`;

        const dots = compareStepsContainer.querySelectorAll('.dot');
        dots.forEach((d, i) => {
            d.classList.toggle("active", i === currentStep);
        });
    }

    // ==========================
    // Открытие popup сравнения
    // ==========================
    workplaces.forEach((wp, index) => {
        wp.addEventListener("click", () => {
            hidePopup(popupWorkplace);
            currentStep = 0;
            currentWorkplace = wp;
            updateSlide();
            showPopup(popupCompare);
        });
    });

    // ==========================
    // Кнопка "Все норм"
    // ==========================
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            stepsData[currentStep].ok = true;
            goNextStep();
        });
    }

    // ==========================
    // Кнопка "Есть нарушение"
    // ==========================
    if (btnViolation) {
        btnViolation.addEventListener('click', () => {
            stepsData[currentStep].ok = false;
            violationComment.value = "";
            showPopup(popupViolation);
        });
    }

    // ==========================
    // Теги в комментарий
    // ==========================
    violationBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            violationComment.value += btn.dataset.tag + ". ";
        });
    });

    // ==========================
    // Фото нарушения
    // ==========================
    if (violationPhotoBtn) {
        violationPhotoBtn.addEventListener("click", () => {
            violationPhotoInput.click();
        });
    }

    violationPhotoInput.addEventListener("change", (e) => {
        stepsData[currentStep].photo = e.target.files[0] || null;
    });

    // ==========================
    // Завершить нарушение
    // ==========================
    violationSubmit.addEventListener("click", () => {
        stepsData[currentStep].comment = violationComment.value.trim();
        hidePopup(popupViolation);
        goNextStep();
    });

    // ==========================
    // Переход к следующему шагу
    // ==========================
    function goNextStep() {
        currentStep++;

        if (currentStep < TOTAL_STEPS) {
            updateSlide();
            return;
        }

        // Завершено — обновляем цвет workplace
        hidePopup(popupCompare);

        if (!currentWorkplace) return;

        const okCount = stepsData.filter(s => s.ok).length;

        currentWorkplace.classList.remove('top', 'mid', 'low');

        if (okCount === TOTAL_STEPS) {
            currentWorkplace.classList.add('top');
        } else if (okCount > 0) {
            currentWorkplace.classList.add('mid');
        } else {
            currentWorkplace.classList.add('low');
        }

        console.log("РЕЗУЛЬТАТ:", stepsData);
    }

    // ==========================
    // Кнопка назад в compare
    // ==========================
    if (btnCompareClose) {
        btnCompareClose.addEventListener("click", () => {
            hidePopup(popupCompare);
        });
    }

    // ==========================
    // Popup helpers
    // ==========================
    function showPopup(p) { if (p) p.style.display = "flex"; }
    function hidePopup(p) { if (p) p.style.display = "none"; }

    backBtn.addEventListener('click', () => {
        window.location.href = document.referrer || '/main.html';
        localStorage.removeItem('selectedSection');
    });

});
