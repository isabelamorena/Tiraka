const express = require('express');
const router = express.Router();
const pool = require('../../db');
const bcrypt = require('bcryptjs');
const { capitalizeFirstLetter } = require('../functions/functions');
const { isSessionValid } = require('../functions/functions');

/* -------------------------------------------------- Perfil -------------------------------------------------------------- */
// Obtener el perfil del entrenador
router.get('/getProfileCoach',isSessionValid, async (req, res) => {
   
    try {
        const coachId = req.session.user.userId;
        console.log("ID del entrenador:", coachId);
        const result = await pool.query('SELECT username, name, surname, secondsurname, clubname, email FROM coach WHERE id = $1', [coachId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Entrenador no encontrado' });
        }
        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.log("Error en el backend al obtener el perfil del entrenador:", error);
    }
});

// Guardar los cambios del perfil del entrenador
router.post('/updateProfileCoach',isSessionValid, async (req, res) => {
     try {
        const coachId = req.session.user.userId;
        const {username, name, surname, secondsurname, clubname, email} = req.body;

        const formattedName = capitalizeFirstLetter(name);
        const formattedSurname = capitalizeFirstLetter(surname);
        const formattedSecondSurname = capitalizeFirstLetter(secondsurname);
        const formattedClub = capitalizeFirstLetter(clubname);

        const updateQuery = `
            UPDATE public.coach
            SET username = $1, name = $2, surname = $3, secondsurname = $4, clubname = $5, email = $6
            WHERE id = $7
        `;

        const result = await pool.query(updateQuery, [username, formattedName, formattedSurname, formattedSecondSurname, formattedClub, email, coachId]);

        return res.status(200).json({ success: true, message: 'Perfil actualizado correctamente' });

    } catch (error) {
        console.log("Error en el backend al actualizar el perfil del entrenador:", error);
    }
});

// Cambiar la contraseña del entrenador
router.post('/updateProfilePasswordCoach',isSessionValid, async (req, res) => {

    const coachId = req.session.user.userId;
    const { oldPassword, newPassword } = req.body;

    try {
        // Verificar la contraseña actual
        const userResult = await pool.query('SELECT * FROM coach WHERE id = $1', [coachId]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
        }

        // Actualizar la contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE coach SET password = $1 WHERE id = $2', [hashedNewPassword, coachId]);

        return res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });

    } catch (error) {
        console.error("Error al cambiar la contraseña del tirador:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.' 
        });
    }
});

module.exports = router;