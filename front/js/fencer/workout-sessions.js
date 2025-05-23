document.addEventListener("DOMContentLoaded", function () {
        /* ----------------------------------------- Crear entrenamientos ---------------------------------------- */
    const createWorkoutButton = document.getElementById("createWorkoutButton");

    createWorkoutButton.addEventListener("click", async function (e) {
        e.preventDefault(); // Prevenir el envío del formulario
        document.querySelector("#sidebar").classList.toggle("collapsed");
        const mainContent = document.getElementById("main-content");
        mainContent.style.display = "none"; // Ocultar el contenido principal

        const attendanceHistory = document.getElementById("attendance-record");
        attendanceHistory.style.display = "none"; // Ocultar el historial de asistencias

        const profile = document.getElementById("profile");
        profile.style.display = "none"; // Ocultar el perfil

        
        const diaryClass = document.getElementById("diary-class");
        diaryClass.style.display = "none"; // Ocultar el diario de clases

    document.getElementById("competition-diary").style.display = "none";
        const createWorkout = document.getElementById("create-workout");
        createWorkout.style.display = "block"; // Mostrar el crear entrenamientos


    });

    /* Flatpickr para seleccionar fechas */
    const datePicker = flatpickr("#date-picker", {
        mode: "multiple", // Permitir selección múltiple
        dateFormat: "Y-m-d",
        onChange: function (selectedDates) {
            generateWorkoutForms(selectedDates);
        }
    });

    /* Generar formularios dinámicos para cada fecha  */
    function generateWorkoutForms(selectedDates) {
        const workoutsForm = document.getElementById("workouts-form");
        workoutsForm.innerHTML = ""; // Limpiar formularios previos

        if (selectedDates.length > 0) {
            selectedDates.forEach((date) => {
                const formGroup = document.createElement("div");
                formGroup.classList.add("mb-3", "p-2", "border", "rounded");

                const dateLabel = document.createElement("h5");
                dateLabel.innerText = date.toLocaleDateString();
                formGroup.appendChild(dateLabel);

                // Título del entreno
                const titleInput = document.createElement("input");
                titleInput.type = "text";
                titleInput.placeholder = "Título del entreno";
                titleInput.classList.add("form-control", "mb-2");
                formGroup.appendChild(titleInput);

                // Descripción del entreno
                const descriptionInput = document.createElement("textarea");
                descriptionInput.placeholder = "Descripción del entreno";
                descriptionInput.classList.add("form-control", "mb-2");
                descriptionInput.rows = 3;
                formGroup.appendChild(descriptionInput);

                // Duración del entreno
                const durationInput = document.createElement("input");
                durationInput.type = "number";
                durationInput.placeholder = "Duración (minutos)";
                durationInput.classList.add("form-control", "mb-2");
                formGroup.appendChild(durationInput);

                // Número de series
                const setsInput = document.createElement("input");
                setsInput.type = "number";
                setsInput.placeholder = "Número de series";
                setsInput.classList.add("form-control", "mb-2");
                formGroup.appendChild(setsInput);

                // Número de repeticiones
                const repsInput = document.createElement("input");
                repsInput.type = "number";
                repsInput.placeholder = "Número de repeticiones";
                repsInput.classList.add("form-control");
                formGroup.appendChild(repsInput);

                workoutsForm.appendChild(formGroup);
            });

            document.getElementById("submit-button-create-workout").style.display = "block";
        } else {
            document.getElementById("submit-button-create-workout").style.display = "none";
        }
    }

    /* Enviar entrenamientos al servidor */
    document.getElementById("submit-button-create-workout").addEventListener("click", async function (e) {
        e.preventDefault();
        alert("Se ha enviado el formulario");
        const workoutsData = [];

        document.querySelectorAll("#workouts-form > div").forEach((formGroup) => {
            const date = formGroup.querySelector("h5").innerText;
            const title = formGroup.querySelector("input[type='text']").value;
            const description = formGroup.querySelector("textarea").value;
            const duration = formGroup.querySelectorAll("input[type='number']")[0].value;
            const number_of_sets = formGroup.querySelectorAll("input[type='number']")[1].value;
            const number_of_reps = formGroup.querySelectorAll("input[type='number']")[2].value;

            if (title && description && duration && number_of_sets && number_of_reps) {
                const [day, month, year] = date.split('/');
                const formattedDate = `${year}-${month}-${day}`;

                workoutsData.push({
                    title,
                    date: formattedDate,
                    description,
                    duration,
                    number_of_sets,
                    number_of_reps
                });
            } else {
                alert("Algunos campos están vacíos. Verifica el formulario.");
            }


            alert(`Título: ${title}, Fecha: ${formattedDate}, Descripción: ${description}, Duración: ${duration}, Series: ${number_of_sets}, Repeticiones: ${number_of_reps}`);
        });


        if (workoutsData.length === 0) {
            alert("No se han completado los formularios correctamente.");
            return;
        }

        // Realizar la petición al backend
        try {
            const response = await fetch('/createWorkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ workouts: workoutsData }),
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                alert("Entrenamientos guardados correctamente");
            } if (!data.success) {
                alert("Hubo un error al guardar el entrenamiento");
                console.error(data.message);
            }
        } catch (error) {
            alert("Error en la solicitud");
            console.error('Error al crear entrenamiento:', error);
        }
    });

});