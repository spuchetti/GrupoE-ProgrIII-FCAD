// middleware/validacionReservas.js
import { body, param } from "express-validator";
import { manejarResultadosValidacion } from "./resultadosValidacion.js";

// Validación para ID de reserva (solo formato)
export const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),

  manejarResultadosValidacion,
];

// Validación para crear reserva (solo estructura y formato)
export const validarCrearReserva = [
  body("fecha_reserva")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("La fecha debe tener el formato YYYY-MM-DD (ej: 2024-12-25)")
    .bail()
    .isDate()
    .withMessage("La fecha proporcionada no es una fecha válida")
    .bail()
    .custom((fecha) => {
      const fechaReserva = new Date(fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaReserva < hoy) {
        throw new Error("La fecha de reserva no puede ser en el pasado");
      }
      return true;
    }),

  body("salon_id")
    .isInt({ min: 1 })
    .withMessage("El salón ID debe ser un número entero positivo"),

  body("usuario_id")
    .isInt({ min: 1 })
    .withMessage("El usuario ID debe ser un número entero positivo"),

  body("turno_id")
    .isInt({ min: 1 })
    .withMessage("El turno ID debe ser un número entero positivo"),

  body("foto_cumpleaniero")
    .optional()
    .isString()
    .withMessage("La foto debe ser una cadena de texto")
    .isLength({ max: 255 })
    .withMessage("La URL de la foto no puede exceder los 255 caracteres"),

  body("tematica")
    .optional()
    .isString()
    .withMessage("La temática debe ser una cadena de texto")
    .isLength({ max: 100 })
    .withMessage("La temática no puede exceder los 100 caracteres"),

  body("servicios")
    .isArray({ min: 1 })
    .withMessage("Debe incluir al menos un servicio")
    .bail()
    .custom((servicios) => {
      // Validar estructura básica del array de servicios
      for (const [index, servicio] of servicios.entries()) {
        if (!servicio.servicio_id || !servicio.importe) {
          throw new Error(
            `El servicio en posición ${index} debe tener servicio_id e importe`
          );
        }

        if (
          typeof servicio.servicio_id !== "number" ||
          servicio.servicio_id < 1
        ) {
          throw new Error(
            `servicio_id en posición ${index} debe ser un número válido`
          );
        }

        if (typeof servicio.importe !== "number" || servicio.importe <= 0) {
          throw new Error(
            `importe en posición ${index} debe ser un número mayor a 0`
          );
        }
      }

      // Validar que no haya IDs duplicados
      const servicioIds = servicios.map((s) => s.servicio_id);
      const idsUnicos = [...new Set(servicioIds)];

      if (idsUnicos.length !== servicioIds.length) {
        throw new Error(
          "No se permiten servicios duplicados en la misma reserva"
        );
      }

      return true;
    }),

  manejarResultadosValidacion,
];

// Validación para actualizar reserva
export const validarActualizarReserva = [
  body("foto_cumpleaniero")
    .optional()
    .isString()
    .withMessage("La foto debe ser una cadena de texto")
    .isLength({ max: 255 })
    .withMessage("La URL de la foto no puede exceder los 255 caracteres"),

  body("tematica")
    .optional()
    .isString()
    .withMessage("La temática debe ser una cadena de texto")
    .isLength({ max: 100 })
    .withMessage("La temática no puede exceder los 100 caracteres"),

  body("importe_total")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El importe total debe ser un número positivo"),

  body("servicios")
    .optional()
    .isArray({ min: 1 })
    .withMessage(
      "Si se proporcionan servicios, debe ser un array con al menos un elemento"
    )
    .bail()
    .custom((servicios) => {
      for (const [index, servicio] of servicios.entries()) {
        if (!servicio.servicio_id || !servicio.importe) {
          throw new Error(
            `El servicio en posición ${index} debe tener servicio_id e importe`
          );
        }
      }

      const servicioIds = servicios.map((s) => s.servicio_id);
      const idsUnicos = [...new Set(servicioIds)];

      if (idsUnicos.length !== servicioIds.length) {
        throw new Error("No se permiten servicios duplicados");
      }

      return true;
    }),

  // Validar que al menos un campo sea proporcionado para actualizar
  body().custom((value, { req }) => {
    const { foto_cumpleaniero, tematica, importe_total, servicios } = req.body;

    if (!foto_cumpleaniero && !tematica && !importe_total && !servicios) {
      throw new Error(
        "Debe proporcionar al menos un campo para actualizar (foto_cumpleaniero, tematica, importe_total o servicios)"
      );
    }

    return true;
  }),

  manejarResultadosValidacion,
];

// Validación específica para servicios
export const validarServiciosEnReserva = [
  body("servicios")
    .isArray({ min: 1 })
    .withMessage("Debe incluir al menos un servicio")
    .bail()
    .custom((servicios) => {
      for (const [index, servicio] of servicios.entries()) {
        if (!servicio.servicio_id || !servicio.importe) {
          throw new Error(
            `El servicio en posición ${index} debe tener servicio_id e importe`
          );
        }

        if (
          typeof servicio.servicio_id !== "number" ||
          servicio.servicio_id < 1
        ) {
          throw new Error(
            `servicio_id en posición ${index} debe ser un número válido`
          );
        }

        if (typeof servicio.importe !== "number" || servicio.importe <= 0) {
          throw new Error(
            `importe en posición ${index} debe ser un número mayor a 0`
          );
        }
      }

      const servicioIds = servicios.map((s) => s.servicio_id);
      const idsUnicos = [...new Set(servicioIds)];

      if (idsUnicos.length !== servicioIds.length) {
        throw new Error(
          "No se permiten servicios duplicados en la misma reserva"
        );
      }

      return true;
    }),

  manejarResultadosValidacion,
];