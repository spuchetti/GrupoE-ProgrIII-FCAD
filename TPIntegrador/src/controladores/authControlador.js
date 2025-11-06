import passport from "passport";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ErrorAuth, ErrorApp } from "../errores/ErrorApp.js";
import { UsuariosServicio } from "../servicios/usuariosServicio.js";
import { NotificacionesServicio } from "../servicios/notificacionesServicio.js";
import { TokenServicio } from "../servicios/tokenServicio.js";

export class AuthControlador {
  constructor() {
    this.usuariosServicio = new UsuariosServicio();
    this.notificaciones = new NotificacionesServicio();
    this.tokenServicio = new TokenServicio();
  }

  login = (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, usuario, info) => {
      if (err) {
        return next(new ErrorAuth("Error en el proceso de autenticación"));
      }

      if (!usuario) {
        return next(new ErrorCredencialesInvalidas());
      }

      const token = this.tokenServicio.generarTokenSesion(usuario);

      return res.json({
        estado: true,
        token: token,
        usuario: {
          usuario_id: usuario.usuario_id,
          nombre: usuario.nombre,
          tipo_usuario: usuario.tipo_usuario,
        },
      });
    })(req, res, next);
  };

  solicitarRestablecer = async (req, res, next) => {
    try {
      const { nombre_usuario } = req.body;

      const resultado = await this.usuariosServicio.solicitarRestablecimiento(nombre_usuario);

      if (resultado) {
        // Incluir el token en el link
        const restablecerLink = `http://localhost:${process.env.PUERTO}/api/v1/auth/restablecer?token=${resultado.token}`;
        // Enviar correo (si falla, no informamos al cliente si existe o no la cuenta)
        try {
          await this.notificaciones.enviarCorreoRestablecimiento(resultado.usuario.nombre_usuario, restablecerLink);
        } catch (err) {
          console.log("Error enviando correo de restablecimiento:", err);
        }
      }

      return res.json({
        estado: true,
        mensaje: "Si existe la cuenta, se envió un email para restablecer la contraseña",
      });
    } catch (err) {
      return next(new ErrorApp("Error al procesar la solicitud de restablecimiento"));
    }
  };

  // Mostrar formulario HTML para restablecer contraseña
  mostrarFormularioRestablecer = (req, res) => {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).send('<h1>Token no proporcionado</h1>');
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const htmlPath = path.join(__dirname, '../utiles/handlebars/form-restablecer.html');
    
    let html = fs.readFileSync(htmlPath, 'utf-8');
    html = html.replace('{{TOKEN}}', token);
    
    res.send(html);
  };

  restablecerContrasenia = async (req, res, next) => {
    try {
      const { token, contrasenia } = req.body;

      await this.usuariosServicio.resetearContrasenia(token, contrasenia);

      return res.json({ estado: true, mensaje: "Contraseña actualizada" });
    } catch (err) {
      return next(err);
    }
  };
}
