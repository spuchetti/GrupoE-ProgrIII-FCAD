import passport from "passport";
import jwt from "jsonwebtoken";
import { ErrorAuth, ErrorApp } from "../errores/ErrorApp.js";
import { UsuariosServicio } from "../servicios/usuariosServicio.js";
import { NotificacionesServicio } from "../servicios/notificacionesServicio.js";

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

  solicitarRestablecer = async (req, res, next) => {
    try {
      const { nombre_usuario } = req.body;
      const usuariosServicio = new UsuariosServicio();
      const notificaciones = new NotificacionesServicio();

      const resultado = await usuariosServicio.solicitarRestablecimiento(nombre_usuario);

      if (resultado) {
        // Incluir el token en el link
        const restablecerLink = `http://localhost:${process.env.PUERTO}/api/v1/auth/restablecer?token=${resultado.token}`;
        // Enviar correo (si falla, no informamos al cliente si existe o no la cuenta)
        try {
          await notificaciones.enviarCorreoRestablecimiento(resultado.usuario.nombre_usuario, restablecerLink);
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

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecer Contraseña</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 100%;
          }
          h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
          }
          p {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
            font-size: 14px;
          }
          input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e1e1;
            border-radius: 5px;
            font-size: 14px;
            transition: border-color 0.3s;
          }
          input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
          }
          button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }
          button:hover {
            transform: translateY(-2px);
          }
          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          .mensaje {
            margin-top: 20px;
            padding: 12px;
            border-radius: 5px;
            font-size: 14px;
            display: none;
          }
          .mensaje.exito {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }
          .mensaje.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Restablecer Contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
          
          <form id="formRestablecer">
            <div class="form-group">
              <label for="contrasenia">Nueva Contraseña:</label>
              <input type="password" id="contrasenia" name="contrasenia" required minlength="6">
            </div>
            
            <div class="form-group">
              <label for="confirmarContrasenia">Confirmar Contraseña:</label>
              <input type="password" id="confirmarContrasenia" name="confirmarContrasenia" required minlength="6">
            </div>
            
            <button type="submit" id="btnRestablecer">Restablecer Contraseña</button>
          </form>
          
          <div id="mensaje" class="mensaje"></div>
        </div>

        <script>
          const form = document.getElementById('formRestablecer');
          const btnRestablecer = document.getElementById('btnRestablecer');
          const mensaje = document.getElementById('mensaje');
          const token = '${token}';

          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const contrasenia = document.getElementById('contrasenia').value;
            const confirmarContrasenia = document.getElementById('confirmarContrasenia').value;
            
            if (contrasenia !== confirmarContrasenia) {
              mostrarMensaje('Las contraseñas no coinciden', 'error');
              return;
            }
            
            if (contrasenia.length < 6) {
              mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
              return;
            }
            
            btnRestablecer.disabled = true;
            btnRestablecer.textContent = 'Procesando...';
            
            try {
              const response = await fetch('/api/v1/auth/restablecer-contrasenia', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  token: token,
                  contrasenia: contrasenia
                })
              });
              
              const data = await response.json();
              
              if (response.ok && data.estado) {
                mostrarMensaje('¡Contraseña actualizada exitosamente! Puedes cerrar esta ventana.', 'exito');
                form.reset();
              } else {
                mostrarMensaje(data.mensaje || 'Error al restablecer la contraseña', 'error');
                btnRestablecer.disabled = false;
                btnRestablecer.textContent = 'Restablecer Contraseña';
              }
            } catch (error) {
              mostrarMensaje('Error de conexión. Intenta nuevamente.', 'error');
              btnRestablecer.disabled = false;
              btnRestablecer.textContent = 'Restablecer Contraseña';
            }
          });
          
          function mostrarMensaje(texto, tipo) {
            mensaje.textContent = texto;
            mensaje.className = 'mensaje ' + tipo;
            mensaje.style.display = 'block';
          }
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
  };

  restablecerContrasenia = async (req, res, next) => {
    try {
      const { token, contrasenia } = req.body;
      const usuariosServicio = new UsuariosServicio();

      await usuariosServicio.resetearContrasenia(token, contrasenia);

      return res.json({ estado: true, mensaje: "Contraseña actualizada" });
    } catch (err) {
      return next(err);
    }
  };
}
