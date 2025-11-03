import express from "express";
import apicache from "apicache";
import { UsuariosControlador } from "../../controladores/usuariosControlador.js";
import {
  validarId,
  validarCrearUsuario,
  validarActualizarUsuario,
} from "../../middleware/validacionUsuarios.js";
import autorizarUsuarios from "../../middleware/permisosUsuarios.js";
import { PERMISOS } from "../../config/roles.js";

const router = express.Router();
const usuariosControlador = new UsuariosControlador();
const cache = apicache.middleware;

// BREAD router para usuarios
router.get(
  "/usuarios",
  cache("5 minutes"),
  autorizarUsuarios(PERMISOS.LISTAR_USUARIOS),
  usuariosControlador.buscarTodos
);

router.get(
  "/usuarios/:id",
  cache("2 minutes"),
  autorizarUsuarios(PERMISOS.LISTAR_USUARIOS),
  validarId,
  usuariosControlador.buscarPorId
);

router.post(
  "/usuarios",
  autorizarUsuarios(PERMISOS.CREAR_USUARIOS),
  validarCrearUsuario,
  usuariosControlador.crear
);

router.put(
  "/usuarios/:id",
  autorizarUsuarios(PERMISOS.ACTUALIZAR_USUARIOS),
  validarId,
  validarActualizarUsuario,
  usuariosControlador.actualizar
);

router.delete(
  "/usuarios/:id",
  autorizarUsuarios(PERMISOS.ELIMINAR_USUARIOS),
  validarId,
  usuariosControlador.eliminar
);

export { router };