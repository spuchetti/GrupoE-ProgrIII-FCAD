import Servicios from "../db/servicios.js";
import { ErrorNoEncontrado, ErrorApp } from "../errores/ErrorApp.js";

export class ServiciosServicio {
  constructor() {
    this.serviciosDB = new Servicios();
  }

  buscarTodos = async () => {
    return this.serviciosDB.buscarTodos();
  };

  buscarPorId = async (id) => {
    const servicio = await this.serviciosDB.buscarPorId(id);

    if (!servicio) {
      throw new ErrorNoEncontrado("Servicio");
    }
    return servicio;
  };

  crear = async (datos) => {
    const nuevoServicio = await this.serviciosDB.crear(datos);

    if (!nuevoServicio) {
      throw new ErrorApp('No pudo crearse el servicio');
    }
    return nuevoServicio;
  };

  actualizar = async (id, datos) => {
    const actualizado = await this.serviciosDB.actualizar(id, datos);

    if (!actualizado) {
      throw new ErrorNoEncontrado("Servicio");
    }

    return actualizado;
  };

  eliminar = async (id) => {
    const eliminado = await this.serviciosDB.eliminar(id);

    if (!eliminado) {
      throw new ErrorNoEncontrado("Servicio");
    }
    return true;
  };
}