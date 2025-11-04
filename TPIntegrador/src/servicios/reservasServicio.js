import Reservas from "../db/reservas.js";
import { ReservasServicios } from "../db/reservas_servicios.js";
import { NotificacionesServicio } from "./notificacionesServicio.js";
import { InformeServicio } from "./informesServicio.js";
import { ErrorNoEncontrado, ErrorApp, ErrorValidacion } from "../errores/ErrorApp.js";
import { UsuariosServicio } from "./usuariosServicio.js";

export class ReservasServicio {
  constructor() {
    this.reservasDB = new Reservas();
    this.reservas_servicios = new ReservasServicios();
    this.notificaciones_servicios = new NotificacionesServicio();
    this.informes = new InformeServicio();
    this.usuariosServicio = new UsuariosServicio();
  }

  buscarTodas = async () => {
    return this.reservasDB.buscarTodas();
  };

  buscarPorUsuario = async (usuario_id) => {
    // Verifica que el usuario existe
    await this.usuariosServicio.buscarPorId(usuario_id);

    // Si existe, buscar sus reservas
    const reservas = await this.reservasDB.buscarPropias(usuario_id);

    if (reservas.length === 0) {
      console.log(`Usuario ${usuario_id} existe pero no tiene reservas`);
    }

    return reservas;
  };

  buscarPorId = async (id) => {
    const reserva = await this.reservasDB.buscarPorId(id);
    
    if (!reserva) {
      throw new ErrorNoEncontrado("Reserva");
    }
    return reserva;
  };

  generarInforme = async (formato, filtros = {}) => {
    if (!["pdf", "csv"].includes(formato)) {
      throw new ErrorApp(
        "Formato de informe no soportado. Use 'pdf' o 'csv'",
        400
      );
    }

    const datosReporte = await this.reservasDB.buscarDatosReporte(filtros);

    if (!datosReporte || datosReporte.length === 0) {
      throw new ErrorApp(
        "No hay datos para generar el informe con los filtros aplicados",
        404
      );
    }

    if (formato === "pdf") {
      const buffer = await this.informes.informeReservasPdf(datosReporte);
      return {
        buffer: buffer,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="reporte_reservas_${
            new Date().toISOString().split("T")[0]
          }.pdf"`,
        },
      };
    } else if (formato === "csv") {
      const path = await this.informes.informeReservasCsv(datosReporte);
      return {
        path: path,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="reporte_reservas_${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      };
    }
  };

  crear = async (datos) => {
    const {
      fecha_reserva,
      salon_id,
      usuario_id,
      turno_id,
      foto_cumpleaniero,
      tematica,
      servicios,
    } = datos;

    if (!servicios || !Array.isArray(servicios)) {
      throw new ErrorValidacion("Debe proporcionar servicios para la reserva");
    }

    const datosNuevaReserva = {
      fecha_reserva,
      salon_id,
      usuario_id,
      turno_id,
      foto_cumpleaniero,
      tematica,
      servicios,
    };

    // CREAMOS LA RESERVA
    const nuevaReserva = await this.reservasDB.crear(datosNuevaReserva);

    if (!nuevaReserva) {
      throw new ErrorApp("No pudo crearse la reserva");
    }

    if (Array.isArray(servicios) && servicios.length > 0) {
      await this.reservas_servicios.crear(nuevaReserva.reserva_id, servicios);
    }

    try {
      const reservaCompleta = await this.reservasDB.buscarPorId(
        nuevaReserva.reserva_id
      );

      const datosParaNotificacion = [
        [
          {
            fecha: reservaCompleta.fecha_reserva,
            salon: reservaCompleta.salon_id,
            turno: reservaCompleta.turno_id,
          },
        ],
        [
          {
            correoAdmin: "grupoe.progr3.fcad@gmail.com",
          },
        ],
      ];

      const correoEnviado = await this.notificaciones_servicios.enviarCorreo(
        datosParaNotificacion
      );

      if (!correoEnviado) {
        console.warn("⚠️ No se pudo enviar el correo de notificación.");
      }
    } catch (error) {
      console.error("❌ Error inesperado al preparar la notificación:", error);
    }

    return this.reservasDB.buscarPorId(nuevaReserva.reserva_id);
  };

  actualizar = async (id, datos) => {
    const actualizada = await this.reservasDB.actualizar(id, datos);

    if (!actualizada) {
      throw new ErrorNoEncontrado("Reserva");
    }

    return actualizada;
  };

  eliminar = async (id) => {
    const eliminada = await this.reservasDB.eliminar(id);

    if (!eliminada) {
      throw new ErrorNoEncontrado("Reserva");
    }
    return true;
  };
}