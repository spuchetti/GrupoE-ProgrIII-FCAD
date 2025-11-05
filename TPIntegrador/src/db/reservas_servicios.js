import { conexion } from "../config/conexion.js";

export class ReservasServicios {
    
    crear = async(reserva_id, servicios) => {
        try {
            await conexion.beginTransaction();

            let totalServicios = 0;

            // Insertamos los servicios y calculamos los totales
            for (const servicio of servicios){
                const sql = `INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) 
                    VALUES (?,?,?);`;
                await conexion.execute(sql, [reserva_id, servicio.servicio_id, servicio.importe]);
                
                totalServicios += parseFloat(servicio.importe);
            }

            // Obtener el importe del salón
            const [salonResult] = await conexion.execute(
                `SELECT importe_salon FROM reservas WHERE reserva_id = ?`,
                [reserva_id]
            );
            
            const importeSalon = parseFloat(salonResult[0].importe_salon) || 0;

            // Calculamos y actualizamos importe_total
            const importeTotal = importeSalon + totalServicios;
            
            await conexion.execute(
                `UPDATE reservas SET importe_total = ? WHERE reserva_id = ?`,
                [importeTotal, reserva_id]
            );

            await conexion.commit();
            return true;

        } catch(error) {
            await conexion.rollback();
            console.error(`Error en reservas_servicios.crear: ${error}`);
            return false;
        }
    }
}