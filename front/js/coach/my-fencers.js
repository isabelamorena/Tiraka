import { showPanel } from "./shared-functions.js";
import { showAlert } from "./shared-functions.js";
import { showConfirm } from "./shared-functions.js";
import { fencersCoach } from "./shared-functions.js";
import { formatDateYYYYMMDD } from "./shared-functions.js";

document.addEventListener("DOMContentLoaded", function () {
    
    document.getElementById("my-fencers-link").addEventListener("click", function (e) {
        e.preventDefault();
        showPanel("my-fencers");

        let fencers = [];
        // Crear una lista para que el coach elija sus fencers
        fencersCoach().then(data => {
            fencers = data;
            const fencerList = document.getElementById("fencer-list");
            fencerList.innerHTML = ""; // Limpiar la lista antes de agregar nuevos elementos

            if (fencers.length === 0) {
                fencerList.innerHTML = "<div class='alert alert-warning'>No tienes fencers asignados.</div>";
                return;
            }

            // Seleccionar un fencer al hacer clic
            fencers.forEach(fencer => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "list-group-item list-group-item-action fencer-btn mb-2";
                btn.textContent = `${fencer.name} ${fencer.surname} ${fencer.secondsurname}`;
                btn.dataset.fencerId = fencer.id;
                btn.addEventListener("click", function () {
                    const selectedFencerId = this.dataset.fencerId;
                    showFencerTrainingChart(selectedFencerId);
                    showFencerAttendanceChart(selectedFencerId);

                    // Quitar selección previa
                    document.querySelectorAll('.fencer-btn.active').forEach(el => el.classList.remove('active'));
                    // Marcar este como activo
                    this.classList.add('active');
                });
                fencerList.appendChild(btn);
            });
            document.getElementById("fencer-training-charts-container").classList.add("d-none"); // Asegurarse de que el contenedor no esté oculto
        }).catch(error => {
            console.error("Error al cargar los fencers:", error);
            showAlert("Error al cargar los fencers");
        });
    });
});

let chartInstances = []; // Para destruir los gráficos anteriores

async function showFencerTrainingChart(fencerId) {
    try {
        const response = await fetch(`/getFencerWorkouts/${fencerId}`);
        const data = await response.json();

        if (data.success) {
            const workouts = data.workouts || [];

            // Agrupar por mes y contar completados/no completados
            const monthlyStats = {};
            workouts.forEach(w => {
                const date = new Date(w.date);
                const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!monthlyStats[month]) {
                    monthlyStats[month] = { completed: 0, notCompleted: 0 };
                }
                if (w.is_completed) {
                    monthlyStats[month].completed++;
                } else {
                    monthlyStats[month].notCompleted++;
                }
            });

            // Limpiar gráficos anteriores
            chartInstances.forEach(chart => chart.destroy());
            chartInstances = [];
            const chartsContainer = document.getElementById('fencer-training-charts');
            chartsContainer.innerHTML = '';
            const chartsConta = document.getElementById('fencer-training-charts-container');
            chartsConta.classList.remove('d-none'); // Asegurarse de que el contenedor no esté oculto

            // Crear un rosco por cada mes
            Object.keys(monthlyStats).sort().forEach(month => {
                const stats = monthlyStats[month];
                // Crear un div para el rosco y su título
                const roscoDiv = document.createElement('div');
                // Título del mes
                const title = document.createElement('div');
                title.style.marginBottom = '8px';
                title.textContent = `Mes: ${month}`;
                // Canvas del rosco
                const canvas = document.createElement('canvas');
                canvas.width = 250;
                canvas.height = 250;
                roscoDiv.appendChild(title);
                roscoDiv.appendChild(canvas);
                chartsContainer.appendChild(roscoDiv);

                const ctx = canvas.getContext('2d');
                const chart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Completados', 'No completados'],
                        datasets: [{
                            data: [stats.completed, stats.notCompleted],
                            backgroundColor: ['#FCD030ff', '#ccc'],
                        }]
                    },
                    options: {
                        responsive: false,
                        plugins: {
                            legend: { position: 'bottom' },
                            title: {
                                display: true,
                                text: `Entrenamientos ${month}`
                            }
                        }
                    }
                });
                chartInstances.push(chart);
            });

        } else {
            showAlert(data.message);
        }
    } catch (error) {
        console.error("Error al obtener los entrenamientos del tirador:", error.message);
        showAlert("Error al obtener los entrenamientos del tirador");
    }
}
let attendanceChartInstance = null;
let attendanceDataCache = [];

async function showFencerAttendanceChart(fencerId) {
    try {
        const response = await fetch(`/getFencerAttendance/${fencerId}`);
        const data = await response.json();

        if (data.success) {
            attendanceDataCache = data.attendance || [];
            document.getElementById('fencer-attendance-chart-container').classList.remove('d-none'); // Ocultar el contenedor al inicio

            // Agrupar por mes
            const months = {};
            attendanceDataCache.forEach(a => {
                if (!a.date) return; // Ignora registros sin fecha
                const date = new Date(a.date);
                if (isNaN(date.getTime())) return; // Ignora fechas inválidas
                const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!months[month]) months[month] = [];
                months[month].push(a);
            });

            // Llenar el selector de meses
            const monthSelect = document.getElementById('attendance-month-select');
            monthSelect.innerHTML = '';
            Object.keys(months).sort().forEach(month => {
                const option = document.createElement('option');
                option.value = month;
                option.textContent = month;
                monthSelect.appendChild(option);
            });

            // Mostrar controles
            document.getElementById('attendance-controls').classList.remove('d-none');
            document.getElementById('fencer-attendance-chart-container').classList.remove('d-none');

            // Mostrar el mes más reciente por defecto
            if (monthSelect.options.length > 0) {
                monthSelect.value = monthSelect.options[monthSelect.options.length - 1].value;
                renderAttendanceChart(monthSelect.value);
            }

            // Cambiar de mes
            monthSelect.onchange = function() {
                renderAttendanceChart(this.value);
            };

        } else {
            showAlert(data.message);
            // Limpiar el gráfico y controles si no hay datos
            document.getElementById('fencer-attendance-chart-container').classList.add('d-none'); // Ocultar el contenedor al inicio

        }
    } catch (error) {
        console.error("Error al obtener las asistencias del tirador:", error);
        showAlert("Error al obtener las asistencias del tirador");
    }
}

function renderAttendanceChart(month) {
    // Filtra los registros del mes seleccionado
    const filtered = attendanceDataCache.filter(a => {
        const date = new Date(a.date);
        const m = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return m === month;
    });

    // Calcula minutos de asistencia por día
    const minutesPerDay = {};
    filtered.forEach(a => {
        const date = new Date(a.date);
        const day = date.getDate();

        // Parse check_in y check_out (formato "HH:mm:ss")
        if (!a.check_in || !a.check_out) return;
        const [inH, inM] = a.check_in.split(':').map(Number);
        const [outH, outM] = a.check_out.split(':').map(Number);

        // Calcula minutos totales
        let minutes = (outH * 60 + outM) - (inH * 60 + inM);
        if (minutes < 0) minutes += 24 * 60; // Por si pasa de medianoche

        // Suma si hay varias asistencias el mismo día
        if (!minutesPerDay[day]) minutesPerDay[day] = 0;
        minutesPerDay[day] += minutes;
    });

    // Días del mes para el eje X
    const daysInMonth = new Date(Number(month.split('-')[0]), Number(month.split('-')[1]), 0).getDate();
    const labels = Array.from({length: daysInMonth}, (_, i) => i + 1);

    // Prepara los datos para la gráfica (en horas con decimales)
    const data = labels.map(day => minutesPerDay[day] ? +(minutesPerDay[day] / 60).toFixed(2) : 0);

    // Dibuja la gráfica
    const ctx = document.getElementById('fencer-attendance-chart').getContext('2d');
    if (attendanceChartInstance) attendanceChartInstance.destroy();

    attendanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Horas de asistencia',
                data: data,
                backgroundColor: '#B59E4Cff',
                borderColor: '#B59E4Cff',
                fill: false,
                tension: 0.2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: `Horas de asistencia por día (${month})`
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            const h = Math.floor(value);
                            const m = Math.round((value - h) * 60);
                            return ` ${h}h ${m.toString().padStart(2, '0')}min`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Día del mes' },
                    ticks: { stepSize: 1 }
                },
                y: {
                    title: { display: true, text: 'Horas' },
                    min: 0,
                    max: 8,
                    ticks: {
                        stepSize: 0.25,
                        callback: function(value) {
                            const h = Math.floor(value);
                            const m = Math.round((value - h) * 60);
                            return `${h}:${m.toString().padStart(2, '0')}`;
                        }
                    }
                }
            }
        }
    });
}
