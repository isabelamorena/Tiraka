document.addEventListener("DOMContentLoaded", function () {
    const image = document.getElementById('fencerImage');
    const section1 = document.getElementById('section1');
    const section2 = document.getElementById('section2');
    const section3 = document.getElementById('section3');
    const section4 = document.getElementById('section4');

    function updateImage() {
        const section1Position = section1.getBoundingClientRect();
        const section2Position = section2.getBoundingClientRect();
        const section3Position = section3.getBoundingClientRect();
        const section4Position = section4.getBoundingClientRect();

        // Cambiar la imagen cuando la sección está visible
        if (section1Position.top <= window.innerHeight && section1Position.bottom >= 0) {
            image.src = '../img/fencer1.jpg'; // Cambia la imagen para sección 1
            image.style.width = '30%'; 
        } else if (section2Position.top <= window.innerHeight && section2Position.bottom >= 0) {
            image.src = '../img/fencer2.JPG'; // Cambia la imagen para sección 2
             
        } else if (section3Position.top <= window.innerHeight && section3Position.bottom >= 0) {
            image.src = '../img/fencer3.JPG'; // Cambia la imagen para sección 3
            
        } else if (section4Position.top <= window.innerHeight && section4Position.bottom >= 0) {
            image.src = '../img/fencer4.JPG'; // Cambia la imagen para sección 4
            
        }
    }

    // Llama a la función al cargar la página
    updateImage();

    // Escucha el evento de scroll para actualizar la imagen
    window.addEventListener('scroll', updateImage);
});