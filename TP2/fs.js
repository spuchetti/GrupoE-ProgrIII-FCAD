const fs = require("fs").promises;
const path = require("path");

const rutaAbsJson = path.join(__dirname, "productos.json");

async function escribir(datos) {
  try {
    const datosFormateados = JSON.stringify(datos, null, 2);
    await fs.writeFile(rutaAbsJson, datosFormateados, "utf8");

    return {
      ok: true,
      message: "Archivo guardado exitosamente !",
      ruta: rutaAbsJson,
    };
  } catch (error) {
    return {
      ok: false,
      message: `Error al escribir el archivo: ${error.message}`,
      ruta: rutaAbsJson,
    };
  }
}

async function leer() {
  try {
    if (!(await existe())) {
      return {
        ok: false,
        message: "El archivo no existe",
        ruta: rutaAbsJson,
      };
    }

    const data = await fs.readFile(rutaAbsJson, "utf8");

    return {
      ok: true,
      data: JSON.parse(data),
      ruta: rutaAbsJson,
    };
  } catch (error) {
    return {
      ok: false,
      message: `Error al leer el archivo: ${error.message}`,
      ruta: rutaAbsJson,
    };
  }
}

async function eliminar() {
  try {
    await fs.unlink(rutaAbsJson);
    return {
      ok: true,
      message: `Archivo eliminado: ${rutaAbsJson}`,
    };
  } catch (error) {
    return {
      ok: false,
      message: `Error al eliminar: ${error.message}`,
    };
  }
}

async function existe() {
  try {
    await fs.access(rutaAbsJson);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  escribir,
  leer,
  existe,
  eliminar
};
