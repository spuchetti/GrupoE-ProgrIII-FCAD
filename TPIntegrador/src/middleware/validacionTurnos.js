// validacionTurnos.js - VERSION CORREGIDA
import { body, param } from "express-validator";
import { manejarResultadosValidacion } from "./resultadosValidacion.js";

// Validaciones para crear turno
export const validarCrearTurno = [
  body("hora_desde")
    .notEmpty()
    .withMessage("La hora desde es requerida")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("Formato de hora inválido (HH:MM:SS)"),

  body("hora_hasta")
    .notEmpty()
    .withMessage("La hora hasta es requerida")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("Formato de hora inválido (HH:MM:SS)"),

  manejarResultadosValidacion,
];

// Validaciones para actualizar turno
export const validarActualizarTurno = [
  body("hora_desde")
    .optional()
    .notEmpty()
    .withMessage("La hora desde no puede estar vacía")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("Formato de hora inválido (HH:MM:SS)"),

  body("hora_hasta")
    .optional()
    .notEmpty()
    .withMessage("La hora hasta no puede estar vacía")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("Formato de hora inválido (HH:MM:SS)"),

  // Validamos que al menos un campo sea proporcionado
  body().custom((value, { req }) => {
    const camposPermitidos = ["hora_desde", "hora_hasta"];
    const camposProporcionados = Object.keys(req.body);

    const hayCamposValidos = camposPermitidos.some(
      (campo) =>
        camposProporcionados.includes(campo) &&
        req.body[campo] !== undefined &&
        req.body[campo] !== null &&
        req.body[campo] !== ""
    );

    if (!hayCamposValidos) {
      throw new Error(
        "Debe proporcionar al menos un campo válido para actualizar"
      );
    }

    return true;
  }),

  manejarResultadosValidacion,
];

// Validaciones para operaciones con ID
export const validarId = [
  param("id").isInt({ min: 1 }).withMessage("ID inválido").toInt(),
  manejarResultadosValidacion,
];
