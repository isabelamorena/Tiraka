import { showPanel, showAlert, showConfirm, fencersCoach, formatDateYYYYMMDD } from '../shared-functions.js';
  
let selectedStart = null;
let selectedEnd = null;

document.addEventListener("DOMContentLoaded", function () {

/*---------------------------------------------------------- Mostrar asistencias -------------------------------------------------------------- */
    const attendanceButton = document.getElementById("attendance-link");
    let attendanceDataGlobal = [];

    attendanceButton.addEventListener("click", async function (e) {
        e.preventDefault();
        document.querySelector("#sidebar").classList.toggle("collapsed");
        showPanel("attendance-record");

        try {
            const response = await fetch('/getAttendanceRecord');
            const data = await response.json();
            attendanceDataGlobal = data;
            AttendanceWithPagination(attendanceDataGlobal);
            renderAttendanceAreaChartByDay(attendanceDataGlobal);

        } catch (error) {
            console.error("Error al obtener el historial de asistencias:", error);
            showAlert("Error al cargar las asistencias");
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
        dateFormat: "Y-m-d",
        onChange: function(selectedDates) {
            if (selectedDates.length === 2) {
                selectedStart = selectedDates[0];
                selectedEnd = selectedDates[1];
            }
        }
    });

    document.getElementById("filter-attendance-button").addEventListener("click", function(e) {
        e.preventDefault();

        let filtered = attendanceDataGlobal;
        if (selectedStart && selectedEnd) {
            filtered = attendanceDataGlobal.filter(record => {
                const d = new Date(record.date.split('T')[0]);
                d.setHours(0,0,0,0);
                const start = new Date(selectedStart);
                start.setHours(0,0,0,0);
                const end = new Date(selectedEnd);
                end.setHours(0,0,0,0);
                return d >= start && d <= end;
            });
        }
        AttendanceWithPagination(filtered);
        renderAttendanceAreaChartByDay(filtered);
    });
    
    /* -------------------------------------------------- Gráfica --------------------------------------------- */
    function renderAttendanceAreaChartByDay(data) {
        // 1. Genera todos los días del rango seleccionado
        let start = selectedStart;
        let end = selectedEnd;
        if (!start || !end) {
            // Si no hay rango, usa el rango de los datos
            const allDates = data.map(r => new Date(r.date.split('T')[0]));
            if (allDates.length === 0) return;
            start = new Date(Math.min(...allDates));
            end = new Date(Math.max(...allDates));
        }

        // Crea un array con todos los días del rango
        const days = [];
        let d = new Date(start);
        d.setHours(0,0,0,0);
        end = new Date(end);
        end.setHours(0,0,0,0);
        while (d <= end) {
            days.push(new Date(d));
            d.setDate(d.getDate() + 1);
        }

        // 2. Agrupa minutos trabajados por día
        const workedByDate = {};
        data.forEach(record => {
            const dateStr = record.date.split('T')[0];
            let minutesWorked = 0;
            if (record.checkin && record.checkout) {
                const [inH, inM] = record.checkin.split(":").map(Number);
                const [outH, outM] = record.checkout.split(":").map(Number);
                const inMinutes = inH * 60 + inM;
                const outMinutes = outH * 60 + outM;
                minutesWorked = outMinutes - inMinutes;
            }
            workedByDate[dateStr] = (workedByDate[dateStr] || 0) + minutesWorked;
        });

        // 3. Prepara labels y datos para todos los días del rango
        const labels = days.map(dateObj => {
            return `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth()+1).toString().padStart(2, '0')}`;
        });
        const dataPoints = days.map(dateObj => {
            const dateStr = dateObj.toISOString().split('T')[0];
            return (workedByDate[dateStr] || 0) / 60; // Horas
        });

        // 4. Dibuja la gráfica
        const ctx = document.getElementById('attendanceAreaChart').getContext('2d');
        if (window.attendanceChart) window.attendanceChart.destroy();
        window.attendanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Horas trabajadas por día',
                    data: dataPoints,
                    fill: true,
                    borderColor: '#B59E4C',
                    backgroundColor: 'rgba(181,158,76,0.15)',
                    tension: 0.3,
                    pointBackgroundColor: '#B59E4C',
                    pointBorderColor: '#B59E4C',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: 'Horas trabajadas por día' }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        // stepSize de 0.25 para 15 minutos (0.25 horas)
                        ticks: {
                            stepSize: 0.25,
                            callback: function(value) {
                                // Muestra en formato "h:mm"
                                const hours = Math.floor(value);
                                const minutes = Math.round((value - hours) * 60);
                                return `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`;
                            }
                        },
                        title: { display: true, text: 'Horas' }
                    },
                    x: {
                        title: { display: true, text: 'Día' }
                    }
                }
            }
        });
    }

});