/* Landing Delight Layer — only on #pg-landing
   - Floating clickable coins / stars / books with parallax
   - Daily mystery box that shakes; click to open and earn a star
   - .lt-tilt soft 3D tilt on cards/buttons
*/
(function(){
  'use strict';
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  function injectStyles(){
    if (document.getElementById('lt-delight-css')) return;
    var s = document.createElement('style'); s.id = 'lt-delight-css';
    s.textContent = ''
      + '#lt-delight{position:absolute;left:0;right:0;top:0;height:100vh;pointer-events:none;z-index:2;overflow:hidden}'
      + '.ltd-obj{position:absolute;font-size:1.4rem;cursor:pointer;pointer-events:auto;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45));transition:transform .25s ease;will-change:transform;user-select:none;opacity:.85}'
      + '.ltd-obj:hover{transform:scale(1.25) rotate(-6deg)}'
      + '.ltd-obj.pop{animation:ltdPop .55s ease forwards}'
      + '@keyframes ltdPop{0%{transform:scale(1)}40%{transform:scale(1.6) rotate(20deg)}100%{transform:scale(0) rotate(60deg);opacity:0}}'
      + '.ltd-float{animation:ltdFloat 7s ease-in-out infinite}'
      + '@keyframes ltdFloat{0%,100%{translate:0 0}50%{translate:0 -14px}}'
      + '#lt-mystery{position:fixed;right:18px;bottom:84px;z-index:60;width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border:2px solid #fde68a;box-shadow:0 12px 30px rgba(245,158,11,.45),inset 0 1px 0 rgba(255,255,255,.5);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.9rem;animation:ltdShake 2.4s ease-in-out infinite}'
      + '@keyframes ltdShake{0%,86%,100%{transform:rotate(0)}88%{transform:rotate(-12deg)}90%{transform:rotate(10deg)}92%{transform:rotate(-8deg)}94%{transform:rotate(6deg)}96%{transform:rotate(0)}}'
      + '#lt-mystery:hover{filter:brightness(1.1)}'
      + '#lt-mystery .lt-mb-tip{position:absolute;right:74px;top:50%;transform:translateY(-50%);background:#0f172a;color:#fbbf24;border:1px solid rgba(251,191,36,.35);padding:6px 10px;border-radius:8px;font-size:.72rem;font-weight:800;white-space:nowrap;box-shadow:0 8px 20px rgba(0,0,0,.4)}'
      + '#lt-mystery.opened{animation:none;background:linear-gradient(135deg,#10b981,#059669);border-color:#86efac;box-shadow:0 12px 30px rgba(16,185,129,.4)}'
      + '#lt-mascot{display:none!important}'
      + '.lt-tilt{transition:transform .25s ease,box-shadow .25s ease;transform-style:preserve-3d;will-change:transform}'
      + '.lt-spark{position:fixed;pointer-events:none;font-size:1.2rem;z-index:9999;animation:ltdSpark .9s ease-out forwards}'
      + '@keyframes ltdSpark{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(.4);opacity:0}}'
      + '@media(max-width:640px){#lt-mystery{width:54px;height:54px;font-size:1.5rem;bottom:78px}.ltd-obj{font-size:1.3rem}}';
    document.head.appendChild(s);
  }

  function spark(x,y,emoji){
    for (var i=0;i<6;i++){
      var s = document.createElement('div'); s.className = 'lt-spark'; s.textContent = emoji;
      s.style.left = x+'px'; s.style.top = y+'px';
      var ang = Math.random()*Math.PI*2, dist = 40+Math.random()*60;
      s.style.setProperty('--dx', (Math.cos(ang)*dist)+'px');
      s.style.setProperty('--dy', (Math.sin(ang)*dist)+'px');
      document.body.appendChild(s);
      setTimeout((function(el){return function(){ el.remove(); }})(s), 900);
    }
  }

  function spawnFloaters(){
    // Anchor floaters to the hero section only so they never overlap content below
    var hero = document.querySelector('#pg-landing .hero, #pg-landing header, #pg-landing > section') || document.getElementById('pg-landing');
    if (!hero) return;
    if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';
    var layer = document.createElement('div'); layer.id = 'lt-delight';
    hero.appendChild(layer);
    // Keep emojis to the left/right edges only — never centre — so they don't cover headlines or CTAs
    var items = [
      {e:'⭐', side:'L', top:14},
      {e:'🪙', side:'R', top:22},
      {e:'📚', side:'L', top:58},
      {e:'✨', side:'R', top:64},
    ];
    items.forEach(function(it, i){
      var el = document.createElement('div');
      el.className = 'ltd-obj ltd-float';
      el.textContent = it.e;
      el.style.top = it.top+'%';
      el.style[it.side==='L'?'left':'right'] = (3 + (i*2))+'%';
      el.style.animationDelay = (i*0.7)+'s';
      el.dataset.parX = (Math.random()*16-8);
      el.dataset.parY = (Math.random()*12-6);
      el.addEventListener('click', function(ev){
        spark(ev.clientX, ev.clientY, it.e);
        el.classList.add('pop');
        setTimeout(function(){ el.remove(); }, 540);
      });
      layer.appendChild(el);
    });
    // Mouse parallax — only when hero in view
    window.addEventListener('mousemove', function(e){
      var r = layer.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var nx = (e.clientX/window.innerWidth - .5);
      var ny = (e.clientY/window.innerHeight - .5);
      layer.querySelectorAll('.ltd-obj').forEach(function(el){
        var px = parseFloat(el.dataset.parX||0), py = parseFloat(el.dataset.parY||0);
        el.style.transform = 'translate('+(nx*px)+'px,'+(ny*py)+'px)';
      });
    }, { passive: true });
  }

  function spawnMystery(){
    // Mystery box removed per request. Also clean up any pre-existing node
    // (in case a cached older script already injected one).
    try {
      var existing = document.getElementById('lt-mystery');
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    } catch(e){}
  }

  function spawnMascot(){ /* removed: floating owl mascot */ }

  // Belt-and-braces: if any cached/older script injected the mascot, nuke it.
  function killMascot(){
    try {
      var n = document.getElementById('lt-mascot');
      if (n && n.parentNode) n.parentNode.removeChild(n);
    } catch(e){}
  }

  function tiltCards(){
    document.querySelectorAll('.lt-tilt, .feat-card, .pricing-card, .hp-card').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left)/r.width - .5;
        var y = (e.clientY - r.top)/r.height - .5;
        el.style.transform = 'perspective(900px) rotateX('+(-y*6)+'deg) rotateY('+(x*8)+'deg) translateY(-2px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform=''; });
    });
  }

  ready(function(){
    if (!document.getElementById('pg-landing')) return;
    injectStyles();
    spawnFloaters();
    spawnMystery();
    killMascot();
    setTimeout(killMascot, 1500);
    setTimeout(killMascot, 4000);
    setTimeout(tiltCards, 800); // after landing-3d / GSAP
  });
})();
