# Design: heist-bot.pro — Relaunch

**Datum:** 20.08.2026 · **Status:** approved (Chat-Session) · **Repo:** `Desktop/bot-landing` (Branch `master`)

## Warum

Die Seite bewirbt noch ein PRO-Abo, das es seit v1.10.0 nicht mehr gibt. Das neue Modell:
Der Bot ist für Streamer komplett kostenlos, Geld kommt von Zuschauern, die Kosmetik für
ihre Räuber-Figur kaufen; der Streamer erhält 30 % der über seinen Kanal attribuierten Käufe.
Die Seite muss dieses Modell erzählen — und zwar so, dass ein Streamer den Bot installiert.

## Entschiedene Punkte (Benjamin, 20.08.2026)

1. **Zielgruppe: Streamer zuerst.** Zuschauer-Kosmetik kommt vor, aber als Argument FÜR
   Streamer („deine Zuschauer verewigen sich, du verdienst 30 % mit"). Ohne Streamer keine
   Zuschauer.
2. **Zweisprachig DE/EN**, Deutsch ist Standard und wird als HTML ausgeliefert.
3. **Neu gestaltet, Heist-Thema behalten** — dunkel/gold und die Räuber-Welt bleiben als
   Wiedererkennung zu Bot, Overlay und Discord.
4. **Design-Gerüst wiederverwendbar**, damit die Shop-Seite (Teil 3) später wie dasselbe
   Produkt wirkt.

## Technischer Ansatz

**Eine deutsche HTML-Datei, Englisch per JavaScript.** Alternativen und warum nicht:
zwei getrennte Sprachdateien (beste Sichtbarkeit für beide Sprachen, aber jeder Text müsste
doppelt gepflegt werden) oder ein Build-Skript (saubere Quelle, aber ein vergessener
Build-Lauf veröffentlicht veraltete Texte). Für die tatsächliche Zielgruppe — deutschsprachige
Streamer — zählt die deutsche Auffindbarkeit; Englisch bedient zufällige internationale
Besucher. Kein Build-Schritt, die Datei bleibt direkt deploybar.

### Dateistruktur (statt einer 2.021-Zeilen-Datei)

| Datei | Rolle |
|---|---|
| `index.html` | Struktur + deutsche Inhalte |
| `assets/css/site.css` | gesamte Gestaltung |
| `assets/js/app.js` | Navigation, Chat-Demo, Scroll-Animationen |
| `assets/js/i18n.js` | Sprachumschaltung + englische Texte |

Begründung: Änderungen an einer Datei mit HTML, CSS und JS gleichzeitig sind fehleranfällig —
sowohl für Benjamin als auch für KI-gestützte Bearbeitung. Getrennte Dateien mit je einer
Aufgabe sind zuverlässig änderbar.

### Sprachumschaltung

- Deutsch steht im HTML (wird von Suchmaschinen gefunden).
- `assets/js/i18n.js` enthält ein Objekt `en` mit Übersetzungen, adressiert über
  `data-i18n`-Attribute — dasselbe Muster wie im Bot (`translations.js`), also vertraut.
- Umschalter oben rechts; Auswahl in `localStorage`, damit sie erhalten bleibt.
- Beim ersten Besuch: Deutsch, außer die Browsersprache ist eindeutig nicht-deutsch.
- `<html lang>` wird beim Umschalten mitgesetzt.

## Seitenaufbau

1. **Held** — Was der Bot macht, in einem Satz: der Chat spielt gemeinsam einen Raub,
   sichtbar im Stream. Download-Knopf, „100 % kostenlos" als Aussage, nicht als Preisschild.
2. **Beweis statt Behauptung** — Overlay groß gezeigt, daneben die interaktive Chat-Demo
   (bestehender Baustein, wird übernommen und überarbeitet).
3. **Was du bekommst** — Features als Nutzen formuliert: Heist-Spiel, Alerts, Loyalty/XP,
   Moderation/Spam-Filter, Custom Commands, Timer, Counter, Verlosungen, Mod-Dashboard,
   5 Sprachen.
4. **Warum kostenlos — und was du verdienst** — Zuschauer kaufen Kosmetik, Streamer bekommt
   30 %. **Ohne Kauf-Link, solange der Shop nicht existiert** (`shop.heist-bot.pro` ist noch
   nicht erreichbar). Formulierung als „in Kürze", kein Datum, kein Versprechen.
5. **In 3 Schritten startklar** — Herunterladen → mit Twitch anmelden → Browser-Quelle in OBS.
6. **Vertrauen** — Partner-Kanäle (L4ny_, Mohjo), Discord, Befehlsübersicht, FAQ.
7. **Fuß** — Discord, Ko-fi als freiwillige Unterstützung ohne Gegenleistung, Impressum,
   Datenschutz.

## Bestand

**Bleibt unverändert:** `impressum.html`, `datenschutz.html` (rechtlich nötig), lokal
eingebundene Schriften unter `assets/fonts/` samt `fonts.css` (kein Google-Fonts-Aufruf —
DSGVO), `robots.txt`, `sitemap.xml`, `assets/screenshots/`, `assets/partners/`,
`assets/js/lucide.min.js`, Favicon.

**Verschwindet:** alle Reste des Abo-Modells, die Preis-Karte samt „Most Popular"-Anmutung,
Preis-Vokabular, `download-assets.js` bleibt unangetastet (Hilfsskript, nicht Teil der Seite).

## Qualitätsanforderungen

- **Mobil zuerst prüfen:** Die meisten Streamer schauen sich so etwas auf dem Handy an.
  Kein horizontales Scrollen, Tap-Ziele ausreichend groß.
- **Keine externen Aufrufe** außer Twitch/Discord/Ko-fi-Links (DSGVO, siehe Datenschutz).
- **Ohne JavaScript** bleibt die Seite lesbar (Inhalte stehen im HTML; nur Umschaltung,
  Demo und Animationen brauchen JS).
- **Sichtprüfung im Browser** vor dem Commit, mit Screenshot als Beleg — mobil und Desktop.
- Keine toten Anker, keine Links auf nicht existierende Seiten (Lehre aus `!shop`).

## Nicht in diesem Umbau

Shop-Seite und Kauf (Teil 3), Preisangaben zu Kosmetik-Artikeln, Änderungen an Impressum
oder Datenschutz, neue Screenshots oder Videos (vorhandene Assets werden verwendet),
Deployment (Benjamin entscheidet, wann gepusht wird).
