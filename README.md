<!-- Encabezado principal con banner y badges -->
<h1 align="center">🎉 Sistema de Reservas de Salones - Grupo E 🎉</h1>

<p align="center">
  <strong>Facultad de Ciencias de la Administración – UNER</strong><br>
  <em>Materia: Programación III | Año: 2025</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black"/>
  <img src="https://img.shields.io/badge/License-Educativo-blue?style=for-the-badge"/>
</p>

---

## 👥 Grupo E - Integrantes

| Nombre | Rol |
|--------|-----|
| Sebastián Puchetti | Desarrollador Backend |
| Tomás Francisco Giménez Lascano | Desarrollador Backend |
| Daniel Hernández Torres | Desarrollador Backend |
| Emanuel Lencina | Desarrollador Backend |

---

## 📋 Descripción del Proyecto

Backend **RESTful** desarrollado con **Node.js**, **Express** y **MySQL** para gestionar un sistema completo de **reservas de salones de cumpleaños**.  

Incluye autenticación **JWT**, gestión de **usuarios**, **salones**, **servicios**, **turnos**, **reservas** y generación de **reportes automáticos** en PDF y CSV.

---

## 🚀 Características Principales

- 🔐 **Autenticación JWT** con Passport.js  
- 👥 **Sistema de roles:** Admin, Empleado, Cliente  
- 📧 **Notificaciones por correo automáticas**  
- 📊 **Reportes PDF y CSV**  
- ⚡ **Cache inteligente** con Apicache  
- 📚 **Documentación interactiva con Swagger**  
- 🛡️ **Validaciones robustas** con Express Validator  
- 🎨 **Plantillas HTML profesionales** para emails  
- 🗄️ **Base de datos MySQL** con stored procedures  

---

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js + Express 5  
- MySQL 8 (`mysql2/promise`)  
- Passport.js (Local y JWT strategies)  
- Express Validator  

### Utilidades
- Swagger UI – Documentación interactiva  
- Puppeteer – Generación de PDFs  
- Handlebars – Plantillas HTML  
- Nodemailer – Envío de correos  
- Apicache – Cache HTTP  
- Morgan – Logging estructurado  

---

## 📦 Dependencias Principales

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

## ⚙️ Configuración del Entorno

### 1️⃣ Variables de Entorno (`.env`)
```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=reservas_db

# JWT
JWT_SECRET=tu_clave_secreta_jwt_muy_segura

# Configuración de Email (Gmail)
EMAIL_USUARIO=tu_email@gmail.com
EMAIL_CLAVE=tu_app_password_gmail
```

⚠️ **Importante:**
- Usar App Password de Gmail (no contraseña normal)  
- Activar la verificación en 2 pasos  
- Generar App Password desde: [Google App Passwords](https://myaccount.google.com/apppasswords)

---

## 📞 Contacto y Soporte

🧾 **Repositorio:** [GitHub Grupo E](https://github.com/spuchetti/GrupoE-ProgrIII-FCAD)  
💻 **Materia:** Programación III – FCAD UNER  
📅 **Año:** 2025  

---

## 📄 Licencia

Proyecto desarrollado con fines educativos para la materia **Programación III**  
de la **Facultad de Ciencias de la Administración – UNER**.

<p align="center"> 💻 Desarrollado con ❤️ por el <strong>Grupo E</strong> – FCAD UNER </p>
