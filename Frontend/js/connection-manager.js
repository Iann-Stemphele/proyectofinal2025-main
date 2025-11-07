/**
 * Connection Manager - Maneja la conexión a la base de datos y carga diferida de recursos
 */

class ConnectionManager {
    constructor() {
        this.isDbConnected = false;
        this.maxRetries = 5;
        this.retryDelay = 2000; // 2 segundos
        this.currentRetry = 0;
        this.loadingElement = null;
        this.imageQueue = [];
        this.init();
    }

    init() {
        this.showLoader();
        this.checkDatabaseConnection();
    }

    showLoader() {
        // Crear elemento de carga si no existe
        if (!document.getElementById('connection-loader')) {
            this.loadingElement = document.createElement('div');
            this.loadingElement.id = 'connection-loader';
            this.loadingElement.innerHTML = `
                <div class="loader-overlay">
                    <div class="loader-content">
                        <div class="spinner"></div>
                        <h3>Conectando con el servidor...</h3>
                        <p id="loader-status">Verificando conexión a la base de datos</p>
                        <div class="retry-info" id="retry-info" style="display:none;">
                            <p>Reintento <span id="retry-count">1</span> de ${this.maxRetries}</p>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(this.loadingElement);
        }
        this.loadingElement.style.display = 'flex';
    }

    hideLoader() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }

    updateLoaderStatus(message, showRetry = false) {
        const statusElement = document.getElementById('loader-status');
        if (statusElement) {
            statusElement.textContent = message;
        }

        const retryInfo = document.getElementById('retry-info');
        const retryCount = document.getElementById('retry-count');
        
        if (showRetry && retryInfo && retryCount) {
            retryCount.textContent = this.currentRetry;
            retryInfo.style.display = 'block';
        } else if (retryInfo) {
            retryInfo.style.display = 'none';
        }
    }

    async checkDatabaseConnection() {
        try {
            this.updateLoaderStatus('Verificando conexión a la base de datos...');
            
            const response = await fetch('Backend/routes/test_connection.php', {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.isDbConnected = true;
                this.updateLoaderStatus('Conexión establecida. Cargando recursos...');
                await this.initializeApplication();
            } else {
                throw new Error(data.message || 'Error de conexión a la base de datos');
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            await this.handleConnectionError(error);
        }
    }

    async handleConnectionError(error) {
        this.currentRetry++;
        
        if (this.currentRetry <= this.maxRetries) {
            this.updateLoaderStatus(
                `Error de conexión. Reintentando en ${this.retryDelay/1000} segundos...`,
                true
            );
            
            setTimeout(() => {
                this.checkDatabaseConnection();
            }, this.retryDelay);
        } else {
            this.updateLoaderStatus('Error: No se pudo establecer conexión. Recargando página...');
            
            // Mostrar error y opción de recargar
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: #ff6b6b;">No se pudo conectar con el servidor después de ${this.maxRetries} intentos.</p>
                    <button id="manual-reload-btn" style="padding: 10px 20px; background: #4ecdc4; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Recargar página
                    </button>
                </div>
            `;
            
            const loaderContent = document.querySelector('.loader-content');
            if (loaderContent) {
                loaderContent.appendChild(errorDiv);
            }

            document.getElementById('manual-reload-btn')?.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }

    async initializeApplication() {
        try {
            // Cargar recursos críticos primero
            this.updateLoaderStatus('Cargando datos esenciales...');
            
            // Precargar categorías y datos básicos
            await this.preloadEssentialData();
            
            // Cargar imágenes de manera diferida
            this.updateLoaderStatus('Preparando interfaz...');
            await this.initLazyLoading();
            
            // Inicializar scripts principales
            await this.initializeScripts();
            
            // Todo listo
            this.updateLoaderStatus('¡Listo!');
            
            setTimeout(() => {
                this.hideLoader();
                this.triggerAppReady();
            }, 500);

        } catch (error) {
            console.error('Error inicializando aplicación:', error);
            this.updateLoaderStatus('Error cargando la aplicación...');
        }
    }

    async preloadEssentialData() {
        try {
            // Precargar categorías
            const categoriesResponse = await fetch('Backend/routes/categorias.php');
            if (categoriesResponse.ok) {
                const categories = await categoriesResponse.json();
                // Guardar en sessionStorage para acceso rápido
                sessionStorage.setItem('categories', JSON.stringify(categories));
            }

            // Verificar carrito existente
            const cartResponse = await fetch('Backend/routes/get_cart.php');
            if (cartResponse.ok) {
                const cartData = await cartResponse.json();
                // Actualizar contador del carrito si existe
                this.updateCartCounter(cartData);
            }

        } catch (error) {
            console.log('Advertencia: No se pudieron precargar algunos datos:', error);
        }
    }

    updateCartCounter(cartData) {
        const cartCounter = document.getElementById('cart-counter');
        if (cartCounter && cartData.items) {
            const totalItems = cartData.items.reduce((total, item) => total + (item.quantity || 0), 0);
            cartCounter.textContent = totalItems;
            cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    async initLazyLoading() {
        // Configurar lazy loading para imágenes
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            });

            // Aplicar lazy loading a todas las imágenes
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            // Para imágenes existentes, convertir src a data-src para lazy loading futuro
            document.querySelectorAll('img:not([data-src])').forEach(img => {
                if (img.src && !img.src.includes('data:')) {
                    img.dataset.src = img.src;
                    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
                    img.classList.add('lazy');
                    imageObserver.observe(img);
                }
            });
        }
    }

    async initializeScripts() {
        // Asegurar que todos los scripts dependientes de la DB se ejecuten después de la conexión
        return new Promise((resolve) => {
            // Dar un pequeño delay para asegurar que el DOM esté listo
            setTimeout(() => {
                // Disparar evento personalizado para que otros scripts sepan que pueden ejecutarse
                document.dispatchEvent(new CustomEvent('databaseReady', {
                    detail: { connectionManager: this }
                }));
                resolve();
            }, 100);
        });
    }

    triggerAppReady() {
        // Disparar evento cuando la app está completamente lista
        document.dispatchEvent(new CustomEvent('appReady'));
        
        // Remover clase de loading del body si existe
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }

    // Método público para verificar si la DB está conectada
    isDatabaseReady() {
        return this.isDbConnected;
    }

    // Método para reiniciar la conexión manualmente
    async reconnect() {
        this.currentRetry = 0;
        this.isDbConnected = false;
        this.showLoader();
        await this.checkDatabaseConnection();
    }
}

// CSS para el loader
const loaderStyles = `
<style>
#connection-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    font-family: 'Arial', sans-serif;
}

.loader-overlay {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loader-content {
    background: white;
    padding: 40px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 90%;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #4ecdc4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loader-content h3 {
    color: #333;
    margin: 0 0 15px 0;
    font-size: 1.2em;
}

.loader-content p {
    color: #666;
    margin: 10px 0;
    font-size: 0.9em;
}

.retry-info {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 5px;
    margin-top: 15px;
}

.retry-info p {
    margin: 0;
    font-size: 0.8em;
    color: #666;
}

/* Estilo para imágenes lazy loading */
img.lazy {
    opacity: 0;
    transition: opacity 0.3s;
}

img.lazy.loaded {
    opacity: 1;
}

/* Estilo para el body mientras carga */
body.loading {
    overflow: hidden;
}

body.loaded {
    overflow: auto;
}
</style>
`;

// Insertar estilos en el head
document.head.insertAdjacentHTML('beforeend', loaderStyles);

// Inicializar el manager cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.connectionManager = new ConnectionManager();
});

// Exponer el manager globalmente
window.ConnectionManager = ConnectionManager;