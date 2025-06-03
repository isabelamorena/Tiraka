document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('my-templates-link').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector("#sidebar").classList.toggle("collapsed");
        document.getElementById("main-content").style.display = "none";
        document.getElementById("attendance-record").style.display = "none";
        document.getElementById("profile").style.display = "none";
        document.getElementById("diary-class").style.display = "none";
        document.getElementById("competition-diary").style.display = "none";
        document.getElementById("create-workout").style.display = "none";
        document.getElementById("training-templates").style.display = "block";
        const leftCol = document.getElementById("template-left-column");
        leftCol.classList.remove("col-md-6");
        leftCol.classList.add("col-12");
        document.getElementById("template-right-column").classList.add("d-none");

        loadTrainingTemplates();
    });

    async function loadTrainingTemplates() {
        try {
            const response = await fetch('/getTrainingTemplates');
            const data = await response.json();

            const templateList = document.getElementById('template-list');
            const detailsDiv = document.getElementById('template-details');
            templateList.innerHTML = '';
            if (detailsDiv) detailsDiv.innerHTML = '';

            if (!data.success || !Array.isArray(data.templates)) {
                templateList.innerHTML = "<li class='text-failure'>No tienes plantillas guardadas.</li>";
                return;
            }

            // PAGINACIÓN
            $('#template-list').pagination({
                dataSource: data.templates,
                pageSize: 8,
                callback: function(templates, pagination) {
                    templateList.innerHTML = '';
                    templates.forEach(template => {
                        const li = document.createElement('li');
                        li.classList.add('list-group-item', 'list-group-item-action');
                        li.textContent = template.title;
                        li.style.cursor = 'pointer';
                        li.onclick = () => showTemplateDetails(template);
                        templateList.appendChild(li);
                    });
                }
            });
        } catch (error) {
            console.error("Error al cargar las plantillas:", error);
            document.getElementById('template-list').innerHTML = "<li class='text-failure'>Error al cargar las plantillas.</li>";
        }
    }

    // Mostrar detalles a la derecha
    function showTemplateDetails(template) {
        const detailsDiv = document.getElementById('template-details');
        detailsDiv.innerHTML = `
            <div class="card border rounded p-3">
                <h5>${template.title}</h5>
                <p><strong>Descripción:</strong> ${template.description}</p>
                <p><strong>Duración:</strong> ${template.duration} min</p>
                <p><strong>Sets:</strong> ${template.number_of_sets}</p>
                <p><strong>Repeticiones:</strong> ${template.number_of_reps}</p>
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-primary" id="close-template-details">Cerrar</button>
                    <button class="btn btn-danger" id="delete-template-btn">Borrar</button>
                </div>
            </div>
        `;
        document.getElementById('close-template-details').onclick = function() {
            detailsDiv.innerHTML = '';
        };
        document.getElementById('delete-template-btn').onclick = async function() {
            if (confirm('¿Seguro que quieres borrar esta plantilla?')) {
                try {
                    const res = await fetch('/deleteTrainingTemplate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: template.id })
                    });
                    const result = await res.json();
                    if (result.success) {
                        detailsDiv.innerHTML = '';
                        loadTrainingTemplates();
                    } else {
                        alert('No se pudo borrar la plantilla.');
                    }
                } catch (err) {
                    alert('Error al borrar la plantilla.');
                }
            }
        };
    }

});