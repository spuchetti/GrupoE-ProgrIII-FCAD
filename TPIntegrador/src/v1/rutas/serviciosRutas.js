import express from "express";
import apicache from "apicache";
import passport from "passport";
import { ServiciosControlador } from "../../controladores/serviciosControlador.js";
import {
  validarId,
  validarCrearServicio,
  validarActualizarServicio,
} from "../../middleware/validacionServicios.js";
import autorizarUsuarios from "../../middleware/permisosUsuarios.js";
import { PERMISOS } from "../../config/roles.js";

const router = express.Router();
const serviciosControlador = new ServiciosControlador();
const cache = apicache.middleware;

// BREAD router para servicios
router.get("/servicios", cache("5 minutes"), serviciosControlador.buscarTodos); // PÚBLICO

router.get(
  "/servicios/:id",
  validarId,
  cache("2 minutes"),
  serviciosControlador.buscarPorId
); // PÚBLICO

router.post(
  "/servicios",
  passport.authenticate("jwt", { session: false }),
  autorizarUsuarios(PERMISOS.CREAR_SERVICIOS),
  validarCrearServicio,
  serviciosControlador.crear
);

router.put(
  "/servicios/:id",
  passport.authenticate("jwt", { session: false }),
  autorizarUsuarios(PERMISOS.ACTUALIZAR_SERVICIOS),
  validarActualizarServicio,
  serviciosControlador.actualizar
);

router.delete(
  "/servicios/:id",
  passport.authenticate("jwt", { session: false }),
  autorizarUsuarios(PERMISOS.ELIMINAR_SERVICIOS),
  validarId,
  serviciosControlador.eliminar
);

export { router };
