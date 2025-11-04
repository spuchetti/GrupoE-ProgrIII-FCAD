# Presentación del Grupo E
**Materia:** Programación III  
**Carrera:** Facultad de Ciencias de la Administración – UNER  
**Año:** 2025  
**Grupo:** E

---

## 👥 Integrantes

- **Sebastián Puchetti**  
- **Tomás Francisco Giménez Lascano**  
- **Daniel Hernández Torres**  
- **Juan Ignacio Zacca**  
- **Natalia Catalina Gonnet**  
- **Emanuel Lencina**

---

💻 Este repositorio contiene los trabajos prácticos y desarrollos realizados por el **Grupo E** en la materia **Programación III**.

# Sistema de Reservas

Backend RESTful desarrollado con **Node.js**, **Express** y **MySQL** para gestionar autenticación, usuarios, salones, servicios, turnos y reservas. Maneja errores centralizados y autenticación con **JWT** (Passport.js).

---

## 🚀 Tecnologías principales

- Node.js + Express 5  
- MySQL 8 (mysql2)  
- Passport.js (Local y JWT)  
- Swagger UI (documentación)  
- Puppeteer (generación de PDFs)  
- Handlebars (plantillas de correo)  
- Nodemailer (envío de emails)  
- Express Validator (validaciones)  
- Apicache (cacheo de respuestas)

---

## 📦 Dependencias

```json
{
    "apicache": "^1.6.3",
    "csv-writer": "^1.6.0",
    "dotenv": "^17.2.2",
    "express": "^5.1.0",
    "express-validator": "^7.2.1",
    "handlebars": "^4.7.8",
    "js-yaml": "^4.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.1",
    "mysql2": "^3.14.5",
    "nodemailer": "^7.0.6",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "puppeteer": "^24.27.0",
    "swagger-ui-express": "^5.0.1"
}
```

---

⚙️ Configuración del entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=reservas_db

# JWT
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES=1d

# Correo
MAIL_HOST=smtp.tucorreo.com
MAIL_PORT=587
MAIL_USER=usuario@correo.com
MAIL_PASS=tu_password
```

---

## 🧩 Estructura de rutas

Todas las rutas usan el prefijo `/api/v1`.

| Módulo   | Ruta base            | Autenticación requerida | Descripción                         |
|----------|----------------------|-------------------------|-------------------------------------|
| Auth     | /api/v1/auth         | ❌ No                   | Registro, login y manejo de tokens  |
| Salones  | /api/v1/salones      | ❌ No                   | Consulta de salones disponibles     |
| Servicios| /api/v1/servicios    | ❌ No                   | Listado y detalles de servicios     |
| Turnos   | /api/v1/turnos       | ❌ No                   | Consulta y gestión de turnos        |
| Reservas | /api/v1/reservas     | ✅ Sí (JWT)             | CRUD de reservas por usuario        |
| Usuarios | /api/v1/usuarios     | ✅ Sí (JWT)             | Administración de usuarios          |

---

## 🧱 Middlewares

- passport.authenticate('jwt') → Protege rutas que requieren token.  
- rutaNoEncontrada → Captura rutas inexistentes (404).  
- manejadorErrores → Middleware centralizado para manejo de errores.

---

## ⚡ Instalación paso a paso

1. Clonar el repositorio

```bash
git clone https://github.com/spuchetti/GrupoE-ProgrIII-FCAD/tree/main/TPIntegrador
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar variables de entorno

Crear el archivo `.env` como se indicó arriba y ajustar los valores.

4. Crear la base de datos

5. Ejecutar en modo desarrollo

```bash
npm run dev
```

El servidor se ejecuta por defecto en: http://localhost:3000

6. Ejecutar en modo producción

```bash
npm start
```

---

## 🧠 Ejemplo de uso

Autenticación (Login):

Request:
```http
POST /api/v1/login
Content-Type: application/json

{
    "email": "usuario@example.com",
    "password": "123456"
}
```

Respuesta:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

Usar el token en el header:
Authorization: Bearer <token>

---

## 🧰 Scripts disponibles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start

```

---

## 📘 Documentación API

La documentación Swagger está disponible en:

http://localhost:3000/api-docs

Implementada con swagger-ui-express.