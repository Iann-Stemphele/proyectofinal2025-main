var swiper1 = new Swiper (".mySwiper-1", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: false, // Disabled loop as there's only 1 slide
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
    loop: false, // Disabled loop to avoid warning with insufficient slides
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

// --- FUNCIONES DE BASE DE DATOS ---
async function cargarProductosPorCategoria(categoria) {
  try {
    
    const response = await fetch(`Backend/routes/categorias.php?categoria=${encodeURIComponent(categoria)}`);
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

// --- FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ---
function initializeApp() {
    console.log('Inicializando aplicación...');

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

            try {
                const response = await fetch('Backend/routes/categorias.php?categoria=' + encodeURIComponent(categoria));
                if (!response.ok) throw new Error('Error al cargar los alimentos');
                const alimentos = await response.json();

                masInfoTitulo.textContent = categoria.replace(/-/g, ' ').toUpperCase();
                if (alimentos.length === 0) {
                    masInfoLista.innerHTML = '<p>No hay alimentos en esta categoría.</p>';
                } else {
                    masInfoLista.innerHTML = '';
                    alimentos.forEach(alimento => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'mas-info-item';
                        itemDiv.innerHTML = `
                            <span class="mas-info-nombre">${alimento.nombre}</span>
                            <span class="mas-info-precio">$${alimento.precio.toFixed(2)}</span>
                            ${alimento.descripcion ? `<p class="mas-info-descripcion">${alimento.descripcion}</p>` : ''}
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
    if (closeMasInfoBtn) {
        closeMasInfoBtn.addEventListener('click', () => {
            modalMasInfo.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (event) => {
        if (event.target === modalMasInfo) {
            modalMasInfo.style.display = 'none';
        }
    });

    // --- Agregar al carrito desde el modal de más información ---
    if (masInfoLista) {
        masInfoLista.addEventListener('click', (e) => {
            if (e.target.classList.contains('mas-info-agregar')) {
                const btn = e.target;
                const id = btn.dataset.id;
                const nombre = btn.dataset.nombre;
                const precio = parseFloat(btn.dataset.precio);
                const cantidadInput = btn.parentElement.querySelector('.mas-info-cantidad');
                const cantidad = parseInt(cantidadInput.value, 10) || 1;

                // Agregar al carrito usando localStorage
                let cart = JSON.parse(localStorage.getItem('altCart')) || [];
                const existingProductIndex = cart.findIndex(item => item.id == id);
                if (existingProductIndex > -1) {
                    cart[existingProductIndex].quantity += cantidad;
                } else {
                    cart.push({ id, name: nombre, price: precio, quantity: cantidad });
                }
                localStorage.setItem('altCart', JSON.stringify(cart));

                // Actualizar el contador del carrito
                updateCartCounter();

                // Visual feedback
                showCartFeedback(`"${nombre}" agregado al carrito (x${cantidad})`);

                // Dispatch custom event to update cart display
                window.dispatchEvent(new CustomEvent('cartUpdated'));

                // Feedback visual del botón
                btn.textContent = 'Agregado!';
                btn.disabled = true;
                setTimeout(() => {
                    btn.textContent = 'Agregar al carrito';
                    btn.disabled = false;
                }, 1000);

                // Resetear la cantidad
                cantidadInput.value = 1;
            }
        });
    }

    // --- Inicializar botones del menú principal ---
    initMenuButtons();

    // --- Inicializar platos del día ---
    initPlatosDia();
}

function initMenuButtons() {
    // Event listeners para botones del menú principal
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

    // Agregar al carrito desde mini-menu cards
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('card-add-to-cart')) {
            const btn = e.target;
            const id = btn.dataset.id;
            const nombre = btn.dataset.nombre;
            const precio = parseFloat(btn.dataset.precio);
            
            // Agregar al carrito usando localStorage
            let cart = JSON.parse(localStorage.getItem('altCart')) || [];
            const existingProductIndex = cart.findIndex(item => item.id == id);
            if (existingProductIndex > -1) {
                cart[existingProductIndex].quantity += 1;
            } else {
                cart.push({ id, name: nombre, price: precio, quantity: 1 });
            }
            localStorage.setItem('altCart', JSON.stringify(cart));
            
            // Actualizar el contador del carrito
            updateCartCounter();
            
            // Visual feedback
            showCartFeedback(`"${nombre}" agregado al carrito`);
            
            // Dispatch custom event to update cart display
            window.dispatchEvent(new CustomEvent('cartUpdated'));

            // Visual feedback del botón
            btn.textContent = 'Agregado!';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = 'Agregar al carrito';
                btn.disabled = false;
            }, 1000);
        }
    });

    // Cerrar mini-menus
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
}

function initPlatosDia() {
    const platosDiaBtn = document.getElementById('platos-dia-btn');
    const modalPlatosDia = document.getElementById('modal-platos-dia');
    const closePlatosDiaBtn = document.getElementById('close-platos-dia');
    const platosDiaLista = document.getElementById('platos-dia-lista');

    if (platosDiaBtn && modalPlatosDia && platosDiaLista) {
        platosDiaBtn.addEventListener('click', async () => {
            platosDiaLista.innerHTML = '<p>Cargando platos del día...</p>';
            modalPlatosDia.style.display = 'flex';

            try {
                const response = await fetch('Backend/routes/get_platos_dia.php');
                if (!response.ok) throw new Error('Error al cargar platos del día');
                const platosDia = await response.json();

                if (platosDia.length === 0) {
                    platosDiaLista.innerHTML = '<p>No hay platos especiales hoy.</p>';
                } else {
                    platosDiaLista.innerHTML = '';
                    platosDia.forEach(plato => {
                        const platoDiv = document.createElement('div');
                        platoDiv.className = 'plato-dia-item';
                        platoDiv.innerHTML = `
                            <h4>${plato.nombre}</h4>
                            <p>${plato.descripcion || ''}</p>
                            <span class="precio">$${plato.precio}</span>
                            <button class="agregar-plato-dia" data-id="${plato.id}" data-nombre="${plato.nombre}" data-precio="${plato.precio}">
                                Agregar al carrito
                            </button>
                        `;
                        platosDiaLista.appendChild(platoDiv);
                    });
                }
            } catch (error) {
                platosDiaLista.innerHTML = '<p>Error al cargar los platos del día.</p>';
                console.error('Error:', error);
            }
        });

        // Agregar platos del día al carrito
        platosDiaLista.addEventListener('click', (e) => {
            if (e.target.classList.contains('agregar-plato-dia')) {
                const btn = e.target;
                const id = btn.dataset.id;
                const nombre = btn.dataset.nombre;
                const precio = parseFloat(btn.dataset.precio);

                // Agregar al carrito
                let cart = JSON.parse(localStorage.getItem('altCart')) || [];
                const existingProductIndex = cart.findIndex(item => item.id == id);
                if (existingProductIndex > -1) {
                    cart[existingProductIndex].quantity += 1;
                } else {
                    cart.push({ id, name: nombre, price: precio, quantity: 1 });
                }
                localStorage.setItem('altCart', JSON.stringify(cart));

                // Actualizar contador
                updateCartCounter();

                // Feedback visual
                showCartFeedback(`"${nombre}" agregado al carrito`);

                // Feedback visual del botón
                btn.textContent = 'Agregado!';
                btn.disabled = true;
                setTimeout(() => {
                    btn.textContent = 'Agregar al carrito';
                    btn.disabled = false;
                }, 1000);

                // Disparar evento de actualización del carrito
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
        });
    }

    if (closePlatosDiaBtn && modalPlatosDia) {
        closePlatosDiaBtn.addEventListener('click', () => {
            modalPlatosDia.style.display = 'none';
        });
    }

    // Cerrar modal de platos del día al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (modalPlatosDia && event.target === modalPlatosDia) {
            modalPlatosDia.style.display = 'none';
        }
    });
}

/* FIX: prevenir ReferenceError 'html is not defined' y exponer una función segura
   mostrarPlatoDelDia(...) que puede ser llamada desde HTML/otros scripts. */
window.mostrarPlatoDelDia = async function (featureSelector) {
    try {
        // Contenedor destino preferido
        const listaContainer =
            document.getElementById('platos-dia-lista') ||
            document.getElementById('plato-del-dia') ||
            document.querySelector('.plato-del-dia') ||
            document.querySelector('.modal .content') ||
            document.querySelector('.productos-grid') ||
            document.querySelector('.cols');

        if (!listaContainer) {
            console.warn('mostrarPlatoDelDia: contenedor destino no encontrado.');
            return;
        }

        // Buscar elemento "featured" o usar el primer producto como fallback
        let featured = null;
        if (featureSelector) {
            try { featured = document.querySelector(featureSelector); } catch (e) { featured = null; }
        }
        featured = featured ||
                   document.querySelector('.col.featured') ||
                   document.querySelector('.col[data-featured="true"]') ||
                   document.querySelector('.product-card.featured') ||
                   document.querySelector('.productos-grid .product-card') ||
                   document.querySelector('.cols .col');

        if (!featured) {
            listaContainer.innerHTML = '<p>No hay platos disponibles</p>';
            return;
        }

        // Construir HTML localmente (evita usar variable no declarada)
        let html = '';

        const name = (featured.querySelector('.product-name')?.textContent || featured.dataset?.nombre || featured.querySelector('h4')?.textContent || '').trim();
        const desc = (featured.querySelector('.product-description')?.textContent || featured.dataset?.descripcion || featured.querySelector('p')?.textContent || '').trim();
        const priceRaw = featured.querySelector('.product-price')?.textContent ||
                         featured.dataset?.precio ||
                         featured.querySelector('.precio')?.textContent ||
                         featured.querySelector('span.precio')?.textContent || '';
        const price = (priceRaw || '').toString().trim();

        // Construcción segura del bloque (mínima estructura)
        html += '<div class="product-card featured">';
        html += '  <div class="product-card-content">';
        html += `    <h3>${name || 'Plato del día'}</h3>`;
        if (desc) html += `    <p class="product-description">${desc}</p>`;
        if (price) html += `    <div class="product-price">${price}</div>`;
        html += '  </div>';
        html += '</div>';

        // Inyectar
        listaContainer.innerHTML = html;

        // Mostrar modal si existe
        const modal =
            document.getElementById('modal-platos-dia') ||
            document.getElementById('miModal') ||
            document.querySelector('.modal.plato-del-dia') ||
            document.querySelector('.modal');

        if (modal) {
            modal.style.display = 'flex';
        }
    } catch (err) {
        console.error('mostrarPlatoDelDia error:', err);
    }
};

/* OPTIONAL HELPER: Si algún HTML llama a mostrarPlatoDelDia() sin parámetros,
   la función anterior cubrirá el caso. No se modifica la lógica existente de PC. */

// --- FUNCIONES AUXILIARES ---
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('altCart')) || [];
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
        // Agregar clase para animación
        cartCounter.classList.remove('updated');
        void cartCounter.offsetWidth; // Trigger reflow
        cartCounter.classList.add('updated');
    }
}

function showCartFeedback(message) {
    const feedback = document.getElementById('adding-to-cart');
    if (feedback) {
        feedback.textContent = message;
        feedback.classList.add('show');
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 2000);
    }
}

function closeModal() {
    var modal = document.getElementById('carritoModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// --- EVENTOS DE INICIALIZACIÓN ---

// Escuchar el evento de base de datos lista
document.addEventListener('databaseReady', () => {
    console.log('Base de datos conectada, inicializando aplicación...');
    initializeApp();
});

// Fallback: Si no hay connection manager, inicializar después de un delay
document.addEventListener('DOMContentLoaded', () => {
    // Actualizar contador del carrito al cargar la página
    updateCartCounter();
    
    // Inicializar aplicación directamente
    console.log('Inicializando aplicación...');
    initializeApp();
});