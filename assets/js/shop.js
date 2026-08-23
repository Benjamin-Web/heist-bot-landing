/* =============================================================
   Heist Bot — Shop
   Anmeldung mit Twitch, Katalog, eigener Besitz und Sprechblasen-Text.
   Die Seite haelt KEINE Datenbank-Zugaenge: alles laeuft ueber das
   Backend, das den Twitch-Token prueft und einen eigenen Shop-Ausweis
   ausstellt.
   ============================================================= */

(function () {
    'use strict';

    const BACKEND = 'https://heistbot-production.up.railway.app';
    const TWITCH_CLIENT_ID = '5ns5vekvgz8wb6wudfsos1nvzsa4sq';

    const SCHLUESSEL_AUSWEIS = 'shop_token';
    const SCHLUESSEL_NAME = 'shop_name';
    const SCHLUESSEL_REF = 'shop_ref';
    const SCHLUESSEL_KATALOG = 'shop_katalog_cache';

    /* Texte, die im Skript entstehen. Alles Feste steht im HTML und wird
       von i18n-shop.js uebersetzt — hier nur, was zur Laufzeit dazukommt. */
    const TEXTE = {
        de: {
            bald: 'Bald verfügbar',
            aktiv: 'Aktiv',
            aktivieren: 'Aktivieren',
            dauerhaft: 'dauerhaft',
            tage: 'Tage',
            abgelaufen: 'Abgelaufen — im Katalog nachkaufen',
            laeuftNoch: 'Läuft noch {n} Tage',
            laeuftHeuteAus: 'Läuft heute ab',
            katalogOffline: 'Zurzeit offline — angezeigt wird der zuletzt bekannte Stand.',
            katalogWeg: 'Der Katalog ist gerade nicht erreichbar. Bitte später noch einmal versuchen.',
            anmeldungWeg: 'Die Anmeldung hat nicht geklappt. Versuch es bitte noch einmal.',
            meinsWeg: 'Deine Sachen lassen sich gerade nicht laden. Der Katalog funktioniert weiterhin.',
            wechselWeg: 'Das hat nicht geklappt. Versuch es bitte noch einmal.',
            angemeldetAls: 'Angemeldet als',
            gespeichert: 'Gespeichert.',
            textUnbekannt: 'Dein bisheriger Text lässt sich gerade nicht laden — Speichern überschreibt ihn.',
            blaseAbgelaufen: 'Deine Sprechblase ist abgelaufen.',
            blaseFehlt: 'Dafür brauchst du eine Sprechblase.',
            spaeter: 'Gerade nicht möglich. Bitte später noch einmal.',
            gruende: {
                empty: 'Da steht noch nichts.',
                too_long: 'Höchstens 60 Zeichen.',
                link: 'Links sind nicht erlaubt.',
                invalid_chars: 'Da sind Zeichen drin, die nicht gehen.',
                blocked_word: 'Dieser Text geht so nicht durch.'
            }
        },
        en: {
            bald: 'Coming soon',
            aktiv: 'Active',
            aktivieren: 'Activate',
            dauerhaft: 'permanent',
            tage: 'days',
            abgelaufen: 'Expired — buy it again in the catalogue',
            laeuftNoch: '{n} days left',
            laeuftHeuteAus: 'Expires today',
            katalogOffline: 'Offline right now — showing the last known state.',
            katalogWeg: 'The catalogue is unreachable at the moment. Please try again later.',
            anmeldungWeg: 'Signing in did not work. Please try again.',
            meinsWeg: 'Your items cannot be loaded right now. The catalogue still works.',
            wechselWeg: 'That did not work. Please try again.',
            angemeldetAls: 'Signed in as',
            gespeichert: 'Saved.',
            textUnbekannt: 'Your current text cannot be loaded right now — saving will overwrite it.',
            blaseAbgelaufen: 'Your speech bubble has expired.',
            blaseFehlt: 'You need a speech bubble for that.',
            spaeter: 'Not possible right now. Please try again later.',
            gruende: {
                empty: 'There is nothing there yet.',
                too_long: '60 characters at most.',
                link: 'Links are not allowed.',
                invalid_chars: 'There are characters in there that will not work.',
                blocked_word: 'That text will not go through.'
            }
        }
    };

    /* Zuletzt geladene Daten — damit ein Sprachwechsel neu zeichnen kann,
       ohne erneut ans Backend zu gehen. */
    let letzterKatalog = [];
    let letzteEigene = null;

    function sprache() { return document.documentElement.lang === 'en' ? 'en' : 'de'; }
    function t(key) { return TEXTE[sprache()][key]; }

    function preis(cents) {
        const loc = sprache() === 'en' ? 'en-IE' : 'de-DE';
        return (cents / 100).toLocaleString(loc, { style: 'currency', currency: 'EUR' });
    }

    function meldung(text) {
        const el = document.getElementById('hinweis');
        if (!el) return;
        el.textContent = text;
        el.hidden = !text;
    }

    /* ---------- Kanal-Zuordnung aus dem !shop-Link merken ---------- */
    function refMerken() {
        const ref = new URLSearchParams(location.search).get('ref');
        if (ref && /^\d+$/.test(ref)) sessionStorage.setItem(SCHLUESSEL_REF, ref);
    }

    /* ---------- Anmeldung ---------- */
    function ausweis() { return localStorage.getItem(SCHLUESSEL_AUSWEIS); }

    function anmeldeUrl() {
        const p = new URLSearchParams({
            client_id: TWITCH_CLIENT_ID,
            redirect_uri: location.origin + '/shop/',
            response_type: 'token',
            scope: '',
            force_verify: 'false'
        });
        return 'https://id.twitch.tv/oauth2/authorize?' + p.toString();
    }

    /** Twitch legt den Token ins URL-Fragment. Einmal einloesen, dann entfernen. */
    async function tokenAusFragmentEinloesen() {
        if (!location.hash.includes('access_token=')) return;
        const token = new URLSearchParams(location.hash.slice(1)).get('access_token');
        // Sofort aus der Adresszeile nehmen: der Token gehoert weder in den
        // Verlauf noch in einen geteilten Link.
        history.replaceState(null, '', location.pathname + location.search);
        if (!token) return;

        try {
            const res = await fetch(BACKEND + '/api/shop/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ twitchAccessToken: token })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const daten = await res.json();
            localStorage.setItem(SCHLUESSEL_AUSWEIS, daten.token);
            localStorage.setItem(SCHLUESSEL_NAME, (daten.viewer && daten.viewer.displayName) || '');
        } catch (err) {
            meldung(t('anmeldungWeg'));
        }
    }

    function abmelden() {
        localStorage.removeItem(SCHLUESSEL_AUSWEIS);
        localStorage.removeItem(SCHLUESSEL_NAME);
        location.reload();
    }

    function anmeldeZustand() {
        const knopf = document.getElementById('anmelden');
        const wer = document.getElementById('wer');
        const name = document.getElementById('werName');
        if (!knopf || !wer || !name) return;

        const drin = !!ausweis();
        knopf.hidden = drin;
        wer.hidden = !drin;
        if (drin) name.textContent = t('angemeldetAls') + ' ' + (localStorage.getItem(SCHLUESSEL_NAME) || '');
    }

    /* ---------- Katalog ---------- */
    function farbe(hex) {
        return hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : null;
    }

    function probeBauen(item) {
        const el = document.createElement('div');
        el.className = 'probe' + (item.kind === 'speech' ? ' probe-blase' : '');
        const f = farbe(item.tint_hex);
        if (f) el.style.setProperty('--probe', f);
        if (item.kind === 'speech') el.innerHTML = '<i data-lucide="message-square"></i>';
        return el;
    }

    function karteBauen(item) {
        const el = document.createElement('article');
        el.className = 'karte artikel';
        el.appendChild(probeBauen(item));

        const titel = document.createElement('h3');
        titel.textContent = item.name;
        el.appendChild(titel);

        const meta = document.createElement('p');
        meta.className = 'artikel-meta';
        meta.textContent = item.duration_days
            ? preis(item.price_cents) + ' · ' + item.duration_days + ' ' + t('tage')
            : preis(item.price_cents) + ' · ' + t('dauerhaft');
        el.appendChild(meta);

        // Kaufen kommt mit Teil 3b (Lemon Squeezy). Bis dahin ehrlich sperren,
        // statt einen Knopf anzubieten, der ins Leere fuehrt.
        const knopf = document.createElement('button');
        knopf.className = 'knopf knopf-gold knopf-klein';
        knopf.type = 'button';
        knopf.disabled = true;
        knopf.textContent = t('bald');
        el.appendChild(knopf);

        return el;
    }

    function katalogZeichnen() {
        const liste = document.getElementById('katalogListe');
        if (!liste) return;
        liste.innerHTML = '';
        letzterKatalog.forEach(i => liste.appendChild(karteBauen(i)));
        if (window.lucide) window.lucide.createIcons();
    }

    async function katalogLaden() {
        const status = document.getElementById('katalogStatus');
        try {
            const res = await fetch(BACKEND + '/api/shop/catalog');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            letzterKatalog = (await res.json()).items || [];
            localStorage.setItem(SCHLUESSEL_KATALOG, JSON.stringify(letzterKatalog));
            if (status) status.hidden = true;
        } catch (err) {
            // Kein leerer Bildschirm: den zuletzt bekannten Stand zeigen.
            let zwischenstand = [];
            try {
                zwischenstand = JSON.parse(localStorage.getItem(SCHLUESSEL_KATALOG) || '[]');
            } catch (e) {
                zwischenstand = [];
            }
            letzterKatalog = Array.isArray(zwischenstand) ? zwischenstand : [];
            if (status) {
                status.hidden = false;
                status.textContent = letzterKatalog.length ? t('katalogOffline') : t('katalogWeg');
            }
        }
        katalogZeichnen();
    }

    /* ---------- Mein Raeuber ---------- */
    function restTage(iso) {
        if (!iso) return null;
        const ms = Date.parse(iso) - Date.now();
        if (Number.isNaN(ms)) return null;
        return Math.ceil(ms / 86400000);
    }

    function besitzKarte(item) {
        const el = document.createElement('article');
        el.className = 'karte artikel' + (item.equipped && !item.abgelaufen ? ' aktiv' : '');
        el.appendChild(probeBauen(item));

        const titel = document.createElement('h3');
        titel.textContent = item.name;
        el.appendChild(titel);

        if (item.abgelaufen) {
            const status = document.createElement('p');
            status.className = 'artikel-status abgelaufen';
            status.textContent = t('abgelaufen');
            el.appendChild(status);
            return el;
        }

        const knopf = document.createElement('button');
        knopf.type = 'button';
        if (item.equipped) {
            knopf.className = 'knopf knopf-leer knopf-klein';
            knopf.disabled = true;
            knopf.textContent = t('aktiv');
        } else {
            knopf.className = 'knopf knopf-gold knopf-klein';
            knopf.textContent = t('aktivieren');
            knopf.addEventListener('click', () => skinAktivieren(item.key, knopf));
        }
        el.appendChild(knopf);
        return el;
    }

    function besitzZeichnen() {
        const liste = document.getElementById('besitzListe');
        const leer = document.getElementById('besitzLeer');
        if (!liste || !letzteEigene) return;

        const skins = (letzteEigene.items || []).filter(i => i.kind === 'skin');
        liste.innerHTML = '';
        skins.forEach(i => liste.appendChild(besitzKarte(i)));
        if (leer) leer.hidden = skins.length > 0;
        if (window.lucide) window.lucide.createIcons();
    }

    async function skinAktivieren(key, knopf) {
        knopf.disabled = true;
        try {
            const res = await fetch(BACKEND + '/api/shop/equip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ausweis() },
                body: JSON.stringify({ skin_key: key })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            meldung('');
            await eigenesLaden();
        } catch (err) {
            knopf.disabled = false;
            meldung(t('wechselWeg'));
        }
    }

    /* ---------- Meine Sprechblase ---------- */
    function blaseZeichnen() {
        const abschnitt = document.getElementById('blase');
        const feld = document.getElementById('blaseText');
        const knopf = document.getElementById('blaseSpeichern');
        const rest = document.getElementById('blaseRest');
        const status = document.getElementById('blaseStatus');
        if (!abschnitt || !feld || !knopf || !letzteEigene) return;

        const blase = (letzteEigene.items || []).find(i => i.kind === 'speech');
        abschnitt.hidden = !blase;
        if (!blase) return;

        const gesperrt = !!blase.abgelaufen;
        feld.disabled = gesperrt;
        knopf.disabled = gesperrt;

        if (rest) {
            if (blase.abgelaufen) {
                rest.textContent = t('abgelaufen');
            } else if (blase.expires_at) {
                const tage = restTage(blase.expires_at);
                rest.textContent = tage !== null && tage <= 1
                    ? t('laeuftHeuteAus')
                    : t('laeuftNoch').replace('{n}', String(tage));
            } else {
                rest.textContent = '';
            }
        }

        if (status) {
            status.classList.remove('fehler');
            if (letzteEigene.speech_bekannt === false) {
                status.textContent = t('textUnbekannt');
                status.classList.add('fehler');
            } else {
                status.textContent = '';
            }
        }

        // Den bekannten Text nur setzen, wenn er wirklich bekannt ist — sonst
        // wuerde ein Datenbank-Hakler das Feld stillschweigend leeren.
        if (letzteEigene.speech_bekannt !== false && document.activeElement !== feld) {
            feld.value = (letzteEigene.speech && letzteEigene.speech.text) || '';
        }
        zaehlerAktualisieren();
    }

    function zaehlerAktualisieren() {
        const feld = document.getElementById('blaseText');
        const zaehler = document.getElementById('blaseZaehler');
        if (feld && zaehler) zaehler.textContent = feld.value.length + '/60';
    }

    async function blaseSpeichern() {
        const feld = document.getElementById('blaseText');
        const status = document.getElementById('blaseStatus');
        if (!feld || !status) return;

        status.classList.remove('fehler');
        try {
            const res = await fetch(BACKEND + '/api/shop/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ausweis() },
                body: JSON.stringify({ text: feld.value })
            });
            const daten = await res.json().catch(() => ({}));

            if (res.ok) {
                status.textContent = t('gespeichert');
                if (letzteEigene) {
                    letzteEigene.speech = { text: daten.text || feld.value, status: 'approved' };
                    letzteEigene.speech_bekannt = true;
                }
                return;
            }

            status.classList.add('fehler');
            if (res.status === 422) {
                status.textContent = TEXTE[sprache()].gruende[daten.reason] || TEXTE[sprache()].gruende.blocked_word;
            } else if (res.status === 403) {
                status.textContent = daten.error === 'expired' ? t('blaseAbgelaufen') : t('blaseFehlt');
            } else if (res.status === 401) {
                abmelden();
            } else {
                status.textContent = t('spaeter');
            }
        } catch (err) {
            status.classList.add('fehler');
            status.textContent = t('spaeter');
        }
    }

    /* ---------- Eigene Sachen laden ---------- */
    async function eigenesLaden() {
        const abschnitt = document.getElementById('meins');
        if (!ausweis() || !abschnitt) return;

        try {
            const res = await fetch(BACKEND + '/api/shop/me', {
                headers: { Authorization: 'Bearer ' + ausweis() }
            });
            if (res.status === 401) { abmelden(); return; }
            if (!res.ok) throw new Error('HTTP ' + res.status);
            letzteEigene = await res.json();
            // Erst aufdecken, wenn wirklich etwas dasteht — eine leere
            // Ueberschrift ohne Inhalt ist schlimmer als gar kein Abschnitt.
            abschnitt.hidden = false;
            besitzZeichnen();
            blaseZeichnen();
        } catch (err) {
            meldung(t('meinsWeg'));
        }
    }

    /* ---------- Sprache ---------- */
    function initSprache() {
        const i18n = window.HEIST_I18N_SHOP;
        if (!i18n) return;
        i18n.anwenden(i18n.startSprache());

        const knopf = document.getElementById('sprache');
        if (knopf) knopf.addEventListener('click', () => {
            i18n.umschalten();
            // Alles neu aufbauen, was das Skript selbst gezeichnet hat.
            anmeldeZustand();
            katalogZeichnen();
            if (letzteEigene) { besitzZeichnen(); blaseZeichnen(); }
        });
    }

    /* ---------- Start ---------- */
    document.addEventListener('DOMContentLoaded', async () => {
        initSprache();
        refMerken();

        const anmeldenKnopf = document.getElementById('anmelden');
        if (anmeldenKnopf) anmeldenKnopf.addEventListener('click', () => { location.href = anmeldeUrl(); });
        const abmeldenKnopf = document.getElementById('abmelden');
        if (abmeldenKnopf) abmeldenKnopf.addEventListener('click', abmelden);

        const feld = document.getElementById('blaseText');
        if (feld) feld.addEventListener('input', zaehlerAktualisieren);
        const speichern = document.getElementById('blaseSpeichern');
        if (speichern) speichern.addEventListener('click', blaseSpeichern);

        await tokenAusFragmentEinloesen();
        anmeldeZustand();
        await katalogLaden();
        await eigenesLaden();

        if (window.lucide) window.lucide.createIcons();
    });
})();
