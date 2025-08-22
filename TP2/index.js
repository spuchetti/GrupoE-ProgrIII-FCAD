const {
  obtenerTodosProductos,
  obtenerXCantidadProductos,
  agregarNuevoProducto,
  buscarProducto,
  eliminarProducto,
  actualizarProducto,
  existeArchivoProductos,
  agregarProductoLocal,
  eliminarProductosPorPrecioMaximo,
  mostrarProductosGuardados
} = require("./api.js");

// Bloque principal - PRUEBAS
(async () => {
  console.log("=== PRUEBA API FETCH ===");

  // 1. Recuperar la información de todos los productos (GET).
  const productos = await obtenerTodosProductos();
  if (!productos.ok) {
    console.log(
      `Falló la API al intentar obtener todos los productos: ${productos.message}`
    );
  } else {
    console.log("Productos:", productos.data);
  }

  // 2. Recuperar la información de un número limitado de productos (GET).
  // 3. Persistir los datos de la consulta anterior en un archivo local JSON.
  const cantidadProductos = 10;
  const algunos = await obtenerXCantidadProductos(cantidadProductos);
  if (!algunos?.ok) {
    console.log(
      `Falló la API al intentar obtener ${cantidadProductos} productos: ${algunos.message}`
    );
  } else {
    console.log(
      `\nSe obtuvieron los primeros ${cantidadProductos} productos:`,
      algunos.data
    );
  }

  // 4. Agregar un nuevo producto (POST).
  const nuevoProducto = await agregarNuevoProducto({
    title: "Palmera",
    price: 1500,
    description: "Dibujo de palmera",
    category: "Planta",
    image:
      "https://img.freepik.com/vector-gratis/ilustracion-palmeras-tropicales_1308-176395.jpg?semt=ais_hybrid&w=740&q=80",
    rating:{
      rate: 5.2,
      count: 350
    }
  });

  if (!nuevoProducto.ok) {
    console.log(
      `Falló la API al intentar agregar un producto: ${nuevoProducto.message}`
    );
  } else {
    console.log("\nSe agregó un nuevo producto: ", nuevoProducto.data);
  }

  // 5. Buscar la información de un determinado producto, utilizando un “id” como parámetro (GET).
  const idProductoABuscar = 2;
  const productoBuscado = await buscarProducto(idProductoABuscar);
  if (!productoBuscado.ok) {
    console.log(
      `Falló la API al intentar buscar un producto: ${productoBuscado.message}`
    );
  } else {
    console.log(
      `\nProducto encontrado con id ${idProductoABuscar}:`,
      productoBuscado.data
    );
  }

  // 6. Eliminar un producto (DELETE).
  const idProductoAEliminar = 3;
  const productoEliminado = await eliminarProducto(idProductoAEliminar);
  if (!productoEliminado.ok) {
    console.log(
      `Falló la API al intentar eliminar un producto: ${productoEliminado.message}`
    );
  } else {
    console.log(
      `\nProducto eliminado con id ${idProductoAEliminar}:`,
      productoEliminado.data
    );
  }

  // 7. Modificar los datos de un producto (UPDATE).
  const idProductoAActualizar = 2;
  const datosActualizados = {
    title: "Pino",
    price: 2500,
    description: "El pino más lindo",
    category: "Planta",
    image:
      "https://thumbs.dreamstime.com/b/pino-%C3%A1rbol-solo-del-paisaje-verano-monta%C3%B1as-de-c%C3%A1rpatos-ucrania-105733179.jpg",
    rating: {
      rate: 5.5,
      count: 950
    }
  };

  const productoActualizado = await actualizarProducto(
    idProductoAActualizar,
    datosActualizados
  );
  if (!productoActualizado.ok) {
    console.log(
      `Falló la API al intentar actualizar un producto: ${productoActualizado.message}`
    );
  } else {
    console.log(
      `\nProducto actualizado con id ${idProductoAActualizar}:`,
      productoActualizado.data
    );
  }

  console.log("\n=== PRUEBA SISTEMA DE ARCHIVOS ===");
  console.log("¿El Archivo existe?", await existeArchivoProductos());

  // 1. Agregar producto al archivo local.
  const nuevoProductoLocal = {
    title: "Producto Local",
    price: 99.99,
    description: "Producto agregado localmente",
    category: "local",
    image: "https://ejemplo.com/imagen.jpg",
    rating: {
      rate: 10.5,
      count: 750,
    },
  };

  const productoAgregado = await agregarProductoLocal(nuevoProductoLocal);
  if (productoAgregado.ok) {
    console.log("Producto agregado localmente con éxito !");
  } else {
    console.log(
      `Error al intentar agregar el producto al archivo local: ${productoAgregado.message}`
    );
  }
   
  // Mostramos la info almacenada localmente antes de hacer la eliminación por una condición
  await mostrarProductosGuardados();
  
  
  // 2. Eliminar los productos superiores a un determinado valor.
  // eliminar productos con precio > $100
  const precioMaximo = 100;
  const eliminacion = await eliminarProductosPorPrecioMaximo(precioMaximo);
  if (eliminacion.ok) {
    console.log(
      `\nProductos superiores a $${precioMaximo} han sido eliminados con éxito !`
    );

    // Mostramos la info almacenada localmente luegi de hacer la eliminación
    await mostrarProductosGuardados();
  } else {
    console.log(
      `Error al intentar eliminar los productos: ${eliminacion.message}`
    );
  }
})();
