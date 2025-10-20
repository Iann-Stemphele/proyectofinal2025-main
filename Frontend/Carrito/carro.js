
// PARTE 1: LÓGICA DEL CARRITO 


// **DECLARACIÓN GLOBAL DE VARIABLES Y FUNCIÓN CLAVE DE CARRITO**
// Estas variables y la función addProductToCart se declaran fuera del DOMContentLoaded 
// para que el módulo de platos del día pueda acceder a ellas.

let cart = JSON.parse(localStorage.getItem('altCart')) || [];

const saveCart = () => {
    localStorage.setItem('altCart', JSON.stringify(cart));
    updateCartCounter();
};

const updateCartCounter = () => {
    const counter = document.getElementById('cart-counter');
    if (counter) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        counter.textContent = totalItems;
        counter.style.display = totalItems > 0 ? 'flex' : 'none';
        
        counter.classList.remove('updated');
        void counter.offsetWidth; // Forzar reflow para animación
        counter.classList.add('updated');
    }
};

/**
 * Función CLAVE: Añade o actualiza un producto en el carrito.
 * Es la que utiliza la lógica de platos del día.
 */
const addProductToCart = (product) => {
    // Aseguramos que la estructura del producto coincida con la de tu carrito: { id, name, price }
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    // No llamamos a renderCart() aquí, se llamará cuando se abra el modal
    
    // Trigger cart counter animation
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        cartCounter.classList.remove('updated');
        void cartCounter.offsetWidth;
        cartCounter.classList.add('updated');
    }
};



// PARTE 3: INICIALIZACIÓN DE EVENTOS 


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
    const altCustomerEmailInput = document.getElementById('alt-customer-email');
    const altCustomerPhoneInput = document.getElementById('alt-customer-phone');
    const altConfirmOrderButton = document.getElementById('alt-confirm-order');
    const altOrderConfirmationMessage = document.getElementById('alt-order-confirmation-message');
    const altNotifCustomerPhoneSpan = document.getElementById('alt-notif-customer-phone');

    const btnPlatosDia = document.getElementById('abrirModalcomprar');
    const modalPlatosDia = document.getElementById('modal-platos-dia');
    const closePlatosDia = document.getElementById('close-platos-dia');


    // --- Función para renderizar el carrito (se mantiene tu lógica) ---
    const renderCart = () => {
        altCartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            altCartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
            altOpenPaymentModalButton.disabled = true;
        } else {
            altOpenPaymentModalButton.disabled = false;
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('alt-cart-item');
                itemDiv.dataset.productId = item.id;
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

        // Add refresh button to cart modal
        addRefreshButtonToCart();
    };


    // --- Listeners para Modales (Carrito y Pago) ---

    // Listener de eventos para los botones de cantidad y borrar dentro del carrito
    altCartItemsContainer.addEventListener('click', (event) => {
        const productId = event.target.dataset.productId;
        if (!productId) return; 

        const productIndex = cart.findIndex(item => item.id == productId);
        if (productIndex === -1) return; 

        if (event.target.classList.contains('alt-increase-quantity')) {
            cart[productIndex].quantity++;
        } else if (event.target.classList.contains('alt-decrease-quantity')) {
            if (cart[productIndex].quantity > 1) {
                cart[productIndex].quantity--;
            }
        } else if (event.target.classList.contains('alt-delete-item')) {
            cart.splice(productIndex, 1);
        }
        saveCart();
        renderCart();
    });

    const openModal = (modalElement) => {
        modalElement.style.display = 'flex';
    };

    const closeModal = (modalElement) => {
        modalElement.style.display = 'none';
    };

    altCloseButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const modalId = event.target.dataset.modalId;
            closeModal(document.getElementById(modalId));
            if (modalId === 'alt-modal-payment') {
                altCustomerInfoForm.style.display = 'none';
                altOrderConfirmationMessage.style.display = 'none';
            }
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === altModalCart) {
            closeModal(altModalCart);
        }
        if (event.target === altModalPayment) {
            closeModal(altModalPayment);
            altCustomerInfoForm.style.display = 'none';
            altOrderConfirmationMessage.style.display = 'none';
        }
        // Listener para cerrar modal de platos del día si se hace click afuera
        if (event.target === modalPlatosDia) {
             closeModal(modalPlatosDia);
        }
    });

    if (altCloseNotificationButton) {
        altCloseNotificationButton.addEventListener('click', () => {
            closeModal(altModalPayment);
            altCustomerInfoForm.style.display = 'none';
            altOrderConfirmationMessage.style.display = 'none';
        });
    }

    // Abre el modal del carrito
    altShopIcon.addEventListener('click', () => {
        renderCart(); 
        openModal(altModalCart);
    });

    // Abre el modal de pago
    altOpenPaymentModalButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Tu carrito está vacío. Agrega productos antes de continuar al pago.');
            return;
        }
        openModal(altModalPayment);
        altCustomerInfoForm.style.display = 'none';
        altOrderConfirmationMessage.style.display = 'none';
    });
    
    // Muestra formulario de pago
    altPayCashButton.addEventListener('click', () => {
        altCustomerInfoForm.style.display = 'block';
        altOrderConfirmationMessage.style.display = 'none';
        document.getElementById('alt-card-payment-form').style.display = 'none';
    });

    altPayCardButton.addEventListener('click', () => {
        document.getElementById('alt-card-payment-form').style.display = 'block';
        altCustomerInfoForm.style.display = 'none';
        altOrderConfirmationMessage.style.display = 'none';
        // Initialize MercadoPago validation instead of immediately creating
        initializeMercadoPagoValidation();
    });

    // Confirma el pedido (se mantiene tu lógica asíncrona)
    altConfirmOrderButton.addEventListener('click', async () => {
        // ... (Tu lógica de validación de formulario y FETCH aquí) ...
        // Se asume que esto funciona y limpia el carrito si es exitoso.

        // Simulación:
        const name = altCustomerNameInput.value.trim();
        const lastname = altCustomerLastnameInput.value.trim();
        const email = altCustomerEmailInput.value.trim();
        const phone = altCustomerPhoneInput.value.trim();

        // Validación básica...
        if (!name || !lastname || !email || !phone) {
            alert('Por favor completa todos los campos.');
            return;
        }

        try {
            const response = await fetch('Backend/routes/create_cash_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cart,
                    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                    customer: {
                        name: name,
                        lastname: lastname,
                        email: email,
                        phone: phone
                    }
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Pedido enviado exitosamente');
                altNotifCustomerPhoneSpan.textContent = phone;
                altCustomerInfoForm.style.display = 'none';
                altOrderConfirmationMessage.style.display = 'block';

                // Redirect to order status page
                setTimeout(() => {
                    window.location.href = `order_status.html?order_id=${encodeURIComponent(email)}`;
                }, 2000);

                // Limpia el carrito después de un pedido exitoso
                cart = [];
                saveCart();
                renderCart();
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                alert('Error al procesar el pedido. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar el pedido. Inténtalo de nuevo.');
        }
    });


    // --- LISTENERS ESPECÍFICOS DE PLATOS DEL DÍA ---

    if (btnPlatosDia) {
        btnPlatosDia.addEventListener('click', function(e) {
            e.preventDefault();
            if (modalPlatosDia) {
                modalPlatosDia.style.display = 'flex';
                mostrarPlatosDelDia(); // Llama a la función que renderiza los platos
            }
        });
    }
    
    if (closePlatosDia) {
        closePlatosDia.addEventListener('click', function() {
            if (modalPlatosDia) {
                modalPlatosDia.style.display = 'none';
            }
        });
    }

    // --- Función para inicializar validación de MercadoPago con campos dinámicos ---
    const initializeMercadoPagoValidation = () => {
        const cardForm = document.getElementById('alt-card-payment-form');
        if (!cardForm) return;

        // Get input fields
        const nameInput = document.getElementById('alt-card-customer-name');
        const lastnameInput = document.getElementById('alt-card-customer-lastname');
        const emailInput = document.getElementById('alt-card-customer-email');
        const phoneInput = document.getElementById('alt-card-customer-phone');
        const mpContainer = document.getElementById('alt-mercado-pago-wallet');

        // Clear previous content
        if (mpContainer) mpContainer.innerHTML = '';

        // Create container for validation messages and button
        let validationContainer = document.getElementById('mp-validation-container');
        if (!validationContainer) {
            validationContainer = document.createElement('div');
            validationContainer.id = 'mp-validation-container';
            validationContainer.style.marginTop = '15px';
            cardForm.appendChild(validationContainer);
        }

        let infoEl = validationContainer.querySelector('.mp-card-info');
        let mpBtn = validationContainer.querySelector('#mp-card-pay-btn');

        function createInfo() {
            if (!infoEl) {
                infoEl = document.createElement('div');
                infoEl.className = 'mp-card-info';
                infoEl.style.color = '#b30000';
                infoEl.style.marginBottom = '8px';
                infoEl.style.fontWeight = '600';
                validationContainer.prepend(infoEl);
            }
            return infoEl;
        }

        function removeInfo() {
            if (infoEl) { infoEl.remove(); infoEl = null; }
        }

        function createMpButton() {
            if (document.getElementById('mp-card-pay-btn')) return document.getElementById('mp-card-pay-btn');
            if (mpBtn) return mpBtn;
            mpBtn = document.createElement('button');
            mpBtn.id = 'mp-card-pay-btn';
            mpBtn.type = 'button';
            mpBtn.textContent = 'Pagar con MercadoPago';
            mpBtn.style.background = '#3483FA';
            mpBtn.style.color = '#fff';
            mpBtn.style.border = 'none';
            mpBtn.style.padding = '10px 14px';
            mpBtn.style.borderRadius = '4px';
            mpBtn.style.cursor = 'pointer';
            mpBtn.style.fontWeight = '700';
            mpBtn.style.width = '100%';
            validationContainer.appendChild(mpBtn);
            mpBtn.addEventListener('click', onCardMpClick);
            return mpBtn;
        }

        function removeMpButton() {
            if (mpBtn) { mpBtn.removeEventListener('click', onCardMpClick); mpBtn.remove(); mpBtn = null; }
        }

        function listMissingFields() {
            const missing = [];
            if (!nameInput || nameInput.value.trim().length < 3) missing.push('Nombre (mín 3 caracteres)');
            if (!lastnameInput || lastnameInput.value.trim().length < 3) missing.push('Apellido (mín 3 caracteres)');
            if (!emailInput || !emailInput.value.includes('@')) missing.push('Email válido');
            if (!phoneInput || phoneInput.value.trim().length < 8) missing.push('Teléfono (mín 8 caracteres)');
            return missing;
        }

        function updateCardPaymentUI() {
            const missing = listMissingFields();
            if (missing.length) {
                createInfo();
                infoEl.textContent = 'Complete los campos: ' + missing.join(', ');
                // marcar inputs en rojo mínimamente
                [nameInput, lastnameInput, emailInput, phoneInput].forEach(i => {
                    if (!i) return;
                    const isValid = !(
                        (i === nameInput && i.value.trim().length < 3) ||
                        (i === lastnameInput && i.value.trim().length < 3) ||
                        (i === emailInput && !i.value.includes('@')) ||
                        (i === phoneInput && i.value.trim().length < 8)
                    );
                    i.style.outline = isValid ? '' : '2px solid #ff6b6b';
                });
                removeMpButton();
            } else {
                removeInfo();
                [nameInput, lastnameInput, emailInput, phoneInput].forEach(i => { if (i) i.style.outline = ''; });
                createMpButton();
            }
        }

        // Escucha cambios en inputs
        [nameInput, lastnameInput, emailInput, phoneInput].forEach(i => {
            if (!i) return;
            i.addEventListener('input', updateCardPaymentUI);
            i.addEventListener('blur', updateCardPaymentUI);
        });

        // Inicializar UI
        updateCardPaymentUI();
    };

    // --- Función para inicializar Mercado Pago (crea la preferencia y muestra el botón) ---
    const initializeMercadoPago = () => {
        const mp = new MercadoPago('APP_USR-a294acdc-355e-44b8-a2b9-6df401a8f2ab', {
            locale: 'es-UY'
        });

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        fetch('Backend/routes/create_preference.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cart,
                total: total,
                customer: {
                    name: document.getElementById('alt-card-customer-name').value,
                    lastname: document.getElementById('alt-card-customer-lastname').value,
                    email: document.getElementById('alt-card-customer-email').value,
                    phone: document.getElementById('alt-card-customer-phone').value
                }
            })
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                document.getElementById('alt-mercado-pago-wallet').innerHTML = '<div class="alert alert-danger">Error: ' + data.error + '</div>';
                return;
            }
            if (!data.id) {
                document.getElementById('alt-mercado-pago-wallet').innerHTML = '<div class="alert alert-danger">No se pudo obtener el preferenceId.</div>';
                return;
            }
            mp.bricks().create("wallet", "alt-mercado-pago-wallet", {
                initialization: {
                    preferenceId: data.id,
                    redirectMode: 'self'
                },
                customization: {
                    texts: {
                        action: "pay",
                        valueProp: 'security_safety',
                    },
                },
            });
        })
        .catch(error => {
            document.getElementById('alt-mercado-pago-wallet').innerHTML = '<div class="alert alert-danger">Error al conectar con el servidor: ' + error.message + '</div>';
            console.error(error);
        });
    };

    // --- Función para manejar click en botón de MercadoPago en modal de tarjeta ---
    async function onCardMpClick(e) {
        e.preventDefault();

        const name = document.getElementById('alt-card-customer-name').value.trim();
        const lastname = document.getElementById('alt-card-customer-lastname').value.trim();
        const email = document.getElementById('alt-card-customer-email').value.trim();
        const phone = document.getElementById('alt-card-customer-phone').value.trim();

        // Validación básica
        if (!name || !lastname || !email || !phone) {
            alert('Por favor completa todos los campos.');
            return;
        }

        // Abrir nueva pestaña inmediatamente al hacer click
        const paymentWin = window.open('', '_blank');

        try {
            // Crear preferencia temporal (no crea pedido aún)
            const response = await fetch('Backend/routes/create_preference.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer: {
                        name: name,
                        lastname: lastname,
                        email: email,
                        phone: phone
                    },
                    items: cart,
                    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Preferencia creada exitosamente:', result);

                if (result.init_point) {
                    // Navegar la pestaña abierta al init_point de MercadoPago
                    paymentWin.location.href = result.init_point;

                    // Redirigir la página principal a order_status.html con preference_id para confirmar después
                    window.location.href = `order_status.html?preference_id=${encodeURIComponent(result.preference_id)}&name=${encodeURIComponent(name)}&lastname=${encodeURIComponent(lastname)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`;
                } else {
                    paymentWin.close();
                    alert('Error: No se pudo obtener el enlace de pago.');
                }
            } else {
                paymentWin.close();
                const errorText = await response.text();
                console.error('Error response:', errorText);
                alert('Error al crear la preferencia de pago. Inténtalo de nuevo.');
            }
        } catch (error) {
            if (paymentWin) paymentWin.close();
            console.error('Error:', error);
            alert('Error al procesar el pago. Inténtalo de nuevo.');
        }
    }

    // --- Función para añadir botón de refresh al carrito ---
    const addRefreshButtonToCart = () => {
        // Remove existing refresh button if any
        const existingBtn = document.getElementById('cart-refresh-btn');
        if (existingBtn) existingBtn.remove();

        // Create refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'cart-refresh-btn';
        refreshBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12a8 8 0 018-8V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4a8 8 0 018 8h-1.5a6.5 6.5 0 00-6.5-6.5V7.5a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V5.5A6.5 6.5 0 005.5 12H4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Refresh Cart';
        refreshBtn.style.background = '#28a745';
        refreshBtn.style.color = '#fff';
        refreshBtn.style.border = 'none';
        refreshBtn.style.padding = '8px 12px';
        refreshBtn.style.borderRadius = '4px';
        refreshBtn.style.cursor = 'pointer';
        refreshBtn.style.marginTop = '10px';
        refreshBtn.style.width = '100%';
        refreshBtn.style.display = 'flex';
        refreshBtn.style.alignItems = 'center';
        refreshBtn.style.justifyContent = 'center';
        refreshBtn.style.gap = '5px';

        refreshBtn.addEventListener('click', async () => {
            // Refresh cart from localStorage (since cart works with localStorage)
            try {
                // Reload cart from localStorage
                const savedCart = JSON.parse(localStorage.getItem('altCart')) || [];
                cart = savedCart;
                renderCart();
                updateCartCounter();
                mostrarNotificacion('Cart refreshed successfully!', 1500);
            } catch (err) {
                console.error('Refresh cart error:', err);
                mostrarNotificacion('Error refreshing cart', 2500);
            }
        });

        // Add button after cart items container
        altCartItemsContainer.parentNode.insertBefore(refreshBtn, altCartItemsContainer.nextSibling);
    };

    // --- Auto-refresh cart every 4 seconds ---
    setInterval(() => {
        // Only refresh if cart modal is not open to avoid interrupting user interaction
        const cartModal = document.getElementById('alt-modal-cart');
        if (cartModal && cartModal.style.display !== 'flex') {
            // Reload cart from localStorage (since cart works with localStorage)
            const savedCart = JSON.parse(localStorage.getItem('altCart')) || [];
            cart = savedCart;
            updateCartCounter();
        }
    }, 4000);

    // --- Renderizado Inicial ---
    renderCart();
    updateCartCounter();
});