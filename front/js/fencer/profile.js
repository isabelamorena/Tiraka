import { showPanel, showAlert, showConfirm, fencersCoach, formatDateYYYYMMDD } from '../shared-functions.js';

document.addEventListener("DOMContentLoaded", function () {
    /*--------------------------------------------------------- Perfil ------------------------------------------------------------ */
    const showProfile = document.getElementById("profile-link");

    showProfile.addEventListener("click", async function (e) {
        e.preventDefault(); // Prevenir el envío del formulario
        document.querySelector("#sidebar").classList.toggle("collapsed");
        showPanel("profile");


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
            showAlert("Error al cargar el perfil" + error);
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
            showAlert("Error al cargar el perfil" + error);
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
            showAlert("Por favor, completa todos los campos.");
            return;
        }

        // Validación de nombre y apellidos (solo letras y espacios)
        const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
        if (![name, surname, secondsurname].every(val => nameRegex.test(val))) {
            showAlert('El nombre y apellidos solo pueden contener letras y espacios.');
            return;
        }

        // Validación de email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            showAlert('El correo electrónico no es válido.');
            return;
        }

        // Verificar que la fecha de nacimiento no sea hoy o en el futuro
        const birthDateObj = new Date(birthdate);
        const today = new Date();   
        if (birthDateObj >= today) {
            showAlert('La fecha de nacimiento no puede ser hoy o en el futuro.');
            return;
        }

        // La primera letra del nombre, apellidos y club deben ser mayúsculas
            const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);
            const capitalizedName = capitalizeFirstLetter(name);
            const capitalizedSurname = capitalizeFirstLetter(surname);
            const capitalizedSecondSurname = capitalizeFirstLetter(secondsurname);
            const capitalizedClubname = capitalizeFirstLetter(clubname);
           
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
                showAlert('Perfil actualizado correctamente');
            } else {
                showAlert('Error al actualizar el perfil: ' + result.message);
            }
        } catch (error) {
            showAlert('Hubo un error al enviar los datos: ' + error.message);
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
            showAlert("Por favor, completa todos los campos.");
            return;
        }

        // Validación de la nueva contraseña (mínimo 8 caracteres)
        const passwordRegex = /^.{8,}$/; // Al menos 8 caracteres
        if (!passwordRegex.test(newPassword)) {
            showAlert('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }

        // Verificar que las contraseñas coincidan
        if (newPassword !== confirmNewPassword) {
            showAlert('Las contraseñas no coinciden.');
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
                showAlert('Contraseña actualizada correctamente');
                // Limpiar los campos de contraseña
                document.getElementById("profile-current-password").value = '';
                document.getElementById("profile-new-password").value = '';
                document.getElementById("profile-confirm-new-password").value = '';
                
            } else {
                showAlert('Error al actualizar la contraseña: ' + result.message);
            }
        } catch (error) {
            showAlert('Hubo un error al enviar los datos: ' + error.message);
        }
    });

    // Mostrar/ocultar contraseña
    const setupPasswordToggle = (inputId, iconId) => {
        const input = document.getElementById(inputId);
        const button = document.getElementById(iconId).parentElement;

        const showPassword = () => input.type = "text";
        const hidePassword = () => input.type = "password";

        // Para mouse
        button.addEventListener("mousedown", showPassword);
        button.addEventListener("mouseup", hidePassword);
        button.addEventListener("mouseleave", hidePassword);

        // Para dispositivos táctiles
        button.addEventListener("touchstart", showPassword);
        button.addEventListener("touchend", hidePassword);
    };

    setupPasswordToggle("profile-current-password", "eye-icon-current");
    setupPasswordToggle("profile-new-password", "eye-icon-new");
    setupPasswordToggle("profile-confirm-new-password", "eye-icon-confirm");

    /*--------------------------------------------- Mostrar entrenadores para cambiarlo ------------------------------------------------------- */
    const profileCoach = document.getElementById("profile-change-coach");
    profileCoach.addEventListener("click", async function (e) {
        e.preventDefault();
        // Obtener el perfil del entrenador desde el servidor
        
        try {
            const response = await fetch('/getCoach');
            const data = await response.json();
            if (!data) {
                document.getElementById("currentTrainer").innerHTML = "No tienes un entrenador asignado.";
                return;
            }
            document.getElementById("currentTrainer").innerHTML = "Entrenador actual: "+ data.name + " " + data.surname + " "+ data.secondsurname;
        } catch (error) {
            showAlert("Error al cargar el entrenador" + error);
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
        // Verificar que no esté vacío
        if (!selectedCoachId) {
            showAlert("Por favor, selecciona un entrenador.");
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
                window.location.reload()
            } else {
                showAlert('Error al cambiar el entrenador: ' + result.message);
            }
        } catch (error) {
            showAlert('Hubo un error al enviar los datos: ' + error.message);
        }
    });

});