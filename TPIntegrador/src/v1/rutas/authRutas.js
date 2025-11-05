import express from 'express';
import { AuthControlador } from '../../controladores/authControlador.js';
import { validarLogin } from '../../middleware/validacionUsuarios.js';

const router = express.Router();
const authControlador = new AuthControlador();

// Router para auth

router.post('/login', validarLogin, authControlador.login);
export { router };