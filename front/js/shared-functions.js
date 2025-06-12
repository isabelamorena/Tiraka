export function showPanel(panelId) {
    const panels = [
        "profile-coach",
        "create-workout-coach",
        "my-templates-coach",
        "workout-calendar-coach",
        "my-fencers-coach",
        "profile",
        "diary-class",
        "competition-diary",
        "create-workout",
        "training-templates",
        "attendance-record",
        "main-content",
        "workout-calendar",
        "todays-session",
        "workout-history"
    ];
    panels.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === panelId) {
                el.classList.remove("d-none");
            } else {
                el.classList.add("d-none");
            }
        }
    });
}

// Formatea una fecha en el formato YYYY-MM-DD
export function formatDateYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Muestra una alerta personalizada
export function showAlert(msg) {
    const alertBox = document.getElementById('custom-alert');
    const messageEl = document.getElementById('custom-alert-message');

    messageEl.textContent = msg;
    
    // Reset clases por si ya estaba animado
    alertBox.classList.remove('hide');
    alertBox.classList.add('show');

    // Ocultar con transición después de 3.5s
    setTimeout(() => {
        alertBox.classList.remove('show');
        alertBox.classList.add('hide');
    }, 3000);
}

// Muestra una alerta de confirmación personalizado
export function showConfirm(message, onConfirm, onCancel) {
    const modal = document.getElementById('custom-confirm-modal');
    const msg = document.getElementById('custom-confirm-message');
    const okBtn = document.getElementById('custom-confirm-ok');
    const cancelBtn = document.getElementById('custom-confirm-cancel');
    msg.textContent = message;
    modal.style.display = 'flex';

    function cleanup() {
        modal.style.display = 'none';
        okBtn.onclick = null;
        cancelBtn.onclick = null;
    }

    okBtn.onclick = function() {
        cleanup();
        if (onConfirm) onConfirm();
    };
    cancelBtn.onclick = function() {
        cleanup();
        if (onCancel) onCancel();
    };
}

// Cerrar sesión
document.getElementById('logoutButton').addEventListener('click', async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                credentials: 'include',  // Para enviar la cookie de sesión con la solicitud
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Sesión cerrada');
                
                window.location.href = 'home.html';  // Redirige al login o a la página de inicio
            } else {
                showAlert('Hubo un problema al cerrar la sesión');
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    });

// Obtener los tiradores vinculados al coach
export async function fencersCoach() {
    try {
        const response = await fetch('/getFencersCoach');
        if (!response.ok) throw new Error('Error en la petición');
        const data = await response.json();
        // Devuelve el array de tiradores o lo que necesites
        return data.fencers || [];
    } catch (error) {
        console.log('Error obteniendo tiradores del coach:', error);
        return [];
    }
}

