// ================================
// UI & INTERACTION LOGIC
// ================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('UI: Initializing...');
    initMobileMenu();
    initDynamicHeader();
    initRibbyPopup();
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

function initRibbyPopup() {
    // Initialize all popups
    setupPopup('why-ribby-btn', 'ribby-popup', 'close-popup-btn');
    setupPopup('compatibility-btn', 'compatibility-popup', 'close-comp-btn');
    setupPopup('accessibility-btn', 'accessibility-popup', 'close-access-btn');
    setupPopup('about-btn', 'about-popup', 'close-about-btn');
}

function setupPopup(triggerId, popupId, closeBtnId) {
    const triggerBtn = document.getElementById(triggerId);
    const popup = document.getElementById(popupId);
    const closeBtn = document.getElementById(closeBtnId);
    const header = popup ? popup.querySelector('.popup-header') : null;

    if (!triggerBtn || !popup || !closeBtn || !header) return;

    // Open Popup
    triggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        popup.classList.remove('hidden');
        
        // Reset styles for center position (override any previous drag/close transforms)
        popup.style.transition = 'transform 0.9s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.9s ease';
        popup.style.transform = 'translate(-50%, -50%) scale(1)';
        popup.style.opacity = '1';
        popup.style.left = '50%';
        popup.style.top = '50%';
    });

    // Close Popup (Genie Effect)
    closeBtn.addEventListener('click', () => {
        const triggerRect = triggerBtn.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();

        // Calculate centers relative to viewport
        const triggerCenterX = triggerRect.left + triggerRect.width / 2;
        const triggerCenterY = triggerRect.top + triggerRect.height / 2;
        const popupCenterX = popupRect.left + popupRect.width / 2;
        const popupCenterY = popupRect.top + popupRect.height / 2;

        // Calculate translation needed to move popup center to trigger center
        // We need to apply this ON TOP of the current position.
        // Current position is determined by `left` / `top` (which are draggable) 
        // AND `transform: translate(-50%, -50%)` (base centering).
        
        // The delta is simply destination - source
        const deltaX = triggerCenterX - popupCenterX;
        const deltaY = triggerCenterY - popupCenterY;

        // We want to translate from the CURRENT visual position.
        // The current visual position is defined by left/top + translate(-50%, -50%).
        // We want to add deltaX/deltaY to that visual position.
        // So the new translate should be translate(calc(-50% + deltaX), calc(-50% + deltaY)).
        
        popup.style.transition = 'transform 0.9s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.9s ease';
        popup.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(0)`;
        popup.style.opacity = '0';

        setTimeout(() => {
            if (popup.style.opacity === '0') { // Check if still closed/closing
                 popup.classList.add('hidden');
            }
        }, 900);
    });

    // Drag Functionality
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const style = window.getComputedStyle(popup);
        initialLeft = parseFloat(style.left);
        initialTop = parseFloat(style.top);
        
        header.style.cursor = 'grabbing';
        
        // Disable transition during drag for smoothness
        popup.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        e.preventDefault(); // Prevent text selection
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        popup.style.left = `${initialLeft + dx}px`;
        popup.style.top = `${initialTop + dy}px`;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';
            // Re-enable transition
            popup.style.transition = 'transform 0.9s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.9s ease';
        }
    });
}
