document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const altShopIcon = document.getElementById('alt-shop-icon');
    const altModalCart = document.getElementById('alt-modal-cart');
    const altModalPayment = document.getElementById('alt-modal-payment');

    const altCloseButtons = document.querySelectorAll('.alt-close-button');
    const altOpenPaymentModalButton = document.getElementById('alt-open-payment-modal');
    const altCloseNotificationButton = document.querySelector('.alt-close-notification');

    const altCartItemsContainer = document.getElementById('alt-cart-items');
    const altCartTotalSpan = document.getElementById('alt-cart-total');

    const altPayCashButton = document.getElementById('alt-pay-cash');
    const altPayCardButton = document.getElementById('alt-pay-card');
    const altCustomerInfoForm = document.getElementById('alt-customer-info-form');
    const altCustomerNameInput = document.getElementById('alt-customer-name');
    const altCustomerLastnameInput = document.getElementById('alt-customer-lastname');
    const altCustomerPhoneInput = document.getElementById('alt-customer-phone');
    const altConfirmOrderButton = document.getElementById('alt-confirm-order');
    const altOrderConfirmationMessage = document.getElementById('alt-order-confirmation-message');
    const altNotifCustomerPhoneSpan = document.getElementById('alt-notif-customer-phone');

    // --- Estado del Carrito y Funciones de Almacenamiento Local ---
    let cart = JSON.parse(localStorage.getItem('altCart')) || [];

    // Función para actualizar el contaddel carrito
    const updateCartCounter = () => {
        const counter = document.getElementById('cart-counter');
        if (counter) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            counter.textContent = totalItems;
            // Ocultar el contador si el carrito está vacío
            counter.style.display = totalItems > 0 ? 'flex' : 'none';
            
            // Trigger cart counter animation
            counter.classList.remove('updated');
            void counter.offsetWidth; // Trigger reflow
            counter.classList.add('updated');
        }
    };

    const saveCart = () => {
        localStorage.setItem('altCart', JSON.stringify(cart));
        updateCartCounter(); // Actualizar el contador cada vez que se guarda el carrito
    };

    // Esta función añade o actualiza un producto en el carrito
    const addProductToCart = (product) => {
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        renderCart();
        
        // Trigger cart counter animation
        const cartCounter = document.getElementById('cart-counter');
        if (cartCounter) {
            cartCounter.classList.remove('updated');
            void cartCounter.offsetWidth; // Trigger reflow
            cartCounter.classList.add('updated');
        }
    };

    // Esta función renderiza los productos en el modal del carrito
    const renderCart = () => {
        altCartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            altCartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
            altOpenPaymentModalButton.disabled = true; // Deshabilita el botón de pagar si el carrito está vacío
        } else {
            altOpenPaymentModalButton.disabled = false;
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('alt-cart-item');
                itemDiv.dataset.productId = item.id; // Para identificar el producto al borrar/modificar
                itemDiv.innerHTML = `
                    <span class="alt-item-name">${item.name}</span>
                    <div class="alt-item-quantity-controls">
                        <button class="alt-decrease-quantity" data-product-id="${item.id}">-</button>
                        <span class="alt-item-quantity">${item.quantity}</span>
                        <button class="alt-increase-quantity" data-product-id="${item.id}">+</button>
                    </div>
                    <span class="alt-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="alt-delete-item" data-product-id="${item.id}">Borrar</button>
                `;
                altCartItemsContainer.appendChild(itemDiv);
                total += item.price * item.quantity;
            });
        }
        altCartTotalSpan.textContent = total.toFixed(2);
    };

    // Listener de eventos para los botones de cantidad y borrar dentro del carrito
    altCartItemsContainer.addEventListener('click', (event) => {
        const productId = event.target.dataset.productId;
        if (!productId) return; // No es un botón de producto

        const productIndex = cart.findIndex(item => item.id == productId);
        if (productIndex === -1) return; // Producto no encontrado

        if (event.target.classList.contains('alt-increase-quantity')) {
            cart[productIndex].quantity++;
        } else if (event.target.classList.contains('alt-decrease-quantity')) {
            if (cart[productIndex].quantity > 1) {
                cart[productIndex].quantity--;
            } else {
                // Si la cantidad llega a 0, elimina el producto del carrito
                cart.splice(productIndex, 1);
            }
        } else if (event.target.classList.contains('alt-delete-item')) {
            cart.splice(productIndex, 1); // Elimina el producto directamente
        }
        saveCart();
        renderCart();
    });

    // --- Funciones de Control de Modales ---
    const openModal = (modalElement) => {
        modalElement.style.display = 'flex'; // Usar flex para centrar
    };

    const closeModal = (modalElement) => {
        modalElement.style.display = 'none';
    };

    // Listener de eventos para todos los botones de cerrar (el botón 'x')
    altCloseButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const modalId = event.target.dataset.modalId;
            closeModal(document.getElementById(modalId));
            // Reinicia formularios/notificaciones cuando se cierra el modal de pago
            if (modalId === 'alt-modal-payment') {
                altCustomerInfoForm.style.display = 'none';
                altOrderConfirmationMessage.style.display = 'none';
            }
        });
    });

    // Cierra los modales al hacer clic fuera de ellos
    window.addEventListener('click', (event) => {
        if (event.target === altModalCart) {
            closeModal(altModalCart);
        }
        if (event.target === altModalPayment) {
            closeModal(altModalPayment);
            altCustomerInfoForm.style.display = 'none';
            altOrderConfirmationMessage.style.display = 'none';
        }
    });

    // Cierra la notificación de confirmación
    if (altCloseNotificationButton) {
        altCloseNotificationButton.addEventListener('click', () => {
            closeModal(altModalPayment); // Cierra el modal de pago que contiene la notificación
            altCustomerInfoForm.style.display = 'none';
            altOrderConfirmationMessage.style.display = 'none';
        });
    }

    // --- Flujo de Interacción del Usuario ---

    // Abre el modal del carrito cuando se hace clic en el ícono alt-shop-icon
    altShopIcon.addEventListener('click', () => {
        renderCart(); // Actualiza el contenido del carrito antes de abrirlo
        openModal(altModalCart);
    });

    // Abre el modal de pago desde el botón "Pagar" del carrito
    altOpenPaymentModalButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Tu carrito está vacío. Agrega productos antes de continuar al pago.');
            return;
        }
        // No cerramos altModalCart inmediatamente; altModalPayment se superpondrá
        openModal(altModalPayment);
        altCustomerInfoForm.style.display = 'none'; // Oculta el formulario inicialmente
        altOrderConfirmationMessage.style.display = 'none'; // Oculta la notificación inicialmente
    });

    // Muestra el formulario de información del cliente cuando se elige una opción de pago
    altPayCashButton.addEventListener('click', () => {
        altCustomerInfoForm.style.display = 'block';
        altOrderConfirmationMessage.style.display = 'none';
    });

    altPayCardButton.addEventListener('click', () => {
        altCustomerInfoForm.style.display = 'block';
        altOrderConfirmationMessage.style.display = 'none';
    });

    // Confirma el pedido y guarda los datos
    altConfirmOrderButton.addEventListener('click', async () => {
        const name = altCustomerNameInput.value.trim();
        const lastname = altCustomerLastnameInput.value.trim();
        const phone = altCustomerPhoneInput.value.trim();

        if (!name || !lastname || !phone) {
            alert('Por favor, completa todos tus datos: Nombre, Apellido y Número de Teléfono.');
            return;
        }

        // --- Datos a enviar a tu backend/base de datos ---
        const orderData = {
            customer: {
                name: name,
                lastname: lastname,
                phone: phone
            },
            cartItems: cart, // Los artículos actualmente en el carrito
            totalAmount: parseFloat(altCartTotalSpan.textContent),
            // Forma sencilla de detectar el método de pago elegido
            paymentMethod: altPayCashButton.style.display === 'block' ? 'Efectivo' : 'Tarjeta'
        };

        // --- IMPORTANTE: Envía los datos a tu base de datos (API del backend) ---
        // Este es un marcador de posición. Necesitarás un endpoint en tu servidor
        // para manejar esta solicitud (por ejemplo, con Node.js, Python, PHP, etc.).
        try {
            const response = await fetch('/api/orders', { // Reemplaza con tu endpoint de API real
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                console.log('Pedido enviado exitosamente a la base de datos:', orderData);
                // --- Muestra el mensaje de confirmación ---
                altNotifCustomerPhoneSpan.textContent = phone;
                altCustomerInfoForm.style.display = 'none';
                altOrderConfirmationMessage.style.display = 'block';

                // --- Limpia el carrito después de un pedido exitoso ---
                cart = [];
                saveCart();
                renderCart(); // Actualiza la visualización del carrito (ahora vacío)
            } else {
                const errorData = await response.json();
                console.error('Error al enviar el pedido a la base de datos:', errorData);
                alert('Hubo un error al procesar tu pedido. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error de red o servidor inalcanzable:', error);
            alert('No se pudo conectar con el servidor. Por favor, revisa tu conexión.');
        }
    });

    // --- Renderizado Inicial ---
    renderCart(); // Muestra el contenido del carrito al cargar la página
    updateCartCounter(); // Actualiza el contador del carrito al cargar la página
    
    // Listen for cart updates from other parts of the application
    window.addEventListener('cartUpdated', () => {
        // Update cart data from localStorage
        cart = JSON.parse(localStorage.getItem('altCart')) || [];
        // Re-render the cart display
        renderCart();
        updateCartCounter();
    });

    // --- Simulación: Botones "Añadir al Carrito" ---
    // Deberías integrar esto con la lógica de visualización de tus productos reales.
    // Ejemplo: <button class="add-to-cart-button" data-product-id="1" data-product-name="Pizza Muzzarella" data-product-price="18.50">Añadir Pizza</button>
    // Ejemplo: <button class="add-to-cart-button" data-product-id="2" data-product-name="Agua Mineral" data-product-price="2.00">Añadir Agua</button>
    document.querySelectorAll('.add-to-cart-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const product = {
                id: event.target.dataset.productId,
                name: event.target.dataset.productName,
                price: parseFloat(event.target.dataset.productPrice)
            };
            addProductToCart(product);
            
            // Visual feedback
            const feedback = document.getElementById('adding-to-cart');
            if (feedback) {
                feedback.textContent = `"${product.name}" agregado al carrito`;
                feedback.classList.add('show');
                setTimeout(() => {
                    feedback.classList.remove('show');
                }, 2000);
            } else {
                alert(`"${product.name}" ha sido añadido al carrito.`);
            }
        });
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('miModal');
    const closeBtn = document.querySelector('#miModal .close-button');
    const abrirModalBtn = document.getElementById('abrirModalBtn');

    if (abrirModalBtn) {
        abrirModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Cerrar al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});