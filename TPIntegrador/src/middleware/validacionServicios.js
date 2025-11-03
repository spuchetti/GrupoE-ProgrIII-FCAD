import { body, param } from "express-validator";
import { manejarResultadosValidacion } from "./resultadosValidacion.js";

// Validaciones para crear servicio
export const validarCrearServicio = [
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción es requerida")
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage("La descripción debe tener entre 10 y 100 caracteres")
    .escape(),

  body("importe")
    .isFloat({ min: 1 })
    .withMessage("El importe debe ser un número mayor a 0")
    .toFloat(),

  manejarResultadosValidacion,
];

// Validaciones para actualizar servicio
export const validarActualizarServicio = [
  param("id").isInt({ min: 1 }).withMessage("ID inválido").toInt(),

   body("descripcion")
    .notEmpty()
    .optional()
    .withMessage("La descripción es requerida")
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage("La descripción debe tener entre 10 y 100 caracteres")
    .escape(),

  body("importe")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("El importe debe ser un número mayor a 0")
    .toFloat(),

  // Validamos que al menos un campo sea proporcionado
  body().custom((value, { req }) => {
    const camposPermitidos = [
      "descripcion",
      "importe"
    ];
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
