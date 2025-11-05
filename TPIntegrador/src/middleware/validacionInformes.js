import { param, query } from "express-validator";
import { manejarResultadosValidacion } from "./resultadosValidacion.js";

export const validarGenerarInforme = [
  param("formato")
    .isIn(["pdf", "csv"])
    .withMessage("El formato debe ser 'pdf' o 'csv'"),
  
  query("fecha_inicio")
    .optional()
    .isDate()
    .withMessage("fecha_inicio debe ser una fecha válida"),
  
  query("fecha_fin")
    .optional()
    .isDate()
    .withMessage("fecha_fin debe ser una fecha válida"),
  
  query("salon_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("salon_id debe ser un número entero positivo"),
  
  query("usuario_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("usuario_id debe ser un número entero positivo"),
  
  // Validación personalizada para fechas
  query().custom((value, { req }) => {
    const { fecha_inicio, fecha_fin } = req.query;
    if (fecha_inicio && fecha_fin) {
      const inicio = new Date(fecha_inicio);
      const fin = new Date(fecha_fin);
      if (inicio > fin) {
        throw new Error("fecha_inicio no puede ser mayor que fecha_fin");
      }
    }
    return true;
  }),
  
  manejarResultadosValidacion,
];