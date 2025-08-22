const { escribir, leer, existe, eliminar } = require("./fs.js");

const urlAPI = "https://fakestoreapi.com/products";

async function manejoRequest(peticion) {
  try {
    const response = await peticion;
    if (!response.ok) throw new Error(`Error ${response.status}`);

    const data = await response.json();

    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

async function obtenerXCantidadProductos(cantidad) {
  const resultado = await manejoRequest(fetch(`${urlAPI}?limit=${cantidad}`));

  if (resultado.ok) {
    const guardado = await escribir(resultado.data);
    if (!guardado.ok) {
      console.log(`Error al guardar: ${guardado.message}`);
    } else {
      console.log(guardado.message);
    }
  }
  return resultado;
}

async function obtenerTodosProductos() {
  return manejoRequest(fetch(urlAPI));
}

async function agregarNuevoProducto(nuevoProducto) {
  return manejoRequest(
    fetch(urlAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoProducto),
    })
  );
}

async function buscarProducto(id) {
  return manejoRequest(fetch(`${urlAPI}/${id}`));
}

async function eliminarProducto(id) {
  return manejoRequest(
    fetch(`${urlAPI}/${id}`, {
      method: "DELETE",
    })
  );
}

async function actualizarProducto(id, nuevosDatos) {
  return manejoRequest(
    fetch(`${urlAPI}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevosDatos),
    })
  );
}

async function agregarProductoLocal(nuevoProducto) {
  try {
    const resultado = await leerProductosGuardados();

    if (!resultado.ok) {
      // Si no existe el archivo, crea uno con el nuevo producto
      return await escribir([{ id: 1, ...nuevoProducto }]);
    }

    // Obtiene el máximo ID existente
    const maxId = resultado.data.reduce(
      (max, producto) => Math.max(max, producto.id || 0),
      0
    );

    const productoConId = {
      id: maxId + 1,
      ...nuevoProducto,
    };

    const productosActualizados = [...resultado.data, productoConId];

    return await escribir(productosActualizados);
  } catch (error) {
    return {
      ok: false,
      message: `Error al intentar agregar el producto al archivo local: ${error.message}`,
    };
  }
}

async function eliminarProductosPorPrecioMaximo(precioMaximo) {
  try {
    const resultado = await leerProductosGuardados();

    if (!resultado.ok) {
      return resultado;
    }

    // Filtra los productos que sean menores o iguales al precio máximo
    const productosFiltrados = resultado.data.filter(
      (producto) => producto.price <= precioMaximo
    );

    // Guarda los productos filtrados
    return await escribir(productosFiltrados);
  } catch (error) {
    return {
      ok: false,
      message: `Error al intentar eliminar los productos por precio: ${error.message}`,
    };
  }
}

// Funciones adicionales
async function leerProductosGuardados() {
  const resultado = await leer();
  return resultado;
}

async function existeArchivoProductos() {
  return await existe();
}

function mostrarProductosEnTabla(productos) {
  const tablaProductos = productos.map((p) => ({
    ID: p.id,
    Title: p.title.length > 20 ? p.title.substring(0, 20) + "..." : p.title,
    Price: `$${p.price}`,
    Category: p.category,
    Rating: p.rating ? `${p.rating.rate} ⭐` : "N/A",
    'Review Count': p.rating ? p.rating.count : "N/A"
  }));

  console.table(tablaProductos);
}

function mostrarDetallesCompletos(productos) {
  console.log("\n=== Detalles completos de los productos ===");
  productos.forEach((p, index) => {
    console.log(`\nProducto ${index + 1}:`);
    console.log(JSON.stringify(p, null, 2));
  });
}

async function mostrarProductosGuardados() {
  const resultado = await leerProductosGuardados();
  
  if (!resultado.ok) {
    console.log(`Error al leer productos: ${resultado.message}`);
    return;
  }

  console.log(`\nProductos almacenados: ${resultado.data.length}`);
  mostrarProductosEnTabla(resultado.data);
  mostrarDetallesCompletos(resultado.data);
  
  return resultado.data;
}


module.exports = {
  obtenerXCantidadProductos,
  obtenerTodosProductos,
  agregarNuevoProducto,
  buscarProducto,
  eliminarProducto,
  actualizarProducto,
  existeArchivoProductos,
  agregarProductoLocal,
  eliminarProductosPorPrecioMaximo,
  mostrarProductosGuardados
};
