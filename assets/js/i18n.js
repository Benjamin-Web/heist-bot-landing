/* =============================================================
   Heist Bot — Landing: Sprachen
   Deutsch steht im HTML (und wird so auch gefunden). Englisch liegt
   hier und wird beim Umschalten eingesetzt. Der deutsche Ausgangstext
   wird beim ersten Wechsel gesichert, damit nichts verloren geht.
   ============================================================= */

window.HEIST_I18N = (function () {
    'use strict';

    const EN = {
        /* Navigation */
        nav_beweis: 'See it',
        nav_funktionen: 'Features',
        nav_kostenlos: 'Why free',
        nav_start: 'Get started',
        nav_befehle: 'Commands',
        nav_faq: 'FAQ',
        btn_download_kurz: 'Download',

        /* Held */
        held_kicker: '100% free · every feature',
        held_titel: 'Your chat is planning <span class="gold">the next heist</span>',
        held_lede: 'Viewers put their points on the line, head out together, and watch it play out live on stream. Plus alerts, moderation, custom commands and timers — in an app that costs nothing.',
        btn_download: 'Download for Windows',
        btn_ansehen: 'Try it first',
        held_fuss: 'Windows · OBS browser source · sign in with Twitch',
        demo_meta: 'Demo',
        demo_platzhalter: '!raub 100',
        demo_senden: 'Send',

        /* Funktionen */
        mk_funktionen: '01 — The gear',
        fn_titel: 'Everything included, nothing locked',
        fn_lede: 'No subscription, no tiers, no feature behind a paywall. Whatever the bot can do, it does for everyone.',
        fn1_t: 'Heist mini-game',
        fn1_b: 'The heart of it: bets in chat, shared loot, the whole thing animated in your overlay.',
        fn2_t: 'Zombie dog mode',
        fn2_b: 'A second game mode for variety — same rules, different world.',
        fn3_t: 'Alerts',
        fn3_b: 'Follow, sub, cheer, raid — with your own images, sounds and wording.',
        fn4_t: 'Loyalty, XP &amp; levels',
        fn4_b: 'Viewers earn just for watching, claim a daily bonus and level up.',
        fn5_t: 'Moderation',
        fn5_b: 'Spam filter for caps, emote floods, links and repeats.',
        fn6_t: 'Custom commands',
        fn6_b: 'Discord link, rules, sounds or promos — one command in chat.',
        fn7_t: 'Timers &amp; counters',
        fn7_b: 'Recurring messages and counters like <code>!deaths</code>.',
        fn8_t: 'Raffles',
        fn8_b: 'Tickets, sub-only, redraws and a countdown to claim.',
        fn9_t: 'Mod dashboard',
        fn9_b: 'Your mods configure everything in the browser — no install needed.',

        /* Warum kostenlos */
        mk_kostenlos: '02 — The math',
        kf_titel: 'Why this is free',
        kf_p1: 'Other bots cost nothing, so this one does too — permanently, with every feature. It pays for itself differently: viewers can give their robber a look of its own and a speech bubble. Purely cosmetic, with no effect on the game.',
        kf_l1: 'Nothing for you to buy',
        kf_l2: 'No feature is locked',
        kf_l3: 'Cosmetics never change how a heist ends',
        kf_status: 'The shop is still in the works — the bot is already fully usable.',
        kf_anteil: 'of what your viewers spend goes to you',

        /* Loslegen */
        mk_start: '03 — The plan',
        st_titel: 'Three steps and you are live',
        st1_t: 'Download and install',
        st1_b: 'Windows installer from GitHub, double-click, done. Updates arrive on their own.',
        st2_t: 'Sign in with Twitch',
        st2_b: 'One click — no tokens to copy, no keys to type.',
        st3_t: 'Browser source in OBS',
        st3_b: 'Add <code>http://localhost:8765</code> as a browser source and the overlay is running.',
        vt_titel: 'Running on channels like',
        vt_discord: 'Questions? Come to Discord',

        /* Befehle */
        mk_befehle: '04 — In chat',
        bf_titel: 'What your viewers type',
        bf_lede: 'A selection — your own commands come on top, as many as you like.',
        bf_sp1: 'Command',
        bf_sp2: 'What happens',
        bf_r1: 'Start a heist or join one in progress',
        bf_r2: 'Show your own point balance',
        bf_r3: 'The top five robbers in chat',
        bf_r4: 'Claim the daily bonus',
        bf_r5: 'Check level, XP and rank',
        bf_r6: 'Give points to someone else',
        bf_r7: 'Enter a running raffle',

        /* FAQ */
        mk_faq: '05 — Asked and answered',
        fq_titel: 'Short answers',
        fq1_f: 'Is the bot really free?',
        fq1_a: 'Yes. Every feature is included, there is no subscription and no license key. The project earns from cosmetics viewers buy voluntarily — and you get 30% of that.',
        fq2_f: 'Do I need to know how to code?',
        fq2_a: 'No. Install it, sign in with Twitch, add one browser source in OBS. Everything else is set up in the app window.',
        fq3_f: 'Does it run on Mac or Linux?',
        fq3_a: 'Windows only for now. There is currently no build for other systems.',
        fq4_f: 'What happens to my data?',
        fq4_a: 'The game runs on your own machine; only the settings you save end up in the cloud. The privacy policy spells out exactly what is stored.',

        /* Fuss */
        fuss_claim: 'Free Twitch bot with a heist mini-game in your OBS overlay.',
        fuss_download: 'Download',
        fuss_kofi: 'Support',
        fuss_impressum: 'Legal notice',
        fuss_datenschutz: 'Privacy',
        fuss_spende: 'Ko-fi is entirely voluntary and unlocks nothing in the bot — everything is free anyway.'
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

            // Deutschen Ausgangstext einmalig sichern (inkl. Auszeichnung wie <code>).
            if (el.dataset.de === undefined) el.dataset.de = el.innerHTML;
            el.innerHTML = englisch && EN[schluessel] !== undefined ? EN[schluessel] : el.dataset.de;
        });

        document.documentElement.lang = englisch ? 'en' : 'de';

        const knopf = document.getElementById('sprache');
        if (knopf) knopf.textContent = englisch ? 'DE' : 'EN';

        if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    }

    /** Gespeicherte Wahl, sonst Deutsch — ausser der Browser spricht klar nicht Deutsch. */
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
