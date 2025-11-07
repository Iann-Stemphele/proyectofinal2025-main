/**
 * Login.js - Manejo del formulario de login para Las Dos Reinas
 */

class LoginManager {
    constructor() {
        this.form = document.getElementById('login-form');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.getElementById('login-btn');
        this.errorMessage = document.getElementById('error-message');
        this.successMessage = document.getElementById('success-message');
        this.loading = document.getElementById('loading');
        
        this.initializeEvents();
    }

    initializeEvents() {
        // Event listener para el formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Event listener para Enter en los inputs
        this.emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.passwordInput.focus();
            }
        });

        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });

        // Limpiar mensajes cuando el usuario empiece a escribir
        this.emailInput.addEventListener('input', () => this.clearMessages());
        this.passwordInput.addEventListener('input', () => this.clearMessages());
    }

    async handleLogin() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value.trim();

        // Validaciones básicas
        if (!email || !password) {
            this.showError('Por favor completa todos los campos');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Por favor ingresa un email válido');
            return;
        }

        // Mostrar loading
        this.showLoading(true);
        this.setFormDisabled(true);

        try {
            // Hacer petición al backend
            const response = await fetch('Backend/routes/admin_login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Login exitoso
                this.showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
                
                // Guardar datos de sesión en localStorage (opcional)
                localStorage.setItem('admin_logged_in', 'true');
                localStorage.setItem('admin_name', data.admin.nombre);
                localStorage.setItem('admin_email', data.admin.email);
                
                // Redirigir después de 1.5 segundos
                setTimeout(() => {
                    window.location.href = 'orders.html';
                }, 1500);

            } else {
                // Login fallido
                this.showError(data.message || 'Credenciales incorrectas');
            }

        } catch (error) {
            console.error('Error en login:', error);
            this.showError('Error de conexión. Por favor intenta nuevamente.');
            
        } finally {
            this.showLoading(false);
            this.setFormDisabled(false);
        }
    }

    showError(message) {
        this.clearMessages();
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
            this.errorMessage.style.display = 'none';
        }, 5000);
    }

    showSuccess(message) {
        this.clearMessages();
        this.successMessage.textContent = message;
        this.successMessage.style.display = 'block';
    }

    clearMessages() {
        this.errorMessage.style.display = 'none';
        this.successMessage.style.display = 'none';
    }

    showLoading(show) {
        if (show) {
            this.loading.style.display = 'block';
            this.loginBtn.textContent = 'Verificando...';
        } else {
            this.loading.style.display = 'none';
            this.loginBtn.textContent = 'Iniciar Sesión';
        }
    }

    setFormDisabled(disabled) {
        this.emailInput.disabled = disabled;
        this.passwordInput.disabled = disabled;
        this.loginBtn.disabled = disabled;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Verificar si ya está logueado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya hay una sesión activa
    if (localStorage.getItem('admin_logged_in') === 'true') {
        // Verificar con el servidor si la sesión sigue siendo válida
        fetch('Backend/routes/check_session.php')
            .then(response => response.json())
            .then(data => {
                if (data.logged_in) {
                    // Redirigir si ya está logueado
                    window.location.href = 'orders.html';
                } else {
                    // Limpiar localStorage si la sesión no es válida
                    localStorage.removeItem('admin_logged_in');
                    localStorage.removeItem('admin_name');
                    localStorage.removeItem('admin_email');
                }
            })
            .catch(error => {
                console.log('Error verificando sesión:', error);
            });
    }

    // Inicializar el manager de login
    new LoginManager();
});

// Función para logout (puede ser utilizada desde otras páginas)
function logout() {
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

// Exportar la función logout para uso global
window.logout = logout;