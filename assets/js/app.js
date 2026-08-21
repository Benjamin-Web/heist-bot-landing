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


    /* ---------- Chat-Demo ----------
       Zeigt echtes Bot-Verhalten im Kleinen: kein Netzwerk, keine Daten,
       nur eine nachgestellte Runde. Texte in der Tonalitaet des echten Bots. */
    function initDemo() {
        const verlauf = document.getElementById('chatVerlauf');
        const eingabe = document.getElementById('chatEingabe');
        const senden = document.getElementById('chatSenden');
        if (!verlauf || !eingabe || !senden) return;

        let punkte = 1000;
        let raubLaeuft = false;

        const zuschauer = [
            { name: 'xNightRaider', cls: 'v1' },
            { name: 'LootGoblin99', cls: 'v2' },
            { name: 'ShadowThief_', cls: 'v3' },
            { name: 'BankBuster42', cls: 'v1' }
        ];
        const topliste = [
            ['xNightRaider', 15420], ['LootGoblin99', 12800], ['ShadowThief_', 9650],
            ['BankBuster42', 7200], ['CoinHunterTV', 5100]
        ];

        const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const zahl = (n) => n.toLocaleString('de-DE');

        function zeile(html) {
            const div = document.createElement('div');
            div.className = 'chat-zeile';
            div.innerHTML = html;
            verlauf.appendChild(div);
            verlauf.scrollTop = verlauf.scrollHeight;
        }

        const bot = (html) => zeile('<span class="chat-name bot">HeistBot: </span>' + html);

        function verarbeite(text) {
            const cmd = text.trim().toLowerCase();
            zeile('<span class="chat-name du">Du: </span>' + esc(text));

            if (cmd === '!coins') {
                setTimeout(() => bot('💰 Du hast <strong class="gold">' + zahl(punkte) + '</strong> Punkte.'), 450);
                return;
            }

            if (cmd === '!topliste') {
                setTimeout(() => {
                    let liste = '🏆 <strong class="gold">Top 5 Räuber:</strong><br>';
                    topliste.forEach(([name, wert], i) => {
                        const platz = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
                        liste += platz + ' ' + esc(name) + ' — ' + zahl(wert) + '<br>';
                    });
                    bot(liste);
                }, 450);
                return;
            }

            const raub = cmd.match(/^!raub\s+(\d+)$/);
            if (raub) {
                const einsatz = parseInt(raub[1], 10);
                if (raubLaeuft) { setTimeout(() => bot('⏳ Es läuft schon ein Raub — warte, bis er vorbei ist.'), 400); return; }
                if (einsatz < 10) { setTimeout(() => bot('❌ Mindestens 10 Punkte müssen es sein.'), 400); return; }
                if (einsatz > punkte) { setTimeout(() => bot('❌ So viel hast du nicht. Kontostand: ' + zahl(punkte) + '.'), 400); return; }

                raubLaeuft = true;
                setTimeout(() => bot('<span class="chat-system">🏦 Ein Raub startet! Du bist mit ' + zahl(einsatz) + ' Punkten dabei. Wer kommt mit?</span>'), 550);

                const mit = [...zuschauer].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1);
                mit.forEach((v, i) => {
                    const e = Math.floor(Math.random() * 400) + 50;
                    setTimeout(() => {
                        zeile('<span class="chat-name ' + v.cls + '">' + esc(v.name) + ': </span>!raub ' + e);
                        setTimeout(() => bot('🔫 ' + esc(v.name) + ' ist mit ' + zahl(e) + ' Punkten dabei!'), 280);
                    }, 1100 + i * 750);
                });

                const start = 1100 + mit.length * 750 + 500;
                setTimeout(() => bot('<span class="chat-system">⏰ Es geht los in 3 …</span>'), start);
                setTimeout(() => bot('<span class="chat-system">⏰ 2 …</span>'), start + 750);
                setTimeout(() => bot('<span class="chat-system">⏰ 1 …</span>'), start + 1500);

                setTimeout(() => {
                    if (Math.random() > 0.4) {
                        const faktor = (Math.random() * 2 + 1.5).toFixed(1);
                        const beute = Math.floor(einsatz * faktor);
                        punkte += beute;
                        bot('<span class="chat-gewinn">💰 Der Raub hat geklappt! Beute: ' + zahl(beute) + ' Punkte (' + faktor + '×). Kontostand: ' + zahl(punkte) + '</span>');
                    } else {
                        punkte -= einsatz;
                        bot('<span class="chat-verlust">👮 Erwischt! Die Polizei war schneller. ' + zahl(einsatz) + ' Punkte weg. Kontostand: ' + zahl(punkte) + '</span>');
                    }
                    raubLaeuft = false;
                }, start + 2500);
                return;
            }

            setTimeout(() => bot('Kenne ich nicht. Versuch <strong>!raub 100</strong>, <strong>!coins</strong> oder <strong>!topliste</strong>.'), 400);
        }

        function absenden() {
            const wert = eingabe.value.trim();
            if (!wert) return;
            eingabe.value = '';
            verarbeite(wert);
        }

        senden.addEventListener('click', absenden);
        eingabe.addEventListener('keydown', (e) => { if (e.key === 'Enter') absenden(); });
        document.querySelectorAll('.chat-vorschlaege button').forEach(b => {
            b.addEventListener('click', () => verarbeite(b.dataset.cmd));
        });

        // Begruessung, damit das Fenster nicht leer wirkt.
        bot('Tippe <strong>!raub 100</strong> und sieh, was passiert.');
    }

    document.addEventListener('DOMContentLoaded', () => {
        initMenue();
        initIcons();
        initDemo();
    });
})();
