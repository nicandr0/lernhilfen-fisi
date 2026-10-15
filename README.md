# Lernhilfen FiSi

Interaktive Lernhilfen aus meiner Umschulung zum Fachinformatiker Systemintegration. Jede Lernhilfe ist eine einzelne HTML-Datei: im Browser öffnen, suchen, nachlesen, mit Lernkarten oder Quiz üben. Keine Installation, funktioniert auch offline.

**Direkt im Browser:** https://nicandr0.github.io/lernhilfen-fisi/

| Lernhilfe | Inhalt | Grundlage |
|---|---|---|
| [Linux auf einem Blatt](linux-auf-einem-blatt.html) | 272 Befehle und wichtige Pfade mit Beispielen und Tipps, Lernmodus, Filter **LPI 010** für die Prüfung Linux Essentials (010-160), Kategorie für Fortgeschrittene (Docker, LXD) | Befehlsauswahl angelehnt an [„Linux auf einem Blatt“](https://helmbold.de/artikel/linux-blatt/) von Christian Helmbold (2012), ergänzt um Befehle aus dem Ubuntu CLI cheat sheet (Canonical, 2025); Beschreibungen, Beispiele, Tipps und Gruppierung in eigener Formulierung |
| [Subnetting & VLSM](subnetting-vlsm-auf-einem-blatt.html) | IPv4-Grundlagen, klassisches Subnetting, VLSM, Rechenrezepte, Glossar, Lernkarten | eigene Zusammenfassung nach Unterricht und Übungsaufgaben |
| [OSI-Modell](osi-modell-auf-einem-blatt.html) | 7 Schichten mit Aufgaben, Protokollen, Adressen und Geräten, Vergleich mit TCP/IP, Kapselung, Lernkarten | eigene Zusammenfassung nach dem im Unterricht erarbeiteten Miro-Board |
| [Routing](routing-auf-einem-blatt.html) | ANDing, Default Route, Routing-Tabelle, statisch vs. dynamisch, Fehlerbilder, Glossar, „Wenn's hakt“, Quiz, Selbsteinschätzung | eigene Zusammenfassung nach Unterricht |
| [Switching](switching-auf-einem-blatt.html) | VLANs, Access/Trunk, STP, LAG, LACP, MLAG, Fehlerbilder, Lernkarten | eigene Zusammenfassung nach Unterricht |

## Navigation zwischen den Lernhilfen

Jede Lernhilfe hat oben dieselbe Leiste mit Links zu allen anderen. Sie bleibt beim Scrollen stehen. Weil jede Seite eine eigenständige HTML-Datei bleiben soll (auch offline nutzbar), steht die Leiste in jeder Datei einzeln (`<nav class="lh-nav">` plus `<style id="lh-nav-css">`). **Kommt eine neue Lernhilfe dazu, muss ihr Link in allen Dateien nachgetragen werden.**

## LPI-Etiketten

Die Linux-Lernhilfe markiert Einträge mit den Nummern der Lernziele von **LPI Linux Essentials 010-160 (Version 1.6)**, z. B. `LPI 3.2`. Die Lernziele selbst sind © Linux Professional Institute und hier nur über ihre Nummer referenziert: https://www.lpi.org/our-certifications/exam-010-objectives/

## Lizenz

© 2026 Nicandro Marziale, Design, Entwicklung und Formulierung.

Lizenziert unter **Creative Commons BY-NC-SA 4.0** ([Kurzfassung](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de), Volltext in [LICENSE](LICENSE)):
- teilen und bearbeiten erlaubt
- mit Namensnennung
- nicht kommerziell
- Bearbeitungen unter derselben Lizenz

Die Lernhilfen sind ein Lernwerkzeug, kein Ersatz für die Original-Unterrichtsunterlagen. Fehler gefunden? Gern ein Issue anlegen.
