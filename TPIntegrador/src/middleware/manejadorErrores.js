import { ErrorApp } from '../errores/ErrorApp.js';

export const manejadorErrores = (error, req, res, next) => {
  console.error('Error:', error);

  // Si el error ya es una instancia de ErrorApp, usamos sus propiedades
  if (error instanceof ErrorApp) {
    return res.status(error.status).json({
<<<<<<< HEAD
      ok: false,
=======
      estado: false,
>>>>>>> origin/Seba
      mensaje: error.message,
      detalles: error.detalles
    });
  }

  // Errores de base de datos MySQL
  if (error.code && error.code.startsWith('ER_')) {
    return res.status(409).json({
<<<<<<< HEAD
      ok: false,
=======
      estado: false,
>>>>>>> origin/Seba
      mensaje: 'Error de base de datos',
      codigo: error.code
    });
  }

  // Error por defecto
  res.status(error.status || 500).json({
<<<<<<< HEAD
    ok: false,
=======
    estado: false,
>>>>>>> origin/Seba
    mensaje: error.message || 'Error interno del servidor'
  });
};

// Middleware para rutas no encontradas
export const rutaNoEncontrada = (req, res, next) => {
  const error = new ErrorApp(`Ruta no encontrada - ${req.originalUrl}`, 404);
  next(error);
<<<<<<< HEAD
};
=======
};
>>>>>>> origin/Seba
