import { showPanel, fencersCoach } from './shared-functions.js';
import { formatDateYYYYMMDD } from './shared-functions.js';

// Función para cargar los tiradores vinculados al entrenador
// y crear el selector de Choices
async function fencerChoices() {
    // Cargar tiradores vinculados
        const dataFencers = await fencersCoach();
        const fencerSelect = document.getElementById("fencerSelector");
        fencerSelect.innerHTML = "";
        dataFencers.forEach(fencer => {
            const option = document.createElement("option");
            option.value = fencer.id;
            option.textContent = `${fencer.name} ${fencer.surname} ${fencer.secondsurname}`;
            fencerSelect.appendChild(option);
        });
        if (window.fencerChoices) window.fencerChoices.destroy();
        window.fencerChoices = new Choices(fencerSelect, {
            removeItemButton: true,
            placeholderValue: 'Selecciona uno o varios tiradores',
            searchPlaceholderValue: 'Buscar tirador...',
            noResultsText: 'No hay coincidencias',
            noChoicesText: 'No hay tiradores disponibles',
            itemSelectText: 'Seleccionar',
            shouldSort: false
        });
}

document.addEventListener("DOMContentLoaded", function () {
    /* ----------------------------------------- Crear entrenamientos ---------------------------------------- */
    const createWorkoutLink = document.getElementById("create-workout-link");
    createWorkoutLink.addEventListener("click", async function (e) {
        e.preventDefault();
        document.querySelector("#sidebar").classList.toggle("collapsed");
        showPanel("create-workout");

        // Cargar tiradores vinculados
        fencerChoices();
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
                fetch('/getTrainingTemplatesCoach')
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
            workoutsData[step] = data;

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
                        const res = await fetch('/createTrainingTemplateCoach', {
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
                        const result = await res.json();
                        usedTemplateIds[idx] = result.id;
                        tplData.template_id = result.id;
                    } else {
                        tplData.template_id = usedTemplateIds[idx];
                    }
                    return tplData;
                });

                // Esperar a que todas las plantillas estén creadas y los template_id asignados
                Promise.all(plantillaPromises).then(async (workoutsWithTemplates) => {
                    // Obtener IDs de tiradores seleccionados
                    const fencerSelect = document.getElementById("fencerSelector");
                    const selectedFencers = Array.from(fencerSelect.selectedOptions).map(opt => opt.value);

                    if (selectedFencers.length === 0) {
                        document.getElementById('workout-message').innerHTML = '<div class="alert alert-danger mt-3">Selecciona al menos un tirador.</div>';
                        return;
                    }

                    // 2. Guardar todos los entrenamientos para cada tirador seleccionado, con su template_id
                    const res = await fetch('/createCoachWorkout', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            fencerIds: selectedFencers,
                            workouts: workoutsWithTemplates
                        })
                    });
                    const result = await res.json();
                    if (result.success) {
                        document.getElementById('workout-message').innerHTML = '<div class="text-success mt-3">Entrenamientos guardados correctamente.</div>';
                        setTimeout(() => {
                            document.getElementById('workout-message').innerHTML = '';
                        }, 3000);
                        document.getElementById('workouts-form').innerHTML = '';
                        selectedDates = [];
                        workoutsData = [];
                        usedTemplateIds = [];
                        currentStep = 0;
                        document.getElementById('dateRange')._flatpickr.clear();
                        // Limpia las opciones del selector
                        document.getElementById('fencerSelector').innerHTML = '';

                        // Limpia Choices visualmente
                        if (window.fencerChoices) {
                            window.fencerChoices.clearStore(); // Limpia las selecciones y opciones
                            window.fencerChoices.destroy();    // Destruye la instancia
                            window.fencerChoices = null;
                        }
                        // Vuelve a inicializar Choices si es necesario
                        fencerChoices();


                    } else {
                        document.getElementById('workout-message').innerHTML = '<div class="text-failure mt-3">Error al guardar entrenamientos.</div>';
                    }
                }).catch(() => {
                    document.getElementById('workout-message').innerHTML = '<div class="text-failure mt-3">Error de conexión.</div>';
                });
            }
        }
        if (step > 0) {
            document.getElementById('back-btn').onclick = function() {
                currentStep--;
                showTemplateSelector(currentStep);
            };
        }
    }

    /* ---------------------------------------------------- Plantillas ---------------------------------------------------------- */

   document.getElementById("my-templates-link").addEventListener("click", async function (e) {
       e.preventDefault();
       document.querySelector("#sidebar").classList.toggle("collapsed");
       showPanel("my-templates");
        
       // Reset layout
        const leftCol = document.getElementById("left-template-column");
        leftCol.classList.remove("col-md-6");
        leftCol.classList.add("col-12");
        document.getElementById("right-template-column").classList.add("d-none");

        loadClassTemplatesTitles();

   });

    // Función para cargar títulos
    async function loadClassTemplatesTitles() {
        try {
            const response = await fetch('/getTemplatesCoach');
            const data = await response.json();

            $('#template-pagination').pagination({
            dataSource: data.templates,
            pageSize: 10,
            callback: function(entries, pagination) {
                const list = document.getElementById('template-list');
                list.innerHTML = '';
                entries.forEach(entry => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'list-group-item-action');
                li.textContent = `${entry.title}`;
                li.style.cursor = 'pointer';
                li.onclick = () => loadTemplateDetails(entry.id);
                list.appendChild(li);
                });
            }
            });
        } catch (error) {
            alert("Error cargando las plantillas: " + error.message);
        }
    }

    // Función para cargar detalles de una plantilla
     async function loadTemplateDetails(id) {
        try {
            const response = await fetch(`/getTemplateCoach/${id}`);

            const data = await response.json();

            document.getElementById('template-detail-title').textContent = data.template.title;
            document.getElementById('template-detail-description').textContent = data.template.description;
            document.getElementById("template-id").value = data.template.id;
            document.getElementById('template-detail-duration').textContent = data.template.duration + ' minutos';
            document.getElementById('template-detail-number-of-sets').textContent = data.template.number_of_sets;
            document.getElementById('template-detail-number-of-reps').textContent = data.template.number_of_reps;

            // Cambiar layout
            const leftCol = document.getElementById("left-template-column");
            const rightCol = document.getElementById("right-template-column");

            leftCol.classList.remove("col-12");
            leftCol.classList.add("col-md-4");
            rightCol.classList.remove("d-none");
        } catch (error) {
            alert("Error al cargar los detalles de la plantilla: " + error.message);
        }
    }

    // Cerrar los detalles de las plantillas 
    document.getElementById("close-template-details").addEventListener("click", () => {
        const rightCol = document.getElementById("right-template-column");
        const leftCol = document.getElementById("left-template-column");

        rightCol.classList.add("d-none");
        leftCol.classList.remove("col-md-4");
        leftCol.classList.add("col-12");
    });

    //Eliminar una plantilla según id
    const deleteTemplateButton = document.getElementById("delete-template-button");
    deleteTemplateButton.addEventListener("click", async function (e) {
        e.preventDefault();

        const templateId = document.getElementById("template-id").value;

        if (!templateId) {
            alert("Por favor, selecciona una plantilla.");
            return;
        }

        try {
            const response = await fetch(`/deleteTemplateCoach/${templateId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            const result = await response.json();
            if (result.success) {
                alert('Plantilla eliminada correctamente');
                loadClassTemplatesTitles();

                // Limpiar detalles y el id seleccionado tras borrar
                document.getElementById('template-detail-title').textContent = '';
                document.getElementById('template-detail-description').textContent = '';
                document.getElementById('template-id').value = '';

                // Volver al layout sin detalles
                const rightCol = document.getElementById("right-template-column");
                const leftCol = document.getElementById("left-template-column");
                rightCol.classList.add("d-none");
                leftCol.classList.remove("col-md-4");
                leftCol.classList.add("col-12");

            } else {
                alert('Error al eliminar: ' + result.message);
            }
        } catch (error) {
            alert('Error al enviar datos: ' + error.message);
        }
    });

});
