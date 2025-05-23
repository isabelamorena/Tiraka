const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// Middlewares
app.use(express.static('front'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());  // Necesario para manejar cookies

// Configurar express-session
app.use(session({
  secret: 'mi_clave_secreta',  // Cambia esto por una clave secreta única
  resave: false,  // No resave la sesión si no se ha modificado
  saveUninitialized: true,  // Guarda sesiones aunque no estén inicializadas
  cookie: {
      maxAge: 1000 * 60 * 60,  // Duración de la sesión: 1 hora
      httpOnly: true  // Esto ayuda a proteger las cookies de accesos no deseados
  }
}));

// Rutas
const loginRoute = require('./back/routes/login');
app.use(loginRoute); 

const getCoachesRoute = require('./back/routes/getCoaches'); 
app.use(getCoachesRoute); 

const registerRoute = require('./back/routes/register'); 
app.use(registerRoute);
 
const fencercontrolPanelRoute = require('./back/routes/fencer-controlPanel');
app.use(fencercontrolPanelRoute);

// Inicia el servidor
app.listen(3000, function() {
  console.log('Server is running on port 3000');
});
