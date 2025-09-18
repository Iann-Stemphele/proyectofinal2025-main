/* Muestra una notificación personalizada en el centro de la pantalla.
 * @param {string} mensaje El texto que mostrará la notificación.
 * @param {number} duracion La duración en milisegundos (ej. 3000 = 3 segundos).
 */
function mostrarNotificacion(mensaje, duracion = 2000) {
  // Si ya existe una notificación, la borramos para evitar duplicados
  const notificacionExistente = document.getElementById('custom-notification');
  if (notificacionExistente) {
    notificacionExistente.remove();
  }

  // 1. Creamos el elemento div
  const notificacion = document.createElement('div');
  notificacion.id = 'custom-notification';
  notificacion.textContent = mensaje;

  // 2. Lo añadimos al cuerpo del HTML
  document.body.appendChild(notificacion);

  // 3. Le añadimos la clase 'show' para que aparezca con la transición
  setTimeout(() => {
    notificacion.classList.add('show');
  }, 10);

  // 4. Configuramos que se oculte y se elimine después de la duración indicada
  setTimeout(() => {
    notificacion.classList.remove('show');
    
    setTimeout(() => {
      notificacion.remove();
    }, 400); 
  }, duracion);
}



// LÓGICA DEL MODAL DE PLATOS DEL DÍA (ACTUALIZADA)


// Objeto actualizado con precios, descripciones y rutas de imagen correctas
const platosPorDia = {
    1: [ // Lunes
        { 
            nombre: "Bondiola a la pizza con puré", 
            descripcion: "Deliciosa bondiola de cerdo con salsa de tomate y muzzarella. <br> Precio: $195.00", 
            precio: 195.00,
            Images: ["../img/comprar/bondiola.png"]
        },
    ],
    2: [ // Martes
        { 
            nombre: "Arroz amarillo con pollo y vegetales", 
            descripcion: "Un clásico casero, lleno de sabor. <br> Precio: $195.00", 
            precio: 195.00, 
            Images: ["../img/comprar/arroz amarillo con polo.png"]
        }
    ],
    3: [ // Miércoles
        { 
            nombre: "Creps de jamón y queso con papas rústicas", 
            descripcion: "Suaves creps rellenos, acompañados de papas crujientes. <br> Precio: $195.00", 
            precio: 195.00, 
            Images: ["../img/comprar/creps.png"] 
        }
    ],
    4: [ // Jueves
        { 
            nombre: "Ravioles con tuco", 
            descripcion: "Pasta rellena con una salsa tradicional. <br> Precio: $195.00",
            precio: 195.00, 
            Images: ["../img/comprar/Ravioles-con-tuco-Photoroom.png"] 
        }
    ],
    5: [ // Viernes
        { 
            nombre: "Muslo de pollo con arroz, choclo y arvejas", 
            descripcion: "Un plato completo y sabroso para terminar la semana. <br> Precio: $195.00", 
            precio: 195.00, 
            Images: ["../img/comprar/muslo-arroz.png"]
        }
    ]
};

// Función actualizada para mostrar el nuevo formato con precio
function mostrarPlatosDelDia() {
    const hoy = new Date().getDay();
    const platos = platosPorDia[hoy] || [];
    const lista = document.getElementById('platos-dia-lista');

    if (platos.length === 0) {
        lista.innerHTML = "<p>No hay platos del día disponibles.</p>";
        return;
    }

    let html = "<ul>";
    platos.forEach((plato, idx) => {
        html += `
            <li class="plato-dia-item">
                <img src="${plato.Images ? plato.Images[0] : ''}" alt="${plato.nombre}" class="plato-dia-img"/>
                <div class="plato-dia-info">
                    <span class="plato-nombre">${plato.nombre}</span>
                    <span class="plato-desc">${plato.descripcion}</span>
                    <span class="plato-precio">$${plato.precio.toFixed(2)}</span>
                </div>
                <button class="plato-agregar-btn" data-idx="${idx}">Agregar al carrito</button>
            </li>`;
    });
    html += "</ul>";
    lista.innerHTML = html;

    agregarEventoPlatoDia(platos);
}

// PARTE 2: LÓGICA DE PLATOS DEL DÍA 


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
        // CORRECCIÓN DE IMAGEN: La ruta se inyecta directamente. 
        // Si no funciona, la ruta '../Frontend/img/food1.png' es incorrecta respecto a tu HTML.
        const imgSrc = plato.Images && plato.Images[0] ? plato.Images[0] : '';
        
        html += `<li>
            <span class="plato-nombre">${plato.nombre}</span>
            <span class="plato-desc">${plato.descripcion}</span>
            <img src="${imgSrc}" alt="${plato.nombre}" class="plato-img" imgSrc="${imgSrc}">
            <button class="comida-agregar-btn" data-idx="${idx}" data-dia="${hoy}">Agregar al carrito</button>
        </li>`;
    });
    html += "</ul>";
    lista.innerHTML = html;
    
    agregarEventosAgregarCarritoPlatosDia(platos, hoy);
}

// Asigna evento click a los botones "Agregar al carrito" de platos del día
function agregarEventosAgregarCarritoPlatosDia(platos, hoy) {
    const botones = document.querySelectorAll('.comida-agregar-btn');
    botones.forEach(boton => {
        boton.addEventListener('click', function() {
            const idx = this.getAttribute('data-idx');
            const plato = platos[idx];
            
            // Estructura del producto adaptada a la función 'addProductToCart'
            const producto = {
                id: 'plato-dia-' + hoy + '-' + idx, 
                name: plato.nombre, 
                price: parseFloat(plato.precio) || 0,
                // Agregamos la imagen como propiedad extra para usarla al renderizar el carrito
                image: plato.Images ? plato.Images[0] : '' 
            };
            
            // Llama a tu función de carrito
            if (typeof addProductToCart === 'function') {
                addProductToCart(producto);
                mostrarNotificacion(`"${plato.nombre}" se agregó al carrito`); 
            
            } else {
                console.error("ERROR: La función 'addProductToCart' no está definida.");
            }
        });
    });
}