import { conexion } from "../config/conexion.js";

export default class Salones {

  // BROWSE - Obtener todos los salones
  buscarTodos = async () => {
    const sql = "SELECT * FROM salones WHERE activo = 1";
    const [results] = await conexion.query(sql);
    return results;
  }

  // READ - Obtener un salón por ID
  buscarPorId = async (salon_id) => {
    const sql = 'SELECT * FROM salones WHERE salon_id = ? AND activo = 1';
    const [results] = await conexion.execute(sql, [salon_id]);
    return results[0] || null;
  }

  // EDIT - Actualizar un salón
  actualizar = async (salon_id, nuevosDatos) => {

      const camposAActualizar = Object.keys(nuevosDatos);
      const valoresAActualizar = Object.values(nuevosDatos);

      const setCampos = camposAActualizar.map(campo => `${campo} = ?`).join(', ');

      const parametros = [...valoresAActualizar, salon_id];

      const sql = `UPDATE salones SET ${setCampos} WHERE salon_id = ?`;
      
      const [result] = await conexion.execute(sql, parametros);

      if (result.affectedRows === 0){
          return null;
      }

      return this.buscarPorId(salon_id);
    }

  // ADD - Crear un nuevo salón
  crear = async (nuevoSalon) => {

    const {titulo, direccion, capacidad, importe} = nuevoSalon;

    const sql = 'INSERT INTO salones (titulo, direccion, capacidad, importe) VALUES (?, ?, ?, ?)';
    const [result] = await conexion.execute(sql, [titulo, direccion, capacidad, importe]);

    if (result.affectedRows === 0){
            return null;
        }

    return this.buscarPorId(result.insertId);
    
  }

  // DELETE - Eliminar un salón (borrado lógico)
  eliminar = async (salon_id) => {
    const sql = 'UPDATE salones SET activo = 0 WHERE salon_id = ?';
    const [result] = await conexion.execute(sql, [salon_id]);

    return result.affectedRows > 0;
  }

}
