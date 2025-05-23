const express = require('express');
const router = express.Router();
const pool = require('../../db');

// Ruta para obtener los entrenadores
router.get('/getCoaches', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, surname FROM coach');
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No hay entrenadores disponibles' });
    }

    const coaches = result.rows.map(coach => ({
      id: coach.id,
      fullName: `${coach.name} ${coach.surname}`
    }));

    console.log('Entrenadores obtenidos:', coaches);
    res.json(coaches);
  } catch (err) {
    console.error('Error al obtener los entrenadores:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Exporta la ruta
module.exports = router;
