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