document.addEventListener('DOMContentLoaded', () => {
    // ОБЩИЕ ПЕРЕМЕННЫЕ
    const body = document.body;
    const slides = ['concert1.jpg', 'concert2.jpg', 'concert3.jpg', 'concert4.jpg'];
    let currentSlide = 0;
    let autoSlideInterval;

    // 1. СЛАЙДЕР (на index.html)
    const sliderContainer = document.getElementById('slider');
    const sliderCounter = document.querySelector('.slider-counter');
    if (sliderContainer) {
        function showSlide(n) {
            currentSlide = (n + slides.length) % slides.length;
            sliderContainer.innerHTML = `<img src="assets/${slides[currentSlide]}" alt="Концерт ${currentSlide + 1}">`;
            sliderCounter.textContent = `${currentSlide + 1} / ${slides.length}`;
        }

        function nextSlide() { showSlide(currentSlide + 1); }
        function prevSlide() { showSlide(currentSlide - 1); }

        // Клик по слайдеру
        sliderContainer.addEventListener('click', (e) => {
            const half = sliderContainer.offsetWidth / 2;
            e.clientX < half ? prevSlide() : nextSlide();
        });

        // Автопрокрутка
        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 3000);
        }
        sliderContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        sliderContainer.addEventListener('mouseleave', startAutoSlide);
        showSlide(0);
        startAutoSlide();
    }

    // 2. МОДАЛКА (заказ билета)
    const modal = document.getElementById('modal');
    const openModalBtns = document.querySelectorAll('.open-modal');
    const closeModal = document.querySelector('.close');
    if (modal) {
        openModalBtns.forEach(btn => {
            btn.onclick = () => {
                modal.style.display = 'block';
                body.style.overflow = 'hidden';
                document.querySelector('main').style.filter = 'blur(5px)';
            };
        });
        closeModal.onclick = () => {
            modal.style.display = 'none';
            body.style.overflow = '';
            document.querySelector('main').style.filter = '';
        };
        window.onclick = (e) => { if (e.target === modal) closeModal.click(); };
    }

    // 3. БУРГЕР-МЕНЮ
    const burger = document.querySelector('.burger');
    const navUl = document.querySelector('.nav ul');
    if (burger) {
        burger.onclick = () => {
            navUl.classList.toggle('active');
            burger.textContent = navUl.classList.contains('active') ? '×' : '☰';
        };
    }

    // 4. ГАЛЕРЕЯ + ЛАЙТБОКС (на gallery.html)
    const galleryImgs = document.querySelectorAll('.gallery img');
    let lbCurrent = 0;
    let lbSlides = [];
    if (galleryImgs.length > 0) {
        galleryImgs.forEach((img, i) => {
            img.onclick = () => {
                lbSlides = Array.from(galleryImgs).map(i => i.src);
                lbCurrent = i;
                openLightbox();
            };
        });

        function openLightbox() {
            let lb = document.getElementById('lightbox') || createLightbox();
            lb.querySelector('.lb-img').src = lbSlides[lbCurrent];
            lb.classList.add('active');
            body.style.overflow = 'hidden';
        }

        function createLightbox() {
            const lb = document.createElement('div');
            lb.id = 'lightbox';
            lb.className = 'lightbox';
            lb.innerHTML = `
                <span class="lb-close">×</span>
                <img src="" alt="" class="lb-img">
                <button class="lb-prev">◄</button>
                <button class="lb-next">►</button>
            `;
            document.body.appendChild(lb);

            lb.querySelector('.lb-close').onclick = closeLightbox;
            lb.querySelector('.lb-prev').onclick = () => { lbCurrent = (lbCurrent - 1 + lbSlides.length) % lbSlides.length; openLightbox(); };
            lb.querySelector('.lb-next').onclick = () => { lbCurrent = (lbCurrent + 1) % lbSlides.length; openLightbox(); };
            return lb;
        }

        function closeLightbox() {
            document.getElementById('lightbox').classList.remove('active');
            body.style.overflow = '';
        }
    }

    // 5. КНОПКА ВВЕРХ
    const toTop = document.querySelector('.to-top');
    if (toTop) {
        window.onscroll = () => {
            toTop.style.display = window.scrollY > 300 ? 'block' : 'none';
        };
        toTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Пасхалка: клик по лого — секретный звук (добавь audio если хочешь)
    document.querySelector('.logo')?.addEventListener('click', () => alert('PUNK NOT DEAD! 🤘'));
});