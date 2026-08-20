# heist-bot.pro Relaunch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Landing-Page erzählt das neue Modell — kostenloser Bot für Streamer, Einnahmen über Zuschauer-Kosmetik mit 30 % Beteiligung — und bringt Streamer zum Download.

**Architecture:** Eine deutsche `index.html` (wird ausgeliefert und gefunden), Englisch per `data-i18n` + JavaScript umschaltbar. Gestaltung, Verhalten und Übersetzungen liegen in getrennten Dateien unter `assets/`, statt wie bisher alles in einer 2.021-Zeilen-Datei. Kein Build-Schritt: die Dateien sind direkt deploybar. Spec: `docs/specs/2026-08-20-landing-relaunch-design.md`.

**Tech Stack:** Statisches HTML/CSS/JS, keine Frameworks, keine Build-Kette. Lucide-Icons liegen lokal (`assets/js/lucide.min.js`), Schriften Orbitron + Rajdhani lokal (`assets/fonts/`, `assets/fonts.css`).

**Regeln für JEDE Task:**
1. Repo `C:\Users\benja\Desktop\bot-landing`, Branch `master`. Vor jedem Commit `git -C ... branch --show-current` prüfen. `git -C` benutzen.
2. Commits ohne jegliche Claude-/AI-Attribution.
3. **Keine externen Aufrufe** außer Links zu Twitch/Discord/Ko-fi/GitHub. Keine CDN-Skripte, keine Google-Fonts — die Datenschutzerklärung sagt aus, dass nichts nachgeladen wird.
4. **Keine toten Links.** Jeder `href="#..."` braucht ein Ziel; kein Link auf `shop.heist-bot.pro`, solange die Seite nicht existiert.
5. **Nichts versprechen, was es nicht gibt.** Der Kosmetik-Abschnitt beschreibt das Modell, ohne Kaufmöglichkeit vorzutäuschen.
6. Deutsch ist die Quelle im HTML; jeder sichtbare Text braucht ein `data-i18n`-Attribut und einen englischen Eintrag in `assets/js/i18n.js`.

---

## Dateistruktur

| Datei | Rolle |
|---|---|
| `index.html` | **Neu geschrieben** — Struktur + deutsche Inhalte, `data-i18n` an jedem sichtbaren Text |
| `assets/css/site.css` | **Neu** — gesamte Gestaltung, Design-Token aus dem Bestand übernommen |
| `assets/js/app.js` | **Neu** — Navigation, Sprachumschalter-Verdrahtung, Chat-Demo, Scroll-Animationen |
| `assets/js/i18n.js` | **Neu** — englische Übersetzungen + Umschaltlogik |
| `impressum.html`, `datenschutz.html` | unverändert (nur Nav-/Fuß-Links prüfen) |
| `assets/fonts.css`, `assets/fonts/`, `assets/js/lucide.min.js`, `assets/screenshots/`, `assets/partners/`, `assets/favicon.png`, `robots.txt`, `sitemap.xml` | unverändert übernehmen |

**Design-Token aus dem Bestand** (in `site.css` übernehmen, `--pro-gold` in `--gold-gradient` umbenennen):

```css
:root {
    --gold: #ffd700;
    --gold-deep: #ff8c00;
    --gold-gradient: linear-gradient(135deg, #ffd700, #ff8c00);
    --surface: #0a0a0f;
    --surface-1: #12121a;
    --surface-2: #1a1a24;
    --surface-3: #22222e;
    --text: #ffffff;
    --text-2: #c5c5d0;
    --text-3: #8a8a98;
    --outline: rgba(255, 255, 255, 0.10);
    --outline-soft: rgba(255, 255, 255, 0.05);
    --gold-soft: rgba(255, 215, 0, 0.10);
    --gold-line: rgba(255, 215, 0, 0.22);
    --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-xl: 24px; --r-full: 999px;
    --shadow-1: 0 2px 8px rgba(0,0,0,0.3);
    --shadow-2: 0 8px 24px rgba(0,0,0,0.4);
    --shadow-3: 0 16px 48px rgba(0,0,0,0.55);
}
```

Schriften: `Orbitron` für Überschriften/Marke, `Rajdhani` für Fließtext — beide bereits lokal eingebunden über `assets/fonts.css`.

---

### Task 1: Gerüst, Design-Token und Kopfbereich

**Files:** Create `assets/css/site.css`, `index.html` (neu), `assets/js/app.js`; Reference `index.html` (alt, via `git show HEAD:index.html`)

- [ ] **Step 1:** Alte Seite als Referenz sichern: `git -C "C:\Users\benja\Desktop\bot-landing" show HEAD:index.html > /tmp/alt-index.html`. Sie ist die Quelle für Screenshot-Pfade, Partner-Markup, Chat-Demo-Logik, FAQ- und Command-Inhalte. NICHT kopieren, sondern gezielt nachschlagen.
- [ ] **Step 2:** `assets/css/site.css` anlegen mit: Reset (`*,*::before,*::after{box-sizing:border-box}`, `body{margin:0}`), den Design-Token oben, Basistypografie (Body `Rajdhani`, Überschriften `Orbitron`), `.container{width:min(1120px,100% - 2rem);margin-inline:auto}`, und `img{max-width:100%;height:auto;display:block}`. **Mobil zuerst:** Basisregeln gelten für Handy, Aufweitungen via `@media (min-width: 768px)`.
- [ ] **Step 3:** `index.html` neu schreiben — Grundgerüst mit `<html lang="de">`, dem bestehenden `<head>` als Vorlage (Titel/Description auf Deutsch und das neue Modell anpassen: Titel `Heist Bot — kostenloser Twitch-Bot mit Raub-Minispiel`, Description nennt „100 % kostenlos, alle Funktionen"), Einbindung von `assets/fonts.css`, `assets/css/site.css`, `assets/js/lucide.min.js`, `assets/js/i18n.js`, `assets/js/app.js` (beide JS mit `defer`).
- [ ] **Step 4:** Kopfbereich bauen: Logo (`assets/favicon.png`) + Wortmarke, Navigation (Anker: `#funktionen`, `#kostenlos`, `#start`, `#befehle`, `#faq`), Download-Knopf, Sprachumschalter (`<button id="lang-toggle" data-lang="de">DE</button>` — Beschriftung wechselt zu `EN`), Hamburger-Menü für Handy. Alle sichtbaren Texte mit `data-i18n`.
- [ ] **Step 5:** `assets/js/app.js` anlegen mit Hamburger-Umschaltung, Schließen bei Klick auf einen Anker, und `lucide.createIcons()`.
- [ ] **Step 6:** Sichtprüfung: `npx --yes serve . -l 8791` im Hintergrund, `mcp__Claude_Browser__preview_start` mit `http://localhost:8791`, Screenshot bei 1280 und bei 375 Breite (`resize_window`), `read_console_messages` ohne Fehler.
- [ ] **Step 7:** Commit: `feat: neues Seitengeruest mit Kopfbereich und Design-Token`

---

### Task 2: Held-Bereich

**Files:** Modify `index.html`, `assets/css/site.css`

- [ ] **Step 1:** Held-Abschnitt bauen. Inhalt (deutsch, Ton: nüchtern, kein Marketing-Superlativ):
  - Kicker: `100 % kostenlos — alle Funktionen`
  - Überschrift: `Dein Chat plant den nächsten Raub`
  - Fließtext: `Zuschauer setzen ihre Punkte ein, ziehen gemeinsam los und sehen im Stream, wie es ausgeht. Dazu Alerts, Moderation, Custom Commands und Timer — in einer App, die nichts kostet.`
  - Zwei Knöpfe: `Für Windows herunterladen` → `https://github.com/Benjamin-Web/Heist_Bot_Updates/releases` und `Ansehen` → `#beweis`
  - Hinweiszeile: `Windows · OBS-Browserquelle · Anmeldung mit Twitch`
- [ ] **Step 2:** Gestaltung: einspaltig auf dem Handy, ab 768px zweispaltig (Text links, Overlay-Bild rechts — `assets/screenshots/dashboard-3.jpg` zeigt die OBS-Ansicht; im alten HTML unter „OBS" beschriftet, dort nachschlagen und das passendste Bild wählen). Goldener Verlauf nur als Akzent (Überschrift-Highlight, Knopf), nicht flächig.
- [ ] **Step 3:** Sichtprüfung wie Task 1 Step 6, Screenshot mobil + Desktop.
- [ ] **Step 4:** Commit: `feat: Held-Bereich mit neuem Versprechen`

---

### Task 3: Beweis-Abschnitt mit Chat-Demo

**Files:** Modify `index.html`, `assets/css/site.css`, `assets/js/app.js`

- [ ] **Step 1:** Abschnitt `id="beweis"` anlegen: Überschrift `Sieh es dir an, bevor du es installierst`, darunter zwei Karten — links das Overlay-Bild groß, rechts die interaktive Chat-Demo.
- [ ] **Step 2:** Chat-Demo aus der alten Seite portieren: In `/tmp/alt-index.html` ab `const chatMessages = document.getElementById('chatMessages')` die Logik lesen und nach `assets/js/app.js` übernehmen — **funktional gleich, aber aufgeräumt**: eine Funktion `initChatDemo()`, Nachrichten-Skript als Datenstruktur oben in der Funktion, Texte über `data-i18n`-fähige Schlüssel oder ein Objekt, das `i18n.js` übersetzen kann. Die Demo darf keine echten Netzwerkaufrufe machen.
- [ ] **Step 3:** Die Demo-Befehle auf den aktuellen Funktionsumfang bringen: `!raub 100`, `!coins`, `!topliste`. Antworten in der Tonalität des echten Bots (siehe `Heist_bot/translations.js`, Schlüssel `bot_heist_start`, `bot_coins`, `bot_toplist` — im Bot-Repo nachschlagen, sinngemäß übernehmen, nicht erfinden).
- [ ] **Step 4:** Sichtprüfung: Demo im Browser wirklich benutzen (Befehl eintippen/klicken, Antwort erscheint), Screenshot, Konsole fehlerfrei.
- [ ] **Step 5:** Commit: `feat: Beweis-Abschnitt mit interaktiver Chat-Demo`

---

### Task 4: Funktions-Abschnitt

**Files:** Modify `index.html`, `assets/css/site.css`

- [ ] **Step 1:** Abschnitt `id="funktionen"`: Überschrift `Alles dabei, nichts gesperrt`. Neun Karten, je Icon (Lucide) + Titel + ein Satz Nutzen. Inhalte:
  - `Raub-Minispiel` — Der Kern: Einsatz im Chat, gemeinsame Beute, Animation im Overlay.
  - `Zombie-Hunde-Modus` — Zweiter Spielmodus für Abwechslung, gleiche Regeln, andere Welt.
  - `Alerts` — Follow, Sub, Cheer, Raid — mit eigenen Bildern, Sounds und Texten.
  - `Loyalty, XP & Level` — Zuschauer sammeln fürs Zuschauen, holen den Tagesbonus, steigen auf.
  - `Moderation` — Spam-Filter gegen Caps, Emote-Fluten, Links und Wiederholungen.
  - `Custom Commands` — Eigene Befehle für Discord-Link, Regeln, Sounds oder Werbung.
  - `Timer & Counter` — Wiederkehrende Nachrichten und Zähler wie `!deaths`.
  - `Verlosungen` — Tickets, Sub-Only, Nachziehen, Countdown zum Einlösen.
  - `Mod-Dashboard` — Deine Mods konfigurieren im Browser, ohne Installation.
- [ ] **Step 2:** Gestaltung: Karten-Raster, eine Spalte mobil, zwei ab 768px, drei ab 1024px. Karten mit `--surface-1`, dünner Rahmen `--outline`, Icon in Gold.
- [ ] **Step 3:** Sichtprüfung + Screenshot (mobil + Desktop).
- [ ] **Step 4:** Commit: `feat: Funktionsuebersicht als Nutzen statt Featureliste`

---

### Task 5: „Warum kostenlos" — das neue Modell

**Files:** Modify `index.html`, `assets/css/site.css`

Dieser Abschnitt ist der eigentliche Grund für den Relaunch. Er muss ehrlich sein: der Shop existiert noch nicht.

- [ ] **Step 1:** Abschnitt `id="kostenlos"` bauen:
  - Überschrift: `Warum das kostenlos ist`
  - Text: `Andere Bots kosten nichts, also kostet dieser auch nichts — und zwar dauerhaft, mit allen Funktionen. Bezahlt wird das anders: Zuschauer können ihrer Räuber-Figur ein eigenes Aussehen und eine Sprechblase geben. Rein optisch, ohne Einfluss auf das Spiel.`
  - Hervorgehobene Zahl: `30 %` mit Zeile `deines Zuschauer-Umsatzes gehen an dich`
  - Drei kurze Punkte: `Nichts zu kaufen für dich`, `Keine Funktion gesperrt`, `Kosmetik ändert nichts am Spielausgang`
  - Statuszeile: `Der Shop ist in Vorbereitung — der Bot ist jetzt schon vollständig nutzbar.` **Kein Link, kein Datum.**
- [ ] **Step 2:** Gestaltung: abgesetzter Block (`--surface-2`, goldene Linie oben), die `30 %` groß in Orbitron. Keine Preis-Karten-Anmutung, kein „Most Popular"-Band.
- [ ] **Step 3:** Prüfen: `grep -in "shop.heist-bot.pro\|jetzt kaufen\|kaufen" index.html` → keine Kauf-Aufforderung, kein Link auf den Shop.
- [ ] **Step 4:** Sichtprüfung + Screenshot.
- [ ] **Step 5:** Commit: `feat: Abschnitt zum kostenlosen Modell mit Umsatzbeteiligung`

---

### Task 6: Einrichtung, Vertrauen, Befehle, FAQ, Fuß

**Files:** Modify `index.html`, `assets/css/site.css`

- [ ] **Step 1:** Abschnitt `id="start"` — drei Schritte: `Herunterladen und installieren` (Windows), `Mit Twitch anmelden` (ein Klick, kein Token-Kopieren), `Browserquelle in OBS eintragen` (`http://localhost:8765`). Jeder Schritt eine Zeile Erklärung.
- [ ] **Step 2:** Vertrauens-Abschnitt: Partner-Kanäle mit den vorhandenen Logos (`assets/partners/l4ny.png`, `mohjo.png`) und je einem Link auf den Twitch-Kanal (`https://twitch.tv/l4ny_`, `https://twitch.tv/mohjo_beist`), dazu Discord-Einladung `https://discord.gg/FV83Fcu3V3`.
- [ ] **Step 3:** Abschnitt `id="befehle"` — Tabelle der Zuschauer-Befehle. Inhalte aus der alten Seite übernehmen (`/tmp/alt-index.html`, Abschnitt `id="commands"`) und gegen `Heist_bot/bot.js` prüfen: nur Befehle zeigen, die es wirklich gibt. `!shop` und `!blase` NICHT aufführen (noch nicht ausgeliefert).
- [ ] **Step 4:** Abschnitt `id="faq"` — vier Fragen: `Kostet der Bot wirklich nichts?`, `Brauche ich Programmierkenntnisse?`, `Läuft das auch auf Mac oder Linux?` (Antwort: Windows, andere Systeme nicht geplant), `Was ist mit meinen Daten?` (Antwort verweist auf `datenschutz.html`). Aufklappbar über `<details>`/`<summary>` — kein JavaScript nötig.
- [ ] **Step 5:** Fuß: Discord, Ko-fi (`https://ko-fi.com/ronincannons`, Text: freiwillige Unterstützung, ohne Gegenleistung), `impressum.html`, `datenschutz.html`, Urheberrechtszeile.
- [ ] **Step 6:** Anker-Prüfung: Für jeden `href="#..."` das Ziel-`id` nachweisen (Skript wie in Teil 2a: alle `href="#x"` sammeln, gegen alle `id="x"` prüfen, Ergebnis „tote: keine").
- [ ] **Step 7:** Sichtprüfung + Screenshot.
- [ ] **Step 8:** Commit: `feat: Einrichtung, Partner, Befehle, FAQ und Fuss`

---

### Task 7: Englische Übersetzung und Umschalter

**Files:** Create `assets/js/i18n.js`; Modify `index.html`, `assets/js/app.js`

- [ ] **Step 1:** `assets/js/i18n.js` anlegen mit einem Objekt `EN` (Schlüssel = `data-i18n`-Werte, Wert = englischer Text) und einer Funktion `applyLanguage(lang)`, die alle `[data-i18n]`-Elemente durchgeht: bei `en` den Wert aus `EN` einsetzen, bei `de` den ursprünglichen deutschen Text zurücksetzen. Den deutschen Ausgangstext beim ersten Lauf in `element.dataset.de` sichern, damit nichts verloren geht.
- [ ] **Step 2:** Auch `<html lang>` und übersetzbare Attribute berücksichtigen: `data-i18n-attr="placeholder"` bzw. `aria-label` — nur dort einsetzen, wo tatsächlich gebraucht.
- [ ] **Step 3:** In `app.js` verdrahten: Klick auf `#lang-toggle` wechselt zwischen `de`/`en`, speichert in `localStorage` unter `lang`, aktualisiert die Knopf-Beschriftung. Beim Laden: gespeicherte Sprache verwenden; wenn keine gespeichert ist und `navigator.language` nicht mit `de` beginnt, `en` verwenden.
- [ ] **Step 4:** Vollständigkeit prüfen — Skript, das alle `data-i18n`-Werte aus `index.html` sammelt und gegen die Schlüssel in `i18n.js` abgleicht; Ausgabe: fehlende Schlüssel. **Muss leer sein.**
- [ ] **Step 5:** Sichtprüfung: Seite laden, auf EN schalten, durchscrollen — kein deutscher Resttext, kein Layoutbruch durch längere englische Wörter. Screenshot in beiden Sprachen. Neu laden: Sprache bleibt erhalten.
- [ ] **Step 6:** Commit: `feat: englische Fassung und Sprachumschalter`

---

### Task 8: Feinschliff, Prüfung, Abnahme

**Files:** Modify je nach Befund

- [ ] **Step 1:** Scroll-Animationen (`IntersectionObserver`, Klasse `reveal` wie bisher) in `app.js` ergänzen — sparsam, und mit `@media (prefers-reduced-motion: reduce)` abschaltbar.
- [ ] **Step 2:** Externe Aufrufe prüfen: `grep -n "https://" index.html assets/css/site.css assets/js/*.js` — erlaubt sind nur Links (`<a href>`) zu twitch.tv, discord.gg, ko-fi.com, github.com. **Kein** `<script src>`, `<link href>` oder `url()` auf fremde Hosts.
- [ ] **Step 3:** Ohne JavaScript testen: im Browser JS deaktivieren (oder `app.js`/`i18n.js` temporär auskommentieren) — Inhalte müssen lesbar bleiben, Navigation funktionieren, FAQ aufklappbar sein.
- [ ] **Step 4:** Mobile Prüfung bei 375px: kein horizontales Scrollen (`document.documentElement.scrollWidth <= window.innerWidth` im Browser prüfen), Knöpfe mindestens 44px hoch.
- [ ] **Step 5:** `sitemap.xml` prüfen: enthält sie nur existierende Seiten? Datum aktualisieren.
- [ ] **Step 6:** Screenshots als Beleg: Desktop und Handy, jeweils Deutsch und Englisch.
- [ ] **Step 7:** Commit: `feat: Feinschliff, Bewegungsreduktion und Pruefungen`

---

**NICHT in diesem Plan:** Shop-Seite und Kauf (Teil 3), Änderungen an `impressum.html`/`datenschutz.html`, neue Screenshots oder Videos, Deployment (Push entscheidet Benjamin).
