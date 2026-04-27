/* ════════════════════════════════════════════════════════════════
   SPOTLIGHT / COACH MARKS — Focused highlight tour
   Reusable across Learning, Exams, Kids Zone, Music sections.
   Usage:
     window.LtSpot.run('learning'); // play tour
     window.LtSpot.tip('id-of-button', 'Click here to start'); // single tooltip
   Tours:
     learning · exams · kids · music · arena
   Each tour: array of { sel, title, body, side?, pad?, action? }
   "Don't show again" persists per-tour in localStorage.
   ════════════════════════════════════════════════════════════════ */
(function(){
  var KEY = function(t){ return 'lt_spot_done_' + t; };

  var TOURS = {
    learning: [
      { sel:'.sb-class-pick, [id*="classPicker"], .cl-side',
        title:'1. Pick your class & subject',
        body:'Open the side menu to choose your class (Primary, JSS, SS) and the subject you want to study.' },
      { sel:'#lessonContent, #lessonArea, .lesson-panel',
        title:'2. Read the AI lesson',
        body:'The lesson appears here — definitions, Nigerian examples and worked questions, written for you.' },
      { sel:'#chatInput, .chat-input, .ck-input, [placeholder*="Ask"]',
        title:'3. Ask the tutor anything',
        body:'Stuck? Type or speak your question. The AI tutor answers based on the exact lesson on screen.' },
      { sel:'#lessonNav, .les-nav',
        title:'4. Move through the topics',
        body:'Use these buttons to go to the next topic. Score the mini-quiz to mark a topic complete.' }
    ],
    exams: [
      { sel:'#examPickerArea, .xb-section, .ec-pick',
        title:'1. Pick your exam',
        body:'Choose WAEC, NECO or JAMB, then the subject and year you want to practice.' },
      { sel:'#examTimer',
        title:'2. Watch the timer',
        body:'Real-exam mode is timed like the real paper. Pace yourself — don\'t spend too long on one question.' },
      { sel:'#examContent',
        title:'3. Answer the questions',
        body:'Tap A, B, C or D. In Practice mode you see the explanation right after each answer.' },
      { sel:'#examScoreChip, [id*="examSubmit"], [onclick*="submitExam"]',
        title:'4. Submit & see your score',
        body:'When you\'re done, submit to see your score, weak topics and a study plan.' }
    ],
    kids: [
      { sel:'#kCatTabs',
        title:'1. Pick a category',
        body:'Tap Phonics, Animals, Numbers, Food and more. Swipe sideways to see all of them.' },
      { sel:'#kImg, .kz-picture',
        title:'2. Tap the picture to hear it',
        body:'Big pictures speak the word out loud. Tap again to hear it as many times as you like.' },
      { sel:'.kz-sb-game, [onclick*="kPlayMatch"], [onclick*="kPlayQuiz"]',
        title:'3. Play learning games',
        body:'Open the menu to play matching, quiz, chess and music games. Earn ⭐ stars as you learn.' },
      { sel:'[onclick*="kPlayInstrument"], [onclick*="kPlaySing"]',
        title:'4. Make music',
        body:'Try the instruments and the loop studio — drums, piano, bass and African percussion.' }
    ],
    music: [
      { sel:'#kInstrumentPicker, .ki-pick, [data-kinstrument]',
        title:'1. Pick an instrument',
        body:'Choose drums, piano, guitar, violin, bass, or African percussion (djembe, talking drum, shekere).' },
      { sel:'#kInstKeys, .ki-keys, .ki-stage',
        title:'2. Play with your keyboard',
        body:'Each pad shows the key on your keyboard. Use number/letter keys to play, or tap the pads.' },
      { sel:'#kLoopGrid, .kl-grid',
        title:'3. Build an Afrobeat loop',
        body:'Tap cells in the grid to add hits. Toggle 8 or 16 steps and add bars (up to 16) for longer loops.' },
      { sel:'[onclick*="kLoopExport"], .kl-export',
        title:'4. Save & export',
        body:'When you love your beat, export it as audio (.wav) to share with friends and family.' }
    ],
    arena: [
      { sel:'#arenaClassTabs',
        title:'1. Pick your class group',
        body:'Kids, Juniors (JSS), Seniors (SS) and WAEC/JAMB Prep all have their own rooms. You only see games made for you.' },
      { sel:'#arenaScopeTabs',
        title:'2. Choose Local, State or Nationwide',
        body:'Local = your school/area. State = your state of Nigeria. Nationwide = all of Nigeria. Bigger scope = bigger prize, harder players.' },
      { sel:'#arenaRoomList',
        title:'3. Join a live room',
        body:'Each room is a quick competition (3–10 minutes). Tap Join to enter and play head-to-head.' },
      { sel:'#arenaLeaderboard',
        title:'4. Climb the leaderboard',
        body:'Win games to earn ⭐ XP and rank up. Top players each weekend win gifts (data, airtime, books).' }
    ],
    theory: [
      { sel:'#theoryQText, .theory-question-col, #theoryQuestionContent',
        title:'1. Read the question carefully',
        body:'The exam question (and any sub-parts a, b, c…) appears here. Tap a part tab above the answer area to jump to it.' },
      { sel:'#theoryPartsTabs, .theory-parts-tabs',
        title:'2. Answer each part',
        body:'Each tab is a sub-question (a, b, c…). Tap a tab, write your answer in the booklet, then move to the next part.' },
      { sel:'#theoryToolbar, .theory-toolbar-v2',
        title:'3. Use the writing tools',
        body:'Bold, italic, lists, equations, symbols (π, √, ², θ), diagrams — everything you need for Maths, Physics, Chemistry and English answers.' },
      { sel:'#theoryToolkitBar, .theory-toolkit',
        title:'4. Subject-specific toolkit',
        body:'Maths gets a calculator + symbols. Chemistry gets the periodic table. Physics gets formulas. The toolkit changes to match your subject.' },
      { sel:'#essayTimer, .ttb-timer',
        title:'5. Watch your time',
        body:'The timer matches the real WAEC/NECO paper. The bar at the top warns you when 5 minutes are left.' },
      { sel:'#theoryNextBtn, .tf-skip-btn',
        title:'6. Submit when finished',
        body:'Use Next/Prev to move between questions. When you\'re done with all parts, submit to get AI marking and feedback.' }
    ]
  };

  function injectStyles(){
    if (document.getElementById('lt-spot-styles')) return;
    var s = document.createElement('style');
    s.id = 'lt-spot-styles';
    s.textContent = ''
      // Overlay no longer captures clicks — users can keep using the app
      + '.lt-spot-back{position:fixed;inset:0;z-index:99990;pointer-events:none;animation:ltSpotIn .2s ease}'
      // Much lighter dim, no blur, soft cutout
      + '.lt-spot-mask{position:absolute;inset:0;background:rgba(5,10,22,.42);-webkit-mask-image:radial-gradient(circle at var(--cx,50%) var(--cy,50%), transparent var(--r,90px), #000 calc(var(--r,90px) + 24px));mask-image:radial-gradient(circle at var(--cx,50%) var(--cy,50%), transparent var(--r,90px), #000 calc(var(--r,90px) + 24px));transition:all .3s cubic-bezier(.4,0,.2,1);pointer-events:none}'
      + '.lt-spot-ring{position:absolute;border:2px solid rgba(96,165,250,.9);border-radius:14px;box-shadow:0 0 0 3px rgba(59,130,246,.18),0 0 28px rgba(59,130,246,.4);pointer-events:none;transition:all .3s cubic-bezier(.4,0,.2,1);animation:ltSpotPulse 1.8s ease-in-out infinite}'
      // Compact card, draggable handle, pointer-events back on
      + '.lt-spot-card{position:absolute;max-width:280px;background:rgba(15,23,42,.97);color:#fff;border:1px solid rgba(96,165,250,.25);border-radius:14px;padding:10px 12px 10px;box-shadow:0 16px 40px rgba(0,0,0,.5);font-family:Inter,system-ui,sans-serif;transition:left .3s cubic-bezier(.4,0,.2,1),top .3s cubic-bezier(.4,0,.2,1);pointer-events:auto;backdrop-filter:blur(10px)}'
      + '.lt-spot-card.dragging{transition:none;cursor:grabbing}'
      + '.lt-spot-grip{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:-4px -4px 6px;padding:4px 6px;cursor:grab;border-radius:8px;color:rgba(255,255,255,.4);font-size:.7rem;font-weight:700}'
      + '.lt-spot-grip:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.7)}'
      + '.lt-spot-grip-x{background:none;border:none;color:rgba(255,255,255,.5);font-size:1rem;line-height:1;cursor:pointer;padding:2px 6px;border-radius:6px}'
      + '.lt-spot-grip-x:hover{background:rgba(255,255,255,.1);color:#fff}'
      + '.lt-spot-step{font-size:.62rem;text-transform:uppercase;letter-spacing:.08em;color:#60a5fa;font-weight:800;margin-bottom:2px}'
      + '.lt-spot-title{font-family:"Bricolage Grotesque",sans-serif;font-weight:900;font-size:.92rem;margin-bottom:4px;line-height:1.25}'
      + '.lt-spot-body{font-size:.76rem;color:rgba(255,255,255,.78);line-height:1.45;margin-bottom:9px}'
      + '.lt-spot-foot{display:flex;justify-content:space-between;align-items:center;gap:6px}'
      + '.lt-spot-skip{background:none;border:none;color:rgba(255,255,255,.45);font-size:.7rem;font-weight:600;cursor:pointer;padding:4px 6px;border-radius:6px}'
      + '.lt-spot-skip:hover{color:#fff}'
      + '.lt-spot-actions{display:flex;gap:6px;align-items:center}'
      + '.lt-spot-back-btn{background:rgba(255,255,255,.08);color:#fff;border:none;padding:6px 11px;border-radius:100px;font-weight:700;font-size:.72rem;cursor:pointer}'
      + '.lt-spot-back-btn:disabled{opacity:.35;cursor:not-allowed}'
      + '.lt-spot-next{background:#3b82f6;color:#fff;border:none;padding:6px 13px;border-radius:100px;font-weight:800;font-size:.74rem;cursor:pointer;font-family:"Bricolage Grotesque",sans-serif}'
      + '.lt-spot-next:hover{background:#2563eb}'
      + '.lt-spot-dont{display:flex;align-items:center;gap:6px;font-size:.66rem;color:rgba(255,255,255,.5);margin-top:6px;cursor:pointer;user-select:none}'
      + '.lt-spot-dont input{accent-color:#3b82f6;width:12px;height:12px}'
      + '@keyframes ltSpotIn{from{opacity:0}to{opacity:1}}'
      + '@keyframes ltSpotPulse{0%,100%{box-shadow:0 0 0 3px rgba(59,130,246,.18),0 0 28px rgba(59,130,246,.4)}50%{box-shadow:0 0 0 6px rgba(59,130,246,.12),0 0 40px rgba(59,130,246,.55)}}'
      + '@keyframes lt-spot-pop{from{opacity:0;transform:translateY(6px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}'
      + '@media (max-width:600px){.lt-spot-card{max-width:calc(100vw - 24px);font-size:.9em}}';
    document.head.appendChild(s);
  }

  function findEl(sel){
    if (!sel) return null;
    var parts = sel.split(',');
    for (var i=0;i<parts.length;i++){
      try {
        var el = document.querySelector(parts[i].trim());
        if (el && el.offsetParent !== null) return el;
      } catch(e){}
    }
    return null;
  }

  function close(tourId, remember){
    var ov = document.getElementById('lt-spot-overlay');
    if (ov) ov.remove();
    if (remember){ try { localStorage.setItem(KEY(tourId), '1'); } catch(e){} }
    document.removeEventListener('keydown', _kh);
    window.removeEventListener('resize', _rh);
    window.removeEventListener('scroll', _rh, true);
  }

  var _kh, _rh;

  function position(step, ringEl, cardEl, maskEl, keepCardPos){
    var el = findEl(step.sel);
    var vw = window.innerWidth, vh = window.innerHeight;
    if (!el){
      // Center the card, no ring
      ringEl.style.display = 'none';
      maskEl.style.setProperty('--cx','50%');
      maskEl.style.setProperty('--cy','50%');
      maskEl.style.setProperty('--r','0px');
      if (!keepCardPos){
        cardEl.style.left = Math.max(12, (vw - cardEl.offsetWidth)/2) + 'px';
        cardEl.style.top  = Math.max(12, (vh - cardEl.offsetHeight)/2) + 'px';
      }
      return;
    }
    // Scroll into view first
    try { el.scrollIntoView({ behavior:'smooth', block:'center', inline:'center' }); } catch(e){}
    setTimeout(function(){
      var r = el.getBoundingClientRect();
      var pad = step.pad || 10;
      ringEl.style.display = 'block';
      ringEl.style.left   = (r.left - pad) + 'px';
      ringEl.style.top    = (r.top  - pad) + 'px';
      ringEl.style.width  = (r.width  + pad*2) + 'px';
      ringEl.style.height = (r.height + pad*2) + 'px';
      var cx = r.left + r.width/2;
      var cy = r.top  + r.height/2;
      var radius = Math.max(r.width, r.height)/2 + pad + 8;
      maskEl.style.setProperty('--cx', cx + 'px');
      maskEl.style.setProperty('--cy', cy + 'px');
      maskEl.style.setProperty('--r',  radius + 'px');
      if (keepCardPos) return;
      // Card placement: try side (right/left) first to avoid covering the highlighted element,
      // then fall back to below/above.
      var cw = cardEl.offsetWidth || 280;
      var ch = cardEl.offsetHeight || 180;
      var gap = 16;
      var left, top;
      if (r.right + cw + gap < vw){ left = r.right + gap; top = Math.max(12, Math.min(vh - ch - 12, cy - ch/2)); }
      else if (r.left - cw - gap > 0){ left = r.left - cw - gap; top = Math.max(12, Math.min(vh - ch - 12, cy - ch/2)); }
      else if (r.bottom + ch + gap < vh){ left = Math.min(Math.max(12, cx - cw/2), vw - cw - 12); top = r.bottom + gap; }
      else if (r.top - ch - gap > 0){ left = Math.min(Math.max(12, cx - cw/2), vw - cw - 12); top = r.top - ch - gap; }
      else { left = vw - cw - 12; top = vh - ch - 12; }
      cardEl.style.left = left + 'px';
      cardEl.style.top  = top  + 'px';
    }, 200);
  }

  function run(tourId, opts){
    opts = opts || {};
    var steps = TOURS[tourId];
    if (!steps || !steps.length) return;
    if (!opts.force){
      try { if (localStorage.getItem(KEY(tourId)) === '1') return; } catch(e){}
    }
    injectStyles();
    close(tourId, false);

    var ov = document.createElement('div');
    ov.id = 'lt-spot-overlay';
    ov.className = 'lt-spot-back';
    ov.innerHTML = ''
      + '<div class="lt-spot-mask" id="lt-spot-mask"></div>'
      + '<div class="lt-spot-ring" id="lt-spot-ring"></div>'
      + '<div class="lt-spot-card" id="lt-spot-card" role="dialog" aria-modal="true">'
      +   '<div class="lt-spot-grip" id="lt-spot-grip" title="Drag to move"><span>⋮⋮ Drag · How-to</span><button class="lt-spot-grip-x" data-act="skip" title="Close">✕</button></div>'
      +   '<div class="lt-spot-step" id="lt-spot-stepnum"></div>'
      +   '<div class="lt-spot-title" id="lt-spot-title"></div>'
      +   '<div class="lt-spot-body" id="lt-spot-body"></div>'
      +   '<div class="lt-spot-foot">'
      +     '<button class="lt-spot-skip" data-act="skip">Skip tour ✕</button>'
      +     '<div class="lt-spot-actions">'
      +       '<button class="lt-spot-back-btn" data-act="back">Back</button>'
      +       '<button class="lt-spot-next" data-act="next">Next →</button>'
      +     '</div>'
      +   '</div>'
      +   '<label class="lt-spot-dont"><input type="checkbox" id="lt-spot-dont"> Don\'t show again</label>'
      + '</div>';
    document.body.appendChild(ov);

    var idx = 0;
    var userMoved = false;
    var maskEl = document.getElementById('lt-spot-mask');
    var ringEl = document.getElementById('lt-spot-ring');
    var cardEl = document.getElementById('lt-spot-card');

    function render(){
      var s = steps[idx];
      document.getElementById('lt-spot-stepnum').textContent = 'Step ' + (idx+1) + ' of ' + steps.length;
      document.getElementById('lt-spot-title').textContent = s.title || '';
      document.getElementById('lt-spot-body').textContent = s.body || '';
      var backBtn = ov.querySelector('[data-act="back"]');
      var nextBtn = ov.querySelector('[data-act="next"]');
      backBtn.disabled = (idx === 0);
      nextBtn.textContent = (idx === steps.length - 1) ? 'Done ✓' : 'Next →';
      position(s, ringEl, cardEl, maskEl, userMoved);
    }

    // Drag-to-move on the grip
    (function(){
      var grip = document.getElementById('lt-spot-grip');
      if (!grip) return;
      var sx=0, sy=0, ox=0, oy=0, dragging=false;
      grip.addEventListener('pointerdown', function(e){
        if (e.target.closest('.lt-spot-grip-x')) return;
        dragging = true; userMoved = true;
        cardEl.classList.add('dragging');
        sx = e.clientX; sy = e.clientY;
        var r = cardEl.getBoundingClientRect();
        ox = r.left; oy = r.top;
        grip.setPointerCapture(e.pointerId);
      });
      grip.addEventListener('pointermove', function(e){
        if (!dragging) return;
        var nx = ox + (e.clientX - sx);
        var ny = oy + (e.clientY - sy);
        nx = Math.max(6, Math.min(window.innerWidth - cardEl.offsetWidth - 6, nx));
        ny = Math.max(6, Math.min(window.innerHeight - cardEl.offsetHeight - 6, ny));
        cardEl.style.left = nx + 'px';
        cardEl.style.top  = ny + 'px';
      });
      grip.addEventListener('pointerup', function(e){
        dragging = false;
        cardEl.classList.remove('dragging');
        try { grip.releasePointerCapture(e.pointerId); } catch(_){}
      });
    })();

    ov.addEventListener('click', function(e){
      var act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
      if (!act) return;
      var dont = document.getElementById('lt-spot-dont');
      if (act === 'skip'){ close(tourId, dont && dont.checked); return; }
      if (act === 'back'){ if (idx > 0){ idx--; render(); } return; }
      if (act === 'next'){
        if (idx < steps.length - 1){ idx++; render(); }
        else { close(tourId, dont ? dont.checked : true); }
      }
    });

    _kh = function(e){
      if (e.key === 'Escape') close(tourId, false);
      else if (e.key === 'ArrowRight'){ if (idx < steps.length-1){ idx++; render(); } else close(tourId, true); }
      else if (e.key === 'ArrowLeft'){ if (idx > 0){ idx--; render(); } }
    };
    _rh = function(){ render(); };
    document.addEventListener('keydown', _kh);
    window.addEventListener('resize', _rh);
    window.addEventListener('scroll', _rh, true);

    render();
  }

  function tip(target, message){
    injectStyles();
    var el = (typeof target === 'string') ? document.getElementById(target) : target;
    if (!el) return;
    run('__inline_'+Date.now(), { force:true });
  }

  function reset(tourId){
    if (tourId){ try { localStorage.removeItem(KEY(tourId)); } catch(e){} }
    else {
      Object.keys(TOURS).forEach(function(k){ try{ localStorage.removeItem(KEY(k)); }catch(e){} });
    }
  }

  function showHelpFab(tourId, opts){
    opts = opts || {};
    var existing = document.getElementById('lt-spot-fab');
    if (existing) existing.remove();

    // Build a small docked helper bar with TWO chips: "How it works" + "Objective".
    // Labelled clearly so users no longer see a mysterious "?".
    var bar = document.createElement('div');
    bar.id = 'lt-spot-fab';
    bar.setAttribute('data-tour', tourId);
    bar.style.cssText = 'position:fixed;bottom:'+(opts.bottom||92)+'px;right:14px;z-index:9996;display:flex;flex-direction:column;gap:8px;align-items:flex-end;font-family:"Bricolage Grotesque",sans-serif;';

    // Help chip
    var help = document.createElement('button');
    help.type = 'button';
    help.title = 'Replay the how-to tour for this section';
    help.innerHTML = '<span style="font-size:.95rem;line-height:1">💡</span><span>How it works</span>';
    help.style.cssText = 'display:inline-flex;align-items:center;gap:7px;padding:8px 13px;border-radius:999px;background:rgba(15,23,42,.92);color:#bfdbfe;border:1px solid rgba(96,165,250,.45);font-weight:700;font-size:.78rem;letter-spacing:.2px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.4);backdrop-filter:blur(8px);transition:transform .15s,background .15s;';
    help.onmouseenter = function(){ help.style.background='rgba(30,58,138,.95)'; help.style.transform='translateY(-1px)'; };
    help.onmouseleave = function(){ help.style.background='rgba(15,23,42,.92)'; help.style.transform='translateY(0)'; };
    help.onclick = function(){ run(tourId, { force:true }); };
    bar.appendChild(help);

    // Objective chip — opt-in via opts.objective {title, body}
    if (opts.objective && (opts.objective.title || opts.objective.body)){
      var obj = document.createElement('button');
      obj.type = 'button';
      obj.title = 'See what this section is for';
      obj.innerHTML = '<span style="font-size:.95rem;line-height:1">🎯</span><span>'+(opts.objective.title||'Objective')+'</span>';
      obj.style.cssText = 'display:inline-flex;align-items:center;gap:7px;padding:8px 13px;border-radius:999px;background:rgba(15,23,42,.92);color:#fde68a;border:1px solid rgba(251,191,36,.45);font-weight:700;font-size:.78rem;letter-spacing:.2px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.4);backdrop-filter:blur(8px);transition:transform .15s,background .15s;';
      obj.onmouseenter = function(){ obj.style.background='rgba(120,53,15,.6)'; obj.style.transform='translateY(-1px)'; };
      obj.onmouseleave = function(){ obj.style.background='rgba(15,23,42,.92)'; obj.style.transform='translateY(0)'; };
      obj.onclick = function(){ showObjectivePop(opts.objective); };
      bar.appendChild(obj);
    }

    document.body.appendChild(bar);
  }

  function showObjectivePop(o){
    var prev = document.getElementById('lt-spot-objpop');
    if (prev) prev.remove();
    var pop = document.createElement('div');
    pop.id = 'lt-spot-objpop';
    pop.style.cssText = 'position:fixed;bottom:140px;right:14px;z-index:9997;max-width:320px;background:linear-gradient(160deg,#0f172a 0%,#0b1220 100%);border:1px solid rgba(251,191,36,.35);border-radius:14px;padding:14px 16px;box-shadow:0 14px 40px rgba(0,0,0,.55);font-family:"Bricolage Grotesque",sans-serif;color:#e2e8f0;animation:lt-spot-pop .18s ease-out';
    pop.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">' +
        '<div style="font-weight:800;color:#fde68a;font-size:.82rem;letter-spacing:.3px;text-transform:uppercase">🎯 '+(o.title||'Objective')+'</div>' +
        '<button id="lt-spot-objpop-x" style="background:transparent;border:0;color:rgba(255,255,255,.5);cursor:pointer;font-size:1rem">✕</button>' +
      '</div>' +
      '<div style="font-size:.84rem;line-height:1.55;color:rgba(226,232,240,.88)">'+(o.body||'')+'</div>';
    document.body.appendChild(pop);
    document.getElementById('lt-spot-objpop-x').onclick = function(){ pop.remove(); };
    setTimeout(function(){
      document.addEventListener('click', function dismiss(e){
        if (!pop.contains(e.target) && !e.target.closest('#lt-spot-fab')){
          pop.remove();
          document.removeEventListener('click', dismiss);
        }
      });
    }, 100);
  }

  function hideHelpFab(){
    var el = document.getElementById('lt-spot-fab');
    if (el) el.remove();
    var p = document.getElementById('lt-spot-objpop');
    if (p) p.remove();
  }

  // Auto-launch when a known page becomes active. Hooks into goTo() if present.
  function autoBindPages(){
    var map = {
      'pg-classroom': 'learning',
      'pg-exam':      'exams',
      'pg-essay':     'theory',
      'pg-kids':      'kids',
      'pg-arena':     'arena'
    };
    var OBJECTIVES = {
      'learning': { title:'Why Learning', body:'Step through your week-by-week curriculum with NERDC-aligned lessons, voice narration, diagrams and a built-in tutor that explains until you get it.' },
      'exams':    { title:'Why Exam Centre', body:'Practise WAEC, NECO, JAMB and BECE under real timing with anti-cheat, instant marking and past-question banks per subject.' },
      'theory':   { title:'Theory Goal', body:'Write structured (a)(b)(c) answers like the real WAEC booklet. Use the toolbar for symbols, equations, diagrams and tables. AI marks to WAEC criteria.' },
      'kids':     { title:'Kids Goal', body:'Bright, illustrated games for Primary learners — phonics, numbers, shapes, family, with safe parental controls.' },
      'arena':    { title:'Arena Goal', body:'Live multiplayer competitions grouped by class and region. Win XP, climb leaderboards, meet learners across Nigeria.' }
    };
    var origGoTo = window.goTo;
    if (typeof origGoTo === 'function' && !origGoTo.__lt_spot_wrapped){
      window.goTo = function(pid){
        var r = origGoTo.apply(this, arguments);
        var tour = map[pid];
        if (tour){
          // Wait a tick for the page to render
          setTimeout(function(){ run(tour); showHelpFab(tour, { objective: OBJECTIVES[tour] }); }, 700);
        } else {
          hideHelpFab();
        }
        return r;
      };
      window.goTo.__lt_spot_wrapped = true;
    }
    // If the page is already active on first load
    Object.keys(map).forEach(function(pid){
      var el = document.getElementById(pid);
      if (el && el.classList.contains('active')){
        setTimeout(function(){ run(map[pid]); showHelpFab(map[pid], { objective: OBJECTIVES[map[pid]] }); }, 800);
      }
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', autoBindPages);
  } else {
    autoBindPages();
  }

  window.LtSpot = { run: run, tip: tip, reset: reset, showHelpFab: showHelpFab, hideHelpFab: hideHelpFab };
})();
