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
    _vorlage/begriffe.json    Fachbegriffe in mehreren Sprachen; im Inhalt [[schluessel]],
                              in SVG [[svg:schluessel]], in Lernkarten-Texten ebenfalls [[schluessel]]
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
BEGRIFF = re.compile(r'\[\[(svg:)?([a-z0-9.]+)\]\]')
SPRACHMENUE = """      <div class="sprachwahl">
        <button class="btn" id="sprachBtn" type="button" aria-expanded="false" aria-controls="sprachMenue" title="Sprachen der Fachbegriffe">Sprachen ▾</button>
        <div class="sprach-menue hidden" id="sprachMenue">
          <div class="sprach-titel">Fachbegriffe anzeigen in</div>
          <div id="sprachListe"></div>
          <div class="sprach-hinweis">Erklärtexte bleiben deutsch.</div>
        </div>
      </div>"""


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


def begriffe_einsetzen(text, wb, name):
    """[[schluessel]] -> <span>, [[svg:schluessel]] -> <tspan>; vorbefüllt mit den Standardsprachen."""
    def ersetzen(m):
        svg, key = m.group(1), m.group(2)
        if key not in wb['begriffe']:
            raise SystemExit(f'{name}: Begriff [[{key}]] fehlt in begriffe.json')
        werte = []
        for sp in wb['standard']:
            w = wb['begriffe'][key].get(sp)
            if w and w not in werte:
                werte.append(w)
        tag = 'tspan' if svg else 'span'
        return f'<{tag} class="begriff" data-begriff="{key}">{html.escape(" / ".join(werte))}</{tag}>'
    return BEGRIFF.sub(ersetzen, text)


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
    wb = json.loads(lesen(VORLAGE / 'begriffe.json'))
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
        # Fachbegriffe: genutzte Schlüssel einsammeln und nur diese einbetten
        vokabeln = meta.get('vokabeln', [])
        genutzt = sorted({m.group(2) for m in BEGRIFF.finditer(b.get('inhalt', '') + b.get('skript', ''))} | set(vokabeln))
        for key in genutzt:
            if key not in wb['begriffe']:
                raise SystemExit(f'{quelle.name}: Begriff [[{key}]] fehlt in begriffe.json')
        skript = b.get('skript', '')
        if genutzt:
            einbett = {'sprachen': wb['sprachen'], 'standard': wb['standard'], 'vokabeln': vokabeln,
                       'begriffe': {k: wb['begriffe'][k] for k in genutzt}}
            skript = ('/* Fachbegriffe aus _vorlage/begriffe.json */\nwindow.LH_BEGRIFFE = '
                      + json.dumps(einbett, ensure_ascii=False, separators=(',', ':')) + ';\n' + skript)
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
            'SPRACHEN': SPRACHMENUE if genutzt else '',
            'INHALT': begriffe_einsetzen(b.get('inhalt', ''), wb, quelle.name),
            'SKRIPT': skript,
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
