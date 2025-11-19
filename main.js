document.addEventListener('DOMContentLoaded', () => {
    // ОБЩИЕ ПЕРЕМЕННЫЕ
    const body = document.body;
    const slides = ['concert1.jpg', 'concert2.jpg', 'concert3.jpg', 'concert4.jpg'];
    let currentSlide = 0;
    let autoSlideInterval;

    // 1. СЛАЙДЕР (на index.html) - отключен для React

    // 2. МОДАЛКА (заказ билета) - НОВЫЙ КОД с поддержкой React кнопок
    /*
    // СТАРЫЙ КОД ЗАКОММЕНТИРОВАН
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
    */
    
    // НОВЫЙ КОД - поддерживает динамические кнопки React
    const modal = document.getElementById('modal');

    if (modal) {
        // Используем делегирование событий для динамических кнопок
        document.addEventListener('click', (e) => {
            // Открытие модалки при клике на кнопки с классом open-modal
            if (e.target.classList.contains('open-modal') || e.target.closest('.open-modal')) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                document.querySelector('main').style.filter = 'blur(5px)';
            }
            
            // Закрытие модалки при клике на крестик
            if (e.target.classList.contains('close')) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                document.querySelector('main').style.filter = '';
            }
            
            // Закрытие по клику вне модалки
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                document.querySelector('main').style.filter = '';
            }
        });
    }


    // 3. БУРГЕР-МЕНЮ
    const burger = document.querySelector('.burger');
    const navUl = document.querySelector('.nav ul');
    let navOverlay;

    if (burger) {
        // Создаем overlay
        navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        document.body.appendChild(navOverlay);
        
        // Открытие/закрытие меню
        burger.onclick = () => {
            const isActive = navUl.classList.contains('active');
            
            if (isActive) {
                closeMenu();
            } else {
                openMenu();
            }
        };
        
        // Закрытие по клику на overlay
        navOverlay.onclick = closeMenu;
        
        // Закрытие по клику на ссылку
        navUl.querySelectorAll('a').forEach(link => {
            link.onclick = closeMenu;
        });
        
        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navUl.classList.contains('active')) {
                closeMenu();
            }
        });
        
        function openMenu() {
            navUl.classList.add('active');
            navOverlay.classList.add('active');
            burger.textContent = '×';
            document.body.style.overflow = 'hidden';
        }
        
        function closeMenu() {
            navUl.classList.remove('active');
            navOverlay.classList.remove('active');
            burger.textContent = '☰';
            document.body.style.overflow = '';
        }
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