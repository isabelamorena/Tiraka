document.addEventListener("DOMContentLoaded", function () {
    /* ----------------------------------------- Mostrar el diario de competición --------------------------------------------- */
    const competitionDiaryBtn = document.getElementById("competition-diary-link");
    competitionDiaryBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        // Mostrar solo el panel de asistencia
        document.querySelector("#sidebar").classList.toggle("collapsed");

        document.getElementById("main-content").style.display = "none";
        document.getElementById("create-workout").style.display = "none";
        document.getElementById("training-templates").style.display = "none";
        document.getElementById("profile").style.display = "none";
        document.getElementById("diary-class").style.display = "none";
        document.getElementById("attendance-record").style.display = "none";
        document.getElementById("competition-diary").style.display = "block";
        loadCompetitionDiaryTitles();


        // Reset layout
        const leftCol = document.getElementById("competition-left-column");
        leftCol.classList.remove("col-md-6");
        document.getElementById("competition-right-column").classList.add("d-none");

    });

    // Funcion para cargar los títulos del diario de competiones
    async function loadCompetitionDiaryTitles() {
        try {
            const response = await fetch('/getCompetitionDiaryTitles');
            const data = await response.json();

            $('#diary-competition-pagination').pagination({
            dataSource: Array.isArray(data) ? data : data.data || [], // seguridad
            pageSize: 5,
            callback: function(entries, pagination) {
                const list = document.getElementById('competition-diary-list');
                list.innerHTML = '';
                entries.forEach(entry => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'list-group-item-action');
                li.textContent = `${new Date(entry.date).toLocaleDateString()} - ${entry.title}`;
                li.style.cursor = 'pointer';
                li.onclick = () => loadClassDiaryDetails(entry.id);
                list.appendChild(li);
                });
            }
            });
        } catch (error) {
            alert("Error cargando el diario: " + error.message);
        } 
    }

   function getStageLabel(stage) {
    const STAGE_LABELS = {
        256: "Tablón de 256",
        128: "Tablón de 128",
        64: "Tablón de 64",
        32: "Tablón de 32",
        16: "Tablón de 16",
        8: "Cuartos de final",
        4: "Semifinal",
        2: "Final"
    };
        return STAGE_LABELS[stage] || `Tablón de ${stage}`;
    }

    // Cargar detalles del diario de competiciones
    async function loadClassDiaryDetails(diaryId) {
        try {

            const res = await fetch(`/getCompetitionDiaryById/${diaryId}`);
            const diary = await res.json();

            // Mostrar columna derecha
            const rightCol = document.getElementById("competition-right-column");
            // Cambiar layout
            const leftCol = document.getElementById("competition-left-column");

            leftCol.classList.remove("col-12");
            leftCol.classList.add("col-md-4");
            rightCol.classList.remove("d-none");

            // Mostrar título, fecha, y guardar ID
            document.getElementById('competition-diary-detail-title').textContent = diary.title;
            document.getElementById('competition-diary-detail-date').textContent = new Date(diary.competition_date).toLocaleDateString();
            document.getElementById('competition-diary-id').value = diary.id;

            // Construir contenido HTML
            let html = '';

            html += `<p><strong>Lugar:</strong> ${diary.location || 'No indicado'}</p>`;
            html += `<p><strong>Posición final:</strong> ${diary.final_position || 'No indicado'}</p>`;

            html += `<div class="mt-3"><strong>Poule:</strong>`;
            html += `<ul><li>Victorias: ${diary.wins_pool || 0}</li><li>Derrotas: ${diary.losses_pool || 0}</li></ul></div>`;

            if (diary.passed_pool) {
                if (diary.de_descriptions && diary.de_descriptions.length > 0) {
                    html += `<div class="mt-2"><strong>Tablón de directas:</strong>`;
                    diary.de_descriptions.forEach(stage => {
                        html += `
                        <div class="card mt-2">
                            <div class="card-body">
                                <h6 class="card-title">${getStageLabel(stage.stage)}</h6>
                                <p  style="white-space: pre-wrap; class="card-text" style="white-space: pre-wrap;">${stage.description}</p>
                            </div>
                        </div>`;
                    });
                    html += `</div>`;
                }

                html += `</div>`;
            }

            html += `<div class="mt-3" style="white-space: pre-wrap;"><strong>Comentarios:</strong><p>${diary.feedback || 'Ninguno'}</p></div>`;

            document.getElementById('competition-diary-detail-description').innerHTML = html;

        } catch (err) {
            alert('Error cargando detalles del diario: ' + err.message);
            console.error(err);
        }
    }


    /* -------------------------------------------- Formulario de diario de competiticiones ---------------------------------------------*/
    const competitionDiaryFormBtn = document.getElementById("add-competition-diary");
    competitionDiaryFormBtn.addEventListener("click", function (e) {
        const form = document.getElementById("add-competition-diary-form");
        if (form.style.display === "block") {
            form.style.display = "none";
        } else {
            form.style.display = "block";
            const today = new Date().toISOString().split("T")[0];
            document.getElementById("competition-diary-date").value = today;
        }
    });

    // Ocultar el formulario de diario de competiciones
    const closeCompetitionDiaryFormBtn = document.getElementById("cancel-competition-diary-form-button");
    closeCompetitionDiaryFormBtn.addEventListener("click", async function (e) {
        document.getElementById("add-competition-diary-form").style.display = "none";
        document.getElementById("competition-diary-form").reset();
    });
    // Directas
        const DE_STAGES = [256,128, 64, 32, 16, 8, 4, 2];
        const STAGE_LABELS = {
            256: "Tablón de 256",
            128: "Tablón de 128",
            64: "Tablón de 64",
            32: "Tablón de 32",
            16: "Tablón de 16",
            8: "Cuartos de final",
            4: "Semifinal",
            2: "Final"
        };
        const textValues = {};

        document.getElementById("passed-pool").addEventListener("change", toggleDESection);
        document.getElementById("new-de").addEventListener("change", generateTextareas);

        function toggleDESection() {
            const passed = document.getElementById("passed-pool").value;
            const section = document.getElementById("de-section");

            section.style.display = passed === "yes" ? "block" : "none";

            if (passed === "no") {
                document.getElementById("new-de").value = "";
                document.getElementById("de-textareas-container").innerHTML = "";
            }
        }

        function generateTextareas() {
            const select = document.getElementById('new-de');
            const selectedOptions = Array.from(select.selectedOptions).map(option => parseInt(option.value));
            const container = document.getElementById('de-textareas-container');
            container.innerHTML = "";

            selectedOptions.forEach(stage => {
                const labelText = STAGE_LABELS[stage] || `Tablón de ${stage}`;
                const textareaId = `de-textarea-${stage}`;

                const label = document.createElement('label');
                label.className = "form-label mt-3";
                label.setAttribute('for', textareaId);
                label.textContent = `${labelText} - Descripción`;

                const textarea = document.createElement('textarea');
                textarea.className = "form-control";
                textarea.id = textareaId;
                textarea.name = `de-description-${stage}`;
                textarea.rows = 3;
                textarea.value = textValues[stage] || "";
                textarea.oninput = () => {
                    textValues[stage] = textarea.value;
                };

                container.appendChild(label);
                container.appendChild(textarea);
            });
        }


    /* -------------------------------------------- Guardar el diario de competiciones ---------------------------------------------*/
    document.getElementById("add-competition-diary-form-button").addEventListener("click", async function (e) {
        e.preventDefault();
        alert("Guardando el diario de competiciones...");

        const pp = document.getElementById("passed-pool").value;
        let passedPool = false;
        if (pp === "yes") {
            passedPool = true;
        } else if (pp === "no") {
            passedPool = false;
        }
        // Construir objeto diaryData
        const diaryData = {
            title: document.getElementById("competition-diary-title").value.trim(),
            date: document.getElementById("competition-diary-date").value,
            location: document.getElementById("competition-diary-location").value.trim(),
            feedback: document.getElementById("competition-diary-feedback").value.trim(),
            final_position: document.getElementById("competition-diary-final-position").value,
            wins_pool: document.getElementById("competition-diary-wins-pool").value,
            losses_pool: document.getElementById("competition-diary-losses-pool").value,
            passed_pool: passedPool,
            directes: []
        };

        // Recoger directas
        const textareas = document.querySelectorAll("#de-textareas-container textarea");
        textareas.forEach((textarea) => {
            const stage = parseInt(textarea.id.replace("de-textarea-", ""));
            const description = textarea.value.trim();
            if (description) {
                diaryData.directes.push({ stage, description });
            }
        });
        alert("Titulo: " + diaryData.title + "\nFecha: " + diaryData.date + "\nUbicación: " + diaryData.location + "\nComentarios: " + diaryData.feedback + "\nPosición final: " + diaryData.end_position + "\nVictorias en poule: " + diaryData.wins_pool + "\nDerrotas en poule: " + diaryData.losses_pool + "\nDirectas recogidas:\n" + diaryData.directes.map(d => `Stage: ${d.stage}, Descripción: ${d.description}`).join("\n"));
        // Enviar por fetch
        try {
            const response = await fetch('/addCompetitionDiary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // si usas sesión
                body: JSON.stringify(diaryData)
            });

            const result = await response.json();

            if (result.success) {
                alert("Diario de competición guardado correctamente.");
                // Opcional: resetear el formulario
                document.getElementById("add-competition-diary-form").style.display = "none";
                document.getElementById("competition-diary-form").reset();
                loadCompetitionDiaryTitles();
            } else {
                alert("Error al guardar: " + result.message);
            }
        } catch (error) {
            alert("Error en el envío: " + error.message);
        }
    });

    /*----------------------------------------------- Eliminar competición ------------------------------------------------  */
    document.getElementById("delete-competition-diary-button").addEventListener("click", async () => {
    const id = document.getElementById("competition-diary-id").value;
    if (!id) return;

    const confirmDelete = confirm("¿Estás segura de que quieres eliminar esta entrada?");
    if (!confirmDelete) return;

    try {
        const res = await fetch(`/deleteCompetitionDiary/${id}`, { method: 'POST' });
        const result = await res.json();

        if (result.success) {
        alert("Entrada eliminada.");
        loadCompetitionDiaryTitles(); // recargar la lista
        // Volver al layout sin detalles
                const rightCol = document.getElementById("competition-right-column");
                const leftCol = document.getElementById("competition-left-column");
                rightCol.classList.add("d-none");
                leftCol.classList.remove("col-md-4");
                leftCol.classList.add("col-12");
        } else {
        alert("Error al eliminar la entrada.");
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
    });

    /* ------------------------------------------------------- Cerrar las competicones en detalle --------------------------------------------------- */
    document.getElementById("competition-close-details").addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("competition-diary-detail-title").textContent = '';
        document.getElementById("competition-diary-detail-date").textContent = '';
        document.getElementById("competition-diary-detail-description").innerHTML = '';
        document.getElementById("competition-diary-id").value = '';
        const rightCol = document.getElementById("competition-right-column");
        const leftCol = document.getElementById("competition-left-column");
        rightCol.classList.add("d-none");
        leftCol.classList.remove("col-md-4");
        leftCol.classList.add("col-12");
    });

});
