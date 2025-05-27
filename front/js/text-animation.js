document.addEventListener("DOMContentLoaded", () => {
    const elitefencing = document.getElementById("elitefencing");
    const tirador = document.getElementById("tirador");
    const entrenador = document.getElementById("entrenador");

    // Agregar transición a todos los elementos
    [elitefencing, tirador, entrenador].forEach(el => {
        el.style.transition = "transform 0.3s ease, color 0.3s ease, font-weight 0.3s ease";
    });

    function animateSequence() {
        resetStyles();
        elitefencing.style.fontWeight = "900";
        elitefencing.style.transform = "scale(1.15)";
        elitefencing.style.color = "#B59E4Cff";

        setTimeout(() => {
            resetStyles();
            tirador.style.fontWeight = "900";
            tirador.style.transform = "scale(1.15)";
            tirador.style.color = "#B59E4Cff";
        }, 1000);

        setTimeout(() => {
            resetStyles();
            entrenador.style.fontWeight = "900";
            entrenador.style.transform = "scale(1.15)";
            entrenador.style.color = "#B59E4Cff";
        }, 2000);

        setTimeout(() => {
            elitefencing.style.fontWeight = "900";
            tirador.style.fontWeight = "900";
            entrenador.style.fontWeight = "900";
            elitefencing.style.transform = "scale(1.15)";
            tirador.style.transform = "scale(1.15)";
            entrenador.style.transform = "scale(1.15)";
            elitefencing.style.color = "#B59E4Cff";
            tirador.style.color = "#B59E4Cff";
            entrenador.style.color = "#B59E4Cff";
        }, 3000);

        setTimeout(() => {
            resetStyles();
            entrenador.style.fontWeight = "900";
            entrenador.style.transform = "scale(1.15)";
            entrenador.style.color = "#B59E4Cff";
        }, 4000);

        setTimeout(() => {
            resetStyles();
            tirador.style.fontWeight = "900";
            tirador.style.transform = "scale(1.15)";
            tirador.style.color = "#B59E4Cff";
        }, 5000);

        setTimeout(() => {
            resetStyles();
            elitefencing.style.fontWeight = "900";
            elitefencing.style.transform = "scale(1.15)";
            elitefencing.style.color = "#B59E4Cff";
        }, 6000);
    }

    function resetStyles() {
        [elitefencing, tirador, entrenador].forEach(el => {
            el.style.fontWeight = "200";
            el.style.transform = "scale(1)";
            el.style.color = "#B59E4Cff"; // Color original
        });
    }

    setInterval(animateSequence, 7000);
    animateSequence();
});
