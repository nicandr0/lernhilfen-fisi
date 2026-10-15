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

## Aufbau und Bearbeitung

Alle Lernhilfen teilen sich ein Design und ein Verhalten (Leiste oben, Kapitelleiste, Suche, Lernmodus). Gepflegt wird getrennt, veröffentlicht wird je Lernhilfe **eine eigenständige HTML-Datei**, die auch offline und einzeln weitergegeben funktioniert.

```
_vorlage/styles.css       Design aller Seiten
_vorlage/basis.js         Kapitelleiste, Suche, Lernmodus (Lernkarten oder Quiz), Selbsteinschätzung
_vorlage/seite.html       Gerüst einer Lernhilfe
_vorlage/uebersicht.html  Gerüst der Startseite
_vorlage/lernhilfen.json  Liste aller Lernhilfen (Leiste oben und Startseite)
_inhalt/<id>.html         Inhalt je Lernhilfe
bauen.py                  setzt alles zu den fertigen HTML-Dateien zusammen
```

- Design ändern: `_vorlage/styles.css` bearbeiten, dann `python3 bauen.py`.
- Neue Lernhilfe: Inhaltsdatei in `_inhalt/` anlegen (Aufbau wie die vorhandenen), Eintrag in `_vorlage/lernhilfen.json`, dann `python3 bauen.py`. Leiste und Startseite enthalten sie danach automatisch.
- Vor jedem Commit: `python3 bauen.py --pruefen` meldet, ob die fertigen Dateien zum Stand der Vorlagen passen.
- Die fertigen HTML-Dateien nicht direkt bearbeiten, sie werden beim nächsten Bauen überschrieben.

Nur Python-Standardbibliothek nötig, keine weiteren Pakete.

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
