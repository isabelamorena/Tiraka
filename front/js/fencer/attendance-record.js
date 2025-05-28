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

            AttendanceWithPagination(data);

        } catch (error) {
            console.error("Error al obtener el historial de asistencias:", error);
            alert("Error al cargar las asistencias");
        }
    });

    /* ------------------------------------ Función para mostrar la tabla de asistencias con paginación -------------------------------------------- */
    function AttendanceWithPagination(data) {
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


    /* ---------------------------------------------- Mostrar asistencias de un rango de fechas determinado --------------------------------------------*/
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

            AttendanceWithPagination(data);

        } catch (error) {
            console.error('Error al filtrar el historial de asistencias:', error);
            alert('Error al filtrar asistencias ' + error.message );
        }
    });
    
    
    

});
