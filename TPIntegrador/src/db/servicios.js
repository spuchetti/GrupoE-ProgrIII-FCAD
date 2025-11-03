import { conexion } from "../config/conexion.js";

export default class Servicios {

  // BROWSE - Obtener todos los servicios
  buscarTodos = async () => {
    const sql = 'SELECT * FROM servicios WHERE activo = 1';
    const [results] = await conexion.query(sql);
    return results;
  }

  // READ - Obtener un servicio por ID
  buscarPorId = async (servicio_id) => {
    const sql = 'SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1';
    const [results] = await conexion.execute(sql, [servicio_id]);
    return results[0] || null;
  }

  // EDIT - Actualizar un servicio
  actualizar = async (servicio_id, nuevosDatos) => {
      const camposAActualizar = Object.keys(nuevosDatos);
      const valoresAActualizar = Object.values(nuevosDatos);

      const setCampos = camposAActualizar.map(campo => `${campo} = ?`).join(', ');

      const parametros = [...valoresAActualizar, servicio_id];

    const sql = `UPDATE servicios SET ${setCampos} WHERE servicio_id = ? AND activo = 1`;
    const [result] = await conexion.execute(sql, parametros);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.buscarPorId(servicio_id);
  }

  // ADD - Crear un nuevo servicio
  crear = async (nuevoServicio) => {
    
    const { descripcion, importe } = nuevoServicio;

    const sql = 'INSERT INTO servicios (descripcion, importe) VALUES (?, ?)';
    const [result] = await conexion.execute(sql, [descripcion, importe]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.buscarPorId(result.insertId);
  }

  // DELETE - Eliminar un servicio (borrado lógico)
  eliminar = async (servicio_id) => {
    const sql = 'UPDATE servicios SET activo = 0 WHERE servicio_id = ?';
    const [result] = await conexion.execute(sql, [servicio_id]);

    return result.affectedRows > 0;
  }

}
