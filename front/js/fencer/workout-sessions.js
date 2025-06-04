import { showPanel } from './shared-functions.js';

document.addEventListener("DOMContentLoaded", function () {
    /* ----------------------------------------- Crear entrenamientos ---------------------------------------- */
    const createWorkoutButton = document.getElementById("create-workout-link");

    createWorkoutButton.addEventListener("click", async function (e) {
        e.preventDefault(); // Prevenir el envío del formulario
        document.querySelector("#sidebar").classList.toggle("collapsed");
        showPanel("create-workout");

    });


let workoutsData = [];
let currentStep = 0;
let selectedDates = [];
let trainingTemplates = [];
let usedTemplateIds = [];

flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    onClose: function(selectedDatesArr) {
        if (selectedDatesArr.length === 2) {
            const start = selectedDatesArr[0];
            const end = selectedDatesArr[1];
            const dates = [];
            let current = new Date(start);
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            // Obtener plantillas antes de iniciar el wizard
            fetch('/getTrainingTemplates')
                .then(res => res.json())
                .then(data => {
                    trainingTemplates = data.templates || [];
                    startWorkoutWizard(dates);
                });
        }
    }
});


function startWorkoutWizard(dates) {
    selectedDates = dates;
    workoutsData = Array(dates.length).fill(null);
    usedTemplateIds = Array(dates.length).fill(null);
    currentStep = 0;
    showTemplateSelector(currentStep);
}

// Muestra el selector de plantillas para el entrenamiento
// y permite crear un nuevo entrenamiento si no se selecciona ninguna plantilla
function showTemplateSelector(step) {
    let options = `<option value="">Crear desde cero</option>`;
    trainingTemplates.forEach((tpl, idx) => {
        options += `<option value="${idx}">${tpl.title}</option>`;
    });
    const html = `
        <form id="template-select-form">
            <h4>Entrenamiento para el ${selectedDates[step].toLocaleDateString()}</h4>
            <div class="mb-3">
                <label>Usar plantilla:</label>
                <select class="form-select" id="template-select">${options}</select>
            </div>
            <button type="submit" class="btn btn-primary">Siguiente</button>
        </form>
    `;
    document.getElementById('workouts-form').innerHTML = html;
    document.getElementById('template-select-form').onsubmit = function(e) {
        e.preventDefault();
        const idx = document.getElementById('template-select').value;
        if (idx === "") {
            usedTemplateIds[step] = null;
            showWorkoutForm(step, null);
        } else {
            usedTemplateIds[step] = trainingTemplates[idx].id;
            showWorkoutForm(step, trainingTemplates[idx]);
        }
    };
}

// Muestra el formulario de entrenamiento para el paso actual
function showWorkoutForm(step, template) {
    const date = selectedDates[step];
    const tpl = template || {};
    const originalTemplate = template ? { ...template } : null;

    let buttonsHtml = '';
    if (step > 0) {
        buttonsHtml += `<button type="button" id="back-btn" class="btn btn-secondary me-2">Atrás</button>`;
    }
    buttonsHtml += `<button type="submit" class="btn btn-primary">${step < selectedDates.length - 1 ? 'Siguiente' : 'Guardar todo'}</button>`;

    let formHtml = `
        <form id="workout-form">
            <h4>Entrenamiento para el ${date.toLocaleDateString()}</h4>
            <div class="mb-3">
                <label>Título</label>
                <input type="text" class="form-control" name="title" value="${tpl.title || ''}" required>
            </div>
            <div class="mb-3">
                <label>Fecha</label>
                <input type="date" class="form-control" name="date" value="${date.toISOString().slice(0,10)}" required readonly>
            </div>
            <div class="mb-3">
                <label>Descripción</label>
                <textarea class="form-control" name="description" required>${tpl.description || ''}</textarea>
            </div>
            <div class="mb-3">
                <label>Duración (minutos)</label>
                <input type="number" class="form-control" name="duration" value="${tpl.duration || ''}" required>
            </div>
            <div class="mb-3">
                <label>Feedback</label>
                <textarea class="form-control" name="feedback"></textarea>
            </div>
            <div class="mb-3">
                <label>Número de sets</label>
                <input type="number" class="form-control" name="number_of_sets" value="${tpl.number_of_sets || ''}" required>
            </div>
            <div class="mb-3">
                <label>Número de repeticiones</label>
                <input type="number" class="form-control" name="number_of_reps" value="${tpl.number_of_reps || ''}" required>
            </div>
            <div class="d-flex justify-content-end gap-2">
                ${buttonsHtml}
            </div>
        </form>
    `;
    document.getElementById('workouts-form').innerHTML = formHtml;

    document.getElementById('workout-form').onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        workoutsData[step] = data;

        // Marcar si hay cambios respecto a la plantilla original
        if (originalTemplate) {
            const changed =
                data.title !== originalTemplate.title ||
                data.description !== originalTemplate.description ||
                String(data.duration) !== String(originalTemplate.duration) ||
                String(data.number_of_sets) !== String(originalTemplate.number_of_sets) ||
                String(data.number_of_reps) !== String(originalTemplate.number_of_reps);
            if (changed) {
                usedTemplateIds[step] = null;
            }
        }

        if (step < selectedDates.length - 1) {
            currentStep++;
            showTemplateSelector(currentStep);
        } else {
            // Guardar todos los entrenamientos y plantillas nuevas
            fetch('/createWorkout', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({workouts: workoutsData})
            })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    // Guardar como plantilla todos los entrenos creados desde cero o editados
                    workoutsData.forEach((tplData, idx) => {
                        if (!usedTemplateIds[idx]) {
                            fetch('/createTrainingTemplate', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({
                                    title: tplData.title,
                                    description: tplData.description,
                                    duration: tplData.duration,
                                    number_of_sets: tplData.number_of_sets,
                                    number_of_reps: tplData.number_of_reps
                                })
                            });
                        }
                    });
                    document.getElementById('workout-message').innerHTML = '<div class="alert alert-success mt-3">Entrenamientos guardados correctamente.</div>';
                    // Resetear el formulario
                    document.getElementById('workouts-form').innerHTML = '';
                    selectedDates = [];
                    workoutsData = [];
                    usedTemplateIds = [];
                    currentStep = 0;
                    document.getElementById('dateRange')._flatpickr.clear(); // Limpiar el selector de fechas

                } else {
                    document.getElementById('workout-message').innerHTML = '<div class="alert alert-danger mt-3">Error al guardar entrenamientos.</div>';
                }
            })
            .catch(() => {
                document.getElementById('workout-message').innerHTML = '<div class="alert alert-danger mt-3">Error de conexión.</div>';
            });
        }
    }
    if (step > 0) {
        document.getElementById('back-btn').onclick = function() {
            currentStep--;
            showTemplateSelector(currentStep);
        };
    }
    };

    /* ----------------------------------------- Calendario de entrenamientos ---------------------------------------- */
    cargarEntrenamientosYCalendario();
    var calendarEl = document.getElementById('calendar');
    // Función para cargar entrenamientos y calendario
    async function cargarEntrenamientosYCalendario() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    // 1. Obtener entrenamientos de la BD
    let eventos = [];
    try {
        const res = await fetch('/getWorkouts'); // Ajusta la ruta si es necesario
        const data = await res.json();
        if (data.success && Array.isArray(data.workouts)) {
        eventos = data.workouts.map(w => ({
            id: w.id,
            title: w.title,
            start: w.date, // Asegúrate que tu backend envía la fecha en formato ISO
            extendedProps: {
            description: w.description,
            duration: w.duration,
            number_of_sets: w.number_of_sets,
            number_of_reps: w.number_of_reps
            }
        }));
        }
    } catch (e) {
        console.error('Error cargando entrenamientos:', e);
    }

    // 2. Inicializar el calendario
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: eventos,
        eventClick: function(info) {
            info.jsEvent.stopPropagation();
            // Mostrar detalles en un div flotante
            const e = info.event;
            const props = e.extendedProps;
            const detalles = `
                <strong>${e.title}</strong><br>
                <b>Fecha:</b> ${e.start.toLocaleString()}<br>
                <b>Descripción:</b> ${props.description}<br>
                <b>Duración:</b> ${props.duration} min<br>
                <b>Sets:</b> ${props.number_of_sets}<br>
                <b>Repeticiones:</b> ${props.number_of_reps}
            `;
            const popup = document.getElementById('workout-details-popup');
            popup.innerHTML = detalles;
            popup.style.display = 'block';

            // Posicionar el popup cerca del mouse
            const mouseEvent = info.jsEvent;
            popup.style.left = mouseEvent.pageX + 15 + 'px';
            popup.style.top = mouseEvent.pageY - 10 + 'px';

            // Evitar que el click en el popup lo cierre
            popup.onclick = function(ev) { ev.stopPropagation(); };
        }
    });
    calendar.render();

    function updateCalendarView() {
      if (window.innerWidth < 600) {
        calendar.changeView('listWeek');
      } else {
        calendar.changeView('dayGridMonth');
      }
    }
    updateCalendarView();
    window.addEventListener('resize', updateCalendarView);

    // Ocultar el popup al hacer click fuera
    document.addEventListener('click', function() {
        const popup = document.getElementById('workout-details-popup');
        popup.style.display = 'none';
    });

}
});