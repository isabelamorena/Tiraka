
// Función para poner la primera letra en mayúscula y el resto en minúscula
function capitalizeFirstLetter(text) {
    if (typeof text !== 'string') return text; // Verifica si es una cadena de texto
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function isSessionValid(req, res, next) {
    if (req.session && req.session.user && req.session.user.userId) {
        return next(); // La sesión es válida, continuar con la siguiente función
    } else {
        return res.status(401).json({ success: false, message: 'No autorizado' }); // La sesión no es válida, devolver un error
    }
}


module.exports = {
    capitalizeFirstLetter, 
    isSessionValid
};