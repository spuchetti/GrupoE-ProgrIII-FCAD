import { validationResult } from "express-validator";
import { ErrorValidacion } from "../errores/ErrorApp.js";

// Middleware para manejar resultados de validación
export const manejarResultadosValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const detalles = errors.array().map((error) => ({
      campo: error.path,
      mensaje: error.msg,
      valor: error.value,
    }));
    throw new ErrorValidacion(detalles);
  }
  next();
};