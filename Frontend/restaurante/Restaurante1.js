var swiper1 = new Swiper (".mySwiper-1", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop:true,
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
    loop:true,
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

// Obtener el elemento <span> que cierra el modal
var span = document.getElementsByClassName("close-button")[0];

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