#!/usr/bin/env python3
"""Baut die Lernhilfen aus Vorlage und Inhalt zusammen.

    python3 bauen.py            alle Seiten neu erzeugen
    python3 bauen.py --pruefen  nur prüfen, ob die fertigen Dateien aktuell sind

Aufbau:
    _vorlage/styles.css       Design aller Seiten
    _vorlage/basis.js         gemeinsames Verhalten (Kapitelleiste, Suche, Lernmodus)
    _vorlage/seite.html       Gerüst einer Lernhilfe
    _vorlage/uebersicht.html  Gerüst der Startseite
    _vorlage/lernhilfen.json  Liste aller Lernhilfen (Leiste oben + Startseite)
    _inhalt/<id>.html         Inhalt je Lernhilfe, in Blöcke geteilt:
                              <!--@meta-->{json}  <!--@style-->  <!--@meta-zeile-->
                              <!--@knoepfe-->  <!--@inhalt-->  <!--@skript-->  <!--@fuss-->

Ergebnis ist je Lernhilfe EINE eigenständige HTML-Datei (auch offline nutzbar).
Nur Python-Standardbibliothek.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VORLAGE = ROOT / '_vorlage'
INHALT = ROOT / '_inhalt'
BLOCK = re.compile(r'<!--@([a-z-]+)-->\n?')


def lesen(p):
    return p.read_text(encoding='utf-8')


def bloecke(text, name):
    teile = BLOCK.split(text)
    out = {'_vorspann': teile[0]}
    for i in range(1, len(teile), 2):
        if teile[i] in out:
            raise SystemExit(f'{name}: Block @{teile[i]} doppelt')
        out[teile[i]] = teile[i + 1].rstrip('\n')
    return out


def fuellen(vorlage, werte, name):
    def ersetzen(m):
        key = m.group(1)
        if key not in werte:
            raise SystemExit(f'{name}: Platzhalter {{{{{key}}}}} ohne Wert')
        return werte[key]
    return re.sub(r'\{\{([A-Z_]+)\}\}', ersetzen, vorlage)


def leiste(liste, aktuell):
    links = ['<a href="index.html"' + (' aria-current="page"' if aktuell == 'index.html' else '') + '>Übersicht</a>']
    for lh in liste:
        cur = ' aria-current="page"' if lh['datei'] == aktuell else ''
        links.append(f'<a href="{lh["datei"]}"{cur}>{html.escape(lh["nav"])}</a>')
    return ('<nav class="lh-nav" aria-label="Lernhilfen"><span class="lh-ttl">lernhilfen/</span>'
            + ''.join(links) + '</nav>')


def bauen():
    liste = json.loads(lesen(VORLAGE / 'lernhilfen.json'))
    styles = lesen(VORLAGE / 'styles.css').rstrip('\n')
    basis = lesen(VORLAGE / 'basis.js').rstrip('\n')
    seite = lesen(VORLAGE / 'seite.html')
    ergebnis = {}

    for lh in liste:
        quelle = INHALT / f'{lh["id"]}.html'
        b = bloecke(lesen(quelle), quelle.name)
        meta = json.loads(b.get('meta', '{}'))
        art = meta.get('lernen', 'karten')
        meta_zeile = b.get('meta-zeile') or (
            '      <span><b data-stat="kapitel">0</b> Kapitel</span>\n'
            f'      <span><b data-stat="lernen">0</b> {"Quizfragen" if art == "quiz" else "Lernkarten"}</span>\n'
            '      <span id="statVisible" class="hidden"><b id="statVisibleNum">0</b> Treffer</span>')
        stamm = lh['datei'].rsplit('.', 1)[0]
        werte = {
            'TITEL': meta.get('titel', f'{stamm}.sh'),
            'BESCHREIBUNG': html.escape(meta.get('beschreibung', lh['beschreibung']), quote=True),
            'STYLES': styles,
            'SEITEN_STYLE': f'<style>\n{b["style"]}\n</style>' if b.get('style') else '',
            'LHNAV': leiste(liste, lh['datei']),
            'PFAD': f'{stamm}.sh',
            'BEFEHL': html.escape(lh['befehl']),
            'UNTERTITEL': meta['untertitel'],
            'META': meta_zeile,
            'SUCHE_PLATZHALTER': html.escape(meta.get('suche', 'Suchen …'), quote=True),
            'KNOEPFE': b.get('knoepfe', ''),
            'NAV_TITEL': meta.get('nav_titel', 'kapitel'),
            'INHALT': b.get('inhalt', ''),
            'SKRIPT': b.get('skript', ''),
            'BASIS_JS': basis,
            'FUSS': b.get('fuss', ''),
        }
        ergebnis[lh['datei']] = fuellen(seite, werte, quelle.name)

    karten = '\n'.join(
        f'      <a class="lernhilfe" href="{lh["datei"]}"><b>{html.escape(lh["befehl"])}</b>'
        f'<small>{html.escape(lh["beschreibung"])}</small></a>' for lh in liste)
    ergebnis['index.html'] = fuellen(lesen(VORLAGE / 'uebersicht.html'), {
        'STYLES': styles, 'LHNAV': leiste(liste, 'index.html'),
        'ANZAHL': str(len(liste)), 'KARTEN': karten}, 'uebersicht.html')
    return ergebnis


def main():
    pruefen = '--pruefen' in sys.argv[1:]
    ergebnis = bauen()
    veraltet = []
    for datei, text in ergebnis.items():
        ziel = ROOT / datei
        alt = ziel.read_text(encoding='utf-8') if ziel.exists() else None
        if alt == text:
            continue
        veraltet.append(datei)
        if not pruefen:
            ziel.write_text(text, encoding='utf-8')
    if pruefen:
        if veraltet:
            print('Nicht aktuell (python3 bauen.py ausführen):', ', '.join(veraltet))
            sys.exit(1)
        print(f'Alle {len(ergebnis)} Seiten sind aktuell.')
    else:
        print(f'{len(veraltet)} von {len(ergebnis)} Seiten neu geschrieben' + (': ' + ', '.join(veraltet) if veraltet else '.'))


if __name__ == '__main__':
    main()
