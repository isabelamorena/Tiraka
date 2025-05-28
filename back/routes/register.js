const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../../db');
const { capitalizeFirstLetter } = require('../functions/functions');

// Ruta para registrar un entrenador
router.post('/registerCoach', async (req, res) => {
    const {
        username,
        password,
        name,
        surname,
        secondSurname,
        clubname,
        email
    } = req.body;

    if (!username || !password || !name || !surname || !secondSurname || !clubname) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    try {
        // Verifica si el usuario ya existe
        const userExists = await pool.query('SELECT * FROM coach WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).send('El nombre de usuario ya está en uso');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Formatea los textos: primera letra en mayúscula y el resto en minúscula
        const formattedName = capitalizeFirstLetter(name);
        const formattedSurname = capitalizeFirstLetter(surname);
        const formattedSecondSurname = capitalizeFirstLetter(secondSurname);
        const formattedClub = capitalizeFirstLetter(clubname);

        const insertQuery = `
            INSERT INTO coach (username, password, name, surname, secondSurname, clubname, email)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, username, name, surname
        `;

        const result = await pool.query(insertQuery, [
            username,
            hashedPassword,
            formattedName,
            formattedSurname,
            formattedSecondSurname,
            formattedClub,
            email
        ]);

        return res.status(201).json({ success: true, message: 'Registro exitoso' });

    } catch (error) {
        return res.status(401).json({ success: false, message: 'Hubo un error en el servidor' });
    }
});

// Ruta para registrar un tirador
router.post('/registerFencer', async (req, res) => {
    const {
        username,
        password,
        name,
        surname,
        secondSurname,
        birthdate,
        clubname,
        email,
        coachName
    } = req.body;

    if (!username || !password || !name || !surname || !secondSurname || !birthdate || !clubname ) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }


    try {
        // Verifica si el usuario ya existe
        const userExists = await pool.query('SELECT * FROM fencer WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).send('El nombre de usuario ya está en uso');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Formatea los textos: primera letra en mayúscula y el resto en minúscula
        const formattedName = capitalizeFirstLetter(name);
        const formattedSurname = capitalizeFirstLetter(surname);
        const formattedSecondSurname = capitalizeFirstLetter(secondSurname);
        const formattedClub = capitalizeFirstLetter(clubname);

        const insertQuery = `
            INSERT INTO fencer (username, password, name, surname, secondSurname, birthdate, clubname, email)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, username, name, surname
        `;

        const result = await pool.query(insertQuery, [
            username,
            hashedPassword,
            formattedName,
            formattedSurname,
            formattedSecondSurname,
            birthdate,
            formattedClub,
            email,
        ]);

        const fencerId = result.rows[0].id;

        // Si ha elegido entrenador, guardar la relación
        if (coachName) {
            await pool.query(
                'INSERT INTO fencer_coach (fencer_id, coach_id) VALUES ($1, $2)',
                [fencerId, coachName]
            );
            console.log(`Relación tirador(${fencerId})-entrenador(${coachName}) GUARDADA`);
        } else{
            console.log('No se ha elegido entrenador para el tirador');
        }

        console.log('Nuevo tirador registrado:', result.rows[0]);

        return res.status(401).json({ success: true, message: 'Registro exitoso' });
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Hubo un error en el servidor' });
    }
});

module.exports = router;
