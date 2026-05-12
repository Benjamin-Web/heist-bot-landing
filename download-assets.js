const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const ASSETS_DIR = path.join(__dirname, 'assets');
const FONTS_DIR = path.join(ASSETS_DIR, 'fonts');
const JS_DIR = path.join(ASSETS_DIR, 'js');

[FONTS_DIR, JS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function downloadFile(urlStr, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(urlStr, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectUrl = new URL(response.headers.location, urlStr).toString();
                return downloadFile(redirectUrl, dest).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

// Download Lucide JS
const lucideUrl = 'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js';
downloadFile(lucideUrl, path.join(JS_DIR, 'lucide.min.js'))
    .then(() => console.log('Lucide JS downloaded.'))
    .catch(e => console.error('Error downloading Lucide:', e));
