var swiper1 = new Swiper (".mySwiper-1", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop:true,
    pagination: {
        el:".swiper-pagination",
        clickable:true,
    },
    navigation: {
        nextEl:".swiper-button-next",
        prevEl:".swiper-button-prev",
    }
});

var swiper2 = new Swiper (".mySwiper-2", {
    slidesPerView: 1, // Cambiado a 1 para evitar el warning de loop
    spaceBetween: 20,
    loop:true,
    loopFillGroupWithBlank: true,
    navigation: {
        nextEl:".swiper-button-next",
        prevEl:".swiper-button-prev",
    },
    breakpoints : {
        0: {
            slidesPerView: 1,
        },
        520: {
            slidesPerView: 2,
        },
        950: {
            slidesPerView: 3,
        }
    }
});

let tabInputs = document.querySelectorAll('.tabInput');
tabInputs.forEach(function(input) {
    input.addEventListener('change', function() {
        let id = input.value;
        let thisSwiper = document.getElementById('swiper' + id);
        if (thisSwiper && thisSwiper.swiper) {
            thisSwiper.swiper.update();
        }
    });
});





// Obtener el modal
var modal = document.getElementById("miModal");

// Obtener el botón que abre el modal
var btn = document.getElementById("abrirModalBtn");

// Obtener el elemento <span> que cierra el modal SOLO dentro de miModal
var span = document.querySelector("#miModal .close-button");

// Cuando el usuario hace clic en el botón, abre el modal
btn.onclick = function() {
  modal.style.display = "flex"; // Usamos 'flex' para centrarlo con CSS
}

// Cuando el usuario hace clic en <span> (x), cierra el modal
span.onclick = function() {
  modal.style.display = "none";
}

// Cuando el usuario hace clic en cualquier lugar fuera del modal, lo cierra
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
                        function scrollToSection(event, id, duration = 2000) {
                            event.preventDefault();
                            const target = document.getElementById(id);
                            if (!target) return;
                            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                            const startPosition = window.pageYOffset;
                            const distance = targetPosition - startPosition;
                            let startTime = null;

                            function animation(currentTime){
                                if (startTime === null) startTime = currentTime;
                                const timeElapsed = currentTime - startTime;
                                const run = ease(timeElapsed, startPosition, distance, duration);
                                window.scrollTo(0, run);
                                if (timeElapsed < duration) requestAnimationFrame(animation);
                            }

                            function ease(t, b, c, d) {
                                t /= d/2;
                                if (t < 1) return c/2*t*t + b;
                                t--;
                                return -c/2 * (t*(t-2) - 1) + b;
                            }

                            requestAnimationFrame(animation);
                        }

document.addEventListener('DOMContentLoaded', () => {
    // --- Modal Más Información ---
    const modalMasInfo = document.getElementById('modal-mas-info');
    const closeMasInfoBtn = document.getElementById('close-mas-info');
    const masInfoTitulo = document.getElementById('mas-info-titulo');
    const masInfoLista = document.getElementById('mas-info-lista');

    // Delegación para todos los botones "Más información"
    document.querySelectorAll('.btn-mas-info').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const categoria = btn.dataset.categoria;
            masInfoTitulo.textContent = 'Cargando...';
            masInfoLista.innerHTML = '<p>Cargando...</p>';
            modalMasInfo.style.display = 'flex';

            // --- NOTA: Aquí debes conectar con tu base de datos ---
            // Debes tener un endpoint tipo: /api/categorias/:categoria
            // Ejemplo de respuesta esperada: [{id, nombre, precio}, ...]
            try {
                const response = await fetch('/ProyectoFinal2025/proyectofinal2025-main/Backend/routes/categorias.php?categoria=' + encodeURIComponent(categoria));
                if (!response.ok) throw new Error('Error al cargar los alimentos');
                const alimentos = await response.json();

                masInfoTitulo.textContent = categoria.replace(/-/g, ' ').toUpperCase();
                if (alimentos.length === 0) {
                    masInfoLista.innerHTML = '<p>No hay alimentos en esta categoría.</p>';
                } else {
                    masInfoLista.innerHTML = '';
                    alimentos.forEach(alimento => {
                        // Crear el contenedor del alimento
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'mas-info-item';
                        itemDiv.innerHTML = `
                            <span class="mas-info-nombre">${alimento.nombre}</span>
                            <span class="mas-info-precio">$${alimento.precio.toFixed(2)}</span>
                            <input type="number" min="1" value="1" class="mas-info-cantidad" style="width:60px;">
                            <button class="mas-info-agregar" data-id="${alimento.id}" data-nombre="${alimento.nombre}" data-precio="${alimento.precio}">Agregar al carrito</button>
                        `;
                        masInfoLista.appendChild(itemDiv);
                    });
                }
            } catch (err) {
                masInfoTitulo.textContent = 'Error';
                masInfoLista.innerHTML = '<p>No se pudieron cargar los alimentos.</p>';
            }
        });
    });

    // Cerrar el modal de más información
    closeMasInfoBtn.addEventListener('click', () => {
        modalMasInfo.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === modalMasInfo) {
            modalMasInfo.style.display = 'none';
        }
    });

    // --- Agregar al carrito desde el modal de más información ---
    document.getElementById('mas-info-lista').addEventListener('click', (e) => {
        if (e.target.classList.contains('mas-info-agregar')) {
            const btn = e.target;
            const id = btn.dataset.id;
            const nombre = btn.dataset.nombre;
            const precio = parseFloat(btn.dataset.precio);
            const cantidadInput = btn.parentElement.querySelector('.mas-info-cantidad');
            const cantidad = parseInt(cantidadInput.value, 10) || 1;

            // --- Agregar al carrito usando la lógica de localStorage del carrito ---
            let cart = JSON.parse(localStorage.getItem('altCart')) || [];
            const existingProductIndex = cart.findIndex(item => item.id == id);
            if (existingProductIndex > -1) {
                cart[existingProductIndex].quantity += cantidad;
            } else {
                cart.push({ id, name: nombre, price: precio, quantity: cantidad });
            }
            localStorage.setItem('altCart', JSON.stringify(cart));

            // Opcional: feedback visual
            btn.textContent = 'Agregado!';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = 'Agregar al carrito';
                btn.disabled = false;
            }, 1000);
        }
    });

// --- MINI-MENUS CON CARDS DINÁMICAS ---

// Relaciona cada categoria de botón con los IDs de productos de tu backend
const categoriasProductos = {
  "desayuno-merienda": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33],
  "menu-infantil": [159,160,161,162,163,164],
  "milanesas-hamburgesas-chivitos-chorizo": [51,52,53,54,55,56,57,58,59,60,61],
  "guarniciones-ensaladas": [62,63,64,65,66,67,68,69,70],
  "pizzas": [145,146,147,148,149,150,151,152,153,154,155,156,157,158],
  "combos-especiales": [112,113,114,115,49,50],
  "postres": [116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144],
  "bebidas": [165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195],
  "tragos": [85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111]
};

let todosLosProductos = [];

async function cargarTodosLosProductos() {
  if (todosLosProductos.length) return todosLosProductos;
  const res = await fetch('http://localhost/ProyectoFinal2025/proyectofinal2025-main/Backend/routes/api.php?url=comidas');
  const data = await res.text();
  console.log('Respuesta del backend:', data);
  try {
    todosLosProductos = JSON.parse(data);
  } catch (e) {
    alert('Error al parsear productos: ' + e.message);
    todosLosProductos = [];
  }
  return todosLosProductos;
}


function renderizarCards(categoria, productos) {
  const contenedor = document.querySelector(`#mini-menu-${categoria} .mini-menu-cards`);
  if (!contenedor) return;
  if (!productos.length) {
    contenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
    return;
  }
  contenedor.innerHTML = productos.map(prod => `
    <div class="card">
      <h4>${prod.nombre}</h4>
      <p>${prod.descripcion || ""}</p>
      <p><strong>Precio:</strong> $${prod.precio}</p>
      <p><strong>Stock:</strong> ${prod.stock_disponible}</p>
    </div>
  `).join('');
}

document.querySelectorAll('.btn-mas-info').forEach(btn => {
  btn.addEventListener('click', async function(e) {
    e.stopPropagation();
    document.querySelectorAll('.mini-menu').forEach(m => m.style.display = 'none');
    const categoria = btn.getAttribute('data-categoria');
    const miniMenu = document.getElementById('mini-menu-' + categoria);
    if (miniMenu) miniMenu.style.display = 'block';

    // Filtrar productos por IDs de la categoría
    await cargarTodosLosProductos();
    const ids = categoriasProductos[categoria] || [];
    const productosFiltrados = todosLosProductos.filter(p => ids.includes(Number(p.id_Producto)));
    renderizarCards(categoria, productosFiltrados);
  });
});

document.querySelectorAll('.mini-menu-close').forEach(closeBtn => {
  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const mini = closeBtn.getAttribute('data-mini');
    const miniMenu = document.getElementById('mini-menu-' + mini);
    if (miniMenu) miniMenu.style.display = 'none';
  });
});

document.addEventListener('click', function(e) {
  document.querySelectorAll('.mini-menu').forEach(m => {
    if (m.style.display === 'block' && !m.contains(e.target)) {
      m.style.display = 'none';
    }
  });
});

document.querySelectorAll('.mini-menu-content').forEach(content => {
  content.addEventListener('click', function(e) {
    e.stopPropagation();
  });
});

function closeModal() {
  var modal = document.getElementById('carritoModal'); // Usa el id correcto
  if (modal) {
    modal.style.display = 'none';
  }
}
});







