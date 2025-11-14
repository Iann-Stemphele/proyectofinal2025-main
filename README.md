

# ProyectoFinal2025 - LasDosReinas

**Las Dos Reinas** es una aplicación web completa para restaurante desarrollada con PHP, MySQL y JavaScript. Incluye sistema de menú interactivo, carrito de compras, procesamiento de pagos con MercadoPago, gestión de pedidos y panel administrativo.

## 🚀 Características Principales

### 🍽️ Sistema de Menú y Productos
- **Menú interactivo** con tarjetas flip y categorización completa
- **17 categorías** de productos: cafés, tostados, dulces, especiales, milanesas, hamburguesas, chivitos, guarniciones, ensaladas, tragos, combos, picadas, postres, pizzas, menú infantil, bebidas, cervezas, vinos
- **Carrusel de productos destacados** para combos y especiales
- **Platos del día** dinámicos (Lunes a Viernes)
- **Galería responsive** con diseño adaptable

### 🛒 Sistema de Carrito y Pedidos
- **Carrito de compras** persistente con localStorage y sincronización con backend
- **Múltiples métodos de pago**: Efectivo y MercadoPago
- **Gestión completa de pedidos** con estados (inicializando, en proceso, completado)
- **Webhooks de MercadoPago** para actualización automática de estados
- **Sistema de confirmación** y seguimiento de pedidos en tiempo real

### 🔒 Sistema Administrativo
- **Login seguro** con autenticación de sesiones
- **Panel de gestión de pedidos** con interfaz intuitiva
- **Actualización de estados** de pedidos en tiempo real
- **Control de tiempos estimados** de preparación
- **Gestión de platos del día** desde el panel admin

### 💳 Integración de Pagos
- **MercadoPago SDK** totalmente integrado
- **Procesamiento seguro** de pagos online
- **Confirmación automática** via webhooks
- **Respaldo para pagos en efectivo**

## 📁 Estructura del Proyecto

```
proyectofinal2025-main/
├── 📄 index.html                    # Página principal del restaurante
├── 📄 Login.html                    # Login administrativo
├── 📄 orders.html                   # Panel de gestión de pedidos
├── 📄 order_status.html            # Estado de pedidos para clientes
├── 📄 styles.css                    # Estilos globales
├── 📄 LasDosReinas.sql             # Base de datos con productos completos
├── 📄 composer.json                 # Dependencias PHP (MercadoPago)
└── 📁 Backend/
    ├── 📁 config/
    │   └── database.php             # Configuración BD (InfinityFree)
    ├── 📁 controllers/
    │   └── comidas.php              # Controlador principal
    ├── 📁 models/
    │   └── comida.php               # Modelo de productos
    ├── 📁 js/
    │   ├── login.js                 # Lógica de autenticación
    │   ├── session_guard.js         # Protección de rutas admin
    │   ├── carrusel.js              # Carrusel de productos
    │   └── comida.js                # Funciones de productos
    └── 📁 routes/                   # API REST Endpoints
        ├── api.php                  # API principal de productos
        ├── add_to_cart.php          # Añadir productos al carrito
        ├── get_cart.php             # Obtener carrito actual
        ├── create_order.php         # Crear pedido con MercadoPago
        ├── create_cash_order.php    # Crear pedido en efectivo
        ├── create_preference.php    # Crear preferencia MP
        ├── confirm_temp_preference.php # Confirmar pago temporal
        ├── get_orders.php           # Obtener pedidos (admin)
        ├── update_order_status.php  # Actualizar estado pedido
        ├── delete_order.php         # Eliminar pedido
        ├── get_order_status.php     # Estado específico de pedido
        ├── update_estimated_time.php # Actualizar tiempo estimado
        ├── get_platos_dia.php       # Obtener platos del día
        ├── set_platos_dia.php       # Configurar platos del día
        ├── admin_login.php          # Autenticación administrativa
        ├── admin_logout.php         # Cerrar sesión admin
        ├── check_session.php        # Verificar sesión activa
        ├── mercadopago_webhook.php  # Webhook de MercadoPago
        └── categorias.php           # API de categorías

└── 📁 Frontend/
    ├── 📁 Menu Web/
    │   ├── Menu.js                  # Lógica del menú interactivo
    │   └── Menu.css                 # Estilos del menú flip
    ├── 📁 galeriaycarrusel/
    │   ├── comidas.html             # Página de productos por categoría
    │   ├── carrusel.html            # Carrusel de productos destacados
    │   ├── style.css                # Estilos de la galería
    │   └── carrusel.css             # Estilos del carrusel
    ├── 📁 restaurante/
    │   ├── Restaurante1.html        # [Versión legacy]
    │   ├── Restaurante1_new.js      # Lógica principal del restaurante
    │   ├── Restaurante1.js          # [Versión legacy]
    │   └── Restaurante1.css         # Estilos del restaurante
    ├── 📁 Carrito/
    │   ├── carro.js                 # Lógica completa del carrito
    │   └── carro.css                # Estilos del carrito
    ├── 📁 Comprar/
    │   ├── comprar.js               # Proceso de compra
    │   ├── comprar_simple.js        # Versión simplificada
    │   └── comprar.css              # Estilos de compra
    ├── 📁 css/
    │   └── main.css                 # Estilos principales
    ├── 📁 js/
    │   └── connection-manager.js    # Gestión de conexiones
    └── 📁 img/                      # Recursos gráficos
        ├── comprar/                 # Imágenes del proceso de compra
        └── menu/                    # Imágenes de productos
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **PHP 8.0+** - Lógica del servidor
- **MySQL/MariaDB** - Base de datos (InfinityFree)
- **MercadoPago SDK** - Procesamiento de pagos
- **PDO** - Acceso seguro a base de datos
- **Sessions** - Autenticación administrativa

### Frontend
- **JavaScript ES6+** - Funcionalidad dinámica
- **CSS3 + Flexbox/Grid** - Diseño responsive
- **LocalStorage** - Persistencia del carrito
- **Fetch API** - Comunicación con backend
- **SweetAlert/Notifications** - UX mejorada

### Librerías Externas
- **Swiper.js** - Carruseles y sliders
- **BoxIcons** - Iconografía
- **MercadoPago JS SDK** - Integración de pagos

## ⚙️ Configuración e Instalación

### 1. Configuración de Base de Datos (InfinityFree)

La aplicación está configurada para **InfinityFree** con los siguientes parámetros:

```php
// Backend/config/database.php
$host = 'sql306.infinityfree.com';
$db   = 'if0_40194248_lasdosreinas';
$user = 'if0_40194248';
$pass = 'LasDosReinas';
$charset = 'utf8mb4';
```

### 2. Importar Base de Datos

1. Accede a tu panel de **cPanel** en InfinityFree
2. Ve a **MySQL Databases**
3. Crea la base de datos `if0_40194248_lasdosreinas`
4. Importa el archivo `LasDosReinas.sql`

### 3. Configuración de MercadoPago

1. Obtén tus credenciales de [MercadoPago Developers](https://www.mercadopago.com/developers)
2. Actualiza las claves en los archivos correspondientes:
   - Public Key en `Frontend/Carrito/carro.js`
   - Access Token en `Backend/routes/create_order.php`

### 4. Despliegue

1. Sube todos los archivos a tu hosting de InfinityFree
2. Asegúrate de que la URL del webhook esté configurada en MercadoPago
3. Verifica la conexión con `check_database.php`

## 📱 Uso del Sistema

### Para Clientes

1. **Navegar el Menú**: Accede a `index.html` para ver el menú completo
2. **Agregar al Carrito**: Selecciona productos y añádelos al carrito
3. **Realizar Pedido**: 
   - Efectivo: Completa el formulario de datos
   - MercadoPago: Procesa el pago online
4. **Seguimiento**: Usa `order_status.html` para ver el estado del pedido

### Para Administradores

1. **Login**: Accede via `Login.html` con credenciales administrativas
2. **Gestión de Pedidos**: Usa `orders.html` para:
   - Ver pedidos en tiempo real
   - Actualizar estados (inicializando → en proceso → completado)
   - Configurar tiempos estimados
   - Eliminar pedidos si es necesario
3. **Platos del Día**: Configura productos destacados por día de la semana

## 🔐 Sistema de Autenticación

### Credenciales por Defecto

El sistema incluye usuarios administrativos predefinidos en la base de datos. Usa `generate_hash.php` para crear nuevos hashes de contraseña.

### Seguridad
- **Sesiones PHP** seguras con timeout automático
- **Validación CSRF** en formularios críticos
- **Sanitización** de entradas de usuario
- **Prepared statements** para prevenir SQL injection

## 🌐 API Endpoints

### Productos y Menú
- `GET /Backend/routes/api.php` - Obtener todos los productos
- `GET /Backend/routes/categorias.php` - Obtener categorías
- `GET /Backend/routes/get_platos_dia.php` - Platos del día
- `POST /Backend/routes/set_platos_dia.php` - Configurar platos

### Carrito y Pedidos
- `POST /Backend/routes/add_to_cart.php` - Añadir al carrito
- `GET /Backend/routes/get_cart.php` - Obtener carrito
- `POST /Backend/routes/create_order.php` - Crear pedido MP
- `POST /Backend/routes/create_cash_order.php` - Pedido efectivo
- `GET /Backend/routes/get_orders.php` - Listar pedidos
- `POST /Backend/routes/update_order_status.php` - Actualizar estado

### Administración
- `POST /Backend/routes/admin_login.php` - Login administrativo
- `POST /Backend/routes/admin_logout.php` - Cerrar sesión
- `GET /Backend/routes/check_session.php` - Verificar sesión

### MercadoPago
- `POST /Backend/routes/create_preference.php` - Crear preferencia
- `POST /Backend/routes/mercadopago_webhook.php` - Webhook MP
- `POST /Backend/routes/confirm_temp_preference.php` - Confirmar pago

## 🎯 Características Destacadas

### 🍜 Platos del Día Dinámicos
Sistema automático que asigna platos específicos a cada día de la semana, gestionable desde el panel administrativo.

### 💰 Doble Sistema de Pago
- **MercadoPago**: Integración completa con webhooks automáticos
- **Efectivo**: Confirmación manual desde el panel admin

### 📊 Gestión de Pedidos en Tiempo Real
Panel administrativo que permite seguimiento completo del flujo de pedidos con estados actualizables.

### 🛡️ Seguridad Robusta
Autenticación por sesiones, protección CSRF y sanitización completa de datos.

### 📱 Diseño Responsive
Interfaz completamente adaptable desde móviles hasta escritorio.

## 🔄 Flujo de Pedidos

1. **Cliente** selecciona productos y confirma pedido
2. **Sistema** crea pedido con estado "inicializando"
3. **Pago** se procesa (efectivo o MercadoPago)
4. **Admin** ve el pedido y lo marca como "en proceso"
5. **Cliente** puede hacer seguimiento del estado
6. **Admin** marca como "completado" cuando está listo

## 🚀 Estructura de URLs

- **Página Principal**: `/index.html`
- **Login Admin**: `/Login.html`
- **Gestión Pedidos**: `/orders.html`
- **Estado Pedidos**: `/order_status.html`
- **Galería Productos**: `/Frontend/galeriaycarrusel/comidas.html`
- **Carrusel**: `/Frontend/galeriaycarrusel/carrusel.html`

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto, contacta a **Nexus Horizon**.

---

**Desarrollado por Nexus Horizon** | Proyecto Final 2025
