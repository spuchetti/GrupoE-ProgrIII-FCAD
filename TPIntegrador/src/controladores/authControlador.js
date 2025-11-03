import passport from "passport";
import jwt from "jsonwebtoken";
import { ErrorAuth } from "../errores/ErrorApp.js";

export class AuthControlador {
  login = (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, usuario, info) => {
      if (err) {
        return next(new ErrorAuth("Error en el proceso de autenticación"));
      }

      if (!usuario) {
        return next(new ErrorCredencialesInvalidas());
      }

      const tokenPayload = {
        usuario_id: usuario.usuario_id,
        nombre: usuario.nombre,
        tipo_usuario: usuario.tipo_usuario,
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

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
}
