// Global audio objects
const clickSound = new Audio('Recursos/SFX/click_sfx.mp3');
const closeSound = new Audio('Recursos/SFX/close_popup_sfx.mp3');
clickSound.volume = 1;
closeSound.volume = 0.5;

export function initAudio() {
    console.log('Audio: Initializing...');

    // Debugging: Check if audio loads
    clickSound.addEventListener('canplaythrough', () => console.log('Audio: Click SFX loaded'));
    clickSound.addEventListener('error', (e) => console.error('Audio: Click SFX Error', e));
    closeSound.addEventListener('canplaythrough', () => console.log('Audio: Close SFX loaded'));
    closeSound.addEventListener('error', (e) => console.error('Audio: Close SFX Error', e));

    // Preload and unlock audio context on first interaction
    const unlockAudio = () => {
        console.log('Audio: Unlocking context');
        // Play and immediately pause/reset all sounds to unlock them
        Promise.all([
            clickSound.play().then(() => { clickSound.pause(); clickSound.currentTime = 0; }),
            closeSound.play().then(() => { closeSound.pause(); closeSound.currentTime = 0; })
        ]).then(() => {
             console.log('Audio: Context unlocked');
        }).catch((err) => console.log('Audio: Use interaction to unlock', err));
        
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    // Global click listener for SFX
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a, .btn, .red-dot, .mobile-menu-toggle');
        
        if (target) {
            // Check if it's NOT a close button (close buttons have their own handler)
            if (!target.classList.contains('red-dot') && target.id !== 'close-popup-btn' && !target.id.includes('close-')) {
                 console.log('Audio: Click detected on interactive element');
                const soundClone = clickSound.cloneNode();
                soundClone.volume = 1;
                soundClone.play().catch(err => console.error('Audio: Play failed:', err));
            }
        }
    });
}

// Global function to play close sound (exposed to window for easy access if not using modules everywhere)
window.playCloseSound = function() {
    const closeClone = closeSound.cloneNode();
    closeClone.volume = 0.3;
    closeClone.play().catch(err => console.error('Audio: Close play failed', err));
};

// Initialize audio immediately when module is loaded
initAudio();
