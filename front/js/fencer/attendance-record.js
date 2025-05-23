document.addEventListener("DOMContentLoaded", function () {
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
        document.getElementById("competition-diary").style.display = "none";
        document.getElementById("attendance-record").style.display = "block";

        try {
            const response = await fetch('/getAttendanceRecord');
            const data = await response.json();

            renderAttendanceWithPagination(data);
            loadAttendanceChart(); // Cargar gráfico de asistencia

        } catch (error) {
            console.error("Error al obtener el historial de asistencias:", error);
            alert("Error al cargar las asistencias");
        }
    });

    // Función para mostrar la tabla de asistencias con paginación
    function renderAttendanceWithPagination(data) {
    const tableBody = document.getElementById("attendance-body");
    const paginationContainer = document.getElementById("attendance-pagination");

    if (!data || data.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='4'>No hay registros de asistencia</td></tr>";
        paginationContainer.innerHTML = ""; // Limpiar paginación si no hay datos
        return;
    }

    // Función para convertir minutos a "Xh Ym"
    function formatMinutesToHoursMinutes(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
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
                    <td>${minutesWorked !== "No registrado" ? formatMinutesToHoursMinutes(minutesWorked) : minutesWorked}</td>
                `;
                tableBody.appendChild(row);
            });

            // Fila total por página
            const totalRow = document.createElement("tr");
            totalRow.innerHTML = `
                <td colspan="3" style="font-weight:bold;">Total tiempo trabajado (página):</td>
                <td style="font-weight:bold;">${formatMinutesToHoursMinutes(totalMinutesWorked)}</td>
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

    /* ----------------------------------------------------------- Gráfico de asistencia ------------------------------------------------- */
    async function loadAttendanceChart() {
        try {
            const res = await fetch('/getAttendanceRecord');
            const data = await res.json();

            // Procesar datos para obtener minutos por día
            const labels = [];
            const minutesData = [];

            data.forEach(record => {
            labels.push(new Date(record.date).toLocaleDateString());

            if (record.check_in && record.check_out) {
                const [inH, inM] = record.check_in.split(':').map(Number);
                const [outH, outM] = record.check_out.split(':').map(Number);
                const minutes = (outH * 60 + outM) - (inH * 60 + inM);
                minutesData.push(minutes);
            } else {
                minutesData.push(0);
            }
            });

            const ctx = document.getElementById('attendanceChart').getContext('2d');
            new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                label: 'Minutos de asistencia',
                data: minutesData,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
                }]
            },
            options: {
                scales: {
                y: { beginAtZero: true }
                },
                plugins: {
                legend: { display: true },
                tooltip: { enabled: true }
                }
            }
            });

        } catch (error) {
            console.error('Error cargando gráfico de asistencias:', error);
        }
    }


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

});