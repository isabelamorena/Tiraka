// Maneja la funcionalidad del perfil del entrenador en la aplicación web.
export function showPanel(panelId) {
    const panels = [
        "profile",
        "create-workout",
        "my-templates",
        "workout-calendar"
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