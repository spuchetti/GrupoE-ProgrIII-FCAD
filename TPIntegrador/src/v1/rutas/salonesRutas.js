import express from "express";
import apicache from "apicache";
import passport from "passport";
import { SalonesControlador } from "../../controladores/salonesControlador.js";
import {
  validarId,
  validarCrearSalon,
  validarActualizarSalon,
} from "../../middleware/validacionSalones.js";
import autorizarUsuarios from "../../middleware/permisosUsuarios.js";
import { PERMISOS } from "../../config/roles.js";

const router = express.Router();
const salonesControlador = new SalonesControlador();
const cache = apicache.middleware;

// BREAD router para salones
router.get("/salones", cache("5 minutes"), salonesControlador.buscarTodos); // PÚBLICO

router.get(
  "/salones/:id",
  validarId,
  cache("2 minutes"),
  salonesControlador.buscarPorId
); // PÚBLICO

router.post(
  "/salones",
  passport.authenticate("jwt", { session: false }),
  autorizarUsuarios(PERMISOS.CREAR_SALONES),
  validarCrearSalon,
  salonesControlador.crear
);

router.put(
  "/salones/:id",
  passport.authenticate("jwt", { session: false }),
  autorizarUsuarios(PERMISOS.ACTUALIZAR_SALONES),
  validarActualizarSalon,
  salonesControlador.actualizar
);

router.delete(
  "/salones/:id",
  passport.authenticate("jwt", { session: false }),
  autorizarUsuarios(PERMISOS.ELIMINAR_SALONES),
  validarId,
  salonesControlador.eliminar
);

export { router };