import { conexion } from "../config/conexion.js";

export default class Turnos {
  // Función auxiliar para convertir horas a minutos
  convertirAMinutos = (hora) => {
    const [horas, minutos] = hora.split(":").map(Number);
    return horas * 60 + minutos;
  };

  // Verifica solapamiento horarios y turnos
  verificarSolapamiento = async (horaDesde, horaHasta, excluirId = null) => {
    const sql = excluirId
      ? "SELECT * FROM turnos WHERE activo = 1 AND turno_id != ?"
      : "SELECT * FROM turnos WHERE activo = 1";

    const parametros = excluirId ? [excluirId] : [];
    const [turnosExistentes] = await conexion.query(sql, parametros);

    const horaEnMinutosDesde = this.convertirAMinutos(horaDesde);
    const horaEnMinutosHasta = this.convertirAMinutos(horaHasta);

    for (const turno of turnosExistentes) {
      const existenteDesde = this.convertirAMinutos(turno.hora_desde);
      const existenteHasta = this.convertirAMinutos(turno.hora_hasta);

      const seSolapa =
        (horaEnMinutosDesde >= existenteDesde &&
          horaEnMinutosDesde < existenteHasta) ||
        (horaEnMinutosHasta > existenteDesde &&
          horaEnMinutosHasta <= existenteHasta) ||
        (horaEnMinutosDesde <= existenteDesde &&
          horaEnMinutosHasta >= existenteHasta);

      if (seSolapa) {
        return {
          haySolapamiento: true,
          turnoExistente: turno,
          horarioSolicitado: { hora_desde: horaDesde, hora_hasta: horaHasta },
        };
      }
    }

    return { haySolapamiento: false };
  };

  // BROWSE - Obtener todos los turnos
  buscarTodos = async () => {
    const sql = "SELECT * FROM turnos WHERE activo = 1 ORDER BY orden";
    const [results] = await conexion.query(sql);
    return results;
  };

  // READ - Obtener un turno por ID
  buscarPorId = async (turno_id) => {
    const sql = "SELECT * FROM turnos WHERE turno_id = ? AND activo = 1";
    const [results] = await conexion.execute(sql, [turno_id]);
    return results[0] || null;
  };

  // EDIT - Actualizar un turno
  actualizar = async (turno_id, nuevosDatos) => {
    const camposAActualizar = Object.keys(nuevosDatos);
    const valoresAActualizar = Object.values(nuevosDatos);

    const setCampos = camposAActualizar
      .map((campo) => `${campo} = ?`)
      .join(", ");

    const parametros = [...valoresAActualizar, turno_id];

    const sql = `UPDATE turnos SET ${setCampos} WHERE turno_id = ? AND activo = 1`;
    const [result] = await conexion.execute(sql, parametros);

    if (result.affectedRows === 0) {
      return null;
    }

    return await this.buscarPorId(turno_id);
  };

  // ADD - Crear un nuevo turno
  crear = async (nuevoTurno) => {
    const { hora_desde, hora_hasta } = nuevoTurno;

    // Obtenemos la última orden existente
    const [ultimoTurno] = await conexion.query(
      "SELECT orden FROM turnos WHERE activo = 1 ORDER BY orden DESC LIMIT 1"
    );

    const siguienteOrden =
      ultimoTurno.length > 0 ? ultimoTurno[0].orden + 1 : 1;

    const sql =
      "INSERT INTO turnos (orden, hora_desde, hora_hasta) VALUES (?, ?, ?)";
    const [result] = await conexion.execute(sql, [
      siguienteOrden,
      hora_desde,
      hora_hasta,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return await this.buscarPorId(result.insertId);
  };

  // DELETE - Eliminar un turno (borrado lógico)
  eliminar = async (turno_id) => {
    const sql = "UPDATE turnos SET activo = 0 WHERE turno_id = ?";
    const [result] = await conexion.execute(sql, [turno_id]);
    
    return result.affectedRows > 0;
  };
}
