import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";
import { obtenerTipoUsuario } from "../helpers/formatoHelpers.js";
dotenv.config();

export class NotificacionesServicio {
  enviarCorreo = async (datosCorreo, usuarioCreador) => {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const plantillaPath = path.join(
        __dirname,
        "../utiles/handlebars/plantilla.hbs"
      );
      const plantilla = fs.readFileSync(plantillaPath, "utf-8");

      const template = handlebars.compile(plantilla);

      const datosReserva = datosCorreo[0]?.[0] || {};
      const correoAdmin = datosCorreo[1]?.[0]?.correoAdmin || "";

      const fechaValida = datosReserva.fecha
        ? new Date(datosReserva.fecha).toLocaleDateString("es-AR")
        : "Fecha no disponible";
      const datos = {
        fecha_reserva: fechaValida,
        salon: datosReserva.salon,
        turno: datosReserva.turno,
        creado_por: datosReserva?.nombre_completo,
        tipo_usuario: obtenerTipoUsuario(datosReserva?.tipo_usuario_reserva),
      };

      const correoHtml = template(datos);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USUARIO,
          pass: process.env.EMAIL_CLAVE,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Lógica para determinar destinatarios
      let destinatarios = correoAdmin;
      const tipo_usuario_creador = datosReserva.tipo_usuario_reserva;
      const correoUsuarioCreador = datosReserva.usuario_creador;

      if (tipo_usuario_creador === 3) {
        destinatarios = `${correoUsuarioCreador}, ${correoAdmin}`;
      }

      const mailOptions = {
        from: process.env.EMAIL_USUARIO,
        to: `${datosReserva.usuario_creador}, ${correoAdmin}`,
        subject: "Nueva Reserva Creada",
        html: correoHtml,
      };

      await transporter.sendMail(mailOptions);

      console.log(`✅ Correo enviado correctamente a: ${destinatarios}`);
      return true;
    } catch (error) {
      console.error("❌ Error al enviar el correo:", error);
      return false;
    }
  };

  enviarCorreoRestablecimiento = async (email, link) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USUARIO,
        pass: process.env.EMAIL_CLAVE,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USUARIO,
      to: email,
      subject: "Restablecimiento de contraseña - Sistema de Salones",
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Restablecer Contraseña</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p>Haz click en el siguiente enlace para establecer una nueva contraseña:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${link}" 
                       style="background-color: #667eea; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;
                              font-size: 16px; font-weight: bold;">
                        🔐 Establecer Nueva Contraseña
                    </a>
                </p>
                <p><strong>El enlace expira en 1 hora.</strong></p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    Sistema de Reservas de Salones de Cumpleaños
                </p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
  };
}
