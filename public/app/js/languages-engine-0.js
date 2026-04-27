/* ════════════════════════════════════════════════════════════
   LANGUAGE LEARNING ENGINE
   Modes: Overview · Learn · Flashcards · Quiz · Listen
   Features: TTS audio, progress tracking, streaks, XP, locale per lang
   ════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // BCP-47 voice locale + speech rate per language
  var LANG_VOICE = {
    yoruba:   { locale:'yo-NG', fallback:'en-NG', rate:0.85 },
    igbo:     { locale:'ig-NG', fallback:'en-NG', rate:0.85 },
    hausa:    { locale:'ha-NG', fallback:'en-NG', rate:0.85 },
    pidgin:   { locale:'en-NG', fallback:'en-GB', rate:0.95 },
    french:   { locale:'fr-FR', fallback:'fr',    rate:0.9  },
    spanish:  { locale:'es-ES', fallback:'es',    rate:0.9  },
    arabic:   { locale:'ar-SA', fallback:'ar',    rate:0.85 },
    mandarin: { locale:'zh-CN', fallback:'zh',    rate:0.85 },
    swahili:  { locale:'sw-KE', fallback:'sw',    rate:0.9  },
    german:   { locale:'de-DE', fallback:'de',    rate:0.9  },
    efik:     { locale:'en-NG', fallback:'en-GB', rate:0.85 },
    ijaw:     { locale:'en-NG', fallback:'en-GB', rate:0.85 },
    tiv:      { locale:'en-NG', fallback:'en-GB', rate:0.85 },
    portuguese:{ locale:'pt-PT', fallback:'pt',   rate:0.9  },
    japanese: { locale:'ja-JP', fallback:'ja',    rate:0.85 },
    dutch:    { locale:'nl-NL', fallback:'nl',    rate:0.9  }
  };

  function pickVoice(key){
    if (!('speechSynthesis' in window)) return null;
    var cfg = LANG_VOICE[key] || {};
    var voices = window.speechSynthesis.getVoices() || [];
    var byExact = voices.find(function(v){ return v.lang === cfg.locale; });
    if (byExact) return byExact;
    var byPrefix = voices.find(function(v){ return cfg.locale && v.lang.toLowerCase().indexOf(cfg.locale.split('-')[0])===0; });
    if (byPrefix) return byPrefix;
    var byFallback = voices.find(function(v){ return cfg.fallback && v.lang.toLowerCase().indexOf(cfg.fallback.toLowerCase())===0; });
    return byFallback || voices[0] || null;
  }

  function speak(text, key){
    if (!('speechSynthesis' in window)) { toast('🔇 Audio not supported on this browser'); return; }
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      var v = pickVoice(key);
      if (v) u.voice = v;
      var cfg = LANG_VOICE[key] || {};
      u.lang = (v && v.lang) || cfg.locale || 'en-US';
      u.rate = cfg.rate || 0.9;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch(e){ console.warn('TTS error', e); }
  }

  // Warm voices (some browsers load them async)
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function(){ window.speechSynthesis.getVoices(); };
  }

  // ═════ Progress storage ═════
  var PKEY = 'lt_lang_progress_v1';
  function getProg(){ try { return JSON.parse(localStorage.getItem(PKEY)||'{}'); } catch(e){ return {}; } }
  function setProg(p){ try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch(e){} }
  function bumpXP(key, amt){
    var p = getProg(); p[key] = p[key] || { xp:0, learned:[], quizBest:0, lastDay:null, streak:0 };
    p[key].xp += amt;
    var today = new Date().toISOString().slice(0,10);
    if (p[key].lastDay !== today){
      var yest = new Date(Date.now()-86400000).toISOString().slice(0,10);
      p[key].streak = (p[key].lastDay === yest) ? (p[key].streak+1) : 1;
      p[key].lastDay = today;
    }
    setProg(p);
    return p[key];
  }
  function markLearned(key, idx){
    var p = getProg(); p[key] = p[key] || { xp:0, learned:[], quizBest:0, lastDay:null, streak:0 };
    if (!Array.isArray(p[key].learned)) p[key].learned = [];
    if (p[key].learned.indexOf(idx) < 0){
      p[key].learned.push(idx);
      p[key].xp = (p[key].xp || 0) + 5;
      var today = new Date().toISOString().slice(0,10);
      if (p[key].lastDay !== today){
        var yest = new Date(Date.now()-86400000).toISOString().slice(0,10);
        p[key].streak = (p[key].lastDay === yest) ? ((p[key].streak||0)+1) : 1;
        p[key].lastDay = today;
      }
    }
    setProg(p);
    return p[key];
  }
  function setQuizBest(key, score){
    var p = getProg(); p[key] = p[key] || { xp:0, learned:[], quizBest:0, lastDay:null, streak:0 };
    if (score > p[key].quizBest) p[key].quizBest = score;
    setProg(p);
    return p[key];
  }

  // ═════ Toast ═════
  function toast(msg){
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fbbf24;border:1px solid rgba(251,191,36,.4);padding:10px 18px;border-radius:100px;font-weight:700;font-size:.85rem;z-index:9999;box-shadow:0 12px 30px rgba(0,0,0,.5);animation:lefade .3s ease';
    t.textContent = msg; document.body.appendChild(t);
    setTimeout(function(){ t.style.opacity='0'; t.style.transition='opacity .35s'; setTimeout(function(){ t.remove(); }, 400); }, 1800);
  }

  // ═════ State ═════
  var state = { key:null, mode:'overview', items:[], qIdx:0, qScore:0, qOrder:[], qOpts:[], fIdx:0, fFlipped:false };

  function allItems(d){
    var arr = [];
    (d.greetings||[]).forEach(function(g){ arr.push({ src:g.yor, en:g.en, note:g.note||'', cat:'Greeting' }); });
    (d.phrases||[]).forEach(function(p){ arr.push({ src:p.yor, en:p.en, note:p.note||'', cat:'Phrase' }); });
    return arr;
  }

  // ═════ Render shell ═════
  function render(){
    var d = window.LT_LANGUAGES[state.key]; if (!d) return;
    var c = document.getElementById('langContent');
    if (!c) return;
    c.style.display = 'block';
    state.items = allItems(d);
    var prog = (getProg()[state.key]) || { xp:0, learned:[], quizBest:0, streak:0 };
    if (!Array.isArray(prog.learned)) prog.learned = [];
    var pct = Math.round((prog.learned.length / Math.max(state.items.length,1))*100);

    c.innerHTML = ''
      + '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:28px;backdrop-filter:blur(10px);">'
      + '  <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px;flex-wrap:wrap;">'
      + '    <span style="font-size:2rem;">'+d.flag+'</span>'
      + '    <div style="flex:1;min-width:180px;">'
      + '      <h2 style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:1.7rem;font-weight:900;margin:0;color:#fff;">'+d.name+'</h2>'
      + '      <div style="color:rgba(255,255,255,.55);font-size:.8rem;">Beginner module · '+state.items.length+' items</div>'
      + '    </div>'
      + '    <div style="display:flex;gap:14px;align-items:center;">'
      + '      <div style="text-align:center;"><div style="font-size:1.1rem;font-weight:900;color:#fbbf24;">'+prog.xp+'</div><div style="font-size:.65rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.08em;">XP</div></div>'
      + '      <div style="text-align:center;"><div style="font-size:1.1rem;font-weight:900;color:#f97316;">🔥 '+(prog.streak||0)+'</div><div style="font-size:.65rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.08em;">Streak</div></div>'
      + '      <div style="text-align:center;"><div style="font-size:1.1rem;font-weight:900;color:#10b981;">'+(prog.quizBest||0)+'%</div><div style="font-size:.65rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.08em;">Best</div></div>'
      + '    </div>'
      + '  </div>'
      + '  <div style="height:6px;background:rgba(255,255,255,.08);border-radius:100px;overflow:hidden;margin:14px 0 18px;">'
      + '    <div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,'+d.color+',#fbbf24);transition:width .4s;"></div>'
      + '  </div>'
      + '  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px;">'
      + tab('overview','📖 Overview') + tab('learn','🎓 Learn') + tab('flash','🃏 Flashcards') + tab('quiz','✅ Quiz') + tab('listen','🔊 Listen & Repeat')
      + '  </div>'
      + '  <div id="lng-body"></div>'
      + '  <div style="margin-top:22px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">'
      + '    <button onclick="window.langClose()" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;padding:9px 20px;border-radius:100px;font-weight:700;font-size:.82rem;cursor:pointer;">← Pick another language</button>'
      + '    <div style="font-size:.72rem;color:rgba(255,255,255,.45);">Audio uses your device voices · best on Chrome / Edge</div>'
      + '  </div>'
      + '</div>';

    renderBody();
  }

  function tab(mode, label){
    var on = state.mode===mode;
    var bg = on ? 'background:#fbbf24;color:#0a1628;' : 'background:rgba(255,255,255,.06);color:#fff;';
    return '<button onclick="window.langMode(\''+mode+'\')" style="'+bg+'border:1px solid rgba(255,255,255,.12);padding:9px 16px;border-radius:100px;font-weight:800;font-size:.78rem;cursor:pointer;font-family:inherit;">'+label+'</button>';
  }

  function renderBody(){
    var d = window.LT_LANGUAGES[state.key]; if (!d) return;
    var b = document.getElementById('lng-body'); if (!b) return;
    if (state.mode==='overview') return renderOverview(b, d);
    if (state.mode==='learn')    return renderLearn(b, d);
    if (state.mode==='flash')    return renderFlash(b, d);
    if (state.mode==='quiz')     return renderQuiz(b, d);
    if (state.mode==='listen')   return renderListen(b, d);
  }

  // ═════ Overview ═════
  function renderOverview(b, d){
    b.innerHTML = ''
      + '<p style="color:rgba(255,255,255,.85);font-size:1rem;line-height:1.7;margin:0 0 18px;">'+d.intro+'</p>'
      + '<div style="background:linear-gradient(135deg,'+d.color+'22,'+d.color+'11);border:1px solid '+d.color+'55;border-radius:14px;padding:14px 18px;color:#fff;font-size:.88rem;line-height:1.55;margin-bottom:20px;">💡 '+d.tip+'</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;">'
      + step('🎓','Learn','See & hear each phrase, mark as learned for +5 XP')
      + step('🃏','Flashcards','Flip a card to reveal the meaning. Self-rated.')
      + step('✅','Quiz','Multiple choice. Beat your best score.')
      + step('🔊','Listen','Tap to hear native pronunciation, repeat aloud.')
      + '</div>'
      + '<div style="margin-top:22px;text-align:center;">'
      + '  <button onclick="window.langMode(\'learn\')" style="background:linear-gradient(135deg,'+d.color+',#fbbf24);color:#0a1628;border:none;padding:12px 28px;border-radius:100px;font-weight:900;font-size:.9rem;cursor:pointer;font-family:inherit;box-shadow:0 8px 24px rgba(0,0,0,.3);">Start lesson →</button>'
      + '</div>';
  }
  function step(ic,t,desc){
    return '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;"><div style="font-size:1.4rem;margin-bottom:6px;">'+ic+'</div><div style="font-weight:800;color:#fff;font-size:.9rem;margin-bottom:4px;">'+t+'</div><div style="color:rgba(255,255,255,.6);font-size:.78rem;line-height:1.45;">'+desc+'</div></div>';
  }

  // ═════ Learn (full list w/ audio + mark learned) ═════
  function renderLearn(b, d){
    var prog = (getProg()[state.key]) || { learned:[] };
    if (!Array.isArray(prog.learned)) prog.learned = [];
    var html = '<div style="display:grid;gap:10px;">';
    state.items.forEach(function(it, i){
      var done = prog.learned.indexOf(i) >= 0;
      html += '<div style="background:rgba(255,255,255,.04);border:1px solid '+(done?'#10b98155':'rgba(255,255,255,.08)')+';border-left:3px solid '+(done?'#10b981':d.color)+';padding:14px 16px;border-radius:0 12px 12px 0;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">'
        + '  <div style="flex:1;min-width:200px;">'
        + '    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;"><span style="font-weight:800;color:#fff;font-size:1rem;">'+escapeHTML(it.src)+'</span><span style="font-size:.62rem;background:'+d.color+'33;color:#fff;padding:2px 8px;border-radius:100px;text-transform:uppercase;letter-spacing:.06em;font-weight:700;">'+it.cat+'</span></div>'
        + '    <div style="color:rgba(255,255,255,.7);font-size:.86rem;">'+escapeHTML(it.en)+'</div>'
        + (it.note ? '    <div style="color:rgba(255,255,255,.45);font-size:.72rem;font-style:italic;margin-top:4px;">'+escapeHTML(it.note)+'</div>' : '')
        + '  </div>'
        + '  <button onclick="window.langSpeak('+i+')" title="Play audio" style="background:rgba(59,130,246,.2);border:1px solid rgba(59,130,246,.4);color:#93c5fd;width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">🔊</button>'
        + '  <button onclick="window.langLearned('+i+')" title="Mark learned" style="background:'+(done?'#10b981':'rgba(16,185,129,.15)')+';border:1px solid '+(done?'#10b981':'rgba(16,185,129,.4)')+';color:'+(done?'#fff':'#86efac')+';padding:8px 14px;border-radius:100px;font-weight:800;font-size:.75rem;cursor:pointer;font-family:inherit;">'+(done?'✓ Learned':'+ Learn')+'</button>'
        + '</div>';
    });
    html += '</div>';
    b.innerHTML = html;
  }

  // ═════ Flashcards ═════
  function renderFlash(b, d){
    if (state.fIdx >= state.items.length) state.fIdx = 0;
    var it = state.items[state.fIdx];
    if (!it){ b.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,.6);">No items.</p>'; return; }
    b.innerHTML = ''
      + '<div style="text-align:center;color:rgba(255,255,255,.55);font-size:.78rem;margin-bottom:12px;">Card '+(state.fIdx+1)+' / '+state.items.length+'</div>'
      + '<div onclick="window.langFlip()" style="background:linear-gradient(135deg,'+d.color+'33,rgba(255,255,255,.04));border:1px solid '+d.color+'55;border-radius:20px;padding:48px 24px;text-align:center;cursor:pointer;min-height:180px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;transition:transform .3s;">'
      + (state.fFlipped
          ? '<div style="font-size:.7rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;font-weight:700;">English</div><div style="font-size:1.6rem;font-weight:800;color:#fff;line-height:1.3;">'+escapeHTML(it.en)+'</div>'+(it.note?'<div style="font-size:.78rem;color:rgba(255,255,255,.55);font-style:italic;max-width:380px;">'+escapeHTML(it.note)+'</div>':'')
          : '<div style="font-size:.7rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;font-weight:700;">'+d.name+'</div><div style="font-size:1.7rem;font-weight:800;color:#fff;line-height:1.3;">'+escapeHTML(it.src)+'</div><div style="font-size:.78rem;color:rgba(255,255,255,.4);">Tap card to reveal</div>')
      + '</div>'
      + '<div style="display:flex;justify-content:center;gap:10px;margin-top:18px;flex-wrap:wrap;">'
      + '  <button onclick="window.langFPrev()" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;padding:10px 18px;border-radius:100px;font-weight:700;cursor:pointer;font-family:inherit;font-size:.82rem;">← Prev</button>'
      + '  <button onclick="window.langSpeak('+state.fIdx+')" style="background:rgba(59,130,246,.2);border:1px solid rgba(59,130,246,.4);color:#93c5fd;padding:10px 18px;border-radius:100px;font-weight:700;cursor:pointer;font-family:inherit;font-size:.82rem;">🔊 Hear</button>'
      + '  <button onclick="window.langFKnown()" style="background:linear-gradient(135deg,#10b981,#059669);border:none;color:#fff;padding:10px 18px;border-radius:100px;font-weight:800;cursor:pointer;font-family:inherit;font-size:.82rem;">✓ I know this (+5 XP)</button>'
      + '  <button onclick="window.langFNext()" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;padding:10px 18px;border-radius:100px;font-weight:700;cursor:pointer;font-family:inherit;font-size:.82rem;">Next →</button>'
      + '</div>';
  }

  // ═════ Quiz ═════
  function startQuiz(){
    state.qIdx = 0; state.qScore = 0;
    state.qOrder = state.items.map(function(_,i){return i;}).sort(function(){return Math.random()-.5;}).slice(0, Math.min(8, state.items.length));
    nextQuiz();
  }
  function nextQuiz(){
    if (state.qIdx >= state.qOrder.length){ return finishQuiz(); }
    var idx = state.qOrder[state.qIdx];
    var correct = state.items[idx];
    var pool = state.items.filter(function(x){ return x.en !== correct.en; });
    var distractors = pool.sort(function(){return Math.random()-.5;}).slice(0,3);
    state.qOpts = [correct].concat(distractors).sort(function(){return Math.random()-.5;});
    state._qCorrect = correct;
    renderBody();
  }
  function renderQuiz(b, d){
    if (!state.qOrder.length){
      b.innerHTML = '<div style="text-align:center;padding:30px;"><div style="font-size:2.4rem;margin-bottom:12px;">✅</div><h3 style="color:#fff;margin:0 0 10px;">Ready for the quiz?</h3><p style="color:rgba(255,255,255,.65);max-width:420px;margin:0 auto 20px;">8 random questions. Pick the correct English meaning. Beat your best score!</p><button onclick="window.langQStart()" style="background:linear-gradient(135deg,'+d.color+',#fbbf24);color:#0a1628;border:none;padding:12px 28px;border-radius:100px;font-weight:900;cursor:pointer;font-family:inherit;font-size:.9rem;">Start quiz →</button></div>';
      return;
    }
    var idx = state.qOrder[state.qIdx];
    var it = state.items[idx];
    var pct = Math.round(((state.qIdx)/state.qOrder.length)*100);
    var html = ''
      + '<div style="display:flex;justify-content:space-between;color:rgba(255,255,255,.6);font-size:.78rem;margin-bottom:8px;"><span>Q '+(state.qIdx+1)+' / '+state.qOrder.length+'</span><span>Score: '+state.qScore+'</span></div>'
      + '<div style="height:5px;background:rgba(255,255,255,.08);border-radius:100px;overflow:hidden;margin-bottom:18px;"><div style="height:100%;width:'+pct+'%;background:'+d.color+';"></div></div>'
      + '<div style="background:rgba(255,255,255,.04);border-left:3px solid '+d.color+';padding:18px 20px;border-radius:0 12px 12px 0;margin-bottom:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">'
      + '  <div style="flex:1;min-width:200px;"><div style="font-size:.7rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">What does this mean?</div><div style="font-size:1.4rem;font-weight:800;color:#fff;">'+escapeHTML(it.src)+'</div></div>'
      + '  <button onclick="window.langSpeak('+idx+')" style="background:rgba(59,130,246,.2);border:1px solid rgba(59,130,246,.4);color:#93c5fd;width:42px;height:42px;border-radius:50%;cursor:pointer;font-size:1.1rem;">🔊</button>'
      + '</div>'
      + '<div style="display:grid;gap:8px;">';
    state.qOpts.forEach(function(o,i){
      html += '<button onclick="window.langQAns('+i+',this)" style="text-align:left;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;padding:14px 16px;border-radius:12px;cursor:pointer;font-family:inherit;font-size:.92rem;font-weight:600;transition:all .15s;" onmouseover="this.style.background=\'rgba(255,255,255,.1)\'" onmouseout="this.style.background=\'rgba(255,255,255,.05)\'">'+escapeHTML(o.en)+'</button>';
    });
    html += '</div>';
    b.innerHTML = html;
  }
  function answerQuiz(i, btn){
    var chosen = state.qOpts[i];
    var ok = chosen.en === state._qCorrect.en;
    var btns = btn.parentElement.querySelectorAll('button');
    btns.forEach(function(b,j){
      b.style.pointerEvents = 'none';
      if (state.qOpts[j].en === state._qCorrect.en){ b.style.background='rgba(16,185,129,.25)'; b.style.borderColor='#10b981'; }
      else if (j===i){ b.style.background='rgba(239,68,68,.2)'; b.style.borderColor='#ef4444'; }
    });
    if (ok){ state.qScore++; bumpXP(state.key, 10); }
    setTimeout(function(){ state.qIdx++; nextQuiz(); }, 900);
  }
  function finishQuiz(){
    var pct = Math.round((state.qScore/state.qOrder.length)*100);
    setQuizBest(state.key, pct);
    var d = window.LT_LANGUAGES[state.key];
    var b = document.getElementById('lng-body');
    var msg = pct>=80?'Excellent! 🌟':pct>=60?'Good work — keep going! 💪':pct>=40?'Practice more in Flashcards 🃏':'Keep trying — you\'ll get it!';
    b.innerHTML = '<div style="text-align:center;padding:30px;"><div style="font-size:3rem;margin-bottom:10px;">'+(pct>=80?'🏆':pct>=60?'🎉':'📚')+'</div><h3 style="color:#fff;margin:0 0 4px;font-size:1.4rem;">Quiz complete</h3><div style="font-size:2.4rem;font-weight:900;color:'+d.color+';margin:6px 0;">'+pct+'%</div><div style="color:rgba(255,255,255,.65);margin-bottom:18px;">'+state.qScore+' / '+state.qOrder.length+' correct · +'+(state.qScore*10)+' XP · '+msg+'</div><button onclick="window.langQStart()" style="background:'+d.color+';border:none;color:#fff;padding:11px 22px;border-radius:100px;font-weight:800;cursor:pointer;font-family:inherit;margin-right:8px;">Try again</button><button onclick="window.langMode(\'learn\')" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;padding:11px 22px;border-radius:100px;font-weight:700;cursor:pointer;font-family:inherit;">Back to learn</button></div>';
    state.qOrder = []; // reset
  }

  // ═════ Listen & Repeat ═════
  function renderListen(b, d){
    var html = '<p style="color:rgba(255,255,255,.7);font-size:.88rem;margin:0 0 16px;">Tap any card to hear it. Repeat aloud after the audio. Use slower speed for tonal languages.</p>'
      + '<div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap;">'
      + '  <span style="color:rgba(255,255,255,.5);font-size:.78rem;">Speed:</span>'
      + '  <button onclick="window.langRate(0.7)" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#fff;padding:6px 12px;border-radius:100px;font-weight:700;font-size:.72rem;cursor:pointer;font-family:inherit;">🐢 Slow</button>'
      + '  <button onclick="window.langRate(0.9)" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#fff;padding:6px 12px;border-radius:100px;font-weight:700;font-size:.72rem;cursor:pointer;font-family:inherit;">Normal</button>'
      + '  <button onclick="window.langRate(1.1)" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#fff;padding:6px 12px;border-radius:100px;font-weight:700;font-size:.72rem;cursor:pointer;font-family:inherit;">⚡ Fast</button>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">';
    state.items.forEach(function(it,i){
      html += '<button onclick="window.langSpeak('+i+')" style="text-align:left;background:linear-gradient(135deg,'+d.color+'22,rgba(255,255,255,.03));border:1px solid '+d.color+'44;color:#fff;padding:14px 16px;border-radius:14px;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;gap:4px;transition:transform .15s;" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'\'"><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:1rem;">🔊</span><span style="font-weight:800;font-size:.98rem;">'+escapeHTML(it.src)+'</span></div><div style="color:rgba(255,255,255,.6);font-size:.78rem;">'+escapeHTML(it.en)+'</div></button>';
    });
    html += '</div>';
    b.innerHTML = html;
  }

  function escapeHTML(s){ return String(s||'').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }

  // ═════ Public API ═════
  window.langOpen = function(key){
    state.key = key; state.mode = 'overview'; state.qOrder=[]; state.qIdx=0; state.qScore=0; state.fIdx=0; state.fFlipped=false;
    render();
    var c = document.getElementById('langContent');
    if (c) window.scrollTo({ top: c.getBoundingClientRect().top + window.scrollY - 30, behavior:'smooth' });
  };
  window.langClose = function(){
    var c = document.getElementById('langContent'); if (c){ c.style.display='none'; c.innerHTML=''; }
    window.scrollTo({ top:0, behavior:'smooth' });
  };
  window.langMode = function(m){ state.mode = m; if (m==='quiz' && !state.qOrder.length) {/* show start screen */} render(); };
  window.langSpeak = function(i){ var it = state.items[i]; if (it) speak(it.src, state.key); };
  window.langLearned = function(i){ markLearned(state.key, i); render(); };
  window.langFlip = function(){ state.fFlipped = !state.fFlipped; renderBody(); };
  window.langFNext = function(){ state.fIdx = (state.fIdx+1) % state.items.length; state.fFlipped=false; renderBody(); };
  window.langFPrev = function(){ state.fIdx = (state.fIdx-1+state.items.length) % state.items.length; state.fFlipped=false; renderBody(); };
  window.langFKnown = function(){ markLearned(state.key, state.fIdx); window.langFNext(); render(); };
  window.langQStart = function(){ startQuiz(); };
  window.langQAns = function(i, btn){ answerQuiz(i, btn); };
  window.langRate = function(r){
    var cfg = LANG_VOICE[state.key]; if (cfg) cfg.rate = r;
    toast('Speed: '+(r<0.8?'slow':r>1?'fast':'normal'));
  };
})();
