/**
 * Rastert assets/brand/heist-badge.svg zu assets/favicon.png.
 *
 * Die Marke liegt hier als eigene Datei, nicht als Verweis ins Bot-Repo:
 * die Seite soll ihre Markenzeichen selbst besitzen und ohne Nachbarordner
 * baubar sein. Quelle der Wahrheit bleibt shared/brand/ im Bot-Repo — wer
 * die Marke dort aendert, kopiert die beiden SVG hierher und laesst das
 * hier einmal laufen.
 *
 * Aufruf: "../Heist_bot/node_modules/.bin/electron" tools/export-favicon.js
 */
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const GR = 512;
const QUELLE = path.join(__dirname, '..', 'assets', 'brand', 'heist-badge.svg');
const ZIEL = path.join(__dirname, '..', 'assets', 'favicon.png');

app.disableHardwareAcceleration();
const notaus = setTimeout(() => { console.error('Zeitueberschreitung'); app.exit(1); }, 45000);

app.whenReady().then(async () => {
    const svg = fs.readFileSync(QUELLE, 'utf8')
        .replace(/<svg /, `<svg width="${GR}" height="${GR}" `);
    const win = new BrowserWindow({ width: GR, height: GR, show: false,
        transparent: true, backgroundColor: '#00000000',
        useContentSize: true, webPreferences: { offscreen: true } });
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(
        '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}'
        + 'svg{display:block}</style>' + svg));
    await new Promise(r => setTimeout(r, 700));
    const img = await win.webContents.capturePage({ x: 0, y: 0, width: GR, height: GR });
    fs.writeFileSync(ZIEL, img.toPNG());
    console.log('favicon.png', img.getSize().width + 'x' + img.getSize().height,
        (fs.statSync(ZIEL).size / 1024).toFixed(0) + ' KB');
    clearTimeout(notaus);
    app.exit(0);
});
