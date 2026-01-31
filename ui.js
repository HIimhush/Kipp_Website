// ================================
// UI & INTERACTION LOGIC
// ================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('UI: Initializing...');
    initMobileMenu();
    initDynamicHeader();
    initRibbyPopup();
    initAudio();
});

function initAudio() {
    const clickSound = new Audio('Recursos/SFX/click_sfx.mp3');
    clickSound.volume = 0.5; // Adjust volume if needed

    // Preload and unlock audio context on first interaction
    const unlockAudio = () => {
        clickSound.play().then(() => {
            clickSound.pause();
            clickSound.currentTime = 0;
        }).catch(() => {});
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    // Global click listener for SFX
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a, .btn, .red-dot, .mobile-menu-toggle');
        
        if (target) {
            // Clone node to allow rapid fire playback (overlapping sounds)
            const soundClone = clickSound.cloneNode();
            soundClone.volume = 0.5;
            soundClone.play().catch(err => console.log('Audio play failed:', err));
        }
    });
}

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

// Global z-index counter to manage popup stacking order
let highestZIndex = 2000;

function setupPopup(triggerId, popupId, closeBtnId) {
    const triggerBtn = document.getElementById(triggerId);
    const popup = document.getElementById(popupId);
    const closeBtn = document.getElementById(closeBtnId);
    const header = popup ? popup.querySelector('.popup-header') : null;

    if (!triggerBtn || !popup || !closeBtn || !header) return;

    // Open Popup
    triggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const rect = triggerBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        highestZIndex++;
        popup.style.zIndex = highestZIndex;
        popup.classList.remove('hidden');
        
        // Reset styles for center position (override any previous drag/close transforms)
        popup.style.transition = 'transform 0.9s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.9s ease';
        popup.style.transform = 'translate(-50%, -50%) scale(1)';
        popup.style.opacity = '1';
        popup.style.left = `${centerX}px`;
        popup.style.top = `${centerY}px`;
    });

    // Close Popup (Genie Effect)
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering z-index update from container click

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
    
    // Bring to front on mousedown
    popup.addEventListener('mousedown', () => {
        highestZIndex++;
        popup.style.zIndex = highestZIndex;
    });

    // Drag Functionality
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    // Allow dragging from anywhere in the popup EXCEPT the text itself (to allow selection)
    popup.addEventListener('mousedown', (e) => {
        // If clicking on text, don't drag
        if (e.target.closest('.popup-text') || e.target.tagName === 'P' || e.target.tagName === 'SPAN') {
            return;
        }

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const style = window.getComputedStyle(popup);
        initialLeft = parseFloat(style.left);
        initialTop = parseFloat(style.top);
        
        popup.style.cursor = 'grabbing';
        header.style.cursor = 'grabbing';
        
        // Disable transition during drag for smoothness
        popup.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        e.preventDefault(); // Prevent text selection ONLY when we are explicitly dragging
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        popup.style.left = `${initialLeft + dx}px`;
        popup.style.top = `${initialTop + dy}px`;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            popup.style.cursor = 'default';
            header.style.cursor = 'grab';
            // Re-enable transition
            popup.style.transition = 'transform 0.9s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.9s ease';
        }
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
