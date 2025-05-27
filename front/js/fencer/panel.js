document.addEventListener("DOMContentLoaded", function () {
    
    // Función para establecer la hora y fecha por defecto
    function setDefaultTimes() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        document.getElementById('checkin').value = `${hours}:${minutes}`;
        document.getElementById('date').value = now.toISOString().split('T')[0]; // Establecer la fecha actual
    }

    // Función para el último diario de clase
    async function lastClassDiary() {
       try {
            const response = await fetch('/getLastClassDiary', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'  // Asegúrate de que se incluyan las cookies si las usas
            });
            const data = await response.json();

            if (data.success) {
                const lastDiary = data.diary;
                const diaryContainer = document.getElementById('last-class-diary');
                diaryContainer.innerHTML = `
                    <p><strong>Fecha:</strong> ${new Date(lastDiary.date).toLocaleDateString()}</p>
                    <p style="white-space: pre-wrap;"><strong>Descripción:</strong> ${lastDiary.description}</p>
                `;
            } else if (!data.success && data.message) {
                const diaryContainer = document.getElementById('last-class-diary');
                diaryContainer.innerHTML = `<p class="text-danger">${data.message}</p>`;
            }


        } catch (error) {
            console.error("Error al obtener el historial de asistencias:", error);
            alert("Error al cargar las asistencias");
        }
    }

    

    const formAttendance = document.getElementById("formAttendance");
    // Añadir una asistencia
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
                
                const successMessage = document.getElementById('messageAttendance');
                successMessage.innerHTML = '<p class= "fw-bold fs-6">*registro de asistencia exitoso</p>';
                
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

    /* ------------------------------------ Formulario de asistencia ---------------------------------------------- */
    // Establecer fecha de hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    // Ejecutar al cargar
    setDefaultTimes();
    // Actualizar cada minuto
    setInterval(setDefaultTimes, 60000); // cada 60.000 ms = 1 minuto

    /* --------------------------------- Último diario de asistencia ---------------------------------------- */
    lastClassDiary();

});