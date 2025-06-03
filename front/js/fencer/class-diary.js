import { showPanel } from './shared-functions.js';
document.addEventListener("DOMContentLoaded", function () {
    /* -------------------------------------------- Diario de clases----------------------------------------- */
    document.getElementById("class-diary-link").addEventListener("click", async function (e) {
        e.preventDefault();
        document.querySelector("#sidebar").classList.toggle("collapsed");
        showPanel("diary-class");

        // Reset layout
        const leftCol = document.getElementById("left-column");
        leftCol.classList.remove("col-md-6");
        leftCol.classList.add("col-12");
        document.getElementById("right-column").classList.add("d-none");

        loadClassDiaryTitles();
    });

    // Cargar títulos
    async function loadClassDiaryTitles() {
        try {
            const response = await fetch('/getClassDiaryTitles');
            const data = await response.json();

            $('#diary-class-pagination').pagination({
            dataSource: data,
            pageSize: 10,
            callback: function(entries, pagination) {
                const list = document.getElementById('class-diary-list');
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


    /* -------------------------------------------- Mostrar detalles de las clases ------------------------------------------------ */
    async function loadClassDiaryDetails(id) {
        try {
            const response = await fetch(`/getClassDiaryById/${id}`);

            const data = await response.json();
                document.getElementById('diary-detail-title').textContent = data.title;

                document.getElementById('diary-detail-date').textContent = new Date(data.date).toLocaleDateString();

                document.getElementById('diary-detail-description').textContent = data.description;
                document.getElementById("diary-id").value = id;
            // Cambiar layout
            const leftCol = document.getElementById("left-column");
            const rightCol = document.getElementById("right-column");

            leftCol.classList.remove("col-12");
            leftCol.classList.add("col-md-4");
            rightCol.classList.remove("d-none");
        } catch (error) {
            alert("Error al cargar los detalles del diario: " + error.message);
            }
        }

        // Ocultar detalles
        document.getElementById("close-details").addEventListener("click", () => {
        const rightCol = document.getElementById("right-column");
        const leftCol = document.getElementById("left-column");

        rightCol.classList.add("d-none");
        leftCol.classList.remove("col-md-4");
        leftCol.classList.add("col-12");
        });

    /* --------------------------------------------- Añadir una clase de diario --------------------------------------------------------------- */
        // Formulario añadir diario
        const today = new Date().toISOString().split("T")[0];

        document.getElementById("add-class-diary").addEventListener("click", function (e) {
            e.preventDefault();
            const form = document.getElementById("add-class-diary-form");
            if (form.style.display === "block") {
                form.style.display = "none";
            } else {
                form.style.display = "block";
                const today = new Date().toISOString().split("T")[0];
                document.getElementById("diary-date").value = today;
            }
        });

        

        document.getElementById("add-class-diary-form-button").addEventListener("click", async function (e) {
            e.preventDefault();

            const title = document.getElementById("diary-title").value.trim();
            const date = document.getElementById("diary-date").value;
            const description = document.getElementById("diary-description").value.trim();

            if (!title || !date || !description) {
            alert("Por favor, completa todos los campos.");
            return;
            }

            try {
                const response = await fetch('/addClassDiary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, date, description }),
                credentials: 'include'
            }); 
                const result = await response.json();
            if (result.success) {
                alert('Diario de clase guardado correctamente');
                document.getElementById("add-class-diary-form").style.display = "none";
                document.getElementById("diary-form").reset();
                loadClassDiaryTitles();
            } else {
                alert('Error al guardar: ' + result.message);
            }
            } catch (error) {
                alert('Error al enviar datos: ' + error.message);
            }
        });
    /* --------------------------------------------- Cerrar los detalles de las clases -------------------------------------------- */
    const closeDiaryFormButton = document.getElementById("close-details");
    closeDiaryFormButton.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("add-class-diary-form").style.display = "none";
            document.getElementById("diary-form").reset();
            document.getElementById("diary-date").value = today;
            loadClassDiaryTitles();
    });

    /* --------------------------------------------- Eliminar una clase de diario según id ---------------------------------------------------------------- */
    const deleteClassDiaryButton = document.getElementById("delete-class-diary-button");
    deleteClassDiaryButton.addEventListener("click", async function (e) {
        e.preventDefault();

        const diaryId = document.getElementById("diary-id").value;

        if (!diaryId) {
            alert("Por favor, selecciona un diario.");
            return;
        }

        try {
            const response = await fetch(`/deleteClassDiary/${diaryId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            const result = await response.json();
            if (result.success) {
                alert('Diario de clase eliminado correctamente');
                loadClassDiaryTitles();

                // Limpiar detalles y el id seleccionado tras borrar
                document.getElementById('diary-detail-title').textContent = '';
                document.getElementById('diary-detail-date').textContent = '';
                document.getElementById('diary-detail-description').textContent = '';
                document.getElementById('diary-id').value = '';

                // Volver al layout sin detalles
                const rightCol = document.getElementById("right-column");
                const leftCol = document.getElementById("left-column");
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
    /*----------------------------------------------------- Cerrar formulario -------------------------------------------------- */
    document.getElementById("cancel-class-diary-form-button").addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("add-class-diary-form").style.display = "none";
        document.getElementById("diary-form").reset();
        document.getElementById("diary-date").value = today;
        loadClassDiaryTitles();
    });
});
