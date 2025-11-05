import { conexion } from "../config/conexion.js";

export default class Reservas {
  buscarDatosReporte = async (filtros = {}) => {
    const { fecha_inicio, fecha_fin, salon_id, usuario_id } = filtros;

    const [results] = await conexion.execute(
      "CALL sp_obtener_reporte_reservas(?, ?, ?, ?)",
      [
        fecha_inicio || null,
        fecha_fin || null,
        salon_id || null,
        usuario_id || null,
      ]
    );
    return results[0];
  };

  // BROWSE - Obtener todas las reservas
  buscarTodas = async () => {
    const [results] = await conexion.execute(
      "SELECT * FROM reservas WHERE activo = 1"
    );
    return results;
  };

  // READ - Obtener reservas propias de un usuario
  buscarPropias = async (usuario_id) => {
    const [results] = await conexion.execute(
      "CALL sp_obtener_reservas_usuario(?)",
      [usuario_id]
    );
    return results[0] || [];
  };

  // READ - Obtener una reserva COMPLETA por id
  buscarPorId = async (reserva_id) => {
    const [results] = await conexion.execute(
      "CALL sp_obtener_reserva_completa(?)",
      [reserva_id]
    );

    return results[0][0] || null;
  };

  // CREATE - Crear nueva reserva
  crear = async (nuevaReserva) => {
    const [result] = await conexion.execute(
      "CALL sp_crear_reserva(?, ?, ?, ?, ?, ?)",
      [
        nuevaReserva.fecha_reserva,
        nuevaReserva.salon_id,
        nuevaReserva.usuario_id,
        nuevaReserva.turno_id,
        nuevaReserva.foto_cumpleaniero || null,
        nuevaReserva.tematica || null,
      ]
    );
    return this.buscarPorId(result[0][0].nueva_reserva_id);
  };

  // UPDATE - Actualizar reserva
  actualizar = async (reserva_id, nuevosDatos) => {
    const [result] = await conexion.execute(
      "UPDATE reservas SET foto_cumpleaniero = ?, tematica = ?, importe_total = ? WHERE reserva_id = ? AND activo = 1",
      [
        nuevosDatos.foto_cumpleaniero || null,
        nuevosDatos.tematica || null,
        nuevosDatos.importe_total || null,
        reserva_id,
      ]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.buscarPorId(reserva_id);
  };

  // DELETE - Eliminar reserva(borrado lógico)
  eliminar = async (reserva_id) => {
    const [result] = await conexion.execute(
      "UPDATE reservas SET activo = 0 WHERE reserva_id = ? AND activo = 1",
      [reserva_id]
    );

    return result.affectedRows > 0;
  };

  datosParaNotificacion = async (reserva_id) => {
    const [results] = await conexion.execute(
      "CALL obtenerDatosNotificacion(?)",
      [reserva_id]
    );
    return results[0][0] || null;
  };

  // Reporte CSV
  buscarDatosReporteCsv = async () => {
    const [results] = await conexion.execute("CALL reporte_csv()");
    return results[0];
  };

  verificarDisponibilidad = async (fecha, salon_id, turno_id) => {
    const [results] = await conexion.execute(
      "CALL sp_verificar_disponibilidad(?, ?, ?)",
      [fecha, salon_id, turno_id]
    );
    return results[0][0].disponible;
  };
}
