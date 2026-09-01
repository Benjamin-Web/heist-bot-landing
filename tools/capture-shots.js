/**
 * Nimmt aktuelle Produktbilder fuer die Landing-Page auf.
 *
 *   1. assets/shots/dashboard.png     — das Desktop-Dashboard im aktuellen
 *      Design.
 *   2. assets/shots/alert-raeuber.png — die Alert-Karte mit laufender Figur,
 *      freigestellt (die OBS-Quelle hat einen transparenten Hintergrund).
 *
 * Beides wird aus dem ECHTEN Produkt aufgenommen, nicht nachgebaut: der Alert
 * laeuft ueber den echten wsServer und den echten alertResolver, das
 * Dashboard ist die ausgelieferte renderer/index.html. Geladen wird alles
 * ueber den wsServer — sein Root-Fallback liefert auch renderer/ und shared/
 * aus, damit Tokens und Schriften aufloesen.
 *
 * Warum ueberhaupt neu: die vorhandenen Screenshots zeigen noch das
 * abgeschaffte PRO-Modell und duerfen deshalb nicht auf die Seite.
 *
 * EIN Fenster fuer beide Aufnahmen: ein zweites Offscreen-Fenster nach dem
 * Zerstoeren des ersten scheitert reproduzierbar mit ERR_FAILED.
 *
 * Aufruf aus diesem Verzeichnis:
 *   "../Heist_bot/node_modules/.bin/electron" tools/capture-shots.js
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Nachbarverzeichnis, kein fester Pfad — die Skripte liegen im
// oeffentlich ausgelieferten Repo und sollen nichts ueber den Rechner
// verraten, auf dem sie zuletzt liefen. Ueber HEIST_BOT_DIR ueberschreibbar.
const BOT = (process.env.HEIST_BOT_DIR || path.join(__dirname, '..', '..', 'Heist_bot'))
    .split(path.sep).join('/');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'shots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const wsServer = require(path.join(BOT, 'wsServer'));
const resolver = require(path.join(BOT, 'src/services/alertResolver'));

app.disableHardwareAcceleration();

/** Wartet, bis ein Ausdruck im Fenster wahr wird — oder bricht ab. */
async function waitFor(win, expr, timeoutMs = 15000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
        if (await win.webContents.executeJavaScript(expr)) return true;
        await new Promise(r => setTimeout(r, 200));
    }
    throw new Error('Zeitueberschreitung: ' + expr);
}

async function shoot(win, rect, file) {
    const image = await win.webContents.capturePage(rect);
    const out = path.join(OUT_DIR, file);
    fs.writeFileSync(out, image.toPNG());
    const { width, height } = image.getSize();
    console.log(`${file.padEnd(22)} ${width}x${height}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
}

app.whenReady().then(async () => {
    wsServer.startServer(8765, null);
    await new Promise(r => setTimeout(r, 400));

    const win = new BrowserWindow({
        width: 1440, height: 900, show: false,
        transparent: true, backgroundColor: '#00000000',
        useContentSize: true, webPreferences: { offscreen: true }
    });

    try {
        // ---- Dashboard -------------------------------------------------
        await win.loadURL('http://localhost:8765/renderer/index.html');
        await win.webContents.executeJavaScript('document.fonts.ready.then(() => true)');
        // Verbundenen Zustand zeigen — sonst steht der Statuspunkt auf Rot
        // und das Bild behauptet einen Fehler, den es nicht gibt.
        await win.webContents.executeJavaScript(`(() => {
            const s = document.getElementById('status-indicator');
            if (s) { s.classList.remove('disconnected'); s.classList.add('connected'); }
            return true;
        })()`);
        await new Promise(r => setTimeout(r, 700));
        await shoot(win, { x: 0, y: 0, width: 1440, height: 900 }, 'dashboard.png');

        // ---- Alert -----------------------------------------------------
        await win.loadURL('http://localhost:8765/alerts/');
        const payload = resolver.resolveEvent(
            { type: 'raid', username: 'Lena', amount: 42 }, [],
            { lang: 'de', figure: 'raeuber' }
        );
        payload.durationMs = 30000;
        const pump = setInterval(() => wsServer.broadcast('stream_alert', payload), 800);

        await waitFor(win, "!!document.querySelector('.alert-card.is-visible')");
        // Erst aufnehmen, wenn das Sprite dekodiert UND die Breite berechnet
        // ist — eine Breite von 0 hiesse, die Figur fehlt im Bild. Genau so
        // ist der ungueltige calc()-Ausdruck aufgefallen.
        await waitFor(win, `(async () => {
            const el = document.querySelector('.alert-icon--figure');
            if (!el) return false;
            if (parseFloat(getComputedStyle(el).width) < 1) return false;
            const img = new Image();
            img.src = el.style.backgroundImage.slice(5, -2);
            try { await img.decode(); return true; } catch (e) { return false; }
        })()`);
        await new Promise(r => setTimeout(r, 500));

        const rect = await win.webContents.executeJavaScript(`(() => {
            const r = document.querySelector('.alert-card').getBoundingClientRect();
            const p = 26;   // Luft fuer Schatten und Leuchtrand
            return { x: Math.round(r.x - p), y: Math.round(r.y - p),
                     width: Math.round(r.width + p * 2), height: Math.round(r.height + p * 2) };
        })()`);
        await shoot(win, rect, 'alert-raeuber.png');
        clearInterval(pump);
    } catch (err) {
        console.error('Fehlgeschlagen:', err.message);
        app.exit(1);
        return;
    }

    wsServer.stopServer && wsServer.stopServer();
    app.exit(0);
});
