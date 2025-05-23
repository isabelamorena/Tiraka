document.addEventListener("DOMContentLoaded", () => {
    const elitefencing = document.getElementById("elitefencing");
    const tirador = document.getElementById("tirador");
    const entrenador = document.getElementById("entrenador");

    // Sequence of animations
    function animateSequence() {
        resetStyles();
        elitefencing.style.fontWeight = "900";  // Bold EliteFencing
        elitefencing.style.fontSize = "2.6rem";   // Agrandar fuente a 3rem
        elitefencing.style.color = "black";     // Cambiar color a negro

        setTimeout(() => {
            resetStyles();
            tirador.style.fontWeight = "900";    // Bold Tirador
            tirador.style.fontSize = "2.6rem";     // Agrandar fuente a 3rem
            tirador.style.color = "black";       // Cambiar color a negro
        }, 1000);

        setTimeout(() => {
            resetStyles();
            entrenador.style.fontWeight = "900"; // Bold Entrenador
            entrenador.style.fontSize = "2.6rem";  // Agrandar fuente a 3rem
            entrenador.style.color = "black";    // Cambiar color a negro
        }, 2000);

        setTimeout(() => {
            elitefencing.style.fontWeight = "900";
            tirador.style.fontWeight = "900";
            entrenador.style.fontWeight = "900"; // Bold all three
            elitefencing.style.fontSize = "2.6rem"; // Agrandar fuente a 3rem
            tirador.style.fontSize = "2.6rem";      // Agrandar fuente a 3rem
            entrenador.style.fontSize = "2.6rem";   // Agrandar fuente a 3rem
            elitefencing.style.color = "black";  // Cambiar color a negro
            tirador.style.color = "black";       // Cambiar color a negro
            entrenador.style.color = "black";    // Cambiar color a negro
        }, 3000);

        setTimeout(() => {
            resetStyles();
            entrenador.style.fontWeight = "900";
            entrenador.style.fontSize = "2.6rem";  // Agrandar fuente a 3rem
            entrenador.style.color = "black";    // Cambiar color a negro
        }, 4000);

        setTimeout(() => {
            resetStyles();
            tirador.style.fontWeight = "900";
            tirador.style.fontSize = "2.6rem";     // Agrandar fuente a 3rem
            tirador.style.color = "black";       // Cambiar color a negro
        }, 5000);

        setTimeout(() => {
            resetStyles();
            elitefencing.style.fontWeight = "900"; // Reverse order
            elitefencing.style.fontSize = "2.6rem";  // Agrandar fuente a 3rem
            elitefencing.style.color = "black";   // Cambiar color a negro
        }, 6000);
    }

    // Reset all styles to default
    function resetStyles() {
        elitefencing.style.fontWeight = "200";
        tirador.style.fontWeight = "200";
        entrenador.style.fontWeight = "200";
        elitefencing.style.fontSize = "2.5rem";  // Tamaño de fuente normal
        tirador.style.fontSize = "2.5rem";       // Tamaño de fuente normal
        entrenador.style.fontSize = "2.5rem";    // Tamaño de fuente normal
        elitefencing.style.color = "#929AAB"; // Color inicial (puedes poner el color predeterminado)
        tirador.style.color = "#929AAB";      // Color inicial
        entrenador.style.color = "#929AAB";   // Color inicial
    }

    // Repeat the sequence every 7 seconds
    setInterval(animateSequence, 7000);

    // Trigger animation immediately upon page load
    animateSequence();
});
