const express = require('express');
const router = express.Router();
const pool = require('../../db');
const bcrypt = require('bcryptjs');


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login Tirador - Datos recibidos:', req.body);

    try {
        const result = await pool.query('SELECT * FROM fencer WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];
        console.log('Tirador encontrado:', user);

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.user = {
                username: user.username,
                role: 'tirador',
                userId: user.id,
                relationCoach: user.relation_coach // Relación con el entrenador
            };
            res.status(201).json({ success: true, message: 'Login correcto' });
        } else {
            res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

    } catch (err) {
        console.error('Error en consulta (tirador):', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});


// 🧑‍🏫 Login de Entrenador
router.post('/loginTrainer', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login Entrenador - Datos recibidos:', req.body);

    try {
        // Consultar la base de datos para encontrar el usuario
        const result = await pool.query('SELECT * FROM coach WHERE username = $1', [username]);

        // Si no se encuentra el usuario, retornamos un error
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];
        console.log('Entrenador encontrado:', user);

        // Comparamos la contraseña ingresada con el hash almacenado
        const isMatch = await bcrypt.compare(password, user.password);

        // Si las contraseñas coinciden
        if (isMatch) {
            req.session.user = {
                username: user.username,
                role: 'entrenador', // Rol para el entrenador
                userId: user.id // ID del entrenador
            };
            return res.status(201).json({ success: true, message: 'Login correcto' });
        } else {
            return res.status(401).json({ success: false, message: 'Error en el servidor' });
        }

    } catch (err) {
        console.error('Error en consulta (entrenador):', err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para verificar si el usuario está logueado
router.get('/check-session', (req, res) => {
    if (req.session.user) {
        console.log('Usuario logueado: '+ req.session.user.username + " / " + req.session.user.userId);
        return res.status(201).json({ success: true, message: 'Usuario logueado' });
    } else {
        console.log('No hay sesión activa');
        res.status(401).send('No estás logueado');
    }
});

// Ruta para logout (cerrar sesión)
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error al cerrar sesión');
        }
        console.log('Sesión cerrada correctamente');
        res.clearCookie('connect.sid');  // Limpiar la cookie de sesión
        return res.status(201).json({ success: true, message: 'Session cerrada' });
    });
});

module.exports = router;
