import express from 'express';
import dotenv from 'dotenv';
<<<<<<< HEAD
import swaggerUI from 'swagger-ui-express';
import specs  from './docs/swagger.js';
import { router as v1SalonesRutas } from './v1/rutas/salonesRutas.js';
import { manejadorErrores, rutaNoEncontrada } from './middleware/manejadorErrores.js';

=======
import passport from 'passport';
import fs from 'fs';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import specs  from './docs/swagger.js';
import { router as v1AuthRutas } from './v1/rutas/authRutas.js';
import { router as v1SalonesRutas } from './v1/rutas/salonesRutas.js';
import { router as v1ServiciosRutas } from './v1/rutas/serviciosRutas.js';
import { router as v1TurnosRutas } from './v1/rutas/turnosRutas.js';
import { router as v1UsuariosRutas } from './v1/rutas/usuariosRutas.js';
import { router as v1ReservasRutas } from './v1/rutas/reservasRutas.js';
import { manejadorErrores, rutaNoEncontrada } from './middleware/manejadorErrores.js';
import { estrategiaLocal, estrategiaJWT } from './config/passport.js';
>>>>>>> origin/Seba


dotenv.config(); // Cargamos las variables de entorno


const app = express();
app.use(express.json());
<<<<<<< HEAD
app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs));
// Le definimos la ruta /docs
// swaggerUI.serve -> Retorna un handler para manejar los archivos documentados
// swaggerUI.setup -> Le pasamos un archivo, o un objeto de configuración para el handler

app.use('/api/v1/salones', v1SalonesRutas);
=======

passport.use('local', estrategiaLocal);
passport.use('jwt', estrategiaJWT);
app.use(passport.initialize());

const logs = fs.createWriteStream('./access.log', { flags: 'a' });
app.use(morgan('combined')) // En consola
app.use(morgan('common', { stream: logs })); // En el archivo

app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs));

app.get('/api/estado', (req, res) => {
  res.status(200).json({
    estado: true,
    mensaje: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    entorno: 'development'
  });
});

app.use('/api/v1', v1AuthRutas);
app.use('/api/v1', v1SalonesRutas);
app.use('/api/v1', v1ServiciosRutas);
app.use('/api/v1', v1TurnosRutas);
app.use('/api/v1', passport.authenticate('jwt', { session: false }), v1ReservasRutas);
app.use('/api/v1', passport.authenticate('jwt', { session: false }), v1UsuariosRutas);

>>>>>>> origin/Seba

app.use(rutaNoEncontrada); // Middleware para rutas no encontradas


app.use(manejadorErrores); // Middleware centralizado para manejo de errores

app.listen(process.env.PUERTO, () => { 
    console.log(`Servidor arriba en http://localhost:${process.env.PUERTO}/`);
<<<<<<< HEAD
})
=======
})
>>>>>>> origin/Seba
