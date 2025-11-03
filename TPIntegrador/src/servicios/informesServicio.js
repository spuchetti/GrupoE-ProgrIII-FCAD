import { createObjectCsvWriter } from "csv-writer";
import puppeteer from "puppeteer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class InformeServicio {
  informeReservasCsv = async (datosReporte) => {
    try {
      let ruta = path.resolve(__dirname, "../utiles");

      if (!fs.existsSync(ruta)) {
        fs.mkdirSync(ruta, { recursive: true });
      }

      ruta = path.join(ruta, `reservas_${Date.now()}.csv`);

      const csvWriter = createObjectCsvWriter({
        path: ruta,
        header: [
          { id: "reserva_id", title: "ID Reserva" },
          { id: "fecha_reserva", title: "Fecha Reserva" },
          { id: "salon_nombre", title: "Salón" },
          { id: "usuario_nombre", title: "Usuario" },
          { id: "turno_descripcion", title: "Turno" },
          { id: "tematica", title: "Temática" },
          { id: "importe_total", title: "Importe Total" },
          { id: "servicios", title: "Servicios" },
        ],
        encoding: "utf8",
        fieldDelimiter: ",",
        alwaysQuote: true,
      });

      // Formatea datos mapeando los campos del SP
      const datosFormateados = datosReporte.map((reserva) => {
        // Formatea fecha
        const fechaFormateada = reserva.fecha_reserva
          ? new Date(reserva.fecha_reserva).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "N/A";

        // Mapea campos del SP a los campos esperados por el CSV
        const salonNombre = reserva.salon_titulo || "N/A";
        const usuarioNombre =
          reserva.usuario_nombre_completo || reserva.nombre_usuario || "N/A";

        // Formatea turno (hora_desde - hora_hasta)
        const turnoDescripcion =
          reserva.hora_desde && reserva.hora_hasta
            ? `${reserva.hora_desde} - ${reserva.hora_hasta}`
            : "N/A";

        const tematica = reserva.tematica || "Sin temática";

        // Convierte en una sola cadena sin separadores
        let serviciosTexto = "Sin servicios";
        if (reserva.servicios_contratados) {
    
          serviciosTexto = reserva.servicios_contratados
            .replace(/;\s*/g, " - ") // Cambia ; por ,
            .trim();
        }

        // Formatea importe
        const importeTotal = reserva.importe_total
          ? `$${parseFloat(reserva.importe_total).toFixed(2)}`
          : "$0.00";

        return {
          reserva_id: reserva.reserva_id,
          fecha_reserva: fechaFormateada,
          salon_nombre: salonNombre,
          usuario_nombre: usuarioNombre,
          turno_descripcion: turnoDescripcion,
          tematica: tematica,
          importe_total: importeTotal,
          servicios: serviciosTexto,
        };
      });

      await csvWriter.writeRecords(datosFormateados);

      // Lee el archivo y agregar BOM UTF-8 manualmente para Excel
      const fileContent = fs.readFileSync(ruta, "utf8");
      const contentWithBOM = "\uFEFF" + fileContent;
      fs.writeFileSync(ruta, contentWithBOM, "utf8");

      return ruta;
    } catch (error) {
      console.error(`Error generando CSV: ${error}`);
      throw error;
    }
  };


  informeReservasPdf = async (datosReporte) => {
    try {
      const plantillaPath = path.join(
        __dirname,
        "../utiles/handlebars/informe.hbs"
      );

      if (!fs.existsSync(plantillaPath)) {
        throw new Error("Plantilla para PDF no encontrada");
      }

      const plantillaHtml = fs.readFileSync(plantillaPath, "utf8");

      // Registra el helper para formatear fechas
      handlebars.registerHelper("formatDate", function (dateString) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      });

      const template = handlebars.compile(plantillaHtml);

      // Formatea los datos mapeando los campos del SP
      const datosFormateados = datosReporte.map((reserva) => ({
        reserva_id: reserva.reserva_id,
        fecha_reserva: handlebars.helpers.formatDate(reserva.fecha_reserva),
        // Mapea los campos del SP
        salon_nombre: reserva.salon_titulo || "N/A",
        usuario_nombre: reserva.usuario_nombre_completo || "N/A",
        turno_descripcion:
          reserva.hora_desde && reserva.hora_hasta
            ? `${reserva.hora_desde} - ${reserva.hora_hasta}`
            : "N/A",
        tematica: reserva.tematica || "Sin temática",
        importe_total: reserva.importe_total
          ? `${parseFloat(reserva.importe_total).toFixed(2)}`
          : "0.00",
        servicios: reserva.servicios_contratados || "Sin servicios",
      }));

      const htmlFinal = template({
        reservas: datosFormateados,
        fechaGeneracion: new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        totalRegistros: datosFormateados.length,
      });

      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setContent(htmlFinal);

      const buffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "15mm",
          bottom: "20mm",
          left: "15mm",
        },
      });

      await browser.close();
      return buffer;
    } catch (error) {
      console.error("Error generando el PDF:", error);
      throw error;
    }
  };
}