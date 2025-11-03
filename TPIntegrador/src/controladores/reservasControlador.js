import apicache from "apicache";
import { ReservasServicio } from "../servicios/reservasServicio.js";

export class ReservasControlador {
  constructor() {
    this.servicio = new ReservasServicio();
  }

  generarReporte = async (req, res, next) => {
    try {
      const { formato } = req.params;
      const { fecha_inicio, fecha_fin, salon_id, usuario_id } = req.query;

      // Se pasan los filtros al servicio
      const filtros = {
        fecha_inicio,
        fecha_fin,
        salon_id: salon_id ? parseInt(salon_id) : undefined,
        usuario_id: usuario_id ? parseInt(usuario_id) : undefined,
      };

      const reporte = await this.servicio.generarInforme(formato, filtros);

      // Configuramos los headers
      Object.entries(reporte.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      if (formato === "pdf") {
        res.send(reporte.buffer);
      } else if (formato === "csv") {
        res.sendFile(reporte.path, (err) => {
          if (err) {
            console.error("Error enviando archivo CSV:", err);
            next(err);
          }
          
        });
      }
    } catch (err) {
      next(err);
    }
  };

  crear = async (req, res, next) => {
    try {
      const {
        fecha_reserva,
        salon_id,
        usuario_id,
        turno_id,
        foto_cumpleaniero,
        tematica,
        servicios,
      } = req.body;

      const datos = {
        fecha_reserva,
        salon_id,
        usuario_id,
        turno_id,
        foto_cumpleaniero,
        tematica,
        servicios,
      };

      const nuevaReserva = await this.servicio.crear(datos);
      apicache.clear('/api/v1/reservas');

      return res.status(201).json({
        estado: true,
        mensaje: "Reserva creada correctamente",
        datos: nuevaReserva,
      });
    } catch (err) {
      next(err);
    }
  };

  actualizar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const datos = req.body;
      const reservaActualizada = await this.servicio.actualizar(id, datos);

      apicache.clear(`/api/v1/reservas/${id}`);
      apicache.clear('/api/v1/reservas');

      return res.json({
        estado: true,
        mensaje: "Reserva actualizada correctamente",
        datos: reservaActualizada,
      });
    } catch (err) {
      next(err);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.servicio.eliminar(id);

      apicache.clear(`/api/v1/reservas/${id}`);
      apicache.clear('/api/v1/reservas');

      return res.json({
        estado: true,
        mensaje: "Reserva eliminada correctamente",
      });
    } catch (err) {
      next(err);
    }
  };

  buscarTodas = async (req, res, next) => {
    try {
      const reservas = await this.servicio.buscarTodas();

      return res.json({
        estado: true,
        datos: reservas,
      });
    } catch (err) {
      next(err);
    }
  };

  buscarPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      const reserva = await this.servicio.buscarPorId(id);

      return res.json({
        estado: true,
        datos: reserva,
      });
    } catch (err) {
      next(err);
    }
  };

  buscarPorUsuario = async (req, res, next) => {
    try {
      const { usuario_id } = req.params;
      const reservas = await this.servicio.buscarPorUsuario(usuario_id);

      let mensaje = "Reservas obtenidas correctamente";
      if (reservas.length === 0) {
        mensaje = "El usuario no tiene reservas realizadas";
      }

      return res.json({
        estado: true,
        mensaje: mensaje,
        datos: reservas,
        total: reservas.length,
      });
    } catch (err) {
      next(err);
    }
  };
}
