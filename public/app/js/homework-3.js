
// ═══════════════════════════════════════════════════════════════════
// TOOL LOGIC — new subject-specific tools
// ═══════════════════════════════════════════════════════════════════

// ─── UNIT CONVERTER ────────────────────────────────────────────────
var CONV_CAT = 'length';
var CONV_DATA = {
  length:  {base:'m', units:{m:1,cm:0.01,mm:0.001,km:1000,inch:0.0254,ft:0.3048,yd:0.9144,mile:1609.34}},
  mass:    {base:'kg',units:{kg:1,g:0.001,mg:0.000001,tonne:1000,lb:0.4536,oz:0.02835}},
  time:    {base:'s', units:{s:1,min:60,hr:3600,day:86400,ms:0.001,yr:31536000}},
  temp:    {base:'C', units:{C:1,F:1,K:1}}, // handled specially
  energy:  {base:'J', units:{J:1,kJ:1000,cal:4.184,kcal:4184,'kWh':3600000,eV:1.602e-19}},
  pressure:{base:'Pa',units:{Pa:1,kPa:1000,atm:101325,bar:100000,mmHg:133.322,psi:6894.76}}
};
function convCat(btn,cat){
  CONV_CAT=cat;
  document.querySelectorAll('.conv-cat-btn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  var sel=CONV_DATA[cat].units, fromU=document.getElementById('convFromU'), toU=document.getElementById('convToU');
  var opts=Object.keys(sel).map(function(u){return '<option value="'+u+'">'+u+'</option>';}).join('');
  fromU.innerHTML=opts; toU.innerHTML=opts;
  toU.selectedIndex=1;
  doConvert();
}
function doConvert(){
  var v=parseFloat(document.getElementById('convFromVal').value);
  var from=document.getElementById('convFromU').value;
  var to=document.getElementById('convToU').value;
  var out=document.getElementById('convToVal');
  var formula=document.getElementById('convFormula');
  if(isNaN(v)||!from||!to){out.value='';formula.textContent='';return;}
  var result, fText='';
  if(CONV_CAT==='temp'){
    // Convert to Celsius first
    var C = from==='C'?v : from==='F'?(v-32)*5/9 : v-273.15;
    result = to==='C'?C : to==='F'?C*9/5+32 : C+273.15;
    if(from==='C'&&to==='F') fText='°F = °C × 9/5 + 32';
    else if(from==='F'&&to==='C') fText='°C = (°F − 32) × 5/9';
    else if(from==='C'&&to==='K') fText='K = °C + 273.15';
    else if(from==='K'&&to==='C') fText='°C = K − 273.15';
    else fText='identity';
  } else {
    var factor=CONV_DATA[CONV_CAT].units[from]/CONV_DATA[CONV_CAT].units[to];
    result=v*factor;
    fText='× '+factor.toPrecision(6);
  }
  out.value=typeof result==='number'?(+result.toPrecision(8)).toString():'';
  formula.textContent=v+' '+from+' '+fText+' = '+out.value+' '+to;
}

// ─── TRIG / TRIANGLE ───────────────────────────────────────────────
function doTrig(){
  var a=parseFloat(document.getElementById('trigAngle').value);
  var out=document.getElementById('trigOut');
  if(isNaN(a)){out.style.display='none';return;}
  var r=a*Math.PI/180;
  out.style.display='block';
  out.innerHTML='sin('+a+'°) = '+Math.sin(r).toFixed(4)+'<br>'
    +'cos('+a+'°) = '+Math.cos(r).toFixed(4)+'<br>'
    +'tan('+a+'°) = '+(Math.abs(Math.cos(r))<1e-10?'undefined':Math.tan(r).toFixed(4));
}
function doTriangle(){
  var o=parseFloat(document.getElementById('trigOpp').value);
  var a=parseFloat(document.getElementById('trigAdj').value);
  var h=parseFloat(document.getElementById('trigHyp').value);
  var out=document.getElementById('triOut');
  var given=[o,a,h].filter(function(x){return !isNaN(x);}).length;
  if(given<2){out.style.display='none';return;}
  out.style.display='block';
  var lines=[];
  if(!isNaN(o)&&!isNaN(a)){
    var hy=Math.sqrt(o*o+a*a);
    lines.push('Hypotenuse = √('+o+'² + '+a+'²) = '+hy.toFixed(3));
    lines.push('θ (from adj) = tan⁻¹('+o+'/'+a+') = '+(Math.atan(o/a)*180/Math.PI).toFixed(2)+'°');
  } else if(!isNaN(o)&&!isNaN(h)){
    var ad=Math.sqrt(h*h-o*o);
    lines.push('Adjacent = √('+h+'² − '+o+'²) = '+ad.toFixed(3));
    lines.push('θ = sin⁻¹('+o+'/'+h+') = '+(Math.asin(o/h)*180/Math.PI).toFixed(2)+'°');
  } else if(!isNaN(a)&&!isNaN(h)){
    var op=Math.sqrt(h*h-a*a);
    lines.push('Opposite = √('+h+'² − '+a+'²) = '+op.toFixed(3));
    lines.push('θ = cos⁻¹('+a+'/'+h+') = '+(Math.acos(a/h)*180/Math.PI).toFixed(2)+'°');
  }
  out.innerHTML=lines.join('<br>');
}

// ─── GRAPH PLOTTER ─────────────────────────────────────────────────
function loadGraphEx(s){document.getElementById('graphFn').value=s;plotGraph();}
function plotGraph(){
  var expr=document.getElementById('graphFn').value.trim();
  var c=document.getElementById('graphCanvas');
  if(!c||!expr)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  var xMin=-10,xMax=10,yMin=-10,yMax=10;
  ctx.fillStyle='#0a0f1a';ctx.fillRect(0,0,W,H);
  // grid
  ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;
  for(var i=xMin;i<=xMax;i++){
    var x=(i-xMin)/(xMax-xMin)*W;
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();
  }
  for(var j=yMin;j<=yMax;j++){
    var y=H-(j-yMin)/(yMax-yMin)*H;
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
  }
  // axes
  ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1.5;
  var x0=(0-xMin)/(xMax-xMin)*W, y0=H-(0-yMin)/(yMax-yMin)*H;
  ctx.beginPath();ctx.moveTo(0,y0);ctx.lineTo(W,y0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x0,0);ctx.lineTo(x0,H);ctx.stroke();
  // plot
  var fn;
  try {
    var safe=expr.replace(/\^/g,'**').replace(/([a-z]+)\(/gi,function(m,name){
      return (['sin','cos','tan','log','exp','sqrt','abs','asin','acos','atan'].includes(name)?'Math.'+name:name)+'(';
    });
    fn=new Function('x','return '+safe+';');
  } catch(e){
    document.getElementById('graphInfo').textContent='Error: '+e.message;return;
  }
  ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;ctx.beginPath();
  var started=false;
  for(var px=0;px<=W;px++){
    var xv=xMin+(px/W)*(xMax-xMin);
    var yv;
    try{yv=fn(xv);}catch(e){continue;}
    if(!isFinite(yv))continue;
    var py=H-(yv-yMin)/(yMax-yMin)*H;
    if(py<-100||py>H+100){started=false;continue;}
    if(!started){ctx.moveTo(px,py);started=true;}
    else ctx.lineTo(px,py);
  }
  ctx.stroke();
  document.getElementById('graphInfo').textContent='x ∈ ['+xMin+', '+xMax+']   y ∈ ['+yMin+', '+yMax+']   y = '+expr;
}

// ─── QUADRATIC & SIMULTANEOUS SOLVER ───────────────────────────────
function solveQuad(){
  var a=parseFloat(document.getElementById('qa').value);
  var b=parseFloat(document.getElementById('qb').value);
  var c=parseFloat(document.getElementById('qc').value);
  var out=document.getElementById('qOut');
  if(isNaN(a)||isNaN(b)||isNaN(c)||a===0){out.style.display='none';return;}
  var d=b*b-4*a*c;
  out.style.display='block';
  var lines=['a='+a+', b='+b+', c='+c,'Discriminant Δ = b² − 4ac = '+d];
  if(d>0){
    var r1=(-b+Math.sqrt(d))/(2*a), r2=(-b-Math.sqrt(d))/(2*a);
    lines.push('Two real roots:');
    lines.push('x = '+r1.toFixed(4)+'   or   x = '+r2.toFixed(4));
  } else if(d===0){
    lines.push('One repeated root:');
    lines.push('x = '+(-b/(2*a)).toFixed(4));
  } else {
    lines.push('No real roots (Δ < 0)');
    var re=(-b/(2*a)).toFixed(4), im=(Math.sqrt(-d)/(2*a)).toFixed(4);
    lines.push('Complex: x = '+re+' ± '+im+'i');
  }
  out.innerHTML=lines.join('<br>');
}
function solveSim(){
  var a1=parseFloat(document.getElementById('sa1').value),b1=parseFloat(document.getElementById('sb1').value),c1=parseFloat(document.getElementById('sc1').value);
  var a2=parseFloat(document.getElementById('sa2').value),b2=parseFloat(document.getElementById('sb2').value),c2=parseFloat(document.getElementById('sc2').value);
  var out=document.getElementById('sOut');
  if([a1,b1,c1,a2,b2,c2].some(isNaN)){out.style.display='none';return;}
  var det=a1*b2-a2*b1;
  out.style.display='block';
  if(det===0){out.innerHTML='Determinant = 0 → No unique solution (parallel or coincident)';return;}
  var x=(c1*b2-c2*b1)/det, y=(a1*c2-a2*c1)/det;
  out.innerHTML='Determinant = '+det+'<br>x = '+x.toFixed(4)+'<br>y = '+y.toFixed(4);
}

// ─── CIRCUIT SYMBOLS ───────────────────────────────────────────────
function initCircuitRef(){
  var grid=document.getElementById('circuitGrid');if(!grid||grid.dataset.init==='1')return;
  var syms=[
    {n:'Cell',      svg:'<svg viewBox="0 0 60 30" width="60" height="30"><line x1="0" y1="15" x2="25" y2="15" stroke="currentColor" stroke-width="1.5"/><line x1="25" y1="6" x2="25" y2="24" stroke="currentColor" stroke-width="2"/><line x1="31" y1="10" x2="31" y2="20" stroke="currentColor" stroke-width="1.5"/><line x1="31" y1="15" x2="60" y2="15" stroke="currentColor" stroke-width="1.5"/></svg>'},
    {n:'Battery',   svg:'<svg viewBox="0 0 60 30" width="60" height="30"><line x1="0" y1="15" x2="18" y2="15" stroke="currentColor" stroke-width="1.5"/><line x1="18" y1="6" x2="18" y2="24" stroke="currentColor" stroke-width="2"/><line x1="22" y1="10" x2="22" y2="20" stroke="currentColor" stroke-width="1.5"/><line x1="26" y1="6" x2="26" y2="24" stroke="currentColor" stroke-width="2"/><line x1="30" y1="10" x2="30" y2="20" stroke="currentColor" stroke-width="1.5"/><line x1="30" y1="15" x2="60" y2="15" stroke="currentColor" stroke-width="1.5"/></svg>'},
    {n:'Resistor',  svg:'<svg viewBox="0 0 60 30" width="60" height="30"><path d="M0 15 L12 15 L16 8 L22 22 L28 8 L34 22 L40 8 L44 15 L60 15" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'},
    {n:'Variable R',svg:'<svg viewBox="0 0 60 30" width="60" height="30"><path d="M0 15 L12 15 L16 8 L22 22 L28 8 L34 22 L40 8 L44 15 L60 15" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 27 L50 3" stroke="currentColor" stroke-width="1.5" marker-end="url(#arr)"/><defs><marker id="arr" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto"><polygon points="0,0 4,2 0,4" fill="currentColor"/></marker></defs></svg>'},
    {n:'Bulb',      svg:'<svg viewBox="0 0 60 30" width="60" height="30"><line x1="0" y1="15" x2="20" y2="15" stroke="currentColor" stroke-width="1.5"/><circle cx="30" cy="15" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="24" y1="9" x2="36" y2="21" stroke="currentColor" stroke-width="1"/><line x1="36" y1="9" x2="24" y2="21" stroke="currentColor" stroke-width="1"/><line x1="40" y1="15" x2="60" y2="15" stroke="currentColor" stroke-width="1.5"/></svg>'},
    {n:'Switch',    svg:'<svg viewBox="0 0 60 30" width="60" height="30"><line x1="0" y1="15" x2="18" y2="15" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="15" r="2" fill="currentColor"/><line x1="18" y1="15" x2="38" y2="6" stroke="currentColor" stroke-width="1.5"/><circle cx="42" cy="15" r="2" fill="currentColor"/><line x1="42" y1="15" x2="60" y2="15" stroke="currentColor" stroke-width="1.5"/></svg>'},
    {n:'Ammeter',   svg:'<svg viewBox="0 0 60 30" width="60" height="30"><line x1="0" y1="15" x2="20" y2="15" stroke="currentColor" stroke-width="1.5"/><circle cx="30" cy="15" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="30" y="19" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">A</text><line x1="40" y1="15" x2="60" y2="15" stroke="currentColor" stroke-width="1.5"/></svg>'},
    {n:'Voltmeter', svg:'<svg viewBox="0 0 60 30" width="60" height="30"><line x1="0" y1="15" x2="20" y2="15" stroke="currentColor" stroke-width="1.5"/><circle cx="30" cy="15" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="30" y="19" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">V</text><line x1="40" y1="15" x2="60" y2="15" stroke="currentColor" stroke-width="1.5"/></svg>'},
    {n:'Capacitor', svg:'<svg viewBox="0 0 60 30" width="60" height="30"><line x1="0" y1="15" x2="26" y2="15" stroke="currentColor" stroke-width="1.5"/><line x1="26" y1="5" x2="26" y2="25" stroke="currentColor" stroke-width="2"/><line x1="34" y1="5" x2="34" y2="25" stroke="currentColor" stroke-width="2"/><line x1="34" y1="15" x2="60" y2="15" stroke="currentColor" stroke-width="1.5"/></svg>'},
    {n:'Diode',     svg:'<svg viewBox="0 0 60 30" width="60" height="30"><line x1="0" y1="15" x2="22" y2="15" stroke="currentColor" stroke-width="1.5"/><polygon points="22,7 22,23 38,15" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="38" y1="7" x2="38" y2="23" stroke="currentColor" stroke-width="2"/><line x1="38" y1="15" x2="60" y2="15" stroke="currentColor" stroke-width="1.5"/></svg>'},
    {n:'Fuse',      svg:'<svg viewBox="0 0 60 30" width="60" height="30"><line x1="0" y1="15" x2="18" y2="15" stroke="currentColor" stroke-width="1.5"/><rect x="18" y="10" width="24" height="10" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="18" y1="15" x2="42" y2="15" stroke="currentColor" stroke-width="1"/><line x1="42" y1="15" x2="60" y2="15" stroke="currentColor" stroke-width="1.5"/></svg>'},
    {n:'Earth',     svg:'<svg viewBox="0 0 60 30" width="60" height="30"><line x1="30" y1="0" x2="30" y2="14" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="14" x2="44" y2="14" stroke="currentColor" stroke-width="2"/><line x1="22" y1="19" x2="38" y2="19" stroke="currentColor" stroke-width="1.5"/><line x1="26" y1="24" x2="34" y2="24" stroke="currentColor" stroke-width="1"/></svg>'}
  ];
  grid.innerHTML=syms.map(function(s){return '<div class="cir-sym">'+s.svg+'<div class="cs-lbl">'+s.n+'</div></div>';}).join('');
  grid.dataset.init='1';
}

// ─── EQUATION BALANCER ─────────────────────────────────────────────
function parseFormulaAtoms(formula){
  // returns {element: count} — handles parentheses and numbers
  var atoms={};
  var stack=[{}];
  var i=0;
  while(i<formula.length){
    var ch=formula[i];
    if(ch==='('){stack.push({});i++;}
    else if(ch===')'){
      i++; var mult='';
      while(i<formula.length&&/\d/.test(formula[i])){mult+=formula[i];i++;}
      mult=parseInt(mult)||1;
      var inner=stack.pop();
      for(var el in inner) stack[stack.length-1][el]=(stack[stack.length-1][el]||0)+inner[el]*mult;
    }
    else if(/[A-Z]/.test(ch)){
      var el=ch;i++;
      while(i<formula.length&&/[a-z]/.test(formula[i])){el+=formula[i];i++;}
      var num='';
      while(i<formula.length&&/\d/.test(formula[i])){num+=formula[i];i++;}
      num=parseInt(num)||1;
      stack[stack.length-1][el]=(stack[stack.length-1][el]||0)+num;
    }
    else i++;
  }
  return stack[0];
}
function checkBalance(){
  var eq=document.getElementById('balEq').value.trim();
  var out=document.getElementById('balOut');
  if(!eq){out.style.display='none';return;}
  var parts=eq.split(/=|→|->/);
  if(parts.length!==2){out.style.display='block';out.innerHTML='<span style="color:#fca5a5">⚠ Use = or → between reactants and products</span>';return;}
  try {
    var left=parts[0].split('+').map(function(s){return parseFormulaAtoms(s.trim());});
    var right=parts[1].split('+').map(function(s){return parseFormulaAtoms(s.trim());});
    var leftTotal={},rightTotal={};
    left.forEach(function(m){for(var e in m) leftTotal[e]=(leftTotal[e]||0)+m[e];});
    right.forEach(function(m){for(var e in m) rightTotal[e]=(rightTotal[e]||0)+m[e];});
    var allEls=new Set(Object.keys(leftTotal).concat(Object.keys(rightTotal)));
    var balanced=true, rows=[];
    allEls.forEach(function(el){
      var L=leftTotal[el]||0, R=rightTotal[el]||0;
      var ok=L===R;
      if(!ok) balanced=false;
      rows.push('<div style="display:flex;justify-content:space-between;padding:2px 0"><span>'+el+'</span><span>'+L+' → '+R+'  '+(ok?'✓':'✗')+'</span></div>');
    });
    out.style.display='block';
    out.innerHTML = (balanced?'<div style="color:#86efac;font-weight:700;margin-bottom:6px">✓ Balanced</div>':'<div style="color:#fca5a5;font-weight:700;margin-bottom:6px">✗ Not balanced</div>')+rows.join('');
  } catch(e){
    out.style.display='block';out.innerHTML='<span style="color:#fca5a5">⚠ Could not parse: '+e.message+'</span>';
  }
}

// ─── PUNNETT SQUARE ────────────────────────────────────────────────
function drawPunnett(){
  var p1=(document.getElementById('p1Gen').value||'Aa').trim();
  var p2=(document.getElementById('p2Gen').value||'Aa').trim();
  if(p1.length!==2||p2.length!==2){
    document.getElementById('punnettGrid').innerHTML='<div style="color:#fca5a5;font-size:.76rem;text-align:center;padding:20px">Enter 2-letter genotypes (e.g. Aa × Aa)</div>';
    document.getElementById('punnettRatio').textContent='';
    return;
  }
  var a1=p1[0],a2=p1[1],b1=p2[0],b2=p2[1];
  var rows=[['',b1,b2],[a1,a1+b1,a1+b2],[a2,a2+b1,a2+b2]];
  function sort(g){return g.split('').sort(function(x,y){return x.toLowerCase()===x?1:-1;}).join('');}
  function cls(g){
    var s=sort(g);
    if(s[0]===s[0].toLowerCase()) return 'pun-rec';
    if(s[1]===s[1].toLowerCase()) return 'pun-het';
    return 'pun-dom';
  }
  var html='<div class="pun-grid" style="grid-template-columns:repeat(3,1fr)">';
  rows.forEach(function(row,i){
    row.forEach(function(cell,j){
      if(i===0&&j===0){html+='<div class="pun-cell pun-header"></div>';}
      else if(i===0||j===0){html+='<div class="pun-cell pun-header">'+cell+'</div>';}
      else{var sorted=sort(cell);html+='<div class="pun-cell '+cls(cell)+'">'+sorted+'</div>';}
    });
  });
  html+='</div>';
  document.getElementById('punnettGrid').innerHTML=html;
  // Compute ratios
  var offspring=[a1+b1,a1+b2,a2+b1,a2+b2].map(sort);
  var counts={};
  offspring.forEach(function(g){counts[g]=(counts[g]||0)+1;});
  var ratio=Object.keys(counts).map(function(g){return counts[g]+' '+g;}).join(' : ');
  // Pheno
  var phen={dom:0,het:0,rec:0};
  offspring.forEach(function(g){
    if(g[0]===g[0].toLowerCase()&&g[1]===g[1].toLowerCase()) phen.rec++;
    else if(g[0]!==g[1]) phen.het++;
    else phen.dom++;
  });
  document.getElementById('punnettRatio').innerHTML='<b>Genotypic:</b> '+ratio+'<br><b>Phenotypic:</b> '+(phen.dom+phen.het)+' dominant : '+phen.rec+' recessive';
}

// ─── NIGERIA MAP DATA ──────────────────────────────────────────────
var NIG_STATES = [
  {n:'Abia',      c:'Umuahia',    z:'SE'}, {n:'Adamawa',   c:'Yola',       z:'NE'},
  {n:'Akwa Ibom', c:'Uyo',        z:'SS'}, {n:'Anambra',   c:'Awka',       z:'SE'},
  {n:'Bauchi',    c:'Bauchi',     z:'NE'}, {n:'Bayelsa',   c:'Yenagoa',    z:'SS'},
  {n:'Benue',     c:'Makurdi',    z:'NC'}, {n:'Borno',     c:'Maiduguri',  z:'NE'},
  {n:'Cross River',c:'Calabar',   z:'SS'}, {n:'Delta',     c:'Asaba',      z:'SS'},
  {n:'Ebonyi',    c:'Abakaliki',  z:'SE'}, {n:'Edo',       c:'Benin City', z:'SS'},
  {n:'Ekiti',     c:'Ado-Ekiti',  z:'SW'}, {n:'Enugu',     c:'Enugu',      z:'SE'},
  {n:'FCT Abuja', c:'Abuja',      z:'NC'}, {n:'Gombe',     c:'Gombe',      z:'NE'},
  {n:'Imo',       c:'Owerri',     z:'SE'}, {n:'Jigawa',    c:'Dutse',      z:'NW'},
  {n:'Kaduna',    c:'Kaduna',     z:'NW'}, {n:'Kano',      c:'Kano',       z:'NW'},
  {n:'Katsina',   c:'Katsina',    z:'NW'}, {n:'Kebbi',     c:'Birnin Kebbi',z:'NW'},
  {n:'Kogi',      c:'Lokoja',     z:'NC'}, {n:'Kwara',     c:'Ilorin',     z:'NC'},
  {n:'Lagos',     c:'Ikeja',      z:'SW'}, {n:'Nasarawa',  c:'Lafia',      z:'NC'},
  {n:'Niger',     c:'Minna',      z:'NC'}, {n:'Ogun',      c:'Abeokuta',   z:'SW'},
  {n:'Ondo',      c:'Akure',      z:'SW'}, {n:'Osun',      c:'Osogbo',     z:'SW'},
  {n:'Oyo',       c:'Ibadan',     z:'SW'}, {n:'Plateau',   c:'Jos',        z:'NC'},
  {n:'Rivers',    c:'Port Harcourt',z:'SS'},{n:'Sokoto',   c:'Sokoto',     z:'NW'},
  {n:'Taraba',    c:'Jalingo',    z:'NE'}, {n:'Yobe',      c:'Damaturu',   z:'NE'},
  {n:'Zamfara',   c:'Gusau',      z:'NW'}
];
var NIG_FILTER={zone:'all',q:''};
function renderNigStates(){
  var list=document.getElementById('nigList');if(!list)return;
  var filtered=NIG_STATES.filter(function(s){
    if(NIG_FILTER.zone!=='all'&&s.z!==NIG_FILTER.zone)return false;
    if(NIG_FILTER.q){
      var q=NIG_FILTER.q.toLowerCase();
      return s.n.toLowerCase().includes(q)||s.c.toLowerCase().includes(q)||s.z.toLowerCase().includes(q);
    }
    return true;
  });
  if(!filtered.length){list.innerHTML='<div style="padding:20px;text-align:center;color:rgba(255,255,255,.4);font-size:.78rem">No match</div>';return;}
  list.innerHTML=filtered.map(function(s){return '<div class="nig-state"><div><div class="nig-state-name">'+s.n+'</div><div class="nig-state-cap">Capital: '+s.c+'</div></div><span class="nig-state-zone">'+s.z+'</span></div>';}).join('');
}
function filterNigStates(){NIG_FILTER.q=document.getElementById('nigSearch').value;renderNigStates();}
function filterNigZone(btn,z){
  document.querySelectorAll('.nig-zone').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  NIG_FILTER.zone=z;renderNigStates();
}

// ─── FORMULA SHEET ─────────────────────────────────────────────────
var FORMULAS = {
  mth: [
    {h:'Algebra',rows:[['Quadratic roots','x = (−b ± √(b²−4ac)) / 2a'],['Discriminant','Δ = b² − 4ac'],['Difference of squares','a² − b² = (a+b)(a−b)'],['Arithmetic sum','Sₙ = n/2 (2a + (n−1)d)'],['Geometric sum','Sₙ = a(1−rⁿ)/(1−r)']]},
    {h:'Geometry',rows:[['Triangle area','½ × base × height'],['Heron','A = √(s(s−a)(s−b)(s−c))'],['Circle area','πr²'],['Circle circumference','2πr'],['Sphere volume','4/3 πr³'],['Cone volume','1/3 πr²h']]},
    {h:'Trigonometry',rows:[['Pythagoras','a² + b² = c²'],['Sine rule','a/sinA = b/sinB = c/sinC'],['Cosine rule','c² = a² + b² − 2ab cosC'],['sin² + cos²','= 1'],['tan','= sin/cos']]},
    {h:'Statistics',rows:[['Mean','x̄ = Σx / n'],['Variance','σ² = Σ(x−x̄)² / n'],['SD','σ = √variance']]}
  ],
  phy: [
    {h:'Mechanics',rows:[['Velocity','v = u + at'],['Distance','s = ut + ½at²'],['v²','v² = u² + 2as'],['Force','F = ma'],['Momentum','p = mv'],['Impulse','Ft = Δmv'],['Weight','W = mg']]},
    {h:'Energy & Work',rows:[['Work','W = Fd cosθ'],['KE','½mv²'],['PE','mgh'],['Power','P = W/t = Fv']]},
    {h:'Electricity',rows:[['Ohm','V = IR'],['Power','P = VI = I²R'],['Charge','Q = It'],['Series R','R = R₁+R₂'],['Parallel R','1/R = 1/R₁+1/R₂']]},
    {h:'Waves',rows:[['Wave eq','v = fλ'],['Period','T = 1/f'],['Refraction','n = sinθ₁/sinθ₂']]}
  ],
  chm: [
    {h:'Moles',rows:[['Moles from mass','n = m/Mr'],['Moles from volume','n = V/22.4 (at STP)'],['Conc.','c = n/V'],['Avogadro','Nₐ = 6.022×10²³ /mol']]},
    {h:'Gas Laws',rows:[['Boyle','P₁V₁ = P₂V₂'],['Charles','V₁/T₁ = V₂/T₂'],['Combined','PV/T = const'],['Ideal gas','PV = nRT']]},
    {h:'Electrolysis',rows:[['Charge','Q = It'],['Faraday','1 F = 96,500 C/mol'],['Mass deposited','m = (ItMr)/(nF)']]},
    {h:'pH',rows:[['pH','pH = −log[H⁺]'],['pOH','pOH = −log[OH⁻]'],['Kw','pH + pOH = 14 (at 25°C)']]}
  ],
  eco: [
    {h:'Elasticity',rows:[['PED','%ΔQd / %ΔP'],['PES','%ΔQs / %ΔP'],['YED','%ΔQd / %ΔY'],['XED','%ΔQdA / %ΔPB']]},
    {h:'National Income',rows:[['GDP (Y=)','C + I + G + (X−M)'],['GNP','GDP + net property income from abroad'],['Real GDP','Nominal GDP / Price index × 100']]},
    {h:'Cost',rows:[['AC','TC / Q'],['MC','ΔTC / ΔQ'],['AFC','TFC / Q'],['AVC','TVC / Q']]}
  ],
  acc: [
    {h:'Basic equation',rows:[['Accounting eq.','Assets = Capital + Liabilities'],['Profit','Revenue − Expenses']]},
    {h:'Ratios',rows:[['Current ratio','Current Assets / Current Liabilities'],['Acid test','(CA − Stock) / CL'],['Gross margin','Gross profit / Sales × 100'],['Net margin','Net profit / Sales × 100']]},
    {h:'Depreciation',rows:[['Straight line','(Cost − Salvage) / Life'],['Reducing balance','Rate × Book value']]}
  ]
};
function showFormulas(btn,subj){
  document.querySelectorAll('.fm-tab').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  var sections=FORMULAS[subj]||[];
  var html=sections.map(function(s){
    return '<div class="fm-section"><div class="fm-section-h">'+s.h+'</div>'
      + s.rows.map(function(r){return '<div class="fm-row"><span class="fm-name">'+r[0]+'</span><span class="fm-eq">'+r[1]+'</span></div>';}).join('')
      + '</div>';
  }).join('');
  document.getElementById('fmContent').innerHTML=html;
}

// ─── ESSAY OUTLINER ────────────────────────────────────────────────
function copyOutline(){
  var p=['Thesis','Point 1','Point 2','Point 3','Conclusion'];
  var ids=['outThesis','outP1','outP2','outP3','outConc'];
  var text=p.map(function(label,i){var v=document.getElementById(ids[i]).value.trim();return v?label+':\n'+v:'';}).filter(Boolean).join('\n\n');
  if(!text){alert('Nothing to copy yet');return;}
  navigator.clipboard.writeText(text).then(function(){alert('Outline copied to clipboard');});
}

// ─── READ ALOUD ────────────────────────────────────────────────────
var _dictUtter=null;
function dictSpeak(){
  var t=document.getElementById('dictText').value.trim();if(!t)return;
  if('speechSynthesis' in window){
    speechSynthesis.cancel();
    _dictUtter=new SpeechSynthesisUtterance(t);
    _dictUtter.rate=parseFloat(document.getElementById('dictRate').value)||0.95;
    _dictUtter.lang='en-GB';
    speechSynthesis.speak(_dictUtter);
  } else alert('Speech synthesis not supported in this browser.');
}
function dictStop(){if('speechSynthesis' in window)speechSynthesis.cancel();}

// ─── WORD COUNT ────────────────────────────────────────────────────
function updateWC(){
  var t=document.getElementById('wcText').value;
  var words=(t.trim().match(/\S+/g)||[]).length;
  var chars=t.length;
  var sentences=(t.match(/[.!?]+/g)||[]).length;
  var readMin=(words/220).toFixed(1);
  var speakMin=(words/130).toFixed(1);
  document.getElementById('wcOut').innerHTML='Words: <b>'+words+'</b> · Characters: <b>'+chars+'</b> · Sentences: <b>'+sentences+'</b><br>Reading time: ~'+readMin+' min · Speaking time: ~'+speakMin+' min';
}

// ─── QUOTE BANK ────────────────────────────────────────────────────
var _quotes=[];
function addQuote(){
  var q=document.getElementById('qbNew').value.trim();
  var s=document.getElementById('qbSrc').value.trim();
  if(!q)return;
  _quotes.push({q:q,s:s,id:Date.now()});
  document.getElementById('qbNew').value='';
  document.getElementById('qbSrc').value='';
  renderQuotes();
}
function delQuote(id){_quotes=_quotes.filter(function(x){return x.id!==id;});renderQuotes();}
function renderQuotes(){
  var list=document.getElementById('qbList');if(!list)return;
  if(!_quotes.length){list.innerHTML='<div style="text-align:center;color:rgba(255,255,255,.35);font-size:.74rem;padding:16px">No quotes saved yet</div>';return;}
  list.innerHTML=_quotes.map(function(x){return '<div class="qb-item"><button class="qb-del" onclick="delQuote('+x.id+')">✕</button><div class="qb-q">"'+x.q+'"</div>'+(x.s?'<div class="qb-s">— '+x.s+'</div>':'')+'</div>';}).join('');
}

// ─── Hook init callbacks into toggleTool ───────────────────────────
(function(){
  if(typeof toggleTool!=='function')return;
  var _orig=toggleTool;
  window.toggleTool=function(id){
    _orig(id);
    // If panel was just opened, run initialiser
    var panel=document.getElementById(id);
    if(panel && panel.style.display!=='none'){
      if(id==='toolConverter'){if(!document.getElementById('convFromU').innerHTML){convCat(document.querySelector('.conv-cat-btn.active')||document.querySelector('.conv-cat-btn'),'length');}}
      if(id==='toolCircuit') initCircuitRef();
      if(id==='toolPunnett') drawPunnett();
      if(id==='toolNigeriaMap') renderNigStates();
      if(id==='toolFormula'){var ac=document.querySelector('.fm-tab.active');showFormulas(ac||document.querySelector('.fm-tab'),(ac&&ac.dataset.fm)||'mth');}
      if(id==='toolWordCount') updateWC();
      if(id==='toolGraph' && !document.getElementById('graphCanvas').dataset.drawn){plotGraph();document.getElementById('graphCanvas').dataset.drawn='1';}
    }
  };
})();
