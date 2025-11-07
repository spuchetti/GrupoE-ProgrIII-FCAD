import Usuarios from "../db/usuarios.js";
import { ErrorNoEncontrado, ErrorApp } from "../errores/ErrorApp.js";
import { TokenServicio } from "./tokenServicio.js";

export class UsuariosServicio {
  constructor() {
    this.usuariosDB = new Usuarios();
    this.tokenServicio = new TokenServicio();
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

  // Genera un token JWT para restablecimiento que incluye el timestamp de modificacion
  generarTokenRestablecimiento = (usuario) => {
    return this.tokenServicio.generarTokenReset(usuario);
  };

  // Solicita restablecimiento: si existe usuario, devuelve token (no hace cambios en DB)
  solicitarRestablecimiento = async (nombre_usuario) => {
    const usuario = await this.usuariosDB.buscarPorNombreUsuario(nombre_usuario);
    if (!usuario) {
      return null;
    }

    const token = this.generarTokenRestablecimiento(usuario);
    return { usuario, token };
  };

  // Resetear contraseña usando token JWT. Verifica que el campo 'modificado' coincida
  resetearContrasenia = async (token, nuevaContrasenia) => {
    const tokenVerificado = this.tokenServicio.verificarToken(token);

    const usuario = await this.usuariosDB.buscarPorId(tokenVerificado.usuario_id);
    if (!usuario) {
      throw new ErrorNoEncontrado("Usuario");
    }

    const modificadoDb = usuario.modificado ? new Date(usuario.modificado).toISOString() : null;
    if (tokenVerificado.modificado !== modificadoDb) {
      // Si la marca de modificado cambió, el token ya no es válido (evita reuso)
      throw new ErrorApp("Token inválido o ya usado");
    }

    const actualizado = await this.usuariosDB.actualizarContrasenia(usuario.usuario_id, nuevaContrasenia);
    if (!actualizado) {
      throw new ErrorApp("No se pudo actualizar la contraseña");
    }

    return actualizado;
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
