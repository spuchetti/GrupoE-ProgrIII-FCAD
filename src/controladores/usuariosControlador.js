import apicache from 'apicache';
import { UsuariosServicio } from "../servicios/usuariosServicio.js";

export class UsuariosControlador {
  constructor() {
    this.servicio = new UsuariosServicio();
  }

  crear = async (req, res, next) => {
    try {
      const datos = req.body;
      const nuevoUsuario = await this.servicio.crear(datos);
      apicache.clear('/api/v1/usuarios');

      return res.status(201).json({
        estado: true,
        mensaje: "Usuario creado correctamente",
        datos: nuevoUsuario,
      });
    } catch (err) {
      next(err);
    }
  };

  actualizar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const datos = req.body;
      const usuarioActualizado = await this.servicio.actualizar(id, datos);

      apicache.clear(`/api/v1/usuarios/${id}`);
      apicache.clear('/api/v1/usuarios');

      return res.json({
        estado: true,
        mensaje: "Usuario actualizado correctamente",
        datos: usuarioActualizado,
      });
    } catch (err) {
      next(err);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.servicio.eliminar(id);

      apicache.clear(`/api/v1/usuarios/${id}`);
      apicache.clear('/api/v1/usuarios');

      return res.json({
        estado: true,
        mensaje: "Usuario eliminado correctamente",
      });
    } catch (err) {
      next(err);
    }
  };

  buscarTodos = async (req, res, next) => {
    try {
      const usuarios = await this.servicio.buscarTodos();

      return res.json({
        estado: true,
        datos: usuarios,
      });
    } catch (err) {
      next(err);
    }
  };

  buscarPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuario = await this.servicio.buscarPorId(id);
      
      return res.json({
        estado: true,
        datos: usuario,
      });
    } catch (err) {
      next(err);
    }
  };
}
