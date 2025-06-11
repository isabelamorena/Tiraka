const { Pool } = require('pg');
  require('dotenv').config(); const DATABASE_URL = "postgresql://postgres:iyfznvlbzFVHpedwGWEZBojpExjweifk@maglev.proxy.rlwy.net:31774/railway"; 
process.env.DATABASE_URL = DATABASE_URL;    
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
