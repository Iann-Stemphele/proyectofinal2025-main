function mostrarNotificacion(mensaje, duracion = 2000) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #28a745; color: white;
        padding: 12px 20px; border-radius: 4px; z-index: 10000; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    setTimeout(() => document.body.removeChild(notif), duracion);
}

// helper para escapar texto seguro en el DOM
function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str).replace(/[&<>"'`=\/]/g, function (s) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    }[s];
  });
}

// crea elemento visual del item en el carrito (puede ser temporal)
function createCartItemElement(item, tempId) {
  const li = document.createElement('div');
  li.className = 'cart-item';
  if (tempId) li.setAttribute('data-temp-id', tempId);
  if (item.id) li.setAttribute('data-product-id', item.id);
  li.innerHTML = `<strong>${escapeHtml(item.name || 'Producto')}</strong> <span class="small-muted">x${escapeHtml(item.quantity || 1)}</span>`;
  return li;
}

// Platos del día de lunes a viernes
const PLATOS_DIA = {
    1: { id: 200, nombre: 'Bondiola a la pizza con puré' },           // Lunes
    2: { id: 201, nombre: 'Arroz amarillo con pollo y vegetales' },  // Martes
    3: { id: 202, nombre: 'Creps de jamón y queso con papas rústicas' }, // Miércoles
    4: { id: 203, nombre: 'Ravioles con tuco' },                     // Jueves
    5: { id: 204, nombre: 'Muslo de pollo con arroz, choclo y arvejas' } // Viernes
};

// Función para obtener el plato del día actual
function getPlatoDelDia() {
    const hoy = new Date().getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    
    // Solo de lunes a viernes
    if (hoy >= 1 && hoy <= 5) {
        return PLATOS_DIA[hoy];
    }
    return null; // Fines de semana no hay plato del día
}

// Mostrar plato del día al abrir modal de comprar
async function mostrarPlatoDelDia() {
    const platoHoy = getPlatoDelDia();
    const modalPlatosDia = document.getElementById('modal-platos-dia');
    const listaPlatosDia = document.getElementById('platos-dia-lista');
    
    if (!platoHoy) {
        listaPlatosDia.innerHTML = '<p style="text-align:center; color:#999;">Los platos del día están disponibles de lunes a viernes.</p>';
        return;
    }
    
    try {
        // Obtener datos del producto desde la BD
        const response = await fetch(`Backend/routes/categorias.php?categoria=platos-del-dia`);
        const productos = await response.json();
        const plato = productos.find(p => p.id_Producto == platoHoy.id);
        
        if (!plato) {
            listaPlatosDia.innerHTML = '<p style="text-align:center; color:#999;">No hay plato disponible hoy.</p>';
            return;
        }
        
        // Crear card del plato del día
        const cardHTML = `
            <div class="product-card product-card--centered">
                <div class="product-card-content">
                    <h3 class="product-name">${plato.nombre}</h3>
                    <p class="product-description">${plato.descripcion || 'Plato especial del día'}</p>
                    <p class="product-price">$${plato.precio}</p>
                    <button class="add-to-cart-btn" data-product='${JSON.stringify({
                        id: plato.id_Producto,
                        name: plato.nombre,
                        price: plato.precio,
                        description: plato.descripcion
                    })}'>
                        <i class='bx bx-cart-add'></i> Añadir al Carrito
                    </button>
                </div>
            </div>
        `;
        
        listaPlatosDia.innerHTML = cardHTML;
        
        // Agregar event listener al botón
        const addBtn = listaPlatosDia.querySelector('.add-to-cart-btn');
        addBtn.addEventListener('click', function() {
            const producto = JSON.parse(this.getAttribute('data-product'));
            addToCart(producto);
        });
        
    } catch (error) {
        console.error('Error cargando plato del día:', error);
        listaPlatosDia.innerHTML = '<p style="text-align:center; color:#ff6a00;">Error al cargar el plato del día.</p>';
    }
}

// Abrir modal de comprar con plato del día
document.getElementById('abrirModalcomprar')?.addEventListener('click', function(e) {
    e.preventDefault();
    const modalPlatosDia = document.getElementById('modal-platos-dia');
    if (modalPlatosDia) {
        modalPlatosDia.style.display = 'block';
        mostrarPlatoDelDia();
    }
});

// Cerrar modal platos del día
document.getElementById('close-platos-dia')?.addEventListener('click', function() {
    document.getElementById('modal-platos-dia').style.display = 'none';
});

// Función para mostrar platos del día en el modal
window.mostrarPlatosDelDia = async function() {
  const platosDiaLista = document.getElementById('platos-dia-lista');
  if (!platosDiaLista) return;

  platosDiaLista.innerHTML = '<p>Cargando platos del día...</p>';

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

      // Agregar event listeners para los botones de agregar
      document.querySelectorAll('.agregar-plato-dia').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = parseInt(this.dataset.id);
          const nombre = this.dataset.nombre;
          const precio = parseFloat(this.dataset.precio);

          // Usar el mismo sistema que el resto del sitio (localStorage altCart)
          let cart = JSON.parse(localStorage.getItem('altCart')) || [];
          const existingProductIndex = cart.findIndex(item => item.id == id);
          
          if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
          } else {
            cart.push({ id: id, name: nombre, price: precio, quantity: 1 });
          }
          
          localStorage.setItem('altCart', JSON.stringify(cart));

          // Actualizar contador del carrito si existe
          const cartCounter = document.getElementById('cart-counter');
          if (cartCounter) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCounter.textContent = totalItems;
          }

          // Feedback visual
          mostrarNotificacion(`"${nombre}" se agregó al carrito`);
          
          this.textContent = 'Agregado!';
          this.disabled = true;
          setTimeout(() => {
            this.textContent = 'Agregar al carrito';
            this.disabled = false;
          }, 1000);
        });
      });
    }
  } catch (error) {
    platosDiaLista.innerHTML = '<p>Error al cargar los platos del día.</p>';
    console.error('Error:', error);
  }
};

// Función para actualizar el carrito desde el backend
async function refreshCart() {
  try {
    // RUTA corregida (minusculas)
    const res = await fetch('Backend/routes/get_cart.php');
    if (!res.ok) return;
    const json = await res.json();
    // Actualiza contador si existe elemento con id 'cart-count'
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = (json.items ? json.items.length : 0);
    // Si tienes un panel de items, actualízalo (id 'cart-items')
    const itemsEl = document.getElementById('cart-items');
    if (itemsEl) {
      itemsEl.innerHTML = '';
      (json.items || []).forEach(it => {
        const li = createCartItemElement({
          id: it.id || it.producto_id || it.producto,
          name: it.name || it.nombre || it.producto,
          quantity: it.quantity || it.cantidad || it.qty || 1
        });
        itemsEl.appendChild(li);
      });
    }
  } catch (err) {
    console.error('refreshCart error:', err);
  }
}

// Ejecutar al cargar para sincronizar contador
document.addEventListener('DOMContentLoaded', refreshCart);

// Función mejorada para cargar productos por categoría
async function cargarProductosPorCategoria(categoria) {
    try {
        const response = await fetch(`Backend/routes/categorias.php?categoria=${categoria}`);
        const productos = await response.json();
        
        const masInfoLista = document.getElementById('mas-info-lista');
        
        if (productos.length === 0) {
            masInfoLista.innerHTML = '<p style="text-align:center; color:#999;">No hay productos disponibles en esta categoría.</p>';
            return;
        }
        
        // Crear grid de productos con altura uniforme
        masInfoLista.innerHTML = `
            <div class="productos-grid">
                ${productos.map(producto => `
                    <div class="product-card">
                        <div class="product-card-content">
                            <h3 class="product-name">${producto.nombre}</h3>
                            <p class="product-description">${producto.descripcion || 'Sin descripción'}</p>
                            <div class="product-card-footer">
                                <p class="product-price">$${producto.precio}</p>
                                <button class="add-to-cart-btn" data-product='${JSON.stringify({
                                    id: producto.id_Producto,
                                    name: producto.nombre,
                                    price: producto.precio,
                                    description: producto.descripcion
                                })}'>
                                    <i class='bx bx-cart-add'></i> Añadir
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Agregar event listeners a los botones
        masInfoLista.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const producto = JSON.parse(this.getAttribute('data-product'));
                addToCart(producto);
            });
        });
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        document.getElementById('mas-info-lista').innerHTML = '<p style="text-align:center; color:#ff6a00;">Error al cargar los productos.</p>';
    }
}

// Abrir modal de categorías desde el nav y desde el botón hero
document.getElementById('productos-nav-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    const modalMenu = document.getElementById('miModal');
    if (modalMenu) modalMenu.style.display = 'block';
});
document.getElementById('abrirModalBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    const modalMenu = document.getElementById('miModal');
    if (modalMenu) modalMenu.style.display = 'block';
});

function hideCategoriesModalClose(hide = true) {
  // miModal es el modal de las categorías (el grande con las columnas)
  const categoriesModal = document.getElementById('miModal');
  if (!categoriesModal) return;
  const closeBtn = categoriesModal.querySelector('.close-button');
  if (!closeBtn) return;
  closeBtn.style.display = hide ? 'none' : '';
}

// Inicializa botones "Clickear aqui..." dentro del modal de categorías (miModal)
function initBtnsMasInfo() {
  document.querySelectorAll('.btn-mas-info').forEach(btn=>{
    btn.removeEventListener('click', btn._handler);
    btn._handler = async function (ev) {
      const categoria = btn.getAttribute('data-categoria');
      const masInfoModal = document.getElementById('modal-mas-info');
      // Abrir modal-mas-info
      if (masInfoModal) masInfoModal.style.display = 'block';

      // OCULTAR la X del modal de categorías (miModal) para que no quede visible por encima
      hideCategoriesModalClose(true);

      // cargar productos en mas-info
      await cargarProductosPorCategoria(categoria);
    };
    btn.addEventListener('click', btn._handler);
  });
}

// Al cerrar modal-mas-info, restaurar la X del modal de categorías
document.getElementById('close-mas-info')?.addEventListener('click', function(){
  const masInfo = document.getElementById('modal-mas-info');
  if (masInfo) masInfo.style.display = 'none';
  // restaurar la X del modal de categorias
  hideCategoriesModalClose(false);
});

// También restaurar la X si el usuario cierra el modal-mas-info tocando fuera (delegación)
document.addEventListener('click', function(ev){
  const t = ev.target;
  // Si cerramos un alt-modal-container (modal-mas-info) por overlay clic, restaurar
  if (t.matches('.alt-modal-container') && t.querySelector('#modal-mas-info')) {
    const inner = t.querySelector('#modal-mas-info');
    if (inner && inner.style.display === 'none') {
      hideCategoriesModalClose(false);
    }
  }
});

// Asegurar que si se abre modal-platos-dia tambien se oculte la X del modal de categorias
document.getElementById('abrirModalcomprar')?.addEventListener('click', function(e){
  e.preventDefault();
  const modal = document.getElementById('modal-platos-dia');
  if (modal) {
    modal.style.display = 'block';
    mostrarPlatoDelDia();
    hideCategoriesModalClose(true);
  }
});

// Si el modal de platos del dia se cierra, restaurar la X del modal de categorias
document.getElementById('close-platos-dia')?.addEventListener('click', function() {
  document.getElementById('modal-platos-dia').style.display = 'none';
  hideCategoriesModalClose(false);
});

// Función para mostrar platos del día en el modal
window.mostrarPlatosDelDia = async function() {
  const platosDiaLista = document.getElementById('platos-dia-lista');
  if (!platosDiaLista) return;

  platosDiaLista.innerHTML = '<p>Cargando platos del día...</p>';

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

      // Agregar event listeners para los botones de agregar
      document.querySelectorAll('.agregar-plato-dia').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = parseInt(this.dataset.id);
          const nombre = this.dataset.nombre;
          const precio = parseFloat(this.dataset.precio);

          // Usar el mismo sistema que el resto del sitio (localStorage altCart)
          let cart = JSON.parse(localStorage.getItem('altCart')) || [];
          const existingProductIndex = cart.findIndex(item => item.id == id);
          
          if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
          } else {
            cart.push({ id: id, name: nombre, price: precio, quantity: 1 });
          }
          
          localStorage.setItem('altCart', JSON.stringify(cart));

          // Actualizar contador del carrito si existe
          const cartCounter = document.getElementById('cart-counter');
          if (cartCounter) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCounter.textContent = totalItems;
          }

          // Feedback visual
          mostrarNotificacion(`"${nombre}" se agregó al carrito`);
          
          this.textContent = 'Agregado!';
          this.disabled = true;
          setTimeout(() => {
            this.textContent = 'Agregar al carrito';
            this.disabled = false;
          }, 1000);
        });
      });
    }
  } catch (error) {
    platosDiaLista.innerHTML = '<p>Error al cargar los platos del día.</p>';
    console.error('Error:', error);
  }
};

// Función para actualizar el carrito desde el backend
async function refreshCart() {
  try {
    // RUTA corregida (minusculas)
    const res = await fetch('Backend/routes/get_cart.php');
    if (!res.ok) return;
    const json = await res.json();
    // Actualiza contador si existe elemento con id 'cart-count'
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = (json.items ? json.items.length : 0);
    // Si tienes un panel de items, actualízalo (id 'cart-items')
    const itemsEl = document.getElementById('cart-items');
    if (itemsEl) {
      itemsEl.innerHTML = '';
      (json.items || []).forEach(it => {
        const li = createCartItemElement({
          id: it.id || it.producto_id || it.producto,
          name: it.name || it.nombre || it.producto,
          quantity: it.quantity || it.cantidad || it.qty || 1
        });
        itemsEl.appendChild(li);
      });
    }
  } catch (err) {
    console.error('refreshCart error:', err);
  }
}

// Ejecutar al cargar para sincronizar contador
document.addEventListener('DOMContentLoaded', refreshCart);

// Función mejorada para cargar productos por categoría
async function cargarProductosPorCategoria(categoria) {
    try {
        const response = await fetch(`Backend/routes/categorias.php?categoria=${categoria}`);
        const productos = await response.json();
        
        const masInfoLista = document.getElementById('mas-info-lista');
        
        if (productos.length === 0) {
            masInfoLista.innerHTML = '<p style="text-align:center; color:#999;">No hay productos disponibles en esta categoría.</p>';
            return;
        }
        
        // Crear grid de productos con altura uniforme
        masInfoLista.innerHTML = `
            <div class="productos-grid">
                ${productos.map(producto => `
                    <div class="product-card">
                        <div class="product-card-content">
                            <h3 class="product-name">${producto.nombre}</h3>
                            <p class="product-description">${producto.descripcion || 'Sin descripción'}</p>
                            <div class="product-card-footer">
                                <p class="product-price">$${producto.precio}</p>
                                <button class="add-to-cart-btn" data-product='${JSON.stringify({
                                    id: producto.id_Producto,
                                    name: producto.nombre,
                                    price: producto.precio,
                                    description: producto.descripcion
                                })}'>
                                    <i class='bx bx-cart-add'></i> Añadir
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Agregar event listeners a los botones
        masInfoLista.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const producto = JSON.parse(this.getAttribute('data-product'));
                addToCart(producto);
            });
        });
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        document.getElementById('mas-info-lista').innerHTML = '<p style="text-align:center; color:#ff6a00;">Error al cargar los productos.</p>';
    }
}

// Abrir modal de categorías desde el nav y desde el botón hero
document.getElementById('productos-nav-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    const modalMenu = document.getElementById('miModal');
    if (modalMenu) modalMenu.style.display = 'block';
});
document.getElementById('abrirModalBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    const modalMenu = document.getElementById('miModal');
    if (modalMenu) modalMenu.style.display = 'block';
});

// Manejo de botones "Clickear aqui para más información y ver productos"
function initBtnsMasInfo() {
    document.querySelectorAll('.btn-mas-info').forEach(btn => {
        btn.removeEventListener('click', btn._masInfoHandler);
        btn._masInfoHandler = async function (e) {
            const categoria = btn.getAttribute('data-categoria');
            // Abrir modal de mas info
            const masInfoModal = document.getElementById('modal-mas-info');
            if (masInfoModal) masInfoModal.style.display = 'block';
            // título
            const titulo = document.getElementById('mas-info-titulo');
            if (titulo) titulo.textContent = btn.closest('.col')?.querySelector('h1')?.textContent?.trim() || categoria;
            // cargar productos de la categoría
            await cargarProductosPorCategoria(categoria);
        };
        btn.addEventListener('click', btn._masInfoHandler);
    });
}
// iniciar al cargar script
initBtnsMasInfo();

// Delegación para cerrar cualquier modal con .alt-close-button, .close-button o mini-menu-close
document.addEventListener('click', function(e) {
    const t = e.target;
    // alt-close-button con data-modal-id
    if (t.matches('.alt-close-button') && t.dataset.modalId) {
        const mid = document.getElementById(t.dataset.modalId);
        if (mid) mid.style.display = 'none';
    }
    // botones que solo cierran el modal padre
    if (t.matches('.alt-close-button') && !t.dataset.modalId) {
        const parentModal = t.closest('.alt-modal-container, .modal, .mini-menu');
        if (parentModal) parentModal.style.display = 'none';
    }
    if (t.matches('.close-button')) {
        const parentModal = t.closest('.modal, #carritoModal');
        if (parentModal) parentModal.style.display = 'none';
    }
    if (t.matches('.mini-menu-close')) {
        const mini = t.getAttribute('data-mini');
        if (mini) {
            const el = document.getElementById('mini-menu-' + mini);
            if (el) el.style.display = 'none';
        }
    }
});

// Cerrar modal-mas-info con su X
document.getElementById('close-mas-info')?.addEventListener('click', function(){
    document.getElementById('modal-mas-info').style.display = 'none';
});

// Re-inicializar handlers cuando el modal de categorías se muestra (por si se generan dinámicamente)
const miModal = document.getElementById('miModal');
if (miModal) {
    const observer = new MutationObserver(() => { initBtnsMasInfo(); });
    observer.observe(miModal, { childList: true, subtree: true });
}

/* Añadir función addToCart usada por los botones de "Añadir" (Platos del Día y categorías)
   Envía petición POST a Backend/routes/add_to_cart.php con { producto, cantidad } y actualiza UI */
async function addToCart(product, cantidad = 1) {
  try {
    const payload = { producto: product, cantidad };
    const res = await fetch('Backend/routes/add_to_cart.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (res.ok && json.ok) {
      // actualizar contador visual si existe
      const counter = document.getElementById('cart-counter') || document.querySelector('.cart-counter');
      if (counter) {
        const total = json.total_items ?? (json.items ? json.items.reduce((s,i)=>s + (i.quantity||i.cantidad||0),0) : null);
        if (total !== null) counter.textContent = total;
        else counter.textContent = (parseInt(counter.textContent||'0',10) + Number(cantidad));
      }
      // feedback al usuario
      mostrarNotificacion(`${product.name || product.nombre || 'Producto'} agregado al carrito`);
      return { ok: true, json };
    } else {
      console.error('addToCart failed', json);
      mostrarNotificacion('No se pudo agregar al carrito', 2000);
      return { ok: false, json };
    }
  } catch (err) {
    console.error('addToCart error', err);
    mostrarNotificacion('Error de conexión', 2000);
    return { ok: false, error: err.message || err };
  }
}

/* --- FLUJO REAL DE PAGO (EFECTIVO) --- */

// Abrir modal de pago desde el carrito
document.getElementById('alt-open-payment-modal')?.addEventListener('click', function (e) {
  e.preventDefault();
  // cerrar modal del carrito y abrir modal de pago
  const modalCart = document.getElementById('alt-modal-cart');
  if (modalCart) modalCart.style.display = 'none';
  const paymentModal = document.getElementById('alt-modal-payment');
  if (paymentModal) paymentModal.style.display = 'block';
  // por defecto mostrar opciones; ocultar formularios específicos
  document.getElementById('alt-customer-info-form').style.display = 'none';
  document.getElementById('alt-card-payment-form').style.display = 'none';
});

// Mostrar formulario de pago en efectivo (retiro)
document.getElementById('alt-pay-cash')?.addEventListener('click', function () {
  const form = document.getElementById('alt-customer-info-form');
  const cardForm = document.getElementById('alt-card-payment-form');
  if (form) form.style.display = 'block';
  if (cardForm) cardForm.style.display = 'none';
});

// Confirmar pedido en efectivo: enviar orden al backend y mostrar confirmación
document.getElementById('alt-confirm-order')?.addEventListener('click', async function () {
  const name = document.getElementById('alt-customer-name')?.value || '';
  const lastname = document.getElementById('alt-customer-lastname')?.value || '';
  const email = document.getElementById('alt-customer-email')?.value || '';
  const phone = document.getElementById('alt-customer-phone')?.value || '';

  if (!name || !phone) {
    mostrarNotificacion('Por favor completa nombre y teléfono', 2000);
    return;
  }

  try {
    // Obtener carrito desde servidor para tener items oficiales
    const cartRes = await fetch('Backend/routes/get_cart.php');
    if (!cartRes.ok) throw new Error('No se pudo obtener el carrito');
    const cartJson = await cartRes.json();
    const items = (cartJson.items || []).map(i => ({
      id: i.id ?? i.id_producto,
      name: i.name || i.nombre,
      price: i.price ?? i.precio,
      quantity: i.quantity ?? i.cantidad
    }));
    if (!items.length) {
      mostrarNotificacion('El carrito está vacío', 1800);
      return;
    }

    // Enviar al backend para crear pedido en efectivo
    const payload = {
      customer: { name, lastname, email, phone },
      items,
      payment: 'efectivo'
    };
    const res = await fetch('Backend/routes/create_cash_order.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (res.ok && json.ok) {
      // mostrar confirmación, insertar teléfono en mensaje
      const confirmMsg = document.getElementById('alt-order-confirmation-message');
      const notifPhone = document.getElementById('alt-notif-customer-phone');
      if (notifPhone) notifPhone.textContent = phone;
      if (confirmMsg) {
        confirmMsg.style.display = 'block';
      }

      // limpiar carrito local (session en backend ya limpiada por create_cash_order)
      try { localStorage.removeItem('altCart'); } catch(e){}

      // poner contador a 0 y animar
      const counterEl = document.getElementById('cart-counter') || document.querySelector('.cart-counter');
      if (counterEl) {
        counterEl.textContent = '0';
        if (typeof animateCartCounter === 'function') animateCartCounter(counterEl);
      }

      // refrescar carrito y contador
      if (typeof refreshCart === 'function') refreshCart();
      if (typeof syncCartCounter === 'function') syncCartCounter();
      mostrarNotificacion('Pedido confirmado. Te avisaremos cuando esté listo.', 2500);
    } else {
      console.error('create_cash_order failed', json);
      mostrarNotificacion('Error creando el pedido. Intenta nuevamente.', 2500);
    }
  } catch (err) {
    console.error('confirm order error', err);
    mostrarNotificacion('Error de conexión al crear el pedido', 2500);
  }
});

// Cerrar notificación de confirmación (botón Entendido)
document.querySelector('.alt-close-notification')?.addEventListener('click', function () {
  const confirmMsg = document.getElementById('alt-order-confirmation-message');
  if (confirmMsg) confirmMsg.style.display = 'none';
  // cerrar modal de pago
  const paymentModal = document.getElementById('alt-modal-payment');
  if (paymentModal) paymentModal.style.display = 'none';
});

// Asegurar que "Pagar con Tarjeta" muestre el form y lance MercadoPago (ya existe initWallet en index)
document.getElementById('alt-pay-card')?.addEventListener('click', function () {
  const cardForm = document.getElementById('alt-card-payment-form');
  const customerForm = document.getElementById('alt-customer-info-form');
  if (cardForm) cardForm.style.display = 'block';
  if (customerForm) customerForm.style.display = 'none';
  // initWallet ya está en index.html / otro script; no duplicar aquí
});

// Cerrar modales al hacer click en el overlay (no sólo en la X)
// Esto facilita cerrar en móviles tocando fuera del cuadro modal
document.querySelectorAll('.alt-modal-container, .modal, .mini-menu').forEach(container => {
  container.addEventListener('click', function (e) {
    // cerrar sólo si el click fue en el contenedor (overlay), no en el contenido
    if (e.target === container) {
      container.style.display = 'none';
    }
  }, { passive: true });
});

// Pequeña animación del contador cuando se actualiza (feedback visual)
function animateCartCounter(el) {
  if (!el) return;
  el.classList.remove('cart-pulse');
  // forzar reflow
  void el.offsetWidth;
  el.classList.add('cart-pulse');
  setTimeout(() => el.classList.remove('cart-pulse'), 600);
}

// Añadir estilo CSS dinámico mínimo para la animación (inserto si no existe)
(function ensureCartPulseStyle(){
  if (document.getElementById('cart-pulse-style')) return;
  const style = document.createElement('style');
  style.id = 'cart-pulse-style';
  style.innerHTML = `
    .cart-pulse { transform: scale(1.12); transition: transform 220ms ease; box-shadow: 0 6px 18px rgba(255,106,0,0.15); }
  `;
  document.head.appendChild(style);
})();

// Asegurarse que addToCart está definida (ya implementada más abajo)
// cuando se use addToCart desde botones, animar contador tras éxito
const originalAddToCart = window.addToCart;
if (typeof originalAddToCart === 'function') {
  // wrap para animar contador cuando la petición es exitosa
  window.addToCart = async function(product, cantidad = 1) {
    const res = await originalAddToCart(product, cantidad);
    if (res && res.ok) {
      const counter = document.getElementById('cart-counter') || document.querySelector('.cart-counter');
      animateCartCounter(counter);
    }
    return res;
  };
}

// Asegurar listeners idempotentes en botones dinámicos (reinicializa)
function attachAddButtons(parent = document) {
  (parent.querySelectorAll('.add-to-cart-btn') || []).forEach(btn => {
    btn.removeEventListener('click', btn._handler);
    btn._handler = function (e) {
      e.preventDefault();
      const producto = JSON.parse(this.getAttribute('data-product') || '{}');
      if (typeof addToCart === 'function') addToCart(producto, 1);
    };
    btn.addEventListener('click', btn._handler);
  });
}

// Re-attach cuando se genera contenido dinámico
const masInfoLista = document.getElementById('mas-info-lista');
if (masInfoLista) {
  const mo = new MutationObserver(() => attachAddButtons(masInfoLista));
  mo.observe(masInfoLista, { childList: true, subtree: true });
}

// Attach ahora a cualquier botón existente
attachAddButtons(document);