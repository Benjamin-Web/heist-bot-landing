/* =============================================================
   Heist Bot — Landing: Verhalten
   Navigation, Chat-Demo und Scroll-Effekte. Die Seite bleibt ohne
   dieses Skript vollstaendig lesbar — hier liegt nur Beiwerk.
   ============================================================= */

(function () {
    'use strict';

    /* ---------- Mobiles Menue ---------- */
    function initMenue() {
        const knopf = document.getElementById('hamburger');
        const menue = document.getElementById('mobilnav');
        if (!knopf || !menue) return;

        const setzen = (offen) => {
            menue.classList.toggle('offen', offen);
            knopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
        };

        knopf.addEventListener('click', () => setzen(!menue.classList.contains('offen')));
        // Nach dem Sprung zum Anker schliessen, sonst verdeckt das Menue das Ziel.
        menue.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setzen(false)));
        window.addEventListener('resize', () => { if (window.innerWidth >= 900) setzen(false); });
    }

    /* ---------- Icons ---------- */
    function initIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initMenue();
        initIcons();
    });
})();
