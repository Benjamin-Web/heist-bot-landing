/**
 * Rastert tools/og-card.html zu assets/og-image.png (1200x630).
 *
 * Nutzt das Electron, das im Bot-Repo ohnehin installiert ist — keine neue
 * Abhaengigkeit im Landing-Repo. Aufruf aus diesem Verzeichnis:
 *
 *   "../Heist_bot/node_modules/.bin/electron" tools/capture-og.js
 *
 * Warten auf document.fonts.ready ist nicht optional: ohne das rastert die
 * Karte gelegentlich mit der Ersatzschrift.
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const W = 1200, H = 630;
const SRC = path.join(__dirname, 'og-card.html');
const OUT = path.join(__dirname, '..', 'assets', 'og-image.png');

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        width: W, height: H,
        show: false,
        useContentSize: true,
        webPreferences: { offscreen: true }
    });

    await win.loadFile(SRC);
    await win.webContents.executeJavaScript('document.fonts.ready.then(() => true)');
    // Ein Frame Ruhe, damit Schrift und Bild sicher gezeichnet sind.
    await new Promise(r => setTimeout(r, 400));

    const image = await win.webContents.capturePage({ x: 0, y: 0, width: W, height: H });
    fs.writeFileSync(OUT, image.toPNG());

    const { width, height } = image.getSize();
    console.log(`geschrieben: ${OUT}  ${width}x${height}  ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
    app.exit(0);
});
