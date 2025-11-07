import express from "express";
import { AuthControlador } from "../../controladores/authControlador.js";
import { validarLogin } from "../../middleware/validacionUsuarios.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const authControlador = new AuthControlador();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Formulario de login
router.get("/auth/login", (req, res) => {
  try {
    const htmlPath = path.join(
      __dirname,
      "../../utiles/handlebars/form-login.html"
    );

    if (!fs.existsSync(htmlPath)) {
      console.error("❌ Archivo no encontrado:", htmlPath);
      return res.status(404).send("Formulario no disponible");
    }

    let html = fs.readFileSync(htmlPath, "utf-8");
    res.send(html);
  } catch (error) {
    console.error("❌ Error cargando formulario login:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// (Formularios - Endpoints)

// Formulario para solicitar restablecimiento
router.get("/auth/restablecer", (req, res) => {
  try {
    const htmlPath = path.join(
      __dirname,
      "../../utiles/handlebars/form-solicitar-restablecer.html"
    );

    if (!fs.existsSync(htmlPath)) {
      console.error("❌ Archivo no encontrado:", htmlPath);
      return res.status(404).send("Formulario no disponible");
    }

    let html = fs.readFileSync(htmlPath, "utf-8");
    res.send(html);
  } catch (error) {
    console.error("❌ Error cargando formulario restablecimiento:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Formulario para ingresar nueva contraseña (con token)
router.get("/auth/nueva-contrasenia", (req, res) => {
  try {
    const { token } = req.query;
    const htmlPath = path.join(
      __dirname,
      "../../utiles/handlebars/form-restablecer.html"
    );

    if (!fs.existsSync(htmlPath)) {
      console.error("❌ Archivo no encontrado:", htmlPath);
      return res.status(404).send("Formulario no disponible");
    }

    let html = fs.readFileSync(htmlPath, "utf-8");

    if (token) {
      html = html.replace(/{{TOKEN}}/g, token);
    } else {
      html = html.replace(/{{TOKEN}}/g, "");
    }

    res.send(html);
  } catch (error) {
    console.error("❌ Error cargando formulario nueva contraseña:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// (API - endpoints)
router.post("/auth/login", validarLogin, authControlador.login);
router.post(
  "/auth/solicitar-restablecer",
  authControlador.solicitarRestablecer
);
router.post(
  "/auth/restablecer-contrasenia",
  authControlador.restablecerContrasenia
);

export { router };
