/* ════════════════════════════════════════════════════════════════
   LESSON TEACHER — ONBOARDING TOUR
   Smart, content-aware tour. Waits for the lesson/exam to actually
   render BEFORE showing usage flow + tools. Skippable. Help (?)
   button to re-launch.
   ════════════════════════════════════════════════════════════════ */
(function(){
  var STORAGE = {
    lesson: 'lt_tour_lesson_skipped',
    objective: 'lt_tour_objective_skipped'
  };

  // What "ready" means for each kind of tour. We poll until truthy.
  var READY = {
    lesson: function(){
      var b = document.getElementById('lessonBody');
      if (!b) return false;
      // Consider ready when there's real content (not the loader)
      var txt = (b.innerText || '').trim();
      var hasLoader = b.querySelector('.lt-loading, .ld-dot');
      return txt.length > 120 && !hasLoader;
    },
    objective: function(){
      var ec = document.getElementById('examContent');
      if (!ec) return false;
      // Ready when a question option appears (or a question container)
      return !!ec.querySelector('.opt, .q-opt, [data-opt], .question, .exam-q');
    }
  };

  var TOURS = {
    lesson: {
      title: 'How to use Lesson Teacher',
      accent: '#3b82f6',
      steps: [
        { ico:'1️⃣', h:'Read the lesson here', t:'The full lesson — definitions, Nigerian examples, worked questions — is written for you in this panel. Scroll through to read it all.' },
        { ico:'2️⃣', h:'Tap "Ask Tutor" anytime', t:'Use the chat on the right (or below on mobile) to ask any question — type or speak. The tutor answers based on the lesson you\'re reading.' },
        { ico:'3️⃣', h:'Try the quiz at the end', t:'A short quiz appears after the lesson. Score well to mark the topic as complete and unlock the next one.' },
        { ico:'⬇️', h:'Download for offline study', t:'Tap the download icon at the top of the lesson to save it as a notebook page you can read without internet.' },
        { ico:'🛟', h:'AI server failover', t:'A small pill at the bottom-right shows which AI server is active. If Server 1 (Anthropic) fails, the app auto-switches to Server 2 (OpenAI). You can also pick a server manually.' }
      ]
    },
    objective: {
      title: 'How Objective Questions work',
      accent: '#10b981',
      steps: [
        { ico:'1️⃣', h:'Pick the best option', t:'Each question shows options A, B, C, D (and E for some boards). Tap the one you think is correct.' },
        { ico:'2️⃣', h:'Watch the timer', t:'Real exam mode is timed like the actual WAEC/NECO/JAMB paper. Pace yourself — don\'t spend too long on one question.' },
        { ico:'3️⃣', h:'Read the explanation', t:'In Practice mode, after each answer you see WHY it\'s right. Use this to learn, not just to score.' },
        { ico:'🆘', h:'Stuck? Tap the ? button', t:'The blue ? button at the bottom-left re-opens this guide whenever you need a refresher.' },
        { ico:'🛟', h:'AI server failover', t:'The pill at the bottom-right shows the active AI server. The app auto-switches to a backup if the main one is down — no action needed from you.' }
      ]
    }
  };

  function injectStyles(){
    if (document.getElementById('lt-tour-styles')) return;
    var s = document.createElement('style');
    s.id = 'lt-tour-styles';
    s.textContent = ''
      + '.lt-tour-back{position:fixed;inset:0;background:rgba(5,10,22,.78);backdrop-filter:blur(8px);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;animation:ltTourFade .25s ease}'
      + '.lt-tour-card{background:linear-gradient(160deg,#0f172a,#1e293b);border:1px solid rgba(255,255,255,.1);border-radius:22px;max-width:460px;width:100%;padding:24px 22px 20px;box-shadow:0 30px 80px rgba(0,0,0,.55);color:#fff;font-family:Inter,system-ui,sans-serif;max-height:90vh;overflow-y:auto}'
      + '.lt-tour-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:12px}'
      + '.lt-tour-title{font-family:"Bricolage Grotesque",sans-serif;font-weight:900;font-size:1.15rem;letter-spacing:-.01em}'
      + '.lt-tour-skip{background:none;border:none;color:rgba(255,255,255,.55);font-size:.78rem;cursor:pointer;font-weight:600;padding:6px 10px;border-radius:8px}'
      + '.lt-tour-skip:hover{color:#fff;background:rgba(255,255,255,.06)}'
      + '.lt-tour-step{display:flex;gap:12px;align-items:flex-start;padding:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;margin-bottom:8px}'
      + '.lt-tour-ico{font-size:1.3rem;flex-shrink:0;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);border-radius:10px;font-weight:900}'
      + '.lt-tour-h{font-weight:800;font-size:.92rem;margin-bottom:3px;font-family:"Bricolage Grotesque",sans-serif}'
      + '.lt-tour-t{font-size:.8rem;color:rgba(255,255,255,.7);line-height:1.5}'
      + '.lt-tour-foot{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:14px;flex-wrap:wrap}'
      + '.lt-tour-check{display:flex;align-items:center;gap:8px;font-size:.78rem;color:rgba(255,255,255,.6);cursor:pointer;user-select:none}'
      + '.lt-tour-check input{accent-color:var(--lt-accent,#3b82f6)}'
      + '.lt-tour-go{background:var(--lt-accent,#3b82f6);color:#fff;border:none;padding:10px 22px;border-radius:100px;font-weight:800;cursor:pointer;font-size:.9rem;font-family:"Bricolage Grotesque",sans-serif}'
      + '.lt-tour-go:hover{filter:brightness(1.1)}'
      + '.lt-help-fab{position:fixed;bottom:64px;left:14px;z-index:9997;width:40px;height:40px;border-radius:50%;background:rgba(15,23,42,.92);color:#fff;border:1px solid rgba(255,255,255,.18);font-size:1.05rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.4);font-family:"Bricolage Grotesque",sans-serif;display:flex;align-items:center;justify-content:center}'
      + '.lt-help-fab:hover{background:#1e293b}'
      + '@keyframes ltTourFade{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(s);
  }

  function close(){
    var el = document.getElementById('lt-tour-overlay');
    if (el) el.remove();
  }

  window.openLtTour = function(kind){
    var tour = TOURS[kind];
    if (!tour) return;
    injectStyles();
    close();
    var stepsHtml = tour.steps.map(function(s){
      return '<div class="lt-tour-step"><div class="lt-tour-ico">'+s.ico+'</div><div><div class="lt-tour-h">'+s.h+'</div><div class="lt-tour-t">'+s.t+'</div></div></div>';
    }).join('');
    var back = document.createElement('div');
    back.id = 'lt-tour-overlay';
    back.className = 'lt-tour-back';
    back.style.setProperty('--lt-accent', tour.accent);
    back.innerHTML = ''
      + '<div class="lt-tour-card" role="dialog" aria-modal="true">'
      +   '<div class="lt-tour-head">'
      +     '<div class="lt-tour-title">'+tour.title+'</div>'
      +     '<button class="lt-tour-skip" data-act="skip">Skip ✕</button>'
      +   '</div>'
      +   stepsHtml
      +   '<div class="lt-tour-foot">'
      +     '<label class="lt-tour-check"><input type="checkbox" id="lt-tour-dont"> Don\'t show this again</label>'
      +     '<button class="lt-tour-go" data-act="go">Got it →</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(back);
    function done(){
      var dont = document.getElementById('lt-tour-dont');
      if (dont && dont.checked){ try{ localStorage.setItem(STORAGE[kind], '1'); }catch(e){} }
      close();
    }
    back.addEventListener('click', function(e){
      var act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'skip' || act === 'go') done();
      else if (e.target === back) done();
    });
    addHelpFab(kind);
  };

  function addHelpFab(kind){
    var existing = document.getElementById('lt-help-fab');
    if (existing) existing.remove();
    var btn = document.createElement('button');
    btn.id = 'lt-help-fab';
    btn.className = 'lt-help-fab';
    btn.title = 'Show how-to guide';
    btn.textContent = '?';
    btn.onclick = function(){ window.openLtTour(kind); };
    document.body.appendChild(btn);
  }

  // Wait until the kind's content has actually rendered, THEN show the tour.
  // Cap waiting at 30s so we never block silently.
  window.maybeShowLtTour = function(kind){
    addHelpFab(kind);
    try { if (localStorage.getItem(STORAGE[kind]) === '1') return; } catch(e){}
    var ready = READY[kind];
    if (!ready){ setTimeout(function(){ window.openLtTour(kind); }, 350); return; }
    var start = Date.now();
    var iv = setInterval(function(){
      if (ready()){
        clearInterval(iv);
        // Small breath so layout settles before the overlay paints
        setTimeout(function(){ window.openLtTour(kind); }, 400);
      } else if (Date.now() - start > 30000){
        clearInterval(iv); // give up silently — user can hit ?
      }
    }, 400);
  };

  window.hideLtHelpFab = function(){
    var el = document.getElementById('lt-help-fab');
    if (el) el.remove();
  };
})();
