const { Pool } = require('pg');
/* require('dotenv').config(); const DATABASE_URL = "postgresql://postgres:iyfznvlbzFVHpedwGWEZBojpExjweifk@maglev.proxy.rlwy.net:31774/railway"; 
process.env.DATABASE_URL = DATABASE_URL;    */
/* DATABASE_URL = "postgresql://tiraka_db_user:Mu2slymDJTCawGi7F251NnNTfcUAMnNt@dpg-d15k3i3e5dus739p2th0-a.oregon-postgres.render.com/tiraka_db"; // Reemplaza con tu URL de conexión a la base de datos:
 */const pool = new Pool({
  connectionString: process.env.DATABASE_URL = DATABASE_URL = "postgresql://tiraka_db_user:Mu2slymDJTCawGi7F251NnNTfcUAMnNt@dpg-d15k3i3e5dus739p2th0-a.oregon-postgres.render.com/tiraka_db", // Reemplaza con tu URL de conexión a la base de datos: 
  /* user: 'postgres',
  host: 'localhost',
  database: 'tiraka',
  password: '3773',
  port: 5432,  */
  
  rejectUnauthorized: false
  
});


pool.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos', err.stack);
  } else {
    console.log('Conectado a la base de datos');
  }
});

module.exports = pool;  // Esto debe estar aquí para exportar correctamente
