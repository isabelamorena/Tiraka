document.addEventListener('DOMContentLoaded', function() {
    /* ------------------------------------------- Perfil ----------------------------------------------------- */
    // Función para mostrar el perfil del coach
    async function showProfile() {
        // Obtener el perfil del usuario desde el servidor
        try {
            const response = await fetch('/getProfileCoach');

            const data = await response.json(); // Suponiendo que el servidor devuelve 
            // Mostrar los datos en el formulario
            document.getElementById("profile-title").innerHTML = "Hola " + data.name + " " + data.surname + " !";
            document.getElementById("profile-username").value = data.username ?? "Apellido no disponible";
            document.getElementById("profile-name").value = data.name ?? "Nombre no disponible";
            document.getElementById("profile-surname").value = data.surname ?? "Apellido no disponible";
            document.getElementById("profile-secondsurname").value = data.secondsurname ?? "Segundo apellido no disponible";
            document.getElementById("profile-clubname").value = data.clubname ?? "Nombre del club no disponible";
            document.getElementById("profile-email").value = data.email ?? "Email no disponible";
        } catch (error) {
            alert("Error al cargar el perfil" + error);
        }
    };

    // Mostrar el perfil al hacer clic en el enlace
    const profileLink = document.getElementById('profile-link');
    profileLink.addEventListener('click', function(e) {
        const profileSection = document.getElementById('profile');
        profileSection.classList.remove('hidden'); // Muestra la sección del perfil
        e.preventDefault(); 
        showProfile(); // Llama a la función para mostrar el perfil
    });

    // Mostrar el perfil cuando pinchas en general
    const profileGeneral = document.getElementById("profile-general");
    profileGeneral.addEventListener('click', function(e) {
        e.preventDefault(); 
        showProfile(); // Llama a la función para mostrar el perfil
    });

    /*----------------------------------------------- Guardar los cambios del perfil del entrenador --------------------------------------------------*/
    const profileBtn = document.getElementById("profile-button");
    profileBtn.addEventListener('click', async function(e) {
        e.preventDefault(); 

        const username = document.getElementById("profile-username").value.trim();
        const name = document.getElementById("profile-name").value.trim();
        const surname = document.getElementById("profile-surname").value.trim();
        const secondsurname = document.getElementById("profile-secondsurname").value.trim();
        const clubname = document.getElementById("profile-clubname").value.trim();
        const email = document.getElementById("profile-email").value.trim();

        // Verificar que no estén vacíos
        if (!username || !name || !surname || !secondsurname || !clubname || !email) {
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
           
        try {
            const response = await fetch('/updateProfileCoach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    name,
                    surname,
                    secondsurname,
                    clubname,
                    email,
                }),
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Perfil actualizado correctamente');
                showProfile();
            } else {
                alert('Error al actualizar el perfil: ' + result.message);
            }
        } catch (error) {
            alert('Hubo un error al enviar los datos: ' + error.message);
        }

    });

    /* ----------------------------------------------- Cambiar la contraseña del entrenador ----------------------------------------------------- */
    const profilePasswordBtn = document.getElementById("profile-password-button");
    profilePasswordBtn.addEventListener('click', async function(e) {
        e.preventDefault(); 

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
            const response = await fetch('/updateProfilePasswordCoach', {
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

});