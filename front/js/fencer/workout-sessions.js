import { showPanel } from './shared-functions.js';
import { formatDateYYYYMMDD } from './shared-functions.js';

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
            let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            while (current <= endDate) {
                dates.push(formatDateYYYYMMDD(current)); // Guardar como string YYYY-MM-DD
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
    selectedDates = dates; // ahora son strings YYYY-MM-DD
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
            <h4>Entrenamiento para el ${new Date(selectedDates[step]).toLocaleDateString()}</h4>
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
    const date = selectedDates[step]; // string YYYY-MM-DD
    const tpl = template || {};
    const originalTemplate = template ? { ...template } : null;

    let buttonsHtml = '';
    if (step > 0) {
        buttonsHtml += `<button type="button" id="back-btn" class="btn btn-secondary me-2">Atrás</button>`;
    }
    buttonsHtml += `<button type="submit" class="btn btn-primary">${step < selectedDates.length - 1 ? 'Siguiente' : 'Guardar todo'}</button>`;

    let formHtml = `
        <form id="workout-form">
            <h4>Entrenamiento para el ${new Date(date).toLocaleDateString()}</h4>
            <div class="mb-3">
                <label>Título</label>
                <input type="text" class="form-control" name="title" value="${tpl.title || ''}" required>
            </div>
            <div class="mb-3">
                <label>Fecha</label>
                <input type="date" class="form-control" name="date" value="${date}" required readonly>
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
        // Añadir el template_id correspondiente a este paso
        data.template_id = usedTemplateIds[step] || null;
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
            // 1. Crear primero las plantillas para los entrenos nuevos o editados y obtener sus IDs
    const plantillaPromises = workoutsData.map(async (tplData, idx) => {
        if (!usedTemplateIds[idx]) {
            // Crear plantilla y devolver el id
            const res = await fetch('/createTrainingTemplate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    title: tplData.title.trim(),
                    description: tplData.description.trim(),
                    duration: tplData.duration,
                    number_of_sets: tplData.number_of_sets,
                    number_of_reps: tplData.number_of_reps
                })
            });
            const result = await res.json();
            // Guarda el id de la plantilla creada
            usedTemplateIds[idx] = result.id;
            tplData.template_id = result.id;
        } else {
            tplData.template_id = usedTemplateIds[idx];
        }
        return tplData;
    });

    // Esperar a que todas las plantillas estén creadas y los template_id asignados
    Promise.all(plantillaPromises).then(async (workoutsWithTemplates) => {
        // 2. Guardar todos los entrenamientos con su template_id
        const res = await fetch('/createPersonalWorkout', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({workouts: workoutsWithTemplates})
        });
        const result = await res.json();
        if (result.success) {
            document.getElementById('workout-message').innerHTML = '<div class="alert alert-success mt-3">Entrenamientos guardados correctamente.</div>';
            document.getElementById('workouts-form').innerHTML = '';
            selectedDates = [];
            workoutsData = [];
            usedTemplateIds = [];
            currentStep = 0;
            document.getElementById('dateRange')._flatpickr.clear();
        } else {
            document.getElementById('workout-message').innerHTML = '<div class="alert alert-danger mt-3">Error al guardar entrenamientos.</div>';
        }
    }).catch(() => {
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

    document.getElementById('upcoming-workouts-link').addEventListener('click', function(e) {
        e.preventDefault(); // Prevenir el envío del formulario
        document.querySelector("#sidebar").classList.toggle("collapsed");
        showPanel("workout-calendar");
        
        cargarEntrenamientosYCalendario();
    });


    var calendarEl = document.getElementById('calendar');
    // Función para cargar entrenamientos y calendario
    async function cargarEntrenamientosYCalendario() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        let eventos = [];
        try {
            // 1. Entrenamientos personales
            const res = await fetch('/getWorkouts');
            const data = await res.json();
            if (data.success && Array.isArray(data.workouts)) {
                eventos = data.workouts.map(w => ({
                    id: w.id,
                    title: w.title,
                    start: w.date,
                    backgroundColor: '#007bff',
                    borderColor: '#007bff',
                    extendedProps: {
                        description: w.description.trim(),
                        duration: w.duration,
                        number_of_sets: w.number_of_sets,
                        number_of_reps: w.number_of_reps,
                        tipo: 'personal'
                    }
                }));
            }

            // 2. Entrenamientos del coach
            const resCoach = await fetch('/getFencerCoachSessions');
            const dataCoach = await resCoach.json();
            if (dataCoach.success && Array.isArray(dataCoach.workouts)) {
                const coachEvents = dataCoach.workouts.map(w => ({
                    id: `coach-${w.date}-${w.title}`,
                    title: w.title ? `Coach: ${w.title}` : 'Entrenamiento coach',
                    start: w.date,
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    extendedProps: {
                        description: w.description.trim(),
                        duration: w.duration,
                        number_of_sets: w.number_of_sets,
                        number_of_reps: w.number_of_reps,
                        tipo: 'coach'
                    }
                }));
                eventos = eventos.concat(coachEvents);
            }
        } catch (e) {
            console.error('Error cargando entrenamientos:', e);
        }

        // Función para obtener el headerToolbar según el ancho
        function getHeaderToolbar() {
            if (window.innerWidth < 600) {
                return {
                    left: 'prev,next',
                    center: 'title',
                    right: ''
                };
            } else {
                return {
                    left: 'prev,next',
                    center: 'title',
                    right: ''
                };
            }
        }

        // Inicializar el calendario
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: window.innerWidth < 600 ? 'listDay' : 'dayGridMonth',
            initialDate: new Date(),
            locale: 'es',
            headerToolbar: getHeaderToolbar(),
            events: eventos,
            height: 'auto',
            eventClick: function(info) {
                info.jsEvent.stopPropagation();
                const e = info.event;
                const props = e.extendedProps;
                const detalles = `
                    <strong>${e.title}</strong><br>
                    <b>Fecha:</b> ${e.start.toLocaleDateString()}<br>
                    <b>Descripción:</b><br>
                    <div style="white-space: pre-wrap; margin-bottom:8px;">${props.description}</div>
                    <b>Duración:</b> ${props.duration} min<br>
                    <b>Sets:</b> ${props.number_of_sets}<br>
                    <b>Repeticiones:</b> ${props.number_of_reps}
                `;
                const popup = document.getElementById('workout-details-popup');
                popup.innerHTML = detalles;
                popup.style.display = 'block';
                const mouseEvent = info.jsEvent;
                popup.style.left = mouseEvent.pageX + 15 + 'px';
                popup.style.top = mouseEvent.pageY - 10 + 'px';
                popup.onclick = function(ev) { ev.stopPropagation(); };
            }
    });
    calendar.render();

    function updateCalendarView() {
        if (window.innerWidth < 600) {
            calendar.changeView('listWeek');
            calendar.setOption('headerToolbar', getHeaderToolbar());
        } else {
            calendar.changeView('dayGridMonth');
            calendar.setOption('headerToolbar', getHeaderToolbar());
        }
    }
    updateCalendarView();
    window.addEventListener('resize', updateCalendarView);

    document.addEventListener('click', function() {
        const popup = document.getElementById('workout-details-popup');
        popup.style.display = 'none';
    });
}
});

/* ----------------------------------------------- ¿Qué hay para hoy? ---------------------------------------------- */

document.getElementById('todays-session-link').addEventListener('click', async function(e) {
    e.preventDefault();
    document.querySelector("#sidebar").classList.toggle("collapsed");
    showPanel("todays-session");

    try {
        const getPersonalWorkoutToday = await fetch('/getPersonalWorkoutToday');
        const dataPersonal = await getPersonalWorkoutToday.json();

        const getCoachWorkoutToday = await fetch('/getCoachWorkoutToday');
        const dataCoach = await getCoachWorkoutToday.json();

        // Referencias a los contenedores
        const coachSession = document.getElementById('coachSession');
        const personalSession = document.getElementById('personalSession');

        if (!coachSession || !personalSession) {
            alert('Error: No se encontraron los contenedores de sesión en la página.');
            return;
        }

        /* Si solo hay sesión del coach, solo se muestra ese contenedor y ocupa todo el ancho.
        Si solo hay sesión personal, solo se muestra ese contenedor y ocupa todo el ancho.
        Si hay ambas, se muestran ambos al 50%.
        Si no hay ninguna, ambos desaparecen. */

        // Limpia clases antes de añadir nuevas
        coachSession.classList.remove('d-none', 'col-md-6', 'col-md-12', 'col-12');
        personalSession.classList.remove('d-none', 'col-md-6', 'col-md-12', 'col-12');

        // Mostrar/ocultar según haya datos
        let showCoach = dataCoach && dataCoach.success && dataCoach.workout && dataCoach.workout.length > 0;
        let showPersonal = dataPersonal && dataPersonal.success && dataPersonal.workout && dataPersonal.workout.length > 0;

        if (showCoach && showPersonal) {
            coachSession.classList.add('col-12');
            personalSession.classList.add('col-12');
            coachSession.classList.remove('d-none');
            personalSession.classList.remove('d-none');

        } else if (showCoach) {
            coachSession.classList.add('col-12');
            coachSession.classList.remove('d-none');
            personalSession.classList.add('d-none');
        } else if (showPersonal) {
            personalSession.classList.add('col-12');
            personalSession.classList.remove('d-none');
            coachSession.classList.add('d-none');
        } else {
            coachSession.classList.add('d-none');
            personalSession.classList.add('d-none');
            alert('No hay sesiones disponibles para hoy.');
        }

        // Rellenar contenido
        // Mostrar todos los workouts del coach
        if (showCoach) {
        coachSession.innerHTML = dataCoach.workout.map(coachWorkout => `
            <div class="panel-box-today-sessions">
                <h2 style="color:#B59E4Cff;">${coachWorkout.title}</h2>
                <p class="mb-1"><strong>Sesión del Coach</strong></p>
                <p class="mb-1"><strong>Duración:</strong> ${coachWorkout.duration} minutos</p>
                <p class="mb-1"><strong>Sets:</strong> ${coachWorkout.number_of_sets}</p>
                <p class="mb-1"><strong>Repeticiones:</strong> ${coachWorkout.number_of_reps}</p>
                <p class="mb-1 mt-4" style="white-space: pre-wrap; background: #F0E1ADff; padding: 15px; border-radius: 4px;">${coachWorkout.description.trim()}</p>
                <input type="hidden" name="template_id" value="${coachWorkout.template_id || ''}">
                ${
                    coachWorkout.is_completed
                    ? `<button class="btn btn-secondary mt-4" disabled>Completado</button>`
                    : `<button class="btn btn-primary mt-4 btn-completar-coach" data-id="${coachWorkout.id}">No completado</button>`
                }
            </div>
        `).join('');

        // Solo añade listeners a los botones "No completado" del coach
        document.querySelectorAll('.btn-completar-coach').forEach(btn => {
            btn.addEventListener('click', async function() {
                const workoutId = this.getAttribute('data-id');
                this.textContent = 'Completado';
                this.classList.remove('btn-primary');
                this.classList.add('btn-secondary');
                this.disabled = true;
                // Aquí tu fetch para marcar como completado en el backend
                const res = await fetch('/completeCoachWorkout', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ workoutId: workoutId })
                });
                const result = await res.json();
                alert(result.success ? 'Sesión del coach marcada como completada.' : 'Error al marcar la sesión del coach como completada.');
            });
        });
        } else {
            coachSession.innerHTML = '';
        }

        if (showPersonal) {
        personalSession.innerHTML = dataPersonal.workout.map(personalWorkout => `
            <div class="panel-box-today-sessions"> 
                <h2 style="color:#B59E4Cff;">${personalWorkout.title}</h2>
                <p class="mb-1"><strong>Sesión personal</strong></p>
                <p class="mb-1"><strong>Duración:</strong> ${personalWorkout.duration} minutos</p>
                <p class="mb-1"><strong>Sets:</strong> ${personalWorkout.number_of_sets}</p>
                <p class="mb-1"><strong>Repeticiones:</strong> ${personalWorkout.number_of_reps}</p>
                <p class="mb-1" style="white-space: pre-wrap; background: #F0E1ADff; padding: 15px; border-radius: 4px;">${personalWorkout.description.trim()}</p>
                <input type="hidden" name="personal_workout_id" value="${personalWorkout.id || ''}">
                <input type="hidden" name="template_id" value="${personalWorkout.template_id || ''}">
                ${
                    personalWorkout.is_completed
                    ? `<button class="btn btn-secondary mt-4" disabled>Completado</button>`
                    : `<button class="btn btn-primary mt-4 btn-completar" data-id="${personalWorkout.id}">No completado</button>`
                }
            </div>
        `).join('');

        // Solo añade listeners a los botones "No completado"
        document.querySelectorAll('.btn-completar').forEach(btn => {
            btn.addEventListener('click', async function() {
                const workoutId = this.getAttribute('data-id');
                this.textContent = 'Completado';
                this.classList.remove('btn-primary');
                this.classList.add('btn-secondary');
                this.disabled = true;
                const res = await fetch('/completeWorkout', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ workoutId: workoutId })
                });
                const result = await res.json();
                alert(result.success ? 'Sesión marcada como completada.' : 'Error al marcar la sesión como completada.');
            });
        });
        } else {
            personalSession.innerHTML = '';
        }
    } catch (error) {
        alert('Error al cargar las sesiones de hoy: ' + error.message);
    }
});