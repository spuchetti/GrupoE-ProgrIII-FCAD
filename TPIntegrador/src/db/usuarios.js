import { conexion } from "../config/conexion.js";

export default class Usuarios {
  buscar = async (usuario, contrasenia) => {
    const sql = `SELECT usuario_id, nombre, tipo_usuario
                    FROM usuarios u
                    WHERE u.nombre_usuario = ? AND u.contrasenia = SHA2(?, 256) AND activo = 1 LIMIT 1`;

    const [results] = await conexion.execute(sql, [usuario, contrasenia]);
    return results[0] || null;
  };

  // (para JWT) 
  buscarPorId = async (usuario_id) => {
    const sql = `SELECT usuario_id, nombre, tipo_usuario, modificado
                 FROM usuarios 
                 WHERE usuario_id = ? AND activo = 1 LIMIT 1`;

    const [results] = await conexion.execute(sql, [usuario_id]);
    return results[0] || null;
  };

  // BROWSE - Obtener todos los usuarios
  buscarTodos = async () => {
    const sql = "SELECT * FROM usuarios WHERE activo = 1";
    const [results] = await conexion.query(sql);
    return results;
  };


  // EDIT - Actualizar un usuario
  actualizar = async (usuario_id, nuevosDatos) => {
    const camposAActualizar = Object.keys(nuevosDatos);
    const valoresAActualizar = Object.values(nuevosDatos);

    const setCampos = camposAActualizar
      .map((campo) => `${campo} = ?`)
      .join(", ");

    const parametros = [...valoresAActualizar, usuario_id];

    const sql = `UPDATE usuarios SET ${setCampos} WHERE usuario_id = ? AND activo = 1`;
    const [result] = await conexion.execute(sql, parametros);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.buscarPorId(usuario_id);
  };

  // Buscar usuario por nombre_usuario (email)
  buscarPorNombreUsuario = async (nombre_usuario) => {
    const sql = `SELECT * FROM usuarios WHERE nombre_usuario = ? AND activo = 1 LIMIT 1`;
    const [results] = await conexion.execute(sql, [nombre_usuario]);
    return results[0] || null;
  };

  // Actualizar solo la contraseña (utiliza SHA2 como el resto del proyecto)
  actualizarContrasenia = async (usuario_id, contrasenia) => {
    // También actualizamos 'modificado' para invalidar tokens anteriores inmediatamente
    const sql = `UPDATE usuarios SET contrasenia = SHA2(?, 256), modificado = NOW() WHERE usuario_id = ? AND activo = 1`;
    const [result] = await conexion.execute(sql, [contrasenia, usuario_id]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.buscarPorId(usuario_id);
  };

  // ADD - Crear un nuevo usuario
  crear = async (nuevoUsuario) => {
    const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario } =
      nuevoUsuario;

    const sql =
      "INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario) VALUES (?, ?, ?, SHA2(?, 256), ?)";
    const [result] = await conexion.execute(sql, [
      nombre,
      apellido,
      nombre_usuario,
      contrasenia,
      tipo_usuario,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.buscarPorId(result.insertId);
  };

  // DELETE - Eliminar un usuario (borrado lógico)
  eliminar = async (usuario_id) => {
    const sql = "UPDATE usuarios SET activo = 0 WHERE usuario_id = ?";
    const [result] = await conexion.query(sql, [usuario_id]);

    return result.affectedRows > 0;
  };
}
