// IDs de productos por categoría
const categorias = {
  cafes: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
  tostados: [17,18,19,20,21,22],
  dulces: [23,24,25,26,27,28,29,30,31,32,33],
  singluten: [34,35,36,37,38,39,40,41,42,43,44,45,46,47,48],
  especiales: [49,50],
  milanesas: [51,52,53,54],
  hamburguesas: [55,56,57,58],
  chivitos: [59,60],
  guarniciones: [62,63,64,65,66,67,68],
  ensaladas: [69,70],
  tragos: [85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111],
  combos: [112,113],
  picadas: [114,115],
  postres: [116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141],
  postressg: [142,143,144],
  pizzas: [145,146,147,148,149,150,151,152,153,154,155,156,157,158],
  infantil: [159,160,161,162,163,164],
  bebidas: [165,166,167,168,169,170,171,172,173,174,175,176,177,178],
  cervezas: [179,180,181,182,183,184,185,186,187,188,189,190],
  vinos: [191,192,193,194,195]
};

// Guarda los productos cargados
let productos = [];
let todasLasComidas = [];

// Carga todos los productos al iniciar
async function obtenerComidas() {
    const respuesta = await fetch('http://localhost/ProyectoFinal2025/Backend/routes/api.php?url=comidas');
    todasLasComidas = await respuesta.json();
    console.log("Comidas recibidas:", todasLasComidas); // Verifica en consola
    document.querySelector(".card-container").innerHTML = "<p>Selecciona una categoría.</p>";
}

function mostrarComidasPorRango(min, max) {
    const contenedor = document.querySelector(".card-container");
    const filtradas = todasLasComidas.filter(c => {
        const id = Number(c.id_Producto);
        return id >= min && id <= max;
    });
    console.log("Filtradas:", filtradas); // Verifica en consola
    contenedor.innerHTML = filtradas.length
        ? filtradas.map(comida => `
            <div class="card">
                <h3>${comida.nombre}</h3>
                <p>${comida.descripcion || ""}</p>
                <p>Precio: $${comida.precio}</p>
                <p>Stock: ${comida.stock_disponible}</p>
            </div>
        `).join('')
        : "<p>No hay productos en esta categoría.</p>";
}

// Muestra solo los productos de la categoría seleccionada
function mostrarPorCategoria(cat) {
  const ids = categorias[cat];
  const filtrados = productos.filter(p => ids.includes(Number(p.id_Producto)));
  const contenedor = document.querySelector(".card-container");
  if (!filtrados.length) {
    contenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
    return;
  }
  contenedor.innerHTML = filtrados.map(comida => `
    <div class="card">
      <div class="card-content">
        <h3 class="card-title">${comida.nombre}</h3>
        <p class="card-text">${comida.descripcion || ""}</p>
        <p><strong>Precio:</strong> $${comida.precio}</p>
        <p><strong>Stock:</strong> ${comida.stock_disponible}</p>
      </div>
    </div>
  `).join('');
}

// Asigna eventos a los botones
document.addEventListener("DOMContentLoaded", () => {
    obtenerComidas();
    document.getElementById("categorias").addEventListener("click", e => {
        if (e.target.tagName === "BUTTON") {
            const min = parseInt(e.target.dataset.min, 10);
            const max = parseInt(e.target.dataset.max, 10);
            mostrarComidasPorRango(min, max);
        }
    });
});