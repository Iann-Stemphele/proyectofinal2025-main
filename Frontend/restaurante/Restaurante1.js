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
                const response = await fetch('http://localhost/ProyectoFinal2025/proyectofinal2025-main/Backend/routes/categorias.php?categoria=' + encodeURIComponent(categoria));
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

async function cargarProductosPorCategoria(categoria) {
  try {
    const response = await fetch(`http://localhost/ProyectoFinal2025/proyectofinal2025-main/Backend/routes/categorias.php?categoria=${encodeURIComponent(categoria)}`);
    if (!response.ok) throw new Error('Error al cargar productos');
    const productos = await response.json();
    return productos;
  } catch (error) {
    console.error('Error cargando productos:', error);
    return [];
  }
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
      <button class="card-add-to-cart" data-id="${prod.id}" data-nombre="${prod.nombre}" data-precio="${prod.precio}">
        Agregar al carrito
      </button>
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

    // Cargar productos de la categoría desde la API
    const productos = await cargarProductosPorCategoria(categoria);
    renderizarCards(categoria, productos);
  });
});

// Add to cart functionality for mini-menu cards
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('card-add-to-cart')) {
    const btn = e.target;
    const id = btn.dataset.id;
    const nombre = btn.dataset.nombre;
    const precio = parseFloat(btn.dataset.precio);
    
    // Add to cart using localStorage
    let cart = JSON.parse(localStorage.getItem('altCart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id == id);
    if (existingProductIndex > -1) {
      cart[existingProductIndex].quantity += 1;
    } else {
      cart.push({ id, name: nombre, price: precio, quantity: 1 });
    }
    localStorage.setItem('altCart', JSON.stringify(cart));
    
    // Visual feedback
    btn.textContent = 'Agregado!';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Agregar al carrito';
      btn.disabled = false;
    }, 1000);
  }
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







