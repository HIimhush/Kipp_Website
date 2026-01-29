// ================================
// UI & INTERACTION LOGIC
// ================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('UI: Initializing...');
    initMobileMenu();
    initDynamicHeader();
});

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.desktop-nav');
    
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            console.log('Mobile menu clicked');
            nav.classList.toggle('active');
            toggle.classList.toggle('open');
        });
    }
}

function initDynamicHeader() {
    let lastScrollTop = 0;
    const header = document.querySelector('.main-header');
    
    if (!header) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            // Scrolling down
            header.classList.add('hidden');
        } else {
            // Scrolling up
            header.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
    });
}
