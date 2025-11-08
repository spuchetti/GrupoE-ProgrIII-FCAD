// salonesControlador.js
import apicache from 'apicache';
import { SalonesServicio } from "../servicios/salonesServicio.js";

export class SalonesControlador {
  constructor() {
    this.servicio = new SalonesServicio();
  }
  crear = async (req, res, next) => {
    try {
      const datos = req.body;
      const nuevoSalon = await this.servicio.crear(datos);
      apicache.clear('/api/v1/salones');

      return res.status(201).json({
        estado: true,
        mensaje: 'Salón creado correctamente',
        datos: nuevoSalon,
      });
    } catch (err) {
      next(err);
    }
  };
  actualizar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const datos = req.body;
      const actualizado = await this.servicio.actualizar(id, datos);
      apicache.clear(`/api/v1/salones/${id}`);
      apicache.clear('/api/v1/salones');

      return res.json({
        estado: true,
        mensaje: "Salón actualizado correctamente",
        datos: actualizado,
      });
    } catch (err) {
      next(err);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.servicio.eliminar(id);
      apicache.clear(`/api/v1/salones/${id}`);
      apicache.clear('/api/v1/salones');

      return res.json({
        estado: true,
        mensaje: "Salón eliminado correctamente",
      });
    } catch (err) {
      next(err);
    }
  };

  buscarTodos = async (req, res, next) => {
    try {
      const salones = await this.servicio.buscarTodos();
      return res.json({
        estado: true,
        datos: salones,
      });
    } catch (err) {
      next(err);
    }
  };

  buscarPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      const salon = await this.servicio.buscarPorId(id);

      return res.json({
        estado: true,
        datos: salon,
      });
    } catch (err) {
      next(err);
    }
  };
};
