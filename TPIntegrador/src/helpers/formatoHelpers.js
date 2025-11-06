/**
 * Para centralizar el formateo de datos en toda la aplicación
 */

// Formatea importes numéricos
export const formatearImporte = (importe) => {
    const numero = parseFloat(importe) || 0;
    return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
};

// Formatea importes con símbolo de moneda
export const formatearMoneda = (importe) => {
    return `$${formatearImporte(importe)}`;
};

// Formatea fechas
export const formatearFecha = (fecha, incluirHora = false) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    
    if (incluirHora) {
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    
    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

// Formatea horas
export const formatearHora = (hora) => {
    if (!hora) return "N/A";
    const [horas, minutos] = hora.split(':');
    return `${horas}:${minutos}`;
};

// Obtiene el rol segun el tipo de usuario
export const obtenerTipoUsuario = (tipo) => {
        const tipos = {
            1: "Administrador",
            2: "Empleado", 
            3: "Cliente"
        };
        return tipos[tipo];
    };