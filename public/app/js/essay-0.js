
/* ═══════════════════════════════════════════════════════════════
   ESSAY BOOKLET — Symbol picker, diagram canvas, formatting helpers
   These are registered on window so the shell's renderBlock/addBlock
   (defined later in the shell's bottom script) can call them.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // ── SYMBOL CATALOG ──
  var SYMBOLS = {
    math: [
      ['±','plus-minus'],['×','multiply'],['÷','divide'],['·','dot'],
      ['√','sqrt'],['∛','cbrt'],['∑','sum'],['∏','product'],
      ['∫','integral'],['∞','infinity'],['π','pi'],['≈','approx'],
      ['≠','not equal'],['≤','leq'],['≥','geq'],['∝','prop'],
      ['∴','therefore'],['∵','because'],['∠','angle'],['⊥','perp'],
      ['∥','parallel'],['∆','delta'],['ƒ','function'],['°','degree'],
      ['²','squared'],['³','cubed'],['½','half'],['¼','quarter'],
      ['¾','three quarter'],['⅓','one third'],['⅔','two third'],
    ],
    greek: [
      ['α','alpha'],['β','beta'],['γ','gamma'],['δ','delta'],
      ['ε','epsilon'],['ζ','zeta'],['η','eta'],['θ','theta'],
      ['λ','lambda'],['μ','mu'],['π','pi'],['ρ','rho'],
      ['σ','sigma'],['τ','tau'],['φ','phi'],['χ','chi'],
      ['ψ','psi'],['ω','omega'],
      ['Α','Alpha'],['Β','Beta'],['Γ','Gamma'],['Δ','Delta'],
      ['Θ','Theta'],['Λ','Lambda'],['Π','Pi'],['Σ','Sigma'],
      ['Φ','Phi'],['Ψ','Psi'],['Ω','Omega'],
    ],
    chem: [
      ['→','yields'],['⇌','equilibrium'],['↑','gas'],['↓','ppt'],
      ['⇀','forward'],['↽','backward'],['⟶','long arrow'],
      ['·','dot'],['Δ','heat'],['⊕','plus ion'],['⊖','minus ion'],
      ['⁺','+ charge'],['⁻','- charge'],['²⁺','2+'],['³⁺','3+'],
      ['²⁻','2-'],['³⁻','3-'],['₁','1'],['₂','2'],['₃','3'],
      ['₄','4'],['₅','5'],['₆','6'],['₇','7'],['₈','8'],['₉','9'],
      ['¹','1'],['²','2'],['³','3'],['⁴','4'],['⁵','5'],['⁶','6'],
    ],
    arrow: [
      ['→','right'],['←','left'],['↑','up'],['↓','down'],
      ['↔','both'],['⇒','implies'],['⇐','impl back'],['⇔','iff'],
      ['⟹','long impl'],['⟸','long back'],['⟺','long iff'],
      ['↗','ne'],['↘','se'],['↙','sw'],['↖','nw'],
      ['⟶','long right'],['⟵','long left'],['↦','maps to'],
    ],
    units: [
      ['°C','celsius'],['°F','fahrenheit'],['K','kelvin'],
      ['m/s','m/s'],['km/h','km/h'],['m²','m²'],['m³','m³'],
      ['cm³','cm³'],['kg/m³','kg/m³'],['N/m²','N/m²'],['Ω','ohm'],
      ['µ','micro'],['₦','naira'],['£','pound'],['€','euro'],
      ['$','dollar'],['%','percent'],['‰','per mille'],
      ['mol','mol'],['J','joule'],['W','watt'],['Pa','pascal'],
      ['Hz','hertz'],['V','volt'],['A','amp'],
    ]
  };

  // ── Track last focused textarea for inserting symbols there ──
  var _lastFocusedInput = null;
  document.addEventListener('focusin', function(e){
    var t = e.target;
    if (t && (t.tagName==='TEXTAREA' || (t.tagName==='INPUT' && t.type==='text'))){
      // track any input inside the theory answer pane
      if (t.closest && t.closest('#theoryAnswerPane')){
        _lastFocusedInput = t;
      }
    }
  });

  // ── Prevent toolbar buttons + symbol picker from stealing focus on click ──
  // This is critical: without mousedown preventDefault, clicking a toolbar button
  // blurs the textarea before the click handler runs, and insertion fails silently.
  document.addEventListener('mousedown', function(e){
    var t = e.target;
    if (!t || !t.closest) return;
    // If the mousedown is on a tool button, symbol picker item, or the theory toolbar,
    // preventDefault so the currently-focused textarea keeps focus.
    if (t.closest('.tb-btn') ||
        t.closest('.ttk-tool') ||
        t.closest('.sp-grid') ||
        t.closest('.sp-tab') ||
        t.closest('.theory-parts-tabs') ||
        t.closest('.tpt-tab') ||
        t.closest('.tpt-add')){
      // Only prevent if a textarea is currently focused inside the pane
      var a = document.activeElement;
      if (a && (a.tagName==='TEXTAREA' || a.tagName==='INPUT') && a.closest && a.closest('#theoryAnswerPane')){
        e.preventDefault();
      }
    }
  }, true);

  function getTargetInput(){
    // Prefer the active element if it's a textarea/input in the pane
    var a = document.activeElement;
    if (a && (a.tagName==='TEXTAREA' || a.tagName==='INPUT') && a.closest && a.closest('#theoryAnswerPane')){
      return a;
    }
    return _lastFocusedInput;
  }

  function insertAtCursor(el, text){
    if (!el) return false;
    el.focus();
    var start = (el.selectionStart!=null) ? el.selectionStart : el.value.length;
    var end   = (el.selectionEnd!=null)   ? el.selectionEnd   : el.value.length;
    var before = el.value.substring(0,start);
    var after  = el.value.substring(end);
    el.value = before + text + after;
    var pos = start + text.length;
    try { el.setSelectionRange(pos, pos); } catch(e){}
    // Fire input event so the block updates its content/word count
    el.dispatchEvent(new Event('input', {bubbles:true}));
    return true;
  }

  // ── Wrap selection with markers like **bold** — since it's a textarea,
  //    we just wrap with markdown-ish markers the student can use.
  //    This is just a typing aid; the stored text is plain. ──
  window.insertFmtMark = function(kind){
    var el = getTargetInput();
    if (!el){ _nudge('Click inside an answer box first.'); return; }
    var markers = {
      bold:      ['**','**'],
      italic:    ['*','*'],
      underline: ['__','__'],
      highlight: ['==','=='],
    };
    var m = markers[kind]; if (!m) return;
    var start = el.selectionStart, end = el.selectionEnd;
    var sel = el.value.substring(start,end) || '';
    var before = el.value.substring(0,start);
    var after  = el.value.substring(end);
    el.value = before + m[0] + sel + m[1] + after;
    var pos = start + m[0].length + sel.length + (sel?m[1].length:0);
    el.focus();
    try { el.setSelectionRange(pos, pos); } catch(e){}
    el.dispatchEvent(new Event('input', {bubbles:true}));
  };

  window.insertSubSup = function(kind){
    var el = getTargetInput();
    if (!el){ _nudge('Click inside an answer box first.'); return; }
    // Convert the last digit/character to a sub or sup if possible;
    // otherwise open a small prompt-free "type next char as sub/sup" mode.
    var map = {
      sub: {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
            '+':'₊','-':'₋','=':'₌','(':'₍',')':'₎','a':'ₐ','e':'ₑ','o':'ₒ','x':'ₓ','n':'ₙ'},
      sup: {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
            '+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾','n':'ⁿ','i':'ⁱ'}
    };
    var m = map[kind]; if (!m) return;
    var start = el.selectionStart, end = el.selectionEnd;
    if (start !== end){
      // Convert the selected text char-by-char
      var sel = el.value.substring(start,end);
      var out = '';
      for (var i=0;i<sel.length;i++){ out += (m[sel[i]] || sel[i]); }
      var before = el.value.substring(0,start);
      var after  = el.value.substring(end);
      el.value = before + out + after;
      var pos = start + out.length;
      el.focus();
      try { el.setSelectionRange(pos, pos); } catch(e){}
      el.dispatchEvent(new Event('input', {bubbles:true}));
    } else {
      // Convert the char immediately before the cursor
      if (start === 0){ _nudge('Select a character or digit first, then press '+kind+'.'); return; }
      var prev = el.value[start-1];
      var conv = m[prev];
      if (!conv){ _nudge('No '+kind+' available for "'+prev+'".'); return; }
      var before2 = el.value.substring(0,start-1);
      var after2  = el.value.substring(start);
      el.value = before2 + conv + after2;
      el.focus();
      try { el.setSelectionRange(start, start); } catch(e){}
      el.dispatchEvent(new Event('input', {bubbles:true}));
    }
  };

  window.insertListMarker = function(kind){
    var el = getTargetInput();
    if (!el){ _nudge('Click inside an answer box first.'); return; }
    var marker;
    if (kind==='bullet') marker = '\n• ';
    else if (kind==='number'){
      // guess next number by counting existing "1." "2." etc. in the box
      var matches = (el.value.match(/^(\d+)\./gm)||[]);
      var n = matches.length + 1;
      marker = '\n' + n + '. ';
    } else {
      // lettered: (a), (b), (c)
      var ms = (el.value.match(/^\([a-z]\)/gm)||[]);
      var letter = String.fromCharCode(97 + ms.length); // a, b, c…
      marker = '\n(' + letter + ') ';
    }
    insertAtCursor(el, marker);
  };

  // ── SYMBOL PICKER ──
  var _currentTab = 'math';
  window.toggleSymbolPicker = function(){
    var p = document.getElementById('symbolPicker');
    if (!p) return;
    if (p.style.display === 'none'){
      p.style.display = 'block';
      renderSymbolGrid(_currentTab);
    } else { p.style.display = 'none'; }
  };
  window.switchSymbolTab = function(tab, btn){
    _currentTab = tab;
    var tabs = document.querySelectorAll('#symbolPicker .sp-tab');
    tabs.forEach(function(t){ t.classList.remove('on'); });
    if (btn) btn.classList.add('on');
    renderSymbolGrid(tab);
  };
  function renderSymbolGrid(tab){
    var g = document.getElementById('spGrid');
    if (!g) return;
    var list = SYMBOLS[tab] || [];
    g.innerHTML = '';
    list.forEach(function(pair){
      var sym = pair[0], lbl = pair[1];
      var b = document.createElement('button');
      b.className = 'sp-btn';
      b.type = 'button';
      b.innerHTML = '<span>'+sym+'</span><span class="sp-btn-label">'+lbl+'</span>';
      b.onclick = function(){
        var el = getTargetInput();
        if (!el){ _nudge('Click inside an answer box first.'); return; }
        insertAtCursor(el, sym);
      };
      g.appendChild(b);
    });
  }

  // ── Non-intrusive nudge ──
  function _nudge(msg){
    var n = document.createElement('div');
    n.textContent = msg;
    n.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e3a8a;color:#fff;padding:10px 20px;border-radius:100px;font-size:.88rem;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.3);opacity:0;transition:opacity .2s';
    document.body.appendChild(n);
    setTimeout(function(){n.style.opacity='1';},10);
    setTimeout(function(){n.style.opacity='0';setTimeout(function(){n.remove();},250);},1800);
  }

  // ═══════════════════════════════════════════════════════════════
  // DIAGRAM CANVAS — full drawing tool for the 'diagram' block
  // ═══════════════════════════════════════════════════════════════
  window.renderBlockDiagram = function(block){
    // Shared wrapper/header built by the shell's renderBlock; here we only
    // build the body (tools + canvas) and return it.
    var body = document.createElement('div');
    body.className = 'ab-diagram-wrap';

    // Toolbar
    var tools = document.createElement('div');
    tools.className = 'dgm-tools';
    body.appendChild(tools);

    // State for this diagram instance
    var state = {
      tool: 'pen',
      color: '#1e3a8a',
      stroke: 2.5,
      history: (block.dgmHistory && block.dgmHistory.slice()) || [],
      redo: [],
      drawing: false,
      start: null,
      previewShape: null,
    };

    function mkToolBtn(id, label, title){
      var b = document.createElement('button');
      b.type='button'; b.className='dgm-tool'; b.dataset.tool=id; b.textContent=label; b.title=title||label;
      if (id===state.tool) b.classList.add('on');
      b.onclick = function(){
        state.tool = id;
        tools.querySelectorAll('[data-tool]').forEach(function(x){ x.classList.remove('on'); });
        b.classList.add('on');
      };
      return b;
    }

    tools.appendChild(mkToolBtn('pen','✏️','Free draw'));
    tools.appendChild(mkToolBtn('line','— Line','Straight line'));
    tools.appendChild(mkToolBtn('arrow','↗ Arrow','Arrow'));
    tools.appendChild(mkToolBtn('rect','▭ Rect','Rectangle'));
    tools.appendChild(mkToolBtn('circle','○ Circle','Circle/ellipse'));
    tools.appendChild(mkToolBtn('text','T Label','Text label'));
    tools.appendChild(mkToolBtn('number','① #','Numbered marker'));
    tools.appendChild(mkToolBtn('eraser','🩹 Erase','Eraser (click shape to remove)'));

    // Separator
    var sep1 = document.createElement('div'); sep1.className='dgm-sep'; tools.appendChild(sep1);

    // Colors
    var colors = ['#1e3a8a','#dc2626','#16a34a','#f59e0b','#7c3aed','#000000'];
    colors.forEach(function(c){
      var cb = document.createElement('button');
      cb.type='button'; cb.className='dgm-color'; cb.style.background=c;
      cb.title = c;
      if (c===state.color) cb.classList.add('on');
      cb.onclick = function(){
        state.color = c;
        tools.querySelectorAll('.dgm-color').forEach(function(x){ x.classList.remove('on'); });
        cb.classList.add('on');
      };
      tools.appendChild(cb);
    });

    // Stroke width
    var strokeLbl = document.createElement('span'); strokeLbl.className='dgm-stroke-lbl'; strokeLbl.textContent='Thickness';
    tools.appendChild(strokeLbl);
    var strokeInp = document.createElement('input');
    strokeInp.type='range'; strokeInp.min='1'; strokeInp.max='8'; strokeInp.step='0.5';
    strokeInp.value = state.stroke; strokeInp.className='dgm-stroke';
    strokeInp.oninput = function(){ state.stroke = parseFloat(strokeInp.value); };
    tools.appendChild(strokeInp);

    // Separator
    var sep2 = document.createElement('div'); sep2.className='dgm-sep'; tools.appendChild(sep2);

    // Actions
    var undoBtn = document.createElement('button');
    undoBtn.type='button'; undoBtn.className='dgm-tool'; undoBtn.textContent='↶ Undo';
    undoBtn.onclick = function(){
      if (state.history.length===0) return;
      state.redo.push(state.history.pop());
      repaint();
      save();
    };
    tools.appendChild(undoBtn);

    var redoBtn = document.createElement('button');
    redoBtn.type='button'; redoBtn.className='dgm-tool'; redoBtn.textContent='↷ Redo';
    redoBtn.onclick = function(){
      if (state.redo.length===0) return;
      state.history.push(state.redo.pop());
      repaint();
      save();
    };
    tools.appendChild(redoBtn);

    var clearBtn = document.createElement('button');
    clearBtn.type='button'; clearBtn.className='dgm-tool'; clearBtn.textContent='🗑 Clear';
    clearBtn.onclick = function(){
      if (state.history.length===0) return;
      if (!confirm('Clear the entire diagram?')) return;
      state.redo = state.history.slice();
      state.history = [];
      repaint();
      save();
    };
    tools.appendChild(clearBtn);

    // Canvas
    var wrap = document.createElement('div');
    wrap.className = 'dgm-canvas-wrap';
    var canvas = document.createElement('canvas');
    canvas.className = 'dgm-canvas';
    canvas.width = 1000;
    canvas.height = 420;
    wrap.appendChild(canvas);
    body.appendChild(wrap);

    var ctx = canvas.getContext('2d');

    function toCanvasCoords(e){
      var rect = canvas.getBoundingClientRect();
      var cx = (e.clientX - rect.left) * (canvas.width / rect.width);
      var cy = (e.clientY - rect.top) * (canvas.height / rect.height);
      return {x: cx, y: cy};
    }

    function drawShape(s){
      ctx.save();
      ctx.strokeStyle = s.color || '#1e3a8a';
      ctx.fillStyle = s.color || '#1e3a8a';
      ctx.lineWidth = s.stroke || 2.5;
      ctx.lineCap = 'round'; ctx.lineJoin='round';

      if (s.type === 'pen'){
        if (!s.points || s.points.length<2) return;
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (var i=1;i<s.points.length;i++) ctx.lineTo(s.points[i].x, s.points[i].y);
        ctx.stroke();
      } else if (s.type === 'line'){
        ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke();
      } else if (s.type === 'arrow'){
        ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke();
        var angle = Math.atan2(s.y2-s.y1, s.x2-s.x1);
        var ah = 12 + s.stroke*2;
        ctx.beginPath();
        ctx.moveTo(s.x2, s.y2);
        ctx.lineTo(s.x2 - ah*Math.cos(angle-Math.PI/6), s.y2 - ah*Math.sin(angle-Math.PI/6));
        ctx.lineTo(s.x2 - ah*Math.cos(angle+Math.PI/6), s.y2 - ah*Math.sin(angle+Math.PI/6));
        ctx.closePath(); ctx.fill();
      } else if (s.type === 'rect'){
        ctx.strokeRect(Math.min(s.x1,s.x2), Math.min(s.y1,s.y2), Math.abs(s.x2-s.x1), Math.abs(s.y2-s.y1));
      } else if (s.type === 'circle'){
        var cx=(s.x1+s.x2)/2, cy=(s.y1+s.y2)/2;
        var rx=Math.abs(s.x2-s.x1)/2, ry=Math.abs(s.y2-s.y1)/2;
        ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); ctx.stroke();
      } else if (s.type === 'text'){
        ctx.font = (14 + s.stroke*1.5) + 'px "Kalam", Georgia, serif';
        ctx.textBaseline = 'top';
        ctx.fillText(s.text || '', s.x, s.y);
      } else if (s.type === 'number'){
        var r = 14 + s.stroke;
        ctx.beginPath(); ctx.arc(s.x,s.y,r,0,Math.PI*2); ctx.fillStyle = s.color; ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold ' + (12+s.stroke) + 'px sans-serif';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(String(s.n), s.x, s.y);
      }
      ctx.restore();
    }

    function repaint(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      state.history.forEach(drawShape);
      if (state.previewShape) drawShape(state.previewShape);
    }

    function pointInShape(p, s){
      // Simple hit test for eraser
      if (s.type === 'pen'){
        for (var i=0;i<(s.points||[]).length;i++){
          var q = s.points[i];
          if (Math.abs(q.x-p.x)<8 && Math.abs(q.y-p.y)<8) return true;
        }
        return false;
      }
      if (s.type==='line'||s.type==='arrow'){
        // distance from line segment
        var A=p.x-s.x1, B=p.y-s.y1, C=s.x2-s.x1, D=s.y2-s.y1;
        var dot=A*C+B*D, lenSq=C*C+D*D;
        var t = lenSq>0 ? Math.max(0,Math.min(1,dot/lenSq)) : 0;
        var xx = s.x1 + t*C, yy = s.y1 + t*D;
        return Math.hypot(p.x-xx, p.y-yy) < 8;
      }
      if (s.type==='rect'){
        var xs=Math.min(s.x1,s.x2), ys=Math.min(s.y1,s.y2);
        var w=Math.abs(s.x2-s.x1), h=Math.abs(s.y2-s.y1);
        // just check bounding box edge vicinity
        return (p.x>=xs-6 && p.x<=xs+w+6 && p.y>=ys-6 && p.y<=ys+h+6) &&
               !(p.x>xs+8 && p.x<xs+w-8 && p.y>ys+8 && p.y<ys+h-8);
      }
      if (s.type==='circle'){
        var cx=(s.x1+s.x2)/2, cy=(s.y1+s.y2)/2;
        var rx=Math.max(8,Math.abs(s.x2-s.x1)/2), ry=Math.max(8,Math.abs(s.y2-s.y1)/2);
        var dx=(p.x-cx)/rx, dy=(p.y-cy)/ry;
        var d = Math.hypot(dx,dy);
        return Math.abs(d-1) < 0.15;
      }
      if (s.type==='text' || s.type==='number'){
        return Math.abs(p.x-s.x)<18 && Math.abs(p.y-s.y)<18;
      }
      return false;
    }

    function save(){
      block.dgmHistory = state.history;
      try { block.content = JSON.stringify(state.history); } catch(e){}
      if (window.updateTheoryWordCount) window.updateTheoryWordCount();
    }

    function nextNumber(){
      var n = 1;
      state.history.forEach(function(s){ if (s.type==='number' && typeof s.n==='number' && s.n>=n) n = s.n+1; });
      return n;
    }

    // Mouse handlers
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('touchstart', function(e){ e.preventDefault(); onDown(e.touches[0]); }, {passive:false});
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('touchmove',  function(e){ e.preventDefault(); onMove(e.touches[0]); }, {passive:false});
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchend',  onUp);

    function onDown(e){
      var p = toCanvasCoords(e);
      state.drawing = true;
      state.start = p;
      if (state.tool === 'eraser'){
        // Remove the topmost shape containing this point
        for (var i=state.history.length-1;i>=0;i--){
          if (pointInShape(p, state.history[i])){
            state.history.splice(i,1);
            repaint(); save();
            break;
          }
        }
        state.drawing = false;
        return;
      }
      if (state.tool === 'text'){
        var t = prompt('Label text:');
        state.drawing = false;
        if (!t) return;
        state.history.push({type:'text', x:p.x, y:p.y, text:t, color:state.color, stroke:state.stroke});
        state.redo = [];
        repaint(); save();
        return;
      }
      if (state.tool === 'number'){
        state.drawing = false;
        state.history.push({type:'number', x:p.x, y:p.y, n:nextNumber(), color:state.color, stroke:state.stroke});
        state.redo = [];
        repaint(); save();
        return;
      }
      if (state.tool === 'pen'){
        state.previewShape = {type:'pen', points:[p], color:state.color, stroke:state.stroke};
      } else {
        state.previewShape = {type:state.tool, x1:p.x, y1:p.y, x2:p.x, y2:p.y, color:state.color, stroke:state.stroke};
      }
    }
    function onMove(e){
      if (!state.drawing || !state.previewShape) return;
      var p = toCanvasCoords(e);
      if (state.previewShape.type === 'pen'){
        state.previewShape.points.push(p);
      } else {
        state.previewShape.x2 = p.x; state.previewShape.y2 = p.y;
      }
      repaint();
    }
    function onUp(){
      if (!state.drawing) return;
      state.drawing = false;
      if (state.previewShape){
        // Don't save zero-size shapes
        var s = state.previewShape;
        var ok = true;
        if (s.type==='pen' && (!s.points||s.points.length<2)) ok=false;
        if ((s.type==='line'||s.type==='arrow'||s.type==='rect'||s.type==='circle') &&
            Math.hypot((s.x2-s.x1),(s.y2-s.y1))<4) ok=false;
        if (ok){ state.history.push(s); state.redo=[]; save(); }
      }
      state.previewShape = null;
      repaint();
    }

    // Caption
    var cap = document.createElement('input');
    cap.type='text'; cap.className='dgm-caption-input';
    cap.placeholder='Caption / figure label (e.g. "Fig. 1 — Cross-section of plant cell")';
    cap.value = block.caption || '';
    cap.oninput = function(){ block.caption = cap.value; };
    body.appendChild(cap);

    // Initial paint
    setTimeout(repaint, 0);

    return body;
  };

})();
