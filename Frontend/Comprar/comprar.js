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
  3: [{ nombre: "Creps de jamón y queso con papas rústicas", descripcion: "Suaves creps rellenos.", precio:195.00, Images:["../img/comprar/creps.png"] }],
  4: [{ nombre: "Ravioles con tuco", descripcion: "Pasta rellena con una salsa tradicional.", precio:195.00, Images:["../img/comprar/Ravioles-con-tuco-Photoroom.png"] }],
  5: [{ nombre: "Muslo de pollo con arroz, choclo y arvejas", descripcion: "Un plato completo.", precio:195.00, Images:["../img/comprar/muslo-arroz.png"] }]
};

function mostrarPlatosDelDia() {
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
}

function agregarEventosAgregarCarritoPlatosDia(platos, hoy) {
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
}

// Envía al backend (add_to_cart.php) — ajusta ruta si es necesario
async function addToCart(item) {
  const res = await fetch('/ProyectoFinal2025-main/Backend/routes/add_to_cart.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Error en addToCart');
  }
  return res.json();
}

// micro-refresco: obtiene carrito y actualiza contador/elementos simples
async function refreshCart() {
  try {
    const res = await fetch('/ProyectoFinal2025-main/Backend/routes/get_cart.php');
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
        const li = document.createElement('div');
        li.className = 'cart-item';
        li.innerHTML = `<strong>${it.name}</strong> <span class="small-muted">x${it.quantity}</span>`;
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