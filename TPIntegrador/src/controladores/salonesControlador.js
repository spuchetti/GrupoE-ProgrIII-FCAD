<<<<<<< HEAD
=======
// salonesControlador.js
>>>>>>> origin/Seba
import apicache from 'apicache';
import { SalonesServicio } from "../servicios/salonesServicio.js";

export class SalonesControlador {
  constructor() {
    this.servicio = new SalonesServicio();
  }
<<<<<<< HEAD
=======

>>>>>>> origin/Seba
  crear = async (req, res, next) => {
    try {
      const datos = req.body;
      const nuevoSalon = await this.servicio.crear(datos);
<<<<<<< HEAD
      apicache.clear('/api/v1/salones'); // Limpiamos la caché de la lista completa de salones
      
      return res.status(201).json({
        estado: true,
=======
      apicache.clear('/api/v1/salones');

      return res.status(201).json({
        estado: true,
        mensaje: 'Salón creado correctamente',
>>>>>>> origin/Seba
        datos: nuevoSalon,
      });
    } catch (err) {
      next(err);
    }
  };
<<<<<<< HEAD
=======

>>>>>>> origin/Seba
  actualizar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const datos = req.body;
      const actualizado = await this.servicio.actualizar(id, datos);
<<<<<<< HEAD
      apicache.clear(`/api/v1/salones/${id}`); // Limpiamos la caché del detalle del salón
      apicache.clear('/api/v1/salones');
      
      if (actualizado) {
        return res.json({
          estado: true,
          mensaje: "Salón actualizado correctamente",
        });
      } else {
        return res
          .status(404)
          .json({ estado: false, mensaje: "Salón no encontrado" });
      }
    } catch (err) {
      next(err);
    }
  };
  eliminar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const eliminado = await this.servicio.eliminar(id);
      apicache.clear(`/api/v1/salones/${id}`);
      apicache.clear('/api/v1/salones');

      if (eliminado) {
        return res.json({
          estado: true,
          mensaje: "Salón eliminado correctamente",
        });
      } else {
        return res
          .status(404)
          .json({ estado: false, mensaje: "Salón no encontrado" });
      }
=======
      apicache.clear(`/api/v1/salones/${id}`);
      apicache.clear('/api/v1/salones');

      return res.json({
        estado: true,
        mensaje: "Salón actualizado correctamente",
        datos: actualizado,
      });
>>>>>>> origin/Seba
    } catch (err) {
      next(err);
    }
  };
<<<<<<< HEAD
  obtenerTodos = async (req, res, next) => {
    try {
      const salones = await this.servicio.obtenerTodos();

=======

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
>>>>>>> origin/Seba
      return res.json({
        estado: true,
        datos: salones,
      });
    } catch (err) {
      next(err);
    }
  };
<<<<<<< HEAD
  obtenerPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      const salon = await this.servicio.obtenerPorId(id);
=======

  buscarPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      const salon = await this.servicio.buscarPorId(id);

>>>>>>> origin/Seba
      return res.json({
        estado: true,
        datos: salon,
      });
    } catch (err) {
      next(err);
    }
  };
<<<<<<< HEAD
}
=======
};
>>>>>>> origin/Seba
