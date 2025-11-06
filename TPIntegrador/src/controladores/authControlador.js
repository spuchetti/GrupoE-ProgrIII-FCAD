import passport from "passport";
import {
  ErrorAuth,
  ErrorApp,
  ErrorCredencialesInvalidas,
} from "../errores/ErrorApp.js";
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

      console.log("🔐 Solicitud de restablecimiento para:", nombre_usuario);

      
      const resultado = await this.usuariosServicio.solicitarRestablecimiento(
        nombre_usuario
      );

      console.log(
        "📧 Resultado de solicitud:",
        resultado ? "Usuario encontrado" : "Usuario no encontrado"
      );

      if (resultado) {
        // Se incluye el token en el link
        const restablecerLink = `http://localhost:${process.env.PUERTO}/api/v1/auth/nueva-contrasenia?token=${resultado.token}`;

        console.log("📨 Enviando correo a:", resultado.usuario.nombre_usuario);
        console.log("🔗 Enlace:", restablecerLink);

        
        try {
          await this.notificaciones.enviarCorreoRestablecimiento(
            resultado.usuario.nombre_usuario,
            restablecerLink
          );
          console.log("✅ Correo enviado exitosamente");
        } catch (err) {
          console.log("❌ Error enviando correo de restablecimiento:", err);
        }
      }

      
      return res.json({
        estado: true,
        mensaje:
          "Si existe la cuenta, se envió un email para restablecer la contraseña",
      });
    } catch (err) {
      console.error("❌ Error en solicitarRestablecer:", err);
      return next(
        new ErrorApp("Error al procesar la solicitud de restablecimiento")
      );
    }
  };

  restablecerContrasenia = async (req, res, next) => {
    try {
      const { token, contrasenia } = req.body;

      console.log(
        "🔄 Procesando restablecimiento con token:",
        token ? `${token.substring(0, 20)}...` : "No proporcionado"
      );

     
      if (!token || !contrasenia) {
        return res.status(400).json({
          estado: false,
          mensaje: "Token y contraseña son requeridos",
        });
      }

      if (contrasenia.length < 6) {
        return res.status(400).json({
          estado: false,
          mensaje: "La contraseña debe tener al menos 6 caracteres",
        });
      }

      
      try {
        const actualizado = await this.usuariosServicio.resetearContrasenia(
          token,
          contrasenia
        );

        console.log("✅ Contraseña actualizada para usuario");

        return res.json({
          estado: true,
          mensaje: "Contraseña actualizada exitosamente",
        });
      } catch (tokenError) {
        console.error("❌ Error con token:", tokenError.message);

        if (
          tokenError.message.includes("Token inválido") ||
          tokenError.message.includes("ya usado")
        ) {
          return res.status(400).json({
            estado: false,
            mensaje: "Token inválido, expirado o ya utilizado",
          });
        }

        return res.status(400).json({
          estado: false,
          mensaje: tokenError.message || "Error al validar el token",
        });
      }
    } catch (err) {
      console.error("❌ Error en restablecerContrasenia:", err);
      return next(new ErrorApp("Error al restablecer la contraseña"));
    }
  };
}
