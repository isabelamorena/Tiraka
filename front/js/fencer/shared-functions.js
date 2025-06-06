export function showPanel(panelId) {
    const panels = [
        "profile",
        "diary-class",
        "competition-diary",
        "create-workout",
        "training-templates",
        "attendance-record",
        "main-content",
        "workout-calendar",
        "todays-session",
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