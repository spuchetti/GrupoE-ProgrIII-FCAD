DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_reserva`(
    IN p_fecha_reserva DATE,
    IN p_salon_id INT,
    IN p_usuario_id INT,
    IN p_turno_id INT,
    IN p_foto_cumpleaniero VARCHAR(255),
    IN p_tematica VARCHAR(255)
    -- QUITAR p_servicios del parámetro
)
BEGIN
    DECLARE v_importe_salon DECIMAL(10,2);
    DECLARE v_importe_total DECIMAL(10,2);
    DECLARE v_nueva_reserva_id INT;
    DECLARE v_disponible INT;
    DECLARE v_salon_activo INT;
    DECLARE v_turno_activo INT;
    DECLARE v_usuario_activo INT;
    
    -- 1. Validar que los recursos existan y estén activos
    SELECT COUNT(*) INTO v_salon_activo FROM salones WHERE salon_id = p_salon_id AND activo = 1;
    SELECT COUNT(*) INTO v_turno_activo FROM turnos WHERE turno_id = p_turno_id AND activo = 1;
    SELECT COUNT(*) INTO v_usuario_activo FROM usuarios WHERE usuario_id = p_usuario_id AND activo = 1;
    
    IF v_salon_activo = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El salón no existe o no está activo';
    END IF;
    
    IF v_turno_activo = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El turno no existe o no está activo';
    END IF;
    
    IF v_usuario_activo = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no existe o no está activo';
    END IF;
    
    -- 2. Validar fecha no sea en el pasado
    IF p_fecha_reserva < CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se pueden crear reservas en fechas pasadas';
    END IF;
    
    -- 3. Verificar disponibilidad
    SELECT COUNT(*) INTO v_disponible 
    FROM reservas 
    WHERE fecha_reserva = p_fecha_reserva 
    AND salon_id = p_salon_id 
    AND turno_id = p_turno_id
    AND activo = 1;
    
    IF v_disponible > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El salón no está disponible para esa fecha y turno';
    END IF;
    
    -- 4. Obtener importe del salón
    SELECT importe INTO v_importe_salon 
    FROM salones 
    WHERE salon_id = p_salon_id;
    
    IF v_importe_salon IS NULL THEN
        SET v_importe_salon = 0;
    END IF;
    
    -- 5. Insertar reserva SOLO con importe del salón
    INSERT INTO reservas (
        fecha_reserva, salon_id, usuario_id, turno_id, 
        foto_cumpleaniero, tematica, importe_salon, importe_total
    ) VALUES (
        p_fecha_reserva, p_salon_id, p_usuario_id, p_turno_id,
        p_foto_cumpleaniero, p_tematica, v_importe_salon, v_importe_salon
    );
    
    SET v_nueva_reserva_id = LAST_INSERT_ID();
    
    -- 6. Devolver el ID de la nueva reserva (SIN servicios)
    SELECT v_nueva_reserva_id AS nueva_reserva_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_reporte_reservas`(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    IN p_salon_id INT,
    IN p_usuario_id INT
)
BEGIN
    -- Aumentar límite de GROUP_CONCAT para evitar truncamiento
    SET SESSION group_concat_max_len = 1000000;
    
    SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.creado,
        
        -- Datos del salón
        s.salon_id,
        s.titulo AS salon_titulo,
        s.direccion AS salon_direccion,
        s.capacidad AS salon_capacidad,
        s.importe AS salon_importe_base,
        
        -- Datos del turno
        t.turno_id,
        t.orden AS turno_orden,
        t.hora_desde,
        t.hora_hasta,
        CONCAT(TIME_FORMAT(t.hora_desde, '%H:%i'), ' - ', TIME_FORMAT(t.hora_hasta, '%H:%i')) AS turno_formateado,
        
        -- Datos del usuario
        u.usuario_id,
        u.nombre AS usuario_nombre,
        u.apellido AS usuario_apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre_completo,
        u.nombre_usuario,
        u.celular,
        u.tipo_usuario,
        
        -- Servicios contratados (formato mejorado)
        (SELECT GROUP_CONCAT(
            CONCAT(serv.servicio_id, '|', serv.descripcion, '|', FORMAT(rs.importe, 2)) 
            SEPARATOR ';;'
         ) FROM reservas_servicios rs
         INNER JOIN servicios serv ON rs.servicio_id = serv.servicio_id
         WHERE rs.reserva_id = r.reserva_id) AS servicios_detallados,
         
        -- Servicios para display (formato legible)
        (SELECT GROUP_CONCAT(
            CONCAT(serv.descripcion, ' ($', FORMAT(rs.importe, 2), ')') 
            SEPARATOR '; '
         ) FROM reservas_servicios rs
         INNER JOIN servicios serv ON rs.servicio_id = serv.servicio_id
         WHERE rs.reserva_id = r.reserva_id) AS servicios_contratados,
         
        -- Total servicios (calculado desde tabla)
        COALESCE(
            (SELECT SUM(importe) FROM reservas_servicios WHERE reserva_id = r.reserva_id), 
            0
        ) AS total_servicios,
        
        -- Cantidad de servicios
        (SELECT COUNT(*) FROM reservas_servicios WHERE reserva_id = r.reserva_id) AS cantidad_servicios,
        
        -- Verificación de datos
        CASE 
            WHEN r.importe_total IS NULL THEN 'PENDIENTE'
            WHEN r.importe_total = 0 THEN 'GRATUITA'
            ELSE 'CONFIRMADA'
        END AS estado_reserva
        
    FROM reservas r
    INNER JOIN salones s ON r.salon_id = s.salon_id AND s.activo = 1
    INNER JOIN turnos t ON r.turno_id = t.turno_id AND t.activo = 1
    INNER JOIN usuarios u ON r.usuario_id = u.usuario_id AND u.activo = 1
    WHERE r.activo = 1
    AND (p_fecha_inicio IS NULL OR r.fecha_reserva >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR r.fecha_reserva <= p_fecha_fin)
    AND (p_salon_id IS NULL OR r.salon_id = p_salon_id)
    AND (p_usuario_id IS NULL OR r.usuario_id = p_usuario_id)
    ORDER BY r.fecha_reserva DESC, r.creado DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_reserva_completa`(IN p_reserva_id INT)
BEGIN
    SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.foto_cumpleaniero,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.activo,
        r.creado,
        r.modificado,
        
        -- Datos del salón
        s.salon_id,
        s.titulo AS salon_titulo,
        s.direccion AS salon_direccion,
        s.capacidad AS salon_capacidad,
        
        -- Datos del turno
        t.turno_id,
        t.orden AS turno_orden,
        t.hora_desde,
        t.hora_hasta,
        
        -- Datos del usuario
        u.usuario_id,
        u.nombre,
        u.apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre_completo,
        u.nombre_usuario,
        u.celular,
        u.tipo_usuario,
        
        -- Servicios contratados
        (SELECT GROUP_CONCAT(
            CONCAT(serv.descripcion, ' ($', FORMAT(rs.importe, 2), ')') 
            SEPARATOR '; '
         ) FROM reservas_servicios rs
         INNER JOIN servicios serv ON rs.servicio_id = serv.servicio_id
         WHERE rs.reserva_id = r.reserva_id) AS servicios_contratados,
         
        -- Total servicios
        COALESCE(
            (SELECT SUM(importe) FROM reservas_servicios WHERE reserva_id = r.reserva_id), 
            0
        ) AS total_servicios
        
    FROM reservas r
    INNER JOIN salones s ON r.salon_id = s.salon_id
    INNER JOIN turnos t ON r.turno_id = t.turno_id  
    INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
    WHERE r.reserva_id = p_reserva_id AND r.activo = 1;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_reservas_usuario`(IN p_usuario_id INT)
BEGIN
    SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.foto_cumpleaniero,
        r.tematica,
        r.importe_total,
        r.creado,
        s.titulo as salon_titulo,
        CONCAT(TIME_FORMAT(t.hora_desde, '%H:%i'), ' a ', TIME_FORMAT(t.hora_hasta, '%H:%i')) as turno_descripcion,
        u.nombre as usuario_nombre
    FROM reservas r
    JOIN salones s ON r.salon_id = s.salon_id
    JOIN turnos t ON r.turno_id = t.turno_id
    JOIN usuarios u ON r.usuario_id = u.usuario_id
    WHERE r.activo = 1 AND r.usuario_id = p_usuario_id
    ORDER BY r.fecha_reserva DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtenerDatosNotificacion`(IN p_reserva_id INT)
BEGIN
    --  Datos de la reserva y del usuario que la hizo (INCLUYENDO EMAIL)
    SELECT 
        r.fecha_reserva AS fecha,
        s.titulo AS salon,
        CONCAT(t.orden, ' - ', TIME_FORMAT(t.hora_desde, '%H:%i'), ' a ', TIME_FORMAT(t.hora_hasta, '%H:%i')) AS turno,
        u.nombre_usuario AS usuario,
        CONCAT(u.nombre, ' ', u.apellido) AS nombre_completo,
        u.tipo_usuario AS tipo_usuario_reserva
    FROM reservas r
    INNER JOIN usuarios u ON u.usuario_id = r.usuario_id
    INNER JOIN salones s ON s.salon_id = r.salon_id
    INNER JOIN turnos t ON t.turno_id = r.turno_id
    WHERE r.reserva_id = p_reserva_id;
	
   
    
    
	SELECT 'grupoe.progr3.fcad@gmail.com' AS correoAdmin;
     /*
		
		Obtener TODOS los correos de administradores activos (COMO DEBERIA SER)
		SELECT nombre_usuario AS correoAdmin 
		FROM usuarios 
		WHERE tipo_usuario = 1 AND activo = 1;
        
    */
    
END$$
DELIMITER ;
