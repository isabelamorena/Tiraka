// Maneja la funcionalidad del perfil del entrenador en la aplicación web.
export function showPanel(panelId) {
    const panels = [
        "profile",
        "create-workout",
        "my-templates",
        "workout-calendar",
        "my-fencers"
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

// Formatea una fecha en el formato YYYY-MM-DD
export function formatDateYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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

export function showConfirm(message, onConfirm, onCancel) {
    let modal = document.getElementById('custom-confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'custom-confirm-modal';
        modal.style = 'display:flex; position:fixed; z-index:9999; left:0; top:0; width:100vw; height:100vh; background:rgba(0,0,0,0.3); align-items:center; justify-content:center;';
        modal.innerHTML = `
          <div style="background:#fff; padding:30px 20px; border-radius:8px; max-width:90vw; min-width:250px; text-align:center; margin:auto;">
            <div id="custom-confirm-message" style="margin-bottom:20px;"></div>
            <button id="custom-confirm-ok" class="btn btn-primary">Sí</button>
            <button id="custom-confirm-cancel" class="btn btn-secondary ms-2">No</button>
          </div>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById('custom-confirm-message').textContent = message;
    modal.style.display = 'flex';

    function cleanup() {
        modal.style.display = 'none';
        document.getElementById('custom-confirm-ok').onclick = null;
        document.getElementById('custom-confirm-cancel').onclick = null;
    }

    document.getElementById('custom-confirm-ok').onclick = function() {
        cleanup();
        if (onConfirm) onConfirm();
    };
    document.getElementById('custom-confirm-cancel').onclick = function() {
        cleanup();
        if (onCancel) onCancel();
    };
}


