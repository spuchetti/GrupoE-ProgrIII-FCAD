import { body, param } from "express-validator";
import { manejarResultadosValidacion } from "./resultadosValidacion.js";

// Validacion para login de usuario
export const validarLogin = [
  body("nombre_usuario")
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .custom((email) => {
      const dominiosPermitidos = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];
      const dominio = email.split('@')[1];
      
      if (!dominiosPermitidos.includes(dominio)) {
        throw new Error(`Solo se permiten emails de: ${dominiosPermitidos.join(', ')}`);
      }
      
      return true;
    })
    .normalizeEmail(),

  body("contrasenia")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .trim()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),

  manejarResultadosValidacion,
];

// Validaciones para crear usuario
export const validarCrearUsuario = [
  body("nombre")
    .notEmpty()
    .withMessage("El nombre es requerido")
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("El nombre debe tener entre 5 y 50 caracteres")
    .escape(),

  body("apellido")
    .notEmpty()
    .withMessage("El apellido es requerido")
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("El apellido debe tener entre 5 y 50 caracteres")
    .escape(),

  body("nombre_usuario")
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .custom((email) => {
      const dominiosPermitidos = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];
      const dominio = email.split('@')[1];
      
      if (!dominiosPermitidos.includes(dominio)) {
        throw new Error(`Solo se permiten emails de: ${dominiosPermitidos.join(', ')}`);
      }
      
      return true;
    })
    .normalizeEmail(),

  body("contrasenia")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .trim()
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .isAlphanumeric()
    .withMessage("La contraseña solo puede contener letras y números"),

  body("tipo_usuario")
    .notEmpty()
    .withMessage("El tipo de usuario es requerido")
    .isInt({ min: 1, max: 3 })
    .withMessage(
      "El tipo de usuario debe ser 1 (Admin), 2 (Empleado) o 3 (Cliente)"
    )
    .toInt(),

  manejarResultadosValidacion,
];

// Validaciones para actualizar usuario
export const validarActualizarUsuario = [
  body("nombre")
    .optional()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("El nombre debe tener entre 5 y 50 caracteres")
    .escape(),

  body("apellido")
    .optional()
    .notEmpty()
    .withMessage("El apellido no puede estar vacío")
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("El apellido debe tener entre 5 y 50 caracteres")
    .escape(),

  body("nombre_usuario")
    .optional()
    .notEmpty()
    .withMessage("El email no puede estar vacío")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .custom((email) => {
      const dominiosPermitidos = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];
      const dominio = email.split('@')[1];
      
      if (!dominiosPermitidos.includes(dominio)) {
        throw new Error(`Solo se permiten emails de: ${dominiosPermitidos.join(', ')}`);
      }
      
      return true;
    })
    .normalizeEmail(),

  body("contrasenia")
    .optional()
    .notEmpty()
    .withMessage("La contraseña no puede estar vacía")
    .trim()
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .isAlphanumeric()
    .withMessage("La contraseña solo puede contener letras y números"),

  body("tipo_usuario")
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage(
      "El tipo de usuario debe ser 1 (Admin), 2 (Empleado) o 3 (Cliente)"
    )
    .toInt(),

  // Validamos que al menos un campo sea proporcionado
  body().custom((value, { req }) => {
    const camposPermitidos = [
      "nombre",
      "apellido",
      "nombre_usuario",
      "contrasenia",
      "tipo_usuario",
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
