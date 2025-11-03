import Turnos from "../db/turnos.js";
import {
  ErrorValidacion,
  ErrorNoEncontrado,
  ErrorApp,
} from "../errores/ErrorApp.js";

export class TurnosServicio {
  constructor() {
    this.turnosDB = new Turnos();
  }

  buscarTodos = async () => {
    return this.turnosDB.buscarTodos();
  };

  buscarPorId = async (id) => {
    const turno = await this.turnosDB.buscarPorId(id);

    if (!turno) {
      throw new ErrorNoEncontrado('Turno');
    }

    return turno;
  };

  crear = async (datos) => {
    // Valida que hora_desde sea menor que hora_hasta
    if (
      this.turnosDB.convertirAMinutos(datos.hora_desde) >=
      this.turnosDB.convertirAMinutos(datos.hora_hasta)
    ) {
      throw new ErrorValidacion(
        'La hora de inicio debe ser anterior a la hora de fin'
      );
    }

    // Verifica solapamiento
    const solapamiento = await this.turnosDB.verificarSolapamiento(
      datos.hora_desde,
      datos.hora_hasta
    );
    if (solapamiento.haySolapamiento) {
      throw new ErrorValidacion(
        `El horario se solapa con el turno existente: ${solapamiento.turnoExistente.hora_desde} - ${solapamiento.turnoExistente.hora_hasta}`,
        solapamiento
      );
    }

    const nuevoTurno = await this.turnosDB.crear(datos);
    if (!nuevoTurno) {
      throw new ErrorApp('No pudo crearse el turno');
    }
    return nuevoTurno;
  };

  actualizar = async (id, datos) => {
    // Verifica que el turno existe
    const turnoActual = await this.buscarPorId(id);

    // Valida horas si se están actualizando
    if (datos.hora_desde || datos.hora_hasta) {
      const horaDesde = datos.hora_desde || turnoActual.hora_desde;
      const horaHasta = datos.hora_hasta || turnoActual.hora_hasta;

      // Valida que hora_desde sea menor que hora_hasta
      if (
        this.turnosDB.convertirAMinutos(horaDesde) >=
        this.turnosDB.convertirAMinutos(horaHasta)
      ) {
        // Valida según que campo se esté intentado actualizar
        if (datos.hora_desde && !datos.hora_hasta) {
          throw new ErrorValidacion(
            'La hora de inicio debe ser anterior a la hora actual de fin'
          );
        } else if (!datos.hora_desde && datos.hora_hasta) {
          throw new ErrorValidacion(
            'La hora de fin debe ser posterior a la hora actual de inicio'
          );
        } else {
          throw new ErrorValidacion(
            'La hora de inicio debe ser anterior a la hora de fin'
          );
        }
      }

      // Verifica solapamiento excluyendo el turno actual
      const solapamiento = await this.turnosDB.verificarSolapamiento(
        horaDesde,
        horaHasta,
        id
      );
      if (solapamiento.haySolapamiento) {
        throw new ErrorValidacion(
          `El horario se solapa con el turno existente: ${solapamiento.turnoExistente.hora_desde} - ${solapamiento.turnoExistente.hora_hasta}`,
          solapamiento
        );
      }
    }

    const turnoActualizado = await this.turnosDB.actualizar(id, datos);
    if (!turnoActualizado) {
      throw new ErrorNoEncontrado('Turno');
    }

    return turnoActualizado;
  };

  eliminar = async (id) => {
    const eliminado = await this.turnosDB.eliminar(id);

    if (!eliminado) {
      throw new ErrorNoEncontrado('Turno');
    }
    return true;
  };
}
