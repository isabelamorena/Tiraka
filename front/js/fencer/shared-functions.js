export function showPanel(panelId) {
    const panels = [
        "profile",
        "diary-class",
        "competition-diary",
        "create-workout",
        "training-templates",
        "attendance-record",
        "main-content"
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

