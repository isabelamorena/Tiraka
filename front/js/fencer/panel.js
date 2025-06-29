import { showPanel, showAlert, showConfirm, fencersCoach, formatDateYYYYMMDD } from '../shared-functions.js';


document.addEventListener("DOMContentLoaded", function () {

    showPanel("main-content");

    document.getElementById("home-link").addEventListener("click", function (e) {
        e.preventDefault();
        // Mostrar solo el panel de asistencia
        document.querySelector("#sidebar").classList.toggle("collapsed");
        showLastAttendances()
        lastClassDiary();
        showTodayFencerWorkouts();
        setDefaultTimes();
        showPanel("main-content");
    });
    
    // Función para establecer la hora y fecha por defecto
    function setDefaultTimes() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        document.getElementById('checkin').value = `${hours}:${minutes}`;
        document.getElementById('date').value = now.toISOString().split('T')[0]; // Establecer la fecha actual
    }

    // Función para mostrar las 6 últimas asistencias
    async function showLastAttendances() {
        try {
            const response = await fetch('/getLastAttendances', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'  // Asegúrate de que se incluyan las cookies si las usas
            });
            const data = await response.json();
            if (data.success) {
                const attendances = data.attendances;
                const tableBody = document.getElementById('last-attendances');

                if (!tableBody) {
                    console.error("No se encontró el elemento con ID 'last-attendances'");
                    return;
                }

                tableBody.innerHTML = ''; // Limpiar la tabla

                if (attendances.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td colspan="3" class="text-center text-muted">No hay asistencias recientes</td>`;
                    tableBody.appendChild(row);
                    return;
                }

                attendances.forEach(attendance => {
                    const row = document.createElement('tr');
                    const formattedDate = new Date(attendance.date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    });

                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${attendance.checkin ? attendance.checkin.slice(0, 5) : '<span class="text-danger">No registrado</span>'}</td>
                        <td>${attendance.checkout ? attendance.checkout.slice(0, 5) : '<span class="text-danger">No registrado</span>'}</td>
                    `;
                    tableBody.appendChild(row);
                });

            } else {
                const tableBody = document.getElementById('last-attendances');
                tableBody.innerHTML = `<tr><td colspan="4" class="text-danger">${data.message}</td></tr>`;
            }
        } catch (error) {
            showAlert("Error al cargar las asistencias" + error);	
        }
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
                    <h1 class="text-center" style="font-size: x-large";>${lastDiary.title}</h1>
                    <hr class="line">
                    <p><strong>Fecha:</strong> ${new Date(lastDiary.date).toLocaleDateString()}</p>
                    <p style="white-space: pre-wrap;" >${lastDiary.description}</p>
                `;
            } else if (!data.success && data.message) {
                const diaryContainer = document.getElementById('last-class-diary');
                diaryContainer.innerHTML = `<p class="text-danger">${data.message}</p>`;
            }


        } catch (error) {
            showAlert("Error al cargar las asistencias" + error);
        }
    }

    // Función para mostrar los entrenamientos del tirador hoy
    async function showTodayFencerWorkouts() {
        const getPersonalWorkoutToday = await fetch('/getPersonalWorkoutToday');
        const dataPersonal = await getPersonalWorkoutToday.json();
        const getCoachWorkoutToday = await fetch('/getCoachWorkoutToday');
        const dataCoach = await getCoachWorkoutToday.json();

        // Extraer correctamente los arrays
        const personalWorkouts = Array.isArray(dataPersonal.workout) ? dataPersonal.workout : [];
        const coachWorkouts = Array.isArray(dataCoach.workout) ? dataCoach.workout : [];

        const workoutContainer = document.getElementById('today-workouts');
        workoutContainer.innerHTML = ''; // Limpiar el contenedor

        if (coachWorkouts.length === 0 && personalWorkouts.length === 0) {
            workoutContainer.innerHTML = '<p class="text-muted">No hay entrenamientos programados para hoy.</p>';
            return;
        }
        workoutContainer.innerHTML = `
            <div class="today-workouts-header mb-4 text-center">
                <span class="d-block mt-2" style="font-size:1.25rem;color:#B59E4Cff;font-weight:bold;">
                    Hoy tienes los siguientes entrenamientos programados:
                </span>
            </div>
`;

        // Primero los del entrenador
        coachWorkouts.forEach(workout => {
            const workoutElement = document.createElement('div');
            workoutElement.className = 'workout-item coach';
            workoutElement.innerHTML = `
                <h3>Programado por tu entrenador:</h3>
                <h2>${workout.title}</h2>
            `;
            workoutContainer.appendChild(workoutElement);
        });

        // Luego los personales
        personalWorkouts.forEach(workout => {
            const workoutElement = document.createElement('div');
            workoutElement.className = 'workout-item personal';
            workoutElement.innerHTML = `
                <h3>Tu entrenamiento personal:</h3>
                <h2>${workout.title}</h2>
            `;
            
            workoutContainer.appendChild(workoutElement);

        });

        // Por último, una frase motivacional
        const motivationalQuote = document.createElement('div');
        motivationalQuote.className = 'motivational-quote';
       
        const getQuote = await fetch(`/getMotivationalQuotes`);
        const dataQuote = await getQuote.json();
        motivationalQuote.innerHTML = `<p>${dataQuote.quote?.quote || "¡Ánimo!"}</p>`;
        workoutContainer.appendChild(motivationalQuote);
    }


    /* ----------------------------------------------- Añadir una asistencia --------------------------------------------------------------------*/
    const formAttendance = document.getElementById("formAttendance");
    formAttendance.addEventListener("submit", async function (e) {
        e.preventDefault();
        const date = document.getElementById("date").value;
        const checkin = document.getElementById("checkin").value;
        const checkout = document.getElementById("checkout").value;

        // Verificar que no esten vacíos
        if (!date || !checkin || !checkout) {
            e.preventDefault(); // Evitar el envío del formulario
            showAlert("Por favor, completa todos los campos.");
            return;
        }

        // Verificar que la fecha no sea mayor a la actual 
        const today = new Date();
        const selectedDate = new Date(date);
        if (selectedDate > today) {
            e.preventDefault(); // Evitar el envío del formulario
            showAlert("La fecha no puede ser mayor a la actual.");
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
            showAlert("La hora de salida debe ser posterior a la hora de entrada.");
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
                
                showAlert('Asistencia registrada correctamente');

                // Limpiar el formulario y resetear hora
                formAttendance.reset();
                setDefaultTimes();
                setInterval(setDefaultTimes, 60000);
            
                // Ocultar el mensaje después de 3 segundos
                setTimeout(() => {
                    successMessage.innerHTML = '';
                }, 3000);

                showLastAttendances();

            } else {
                
                showAlert('Error al registrar la asistencia: ' + result.message);

                setTimeout(() => {
                    successMessage.innerHTML = '';
                }, 3000);
            }
            
        } catch (error) {
            console.error('Error en la solicitud:', error);
            showAlert('Hubo un error al enviar los datos!');
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

    /* ---------------------------------- Últimas 5 asistencias --------------------------------------------------*/
    showLastAttendances();

    /* ---------------------------------- Entrenamientos del tirador hoy ---------------------------------------- */
    showTodayFencerWorkouts();

});

window.showPanel = showPanel;