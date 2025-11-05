import Reservas from "../db/reservas.js";
import { ReservasServicios } from "../db/reservas_servicios.js";
import { NotificacionesServicio } from "./notificacionesServicio.js";
import { InformeServicio } from "./informesServicio.js";
import {
  ErrorNoEncontrado,
  ErrorApp,
  ErrorValidacion,
} from "../errores/ErrorApp.js";
import { UsuariosServicio } from "./usuariosServicio.js";
import { formatearMoneda, formatearFecha } from "../helpers/formatoHelpers.js";

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

    // Procesar datos para mejor visualización en PDF/CSV
    const datosProcesados = datosReporte.map((reserva) => {
        let serviciosArray = [];
        let serviciosTexto = "Sin servicios";

        // Procesar servicios contratados usando servicios_detallados del SP
        if (reserva.servicios_detallados && reserva.servicios_detallados !== "Sin servicios") {
            try {
                serviciosArray = reserva.servicios_detallados
                    .split(';;')
                    .map(servicioStr => {
                        const parts = servicioStr.split('|');
                        if (parts.length >= 3) {
                            const [servicio_id, descripcion, importe] = parts;
                            const importeNumero = parseFloat(importe.replace(/,/g, "")) || 0;
                            return {
                                servicio_id: parseInt(servicio_id),
                                descripcion: descripcion,
                                importe: importeNumero,
                                importe_formateado: formatearMoneda(importeNumero)
                            };
                        }
                        return null;
                    })
                    .filter(servicio => servicio !== null && servicio.descripcion !== "");

                // Crear texto formateado para CSV
                serviciosTexto = serviciosArray
                    .map((s) => `${s.descripcion} (${s.importe_formateado})`)
                    .join(" - ");
            } catch (error) {
                console.error("Error procesando servicios:", error);
                serviciosArray = [];
                serviciosTexto = "Error procesando servicios";
            }
        }

        // Calcular importes CORREGIDOS - usando salon_importe_base del SP
        const importeSalon = parseFloat(reserva.salon_importe_base) || 0;
        const importeServicios = serviciosArray.reduce((total, servicio) => total + (servicio.importe || 0), 0);
        const importeTotal = importeSalon + importeServicios;

        return {
            // Datos originales del SP
            ...reserva,

            // Datos procesados para PDF
            serviciosArray: serviciosArray,
            serviciosTexto: serviciosTexto,
            fecha_formateada: formatearFecha(reserva.fecha_reserva),
            turno_formateado: reserva.turno_formateado || "N/A",
            
            // Importes calculados CORRECTAMENTE con formato apropiado
            importe_salon: importeSalon,
            importe_servicios: importeServicios,
            importe_salon_formateado: formatearMoneda(importeSalon),
            importe_servicios_formateado: formatearMoneda(importeServicios),
            importe_total_calculado: importeTotal,
            importe_total_formateado: formatearMoneda(importeTotal),

            // Datos adicionales para CSV
            salon_nombre: reserva.salon_titulo || "N/A",
            usuario_nombre: reserva.usuario_nombre_completo || "N/A",
            servicios_csv: serviciosTexto,
        };
    });

    if (formato === "pdf") {
        const buffer = await this.informes.informeReservasPdf(datosProcesados);
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
        const path = await this.informes.informeReservasCsv(datosProcesados);
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
    };

    // CREAMOS LA RESERVA
    const nuevaReserva = await this.reservasDB.crear(datosNuevaReserva);

    if (!nuevaReserva) {
      throw new ErrorApp("No pudo crearse la reserva");
    }

    await this.reservas_servicios.crear(nuevaReserva.reserva_id, servicios);

    try {
      const datosParaNotificacion = await this.reservasDB.datosParaNotificacion(
        nuevaReserva.reserva_id
      );

      await this.notificaciones_servicios.enviarCorreo(datosParaNotificacion);
    } catch (notificacionError) {
      console.log("Advertencia: No se pudo enviar el correo.");
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
