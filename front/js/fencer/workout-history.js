import { showPanel, showAlert, showConfirm, fencersCoach, formatDateYYYYMMDD } from '../shared-functions.js';


let allWorkouts = [];
let currentType = 'all';
let currentStatus = 'all';

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('workout-history-link').addEventListener('click', async () => {
        showPanel('workout-history');
        try {
            // Fetch personales
            const resPersonal = await fetch('/getHistoryWorkouts');
            const dataPersonal = await resPersonal.json();
            const personal = (dataPersonal.workouts || dataPersonal || []).map(w => ({
                ...w,
                tipo: 'personal'
            }));

            // Fetch entrenador
            const resCoach = await fetch('/getHistoryWorkoutsCoach');
            const dataCoach = await resCoach.json();
            const coach = (dataCoach.workouts || dataCoach || []).map(w => ({
                ...w,
                tipo: 'coach'
            }));

            allWorkouts = [...personal, ...coach];
            renderWorkoutList('all', 'all');
            renderWorkoutHistoryChart();
        } catch (e) {
            showAlert('Error al cargar el historial: ' + e.message);
        }
    });

    // Filtros tipo
    document.getElementById('filter-type-all').addEventListener('click', () => {
        setActiveButton('type-filter-group', 'filter-type-all');
        renderWorkoutList('all', currentStatus);
    });
    document.getElementById('filter-type-personal').addEventListener('click', () => {
        setActiveButton('type-filter-group', 'filter-type-personal');
        renderWorkoutList('personal', currentStatus);
    });
    document.getElementById('filter-type-coach').addEventListener('click', () => {
        setActiveButton('type-filter-group', 'filter-type-coach');
        renderWorkoutList('coach', currentStatus);
    });
    // Filtros estado
    document.getElementById('filter-status-all').addEventListener('click', () => {
        setActiveButton('status-filter-group', 'filter-status-all');
        renderWorkoutList(currentType, 'all');
    });
    document.getElementById('filter-status-completed').addEventListener('click', () => {
        setActiveButton('status-filter-group', 'filter-status-completed');
        renderWorkoutList(currentType, 'completed');
    });
    document.getElementById('filter-status-not-completed').addEventListener('click', () => {
        setActiveButton('status-filter-group', 'filter-status-not-completed');
        renderWorkoutList(currentType, 'not-completed');
    });
});

function renderWorkoutList(type, status) {
    currentType = type;
    currentStatus = status;
    const list = document.getElementById('workout-history-list');
    const pagination = document.getElementById('workout-history-pagination');
    list.innerHTML = '';
    if (pagination) pagination.innerHTML = '';

    let filtered = allWorkouts;

    // Filtrar por tipo
    if (type !== 'all') {
        filtered = filtered.filter(w => w.tipo === type);
    }
    // Filtrar por estado
    if (status === 'completed') {
        filtered = filtered.filter(w => w.is_completed === true || w.is_completed === 1);
    } else if (status === 'not-completed') {
        filtered = filtered.filter(w => w.is_completed === false || w.is_completed === 0);
    }

    // Filtrar solo entrenamientos anteriores a hoy
    const today = new Date();
    today.setHours(0,0,0,0);
    filtered = filtered.filter(w => {
        let fecha = w.date || w.fecha || w.workout_date || '';
        if (!fecha) return false;
        try {
            const workoutDate = new Date(fecha);
            const workoutDay = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
            return workoutDay < today;
        } catch {
            return false;
        }
    });

    if (filtered.length === 0) {
        list.innerHTML = '<div class="list-group-item text-center">No hay entrenamientos para mostrar.</div>';
        if (pagination) pagination.innerHTML = '';
        return;
    }

    // Paginación con pagination.js
    $('#workout-history-pagination').pagination({
        dataSource: filtered,
        pageSize: 9, 
        showNext: true,
        callback: function(data, pagination) {
            list.innerHTML = '';
            data.forEach(w => {
                // Formatea la fecha si existe
                let fecha = w.date || w.fecha || w.workout_date || '';
                if (fecha) {
                    try {
                        fecha = new Date(fecha).toLocaleDateString('es-ES');
                    } catch {}
                }
                const statusBadge = (w.is_completed === true || w.is_completed === 1)
                    ? '<span class="badge bg-success" style="background-color: #B59E4Cff !important; color: white;">Completado</span>' 
                    : '<span class="badge bg-secondary">No completado</span>';
                const tipoBadge = w.tipo === 'coach'
                    ? '<span style="color: #ffffff; background-color: #B59E4Cff; font-size: 0.8em; border-radius: 4px; padding: 0.2em 0.2em;" class="badge-none">Entrenador</span>'
                    : '<span style="color: #B59E4Cff; border: 1px solid #B59E4Cff; font-size: 0.8em; border-radius: 4px; padding: 0.2em 0.2em;" class="badge-none">Personal</span>';
                list.innerHTML += `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                            <span class="me-2 text-muted" style="font-size:0.95em;">
                                <i class="lni lni-calendar"></i> ${fecha ? fecha : ''}
                            </span>
                            <strong>${w.title}</strong> ${tipoBadge}
                        </span>
                        ${statusBadge}
                    </div>
                `;
            });
        }
    });
}

function setActiveButton(groupId, buttonId) {
    const group = document.getElementById(groupId);
    if (!group) return;
    Array.from(group.getElementsByClassName('btn-history')).forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(buttonId);
    if (btn) btn.classList.add('active');
}
function renderWorkoutHistoryChart() {
    // Agrupa por mes y cuenta completados/no completados SOLO de entrenos pasados
    const monthly = {};
    const today = new Date();
    today.setHours(0,0,0,0);

    allWorkouts.forEach(w => {
        let fecha = w.date || w.fecha || w.workout_date || '';
        if (!fecha) return;
        const d = new Date(fecha);
        const workoutDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (workoutDay >= today) return; // Solo pasados

        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        if (!monthly[key]) monthly[key] = { completed: 0, notCompleted: 0 };
        if (w.is_completed === true || w.is_completed === 1) {
            monthly[key].completed++;
        } else {
            monthly[key].notCompleted++;
        }
    });

    // Ordena los meses
    const labels = Object.keys(monthly).sort();
    const completedData = labels.map(m => monthly[m].completed);
    const notCompletedData = labels.map(m => monthly[m].notCompleted);

    // Destruye el gráfico anterior si existe
    if (window.workoutHistoryChart) window.workoutHistoryChart.destroy();

    const ctx = document.getElementById('workout-history-chart').getContext('2d');
    window.workoutHistoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => {
                const [y, m] = l.split('-');
                return `${m}/${y}`;
            }),
            datasets: [
                {
                    label: 'Completados',
                    data: completedData,
                    backgroundColor: '#B59E4C',
                },
                {
                    label: 'No completados',
                    data: notCompletedData,
                    backgroundColor: '#888',
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Entrenamientos completados vs no completados por mes' }
            },
            // Quita stacked para columnas separadas
            scales: {
                x: { stacked: false },
                y: { stacked: false, beginAtZero: true }
            }
        }
    });
}