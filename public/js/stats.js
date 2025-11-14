// JSON с данными
const violationsData = {
    // Нарушения за день (0–5 участков)
    day: {
        "0": 2, "1": 3, "2": 1, "3": 4, "4": 2, "5": 0
    },
    // Нарушения за каждый день месяца (1–30)
    month: {
        "0": 12, "1": 15, "2": 9, "3": 20, "4": 11, "5": 5
        // Можно добавить больше для реальных участков и дней
    },
    // Нарушения за каждый месяц года (0–11)
    year: {
        "0": 100, "1": 110, "2": 90, "3": 130, "4": 120, "5": 80
    }
};

const ctxDay = document.getElementById('chart-day').getContext('2d');
const ctxMonth = document.getElementById('chart-month').getContext('2d');
const ctxYear = document.getElementById('chart-year').getContext('2d');

let chartDay, chartMonth, chartYear;

// Функция для графика
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

// Инициализация
chartDay = createChart(ctxDay, violationsData.day, "Нарушения за день");
chartMonth = createChart(ctxMonth, violationsData.month, "Нарушения за месяц", 30);
chartYear = createChart(ctxYear, violationsData.year, "Нарушения за год", 150);

// Кнопки
document.getElementById('trend-day-btn').addEventListener('click', () => {
    const selectedDate = document.getElementById('trend-day-picker').value;
    if (!selectedDate) {
        alert('Выберите дату!');
        return;
    }
    chartDay.data.datasets[0].label = `Нарушения за день ${selectedDate}`;
    chartDay.update();
    chartDay.canvas.style.display = 'block';
    chartMonth.canvas.style.display = 'none';
    chartYear.canvas.style.display = 'none';
});

document.getElementById('trend-month-btn').addEventListener('click', () => {
    chartMonth.canvas.style.display = 'block';
    chartDay.canvas.style.display = 'none';
    chartYear.canvas.style.display = 'none';
});

document.getElementById('trend-year-btn').addEventListener('click', () => {
    chartYear.canvas.style.display = 'block';
    chartDay.canvas.style.display = 'none';
    chartMonth.canvas.style.display = 'none';
});
