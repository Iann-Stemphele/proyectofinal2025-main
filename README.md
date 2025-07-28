

# ProyectoFinal2025 - LasDosReinas

Este repositorio contiene el proyecto web **Las Dos Reinas**, desarrollado con PHP, JavaScript y CSS, utilizando XAMPP como entorno local. El objetivo es mostrar el menú y productos del restaurante de forma interactiva y visualmente atractiva.

## Estructura principal

- **Frontend/**  
  - `galeriaycarrusel/`  
    - `comidas.html`: Página principal para mostrar las comidas y productos por categorías, usando tarjetas responsivas.
    - `carrusel.html`: Página con un carrusel de productos destacados (combos y especiales).
    - `style.css`, `carrusel.css`: Estilos para las páginas.
  - `img/`: Imágenes de productos y elementos gráficos.
  - `Menu Web/`: Menú interactivo con tarjetas flip.
  - `restaurante/`: Página principal del restaurante con información, productos y menú modal.

- **Backend/**  
  - `routes/api.php`: API REST que sirve los productos desde la base de datos.
  - `controllers/comidas.php`: Controlador para obtener los productos.
  - `models/comida.php`: Modelo de acceso a la base de datos.
  - `config/database.php`: Configuración de la conexión a MySQL.
  - `js/comida.js`, `js/carrusel.js`: Scripts para consumir la API y mostrar los productos en el frontend.

## ¿Qué se muestra?

- **Menú y productos**:  
  Los productos se agrupan por categorías (cafés, tostados, dulces, especiales, milanesas, hamburguesas, chivitos, guarniciones, ensaladas, tragos, combos, picadas, postres, pizzas, menú infantil, bebidas, cervezas, vinos).
- **Tarjetas responsivas**:  
  Cada producto se muestra en una tarjeta con nombre, descripción, precio y stock.
- **Carrusel**:  
  Los combos y especiales se muestran en un carrusel horizontal.
- **Menú interactivo**:  
  El menú principal permite navegar entre secciones y ver información adicional en un modal.

## ¿Cómo funciona?

- El frontend realiza peticiones a la API PHP para obtener los productos desde la base de datos MySQL.
- Los scripts JS procesan y muestran los datos dinámicamente según la categoría seleccionada o el carrusel.
- El diseño es responsivo y pensado para una experiencia moderna.

## Requisitos

- XAMPP (PHP y MySQL)
- Clonar el repositorio en la carpeta `htdocs` de XAMPP
- Crear la base de datos `LasDosReinas` y la tabla `Producto` con los campos necesarios

## Uso

1. Inicia XAMPP y asegúrate que Apache y MySQL estén activos.
2. Accede a las páginas desde el navegador:
   - `http://localhost/ProyectoFinal2025/Frontend/galeriaycarrusel/comidas.html`
   - `http://localhost/ProyectoFinal2025/Frontend/galeriaycarrusel/carrusel.html`
   - `http://localhost/ProyectoFinal2025/Frontend/restaurante/Restaurante1.html`
3. Navega por las categorías y productos.

---

Desarrollado por Nexus Horizon
