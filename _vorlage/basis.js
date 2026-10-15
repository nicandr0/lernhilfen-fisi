/* ==========================================================================
   Lernhilfen FiSi – gemeinsames Verhalten aller Seiten
   Wird von bauen.py NACH dem Seitenskript eingebettet. Eine Seite kann vorher
   window.LH setzen:
     LH.rechte       true = Kapitelleiste im Stil "ls -la" mit Rechten und Anzahl
     LH.filter       function(card) -> true/false, zusätzlicher Filter zur Suche
     LH.lernen       { art:'karten', karten:[...] | function, runde:Zahl,
                       einheit:'Karten', hintenMono:bool, zusatzPrompt:bool }
                     { art:'quiz', fragen:[{cat,q,opts,correct}] }
     Karte:          { tag, vorne, hinten, zusatz }
   ========================================================================== */
(function(){
  'use strict';
  var LH = window.LH = window.LH || {};
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- Lernhilfen-Leiste: auf dem Handy zur aktuellen Seite scrollen ---- */
  var lhNav = $('.lh-nav'), lhCur = lhNav && $('[aria-current]', lhNav);
  if(lhCur && lhNav.scrollWidth > lhNav.clientWidth) lhNav.scrollLeft = Math.max(0, lhCur.offsetLeft - 60);

  /* ---- Kapitelleiste aus den Kapiteln erzeugen ---- */
  var PERMS = ['drwxr-xr-x','drwxrwxr-x','drwxr-x---'];
  var sidebar = $('#sidebar');
  var sections = $$('.category-section');
  var links = [];
  sections.forEach(function(sec, i){
    if(!sec.id) sec.id = 'k' + (i + 1);
    var name = sec.dataset.nav || ($('h2', sec) ? $('h2', sec).textContent : sec.id);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'cat-link';
    b.dataset.target = sec.id;
    var cnt = sec.dataset.count || $$('.card', sec).length;
    b.innerHTML = (LH.rechte ? '<span class="perm">' + PERMS[i % PERMS.length] + '</span>' : '') +
      '<span class="name"></span>' + (LH.rechte ? '<span class="cnt">' + cnt + '</span>' : '');
    $('.name', b).textContent = name;
    b.addEventListener('click', function(){ sec.scrollIntoView({behavior:'smooth', block:'start'}); });
    if(sidebar) sidebar.appendChild(b);
    links.push(b);
  });

  function followActive(link){
    var nav = link && link.parentElement;
    if(!nav || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({left: Math.max(0, link.offsetLeft - 12), behavior:'smooth'});
  }
  function setActive(id){
    var hit = null;
    links.forEach(function(l){ var on = l.dataset.target === id; l.classList.toggle('active', on); if(on) hit = l; });
    followActive(hit);
  }
  // aktives Kapitel: das letzte, dessen Anfang im oberen Drittel liegt; ganz unten immer das letzte
  var aktiv = null, geplant = false;
  function aktualisieren(){
    geplant = false;
    var sichtbar = sections.filter(function(s){ return !s.classList.contains('hidden'); });
    if(!sichtbar.length) return;
    var grenze = window.innerHeight * 0.3, act = sichtbar[0];
    sichtbar.forEach(function(s){ if(s.getBoundingClientRect().top <= grenze) act = s; });
    if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) act = sichtbar[sichtbar.length - 1];
    if(act.id !== aktiv){ aktiv = act.id; setActive(act.id); }
  }
  window.addEventListener('scroll', function(){ if(!geplant){ geplant = true; requestAnimationFrame(aktualisieren); } }, {passive:true});
  window.addEventListener('resize', aktualisieren);
  aktualisieren();

  /* ---- Kennzahlen im Kopfbereich ---- */
  function lernPool(){
    var l = LH.lernen; if(!l) return [];
    var p = l.art === 'quiz' ? l.fragen : l.karten;
    return (typeof p === 'function' ? p() : p) || [];
  }
  $$('[data-stat="kapitel"]').forEach(function(el){ el.textContent = sections.length; });
  $$('[data-stat="lernen"]').forEach(function(el){ el.textContent = lernPool().length; });

  /* ---- Selbsteinschätzung (nur im eigenen Browser gespeichert) ---- */
  $$('.einschaetzung').forEach(function(box){
    var key = box.dataset.schluessel || ('lh-einschaetzung-' + location.pathname);
    var themen = [];
    try { themen = JSON.parse(box.dataset.themen || '[]'); } catch(e) {}
    var labels = {sicher:'sicher', unsicher:'unsicher', wiederholen:'bitte wiederholen'};
    var state = {};
    try { state = JSON.parse(localStorage.getItem(key)) || {}; } catch(e) { state = {}; }
    function save(){ try { localStorage.setItem(key, JSON.stringify(state)); } catch(e) {} }
    var html = '<p class="card-note">Zum Markieren anklicken. Die Auswahl wird nur in deinem Browser gespeichert und dient deiner eigenen Übersicht beim Lernen.</p>' +
      '<div class="tbl-wrap"><table class="tbl"><tr><th>Thema</th><th>Einschätzung</th></tr>';
    themen.forEach(function(t, i){
      html += '<tr><td></td><td><div class="sc-actions">' + Object.keys(labels).map(function(k){
        return '<button type="button" class="sc-btn ' + k + (state[i] === k ? ' active' : '') + '" data-row="' + i + '" data-state="' + k + '">' + labels[k] + '</button>';
      }).join('') + '</div></td></tr>';
    });
    html += '</table></div><div style="margin-top:10px;"><button type="button" class="sc-btn sc-reset">Auswahl zurücksetzen</button></div>';
    box.innerHTML = html;
    $$('td:first-child', box).forEach(function(td, i){ td.textContent = themen[i]; });
    box.addEventListener('click', function(e){
      var b = e.target.closest('.sc-btn'); if(!b) return;
      if(b.classList.contains('sc-reset')){ state = {}; save(); $$('.sc-btn.active', box).forEach(function(x){ x.classList.remove('active'); }); return; }
      var row = b.dataset.row, was = b.classList.contains('active');
      $$('.sc-btn[data-row="' + row + '"]', box).forEach(function(x){ x.classList.remove('active'); });
      if(was){ delete state[row]; } else { b.classList.add('active'); state[row] = b.dataset.state; }
      save();
    });
  });

  /* ---- Suche ---- */
  var searchInput = $('#searchInput');
  var noResults = $('#noResults');
  var statVisible = $('#statVisible'), statVisibleNum = $('#statVisibleNum');
  function text(el){ return ((el.dataset.search || '') + ' ' + el.textContent).toLowerCase(); }
  function runSearch(){
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var f = typeof LH.filter === 'function' ? LH.filter : null;
    var all = !q && !f;
    var visible = 0;
    sections.forEach(function(sec){
      var secHit = false;
      $$('.card', sec).forEach(function(card){
        var hit;
        var rows = $$('table.zeilen tr', card).filter(function(r){ return !$('th', r); });
        if(all){
          hit = true; rows.forEach(function(r){ r.classList.remove('hidden'); });
        } else if(rows.length && q){
          var rowHits = 0;
          rows.forEach(function(r){ var m = text(r).indexOf(q) > -1; r.classList.toggle('hidden', !m); if(m) rowHits++; });
          hit = rowHits > 0;
          if(!hit && (card.dataset.search || '').toLowerCase().indexOf(q) > -1){ hit = true; rows.forEach(function(r){ r.classList.remove('hidden'); }); }
        } else {
          rows.forEach(function(r){ r.classList.remove('hidden'); });
          hit = !q || text(card).indexOf(q) > -1;
        }
        if(hit && f) hit = f(card);
        card.classList.toggle('hidden', !hit);
        if(hit){ secHit = true; visible++; }
      });
      $$('.group', sec).forEach(function(g){ g.classList.toggle('hidden', !all && !$$('.card', g).some(function(c){ return !c.classList.contains('hidden'); })); });
      $$('.schaubild', sec).forEach(function(s){
        var m = all || (!f && q && text(s).indexOf(q) > -1);
        s.classList.toggle('hidden', !m);
        if(m) secHit = true;
      });
      sec.classList.toggle('hidden', !all && !secHit);
    });
    if(noResults) noResults.style.display = (!all && visible === 0) ? 'block' : 'none';
    if(statVisible){ statVisible.classList.toggle('hidden', all); if(statVisibleNum) statVisibleNum.textContent = visible; }
    aktualisieren();
  }
  LH.runSearch = runSearch;
  if(searchInput){
    searchInput.addEventListener('input', runSearch);
    searchInput.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ searchInput.value = ''; runSearch(); searchInput.blur(); } });
  }

  /* ---- Lernmodus ---- */
  var lm = $('#lernmodus'), lernBtn = $('#lernBtn');
  if(!LH.lernen || !lm){ if(lernBtn) lernBtn.classList.add('hidden'); }
  else {
    var isQuiz = LH.lernen.art === 'quiz';
    var actBox = $(isQuiz ? '#lmQuiz' : '#lmKarten'), doneBox = $('#lmDone');
    $(isQuiz ? '#lmKarten' : '#lmQuiz').classList.add('hidden');
    var deck = [], total = 0, good = 0, cur = null, revealed = false, checked = false;
    function shuffle(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function progress(n){ $('.lm-progress', actBox).textContent = (isQuiz ? 'Frage ' : 'Karte ') + n + ' / ' + total; $('.lm-bar-fill', actBox).style.width = ((n - 1) / total * 100) + '%'; }
    function finish(){
      actBox.classList.add('hidden'); doneBox.classList.remove('hidden');
      $('#lmDoneText').textContent = isQuiz
        ? 'Du hast ' + good + ' von ' + total + ' Fragen richtig beantwortet.'
        : 'Du hast ' + good + ' von ' + total + ' ' + (LH.lernen.einheit || 'Karten') + ' direkt gewusst.';
    }
    function start(){
      var pool = lernPool();
      deck = shuffle(pool);
      if(!isQuiz && LH.lernen.runde) deck = deck.slice(0, LH.lernen.runde);
      total = deck.length; good = 0;
      actBox.classList.remove('hidden'); doneBox.classList.add('hidden');
      next();
    }
    function next(){
      if(!deck.length){ finish(); return; }
      cur = deck.shift();
      progress(total - deck.length);
      if(isQuiz){
        checked = false;
        $('#lmQCat').textContent = cur.cat || '';
        $('#lmQuestion').textContent = cur.q;
        var opts = $('#lmOptions'); opts.innerHTML = '';
        cur.opts.forEach(function(o, i){
          var lab = document.createElement('label'); lab.className = 'lm-opt';
          lab.innerHTML = '<input type="checkbox" value="' + i + '"><span></span>';
          $('span', lab).textContent = o; opts.appendChild(lab);
        });
        $('#lmExplain').classList.remove('show'); $('#lmCheck').classList.remove('hidden'); $('#lmNext').classList.add('hidden');
      } else {
        revealed = false;
        $('#lmCat').textContent = cur.tag || '';
        $('#lmFront').textContent = cur.vorne;
        var rv = $('#lmReveal'); rv.textContent = cur.hinten; rv.classList.toggle('mono', !!LH.lernen.hintenMono);
        var ex = $('#lmExtra'); ex.classList.toggle('mono', !!LH.lernen.zusatzPrompt);
        ex.innerHTML = '';
        if(cur.zusatz){
          if(LH.lernen.zusatzPrompt){ var p = document.createElement('span'); p.style.color = 'var(--amber)'; p.textContent = '$ '; ex.appendChild(p); }
          ex.appendChild(document.createTextNode(cur.zusatz));
        }
        $('#lmBack').classList.add('hidden'); $('#lmFlipHint').classList.remove('hidden');
      }
    }
    function flip(){ if(isQuiz) return; revealed = !revealed; $('#lmBack').classList.toggle('hidden', !revealed); $('#lmFlipHint').classList.toggle('hidden', revealed); }
    function know(){ good++; next(); }
    function again(){ deck.push(cur); next(); }
    function check(){
      if(checked) return; checked = true;
      var boxes = $$('#lmOptions input');
      var sel = boxes.filter(function(b){ return b.checked; }).map(function(b){ return +b.value; });
      var ok = sel.length === cur.correct.length && cur.correct.every(function(v){ return sel.indexOf(v) > -1; });
      boxes.forEach(function(b, i){
        var o = b.closest('.lm-opt'); b.disabled = true;
        if(cur.correct.indexOf(i) > -1) o.classList.add('correct'); else if(sel.indexOf(i) > -1) o.classList.add('wrong');
      });
      if(ok) good++;
      var ex = $('#lmExplain');
      ex.textContent = ok ? 'Richtig! Alle passenden Antworten wurden korrekt ausgewählt.' : 'Nicht ganz - grün markiert die richtigen Antworten, rot deine falsch ausgewählten.';
      ex.classList.add('show'); $('#lmCheck').classList.add('hidden'); $('#lmNext').classList.remove('hidden');
    }
    function open(){ lm.classList.add('open'); start(); }
    function close(){ lm.classList.remove('open'); if(lernBtn) lernBtn.focus(); }
    if(lernBtn) lernBtn.addEventListener('click', open);
    $$('.lm-close', lm).forEach(function(b){ b.addEventListener('click', close); });
    lm.addEventListener('click', function(e){ if(e.target === lm) close(); });
    $('#lmRestart').addEventListener('click', start);
    var card = $('#lmCard');
    card.addEventListener('click', flip);
    card.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); flip(); } });
    $('#lmKnow').addEventListener('click', function(e){ e.stopPropagation(); know(); });
    $('#lmAgain').addEventListener('click', function(e){ e.stopPropagation(); again(); });
    $('#lmCheck').addEventListener('click', check);
    $('#lmNext').addEventListener('click', next);
    document.addEventListener('keydown', function(e){
      if(!lm.classList.contains('open')) return;
      if(e.key === 'Escape'){ close(); return; }
      if(isQuiz || doneBox.classList.contains('hidden') === false) return;
      if(e.key === ' '){ e.preventDefault(); flip(); }
      if(e.key === 'ArrowRight' && revealed) know();
      if(e.key === 'ArrowLeft' && revealed) again();
    });
  }

  /* ---- Taste "/" springt in die Suche ---- */
  document.addEventListener('keydown', function(e){
    if(lm && lm.classList.contains('open')) return;
    if(e.key === '/' && searchInput && document.activeElement !== searchInput && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)){
      e.preventDefault(); searchInput.focus();
    }
  });
})();
