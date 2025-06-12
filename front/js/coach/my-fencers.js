import { showPanel, showAlert, showConfirm, fencersCoach, formatDateYYYYMMDD } from '../shared-functions.js';

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("my-fencers-link").addEventListener("click", function (e) {
        e.preventDefault();
        showPanel("my-fencers-coach");

        fencersCoach().then(data => {
            const fencerTabs = document.getElementById("fencer-tabs");
            const fencerTabsContent = document.getElementById("fencer-tabs-content");
            fencerTabs.innerHTML = "";
            fencerTabsContent.innerHTML = "";

            if (data.length === 0) {
                fencerTabsContent.innerHTML = "<div class='alert alert-warning'>No tienes fencers asignados.</div>";
                return;
            }

            data.forEach((fencer, idx) => {
                // Tab
                const tab = document.createElement("li");
                tab.className = "nav-item";
                tab.innerHTML = `
                    <a class="nav-link${idx === 0 ? " active" : ""}" id="fencer-tab-${fencer.id}" data-bs-toggle="tab" href="#fencer-pane-${fencer.id}" role="tab" aria-controls="fencer-pane-${fencer.id}" aria-selected="${idx === 0}">
                        ${fencer.name} ${fencer.surname}
                    </a>
                `;
                fencerTabs.appendChild(tab);

                // Tab content
                const pane = document.createElement("div");
                pane.className = `tab-pane fade${idx === 0 ? " show active" : ""}`;
                pane.id = `fencer-pane-${fencer.id}`;
                pane.setAttribute("role", "tabpanel");
                pane.innerHTML = `
                    <div class="mt-3">
                        <div id="fencer-info-${fencer.id}"></div>
                    </div>
                `;
                fencerTabsContent.appendChild(pane);
            });

            // Evento para mostrar info y gráficas al cambiar de tab
            document.querySelectorAll('#fencer-tabs a[data-bs-toggle="tab"]').forEach(tab => {
                tab.addEventListener('shown.bs.tab', async function () {
                    const fencerId = this.id.replace('fencer-tab-', '');

                    // Entrenamientos
                    const hasTrainings = await showFencerTrainingChart(fencerId);
                    // Asistencias
                    const hasAttendance = await showFencerAttendanceChart(fencerId);
                    // Competiciones
                    const hasCompetitions = await showFencerCompetitions(fencerId);

                    const trainingBtn = document.getElementById("show-training-btn");
                    const attendanceBtn = document.getElementById("show-attendance-btn");
                    const competitionsBtn = document.getElementById("show-competitions-btn");

                    if (hasTrainings && hasAttendance && hasCompetitions) {
                        trainingBtn.classList.remove("d-none");
                        attendanceBtn.classList.remove("d-none");
                        competitionsBtn.classList.remove("d-none");
                        // Mostrar entrenamientos por defecto
                        document.getElementById("fencer-training-charts-container").classList.remove("d-none");
                        document.getElementById("fencer-attendance-chart-container").classList.add("d-none");
                        document.getElementById("fencer-competitions-container").classList.add("d-none");
                        trainingBtn.classList.add("active");
                        attendanceBtn.classList.remove("active");
                        competitionsBtn.classList.remove("active");
                    } else if (hasTrainings) {
                        trainingBtn.classList.remove("d-none");
                        attendanceBtn.classList.add("d-none");
                        competitionsBtn.classList.add("d-none");
                        document.getElementById("fencer-training-charts-container").classList.remove("d-none");
                        document.getElementById("fencer-attendance-chart-container").classList.add("d-none");
                        document.getElementById("fencer-competitions-container").classList.add("d-none");
                        trainingBtn.classList.add("active");
                    } else if (hasAttendance) {
                        trainingBtn.classList.add("d-none");
                        attendanceBtn.classList.remove("d-none");
                        competitionsBtn.classList.add("d-none");
                        document.getElementById("fencer-training-charts-container").classList.add("d-none");
                        document.getElementById("fencer-attendance-chart-container").classList.remove("d-none");
                        document.getElementById("fencer-competitions-container").classList.add("d-none");
                        attendanceBtn.classList.add("active");
                    } else if (hasCompetitions) {
                        trainingBtn.classList.add("d-none");
                        attendanceBtn.classList.add("d-none");
                        competitionsBtn.classList.remove("d-none");
                        document.getElementById("fencer-training-charts-container").classList.add("d-none");
                        document.getElementById("fencer-attendance-chart-container").classList.add("d-none");
                        document.getElementById("fencer-competitions-container").classList.remove("d-none");
                        competitionsBtn.classList.add("active");
                    } else {
                        trainingBtn.classList.add("d-none");
                        attendanceBtn.classList.add("d-none");
                        competitionsBtn.classList.add("d-none");
                        document.getElementById("fencer-training-charts-container").classList.add("d-none");
                        document.getElementById("fencer-attendance-chart-container").classList.add("d-none");
                        document.getElementById("fencer-competitions-container").classList.add("d-none");
                    }
                });
            });

            // Mostrar info del primer fencer por defecto
            if (data.length > 0) {
                showFencerTrainingChart(data[0].id);
                showFencerAttendanceChart(data[0].id);
                showFencerCompetitions(data[0].id);

                document.getElementById("fencer-training-charts-container").classList.remove("d-none");
                document.getElementById("fencer-attendance-chart-container").classList.add("d-none");
                document.getElementById("show-training-btn").classList.add("active");
                document.getElementById("show-attendance-btn").classList.remove("active");
            }
        }).catch(error => {
            console.error("Error al cargar los fencers:", error);
            showAlert("Error al cargar los fencers");
        });
    });

    // Botones para alternar entre entrenamientos y asistencias
    document.getElementById("show-training-btn").addEventListener("click", function () {
        document.getElementById("fencer-training-charts-container").classList.remove("d-none");
        document.getElementById("fencer-attendance-chart-container").classList.add("d-none");
        document.getElementById("fencer-competitions-container").classList.add("d-none");
        this.classList.add("active");
        document.getElementById("show-attendance-btn").classList.remove("active");
        document.getElementById("show-competitions-btn").classList.remove("active");
    });

    document.getElementById("show-attendance-btn").addEventListener("click", function () {
        document.getElementById("fencer-training-charts-container").classList.add("d-none");
        document.getElementById("fencer-attendance-chart-container").classList.remove("d-none");
        document.getElementById("fencer-competitions-container").classList.add("d-none");
        this.classList.add("active");
        document.getElementById("show-training-btn").classList.remove("active");
        document.getElementById("show-competitions-btn").classList.remove("active");
    });

    document.getElementById("show-competitions-btn").addEventListener("click", function () {
        document.getElementById("fencer-training-charts-container").classList.add("d-none");
        document.getElementById("fencer-attendance-chart-container").classList.add("d-none");
        document.getElementById("fencer-competitions-container").classList.remove("d-none");
        this.classList.add("active");
        document.getElementById("show-training-btn").classList.remove("active");
        document.getElementById("show-attendance-btn").classList.remove("active");
    });
});

let chartInstances = []; // Para destruir los gráficos anteriores

async function showFencerTrainingChart(fencerId) {
    try {
        const response = await fetch(`/getFencerWorkouts/${fencerId}`);
        const data = await response.json();

        const chartsContainer = document.getElementById('fencer-training-charts');
        const emptyMsg = document.getElementById('training-empty-message');
        chartsContainer.innerHTML = '';
        emptyMsg.classList.add('d-none');

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

            if (Object.keys(monthlyStats).length === 0) {
                emptyMsg.classList.remove('d-none');
                return false;
            }

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

            return true;
        } else {
            emptyMsg.classList.remove('d-none');
            return false;
        }
    } catch (error) {
        showAlert("Error al obtener los entrenamientos del tirador");
        return false;
    }
}
let attendanceChartInstance = null;
let attendanceDataCache = [];

async function showFencerAttendanceChart(fencerId) {
    try {
        const response = await fetch(`/getFencerAttendance/${fencerId}`);
        const data = await response.json();

        // Siempre oculta el mensaje y muestra los controles por defecto
        document.getElementById('attendance-empty-message').classList.add('d-none');
        document.getElementById('attendance-controls').classList.remove('d-none');
        document.getElementById('fencer-attendance-chart').classList.remove('d-none');

        if (data.success) {
            attendanceDataCache = data.attendance || [];
            // Agrupar por mes
            const months = {};
            attendanceDataCache.forEach(a => {
                if (!a.date) return;
                const date = new Date(a.date);
                if (isNaN(date.getTime())) return;
                const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!months[month]) months[month] = [];
                months[month].push(a);
            });

            if (Object.keys(months).length === 0) {
                document.getElementById('attendance-controls').classList.add('d-none');
                document.getElementById('fencer-attendance-chart').classList.add('d-none');
                document.getElementById('attendance-empty-message').classList.remove('d-none');
                if (attendanceChartInstance) attendanceChartInstance.destroy();
                return false;
            }

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
            document.getElementById('fencer-attendance-chart').classList.remove('d-none');

            // Mostrar el mes más reciente por defecto
            if (monthSelect.options.length > 0) {
                monthSelect.value = monthSelect.options[monthSelect.options.length - 1].value;
                renderAttendanceChart(monthSelect.value);
            }

            // Cambiar de mes
            monthSelect.onchange = function() {
                renderAttendanceChart(this.value);
            };

            return true;
        } else {
            document.getElementById('attendance-controls').classList.add('d-none');
            document.getElementById('fencer-attendance-chart').classList.add('d-none');
            document.getElementById('attendance-empty-message').classList.remove('d-none');
            if (attendanceChartInstance) attendanceChartInstance.destroy();
            return false;
        }
    } catch (error) {
        showAlert("Error al obtener las asistencias del tirador");
        return false;
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
                        stepSize: 0.5, // <-- 0.5 horas = 30 minutos
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

async function showFencerCompetitions(fencerId) {
    const tableBody = document.querySelector("#fencer-competitions-table tbody");
    const emptyMsg = document.getElementById("competitions-empty-message");
    tableBody.innerHTML = "";
    emptyMsg.classList.add("d-none");

    try {
        const response = await fetch(`/getFencerCompetitions/${fencerId}`);
        const data = await response.json();

        if (data.success && data.competitions.length > 0) {
            data.competitions.forEach(comp => {
                // Busca la etapa más baja si existe en data.de
                let stage = "";
                if (data.de && data.de.length > 0) {
                    const deEntries = data.de.filter(de => de.competition_entry_id === comp.id);
                    if (deEntries.length > 0) {
                        // Etapa más baja (última alcanzada)
                        const minStage = deEntries.reduce((min, curr) => {
                            const currStage = parseInt(curr.stage, 10);
                            return (isNaN(currStage) ? min : Math.min(min, currStage));
                        }, Infinity);
                        stage = isFinite(minStage) ? minStage : "";
                    }
                }
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${comp.title || ""}</td>
                    <td>${comp.competition_date ? new Date(comp.competition_date).toLocaleDateString() : ""}</td>
                    <td>${comp.location || ""}</td>
                    <td>${comp.final_position ?? ""}</td>
                    <td>${comp.wins_pool ?? ""}</td>
                    <td>${comp.losses_pool ?? ""}</td>
                    <td>${comp.passed_pool === true ? "Sí" : comp.passed_pool === false ? "No" : ""}</td>
                    <td>${stage}</td>
                `;
                tableBody.appendChild(tr);
            });
            return true;
        } else {
            emptyMsg.classList.remove("d-none");
            return false;
        }
    } catch (error) {
        emptyMsg.textContent = "Error al cargar las competiciones.";
        emptyMsg.classList.remove("d-none");
        return false;
    }
}
