import express from "express";
import apicache from "apicache";
import passport from "passport";
import { TurnosControlador } from "../../controladores/turnosControlador.js";
import {
  validarId,
  validarCrearTurno,
  validarActualizarTurno,
} from "../../middleware/validacionTurnos.js";
import autorizarUsuarios from "../../middleware/permisosUsuarios.js";
import { PERMISOS } from "../../config/roles.js";

const router = express.Router();
const turnosControlador = new TurnosControlador();
const cache = apicache.middleware;

// BREAD router para turnos
router.get("/turnos", cache("5 minutes"), turnosControlador.buscarTodos); // PÚBLICO

router.get(
  "/turnos/:id",
  validarId,
  cache("2 minutes"),
  turnosControlador.buscarPorId
); // PÚBLICO

router.post(
  "/turnos",
  passport.authenticate("jwt", { session: false }),
  autorizarUsuarios(PERMISOS.CREAR_TURNOS),
  validarCrearTurno,
  turnosControlador.crear
);

router.put(
  "/turnos/:id",
  passport.authenticate("jwt", { session: false }),
  autorizarUsuarios(PERMISOS.ACTUALIZAR_TURNOS),
  validarId,
  validarActualizarTurno,
  turnosControlador.actualizar
);

router.delete(
  "/turnos/:id",
  passport.authenticate("jwt", { session: false }),
  autorizarUsuarios(PERMISOS.ELIMINAR_TURNOS),
  validarId,
  turnosControlador.eliminar
);

export { router };