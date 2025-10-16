
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
        initializeMercadoPago();
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

    // --- Función para inicializar Mercado Pago ---
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
        .then(response => response.json())
        .then(data => {
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
            document.getElementById('alt-mercado-pago-wallet').innerHTML = '<div class="alert alert-danger">Error al conectar con el servidor.</div>';
            console.error(error);
        });
    };

    // --- Renderizado Inicial ---
    renderCart();
    updateCartCounter();
});