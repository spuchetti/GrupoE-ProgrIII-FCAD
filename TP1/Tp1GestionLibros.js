let libros = [
    {
        id:2,
        nombre: "El Quijote",
        autor: "Miguel de Cervantes",
        precio: 1000,
        stock: 10
    },
    {
        id: 3,
        nombre: "Rayuela",
        autor: "Julio Cortázar",
        precio: 1200,
        stock: 3
    },
    {
        id: 4,
        nombre: "El Aleph",
        autor: "Jorge Luis Borges",
        precio: 1500,
        stock: 5
    },
    {
        id: 5,
        nombre: "Martín Fierro",
        autor: "José Hernández",
        precio: 1800,
        stock: 0
    },
    {
        id: 6,
        nombre: "Don Segundo Sombra",
        autor: "Ricardo Güiraldes",
        precio: 2000,
        stock: 8
    }
];

console.log("#####\tBDD de Libros\t#####");
console.log("Estado actual:");
console.table(libros);

// 2) OPERACIONES BÁSICAS Y ACCESO DE DATOS
const cantidadLibros = libros.length;
console.log(`Cantidad de libros disponibles: ${cantidadLibros}`);

const segundoLibro = libros[1].nombre;
console.log(`Nombre del segundo libro: ${segundoLibro}`);

const cuartoLibro = libros[3].nombre;
console.log(`Nombre del cuarto libro: ${cuartoLibro}`);

// 3) RECORRIDOS DE DATOS
console.log("\nListado de libros");
console.log('='.repeat(20));

// a)
console.log("Recorriendo el array de libros con for of:");
for(let libro of libros){
    console.log(`Nombre: ${libro.nombre}
Precio: $${libro.precio}\n`)
}

// b)
console.log("Recorriendo el array de libros con forEach:");
libros.forEach(libro =>{
    console.log(`Nombre: ${libro.nombre}, Precio: $${libro.precio}`)
})

// 4) MANIPULACION DE DATOS
// a) Agregar dos elementos al final del array
libros.push({
    id: 7,
    nombre: "Cien años de soledad",
    autor: "Gabriel García Márquez",
    precio: 2200,
    stock: 0
},
{
    id: 8,
    nombre: "El túnel",
    autor: "Ernesto Sabato",
    precio: 2400,
    stock: 7
});

console.log("\nSe agregaron dos libros al final del array...");
console.log(libros[libros.length - 2]);
console.log(libros[libros.length - 1]);


// b) Eliminar el ultimo elemento del array
console.log("\nSe eliminó el último libro del array...");
console.log(libros.pop());

// c) Agregar un elemento al inicio del array
libros.unshift({
    id: 1,
    nombre: "El matadero",
    autor: "Esteban Echeverría",
    precio: 800,
    stock: 5
});

console.log("\nSe agregó un libro al inicio del array...");
console.log(libros[0]);

// d) Elimina el primer elemento del array
console.log("\nSe eliminó el primer libro del array...");
console.log(libros.shift());

console.log("\n#####\tBDD de Libros\t#####");

// e) Libros con Stock
console.log("\nLibros con stock disponible:");
let librosConStock = libros.filter(libro => libro.stock > 0);
console.table(librosConStock);

// f) Nombres de los todos los libros
const nombresLibros = libros.map(libro => libro.nombre);
console.log("\nNombres de todos los libros:");
console.log(nombresLibros);

// g) Buscar un libro
const idBuscar = 2;
const LibroEncontrado = libros.find(libro => libro.id === idBuscar);
if (LibroEncontrado) {
    console.log(`\nLibro encontrado con ID: ${idBuscar}`);
    console.log(LibroEncontrado);
}else {
    console.log(`\nNo se encontró nigún libro con ID: ${idBuscar}`);
}

// h) Libros ordenados de manera decreciente
const copiaLibros = libros.slice();
const librosOrdenados = copiaLibros.sort((a, b) => b.precio - a.precio);
console.log("\nLibros ordenados de manera decreciente por precio:");
console.table(librosOrdenados);


console.log("\nEstado actual:");
console.table(libros);
