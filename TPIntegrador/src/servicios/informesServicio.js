import { createObjectCsvWriter } from "csv-writer";
import puppeteer from "puppeteer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { formatearMoneda, formatearFecha } from "../helpers/formatoHelpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class InformeServicio {

  // Configura los helpers para las plantillas Handlebars
  configurarHelpersHandlebars() {
    // Helper para formatear dinero
    handlebars.registerHelper("formatearMoneda", function (monto) {
      return formatearMoneda(monto);
    });

    // Helper para sumar los servicios
    handlebars.registerHelper("sumarServicios", function (arrayServicios) {
      if (!arrayServicios || !Array.isArray(arrayServicios)) {
        return formatearMoneda(0);
      }
      const totalServicios = arrayServicios.reduce(
        (acumulador, servicio) => acumulador + (servicio.importe || 0),
        0
      );
      return formatearMoneda(totalServicios);
    });

    // Helper para formatear las fechas
    handlebars.registerHelper("formatearFecha", function (cadenaFecha) {
      return formatearFecha(cadenaFecha);
    });

    // Helper para el total general de la plantilla
    handlebars.registerHelper("formatMoney", function (monto) {
      return formatearMoneda(monto);
    });
  }

  informeReservasPdf = async (datosProcesados) => {
    try {
      const rutaPlantilla = path.join(
        __dirname,
        "../utiles/handlebars/informe.hbs"
      );

      if (!fs.existsSync(rutaPlantilla)) {
        throw new Error("No se encontró la plantilla para el PDF");
      }

      const contenidoPlantilla = fs.readFileSync(rutaPlantilla, "utf8");

      // Configura todos los helpers de Handlebars
      this.configurarHelpersHandlebars();

      const compilarPlantilla = handlebars.compile(contenidoPlantilla);

      const totalGeneral = datosProcesados.reduce(
        (acumulador, reserva) =>
          acumulador + (parseFloat(reserva.importe_total_calculado) || 0),
        0
      );

      const htmlFinal = compilarPlantilla({
        reservas: datosProcesados,
        fechaGeneracion: formatearFecha(new Date(), true),
        totalRegistros: datosProcesados.length,
        totalGeneral: totalGeneral,
      });

      const navegador = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const pagina = await navegador.newPage();
      await pagina.setContent(htmlFinal);

      const bufferPdf = await pagina.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "15mm",
          bottom: "20mm",
          left: "15mm",
        },
      });

      await navegador.close();
      return bufferPdf;
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      throw error;
    }
  };

  informeReservasCsv = async (datosProcesados) => {
    try {
      let directorioBase = path.resolve(__dirname, "../utiles");

      if (!fs.existsSync(directorioBase)) {
        fs.mkdirSync(directorioBase, { recursive: true });
      }

      const rutaArchivo = path.join(
        directorioBase,
        `reservas_${Date.now()}.csv`
      );

      const escritorCsv = createObjectCsvWriter({
        path: rutaArchivo,
        header: [
          { id: "reserva_id", title: "ID Reserva" },
          { id: "fecha_formateada", title: "Fecha Reserva" },
          { id: "salon_nombre", title: "Salón" },
          { id: "usuario_nombre", title: "Cliente" },
          { id: "turno_formateado", title: "Turno" },
          { id: "tematica", title: "Temática" },
          { id: "importe_total_formateado", title: "Importe Total" },
          { id: "servicios_csv", title: "Servicios" },
        ],
        encoding: "utf8",
        fieldDelimiter: ",",
        alwaysQuote: true,
      });

      // Prepara los datos para CSV
      const datosParaCsv = datosProcesados.map((reserva) => ({
        reserva_id: reserva.reserva_id,
        fecha_formateada: reserva.fecha_formateada,
        salon_nombre: reserva.salon_nombre,
        usuario_nombre: reserva.usuario_nombre,
        turno_formateado: reserva.turno_formateado,
        tematica: reserva.tematica || "Sin temática",
        importe_total_formateado: reserva.importe_total_formateado,
        servicios_csv: reserva.servicios_csv,
      }));

      await escritorCsv.writeRecords(datosParaCsv);

      // Agrega BOM UTF-8 para compatibilidad con Excel
      const contenidoArchivo = fs.readFileSync(rutaArchivo, "utf8");
      const contenidoConBOM = "\uFEFF" + contenidoArchivo;
      fs.writeFileSync(rutaArchivo, contenidoConBOM, "utf8");

      return rutaArchivo;
    } catch (error) {
      console.error(`Error al generar el CSV: ${error}`);
      throw error;
    }
  };
}
