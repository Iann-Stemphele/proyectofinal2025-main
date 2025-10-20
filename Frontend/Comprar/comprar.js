/* Muestra una notificación personalizada en el centro de la pantalla.
 * @param {string} mensaje El texto que mostrará la notificación.
 * @param {number} duracion La duración en milisegundos (ej. 3000 = 3 segundos).
 */
function mostrarNotificacion(mensaje, duracion = 2000) {
  const notificacionExistente = document.getElementById('custom-notification');
  if (notificacionExistente) notificacionExistente.remove();

  const notificacion = document.createElement('div');
  notificacion.id = 'custom-notification';
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);

  setTimeout(() => notificacion.classList.add('show'), 10);

  setTimeout(() => {
    notificacion.classList.remove('show');
    setTimeout(() => notificacion.remove(), 400);
  }, duracion);
}

/* Datos platos por día */
const platosPorDia = {
  1: [{ nombre: "Bondiola a la pizza con puré", descripcion: "Deliciosa bondiola de cerdo con salsa de tomate y muzzarella.", precio:195.00, Images:["../img/comprar/bondiola.png"] }],
  2: [{ nombre: "Arroz amarillo con pollo y vegetales", descripcion: "Un clásico casero.", precio:195.00, Images:["../img/comprar/arroz amarillo con polo.png"] }],
  3: [{ nombre: "Creps de jamón y queso con papas rústicas", descripcion: "Suaves creps rellenos.", precio
  4: [{ nombre: "Ravioles con tuco", descripcion: "Pasta rellena con una salsa tradicional.", precio:195.00, Images:["../img/comprar/Ravioles-con-tuco-Photoroom.png"] }],
  5: [{ nombre: "Muslo de pollo con arroz, choclo y arvejas", descripcion: "Un plato completo.", precio:195.00, Images:["../img/comprar/muslo-arroz.png"] }]
};

/* function mostrarPlatosDelDia() {
  const hoy = new Date().getDay();
  const platos = platosPorDia[hoy] || [];
  const lista = document.getElementById('platos-dia-lista');
  if (!lista) return;

  if (platos.length === 0) {
    lista.innerHTML = "<p>No hay platos del día disponibles.</p>";
    return;
  }

  let html = "<ul>";
  platos.forEach((plato, idx) => {
    const imgSrc = plato.Images && plato.Images[0] ? plato.Images[0] : '';
    html += `<li class="plato-dia-item">
      <img src="${imgSrc}" alt="${plato.nombre}" class="plato-dia-img"/>
      <div class="plato-dia-info">
        <span class="plato-nombre">${plato.nombre}</span>
        <span class="plato-desc">${plato.descripcion}</span>
        <span class="plato-precio">$${plato.precio.toFixed(2)}</span>
      </div>
      <button class="plato-agregar-btn" data-idx="${idx}" data-dia="${hoy}">Agregar al carrito</button>
    </li>`;
  });
  html += "</ul>";
  lista.innerHTML = html;

  agregarEventosAgregarCarritoPlatosDia(platos, hoy);
}*/

/* function agregarEventosAgregarCarritoPlatosDia(platos, hoy) {
  const botones = document.querySelectorAll('.plato-agregar-btn');
  botones.forEach(boton => {
    boton.addEventListener('click', async function() {
      const idx = parseInt(this.getAttribute('data-idx'), 10);
      const plato = platos[idx];
      const productIdMap = {1:{0:200},2:{0:201},3:{0:202},4:{0:203},5:{0:204}};
      const productId = productIdMap[hoy] ? productIdMap[hoy][idx] : null;
      if (!productId) {
        mostrarNotificacion("Producto no disponible");
        return;
      }
      const producto = {
        id: productId,
        name: plato.nombre,
        price: parseFloat(plato.precio) || 0,
        image: plato.Images ? plato.Images[0] : ''
      };

      // Use addToCart (real request) and micro-refresco
      try {
        await addToCart(producto);
        mostrarNotificacion(`"${plato.nombre}" se agregó al carrito`);
        await refreshCart(); // micro-refresco (actualiza contador/DOM)
      } catch (err) {
        console.error('Error añadiendo al carrito:', err);
        mostrarNotificacion('Error al añadir al carrito', 2500);
      }
    });
  });
}*/

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

// Envía al backend (add_to_cart.php) — ajusta ruta si es necesario
async function addToCart(item) {
  // RUTA corregida (minusculas)
  const url = '/proyectofinal2025-main/Backend/routes/add_to_cart.php';

  // Optimistic UI: actualizar contador y lista inmediatamente
  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');
  const prevCount = countEl ? parseInt(countEl.textContent || '0', 10) : 0;

  const tempId = 'temp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  if (countEl) countEl.textContent = prevCount + 1;
  if (itemsEl) {
    const tempEl = createCartItemElement(item, tempId);
    // añadir al principio para feedback inmediato
    itemsEl.prepend(tempEl);
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || 'Error en addToCart');
    }
    const json = await res.json();

    // Si el backend devuelve el item real o id, podemos reemplazar el temporal
    if (itemsEl) {
      const tempEl = itemsEl.querySelector(`[data-temp-id="${tempId}"]`);
      if (tempEl) {
        // si backend devuelve nombre/qty actualizados, reflejarlos
        const backendItem = (json.item || json.item_added || null);
        if (backendItem) {
          tempEl.innerHTML = `<strong>${escapeHtml(backendItem.name || backendItem.nombre || item.name)}</strong> <span class="small-muted">x${escapeHtml(backendItem.quantity || backendItem.cantidad || item.quantity || 1)}</span>`;
          if (backendItem.id) tempEl.setAttribute('data-product-id', backendItem.id);
        }
        // quitar marca temporal
        tempEl.removeAttribute('data-temp-id');
      }
    }

    return json;
  } catch (err) {
    // Revertir optimistic UI en caso de error
    if (countEl) countEl.textContent = Math.max(0, prevCount);
    if (itemsEl) {
      const tempEl = itemsEl.querySelector(`[data-temp-id="${tempId}"]`);
      if (tempEl) tempEl.remove();
    }
    throw err;
  }
}

// micro-refresco: obtiene carrito y actualiza contador/elementos simples
async function refreshCart() {
  try {
    // RUTA corregida (minusculas)
    const res = await fetch('/proyectofinal2025-main/Backend/routes/get_cart.php');
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
document.addEventListener('DOMContentLoaded', mostrarPlatosDelDia);
document.addEventListener('DOMContentLoaded', refreshCart);

/* ---------- Validación y creación dinámica del botón MercadoPago ---------- */
(function(){
  // Intentar localizar inputs (adapta si tus inputs tienen otros ids)
  const nameInput = document.querySelector('#customer-name') || document.querySelector('input[name="name"]') || null;
  const emailInput = document.querySelector('#customer-email') || document.querySelector('input[name="email"]') || null;
  const addressInput = document.querySelector('#customer-address') || document.querySelector('input[name="address"]') || null;

  // Contenedor donde se mostrará mensaje y botón (crear si no existe)
  let container = document.querySelector('#mp-button-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'mp-button-container';
    container.style.marginTop = '12px';
    // intenta insertar cerca del formulario o al final del body
    const form = document.querySelector('form') || document.body;
    form.appendChild(container);
  }

  // Elementos dinámicos
  let infoEl = container.querySelector('.mp-info');
  let mpBtn = container.querySelector('#mp-pay-btn');

  function createInfo() {
    if (!infoEl) {
      infoEl = document.createElement('div');
      infoEl.className = 'mp-info';
      infoEl.style.color = '#b30000';
      infoEl.style.marginBottom = '8px';
      infoEl.style.fontWeight = '600';
      container.prepend(infoEl);
    }
  }

  function removeInfo() {
    if (infoEl) { infoEl.remove(); infoEl = null; }
  }

  function createMpButton() {
    if (mpBtn) return mpBtn;
    mpBtn = document.createElement('button');
    mpBtn.id = 'mp-pay-btn';
    mpBtn.type = 'button';
    mpBtn.textContent = 'Pagar con MercadoPago';
    mpBtn.style.background = '#3483FA';
    mpBtn.style.color = '#fff';
    mpBtn.style.border = 'none';
    mpBtn.style.padding = '10px 14px';
    mpBtn.style.borderRadius = '4px';
    mpBtn.style.cursor = 'pointer';
    mpBtn.style.fontWeight = '700';
    container.appendChild(mpBtn);
    mpBtn.addEventListener('click', onMpClick);
    return mpBtn;
  }

  function removeMpButton() {
    if (mpBtn) { mpBtn.removeEventListener('click', onMpClick); mpBtn.remove(); mpBtn = null; }
  }

  function listMissingFields() {
    const missing = [];
    if (!nameInput || nameInput.value.trim().length < 3) missing.push('Nombre (mín 3 caracteres)');
    if (!emailInput || !emailInput.value.includes('@')) missing.push('Email válido');
    if (!addressInput || addressInput.value.trim().length < 5) missing.push('Dirección (mín 5 caracteres)');
    return missing;
  }

  function updatePaymentUI() {
    const missing = listMissingFields();
    if (missing.length) {
      createInfo();
      infoEl.textContent = 'Completa los campos: ' + missing.join(', ');
      // marcar inputs en rojo mínimamente
      [nameInput, emailInput, addressInput].forEach(i => {
        if (!i) return;
        const ok = !( (i === nameInput && i.value.trim().length < 3) ||
                      (i === emailInput && !i.value.includes('@')) ||
                      (i === addressInput && i.value.trim().length < 5) );
        i.style.outline = ok ? '' : '2px solid #ff6b6b';
      });
      removeMpButton();
    } else {
      removeInfo();
      [nameInput, emailInput, addressInput].forEach(i => { if (i) i.style.outline = ''; });
      createMpButton();
    }
  }

  // Escucha cambios en inputs
  [nameInput, emailInput, addressInput].forEach(i => {
    if (!i) return;
    i.addEventListener('input', updatePaymentUI);
    i.addEventListener('blur', updatePaymentUI);
  });

  // Inicializar UI al cargar
  document.addEventListener('DOMContentLoaded', updatePaymentUI);
  // Si los inputs ya existen fuera de DOMContentLoaded, invoca ahora
  updatePaymentUI();

  // Obtener items del carrito desde el backend (falla segura si no hay items)
  async function fetchCartItems() {
    try {
      const res = await fetch('/proyectofinal2025-main/Backend/routes/get_cart.php');
      if (!res.ok) return [];
      const json = await res.json();
      // Espera un formato { items: [{ id, quantity, price, name }, ... ] }
      return (json.items || []).map(it => {
        return {
          id: it.id || it.producto_id || it.producto || null,
          quantity: it.quantity || it.cantidad || it.qty || 1,
          price: it.price || it.precio || 0,
          name: it.name || it.nombre || ''
        };
      });
    } catch (e) {
      console.error('fetchCartItems error', e);
      return [];
    }
  }

  // Manejo click del botón MP: abre ventana en blanco y luego la navega al init_point
  async function onMpClick(e) {
    e.preventDefault();
    // abre la pestaña en el mismo evento de usuario
    const paymentWin = window.open('', '_blank');

    // indica al usuario que se está procesando
    createInfo();
    infoEl.style.color = '#333';
    infoEl.textContent = 'Creando preferencia de pago...';

    // recopilar items
    const items = await fetchCartItems();
    if (!items.length) {
      if (paymentWin) paymentWin.close();
      infoEl.style.color = '#b30000';
      infoEl.textContent = 'El carrito está vacío. Agrega productos antes de pagar.';
      return;
    }

    const payload = {
      customer: {
        name: nameInput ? nameInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        address: addressInput ? addressInput.value.trim() : ''
      },
      items: items
    };

    try {
      const res = await fetch('/proyectofinal2025-main/Backend/routes/create_preference.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data && data.init_point) {
        // navega la pestaña abierta al init_point (no será bloqueado)
        try {
          paymentWin.location.href = data.init_point;
        } catch (err) {
          // fallback
          window.open(data.init_point, '_blank');
          if (paymentWin) paymentWin.close();
        }
        // opcional: redirigir la pestaña actual a página de espera/estado
        if (data.order_id) {
          window.location.href = `/proyectofinal2025-main/Frontend/order_waiting.html?order_id=${encodeURIComponent(data.order_id)}`;
        } else {
          removeInfo();
        }
      } else {
        if (paymentWin) paymentWin.close();
        infoEl.style.color = '#b30000';
        infoEl.textContent = 'Error creando preferencia de pago. Intenta nuevamente.';
        console.error('create_preference response:', data);
      }
    } catch (err) {
      console.error('Error creando preferencia MP:', err);
      if (paymentWin) paymentWin.close();
      infoEl.style.color = '#b30000';
      infoEl.textContent = 'Error de red al crear preferencia de pago.';
    }
  }

})();

// --- Bind botones "Agregar al carrito" (soporta múltiples selectores y delegación) ---
(function(){
  const selectors = [
    '.add-to-cart',
    '.agregar-carrito',
    '.plato-agregar-btn',
    '.add-cart-btn',
    '[data-add-to-cart]'
  ].join(',');

  // Extrae datos del botón/elemento y normaliza el item
  function itemFromButton(btn) {
    const pid = btn.dataset.productId || btn.getAttribute('data-product-id') || btn.dataset.id || btn.getAttribute('data-id');
    const name = btn.dataset.name || btn.getAttribute('data-name') || (btn.closest('.product') && btn.closest('.product').querySelector('.product-name') ? btn.closest('.product').querySelector('.product-name').textContent.trim() : '');
    const priceAttr = btn.dataset.price || btn.getAttribute('data-price') || (btn.closest('.product') && btn.closest('.product').querySelector('.product-price') ? btn.closest('.product').querySelector('.product-price').dataset.price || btn.closest('.product').querySelector('.product-price').textContent : '');
    const price = parseFloat(String(priceAttr || '').replace(/[^0-9\.,-]/g,'').replace(',','.')) || 0;
    const qty = parseInt(btn.dataset.qty || btn.getAttribute('data-qty') || '1', 10) || 1;
    return { id: pid ? parseInt(pid,10) : null, name: name || '', quantity: qty, price };
  }

  // Maneja click en botones (optimistic UI + backend)
  async function onAddButtonClick(e) {
    const btn = e.target.closest && e.target.closest(selectors);
    if (!btn) return;
    e.preventDefault();

    const item = itemFromButton(btn);
    if (!item.id) {
      // si no hay id, aún se puede enviar (nombre/price) o mostrar error
      mostrarNotificacion('Producto inválido', 2000);
      return;
    }

    try {
      await addToCart(item);    // función existente en el archivo
      mostrarNotificacion(`"${item.name || 'Producto'}" agregado al carrito`, 1800);
      // micro-refresco del carrito
      await refreshCart();
    } catch (err) {
      console.error('Error al añadir al carrito:', err);
      mostrarNotificacion('Error al añadir al carrito', 2500);
    }
  }

  // Delegación: escucha clicks en todo el documento
  document.addEventListener('click', function(e){
    const btn = e.target.closest && e.target.closest(selectors);
    if (btn) onAddButtonClick(e);
  }, false);

  // También intenta enlazar botones estáticos al cargar (por si no quieres delegación)
  function bindStaticButtons() {
    document.querySelectorAll(selectors).forEach(b => {
      // evita duplicar listeners si ya los tiene
      if (!b._addToCartBound) {
        b.addEventListener('click', onAddButtonClick);
        b._addToCartBound = true;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', bindStaticButtons);
  // si tu HTML genera botones después, llama bindStaticButtons() otra vez tras renderizar.

})();