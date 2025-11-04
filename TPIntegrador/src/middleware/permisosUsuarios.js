import { ErrorPermisosInsuficientes } from '../errores/ErrorApp.js';

export default function autorizarUsuarios(perfilesAutorizados = []) {
    
    return (req, res, next) => {

        const usuario = req.user;

        if(!usuario || !perfilesAutorizados.includes(usuario.tipo_usuario)) {
            console.log(`🚫 Acceso denegado - Ruta: ${req.method} ${req.originalUrl}`);
            console.log(`   Usuario: ${usuario?.usuario_id}`);
            console.log(`   Tipo de usuario: ${usuario?.tipo_usuario}`);

            return next(new ErrorPermisosInsuficientes());
        }

        next(); // Tiene permisos, continua con el controlador
    }
}
