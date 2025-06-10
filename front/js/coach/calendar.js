import { showPanel } from "./shared-functions.js";
import { showAlert } from "./shared-functions.js";
import {showConfirm} from "./shared-functions.js";

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("training-calendar-link").addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector("#sidebar").classList.toggle("collapsed");
        showPanel("workout-calendar");
        cargarEntrenamientosYCalendarioCoach();
    });

    // Función para cargar entrenamientos y calendario del coach
    async function cargarEntrenamientosYCalendarioCoach() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        // Limpia el calendario anterior si existe
        if (window.coachCalendar) {
            window.coachCalendar.destroy();
        }

        let eventos = [];
        try {
            const res = await fetch('/getCoachWorkouts');
            const data = await res.json();
            if (data.success && Array.isArray(data.workouts)) {
                eventos = data.workouts.map(w => ({
                    // Puedes usar solo el nombre o el nombre completo:
                    id: w.id,
                    title: `${w.name} ${w.surname} ${w.secondsurname}`,
                    start: w.date,
                    color: colorPorFencerId(w.fencer_id),
                    extendedProps: {
                        description: w.description,
                        duration: w.duration,
                        number_of_sets: w.number_of_sets,
                        number_of_reps: w.number_of_reps,
                        fencerName: `${w.name} ${w.surname} ${w.secondsurname}`,
                        workoutTitle: w.title // Si quieres mostrarlo en el popup
                    }
                }));
            }

        } catch (e) {
            console.error('Error cargando entrenamientos:', e);
            showAlert('Error al cargar los entrenamientos del coach');
        }

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

        window.coachCalendar = new FullCalendar.Calendar(calendarEl, {
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
                let detalles = `
                    <strong>${e.title}</strong><br>
                    <b>Título entrenamiento:</b> ${props.workoutTitle || ''}<br>
                    <b>Fecha:</b> ${e.start.toLocaleDateString()}<br>
                    <b>Descripción:</b><br>
                    <div style="white-space: pre-wrap; margin-bottom:8px;">${props.description}</div>
                    <b>Duración:</b> ${props.duration} min<br>
                    <b>Sets:</b> ${props.number_of_sets}<br>
                    <b>Repeticiones:</b> ${props.number_of_reps}
                `;

                // Botón de borrar
                    detalles += `<br><button id="delete-coach-workout" class="btn btn-sm mt-2"><i class="lni lni-trash-3"></i></button>`;

                const popup = document.getElementById('workout-details-popup');
                popup.innerHTML = detalles;
                popup.style.display = 'block';
                const mouseEvent = info.jsEvent;
                popup.style.left = mouseEvent.pageX + 15 + 'px';
                popup.style.top = mouseEvent.pageY - 10 + 'px';
                popup.onclick = function(ev) { ev.stopPropagation(); };

                // Listener para borrar
                setTimeout(() => {
                    const btn = document.getElementById('delete-coach-workout');
                    if (btn) {
                        btn.onclick = function() {
                            showConfirm('¿Seguro que quieres borrar este entrenamiento?', async function() {
                                const res = await fetch('/deleteCoachWorkout', {
                                    method: 'POST',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({ workoutId: e.id })
                                });
                                const result = await res.json();
                                if (result.success) {
                                    showAlert('Entrenamiento borrado.');
                                    popup.style.display = 'none';
                                    cargarEntrenamientosYCalendarioCoach(); // Recarga el calendario
                                } else {
                                    showAlert('Error al borrar entrenamiento.');
                                }
                            });
                        };
                    }
                }, 100);
            }
        });
        window.coachCalendar.render();

        function updateCalendarView() {
            if (window.innerWidth < 600) {
                window.coachCalendar.changeView('listWeek');
                window.coachCalendar.setOption('headerToolbar', getHeaderToolbar());
            } else {
                window.coachCalendar.changeView('dayGridMonth');
                window.coachCalendar.setOption('headerToolbar', getHeaderToolbar());
            }
        }
        updateCalendarView();
        window.addEventListener('resize', updateCalendarView);

        document.addEventListener('click', function() {
            const popup = document.getElementById('workout-details-popup');
            if (popup) popup.style.display = 'none';
        });
    }

    function colorPorFencerId(id) {
        // Convierte el id a un color HSL único y agradable
        const hue = (parseInt(id, 10) * 137) % 360; // 137 da buena dispersión de colores
        return `hsl(${hue}, 65%, 55%)`;
    }
});
