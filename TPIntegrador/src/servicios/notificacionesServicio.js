import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';

dotenv.config();

export class NotificacionesServicio {

    enviarCorreo = async (datosCorreo) => {  
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const plantillaPath = path.join(__dirname, '../utiles/handlebars/plantilla.hbs');
            const plantilla = fs.readFileSync(plantillaPath, 'utf-8');

            const template = handlebars.compile(plantilla);

            const datosReserva = datosCorreo[0]?.[0] || {};
            const correoAdmin = datosCorreo[1]?.[0]?.correoAdmin || "";

            const fechaValida = datosReserva.fecha
                ? new Date(datosReserva.fecha).toLocaleDateString("es-AR")
                : "Fecha no disponible";
            const datos = {
                fecha_reserva: fechaValida,
                salon: datosReserva.salon || "Sin salón",
                turno: datosReserva.turno || "Sin turno",
            };

            const correoHtml = template(datos);
        
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: process.env.EMAIL_USUARIO,
                pass: process.env.EMAIL_CLAVE
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });


            const mailOptions = {
                from: process.env.EMAIL_USUARIO,
                to: `${process.env.EMAIL_DESTINATARIOS},${correoAdmin}`,
                subject: "Nueva Reserva Creada",
                html: correoHtml,
            };
        
            await transporter.sendMail(mailOptions);

            console.log(
                `✅ Correo enviado correctamente a: ${process.env.EMAIL_DESTINATARIOS}`
            );
            return true;
            } catch (error) {
                console.error("❌ Error al enviar el correo:", error);
            return false;
        }
    };
}