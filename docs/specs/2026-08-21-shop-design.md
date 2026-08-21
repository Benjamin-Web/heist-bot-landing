# Design: Shop für Zuschauer-Kosmetik

**Datum:** 21.08.2026 · **Status:** approved (Chat-Session)
**Repos:** `Desktop/bot-landing` (Seite), `Desktop/Heist_bot` (Backend + Bot)

## Ziel

Zuschauer kaufen Kosmetik für ihre Räuber-Figur, verwalten sie selbst und sehen,
wie lange eine befristete Sprechblase noch läuft. Der Streamer, über dessen Kanal
der Kauf zustande kommt, bekommt 30 % — die Zuordnung passiert über den `ref`-Wert
aus dem `!shop`-Link.

## Entschiedene Punkte (Benjamin, 21.08.2026)

1. **Adresse: `heist-bot.pro/shop/`** — Unterpfad der bestehenden Seite statt
   eigener Unterdomain. Gleicher Railway-Dienst, kein DNS-Eintrag, eine Gestaltung.
   Der `!shop`-Link im Bot wird entsprechend angepasst.
2. **Alles bauen, Kauf zuletzt.** Lemon Squeezy existiert noch nicht; der Kauf-Knopf
   sagt bis dahin „bald verfügbar". Alles andere ist sofort testbar.
3. **Ablauf-Erinnerung im Chat**, drei Tage vorher, einmal pro Stream.

## Aufteilung

- **Teil 3a (dieser Spec):** Anmeldung, Katalog, Besitz verwalten, Blasen-Text,
  Restlaufzeit. Ohne Lemon Squeezy vollständig testbar.
- **Teil 3b (später):** Kauf-Weiterleitung mit Kanal-Zuordnung, `!shop` scharfschalten,
  Ablauf-Erinnerung im Chat.

## Architektur

```
Zuschauer → heist-bot.pro/shop/  (statisch, Landing-Repo)
                │  Twitch-Token (Implicit Grant, nur im Speicher)
                ▼
       Backend /api/shop/login   → prüft Token BEI TWITCH, holt twitch_id,
                │                   legt viewers-Eintrag an
                ▼  Shop-Ausweis (JWT, 7 Tage, typ: "viewer")
       Backend /api/shop/*       → Besitz lesen, Skin wechseln, Blasen-Text setzen
                ▼
             Supabase (Service-Role, nur im Backend)
```

**Warum Implicit Grant:** Eine statische Seite kann kein Client-Secret geheim halten.
Twitch liefert den Token im URL-Fragment; die Seite reicht ihn einmal ans Backend
weiter und verwirft ihn. Dasselbe Verfahren nutzt die Desktop-App bereits
(`src/config/twitchApp.js`), das Backend hat die Prüflogik in
`backend/routes/auth.js` (`twitch-exchange`) schon erprobt.

**Voraussetzung (Benjamin):** In der Twitch-Entwicklerkonsole muss
`https://www.heist-bot.pro/shop/` als OAuth-Weiterleitungsadresse eingetragen sein.
Ohne diesen Eintrag verweigert Twitch die Anmeldung.

### Trennung der Ausweise (sicherheitskritisch)

Streamer-Ausweise enthalten `userId` und öffnen die bestehenden Endpunkte.
Shop-Ausweise enthalten `viewerId`, `twitchId` und `typ: "viewer"`.

- Neue Middleware `authenticateViewer` akzeptiert **nur** `typ === "viewer"`.
- Die bestehende `authenticate` muss Ausweise mit `typ === "viewer"` **ablehnen**,
  damit ein Zuschauer-Ausweis keine Streamer-Endpunkte erreicht.

### Endpunkte (`backend/routes/shop.js`)

| Endpunkt | Auth | Zweck |
|---|---|---|
| `GET /api/shop/catalog` | keine | Aktive Artikel: key, name, kind, price_cents, tint_hex, duration_days |
| `POST /api/shop/login` | keine | Twitch-Token → Shop-Ausweis |
| `GET /api/shop/me` | Zuschauer | Besitz inkl. `expires_at`, aktiver Skin, eigener Blasen-Text |
| `POST /api/shop/equip` | Zuschauer | `{ skin_key }` — Skin aktivieren (nur `kind='skin'`) |
| `POST /api/shop/speech` | Zuschauer | `{ text }` — eigener Blasen-Text, serverseitig gefiltert |

`POST /api/shop/speech` nutzt denselben Filter wie der Bot
(`backend/lib/speechFilter.js`). **Sicherheitsgewinn:** Bisher setzt der Bot den Text
im Namen des Streamers (`POST /api/skins/speech`), wodurch ein manipulierter Client
fremde Texte überschreiben könnte. Im Shop setzt jeder seinen eigenen Text mit dem
eigenen Ausweis; der Bot-Pfad bleibt für `!blase` bestehen.

### Kanal-Zuordnung

Der `!shop`-Link enthält `?ref=<numerische twitch_id des Kanals>`. Die Shop-Seite
merkt sich den Wert (`sessionStorage`) und reicht ihn beim Kauf weiter (Teil 3b).
Kein Wert = kein Streamer-Anteil, der Kauf funktioniert trotzdem.

## Seitenaufbau

1. **Kopf** — Marke, Sprachumschalter, Anmelde-/Abmelde-Knopf
2. **Katalog** (ohne Anmeldung sichtbar) — Karten mit Farbvorschau, Preis, Laufzeit;
   Kauf-Knopf zeigt bis Teil 3b „bald verfügbar"
3. **Mein Räuber** (nur angemeldet) — Besitz, aktiver Skin, Wechsel per Klick
4. **Meine Sprechblase** (nur angemeldet) — Textfeld mit Zeichenzähler (max. 60),
   Restlaufzeit, Hinweis bei abgelehntem Text mit Begründung
5. **Fuß** — wie die Landing-Seite (Impressum, Datenschutz, Discord)

## Dateien

| Datei | Rolle |
|---|---|
| `bot-landing/shop/index.html` | Struktur + deutsche Inhalte |
| `bot-landing/assets/css/shop.css` | nur Shop-spezifische Gestaltung (baut auf `site.css`) |
| `bot-landing/assets/js/shop.js` | Anmeldung, Katalog, Besitz, Blasen-Text |
| `bot-landing/assets/js/i18n-shop.js` | englische Fassung der Shop-Texte |
| `Heist_bot/backend/routes/shop.js` | die fünf Endpunkte |
| `Heist_bot/backend/middleware/auth.js` | `authenticateViewer` + Ablehnung fremder Ausweistypen |

## Fehlerverhalten

- Twitch-Anmeldung schlägt fehl → verständliche Meldung, Katalog bleibt sichtbar.
- Backend nicht erreichbar → Katalog aus dem Cache der letzten Antwort, Verwaltung
  gesperrt mit Hinweis. **Kein leerer Bildschirm** (Lehre aus dem Alert-Vorfall).
- Abgelehnter Blasen-Text → Grund benennen (zu lang, Link, gesperrtes Wort).
- Kein Besitz → freundlicher Hinweis statt leerer Fläche.

## Testen

- Jest für die neuen Backend-Routen, soweit ohne Twitch möglich (Ausweis-Trennung,
  Besitzprüfung, Filter-Anbindung, Fehlerpfade).
- Manuell im Browser: Anmeldung, Katalog, Wechsel, Text setzen — mit Testbesitz,
  den ich per SQL eintrage und danach entferne.

## Nicht in Teil 3a

Kauf-Weiterleitung und Lemon-Squeezy-Anbindung, `!shop` scharfschalten,
Ablauf-Erinnerung im Chat, Geschenke, Bundles, Rabatte, Kaufhistorie.
