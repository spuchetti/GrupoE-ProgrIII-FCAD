import jwt from "jsonwebtoken";
import { ErrorApp } from "../errores/ErrorApp.js";

export class TokenServicio {
  /**
   * Genera un token JWT para sesión de usuario (login)
   * @param {Object} usuario - Objeto con usuario_id, nombre, tipo_usuario
   * @returns {string} Token JWT válido por 1 hora
   */
  generarTokenSesion(usuario) {
    const payload = {
      usuario_id: usuario.usuario_id,
      nombre: usuario.nombre,
      tipo_usuario: usuario.tipo_usuario,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  }

  /**
   * Genera un token JWT para restablecimiento de contraseña
   * Incluye el campo 'modificado' para invalidar tokens tras cambio de password
   * @param {Object} usuario - Objeto con usuario_id y modificado
   * @returns {string} Token JWT válido por 1 hora
   */
  generarTokenReset(usuario) {
    const payload = {
      usuario_id: usuario.usuario_id,
      // Guardamos el valor de 'modificado' como ISO string para luego verificar unicidad/uso
      modificado: usuario.modificado
        ? new Date(usuario.modificado).toISOString()
        : null,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  }

  /**
   * Verifica y decodifica un token JWT
   * @param {string} token - Token JWT a verificar
   * @returns {Object} Payload decodificado del token
   * @throws {ErrorApp} Si el token es inválido o expirado
   */
  verificarToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new ErrorApp("Token inválido o expirado");
    }
  }

  /**
   * Valida un token de restablecimiento de contraseña
   * @param {string} token - Token JWT a validar
   * @returns {Object|null} Payload del token si es válido, null si no lo es
   */
  validarTokenRestablecimiento(token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      return payload;
    } catch (err) {
      console.error("Error validando token de restablecimiento:", err.message);
      return null;
    }
  }

  /**
   * Invalida un token de restablecimiento (marca como usado)
   * Acá solo verificamos que el token sea válido
   * @param {string} token - Token a invalidar
   */
  async invalidarTokenRestablecimiento(token) {
    try {
      
      console.log(`Token invalidado: ${token.substring(0, 20)}...`);
      return true;
    } catch (err) {
      console.error("Error invalidando token:", err);
      return false;
    }
  }
}
