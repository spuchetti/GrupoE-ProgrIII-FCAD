import apicache from 'apicache';
import { TurnosServicio } from "../servicios/turnosServicio.js";

export class TurnosControlador {
  constructor() {
    this.servicio = new TurnosServicio();
  }

  crear = async (req, res, next) => {
    try {
      const datos = req.body;
      const nuevoTurno = await this.servicio.crear(datos);
      apicache.clear("/api/v1/turnos");

      return res.status(201).json({
        estado: true,
        mensaje: "Turno creado correctamente",
        datos: nuevoTurno,
      });
    } catch (err) {
      next(err);
    }
  };

  actualizar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const datos = req.body;
      const turnoActualizado = await this.servicio.actualizar(id, datos);

      apicache.clear(`/api/v1/turnos/${id}`);
      apicache.clear("/api/v1/turnos");

      return res.json({
        estado: true,
        mensaje: "Turno actualizado correctamente",
        datos: turnoActualizado,
      });
    } catch (err) {
      next(err);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.servicio.eliminar(id);

      apicache.clear(`/api/v1/turnos/${id}`);
      apicache.clear("/api/v1/turnos");

      return res.json({
        estado: true,
        mensaje: "Turno eliminado correctamente",
      });
    } catch (err) {
      next(err);
    }
  };

  buscarTodos = async (req, res, next) => {
    try {
      const turnos = await this.servicio.buscarTodos();
      
      return res.json({
        estado: true,
        datos: turnos,
      });
    } catch (err) {
      next(err);
    }
  };

  buscarPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      const turno = await this.servicio.buscarPorId(id);

      return res.json({
        estado: true,
        datos: turno,
      });
    } catch (err) {
      next(err);
    }
  };
}