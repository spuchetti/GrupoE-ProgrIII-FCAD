import Usuarios from "../db/usuarios.js";
import { ErrorNoEncontrado, ErrorApp } from "../errores/ErrorApp.js";

export class UsuariosServicio {
  constructor() {
    this.usuariosDB = new Usuarios();
  }

  buscar = async(nombre_usuario, contrasenia) => {
    return this.usuariosDB.buscar(nombre_usuario, contrasenia);
  };

  buscarTodos = async () => {
    return this.usuariosDB.buscarTodos();
  };

  buscarPorId = async (id) => {
   
    const usuario = await this.usuariosDB.buscarPorId(id);

    if (!usuario) {
      throw new ErrorNoEncontrado("Usuario");
    }
    return usuario;
  };

  crear = async (datos) => {
    const nuevoUsuario = await this.usuariosDB.crear(datos);

    if (!nuevoUsuario) {
      throw new ErrorApp('No pudo crearse el usuario');
    }
    return nuevoUsuario;
  };

  actualizar = async (id, datos) => {
    const actualizado = await this.usuariosDB.actualizar(id, datos);

    if (!actualizado) {
      throw new ErrorNoEncontrado("Usuario");
    }

    return actualizado;
  };

  eliminar = async (id) => {
    const eliminado = await this.usuariosDB.eliminar(id);

    if (!eliminado) {
      throw new ErrorNoEncontrado("Usuario");
    }
    return true;
  };
}
