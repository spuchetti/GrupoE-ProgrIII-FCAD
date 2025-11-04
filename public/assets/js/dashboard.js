let salones = [];

const elementoCarga = document.getElementById('loading');
const loginOverlay = document.getElementById('login-overlay');
const dashboardContent = document.getElementById('dashboard-content');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const loginSubmitBtn = document.getElementById('login-submit-btn');

const headerEl = document.querySelector('header');

// Función para mostrar el dashboard después del login
function mostrarDashboard() {
    loginOverlay.classList.add('hidden');
    dashboardContent.classList.remove('hidden');
    headerEl.classList.remove('hidden');
    // Mostrar botones de administración
    const installBtn = document.getElementById('install-sps-btn');
    const reporteBtn = document.getElementById('generar-reporte-btn');
    const logoutBtn = document.getElementById('logout-btn');
    if (installBtn) installBtn.style.display = 'block';
    if (reporteBtn) reporteBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'block';
    // Cargar datos del dashboard
    cargarDatos();
}

// Función para ocultar el dashboard y mostrar login
function ocultarDashboard() {
    loginOverlay.classList.remove('hidden');
    dashboardContent.classList.add('hidden');
    headerEl.classList.add('hidden');
    // Ocultar botones de administración
    const installBtn = document.getElementById('install-sps-btn');
    const reporteBtn = document.getElementById('generar-reporte-btn');
    const logoutBtn = document.getElementById('logout-btn');
    if (installBtn) installBtn.style.display = 'none';
    if (reporteBtn) reporteBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    // Limpiar formulario de login
    document.getElementById('login-usuario').value = '';
    document.getElementById('login-password').value = '';
    loginError.classList.remove('visible');
}

// Verificar si hay un token guardado al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    // Asegurar que el dashboard esté oculto por defecto
    dashboardContent.classList.add('hidden');
    headerEl.classList.add('hidden');
    
    const token = localStorage.getItem('admin_token');
    if (token) {
        // Si hay token, mostrar dashboard
        mostrarDashboard();
    } else {
        // Si no hay token, mostrar solo login
        ocultarDashboard();
    }
});

// Manejar el submit del formulario de login
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const usuario = document.getElementById('login-usuario').value;
    const password = document.getElementById('login-password').value;

    if (!usuario || !password) {
        mostrarError('Por favor, completa todos los campos');
        return;
    }

    try {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = 'Ingresando...';
        loginError.classList.remove('visible');

        const resp = await fetch('/api/v1/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.mensaje || err.message || 'Error al iniciar sesión');
        }

        const body = await resp.json();
        const token = body.token;
        localStorage.setItem('admin_token', token);

        // Mostrar dashboard
        mostrarDashboard();

    } catch (err) {
        console.error(err);
        mostrarError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = 'Ingresar';
    }
});

function mostrarError(mensaje) {
    loginError.textContent = mensaje;
    loginError.classList.add('visible');
}

// Cargar datos del dashboard
async function cargarDatos() {
    try {
        elementoCarga.classList.add('visible');

        const response = await fetch('/api/v1/salones');

        if (!response.ok) {
            throw new Error('Error al cargar datos');
        }

        const data = await response.json();
        salones = data.datos;

        actualizarEstadisticas();
        actualizarTabla();
        crearGraficos();

    } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar datos. Verifica la conexión.');
    } finally {
        elementoCarga.classList.remove('visible');
    }
}

function actualizarEstadisticas() {
    // Total de salones
    document.getElementById('total-salones').textContent = salones.length;

    // Capacidad total
    const totalCapacidad = salones.reduce((suma, salon) => suma + (parseInt(salon.capacidad) || 0), 0);
    document.getElementById('total-capacidad').textContent = totalCapacidad;

    // Importe promedio
    const totalImporte = salones.reduce((suma, salon) => {
        const importe = parseFloat(salon.importe) || 0;
        return suma + importe;
    }, 0);
    const importePromedio = salones.length > 0 ? totalImporte / salones.length : 0;
    document.getElementById('promedio-importe').textContent = `$${importePromedio.toFixed(2)}`;

    // Capacidad promedio
    const capacidadPromedio = salones.length > 0 ? totalCapacidad / salones.length : 0;
    document.getElementById('promedio-capacidad').textContent = Math.round(capacidadPromedio);
}

// Actualizar tabla de salones
function actualizarTabla() {
    const cuerpoTabla = document.querySelector('#salones-table tbody');
    cuerpoTabla.innerHTML = '';

    salones.forEach(salon => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${salon.salon_id}</td>
            <td>${salon.titulo}</td>
            <td>${salon.direccion}</td>
            <td>${salon.capacidad}</td>
            <td>$${salon.importe}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

function crearGraficos() {
    // Gráfico de capacidades
    const ctxCapacidad = document.getElementById('capacidad-chart').getContext('2d');
    const capacidades = salones.map(salon => salon.capacidad);

    new Chart(ctxCapacidad, {
        type: 'bar',
        data: {
            labels: salones.map(salon => salon.titulo),
            datasets: [{
                label: 'Capacidad',
                data: capacidades,
                backgroundColor: 'rgba(173, 216, 230, 0.7)',
                borderColor: 'rgba(135, 206, 250, 0.8)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });

    // Gráfico de precios
    const ctxPrecio = document.getElementById('precio-chart').getContext('2d');
    const precios = salones.map(salon => salon.importe);

    new Chart(ctxPrecio, {
        type: 'line',
        data: {
            labels: salones.map(salon => salon.titulo),
            datasets: [{
                label: 'Precio ($)',
                data: precios,
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1,
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointStyle: 'circle'
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// ---------------- ADMIN  -----------------
const adminLoginBtn = document.getElementById('admin-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const installSpsBtn = document.getElementById('install-sps-btn');
const generarReporteBtn = document.getElementById('generar-reporte-btn');
const adminStatus = document.getElementById('admin-status');
const reporteFiltros = document.getElementById('reporte-filtros');
const runReporteBtn = document.getElementById('run-reporte');
const reporteResult = document.getElementById('reporte-result');
const reporteContenido = document.getElementById('reporte-contenido');

// Asegurar que el botón de login antiguo esté siempre oculto
if (adminLoginBtn) { adminLoginBtn.style.display = 'none'; }

// Botón de cerrar sesión
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            localStorage.removeItem('admin_token');
            document.getElementById('login-usuario').value = '';
            document.getElementById('login-password').value = '';
            loginError.classList.remove('visible');
            ocultarDashboard();
        }
    });
}

// Mantener oculto el botón de login antiguo (compatibilidad)
if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', async () => {
        const usuario = prompt('Usuario administrador:', 'admin');
        if (!usuario) return;
        const password = prompt('Contraseña:', '');
        if (!password) return;

        try {
            const resp = await fetch('/api/v1/admin/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario, password })
            });
            if (!resp.ok) { const err = await resp.json().catch(() => ({})); alert('Login falló: ' + (err.mensaje || err.message || resp.statusText)); return; }
            const body = await resp.json();
            const token = body.token; localStorage.setItem('admin_token', token);
            alert('Conectado como admin');
            installSpsBtn.style.display = 'block'; generarReporteBtn.style.display = 'block'; generarReporteBtn.focus();
        } catch (err) { console.error(err); alert('Error en login admin'); }
    });
}

// Mostrar panel de filtros cuando se pulsa el botón generar reporte
generarReporteBtn.addEventListener('click', () => {
    const token = localStorage.getItem('admin_token');
    if (!token) { alert('No estás autenticado como admin'); return; }
    reporteFiltros.style.display = 'flex';
    runReporteBtn.style.display = 'inline-block';
    runReporteBtn.focus();
});

installSpsBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) { alert('No estás autenticado como admin'); return; }
    if (!confirm('¿Instalar/Actualizar los procedimientos almacenados en la base de datos?')) return;
    try {
        installSpsBtn.disabled = true; const prevText = installSpsBtn.textContent; installSpsBtn.textContent = 'Instalando...';
        const resp = await fetch('/api/v1/admin/instalar-sps', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } });
        const data = await resp.json(); if (!resp.ok) throw new Error(data.mensaje || 'Error desconocido');
        alert(data.mensaje || 'SPs instalados/actualizados correctamente'); installSpsBtn.textContent = prevText;
    } catch (err) { console.error(err); alert('Hubo un error: ' + (err.message || err)); }
    finally { installSpsBtn.disabled = false; }
});

// Ejecutar reporte con filtros
runReporteBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) { alert('No estás autenticado como admin'); return; }

    const f_inicio = document.getElementById('f_inicio').value || '';
    const f_fin = document.getElementById('f_fin').value || '';
    const f_salon = document.getElementById('f_salon').value || '';
    const f_usuario = document.getElementById('f_usuario').value || '';

    const params = new URLSearchParams();
    if (f_inicio) params.append('fecha_inicio', f_inicio);
    if (f_fin) params.append('fecha_fin', f_fin);
    if (f_salon) params.append('salon_id', f_salon);
    if (f_usuario) params.append('usuario_id', f_usuario);

    try {
        runReporteBtn.disabled = true; const prevText = runReporteBtn.textContent; runReporteBtn.textContent = 'Generando...';
        const resp = await fetch('/api/v1/admin/reporte-reservas?' + params.toString(), { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } });
        const data = await resp.json(); if (!resp.ok) throw new Error(data.mensaje || 'Error generando informe');

        const resultados = data.datos || [];
        if (resultados.length === 0) { reporteContenido.innerHTML = '<p>No se encontraron registros para los filtros seleccionados.</p>'; }
        else {
            const formatCellValue = (key, val) => {
                if (val === null || val === undefined) return '';
                const lower = String(key).toLowerCase();
                if (lower.includes('importe') || lower.includes('total') || lower.includes('precio')) { const num = Number(val); if (!Number.isNaN(num)) return '$' + num.toFixed(2); }
                if (lower.includes('fecha')) { try { const d = new Date(val); if (!isNaN(d)) { return d.toISOString().slice(0, 10); } } catch (e) {} }
                return String(val);
            };

            const wrapper = document.createElement('div'); wrapper.className = 'table-responsive';
            const tabla = document.createElement('table'); tabla.className = 'report-table';
            const thead = document.createElement('thead'); const tbody = document.createElement('tbody');

            const keys = Object.keys(resultados[0]);
            const fechaKey = keys.find(k => k.toLowerCase().includes('fecha'));
            if (fechaKey) { resultados.sort((a, b) => { const da = new Date(a[fechaKey]); const db = new Date(b[fechaKey]); return db - da; }); }

            const trHead = document.createElement('tr');
            keys.forEach(k => { const th = document.createElement('th'); th.textContent = k; trHead.appendChild(th); });
            thead.appendChild(trHead);

            resultados.forEach(row => {
                const tr = document.createElement('tr');
                keys.forEach(k => { const td = document.createElement('td'); td.textContent = formatCellValue(k, row[k]); tr.appendChild(td); });
                tbody.appendChild(tr);
            });

            tabla.appendChild(thead); tabla.appendChild(tbody); wrapper.appendChild(tabla);

            const toCsvValue = (v) => { if (v === null || v === undefined) return ''; const s = String(v).replace(/"/g, '""'); return '"' + s + '"'; };
            const csvKeys = keys; const csvRows = resultados.map(r => csvKeys.map(k => formatCellValue(k, r[k])).map(toCsvValue).join(','));
            const header = csvKeys.map(k => '"' + String(k).replace(/"/g, '""') + '"').join(',');
            const csvContent = [header].concat(csvRows).join('\r\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const fname = `informe_reservas_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.csv`;
            a.href = url; a.download = fname; document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            reporteContenido.innerHTML = `<p>Se inició la descarga del informe: <strong>${fname}</strong></p>` +
                `<p>Si la descarga no comienza automáticamente, <a id="csv-link" href="${url}" download="${fname}">haz clic aquí</a></p>`;
        }

        setTimeout(() => {
            const sidebar = document.getElementById('report-sidebar');
            if (sidebar && sidebar.style.display === 'block') { sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            else { document.getElementById('reporte-result').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        }, 80);
        alert('Informe generado');
        runReporteBtn.textContent = prevText;
    } catch (err) {
        console.error(err); alert('Error al generar informe: ' + (err.message || err));
    } finally { runReporteBtn.disabled = false; }
});

// Lógica para cerrar la barra lateral de informe
const overlayEl = document.getElementById('report-overlay');
const sidebarCloseBtn = document.getElementById('close-report-sidebar');
const sidebarEl = document.getElementById('report-sidebar');
const closeSidebar = () => { if (overlayEl) overlayEl.style.display = 'none'; if (sidebarEl) sidebarEl.style.display = 'none'; };
if (overlayEl) overlayEl.addEventListener('click', closeSidebar);
if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);


