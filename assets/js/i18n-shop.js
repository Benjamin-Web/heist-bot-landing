/* =============================================================
   Heist Bot — Shop: Sprachen
   Gleiches Verfahren wie auf der Startseite (assets/js/i18n.js):
   Deutsch steht im HTML, Englisch liegt hier. Der deutsche
   Ausgangstext wird beim ersten Wechsel gesichert.
   ============================================================= */

window.HEIST_I18N_SHOP = (function () {
    'use strict';

    const EN = {
        /* Kopf */
        nav_katalog: 'Catalogue',
        nav_bot: 'The bot',
        an_knopf: 'Sign in with Twitch',
        an_knopf_kurz: 'Sign in',
        an_abmelden: 'Sign out',

        /* Kopfbereich */
        sh_kicker: 'Cosmetic only · no advantage in the game',
        sh_titel: 'Your robber, <span class="gold">your look</span>',
        sh_lede: 'Give your figure in the overlay a colour of its own and let it say whatever you like. It changes nothing about how a heist ends — and 30% of what you spend goes to the channel you came from.',

        /* Katalog */
        mk_katalog: '01 — On display',
        kat_titel: 'What there is',
        kat_lede: 'Skins are yours for good. The speech bubble runs for 30 days and is bought again after that.',
        kat_laedt: 'Loading the catalogue …',

        /* Mein Raeuber */
        mk_meins: '02 — Your things',
        mein_titel: 'My robber',
        mein_lede: 'One look is active at a time. The change applies right away — you will see it in the next heist.',
        mein_leer: 'You do not own anything yet — the catalogue above has everything.',

        /* Sprechblase */
        mk_blase: '03 — Your voice',
        bl_titel: 'My speech bubble',
        bl_lede: '60 characters at most, no links. The text is checked before it shows up on stream.',
        bl_label: 'Your text',
        bl_platzhalter: 'Off to get rich.',
        bl_speichern: 'Save',

        /* Fuss */
        fuss_claim: 'Free Twitch bot with a heist mini-game in your OBS overlay.',
        fuss_impressum: 'Legal notice',
        fuss_datenschutz: 'Privacy',
        fuss_kosmetik: 'Everything here is purely cosmetic. The bot itself is and stays free for everyone.'
    };

    const SPEICHER = 'lang';

    function anwenden(lang) {
        const englisch = lang === 'en';

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const schluessel = el.dataset.i18n;
            const attr = el.dataset.i18nAttr;   // z.B. "placeholder"

            if (attr) {
                if (el.dataset.deAttr === undefined) el.dataset.deAttr = el.getAttribute(attr) || '';
                el.setAttribute(attr, englisch && EN[schluessel] !== undefined ? EN[schluessel] : el.dataset.deAttr);
                return;
            }

            // Deutschen Ausgangstext einmalig sichern (inkl. Auszeichnung).
            if (el.dataset.de === undefined) el.dataset.de = el.innerHTML;
            el.innerHTML = englisch && EN[schluessel] !== undefined ? EN[schluessel] : el.dataset.de;
        });

        document.documentElement.lang = englisch ? 'en' : 'de';

        const knopf = document.getElementById('sprache');
        if (knopf) knopf.textContent = englisch ? 'DE' : 'EN';

        if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    }

    /** Gespeicherte Wahl (dieselbe wie auf der Startseite), sonst Deutsch. */
    function startSprache() {
        const gemerkt = localStorage.getItem(SPEICHER);
        if (gemerkt === 'de' || gemerkt === 'en') return gemerkt;
        return (navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
    }

    function umschalten() {
        const neu = document.documentElement.lang === 'en' ? 'de' : 'en';
        localStorage.setItem(SPEICHER, neu);
        anwenden(neu);
    }

    return { anwenden, startSprache, umschalten, EN };
})();
