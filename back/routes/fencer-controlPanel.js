const express = require('express');
const router = express.Router();
const pool = require('../../db');
const bcrypt = require('bcryptjs');
const { capitalizeFirstLetter } = require('../functions/functions');
const { isSessionValid } = require('../functions/functions');


/* ------------------------------------------ Asistencias ---------------------------------------------------------------- */
// Añadir un registro de asistencia
router.post('/attendanceRecord',isSessionValid, async (req, res) => {
    const { date, checkin, checkout } = req.body;
    const fencerId = req.session.user.userId; 

    try {
        const insertQuery = `
            INSERT INTO public.attendance_record(fencer_id, date, check_in, check_out)
                VALUES ($1, $2, $3, $4)
        `;

        const result = await pool.query(insertQuery, [fencerId, date, checkin, checkout]);

        return res.status(201).json({ success: true, message: 'Registro de asistencia exitoso' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Hubo un error en el servidor' });
    }
});

// Obtener el historial de asistencias
router.get('/getAttendanceRecord',isSessionValid, async (req, res) => {

    const fencerId = req.session.user.userId;

    try {
        const selectQuery = `
            SELECT 
                date AS "date", 
                check_in AS "checkin", 
                check_out AS "checkout"
            FROM public.attendance_record
            WHERE fencer_id = $1
            ORDER BY date DESC
        `;
        const result = await pool.query(selectQuery, [fencerId]);
        
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Error en la consulta de historial de asistencias:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.' 
        });
    }
});

// Obtener el historial de asistencias por rango de fecha
router.post('/getAttendanceRecordFilter',isSessionValid, async (req, res) => {

    const fencerId = req.session.user.userId;
    const { startDate, endDate } = req.body;

    try {
        const selectQuery = `
            SELECT 
                date AS "date", 
                check_in AS "checkin", 
                check_out AS "checkout"
            FROM public.attendance_record
            WHERE fencer_id = $1 AND date BETWEEN $2 AND $3
            ORDER BY date DESC
        `;
        const result = await pool.query(selectQuery, [fencerId, startDate, endDate]);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Error en la consulta de historial de asistencias:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.' 
        });
    }
});

// Obtener las 6 últimas asistencias
router.get('/getLastAttendances',isSessionValid, async (req, res) => {

    const fencerId = req.session.user.userId;
    try {
        const selectQuery = `
            SELECT
                date AS "date",
                check_in AS "checkin",
                check_out AS "checkout"
            FROM attendance_record
            WHERE fencer_id = $1
            ORDER BY date DESC
            LIMIT 5 
        `;
        const result = await pool.query(selectQuery, [fencerId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron asistencias recientes' });
        } else{
            console.log("Últimas asistencias:", result.rows);
            return res.status(200).json({
                success: true,
                attendances: result.rows
            });
        }
    }
    catch (error) {
        console.error("Error en la consulta de últimas asistencias:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
    }
);


/* ----------------------------------------------- Entrenamientos -------------------------------------------------- */
// Crear un nuevo entrenamiento
router.post('/createPersonalWorkout',isSessionValid, async (req, res) => {

    try {
        const { workouts } = req.body;
        if (!workouts || !Array.isArray(workouts)) {
            return res.status(400).json({ success: false, message: "Datos inválidos" });
        }
        const fencerId = req.session.user.userId;
        console.log("PARÁMETROS RECIBIDOS:", workouts);

        // Consulta para insertar datos en la base de datos (ahora incluye template_id)
        const query = `
            INSERT INTO public.fencer_personal_sessions(
                fencer_id, title, date, description, duration, number_of_sets, number_of_reps, is_completed, template_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;
        `;

        for (const workout of workouts) {
            const workoutDate = new Date(workout.date);
            if (isNaN(workoutDate.getTime())) {
                return res.status(400).json({ success: false, message: "Fecha de entrenamiento inválida" });
            }
            const formattedDate = workoutDate.toISOString().split('T')[0];

            // Si no viene template_id, pon null
            const templateId = workout.template_id || null;

            const values = [
                fencerId,
                workout.title,
                formattedDate,
                workout.description,
                workout.duration,
                workout.number_of_sets,
                workout.number_of_reps,
                false, // is_completed por defecto es false
                templateId
            ];
            const result = await pool.query(query, values);
            console.log(`Entrenamiento guardado con ID: ${result.rows[0].id}`);
        }

        res.status(201).json({ success: true, message: "Entrenamientos guardados correctamente" });

    } catch (error) {
        console.error("Error al guardar entrenamientos:", error.message);
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
});

// Obtener los entrenamientos del tirador
router.get('/getWorkouts', isSessionValid, async (req, res) => {
    const fencerId = req.session.user.userId;
    try {
        const selectQuery = `
            SELECT
                id AS "id",
                title AS "title",
                date AS "date",
                description AS "description",
                duration AS "duration",
                number_of_sets AS "number_of_sets",
                number_of_reps AS "number_of_reps",
                is_completed AS "is_completed"
            FROM public.fencer_personal_sessions
            WHERE fencer_id = $1
            ORDER BY date DESC
        `;
        const result = await pool.query(selectQuery, [fencerId]);
        console.log("Entrenamientos obtenidos:", result.rows);
        res.status(200).json({
            success: true,
            workouts: result.rows
        });
    } catch (error) {
        console.error("Error al obtener entrenamientos:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
});

// Obtener las plantillas de entrenamiento del tirador
router.get('/getTrainingTemplates', isSessionValid, async (req, res) => {
    const fencerId = req.session.user.userId;

    try {
        const result = await pool.query(`
            SELECT * FROM fencer_training_templates WHERE fencer_id = $1
        `, [fencerId]);
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

// Obtener una plantilla de entrenamiento por ID
router.get('/getTrainingTemplateById/:id', isSessionValid, async (req, res) => {
    const templateId = req.params.id;
    const fencerId = req.session.user.userId;
    try {
        const result = await pool.query(`
            SELECT * FROM fencer_training_templates
            WHERE id = $1 AND fencer_id = $2
        `, [templateId, fencerId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
        }
        console.log("Plantilla de entrenamiento en detalle obtenida:", result.rows[0]);
        res.status(200).json({
            success: true,
            template: result.rows[0]
        });
    } catch (error) {
        console.error("Error al obtener plantilla de entrenamiento:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
});

// Obtener el historial de entrenamientos de una plantilla por ID
router.get('/getCoachTemplateHistory', async (req, res) => {
    try {
        const templateId = req.query.templateId;
        if (!templateId) {
            return res.status(400).json({ success: false, message: 'templateId requerido' });
        }
        const result = await pool.query(
            `SELECT id, title, date, feedback
             FROM public.fencer_coach_sessions
             WHERE template_id = $1 AND feedback IS NOT NULL AND date <> CURRENT_DATE
             ORDER BY date DESC
             LIMIT 4`,
            [templateId]
        );
        res.json({
            success: true,
            workouts: result.rows
        });
    } catch (error) {
        res.json({ success: false, message: 'Error al obtener historial del coach' });
    }
});

// Escribir el feedback del coach en un entrenamiento
router.post('/saveCoachSessionFeedback', isSessionValid, async (req, res) => {
    const { workoutId, feedback } = req.body;
    if (!workoutId || !feedback) {
        return res.json({ success: false, message: 'Faltan datos' });
    }
    try {
        await pool.query(
            'UPDATE public.fencer_coach_sessions SET feedback = $1 WHERE id = $2',
            [feedback, workoutId]
        );
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: 'Error al guardar feedback' });
    }
});

// Eliminar una plantilla de entrenamiento por ID
router.post('/deleteTrainingTemplate/:id', isSessionValid, async (req, res) => {
    const templateId = req.params.id;
    const fencerId = req.session.user.userId;
    try {
        const result = await pool.query(`
            DELETE FROM fencer_training_templates
            WHERE id = $1 AND fencer_id = $2
        `, [templateId, fencerId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Plantilla no encontrada o no pertenece al tirador' });
        }
        console.log("Plantilla de entrenamiento eliminada con ID:", templateId);
        res.status(200).json({
            success: true,
            message: 'Plantilla de entrenamiento eliminada correctamente'
        });
    } catch (error) {
        console.error("Error al eliminar plantilla de entrenamiento:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
});

// Crear una nueva plantilla de entrenamiento
router.post('/createTrainingTemplate', isSessionValid, async (req, res) => {
    const fencerId = req.session.user.userId;
    const { title, description, duration, number_of_sets, number_of_reps } = req.body;

    try {
        const insertQuery = `
            INSERT INTO fencer_training_templates(
                fencer_id, title, description, duration, number_of_sets, number_of_reps)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
        `;

        const result = await pool.query(insertQuery, [fencerId, title, description, duration, number_of_sets, number_of_reps]);
        // Devuelve el id de la plantilla creada
        return res.status(201).json({ success: true, message: 'Plantilla de entrenamiento creada exitosamente', id: result.rows[0].id });
    } catch (error) {
        console.error("Error al crear plantilla de entrenamiento:", error.message);
        return res.status(500).json({ success: false, message: 'Hubo un error en el servidor' });
    }
});

router.post('/savePersonalFeedback', async (req, res) => {
    try {
        const { workoutId, feedback } = req.body;
        if (!workoutId || !feedback) {
            return res.json({ success: false, message: 'Faltan datos' });
        }
        await pool.query(
            'UPDATE public.fencer_personal_sessions SET feedback = $1 WHERE id = $2',
            [feedback, workoutId]
        );
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: 'Error al guardar feedback' });
    }
});

// Obtener el historial de entrenamientos de una plantilla
router.get('/getPersonalTemplateId', async (req, res) => {
    try {
        // Si usas query string: /getPersonalTemplateId?templateId=123
        const templateId = req.query.templateId;
        console.log("ID de la plantilla:", templateId);
        // Si usas body (GET no suele llevar body): const templateId = req.body.template_id;

        if (!templateId) {
            return res.status(400).json({ success: false, message: 'templateId requerido' });
        }

        const result = await pool.query(
            `SELECT id, title, date, feedback
             FROM public.fencer_personal_sessions
             WHERE template_id = $1 AND feedback IS NOT NULL AND date <> CURRENT_DATE 
             ORDER BY date DESC
             LIMIT 4`,
            [templateId]
        );

        console.log("Historial de la plantilla obtenido:", result.rows);
        res.json({
            success: true,
            workouts: result.rows // [{id, title, date, feedback}, ...]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener historial de la plantilla' });
    }
});

// Obtener todos los entrenamientos del tirador creados por el coach
router.get('/getFencerCoachSessions', isSessionValid, async (req, res) => {
    const fencerId = req.session.user.userId;
    try {
        const selectQuery = `
            SELECT
                id AS "id",
                title AS "title",
                date AS "date",
                description AS "description",
                duration AS "duration",
                number_of_sets AS "number_of_sets",
                number_of_reps AS "number_of_reps",
                is_completed AS "is_completed"
            FROM public.fencer_coach_sessions
            WHERE fencer_id = $1
            ORDER BY date DESC
        `;
        const result = await pool.query(selectQuery, [fencerId]);
        console.log("Entrenamientos del coach obtenidos:", result.rows);
        res.status(200).json({
            success: true,
            workouts: result.rows
        });
    } catch (error) {
        console.error("Error al obtener entrenamientos del coach:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
});

// Entrenamiento para hoy del entrenador
router.get('/getCoachWorkoutToday', isSessionValid, async (req, res) => {
    const fencerId = req.session.user.userId;
    try {
        const selectQuery = `
            SELECT
                id AS "id",
                title AS "title",
                date AS "date",
                description AS "description",
                duration AS "duration",
                number_of_sets AS "number_of_sets",
                number_of_reps AS "number_of_reps",
                is_completed AS "is_completed",
                template_id AS "template_id"
            FROM public.fencer_coach_sessions
            WHERE fencer_id = $1 AND date = CURRENT_DATE
        `;
        const result = await pool.query(selectQuery, [fencerId]);
        console.log("Entrenamientos del coach para hoy obtenidos:", result.rows);
        res.status(200).json({
            success: true,
            workout: result.rows
        });
    } catch (error) {
        console.error("Error al obtener entrenamientos del coach para hoy:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
});

// Obtener los entrenamientos de hoy del tirador
router.get('/getPersonalWorkoutToday', isSessionValid, async (req, res) => {
    const fencerId = req.session.user.userId;
    try {
        const selectQuery = `
            SELECT
                id AS "id",
                title AS "title",
                date AS "date",
                description AS "description",
                duration AS "duration",
                number_of_sets AS "number_of_sets",
                number_of_reps AS "number_of_reps",
                is_completed AS "is_completed",
                template_id AS "template_id"
            FROM public.fencer_personal_sessions
            WHERE fencer_id = $1 AND date = CURRENT_DATE
        `;
        const result = await pool.query(selectQuery, [fencerId]);
        console.log("Entrenamientos del tirador para hoy obtenidos:", result.rows);
        res.status(200).json({
            success: true,
            workout: result.rows
        });
    } catch (error) {
        console.error("Error al obtener entrenamientos del tirador para hoy:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
});

// Entrenamiento completado (true)
router.post('/completeWorkout', isSessionValid, async (req, res) => {
    const { workoutId } = req.body;

    try {
        const updateQuery = `
            UPDATE public.fencer_personal_sessions
            SET is_completed = true
            WHERE id = $1
        `;
        await pool.query(updateQuery, [workoutId]);

        return res.status(200).json({ success: true, message: 'Entrenamiento completado' });
    } catch (error) {
        console.error("Error al completar el entrenamiento:", error.message);
        return res.status(500).json({ success: false, message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.' });
    }
});

/* -------------------------------------------- Perfil ----------------------------------------------- */
// Obtener el perfil del tirador
router.get('/getProfile',isSessionValid, async (req, res) => {
    const fencerId = req.session.user.userId;

    try {
        const selectQuery = `
            SELECT 
                username AS "username",
                name AS "name", 
                surname AS "surname", 
                secondSurname AS "secondsurname",
                clubname AS "clubname",
                birthdate AS "birthdate",
                email AS "email" 
            FROM public.fencer
            WHERE id = $1
        `;
        const result = await pool.query(selectQuery, [fencerId]);
        return res.status(200).json(result.rows[0]); // Enviar el primer elemento directamente


    } catch (error) {
        console.error("Error en la consulta de perfil del tirador:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.' 
        });
    }
});

// Actualizar el perfil del tirador
router.post('/updateProfile',isSessionValid, async (req, res) => {
  
    const fencerId = req.session.user.userId;
    const {username, name, surname, secondsurname, birthdate, clubname, email} = req.body;

    // Formatea los textos: primera letra en mayúscula y el resto en minúscula
    const formattedName = capitalizeFirstLetter(name);
    const formattedSurname = capitalizeFirstLetter(surname);
    const formattedSecondSurname = capitalizeFirstLetter(secondsurname);
    const formattedClub = capitalizeFirstLetter(clubname);
    
   
    // Verifica si el username ya está en uso por otro usuario
    const userExists = await pool.query('SELECT id FROM fencer WHERE username = $1', [username]);

    if (userExists.rows.length > 0 && userExists.rows[0].id !== fencerId) {
        return res.status(400).json({ success: false, message: 'El nombre de usuario ya está en uso' });
    }


    try {
        const updateQuery = `
            UPDATE public.fencer
            SET username = $1, name = $2, surname = $3, secondsurname = $4, birthdate = $5, clubname = $6, email = $7
            WHERE id = $8
        `;
        const result = await pool.query(updateQuery, [username, formattedName, formattedSurname, formattedSecondSurname, birthdate, formattedClub, email, fencerId]);

        return res.status(200).json({ success: true, message: 'Perfil actualizado correctamente' });

    } catch (error) {
        console.log("Error al actualizar el perfil del tirador:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.' 
        });
    }

});

// Cambiar la contraseña del tirador
router.post('/updateProfilePassword',isSessionValid, async (req, res) => {

    const fencerId = req.session.user.userId;
    const { oldPassword, newPassword } = req.body;

    try {
        // Verificar la contraseña actual
        const userResult = await pool.query('SELECT * FROM fencer WHERE id = $1', [fencerId]);
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
        await pool.query('UPDATE fencer SET password = $1 WHERE id = $2', [hashedNewPassword, fencerId]);

        return res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });

    } catch (error) {
        console.error("Error al cambiar la contraseña del tirador:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.' 
        });
    }
});


/* --------------------------------------------- Cambiar el entrenador de un tirador ------------------------------------------------------ */
// Mostrar el entrenador del tirador
router.get('/getCoach', isSessionValid, async (req, res) => {

    const fencerId = req.session.user.userId;

    try {
        const selectQuery = `
            SELECT 
                c.name AS "name",
                c.surname AS "surname",
                c.secondSurname AS "secondsurname"
            FROM fencer_coach 
            INNER JOIN fencer AS f ON f.id = fencer_coach.fencer_id
            INNER JOIN coach AS c ON c.id = fencer_coach.coach_id
            WHERE fencer_coach.fencer_id = $1
            
        `;
        const result = await pool.query(selectQuery, [fencerId]);
        return res.status(200).json(result.rows[0]); // Enviar el primer elemento directamente

    } catch (error) {
        console.error("Error en la consulta de perfil del tirador:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.' 
        });
    }
});

// Cambiar el entrenador del tirador
router.post('/updateCoach', isSessionValid, async (req, res) => {

    const fencerId = req.session.user.userId;
    const { coachId } = req.body;
    console.log("ID del tirador:", fencerId);
    console.log("ID del nuevo entrenador:", coachId);
    try {
            // Actualizamos el entrenador directamente
        const updateResult = await pool.query(
            `UPDATE fencer_coach 
             SET coach_id = $1 
             WHERE fencer_id = $2`, 
            [coachId, fencerId]
        );
        return res.status(200).json({ success: true, message: 'Entrenador actualizado correctamente' });

    } catch (error) {
        console.log("Error al cambiar el entrenador del tirador:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.' 
        });
    }
});

/* --------------------------------------------- Diario de clases ------------------------------------------------------ */
// Añadrir un registro al diario de clases
router.post('/addClassDiary', isSessionValid, async (req, res) => {

    const { date, title, description } = req.body;
    console.log("Datos recibidos:", req.body);
    const fencerId = req.session.user.userId; // Suponiendo que el ID del tirador está almacenado en la sesión

    const formatteTitle = capitalizeFirstLetter(title);

    try {
        const insertQuery = `
            INSERT INTO public.class_diary(fencer_id, date, title, description)
                VALUES ($1, $2, $3, $4)
        `;

        const result = await pool.query(insertQuery, [fencerId, date, formatteTitle, description]);

        return res.status(201).json({ success: true, message: 'Registro de diario de clase exitoso' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Hubo un error en el servidor' });
    }
});

// Obtener los títulos del diario de clases
router.get('/getClassDiaryTitles', isSessionValid, async (req, res) => {

    const fencerId = req.session.user.userId;

    try {
        const selectQuery = `
            SELECT 
                id AS "id",
                date AS "date", 
                title AS "title"
            FROM public.class_diary
            WHERE fencer_id = $1
            ORDER BY date DESC
        `;
        const result = await pool.query(selectQuery, [fencerId]);
        
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Error en la consulta de títulos del diario de clases:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.' 
        });
    }
});

// Obtener la descripción de una entrada del diario por ID
router.get('/getClassDiaryById/:id', isSessionValid, async (req, res) => {

    const classId = req.params.id;
    console.log("ID de la entrada del diario:", classId);

    try {
        const query = `
            SELECT 
                title, 
                description, 
                date
            FROM public.class_diary
            WHERE id = $1
        `;
        const result = await pool.query(query, [classId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Entrada no encontrada' });
        }

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error obteniendo el diario:", error.message);
        return res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Eliminar una entrada del diario de clases
router.post('/deleteClassDiary/:id', isSessionValid, async (req, res) => {

    const classId = req.params.id;
    console.log("ID de la entrada del diario:", classId);
    try {
        const query = `
            DELETE FROM public.class_diary
            WHERE id = $1
        `;
        await pool.query(query, [classId]);

        return res.status(200).json({ success: true, message: 'Entrada eliminada correctamente' });
    } catch (error) {
        console.error("Error eliminando el diario:", error.message);
        return res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Obtener el último diario de clase
router.get('/getLastClassDiary', isSessionValid, async (req, res) => {

    const fencerId = req.session.user.userId;
    try {
        const query = `
            SELECT  
                id AS "id",
                title AS "title",
                description AS "description",
                date AS "date"
            FROM public.class_diary
            WHERE fencer_id = $1
            ORDER BY date DESC
            LIMIT 1
        `;
        const result = await pool.query(query, [fencerId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontró ningún diario de clase' });
        }
        return res.status(200).json({ success: true, diary: result.rows[0] });

    } catch (error) {   
        console.error("Error obteniendo el último diario de clase:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.'
        });
    }
});

/* --------------------------------------------- Diario de competiciones ------------------------------------------------------ */
// Añadir un registro al diario de competiciones
router.post('/addCompetitionDiary', isSessionValid, async (req, res) => {
    
    const fencerId = req.session.user.userId; 
    try {
        const {
            title,
            date,
            location,
            feedback,
            final_position,
            wins_pool,
            losses_pool,
            passed_pool,
            directes
        } = req.body;
        console.log("Datos recibidos:", req.body); // Para debug
        
        const formattedTitle = title.toUpperCase().trim();


        try {
            const insertQuery1 = `
                INSERT INTO public.competition_diary(
                    title, competition_date, location, final_position, wins_pool, losses_pool, passed_pool, feedback, created_at, fencer_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9) RETURNING id;

            `;

            const result = await pool.query(insertQuery1, [formattedTitle, date, location, final_position, wins_pool, losses_pool, passed_pool, feedback, fencerId]);
            const diaryId = result.rows[0].id; // Obtener el ID del diario recién creado
            
            // Añadir las directas
            const insertDirectaQuery = `
            INSERT INTO public.competition_diary_de(
                competition_entry_id, stage, description, fencer_id)
                VALUES ($1, $2, $3, $4);
            `;
            for (const directa of directes) {
            await pool.query(insertDirectaQuery, [diaryId, directa.stage, directa.description,fencerId]);
            }   

            console.log("Directas añadidas correctamente");
            return res.status(201).json({ success: true, message: 'Diario de competición guardado correctamente' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Hubo un error en el servidor' });
        }

        res.json({ success: true, message: 'Diario de competición guardado correctamente.' });
    } catch (error) {
        console.error("Error al guardar diario:", error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
});


// Obtener los títulos del diario de competiciones
router.get('/getCompetitionDiaryTitles', isSessionValid, async (req, res) => {
    
    if (!req.session.user || !req.session.user.userId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const fencerId = req.session.user.userId;

    try {
        const selectQuery = `
            SELECT 
                id AS "id",
                competition_date AS "date", 
                title AS "title"
            FROM public.competition_diary
            WHERE fencer_id = $1
            ORDER BY date DESC
        `;
        const result = await pool.query(selectQuery, [fencerId]);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Error en la consulta de títulos del diario de competiciones:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Hubo un error en el servidor. Por favor, inténtalo más tarde.' 
        });
    }
});

// Obtener la descripción de una entrada del diario por ID
router.get('/getCompetitionDiaryById/:id', isSessionValid, async (req, res) => {
    
    const diaryId = req.params.id;

    try {
        const diaryRes = await pool.query(`SELECT * FROM competition_diary WHERE id = $1`, [diaryId]);
        const deRes = await pool.query(`SELECT stage, description FROM competition_diary_de WHERE competition_entry_id = $1 ORDER BY stage DESC`, [diaryId]);

        if (diaryRes.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'No encontrado' });
        }

        const diary = diaryRes.rows[0];
        diary.de_descriptions = deRes.rows;

        console.log("Diario de competiciones:", diary);
        return res.json(diary);

    } catch (err) {
        console.error('Error obteniendo diario:', err.message);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

// Eliminar una entrada del diario de competiciones
router.post('/deleteCompetitionDiary/:id', isSessionValid, async (req, res) => {
    
    const diaryId = req.params.id;

    try {
        // Primero eliminamos las directas asociadas
        await pool.query(`DELETE FROM competition_diary_de WHERE competition_entry_id = $1`, [diaryId]);
        // Luego eliminamos la entrada del diario
        await pool.query(`DELETE FROM competition_diary WHERE id = $1`, [diaryId]);

        return res.status(200).json({ success: true, message: 'Entrada eliminada correctamente' });
    } catch (error) {
        console.error("Error eliminando el diario:", error.message);
        return res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});



module.exports = router;