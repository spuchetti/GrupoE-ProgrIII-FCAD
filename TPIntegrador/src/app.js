import express from 'express';
import dotenv from 'dotenv';
import swaggerUI from 'swagger-ui-express';
import specs  from './docs/swagger.js';
import { router as v1SalonesRutas } from './v1/rutas/salonesRutas.js';
import { manejadorErrores, rutaNoEncontrada } from './middleware/manejadorErrores.js';



dotenv.config(); // Cargamos las variables de entorno


const app = express();
app.use(express.json());
app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs));
// Le definimos la ruta /docs
// swaggerUI.serve -> Retorna un handler para manejar los archivos documentados
// swaggerUI.setup -> Le pasamos un archivo, o un objeto de configuración para el handler

app.use('/api/v1/salones', v1SalonesRutas);

app.use(rutaNoEncontrada); // Middleware para rutas no encontradas


app.use(manejadorErrores); // Middleware centralizado para manejo de errores

app.listen(process.env.PUERTO, () => { 
    console.log(`Servidor arriba en http://localhost:${process.env.PUERTO}/`);
})