// IDs de promos (combos) y especiales
const promoIDs = [112, 113];
const especialIDs = [49, 50];
const carruselIDs = promoIDs.concat(especialIDs);

async function cargarCarrusel() {
    const res = await fetch('http://localhost/ProyectoFinal2025/Backend/routes/api.php?url=comidas');
    const productos = await res.json();
    const productosCarrusel = productos.filter(p => carruselIDs.includes(Number(p.id_Producto)));
    const scroll = document.getElementById("carrusel-scroll");
    if (!productosCarrusel.length) {
        scroll.innerHTML = "<p>No hay productos para mostrar.</p>";
        return;
    }
    scroll.innerHTML = productosCarrusel.map(prod => `
        <div class="carrusel-item">
            <h2>${prod.nombre}</h2>
            <p>${prod.descripcion || ""}</p>
            <p><strong>Precio:</strong> $${prod.precio}</p>
            <p><strong>Stock:</strong> ${prod.stock_disponible}</p>
        </div>
    `).join('');
}

document.addEventListener("DOMContentLoaded", () => {
    cargarCarrusel();

    const scroll = document.getElementById("carrusel-scroll");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");

    // Botones para scroll
    prev.onclick = () => {
        scroll.scrollBy({left: -300, behavior: "smooth"});
    };
    next.onclick = () => {
        scroll.scrollBy({left: 300, behavior: "smooth"});
    };

    // Drag con mouse
    let isDown = false;
    let startX, scrollLeft;
    scroll.addEventListener('mousedown', (e) => {
        isDown = true;
        scroll.classList.add('active');
        startX = e.pageX - scroll.offsetLeft;
        scrollLeft = scroll.scrollLeft;
    });
    scroll.addEventListener('mouseleave', () => {
        isDown = false;
        scroll.classList.remove('active');
    });
    scroll.addEventListener('mouseup', () => {
        isDown = false;
        scroll.classList.remove('active');
    });
    scroll.addEventListener('mousemove', (e) => {
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - scroll.offsetLeft;
        const walk = (x - startX) * 1.5; // Sensibilidad
        scroll.scrollLeft = scrollLeft - walk;
    });

    // Swipe touch para móviles
    let touchStartX = null;
    scroll.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    });
    scroll.addEventListener('touchmove', e => {
        if (touchStartX === null) return;
        const touchX = e.touches[0].clientX;
        const walk = (touchStartX - touchX);
        scroll.scrollLeft += walk;
        touchStartX = touchX;
    });
    scroll.addEventListener('touchend', () => {
        touchStartX = null;
    });
});