document.addEventListener('DOMContentLoaded', () => {

    const popupWorkplace = document.querySelector('.popup-workplace');
    const popupCompare = document.querySelector('.popup-compare');
    const popupViolation = document.querySelector('.popup-violation');

    const btnCompareClose = document.querySelector('.popup-compare-close');
    const btnNext = document.querySelector('.popup-compare-next');
    const btnViolation = document.querySelector('.popup-compare-log');

    const imgEth = document.querySelector('.img-eth');
    const direction = document.querySelector('.directions');
    const dots = document.querySelectorAll('.dot');

    const violationComment = document.querySelector('.violation-comment');
    const violationBtns = document.querySelectorAll('.violation-grid button');
    const violationPhotoBtn = document.querySelector('.violation-photo-btn');
    const violationPhotoInput = document.querySelector('.violation-photo-input');
    const violationSubmit = document.querySelector('.violation-submit');

    const workplaces = document.querySelectorAll('.section-inner .workplace');

    // Открытие сравнения теперь привязано к workplace
    workplaces.forEach((wp, index) => {
        wp.addEventListener("click", () => {
            hidePopup(popupWorkplace); // если открыт
            currentStep = 0;
            updateSlide();
            showPopup(popupCompare);
        });
    });


    // ==========================
    // Слайды
    // ==========================

    const TOTAL_STEPS = 2;
    let currentStep = 0;

    const stepsData = Array(TOTAL_STEPS).fill(null).map(() => ({
        ok: true,
        comment: "",
        photo: null
    }));

    const images = [
        "/media/images/static/ethalon-front.png",
        "/media/images/static/ethalon-bottom-left.png",
    ];

    const directions = [
        "/media/images/static/bottom.png",
        "/media/images/static/bottom-left.png",
    ];

    function updateSlide() {
        imgEth.style.backgroundImage = `url(${images[currentStep]})`;
        direction.style.backgroundImage = `url(${directions[currentStep]})`;


        dots.forEach((d, i) => {
            d.classList.toggle("active", i === currentStep);
        });
    }


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
    // Фото
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
    // Переход к следующему этапу
    // ==========================

    function goNextStep() {
        currentStep++;

        if (currentStep < TOTAL_STEPS) {
            updateSlide();
            return;
        }

        // Завершено!
        hidePopup(popupCompare);
        console.log("РЕЗУЛЬТАТ:", stepsData);
    }


    // ==========================
    // Назад
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

});
