/**
 * session_guard.js - Proteger páginas administrativas
 * Incluir este archivo en páginas que requieran autenticación
 */

class SessionGuard {
    constructor() {
        this.checkSession();
        this.setupPeriodicCheck();
    }

    async checkSession() {
        try {
            const response = await fetch('Backend/routes/check_session.php');
            const data = await response.json();
            
            if (!data.logged_in) {
                // No hay sesión activa, redirigir al login
                if (data.session_expired) {
                    alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                }
                
                window.location.href = 'Login.html';
                return;
            }
            
            // Sesión válida, mostrar información del admin
            this.displayAdminInfo(data.admin);
            
        } catch (error) {
            console.error('Error verificando sesión:', error);
            // En caso de error, redirigir al login por seguridad
            window.location.href = 'Login.html';
        }
    }

    displayAdminInfo(admin) {
        // Buscar elemento para mostrar info del admin
        const adminInfo = document.getElementById('admin-info');
        if (adminInfo && admin) {
            adminInfo.innerHTML = `
                <span class="admin-name">Bienvenido, ${admin.nombre} ${admin.apellido}</span>
                <span class="admin-cargo">${admin.cargo}</span>
                <button onclick="logout()" class="logout-btn" title="Cerrar Sesión">
                    <i class='bx bx-log-out'></i>
                </button>
            `;
        }

        // También guardar en localStorage para uso en otras partes
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_name', admin.nombre);
        localStorage.setItem('admin_email', admin.email);
    }

    setupPeriodicCheck() {
        // Verificar sesión cada 5 minutos
        setInterval(() => {
            this.checkSession();
        }, 5 * 60 * 1000); // 5 minutos
    }
}

// Función logout global
window.logout = function() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        fetch('Backend/routes/admin_logout.php', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            // Limpiar localStorage
            localStorage.removeItem('admin_logged_in');
            localStorage.removeItem('admin_name');
            localStorage.removeItem('admin_email');
            
            // Redirigir al login
            window.location.href = 'Login.html';
        })
        .catch(error => {
            console.error('Error en logout:', error);
            // Redirigir de todos modos
            window.location.href = 'Login.html';
        });
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SessionGuard();
});

// CSS para el admin info
const adminInfoStyles = `
<style>
#admin-info {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 10px 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1000;
    border: 1px solid #e0e0e0;
}

.admin-name {
    font-weight: 600;
    color: #333;
}

.admin-cargo {
    font-size: 12px;
    color: #666;
    background: #f5f5f5;
    padding: 2px 8px;
    border-radius: 10px;
}

.logout-btn {
    background: #ff4444;
    color: white;
    border: none;
    padding: 5px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.logout-btn:hover {
    background: #cc0000;
}

.logout-btn i {
    font-size: 14px;
}
</style>
`;

// Insertar estilos en el head
document.head.insertAdjacentHTML('beforeend', adminInfoStyles);