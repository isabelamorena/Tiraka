document.addEventListener("DOMContentLoaded", function () {

    /* ------------------ Formulario de asistencia ------------------- */
    function setDefaultTimes() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        document.getElementById('checkin').value = `${hours}:${minutes}`;
        document.getElementById('date').value = now.toISOString().split('T')[0]; // Establecer la fecha actual
    }

    // Establecer fecha de hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    // Ejecutar al cargar
    setDefaultTimes();

    // Actualizar cada minuto
    setInterval(setDefaultTimes, 60000); // cada 60.000 ms = 1 minuto

    const formAttendance = document.getElementById("formAttendance");

    formAttendance.addEventListener("submit", async function (e) {
        e.preventDefault();
        const date = document.getElementById("date").value;
        const checkin = document.getElementById("checkin").value;
        const checkout = document.getElementById("checkout").value;

        // Verificar que no esten vacíos
        if (!date || !checkin || !checkout) {
            e.preventDefault(); // Evitar el envío del formulario
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Verificar que la fecha no sea mayor a la actual 
        const today = new Date();
        const selectedDate = new Date(date);
        if (selectedDate > today) {
            e.preventDefault(); // Evitar el envío del formulario
            alert("La fecha no puede ser mayor a la actual.");
            return;
        }

        // Verificar que la hora de checkout sea más tarde que la de checkin
        const checkinTime = new Date(selectedDate);
        const checkoutTime = new Date(selectedDate);
        
        // Ajustar las horas y minutos
        const [checkinHours, checkinMinutes] = checkin.split(':');
        const [checkoutHours, checkoutMinutes] = checkout.split(':');

        checkinTime.setHours(checkinHours);
        checkinTime.setMinutes(checkinMinutes);
        
        checkoutTime.setHours(checkoutHours);
        checkoutTime.setMinutes(checkoutMinutes);

        if (checkoutTime <= checkinTime) {
            e.preventDefault(); // Evitar el envío del formulario
            alert("La hora de salida debe ser posterior a la hora de entrada.");
            return;
        }

        // Enviar los datos usando fetch (POST)
        try {
            const response = await fetch('/attendanceRecord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: date,
                    checkin: checkin,
                    checkout: checkout
                }),
                credentials: 'include'  // Asegúrate de que se incluyan las cookies si las usas
            });

            const result = await response.json(); // Puedes manejar el resultado aquí
            
            // Redirige a la página de control del tirador si el registro es exitoso
            if (result.success) {
                alert('¡Registro de asistencia exitoso!');
                
                const successMessage = document.getElementById('messageAttendance');
                successMessage.innerHTML = '<p class="text-success fw-bold fs-6">*registro de asistencia exitoso</p>';
                
                // Limpiar el formulario y resetear hora
                formAttendance.reset();
                setDefaultTimes();
                setInterval(setDefaultTimes, 60000);
            
                // Ocultar el mensaje después de 3 segundos
                setTimeout(() => {
                    successMessage.innerHTML = '';
                }, 3000);
            } else {
                const successMessage = document.getElementById('messageAttendance');
                successMessage.innerHTML = '<p class="text-danger fw-bold fs-6">*error en el registro de asistencia</p>';
            
                setTimeout(() => {
                    successMessage.innerHTML = '';
                }, 3000);
            }
            
        } catch (error) {
            console.error('Error en la solicitud:', error);
            alert('Hubo un error al enviar los datos!');
        }
    });

    /*---------------------------------------------------------- Mostrar asistencias -------------------------------------------------------------- */
    const attendanceButton = document.getElementById("attendanceButton");

    attendanceButton.addEventListener("click", async function (e) {
        e.preventDefault();

        // Mostrar solo el panel de asistencia
        document.querySelector("#sidebar").classList.toggle("collapsed");
        document.getElementById("main-content").style.display = "none";
        document.getElementById("create-workout").style.display = "none";
        document.getElementById("profile").style.display = "none";
        document.getElementById("diary-class").style.display = "none";
        document.getElementById("attendance-record").style.display = "block";

        try {
            const response = await fetch('/getAttendanceRecord');
            const data = await response.json();

            renderAttendanceWithPagination(data);

        } catch (error) {
            console.error("Error al obtener el historial de asistencias:", error);
            alert("Error al cargar las asistencias");
        }
    });

    function renderAttendanceWithPagination(data) {
        const tableBody = document.getElementById("attendance-body");
        const paginationContainer = document.getElementById("attendance-pagination");

        if (!data || data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4'>No hay registros de asistencia</td></tr>";
            paginationContainer.innerHTML = ""; // Limpiar paginación si no hay datos
            return;
        }

        $('#attendance-pagination').pagination({
            dataSource: data,
            pageSize: 10,
            callback: function (records, pagination) {
                tableBody.innerHTML = "";
                let totalMinutesWorked = 0;

                records.forEach(record => {
                    const formattedDate = new Date(record.date).toLocaleDateString();
                    const formattedCheckin = record.checkin ? record.checkin.slice(0, 5) : "No registrado";
                    const formattedCheckout = record.checkout ? record.checkout.slice(0, 5) : "No registrado";

                    let minutesWorked = "No registrado";
                    if (record.checkin && record.checkout) {
                        const [inH, inM] = record.checkin.split(":").map(Number);
                        const [outH, outM] = record.checkout.split(":").map(Number);
                        const inMinutes = inH * 60 + inM;
                        const outMinutes = outH * 60 + outM;
                        minutesWorked = outMinutes - inMinutes;
                        totalMinutesWorked += minutesWorked;
                    }

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${formattedCheckin}</td>
                        <td>${formattedCheckout}</td>
                        <td>${minutesWorked !== "No registrado" ? minutesWorked + " min" : minutesWorked}</td>
                    `;
                    tableBody.appendChild(row);
                });

                // Fila total por página
                const totalRow = document.createElement("tr");
                totalRow.innerHTML = `
                    <td colspan="3" style="font-weight:bold;">Total minutos trabajados (página):</td>
                    <td style="font-weight:bold;">${totalMinutesWorked} min</td>
                `;
                tableBody.appendChild(totalRow);
            }
        });
    }

    /* Mostrar asistencias de un rango de fechas determinado */
    flatpickr("#date-range", {
        mode: "range",
        dateFormat: "Y-m-d"
    });

    document.getElementById("filter-attendance-button").addEventListener("click", async function (e) {
        e.preventDefault();

        const selectedDates = document.getElementById("date-range").value;

        if (!selectedDates) {
            alert("Por favor, selecciona un rango de fechas.");
            return;
        }

        const [startDateStr, endDateStr] = selectedDates.split(" to ");
        if (!startDateStr || !endDateStr) {
            alert("Por favor, selecciona un rango válido con dos fechas.");
            return;
        }

        const today = new Date();
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        if (startDate > today || endDate > today) {
            alert("Las fechas no pueden ser mayores a la actual.");
            return;
        }

        try {
            const response = await fetch('/getAttendanceRecordFilter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: startDateStr, endDate: endDateStr }),
                credentials: 'include'
            });

            const data = await response.json();

            renderAttendanceWithPagination(data);

        } catch (error) {
            console.error('Error al filtrar el historial de asistencias:', error);
            alert('Error al filtrar asistencias');
        }
    });

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
    /*--------------------------------------------------------- Perfil ------------------------------------------------------------ */
    const showProfile = document.getElementById("showProfile");

    showProfile.addEventListener("click", async function (e) {
        e.preventDefault(); // Prevenir el envío del formulario
        document.querySelector("#sidebar").classList.toggle("collapsed");
        const mainContent = document.getElementById("main-content");
        mainContent.style.display = "none"; // Ocultar el contenido principal

        const attendanceHistory = document.getElementById("attendance-record");
        attendanceHistory.style.display = "none"; // Ocultar el historial de asistencias

        const createWorkout = document.getElementById("create-workout");
        createWorkout.style.display = "none"; // Mostrar el crear entrenamientos

        const diaryClass = document.getElementById("diary-class");
        diaryClass.style.display = "none"; // Ocultar el diario de clases

        const profile = document.getElementById("profile");
        profile.style.display = "block"; // Ocultar el perfil

        // Obtener el perfil del usuario desde el servidor
        try {
            const response = await fetch('/getProfile');

            const data = await response.json(); // Suponiendo que el servidor devuelve un JSON con los datos de asistencia

            // Mostrar los datos en el formulario
            document.getElementById("profile-title").innerHTML = "Hola " + data.name + " " + data.surname + " !";
            document.getElementById("profile-username").value = data.username ?? "Apellido no disponible";
            document.getElementById("profile-name").value = data.name ?? "Nombre no disponible";
            document.getElementById("profile-surname").value = data.surname ?? "Apellido no disponible";
            document.getElementById("profile-secondsurname").value = data.secondsurname ?? "Segundo apellido no disponible";
            if (data.birthdate) {
            const date = new Date(data.birthdate);

            // Obtenemos el día, mes y año
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
            const year = date.getFullYear();

            // Formato final para el input: "yyyy-mm-dd"
            const formattedDate = `${year}-${month}-${day}`;
            
            document.getElementById("profile-birthdate").value = formattedDate;
            } else {
                document.getElementById("profile-birthdate").value = "Fecha de nacimiento no disponible";
            }

            document.getElementById("profile-clubname").value = data.clubname ?? "Nombre del club no disponible";
            document.getElementById("profile-email").value = data.email ?? "Email no disponible";
            
            
            
        } catch (error) {
            alert("Error al cargar el perfil" + error);
            console.log('Error al obtener el perfil:', error);
        }
    });

    const profileGeneral = document.getElementById("profile-general");
    profileGeneral.addEventListener("click", async function (e) {
        e.preventDefault(); 
        // Obtener el perfil del usuario desde el servidor
        try {
            const response = await fetch('/getProfile');
            const data = await response.json(); 

            // Mostrar los datos en el formulario
            document.getElementById("profile-title").innerHTML = "Hola " + data.name + " " + data.surname + " !";
            document.getElementById("profile-username").value = data.username ?? "Apellido no disponible";
            document.getElementById("profile-name").value = data.name ?? "Nombre no disponible";
            document.getElementById("profile-surname").value = data.surname ?? "Apellido no disponible";
            document.getElementById("profile-secondsurname").value = data.secondsurname ?? "Segundo apellido no disponible";
            if (data.birthdate) {
            const date = new Date(data.birthdate);

            // Obtenemos el día, mes y año
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
            const year = date.getFullYear();

            // Formato final para el input: "yyyy-mm-dd"
            const formattedDate = `${year}-${month}-${day}`;
            
            document.getElementById("profile-birthdate").value = formattedDate;
            } else {
                document.getElementById("profile-birthdate").value = "Fecha de nacimiento no disponible";
            }

            document.getElementById("profile-clubname").value = data.clubname ?? "Nombre del club no disponible";
            document.getElementById("profile-email").value = data.email ?? "Email no disponible";
            
            
            
        } catch (error) {
            alert("Error al cargar el perfil" + error);
            console.log('Error al obtener el perfil:', error);
        }
    });

    /* ---------------------------------------- Actualizar perfil -----------------------------------------------------*/
    const profileButton = document.getElementById("profile-button");
    profileButton.addEventListener("click", async function (e) {
        e.preventDefault(); // Prevenir el envío del formulario

        const username = document.getElementById("profile-username").value.trim();
        const name = document.getElementById("profile-name").value.trim();
        const surname = document.getElementById("profile-surname").value.trim();
        const secondsurname = document.getElementById("profile-secondsurname").value.trim();
        const birthdate = document.getElementById("profile-birthdate").value;
        const clubname = document.getElementById("profile-clubname").value.trim();
        const email = document.getElementById("profile-email").value.trim();

        // Verificar que no estén vacíos
        if (!username || !name || !surname || !secondsurname || !birthdate || !clubname || !email) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Validación de nombre y apellidos (solo letras y espacios)
        const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
        if (![name, surname, secondsurname].every(val => nameRegex.test(val))) {
            alert('El nombre y apellidos solo pueden contener letras y espacios.');
            return;
        }

        // Validación de email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            alert('El correo electrónico no es válido.');
            return;
        }

        // Verificar que la fecha de nacimiento no sea hoy o en el futuro
        const birthDateObj = new Date(birthdate);
        const today = new Date();   
        if (birthDateObj >= today) {
            alert('La fecha de nacimiento no puede ser hoy o en el futuro.');
            return;
        }

        // La primera letra del nombre, apellidos y club deben ser mayúsculas
            const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);
            const capitalizedName = capitalizeFirstLetter(name);
            const capitalizedSurname = capitalizeFirstLetter(surname);
            const capitalizedSecondSurname = capitalizeFirstLetter(secondsurname);
            const capitalizedClubname = capitalizeFirstLetter(clubname);
           

        // Enviar los datos usando fetch (POST)
        try {
            const response = await fetch('/updateProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    name: capitalizedName,
                    surname: capitalizedSurname,
                    secondsurname: capitalizedSecondSurname,
                    clubname: capitalizedClubname,
                    birthdate,
                    email,
                }),
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Perfil actualizado correctamente');
            } else {
                alert('Error al actualizar el perfil: ' + result.message);
            }
        } catch (error) {
            alert('Hubo un error al enviar los datos: ' + error.message);
        }
    });

    /* ---------------------------------------- Cambiar contraseña -------------------------------------------------*/
    const profilePasswordButton = document.getElementById("profile-password-button");
    profilePasswordButton.addEventListener("click", async function (e) {
        e.preventDefault(); // Prevenir el envío del formulario

        const oldPassword = document.getElementById("profile-current-password").value.trim();
        const newPassword = document.getElementById("profile-new-password").value.trim();
        const confirmNewPassword = document.getElementById("profile-confirm-new-password").value.trim();

        // Verificar que no estén vacíos
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Validación de la nueva contraseña (mínimo 8 caracteres, al menos una letra y un número)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            alert('La nueva contraseña debe tener al menos 8 caracteres, incluyendo letras y números.');
            return;
        }

        // Verificar que las contraseñas coincidan
        if (newPassword !== confirmNewPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        // Enviar los datos usando fetch (POST)
        try {
            const response = await fetch('/updateProfilePassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Contraseña actualizada correctamente');
                window.location.reload()
            } else {
                alert('Error al actualizar la contraseña: ' + result.message);
            }
        } catch (error) {
            alert('Hubo un error al enviar los datos: ' + error.message);
        }
    });

    /*--------------------------------------------- Mostrar entrenadores para cambiarlo ------------------------------------------------------- */
    const profileCoach = document.getElementById("profile-coach");
    profileCoach.addEventListener("click", async function (e) {
        e.preventDefault();
        // Obtener el perfil del entrenador desde el servidor
        
        try {
            const response = await fetch('/getCoach');
            const data = await response.json();

            document.getElementById("currentTrainer").innerHTML = "Entrenador actual: "+ data.name + " " + data.surname + " "+ data.secondsurname;
        } catch (error) {
            alert("Error al cargar el entrenador" + error);
        }

        const coachDropdownDiv = document.getElementById('coachSelect');
        const coachDropdown = document.getElementById('coachName');

        try {
            const response = await fetch('/getCoaches'); // hacer un get
            const coaches = await response.json();

            coachDropdown.innerHTML = '<option class="body-text-font" value="">Selecciona un entrenador</option>';
            coaches.forEach(coach => {
                coachDropdown.innerHTML += `<option class="body-text-font" value="${coach.id}">${coach.fullName}</option>`;
            });

            coachDropdownDiv.style.display = 'block';
        } catch (err) {
            console.error('Error al obtener entrenadores:', err);
        }
    });

    /*----------------------------------------- Cambiar el entrenador --------------------------------------------- */
    const changeCoachButton = document.getElementById("change-coach-button");
    changeCoachButton.addEventListener("click", async function (e) {
        e.preventDefault(); // Prevenir el envío del formulario
        
        const selectedCoachId = document.getElementById("coachName").value;
        alert(" Id del coach " +selectedCoachId);
        // Verificar que no esté vacío
        if (!selectedCoachId) {
            alert("Por favor, selecciona un entrenador.");
            return;
        }

        // Enviar los datos usando fetch (POST)
        try {
            const response = await fetch('/updateCoach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    coachId: selectedCoachId,
                }),
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Entrenador cambiado correctamente');
                window.location.reload()
            } else {
                alert('Error al cambiar el entrenador: ' + result.message);
            }
        } catch (error) {
            alert('Hubo un error al enviar los datos: ' + error.message);
        }
    });

    /* -------------------------------------------- Diario de clases----------------------------------------- */
    document.getElementById("class-diary-button").addEventListener("click", async function (e) {
        e.preventDefault();
        document.querySelector("#sidebar").classList.toggle("collapsed");

        document.getElementById("main-content").style.display = "none";
        document.getElementById("create-workout").style.display = "none";
        document.getElementById("profile").style.display = "none";
        document.getElementById("attendance-record").style.display = "none";

        const diaryClass = document.getElementById("diary-class");
        diaryClass.style.display = "block";

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
            pageSize: 5,
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


        // Mostrar detalles
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
            leftCol.classList.add("col-md-6");
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
        leftCol.classList.remove("col-md-6");
        leftCol.classList.add("col-12");
        });

        /* --------------------------------------------- Añadir una clase de diario --------------------------------------------------------------- */
        // Formulario añadir diario
        document.getElementById("add-class-diary").addEventListener("click", function (e) {
            e.preventDefault();
            document.getElementById("add-class-diary-form").style.display = "block";
        });
        
        document.getElementById("diary-date").value = today;
        document.getElementById("add-class-diary-form-button").addEventListener("click", async function (e) {
        e.preventDefault();

        const title = document.getElementById("diary-title").value;
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
    /* --------------------------------------------- Cerrar formulario de diario de clases -------------------------------------------- */
    const closeDiaryFormButton = document.getElementById("cancel-class-diary-form-button");
    closeDiaryFormButton.addEventListener("click", function (e) {
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
                leftCol.classList.remove("col-md-6");
                leftCol.classList.add("col-12");

            } else {
                alert('Error al eliminar: ' + result.message);
            }
        } catch (error) {
            alert('Error al enviar datos: ' + error.message);
        }
    });

    /* -------------------------------------------- Formulario de diario de competiticiones ---------------------------------------------*/
    // Directas
    
});


