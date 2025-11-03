import express from "express";
import apicache from "apicache";
import { ReservasControlador } from "../../controladores/reservasControlador.js";
import {
  validarId,
  validarCrearReserva,
  validarActualizarReserva,
} from "../../middleware/validacionReservas.js";
import { validarGenerarInforme } from "../../middleware/validacionInformes.js";
import autorizarUsuarios from "../../middleware/permisosUsuarios.js";
import { PERMISOS } from "../../config/roles.js";

const router = express.Router();
const reservasControlador = new ReservasControlador();
const cache = apicache.middleware;




// BREAD router para reservas

// Generar reportes
router.get(
  "/reservas/reportes/:formato",
  autorizarUsuarios(PERMISOS.GENERAR_REPORTE),
  validarGenerarInforme,
  reservasControlador.generarReporte
);

router.get(
  "/reservas/usuarios/:usuario_id",
  cache("2 minutes"),
  autorizarUsuarios(PERMISOS.LISTAR_RESERVAS),
  reservasControlador.buscarPorUsuario
);


router.get(
  "/reservas",
  cache("5 minutes"),
  autorizarUsuarios(PERMISOS.LISTAR_RESERVAS),
  reservasControlador.buscarTodas
);

router.get(
  "/reservas/:id",
  cache("2 minutes"),
  autorizarUsuarios(PERMISOS.LISTAR_RESERVAS),
  validarId,
  reservasControlador.buscarPorId
);


router.post(
  "/reservas",
  autorizarUsuarios(PERMISOS.CREAR_RESERVAS),
  validarCrearReserva,
  reservasControlador.crear
);

router.put(
  "/reservas/:id",
  autorizarUsuarios(PERMISOS.ACTUALIZAR_RESERVAS),
  validarId,
  validarActualizarReserva,
  reservasControlador.actualizar
);

router.delete(
  "/reservas/:id",
  autorizarUsuarios(PERMISOS.ELIMINAR_RESERVAS),
  validarId,
  reservasControlador.eliminar
);



export { router };