export class ErrorApp extends Error {
  constructor(mensaje, status = 500, detalles = null) {
    super(mensaje);
    this.name = this.constructor.name;
    this.status = status;
    this.detalles = detalles;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorValidacion extends ErrorApp {
  constructor(detalles) {
    super('Error de validación', 400, detalles);
  }
}

export class ErrorNoEncontrado extends ErrorApp {
  constructor(recurso) {
    super(`${recurso || 'Recurso'} no encontrado`, 404);
  }
}

export class ErrorAuth extends ErrorApp {
  constructor(mensaje = 'No autorizado') {
    super(mensaje, 401);
  }
}

export class ErrorBaseDatos extends ErrorApp {
  constructor(mensaje = 'Error de base de datos') {
    super(mensaje, 500);
  }
}

export class ErrorCredencialesInvalidas extends ErrorAuth {
  constructor() {
    super("Credenciales inválidas");
  }
}

export class ErrorTokenInvalido extends ErrorAuth {
  constructor() {
    super("Token inválido o expirado");
  }
}

export class ErrorPermisosInsuficientes extends ErrorAuth {
  constructor() {
    super("Permisos insuficientes");
  }
}
