import apicache from 'apicache';
import { ServiciosServicio } from "../servicios/serviciosServicio.js";

export class ServiciosControlador {
  constructor() {
    this.servicio = new ServiciosServicio();
  }

  crear = async (req, res, next) => {
    try {
      const datos = req.body;
      const nuevoServicio = await this.servicio.crear(datos);
      apicache.clear("/api/v1/servicios");

      return res.status(201).json({
        estado: true,
        mensaje: "Servicio creado correctamente",
        datos: nuevoServicio,
      });
    } catch (err) {
      next(err);
    }
  };

  actualizar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const datos = req.body;
      const servicioActualizado = await this.servicio.actualizar(id, datos);

      apicache.clear(`/api/v1/servicios/${id}`);
      apicache.clear("/api/v1/servicios");

      return res.json({
        estado: true,
        mensaje: "Servicio actualizado correctamente",
        datos: servicioActualizado,
      });
    } catch (err) {
      next(err);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.servicio.eliminar(id);

      apicache.clear(`/api/v1/servicios/${id}`);
      apicache.clear("/api/v1/servicios");

      return res.json({
        estado: true,
        mensaje: "Servicio eliminado correctamente",
      });
    } catch (err) {
      next(err);
    }
  };

  buscarTodos = async (req, res, next) => {
    try {
      const servicios = await this.servicio.buscarTodos();

      return res.json({
        estado: true,
        datos: servicios,
      });
    } catch (err) {
      next(err);
    }
  };

  buscarPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      const servicio = await this.servicio.buscarPorId(id);
      
      return res.json({
        estado: true,
        datos: servicio,
      });
    } catch (err) {
      next(err);
    }
  };
}