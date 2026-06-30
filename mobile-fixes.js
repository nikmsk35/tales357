/**
 * MOBILE FIXES — Tales from the Дед
 * iOS Safari, Android Chrome, Honor Magic UI, Samsung One UI
 */

(function() {
    'use strict';

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // ===== IOS SAFARI WEB AUDIO FIX =====
    window.__initAudio = window.__initAudio || function() {};
    const originalInitAudio = window.__initAudio;

    // Override audio init to handle iOS suspended state
    document.addEventListener('click', resumeAudio, { once: false });
    document.addEventListener('touchstart', resumeAudio, { once: false });
    document.addEventListener('touchend', resumeAudio, { once: false });

    function resumeAudio() {
        if (window.audioCtx && window.audioCtx.state === 'suspended') {
            window.audioCtx.resume().catch(() => {});
        }
    }

    // ===== TOUCH CONTEXT MENU (Long Press) =====
    let touchTimer = null;
    let touchStartX = 0;
    let touchStartY = 0;
    const ctxMenu = document.getElementById('ctxMenu');
    if (ctxMenu) {
        document.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchTimer = setTimeout(() => {
                    e.preventDefault();
                    ctxMenu.style.left = touchStartX + 'px';
                    ctxMenu.style.top = touchStartY + 'px';
                    ctxMenu.classList.add('show');
                }, 800); // 800ms long press
            }
        }, { passive: false });

        document.addEventListener('touchmove', () => {
            if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
        });

        document.addEventListener('touchend', () => {
            if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
        });
    }

    // ===== EYE TRACKER — TOUCH SUPPORT =====
    const eye = document.getElementById('eye');
    if (eye) {
        document.addEventListener('touchmove', e => {
            if (e.touches.length === 1) {
                eye.style.left = e.touches[0].clientX + 'px';
                eye.style.top = e.touches[0].clientY + 'px';
                eye.classList.add('active');
                clearTimeout(eye._timeout);
                eye._timeout = setTimeout(() => eye.classList.remove('active'), 2000);
            }
        }, { passive: true });
    }

    // ===== IDLE TIMER — VISIBILITY API FIX =====
    // Mobile browsers pause JS when tab is hidden, so we use visibility API
    let idlePaused = false;
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            idlePaused = true;
        } else {
            idlePaused = false;
            // Reset idle timer when coming back
            if (window.resetIdle) window.resetIdle();
        }
    });

    // ===== TOUCH SHAKE ON TAP =====
    // On touch devices, tap should trigger shake (not just click)
    document.querySelectorAll('.char-card').forEach(card => {
        card.addEventListener('touchstart', function() {
            this.classList.add('shake-card');
            setTimeout(() => this.classList.remove('shake-card'), 400);
        }, { passive: true });
    });

    // ===== TEXT SCRAMBLE — TOUCH SUPPORT =====
    // On touch, long press triggers scramble
    document.querySelectorAll('.char-card h3').forEach(el => {
        const original = el.textContent;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let scrambleInterval = null;

        function startScramble() {
            let iterations = 0;
            scrambleInterval = setInterval(() => {
                el.textContent = original.split('').map((letter, index) => {
                    if (index < iterations) return original[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');
                if (iterations >= original.length) {
                    clearInterval(scrambleInterval);
                    el.textContent = original;
                }
                iterations += 1/2;
            }, 30);
        }

        el.addEventListener('mouseenter', startScramble);
        el.addEventListener('mouseleave', () => {
            if (scrambleInterval) clearInterval(scrambleInterval);
            el.textContent = original;
        });
        // Touch: tap to scramble, then auto-restore after 1s
        el.addEventListener('touchstart', () => {
            startScramble();
            setTimeout(() => {
                if (scrambleInterval) clearInterval(scrambleInterval);
                el.textContent = original;
            }, 1500);
        }, { passive: true });
    });

    // ===== IOS VIEWPORT ZOOM FIX =====
    // Prevent iOS Safari from zooming on input focus
    if (isIOS) {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }

    // ===== KONAMI CODE — TOUCH FALLBACK =====
    // On mobile, Konami Code is hard. Add a touch-based secret:
    // Tap 5 times on banner → open dossier
    let bannerTaps = 0;
    const banner = document.querySelector('.banner');
    if (banner) {
        banner.addEventListener('touchstart', () => {
            bannerTaps++;
            if (bannerTaps >= 5) {
                window.location.href = 'dossier.html';
            }
            setTimeout(() => { bannerTaps = 0; }, 3000);
        }, { passive: true });
    }

    // Tap 5 times on footer quote → reset dialog
    const footer = document.querySelector('footer');
    if (footer) {
        footer.addEventListener('touchstart', () => {
            if (window.DedPersonal && window.DedPersonal.reset) {
                window.DedPersonal.reset();
            }
        }, { passive: true });
    }

    // ===== IOS INPUT FIX FOR DIALOG =====
    // Ensure dialog input works on iOS
    document.addEventListener('focusin', e => {
        if (e.target.classList.contains('dialog-input')) {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // ===== DETECT BROWSER IN CONSOLE =====
    console.log('%c[Mobile]', 'color: #7a2828', {
        isTouch,
        isIOS,
        isSafari,
        userAgent: navigator.userAgent.substring(0, 50)
    });
})();