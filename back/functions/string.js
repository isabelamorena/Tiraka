// Función para poner la primera letra en mayúscula y el resto en minúscula
function capitalizeFirstLetter(text) {
    if (typeof text !== 'string') return text; // Verifica si es una cadena de texto
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

module.exports = {
    capitalizeFirstLetter
};