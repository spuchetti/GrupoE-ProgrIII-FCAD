import { Strategy as LocalStrategy } from "passport-local";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import dotenv from "dotenv";
import { UsuariosServicio } from "../servicios/usuariosServicio.js";
import { ErrorAuth } from "../errores/ErrorApp.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// ==================== ESTRATEGIA LOCAL ====================
const estrategiaLocal = new LocalStrategy(
    {
        usernameField: "nombre_usuario",
        passwordField: "contrasenia",
        session: false,
    },
    async (nombre_usuario, contrasenia, done) => {
        try {
            console.log("🔐 Validando usuario:", nombre_usuario);
            const usuarioServicio = new UsuariosServicio();
            const usuario = await usuarioServicio.buscar(nombre_usuario, contrasenia);

            if (!usuario) {
                console.log("❌ Credenciales inválidas para:", nombre_usuario);
                return done(new ErrorAuth("Credenciales inválidas"), false);
            }

            console.log("✅ Usuario autenticado:", usuario.usuario_id);
            return done(null, usuario);
        } catch (err) {
            console.error("💥 Error en autenticación local:", err);
            return done(err);
        }
    }
);

// ==================== ESTRATEGIA JWT ====================
const estrategiaJWT = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
        ignoreExpiration: false,
    },
    async (payload, done) => {
        try {
            console.log("🔍 Validando token JWT para usuario:", payload.usuario_id);

            if (!payload?.usuario_id) {
                return done(new ErrorAuth("Token inválido - estructura incorrecta"), false);
            }

            const usuarioServicio = new UsuariosServicio();
            const usuario = await usuarioServicio.buscarPorId(payload.usuario_id);

            if (!usuario) {
                return done(new ErrorAuth("Usuario no encontrado"), false);
            }

            console.log("✅ Token válido para usuario:", usuario.usuario_id);
            return done(null, usuario);
            
        } catch (err) {
            console.error("💥 Error en autenticación JWT:", err);
            return done(err);
        }
    }
);

export { estrategiaLocal, estrategiaJWT };