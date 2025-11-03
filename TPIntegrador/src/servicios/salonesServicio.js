import Salones from "../db/salones.js";
import { ErrorNoEncontrado, ErrorApp } from "../errores/ErrorApp.js";

export class SalonesServicio {
  constructor() {
    this.salonesDB = new Salones();
  }
  
  buscarTodos = async () => {
    return this.salonesDB.buscarTodos();
  };

  buscarPorId = async (id) => {
    const salon = await this.salonesDB.buscarPorId(id);

    if (!salon) {
      throw new ErrorNoEncontrado("Salón");
    }
    return salon;
  };

  crear = async (datos) => {
    const nuevoSalon = await this.salonesDB.crear(datos);

    if (!nuevoSalon) {
      throw new ErrorApp('No pudo crearse el salón');
    }
    return nuevoSalon;
  };

  actualizar = async (id, datos) => {
    const actualizado = await this.salonesDB.actualizar(id, datos);

    if (!actualizado) {
      throw new ErrorNoEncontrado('Salón');
    }
    return actualizado;
  };

  eliminar = async (id) => {
    const eliminado = await this.salonesDB.eliminar(id);

    if (!eliminado) {
      throw new ErrorNoEncontrado('Salón');
    }
    return true;
  };
}