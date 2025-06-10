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

/* -------------------------------------- Obtener los tiradores vinculados al coach ------------------------------------*/
router.get('/getFencersCoach', isSessionValid, async (req, res) => {
    try {
        const coachId = req.session.user.userId;
        const result = await pool.query('SELECT fencer.id, fencer.name, fencer.surname, fencer.secondsurname FROM fencer INNER JOIN fencer_coach ON fencer.id = fencer_coach.fencer_id WHERE fencer_coach.coach_id = $1', [coachId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron tiradores vinculados al entrenador' });
        }
        console.log("Tiradores del coach:", result.rows);
        return res.status(200).json({ success: true, fencers: result.rows });

    } catch (error) {
        console.error("Error al obtener los tiradores del coach:", error);
        return res.status(500).json({ success: false, message: 'Error en el servidor al obtener los tiradores' });
    }
});

/* ------------------------------------------------------ Entrenamientos ---------------------------------------------------*/
// Crear un entrenamiento para uno o varios tiradores
router.post('/createCoachWorkout', isSessionValid, async (req, res) => {
    try {
        const coachId = req.session.user.userId;
        const { fencerIds, workouts } = req.body;

        if (!Array.isArray(fencerIds) || fencerIds.length === 0 || !Array.isArray(workouts) || workouts.length === 0) {
            return res.status(400).json({ success: false, message: 'Datos incompletos' });
        }

        // Construir los valores para el INSERT
        const values = [];
        for (const fencerId of fencerIds) {
            for (const workout of workouts) {
                values.push([
                    workout.title || 'Entrenamiento sin título',
                    fencerId,
                    coachId,
                    workout.date,
                    workout.description,
                    workout.duration,
                    workout.feedback || '',
                    workout.number_of_sets,
                    workout.number_of_reps,
                    false, // is_completed por defecto en false
                    workout.template_id || null // <-- Añadido aquí
                ]);
            }
        }

        // Generar la consulta dinámica para múltiples inserts
        const insertQuery = `
            INSERT INTO fencer_coach_sessions(
                title, fencer_id, coach_id, date, description, duration, feedback, number_of_sets, number_of_reps, is_completed, template_id)
            VALUES ${values.map((_, i) => `($${i * 11 + 1}, $${i * 11 + 2}, $${i * 11 + 3}, $${i * 11 + 4}, $${i * 11 + 5}, $${i * 11 + 6}, $${i * 11 + 7}, $${i * 11 + 8}, $${i * 11 + 9}, $${i * 11 + 10}, $${i * 11 + 11})`).join(', ')}
        `;

        // Aplanar los valores para pasarlos a la query
        const flatValues = values.flat();

        await pool.query(insertQuery, flatValues);

        return res.status(200).json({ success: true, message: 'Entrenamientos guardados correctamente' });
    } catch (error) {
        console.error("Error al guardar entrenamientos del coach:", error);
        return res.status(500).json({ success: false, message: 'Error en el servidor al guardar entrenamientos' });
    }
});

// Obtener las plantillas de entrenamiento del coach
router.get('/getTrainingTemplatesCoach', isSessionValid, async (req, res) => {
    const coachId = req.session.user.userId;

    try {
        const result = await pool.query(`
            SELECT * FROM coach_training_templates WHERE coach_id = $1
        `, [coachId]);
        console.log("Plantillas de entrenamiento obtenidas:", result.rows);
        res.status(200).json({
            success: true,
            templates: result.rows
        });

    } catch (error) {
        console.error("Error al obtener plantillas de entrenamiento:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
});

// Crear una plantilla de entrenamiento
router.post('/createTrainingTemplateCoach', isSessionValid, async (req, res) => {
    const coachId = req.session.user.userId;
    const { title, description, duration, number_of_sets, number_of_reps } = req.body;

    try {
        const insertQuery = `
            INSERT INTO coach_training_templates(
                coach_id, title, description, duration, number_of_sets, number_of_reps)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
        `;

        const result = await pool.query(insertQuery, [coachId, title, description, duration, number_of_sets, number_of_reps]);

        // Devuelve el id de la plantilla creada
        return res.status(201).json({ success: true, message: 'Plantilla de entrenamiento creada exitosamente', id: result.rows[0].id });
    } catch (error) {
        console.error("Error al crear plantilla de entrenamiento:", error.message);
        return res.status(500).json({ success: false, message: 'Hubo un error en el servidor' });
    }
});

/* -------------------------------------------------------- Plantillas ------------------------------------------- */
// Obtener las plantillas del coach
router.get('/getTemplatesCoach', isSessionValid, async (req, res) => {
    const coachId = req.session.user.userId;

    try {
        const result = await pool.query(`
            SELECT * FROM coach_training_templates WHERE coach_id = $1
        `, [coachId]);
        console.log("Plantillas obtenidas:", result.rows);
        res.status(200).json({
            success: true,
            templates: result.rows
        });

    } catch (error) {
        console.error("Error al obtener plantillas:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
});

// Obtener una plantilla específica del coach
router.get('/getTemplateCoach/:templateId', isSessionValid, async (req, res) => {
    const coachId = req.session.user.userId;
    const templateId = req.params.templateId;

    try {
        const result = await pool.query(`
            SELECT * FROM coach_training_templates WHERE id = $1 AND coach_id = $2
        `, [templateId, coachId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
        }

        res.status(200).json({
            success: true,
            template: result.rows[0]
        });

    } catch (error) {
        console.error("Error al obtener plantilla:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
});

// Eliminar una plantilla del coach
router.post('/deleteTemplateCoach/:templateId', isSessionValid, async (req, res) => {
    const coachId = req.session.user.userId;
    const templateId = req.params.templateId;

    try {
        const result = await pool.query(`
            DELETE FROM coach_training_templates WHERE id = $1 AND coach_id = $2
        `, [templateId, coachId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Plantilla no encontrada o no pertenece al coach' });
        }

        res.status(200).json({ success: true, message: 'Plantilla eliminada correctamente' });

    } catch (error) {
        console.error("Error al eliminar plantilla:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
});

//Eliminar un entrenamiento específico del coach
router.post('/deleteCoachWorkout', isSessionValid, async (req, res) => {
    const { workoutId } = req.body;
    console.log("ID del entrenamiento a borrar:", workoutId);
    try {
        await pool.query('DELETE FROM fencer_coach_sessions WHERE id = $1', [workoutId]);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

/*-------------------------------------------------------- Calendario --------------------------------------------------- */
// Obtener todos los entrenamientos del coach
router.get('/getCoachWorkouts', isSessionValid, async (req, res) => {
    try {
        const coachId = req.session.user.userId;
        const result = await pool.query(`
        SELECT fencer_coach_sessions.id, fencer.name, fencer.surname, fencer.secondsurname, fencer_coach_sessions.date, fencer_coach_sessions.description,
	        fencer_coach_sessions.duration, fencer_coach_sessions.number_of_sets,fencer_coach_sessions.number_of_reps,
		        fencer_coach_sessions.title FROM fencer_coach_sessions INNER JOIN fencer ON fencer.id = fencer_coach_sessions.fencer_id 
			        WHERE fencer_coach_sessions.coach_id = $1
        `, [coachId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron entrenamientos para este coach' });
        }
        console.log("Entrenamientos del coach:", result.rows);
         // Asegúrate de que las fechas estén en el formato correcto
        return res.status(200).json({ success: true, workouts: result.rows });

    } catch (error) {
        console.error("Error al obtener los entrenamientos del coach:", error);
        return res.status(500).json({ success: false, message: 'Error en el servidor al obtener los entrenamientos' });
    }
});
module.exports = router;