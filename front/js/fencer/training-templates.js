import { showPanel } from './shared-functions.js';
import {showAlert} from './shared-functions.js';
document.addEventListener("DOMContentLoaded", function () {
    /* -------------------------------------------- Diario de clases----------------------------------------- */
    document.getElementById("my-templates-link").addEventListener("click", async function (e) {
        e.preventDefault();
        document.querySelector("#sidebar").classList.toggle("collapsed");
        showPanel("training-templates");

        // Reset layout
        const leftCol = document.getElementById("left-template-column");
        leftCol.classList.remove("col-md-6");
        leftCol.classList.add("col-12");
        document.getElementById("right-template-column").classList.add("d-none");

        loadClassTemplatesTitles();
    });

    // Cargar títulos
    async function loadClassTemplatesTitles() {
        try {
            const response = await fetch('/getTrainingTemplates');
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
            showAlert("Error cargando las plantillas: " + error.message);
        }
    }


    /* -------------------------------------------- Mostrar detalles de las plantillas ------------------------------------------------ */
    async function loadTemplateDetails(id) {
        try {
            const response = await fetch(`/getTrainingTemplateById/${id}`);

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
            showAlert("Error al cargar los detalles de la plantilla: " + error.message);
            }
        }

        
    /* --------------------------------------------- Cerrar los detalles de las plantillas -------------------------------------------- */
        document.getElementById("close-template-details").addEventListener("click", () => {
        const rightCol = document.getElementById("right-template-column");
        const leftCol = document.getElementById("left-template-column");

        rightCol.classList.add("d-none");
        leftCol.classList.remove("col-md-4");
        leftCol.classList.add("col-12");
        });

    
    /* --------------------------------------------- Eliminar una plantilla según id ---------------------------------------------------------------- */
    const deleteTemplateButton = document.getElementById("delete-template-button");
    deleteTemplateButton.addEventListener("click", async function (e) {
        e.preventDefault();

        const templateId = document.getElementById("template-id").value;

        if (!templateId) {
            showAlert("Por favor, selecciona una plantilla.");
            return;
        }

        try {
            const response = await fetch(`/deleteTrainingTemplate/${templateId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            const result = await response.json();
            if (result.success) {
                
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
                showAlert('Error al eliminar: ' + result.message);
            }
        } catch (error) {
            showAlert('Error al enviar datos: ' + error.message);
        }
    });
    
});
