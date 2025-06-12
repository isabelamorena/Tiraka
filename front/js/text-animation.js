document.addEventListener("DOMContentLoaded", () => {
    const tiraka = document.getElementById("tiraka");
    const esgrimista = document.getElementById("esgrimista");
    const entrenador = document.getElementById("entrenador");

    // Agregar transición a todos los elementos
    [tiraka, esgrimista, entrenador].forEach(el => {
        el.style.transition = "transform 0.3s ease, color 0.3s ease, font-weight 0.3s ease";
    });

    function animateSequence() {
        resetStyles();
        tiraka.style.fontWeight = "900";
        tiraka.style.transform = "scale(1.15)";
        tiraka.style.color = "#B59E4Cff";

        setTimeout(() => {
            resetStyles();
            esgrimista.style.fontWeight = "900";
            esgrimista.style.transform = "scale(1.15)";
            esgrimista.style.color = "#B59E4Cff";
        }, 1000);

        setTimeout(() => {
            resetStyles();
            entrenador.style.fontWeight = "900";
            entrenador.style.transform = "scale(1.15)";
            entrenador.style.color = "#B59E4Cff";
        }, 2000);

        setTimeout(() => {
            tiraka.style.fontWeight = "900";
            esgrimista.style.fontWeight = "900";
            entrenador.style.fontWeight = "900";
            tiraka.style.transform = "scale(1.15)";
            esgrimista.style.transform = "scale(1.15)";
            entrenador.style.transform = "scale(1.15)";
            tiraka.style.color = "#B59E4Cff";
            esgrimista.style.color = "#B59E4Cff";
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
            esgrimista.style.fontWeight = "900";
            esgrimista.style.transform = "scale(1.15)";
            esgrimista.style.color = "#B59E4Cff";
        }, 5000);

        setTimeout(() => {
            resetStyles();
            tiraka.style.fontWeight = "900";
            tiraka.style.transform = "scale(1.15)";
            tiraka.style.color = "#B59E4Cff";
        }, 6000);
    }

    function resetStyles() {
        [tiraka, esgrimista, entrenador].forEach(el => {
            el.style.fontWeight = "200";
            el.style.transform = "scale(1)";
            el.style.color = "#B59E4Cff"; // Color original
        });
    }

    setInterval(animateSequence, 7000);
    animateSequence();
});
