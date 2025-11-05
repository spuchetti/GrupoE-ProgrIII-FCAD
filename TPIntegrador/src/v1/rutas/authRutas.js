import express from 'express';
import { AuthControlador } from '../../controladores/authControlador.js';
import { validarLogin } from '../../middleware/validacionUsuarios.js';

const router = express.Router();
const authControlador = new AuthControlador();

// Router para auth

router.post('/auth/login', validarLogin, authControlador.login);
// Restablecimiento de contraseña
router.post('/auth/solicitar-restablecer', authControlador.solicitarRestablecer);
router.get('/auth/restablecer', authControlador.mostrarFormularioRestablecer);
router.post('/auth/restablecer-contrasenia', authControlador.restablecerContrasenia);
export { router };

