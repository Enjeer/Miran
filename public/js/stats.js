// ======= ДАННЫЕ =======
// Нарушения за день, месяц, год
const violationsData = {
    day: { "0": 2, "1": 3, "2": 1, "3": 4, "4": 2, "5": 0 },
    month: { "0": 12, "1": 15, "2": 9, "3": 20, "4": 11, "5": 5 },
    year: { "0": 100, "1": 110, "2": 90, "3": 130, "4": 120, "5": 80 }
};

// Топ нарушений по группам мест
const topViolationsData = {
    day: { "1": 2, "2": 3, "3": 1, "4": 4, "5": 2 },
    month: { "1": 12, "2": 15, "3": 9, "4": 20, "5": 11 },
    year: { "1": 100, "2": 110, "3": 90, "4": 130, "5": 120 }
};

// ======= КОНТЕКСТЫ CANVAS =======
const ctxDay = document.getElementById('chart-day').getContext('2d');
const ctxMonth = document.getElementById('chart-month').getContext('2d');
const ctxYear = document.getElementById('chart-year').getContext('2d');
const ctxTop = document.getElementById('chart-top').getContext('2d');

let chartDay, chartMonth, chartYear, chartTop;

// ======= ФУНКЦИИ СОЗДАНИЯ ГРАФИКОВ =======
function createChart(ctx, data, label, maxY = 5) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: label,
                data: Object.values(data),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: maxY,
                    title: { display: true, text: 'Количество нарушений' }
                },
                x: {
                    title: { display: true, text: 'Номер участка' }
                }
            }
        }
    });
}

function createTopChart(ctx, data, label) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: label,
                data: Object.values(data),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Количество нарушений' }
                },
                x: {
                    title: { display: true, text: 'Группа мест' }
                }
            }
        }
    });
}

// ======= ИНИЦИАЛИЗАЦИЯ ГРАФИКОВ =======
chartDay = createChart(ctxDay, violationsData.day, "Нарушения за день");
chartMonth = createChart(ctxMonth, violationsData.month, "Нарушения за месяц", 30);
chartYear = createChart(ctxYear, violationsData.year, "Нарушения за год", 150);
chartTop = createTopChart(ctxTop, topViolationsData.day, "Топ нарушений за день");

// ======= ОБРАБОТЧИКИ КНОПОК =======
document.getElementById('trend-day-btn').addEventListener('click', () => {
    const selectedDate = document.getElementById('trend-day-picker').value;
    if (!selectedDate) {
        alert('Выберите дату!');
        return;
    }

    // Основной график
    chartDay.data.datasets[0].label = `Нарушения за день ${selectedDate}`;
    chartDay.update();
    chartDay.canvas.style.display = 'block';
    chartMonth.canvas.style.display = 'none';
    chartYear.canvas.style.display = 'none';

    // Топ-график
    chartTop.data.datasets[0].label = `Топ нарушений за день ${selectedDate}`;
    chartTop.data.datasets[0].data = Object.values(topViolationsData.day);
    chartTop.update();
});

document.getElementById('trend-month-btn').addEventListener('click', () => {
    chartMonth.canvas.style.display = 'block';
    chartDay.canvas.style.display = 'none';
    chartYear.canvas.style.display = 'none';

    chartTop.data.datasets[0].label = "Топ нарушений за месяц";
    chartTop.data.datasets[0].data = Object.values(topViolationsData.month);
    chartTop.update();
});

document.getElementById('trend-year-btn').addEventListener('click', () => {
    chartYear.canvas.style.display = 'block';
    chartDay.canvas.style.display = 'none';
    chartMonth.canvas.style.display = 'none';

    chartTop.data.datasets[0].label = "Топ нарушений за год";
    chartTop.data.datasets[0].data = Object.values(topViolationsData.year);
    chartTop.update();
});

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
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.querySelector('.btn-back');
    // Пример использования
    backBtn.addEventListener('click', () => {
        goBack();
    });
});