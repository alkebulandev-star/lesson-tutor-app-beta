

// API calls are proxied through /api/anthropic and /api/openai — keys live server-side only

// ════════════════════ EXAM CENTRE ENGINE ════════════════════

// ══════════════════════════════════════════════════════════════
// EXAM CENTRE — Complete rewrite
// ══════════════════════════════════════════════════════════════
let currentExam='waec', currentExamSubj='', currentExamSubjName='', currentExamYear=0, currentExamMode='mixed';
let examSession=null;

const EXAM_SUBJECTS={
  waec:[{k:'eng',n:'English Language',i:'📖'},{k:'mth',n:'Mathematics',i:'🧮'},{k:'bio',n:'Biology',i:'🔬'},{k:'chm',n:'Chemistry',i:'⚗️'},{k:'phy',n:'Physics',i:'⚡'},{k:'geo',n:'Geography',i:'🌍'},{k:'gov',n:'Government',i:'🏛️'},{k:'eco',n:'Economics',i:'💰'},{k:'lit',n:'Literature in English',i:'📚'},{k:'acc',n:'Financial Accounting',i:'📊'},{k:'agr',n:'Agricultural Science',i:'🌾'},{k:'cmp',n:'Computer Studies',i:'💻'},{k:'his',n:'History',i:'📜'},{k:'crs',n:'CRS / IRS',i:'🕊️'},{k:'fmth',n:'Further Mathematics',i:'∑'},{k:'com',n:'Commerce',i:'🏪'},{k:'fne',n:'Fine Art',i:'🎨'},{k:'mus',n:'Music',i:'🎵'}],
  neco:[{k:'eng',n:'English Language',i:'📖'},{k:'mth',n:'Mathematics',i:'🧮'},{k:'bio',n:'Biology',i:'🔬'},{k:'chm',n:'Chemistry',i:'⚗️'},{k:'phy',n:'Physics',i:'⚡'},{k:'geo',n:'Geography',i:'🌍'},{k:'gov',n:'Government',i:'🏛️'},{k:'eco',n:'Economics',i:'💰'},{k:'lit',n:'Literature in English',i:'📚'},{k:'acc',n:'Financial Accounting',i:'📊'},{k:'agr',n:'Agricultural Science',i:'🌾'},{k:'cmp',n:'Computer Studies',i:'💻'},{k:'his',n:'History',i:'📜'},{k:'crs',n:'CRS / IRS',i:'🕊️'},{k:'com',n:'Commerce',i:'🏪'}],
  jamb:[{k:'eng',n:'Use of English',i:'📖'},{k:'mth',n:'Mathematics',i:'🧮'},{k:'bio',n:'Biology',i:'🔬'},{k:'chm',n:'Chemistry',i:'⚗️'},{k:'phy',n:'Physics',i:'⚡'},{k:'geo',n:'Geography',i:'🌍'},{k:'gov',n:'Government',i:'🏛️'},{k:'eco',n:'Economics',i:'💰'},{k:'acc',n:'Accounting',i:'📊'},{k:'agr',n:'Agricultural Science',i:'🌾'},{k:'cmp',n:'Computer Science',i:'💻'},{k:'lit',n:'Literature in English',i:'📚'},{k:'his',n:'History',i:'📜'},{k:'crs',n:'CRS',i:'🕊️'},{k:'fmth',n:'Further Mathematics',i:'∑'},{k:'com',n:'Commerce',i:'🏪'}],
  bece:[{k:'eng',n:'English Studies',i:'📖'},{k:'mth',n:'Mathematics',i:'🧮'},{k:'bst',n:'Basic Science & Technology',i:'🔬'},{k:'nve',n:'National Values Education',i:'🇳🇬'},{k:'bsn',n:'Business Studies',i:'💼'},{k:'cca',n:'Cultural & Creative Arts',i:'🎨'},{k:'pvs',n:'Pre-Vocational Studies',i:'🛠️'},{k:'crs',n:'CRS / IRS',i:'🕊️'},{k:'fre',n:'French',i:'🇫🇷'},{k:'nlg',n:'Nigerian Language',i:'🗣️'},{k:'his',n:'History',i:'📜'}],
  ce:[{k:'eng',n:'English Studies',i:'📖'},{k:'mth',n:'Mathematics',i:'🧮'},{k:'bst',n:'Basic Science & Technology',i:'🔬'},{k:'nve',n:'National Values Education',i:'🇳🇬'},{k:'qva',n:'Quantitative & Vocational Aptitude',i:'🔢'},{k:'vrb',n:'Verbal Aptitude',i:'📝'}]
};
const PAST_YEARS={
  waec:[2023,2022,2021,2020,2019,2018,2017,2016,2015],
  neco:[2023,2022,2021,2020,2019,2018,2017],
  jamb:[2023,2022,2021,2020,2019,2018,2017,2016],
  bece:[2023,2022,2021,2020,2019,2018,2017],
  ce:[2023,2022,2021,2020,2019,2018,2017,2016,2015]
};

// ═════════════════════════════════════════════════════════════════
// BOARD_CONFIG — Single source of truth for all Nigerian exam boards
// Verified against 2025/2026 official syllabi (WAEC, NECO, JAMB, NECO-BECE, NCEE)
// ═════════════════════════════════════════════════════════════════
const BOARD_CONFIG = {
  waec: {
    key: 'waec',
    short: 'WAEC',
    full: 'WAEC / WASSCE',
    longName: 'West African Senior School Certificate Examination',
    body: 'The West African Examinations Council',
    mainLine: 'Senior Secondary Certificate Examination',
    level: 'senior',          // senior | junior | primary
    color: '#2563eb',
    options: ['A','B','C','D'],    // 4 options — key WAEC differentiator
    numOptions: 4,
    hasTheory: true,
    hasOral: true,                  // English + languages only
    hasPractical: true,             // sciences
    // Paper 1 objective default spec (may be overridden per subject)
    paper1: { qCount: 50, timeMin: 90, marks: 50 },
    // Paper 2 theory default spec
    paper2: { timeMin: 150, marks: 100, format: '13 essay questions in 2 sections; answer 10' },
    // Subject-specific overrides
    subjectOverrides: {
      eng: {  // English Language — WAEC structure is opposite to Maths
        paper1: { qCount: 0, timeMin: 150, marks: 120, format: 'Essay + Comprehension + Summary' },
        paper2: { qCount: 50, timeMin: 60, marks: 50, format: 'Multiple Choice (Lexis & Structure)' },
        paper3: { qCount: 60, timeMin: 45, marks: 30, format: 'Test of Orals' },
        note: 'WAEC English: Paper 1 is Essay, Paper 2 is the 50-question objective. This is the OPPOSITE of most other subjects.'
      },
      fmth: { paper1: { qCount: 40, timeMin: 60, marks: 40 } }, // Further Maths: 40 MCQ in 1hr
    },
    styleNotes: [
      'Questions follow West African regional style — examples may reference Nigeria, Ghana, Sierra Leone, The Gambia, Liberia.',
      'Tone is formal and academic; uses British English conventions.',
      'Distractors are designed around common conceptual errors, not trick wording.',
      'Theory questions are structured as (a), (b), (c) with sub-parts and mark allocations like [5 marks].',
      'Chief Examiner reports emphasize: correct terminology, clear workings shown, proper unit labels.',
    ]
  },

  neco: {
    key: 'neco',
    short: 'NECO',
    full: 'NECO / SSCE',
    longName: 'Senior School Certificate Examination',
    body: 'National Examinations Council',
    mainLine: 'Senior School Certificate Examination',
    level: 'senior',
    color: '#059669',
    options: ['A','B','C','D','E'],   // 5 options — KEY NECO DIFFERENTIATOR
    numOptions: 5,
    hasTheory: true,
    hasOral: true,
    hasPractical: true,
    paper1: { qCount: 60, timeMin: 75, marks: 60 },  // Typical NECO OBJ is 60 Qs
    paper2: { timeMin: 150, marks: 100, format: '13 essay questions; answer 10' },
    subjectOverrides: {
      eng: {  // NECO English: OBJ is 80 Qs in 1hr, Essay is separate, Oral is 60 MCQ
        paper1: { qCount: 80, timeMin: 60, marks: 40, format: '80 multiple-choice on Lexis, Structure, Oral forms' },
        paper2: { qCount: 0, timeMin: 120, marks: 100, format: 'Essay (choose 1 of 5 topics) + Comprehension + Summary' },
        paper3: { qCount: 60, timeMin: 45, marks: 30, format: 'Test of Orals (60 MCQ)' }
      },
      mth: { paper1: { qCount: 50, timeMin: 90, marks: 50 } }, // NECO Maths OBJ = 50 Qs like WAEC
    },
    styleNotes: [
      'Questions are Nigeria-focused — examples use Nigerian places, names, naira amounts, local context more than WAEC.',
      'ALL objective questions have FIVE options A, B, C, D, E — never four. This is critical.',
      'NECO questions may include slightly more contemporary/local topical references.',
      'Theory questions often more direct/structured than WAEC equivalents.',
      'Chief Examiner tone is Nigerian federal — strict on terminology from NERDC-aligned textbooks.',
    ]
  },

  jamb: {
    key: 'jamb',
    short: 'JAMB',
    full: 'JAMB / UTME',
    longName: 'Unified Tertiary Matriculation Examination',
    body: 'Joint Admissions and Matriculation Board',
    mainLine: 'Unified Tertiary Matriculation Examination',
    level: 'senior',
    color: '#dc2626',
    options: ['A','B','C','D'],     // 4 options
    numOptions: 4,
    hasTheory: false,                // JAMB IS 100% CBT OBJECTIVE — NO THEORY PAPER
    hasOral: false,
    hasPractical: false,
    paper1: { qCount: 40, timeMin: 30, marks: 40 },  // Per subject; English is different
    subjectOverrides: {
      eng: { paper1: { qCount: 60, timeMin: 45, marks: 60, format: 'Use of English — 60 MCQ incl. comprehension' } }
    },
    styleNotes: [
      'Pure CBT (Computer-Based Test). NO theory, NO essay, NO practical — objective ONLY.',
      'Questions test problem-solving and application rather than recall.',
      '180 questions total in 2 hours: English 60 + three subjects at 40 each.',
      'Time pressure is intense — roughly 40 seconds per question. Questions must be answerable quickly.',
      'Reading comprehension passages in Use of English are short (200-350 words) with 4-5 questions each.',
      'Mathematics questions favour calculation-light, concept-heavy items suitable for screen display.',
      'Always use Nigerian context — JAMB is Nigeria-only.',
      'Tone is standardised CBT — no hand-written marks, no part (a)(b)(c) structure anywhere.',
    ]
  },

  bece: {
    key: 'bece',
    short: 'BECE',
    full: 'BECE / Junior WAEC',
    longName: 'Basic Education Certificate Examination',
    body: 'National Examinations Council (and State Boards)',
    mainLine: 'Junior Secondary Certificate Examination',
    level: 'junior',
    color: '#7c3aed',
    options: ['A','B','C','D','E'],   // NECO-BECE uses 5 options
    numOptions: 5,
    hasTheory: true,                 // BECE has both objective + theory per subject
    hasOral: false,
    hasPractical: false,
    paper1: { qCount: 60, timeMin: 60, marks: 60 },
    paper2: { timeMin: 90, marks: 40, format: 'Theory — short-answer and structured questions' },
    subjectOverrides: {
      mth: { paper1: { qCount: 50, timeMin: 60, marks: 50 } }
    },
    styleNotes: [
      'This is JSS3 (Junior Secondary) level — ages 13-15. Keep vocabulary and cognitive demand age-appropriate.',
      'Content follows the NERDC Basic Education Curriculum (JSS 1-3).',
      'NECO-BECE objective questions have 5 options (A-E); some state boards use 4 options A-D.',
      'Subject groupings follow NERDC: BST (Basic Science & Technology), NVE (National Values), PVS (Pre-Vocational Studies), CCA (Cultural & Creative Arts).',
      'Examples use Nigerian daily life relatable to a 14-year-old (school, market, family, sport).',
      'Theory answers are short — one or two sentences or a small calculation, not SSCE-length essays.',
    ]
  },

  ce: {
    key: 'ce',
    short: 'NCEE',
    full: 'Common Entrance (NCEE)',
    longName: 'National Common Entrance Examination',
    body: 'National Examinations Council',
    mainLine: 'Primary-to-Secondary Entrance (Federal Unity Colleges)',
    level: 'primary',
    color: '#ea580c',
    options: ['A','B','C','D','E'],    // NCEE uses 5 options
    numOptions: 5,
    hasTheory: false,                  // NCEE is multiple-choice only
    hasOral: false,
    hasPractical: false,
    paper1: { qCount: 50, timeMin: 65, marks: 50 },
    styleNotes: [
      'This is Primary 6 level — ages 10-11. Language must be simple and clear.',
      'For admission into Federal Unity Colleges (Kings College, Queens College, FGCs).',
      'All questions are multiple-choice with 5 options (A-E), shaded on an OMR sheet.',
      'NCEE papers: Paper I Achievement (Maths+BST, English+National Values) and Paper II Aptitude (Quantitative & Vocational, Verbal).',
      'Quantitative Aptitude uses number patterns, simple codes, and picture-based reasoning.',
      'Verbal Aptitude tests vocabulary, sentence completion, word relationships.',
      'Keep numbers small and contexts familiar to a 10-year-old (school, home, playground, market).',
      'NO trick questions — straightforward, curriculum-aligned, age-appropriate.',
    ]
  }
};

// Legacy helper used throughout the engine — returns the active board's config
function getBoardCfg(boardKey){
  return BOARD_CONFIG[boardKey] || BOARD_CONFIG.waec;
}

// Get effective paper spec for a subject, merging overrides
function getPaperSpec(boardKey, subjKey, paperNum){
  var cfg = getBoardCfg(boardKey);
  var base = paperNum === 2 ? cfg.paper2 : (paperNum === 3 ? cfg.paper3 : cfg.paper1);
  var override = cfg.subjectOverrides && cfg.subjectOverrides[subjKey];
  if (override){
    var overrideKey = paperNum === 2 ? 'paper2' : (paperNum === 3 ? 'paper3' : 'paper1');
    if (override[overrideKey]){
      return Object.assign({}, base || {}, override[overrideKey]);
    }
  }
  return base || {};
}

// Format a human-friendly "X questions · Y min" tag for paper cards
function formatPaperTag(boardKey, subjKey, paperNum){
  var spec = getPaperSpec(boardKey, subjKey, paperNum);
  var parts = [];
  if (spec.qCount) parts.push(spec.qCount + ' questions');
  else if (spec.format) parts.push(spec.format.length > 40 ? 'Structured' : spec.format);
  if (spec.timeMin){
    var t = spec.timeMin >= 60 ? (Math.floor(spec.timeMin/60) + 'hr' + (spec.timeMin%60 ? ' ' + (spec.timeMin%60) + 'min' : '')) : (spec.timeMin + ' min');
    parts.push(t);
  }
  if (spec.marks) parts.push(spec.marks + ' marks');
  return parts.join(' · ');
}

// ── Step navigation ──────────────────────────────────────
function ecInit(){
  // Stop any running timer
  if(examSession && examSession.timer){ clearInterval(examSession.timer); }
  examSession=null;
  // Reset state
  currentExamSubj=''; currentExamSubjName=''; currentExamYear=0;
  window._waecPaper=null;
  // Reset UI chips
  var sc=document.getElementById('examScoreChip'); if(sc){sc.style.display='none';sc.textContent='';}
  var tc=document.getElementById('examTimer'); if(tc){tc.style.display='none';tc.textContent='';tc.style.color='#fbbf24';tc.classList.remove('urgent');}
  var top=document.getElementById('ecTopTitle'); if(top) top.textContent='Exam Centre';
  var bc=document.getElementById('ecBreadcrumb'); if(bc) bc.style.display='none';
  // Show step 0
  ecGoStep(0);
}

function ecGoStep(n){
  for(var i=0;i<=3;i++){
    var el=document.getElementById('ecStep'+i);
    if(el) el.style.display=(i===n?'block':'none');
  }
  var bc=document.getElementById('ecBreadcrumb');
  if(bc) bc.style.display=n>0?'flex':'none';
  ['s2','s3'].forEach(function(s,idx){
    var els=document.querySelectorAll('.ec-bc-'+s);
    els.forEach(function(el){el.style.display=n>=(idx+2)?'inline':'none';});
  });
  var body=document.getElementById('ecBody');
  if(body){
    body.scrollTop=0;
    // Exam room: remove padding so question fills space
    body.style.padding = n===3 ? '0' : '28px 24px';
  }
}

// Subject colour map
window._subjColors={
  eng:{g:'linear-gradient(135deg,#3b82f6,#1d4ed8)',c:'#93c5fd',tag:'English'},
  mth:{g:'linear-gradient(135deg,#8b5cf6,#6d28d9)',c:'#c4b5fd',tag:'Mathematics'},
  bio:{g:'linear-gradient(135deg,#10b981,#047857)',c:'#6ee7b7',tag:'Biology'},
  chm:{g:'linear-gradient(135deg,#f59e0b,#d97706)',c:'#fde68a',tag:'Chemistry'},
  phy:{g:'linear-gradient(135deg,#06b6d4,#0891b2)',c:'#a5f3fc',tag:'Physics'},
  geo:{g:'linear-gradient(135deg,#22c55e,#16a34a)',c:'#86efac',tag:'Geography'},
  gov:{g:'linear-gradient(135deg,#ef4444,#dc2626)',c:'#fca5a5',tag:'Government'},
  eco:{g:'linear-gradient(135deg,#f97316,#ea580c)',c:'#fed7aa',tag:'Economics'},
  lit:{g:'linear-gradient(135deg,#ec4899,#db2777)',c:'#f9a8d4',tag:'Literature'},
  acc:{g:'linear-gradient(135deg,#14b8a6,#0d9488)',c:'#99f6e4',tag:'Accounting'},
  agr:{g:'linear-gradient(135deg,#84cc16,#65a30d)',c:'#d9f99d',tag:'Agriculture'},
  cmp:{g:'linear-gradient(135deg,#6366f1,#4f46e5)',c:'#c7d2fe',tag:'Computer'},
  his:{g:'linear-gradient(135deg,#a78bfa,#7c3aed)',c:'#ddd6fe',tag:'History'},
  crs:{g:'linear-gradient(135deg,#fbbf24,#d97706)',c:'#fef08a',tag:'CRS/IRS'},
  fmth:{g:'linear-gradient(135deg,#7c3aed,#5b21b6)',c:'#ede9fe',tag:'Further Maths'},
  com:{g:'linear-gradient(135deg,#0ea5e9,#0284c7)',c:'#bae6fd',tag:'Commerce'},
  fne:{g:'linear-gradient(135deg,#f43f5e,#e11d48)',c:'#fecdd3',tag:'Fine Art'},
  mus:{g:'linear-gradient(135deg,#d946ef,#a21caf)',c:'#f0abfc',tag:'Music'}
};

function ecPickBoard(board){
  currentExam=board;
  var cfg=getBoardCfg(board);
  var lbl=cfg.full;
  var bc=document.getElementById('ecBcExam'); if(bc) bc.textContent=lbl;
  var t=document.getElementById('ecStep1Title'); if(t) t.textContent=lbl;
  var sub=document.getElementById('ecStep1Sub'); if(sub) sub.textContent='Choose a subject — '+lbl;
  var top=document.getElementById('ecTopTitle'); if(top) top.textContent=lbl;
  var grid=document.getElementById('ecSubjGrid'); if(!grid) return;
  var subjs=EXAM_SUBJECTS[board]||[];
  window._ecSubjMap={};
  subjs.forEach(function(s){window._ecSubjMap[s.k]=s.n;});
  window._ecAllSubjs=subjs; // save for filter
  ecRenderSubjGrid(subjs);
  var search=document.getElementById('ecSubjSearch'); if(search) search.value='';
  ecGoStep(1);
}
function ecRenderSubjGrid(subjs){
  var grid=document.getElementById('ecSubjGrid'); if(!grid) return;
  grid.innerHTML=subjs.map(function(s){
    var col=(window._subjColors&&window._subjColors[s.k])||{g:'linear-gradient(135deg,#3b82f6,#1d4ed8)',c:'#93c5fd',tag:'Subject'};
    return '<button class="ec-subj-btn" data-k="'+s.k+'" data-name="'+s.n.replace(/"/g,'&quot;')+'" onclick="ecPickSubject(this.dataset.k,this.dataset.name)">'
      +'<div class="ec-subj-top" style="background:'+col.g+'">'
        +'<span class="ec-subj-ico">'+s.i+'</span>'
        +'<span class="ec-subj-arrow">→</span>'
      +'</div>'
      +'<div class="ec-subj-body">'
        +'<div class="ec-subj-name">'+s.n+'</div>'
        +'<div class="ec-subj-tag" style="color:'+col.c+'">'+col.tag+'</div>'
      +'</div>'
      +'</button>';
  }).join('');
}
function ecFilterSubjects(query){
  if(!window._ecAllSubjs) return;
  var q=query.toLowerCase().trim();
  var filtered=q?window._ecAllSubjs.filter(function(s){
    return s.n.toLowerCase().includes(q)||(window._subjColors[s.k]&&window._subjColors[s.k].tag.toLowerCase().includes(q));
  }):window._ecAllSubjs;
  ecRenderSubjGrid(filtered);
}

function ecPickSubject(key,name){
  currentExamSubj=key; currentExamSubjName=name;
  var bc=document.getElementById('ecBcSubj'); if(bc) bc.textContent=name;
  var cfg=getBoardCfg(currentExam);
  var examClr=cfg.color;
  var eLabel=cfg.short;
  var yrs=PAST_YEARS[currentExam]||[];
  var t2=document.getElementById('ecStep2Title'); if(t2) t2.textContent=name+' — '+eLabel;
  var sub=document.getElementById('ecStep2Sub'); if(sub) sub.textContent='Select a paper type to begin';
  // Build paper cards
  var grid=document.getElementById('ecPaperGrid'); if(!grid) return;

  // Board-specific paper layout
  var papers = [];
  var p1Spec = getPaperSpec(currentExam, key, 1);
  var p1Tag = formatPaperTag(currentExam, key, 1) || (cfg.paper1.qCount + ' questions');
  var p1Format = p1Spec.format || (cfg.options.length === 5 ? 'Multiple-choice (A–E)' : 'Multiple-choice (A–D)');

  papers.push({
    id:'p1', ico:'📝', name:'Paper 1', sub:'Objective ('+cfg.options.length+' options)',
    tag: p1Tag,
    desc: p1Format + ' — real '+eLabel+' format with '+cfg.options.length+' options ('+cfg.options.join(', ')+'). Auto-marked, correct answer shown after each.',
    clr:'p1', action:"ecStartPaper(1)"
  });

  // Theory paper — ONLY for boards that actually have theory
  if (cfg.hasTheory){
    var p2Spec = getPaperSpec(currentExam, key, 2);
    var p2Tag = formatPaperTag(currentExam, key, 2) || 'Structured answers · 2hr 30min';
    var p2Format = p2Spec.format || 'Theory / Essay questions';
    papers.push({
      id:'p2', ico:'✍️', name:'Paper 2', sub:'Theory / Essay',
      tag: p2Tag,
      desc: p2Format + ' — real '+eLabel+' essay and theory items. AI marks to Chief Examiner standard using official '+eLabel+' criteria.',
      clr:'p2', action:"ecStartPaper(2)"
    });
  }

  // Mock exam description adapts to board
  var mockDesc;
  if (cfg.hasTheory) {
    mockDesc = 'Full '+eLabel+' simulation. Timed. Both objective and theory. Score report with '+eLabel+' grade at the end.';
  } else if (cfg.key === 'jamb') {
    mockDesc = 'Full JAMB UTME simulation — pure CBT objective (no theory). Timed like the real exam. UTME-style score report at the end.';
  } else {
    mockDesc = 'Full '+eLabel+' simulation — multiple-choice only (as per official format). Timed. Score report at the end.';
  }
  papers.push({
    id:'mock', ico:'🏆', name:'Full Mock', sub:'Complete Exam',
    tag: cfg.hasTheory ? 'Papers 1+2 · Timed' : 'Full paper · Timed',
    desc: mockDesc, clr:'mock', action:"ecStartPaper(0)"
  });

  papers.push({
    id:'prac', ico:'🎯', name:'Practice', sub:'Learn Mode',
    tag:'25 questions · Explanations',
    desc:'Practise at your own pace. Full explanation after each answer. Uses real '+eLabel+' format with '+cfg.options.length+' options per question.',
    clr:'prac', action:"ecStartPaper(3)"
  });
  grid.innerHTML=papers.map(function(p){
    return '<button class="ec-paper-card ec-paper-'+p.clr+'" onclick="'+p.action+'">'
      +'<div class="ec-paper-top">'
        +'<div class="ec-paper-ico">'+p.ico+'</div>'
        +'<div class="ec-paper-info">'
          +'<div class="ec-paper-name">'+p.name+'</div>'
          +'<div class="ec-paper-sub" style="font-size:.78rem;font-weight:700;color:rgba(255,255,255,.55);margin-top:1px">'+p.sub+'</div>'
          +'<div class="ec-paper-tag">'+p.tag+'</div>'
        +'</div>'
      +'</div>'
      +'<div class="ec-paper-desc">'+p.desc+'</div>'
      +'<div class="ec-paper-go">Start '+p.name+' →</div>'
      +'</button>';
  }).join('');
  // Build year buttons
  var yRow=document.getElementById('ecYearBtns'); if(yRow){
    yRow.innerHTML='<button class="ec-yr-btn on" onclick="ecSetYear(0,this)">Any Year</button>'
      +yrs.map(function(y){return'<button class="ec-yr-btn" onclick="ecSetYear('+y+',this)">'+y+'</button>';}).join('');
  }
  ecGoStep(2);
}

function ecSetYear(yr,btn){
  currentExamYear=yr;
  document.querySelectorAll('.ec-yr-btn').forEach(function(b){b.classList.remove('on');});
  if(btn) btn.classList.add('on');
}

function ecStartPaper(paper){
  var bc=document.getElementById('ecBcPaper');
  var exam=currentExam.toUpperCase();
  var subj=currentExamSubjName;
  var labels={0:'Full Mock — '+exam,1:'Paper 1 — Objective',2:'Paper 2 — Theory / Essay',3:'Practice Mode'};
  if(bc) bc.textContent=labels[paper]||'Exam';
  var top=document.getElementById('ecTopTitle');
  if(top) top.textContent=exam+' · '+subj;

  // Paper 2 = go straight to essay engine
  if(paper===2){
    window._essayExamContext={exam:currentExam,subj:subj,key:currentExamSubj};
    goTo('pg-essay');
    setTimeout(function(){openEssaySection(true);__injectLogos();},80);
    return;
  }

  // Full Mock (paper=0) = Paper 1 first, then Paper 2 after
  // Set a flag so renderExamResults knows to offer Paper 2 next
  window._isMockExam = (paper===0);
  window._waecPaper = paper===0 ? 1 : paper; // mock starts with obj
  window._examNumQ = paper===3 ? 25 : 50;
  currentExamMode = currentExamYear?'year':'mixed';

  ecGoStep(3);
  var body=document.getElementById('ecBody');
  if(body) body.scrollTop=0;
  window.scrollTo(0,0);
  startExamSession();
}

// Keep legacy functions for any old onclick refs
function selectExam(exam,el){currentExam=exam;ecPickBoard(exam);}
function buildExamSubjects(exam){}
function showExamSubjectPicker(){ecInit();}
function selectExamSubject(key,name,el){ecPickSubject(key,name);}
function showExamModeChoice(){} // handled by ecPickSubject
function setExamYear(yr,btn){ecSetYear(yr,btn);}
function startObjectiveExam(n){window._examNumQ=n||50;window._waecPaper=1;currentExamMode=currentExamYear?'year':'mixed';startExamSession();}
function startWAECPaper(paper){ecStartPaper(paper);}
function quickStartPaper(paper){if(!currentExamSubj){var s=EXAM_SUBJECTS[currentExam];if(s&&s.length){currentExamSubj=s[0].k;currentExamSubjName=s[0].n;}}ecStartPaper(paper);}
function openEssayExamMode(){window._essayExamContext={exam:currentExam,subj:currentExamSubjName||currentExamSubj,key:currentExamSubj};goTo('pg-essay');setTimeout(function(){openEssaySection(true);__injectLogos();},80);}
function selectMode(m,el){currentExamMode=m;}
// ════════════════════ PAGE NAVIGATION ════════════════════
function goTo(id){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  var el=document.getElementById(id);
  if(!el){console.warn('goTo: no element',id);return;}
  el.classList.add('active');
  window.scrollTo(0,0);
  closeSidebar();
  if(id==='pg-languages' && typeof updateLangTopbar==='function') updateLangTopbar();
  if(id==='pg-exam' && typeof ecInit==='function') ecInit();
}

// ════════════════════ SIDEBAR OPEN/CLOSE ════════════════════
function openSidebar(){
  document.getElementById('sidebar').classList.add('mob-open');
  document.getElementById('sbOverlay').classList.add('show');
  document.body.style.overflow='hidden';
}
function closeSidebar(){
  document.getElementById('sidebar')?.classList.remove('mob-open');
  document.getElementById('sbOverlay')?.classList.remove('show');
  document.getElementById('kSidebar')?.classList.remove('mob-open');
  document.body.style.overflow='';
}

// ════════════════════ BETA ENTRY — CLASS SELECTION ════════════════════
let chosenSection='sss', chosenClass='SS2', studentName='Student', chosenStream='science';

const classMaps = {
  kids:    [{label:'Ages 4–6',val:'early',ico:'🌱'},{label:'Ages 7–10',val:'upper',ico:'🌿'}],
  primary: [{label:'Primary 1',val:'P1',ico:'1️⃣'},{label:'Primary 2',val:'P2',ico:'2️⃣'},{label:'Primary 3',val:'P3',ico:'3️⃣'},{label:'Primary 4',val:'P4',ico:'4️⃣'},{label:'Primary 5',val:'P5',ico:'5️⃣'},{label:'Primary 6',val:'P6',ico:'6️⃣'}],
  jss:     [{label:'JSS 1',val:'JSS1',ico:'🏫'},{label:'JSS 2',val:'JSS2',ico:'🏫'},{label:'JSS 3',val:'JSS3',ico:'🏫'}],
  sss:     [{label:'SS 1',val:'SS1',ico:'1️⃣'},{label:'SS 2',val:'SS2',ico:'2️⃣'},{label:'SS 3',val:'SS3',ico:'3️⃣'}],
};

// SSS Streams — 4 tracks matching real Nigerian schools
const SSS_STREAMS = [
  { key:'science',    label:'Science',          ico:'🔬', colour:'#2563eb',
    desc:'Biology · Chemistry · Physics · Further Maths',
    subjects:['bio','chm','phy','fmth','agr','cmp','dat','geo','eco']},
  { key:'arts',       label:'Arts & Humanities', ico:'🎭', colour:'#8b5cf6',
    desc:'Literature · Government · History · CRS/IRS',
    subjects:['lit','gov','eco','geo','his','crs','fre','ara','fne','mus']},
  { key:'commercial', label:'Commercial',        ico:'💼', colour:'#059669',
    desc:'Accounting · Commerce · Economics · Business',
    subjects:['acc','com','eco','biz','off','ins','cmp','geo']},
  { key:'technical',  label:'Technical / Vocational', ico:'🔧', colour:'#d97706',
    desc:'Technical Drawing · Building · Auto Mechanics',
    subjects:['tdr','bld','auto','wdw','elc','mec','agr','cmp']},
];

// Section colour palette
const SECTION_COLOURS = {
  primary:  {bg:'rgba(59,130,246,.15)',  border:'#3b82f6', text:'#93c5fd'},
  jss:      {bg:'rgba(139,92,246,.15)',  border:'#8b5cf6', text:'#c4b5fd'},
  sss:      {bg:'rgba(16,185,129,.15)',  border:'#10b981', text:'#6ee7b7'},
  kids:     {bg:'rgba(245,158,11,.15)',  border:'#f59e0b', text:'#fbbf24'},
};

// JSS optional subjects
const JSS_OPTIONAL = {
  JSS1:['cmp','agr','biz','crs','fre','yor'],
  JSS2:['cmp','agr','biz','crs','fre','yor'],
  JSS3:['cmp','agr','biz','crs','fre','yor'],
};

function showClasses(section, btn){
  document.querySelectorAll('.lvl-btn').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
  chosenSection = section;
  chosenStream  = '';

  // Hide all downstream steps
  document.getElementById('step2').style.display='none';
  document.getElementById('step3').style.display='none';
  document.getElementById('stepStream')?.remove();
  document.getElementById('stepElective')?.remove();

  if(section === 'kids'){
    chosenClass = 'early';
    return;
  }

  var col     = SECTION_COLOURS[section] || SECTION_COLOURS.primary;
  var classes = classMaps[section] || [];
  var grid    = document.getElementById('classGrid');

  grid.innerHTML = classes.map(function(cl, i){
    var isFirst  = i === 0;
    var selStyle = isFirst ? 'background:'+col.bg+';border-color:'+col.border+';color:'+col.text : '';
    return '<button class="cls-btn'+(isFirst?' sel':'')+'"'
      +' style="'+selStyle+'"'
      +' data-col-bg="'+col.bg+'" data-col-border="'+col.border+'" data-col-text="'+col.text+'"'
      +' onclick="pickClass(this,\''+cl.val+'\')">' 
      +'<span style="font-size:1.1rem;display:block;margin-bottom:3px">'+cl.ico+'</span>'
      +cl.label
      +'</button>';
  }).join('');

  // Default selection
  chosenClass = classes[0].val;

  // Advance stepper
  var s1 = document.getElementById('bsStep1');
  var s2 = document.getElementById('bsStep2');
  var s3 = document.getElementById('bsStep3');
  if(s1) s1.className = s1.className.replace('active','done');
  if(s2) s2.classList.add('active');
  if(s3) s3.classList.add('active');

  document.getElementById('step2').style.display = 'block';

  // For SSS: show stream picker before showing week
  if(section === 'sss'){
    showStreamPicker();
  } else {
    document.getElementById('step3').style.display = 'block';
    updateWeekInfo();
  }

  // For JSS: show optional subject picker
  if(section === 'jss'){
    showElectivePicker();
  }

  setTimeout(function(){
    document.getElementById('step2')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  }, 150);
}

function pickClass(btn, val){
  document.querySelectorAll('.cls-btn').forEach(function(b){
    b.classList.remove('sel');
    b.style.background=''; b.style.borderColor=''; b.style.color='';
  });
  btn.classList.add('sel');
  btn.style.background  = btn.dataset.colBg    || 'rgba(59,130,246,.2)';
  btn.style.borderColor = btn.dataset.colBorder || '#3b82f6';
  btn.style.color       = btn.dataset.colText   || '#93c5fd';
  chosenClass = val;
  chosenElectives = [];
  document.getElementById('stepElective')?.remove();

  if(chosenSection === 'sss'){
    showStreamPicker();
  } else if(chosenSection === 'jss'){
    showElectivePicker();
  }
}

// ── SSS STREAM PICKER ──────────────────────────────────────────────────
function showStreamPicker(){
  document.getElementById('stepStream')?.remove();
  document.getElementById('step3').style.display='none';

  var el = document.createElement('div');
  el.id = 'stepStream';
  el.style.cssText = 'margin-top:20px';

  var title = document.createElement('div');
  title.className = 'step-label';
  title.setAttribute('data-step','S');
  title.textContent = 'Choose your stream';
  el.appendChild(title);

  var desc = document.createElement('p');
  desc.style.cssText = 'font-size:.78rem;color:rgba(255,255,255,.45);margin:8px 0 14px;text-align:center';
  desc.textContent = 'This determines your subject combination — just like in a real Nigerian school.';
  el.appendChild(desc);

  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px';

  SSS_STREAMS.forEach(function(s){
    var btn = document.createElement('button');
    btn.className = 'stream-btn';
    btn.setAttribute('data-key', s.key);
    var streamColours = {
      science:  {bg:'rgba(37,99,235,.12)', border:'rgba(37,99,235,.4)', hover:'rgba(37,99,235,.22)'},
      arts:     {bg:'rgba(139,92,246,.12)', border:'rgba(139,92,246,.4)', hover:'rgba(139,92,246,.22)'},
      commercial:{bg:'rgba(5,150,105,.12)', border:'rgba(5,150,105,.4)', hover:'rgba(5,150,105,.22)'},
      technical: {bg:'rgba(217,119,6,.12)', border:'rgba(217,119,6,.4)', hover:'rgba(217,119,6,.22)'},
    };
    var sc = streamColours[s.key] || streamColours.science;
    btn.style.cssText = 'padding:18px 16px;border-radius:14px;border:2px solid '+sc.border+';background:'+sc.bg+';cursor:pointer;text-align:left;font-family:inherit;transition:all .22s cubic-bezier(.4,0,.2,1);';
    btn.innerHTML = '<div style="font-size:1.4rem;margin-bottom:8px">'+s.ico+'</div>'
      +'<div style="font-weight:800;color:#fff;font-size:.9rem;margin-bottom:4px">'+s.label+'</div>'
      +'<div style="font-size:.7rem;color:rgba(255,255,255,.4);line-height:1.4">'+s.desc+'</div>';
    btn.addEventListener('click', function(){ selectStream(this, s.key); });
    grid.appendChild(btn);
  });

  el.appendChild(grid);

  var step2el = document.getElementById('step2');
  if(step2el) step2el.insertAdjacentElement('afterend', el);
}

function selectStream(btn, streamKey){
  document.querySelectorAll('.stream-btn').forEach(function(b){
    b.style.borderColor = 'rgba(255,255,255,.1)';
    b.style.background  = 'rgba(255,255,255,.04)';
    b.style.boxShadow   = '';
  });
  var stream = SSS_STREAMS.find(function(s){ return s.key === streamKey; });
  if(!stream) return;
  btn.style.borderColor = stream.colour;
  btn.style.background  = stream.colour + '26';
  btn.style.boxShadow   = '0 4px 18px ' + stream.colour + '44';
  chosenStream = streamKey;
  document.getElementById('step3').style.display = 'block';
  updateWeekInfo();
  setTimeout(function(){
    document.getElementById('step3')?.scrollIntoView({behavior:'smooth', block:'nearest'});
  }, 100);
}


// ── JSS ELECTIVE PICKER ────────────────────────────────────────────────


// ── JSS ELECTIVE PICKER ────────────────────────────────────────────────
function showElectivePicker(){
  document.getElementById('stepElective')?.remove();
  var pool = JSS_OPTIONAL[chosenClass] || [];
  if(!pool.length) return;

  var names = {cmp:'Computer Studies',agr:'Agricultural Science',biz:'Business Studies',
    crs:'CRS / IRS',fre:'French',yor:'Yoruba Language',ibo:'Igbo Language',hau:'Hausa Language'};
  var icos  = {cmp:'💻',agr:'🌾',biz:'💼',crs:'🕊️',fre:'🇫🇷',yor:'🗣️',ibo:'🗣️',hau:'🗣️'};

  var el = document.createElement('div');
  el.id = 'stepElective';
  el.style.cssText = 'margin-top:18px';

  var lbl = document.createElement('div');
  lbl.className = 'step-label';
  lbl.setAttribute('data-step','➕');
  lbl.textContent = 'Optional subject (pick 1 or skip)';
  el.appendChild(lbl);

  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px';

  pool.forEach(function(k){
    var btn = document.createElement('button');
    btn.className = 'cls-btn elective-btn';
    btn.setAttribute('data-key', k);
    btn.style.cssText = 'min-width:110px;text-align:center;font-size:.78rem';
    btn.innerHTML = '<span style="display:block;font-size:1rem;margin-bottom:4px">'+(icos[k]||'📌')+'</span>'+(names[k]||k);
    btn.addEventListener('click', function(){ toggleElective(this, k); });
    btnRow.appendChild(btn);
  });

  el.appendChild(btnRow);
  var step3 = document.getElementById('step3');
  if(step3) step3.insertAdjacentElement('afterend', el);
}


function toggleElective(btn, key){
  if(btn.classList.contains('sel')){
    btn.classList.remove('sel');
    btn.style.background=''; btn.style.borderColor=''; btn.style.color='';
    chosenElectives = chosenElectives.filter(function(k){return k!==key;});
  } else {
    document.querySelectorAll('.elective-btn.sel').forEach(function(b){
      b.classList.remove('sel');
      b.style.background=''; b.style.borderColor=''; b.style.color='';
    });
    chosenElectives = [key];
    btn.classList.add('sel');
    btn.style.background='rgba(59,130,246,.22)';
    btn.style.borderColor='#3b82f6';
    btn.style.color='#93c5fd';
  }
}


function selectTerm(btn){
  document.querySelectorAll('.wp-term-btn').forEach(function(b){
    b.classList.remove('sel');
    b.style.background=''; b.style.borderColor=''; b.style.color='';
  });
  btn.classList.add('sel');
  btn.style.background   = 'rgba(59,130,246,.28)';
  btn.style.borderColor  = '#3b82f6';
  btn.style.color        = '#93c5fd';
  var sel = document.getElementById('termSel');
  if(sel){ sel.value = btn.dataset.term; }
  updateWeekInfo();
}

function selectWeek(btn){
  document.querySelectorAll('.wp-week').forEach(function(b){
    b.classList.remove('sel');
    b.style.background=''; b.style.borderColor=''; b.style.color='';
  });
  btn.classList.add('sel');
  btn.style.background   = 'rgba(59,130,246,.28)';
  btn.style.borderColor  = '#3b82f6';
  btn.style.color        = '#93c5fd';
  var sel = document.getElementById('weekSel');
  if(sel){ sel.value = btn.dataset.week; }
  updateWeekInfo();
}

function updateWeekInfo(){
  var term = document.getElementById('termSel')?.value || 'First Term';
  var week = document.getElementById('weekSel')?.value || '1';
  var info = document.getElementById('weekInfo');
  if(info){
    info.innerHTML = 'Starting at <strong style="color:#93c5fd">'
      + term + ' · Week ' + week
      + '</strong> — right where your school is now. ✅';
  }
}

// Auto-select defaults on page load
document.addEventListener('DOMContentLoaded', function(){
  if(typeof initProgress === "function") initProgress();

  var firstTerm = document.querySelector('.wp-term-btn');
  if(firstTerm) selectTerm(firstTerm);
  var firstWeek = document.querySelector('[data-week="1"]');
  if(firstWeek) selectWeek(firstWeek);
  document.getElementById('termSel')?.addEventListener('change', updateWeekInfo);
  document.getElementById('weekSel')?.addEventListener('change', updateWeekInfo);
});


// ── Sidebar accordion toggle ──
function toggleSbSection(section){
  var bodyMap = {subjects:'sbSubjectsBody', topics:'sbTopicsBody', exam:'sbExamBody', more:'sbMoreBody'};
  var arrowMap = {subjects:'sbSubjectsArrow', topics:'sbTopicsArrow', exam:'sbExamArrow', more:'sbMoreArrow'};
  var body  = document.getElementById(bodyMap[section]);
  var arrow = document.getElementById(arrowMap[section]);
  if(!body) return;
  var isOpen = body.style.display !== 'none' && !body.classList.contains('collapsed');
  if(isOpen){
    body.style.display = 'none';
    if(arrow) arrow.textContent = '▸';
  } else {
    body.style.display = 'block';
    if(arrow) arrow.textContent = '▾';
  }
}

// Show topics accordion when a subject is loaded
function showTopicsAccordion(subjectName){
  var acc = document.getElementById('sbTopicsAccordion');
  var title = document.getElementById('sbTopicsTitle');
  if(acc) acc.style.display = 'block';
  if(title && subjectName) title.textContent = subjectName + ' Topics';
}

function enterClassroom(){ enterCL(); }
function enterCL(){
  const nm=document.getElementById('studentName').value.trim();
  studentName=nm||'Student';

  // Validate: must have chosen a section and class
  if(!chosenSection || chosenSection === ''){
    const inp = document.getElementById('studentName');
    if(inp){ inp.focus(); inp.style.borderColor='#ef4444'; setTimeout(()=>{inp.style.borderColor='';},2000); }
    alert('Please choose your level (Kids Zone, Primary, JSS or SSS) before entering.');
    return;
  }

  if(chosenSection==='kids'){
    const kn=document.getElementById('kName'); if(kn) kn.textContent=studentName;
    goTo('pg-kids');
    kInit();
    setTimeout(()=>speakIt("Good day! I am so happy you are here today. My name is Lesson Teacher. Let us learn together, shall we?"),400);
    return;
  }

  // Get chosen term and week
  const chosenTerm = document.getElementById('termSel')?.value || 'First Term';
  const chosenWeek = parseInt(document.getElementById('weekSel')?.value||'1');

  // Set up classroom
  const sbName = document.getElementById('sbName');
  const sbAvt  = document.getElementById('sbAvt');
  const sbLvl  = document.getElementById('sbLevel');
  if(sbName) sbName.textContent = studentName;
  if(sbAvt)  sbAvt.textContent  = studentName[0].toUpperCase();
  var sLabel = chosenSection==='sss'
    ? 'SS · ' + (chosenStream ? chosenStream.charAt(0).toUpperCase()+chosenStream.slice(1) : 'Science')
    : chosenSection==='jss' ? 'Junior Secondary' : 'Primary';
  if(sbLvl) sbLvl.textContent = chosenClass + ' · ' + sLabel;
  buildSidebar(chosenSection, chosenClass);
  goTo('pg-classroom');

  // Build the welcome screen with this student's subjects + AI content
  buildWelcomeScreen(chosenSection, chosenClass, studentName, chosenTerm, chosenWeek);

  // Store for use in loadSubject
  window._startTerm = chosenTerm;
  window._startWeek = chosenWeek;

  setTimeout(()=>speakIt('Good day ' + studentName + '! Welcome. I am Lesson Teacher — your personal tutor. I know your ' + chosenClass + ' textbooks and I can see you are in ' + chosenTerm + ', Week ' + chosenWeek + '. Tap any subject on the screen and I will take you straight to the right lesson.'),500);
}

// ════════════════════ SIDEBAR BUILDER ════════════════════
// Maps section+class to subject keys
const subjectsByClass={
  P1:{subjects:[{k:'eng-p1',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-p1',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'sci-p1',i:'🔬',n:'Basic Science',c:'wsb-sci'},{k:'bst-p1',i:'🔧',n:'Basic Technology',c:'wsb-sci'},{k:'civ-p1',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'sst-p1',i:'🌍',n:'Social Studies',c:'wsb-sst'},{k:'cca-p1',i:'🎨',n:'Cultural & Creative Arts',c:'wsb-lit'},{k:'phe-p1',i:'⚽',n:'Physical & Health Education',c:'wsb-sst'},{k:'cmp-p1',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'crs-p1',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'hnd-p1',i:'✏️',n:'Handwriting / Phonics',c:'wsb-eng'},{k:'vrb-p1',i:'🧠',n:'Verbal Reasoning',c:'wsb-eng'},{k:'qtv-p1',i:'🔢',n:'Quantitative Reasoning',c:'wsb-mth'}]},
  P2:{subjects:[{k:'eng-p2',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-p2',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'sci-p2',i:'🔬',n:'Basic Science',c:'wsb-sci'},{k:'bst-p2',i:'🔧',n:'Basic Technology',c:'wsb-sci'},{k:'civ-p2',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'sst-p2',i:'🌍',n:'Social Studies',c:'wsb-sst'},{k:'cca-p2',i:'🎨',n:'Cultural & Creative Arts',c:'wsb-lit'},{k:'phe-p2',i:'⚽',n:'Physical & Health Education',c:'wsb-sst'},{k:'cmp-p2',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'crs-p2',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'vrb-p2',i:'🧠',n:'Verbal Reasoning',c:'wsb-eng'},{k:'qtv-p2',i:'🔢',n:'Quantitative Reasoning',c:'wsb-mth'}]},
  P3:{subjects:[{k:'eng-p3',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-p3',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'sci-p3',i:'🔬',n:'Basic Science',c:'wsb-sci'},{k:'bst-p3',i:'🔧',n:'Basic Technology',c:'wsb-sci'},{k:'civ-p3',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'sst-p3',i:'🌍',n:'Social Studies',c:'wsb-sst'},{k:'cca-p3',i:'🎨',n:'Cultural & Creative Arts',c:'wsb-lit'},{k:'phe-p3',i:'⚽',n:'Physical & Health Education',c:'wsb-sst'},{k:'cmp-p3',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'crs-p3',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'agr-p3',i:'🌾',n:'Agricultural Science',c:'wsb-agr'},{k:'vrb-p3',i:'🧠',n:'Verbal Reasoning',c:'wsb-eng'},{k:'qtv-p3',i:'🔢',n:'Quantitative Reasoning',c:'wsb-mth'}]},
  P4:{subjects:[{k:'eng-p4',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-p4',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'sci-p4',i:'🔬',n:'Basic Science & Technology',c:'wsb-sci'},{k:'civ-p4',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'sst-p4',i:'🌍',n:'Social Studies',c:'wsb-sst'},{k:'cca-p4',i:'🎨',n:'Cultural & Creative Arts',c:'wsb-lit'},{k:'phe-p4',i:'⚽',n:'Physical & Health Education',c:'wsb-sst'},{k:'cmp-p4',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'crs-p4',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'agr-p4',i:'🌾',n:'Agricultural Science',c:'wsb-agr'},{k:'hec-p4',i:'🏠',n:'Home Economics',c:'wsb-biz'},{k:'sec-p4',i:'🛡️',n:'Security Education',c:'wsb-sst'},{k:'vrb-p4',i:'🧠',n:'Verbal Reasoning',c:'wsb-eng'},{k:'qtv-p4',i:'🔢',n:'Quantitative Reasoning',c:'wsb-mth'}]},
  P5:{subjects:[{k:'eng-p5',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-p5',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'sci-p5',i:'🔬',n:'Basic Science & Technology',c:'wsb-sci'},{k:'civ-p5',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'sst-p5',i:'🌍',n:'Social Studies',c:'wsb-sst'},{k:'cca-p5',i:'🎨',n:'Cultural & Creative Arts',c:'wsb-lit'},{k:'phe-p5',i:'⚽',n:'Physical & Health Education',c:'wsb-sst'},{k:'cmp-p5',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'crs-p5',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'agr-p5',i:'🌾',n:'Agricultural Science',c:'wsb-agr'},{k:'hec-p5',i:'🏠',n:'Home Economics',c:'wsb-biz'},{k:'sec-p5',i:'🛡️',n:'Security Education',c:'wsb-sst'},{k:'vrb-p5',i:'🧠',n:'Verbal Reasoning',c:'wsb-eng'},{k:'qtv-p5',i:'🔢',n:'Quantitative Reasoning',c:'wsb-mth'}]},
  P6:{subjects:[{k:'eng-p6',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-p6',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'sci-p6',i:'🔬',n:'Basic Science & Technology',c:'wsb-sci'},{k:'civ-p6',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'sst-p6',i:'🌍',n:'Social Studies',c:'wsb-sst'},{k:'cca-p6',i:'🎨',n:'Cultural & Creative Arts',c:'wsb-lit'},{k:'phe-p6',i:'⚽',n:'Physical & Health Education',c:'wsb-sst'},{k:'cmp-p6',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'crs-p6',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'agr-p6',i:'🌾',n:'Agricultural Science',c:'wsb-agr'},{k:'hec-p6',i:'🏠',n:'Home Economics',c:'wsb-biz'},{k:'sec-p6',i:'🛡️',n:'Security Education',c:'wsb-sst'},{k:'vrb-p6',i:'🧠',n:'Verbal Reasoning',c:'wsb-eng'},{k:'qtv-p6',i:'🔢',n:'Quantitative Reasoning',c:'wsb-mth'}]},
  JSS1:{subjects:[{k:'eng-j1',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-j1',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'sci-j1',i:'🔬',n:'Basic Science',c:'wsb-sci'},{k:'bst-j1',i:'🔧',n:'Basic Technology',c:'wsb-sci'},{k:'sst-j1',i:'🌍',n:'Social Studies',c:'wsb-sst'},{k:'civ-j1',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'cca-j1',i:'🎨',n:'Cultural & Creative Arts',c:'wsb-lit'},{k:'phe-j1',i:'⚽',n:'Physical & Health Education',c:'wsb-sst'},{k:'cmp-j1',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'crs-j1',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'agr-j1',i:'🌾',n:'Agricultural Science',c:'wsb-agr'},{k:'hec-j1',i:'🏠',n:'Home Economics',c:'wsb-biz'},{k:'biz-j1',i:'💼',n:'Business Studies',c:'wsb-biz'},{k:'yor-j1',i:'🗣️',n:'Yoruba Language',c:'wsb-eng'},{k:'fre-j1',i:'🇫🇷',n:'French',c:'wsb-lit'}]},
  JSS2:{subjects:[{k:'eng-j2',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-j2',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'sci-j2',i:'🔬',n:'Basic Science',c:'wsb-sci'},{k:'bst-j2',i:'🔧',n:'Basic Technology',c:'wsb-sci'},{k:'sst-j2',i:'🌍',n:'Social Studies',c:'wsb-sst'},{k:'civ-j2',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'cca-j2',i:'🎨',n:'Cultural & Creative Arts',c:'wsb-lit'},{k:'phe-j2',i:'⚽',n:'Physical & Health Education',c:'wsb-sst'},{k:'cmp-j2',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'crs-j2',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'agr-j2',i:'🌾',n:'Agricultural Science',c:'wsb-agr'},{k:'hec-j2',i:'🏠',n:'Home Economics',c:'wsb-biz'},{k:'biz-j2',i:'💼',n:'Business Studies',c:'wsb-biz'},{k:'yor-j2',i:'🗣️',n:'Yoruba Language',c:'wsb-eng'},{k:'fre-j2',i:'🇫🇷',n:'French',c:'wsb-lit'}]},
  JSS3:{subjects:[{k:'eng-j3',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-j3',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'sci-j3',i:'🔬',n:'Basic Science',c:'wsb-sci'},{k:'bst-j3',i:'🔧',n:'Basic Technology',c:'wsb-sci'},{k:'sst-j3',i:'🌍',n:'Social Studies',c:'wsb-sst'},{k:'civ-j3',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'cca-j3',i:'🎨',n:'Cultural & Creative Arts',c:'wsb-lit'},{k:'phe-j3',i:'⚽',n:'Physical & Health Education',c:'wsb-sst'},{k:'cmp-j3',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'crs-j3',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'agr-j3',i:'🌾',n:'Agricultural Science',c:'wsb-agr'},{k:'hec-j3',i:'🏠',n:'Home Economics',c:'wsb-biz'},{k:'biz-j3',i:'💼',n:'Business Studies',c:'wsb-biz'},{k:'yor-j3',i:'🗣️',n:'Yoruba Language',c:'wsb-eng'},{k:'fre-j3',i:'🇫🇷',n:'French',c:'wsb-lit'}]},
  SS1:{subjects:[{k:'eng-s1',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-s1',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'civ-s1',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'bio-s1',i:'🔬',n:'Biology',c:'wsb-bio'},{k:'chm-s1',i:'⚗️',n:'Chemistry',c:'wsb-chm'},{k:'phy-s1',i:'⚡',n:'Physics',c:'wsb-phy'},{k:'fmth-s1',i:'∑',n:'Further Mathematics',c:'wsb-mth'},{k:'agr-s1',i:'🌾',n:'Agricultural Science',c:'wsb-agr'},{k:'cmp-s1',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'dat-s1',i:'📊',n:'Data Processing',c:'wsb-cmp'},{k:'eco-s1',i:'💰',n:'Economics',c:'wsb-eco'},{k:'geo-s1',i:'🌍',n:'Geography',c:'wsb-geo'},{k:'lit-s1',i:'📚',n:'Literature in English',c:'wsb-lit'},{k:'gov-s1',i:'🏛️',n:'Government',c:'wsb-gov'},{k:'his-s1',i:'📜',n:'History',c:'wsb-gov'},{k:'crs-s1',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'acc-s1',i:'📊',n:'Financial Accounting',c:'wsb-acc'},{k:'com-s1',i:'🏪',n:'Commerce',c:'wsb-biz'},{k:'ins-s1',i:'🛡️',n:'Insurance',c:'wsb-biz'},{k:'fre-s1',i:'🇫🇷',n:'French',c:'wsb-lit'},{k:'ara-s1',i:'🕌',n:'Arabic',c:'wsb-crs'},{k:'fne-s1',i:'🎨',n:'Fine Arts',c:'wsb-lit'},{k:'mus-s1',i:'🎵',n:'Music',c:'wsb-lit'}]},
  SS2:{subjects:[{k:'eng-s2',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-s2',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'civ-s2',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'bio-s2',i:'🔬',n:'Biology',c:'wsb-bio'},{k:'chm-s2',i:'⚗️',n:'Chemistry',c:'wsb-chm'},{k:'phy-s2',i:'⚡',n:'Physics',c:'wsb-phy'},{k:'fmth-s2',i:'∑',n:'Further Mathematics',c:'wsb-mth'},{k:'agr-s2',i:'🌾',n:'Agricultural Science',c:'wsb-agr'},{k:'cmp-s2',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'dat-s2',i:'📊',n:'Data Processing',c:'wsb-cmp'},{k:'eco-s2',i:'💰',n:'Economics',c:'wsb-eco'},{k:'geo-s2',i:'🌍',n:'Geography',c:'wsb-geo'},{k:'lit-s2',i:'📚',n:'Literature in English',c:'wsb-lit'},{k:'gov-s2',i:'🏛️',n:'Government',c:'wsb-gov'},{k:'his-s2',i:'📜',n:'History',c:'wsb-gov'},{k:'crs-s2',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'acc-s2',i:'📊',n:'Financial Accounting',c:'wsb-acc'},{k:'com-s2',i:'🏪',n:'Commerce',c:'wsb-biz'},{k:'ins-s2',i:'🛡️',n:'Insurance',c:'wsb-biz'},{k:'fre-s2',i:'🇫🇷',n:'French',c:'wsb-lit'},{k:'ara-s2',i:'🕌',n:'Arabic',c:'wsb-crs'},{k:'fne-s2',i:'🎨',n:'Fine Arts',c:'wsb-lit'},{k:'mus-s2',i:'🎵',n:'Music',c:'wsb-lit'}]},
  SS3:{subjects:[{k:'eng-s3',i:'📖',n:'English Language',c:'wsb-eng'},{k:'mth-s3',i:'🧮',n:'Mathematics',c:'wsb-mth'},{k:'civ-s3',i:'⚖️',n:'Civic Education',c:'wsb-sst'},{k:'bio-s3',i:'🔬',n:'Biology',c:'wsb-bio'},{k:'chm-s3',i:'⚗️',n:'Chemistry',c:'wsb-chm'},{k:'phy-s3',i:'⚡',n:'Physics',c:'wsb-phy'},{k:'fmth-s3',i:'∑',n:'Further Mathematics',c:'wsb-mth'},{k:'agr-s3',i:'🌾',n:'Agricultural Science',c:'wsb-agr'},{k:'cmp-s3',i:'💻',n:'Computer Studies',c:'wsb-cmp'},{k:'dat-s3',i:'📊',n:'Data Processing',c:'wsb-cmp'},{k:'eco-s3',i:'💰',n:'Economics',c:'wsb-eco'},{k:'geo-s3',i:'🌍',n:'Geography',c:'wsb-geo'},{k:'lit-s3',i:'📚',n:'Literature in English',c:'wsb-lit'},{k:'gov-s3',i:'🏛️',n:'Government',c:'wsb-gov'},{k:'his-s3',i:'📜',n:'History',c:'wsb-gov'},{k:'crs-s3',i:'🕊️',n:'CRS / IRS',c:'wsb-crs'},{k:'acc-s3',i:'📊',n:'Financial Accounting',c:'wsb-acc'},{k:'com-s3',i:'🏪',n:'Commerce',c:'wsb-biz'},{k:'ins-s3',i:'🛡️',n:'Insurance',c:'wsb-biz'},{k:'fre-s3',i:'🇫🇷',n:'French',c:'wsb-lit'},{k:'ara-s3',i:'🕌',n:'Arabic',c:'wsb-crs'},{k:'fne-s3',i:'🎨',n:'Fine Arts',c:'wsb-lit'},{k:'mus-s3',i:'🎵',n:'Music',c:'wsb-lit'}]}
};

function makeSbItem(s){
  // Extract subject prefix for CSS colouring e.g. 'eng' from 'eng-p1'
  var prefix = s.k.split('-')[0];
  return '<div class="sb-item" data-subj="'+prefix+'" onclick="loadSubjectAndClose(\'' + s.k + '\',this)">'
    + '<span class="si">' + s.i + '</span>'
    + '<span style="flex:1;font-weight:500">' + s.n + '</span>'
    + '</div>';
}

// Only show subjects that actually have syllabus data (prevents "empty" subject pages).
// SYLLABUS is the single source of truth for what content exists.
function hasSyllabusData(subjectKey){
  return !!(typeof SYLLABUS !== 'undefined' && SYLLABUS[subjectKey] && SYLLABUS[subjectKey].terms && Object.keys(SYLLABUS[subjectKey].terms).length > 0);
}
function filterToAvailableSubjects(list){
  return (list || []).filter(function(s){ return hasSyllabusData(s.k); });
}

function buildSidebar(section, cls){
  var lookupCls = cls;
  // For SSS, use stream if available
  if(section === 'sss' && chosenStream && chosenStream !== 'science'){
    lookupCls = cls + '-' + chosenStream; // e.g. SS1-arts, SS2-commercial
  }

  var data = subjectsByClass[lookupCls] || subjectsByClass[cls] || {subjects:[]};
  var el = document.getElementById('sbSubjects');
  if(!el) return;

  // Group subjects for SSS
  if(section === 'sss'){
    var coreKeys = ['eng','mth','civ'];
    var core     = data.subjects.filter(function(s){return coreKeys.some(function(k){return s.k.startsWith(k+'-');});});
    var others   = data.subjects.filter(function(s){return !coreKeys.some(function(k){return s.k.startsWith(k+'-');});});
    var streamData = SSS_STREAMS.find(function(s){return s.key === chosenStream;}) || SSS_STREAMS[0];
    var html = '';
    if(core.length){
      html += '<div class="term-hdr">Core (All Students)</div>';
      html += core.map(makeSbItem).join('');
    }
    if(others.length){
      html += '<div class="term-hdr">'+streamData.ico+' '+streamData.label+' Subjects</div>';
      html += others.map(makeSbItem).join('');
    }
    el.innerHTML = html;
  } else if(section === 'jss'){
    // JSS: show compulsory + optional
    var html2 = '<div class="term-hdr">Compulsory Subjects</div>';
    html2 += data.subjects.slice(0,10).map(makeSbItem).join('');
    if(chosenElectives && chosenElectives.length){
      html2 += '<div class="term-hdr">Your Optional Subject</div>';
      // Find the elective in data
      chosenElectives.forEach(function(key){
        var found = data.subjects.find(function(s){return s.k.startsWith(key+'-');});
        if(found) html2 += makeSbItem(found);
      });
    }
    el.innerHTML = html2;
  } else {
    // Primary — all subjects
    el.innerHTML = data.subjects.map(makeSbItem).join('');
  }
}



// Load subject AND close sidebar on mobile
function loadSubjectAndClose(key, el){
  loadSubject(key, el);
  closeSidebar();
}

// ════════════════════ FULL SYLLABUS — PER CLASS, PER TERM, IN ORDER ════════════════════
// Topics follow exact NERDC scheme of work week order within each term
// ════════════════════ MISSING STATE VARIABLES ════════════════════

// ════════ SESSION PROGRESS TRACKING ════════
// Persists to localStorage. DB-ready: all writes go through saveProgress().
// When you add a database, replace saveProgress() body with an API call.

var _sessionProgress = {
  studentName: '',
  studentClass: '',
  stream: '',
  xp: 0,
  streak: 0,
  lastStudyDate: '',
  topicsCompleted: 0,
  topicsCompletedList: [],   // [{subj, topic, date, xp}]
  quizResults: [],           // [{subj, topic, correct, total, date}]
  examResults: [],           // [{board, subj, score, grade, date}]
  dailySessions: [],         // [{date, duration_min, topicCount}]
  _sessionStart: Date.now(),
  _sessionTopics: 0,
};

function initProgress(){
  try {
    var saved = localStorage.getItem('lt_progress_v2');
    if(saved){
      var p = JSON.parse(saved);
      _sessionProgress = Object.assign(_sessionProgress, p);
      _sessionProgress._sessionStart = Date.now();
      _sessionProgress._sessionTopics = 0;
    }
  } catch(e){}
  // Sync global vars that the rest of the app uses
  xp = _sessionProgress.xp || 0;
  topicsCompleted = _sessionProgress.topicsCompleted || 0;
  streakDays = _sessionProgress.streak || 0;
  // Update streak for today
  _checkStreak();
  _renderProgressBadges();
}

function saveProgress(){
  try {
    localStorage.setItem('lt_progress_v2', JSON.stringify(_sessionProgress));
  } catch(e){}
  // TODO: when backend is ready, replace above with:
  // fetch('/api/progress', { method:'POST', headers:{'Content-Type':'application/json'},
  //   body: JSON.stringify({ student: _sessionProgress.studentName, data: _sessionProgress }) });
}

function recordTopicComplete(subjName, topicTitle, xpEarned){
  xpEarned = xpEarned || 10;
  _sessionProgress.xp += xpEarned;
  _sessionProgress.topicsCompleted += 1; if(typeof recordTopicComplete==="function") recordTopicComplete(chosenSubject||"", chosenTopic||"", 10);
  _sessionProgress._sessionTopics += 1;
  _sessionProgress.topicsCompletedList.push({
    subj: subjName, topic: topicTitle,
    date: new Date().toISOString(), xp: xpEarned
  });
  // keep last 200
  if(_sessionProgress.topicsCompletedList.length > 200)
    _sessionProgress.topicsCompletedList.splice(0, 50);
  // Sync globals
  xp = _sessionProgress.xp;
  topicsCompleted = _sessionProgress.topicsCompleted;
  _checkStreak();
  _renderProgressBadges();
  saveProgress();
  _showXpToast('+' + xpEarned + ' XP — ' + topicTitle);
}

function recordQuizResult(subjName, topicTitle, correct, total){
  var xpEarned = correct >= total ? 20 : correct > 0 ? 10 : 0;
  _sessionProgress.xp += xpEarned;
  _sessionProgress.quizResults.push({
    subj: subjName, topic: topicTitle,
    correct: correct, total: total,
    date: new Date().toISOString()
  });
  if(_sessionProgress.quizResults.length > 200)
    _sessionProgress.quizResults.splice(0, 50);
  xp = _sessionProgress.xp;
  _renderProgressBadges();
  saveProgress();
  if(xpEarned > 0) _showXpToast('+' + xpEarned + ' XP — Quiz complete!');
}

function recordExamResult(board, subjName, score, grade){
  _sessionProgress.examResults.push({
    board: board, subj: subjName,
    score: score, grade: grade,
    date: new Date().toISOString()
  });
  if(_sessionProgress.examResults.length > 100)
    _sessionProgress.examResults.splice(0, 20);
  saveProgress();
}

function updateStudentInfo(name, cls, stream){
  if(name)  _sessionProgress.studentName = name;
  if(cls)   _sessionProgress.studentClass = cls;
  if(stream)_sessionProgress.stream = stream;
  saveProgress();
}

function _checkStreak(){
  var today = new Date().toISOString().slice(0,10);
  var last  = _sessionProgress.lastStudyDate;
  if(last === today) return; // already recorded today
  var yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
  if(last === yesterday){
    _sessionProgress.streak = (_sessionProgress.streak||0) + 1;
  } else if(last && last !== today){
    _sessionProgress.streak = 1; // reset
  } else {
    _sessionProgress.streak = (_sessionProgress.streak||0) + 1;
  }
  _sessionProgress.lastStudyDate = today;
  streakDays = _sessionProgress.streak;
  // Record daily session entry
  _sessionProgress.dailySessions.push({ date: today, topicCount: 0 });
  if(_sessionProgress.dailySessions.length > 100)
    _sessionProgress.dailySessions.splice(0, 30);
  saveProgress();
}

function _renderProgressBadges(){
  // Update all XP badges on page
  var xpVal = _sessionProgress.xp || 0;
  var streakVal = _sessionProgress.streak || 0;
  var topicsVal = _sessionProgress.topicsCompleted || 0;
  ['xpBadge','xpBadge2','xpBadgeMob'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.textContent = '⚡ ' + xpVal + ' XP';
  });
  ['streakBadge','streakVal'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.textContent = streakVal + (el.id==='streakBadge' ? ' 🔥' : '');
  });
  var topEl = document.getElementById('topicsCompletedBadge');
  if(topEl) topEl.textContent = topicsVal;
}

function _showXpToast(msg){
  var existing = document.getElementById('__xpToast');
  if(existing) existing.remove();
  var t = document.createElement('div');
  t.id = '__xpToast';
  t.style.cssText = [
    'position:fixed','bottom:80px','right:20px','z-index:9999',
    'background:linear-gradient(135deg,#059669,#10b981)',
    'color:white','padding:10px 18px','border-radius:100px',
    'font-size:.82rem','font-weight:800','box-shadow:0 4px 20px rgba(16,185,129,.5)',
    'animation:slideInRight .3s ease-out','pointer-events:none',
    'font-family:var(--font-sans,sans-serif)'
  ].join(';');
  t.textContent = '⚡ ' + msg;
  document.body.appendChild(t);
  setTimeout(function(){ t.style.animation='fadeOut .4s ease-out forwards'; setTimeout(function(){ t.remove(); }, 400); }, 2200);
}

// XP toast animation
var _toastStyleEl = document.createElement('style');
_toastStyleEl.textContent = '@keyframes slideInRight{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}} @keyframes fadeOut{to{opacity:0;transform:translateY(-10px)}}';
document.head.appendChild(_toastStyleEl);

// Progress overview for guidance page
function getProgressSummary(){
  var p = _sessionProgress;
  var recentTopics = (p.topicsCompletedList||[]).slice(-5).reverse();
  var avgQuiz = 0;
  if(p.quizResults && p.quizResults.length){
    var total = p.quizResults.reduce(function(a,r){ return a + (r.correct/r.total); }, 0);
    avgQuiz = Math.round(total / p.quizResults.length * 100);
  }
  return {
    xp: p.xp||0, streak: p.streak||0,
    topicsCompleted: p.topicsCompleted||0,
    avgQuizScore: avgQuiz,
    recentTopics: recentTopics,
    quizCount: (p.quizResults||[]).length,
    examCount: (p.examResults||[]).length,
    studentClass: p.studentClass||chosenClass||'—',
    studentName: p.studentName||studentName||'Student',
  };
}
// ════════ END SESSION TRACKING ════════

let topicsCompleted = 0;
let studentTimetable = {};
let guidCurrentSection = 'overview';
let studentProfile={
  level:'standard',      // 'developing' | 'standard' | 'advanced'
  quizCorrect:0, quizTotal:0,
  topicsCompleted:0,
  struggleTopics:[], strongTopics:[]
};


// ── CAREERS DATA ──
const CAREERS_NG = {
  science: [
    {icon:'🩺', title:'Medical Doctor', demand:'Very High', salary:'₦400k–₦2M/mo',
     unis:'UI, UNILAG, OAU, ABU, UNN', cutoff:'280–300 JAMB',
     subjects:'English, Biology, Chemistry, Physics',
     jobs:'Hospitals, Clinics, NGOs, Private Practice'},
    {icon:'💊', title:'Pharmacist', demand:'Very High', salary:'₦250k–₦800k/mo',
     unis:'UI, OAU, UNILAG, UNIBEN', cutoff:'240–270 JAMB',
     subjects:'English, Biology, Chemistry, Physics/Maths',
     jobs:'Hospitals, Pharmaceutical companies, Community pharmacies'},
    {icon:'🔬', title:'Biochemist / Medical Lab Scientist', demand:'High', salary:'₦150k–₦500k/mo',
     unis:'UI, UNILAG, ABU, UNIPORT', cutoff:'220–250 JAMB',
     subjects:'English, Biology, Chemistry, Physics/Maths',
     jobs:'Research labs, Hospitals, Food companies, Oil companies'},
    {icon:'🌿', title:'Agricultural Scientist', demand:'High', salary:'₦120k–₦400k/mo',
     unis:'ABU, OAU, FUNAAB, UNILORIN', cutoff:'200–230 JAMB',
     subjects:'English, Biology, Chemistry, Agriculture/Physics',
     jobs:'Federal/State Ministries, NGOs, Agribusiness, Research'},
  ],
  tech: [
    {icon:'💻', title:'Software Engineer', demand:'Very High', salary:'₦400k–₦3M/mo',
     unis:'Covenant, UNILAG, UI, ABU, Landmark', cutoff:'220–260 JAMB',
     subjects:'English, Maths, Physics, Chemistry/Further Maths',
     jobs:'Tech startups, Banks, Telecoms, Remote international jobs'},
    {icon:'🔧', title:'Civil / Structural Engineer', demand:'High', salary:'₦250k–₦1M/mo',
     unis:'UNILAG, UI, OAU, ABU, UNIPORT', cutoff:'230–270 JAMB',
     subjects:'English, Maths, Physics, Chemistry',
     jobs:'Construction firms, Government, Oil & Gas, Consulting'},
    {icon:'⚡', title:'Electrical / Electronics Engineer', demand:'Very High', salary:'₦200k–₦900k/mo',
     unis:'ABU, UNILAG, UI, FUTA', cutoff:'220–260 JAMB',
     subjects:'English, Maths, Physics, Chemistry',
     jobs:'Power sector, Telecoms, Oil & Gas, Manufacturing'},
    {icon:'📡', title:'Telecommunications Engineer', demand:'Very High', salary:'₦250k–₦1.2M/mo',
     unis:'UNILAG, ABU, Covenant, OAU', cutoff:'220–250 JAMB',
     subjects:'English, Maths, Physics, Chemistry',
     jobs:'MTN, Airtel, Glo, Government agencies, Internet providers'},
  ],
  commercial: [
    {icon:'📊', title:'Accountant / ACCA / ICAN', demand:'Very High', salary:'₦200k–₦1.5M/mo',
     unis:'UNILAG, UI, OAU, Covenant, Babcock', cutoff:'200–240 JAMB',
     subjects:'English, Maths, Economics, Government/Commerce',
     jobs:'Banks, Big 4 firms, Companies, Government'},
    {icon:'🏦', title:'Banker / Financial Analyst', demand:'High', salary:'₦200k–₦800k/mo',
     unis:'UNILAG, UI, Covenant, ABU, AUN', cutoff:'200–240 JAMB',
     subjects:'English, Maths, Economics, Government',
     jobs:'GTB, UBA, Zenith Bank, Access Bank, CBN, Fintechs'},
    {icon:'📈', title:'Economist', demand:'High', salary:'₦180k–₦700k/mo',
     unis:'UI, UNILAG, OAU, ABU', cutoff:'200–230 JAMB',
     subjects:'English, Maths, Economics, Government',
     jobs:'CBN, World Bank, IMF, Federal Ministries, NGOs'},
    {icon:'📦', title:'Supply Chain / Logistics Manager', demand:'Very High', salary:'₦200k–₦900k/mo',
     unis:'UNILAG, Lagos State Poly, Covenant', cutoff:'180–220 JAMB',
     subjects:'English, Maths, Economics, Geography',
     jobs:'Dangote Group, Coca-Cola, Nestle, DHL, Jumia'},
  ],
  arts: [
    {icon:'⚖️', title:'Lawyer (Barrister & Solicitor)', demand:'High', salary:'₦200k–₦2M/mo',
     unis:'UI, UNILAG, OAU, ABU, Afe Babalola', cutoff:'240–280 JAMB',
     subjects:'English, Literature, Government, CRK/IRK or History',
     jobs:'Law firms, Corporations, Government, Politics, Human Rights'},
    {icon:'🎙️', title:'Journalist / Media Professional', demand:'Medium', salary:'₦120k–₦500k/mo',
     unis:'UNILAG, ABU, Bayero, UI', cutoff:'180–220 JAMB',
     subjects:'English, Literature, Government, French/History',
     jobs:'NTA, Channels TV, Punch, Guardian, BBC Africa, NGOs'},
    {icon:'🏛️', title:'Political Scientist / Diplomat', demand:'Medium', salary:'₦150k–₦600k/mo',
     unis:'UI, ABU, UNILAG, OAU', cutoff:'200–230 JAMB',
     subjects:'English, Government, History, Literature',
     jobs:'Ministry of Foreign Affairs, UN, ECOWAS, Academia'},
    {icon:'🧠', title:'Psychologist / Counsellor', demand:'Growing', salary:'₦150k–₦500k/mo',
     unis:'UI, UNILAG, OAU, ABU', cutoff:'200–230 JAMB',
     subjects:'English, Biology, Government, Literature',
     jobs:'Schools, Hospitals, NGOs, HR Departments, Private practice'},
  ]
};

// ── SUBJECT COMBOS DATA ──
const SUBJECT_COMBOS = [
  {icon:'🩺', label:'Medicine & Sciences',
   combo:'English · Mathematics · Biology · Chemistry · Physics',
   path:'Medicine, Pharmacy, Dentistry, Nursing, Biochemistry, Microbiology'},
  {icon:'⚙️', label:'Engineering & Technology',
   combo:'English · Mathematics · Physics · Chemistry · (Further Maths bonus)',
   path:'Civil, Electrical, Mechanical, Chemical Engineering; Computer Science'},
  {icon:'📊', label:'Business & Commerce',
   combo:'English · Mathematics · Economics · Government · Commerce/Accounting',
   path:'Accounting, Banking, Economics, Business Admin, Finance, Marketing'},
  {icon:'⚖️', label:'Law & Humanities',
   combo:'English · Literature · Government · CRK/IRK or History · (French/Yoruba)',
   path:'Law, Mass Communication, English, History, International Relations'},
  {icon:'🌍', label:'Social Sciences',
   combo:'English · Economics · Government · Geography · Maths or History',
   path:'Political Science, Sociology, Psychology, Public Admin, Geography'},
  {icon:'🎨', label:'Arts & Creative',
   combo:'English · Fine Art · Literature · Government or History · CRK/Yoruba',
   path:'Fine Arts, Architecture, Theatre Arts, Music, Mass Communication'},
  {icon:'🌿', label:'Agriculture & Environment',
   combo:'English · Biology · Chemistry · Agriculture · Maths or Physics',
   path:'Agriculture, Forestry, Environmental Science, Food Technology'},
  {icon:'💻', label:'Computer Science & IT',
   combo:'English · Mathematics · Physics · Chemistry · Further Maths (optional)',
   path:'Computer Science, Software Engineering, Cyber Security, Data Science'},
];

const SYLLABUS = {


  // ─── PRIMARY 1 ───
  'eng-p1':{name:'English Language',cls:'P1',ico:'📖',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Alphabet — Capital and Small Letters'},{w:2,t:'Phonics — Vowel Sounds: A E I O U'},{w:3,t:'Sight Words — Common Words I See Every Day'},{w:4,t:'My Body — Naming Parts of the Body'},{w:5,t:'My Family — Words for Family Members'},{w:6,t:'Colours — Naming Colours Around Us'},{w:7,t:'Numbers in Words — One to Ten'},{w:8,t:'Simple Sentences — Subject and Verb'},{w:9,t:'Listening and Speaking — Greetings and Introductions'}],
    'Second Term':[{w:1,t:'Animals — Names of Common Animals'},{w:2,t:'Phonics — Consonant Sounds'},{w:3,t:'Reading — Short Words: Cat, Dog, Hen, Rat'},{w:4,t:'Plurals — One and Many'},{w:5,t:'Colours and Shapes in Sentences'},{w:6,t:'My School — Names of Things in the Classroom'},{w:7,t:'Questions and Answers — Who? What? Where?'},{w:8,t:'Writing — Tracing and Copying Sentences'},{w:9,t:'Simple Stories — Listening and Retelling'}],
    'Third Term':[{w:1,t:'Food — Names of Nigerian Foods'},{w:2,t:'Rhymes and Songs — Short Nursery Rhymes'},{w:3,t:'Days of the Week and Months of the Year'},{w:4,t:'Action Words — Run, Jump, Sit, Stand'},{w:5,t:'Simple Composition — Myself'},{w:6,t:'Revision and Assessment'}]
  }},
  'mth-p1':{name:'Mathematics',cls:'P1',ico:'🧮',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Numbers 1–10 — Counting and Writing'},{w:2,t:'Numbers 11–20 — Reading and Writing'},{w:3,t:'Addition — Adding Numbers to 10'},{w:4,t:'Subtraction — Taking Away to 10'},{w:5,t:'Shapes — Circle, Square, Triangle, Rectangle'},{w:6,t:'Ordering Numbers — Before, After, Between'},{w:7,t:'Numbers 21–50 — Counting On'},{w:8,t:'Addition — Adding Numbers to 20'},{w:9,t:'Measurement — Long and Short, Heavy and Light'}],
    'Second Term':[{w:1,t:'Numbers 51–100 — Counting and Writing'},{w:2,t:'Subtraction — Taking Away to 20'},{w:3,t:'Money — Naira and Kobo Coins'},{w:4,t:'Time — Morning, Afternoon, Night; Days of Week'},{w:5,t:'Addition and Subtraction — Mixed Problems'},{w:6,t:'Patterns — Repeating Patterns'},{w:7,t:'Sorting and Grouping Objects'},{w:8,t:'Simple Fractions — Half and Quarter'},{w:9,t:'Number Bonds to 10'}],
    'Third Term':[{w:1,t:'Numbers to 100 — Place Value: Tens and Units'},{w:2,t:'Addition with Carrying'},{w:3,t:'Subtraction with Borrowing'},{w:4,t:'Length — Using a Ruler: cm and m'},{w:5,t:'Revision — All Topics'},{w:6,t:'Assessment'}]
  }},
  'sci-p1':{name:'Basic Science',cls:'P1',ico:'🔬',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Living and Non-Living Things'},{w:2,t:'Plants Around Us — Parts of a Plant'},{w:3,t:'Animals Around Us — Domestic and Wild Animals'},{w:4,t:'My Body — External Parts and Their Uses'},{w:5,t:'Food — Types of Food We Eat'},{w:6,t:'Water — Uses of Water'},{w:7,t:'Air — We Need Air to Live'},{w:8,t:'Day and Night — The Sun and Moon'},{w:9,t:'Weather — Sunny, Rainy, Cloudy'}],
    'Second Term':[{w:1,t:'Materials — Hard and Soft, Rough and Smooth'},{w:2,t:'Colours of Objects Around Us'},{w:3,t:'Sound — Loud and Soft Sounds'},{w:4,t:'Health — Keeping Our Body Clean'},{w:5,t:'Our Senses — Sight, Hearing, Smell, Taste, Touch'},{w:6,t:'Movement — How Animals Move'},{w:7,t:'Seeds and Germination'},{w:8,t:'The Environment — Keeping It Clean'},{w:9,t:'Simple Machines — Wheel, Lever'}],
    'Third Term':[{w:1,t:'Soil — Types of Soil'},{w:2,t:'Farm Animals and Their Young Ones'},{w:3,t:'Safety — Road Safety and Home Safety'},{w:4,t:'Waste Disposal — Dustbin and Refuse'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'sst-p1':{name:'Social Studies',cls:'P1',ico:'🌍',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Myself — Who I Am'},{w:2,t:'My Family — Members of the Family'},{w:3,t:'My Home — Parts of a House'},{w:4,t:'My School — People in My School'},{w:5,t:'My Community — People Who Help Us'},{w:6,t:'Our Food — Nigerian Foods We Eat'},{w:7,t:'Clothing — What We Wear'},{w:8,t:'Greetings — How We Greet People'},{w:9,t:'Good Behaviour at Home and School'}],
    'Second Term':[{w:1,t:'Nigeria — Our Country'},{w:2,t:'The Nigerian Flag and Its Colours'},{w:3,t:'National Anthem and Pledge'},{w:4,t:'Our Leaders — President and Governor'},{w:5,t:'Work and Workers — Different Jobs'},{w:6,t:'Transport — How We Move from Place to Place'},{w:7,t:'Communication — How We Share Information'},{w:8,t:'Markets — Buying and Selling'},{w:9,t:'Festivals and Celebrations'}],
    'Third Term':[{w:1,t:'Cooperation — Working Together'},{w:2,t:'Sharing and Caring'},{w:3,t:'Taking Care of Our Environment'},{w:4,t:'Safety Rules at Home and School'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'crs-p1':{name:'CRS / IRS',cls:'P1',ico:'🕊️',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'God Created the World'},{w:2,t:'God Created Man and Woman'},{w:3,t:'God Loves Us'},{w:4,t:'The Family — God Gives Us Families'},{w:5,t:'Prayer — Talking to God'},{w:6,t:'The Church — House of God'},{w:7,t:'Obedience — Obeying Parents and Teachers'},{w:8,t:'Honesty — Telling the Truth'},{w:9,t:'Kindness — Being Kind to Others'}],
    'Second Term':[{w:1,t:'The Bible — The Word of God'},{w:2,t:'Jesus — Son of God'},{w:3,t:'The Birth of Jesus'},{w:4,t:'Jesus Loves Children'},{w:5,t:'Easter — Jesus Died and Rose Again'},{w:6,t:'Sharing What We Have'},{w:7,t:'Forgiveness — Saying Sorry'},{w:8,t:'Thankfulness — Being Grateful'},{w:9,t:'Christmas — Celebrating Jesus'}],
    'Third Term':[{w:1,t:'Worship — Praising God'},{w:2,t:'Helping Others'},{w:3,t:'God Takes Care of Us'},{w:4,t:'Cleanliness — Our Bodies Are Temples'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},

  // ─── PRIMARY 2 ───
  'eng-p2':{name:'English Language',cls:'P2',ico:'📖',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Phonics — Blending Sounds: bl, cl, fl, sl'},{w:2,t:'Reading — Simple Passages'},{w:3,t:'Nouns — Names of People, Places, Things'},{w:4,t:'Verbs — Action Words'},{w:5,t:'Sentences — Statements and Questions'},{w:6,t:'Punctuation — Full Stop and Capital Letter'},{w:7,t:'Vocabulary — Animals and Their Sounds'},{w:8,t:'Comprehension — Short Passages'},{w:9,t:'Composition — My Best Friend'}],
    'Second Term':[{w:1,t:'Adjectives — Describing Words'},{w:2,t:'Pronouns — I, You, He, She, We, They'},{w:3,t:'Questions — Using the Question Mark'},{w:4,t:'Plural Nouns — Adding s and es'},{w:5,t:'Opposites — Big/Small, Hot/Cold'},{w:6,t:'Reading — Stories About Animals'},{w:7,t:'Letter Writing — Informal Letter to a Friend'},{w:8,t:'Oral English — Clear Pronunciation'},{w:9,t:'Composition — My School'}],
    'Third Term':[{w:1,t:'Tenses — Present and Past Tense'},{w:2,t:'Prepositions — In, On, Under, Behind'},{w:3,t:'Comprehension — Longer Passages'},{w:4,t:'Creative Writing — Short Stories'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'mth-p2':{name:'Mathematics',cls:'P2',ico:'🧮',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Numbers 1–100 — Place Value Revision'},{w:2,t:'Numbers 101–200 — Counting and Writing'},{w:3,t:'Addition of 2-Digit Numbers'},{w:4,t:'Subtraction of 2-Digit Numbers'},{w:5,t:'Multiplication — 2 and 3 Times Tables'},{w:6,t:'Division — Sharing into Equal Groups'},{w:7,t:'Fractions — Half, Quarter, Three-Quarters'},{w:8,t:'Money — Adding and Subtracting Naira'},{w:9,t:'Time — Reading the Clock to the Hour'}],
    'Second Term':[{w:1,t:'Numbers to 500 — Reading and Writing'},{w:2,t:'Multiplication — 4 and 5 Times Tables'},{w:3,t:'Length — Measuring in cm and m'},{w:4,t:'Weight — Measuring in kg and g'},{w:5,t:'Capacity — Litres and Half Litres'},{w:6,t:'Shapes — 2D and 3D Shapes'},{w:7,t:'Patterns and Sequences'},{w:8,t:'Graphs — Picture Graphs'},{w:9,t:'Word Problems — Addition and Subtraction'}],
    'Third Term':[{w:1,t:'Numbers to 1000'},{w:2,t:'Multiplication — 6, 7, 8, 9 Times Tables'},{w:3,t:'Division — Sharing and Grouping'},{w:4,t:'Temperature — Hot and Cold'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'sci-p2':{name:'Basic Science',cls:'P2',ico:'🔬',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Plants — How Plants Make Their Food'},{w:2,t:'Animals — Habitats: Land, Water, Air'},{w:3,t:'The Human Body — The Skeleton'},{w:4,t:'Food and Nutrition — Food Groups'},{w:5,t:'Water Cycle — Rain, Clouds, Rivers'},{w:6,t:'Air — Properties of Air'},{w:7,t:'Soil — Uses of Soil'},{w:8,t:'Materials — Natural and Man-Made'},{w:9,t:'Light — Sources of Light'}],
    'Second Term':[{w:1,t:'Sound — How Sound Travels'},{w:2,t:'Heat — Sources of Heat'},{w:3,t:'Electricity — Simple Electric Circuit'},{w:4,t:'Magnets — Attracting and Repelling'},{w:5,t:'Simple Machines — Pulley and Inclined Plane'},{w:6,t:'Environment — Pollution and Its Effects'},{w:7,t:'Health — Common Diseases and Prevention'},{w:8,t:'Personal Hygiene — Brushing Teeth, Washing Hands'},{w:9,t:'Reproduction in Plants — Seeds and Spores'}],
    'Third Term':[{w:1,t:'Rocks and Minerals'},{w:2,t:'Weather — Measuring Rainfall and Temperature'},{w:3,t:'Conservation — Taking Care of Nature'},{w:4,t:'Technology Around Us — Computers and Phones'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'sst-p2':{name:'Social Studies',cls:'P2',ico:'🌍',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'The Family — Types of Family'},{w:2,t:'Roles in the Family'},{w:3,t:'Nigerian Culture — Dressing, Food, Music'},{w:4,t:'Our State — Location and Capital'},{w:5,t:'Neighbours and Neighbourliness'},{w:6,t:'Cooperation in the Community'},{w:7,t:'Rules — Why We Need Rules'},{w:8,t:'Conflict — Peaceful Settlement'},{w:9,t:'Religion in Nigeria — Christianity, Islam, Traditional'}],
    'Second Term':[{w:1,t:'Natural Resources of Nigeria'},{w:2,t:'Agriculture — Farming in Nigeria'},{w:3,t:'Industries in Nigeria'},{w:4,t:'Trade — Exports and Imports'},{w:5,t:'Tourism — Places to Visit in Nigeria'},{w:6,t:'Transportation in Nigeria'},{w:7,t:'Communication — Radio, TV, Newspapers'},{w:8,t:'Government in Nigeria — Local Government'},{w:9,t:'Citizenship — Being a Good Nigerian'}],
    'Third Term':[{w:1,t:'Human Rights — Rights of Children'},{w:2,t:'Environmental Problems — Erosion, Flooding'},{w:3,t:'Waste Management in Nigeria'},{w:4,t:'National Values — Patriotism and Unity'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},

  // ─── PRIMARY 3 ───
  'eng-p3':{name:'English Language',cls:'P3',ico:'📖',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Comprehension — Reading for Information'},{w:2,t:'Grammar — Types of Nouns: Common, Proper, Collective'},{w:3,t:'Adjectives — Comparison: big, bigger, biggest'},{w:4,t:'Tenses — Present Continuous Tense'},{w:5,t:'Composition — Describing a Picture'},{w:6,t:'Vocabulary — Synonyms'},{w:7,t:'Punctuation — Comma, Apostrophe'},{w:8,t:'Oral English — Stress in Words'},{w:9,t:'Letter Writing — Formal Letter Introduction'}],
    'Second Term':[{w:1,t:'Comprehension — Story Passages'},{w:2,t:'Pronouns — Subject and Object Pronouns'},{w:3,t:'Conjunctions — And, But, Because, So'},{w:4,t:'Adverbs — Words That Describe Verbs'},{w:5,t:'Composition — Story Writing'},{w:6,t:'Vocabulary — Antonyms'},{w:7,t:'Direct and Indirect Speech — Introduction'},{w:8,t:'Reading Aloud — Expression and Fluency'},{w:9,t:'Composition — My Hometown'}],
    'Third Term':[{w:1,t:'Comprehension — Poem'},{w:2,t:'Grammar — Prepositions Revision'},{w:3,t:'Composition — A Visit to the Market'},{w:4,t:'Vocabulary — Homophones'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'mth-p3':{name:'Mathematics',cls:'P3',ico:'🧮',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Numbers to 10,000 — Place Value: Thousands'},{w:2,t:'Addition of 3-Digit Numbers with Carrying'},{w:3,t:'Subtraction of 3-Digit Numbers with Borrowing'},{w:4,t:'Multiplication — Tables Review and Extension'},{w:5,t:'Long Multiplication — 2-Digit by 1-Digit'},{w:6,t:'Division — Long Division Introduction'},{w:7,t:'Fractions — Equivalent Fractions'},{w:8,t:'Fractions — Adding with Same Denominator'},{w:9,t:'Decimals — Introduction: Tenths'}],
    'Second Term':[{w:1,t:'Percentages — Introduction: Out of 100'},{w:2,t:'Money — Calculating Change'},{w:3,t:'Time — Reading Clock to Minutes, a.m. and p.m.'},{w:4,t:'Length — Converting cm to m and km'},{w:5,t:'Weight — Converting g to kg'},{w:6,t:'Area — Counting Squares'},{w:7,t:'Perimeter — Distance Around Shapes'},{w:8,t:'Data — Tables and Bar Charts'},{w:9,t:'Word Problems — Mixed Operations'}],
    'Third Term':[{w:1,t:'Numbers to 100,000'},{w:2,t:'Angles — Right Angle, Acute, Obtuse'},{w:3,t:'Geometry — Triangles and Quadrilaterals'},{w:4,t:'Roman Numerals — I to XX'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'sci-p3':{name:'Basic Science',cls:'P3',ico:'🔬',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Classification of Animals — Vertebrates and Invertebrates'},{w:2,t:'Food Chains and Food Webs'},{w:3,t:'Photosynthesis — How Plants Make Food'},{w:4,t:'Respiration — Breathing in Animals and Plants'},{w:5,t:'The Digestive System — How We Digest Food'},{w:6,t:'The Circulatory System — Heart and Blood'},{w:7,t:'Diseases — Malaria, Typhoid — Causes and Prevention'},{w:8,t:'First Aid — Basic First Aid Skills'},{w:9,t:'The Five Senses — Organs and Functions'}],
    'Second Term':[{w:1,t:'States of Matter — Solid, Liquid, Gas'},{w:2,t:'Changes of State — Melting, Freezing, Evaporation'},{w:3,t:'Solutions and Mixtures'},{w:4,t:'Chemical Reactions — Burning, Rusting'},{w:5,t:'Energy — Types of Energy'},{w:6,t:'Force — Push and Pull'},{w:7,t:'Gravity — Why Things Fall'},{w:8,t:'Sound — Vibration and Sound Waves'},{w:9,t:'Light — Reflection and Shadows'}],
    'Third Term':[{w:1,t:'The Solar System — Planets and Stars'},{w:2,t:'Ecology — Ecosystems in Nigeria'},{w:3,t:'Conservation — Protecting Wildlife'},{w:4,t:'Technology — Simple Inventions'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'sst-p3':{name:'Social Studies',cls:'P3',ico:'🌍',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Nigeria — Location, Size and Neighbours'},{w:2,t:'States and Capital Cities of Nigeria'},{w:3,t:'Major Ethnic Groups — Yoruba, Igbo, Hausa and Others'},{w:4,t:'Nigerian Languages and Culture'},{w:5,t:'Physical Features — Rivers, Hills, Plains'},{w:6,t:'Climate — Rainy and Dry Season'},{w:7,t:'Natural Resources — Oil, Gold, Coal'},{w:8,t:'Population of Nigeria'},{w:9,t:'Nigerian Economy — Agriculture and Industry'}],
    'Second Term':[{w:1,t:'History of Nigeria — Pre-Colonial Period'},{w:2,t:'Colonial Rule — British Government in Nigeria'},{w:3,t:'Independence — 1 October 1960'},{w:4,t:'Nigerian Government — The Three Arms'},{w:5,t:'Democracy and Elections'},{w:6,t:'Human Rights in Nigeria'},{w:7,t:'Law Enforcement — Police, FRSC, EFCC'},{w:8,t:'Corruption — Effects and Solutions'},{w:9,t:'Nigeria in ECOWAS and African Union'}],
    'Third Term':[{w:1,t:'World Map — Continents and Oceans'},{w:2,t:'Africa — Countries and Capital Cities'},{w:3,t:'Global Problems — Hunger, Disease, War'},{w:4,t:'Nigeria\'s Contribution to World Peace'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},

  // ─── PRIMARY 4 ───
  'eng-p4':{name:'English Language',cls:'P4',ico:'📖',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Comprehension — Reading for Main Ideas'},{w:2,t:'Grammar — Parts of Speech Revision'},{w:3,t:'Concord — Subject-Verb Agreement'},{w:4,t:'Tenses — Simple Past and Past Continuous'},{w:5,t:'Composition — Narrative Essay'},{w:6,t:'Vocabulary — Idioms and Their Meanings'},{w:7,t:'Punctuation — Colon and Semi-Colon'},{w:8,t:'Oral English — Vowel Sounds'},{w:9,t:'Formal Letter — Application Letter'}],
    'Second Term':[{w:1,t:'Comprehension — Non-Fiction Passages'},{w:2,t:'Reported Speech — Direct to Indirect'},{w:3,t:'Conditional Sentences — If Clauses'},{w:4,t:'Passive Voice — Introduction'},{w:5,t:'Composition — Descriptive Essay'},{w:6,t:'Vocabulary — Proverbs'},{w:7,t:'Summary Writing — Identifying Key Points'},{w:8,t:'Oral English — Consonant Sounds'},{w:9,t:'Composition — An Event I Attended'}],
    'Third Term':[{w:1,t:'Poetry — Reading and Understanding Poems'},{w:2,t:'Drama — Reading Plays'},{w:3,t:'Comprehension — Newspaper Extracts'},{w:4,t:'Speech Writing — Introduction'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'mth-p4':{name:'Mathematics',cls:'P4',ico:'🧮',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Numbers to 1,000,000 — Place Value'},{w:2,t:'Whole Numbers — Addition and Subtraction'},{w:3,t:'Multiplication — 2-Digit by 2-Digit'},{w:4,t:'Division — Long Division with Remainders'},{w:5,t:'Factors and Multiples — LCM and HCF'},{w:6,t:'Fractions — Adding and Subtracting Unlike Fractions'},{w:7,t:'Fractions — Multiplying Fractions'},{w:8,t:'Decimals — Adding and Subtracting Decimals'},{w:9,t:'Percentages — Finding Percentage of a Quantity'}],
    'Second Term':[{w:1,t:'Ratio and Proportion — Introduction'},{w:2,t:'Money — Profit and Loss'},{w:3,t:'Speed — Distance, Time, Speed'},{w:4,t:'Area — Rectangle, Triangle, Circle'},{w:5,t:'Volume — Cuboid'},{w:6,t:'Angles — Measuring and Drawing Angles'},{w:7,t:'Symmetry — Lines of Symmetry'},{w:8,t:'Graphs — Line Graphs and Pie Charts'},{w:9,t:'Statistics — Mean, Mode, Median Introduction'}],
    'Third Term':[{w:1,t:'Algebra — Introduction: Letters for Numbers'},{w:2,t:'Simple Equations — Solving for x'},{w:3,t:'Number Bases — Binary Introduction'},{w:4,t:'Roman Numerals — I to C'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'sci-p4':{name:'Basic Science & Technology',cls:'P4',ico:'🔬',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Living Things — Characteristics of Life (MRS GREN)'},{w:2,t:'Cell — The Unit of Life'},{w:3,t:'Classification of Plants — Flowering and Non-Flowering'},{w:4,t:'Classification of Animals — Major Groups'},{w:5,t:'The Human Body — Skeletal and Muscular Systems'},{w:6,t:'Nutrition — Balanced Diet and Deficiency Diseases'},{w:7,t:'Reproduction — Asexual and Sexual'},{w:8,t:'Growth and Development — Stages of Life'},{w:9,t:'Health — Immunisation and Vaccines'}],
    'Second Term':[{w:1,t:'Matter — Properties of Matter'},{w:2,t:'Elements and Compounds'},{w:3,t:'Mixtures — Separating Mixtures'},{w:4,t:'Energy — Kinetic and Potential Energy'},{w:5,t:'Electricity — Conductors and Insulators'},{w:6,t:'Technology — Computers and the Internet'},{w:7,t:'Technology — Uses of Mobile Phones'},{w:8,t:'Simple Machines — Lever, Wheel, Pulley'},{w:9,t:'Space — Stars, Moon, Planets'}],
    'Third Term':[{w:1,t:'Environment — Greenhouse Effect and Climate Change'},{w:2,t:'Pollution — Types and Effects'},{w:3,t:'Recycling and Waste Management'},{w:4,t:'Safety — Laboratory and Home Safety'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'sst-p4':{name:'Social Studies',cls:'P4',ico:'🌍',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'The Family — Extended and Nuclear Family Values'},{w:2,t:'Cultural Practices — Marriage in Nigeria'},{w:3,t:'Traditional Festivals in Nigeria'},{w:4,t:'Nigerian Foods and Their Nutritional Value'},{w:5,t:'Dress Culture — Traditional and Modern Dress'},{w:6,t:'Music and Dance in Nigerian Culture'},{w:7,t:'Languages — Major and Minor Languages'},{w:8,t:'Religion — Tolerance and Peaceful Coexistence'},{w:9,t:'Citizenship — Duties and Rights'}],
    'Second Term':[{w:1,t:'Map Reading — Scale and Key'},{w:2,t:'The Six Geopolitical Zones of Nigeria'},{w:3,t:'Physical Geography of Nigeria'},{w:4,t:'Rivers and Lakes of Nigeria'},{w:5,t:'Economic Activities — Farming, Fishing, Mining'},{w:6,t:'Trade and Commerce in Nigeria'},{w:7,t:'Transportation Systems in Nigeria'},{w:8,t:'Communication Systems in Nigeria'},{w:9,t:'Urbanisation — Growth of Nigerian Cities'}],
    'Third Term':[{w:1,t:'History — Slave Trade and Its Effects'},{w:2,t:'Colonial Era and Resistance'},{w:3,t:'Nationalism — Heroes of Nigerian Independence'},{w:4,t:'Unity in Diversity — National Values'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'agr-p4':{name:'Agricultural Science',cls:'P4',ico:'🌾',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Meaning and Importance of Agriculture'},{w:2,t:'Branches of Agriculture'},{w:3,t:'Farming Systems — Subsistence and Commercial'},{w:4,t:'Farm Tools and Equipment'},{w:5,t:'Land Preparation — Clearing, Ploughing, Ridging'},{w:6,t:'Crop Production — Planting and Spacing'},{w:7,t:'Manure and Fertiliser'},{w:8,t:'Irrigation — Watering Crops'},{w:9,t:'Weeding and Pest Control'}],
    'Second Term':[{w:1,t:'Food Crops — Maize, Yam, Cassava, Rice'},{w:2,t:'Cash Crops — Cocoa, Palm Oil, Groundnut'},{w:3,t:'Harvesting and Storage'},{w:4,t:'Animal Production — Poultry Farming'},{w:5,t:'Animal Production — Cattle and Goat Rearing'},{w:6,t:'Fish Farming — Introduction to Aquaculture'},{w:7,t:'Animal Feeds and Feeding'},{w:8,t:'Animal Diseases and Prevention'},{w:9,t:'Farm Records — Why Farmers Keep Records'}],
    'Third Term':[{w:1,t:'Soil — Composition and Importance'},{w:2,t:'Soil Erosion — Causes and Prevention'},{w:3,t:'Agriculture and the Nigerian Economy'},{w:4,t:'Career Opportunities in Agriculture'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},

  // ─── PRIMARY 5 ───
  'eng-p5':{name:'English Language',cls:'P5',ico:'📖',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Comprehension — Reading for Details and Inference'},{w:2,t:'Grammar — Clauses: Main and Subordinate'},{w:3,t:'Concord — Difficult Cases'},{w:4,t:'Reported Speech — Commands and Questions'},{w:5,t:'Composition — Argumentative Essay'},{w:6,t:'Vocabulary — Phrasal Verbs'},{w:7,t:'Summary Writing — Précis'},{w:8,t:'Oral English — Stress and Intonation'},{w:9,t:'Formal Letter — Complaint Letter'}],
    'Second Term':[{w:1,t:'Comprehension — Poetry Passage'},{w:2,t:'Grammar — Active and Passive Voice'},{w:3,t:'Figures of Speech — Simile, Metaphor, Personification'},{w:4,t:'Vocabulary — Register and Varieties of English'},{w:5,t:'Composition — Expository Essay'},{w:6,t:'Debate — How to Argue a Point'},{w:7,t:'Report Writing — Introduction'},{w:8,t:'Oral English — Phonetic Symbols'},{w:9,t:'Composition — Technology in Our Lives'}],
    'Third Term':[{w:1,t:'Literature — Novel: Characters and Plot'},{w:2,t:'Literature — Drama: Key Terms'},{w:3,t:'Comprehension — Complex Passages'},{w:4,t:'Common Entrance Exam Practice'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'mth-p5':{name:'Mathematics',cls:'P5',ico:'🧮',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Numbers — Indices and Standard Form'},{w:2,t:'Whole Numbers — Operations Review'},{w:3,t:'Fractions — Division of Fractions'},{w:4,t:'Decimals — Multiplication and Division'},{w:5,t:'Percentages — Percentage Increase and Decrease'},{w:6,t:'Ratio and Proportion — Direct Proportion'},{w:7,t:'Rate — Speed, Distance, Time Calculations'},{w:8,t:'Profit, Loss and Discount'},{w:9,t:'Simple Interest'}],
    'Second Term':[{w:1,t:'Algebra — Simplifying Expressions'},{w:2,t:'Algebra — Solving Linear Equations'},{w:3,t:'Algebra — Word Problems'},{w:4,t:'Geometry — Angles on a Straight Line and Triangle'},{w:5,t:'Geometry — Circles: Radius, Diameter, Circumference'},{w:6,t:'Area and Volume — Complex Shapes'},{w:7,t:'Statistics — Frequency Tables and Mean'},{w:8,t:'Probability — Basic Probability'},{w:9,t:'Sequences and Patterns'}],
    'Third Term':[{w:1,t:'Sets — Introduction'},{w:2,t:'Number Bases — Binary Operations'},{w:3,t:'Coordinate Geometry — Plotting Points'},{w:4,t:'Common Entrance Practice Questions'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'sci-p5':{name:'Basic Science',cls:'P5',ico:'🔬',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Biology — Classification of Living Things'},{w:2,t:'Biology — The Cell: Structure and Functions'},{w:3,t:'Biology — Plant Nutrition: Photosynthesis in Depth'},{w:4,t:'Biology — Human Digestion'},{w:5,t:'Biology — Respiration: Aerobic and Anaerobic'},{w:6,t:'Biology — Excretion in Humans'},{w:7,t:'Biology — The Nervous System'},{w:8,t:'Biology — Reproduction in Humans — Puberty'},{w:9,t:'Biology — Diseases: HIV/AIDS Awareness'}],
    'Second Term':[{w:1,t:'Chemistry — Atoms and Molecules'},{w:2,t:'Chemistry — Elements: The Periodic Table Introduction'},{w:3,t:'Chemistry — Chemical and Physical Changes'},{w:4,t:'Physics — Forces: Gravity, Friction, Tension'},{w:5,t:'Physics — Motion: Speed and Velocity'},{w:6,t:'Physics — Light: Reflection and Refraction'},{w:7,t:'Physics — Electricity: Series and Parallel Circuits'},{w:8,t:'Technology — Renewable Energy: Solar, Wind'},{w:9,t:'Technology — Biotechnology Introduction'}],
    'Third Term':[{w:1,t:'Earth Science — Rock Cycle'},{w:2,t:'Earth Science — The Atmosphere and Weather'},{w:3,t:'Conservation — Protecting Nigerian Ecosystems'},{w:4,t:'Common Entrance Science Revision'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'sst-p5':{name:'Social Studies',cls:'P5',ico:'🌍',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Human Rights — UN Convention on the Rights of the Child'},{w:2,t:'Democracy — Features and Importance'},{w:3,t:'Electoral Process — How Nigerians Vote'},{w:4,t:'Good Governance — Accountability and Transparency'},{w:5,t:'Corruption — Forms and Effects'},{w:6,t:'Rule of Law'},{w:7,t:'Conflict Resolution — Negotiation and Dialogue'},{w:8,t:'Gender Equality'},{w:9,t:'Child Labour and Child Trafficking'}],
    'Second Term':[{w:1,t:'Globalisation — Nigeria in the World'},{w:2,t:'International Organisations — UN, AU, ECOWAS'},{w:3,t:'Nigeria\'s Foreign Policy'},{w:4,t:'Trade — Balance of Trade and Payments'},{w:5,t:'Economic Development — Meaning and Indicators'},{w:6,t:'Poverty — Causes and Government Solutions'},{w:7,t:'Unemployment in Nigeria'},{w:8,t:'Infrastructure — Roads, Power, Water'},{w:9,t:'Population and Development'}],
    'Third Term':[{w:1,t:'Environment — Climate Change Effects on Nigeria'},{w:2,t:'Environmental Laws in Nigeria'},{w:3,t:'Sustainable Development'},{w:4,t:'Social Problems — Drug Abuse, Violence'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},
  'agr-p5':{name:'Agricultural Science',cls:'P5',ico:'🌾',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Soil Science — Soil Formation and Profile'},{w:2,t:'Soil — Physical and Chemical Properties'},{w:3,t:'Soil Conservation Methods'},{w:4,t:'Fertilisers — Organic and Inorganic'},{w:5,t:'Crop Improvement — Selective Breeding'},{w:6,t:'Plant Diseases — Identification and Control'},{w:7,t:'Pest Management — Biological and Chemical Control'},{w:8,t:'Irrigation Systems in Nigeria'},{w:9,t:'Mechanised Farming — Tractors and Combine Harvesters'}],
    'Second Term':[{w:1,t:'Animal Husbandry — Poultry: Breeds and Management'},{w:2,t:'Animal Husbandry — Cattle: Breeds and Dairy'},{w:3,t:'Animal Husbandry — Pigs and Rabbits'},{w:4,t:'Fishery — Types of Fish Farming in Nigeria'},{w:5,t:'Agro-Processing — Food Preservation'},{w:6,t:'Agricultural Finance — Loans and Cooperatives'},{w:7,t:'Agricultural Policy in Nigeria'},{w:8,t:'Market and Prices — Supply and Demand in Farming'},{w:9,t:'Farm Business Management'}],
    'Third Term':[{w:1,t:'Agribusiness — From Farm to Market'},{w:2,t:'Career in Agriculture — Agronomy, Veterinary, Extension'},{w:3,t:'Common Entrance Agricultural Science Revision'},{w:4,t:'Mock Common Entrance — Agriculture'},{w:5,t:'Revision'},{w:6,t:'Assessment'}]
  }},

  // ─── PRIMARY 6 ───
  'eng-p6':{name:'English Language',cls:'P6',ico:'📖',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Comprehension — Intensive Common Entrance Practice'},{w:2,t:'Grammar — Full Parts of Speech Review'},{w:3,t:'Sentence Structure — Complex and Compound Sentences'},{w:4,t:'Concord — All Rules Revised'},{w:5,t:'Essay Writing — Narrative and Descriptive'},{w:6,t:'Essay Writing — Argumentative and Expository'},{w:7,t:'Vocabulary — Synonyms, Antonyms, Homonyms'},{w:8,t:'Summary Writing — Full Techniques'},{w:9,t:'Oral English — Complete Sound System Revision'}],
    'Second Term':[{w:1,t:'Figures of Speech — Full Range'},{w:2,t:'Reported Speech — All Types'},{w:3,t:'Active and Passive Voice — Transformation'},{w:4,t:'Letter Writing — Formal and Informal Revision'},{w:5,t:'Report Writing'},{w:6,t:'Speech Writing'},{w:7,t:'Comprehension — Difficult Passages'},{w:8,t:'Poetry — Analysis Techniques'},{w:9,t:'Drama — Key Concepts'}],
    'Third Term':[{w:1,t:'Common Entrance Past Questions — English (1)'},{w:2,t:'Common Entrance Past Questions — English (2)'},{w:3,t:'Examination Techniques — How to Score High'},{w:4,t:'Mock Common Entrance — English'},{w:5,t:'Final Revision'},{w:6,t:'Examination Preparation'}]
  }},
  'mth-p6':{name:'Mathematics',cls:'P6',ico:'🧮',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Number Theory — LCM, HCF, Prime Numbers'},{w:2,t:'Fractions — All Operations Revised'},{w:3,t:'Decimals — All Operations Revised'},{w:4,t:'Percentages — Reverse Percentages'},{w:5,t:'Ratio and Proportion — Inverse Proportion'},{w:6,t:'Algebra — Equations and Inequalities'},{w:7,t:'Mensuration — Area, Volume, Surface Area'},{w:8,t:'Statistics — Mean, Median, Mode, Range'},{w:9,t:'Probability — Experimental and Theoretical'}],
    'Second Term':[{w:1,t:'Geometry — Angles: All Types Revised'},{w:2,t:'Geometry — Circles and Polygons'},{w:3,t:'Coordinate Geometry — Plotting Points'},{w:4,t:'Transformation — Reflection and Rotation'},{w:5,t:'Number Bases — Binary, Octal, Denary Conversion'},{w:6,t:'Sets — Venn Diagrams: 2-Set Problems'},{w:7,t:'Word Problems — Mixed Topics'},{w:8,t:'Common Entrance Past Questions — Mathematics (1)'},{w:9,t:'Common Entrance Past Questions — Mathematics (2)'}],
    'Third Term':[{w:1,t:'Mock Common Entrance — Mathematics'},{w:2,t:'Speed, Distance, Time — Problem Solving'},{w:3,t:'Profit, Loss, Simple Interest — Problems'},{w:4,t:'Final Revision — All Topics'},{w:5,t:'Final Revision'},{w:6,t:'Examination Preparation'}]
  }},
  'sci-p6':{name:'Basic Science',cls:'P6',ico:'🔬',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Biology Revision — Classification, Cell, Nutrition'},{w:2,t:'Biology Revision — Respiration, Reproduction, Health'},{w:3,t:'Chemistry Revision — Matter, Elements, Reactions'},{w:4,t:'Physics Revision — Forces, Motion, Light, Sound'},{w:5,t:'Technology Revision — Machines, Energy, Computers'},{w:6,t:'Earth Science Revision — Soil, Weather, Solar System'},{w:7,t:'Common Entrance Past Questions — Science (1)'},{w:8,t:'Common Entrance Past Questions — Science (2)'},{w:9,t:'Common Entrance Past Questions — Science (3)'}],
    'Second Term':[{w:1,t:'Mock Common Entrance — Science'},{w:2,t:'Science in Everyday Nigerian Life'},{w:3,t:'Agriculture and Science Link'},{w:4,t:'Technology and Innovation'},{w:5,t:'Environmental Science — Protecting Nigeria'},{w:6,t:'Final Revision — All Topics'},{w:7,t:'Examination Techniques'},{w:8,t:'Mock Assessment'},{w:9,t:'Final Assessment Preparation'}],
    'Third Term':[{w:1,t:'Final Revision — Biology'},{w:2,t:'Final Revision — Chemistry and Physics'},{w:3,t:'Final Revision — Technology and Earth Science'},{w:4,t:'Mock Common Entrance — Full Paper'},{w:5,t:'Final Revision'},{w:6,t:'Examination Preparation'}]
  }},
  'sst-p6':{name:'Social Studies',cls:'P6',ico:'🌍',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'History — Pre-Colonial Kingdoms: Benin, Oyo, Kanem-Bornu'},{w:2,t:'The Slave Trade — Trans-Atlantic Slavery'},{w:3,t:'Colonialism — British Rule and Its Effects'},{w:4,t:'Nigerian Independence and Post-Independence'},{w:5,t:'Nigerian Civil War — Causes and Effects'},{w:6,t:'Nigerian Constitution — Highlights'},{w:7,t:'The Three Arms of Government — Revision'},{w:8,t:'State and Local Government in Nigeria'},{w:9,t:'Nigeria\'s International Relations'}],
    'Second Term':[{w:1,t:'World Geography — Major Countries and Capitals'},{w:2,t:'Population — World Population Issues'},{w:3,t:'Economic Systems — Capitalism, Socialism'},{w:4,t:'Globalisation and Its Effects on Nigeria'},{w:5,t:'Science and Technology — Impact on Society'},{w:6,t:'Social Issues — Poverty, Disease, Conflict'},{w:7,t:'Sustainable Development Goals'},{w:8,t:'Citizenship — Being a Responsible Global Citizen'},{w:9,t:'Common Entrance Past Questions — Social Studies'}],
    'Third Term':[{w:1,t:'Revision — Nigerian History'},{w:2,t:'Revision — Government and Citizenship'},{w:3,t:'Revision — Economics and Development'},{w:4,t:'Mock Common Entrance — Social Studies'},{w:5,t:'Final Revision'},{w:6,t:'Examination Preparation'}]
  }},
  'agr-p6':{name:'Agricultural Science',cls:'P6',ico:'🌾',exam:'Common Entrance',terms:{
    'First Term':[{w:1,t:'Crop Farming Revision — Food and Cash Crops'},{w:2,t:'Animal Farming Revision — Poultry, Cattle, Fish'},{w:3,t:'Soil Science Revision — Soil Types and Fertility'},{w:4,t:'Farm Tools and Machinery Revision'},{w:5,t:'Agricultural Economics — Costs and Revenue'},{w:6,t:'Cooperative Societies in Nigerian Agriculture'},{w:7,t:'Government Agricultural Programmes'},{w:8,t:'Agro-Processing and Value Addition'},{w:9,t:'Common Entrance Past Questions — Agriculture'}],
    'Second Term':[{w:1,t:'Revision — Crop Production'},{w:2,t:'Revision — Animal Production'},{w:3,t:'Revision — Soil and Land Management'},{w:4,t:'Mock Common Entrance — Agriculture'},{w:5,t:'Agricultural Technology — Modern Farming Methods'},{w:6,t:'Final Revision'},{w:7,t:'Examination Techniques'},{w:8,t:'Mock Assessment'},{w:9,t:'Final Assessment Preparation'}],
    'Third Term':[{w:1,t:'Final Revision — All Agriculture Topics'},{w:2,t:'Mock Common Entrance — Full Paper'},{w:3,t:'Examination Preparation'},{w:4,t:'Agriculture in Your Future'},{w:5,t:'Final Revision'},{w:6,t:'Examination Preparation'}]
  }},

  // ─── JSS MISSING SUBJECTS ───
  'sst-j1':{name:'Social Studies',cls:'JSS1',ico:'🌍',exam:'BECE',terms:{
    'First Term':[{w:1,t:'The Individual — Identity and Self-Concept'},{w:2,t:'The Family — Types and Functions'},{w:3,t:'The School — Structure and Importance'},{w:4,t:'The Community — Types of Community'},{w:5,t:'Culture — Elements of Nigerian Culture'},{w:6,t:'Socialization — How We Learn to Behave'},{w:7,t:'Social Groups — Peer Group, Religious Group'},{w:8,t:'Relationship Among Groups in Society'},{w:9,t:'Civic Responsibilities'}],
    'Second Term':[{w:1,t:'Nigeria — Physical Features'},{w:2,t:'Nigeria — Climate and Vegetation Zones'},{w:3,t:'Nigeria — Population Distribution'},{w:4,t:'Natural Resources of Nigeria'},{w:5,t:'Agriculture in Nigeria'},{w:6,t:'Industries in Nigeria'},{w:7,t:'Transport and Communication in Nigeria'},{w:8,t:'Trade in Nigeria'},{w:9,t:'Economic Problems in Nigeria'}],
    'Third Term':[{w:1,t:'Government in Nigeria — Introduction'},{w:2,t:'Democracy in Nigeria'},{w:3,t:'Citizenship and Nationalism'},{w:4,t:'Human Rights and Responsibilities'},{w:5,t:'Conflict — Causes and Resolution'},{w:6,t:'Revision and Practice Questions'}]
  }},
  'cmp-j1':{name:'Computer Studies',cls:'JSS1',ico:'💻',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Introduction to Computers — Definition and History'},{w:2,t:'Types of Computers — Desktop, Laptop, Tablet, Mobile'},{w:3,t:'Components of a Computer — Hardware and Software'},{w:4,t:'Input Devices — Keyboard, Mouse, Scanner'},{w:5,t:'Output Devices — Monitor, Printer, Speaker'},{w:6,t:'Storage Devices — Hard Disk, USB, CD/DVD'},{w:7,t:'The CPU — Functions and Speed'},{w:8,t:'Computer Memory — RAM and ROM'},{w:9,t:'Basic Computer Operation — Starting Up and Shutting Down'}],
    'Second Term':[{w:1,t:'Operating Systems — Windows, Linux, Mac OS'},{w:2,t:'The Desktop — Icons, Taskbar, Files and Folders'},{w:3,t:'Word Processing — Introduction to Microsoft Word'},{w:4,t:'Word Processing — Typing, Formatting, Saving'},{w:5,t:'Spreadsheets — Introduction to Microsoft Excel'},{w:6,t:'Presentations — Introduction to PowerPoint'},{w:7,t:'The Internet — Definition and Uses'},{w:8,t:'Web Browser — Searching the Internet'},{w:9,t:'Email — Sending and Receiving Messages'}],
    'Third Term':[{w:1,t:'Social Media — Uses and Dangers'},{w:2,t:'Cybersecurity — Keeping Safe Online'},{w:3,t:'Computer Viruses and Antivirus Software'},{w:4,t:'Digital Citizenship — Responsible Use of Technology'},{w:5,t:'Introduction to Programming — What Coding Is'},{w:6,t:'Revision and Practice Questions'}]
  }},
  'biz-j1':{name:'Business Studies',cls:'JSS1',ico:'💼',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Introduction to Business — Meaning and Types'},{w:2,t:'Business Environment — Internal and External'},{w:3,t:'Production — Creation of Goods and Services'},{w:4,t:'Commerce — Meaning and Functions'},{w:5,t:'Trade — Home Trade and Foreign Trade'},{w:6,t:'Consumer and Producer'},{w:7,t:'Retailing — Types of Retail Shops'},{w:8,t:'Wholesaling — The Role of the Wholesaler'},{w:9,t:'Market — Types of Market'}],
    'Second Term':[{w:1,t:'Office Practice — The Office and Its Functions'},{w:2,t:'Filing — Types and Importance'},{w:3,t:'Communication in Business — Letters and Memos'},{w:4,t:'Telephone — Business Use of the Telephone'},{w:5,t:'Money — Functions and Characteristics'},{w:6,t:'Banking — Types of Banks in Nigeria'},{w:7,t:'Bank Accounts — Current and Savings Accounts'},{w:8,t:'Cheque — Types and Uses'},{w:9,t:'Insurance — Meaning and Importance'}],
    'Third Term':[{w:1,t:'Transport in Business — Road, Rail, Sea, Air'},{w:2,t:'Warehousing — Storage of Goods'},{w:3,t:'Advertising — Types and Functions'},{w:4,t:'Entrepreneurship — Being Your Own Boss'},{w:5,t:'Business Ethics and Social Responsibility'},{w:6,t:'Revision and Practice Questions'}]
  }},
  'crs-j1':{name:'CRS / IRS',cls:'JSS1',ico:'🕊️',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Creation — The Genesis Account'},{w:2,t:'The Fall of Man — Disobedience and Consequences'},{w:3,t:'Cain and Abel — Jealousy and Its Consequences'},{w:4,t:'Noah and the Flood — Obedience to God'},{w:5,t:'Abraham — Faith and Obedience'},{w:6,t:'Joseph — Forgiveness and God\'s Faithfulness'},{w:7,t:'Moses — Leadership and Deliverance'},{w:8,t:'The Ten Commandments'},{w:9,t:'Joshua — Courage and Leadership'}],
    'Second Term':[{w:1,t:'Samuel — Listening to God'},{w:2,t:'David — A Man After God\'s Heart'},{w:3,t:'Solomon — Wisdom and Its Uses'},{w:4,t:'Elijah — Standing for God'},{w:5,t:'Isaiah — Prophecy of the Messiah'},{w:6,t:'Daniel — Faith Under Pressure'},{w:7,t:'The Birth of Jesus — Fulfilment of Prophecy'},{w:8,t:'The Ministry of Jesus — Teaching and Healing'},{w:9,t:'The Death and Resurrection of Jesus'}],
    'Third Term':[{w:1,t:'The Holy Spirit — Pentecost and the Church'},{w:2,t:'Paul — From Persecutor to Apostle'},{w:3,t:'Fruits of the Holy Spirit'},{w:4,t:'Christian Values — Love, Honesty, Service'},{w:5,t:'The Church Today in Nigeria'},{w:6,t:'Revision and Practice Questions'}]
  }},
  'sst-j2':{name:'Social Studies',cls:'JSS2',ico:'🌍',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Democracy — Features and Types'},{w:2,t:'Human Rights in Nigeria — Chapter IV of the Constitution'},{w:3,t:'Constitutionalism — Meaning and Importance'},{w:4,t:'Rule of Law'},{w:5,t:'Separation of Powers'},{w:6,t:'Checks and Balances in Nigeria'},{w:7,t:'Electoral Process in Nigeria'},{w:8,t:'Political Parties in Nigeria'},{w:9,t:'Citizenship and Civic Participation'}],
    'Second Term':[{w:1,t:'Economic Development in Nigeria'},{w:2,t:'Poverty — Causes and Government Response'},{w:3,t:'Unemployment in Nigeria'},{w:4,t:'Inflation — Meaning and Effects'},{w:5,t:'Taxation in Nigeria'},{w:6,t:'Public Finance — Budget and Expenditure'},{w:7,t:'International Trade — Nigeria\'s Imports and Exports'},{w:8,t:'ECOWAS — Goals and Achievements'},{w:9,t:'Nigeria and the United Nations'}],
    'Third Term':[{w:1,t:'Social Problems — Crime, Drug Abuse, Cultism'},{w:2,t:'Social Vices — Prostitution, Corruption, Bribery'},{w:3,t:'Solutions to Social Problems'},{w:4,t:'Values and Moral Education'},{w:5,t:'Environmental Issues in Nigeria'},{w:6,t:'Revision and Practice Questions'}]
  }},
  'cmp-j2':{name:'Computer Studies',cls:'JSS2',ico:'💻',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Computer Networks — LAN, WAN, MAN'},{w:2,t:'Internet — How the Internet Works'},{w:3,t:'World Wide Web — Websites and Web Pages'},{w:4,t:'Search Engines — Effective Searching'},{w:5,t:'Email Communication — CC, BCC, Attachments'},{w:6,t:'Online Safety — Passwords, Privacy Settings'},{w:7,t:'Cybercrime — Types: Phishing, Hacking, Fraud'},{w:8,t:'Copyright and Intellectual Property Online'},{w:9,t:'Cloud Computing — Google Drive, OneDrive'}],
    'Second Term':[{w:1,t:'Word Processing — Advanced Formatting'},{w:2,t:'Word Processing — Tables and Mail Merge'},{w:3,t:'Spreadsheets — Formulas and Functions'},{w:4,t:'Spreadsheets — Charts and Graphs'},{w:5,t:'Database — Introduction: What Is a Database?'},{w:6,t:'Database — Creating a Simple Database'},{w:7,t:'Presentation Software — Advanced PowerPoint'},{w:8,t:'Desktop Publishing — Flyers and Brochures'},{w:9,t:'Multimedia — Audio, Video, Animation'}],
    'Third Term':[{w:1,t:'Introduction to Programming — Scratch'},{w:2,t:'Programming Concepts — Sequence, Selection, Repetition'},{w:3,t:'Algorithms — Flowcharts'},{w:4,t:'Introduction to HTML — Building a Web Page'},{w:5,t:'Artificial Intelligence — Introduction'},{w:6,t:'Revision and Practice Questions'}]
  }},
  'biz-j2':{name:'Business Studies',cls:'JSS2',ico:'💼',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Forms of Business Organisation — Sole Trader'},{w:2,t:'Partnership — Features and Advantages'},{w:3,t:'Private Limited Company'},{w:4,t:'Public Limited Company'},{w:5,t:'Cooperative Society'},{w:6,t:'Public Enterprise — Government Business'},{w:7,t:'Capital — Sources of Business Finance'},{w:8,t:'Loans — Types and Conditions'},{w:9,t:'Stock Exchange — Shares and Bonds'}],
    'Second Term':[{w:1,t:'Bookkeeping — Introduction to Double Entry'},{w:2,t:'The Cash Book'},{w:3,t:'The Ledger — Personal and Impersonal Accounts'},{w:4,t:'Trial Balance'},{w:5,t:'Trading Account'},{w:6,t:'Profit and Loss Account'},{w:7,t:'Balance Sheet — Introduction'},{w:8,t:'Bank Reconciliation — Introduction'},{w:9,t:'Petty Cash Book'}],
    'Third Term':[{w:1,t:'Marketing — The 4 Ps: Product, Price, Place, Promotion'},{w:2,t:'Sales Promotion — Methods in Nigeria'},{w:3,t:'E-Commerce — Buying and Selling Online'},{w:4,t:'Entrepreneurship — Starting a Small Business'},{w:5,t:'Business Plan — Simple Business Plan'},{w:6,t:'Revision and Practice Questions'}]
  }},
  'sst-j3':{name:'Social Studies',cls:'JSS3',ico:'🌍',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Pre-Colonial Nigerian History — Major Kingdoms'},{w:2,t:'Colonial History — British Conquest and Amalgamation'},{w:3,t:'Nationalism and Independence Movements'},{w:4,t:'Post-Independence Nigeria — The Republics'},{w:5,t:'Military Rule in Nigeria — History and Impact'},{w:6,t:'Return to Democracy — 1999 Constitution'},{w:7,t:'Federalism in Nigeria — History and Structure'},{w:8,t:'Constitutional Development in Nigeria'},{w:9,t:'Leadership in Nigeria — Qualities of Good Leaders'}],
    'Second Term':[{w:1,t:'World History — World Wars I and II'},{w:2,t:'The Cold War and Its Impact on Africa'},{w:3,t:'United Nations — History, Purpose and Structure'},{w:4,t:'African Union — History and Goals'},{w:5,t:'Globalisation — Effects on Nigerian Economy'},{w:6,t:'International Trade — Agreements and Organisations'},{w:7,t:'Technology and Development'},{w:8,t:'Environment — Global Warming and Nigeria'},{w:9,t:'Migration — Global and Nigerian Patterns'}],
    'Third Term':[{w:1,t:'Social Issues — Youth Unemployment'},{w:2,t:'Drug Abuse — Types, Effects, Treatment'},{w:3,t:'Cultism and Gang Violence'},{w:4,t:'BECE Revision — All Topics'},{w:5,t:'BECE Practice Questions'},{w:6,t:'Examination Preparation'}]
  }},
  'cmp-j3':{name:'Computer Studies',cls:'JSS3',ico:'💻',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Programming — Introduction to Python'},{w:2,t:'Python — Variables and Data Types'},{w:3,t:'Python — Input and Output'},{w:4,t:'Python — If Statements and Conditions'},{w:5,t:'Python — Loops: For and While'},{w:6,t:'Python — Functions'},{w:7,t:'Algorithms — Sorting and Searching'},{w:8,t:'Data Structures — Lists and Arrays'},{w:9,t:'Web Development — HTML and CSS Basics'}],
    'Second Term':[{w:1,t:'Artificial Intelligence — What AI Is'},{w:2,t:'Machine Learning — Introduction'},{w:3,t:'AI in Nigeria — Applications in Health, Agriculture, Education'},{w:4,t:'Robotics — How Robots Work'},{w:5,t:'Internet of Things — Connected Devices'},{w:6,t:'Cybersecurity — Advanced Threats and Protection'},{w:7,t:'Digital Economy — Tech Entrepreneurship in Nigeria'},{w:8,t:'BECE Computer Revision — All Topics'},{w:9,t:'BECE Practice Questions'}],
    'Third Term':[{w:1,t:'Revision — Hardware and Software'},{w:2,t:'Revision — Internet and Networking'},{w:3,t:'Revision — Programming and Algorithms'},{w:4,t:'Mock BECE — Computer Studies'},{w:5,t:'BECE Revision'},{w:6,t:'Examination Preparation'}]
  }},

  // ─── SS3 MISSING ───
  'lit-s3':{name:'Literature in English',cls:'SS3',ico:'📚',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Revision — All WAEC Set Poems'},{w:2,t:'Deep Analysis — Poem 1 and Poem 2'},{w:3,t:'Deep Analysis — Poem 3 and Poem 4'},{w:4,t:'WAEC Objective Questions on Poetry'},{w:5,t:'Revision — Prescribed Drama Text (Act by Act)'},{w:6,t:'Character Analysis — Drama Text'},{w:7,t:'Themes and Style — Drama Text'},{w:8,t:'WAEC Objective Questions on Drama'},{w:9,t:'Essay Writing on Drama — Full Practice'}],
    'Second Term':[{w:1,t:'Revision — Novel: Chapter Summary'},{w:2,t:'Character Analysis — Novel'},{w:3,t:'Themes — Major and Minor — Novel'},{w:4,t:'Setting and Context — Novel'},{w:5,t:'WAEC Objective Questions on the Novel'},{w:6,t:'Essay Writing on the Novel — Full Practice'},{w:7,t:'Comparative Study — All Three Prescribed Texts'},{w:8,t:'WAEC Essay Writing Techniques'},{w:9,t:'Past Questions Practice — WAEC Literature'}],
    'Third Term':[{w:1,t:'WAEC Paper 1 (Objectives) — Full Revision'},{w:2,t:'WAEC Paper 2 (Essay) — Full Revision'},{w:3,t:'Mock WAEC — Literature in English'},{w:4,t:'Final Revision — All Prescribed Texts'},{w:5,t:'Final Revision'},{w:6,t:'Examination Preparation'}]
  }},
  'acc-s3':{name:'Financial Accounting',cls:'SS3',ico:'📊',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Incomplete Records — Single Entry Bookkeeping'},{w:2,t:'Incomplete Records — Statement of Affairs'},{w:3,t:'Non-Profit Organisations — Receipts and Payments'},{w:4,t:'Non-Profit — Income and Expenditure Account'},{w:5,t:'Club Accounts — Accumulated Fund'},{w:6,t:'Hire Purchase — Buyer\'s and Seller\'s Records'},{w:7,t:'Joint Venture — Accounting Treatment'},{w:8,t:'Consignment Accounts'},{w:9,t:'Bills of Exchange — Drawee and Drawer'}],
    'Second Term':[{w:1,t:'Company Accounts — Final Accounts Revision'},{w:2,t:'Published Accounts — Format and Interpretation'},{w:3,t:'Ratio Analysis — Profitability, Liquidity, Efficiency'},{w:4,t:'Cash Flow Statements — Preparation'},{w:5,t:'Interpretation of Financial Statements'},{w:6,t:'WAEC Accounting Past Questions Practice (1)'},{w:7,t:'WAEC Accounting Past Questions Practice (2)'},{w:8,t:'Mock WAEC — Financial Accounting'},{w:9,t:'Examination Techniques for WAEC Accounting'}],
    'Third Term':[{w:1,t:'Final Revision — Books of Original Entry'},{w:2,t:'Final Revision — Final Accounts'},{w:3,t:'Final Revision — Company and Partnership Accounts'},{w:4,t:'Final Revision — Non-Profit and Incomplete Records'},{w:5,t:'Final Revision'},{w:6,t:'Examination Preparation'}]
  }},

  // ─── SS1 ───
  'eng-s1':{name:'English Language',cls:'SS1',ico:'📖',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Comprehension — Reading for Main Ideas'},{w:2,t:'Vocabulary — Synonyms & Antonyms'},{w:3,t:'Concord: Subject-Verb Agreement'},{w:4,t:'Narrative Essay Writing'},{w:5,t:'Comprehension — Reading for Inference'},{w:6,t:'Speech Sounds — Vowels & Consonants'},{w:7,t:'Letter Writing — Formal Letters'},{w:8,t:'Summary Writing Skills'},{w:9,t:'Continuous Writing — Story Development'}],
    'Second Term':[{w:1,t:'Figurative Language & Idioms'},{w:2,t:'Descriptive Essay Writing'},{w:3,t:'Sentence Types & Transformation'},{w:4,t:'Oral English — Stress & Intonation'},{w:5,t:'Letter Writing — Informal Letters'},{w:6,t:'Register & Varieties of Language'},{w:7,t:'Comprehension — Reading for Evaluation'},{w:8,t:'Argumentative Essay Writing'},{w:9,t:'Punctuation & Mechanics'}],
    'Third Term':[{w:1,t:'Lexis & Structure Revision'},{w:2,t:'Technical Report Writing — Introduction'},{w:3,t:'Grammar Revision — Tenses & Clauses'},{w:4,t:'Past Questions Practice — English SS1'},{w:5,t:'Oral English Revision — All Sounds'},{w:6,t:'Essay Revision — All Types'}]
  }},
  'mth-s1':{name:'General Mathematics',cls:'SS1',ico:'🧮',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Number Bases — Conversion Between Bases'},{w:2,t:'Number Bases — Operations in Base 2, 8, 10'},{w:3,t:'Indices — Laws & Applications'},{w:4,t:'Standard Form & Scientific Notation'},{w:5,t:'Logarithms — Laws & Tables'},{w:6,t:'Logarithms — Calculations & Applications'},{w:7,t:'Sets — Definition, Types, Notation'},{w:8,t:'Sets — Union, Intersection, Complement'},{w:9,t:'Venn Diagrams — 2-Set Problems'},{w:10,t:'Venn Diagrams — 3-Set Problems'}],
    'Second Term':[{w:1,t:'Algebraic Expressions — Simplification & Expansion'},{w:2,t:'Factorisation — Common Factor & Grouping'},{w:3,t:'Simple Linear Equations & Word Problems'},{w:4,t:'Quadratic Equations — Factorisation Method'},{w:5,t:'Quadratic Equations — Completing the Square'},{w:6,t:'Inequalities — Linear & Quadratic'},{w:7,t:'Simultaneous Equations — Elimination & Substitution'},{w:8,t:'Mensuration — Perimeter & Area of Plane Shapes'},{w:9,t:'Statistics — Frequency Tables, Bar Charts, Pie Charts'}],
    'Third Term':[{w:1,t:'Geometry — Angles at a Point & on a Line'},{w:2,t:'Geometry — Triangles — Types & Properties'},{w:3,t:'Geometry — Polygons — Interior & Exterior Angles'},{w:4,t:'Trigonometry — SOHCAHTOA — Introduction'},{w:5,t:'Trigonometry — Angles of Elevation & Depression'},{w:6,t:'Coordinate Geometry — Plotting Points & Distance'},{w:7,t:'Transformation — Reflection & Rotation'},{w:8,t:'Revision & Past Questions Practice'}]
  }},
  'bio-s1':{name:'Biology',cls:'SS1',ico:'🔬',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Classification of Living Things — Five Kingdoms'},{w:2,t:'Kingdom Monera — Bacteria & Blue-Green Algae'},{w:3,t:'Kingdom Protoctista — Amoeba, Euglena, Paramecium'},{w:4,t:'Kingdom Fungi — Structure & Importance'},{w:5,t:'Kingdom Plantae — Major Divisions'},{w:6,t:'Kingdom Animalia — Major Phyla'},{w:7,t:'Cell Structure — Plant & Animal Cell (Differences)'},{w:8,t:'Cell Organelles — Nucleus, Mitochondria, Chloroplast'},{w:9,t:'Cell Membrane & Osmosis'},{w:10,t:'Levels of Organisation — Cell to Organism'}],
    'Second Term':[{w:1,t:'Nutrition in Plants — Photosynthesis (Light & Dark Reactions)'},{w:2,t:'Mineral Requirements of Plants — Macronutrients & Micronutrients'},{w:3,t:'Nutrition in Animals — Holozoic, Parasitic, Saprophytic'},{w:4,t:'Human Digestive System — Organs & Functions'},{w:5,t:'Enzymes in Digestion — Amylase, Pepsin, Lipase'},{w:6,t:'Respiration — Aerobic: Equation & Steps'},{w:7,t:'Respiration — Anaerobic: Yeast & Muscles'},{w:8,t:'Gas Exchange in Plants — Stomata & Lenticels'},{w:9,t:'Gas Exchange in Animals — Gills, Trachea, Lungs'}],
    'Third Term':[{w:1,t:'Excretion in Plants — Carbon Dioxide, Oxygen, Resins'},{w:2,t:'Excretion in Humans — The Kidneys: Structure & Function'},{w:3,t:'The Liver as an Excretory Organ'},{w:4,t:'Transport in Plants — Xylem & Phloem'},{w:5,t:'Osmosis in Plants — Turgor & Plasmolysis'},{w:6,t:'Transport in Humans — The Heart & Double Circulation'},{w:7,t:'Blood — Components, Groups & Transfusion'},{w:8,t:'Reproduction in Plants — Asexual & Sexual'},{w:9,t:'Revision & Practice Questions — SS1 Biology'}]
  }},
  'chm-s1':{name:'Chemistry',cls:'SS1',ico:'⚗️',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Introduction to Chemistry — Meaning, Branches, Importance'},{w:2,t:'Laboratory Safety Rules & Common Apparatus'},{w:3,t:'Matter — States, Properties & Interconversion'},{w:4,t:'Elements, Compounds & Mixtures — Differences'},{w:5,t:'Separation Techniques — Filtration, Evaporation, Distillation'},{w:6,t:'Separation Techniques — Chromatography, Crystallisation'},{w:7,t:'Physical & Chemical Changes'},{w:8,t:'Atomic Theory — Dalton, Thomson, Rutherford, Bohr'},{w:9,t:'Structure of the Atom — Protons, Neutrons, Electrons'},{w:10,t:'Atomic Number, Mass Number & Isotopes'}],
    'Second Term':[{w:1,t:'Electronic Configuration — Shells & Subshells'},{w:2,t:'Periodic Table — Groups, Periods & Trends'},{w:3,t:'Chemical Bonding — Ionic Bonding'},{w:4,t:'Chemical Bonding — Covalent Bonding'},{w:5,t:'Metallic Bonding & Hydrogen Bonding'},{w:6,t:'Chemical Symbols, Formulae & Equations'},{w:7,t:'Laws of Chemical Combination — Conservation, Definite & Multiple Proportions'},{w:8,t:'Relative Atomic Mass & Mole Concept'},{w:9,t:'Empirical & Molecular Formulae'}],
    'Third Term':[{w:1,t:'Acids — Definition, Properties & Examples'},{w:2,t:'Bases & Alkalis — Properties & Examples'},{w:3,t:'pH Scale & Indicators'},{w:4,t:'Salts — Types & Preparation Methods'},{w:5,t:'Water — Sources, Properties & Purification'},{w:6,t:'Hard & Soft Water — Causes & Treatment'},{w:7,t:'Air — Composition & Importance of Oxygen, Nitrogen'},{w:8,t:'Pollution — Air & Water Pollution in Nigeria'},{w:9,t:'Revision & Past Questions — SS1 Chemistry'}]
  }},
  'phy-s1':{name:'Physics',cls:'SS1',ico:'⚡',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Meaning of Physics — Scope, Branches & Importance'},{w:2,t:'Physical Quantities — Fundamental & Derived'},{w:3,t:'SI Units — Symbols & Conversions'},{w:4,t:'Measuring Instruments — Metre Rule, Vernier Calliper'},{w:5,t:'Measuring Instruments — Micrometer Screw Gauge, Stopwatch'},{w:6,t:'Scalars & Vectors — Definitions & Examples'},{w:7,t:'Vector Addition — Triangle & Parallelogram Rule'},{w:8,t:'Position, Distance & Displacement'},{w:9,t:'Speed, Velocity & Acceleration — Calculations'},{w:10,t:'Displacement-Time & Velocity-Time Graphs'}],
    'Second Term':[{w:1,t:'Equations of Uniformly Accelerated Motion'},{w:2,t:'Projectile Motion — Introduction'},{w:3,t:'Circular Motion & Centripetal Force'},{w:4,t:'Friction — Static & Kinetic, Advantages & Disadvantages'},{w:5,t:'Newton\'s Laws of Motion — First, Second, Third'},{w:6,t:'Work, Energy & Power — Formulas & Problems'},{w:7,t:'Forms of Energy & Energy Conversion'},{w:8,t:'Heat & Temperature — Concepts & Differences'},{w:9,t:'Measurement of Temperature — Thermometers & Scales'}],
    'Third Term':[{w:1,t:'Thermal Expansion of Solids — Linear, Area, Volume'},{w:2,t:'Thermal Expansion of Liquids & Gases'},{w:3,t:'Transmission of Heat — Conduction'},{w:4,t:'Transmission of Heat — Convection & Radiation'},{w:5,t:'Density & Relative Density — Calculations'},{w:6,t:'Pressure in Fluids — Archimedes\' Principle & Upthrust'},{w:7,t:'Light — Laws of Reflection & Plane Mirrors'},{w:8,t:'Refraction of Light — Snell\'s Law & Critical Angle'},{w:9,t:'Total Internal Reflection & Applications'},{w:10,t:'Revision & Past Questions — SS1 Physics'}]
  }},
  'geo-s1':{name:'Geography',cls:'SS1',ico:'🌍',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Introduction to Geography — Branches & Importance'},{w:2,t:'Maps — Types, Scale & Conventional Signs'},{w:3,t:'Map Reading — Grid References & Contour Lines'},{w:4,t:'Map Reading — Cross-Sections & Profiles'},{w:5,t:'The Earth — Shape, Size & Evidence'},{w:6,t:'Earth Movements — Rotation & Revolution'},{w:7,t:'Latitude & Longitude — Definition & Importance'},{w:8,t:'Time Zones & International Date Line'},{w:9,t:'The Solar System & Eclipse'}],
    'Second Term':[{w:1,t:'Internal Structure of the Earth — Core, Mantle, Crust'},{w:2,t:'Rock Formation — Igneous Rocks'},{w:3,t:'Rock Formation — Sedimentary Rocks'},{w:4,t:'Rock Formation — Metamorphic Rocks'},{w:5,t:'Folding & Faulting — Types & Landforms'},{w:6,t:'Weathering — Physical & Chemical'},{w:7,t:'Weathering — Biological & Products of Weathering'},{w:8,t:'Erosion & Deposition — Agents & Landforms'},{w:9,t:'Landforms — Mountains, Valleys, Plateaus, Plains'}],
    'Third Term':[{w:1,t:'Population — Meaning & Distribution in Nigeria'},{w:2,t:'Population — Growth Rates & Influencing Factors'},{w:3,t:'Population — Census & Its Problems in Nigeria'},{w:4,t:'Settlement — Types: Rural & Urban'},{w:5,t:'Settlement Patterns in Nigeria'},{w:6,t:'Migration — Types, Causes & Effects'},{w:7,t:'Population Policy in Nigeria'},{w:8,t:'Revision & Practice Questions — SS1 Geography'}]
  }},
  'gov-s1':{name:'Government',cls:'SS1',ico:'🏛️',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Meaning & Scope of Government'},{w:2,t:'Functions of Government'},{w:3,t:'Forms of Government — Democracy, Autocracy, Oligarchy'},{w:4,t:'Democracy — Features, Types & Importance'},{w:5,t:'Constitutionalism — Meaning & Importance'},{w:6,t:'Separation of Powers — Montesquieu & Nigeria'},{w:7,t:'Rule of Law — Meaning, Features & Limitations'},{w:8,t:'Checks & Balances — Application in Nigeria'},{w:9,t:'Sovereignty — Types & Importance'}],
    'Second Term':[{w:1,t:'The Legislature — Functions & Types (Unicameral & Bicameral)'},{w:2,t:'The Nigerian National Assembly — Senate & House of Reps'},{w:3,t:'The Executive — Presidential & Parliamentary Systems'},{w:4,t:'The Nigerian President & Federal Executive'},{w:5,t:'The Judiciary — Independence, Functions & Structure'},{w:6,t:'Federalism — Meaning, Features & Types'},{w:7,t:'Federalism in Nigeria — History & Structure'},{w:8,t:'Local Government in Nigeria — Meaning, Functions & Problems'},{w:9,t:'Intergovernmental Relations in Nigeria'}],
    'Third Term':[{w:1,t:'Political Parties in Nigeria — First Republic to Present'},{w:2,t:'Electoral System in Nigeria — Types & INEC'},{w:3,t:'The Electoral Process — Voter Registration to Results'},{w:4,t:'Citizenship — Types, Rights & Obligations'},{w:5,t:'Nationalism in Nigeria — Pioneers & Achievements'},{w:6,t:'Road to Independence — 1960'},{w:7,t:'Revision & Practice Questions — SS1 Government'}]
  }},
  'eco-s1':{name:'Economics',cls:'SS1',ico:'💰',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Introduction to Economics — Meaning, Scope & Scarcity'},{w:2,t:'Basic Concepts — Wants, Needs, Utility & Choice'},{w:3,t:'Opportunity Cost & Production Possibility Curve'},{w:4,t:'Demand — Law, Determinants & Demand Curve'},{w:5,t:'Demand — Shifts in Demand Curve'},{w:6,t:'Supply — Law, Determinants & Supply Curve'},{w:7,t:'Market Equilibrium — Price Determination'},{w:8,t:'Changes in Equilibrium — Shifts in Demand & Supply'},{w:9,t:'Price Mechanism — Functions & Limitations'}],
    'Second Term':[{w:1,t:'Elasticity of Demand — Price Elasticity (PED) Calculation'},{w:2,t:'Elasticity of Demand — Income & Cross Elasticity'},{w:3,t:'Elasticity of Supply — Calculation & Factors'},{w:4,t:'Theory of Consumer Behaviour — Utility & Indifference Curves'},{w:5,t:'Theory of Production — Factors of Production'},{w:6,t:'Law of Diminishing Returns'},{w:7,t:'Cost Theory — Fixed, Variable, Total & Average Costs'},{w:8,t:'Revenue — Total, Average & Marginal Revenue'},{w:9,t:'Break-Even Analysis'}],
    'Third Term':[{w:1,t:'Money — Functions, Characteristics & Types'},{w:2,t:'Demand for Money — Motives'},{w:3,t:'Banking — Types & Functions of Banks'},{w:4,t:'Central Bank of Nigeria (CBN) — Functions & Monetary Policy'},{w:5,t:'Commercial Banks — Functions & Credit Creation'},{w:6,t:'Money Supply & Inflation — Causes & Control'},{w:7,t:'Revision & Practice Questions — SS1 Economics'}]
  }},
  'lit-s1':{name:'Literature in English',cls:'SS1',ico:'📚',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Introduction to Literature — Genres: Prose, Poetry, Drama'},{w:2,t:'Poetry — Elements: Rhythm, Rhyme, Metre'},{w:3,t:'Poetry — Tone, Mood & Theme'},{w:4,t:'Drama — Plot, Conflict & Stage Directions'},{w:5,t:'Drama — Character Analysis'},{w:6,t:'Prose Fiction — Setting, Characterisation, Theme'},{w:7,t:'Oral Literature — Proverbs, Riddles, Folktales in Nigeria'},{w:8,t:'Prescribed Drama Text — Act-by-Act Study'},{w:9,t:'African Literature — Historical Context'}],
    'Second Term':[{w:1,t:'Poetry Analysis — Figures of Speech: Simile, Metaphor, Personification'},{w:2,t:'Poetry Analysis — Imagery & Symbolism'},{w:3,t:'WAEC Set Poems — Detailed Study (Poem 1 & 2)'},{w:4,t:'The Novel — Narrative Techniques'},{w:5,t:'Prescribed Novel — Chapter Summary & Analysis'},{w:6,t:'Theme Identification in Prescribed Text'},{w:7,t:'Characterisation — Protagonist, Antagonist & Minor Characters'},{w:8,t:'Critical Essay Writing on Literature'},{w:9,t:'Context & Style in Nigerian Literature'}],
    'Third Term':[{w:1,t:'WAEC Set Poems — Detailed Study (Poem 3 & 4)'},{w:2,t:'Play Text Analysis — Detailed Study'},{w:3,t:'Comparative Study of All Prescribed Texts'},{w:4,t:'Essay Writing — Planning, Structure & Practice'},{w:5,t:'Revision — All Prescribed Texts'},{w:6,t:'Practice Questions — SS1 Literature'}]
  }},
  'acc-s1':{name:'Financial Accounting',cls:'SS1',ico:'📊',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Introduction to Accounting — Meaning, Importance & Branches'},{w:2,t:'Basic Accounting Concepts & Conventions'},{w:3,t:'Books of Original Entry — Cash Book (2-Column)'},{w:4,t:'Cash Book — 3-Column Cash Book'},{w:5,t:'Petty Cash Book — Imprest System'},{w:6,t:'Day Books — Sales, Purchases, Returns'},{w:7,t:'Journal Proper — Uses & Format'},{w:8,t:'Ledger Accounts — Personal, Real & Nominal'},{w:9,t:'Double Entry Bookkeeping — Principles'},{w:10,t:'Posting from Subsidiary Books to Ledger'}],
    'Second Term':[{w:1,t:'Trial Balance — Preparation & Purpose'},{w:2,t:'Errors & Their Correction'},{w:3,t:'Suspense Account'},{w:4,t:'Bank Reconciliation Statement'},{w:5,t:'Control Accounts — Debtors & Creditors'},{w:6,t:'Final Accounts — Trading Account'},{w:7,t:'Profit & Loss Account'},{w:8,t:'Balance Sheet — Format & Preparation'},{w:9,t:'Adjustments in Final Accounts — Accruals & Prepayments'}],
    'Third Term':[{w:1,t:'Adjustments — Depreciation (Straight Line & Reducing Balance)'},{w:2,t:'Provision for Bad & Doubtful Debts'},{w:3,t:'Incomplete Records — Introduction'},{w:4,t:'Revision & Practice Questions — SS1 Accounts'}]
  }},

  // ─── SS2 ───
  'eng-s2':{name:'English Language',cls:'SS2',ico:'📖',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Comprehension — Reading for Specific Details'},{w:2,t:'Vocabulary — Idioms & Figures of Speech'},{w:3,t:'Argumentative Essay Writing'},{w:4,t:'Lexis & Structure — Synonyms & Antonyms Revision'},{w:5,t:'Comprehension — Reading to Summarise'},{w:6,t:'Expository Essay Writing'},{w:7,t:'Oral English — Stress & Intonation (Advanced)'},{w:8,t:'Letter Writing — Informal Letters Revision'},{w:9,t:'Summary Writing Practice'},{w:10,t:'Continuous Writing — Report Writing Intro'}],
    'Second Term':[{w:1,t:'Précis Writing — Techniques & Practice'},{w:2,t:'Comprehension — Critical Reading'},{w:3,t:'Creative Writing — Narrative Voice & Style'},{w:4,t:'Oral English — Tones & Rhythm'},{w:5,t:'Official & Semi-Official Letters'},{w:6,t:'Speech & Dialogue Writing'},{w:7,t:'Figures of Speech — Advanced (Irony, Paradox, Oxymoron)'},{w:8,t:'Parts of Speech Revision — Gerunds, Participles, Infinitives'},{w:9,t:'Comprehension — Cloze Passage'}],
    'Third Term':[{w:1,t:'Essay Types Revision — Narrative, Descriptive, Argumentative, Expository'},{w:2,t:'Reading Comprehension — Speed & Accuracy'},{w:3,t:'Grammar Revision — Concord, Tenses & Clause Types'},{w:4,t:'WAEC English Paper Format — Familiarisation'},{w:5,t:'Past Questions Practice — SS2 English'},{w:6,t:'Oral English — Full Sound System Revision'}]
  }},
  'mth-s2':{name:'General Mathematics',cls:'SS2',ico:'🧮',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Revision of SS1 — Number Bases, Indices, Logarithms'},{w:2,t:'Logarithms — Advanced: Common & Natural'},{w:3,t:'Surds — Introduction, Simplification & Rationalisation'},{w:4,t:'Surds — Operations: Addition, Subtraction, Multiplication'},{w:5,t:'Variation — Direct Variation'},{w:6,t:'Variation — Inverse & Joint Variation'},{w:7,t:'Partial Variation & Mixed Variation'},{w:8,t:'Arithmetic Progression (AP) — nth Term & Sum'},{w:9,t:'Geometric Progression (GP) — nth Term & Sum'},{w:10,t:'GP — Sum to Infinity'}],
    'Second Term':[{w:1,t:'Quadratic Equations — Graphical Method'},{w:2,t:'Quadratic Equations — Completing the Square (Revision)'},{w:3,t:'Quadratic Equations — Formula & Discriminant'},{w:4,t:'Matrices — Definition, Types & Notation'},{w:5,t:'Matrices — Addition, Subtraction & Multiplication'},{w:6,t:'Determinants — 2×2 & 3×3'},{w:7,t:'Inverse of a 2×2 Matrix & Simultaneous Equations'},{w:8,t:'Mensuration — Surface Area of Cone, Sphere, Cylinder'},{w:9,t:'Mensuration — Volume of Cone, Sphere, Cylinder'},{w:10,t:'Statistics — Frequency Distribution & Histograms'}],
    'Third Term':[{w:1,t:'Statistics — Mean, Median, Mode from Frequency Table'},{w:2,t:'Statistics — Cumulative Frequency & Ogive'},{w:3,t:'Probability — Basic Concepts, Sample Space, Events'},{w:4,t:'Probability — Addition & Multiplication Rules'},{w:5,t:'Circle Theorems — Angle Properties'},{w:6,t:'Further Trigonometry — Sine Rule'},{w:7,t:'Further Trigonometry — Cosine Rule'},{w:8,t:'Bearing & Distances — Problem Solving'},{w:9,t:'Coordinate Geometry — Gradient, Distance & Midpoint'},{w:10,t:'Revision & WAEC Format Practice'}]
  }},
  'bio-s2':{name:'Biology',cls:'SS2',ico:'🔬',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Cell Division — Mitosis: Stages (PMAT) & Significance'},{w:2,t:'Cell Division — Meiosis: Stages & Differences from Mitosis'},{w:3,t:'Genetics — Mendelian Laws: Law of Segregation'},{w:4,t:'Genetics — Law of Independent Assortment'},{w:5,t:'Monohybrid Cross — Worked Examples'},{w:6,t:'Dihybrid Cross — Worked Examples'},{w:7,t:'Codominance & Incomplete Dominance'},{w:8,t:'Sex Determination — XX & XY System'},{w:9,t:'Sex-Linked Traits — Colour Blindness, Haemophilia'},{w:10,t:'Chromosomal Abnormalities — Down Syndrome etc.'}],
    'Second Term':[{w:1,t:'Excretion in Humans — The Kidneys: Structure & Nephron'},{w:2,t:'Kidney Function — Ultrafiltration & Reabsorption'},{w:3,t:'Homeostasis — Osmoregulation'},{w:4,t:'Homeostasis — Thermoregulation'},{w:5,t:'Support & Movement — The Skeleton: Axial & Appendicular'},{w:6,t:'Joints — Types & Movement'},{w:7,t:'Muscles — Voluntary, Involuntary & Cardiac'},{w:8,t:'The Nervous System — CNS & PNS'},{w:9,t:'Reflex Action & Reflex Arc — Diagram & Description'},{w:10,t:'Sensory Organs — The Eye: Structure & Function'}],
    'Third Term':[{w:1,t:'Sensory Organs — The Ear: Structure & Function'},{w:2,t:'The Endocrine System — Glands & Their Hormones'},{w:3,t:'Hormonal vs Nervous Control — Comparison'},{w:4,t:'Growth & Development — Stages in Humans & Plants'},{w:5,t:'Population Studies — Density, Natality, Mortality'},{w:6,t:'Reproduction in Humans — Male Reproductive System'},{w:7,t:'Reproduction in Humans — Female Reproductive System'},{w:8,t:'Reproductive Health — STIs, Family Planning'},{w:9,t:'Revision & Practice Questions — SS2 Biology'}]
  }},
  'chm-s2':{name:'Chemistry',cls:'SS2',ico:'⚗️',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Periodic Table — History: Dobereiner, Newlands, Mendeleev, Modern'},{w:2,t:'Periodic Table — Groups & Periods: Trends in Properties'},{w:3,t:'Metallic & Non-Metallic Character Trends'},{w:4,t:'Oxidation & Reduction — Definitions & Identification'},{w:5,t:'Oxidation Numbers — Rules & Calculation'},{w:6,t:'Balancing Redox Equations'},{w:7,t:'Mass-Volume Relationships — Mole Calculations'},{w:8,t:'Stoichiometry — Limiting Reagent & Percentage Yield'},{w:9,t:'Electrolysis — Electrolytes & Electrodes'},{w:10,t:'Electrolysis — Products at Electrodes, Faraday\'s Laws'}],
    'Second Term':[{w:1,t:'Electrode Potential & Electrochemical Series'},{w:2,t:'Electrochemical Cells — Galvanic & Electrolytic'},{w:3,t:'Acid-Base Reactions — Theories (Arrhenius, Brønsted-Lowry)'},{w:4,t:'Neutralisation — Calculations & Titration'},{w:5,t:'Rates of Chemical Reaction — Factors Affecting Rate'},{w:6,t:'Collision Theory & Activation Energy'},{w:7,t:'Energy Changes — Exothermic & Endothermic Reactions'},{w:8,t:'Hess\'s Law & Enthalpy Calculations'},{w:9,t:'Chemical Equilibrium — Le Chatelier\'s Principle'},{w:10,t:'Equilibrium Constant (Kc) — Calculations'}],
    'Third Term':[{w:1,t:'Nitrogen & Its Compounds — Properties & Haber Process'},{w:2,t:'Nitrogen — Nitric Acid: Ostwald Process'},{w:3,t:'Sulphur & Its Compounds — Contact Process'},{w:4,t:'Sulphuric Acid — Properties, Uses & Industrial Production'},{w:5,t:'Chlorine & Its Compounds — Chlorination of Water'},{w:6,t:'Oxygen & Its Compounds — Hydrogen Peroxide'},{w:7,t:'Carbon & Its Allotropes — Graphite & Diamond'},{w:8,t:'Carbon Compounds — Carbon(IV) Oxide & Fuels'},{w:9,t:'Revision & Practice Questions — SS2 Chemistry'}]
  }},
  'phy-s2':{name:'Physics',cls:'SS2',ico:'⚡',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Linear Momentum — Definition & Calculations'},{w:2,t:'Impulse — Relationship to Momentum'},{w:3,t:'Conservation of Momentum — Elastic & Inelastic Collisions'},{w:4,t:'Mechanical Energy — Kinetic & Potential Energy'},{w:5,t:'Work-Energy Theorem — Calculations'},{w:6,t:'Simple Machines — Levers: Classes 1, 2, 3'},{w:7,t:'Simple Machines — Pulleys & Mechanical Advantage'},{w:8,t:'Simple Machines — Inclined Plane & Efficiency'},{w:9,t:'Simple Machines — Wheel & Axle, Screws'},{w:10,t:'Revision — Mechanics Problems'}],
    'Second Term':[{w:1,t:'Heat Energy — Specific Heat Capacity: Calculations'},{w:2,t:'Latent Heat — Specific Latent Heat of Fusion & Vaporisation'},{w:3,t:'Gas Laws — Boyle\'s Law (P-V Relationship)'},{w:4,t:'Gas Laws — Charles\'s Law (V-T Relationship)'},{w:5,t:'Gas Laws — Pressure Law (P-T Relationship)'},{w:6,t:'Combined & Ideal Gas Equation'},{w:7,t:'Wave Motion — Types: Transverse & Longitudinal'},{w:8,t:'Wave Properties — Amplitude, Frequency, Wavelength, Speed'},{w:9,t:'Sound Waves — Production, Properties & Speed'},{w:10,t:'Resonance, Echoes & Musical Instruments'}],
    'Third Term':[{w:1,t:'Light Waves — Diffraction & Interference'},{w:2,t:'Lenses — Converging & Diverging: Ray Diagrams'},{w:3,t:'Lenses — Magnification & Lens Formula'},{w:4,t:'Optical Instruments — Camera, Microscope, Telescope'},{w:5,t:'Static Electricity — Charging by Friction & Induction'},{w:6,t:'Coulomb\'s Law & Electric Fields'},{w:7,t:'Electric Potential & Capacitors'},{w:8,t:'Current Electricity — Ohm\'s Law & Resistors in Circuits'},{w:9,t:'Electrical Energy & Power — Calculations'},{w:10,t:'Revision & Practice Questions — SS2 Physics'}]
  }},
  'geo-s2':{name:'Geography',cls:'SS2',ico:'🌍',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Atmosphere — Composition, Layers & Importance'},{w:2,t:'Climate & Weather — Differences & Elements'},{w:3,t:'Factors Affecting Climate — Latitude, Altitude, Ocean Currents'},{w:4,t:'Climate Regions of Nigeria — Equatorial, Sudan, Sahel'},{w:5,t:'Rainfall Types — Convectional, Frontal, Relief'},{w:6,t:'Temperature — Mean, Range & Distribution in Nigeria'},{w:7,t:'Wind — Types: Trade, Monsoon, Harmattan in Nigeria'},{w:8,t:'Humidity & Clouds — Types & Measurement'},{w:9,t:'Climate Change — Causes & Effects on Nigeria'}],
    'Second Term':[{w:1,t:'Rivers — Formation & River Systems in Nigeria'},{w:2,t:'River Niger — Course, Tributaries & Importance'},{w:3,t:'River Benue — Course & Importance'},{w:4,t:'River Processes — Erosion, Transportation, Deposition'},{w:5,t:'River Landforms — V-Valleys, Meanders, Deltas'},{w:6,t:'The Niger Delta — Formation, Resources & Problems'},{w:7,t:'Drainage Patterns — Dendritic, Trellis, Radial'},{w:8,t:'Coastal Landforms — Beaches, Cliffs, Spits, Lagoons'},{w:9,t:'Lagos Lagoon & Victoria Island — Geography'}],
    'Third Term':[{w:1,t:'Agriculture in Nigeria — Types & Importance'},{w:2,t:'Cash Crops — Cocoa, Palm Oil, Groundnut, Cotton'},{w:3,t:'Food Crops — Cassava, Yam, Maize, Rice Distribution'},{w:4,t:'Fishing in Nigeria — Types & Importance'},{w:5,t:'Problems of Nigerian Agriculture'},{w:6,t:'Solutions — Government Agricultural Policies (ADP, Green Revolution)'},{w:7,t:'Forestry in Nigeria — Types & Deforestation'},{w:8,t:'Revision & Practice Questions — SS2 Geography'}]
  }},
  'gov-s2':{name:'Government',cls:'SS2',ico:'🏛️',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Nigerian Constitutions — 1922 Clifford Constitution'},{w:2,t:'Nigerian Constitutions — 1946 Richards & 1951 Macpherson'},{w:3,t:'Nigerian Constitutions — 1954 Lyttleton & 1960 Independence'},{w:4,t:'1963 Republican & 1979 Second Republic Constitution'},{w:5,t:'1989 & 1999 Constitution — Key Provisions'},{w:6,t:'Fundamental Human Rights — Chapter IV of 1999 Constitution'},{w:7,t:'Enforcement of Human Rights — Courts & Processes'},{w:8,t:'Rule of Law — Meaning, Features & Problems in Nigeria'},{w:9,t:'Military Interventions — 1966, 1975, 1983, 1993 Coups'}],
    'Second Term':[{w:1,t:'The Nigerian Civil War — Causes (1967–1970)'},{w:2,t:'Civil War — Events, Key Figures & Aftermath'},{w:3,t:'Post-War Reconstruction — 3Rs: Reconciliation, Rehabilitation, Reconstruction'},{w:4,t:'ECOWAS — Formation, Structure & Functions'},{w:5,t:'African Union (AU) — Formation, Structure & Functions'},{w:6,t:'United Nations (UN) — Formation, Organs & Nigeria\'s Role'},{w:7,t:'Nigeria\'s Foreign Policy — Principles & Black Africa Focus'},{w:8,t:'Nigeria in International Organisations — Commonwealth, G77'},{w:9,t:'Nigeria\'s Diplomatic Relations — Bilateral & Multilateral'}],
    'Third Term':[{w:1,t:'Corruption in Nigeria — Causes, Types & Effects'},{w:2,t:'EFCC — Formation, Structure & Achievements'},{w:3,t:'ICPC — Formation & Functions'},{w:4,t:'Good Governance — Features & Importance'},{w:5,t:'Democratic Consolidation in Nigeria — Challenges'},{w:6,t:'Political Apathy & Civic Participation'},{w:7,t:'Revision & Practice Questions — SS2 Government'}]
  }},
  'eco-s2':{name:'Economics',cls:'SS2',ico:'💰',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'National Income — Meaning, Concepts: GDP, GNP, NNP'},{w:2,t:'Methods of Measuring National Income — Output, Income, Expenditure'},{w:3,t:'Difficulties in Measuring National Income in Nigeria'},{w:4,t:'Standard of Living — HDI & Per Capita Income'},{w:5,t:'Government Revenue — Taxes, Oil Revenue, Grants'},{w:6,t:'Government Expenditure — Types & Importance'},{w:7,t:'Taxation — Types: Direct & Indirect'},{w:8,t:'Effects of Taxation on Production & Distribution'},{w:9,t:'Nigeria\'s Budget — Preparation, Types & Deficit'}],
    'Second Term':[{w:1,t:'International Trade — Reasons, Benefits & Drawbacks'},{w:2,t:'Theory of Comparative Advantage'},{w:3,t:'Balance of Trade — Favourable & Unfavourable'},{w:4,t:'Balance of Payments — Components & Equilibrium'},{w:5,t:'Foreign Exchange — Meaning & Determination of Exchange Rate'},{w:6,t:'Nigeria\'s External Trade — Major Exports & Imports'},{w:7,t:'Economic Integration — ECOWAS: Trade & Free Movement'},{w:8,t:'Trade Barriers — Tariffs, Quotas & Embargoes'},{w:9,t:'WTO & Its Implications for Nigeria'}],
    'Third Term':[{w:1,t:'Agriculture — Economic Importance & Problems in Nigeria'},{w:2,t:'Industry in Nigeria — Types, Problems & Solutions'},{w:3,t:'Petroleum Sector — Role in Nigerian Economy'},{w:4,t:'Unemployment — Types: Structural, Cyclical, Frictional'},{w:5,t:'Unemployment — Causes & Solutions in Nigeria'},{w:6,t:'Poverty in Nigeria — Causes, Effects & Government Policies'},{w:7,t:'Revision & Practice Questions — SS2 Economics'}]
  }},
  'lit-s2':{name:'Literature in English',cls:'SS2',ico:'📚',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Advanced Poetry — Speaker, Tone & Voice'},{w:2,t:'WAEC Set Poems — Detailed Study (Poem 5 & 6)'},{w:3,t:'Nigerian Literature — Overview: Achebe, Soyinka, Clark'},{w:4,t:'Post-Colonial Literature — Themes & Context'},{w:5,t:'Prescribed Drama — Act-by-Act Detailed Study'},{w:6,t:'Characterisation in Drama — Hero, Villain, Foil'},{w:7,t:'Conflict in Drama — Internal vs External'},{w:8,t:'Dramatic Devices — Soliloquy, Aside, Deus Ex Machina'},{w:9,t:'Theme Analysis — Major & Minor Themes'}],
    'Second Term':[{w:1,t:'Prescribed Novel — Chapter-by-Chapter Study'},{w:2,t:'Setting — Physical, Social, Historical Context'},{w:3,t:'Point of View — First Person, Third Person, Omniscient'},{w:4,t:'Feminism in African Literature — Key Works'},{w:5,t:'Post-Colonial Themes — Identity, Alienation, Hybridity'},{w:6,t:'Style & Language in Prescribed Novel'},{w:7,t:'Critical Appreciation of Set Poems'},{w:8,t:'Essay Writing — Answering Literature Questions'},{w:9,t:'Comparative Study — Drama & Novel'}],
    'Third Term':[{w:1,t:'Comparative Analysis — All Three Prescribed Texts'},{w:2,t:'Essay Structure & Planning for WAEC Literature'},{w:3,t:'WAEC Literature Format Practice — Objective Questions'},{w:4,t:'WAEC Literature Format Practice — Essay Questions'},{w:5,t:'Revision — All Prescribed Texts'},{w:6,t:'Practice Questions — SS2 Literature'}]
  }},
  'acc-s2':{name:'Financial Accounting',cls:'SS2',ico:'📊',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Departmental Accounts — Preparation & Purpose'},{w:2,t:'Branch Accounts — Dependent & Independent Branches'},{w:3,t:'Manufacturing Accounts — Format & Preparation'},{w:4,t:'Partnership Accounts — Formation & Agreement'},{w:5,t:'Partnership — Capital & Current Accounts'},{w:6,t:'Partnership — Distribution of Profits & Losses'},{w:7,t:'Partnership — Admission of a New Partner'},{w:8,t:'Partnership — Retirement & Death of a Partner'},{w:9,t:'Dissolution of Partnership — Realization Account'}],
    'Second Term':[{w:1,t:'Company Accounts — Types of Companies'},{w:2,t:'Share Capital — Ordinary & Preference Shares'},{w:3,t:'Issue of Shares — At Par, Premium & Discount'},{w:4,t:'Debentures — Types & Accounting Treatment'},{w:5,t:'Company Final Accounts — Trading & P&L Account'},{w:6,t:'Company Balance Sheet — Format'},{w:7,t:'Cash Flow Statements — Indirect Method'},{w:8,t:'Non-Profit Organisations — Receipts & Payments'},{w:9,t:'Non-Profit — Income & Expenditure Account'}],
    'Third Term':[{w:1,t:'Ratio Analysis — Profitability Ratios'},{w:2,t:'Ratio Analysis — Liquidity & Efficiency Ratios'},{w:3,t:'Interpretation of Financial Statements'},{w:4,t:'Revision & Practice Questions — SS2 Accounts'}]
  }},

  // ─── SS3 ───
  'eng-s3':{name:'English Language',cls:'SS3',ico:'📖',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'WAEC Comprehension Format — Paper 1 Practice'},{w:2,t:'WAEC Comprehension — Answering Techniques'},{w:3,t:'Essay Writing — Descriptive & Reflective (WAEC Standard)'},{w:4,t:'Essay Writing — Argumentative (WAEC Standard)'},{w:5,t:'Summary Writing — WAEC Format & Marking'},{w:6,t:'Register & Varieties of English — WAEC Format'},{w:7,t:'Oral English — Full Sound System Revision'},{w:8,t:'Oral English — Stress, Rhythm & Intonation Revision'},{w:9,t:'Letter & Report Writing — WAEC Format Revision'}],
    'Second Term':[{w:1,t:'WAEC Past Questions — Comprehension (2020–2023)'},{w:2,t:'WAEC Past Questions — Summary (2020–2023)'},{w:3,t:'WAEC Past Questions — Essay (2020–2023)'},{w:4,t:'WAEC Past Questions — Oral English'},{w:5,t:'WAEC Past Questions — Lexis & Structure'},{w:6,t:'Mock Examination Practice — Full Paper'},{w:7,t:'Final Revision — All Topics'}],
    'Third Term':[{w:1,t:'WAEC Pre-Exam Revision — Comprehension'},{w:2,t:'WAEC Pre-Exam Revision — Essay & Summary'},{w:3,t:'Final Mock Paper — Complete WAEC Format'}]
  }},
  'mth-s3':{name:'General Mathematics',cls:'SS3',ico:'🧮',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Revision — Indices & Logarithms'},{w:2,t:'Surds — Advanced Operations & Rationalisation'},{w:3,t:'Quadratic Equations — Factorisation & Formula (Revision)'},{w:4,t:'Coordinate Geometry — Equation of a Straight Line'},{w:5,t:'Coordinate Geometry — Gradient, Intercepts, Parallel & Perpendicular Lines'},{w:6,t:'Mensuration — Surface Area & Volume (Cone, Sphere, Hemisphere)'},{w:7,t:'Trigonometry — Sine Rule: Applications'},{w:8,t:'Trigonometry — Cosine Rule: Applications'},{w:9,t:'Differentiation — First Principles & Power Rule'},{w:10,t:'Integration — Introduction & Power Rule'}],
    'Second Term':[{w:1,t:'Statistics — Mean, Median, Mode from Grouped Data'},{w:2,t:'Statistics — Standard Deviation & Variance'},{w:3,t:'Probability — Permutations & Combinations'},{w:4,t:'Probability — Binomial & Normal Distribution (Intro)'},{w:5,t:'Circle Theorems — All Properties Revision'},{w:6,t:'WAEC Past Questions — Mathematics (2020–2023)'},{w:7,t:'WAEC Past Questions — Mathematics (2018–2019)'},{w:8,t:'Mock Examination — Full Mathematics Paper'},{w:9,t:'Final Revision — All Topics'}],
    'Third Term':[{w:1,t:'WAEC Pre-Exam Revision — Number & Algebra'},{w:2,t:'WAEC Pre-Exam Revision — Geometry & Statistics'},{w:3,t:'Final Mock Paper — Complete WAEC Format'}]
  }},
  'bio-s3':{name:'Biology',cls:'SS3',ico:'🔬',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Evolution — Lamarck\'s Theory of Acquired Characteristics'},{w:2,t:'Evolution — Darwin\'s Theory of Natural Selection'},{w:3,t:'Evidence of Evolution — Fossil Record'},{w:4,t:'Evidence of Evolution — Comparative Anatomy & Embryology'},{w:5,t:'Ecology — Ecosystems: Biotic & Abiotic Components'},{w:6,t:'Energy Flow — Food Chains, Food Webs & Trophic Levels'},{w:7,t:'Energy Flow — Pyramids of Numbers, Biomass & Energy'},{w:8,t:'Population Ecology — Growth Curves: J-Curve & S-Curve'},{w:9,t:'Population Regulation — Carrying Capacity & Limiting Factors'},{w:10,t:'Nutrient Cycling — Carbon & Nitrogen Cycles'}],
    'Second Term':[{w:1,t:'Pollution — Air Pollution: Causes, Effects & Control'},{w:2,t:'Pollution — Water Pollution: Causes, Effects & Control'},{w:3,t:'Pollution — Soil Pollution & Oil Spills in Nigeria'},{w:4,t:'Conservation of Natural Resources in Nigeria'},{w:5,t:'Conservation — Wildlife, Forest & Marine Resources'},{w:6,t:'Biotechnology — Definition & Applications in Agriculture'},{w:7,t:'Biotechnology — Applications in Medicine (Insulin, Vaccines)'},{w:8,t:'Genetics Revision — Mendelian Laws & Crosses'},{w:9,t:'WAEC Past Questions — Biology (2020–2023)'}],
    'Third Term':[{w:1,t:'WAEC Pre-Exam Revision — Cell Biology & Genetics'},{w:2,t:'WAEC Pre-Exam Revision — Ecology & Evolution'},{w:3,t:'Final Mock Paper — Complete Biology WAEC Format'}]
  }},
  'chm-s3':{name:'Chemistry',cls:'SS3',ico:'⚗️',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Organic Chemistry — Introduction: Hybridisation & Homologous Series'},{w:2,t:'Alkanes — IUPAC Naming, Properties & Combustion'},{w:3,t:'Alkanes — Preparation: Reduction of Alkyl Halides'},{w:4,t:'Alkenes — IUPAC Naming, Addition Reactions'},{w:5,t:'Alkenes — Test for Unsaturation, Markovnikov\'s Rule'},{w:6,t:'Alkynes — Acetylene: Properties & Uses'},{w:7,t:'Aromatic Hydrocarbons — Benzene: Structure & Properties'},{w:8,t:'Aromatic Compounds — Substitution Reactions of Benzene'},{w:9,t:'Alcohols — Classification, IUPAC Naming & Properties'},{w:10,t:'Alcohols — Fermentation, Oxidation & Esterification'}],
    'Second Term':[{w:1,t:'Carboxylic Acids — Properties, Preparation & Uses'},{w:2,t:'Esters — Esterification, Uses & Saponification'},{w:3,t:'Fats & Oils — Structure & Soap Making'},{w:4,t:'Polymers — Addition Polymerisation: Polythene, PVC'},{w:5,t:'Polymers — Condensation Polymerisation: Nylon, Terylene'},{w:6,t:'Industrial Chemistry — Petrochemicals in Nigeria'},{w:7,t:'Qualitative Analysis — Tests for Functional Groups'},{w:8,t:'WAEC Past Questions — Chemistry (2020–2023)'},{w:9,t:'Mock Examination — Full Chemistry Paper'}],
    'Third Term':[{w:1,t:'WAEC Pre-Exam Revision — Physical & Inorganic Chemistry'},{w:2,t:'WAEC Pre-Exam Revision — Organic Chemistry'},{w:3,t:'Final Mock Paper — Complete Chemistry WAEC Format'}]
  }},
  'phy-s3':{name:'Physics',cls:'SS3',ico:'⚡',exam:'WAEC/NECO/JAMB',terms:{
    'First Term':[{w:1,t:'Simple Harmonic Motion — Definition, Examples & Equations'},{w:2,t:'SHM — Pendulum & Spring-Mass System'},{w:3,t:'Waves — Properties: Amplitude, Frequency, Wavelength & Speed (v=fλ)'},{w:4,t:'Electromagnetic Waves — Spectrum & Uses (Radio to Gamma)'},{w:5,t:'Sound Waves — Doppler Effect & Applications'},{w:6,t:'Ohm\'s Law — Revision & Circuit Analysis'},{w:7,t:'Resistors in Series & Parallel — Calculations'},{w:8,t:'Electromagnetic Induction — Faraday\'s Law'},{w:9,t:'Lenz\'s Law & Applications'},{w:10,t:'Alternating Current — RMS & Peak Values'}],
    'Second Term':[{w:1,t:'Transformers — Step-Up & Step-Down, Efficiency'},{w:2,t:'Nuclear Physics — Atomic Nucleus Structure'},{w:3,t:'Radioactivity — Alpha, Beta & Gamma Radiation'},{w:4,t:'Half-Life — Definition, Calculation & Applications'},{w:5,t:'Nuclear Reactions — Fission & Fusion'},{w:6,t:'Semi-Conductors — Intrinsic & Extrinsic'},{w:7,t:'Diodes — p-n Junction & Rectification'},{w:8,t:'Transistors — Types & Basic Amplifier'},{w:9,t:'Energy Production — Dams: Kainji, Jebba & Shiroro'},{w:10,t:'NigerSat 1 — Nigeria\'s Space Programme'}],
    'Third Term':[{w:1,t:'WAEC Pre-Exam Revision — Mechanics & Waves'},{w:2,t:'WAEC Pre-Exam Revision — Electricity & Modern Physics'},{w:3,t:'Final Mock Paper — Complete Physics WAEC Format'}]
  }},
  'geo-s3':{name:'Geography',cls:'SS3',ico:'🌍',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Natural Resources in Nigeria — Classification'},{w:2,t:'Petroleum — Exploration, Drilling & Refining in Nigeria'},{w:3,t:'Petroleum — Problems: Oil Spills, Gas Flaring, Niger Delta'},{w:4,t:'Solid Minerals — Coal (Enugu), Iron Ore, Tin (Jos Plateau)'},{w:5,t:'Solid Minerals — Limestone, Columbite & Gold'},{w:6,t:'Forests — Types, Distribution & Products in Nigeria'},{w:7,t:'Deforestation — Causes, Effects & Conservation'},{w:8,t:'Water Resources — Rivers, Dams & Irrigation in Nigeria'},{w:9,t:'Fishing — Types, Areas & Importance in Nigeria'}],
    'Second Term':[{w:1,t:'Industrialisation in Nigeria — History & Types of Industries'},{w:2,t:'Problems of Industrialisation in Nigeria'},{w:3,t:'Environmental Problems — Desertification in Northern Nigeria'},{w:4,t:'Environmental Problems — Flooding & Soil Erosion in SE Nigeria'},{w:5,t:'Conservation Strategies — Government Policies in Nigeria'},{w:6,t:'World Geography — Climate Regions of the World'},{w:7,t:'World Geography — Population Distribution Globally'},{w:8,t:'WAEC Past Questions — Geography (2020–2023)'},{w:9,t:'Mock Examination — Full Geography Paper'}],
    'Third Term':[{w:1,t:'WAEC Pre-Exam Revision — Physical Geography'},{w:2,t:'WAEC Pre-Exam Revision — Human & Economic Geography'},{w:3,t:'Final Mock Paper — Complete Geography WAEC Format'}]
  }},
  'gov-s3':{name:'Government',cls:'SS3',ico:'🏛️',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'1999 Constitution — Comprehensive Review: Executive, Legislature, Judiciary'},{w:2,t:'Fundamental Human Rights — Chapter IV: All Rights Listed'},{w:3,t:'Rule of Law & Democracy in Practice — Nigerian Examples'},{w:4,t:'Duties of Citizens — Paying Tax, Voting, Obeying Laws'},{w:5,t:'National Symbols — Flag, Coat of Arms, Anthem & Pledge'},{w:6,t:'National Integration — Unity in Diversity in Nigeria'},{w:7,t:'Corruption — Causes, Effects & Measures in Nigeria'},{w:8,t:'Anti-Corruption Agencies — EFCC, ICPC, CCB'},{w:9,t:'WAEC Past Questions — Government (2020–2023)'}],
    'Second Term':[{w:1,t:'Government Agencies — NNPC, CBN, NAFDAC, NDLEA'},{w:2,t:'Revision — Constitutional Development in Nigeria'},{w:3,t:'Revision — Political Parties & Elections in Nigeria'},{w:4,t:'Revision — Nigeria in International Organisations'},{w:5,t:'Mock Examination — Full Government Paper'},{w:6,t:'Final Revision — All Topics'}],
    'Third Term':[{w:1,t:'WAEC Pre-Exam Revision — Constitutional Law'},{w:2,t:'Final Mock Paper — Complete Government WAEC Format'}]
  }},
  'eco-s3':{name:'Economics',cls:'SS3',ico:'💰',exam:'WAEC',terms:{
    'First Term':[{w:1,t:'Economic Development — Definition & Indicators'},{w:2,t:'Economic Development vs Economic Growth'},{w:3,t:'Problems of Economic Development in Nigeria'},{w:4,t:'Development Planning in Nigeria — NDPs, SAP, NEEDS'},{w:5,t:'Role of IMF — Functions & Nigeria\'s Experience'},{w:6,t:'Role of World Bank — Functions & Nigeria\'s Experience'},{w:7,t:'Population & Economic Development — Relationships'},{w:8,t:'Sustainable Development — Definition & Goals (SDGs)'},{w:9,t:'WAEC Past Questions — Economics (2020–2023)'}],
    'Second Term':[{w:1,t:'Revision — Demand, Supply & Elasticity'},{w:2,t:'Revision — National Income & Fiscal Policy'},{w:3,t:'Revision — International Trade & Balance of Payments'},{w:4,t:'Revision — Money, Banking & Monetary Policy'},{w:5,t:'Mock Examination — Full Economics Paper'},{w:6,t:'Final Revision — All Topics'}],
    'Third Term':[{w:1,t:'WAEC Pre-Exam Revision — Microeconomics'},{w:2,t:'Final Mock Paper — Complete Economics WAEC Format'}]
  }},

  // ─── JSS ───
  'eng-j1':{name:'English Studies',cls:'JSS1',ico:'📖',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Parts of Speech — Nouns: Common, Proper, Abstract, Collective'},{w:2,t:'Parts of Speech — Pronouns & Their Uses'},{w:3,t:'Parts of Speech — Verbs: Action & Linking Verbs'},{w:4,t:'Tenses — Simple Present, Past & Future'},{w:5,t:'Reading Comprehension — Getting Main Ideas'},{w:6,t:'Vocabulary Development — Word Study'},{w:7,t:'Letter Writing — Informal Letters'},{w:8,t:'Narrative Essay — Planning & Writing'},{w:9,t:'Punctuation — Full Stop, Comma, Question Mark'}],
    'Second Term':[{w:1,t:'Adjectives & Adverbs — Types & Uses'},{w:2,t:'Prepositions & Conjunctions'},{w:3,t:'Tenses — Continuous & Perfect Tenses'},{w:4,t:'Comprehension — Reading for Inference'},{w:5,t:'Vocabulary — Synonyms & Antonyms'},{w:6,t:'Descriptive Essay Writing'},{w:7,t:'Oral English — Vowel Sounds'},{w:8,t:'Oral English — Consonant Sounds'},{w:9,t:'Direct & Indirect Speech'}],
    'Third Term':[{w:1,t:'Figures of Speech — Simile, Metaphor, Personification'},{w:2,t:'Comprehension — Reading to Evaluate'},{w:3,t:'Summary Writing — Introduction'},{w:4,t:'Formal Letters — Structure & Examples'},{w:5,t:'Revision & Practice — JSS1 English'}]
  }},
  'mth-j1':{name:'Mathematics',cls:'JSS1',ico:'🧮',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Whole Numbers — Place Value, Rounding & Approximation'},{w:2,t:'Factors, Multiples, LCM & HCF'},{w:3,t:'Fractions — Proper, Improper, Mixed Numbers'},{w:4,t:'Operations on Fractions — Addition, Subtraction'},{w:5,t:'Operations on Fractions — Multiplication & Division'},{w:6,t:'Decimals — Conversion & Operations'},{w:7,t:'Integers — Directed Numbers & Number Line'},{w:8,t:'Operations on Integers — BODMAS'},{w:9,t:'Percentages — Calculation & Applications'}],
    'Second Term':[{w:1,t:'Algebraic Expressions — Variables, Terms & Simplification'},{w:2,t:'Simple Linear Equations — Solving'},{w:3,t:'Word Problems — Algebra Applications'},{w:4,t:'Geometry — Points, Lines & Angles'},{w:5,t:'Angles — Acute, Right, Obtuse, Reflex'},{w:6,t:'Angles — Complementary, Supplementary & Vertically Opposite'},{w:7,t:'Triangles — Types & Properties'},{w:8,t:'Quadrilaterals — Square, Rectangle, Parallelogram'},{w:9,t:'Perimeter of Plane Shapes'}],
    'Third Term':[{w:1,t:'Area of Plane Shapes — Rectangle, Triangle, Circle'},{w:2,t:'Statistics — Frequency Tables & Bar Charts'},{w:3,t:'Statistics — Pie Charts & Pictograms'},{w:4,t:'Ratio & Proportion'},{w:5,t:'Revision & Practice — JSS1 Mathematics'}]
  }},
  'sci-j1':{name:'Basic Science & Technology',cls:'JSS1',ico:'🔬',exam:'BECE',terms:{
    'First Term':[{w:1,t:'What is Science? — Scientific Method & Safety'},{w:2,t:'Living Things — Characteristics of Life'},{w:3,t:'Classification of Living Things — 5 Kingdoms'},{w:4,t:'The Cell — Plant & Animal Cell'},{w:5,t:'Matter — States: Solid, Liquid, Gas'},{w:6,t:'Properties of Matter — Physical & Chemical'},{w:7,t:'Separation Techniques — Filtration, Evaporation, Sieving'},{w:8,t:'Elements, Compounds & Mixtures'},{w:9,t:'Acids, Bases & Salts — Introduction'}],
    'Second Term':[{w:1,t:'Energy — Forms: Heat, Light, Sound, Electrical'},{w:2,t:'Sources of Energy — Renewable & Non-Renewable'},{w:3,t:'Simple Machines — Lever, Pulley, Inclined Plane'},{w:4,t:'The Environment — Ecosystem & Habitat'},{w:5,t:'Food Chains & Food Webs'},{w:6,t:'Pollution — Air, Water & Land Pollution'},{w:7,t:'Human Body Systems — Digestive System'},{w:8,t:'Human Body Systems — Respiratory System'},{w:9,t:'Human Body Systems — Circulatory System'}],
    'Third Term':[{w:1,t:'Technology — Meaning & Importance'},{w:2,t:'Simple Technology — Drawing & Measurement'},{w:3,t:'ICT — Introduction to Computers'},{w:4,t:'Revision — JSS1 Basic Science'}]
  }},
  'eng-j2':{name:'English Studies',cls:'JSS2',ico:'📖',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Comprehension — Reading for Specific Details'},{w:2,t:'Vocabulary Development — Idioms'},{w:3,t:'Argumentative Essay Writing'},{w:4,t:'Figures of Speech — Irony, Hyperbole, Alliteration'},{w:5,t:'Speech Sounds — Stress in Words & Sentences'},{w:6,t:'Summary Writing — Techniques'},{w:7,t:'Formal Letters — Complaint & Request Letters'},{w:8,t:'Concord — Number, Person & Tense'},{w:9,t:'Phrases & Clauses — Types & Functions'}],
    'Second Term':[{w:1,t:'Sentence Types — Simple, Compound, Complex'},{w:2,t:'Comprehension — Reading to Infer Meaning'},{w:3,t:'Expository Essay Writing'},{w:4,t:'Vocabulary — Word Formation: Prefix & Suffix'},{w:5,t:'Oral English — Intonation Patterns'},{w:6,t:'Register — Language in Different Contexts'},{w:7,t:'Report Writing — Introduction'},{w:8,t:'Antonyms, Synonyms & Homonyms'},{w:9,t:'Comprehension — Cloze Passage'}],
    'Third Term':[{w:1,t:'BECE Format Familiarisation — English'},{w:2,t:'Essay Revision — All Types'},{w:3,t:'Past Questions Practice — JSS2 English'},{w:4,t:'Oral English Revision'},{w:5,t:'Grammar Revision — All Topics'}]
  }},
  'mth-j2':{name:'Mathematics',cls:'JSS2',ico:'🧮',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Simultaneous Linear Equations — Graphical Method'},{w:2,t:'Simultaneous Equations — Elimination & Substitution'},{w:3,t:'Quadratic Expressions — Expanding & Factorising'},{w:4,t:'Quadratic Equations — Introduction'},{w:5,t:'Graphs of Linear & Quadratic Functions'},{w:6,t:'Geometry — Triangles: Congruence & Similarity'},{w:7,t:'Geometry — Circle: Parts & Properties'},{w:8,t:'Angles in Circles — Introduction'},{w:9,t:'Construction — Bisectors, Perpendiculars & Angles'}],
    'Second Term':[{w:1,t:'Statistics — Mean, Median & Mode'},{w:2,t:'Statistics — Frequency Distribution Table'},{w:3,t:'Trigonometry — Introduction: SOHCAHTOA'},{w:4,t:'Trigonometry — Angles of Elevation & Depression'},{w:5,t:'Mensuration — Area & Perimeter Revision'},{w:6,t:'Mensuration — Volume of Prisms & Cylinders'},{w:7,t:'Probability — Introduction: Experimental & Theoretical'},{w:8,t:'Number Patterns — Sequences & Series'},{w:9,t:'Indices — Introduction & Laws'}],
    'Third Term':[{w:1,t:'Coordinate Geometry — Introduction: Plotting Points'},{w:2,t:'Coordinate Geometry — Gradient & Equation of a Line'},{w:3,t:'Past Questions Practice — JSS2 Mathematics'},{w:4,t:'Revision — All JSS2 Mathematics Topics'}]
  }},
  'sci-j2':{name:'Basic Science & Technology',cls:'JSS2',ico:'🔬',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Photosynthesis — Process, Equation & Factors'},{w:2,t:'Respiration in Plants — Aerobic & Anaerobic'},{w:3,t:'Reproduction in Plants — Asexual: Budding, Cuttings'},{w:4,t:'Reproduction in Plants — Sexual: Pollination & Fertilisation'},{w:5,t:'The Human Body — Reproductive System'},{w:6,t:'Puberty & Personal Hygiene'},{w:7,t:'Electricity — Static & Current Electricity'},{w:8,t:'Electric Circuits — Series & Parallel'},{w:9,t:'Magnetism — Properties of Magnets'}],
    'Second Term':[{w:1,t:'Environmental Pollution — Types, Causes & Effects'},{w:2,t:'Conservation of Resources — Why & How'},{w:3,t:'Chemical Reactions — Types: Synthesis, Decomposition'},{w:4,t:'Indicators — Acids, Bases & Indicators'},{w:5,t:'Nutrition — Balanced Diet & Malnutrition'},{w:6,t:'Food Tests — Starch, Protein, Fat, Glucose'},{w:7,t:'Diseases — Communicable: Malaria, Typhoid, HIV'},{w:8,t:'Diseases — Prevention & Treatment'},{w:9,t:'First Aid — Basic Procedures'}],
    'Third Term':[{w:1,t:'Technology — Simple Machines Revision'},{w:2,t:'ICT — Internet & Uses'},{w:3,t:'Revision — JSS2 Basic Science'}]
  }},
  'eng-j3':{name:'English Studies',cls:'JSS3',ico:'📖',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Advanced Comprehension — Fact & Opinion'},{w:2,t:'Summary Writing — Practice & Techniques'},{w:3,t:'Expository Essay — Advanced Practice'},{w:4,t:'Oral English — All Vowel & Consonant Sounds Revision'},{w:5,t:'Grammar — Modal Verbs & Their Uses'},{w:6,t:'Grammar — Active & Passive Voice'},{w:7,t:'Grammar — Reported Speech Revision'},{w:8,t:'BECE English Format — Paper 1 & 2 Overview'},{w:9,t:'Past Questions Practice — BECE English'}],
    'Second Term':[{w:1,t:'Comprehension — Inference & Evaluation'},{w:2,t:'Essay Writing — All Types Revision'},{w:3,t:'Letter Writing — All Types Revision'},{w:4,t:'Vocabulary — Common BECE Words'},{w:5,t:'Oral English — Stress & Intonation Revision'},{w:6,t:'Mock Examination — BECE English Format'},{w:7,t:'Final Grammar Revision'}],
    'Third Term':[{w:1,t:'Pre-BECE Revision — All Topics'},{w:2,t:'BECE Mock — Full English Paper'}]
  }},
  'mth-j3':{name:'Mathematics',cls:'JSS3',ico:'🧮',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Coordinate Geometry — Straight Line: Gradient, Intercepts'},{w:2,t:'Mensuration — Areas of Composite Shapes'},{w:3,t:'Mensuration — Volume of Cone, Pyramid, Sphere'},{w:4,t:'Probability — Combined Events'},{w:5,t:'Constructions & Loci — Circles & Tangents'},{w:6,t:'Trigonometry — Revision & Applications'},{w:7,t:'Statistics — Ogive & Cumulative Frequency'},{w:8,t:'Algebraic Fractions & Equations'},{w:9,t:'BECE Past Questions — Mathematics'}],
    'Second Term':[{w:1,t:'Revision — Number & Numeration'},{w:2,t:'Revision — Algebra & Equations'},{w:3,t:'Revision — Geometry & Mensuration'},{w:4,t:'Revision — Statistics & Probability'},{w:5,t:'Mock Examination — BECE Mathematics Format'},{w:6,t:'Final Revision — All Topics'}],
    'Third Term':[{w:1,t:'Pre-BECE Revision — All Topics'},{w:2,t:'BECE Mock — Full Mathematics Paper'}]
  }},
  'sci-j3':{name:'Basic Science & Technology',cls:'JSS3',ico:'🔬',exam:'BECE',terms:{
    'First Term':[{w:1,t:'Genetics — Introduction: DNA, Genes, Chromosomes'},{w:2,t:'Heredity — Dominant & Recessive Traits'},{w:3,t:'Ecosystems — Components, Energy Flow & Cycles'},{w:4,t:'Food Chains, Webs & Ecological Pyramids'},{w:5,t:'Forces — Types: Gravity, Friction, Tension'},{w:6,t:'Newton\'s Laws — Introduction'},{w:7,t:'Chemical Reactions — Energy Changes'},{w:8,t:'Rates of Reaction — Factors'},{w:9,t:'BECE Past Questions — Basic Science'}],
    'Second Term':[{w:1,t:'Human Biology Revision — All Systems'},{w:2,t:'Environmental Science Revision'},{w:3,t:'Physics Concepts Revision'},{w:4,t:'Chemistry Concepts Revision'},{w:5,t:'Mock Examination — BECE Science Format'},{w:6,t:'Final Revision'}],
    'Third Term':[{w:1,t:'Pre-BECE Revision — All Science Topics'},{w:2,t:'BECE Mock — Full Science Paper'}]
  }},

  // ─── EXAM PREP ───
  waec:{name:'WAEC Practice — All Subjects',cls:'SS3 Exam Prep',ico:'📝',exam:'WAEC',terms:{
    'English':[{w:1,t:'Essay Writing — All Types WAEC Standard'},{w:2,t:'Comprehension — Past Questions 2020'},{w:3,t:'Comprehension — Past Questions 2021'},{w:4,t:'Summary Writing Practice'},{w:5,t:'Oral English — All Sound Types'},{w:6,t:'Lexis & Structure — Vocabulary'},{w:7,t:'Past Questions 2022–2023'}],
    'Mathematics':[{w:1,t:'Number & Numeration — Past Questions'},{w:2,t:'Algebraic Processes — Past Questions'},{w:3,t:'Geometry & Trigonometry — Past Questions'},{w:4,t:'Statistics & Probability — Past Questions'},{w:5,t:'Full Paper Practice — Set 1'},{w:6,t:'Full Paper Practice — Set 2'}],
    'Biology':[{w:1,t:'Cell Biology — WAEC Past Questions'},{w:2,t:'Genetics — WAEC Past Questions'},{w:3,t:'Ecology — WAEC Past Questions'},{w:4,t:'Human Biology — WAEC Past Questions'},{w:5,t:'Plant Biology — WAEC Past Questions'}],
    'Chemistry':[{w:1,t:'Physical Chemistry — WAEC Past Questions'},{w:2,t:'Inorganic Chemistry — WAEC Past Questions'},{w:3,t:'Organic Chemistry — WAEC Past Questions'},{w:4,t:'Calculations & Quantitative Chemistry'}],
    'Physics':[{w:1,t:'Mechanics — WAEC Past Questions'},{w:2,t:'Waves & Optics — WAEC Past Questions'},{w:3,t:'Electricity & Magnetism — WAEC Past Questions'},{w:4,t:'Nuclear & Modern Physics — WAEC Past Questions'}]
  }},
  jamb:{name:'JAMB/UTME Practice',cls:'Exam Prep',ico:'🎯',exam:'JAMB/UTME',terms:{
    'Use of English':[{w:1,t:'Comprehension Passages — JAMB Format'},{w:2,t:'Lexis & Structure — Vocabulary'},{w:3,t:'Oral Forms — Phonetics Questions'},{w:4,t:'Register & Varieties of English'}],
    'Mathematics':[{w:1,t:'Number & Numeration — JAMB Topics'},{w:2,t:'Algebra & Indices — JAMB Topics'},{w:3,t:'Mensuration — JAMB Topics'},{w:4,t:'Statistics & Probability — JAMB Topics'}],
    'Biology':[{w:1,t:'Genetics & Evolution — JAMB Focus'},{w:2,t:'Cell Biology & Biochemistry — JAMB Focus'},{w:3,t:'Ecology — JAMB Focus'},{w:4,t:'Human Physiology — JAMB Focus'}],
    'Chemistry':[{w:1,t:'Atomic Structure & Bonding'},{w:2,t:'Organic Chemistry — JAMB Focus'},{w:3,t:'Physical Chemistry — JAMB Focus'},{w:4,t:'Qualitative Chemistry'}],
    'Physics':[{w:1,t:'Mechanics & Properties of Matter'},{w:2,t:'Thermal Physics'},{w:3,t:'Waves & Optics'},{w:4,t:'Electricity & Modern Physics'}]
  }}
};

// ════════════════════ LOAD SUBJECT ════════════════════
let currentSubject=null, currentTerm=null, currentTopicIdx=0, xp=0;
let topicQuizDone=false, chatHistory=[];

// ════════════════════ ON-DEMAND SYLLABUS GENERATOR ════════════════════
// When a subject has no pre-written SYLLABUS entry, generate a NERDC-aligned
// scheme of work on the fly via the AI tutor. Cached in localStorage so we
// only call the API once per subject. After generation, the syllabus behaves
// identically to the hand-written ones.
//
// Subject metadata (name, ico, exam, class label) is derived from the
// subjectsByClass + subject key — no hardcoded list needed.

function _classLabelFromKey(key){
  // 'eng-p1' → 'P1', 'mth-j2' → 'JSS2', 'phy-s3' → 'SS3'
  var suffix = (key.split('-')[1] || '').toUpperCase();
  if(suffix.startsWith('P')) return suffix;          // P1..P6
  if(suffix.startsWith('J')) return 'JSS' + suffix.slice(1);
  if(suffix.startsWith('S')) return 'SS'  + suffix.slice(1);
  return suffix;
}

function _subjectMetaFromSidebar(key){
  // Walk every class bucket and find the entry with this exact k.
  for(var clsKey in subjectsByClass){
    var list = (subjectsByClass[clsKey]||{}).subjects||[];
    for(var i=0;i<list.length;i++){
      if(list[i].k === key) return { name: list[i].n, ico: list[i].i };
    }
  }
  return { name: key, ico: '📚' };
}

function _examFromClass(cls){
  if(/^P[1-6]$/.test(cls)) return 'Common Entrance';
  if(/^JSS/.test(cls)) return 'BECE';
  if(/^SS/.test(cls)) return 'WAEC';
  return 'NERDC';
}

function generateSyllabusOnDemand(key, sidebarEl){
  // Mark sidebar item as selected even though the syllabus isn't ready yet.
  if(sidebarEl){
    document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('on'));
    sidebarEl.classList.add('on');
  }
  currentSubject = key;

  var meta = _subjectMetaFromSidebar(key);
  var cls  = _classLabelFromKey(key);
  var exam = _examFromClass(cls);

  // Update topbar so the user sees something happening.
  var ctb = document.getElementById('ctbSubj');
  if(ctb) ctb.textContent = meta.ico + ' ' + meta.name + ' — ' + cls + ' (loading…)';

  // Show a "generating syllabus" splash in the topic-list area.
  var body = document.getElementById('topicListBody');
  if(body){
    body.innerHTML =
      '<div style="padding:28px 20px;text-align:center;color:#475569" id="sylGenStatus">'
      + '<div style="font-size:36px;margin-bottom:10px">📖</div>'
      + '<div style="font-weight:700;font-size:15px;color:#0f172a;margin-bottom:6px">Building your '+escapeHtml(meta.name)+' syllabus…</div>'
      + '<div style="font-size:13px;opacity:.75;line-height:1.5">Aligning with the NERDC scheme of work for '+cls+'. This takes about 15 seconds the first time, then it is cached.</div>'
      + '<div style="margin-top:14px;width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;display:inline-block"></div>'
      + '</div>'
      + '<style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
  }

  // Try cache first.
  var cacheKey = 'lt_syllabus_v1::'+key;
  try {
    var cached = localStorage.getItem(cacheKey);
    if(cached){
      var parsed = JSON.parse(cached);
      if(parsed && parsed.terms && Object.keys(parsed.terms).length){
        SYLLABUS[key] = parsed;
        // Re-enter loadSubject now that the data is in place.
        return loadSubject(key, sidebarEl);
      }
    }
  } catch(e){}

  // Abort any previous generator request.
  if(window._sylGenAbort){ try{window._sylGenAbort.abort();}catch(e){} }
  window._sylGenAbort = new AbortController();
  var sig = window._sylGenAbort.signal;
  var requestedKey = key;

  var sysPrompt = 'You are a senior Nigerian curriculum officer. You write scheme-of-work topic lists strictly following the NERDC / WAEC / NECO / BECE / Common-Entrance syllabus for the level given. Output ONLY the structured topic list using the exact delimiter format requested. No explanations, no markdown.';

  var userPrompt =
    'Produce the official scheme of work for:\n' +
    'SUBJECT: '+meta.name+'\n' +
    'CLASS: '+cls+'\n' +
    'EXAM TARGET: '+exam+'\n\n' +
    'Output exactly this format and nothing else:\n\n' +
    '<<<FIRST_TERM>>>\n' +
    'Week|Topic title\n' +
    '1|...topic 1...\n' +
    '2|...topic 2...\n' +
    '... (9 weeks total) ...\n' +
    '<<<SECOND_TERM>>>\n' +
    '1|...topic 1...\n' +
    '... (9 weeks total) ...\n' +
    '<<<THIRD_TERM>>>\n' +
    '1|...topic 1...\n' +
    '... (6 weeks total — last two are Revision and Examination) ...\n\n' +
    'IMPORTANT:\n' +
    '- Real Nigerian curriculum topics. Match what '+exam+' / NERDC actually teaches at '+cls+' level.\n' +
    '- Each topic title is short (4–10 words), specific, classroom-ready.\n' +
    '- Do NOT include "Week 1:" prefixes, just the title after the |.\n' +
    '- Use Nigerian context where relevant (e.g. for SST, History, Civic).\n' +
    '- Final two weeks of THIRD_TERM are exactly: "Revision" then "Examination".';

  fetch('/api/anthropic', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      system: sysPrompt,
      messages: [{role:'user', content: userPrompt}]
    }),
    signal: sig
  }).then(function(res){
    if(currentSubject !== requestedKey) return null; // user moved on
    if(!res.ok) throw new Error('API '+res.status);
    return res.json();
  }).then(function(data){
    if(!data) return;
    if(currentSubject !== requestedKey) return;
    var raw = (data.content||[]).find(function(b){return b.type==='text';});
    raw = raw ? raw.text : '';
    var parsedSyl = _parseGeneratedSyllabus(raw, meta, cls, exam);
    if(!parsedSyl){
      _showSylGenError('We could not generate the syllabus. Please try again.', requestedKey, sidebarEl);
      return;
    }
    SYLLABUS[key] = parsedSyl;
    try { localStorage.setItem(cacheKey, JSON.stringify(parsedSyl)); } catch(e){}
    loadSubject(key, sidebarEl);
  }).catch(function(err){
    if(err && err.name === 'AbortError') return;
    console.error('Syllabus generation failed:', err);
    if(currentSubject !== requestedKey) return;
    _showSylGenError('Could not connect. Check your internet and try again.', requestedKey, sidebarEl);
  });
}

function _parseGeneratedSyllabus(raw, meta, cls, exam){
  if(!raw) return null;
  function extractTerm(name){
    var startTag = '<<<'+name+'>>>';
    var idx = raw.indexOf(startTag);
    if(idx === -1) return [];
    idx += startTag.length;
    var nextTag = raw.indexOf('<<<', idx);
    var block = raw.substring(idx, nextTag === -1 ? raw.length : nextTag);
    var lines = block.split('\n').map(function(l){return l.trim();}).filter(Boolean);
    var topics = [];
    lines.forEach(function(line){
      // Skip header lines like "Week|Topic title"
      if(/^week\s*[|]/i.test(line)) return;
      var m = line.match(/^(\d+)\s*[|]\s*(.+)$/);
      if(m){
        topics.push({ w: parseInt(m[1],10), t: m[2].trim() });
      }
    });
    return topics;
  }
  var first  = extractTerm('FIRST_TERM');
  var second = extractTerm('SECOND_TERM');
  var third  = extractTerm('THIRD_TERM');
  if(!first.length && !second.length && !third.length) return null;
  var terms = {};
  if(first.length)  terms['First Term']  = first;
  if(second.length) terms['Second Term'] = second;
  if(third.length)  terms['Third Term']  = third;
  return {
    name: meta.name,
    cls: cls,
    ico: meta.ico,
    exam: exam,
    terms: terms,
    _aiGenerated: true
  };
}

function _showSylGenError(msg, key, sidebarEl){
  var body = document.getElementById('topicListBody');
  if(!body) return;
  body.innerHTML =
    '<div style="padding:28px 20px;text-align:center;color:#475569">'
    + '<div style="font-size:36px;margin-bottom:10px">⚠️</div>'
    + '<div style="font-weight:700;font-size:15px;color:#0f172a;margin-bottom:6px">'+escapeHtml(msg)+'</div>'
    + '<button style="margin-top:14px;background:#3b82f6;color:#fff;border:0;padding:8px 18px;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit" '
    + 'onclick="generateSyllabusOnDemand(\''+key+'\',null)">Try Again</button>'
    + '</div>';
}

// Tiny HTML escape used by the generator above (safe even if escapeHtml exists elsewhere).
if(typeof escapeHtml !== 'function'){
  window.escapeHtml = function(s){
    return String(s||'').replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  };
}

function loadSubject(key, el){
  if(el){
    document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('on'));
    el.classList.add('on');
  }
  currentSubject=key;
  const s=SYLLABUS[key];
  if(!s || !s.terms || !Object.keys(s.terms).length){
    // No pre-written syllabus — generate one on demand using the AI tutor.
    return generateSyllabusOnDemand(key, el);
  }
  const ctb = document.getElementById('ctbSubj');
  if(ctb) ctb.textContent=`${s.ico} ${s.name} — ${s.cls}`;

  const termKeys=Object.keys(s.terms);

  // Find the right term and week to start on
  let startTerm = termKeys[0];
  let startIdx  = 0;

  const savedTerm = window._startTerm;
  const savedWeek = window._startWeek || 1;

  if(savedTerm){
    // Try to match the chosen term name
    const matched = termKeys.find(t => t.toLowerCase().includes(savedTerm.toLowerCase().split(' ')[0]));
    if(matched){
      startTerm = matched;
      // Find the topic closest to the chosen week
      const topics = s.terms[matched] || [];
      let bestIdx = 0;
      for(let i=0;i<topics.length;i++){
        const w = topics[i]?.w || (i+1);
        if(w <= savedWeek) bestIdx = i;
      }
      startIdx = bestIdx;
    }
  }

  currentTerm=startTerm;
  currentTopicIdx=startIdx;
  buildTopicList(s, termKeys);
  // Highlight the correct starting topic
  setTimeout(()=>{
    const items = document.querySelectorAll('.topic-item');
    items.forEach(t=>t.classList.remove('on'));
    const match=[...items].find(t=>t.dataset.term===startTerm&&parseInt(t.dataset.idx)===startIdx);
    if(match){match.classList.add('on');match.scrollIntoView({behavior:'smooth',block:'nearest'});}
  },100);
  loadTopic(key, startTerm, startIdx);
}

function buildTopicList(s, termKeys){
  const body=document.getElementById('topicListBody');
  let html='';
  termKeys.forEach((t,ti)=>{
    const topics=s.terms[t]||[];
    const termId='trm'+ti+'x'+Date.now().toString(36).slice(-4);
    html+=`<div class="term-section">
      <div class="term-hdr" onclick="toggleTermSection(this,'${termId}')" data-term-id="${termId}">
        <span>${t} <span style="opacity:.4;font-weight:600">(${topics.length} topics)</span></span>
        <span class="term-hdr-arrow">▾</span>
      </div>
      <div class="term-topics" id="${termId}">`;
    topics.forEach((topic,i)=>{
      const wk=topic.w?`W${topic.w}`:String(i+1);
      const title=topic.t||topic;
      const safeSubj=s.name.replace(/'/g,"\\'").replace(/"/g,'&quot;');
      html+=`<div class="topic-item" onclick="selectTopicItem('${safeSubj}','${t}',${i})" data-term="${t}" data-idx="${i}">
        <div class="ti-num">${wk}</div>
        <div class="ti-name">${title}</div>
      </div>`;
    });
    html+=`</div></div>`;
  });
  body.innerHTML=html;
  // First term open, rest collapsed
  body.querySelectorAll('.term-topics').forEach((sec,i)=>{
    if(i>0){
      sec.classList.add('hidden');
      const hdr=sec.previousElementSibling;
      if(hdr) hdr.classList.add('collapsed');
    }
  });
  const first=body.querySelector('.topic-item');
  if(first) first.classList.add('on');
}
function toggleTermSection(hdr,id){
  const sec=document.getElementById(id);
  if(!sec) return;
  const hidden=sec.classList.toggle('hidden');
  hdr.classList.toggle('collapsed',hidden);
}


function selectTopicItem(subjName,term,idx){
  document.querySelectorAll('.topic-item').forEach(t=>t.classList.remove('on'));
  const match=[...document.querySelectorAll('.topic-item')].find(t=>t.dataset.term===term&&parseInt(t.dataset.idx)===idx);
  if(match){match.classList.add('on');match.scrollIntoView({behavior:'smooth',block:'nearest'});}
  const key=Object.keys(SYLLABUS).find(k=>SYLLABUS[k].name===subjName);
  if(!key)return;
  currentSubject=key; currentTerm=term; currentTopicIdx=idx;
  loadTopic(key,term,idx);
}

// ════════════════════ LESSON TEACHER — TUTOR ENGINE ════════════════════
// This is the brain. LT is not a chatbot. She is a real tutor.
// She TEACHES first. She knows the full topic. She remembers the conversation.
// She stays in scope. She drills down. She never just navigates.

function getTopicTitle(s,term,idx){
  const entry=s.terms[term]?.[idx];
  if(!entry)return '';
  return entry.t||entry;
}

// ── TEXTBOOK REFERENCES PER SUBJECT ──
// These are the actual approved Nigerian textbooks for each subject.
// LT draws her knowledge from their exact content, terminology and examples.
const TEXTBOOKS = {
  // Mathematics
  mth: ['New General Mathematics for Senior Secondary Schools (Longman)','Essential Mathematics for Senior Secondary Schools (Tonad)','Further Mathematics Project (MAN)',
    {yr:2016,topic:'Number',q:'Evaluate: log₁₀100 + log₁₀10',opts:{A:'3',B:'2',C:'30',D:'1000'},ans:'A',exp:'log₁₀100 = 2, log₁₀10 = 1. Sum = 3. Remember: log₁₀(10ⁿ) = n.',diff:'medium'},
    {yr:2017,topic:'Algebra',q:'The sum of the roots of 2x² - 5x + 3 = 0 is:',opts:{A:'5/2',B:'-5/2',C:'3/2',D:'-3/2'},ans:'A',exp:'Sum of roots = -b/a = -(-5)/2 = 5/2. Product of roots = c/a = 3/2.',diff:'hard'},
    {yr:2018,topic:'Geometry',q:'How many lines of symmetry does a rectangle have?',opts:{A:'1',B:'2',C:'4',D:'0'},ans:'B',exp:'A rectangle has 2 lines of symmetry (one horizontal, one vertical). A square has 4.',diff:'easy'},
    {yr:2019,topic:'Statistics',q:'In a data set 4, 7, 7, 9, 10, the mode is:',opts:{A:'7',B:'9',C:'4',D:'10'},ans:'A',exp:'Mode = most frequent value. 7 appears twice, all others once. Mode = 7.',diff:'easy'},
    {yr:2020,topic:'Algebra',q:'Expand (2x + 3)²',opts:{A:'4x² + 9',B:'4x² + 12x + 9',C:'4x² + 6x + 9',D:'2x² + 12x + 9'},ans:'B',exp:'(a+b)² = a²+2ab+b². (2x+3)² = 4x² + 2(2x)(3) + 9 = 4x² + 12x + 9.',diff:'medium'},
    {yr:2021,topic:'Mensuration',q:'Volume of a cylinder with radius 7cm and height 10cm: [π=22/7]',opts:{A:'1540 cm³',B:'440 cm³',C:'154 cm³',D:'4400 cm³'},ans:'A',exp:'V = πr²h = (22/7)×7²×10 = (22/7)×49×10 = 22×70 = 1540 cm³.',diff:'medium'},
    {yr:2022,topic:'Number',q:'Find the LCM of 12 and 18.',opts:{A:'6',B:'36',C:'24',D:'216'},ans:'B',exp:'12 = 2²×3. 18 = 2×3². LCM = 2²×3² = 4×9 = 36.',diff:'easy'},
    {yr:2023,topic:'Trigonometry',q:'cos 60° =',opts:{A:'√3/2',B:'1/√2',C:'1/2',D:'√3'},ans:'C',exp:'cos 60° = 1/2. Learn the exact values: sin30=cos60=1/2, sin45=cos45=1/√2, sin60=cos30=√3/2.',diff:'easy'},
    {yr:2015,topic:'Geometry',q:'The sum of interior angles of a hexagon is:',opts:{A:'360°',B:'540°',C:'720°',D:'900°'},ans:'C',exp:'Sum = (n-2)×180 = (6-2)×180 = 4×180 = 720°.',diff:'medium'}],
  'mth-s1':['New General Mathematics SS1 (Longman) — Channon, McLeish Smith','Essential Mathematics SS1 (Tonad) — A.J.S. Oluwasanmi'],
  'mth-s2':['New General Mathematics SS2 (Longman)','Essential Mathematics SS2 (Tonad)'],
  'mth-s3':['New General Mathematics SS3 (Longman)','Essential Mathematics SS3 (Tonad)','WAEC Past Questions & Answers — Mathematics'],
  'mth-j1':['New General Mathematics JSS1 (Longman)','Essential Mathematics JSS1 (Tonad)'],
  'mth-j2':['New General Mathematics JSS2 (Longman)','Essential Mathematics JSS2 (Tonad)'],
  'mth-j3':['New General Mathematics JSS3 (Longman)','Essential Mathematics JSS3 (Tonad)'],
  // English
  eng:['Intensive English Course for Senior Secondary Schools (Learn Africa)','Oral English for Schools & Colleges (CSS)','WAEC Past Questions — English Language'],
  'eng-s1':['Countdown to English Language SS1 (Evans)','Senior English Project (Macmillan)','Intensive English SS1 (Learn Africa)'],
  'eng-s2':['Countdown to English Language SS2 (Evans)','Senior English Project SS2 (Macmillan)'],
  'eng-s3':['Countdown to English Language SS3 (Evans)','WAEC Past Questions — Use of English','Exam Focus English (University Press)'],
  'eng-j1':['Oral English for JSS (CSS Books)','New Oxford English for JSS1 (University Press)'],
  'eng-j2':['New Oxford English for JSS2 (University Press)','English Studies JSS2 (Learn Africa)'],
  'eng-j3':['New Oxford English for JSS3 (University Press)','BECE English Past Questions'],
  // Biology
  'bio-s1':['Biology for Senior Secondary Schools SS1 (Learn Africa) — Sarojini Raji','New Biology for Senior Secondary Schools (NPS) — Biological Sciences Curriculum Study'],
  'bio-s2':['Biology for Senior Secondary Schools SS2 (Learn Africa)','Comprehensive Biology for SS (Johnson Publishers) — JS Eze'],
  'bio-s3':['Comprehensive Biology SS3 (Johnson Publishers)','WAEC Past Questions — Biology','Exam Focus Biology (University Press)'],
  // Chemistry
  'chm-s1':['Chemistry for Senior Secondary Schools SS1 (Learn Africa) — I.A. Ababio','New School Chemistry SS1 (Africana-FEP) — Osei Yaw Ababio'],
  'chm-s2':['New School Chemistry SS2 (Africana-FEP) — Osei Yaw Ababio','Chemistry for Senior Secondary Schools SS2 (Learn Africa)'],
  'chm-s3':['New School Chemistry SS3 (Africana-FEP)','WAEC Past Questions — Chemistry','Exam Focus Chemistry (University Press)'],
  // Physics
  'phy-s1':['New School Physics SS1 (Africana-FEP) — M.W. Anyakoha','Physics for Senior Secondary Schools SS1 (Learn Africa)'],
  'phy-s2':['New School Physics SS2 (Africana-FEP) — M.W. Anyakoha','Physics for Senior Secondary Schools SS2 (Learn Africa)'],
  'phy-s3':['New School Physics SS3 (Africana-FEP)','WAEC Past Questions — Physics','Exam Focus Physics (University Press)'],
  // Government
  'gov-s1':['Government for Senior Secondary Schools SS1 (Longman) — R.A. Oluwole','Comprehensive Government for SSS (Johnson) — Dare & Oyewole'],
  'gov-s2':['Government for Senior Secondary Schools SS2 (Longman)','Comprehensive Government SS2 (Johnson)'],
  'gov-s3':['Comprehensive Government SS3 (Johnson)','WAEC Past Questions — Government'],
  // Economics
  'eco-s1':['Economics for Senior Secondary Schools SS1 (Learn Africa) — Udu & Agu','Comprehensive Economics for SSS (Johnson) — J.U. Anyaele'],
  'eco-s2':['Economics for Senior Secondary Schools SS2 (Learn Africa)','Comprehensive Economics SS2 (Johnson)'],
  'eco-s3':['Comprehensive Economics SS3 (Johnson)','WAEC Past Questions — Economics','Exam Focus Economics (University Press)'],
  // Geography
  'geo-s1':['Geographical Concepts for West Africa (George Philip) — Sada, Odemerho','Certificate Physical & Human Geography (OUP) — Iloeje'],
  'geo-s2':['Certificate Physical & Human Geography SS2 (OUP)','New Oxford Certificate Geography for West Africa'],
  'geo-s3':['Certificate Geography SS3 (OUP)','WAEC Past Questions — Geography'],
  // Literature
  'lit-s1':['Literature in English for SSS (Longman)','WAEC Prescribed Texts — Current edition'],
  'lit-s2':['Literature in English for SSS (Longman)','Prescribed Novels and Drama — WAEC List'],
  'lit-s3':['WAEC Past Questions — Literature in English','Exam Focus Literature (University Press)'],
  // Accounting
  'acc-s1':['Financial Accounting for Senior Secondary Schools SS1 (Learn Africa) — Longe & Kazeem'],
  'acc-s2':['Financial Accounting for Senior Secondary Schools SS2 (Learn Africa)'],
  'acc-s3':['Financial Accounting SS3 (Learn Africa)','WAEC Past Questions — Financial Accounting'],
  // JSS Science
  'sci-j1':['Basic Science & Technology JSS1 (Learn Africa)','Integrated Science JSS1 (University Press)'],
  'sci-j2':['Basic Science & Technology JSS2 (Learn Africa)','Integrated Science JSS2 (University Press)'],
  'sci-j3':['Basic Science & Technology JSS3 (Learn Africa)','BECE Science Past Questions'],

  // Primary 1–6
  'eng-p1':['Macmillan Primary English P1 (Learn Africa)','Step Ahead English P1 (University Press)'],
  'eng-p2':['Macmillan Primary English P2 (Learn Africa)','Step Ahead English P2 (University Press)'],
  'eng-p3':['Macmillan Primary English P3 (Learn Africa)','New Oxford Primary English P3 (University Press)'],
  'eng-p4':['Macmillan Primary English P4 (Learn Africa)','New Oxford Primary English P4 (University Press)'],
  'eng-p5':['Macmillan Primary English P5 (Learn Africa)','New Oxford Primary English P5 (University Press)'],
  'eng-p6':['Macmillan Primary English P6 (Learn Africa)','New Oxford Primary English P6 — Common Entrance (University Press)'],
  'mth-p1':['New Countdown Mathematics P1 (University Press)','Daily Mathematics P1 (Learn Africa)'],
  'mth-p2':['New Countdown Mathematics P2 (University Press)','Daily Mathematics P2 (Learn Africa)'],
  'mth-p3':['New Countdown Mathematics P3 (University Press)','Daily Mathematics P3 (Learn Africa)'],
  'mth-p4':['New Countdown Mathematics P4 (University Press)','Daily Mathematics P4 (Learn Africa)'],
  'mth-p5':['New Countdown Mathematics P5 (University Press)','Daily Mathematics P5 (Learn Africa)'],
  'mth-p6':['New Countdown Mathematics P6 (University Press)','Common Entrance Mathematics — Past Questions and Answers'],
  'sci-p1':['Macmillan Basic Science and Technology P1 (Macmillan Nigeria)','Basic Science for Nigerian Primary Schools P1 (Learn Africa)'],
  'sci-p2':['Macmillan Basic Science and Technology P2 (Macmillan Nigeria)','Basic Science for Nigerian Primary Schools P2 (Learn Africa)'],
  'sci-p3':['Macmillan Basic Science and Technology P3 (Macmillan Nigeria)','Basic Science for Nigerian Primary Schools P3 (Learn Africa)'],
  'sci-p4':['Macmillan Basic Science and Technology P4 (Macmillan Nigeria)','Basic Science and Technology for Primary Schools P4 (University Press)'],
  'sci-p5':['Macmillan Basic Science and Technology P5 (Macmillan Nigeria)','Basic Science and Technology for Primary Schools P5 (University Press)'],
  'sci-p6':['Macmillan Basic Science and Technology P6 (Macmillan Nigeria)','Common Entrance Basic Science — Past Questions and Answers'],
  'sst-p1':['Social Studies for Primary Schools P1 (Learn Africa)','Essential Social Studies P1 (Tonad Publishers)'],
  'sst-p2':['Social Studies for Primary Schools P2 (Learn Africa)','Essential Social Studies P2 (Tonad Publishers)'],
  'sst-p3':['Social Studies for Primary Schools P3 (Learn Africa)','Essential Social Studies P3 (Tonad Publishers)'],
  'sst-p4':['Social Studies for Primary Schools P4 (Learn Africa)','Essential Social Studies P4 (Tonad Publishers)'],
  'sst-p5':['Social Studies for Primary Schools P5 (Learn Africa)','Essential Social Studies P5 (Tonad Publishers)'],
  'sst-p6':['Social Studies for Primary Schools P6 (Learn Africa)','Common Entrance Social Studies — Past Questions and Answers'],
  'crs-p1':['Christian Religious Studies for Primary Schools P1 (Learn Africa)','CRS for Primary Schools P1 (University Press)'],
  'agr-p4':['Agricultural Science for Primary Schools P4 (Learn Africa)','Primary Agriculture P4 (Macmillan Nigeria)'],
  'agr-p5':['Agricultural Science for Primary Schools P5 (Learn Africa)','Primary Agriculture P5 (Macmillan Nigeria)'],
  'agr-p6':['Agricultural Science for Primary Schools P6 (Learn Africa)','Common Entrance Agriculture — Past Questions and Answers'],
  // JSS missing
  'sst-j1':['Social Studies for Junior Secondary Schools JSS1 (Learn Africa) — Nwachukwu','Comprehensive Social Studies JSS1 (Johnson Publishers)'],
  'sst-j2':['Social Studies for Junior Secondary Schools JSS2 (Learn Africa)','Comprehensive Social Studies JSS2 (Johnson Publishers)'],
  'sst-j3':['Social Studies for Junior Secondary Schools JSS3 (Learn Africa)','BECE Social Studies Past Questions and Answers'],
  'cmp-j1':['Computer Studies for JSS1 (Learn Africa) — Yusuf Olanrewaju','IT Essentials for Junior Secondary Schools JSS1 (University Press)'],
  'cmp-j2':['Computer Studies for JSS2 (Learn Africa)','IT Essentials for Junior Secondary Schools JSS2 (University Press)'],
  'cmp-j3':['Computer Studies for JSS3 (Learn Africa)','BECE Computer Studies Past Questions and Answers'],
  'biz-j1':['Business Studies for JSS1 (Learn Africa) — Abayomi Ogunlana','Essential Business Studies JSS1 (Tonad Publishers)'],
  'biz-j2':['Business Studies for JSS2 (Learn Africa)','Essential Business Studies JSS2 (Tonad Publishers)'],
  'crs-j1':['Christian Religious Studies for JSS1 (Learn Africa)','CRS for Junior Secondary Schools JSS1 (University Press)'],
  // SS3 missing
  'lit-s3':['Literature in English for SSS (Longman)','WAEC Past Questions — Literature in English','Exam Focus Literature (University Press)'],
  'acc-s3':['Financial Accounting for Senior Secondary Schools SS3 (Learn Africa) — Longe and Kazeem','WAEC Past Questions — Financial Accounting'],

  // Default fallback
  default:['Approved NERDC Textbooks for this subject','WAEC/NECO/JAMB Past Questions & Answers']
};

function getTextbooks(subjKey){
  return TEXTBOOKS[subjKey] || TEXTBOOKS[subjKey?.split('-')[0]] || TEXTBOOKS.default;
}

// ── SYSTEM PROMPT ──
function buildSystemPrompt(s, topicTitle, term){
  const prevTopics = Object.keys(s.terms)
    .flatMap(t => s.terms[t].map(e => e.t||e))
    .slice(0,10).join('; ');
  const books = getTextbooks(currentSubject);
  const adaptCtx = getAdaptiveContext();
  const adaptStyle = getAdaptiveLessonStyle();

  return `You are LESSON TEACHER — a brilliant, deeply knowledgeable personal tutor built by Tech Bros Africa for Nigerian and Ghanaian students.

YOUR IDENTITY:
- You are a PERSONAL TUTOR — not a chatbot, not a generic AI. You are the student's own private tutor.
- You know every approved Nigerian textbook for this subject inside out. You teach from them.
- You are warm, sharp, and authoritative — like the best teacher the student has ever had.
- You use Nigerian real life: Lagos traffic, Dangote, NEPA/PHCN, egusi soup, okada, Eko bridge, market women, WAEC stress, JAMB morning, etc.

THIS STUDENT'S PROFILE (adapt your teaching to this — never mention it directly):
${adaptCtx}
${adaptStyle}

YOUR TEXTBOOK KNOWLEDGE FOR THIS LESSON:
${books.map(b=>`- ${b}`).join('\n')}
Draw on the exact content, terminology, diagrams, examples and explanations from these textbooks. Match how they structure the topic for ${s.cls} level.

CURRENT LESSON:
- Class: ${s.cls} | Subject: ${s.name} | Term: ${term} | Topic: "${topicTitle}" | Exam: ${s.exam}
- Topics covered before: ${prevTopics}

HOW YOU TEACH:
1. Teach FIRST — full clear explanation before any question. Never start with a question.
2. Reference the textbook then make it come alive with a Nigerian example.
3. For maths/science: always show the formula, then a fully worked step-by-step example.
4. After teaching: ask ONE check question to test understanding.
5. In chat: answer the student's ACTUAL question fully. Never deflect.
6. NEVER go off topic outside ${s.name} ${s.cls} scope.
7. Chat replies: 4-6 sentences max. Sharp, warm, no waffle.

TONE: Warm but sharp. "Good — now let me show you the part most students miss..." / "Ah, that is the classic mistake. Here is why..." / "In WAEC, they ask this exact thing every year. This is how you answer it..."`;
}

// ── FETCH LESSON OPENING ──
// Uses delimiter-based parsing instead of JSON — completely eliminates parse errors.
// Claude returns sections marked with <<<FIELD>>> tags which we split and extract.
async function fetchLessonOpening(s, topicTitle, term, idx, _abortSignal){

  const books   = getTextbooks(currentSubject);
  const cls     = s.cls;
  const subj    = s.name;
  const exam    = s.exam;

  const examBoards = {
    'WAEC': 'WAEC (West African Senior School Certificate)',
    'BECE': 'BECE (Basic Education Certificate)',
    'Common Entrance': 'Common Entrance Examination',
    'NECO': 'NECO (National Examinations Council)',
  };
  const examFull = examBoards[exam] || exam;

  const system = `You are LESSON TEACHER — a brilliant, caring personal tutor built by Tech Bros Africa for Nigerian students (${cls}).

YOUR IDENTITY:
• You are not an AI assistant — you are their PERSONAL TUTOR. Warm, sharp, authoritative.
• You know the NERDC syllabus for ${subj} at ${cls} level inside out.
• You teach from the approved textbooks: ${books.join(', ')}.
• You use Nigerian real life: Lagos traffic, Dangote, NEPA/PHCN, egusi, okada, Eko bridge, Balogun market, WAEC morning nerves.

YOUR PURPOSE:
1. TEACH the topic deeply so the student truly understands it — not just for exams, but for life and further study.
2. Build conceptual understanding FIRST. Exams come after understanding.
3. Connect every concept to Nigerian reality so it becomes real and memorable.
4. For ${cls} level, use language and examples appropriate to that age group.
5. At the end of teaching, show how this connects to ${examFull} expectations.

TEACHING APPROACH:
• Explain like the best teacher they have ever had — clear, vivid, step-by-step.
• Use analogies from Nigerian daily life to make abstract concepts concrete.
• For maths/science: always show the formula, then a fully worked example.
• For humanities: show the concept, then a Nigerian case study or example.
• After the full lesson, give one exam-standard question to check understanding.
• In chat replies: answer the ACTUAL question fully. 4-6 sentences, sharp and warm.

TONE: "Good — now let me show you the part most students miss..." / "Think of it like this..." / "In your WAEC, they will ask you..."`;

  // Delimiter-based format — never fails, no JSON parse errors
  const isSS = cls.startsWith('SS');
  const isJSS = cls.startsWith('JSS');
  const isPrimary = cls.startsWith('P');
  const examContext = isSS ? 'WAEC, NECO, and JAMB' : isJSS ? 'BECE' : 'Common Entrance';
  const ageGroup = isPrimary ? 'a Nigerian primary school pupil' : isJSS ? 'a Nigerian junior secondary student' : 'a Nigerian senior secondary student';

  const request = `Teach the topic "${topicTitle}" as a complete ${cls} ${subj} lesson for ${ageGroup}.

This is a FULL LESSON — not a summary. Teach it like the student has never seen this topic before.
Use the exact delimiters below. Fill EVERY section with real, specific content. No placeholders.

<<<OPENING>>>
2-3 warm, engaging sentences to open the class. Sound like their personal tutor. Reference Nigerian school culture. Make them excited to learn this topic.

<<<DEFINITION>>>
The precise, textbook-accurate definition of "${topicTitle}" as taught in ${cls} ${subj} in Nigeria. Match the exact language of the approved textbooks.

<<<PARAGRAPH>>>
A clear, engaging explanation of ${topicTitle} in plain, accessible language for ${ageGroup}. What is it? Why does it matter? Connect it to something real in Nigerian daily life (be specific — use real places, people, situations a Nigerian ${cls} student would recognise).

<<<ANALOGY>>>
One powerful, vivid Nigerian analogy that makes this concept immediately clear. Use something from everyday Nigerian life — market, traffic, food, football, family, NEPA, Danfo bus, etc. Make it memorable.

<<<STEP1_TITLE>>>
Name of the first major concept, fact, or sub-topic within ${topicTitle} (from the ${cls} ${subj} syllabus)

<<<STEP1_TEXT>>>
Full explanation of this first concept. Draw directly from the textbook content. Give specific facts, details, and a Nigerian example. At least 3 sentences.

<<<STEP2_TITLE>>>
Name of the second major concept or sub-topic

<<<STEP2_TEXT>>>
Full explanation. Build on the first concept. Give specific details. At least 3 sentences.

<<<STEP3_TITLE>>>
Name of the third major concept or sub-topic

<<<STEP3_TEXT>>>
Full explanation. Connect to how this appears in real life and in ${examContext} examinations. At least 3 sentences.

<<<TUTOR_TIP>>>
The single most important insight about this topic — the thing that separates students who truly understand it from those who are just memorising. Make it genuinely insightful, not generic.

<<<FORMULA>>>
If ${topicTitle} has a formula, equation, law, or rule — write it here exactly (e.g. v = u + at, or PV = nRT, or Assets = Liabilities + Capital). Write NONE if there is no formula.

<<<FORMULA_NOTE>>>
Explain what each symbol or term in the formula means. Write NONE if no formula.

<<<WORKED_QUESTION>>>
A realistic ${examContext}-style question on ${topicTitle}. Write it exactly like it would appear in a past paper. Include all necessary data.

<<<WORKED_STEP1>>>
First step of the worked solution — show the working clearly.

<<<WORKED_STEP2>>>
Second step with working.

<<<WORKED_STEP3>>>
Third step with working.

<<<WORKED_STEP4>>>
Final step and conclusion.

<<<WORKED_ANSWER>>>
The final answer written exactly as it would appear in a marking scheme.

<<<TERM1>>>
First key vocabulary term for ${topicTitle}

<<<DEF1>>>
Definition of term 1 — precise, as per the ${cls} ${subj} textbook

<<<TERM2>>>
Second key term

<<<DEF2>>>
Definition of term 2

<<<TERM3>>>
Third key term

<<<DEF3>>>
Definition of term 3

<<<TERM4>>>
Fourth key term

<<<DEF4>>>
Definition of term 4

<<<TABLE_TITLE>>>
Title of a genuinely useful comparison or classification table for ${topicTitle} (e.g. "Types of...", "Comparison of...", "Properties of...")

<<<TABLE_HEADERS>>>
Column1 | Column2 | Column3

<<<TABLE_ROW1>>>
Data | Data | Data

<<<TABLE_ROW2>>>
Data | Data | Data

<<<TABLE_ROW3>>>
Data | Data | Data

<<<MNEMONIC>>>
A real, memorable mnemonic or memory trick for ${topicTitle}. If a standard one exists (BODMAS, MRS GREN, SOHCAHTOA, OIL RIG), use it. Otherwise create a clever one. Make it stick.

<<<EXAM_TIP>>>
Specific ${examContext} exam advice for ${topicTitle}: what the examiner looks for, exactly how the question is worded in the exam, common mark schemes, how to score full marks. Be specific and practical.

<<<COMMON_MISTAKE>>>
The single most common error Nigerian students make on ${topicTitle} in ${examContext}. Be very specific — name the exact misconception and correct it.

<<<QUIZ_QUESTION>>>
One strong multiple-choice question at ${examContext} standard, testing the core concept of ${topicTitle}.

<<<QUIZ_A>>>
Option A

<<<QUIZ_B>>>
Option B

<<<QUIZ_C>>>
Option C — make this the correct answer

<<<QUIZ_D>>>
Option D

<<<QUIZ_CORRECT_LETTER>>>
C

<<<QUIZ_CORRECT_EXPLAIN>>>
Why C is correct. 2 clear sentences. Include one specific ${examContext} exam insight.

<<<QUIZ_WRONG_EXPLAIN>>>
The most tempting wrong option and exactly why it is wrong. 2 sentences. Correct the specific misconception.`;

  // Helper: extract a section between two markers
  function extract(text, marker){
    const start = text.indexOf('<<<' + marker + '>>>');
    if(start === -1) return '';
    const after = text.indexOf('\n', start);
    const nextMarker = text.indexOf('<<<', after);
    const end = nextMarker === -1 ? text.length : nextMarker;
    return text.substring(after, end).trim();
  }

  // Capture the topic that was requested, so we can detect if user navigates away mid-fetch.
  // Note: currentSubject is the global; we read it at request time so we can compare later.
  var requestedKey  = currentSubject;
  var requestedTerm = term;
  var requestedIdx  = idx;
  function isStillCurrent(){
    return currentSubject === requestedKey && currentTerm === requestedTerm && currentTopicIdx === requestedIdx;
  }

  try{
    const res = await fetch('/api/anthropic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: system,
        messages: [{ role: 'user', content: request }]
      }),
      signal: _abortSignal
    });

    // User navigated to a different topic while this was loading — drop the response.
    if(!isStillCurrent()) return;

    if(!res.ok){
      const err = await res.json().catch(()=>null);
      const errMsg = err?.error?.message || err?.error?.detail || err?.error || 'Unknown error';
      const lt = document.getElementById('loadingText');
      if(lt) lt.innerHTML = '⚠️ Could not connect (' + res.status + '). '
        + '<span style="color:rgba(255,255,255,.6);font-size:.82rem;display:block;margin-top:6px">' + (typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg)) + '</span>'
        + '<button onclick="loadTopic(currentSubject,currentTerm,currentTopicIdx)" '
        + 'style="background:var(--blue);color:#fff;border:none;border-radius:6px;padding:4px 12px;cursor:pointer;margin-top:8px;font-family:inherit">Try Again</button>';
      console.error('API error:', res.status, err);
      activateWaves(false);
      return;
    }

    const data = await res.json();
    const raw  = data?.content?.find(b => b.type === 'text')?.text || '';

    // Final stale-check before we touch the DOM.
    if(!isStillCurrent()) return;

    if(!raw || !raw.includes('<<<OPENING>>>')){
      const lt = document.getElementById('loadingText');
      if(lt) lt.innerHTML = '⚠️ Lesson format issue. '
        + '<button onclick="loadTopic(currentSubject,currentTerm,currentTopicIdx)" '
        + 'style="background:var(--blue);color:#fff;border:none;border-radius:6px;padding:4px 12px;cursor:pointer;margin-left:8px;font-family:inherit">Retry</button>';
      console.warn('Missing markers in response. Raw:', raw.substring(0,300));
      activateWaves(false);
      return;
    }

    // ── Parse lesson from delimited sections — never fails ──
    const formula = extract(raw, 'FORMULA');
    const formulaHasValue = formula && formula.toLowerCase() !== 'none' && formula.trim() !== '';

    const lesson = {
      opening:   extract(raw, 'OPENING'),
      definition: extract(raw, 'DEFINITION'),
      explanation: [
        { type:'paragraph', text: extract(raw,'PARAGRAPH') },
        { type:'analogy',   text: extract(raw,'ANALOGY') },
        { type:'step', title: extract(raw,'STEP1_TITLE'), text: extract(raw,'STEP1_TEXT') },
        { type:'step', title: extract(raw,'STEP2_TITLE'), text: extract(raw,'STEP2_TEXT') },
        { type:'step', title: extract(raw,'STEP3_TITLE'), text: extract(raw,'STEP3_TEXT') },
        { type:'callout', style:'info', icon:'💡', title:'Tutor Tip', text: extract(raw,'TUTOR_TIP') }
      ],
      formula:      formulaHasValue ? formula : '',
      formula_note: formulaHasValue ? extract(raw,'FORMULA_NOTE') : '',
      worked_example: {
        question: extract(raw,'WORKED_QUESTION'),
        steps: [
          extract(raw,'WORKED_STEP1'),
          extract(raw,'WORKED_STEP2'),
          extract(raw,'WORKED_STEP3'),
          extract(raw,'WORKED_STEP4')
        ].filter(Boolean),
        answer: extract(raw,'WORKED_ANSWER')
      },
      key_terms: [
        { term: extract(raw,'TERM1'), def: extract(raw,'DEF1') },
        { term: extract(raw,'TERM2'), def: extract(raw,'DEF2') },
        { term: extract(raw,'TERM3'), def: extract(raw,'DEF3') },
        { term: extract(raw,'TERM4'), def: extract(raw,'DEF4') }
      ].filter(k => k.term),
      table_needed: true,
      table: {
        title:   extract(raw,'TABLE_TITLE'),
        headers: extract(raw,'TABLE_HEADERS').split('|').map(h=>h.trim()).filter(Boolean),
        rows: [
          extract(raw,'TABLE_ROW1').split('|').map(c=>c.trim()),
          extract(raw,'TABLE_ROW2').split('|').map(c=>c.trim()),
          extract(raw,'TABLE_ROW3').split('|').map(c=>c.trim())
        ].filter(r => r.some(Boolean))
      },
      mnemonic:       extract(raw,'MNEMONIC'),
      exam_tip:       extract(raw,'EXAM_TIP'),
      common_mistake: extract(raw,'COMMON_MISTAKE'),
      quiz_question:  extract(raw,'QUIZ_QUESTION'),
      quiz_options: [
        { letter:'A', text: extract(raw,'QUIZ_A'), correct: extract(raw,'QUIZ_CORRECT_LETTER').trim().toUpperCase() === 'A' },
        { letter:'B', text: extract(raw,'QUIZ_B'), correct: extract(raw,'QUIZ_CORRECT_LETTER').trim().toUpperCase() === 'B' },
        { letter:'C', text: extract(raw,'QUIZ_C'), correct: extract(raw,'QUIZ_CORRECT_LETTER').trim().toUpperCase() === 'C' },
        { letter:'D', text: extract(raw,'QUIZ_D'), correct: extract(raw,'QUIZ_CORRECT_LETTER').trim().toUpperCase() === 'D' }
      ],
      quiz_correct_explain: extract(raw,'QUIZ_CORRECT_EXPLAIN'),
      quiz_wrong_explain:   extract(raw,'QUIZ_WRONG_EXPLAIN')
    };

    // ── SUCCESS — render the full lesson ──

    // Chat context — clean summary of what was taught
    chatHistory = [];
    chatHistory.push({ role:'user', content: 'Teach me about ' + topicTitle });
    chatHistory.push({ role:'assistant', content:
      'I have just taught ' + topicTitle + ' to the student. '
      + 'Definition: ' + lesson.definition + ' '
      + (lesson.explanation.find(b=>b.type==='paragraph')?.text||'')
      + ' Exam tip: ' + lesson.exam_tip
    });

    // Render
    const loadingState = document.getElementById('lessonLoadingState');
    const lessonBody   = document.getElementById('lessonBody');
    const lessonNav    = document.getElementById('lessonNav');
    if(loadingState) loadingState.style.display = 'none';
    stopLessonProgress();
    if(lessonBody)   lessonBody.innerHTML = renderRichLesson(lesson, s, topicTitle, term, idx);
    if(lessonNav)    lessonNav.style.display = 'flex';
    window._currentLesson = { lesson, s, topicTitle, term, idx };

    speakIt(lesson.opening);
    fetchDiagram(s, topicTitle, term);

    if(lesson.quiz_question){
      setTimeout(() => renderEmbeddedQuiz(lesson, s, topicTitle), 800);
    }

    addChatMsg('lt',
      '📚 Your lesson on <strong>' + topicTitle + '</strong> is ready above. '
      + 'Read through it fully — then ask me anything here. '
      + 'Try: <em>"Explain the analogy again"</em>, <em>"Another worked example"</em>, <em>"What does WAEC ask?"</em>'
    );

    // Nudge the tutor button — don't auto-open; student starts focused on reading
    const btn = document.getElementById('aiOpenBtn');
    if(btn){
      btn.style.animation = 'aiBtnPulse 1.2s ease 1.5s 2';
    }

  } catch(e){
    // AbortError = user navigated to a different topic — silent, expected.
    if(e && (e.name === 'AbortError' || /aborted/i.test(String(e.message||'')))) {
      return;
    }
    console.error('fetchLessonOpening error:', e);
    if(!isStillCurrent()) return;
    const lt = document.getElementById('loadingText');
    if(lt) lt.innerHTML = '⚠️ Network error. '
      + '<button onclick="loadTopic(currentSubject,currentTerm,currentTopicIdx)" '
      + 'style="background:var(--blue);color:#fff;border:none;border-radius:6px;padding:4px 12px;cursor:pointer;margin-left:8px;font-family:inherit">Try Again</button>';
  }

  activateWaves(false);
}

// ── EMBEDDED QUIZ — rendered from lesson JSON, no extra API call needed ──
// ════════════════════════════════════════════════════════════════
// ACADEMIC INTEGRITY SYSTEM — Lesson Teacher
// Covers: tab switching, focus loss, devtools, copy-paste, timing
// ════════════════════════════════════════════════════════════════

const IntegritySystem = (function(){

  let active        = false;  // only active during timed exam or quiz
  let violations    = 0;
  let maxViolations = 3;
  let sessionStart  = 0;
  let totalPaused   = 0;
  let lastPauseTime = 0;
  let onViolation   = null;   // callback(type, count)
  let onTerminate   = null;   // callback(reason)
  let mode          = 'exam'; // 'exam' | 'quiz'
  let tabWarned     = false;

  // ── VIOLATION HANDLER ─────────────────────────────────────────
  function flag(type){
    if(!active) return;
    violations++;
    const remaining = maxViolations - violations;

    // Track pause time for timing integrity
    if(type === 'tab_switch' || type === 'focus_loss'){
      lastPauseTime = Date.now();
    }

    if(onViolation) onViolation(type, violations, remaining);

    if(violations >= maxViolations){
      terminate(type);
    }
  }

  function terminate(reason){
    active = false;
    detach();
    if(onTerminate) onTerminate(reason, violations);
  }

  // ── ATTACH LISTENERS ──────────────────────────────────────────
  function attach(){
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('contextmenu', blockContext);
    document.addEventListener('keydown', blockKeys);
    document.addEventListener('copy', blockCopy);
    document.addEventListener('cut', blockCopy);
    document.addEventListener('selectstart', blockSelect);
    window.addEventListener('resize', checkDevTools);
    // Screenshot / PrintScreen key
    document.addEventListener('keyup', blockPrintScreen);
  }

  function detach(){
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('contextmenu', blockContext);
    document.removeEventListener('keydown', blockKeys);
    document.removeEventListener('copy', blockCopy);
    document.removeEventListener('cut', blockCopy);
    document.removeEventListener('selectstart', blockSelect);
    window.removeEventListener('resize', checkDevTools);
    document.removeEventListener('keyup', blockPrintScreen);
    // Restore context menu outside exam
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }

  // ── VISIBILITY (tab switch) ────────────────────────────────────
  function onVisibilityChange(){
    if(!active) return;
    if(document.hidden){
      lastPauseTime = Date.now();
      flag('tab_switch');
    } else {
      // Resumed — add time to paused total
      if(lastPauseTime > 0){
        totalPaused += Date.now() - lastPauseTime;
        lastPauseTime = 0;
      }
    }
  }

  // ── FOCUS LOSS (alt-tab, other app) ───────────────────────────
  let blurTimer = null;
  function onBlur(){
    if(!active) return;
    // Small grace period — brief UI interactions don't count
    blurTimer = setTimeout(()=>{
      if(!active) return;
      lastPauseTime = Date.now();
      flag('focus_loss');
    }, 2000);  // 2 second grace
  }

  function onFocus(){
    if(blurTimer){ clearTimeout(blurTimer); blurTimer = null; }
    if(!active) return;
    if(lastPauseTime > 0){
      totalPaused += Date.now() - lastPauseTime;
      lastPauseTime = 0;
    }
  }

  // ── DEVTOOLS DETECTION ────────────────────────────────────────
  let devToolsOpen = false;
  function checkDevTools(){
    if(!active) return;
    const threshold = 160;
    const widthDiff  = window.outerWidth  - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const suspected  = widthDiff > threshold || heightDiff > threshold;
    if(suspected && !devToolsOpen){
      devToolsOpen = true;
      flag('devtools');
    } else if(!suspected){
      devToolsOpen = false;
    }
  }

  // Continuous devtools check (some methods of opening don't fire resize)
  let devToolsInterval = null;
  function startDevToolsWatch(){
    devToolsInterval = setInterval(()=>{
      if(!active){ clearInterval(devToolsInterval); return; }
      checkDevTools();
      // F12 / undocked devtools — console timing trick
      const before = performance.now();
      // eslint-disable-next-line no-console
      console.log('%c', 'color:transparent;');
      const after = performance.now();
      // If console.log takes suspiciously long, devtools likely open
      if(after - before > 100 && !devToolsOpen){
        devToolsOpen = true;
        flag('devtools');
      }
    }, 3000);
  }

  // ── BLOCK CONTEXT MENU ────────────────────────────────────────
  function blockContext(e){
    if(!active) return;
    e.preventDefault();
    showIntegrityToast('Right-click is disabled during assessments.', 'warn');
  }

  // ── BLOCK KEYBOARD SHORTCUTS ──────────────────────────────────
  function blockKeys(e){
    if(!active) return;
    const k = e.key.toLowerCase();
    // Block: F12, Ctrl+U (view source), Ctrl+Shift+I/J/C (devtools), Ctrl+A (select all)
    const blocked = [
      k === 'f12',
      (e.ctrlKey || e.metaKey) && k === 'u',
      (e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c','k'].includes(k),
      (e.ctrlKey || e.metaKey) && k === 'a',
    ];
    if(blocked.some(Boolean)){
      e.preventDefault();
      e.stopPropagation();
      showIntegrityToast('Keyboard shortcuts are disabled during assessments.', 'warn');
      return false;
    }
  }

  function blockPrintScreen(e){
    if(!active) return;
    if(e.key === 'PrintScreen'){
      showIntegrityToast('Screenshots are disabled during assessments.', 'warn');
      // Overwrite clipboard (can\'t prevent but can corrupt)
      try{ navigator.clipboard.writeText(''); }catch(err){}
    }
  }

  // ── BLOCK COPY / SELECT ───────────────────────────────────────
  function blockCopy(e){
    if(!active) return;
    e.preventDefault();
    showIntegrityToast('Copying is not allowed during assessments.', 'warn');
  }

  function blockSelect(e){
    if(!active) return;
    // Only block outside of input fields
    if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();
  }

  // ── INTEGRITY TOAST ───────────────────────────────────────────
  function showIntegrityToast(msg, type='warn'){
    let toast = document.getElementById('integrityToast');
    if(!toast){
      toast = document.createElement('div');
      toast.id = 'integrityToast';
      Object.assign(toast.style, {
        position:'fixed',top:'70px',left:'50%',
        transform:'translateX(-50%)',
        background: type==='warn' ? '#d97706' : '#dc2626',
        color:'#fff',padding:'10px 20px',borderRadius:'10px',
        fontFamily:'inherit',fontSize:'.86rem',fontWeight:'700',
        zIndex:'99998',boxShadow:'0 4px 16px rgba(0,0,0,.4)',
        transition:'opacity .3s',pointerEvents:'none',
        textAlign:'center',maxWidth:'400px',lineHeight:'1.4',
      });
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(()=>{ toast.style.opacity='0'; }, 3000);
  }

  // ── VIOLATION OVERLAY ─────────────────────────────────────────
  function showViolationOverlay(type, count, remaining){
    // Remove any existing overlay
    document.getElementById('integrityOverlay')?.remove();

    const labels = {
      tab_switch:  'Tab Switch Detected',
      focus_loss:  'Window Focus Lost',
      devtools:    'Developer Tools Detected',
    };
    const label = labels[type] || 'Integrity Violation';
    const isLast = remaining === 0;

    const overlay = document.createElement('div');
    overlay.id = 'integrityOverlay';
    overlay.innerHTML = `
      <div style="background:#1a1a2e;border:2px solid ${isLast?'#dc2626':'#d97706'};border-radius:18px;padding:36px 40px;max-width:440px;text-align:center;animation:intShake .4s ease">
        <div style="font-size:2.5rem;margin-bottom:12px">${isLast?'🚫':'⚠️'}</div>
        <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:1.2rem;font-weight:800;color:${isLast?'#f87171':'#fbbf24'};margin-bottom:10px">${label}</div>
        <div style="font-size:.92rem;color:rgba(255,255,255,.7);line-height:1.65;margin-bottom:20px">
          ${isLast
            ? 'You have reached the maximum number of integrity violations. <strong style="color:#f87171">Your assessment has been terminated.</strong> Your answers up to this point have been saved.'
            : 'This has been recorded. <strong style="color:#fbbf24">Violation ${count} of ${maxViolations}.</strong> One more and your assessment will be automatically submitted. Please stay on this page and do not open other applications.'}
        </div>
        ${!isLast ? `<button id="intContinueBtn" style="background:${count>=maxViolations-1?'#dc2626':'#3b82f6'};color:#fff;border:none;border-radius:10px;padding:10px 24px;font-size:.9rem;font-weight:800;cursor:pointer;font-family:inherit">${count>=maxViolations-1?'I Understand — Last Warning':'I Understand — Continue'}</button>` : ''}
      </div>`;

    Object.assign(overlay.style, {
      position:'fixed',inset:'0',background:'rgba(0,0,0,.85)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:'99997',backdropFilter:'blur(4px)',
    });
    document.body.appendChild(overlay);

    const btn = document.getElementById('intContinueBtn');
    if(btn) btn.onclick = ()=>{ overlay.remove(); if(mode==='exam' && window._resumeExamTimer) window._resumeExamTimer(); };
  }

  // ── PUBLIC API ────────────────────────────────────────────────
  return {
    start(opts){
      violations    = 0;
      totalPaused   = 0;
      lastPauseTime = 0;
      sessionStart  = Date.now();
      devToolsOpen  = false;
      mode          = opts.mode || 'exam';
      maxViolations = opts.maxViolations || (mode==='quiz' ? 2 : 3);
      onViolation   = opts.onViolation || null;
      onTerminate   = opts.onTerminate || null;
      active        = true;
      // Apply user-select:none to body
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      attach();
      startDevToolsWatch();
    },

    stop(){
      active = false;
      detach();
      clearInterval(devToolsInterval);
      document.getElementById('integrityOverlay')?.remove();
      document.getElementById('integrityToast')?.remove();
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    },

    // Returns effective elapsed seconds (subtracts time spent away)
    getEffectiveElapsed(){
      const elapsed = (Date.now() - sessionStart) / 1000;
      return Math.max(0, elapsed - totalPaused / 1000);
    },

    getViolations(){ return violations; },
    isActive(){ return active; },
  };
})();

// CSS for integrity animations
(function(){
  const s = document.createElement('style');
  s.textContent = `
    @keyframes intShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
    #integrityOverlay *{box-sizing:border-box;}
    .integrity-banner{
      display:flex;align-items:center;gap:10px;
      padding:8px 16px;border-radius:9px;margin-bottom:14px;
      font-size:.82rem;font-weight:700;
    }
    .integrity-banner.warn{background:rgba(217,119,6,.15);border:1px solid rgba(217,119,6,.35);color:#fbbf24;}
    .integrity-banner.safe{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);color:#4ade80;}
    .integrity-indicator{
      display:inline-flex;align-items:center;gap:6px;
      padding:3px 10px;border-radius:100px;font-size:.7rem;font-weight:700;
    }
    .integrity-indicator.clean{background:rgba(34,197,94,.15);color:#4ade80;border:1px solid rgba(34,197,94,.3);}
    .integrity-indicator.warning{background:rgba(217,119,6,.15);color:#fbbf24;border:1px solid rgba(217,119,6,.3);}
    .integrity-indicator.danger{background:rgba(220,38,38,.15);color:#f87171;border:1px solid rgba(220,38,38,.3);}
  `;
  document.head.appendChild(s);
})();


// ════════════════════ RENDER RICH LESSON ════════════════════
function renderRichLesson(lesson, s, topicTitle, term, idx){
  const topicCount = s.terms[term]?.length || 1;
  const weekLabel  = s.terms[term]?.[idx]?.w ? `Week ${s.terms[term][idx].w} · ` : '';
  const exam = s.exam;

  // Accent colour per subject icon
  const accentMap = {
    '📖':'#2563eb','🧮':'#7c3aed','🔬':'#059669','⚗️':'#dc2626',
    '⚡':'#d97706','🌍':'#0891b2','🏛️':'#b45309','💰':'#15803d',
    '📚':'#9333ea','📊':'#1d4ed8','💻':'#0891b2','💼':'#059669',
    '🌾':'#65a30d','🕊️':'#6366f1'
  };
  const accent = accentMap[s.ico] || '#2563eb';

  // Only show table when it has real data
  const tableReal = lesson.table_needed && lesson.table && lesson.table.headers
    && lesson.table.headers.length > 0 && lesson.table.rows && lesson.table.rows.length > 0
    && !lesson.table.headers[0].toLowerCase().includes('column')
    && !lesson.table.headers[0].toLowerCase().includes('header')
    && !lesson.table.headers[0].toLowerCase().includes('example');

  let html = `<div class="lesson-inner"><div class="rich-lesson">

  <!-- HEADER BOARD -->
  <div class="board-header" style="background:linear-gradient(135deg,${accent},${accent}cc)">
    <div class="bh-left">
      <div class="bh-icon">${s.ico}</div>
      <div>
        <div class="bh-subject">${s.name} · ${s.cls}</div>
        <h2 class="bh-topic">${topicTitle}</h2>
        <div class="bh-meta">${weekLabel}${term} · ${exam} Syllabus · NERDC</div>
      </div>
    </div>
    <div class="bh-right">
      <div class="bh-chip">📋 ${topicCount} topics</div>
      <div class="bh-chip">👩‍🏫 Lesson Teacher</div>
    </div>
  </div>

  <!-- TEACHER OPENING -->
  <div class="lt-speech-card">
    <div class="lt-speech-avt">👩‍🏫</div>
    <div class="lt-speech-bubble">
      <div class="lt-speech-name">Lesson Teacher</div>
      <div class="lt-speech-text">${lesson.opening || 'Good day! Let us begin.'}</div>
    </div>
  </div>`;

  // ── DEFINITION ──
  if(lesson.definition){
    html += `
  <div class="def-box" style="border-left-color:${accent}">
    <div class="def-label" style="color:${accent}">📌 Definition</div>
    <div class="def-text">${lesson.definition}</div>
  </div>`;
  }

  // ── DIAGRAM PLACEHOLDER — filled by fetchDiagram() after render ──
  html += `
  <div class="diagram-section">
    <div class="diag-label">📊 Diagram / Illustration</div>
    <div id="lessonDiagram" class="diagram-box"></div>
  </div>`;

  // ── EXPLANATION BLOCKS ──
  if(lesson.explanation && lesson.explanation.length){
    html += `<div class="expl-section">`;
    let stepN = 1;
    lesson.explanation.forEach((block) => {
      if(block.type === 'paragraph'){
        html += `<p class="expl-para">${block.text}</p>`;
      } else if(block.type === 'step'){
        html += `<div class="expl-step">
          <div class="step-num" style="background:${accent}">${stepN++}</div>
          <div class="step-body">${block.title ? `<strong>${block.title}</strong><br>` : ''}${block.text}</div>
        </div>`;
      } else if(block.type === 'callout'){
        const cls = {info:'callout-info',warning:'callout-warning',success:'callout-success',nigeria:'callout-nigeria'}[block.style]||'callout-info';
        const ico = block.icon || {info:'💡',warning:'⚠️',success:'✅',nigeria:'🇳🇬'}[block.style] || '💡';
        html += `<div class="expl-callout ${cls}">
          <div class="callout-label">${ico} ${block.title||'Note'}</div>
          <div class="callout-body">${block.text}</div>
        </div>`;
      } else if(block.type === 'analogy'){
        html += `<div class="expl-analogy">
          <div class="analogy-tag">🇳🇬 Nigerian Analogy</div>
          <p>${block.text}</p>
        </div>`;
      }
    });
    html += `</div>`;
  }

  // ── FORMULA / LAW ──
  if(lesson.formula){
    html += `
  <div class="formula-section">
    <div class="formula-label">📐 Formula / Law / Rule</div>
    <div class="formula-display">${lesson.formula}</div>
    ${lesson.formula_note ? `<div class="formula-note">${lesson.formula_note}</div>` : ''}
  </div>`;
  }

  // ── WORKED EXAMPLE ──
  if(lesson.worked_example){
    const we = lesson.worked_example;
    html += `
  <div class="worked-section" style="border-color:${accent}33;background:${accent}08">
    <div class="worked-label" style="color:${accent}">✏️ Worked Example</div>
    <div class="worked-question">❓ ${we.question}</div>
    <div class="worked-steps">
      ${(we.steps||[]).map((st,i)=>`
      <div class="ws-line">
        <span class="ws-num" style="background:${accent}22;color:${accent}">Step ${i+1}</span>
        <span>${st}</span>
      </div>`).join('')}
    </div>
    <div class="worked-answer" style="background:${accent}">✅ ${we.answer}</div>
  </div>`;
  }

  // ── KEY TERMS ──
  if(lesson.key_terms && lesson.key_terms.length){
    html += `
  <div class="keyterms-section">
    <div class="kt-label">🔑 Key Terms</div>
    <div class="kt-grid">
      ${lesson.key_terms.map(k=>`
      <div class="kt-card">
        <div class="kt-term" style="color:${accent}">${k.term}</div>
        <div class="kt-def">${k.def}</div>
      </div>`).join('')}
    </div>
  </div>`;
  }

  // ── COMPARISON TABLE ──
  if(tableReal){
    const t = lesson.table;
    html += `
  <div class="table-section">
    <div class="tbl-label">📋 ${t.title||'Summary Table'}</div>
    <div class="tbl-wrap">
      <table class="les-table">
        <thead><tr>${t.headers.map(h=>`<th style="background:${accent};color:#fff">${h}</th>`).join('')}</tr></thead>
        <tbody>${t.rows.map((row,i)=>`<tr class="${i%2?'tbl-alt':''}">${row.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>
  </div>`;
  }

  // ── MNEMONIC ──
  if(lesson.mnemonic){
    html += `
  <div class="mnemonic-section">
    <div class="mn-label">🧠 Memory Aid</div>
    <div class="mn-text">${lesson.mnemonic}</div>
  </div>`;
  }

  // ── EXAM TIP + COMMON MISTAKE ──
  if(lesson.exam_tip){
    html += `
  <div class="exam-tip-section">
    <div class="et-hdr"><span class="et-badge">${exam}</span> Exam Tip — What Examiners Look For</div>
    <p>${lesson.exam_tip}</p>
    ${lesson.common_mistake ? `<div class="common-mistake">⚠️ <strong>Common Mistake:</strong> ${lesson.common_mistake}</div>` : ''}
  </div>`;
  }

  html += `</div></div>`; // .rich-lesson .lesson-inner
  return html;
}

// ════════════════════ CHECK QUIZ ════════════════════
window.checkQuiz = function(btn, correct, correctExplain, wrongExplain){
  if(topicQuizDone) return;
  topicQuizDone = true;
  document.querySelectorAll('#quizOpts .ans-opt').forEach(b=>{
    b.disabled = true;
    if(b.dataset.correct === 'true') b.classList.add('cor');
  });
  const fb = document.getElementById('quizFeedback');
  if(!fb) return;
  if(correct){
    xp += 50; updateXP();
    btn.classList.add('cor');
    fb.innerHTML = `<div class="lt-fb fb-ok">
      <div class="lt-mini-avt">👩‍🏫</div>
      <div class="fb-txt"><strong>✅ Correct! +50 XP 🎉</strong><p style="margin-top:5px">${correctExplain}</p></div>
    </div>`;
    speakIt('Excellent! That is correct. ' + correctExplain.split('.')[0] + '.');
    addChatMsg('lt', '🎉 Correct! +50 XP earned. Ask me anything to go deeper, or move to the next topic. 💪');
  } else {
    btn.classList.add('wng');
    fb.innerHTML = `<div class="lt-fb fb-no">
      <div class="lt-mini-avt">👩‍🏫</div>
      <div class="fb-txt"><strong>Not quite — but this is how we learn.</strong><p style="margin-top:5px">${wrongExplain}</p></div>
    </div>`;
    speakIt('Not quite. ' + wrongExplain.split('.')[0] + '. Let me explain it differently.');
    addChatMsg('lt', 'That was not correct — do not be discouraged. Let me re-explain this topic a different way. 📖');
    setTimeout(() => reteachTopic(currentSubject, currentTerm, currentTopicIdx), 1200);
  }
  setTimeout(()=> fb.scrollIntoView({behavior:'smooth',block:'nearest'}), 200);
};

// ════════════════════ RETEACH TOPIC ════════════════════
async function reteachTopic(subjKey, term, idx){
  const s = SYLLABUS[subjKey];
  if(!s) return;
  const topicTitle = getTopicTitle(s, term, idx);
  const msg = `The student got the quiz question wrong. Re-explain "${topicTitle}" using a completely different analogy or approach. Be concise: 3-4 sentences. Plain text only.`;
  chatHistory.push({role:'user', content: msg});
  showTypingIndicator();
  try{
    const res = await fetch('/api/anthropic',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({model:'claude-sonnet-4-5',max_tokens:400,
        system: buildSystemPrompt(s, topicTitle, term), messages: chatHistory})
    });
    const data = await res.json();
    const reply = data.content?.find(b=>b.type==='text')?.text||'';
    document.getElementById('typing')?.remove();
    if(reply){ chatHistory.push({role:'assistant',content:reply}); addChatMsg('lt',reply); speakIt(reply.split(/[.!?]/)[0]||''); }
  }catch(e){ document.getElementById('typing')?.remove(); }
}

// ════════════════════ LESSON FALLBACK ════════════════════
function renderLessonFallback(s, topicTitle, term, idx){
  const loadingState = document.getElementById('lessonLoadingState');
  const body = document.getElementById('lessonBody');
  const nav  = document.getElementById('lessonNav');
  if(loadingState) loadingState.style.display='none';
  if(nav) nav.style.display='flex';
  if(body) body.innerHTML = `
    <div class="lesson-inner">
      <div class="lt-speech-card">
        <div class="lt-speech-avt">👩‍🏫</div>
        <div class="lt-speech-bubble">
          <div class="lt-speech-name">Lesson Teacher</div>
          <div class="lt-speech-text">Good day! We are now covering <strong>${topicTitle}</strong>. I am ready to teach you. Use the chat panel — ask me to explain, give examples, show WAEC questions, or work through a problem step by step.</div>
        </div>
      </div>
    </div>`;
  addChatMsg('lt', 'I am ready to teach you ' + topicTitle + '. Ask me: "Explain this topic", "Nigerian example", "WAEC question", or "Worked example step by step."');
}


function renderEmbeddedQuiz(lesson, s, topicTitle){
  const qArea = document.getElementById('quizArea');
  if(!qArea || topicQuizDone) return;
  // Lesson quizzes are relaxed — no integrity monitoring

  const ce = (lesson.quiz_correct_explain||'').replace(/`/g,"'").replace(/"/g,'&quot;');
  const we = (lesson.quiz_wrong_explain||'').replace(/`/g,"'").replace(/"/g,'&quot;');

  qArea.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-hdr" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span class="quiz-badge">✅ Check Your Understanding</span>
          <span style="font-size:.72rem;color:var(--cl-muted)">Based on what I just taught you</span>
        </div>
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:100px;font-size:.68rem;font-weight:700;background:rgba(34,197,94,.1);color:#4ade80;border:1px solid rgba(34,197,94,.18)">🛡️ Integrity ON</span>
      </div>
      <p class="quiz-q">${lesson.quiz_question}</p>
      <div id="quizOpts">
        ${(lesson.quiz_options||[]).map(o=>`
          <button class="ans-opt" data-correct="${o.correct}"
            onclick="checkQuiz(this,${o.correct},\`${ce}\`,\`${we}\`)">
            <span class="opt-ltr">${o.letter}</span>${o.text}
          </button>`).join('')}
      </div>
      <div id="quizFeedback"></div>
    </div>`;

  qArea.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// Keep offerQuiz as a no-op now — quiz comes from lesson JSON
async function offerQuiz(s, topicTitle, term, idx){ /* Quiz now embedded in lesson JSON */ }

// ── HOW-TO VIDEO & DOCUMENTARY PLACEHOLDERS ──
// Replace these URLs with your actual Loom/YouTube embed links
const HOW_TO_VIDEO_URL   = ''; // e.g. 'https://www.loom.com/embed/abc123'
const DOCUMENTARY_URL    = ''; // e.g. 'https://www.youtube.com/embed/abc123'

function playHowTo(){
  if(HOW_TO_VIDEO_URL){
    const overlay = document.getElementById('hvOverlay');
    if(overlay){
      overlay.style.display = 'none';
      const box = overlay.parentElement;
      const iframe = document.createElement('iframe');
      iframe.src = HOW_TO_VIDEO_URL + '?autoplay=1';
      iframe.style.cssText = 'width:100%;height:100%;border:0;position:absolute;inset:0;';
      iframe.allow = 'autoplay; fullscreen';
      box.appendChild(iframe);
    }
  } else {
    alert('Video coming soon! We are filming the how-to guide. Check back shortly — or enter the classroom and explore it yourself. 😊');
  }
}

function playDocu(){
  if(DOCUMENTARY_URL){
    window.open(DOCUMENTARY_URL, '_blank');
  } else {
    alert('The Tech Bros Africa documentary is coming soon! Follow us on social media to be the first to see it.');
  }
}

// ── PARENT GUIDE PDF GENERATOR ──
function downloadParentGuide(){
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Parent Guide — Lesson Teacher · Tech Bros Africa</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Georgia,'Times New Roman',serif;color:#0f172a;background:#fff;}
  .page{max-width:210mm;margin:0 auto;padding:20mm 18mm 24mm;}
  .cover{background:linear-gradient(135deg,#0a1628,#1e3a8a);border-radius:12px;padding:40px;color:#fff;margin-bottom:32px;text-align:center;}
  .cover-logo{font-size:2rem;margin-bottom:8px;}
  .cover h1{font-size:22px;font-weight:700;margin-bottom:8px;line-height:1.3;}
  .cover p{font-size:12px;color:rgba(255,255,255,.7);line-height:1.6;}
  .cover-sub{font-size:11px;color:rgba(255,255,255,.5);margin-top:12px;}
  h2{font-size:16px;font-weight:700;color:#0a1628;margin:24px 0 10px;border-left:4px solid #2563eb;padding-left:10px;}
  h3{font-size:13px;font-weight:700;color:#1e3a8a;margin:16px 0 6px;}
  p,li{font-size:12px;line-height:1.8;color:#374151;margin-bottom:8px;}
  ul{padding-left:20px;margin-bottom:12px;}
  li{margin-bottom:4px;}
  .tip{background:#eff6ff;border-left:4px solid #2563eb;padding:10px 14px;border-radius:0 6px 6px 0;margin:12px 0;}
  .tip strong{color:#1e3a8a;}
  .routine-table{width:100%;border-collapse:collapse;margin:12px 0;font-size:11px;}
  .routine-table th{background:#0a1628;color:#fff;padding:7px 10px;text-align:left;}
  .routine-table td{padding:7px 10px;border-bottom:1px solid #e2e8f0;}
  .routine-table tr:nth-child(even) td{background:#f8fafc;}
  .ceo-note{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;}
  .ceo-sig{font-size:12px;color:#1e3a8a;font-style:italic;margin-top:10px;}
  .footer-bar{border-top:2px solid #2563eb;margin-top:32px;padding-top:12px;display:flex;justify-content:space-between;font-size:10px;color:#64748b;}
  @media print{@page{margin:20mm 18mm;}}
</style></head><body>
<div class="page">

<div class="cover">
  <div class="cover-logo">📚</div>
  <h1>How to Use AI and the Internet to Help Your Child Learn Better, Cheaper, and on Their Own</h1>
  <p>A practical guide for Nigerian parents — from the team at Tech Bros Africa</p>
  <div class="cover-sub">Lesson Teacher · lessonteacher.africa · Tech Bros Africa 🇳🇬 · ${new Date().getFullYear()}</div>
</div>

<div class="ceo-note">
  <h3>A Note from Mr. Demiju — CEO, Tech Bros Africa</h3>
  <p>Dear Parent, when I built Lesson Teacher, I was thinking of one student — a bright Nigerian child who wants to learn but cannot always access the right support. Perhaps extra lessons are expensive. Perhaps the school is under-resourced. Perhaps the textbook explanation is not clicking.</p>
  <p>Lesson Teacher is our answer. She knows every approved NERDC textbook from Primary 1 to SS3, follows your child exact school week, and teaches with the patience and warmth of the best teacher you have ever known. She is available at midnight, on a Sunday, on the bus.</p>
  <p>But this tool works best when you — the parent — are involved. This guide will show you exactly how.</p>
  <div class="ceo-sig">With respect and conviction,<br><strong>Mr. Demiju</strong> · CEO, Tech Bros Africa 🇳🇬</div>
</div>

<h2>Part 1: Understanding AI for Your Child's Education</h2>

<h3>What is AI and why does it matter for your child?</h3>
<p>Artificial Intelligence (AI) is computer software that can understand language, answer questions, explain concepts, and adapt to each student. Lesson Teacher is AI — she reads your child questions and gives personalised answers, exactly the way a private tutor would.</p>
<p>The world your child will graduate into will be shaped by AI. Understanding it early gives them a massive advantage — and you do not need to be technical to help your child benefit from it.</p>

<div class="tip"><strong>Key message for parents:</strong> AI does not replace your child brain — it sharpens it. Think of it like a calculator for understanding: it helps them get there faster, but they still need to do the thinking.</div>

<h3>Is it safe for my child?</h3>
<p>Lesson Teacher is designed specifically for Nigerian students. There are no adverts, no social media links, no inappropriate content. It stays on the Nigerian curriculum — Primary 1 to SS3. It is as safe as a textbook, and far more engaging.</p>

<h2>Part 2: Setting Up a Learning Routine at Home</h2>

<h3>The 30-minute daily routine (most powerful thing you can do)</h3>
<table class="routine-table">
  <tr><th>Time</th><th>Activity</th><th>Your Role</th></tr>
  <tr><td>0–2 min</td><td>Open Lesson Teacher, select subject</td><td>Sit with them, ask "what are you studying today?"</td></tr>
  <tr><td>2–15 min</td><td>Read and listen to the lesson</td><td>Step back — let them read independently</td></tr>
  <tr><td>15–22 min</td><td>Chat with Lesson Teacher — ask questions</td><td>Encourage: "Ask her to explain the part you didn't understand"</td></tr>
  <tr><td>22–28 min</td><td>Answer the quiz question</td><td>Do not give the answer — let them try first</td></tr>
  <tr><td>28–30 min</td><td>Download lesson notes, review together</td><td>Ask: "What was the most interesting thing you learned?"</td></tr>
</table>

<h3>Devices and data tips for Nigerian parents</h3>
<ul>
  <li>Lesson Teacher works on any smartphone, tablet, or laptop — Android, iPhone, Windows, Mac.</li>
  <li>It uses approximately 5–15MB of data per lesson session — less than watching a one-minute video.</li>
  <li>You can use MTN, Airtel, Glo, or 9mobile data — any Nigerian network works.</li>
  <li>For children under 10, sit nearby during sessions, especially for the first few weeks.</li>
  <li>For SS students preparing for WAEC/JAMB, the Exam Centre feature is particularly valuable — encourage 20 minutes of past questions daily in the final term.</li>
</ul>

<h2>Part 3: How to Monitor Your Child's Progress</h2>

<h3>Signs your child is using it well</h3>
<ul>
  <li>They can explain what they studied to you in their own words</li>
  <li>They ask Lesson Teacher follow-up questions (not just reading passively)</li>
  <li>Their XP (experience points) is growing steadily</li>
  <li>They are downloading lesson notes and referring to them later</li>
  <li>They are using the Exam Centre for practice questions</li>
</ul>

<h3>Signs they may need your encouragement</h3>
<ul>
  <li>Opening the app but not really engaging — scrolling through without asking questions</li>
  <li>Only doing one topic and stopping</li>
  <li>Not using the mic or chat to ask questions</li>
</ul>

<div class="tip"><strong>Tip:</strong> Ask your child once a week to "teach" you something they learned on Lesson Teacher. If they can explain it clearly, they have truly understood it. This is the highest level of learning.</div>

<h2>Part 4: Free Online Resources to Supplement</h2>
<ul>
  <li><strong>WAEC Past Questions:</strong> waecdirect.org — official WAEC results and resources</li>
  <li><strong>JAMB:</strong> jamb.gov.ng — official JAMB syllabus and past questions</li>
  <li><strong>Khan Academy:</strong> khanacademy.org — free maths and science videos in English</li>
  <li><strong>YouTube:</strong> Search "[topic] + Nigeria + SS2" for video explanations from Nigerian teachers</li>
  <li><strong>NOUN Open Courseware:</strong> Free university-level resources from National Open University</li>
</ul>

<h2>Part 5: Week-by-Week Study Planner</h2>
<p>Print this template and fill in your child subjects for each week of term. Track which topics they have covered with Lesson Teacher.</p>
<table class="routine-table">
  <tr><th>Week</th><th>Subject 1</th><th>Subject 2</th><th>Subject 3</th><th>Done?</th></tr>
  ${Array.from({length:12},(_,i)=>`<tr><td>Week ${i+1}</td><td></td><td></td><td></td><td></td></tr>`).join('')}
</table>

<div class="footer-bar">
  <span><strong>Lesson Teacher</strong> by Tech Bros Africa 🇳🇬 · lessonteacher.africa</span>
  <span>Free parent resource · ${new Date().getFullYear()}</span>
</div>
</div>
<!-- Preview key block removed — production uses server-side /api/anthropic -->
<!-- ══════════════ END PREVIEW KEY ENTRY ══════════════ -->

</body></html>`;

  const blob = new Blob([html], {type:'text/html'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'Lesson-Teacher-Parent-Guide-Tech-Bros-Africa.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ════════════════════ SPEED OPTIMISATIONS ════════════════════
// 1. Lesson request is trimmed — no diagram or illustration instructions in the JSON prompt
//    (diagram fetches separately via fetchDiagram after lesson renders)
// 2. max_tokens reduced to 2000 for lesson (was 2800) — tighter prompt = faster response
// 3. Chat max_tokens stays at 500 — already fast
// 4. Quiz deferred to 1400ms after lesson renders — never blocks lesson display
// 5. Voice only speaks the opening sentence (not full lesson) — faster start
// 6. Diagram fetch is fire-and-forget — never blocks lesson display


// ════════════════════ CHAT FUNCTIONS ════════════════════

function addChatMsg(who, txt){
  const box = document.getElementById('chatMsgs');
  if(!box) return;
  const d = document.createElement('div');
  d.className = 'cmsg cmsg-' + (who === 'lt' ? 'lt' : 'usr');
  // Format the message text — handle markdown-like markers
  const formatted = formatChatReply(txt);
  d.innerHTML = '<div class="cmsg-nm">' + (who === 'lt' ? '👩‍🏫 Lesson Teacher' : (studentName || 'You')) + '</div>'
              + '<div class="cmsg-bub">' + formatted + '</div>';
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

function formatChatReply(txt){
  // Format chat reply with styled markers
  return txt
    .replace(/\[STEP (\d+)\](.*?)(?=\[STEP|\[NG\]|\[F\]|\[TIP\]|$)/gs,
      '<div class="chat-step"><div class="chat-step-num">$1</div><div>$2</div></div>')
    .replace(/\[NG\](.*?)\[\/NG\]/gs,
      '<div class="chat-ng">$1</div>')
    .replace(/\[F\](.*?)\[\/F\]/gs,
      '<span class="chat-formula">$1</span>')
    .replace(/\[TIP\](.*?)\[\/TIP\]/gs,
      '<div class="chat-tip">$1</div>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function showTypingIndicator(){
  const box = document.getElementById('chatMsgs');
  if(!box) return;
  document.getElementById('typing')?.remove();
  const d = document.createElement('div');
  d.className = 'cmsg cmsg-lt'; d.id = 'typing';
  d.innerHTML = '<div class="cmsg-nm">👩‍🏫 Lesson Teacher</div>'
              + '<div class="cmsg-bub"><div class="lt-loading">'
              + '<div class="ld-dot"></div><div class="ld-dot"></div><div class="ld-dot"></div>'
              + '</div></div>';
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

function sendChat(){
  const inp = document.getElementById('chatInp');
  if(!inp) return;
  const msg = inp.value.trim();
  if(!msg) return;
  addChatMsg('usr', msg);
  inp.value = '';
  inp.style.height = 'auto';
  showTypingIndicator();
  chatHistory.push({role:'user', content: msg});
  const s = SYLLABUS[currentSubject];
  const topicTitle = s ? getTopicTitle(s, currentTerm, currentTopicIdx) : 'this topic';
  fetchTutorReply(s, topicTitle);
}

// ════════════════════ XP ════════════════════

function updateXP(){
  const badge  = document.getElementById('xpBadge');
  const badge2 = document.getElementById('xpBadge2');
  const sbXP   = document.getElementById('sbXP');
  const wcXP   = document.getElementById('wcXP');
  const streak = document.getElementById('sbStreak');
  if(badge)  badge.textContent  = '⚡ ' + xp + ' XP';
  if(badge2) badge2.textContent = '⚡ ' + xp + ' XP';
  if(sbXP)   sbXP.textContent   = '⚡ ' + xp + ' XP';
  if(wcXP)   wcXP.textContent   = xp;
  // Streak (days — simplified: increment on each new day)
  try{
    const today = new Date().toDateString();
    const last  = localStorage.getItem('lt_last_day');
    if(last !== today){
      streakDays++;
      localStorage.setItem('lt_last_day', today);
      localStorage.setItem('lt_streak', streakDays);
    }
  }catch(e){}
  const sv = document.getElementById('sbStreak');
  const wv = document.getElementById('wcStreak');
  if(sv) sv.textContent = streakDays;
  if(wv) wv.textContent = streakDays;
}

// ════════════════════ LOAD TOPIC ════════════════════

function loadTopic(subjKey, term, idx){
  const s = SYLLABUS[subjKey];
  if(!s) return;
  const topicTitle = getTopicTitle(s, term, idx);
  if(!topicTitle) return;

  const topicCount = s.terms[term]?.length || 1;
  topicQuizDone = false;
  currentTerm   = term;
  currentTopicIdx = idx;

  // Show lesson area, hide welcome screen
  const welcome    = document.getElementById('welcomeScreen');
  const lessonArea = document.getElementById('lessonArea');
  if(welcome)    welcome.style.display    = 'none';
  if(lessonArea) lessonArea.style.display = 'block';

  // Update AI panel subject label
  const chatLabel = document.getElementById('chatSubjLabel');
  if(chatLabel) chatLabel.textContent = s.name + ' · ' + topicTitle;

  // Update context bar
  updateContextBar(s.name, topicTitle, term);

  // Reset lesson areas
  const loadingState = document.getElementById('lessonLoadingState');
  const lessonBody   = document.getElementById('lessonBody');
  const lessonNav    = document.getElementById('lessonNav');
  const quizArea     = document.getElementById('quizArea');
  const loadingText  = document.getElementById('loadingText');
  if(loadingState) loadingState.style.display = 'block';
  if(lessonBody)   lessonBody.innerHTML        = '';
  if(lessonNav)    lessonNav.style.display     = 'none';
  if(quizArea)     quizArea.innerHTML          = '';
  if(loadingText)  loadingText.textContent     = 'Preparing your lesson...';

  // Update topbar subject name
  const ctbSubj = document.getElementById('ctbSubj');
  if(ctbSubj) ctbSubj.textContent = s.ico + ' ' + s.name + ' — ' + topicTitle;

  // Highlight sidebar topic
  document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('on'));
  const topicEl = document.querySelector(`.topic-item[data-idx="${idx}"][data-term="${term}"]`);
  if(topicEl) topicEl.classList.add('on');

  // Show download button
  const dlBtn = document.getElementById('dlBtn');
  if(dlBtn) dlBtn.style.display = 'inline-flex';

  // Reset chat history for new topic
  chatHistory = [];

  // Scroll lesson panel to top
  const panel = document.getElementById('lessonPanel');
  if(panel) panel.scrollTop = 0;

  // Start progress animation
  startLessonProgress();
  activateWaves(true);

  // Show "Learn how to use" tour (skippable, with help button)
  if (typeof window.maybeShowLtTour === 'function') window.maybeShowLtTour('lesson');

  // Abort any in-progress lesson fetch
  if(window._lessonAbort){ try{window._lessonAbort.abort();}catch(e){} }
  window._lessonAbort = new AbortController();
  // Fire the lesson fetch
  fetchLessonOpening(s, topicTitle, term, idx, window._lessonAbort.signal);
}

// ════════════════════ DOWNLOAD PDF ════════════════════

function downloadLessonPDF(){
  const d = window._currentLesson;
  if(!d){ alert('Please open a lesson first.'); return; }
  const { lesson, s, topicTitle, term } = d;

  const bodyHtml = document.getElementById('lessonBody')?.innerHTML || '';
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>${topicTitle} — ${s.name} ${s.cls}</title>
<style>
  body{font-family:Georgia,serif;max-width:720px;margin:0 auto;padding:32px;color:#1e293b;line-height:1.7;}
  h1{font-size:1.6rem;color:#1e293b;border-bottom:3px solid #2563eb;padding-bottom:8px;}
  h2{font-size:1.1rem;color:#2563eb;margin-top:24px;}
  .board-header{background:#2563eb;color:#fff;padding:16px 20px;border-radius:10px;margin-bottom:20px;}
  .board-header h2{color:#fff;margin:0;}
  .def-box{background:#f0f9ff;border-left:4px solid #2563eb;padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;}
  .formula-display{font-family:monospace;background:#fef3c7;padding:10px 18px;border-radius:6px;font-size:1.2rem;font-weight:700;}
  .exam-tip-section{background:#fffbeb;border:1px solid #fbbf24;padding:14px;border-radius:8px;}
  .mnemonic-section{background:#f5f3ff;border:1px solid #a78bfa;padding:14px;border-radius:8px;text-align:center;}
  .worked-section{border:2px solid #2563eb33;border-radius:10px;padding:16px;margin:16px 0;}
  .quiz-card{background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px;}
  .lt-speech-card{background:#eff6ff;border-left:4px solid #3b82f6;padding:14px;border-radius:0 10px 10px 0;margin:16px 0;}
  @media print{body{padding:0} .board-header{-webkit-print-color-adjust:exact}}
</style>
</head>
<body>
  <div style="text-align:center;margin-bottom:24px">
    <img style="height:36px" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 36'%3E%3Crect width='120' height='36' rx='8' fill='%232563eb'/%3E%3Ctext x='60' y='24' text-anchor='middle' font-family='Arial' font-size='14' font-weight='700' fill='white'%3ELesson Teacher%3C/text%3E%3C/svg%3E" alt="Lesson Teacher">
    <div style="font-size:.8rem;color:#64748b;margin-top:4px">Tech Bros Africa · Nigeria NERDC Syllabus</div>
  </div>
  ${bodyHtml}
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:.75rem;color:#94a3b8;text-align:center">
    Lesson Teacher · ${s.name} ${s.cls} · ${term} · ${new Date().toLocaleDateString('en-NG')} · Tech Bros Africa 🇳🇬
  </div>
</body></html>`;

  const blob = new Blob([html], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (topicTitle + ' — ' + s.name + ' ' + s.cls + '.html').replace(/[^a-z0-9 .\-]/gi,'_');
  a.click();
  URL.revokeObjectURL(a.href);
}


// ── THEME TOGGLE ──
let isDarkMode = true;
function toggleTheme(){
  isDarkMode = !isDarkMode;
  document.documentElement.classList.toggle('light-mode', !isDarkMode);
  const btn = document.getElementById('themeBtn');
  if(btn) btn.textContent = isDarkMode ? '🌙' : '☀️';
  try{ localStorage.setItem('lt_theme', isDarkMode ? 'dark' : 'light'); }catch(e){}
}
function initTheme(){
  try{
    const saved = localStorage.getItem('lt_theme');
    if(saved === 'light'){ isDarkMode = false; document.documentElement.classList.add('light-mode'); const b=document.getElementById('themeBtn'); if(b) b.textContent='☀️'; }
  }catch(e){}
}

// ── AI PANEL CONTROLS ──
function toggleAiPanel(){
  const panel = document.getElementById('aiPanel');
  const btn   = document.getElementById('aiOpenBtn');
  if(!panel) return;
  const opening = panel.classList.toggle('open');
  if(btn){
    btn.innerHTML = opening
      ? '<span style="font-size:.85rem">✕</span> Close'
      : '👩‍🏫 Ask Tutor';
  }
  if(opening){
    const msgs = document.getElementById('chatMsgs');
    if(msgs) setTimeout(()=>{ msgs.scrollTop = msgs.scrollHeight; }, 280);
  }
}
function toggleAiPanelMobile(){ toggleAiPanel(); }

// ── CONTEXT BAR ──
function updateContextBar(subjName, topicTitle, term){
  const cs   = document.getElementById('ctxSubject');
  const ct   = document.getElementById('ctxTopic');
  const cr   = document.getElementById('ctxTerm');
  const csep = document.getElementById('ctxTermSep');
  if(cs) cs.textContent = subjName || '—';
  if(ct) ct.textContent = topicTitle || '—';
  if(cr && term){ cr.textContent = term; cr.style.display='inline'; }
  if(csep && term) csep.style.display='inline';
}

// ── CHAT PANEL COMPAT (kept for any legacy calls) ──
function toggleChat(){ /* replaced by toggleAiPanel */ }
function maximizeChat(){ toggleAiPanel(); }

// ── LESSON LOADING PROGRESS BAR ──
let _progressInterval = null;
function startLessonProgress(){
  const bar = document.getElementById('lessonProgressBar');
  const pct = document.getElementById('lessonProgressPct');
  const msg = document.getElementById('lessonProgressMsg');
  const lt  = document.getElementById('loadingText');
  if(!bar) return;

  // Steps: [percent, bar-message, heading-text, stepIdx-to-activate]
  const steps = [
    [8,  'Reading the syllabus...',         'Opening your textbooks...',    0],
    [18, 'Building the lesson plan...',     'Planning the lesson...',       0],
    [32, 'Writing key definitions...',      'Writing notes & definitions...', 1],
    [46, 'Finding Nigerian examples...',    'Adding Nigerian examples...',   1],
    [58, 'Preparing worked examples...',    'Working through examples...',   2],
    [68, 'Adding real exam questions...',   'Connecting to WAEC syllabus...', 2],
    [76, 'Writing exam tips...',            'Adding exam tips & tricks...',  3],
    [85, 'Creating your quiz...',           'Making your quiz question...',  4],
    [92, 'Almost ready...',                 'Putting it all together...',    4],
    [97, 'Final touches...',                'Almost there!',                 4],
  ];

  // Tips to rotate while waiting
  const tips = [
    'Study Tip: 30 minutes daily beats 4 hours on Sunday. Consistency is your superpower.',
    'WAEC Tip: Always read the question twice before answering. Understand what is being asked.',
    'Memory Tip: Write down key points in your own words — it sticks 3× better than reading.',
    'Exam Tip: In Paper 2, structure your answer with clear headings and numbered points.',
    'Success Tip: The students who review wrong answers are the ones who get A1.',
  ];
  let tipIdx = 0;
  const tipEl = document.getElementById('loadingTipText');
  const tipInterval = setInterval(()=>{
    tipIdx = (tipIdx + 1) % tips.length;
    if(tipEl){ tipEl.style.opacity='0'; setTimeout(()=>{ tipEl.textContent=tips[tipIdx]; tipEl.style.opacity='1'; }, 300); }
  }, 4000);
  if(tipEl){ tipEl.style.transition='opacity .3s'; }

  let step = 0;
  let lastStepIdx = -1;
  clearInterval(_progressInterval);
  _progressInterval = setInterval(()=>{
    if(step < steps.length){
      const [p, m, heading, si] = steps[step];
      if(bar){ bar.style.width = p + '%'; }
      if(pct){ pct.textContent = p + '%'; }
      if(msg){ msg.textContent = m; }
      if(lt) { lt.textContent = heading; }

      // Update step indicators
      if(si !== lastStepIdx){
        // Mark previous as done
        for(let i = 0; i < si; i++){
          const el = document.getElementById('lsStep' + i);
          if(el){ el.className = el.className.replace('active','done').replace('ls-step ','ls-step done '); el.classList.add('done'); el.classList.remove('active'); const d = el.querySelector('div'); if(d) d.className='ls-dot-done'; }
        }
        // Mark current as active
        const active = document.getElementById('lsStep' + si);
        if(active){ active.classList.add('active'); const d = active.querySelector('div'); if(d) d.className='ls-dot-active'; }
        lastStepIdx = si;
      }
      step++;
    }
  }, 900);

  // Store tip interval to clear it
  window._tipInterval = tipInterval;
}

function stopLessonProgress(){
  clearInterval(_progressInterval);
  if(window._tipInterval) clearInterval(window._tipInterval);
  const bar = document.getElementById('lessonProgressBar');
  const pct = document.getElementById('lessonProgressPct');
  const msg = document.getElementById('lessonProgressMsg');
  const lt  = document.getElementById('loadingText');
  if(bar){ bar.style.width = '100%'; bar.style.background='linear-gradient(90deg,#10b981,#34d399)'; }
  if(pct){ pct.textContent = '100%'; pct.style.color='#10b981'; }
  if(msg){ msg.textContent = 'Lesson ready!'; }
  if(lt) { lt.textContent = 'Your lesson is ready!'; }
  // Mark all steps done
  for(let i=0;i<5;i++){
    const el=document.getElementById('lsStep'+i);
    if(el){ el.classList.add('done'); el.classList.remove('active'); const d=el.querySelector('div'); if(d) d.className='ls-dot-done'; }
  }
}

// ── DIAGRAM — OpenAI DALL-E for rich images, Claude SVG as backup ──
async function fetchDiagram(s, topicTitle, term){
  const diagramEl = document.getElementById('lessonDiagram');
  if(!diagramEl) return;

  diagramEl.innerHTML = '<div class="diag-loading"><div class="ld-dot"></div><div class="ld-dot"></div><div class="ld-dot"></div><span style="margin-left:8px;font-size:.8rem;color:var(--cl-muted)">Drawing diagram...</span></div>';

  // Subject-specific diagram context — tells Claude what kind of diagram to produce
  const hints = {
    'Biology':             'Draw a BIOLOGICAL diagram: accurately labelled cell structure, organ cross-section, or life-process flowchart. Include arrows showing direction, and every part clearly labelled with leader lines.',
    'Chemistry':           'Draw a CHEMISTRY diagram: accurate molecular structure, electron-dot diagram, lab apparatus setup, or reaction-mechanism flowchart. Use standard chemistry notation.',
    'Physics':             'Draw a PHYSICS diagram: accurate force diagram with vectors, electric circuit using standard symbols (resistor/battery/bulb), wave diagram, or optics ray diagram. Include measurements.',
    'Mathematics':         'Draw a MATHEMATICAL diagram: accurate coordinate plane with plotted function or shape, clearly labelled axes (x,y), grid lines, and annotated key points. Or a Venn diagram / geometric construction.',
    'Geography':           'Draw a GEOGRAPHY diagram: accurate landform cross-section, river valley, or climate graph with labelled axes. Or a simplified map with compass rose.',
    'Government':          'Draw a GOVERNMENT diagram: clear hierarchy chart OR timeline. Use boxes connected by lines, with proper labels at each level.',
    'Economics':           'Draw an ECONOMICS diagram: supply and demand curves on properly labelled axes (Price on y, Quantity on x), equilibrium point marked, or a flow-of-income circular diagram.',
    'Financial Accounting':'Draw an ACCOUNTING diagram: T-account with debit/credit columns, or a balance sheet structure with assets and liabilities boxes.',
    'English Language':    'Draw an ENGLISH LANGUAGE diagram: sentence tree structure, essay plan flowchart, or comparison of text types. Clean boxes with connecting lines.',
    'Literature in English':'Draw a LITERATURE diagram: plot arc (exposition→rising action→climax→falling action→resolution) with topic events placed on it, or character relationship map.',
    'Social Studies':      'Draw a SOCIAL STUDIES diagram: hierarchy of government levels, map of Nigeria with regions, or a cause-and-effect flowchart.',
    'Basic Science':       'Draw a SCIENCE diagram: life cycle circle, food chain, or simple machine diagram. Clear arrows showing process direction.',
    'Agricultural Science':'Draw an AGRICULTURE diagram: plant growth stages, soil layer profile, or farm ecosystem. Label every part.',
    'Computer Studies':    'Draw a COMPUTER STUDIES diagram: flowchart with decision diamonds and process rectangles, or computer hardware layout with labelled components.',
    'Business Studies':    'Draw a BUSINESS diagram: organizational chart, supply chain flow, or trade cycle. Boxes connected by directional arrows.',
  };

  const subjectHint = hints[s.name] || 'Draw a clear educational diagram with labels, arrows where needed, and a descriptive title.';
  const cls = s.cls;
  const isJunior = cls.startsWith('P') || cls.startsWith('J');
  const complexity = isJunior ? 'Keep it simple and clear for young students. Large text, bold lines, not too many details.' : 'Include proper labels and detail appropriate for senior secondary students.';

  const prompt = `You are a Nigerian textbook illustrator. Draw an educational SVG diagram for:

TOPIC: "${topicTitle}"
SUBJECT: ${s.name} — ${cls}
EXAM: ${s.exam} syllabus

WHAT TO DRAW: ${subjectHint}
${complexity}

STRICT SVG TECHNICAL RULES:
1. Output ONLY the SVG tag — no markdown, no explanation, no code fences
2. Use exactly: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="100%" style="display:block;max-height:340px">
3. First element must be: <rect width="600" height="300" fill="#f8fafc" rx="8"/>
4. Title at top centre: <text x="300" y="22" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#1e293b">YOUR TITLE HERE</text>
5. Colour palette ONLY: #1e293b (dark text), #2563eb (blue), #059669 (green), #d97706 (amber), #dc2626 (red), #7c3aed (purple), #f1f5f9 (light bg), #e2e8f0 (borders), #fff (white fills)
6. All text: font-family="Arial,sans-serif" — keep ALL text inside x:10-590, y:10-295
7. Font sizes: titles 12-14, labels 9-11, never smaller than 9
8. Use <defs><marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#2563eb"/></marker></defs> for arrows, then marker-end="url(#arr)"
9. DO NOT use: clip-path, filter, foreignObject, image tags, or fonts other than Arial
10. The diagram must actually illustrate the TOPIC — not a generic placeholder

Draw it now:`;

  try{
    const res = await fetch('/api/anthropic',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'claude-sonnet-4-5',
        max_tokens:2000,
        messages:[{role:'user', content: prompt}]
      })
    });
    if(_abortSignal && _abortSignal.aborted) return;
    const data = await res.json();
    const raw  = data?.content?.find(b=>b.type==='text')?.text || '';

    // Extract the SVG — handle cases where model wraps it
    let svg = '';
    const direct = raw.match(/<svg[\s\S]*?<\/svg>/i);
    if(direct){
      svg = direct[0];
    } else {
      // Try stripping code fences
      const stripped = raw.replace(/```(?:svg|xml|html)?/gi,'').replace(/```/g,'').trim();
      const m2 = stripped.match(/<svg[\s\S]*?<\/svg>/i);
      if(m2) svg = m2[0];
    }

    if(svg && svg.length > 100){
      // Ensure responsive
      svg = svg.replace(/\bwidth="[0-9]+"/, 'width="100%"')
               .replace(/\bheight="[0-9]+"/, 'height="auto"')
               .replace(/<svg(?![^>]*style=)/, '<svg style="display:block;max-height:340px" ');

      diagramEl.innerHTML =
        '<div style="padding:2px 2px 0">' + svg + '</div>' +
        '<div class="diag-caption">📊 ' + topicTitle + ' — ' + s.cls + ' ' + s.name + '</div>';
    } else {
      // Hide gracefully — lesson still works without diagram
      diagramEl.closest('.diagram-section').style.display = 'none';
    }
  } catch(e){
    diagramEl.closest('.diagram-section').style.display = 'none';
  }
}

async function fetchTutorReply(s, topicTitle){
  document.getElementById('typing')?.remove();
  const historyToSend = chatHistory.slice(-20);

  // Richer system prompt for chat — tells LT to use formatting markers
  const chatSystem = s ? buildSystemPrompt(s, topicTitle, currentTerm)
    + '\n\nFORMATTING FOR CHAT REPLIES:\n'
    + 'Use these special markers so your reply renders beautifully:\n'
    + '• Wrap step-by-step items as: [STEP 1] text [STEP 2] text etc.\n'
    + '• Wrap Nigerian examples as: [NG] example text [/NG]\n'
    + '• Wrap formulas as: [F] formula [/F]\n'
    + '• Wrap exam tips as: [TIP] tip text [/TIP]\n'
    + '• Use **bold** for key terms\n'
    + '• Keep total reply under 120 words. Be sharp and vivid.'
    : 'You are Lesson Teacher. Answer helpfully. Plain text.';

  try{
    const res=await fetch('/api/anthropic',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-5',
        max_tokens:500,
        system: chatSystem,
        messages: historyToSend
      })
    });
    const data=await res.json();
    const raw=data.content?.find(b=>b.type==='text')?.text||'';
    if(raw){
      chatHistory.push({role:'assistant', content:raw});
      addChatMsg('lt', formatChatReply(raw));
      // Speak plain version
      const plain = raw.replace(/\[STEP \d+\]|\[NG\]|\[\/NG\]|\[F\]|\[\/F\]|\[TIP\]|\[\/TIP\]|\*\*/g,'').trim();
      speakIt(plain.split(/[.!?]/).slice(0,3).join('. ').trim());
    }
  }catch(e){
    addChatMsg('lt','I am having a small connection issue. Please try again — I am still here. 😊');
  }
}

// ── Format LT chat replies with rich HTML ──


// ════════════════════ MICROPHONE ════════════════════
let recognition=null, isListening=false;

function initMic(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert('Sorry — your browser does not support voice input. Please use Chrome or Edge.');return null;}
  const r=new SR();
  r.continuous=false;
  r.interimResults=true;
  r.lang='en-NG';
  r.onstart=()=>{
    isListening=true;
    const mb=document.getElementById('micBtn');
    const ms=document.getElementById('micStatus');
    const ci=document.getElementById('chatInp');
    if(mb){mb.classList.add('listening');mb.textContent='🔴';}
    if(ms) ms.classList.add('show');
    if(ci) ci.placeholder='Listening... speak now';
    window.speechSynthesis?.cancel();
  };
  r.onresult=(e)=>{
    let interim='',final='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      const t=e.results[i][0].transcript;
      if(e.results[i].isFinal)final+=t; else interim+=t;
    }
    const ci=document.getElementById('chatInp');
    if(ci) ci.value=final||interim;
  };
  r.onend=()=>{
    isListening=false;
    const mb=document.getElementById('micBtn');
    const ms=document.getElementById('micStatus');
    const ci=document.getElementById('chatInp');
    if(mb){mb.classList.remove('listening');mb.textContent='🎤';}
    if(ms) ms.classList.remove('show');
    if(ci) ci.placeholder='Ask your tutor anything about this topic...';
    const val=document.getElementById('chatInp')?.value.trim();
    if(val) sendChat();
  };
  r.onerror=(e)=>{
    isListening=false;
    const mb=document.getElementById('micBtn');
    const ms=document.getElementById('micStatus');
    if(mb){mb.classList.remove('listening');mb.textContent='🎤';}
    if(ms) ms.classList.remove('show');
    if(e.error==='not-allowed') addChatMsg('lt','I could not access your microphone. Please check your browser permissions and try again.');
  };
  return r;
}

function toggleMic(){
  if(isListening){
    recognition?.stop();return;
  }
  if(!recognition)recognition=initMic();
  if(recognition)recognition.start();
}

// ════════════════════ VOICE (TEXT-TO-SPEECH) ════════════════════
// Google Cloud TTS — en-GB-Neural2-C
// Clear, warm, professional British English — widely understood across
// Nigeria, Ghana and all West Africa. Used in schools, BBC, international edu.
// Free tier: 1 million characters/month. Paste your Google Cloud API key below.
// Get it: console.cloud.google.com → APIs & Services → Credentials → Create API Key
// Then enable "Cloud Text-to-Speech API" in your project.

const GOOGLE_TTS_KEY = ''; // ← paste your Google Cloud API key here

// Voice config — en-GB-Neural2-C: warm, clear female educator voice
// Alternatives you can swap in:
//   en-GB-Neural2-A  — slightly warmer female
//   en-GB-Neural2-F  — slightly more formal female
//   en-AU-Neural2-C  — Australian English (also very clear for West African students)
const GTTS_VOICE   = 'en-GB-Neural2-C';
const GTTS_LANG    = 'en-GB';

let voiceOn = true;
let currentAudio = null;

function toggleVoice(){
  voiceOn = !voiceOn;
  const btn = document.getElementById('voiceBtn');
  if(btn) btn.textContent = voiceOn ? '🔊' : '🔇';
  if(!voiceOn){ stopAudio(); window.speechSynthesis?.cancel(); }
}

function toggleMaximize(){
  // In the new layout, "maximize" means hiding the AI panel for full focus
  toggleAiPanel();
}

function activateWaves(on){
  document.getElementById('vWaves')?.classList.toggle('v-inactive', !on);
}

function stopAudio(){
  if(currentAudio){ currentAudio.pause(); currentAudio.src=''; currentAudio=null; }
  activateWaves(false);
}

async function speakIt(raw){
  if(!voiceOn) return;
  // Clean text — strip HTML, emojis, special chars
  const text = (raw||'')
    .replace(/<[^>]*>/g,'')
    .replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/[\u{1F300}-\u{1FAD6}]/gu,'')   // strip emoji blocks
    .replace(/[^\x00-\x7F]/g,' ')             // strip remaining non-ASCII
    .replace(/\s+/g,' ').trim();
  if(!text) return;

  // Stop anything currently playing
  stopAudio();
  window.speechSynthesis?.cancel();

  // ── ElevenLabs Nigerian voice (preferred, via shim) ──
  if (typeof window.elevenSpeak === 'function') {
    try {
      activateWaves(true);
      await new Promise((resolve) => {
        window.elevenSpeak(text, () => { activateWaves(false); resolve(); });
      });
      return;
    } catch(e) {
      activateWaves(false);
      // fall through to other providers
    }
  }

  // ── Google Cloud TTS (if key is set) ──
  if(GOOGLE_TTS_KEY){
    try{
      activateWaves(true);
      const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`,
        {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: GTTS_LANG,
              name: GTTS_VOICE,
              ssmlGender: 'FEMALE'
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: 0.92,   // measured, clear — not too fast
              pitch: 1.5,           // slightly warm/elevated — teacher tone
              volumeGainDb: 1.0
            }
          })
        }
      );
      if(res.ok){
        const data = await res.json();
        if(data.audioContent){
          const audio = new Audio('data:audio/mp3;base64,' + data.audioContent);
          currentAudio = audio;
          audio.onended = () => { currentAudio=null; activateWaves(false); };
          audio.onerror = () => { currentAudio=null; activateWaves(false); };
          await audio.play();
          return; // ← Google TTS worked, we're done
        }
      }
      // If Google returned an error (bad key, quota, network) fall through to Web Speech
      activateWaves(false);
    } catch(e){
      activateWaves(false);
      // fall through to Web Speech below
    }
  }

  // ── Fallback: Web Speech API ──
  // Voice priority: calm, clear female teacher voice
  // ── Web Speech API fallback ──
  // Best free voice for Nigerian & Ghanaian students:
  // Clear, calm, female, easy to follow — British/Australian English
  if(!window.speechSynthesis) return;

  const u = new SpeechSynthesisUtterance(text);
  u.volume = 1;

  // Pick the best available voice
  // Chrome on Android loads voices async — we use the cached list
  const voices = window._cachedVoices || window.speechSynthesis.getVoices();
  const pick =
    // Nigerian English first — if device has it (newer Android)
    voices.find(v => v.lang === 'en-NG') ||
    voices.find(v => v.lang === 'en-GH') ||
    // British English — clearest for West African students, easy to follow
    voices.find(v => v.lang === 'en-GB' && /neural|premium|enhanced/i.test(v.name)) ||
    voices.find(v => v.lang === 'en-GB' && /serena|kate|fiona|emily|karen|martha|amy|alice/i.test(v.name)) ||
    voices.find(v => v.lang === 'en-GB') ||
    // Australian — also very clear, well understood in West Africa
    voices.find(v => v.lang === 'en-AU') ||
    // US female — Zira (Microsoft) and Hazel are calm and clear
    voices.find(v => v.lang === 'en-US' && /zira|hazel|samantha|aria/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith('en') && /female|woman/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith('en'));

  if(pick) u.voice = pick;

  // Tuned for Nigerian kids and students:
  // Rate 0.88 — not too slow (robotic) not too fast (hard to follow)
  // Pitch 1.05 — warm and natural, not high or shrill
  // This sweet spot sounds like a calm, clear teacher reading aloud
  u.rate  = 0.88;
  u.pitch = 1.05;

  u.onstart = () => activateWaves(true);
  u.onend   = () => { activateWaves(false); };
  u.onerror = () => activateWaves(false);

  window.speechSynthesis.speak(u);
}

// ── Voice preloading — Chrome requires voices to be loaded first ──
// We cache the voice list so it's always available when speakIt is called
window._cachedVoices = [];

function preloadVoices(){
  const v = window.speechSynthesis.getVoices();
  if(v && v.length > 0){
    window._cachedVoices = v;
  }
}

if(window.speechSynthesis){
  // Load immediately
  preloadVoices();
  // Chrome fires this event when voices are ready
  window.speechSynthesis.onvoiceschanged = preloadVoices;
  // Belt and braces — try again after page loads
  window.addEventListener('load', () => {
    setTimeout(preloadVoices, 200);
    setTimeout(preloadVoices, 800);
    setTimeout(preloadVoices, 2000);
  });
}

// ════════════════════ KIDS ZONE ════════════════════
// ── CURATED EMOJI MAP — single source of truth for kid visuals ──
// Emojis are 100% accurate (no broken/wrong photos). Used by kRenderVisual.
var kEmoji = {
  // Animals
  "Elephant":"🐘","Lion":"🦁","Tortoise":"🐢","Eagle":"🦅","Crocodile":"🐊",
  "Giraffe":"🦒","Zebra":"🦓","Snake":"🐍","Hippo":"🦛","Monkey":"🐒",
  "Chicken":"🐔","Cow":"🐄","Goat":"🐐","Fish":"🐟","Dog":"🐕","Cat":"🐈",
  "Sheep":"🐑","Duck":"🦆","Rabbit":"🐇","Turtle":"🐢",
  // Numbers (kept — kNumSVG already handles these in lessons array)
  "One":"1️⃣","Two":"2️⃣","Three":"3️⃣","Four":"4️⃣","Five":"5️⃣",
  "Six":"6️⃣","Seven":"7️⃣","Eight":"8️⃣","Nine":"9️⃣","Ten":"🔟",
  // Colors — colored circles are unambiguous
  "Red":"🔴","Blue":"🔵","Green":"🟢","Yellow":"🟡","Orange":"🟠",
  "Purple":"🟣","Black":"⚫","White":"⚪","Brown":"🟤",
  // Shapes/objects
  "Square":"⬛","Book":"📖","School":"🏫","Pencil":"✏️","House":"🏠",
  "Tree":"🌳","Sun":"☀️","Moon":"🌙","Star":"⭐","Water":"💧","Fire":"🔥",
  // Body parts
  "Eye":"👁️","Ear":"👂","Nose":"👃","Mouth":"👄","Tooth":"🦷",
  "Hand":"✋","Leg":"🦵","Foot":"🦶","Arm":"💪","Brain":"🧠",
  // Food
  "Rice":"🍚","Soup":"🍲","Yam":"🍠","Banana":"🍌","Mango":"🥭",
  "Bread":"🍞","Egg":"🥚","Milk":"🥛","Apple":"🍎",
  // Family
  "Father":"👨","Mother":"👩","Boy":"👦","Girl":"👧","Baby":"👶",
  "Grandpa":"👴","Grandma":"👵","Family":"👨‍👩‍👧‍👦"
};

// ── CURATED PHOTO MAP — only verified Wikimedia Commons images ──
// Each photo has been hand-checked to match the lesson word.
// Animals/foods favour Nigerian/African subjects (e.g. Jollof rice, Egusi, African elephant).
var kPhotos = {
  // Animals — African focus
  Lion:      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg/330px-020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg',
  Elephant:  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg/330px-178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg',
  Tortoise:  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Sulcata_Tortoise_%285%29_%288679964197%29.jpg/330px-Sulcata_Tortoise_%285%29_%288679964197%29.jpg',
  Eagle:     'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/African_fish_eagle%2C_Haliaeetus_vocifer%2C_at_Chobe_National_Park%2C_Botswana_%2833516612831%29.jpg/330px-African_fish_eagle%2C_Haliaeetus_vocifer%2C_at_Chobe_National_Park%2C_Botswana_%2833516612831%29.jpg',
  Crocodile: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/NileCrocodile.jpg/330px-NileCrocodile.jpg',
  Giraffe:   'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Giraffe_Mikumi_National_Park.jpg/330px-Giraffe_Mikumi_National_Park.jpg',
  Zebra:     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Equus_quagga_burchellii_-_Etosha%2C_2014.jpg/330px-Equus_quagga_burchellii_-_Etosha%2C_2014.jpg',
  Snake:     'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Indiancobra.jpg/330px-Indiancobra.jpg',
  Hippo:     'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Portrait_Hippopotamus_in_the_water.jpg/330px-Portrait_Hippopotamus_in_the_water.jpg',
  Monkey:    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Mona_monkey_-_Grand_Etang_Lake_-_Grenada_-_2.jpg/330px-Mona_monkey_-_Grand_Etang_Lake_-_Grenada_-_2.jpg',
  Chicken:   'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Male_and_female_chicken_sitting_together.jpg/330px-Male_and_female_chicken_sitting_together.jpg',
  Cow:       'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg/330px-Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg',
  Goat:      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Hausziege_04.jpg/330px-Hausziege_04.jpg',
  Fish:      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Oreochromis-niloticus-Nairobi.JPG/330px-Oreochromis-niloticus-Nairobi.JPG',
  Dog:       'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Huskiesatrest.jpg/330px-Huskiesatrest.jpg',
  Cat:       'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/330px-Cat_August_2010-4.jpg',
  Sheep:     'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flock_of_sheep.jpg/330px-Flock_of_sheep.jpg',
  Duck:      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Bucephala-albeola-010.jpg/330px-Bucephala-albeola-010.jpg',
  Rabbit:    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Oryctolagus_cuniculus_Rcdo.jpg/330px-Oryctolagus_cuniculus_Rcdo.jpg',
  Turtle:    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Chelonia_mydas_is_going_for_the_air_edit.jpg/330px-Chelonia_mydas_is_going_for_the_air_edit.jpg',
  // Reading / objects
  Book:   'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg/330px-Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg',
  School: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/First_primary_school_building_in_Nigeria_in_Badagry%2C_Nigeria.jpg/330px-First_primary_school_building_in_Nigeria_in_Badagry%2C_Nigeria.jpg',
  Pencil: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Pencils_hb.jpg/330px-Pencils_hb.jpg',
  House:  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/149MyrtleReedsburgWI.JPG/330px-149MyrtleReedsburgWI.JPG',
  Tree:   'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Baobab_and_elephant%2C_Tanzania.jpg/330px-Baobab_and_elephant%2C_Tanzania.jpg',
  Sun:    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/The_Sun_in_white_light.jpg/330px-The_Sun_in_white_light.jpg',
  Moon:   'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/330px-FullMoon2010.jpg',
  Star:   'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Pleiades_large.jpg/330px-Pleiades_large.jpg',
  Water:  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Drop-impact.jpg/330px-Drop-impact.jpg',
  Fire:   'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Large_bonfire.jpg/330px-Large_bonfire.jpg',
  // Body
  Eye:    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Human_eye_with_blood_vessels.jpg/330px-Human_eye_with_blood_vessels.jpg',
  Ear:    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Human_right_ear_%28cropped%29.jpg/330px-Human_right_ear_%28cropped%29.jpg',
  Tooth:  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/06-10-06smile.jpg/330px-06-10-06smile.jpg',
  Hand:   'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Hand%2C_fingers_-_back.jpg/330px-Hand%2C_fingers_-_back.jpg',
  Foot:   'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Foot_on_white_background.jpg/330px-Foot_on_white_background.jpg',
  // Foods — Nigerian focus
  Rice:   'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Jollof_Rice_with_Stew.jpg/330px-Jollof_Rice_with_Stew.jpg',
  // ── Nigerian soups: rotate through real cooked dishes (Ogbono, Egusi, Efo Riro, Banga, Pepper soup, Edikang Ikong) ──
  // The renderer below picks one based on a stable hash of the word so visuals look varied.
  Soup:   'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ogbono_soup_with_assorted_meats.jpg/330px-Ogbono_soup_with_assorted_meats.jpg',
  Yam:    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Yam_at_monday_market_kaduna_state_01.jpg/330px-Yam_at_monday_market_kaduna_state_01.jpg',
  Banana: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Bananavarieties.jpg/330px-Bananavarieties.jpg',
  Mango:  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Mangos_-_single_and_halved.jpg/330px-Mangos_-_single_and_halved.jpg',
  Bread:  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Agege_Bread.jpg/330px-Agege_Bread.jpg',
  Egg:    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Huevo_frito.jpg/330px-Huevo_frito.jpg',
  Milk:   'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Glass_of_Milk_%2833657535532%29.jpg/330px-Glass_of_Milk_%2833657535532%29.jpg',
  Apple:  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Pink_lady_and_cross_section.jpg/330px-Pink_lady_and_cross_section.jpg',
  Orange: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Oranges_-_whole-halved-segment.jpg/330px-Oranges_-_whole-halved-segment.jpg'
};
var kPhotoSourcePolicy = 'Kids Zone uses curated Wikimedia Commons photos for animals/foods/objects. African subjects are preferred (e.g. African elephant, Jollof rice, Agege bread). SVG fallbacks are used for shapes, colours and family.';

function kSafeText(s){
  return String(s || '').replace(/[&<>"']/g, function(ch){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
  });
}

function kVisualSVG(bg, label, content, accent){
  accent = accent || '#008751';
  return '<svg class="kz-curated-visual" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 220" width="100%" height="100%" role="img" aria-label="' + kSafeText(label) + '" style="display:block">'
    + '<rect width="240" height="220" rx="28" fill="' + bg + '"/>'
    + '<circle cx="38" cy="34" r="18" fill="#008751" opacity=".18"/><circle cx="202" cy="42" r="24" fill="#fbbf24" opacity=".22"/>'
    + '<g>' + content + '</g>'
    + '<rect x="28" y="178" width="184" height="26" rx="13" fill="rgba(255,255,255,.72)"/>'
    + '<text x="120" y="196" text-anchor="middle" font-family="Bricolage Grotesque,Arial,sans-serif" font-size="15" font-weight="900" fill="' + accent + '">' + kSafeText(label) + '</text>'
    + '</svg>';
}

function kPersonSVG(label, cloth, extras){
  return kVisualSVG('#fef3c7', label,
    '<circle cx="120" cy="74" r="34" fill="#5b341f"/>'
    + '<path d="M66 164c8-34 28-52 54-52s46 18 54 52" fill="' + cloth + '"/>'
    + '<circle cx="107" cy="70" r="4" fill="#111827"/><circle cx="133" cy="70" r="4" fill="#111827"/>'
    + '<path d="M106 86c8 8 20 8 28 0" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round"/>'
    + (extras || ''), '#0f766e');
}

// ─────── Rich textbook-style Nigerian family illustrations ───────
// Inspired by Lantern, Macmillan & Africana primary-school textbook art.
// Warm earth tones, ankara wax-print patterns, gele headwraps, agbada robes.
function kAnkaraPattern(id, c1, c2){
  return '<defs><pattern id="' + id + '" patternUnits="userSpaceOnUse" width="14" height="14">'
    + '<rect width="14" height="14" fill="' + c1 + '"/>'
    + '<circle cx="7" cy="7" r="3" fill="' + c2 + '"/>'
    + '<path d="M0 0L14 14M14 0L0 14" stroke="' + c2 + '" stroke-width="0.6" opacity=".5"/>'
    + '</pattern></defs>';
}
function kFaceSVG(cx, cy, r, options){
  options = options || {};
  var skin = options.skin || '#6d3a1a';
  var smile = options.smile === false ? '' : '<path d="M' + (cx-10) + ' ' + (cy+r*0.25) + 'q10 10 20 0" fill="none" stroke="#1f1108" stroke-width="2.5" stroke-linecap="round"/>';
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + skin + '"/>'
    + '<circle cx="' + (cx-r*0.32) + '" cy="' + (cy-r*0.05) + '" r="' + (r*0.10) + '" fill="#fff"/>'
    + '<circle cx="' + (cx+r*0.32) + '" cy="' + (cy-r*0.05) + '" r="' + (r*0.10) + '" fill="#fff"/>'
    + '<circle cx="' + (cx-r*0.32) + '" cy="' + (cy-r*0.05) + '" r="' + (r*0.05) + '" fill="#1f1108"/>'
    + '<circle cx="' + (cx+r*0.32) + '" cy="' + (cy-r*0.05) + '" r="' + (r*0.05) + '" fill="#1f1108"/>'
    + smile;
}
function kFatherFigure(){
  // Agbada robe in earth-orange ankara, kufi cap
  return kAnkaraPattern('ank-dad','#c2410c','#fde68a')
    + '<path d="M48 178c8-58 32-82 72-82s64 24 72 82z" fill="url(#ank-dad)" stroke="#7c2d12" stroke-width="2.5"/>'
    + '<path d="M104 96h32v22h-32z" fill="#6d3a1a"/>'
    + kFaceSVG(120, 74, 30, {})
    + '<path d="M86 50q34-22 68 0v8q-34-14-68 0z" fill="#1c1917" stroke="#0f0a07" stroke-width="1.5"/>'
    + '<rect x="92" y="38" width="56" height="14" rx="3" fill="#0f766e" stroke="#064e3b" stroke-width="1.5"/>'
    + '<text x="120" y="49" text-anchor="middle" font-size="8" fill="#fde68a" font-weight="900">★ ★ ★</text>';
}
function kMotherFigure(){
  // Iro & buba with green ankara, tall gele headwrap
  return kAnkaraPattern('ank-mom','#15803d','#fde68a')
    + '<path d="M52 178c10-54 30-78 68-78s58 24 68 78z" fill="url(#ank-mom)" stroke="#14532d" stroke-width="2.5"/>'
    + '<path d="M88 110q32 14 64 0v18q-32 12-64 0z" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>'
    + kFaceSVG(120, 80, 28, {})
    + '<path d="M70 56q50-38 100 0q-12 6-22 4q-8 14-28 14q-22 0-30-14q-10 2-20-4z" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>'
    + '<path d="M82 38q38-26 76 0q-6 8-12 8q-26-12-52 0q-6 0-12-8z" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>'
    + '<circle cx="100" cy="92" r="3" fill="#fbbf24"/><circle cx="140" cy="92" r="3" fill="#fbbf24"/>';
}
function kBoyFigure(){
  return kAnkaraPattern('ank-boy','#1d4ed8','#fde68a')
    + '<path d="M62 184c8-50 26-72 58-72s50 22 58 72z" fill="url(#ank-boy)" stroke="#1e3a8a" stroke-width="2.5"/>'
    + kFaceSVG(120, 80, 28, {})
    + '<path d="M88 60q32-22 64 0v6q-32-14-64 0z" fill="#1c1917"/>'
    + '<rect x="80" y="120" width="80" height="6" fill="#fbbf24"/>';
}
function kGirlFigure(){
  return kAnkaraPattern('ank-girl','#db2777','#fff')
    + '<path d="M60 184c8-52 26-74 60-74s52 22 60 74z" fill="url(#ank-girl)" stroke="#831843" stroke-width="2.5"/>'
    + kFaceSVG(120, 80, 28, {})
    + '<g fill="#1c1917">'
      + '<ellipse cx="92" cy="72" rx="10" ry="14"/>'
      + '<ellipse cx="148" cy="72" rx="10" ry="14"/>'
      + '<path d="M92 56q28-20 56 0v8q-28-14-56 0z"/>'
    + '</g>'
    + '<circle cx="78" cy="92" r="6" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>'
    + '<circle cx="162" cy="92" r="6" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>';
}
function kBabyFigure(){
  return '<rect x="50" y="120" width="140" height="48" rx="24" fill="#fde68a" stroke="#b45309" stroke-width="2.5"/>'
    + kFaceSVG(120, 96, 30, {})
    + '<path d="M88 70q32-18 64 0v10q-32-10-64 0z" fill="#1c1917"/>'
    + '<circle cx="120" cy="62" r="4" fill="#dc2626"/>'  // tiny bow
    + '<path d="M100 138q20 10 40 0" fill="none" stroke="#b45309" stroke-width="2"/>';
}
function kGrandpaFigure(){
  return kAnkaraPattern('ank-gpa','#475569','#fde68a')
    + '<path d="M52 180c8-56 30-80 68-80s60 24 68 80z" fill="url(#ank-gpa)" stroke="#1e293b" stroke-width="2.5"/>'
    + kFaceSVG(120, 76, 30, {smile:false})
    + '<path d="M88 96q32 16 64 0v6q-32 14-64 0z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>' // beard
    + '<path d="M86 56q34-18 68 0v8q-34-12-68 0z" fill="#e2e8f0"/>' // grey hair
    + '<rect x="88" y="38" width="64" height="14" rx="3" fill="#7c2d12" stroke="#451a03" stroke-width="1.5"/>'
    + '<circle cx="106" cy="72" r="9" fill="none" stroke="#1f2937" stroke-width="2"/>'
    + '<circle cx="134" cy="72" r="9" fill="none" stroke="#1f2937" stroke-width="2"/>'
    + '<line x1="115" y1="72" x2="125" y2="72" stroke="#1f2937" stroke-width="2"/>';
}
function kGrandmaFigure(){
  return kAnkaraPattern('ank-gma','#7c3aed','#fde68a')
    + '<path d="M52 180c10-56 30-80 68-80s58 24 68 80z" fill="url(#ank-gma)" stroke="#4c1d95" stroke-width="2.5"/>'
    + kFaceSVG(120, 80, 28, {})
    + '<path d="M70 58q50-32 100 0q-10 8-22 6q-8 12-28 12q-22 0-30-12q-12 2-20-6z" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>'
    + '<path d="M86 42q34-22 68 0q-6 8-14 6q-20-10-40 0q-8 2-14-6z" fill="#dc2626"/>'
    + '<circle cx="106" cy="74" r="9" fill="none" stroke="#1f2937" stroke-width="2"/>'
    + '<circle cx="134" cy="74" r="9" fill="none" stroke="#1f2937" stroke-width="2"/>'
    + '<line x1="115" y1="74" x2="125" y2="74" stroke="#1f2937" stroke-width="2"/>';
}
function kFamilyGroup(){
  // 4-figure compact group: dad / mum / boy / girl
  return kAnkaraPattern('fam-d','#c2410c','#fde68a')
    + kAnkaraPattern('fam-m','#15803d','#fde68a')
    + kAnkaraPattern('fam-b','#1d4ed8','#fde68a')
    + kAnkaraPattern('fam-g','#db2777','#fff')
    // back row
    + '<g transform="translate(-10,12) scale(0.55)">'
      + '<path d="M48 178c8-58 32-82 72-82s64 24 72 82z" fill="url(#fam-d)" stroke="#7c2d12" stroke-width="2"/>'
      + kFaceSVG(120, 84, 26, {})
      + '<path d="M86 60q34-22 68 0v8q-34-14-68 0z" fill="#1c1917"/>'
    + '</g>'
    + '<g transform="translate(115,12) scale(0.55)">'
      + '<path d="M52 178c10-54 30-78 68-78s58 24 68 78z" fill="url(#fam-m)" stroke="#14532d" stroke-width="2"/>'
      + kFaceSVG(120, 84, 26, {})
      + '<path d="M70 56q50-32 100 0q-10 8-22 6q-8 12-28 12q-22 0-30-12q-12 2-20-6z" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.5"/>'
    + '</g>'
    // front row (smaller)
    + '<g transform="translate(20,90) scale(0.42)">'
      + '<path d="M62 184c8-50 26-72 58-72s50 22 58 72z" fill="url(#fam-b)" stroke="#1e3a8a" stroke-width="2"/>'
      + kFaceSVG(120, 86, 26, {})
      + '<path d="M88 60q32-22 64 0v6q-32-14-64 0z" fill="#1c1917"/>'
    + '</g>'
    + '<g transform="translate(120,90) scale(0.42)">'
      + '<path d="M60 184c8-52 26-74 60-74s52 22 60 74z" fill="url(#fam-g)" stroke="#831843" stroke-width="2"/>'
      + kFaceSVG(120, 86, 26, {})
      + '<g fill="#1c1917"><ellipse cx="92" cy="72" rx="9" ry="13"/><ellipse cx="148" cy="72" rx="9" ry="13"/></g>'
    + '</g>';
}

function kFoodVisual(word){
  var food = {
    Rice: kVisualSVG('#fff7ed','Rice','<ellipse cx="120" cy="142" rx="76" ry="24" fill="#e5e7eb"/><ellipse cx="120" cy="128" rx="66" ry="34" fill="#fff"/><circle cx="98" cy="116" r="5" fill="#f97316"/><circle cx="119" cy="110" r="5" fill="#f59e0b"/><circle cx="140" cy="120" r="5" fill="#16a34a"/><path d="M78 130c30-20 58-20 86 0" stroke="#f59e0b" stroke-width="10" stroke-linecap="round" fill="none"/>','#b45309'),
    Soup: kVisualSVG('#ecfdf5','Nigerian Soup','<ellipse cx="120" cy="145" rx="72" ry="24" fill="#9a3412"/><path d="M56 112h128l-18 48H74z" fill="#f97316"/><ellipse cx="120" cy="112" rx="64" ry="24" fill="#16a34a"/><circle cx="97" cy="108" r="6" fill="#fbbf24"/><circle cx="132" cy="116" r="7" fill="#dc2626"/><circle cx="156" cy="106" r="5" fill="#064e3b"/>','#047857'),
    Yam: kVisualSVG('#fffbeb','Yam','<ellipse cx="97" cy="128" rx="26" ry="56" fill="#92400e" transform="rotate(-18 97 128)"/><ellipse cx="143" cy="126" rx="26" ry="54" fill="#a16207" transform="rotate(16 143 126)"/><circle cx="92" cy="112" r="10" fill="#fff7ed"/><circle cx="150" cy="144" r="11" fill="#fff7ed"/>','#92400e'),
    Banana: kVisualSVG('#fefce8','Banana','<path d="M66 122c46 42 102 38 128-22-34 28-82 34-124 2 2 8 1 14-4 20z" fill="#facc15" stroke="#ca8a04" stroke-width="5"/><path d="M63 112c5 5 9 8 14 10" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>','#ca8a04'),
    Mango: kVisualSVG('#fff7ed','Mango','<path d="M118 74c45 10 64 44 48 78-18 39-76 34-93 2-18-34 5-72 45-80z" fill="#f59e0b"/><path d="M133 76c9-21 27-27 45-22-9 17-25 27-45 22z" fill="#16a34a"/>','#b45309'),
    Orange: kVisualSVG('#fff7ed','Orange Fruit','<circle cx="120" cy="120" r="54" fill="#f97316"/><circle cx="100" cy="100" r="8" fill="#fed7aa" opacity=".8"/><path d="M121 66c7-16 22-20 36-16-8 13-20 19-36 16z" fill="#16a34a"/>','#ea580c'),
    Bread: kVisualSVG('#fffbeb','Bread','<path d="M62 142V98c0-28 22-44 58-44s58 16 58 44v44z" fill="#d97706"/><path d="M78 136V101c0-18 15-29 42-29s42 11 42 29v35z" fill="#fbbf24" opacity=".75"/>','#92400e'),
    Egg: kVisualSVG('#f8fafc','Egg','<ellipse cx="97" cy="124" rx="28" ry="42" fill="#fff" stroke="#e5e7eb" stroke-width="5"/><ellipse cx="145" cy="126" rx="30" ry="44" fill="#fff" stroke="#e5e7eb" stroke-width="5"/><circle cx="145" cy="132" r="12" fill="#fbbf24"/>','#64748b'),
    Milk: kVisualSVG('#eff6ff','Milk','<path d="M82 70h76l14 28v72H68V98z" fill="#fff" stroke="#3b82f6" stroke-width="5"/><path d="M82 70l16-20h44l16 20" fill="#bfdbfe"/><text x="120" y="130" text-anchor="middle" font-family="Arial" font-size="24" font-weight="900" fill="#2563eb">MILK</text>','#2563eb'),
    Apple: kVisualSVG('#fef2f2','Apple','<path d="M119 88c24-24 63-4 58 36-5 43-35 61-58 41-23 20-53 2-58-41-5-40 34-60 58-36z" fill="#dc2626"/><path d="M123 82c6-19 20-28 40-27-8 18-22 28-40 27z" fill="#16a34a"/>','#b91c1c')
  };
  return food[word] || null;
}

function kFamilyVisual(word){
  // Map each family word → richer textbook-style Nigerian illustration
  var map = {
    Father:   { bg:'#fff7ed', fg:'#7c2d12', body:kFatherFigure(),  cap:'Baba (Father)' },
    Mother:   { bg:'#ecfdf5', fg:'#14532d', body:kMotherFigure(),  cap:'Mama (Mother)' },
    Boy:      { bg:'#eff6ff', fg:'#1e3a8a', body:kBoyFigure(),     cap:'Boy — Omokunrin' },
    Girl:     { bg:'#fdf2f8', fg:'#831843', body:kGirlFigure(),    cap:'Girl — Omobinrin' },
    Baby:     { bg:'#fef3c7', fg:'#92400e', body:kBabyFigure(),    cap:'Baby — Omo Owo' },
    Grandpa:  { bg:'#f1f5f9', fg:'#1e293b', body:kGrandpaFigure(), cap:'Grandpa' },
    Grandma:  { bg:'#faf5ff', fg:'#4c1d95', body:kGrandmaFigure(), cap:'Grandma' },
    Family:   { bg:'#ecfdf5', fg:'#047857', body:kFamilyGroup(),   cap:'My Family' }
  };
  var d = map[word];
  if (!d) return null;
  return kVisualSVG(d.bg, d.cap, d.body, d.fg);
}

function kColourVisual(word){
  var colors = {Red:'#ef4444',Blue:'#2563eb',Green:'#16a34a',Yellow:'#facc15',Orange:'#f97316',Purple:'#8b5cf6',Black:'#111827',White:'#ffffff',Brown:'#92400e',Square:'#111827'};
  if (!colors[word]) return null;
  var stroke = word === 'White' ? '#94a3b8' : colors[word];
  var shape = word === 'Square' ? '<rect x="72" y="70" width="96" height="96" rx="8" fill="' + colors[word] + '"/>' : '<circle cx="120" cy="118" r="56" fill="' + colors[word] + '" stroke="' + stroke + '" stroke-width="6"/>';
  return kVisualSVG('#f8fafc', word, shape, '#0f172a');
}

function kObjectVisual(word){
  var objects = {
    Book: kVisualSVG('#eff6ff','Book','<path d="M58 62h58c13 0 22 8 22 20v88H80c-12 0-22-9-22-22z" fill="#2563eb"/><path d="M138 62h44v108h-44z" fill="#60a5fa"/><path d="M78 88h38M78 108h38M78 128h38" stroke="#fff" stroke-width="5" stroke-linecap="round"/>','#1d4ed8'),
    School: kVisualSVG('#ecfdf5','School','<rect x="56" y="92" width="128" height="74" rx="8" fill="#f8fafc" stroke="#008751" stroke-width="5"/><path d="M48 92l72-44 72 44z" fill="#008751"/><rect x="106" y="124" width="28" height="42" fill="#fbbf24"/><rect x="72" y="110" width="20" height="18" fill="#bfdbfe"/><rect x="148" y="110" width="20" height="18" fill="#bfdbfe"/>','#008751'),
    Pencil: kVisualSVG('#fff7ed','Pencil','<path d="M62 146l96-96 30 30-96 96-42 12z" fill="#fbbf24"/><path d="M158 50l14-14 30 30-14 14z" fill="#ef4444"/><path d="M50 188l12-42 30 30z" fill="#92400e"/>','#b45309'),
    House: kVisualSVG('#fef3c7','House','<path d="M52 106l68-58 68 58" fill="#008751"/><rect x="68" y="106" width="104" height="66" rx="8" fill="#fff" stroke="#008751" stroke-width="5"/><rect x="106" y="128" width="28" height="44" fill="#92400e"/><rect x="80" y="122" width="18" height="18" fill="#bfdbfe"/><rect x="142" y="122" width="18" height="18" fill="#bfdbfe"/>','#008751'),
    Tree: kVisualSVG('#ecfdf5','Tree','<rect x="110" y="112" width="20" height="56" rx="8" fill="#92400e"/><circle cx="104" cy="92" r="34" fill="#16a34a"/><circle cx="138" cy="98" r="32" fill="#22c55e"/><circle cx="120" cy="68" r="32" fill="#15803d"/>','#047857'),
    Sun: kVisualSVG('#fffbeb','Sun','<circle cx="120" cy="116" r="42" fill="#fbbf24"/><g stroke="#f59e0b" stroke-width="8" stroke-linecap="round"><path d="M120 48v18M120 166v18M52 116h18M170 116h18M72 68l13 13M155 151l13 13M168 68l-13 13M85 151l-13 13"/></g>','#d97706'),
    Moon: kVisualSVG('#eef2ff','Moon','<path d="M145 58c-29 8-50 34-50 65 0 30 20 55 48 64-43 4-79-29-79-71 0-43 37-76 81-58z" fill="#94a3b8"/>','#475569'),
    Star: kVisualSVG('#fffbeb','Star','<path d="M120 48l19 43 47 5-35 31 10 46-41-24-41 24 10-46-35-31 47-5z" fill="#fbbf24" stroke="#d97706" stroke-width="5"/>','#d97706'),
    Water: kVisualSVG('#eff6ff','Water','<path d="M120 54c34 44 52 72 52 98 0 28-23 48-52 48s-52-20-52-48c0-26 18-54 52-98z" fill="#38bdf8"/><path d="M96 148c6 14 18 22 34 22" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>','#0369a1'),
    Fire: kVisualSVG('#fff7ed','Fire','<path d="M124 45c24 29 14 49 36 70 14 14 20 28 20 45 0 29-25 46-60 46s-60-17-60-46c0-27 21-49 42-66 10-8 18-24 22-49z" fill="#ef4444"/><path d="M121 118c20 21 28 35 28 51 0 17-13 27-29 27s-29-10-29-27c0-17 12-32 30-51z" fill="#fbbf24"/>','#b91c1c')
  };
  return objects[word] || null;
}

function kLessonVisualHTML(item, sizePx, cat){
  var word = item && item.w;
  var category = cat || (typeof kCat !== 'undefined' ? kCat : '');
  if (!item) return '<div class="kz-visual-missing">?</div>';
  if (item.e && typeof item.e === 'string' && item.e.indexOf('<svg') === 0) return item.e;
  // 1️⃣ Real photo (verified Wikimedia)
  if (kPhotos[word]) {
    var emojiFallback = (typeof kEmoji !== 'undefined' && kEmoji[word]) ? kEmoji[word] : (word ? word[0] : '?');
    var alt = kSafeText(word || '');
    return '<div class="kz-curated-photo" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:14px;background:#0f172a;">'
      + '<img src="' + kPhotos[word] + '" alt="' + alt + '" loading="lazy" referrerpolicy="no-referrer" '
      + 'style="width:100%;height:100%;object-fit:cover;display:block;" '
      + 'onerror="this.parentNode.innerHTML=\'<div style=&quot;font-size:' + Math.round((sizePx||100)*0.7) + 'px;line-height:1;&quot;>' + kSafeText(emojiFallback).replace(/'/g,"&#39;") + '</div>\'"/>'
      + '</div>';
  }
  // 2️⃣ Curated SVG illustration for shapes/colours/family
  var local = category === 'colours' ? kColourVisual(word)
            : (category === 'family' ? kFamilyVisual(word)
            : (kObjectVisual(word) || kFoodVisual(word) || kFamilyVisual(word) || kColourVisual(word)));
  if (local) {
    return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">' + local + '</div>';
  }
  // 3️⃣ Emoji fallback (body parts etc.)
  if (typeof kEmoji !== 'undefined' && kEmoji[word]) {
    var size = sizePx || 100;
    return '<div class="kz-curated-emoji" role="img" aria-label="' + kSafeText(word) + '" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:' + Math.round(size*0.72) + 'px;line-height:1;text-align:center;">' + kEmoji[word] + '</div>';
  }
  return '<div class="kz-visual-missing" style="font-size:3rem;font-weight:900;color:#0f172a">' + kSafeText((word || '?')[0]) + '</div>';
}

// ─────────── IMAGE VERIFIER ───────────
// Checks every lesson uses a curated local visual — no stock web photos.
window._kPhotoAudit = { ok: [], removed: [], pending: 0, ts: 0, mode: 'curated' };
function kVerifyPhotos(opts){
  opts = opts || {};
  var report = { ok: [], removed: [], pending: 0, ts: Date.now(), mode: 'curated', note: kPhotoSourcePolicy };
  var cats = (typeof kLessons !== 'undefined' && kLessons) ? Object.keys(kLessons) : [];
  cats.forEach(function(cat){
    (kLessons[cat] || []).forEach(function(item){
      var html = (typeof kLessonVisualHTML === 'function') ? kLessonVisualHTML(item, 80, cat) : '';
      if (html && html.indexOf('kz-visual-missing') === -1) {
        report.ok.push(cat + ': ' + item.w);
      } else {
        report.removed.push({ name: item.w, category: cat, reason: 'missing curated visual' });
      }
    });
  });
  window._kPhotoAudit = report;
  try {
    console.info('[KidsZone] Visual audit:', report.ok.length, 'curated visuals OK ·', report.removed.length, 'needs review');
    if (report.removed.length) console.table(report.removed);
  } catch(e){}
  if (opts.onDone) opts.onDone(report);
  return report;
}
// Run a verification pass automatically once kids zone is first opened.
window.addEventListener('load', function(){ try { kVerifyPhotos(); } catch(e){} });

var kCaptions = {
  "Elephant": "E is for Elephant",
  "Lion": "L is for Lion",
  "Tortoise": "T is for Tortoise",
  "Eagle": "E is for Eagle",
  "Crocodile": "C is for Crocodile",
  "Giraffe": "G is for Giraffe",
  "Zebra": "Z is for Zebra",
  "Snake": "S is for Snake",
  "Hippo": "H is for Hippo",
  "Monkey": "M is for Monkey",
  "Chicken": "Chicken",
  "Cow": "Cow",
  "Goat": "Goat",
  "Fish": "Fish",
  "Dog": "Dog",
  "Cat": "Cat",
  "Sheep": "Sheep",
  "Duck": "Duck",
  "Rabbit": "Rabbit",
  "Turtle": "Turtle",
  "One": "1 — One",
  "Two": "2 — Two",
  "Three": "3 — Three",
  "Four": "4 — Four",
  "Five": "5 — Five",
  "Six": "6 — Six",
  "Seven": "7 — Seven",
  "Eight": "8 — Eight",
  "Nine": "9 — Nine",
  "Ten": "10 — Ten",
  "Red": "Red — like a tomato",
  "Blue": "Blue — like the sky",
  "Green": "Green — like leaves",
  "Yellow": "Yellow — like a banana",
  "Orange": "Orange — like an orange!",
  "Purple": "Purple — like grapes",
  "Black": "Black — like night",
  "White": "White — like clouds",
  "Brown": "Brown — like yam",
  "Square": "Square shape",
  "Book": "Book",
  "School": "School",
  "Pencil": "Pencil",
  "House": "House",
  "Tree": "Tree",
  "Sun": "Sun",
  "Moon": "Moon",
  "Star": "Stars",
  "Water": "Water",
  "Fire": "Fire",
  "Eye": "Eye — for seeing",
  "Ear": "Ear — for hearing",
  "Nose": "Nose — for smelling",
  "Mouth": "Mouth — for eating",
  "Tooth": "Teeth — brush them!",
  "Hand": "Hand — for holding",
  "Leg": "Leg — for walking",
  "Foot": "Foot — for running",
  "Arm": "Arm — strong muscles",
  "Brain": "Brain — for thinking!",
  "Rice": "Rice — a staple food",
  "Soup": "Nigerian Soup",
  "Yam": "Yam",
  "Banana": "Banana",
  "Mango": "Mango",
  "Bread": "Bread",
  "Egg": "Egg",
  "Milk": "Milk — healthy drink",
  "Apple": "Apple",
  "Father": "Baba (Father)",
  "Mother": "Mama (Mother)",
  "Boy": "Boy",
  "Girl": "Girl",
  "Baby": "Baby",
  "Grandpa": "Grandpa",
  "Grandma": "Grandma",
  "Family": "My Family",
};

function kCaptionFor(cat, item){
  if (!item) return '';
  var word = item.w;
  if (cat === 'food') {
    var foodCaptions = {
      Rice:'Rice — everyday Nigerian food', Soup:'Nigerian soup — like egusi or okra', Yam:'Yam',
      Banana:'Banana', Mango:'Mango', Orange:'Orange fruit', Bread:'Bread', Egg:'Egg',
      Milk:'Milk — healthy drink', Apple:'Apple'
    };
    return foodCaptions[word] || word;
  }
  if (cat === 'family') {
    var familyCaptions = { Father:'Baba (Father)', Mother:'Mama (Mother)', Boy:'Boy', Girl:'Girl', Baby:'Baby', Grandpa:'Grandpa', Grandma:'Grandma', Uncle:'Uncle', Aunt:'Aunt', Family:'My Family' };
    return familyCaptions[word] || word;
  }
  return kCaptions[word] || word;
}

function kNumSVG(n, color){
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%" style="display:block">'
    + '<rect x="6" y="6" width="188" height="188" rx="28" fill="#fff" stroke="' + color + '" stroke-width="6"/>'
    + '<text x="100" y="118" text-anchor="middle" font-family="Bricolage Grotesque, system-ui, sans-serif" font-weight="900" font-size="120" fill="' + color + '">' + n + '</text>'
    + '<g fill="' + color + '">'
    + Array.from({length:n}, function(_,i){
        var perRow = n<=5?n:5;
        var row = Math.floor(i/perRow), col = i%perRow;
        var cx = 100 + (col - (perRow-1)/2)*16;
        var cy = 170 + row*16;
        return '<circle cx="' + cx + '" cy="' + cy + '" r="5"/>';
      }).join('')
    + '</g></svg>';
}

const kLessons={
  phonics:[
    {e:'PHOTO',w:'Elephant',l:'E',c:'#dbeafe',ls:['E','L','E','P','H','A','N','T'],cs:['#dbeafe','#fde68a','#d1fae5','#ede9fe','#fee2e2','#fef3c7','#ccfbf1','#dbeafe']},
    {e:'PHOTO',w:'Lion',l:'L',c:'#fde68a',ls:['L','I','O','N'],cs:['#fde68a','#dbeafe','#d1fae5','#ede9fe']},
    {e:'PHOTO',w:'Tortoise',l:'T',c:'#d1fae5',ls:['T','O','R','T','O','I','S','E'],cs:['#d1fae5','#fde68a','#dbeafe','#d1fae5','#fee2e2','#ede9fe','#fef3c7','#ccfbf1']},
    {e:'PHOTO',w:'Eagle',l:'E',c:'#ede9fe',ls:['E','A','G','L','E'],cs:['#ede9fe','#fde68a','#d1fae5','#dbeafe','#ede9fe']},
    {e:'PHOTO',w:'Crocodile',l:'C',c:'#ccfbf1',ls:['C','R','O','C','O','D','I','L','E'],cs:['#ccfbf1','#fee2e2','#fde68a','#ccfbf1','#d1fae5','#dbeafe','#ede9fe','#fef3c7','#ccfbf1']},
    {e:'PHOTO',w:'Giraffe',l:'G',c:'#fef3c7',ls:['G','I','R','A','F','F','E'],cs:['#fef3c7','#dbeafe','#d1fae5','#fde68a','#fee2e2','#fee2e2','#ede9fe']},
    {e:'PHOTO',w:'Zebra',l:'Z',c:'#f1f5f9',ls:['Z','E','B','R','A'],cs:['#f1f5f9','#dbeafe','#fee2e2','#d1fae5','#fde68a']},
    {e:'PHOTO',w:'Snake',l:'S',c:'#d1fae5',ls:['S','N','A','K','E'],cs:['#d1fae5','#dbeafe','#fde68a','#ede9fe','#fee2e2']},
    {e:'PHOTO',w:'Hippo',l:'H',c:'#fee2e2',ls:['H','I','P','P','O'],cs:['#fee2e2','#dbeafe','#fde68a','#fde68a','#d1fae5']},
    {e:'PHOTO',w:'Monkey',l:'M',c:'#fef3c7',ls:['M','O','N','K','E','Y'],cs:['#fef3c7','#d1fae5','#dbeafe','#ede9fe','#fde68a','#fee2e2']},
  ],
  animals:[
    {e:'PHOTO',w:'Chicken',l:'C',c:'#fef3c7',ls:['C','H','I','C','K','E','N'],cs:['#fef3c7','#dbeafe','#d1fae5','#fef3c7','#ede9fe','#fee2e2','#fde68a']},
    {e:'PHOTO',w:'Cow',l:'C',c:'#d1fae5',ls:['C','O','W'],cs:['#d1fae5','#fde68a','#dbeafe']},
    {e:'PHOTO',w:'Goat',l:'G',c:'#f0fdf4',ls:['G','O','A','T'],cs:['#f0fdf4','#fde68a','#dbeafe','#fef3c7']},
    {e:'PHOTO',w:'Fish',l:'F',c:'#dbeafe',ls:['F','I','S','H'],cs:['#dbeafe','#ede9fe','#ccfbf1','#fde68a']},
    {e:'PHOTO',w:'Dog',l:'D',c:'#fde68a',ls:['D','O','G'],cs:['#fde68a','#dbeafe','#d1fae5']},
    {e:'PHOTO',w:'Cat',l:'C',c:'#ede9fe',ls:['C','A','T'],cs:['#ede9fe','#fde68a','#fee2e2']},
    {e:'PHOTO',w:'Sheep',l:'S',c:'#f1f5f9',ls:['S','H','E','E','P'],cs:['#f1f5f9','#dbeafe','#fde68a','#fde68a','#d1fae5']},
    {e:'PHOTO',w:'Duck',l:'D',c:'#fef3c7',ls:['D','U','C','K'],cs:['#fef3c7','#dbeafe','#d1fae5','#fde68a']},
    {e:'PHOTO',w:'Rabbit',l:'R',c:'#fee2e2',ls:['R','A','B','B','I','T'],cs:['#fee2e2','#fde68a','#ede9fe','#ede9fe','#dbeafe','#d1fae5']},
    {e:'PHOTO',w:'Turtle',l:'T',c:'#d1fae5',ls:['T','U','R','T','L','E'],cs:['#d1fae5','#fef3c7','#fee2e2','#d1fae5','#fde68a','#dbeafe']},
  ],
  numbers:[
    {e:kNumSVG(1,'#3b82f6'),w:'One',l:'1',c:'#dbeafe',ls:['1'],cs:['#dbeafe']},
    {e:kNumSVG(2,'#10b981'),w:'Two',l:'2',c:'#d1fae5',ls:['2'],cs:['#d1fae5']},
    {e:kNumSVG(3,'#f59e0b'),w:'Three',l:'3',c:'#fde68a',ls:['3'],cs:['#fde68a']},
    {e:kNumSVG(4,'#8b5cf6'),w:'Four',l:'4',c:'#ede9fe',ls:['4'],cs:['#ede9fe']},
    {e:kNumSVG(5,'#ef4444'),w:'Five',l:'5',c:'#fee2e2',ls:['5'],cs:['#fee2e2']},
    {e:kNumSVG(6,'#d97706'),w:'Six',l:'6',c:'#fef3c7',ls:['6'],cs:['#fef3c7']},
    {e:kNumSVG(7,'#0d9488'),w:'Seven',l:'7',c:'#ccfbf1',ls:['7'],cs:['#ccfbf1']},
    {e:kNumSVG(8,'#2563eb'),w:'Eight',l:'8',c:'#dbeafe',ls:['8'],cs:['#dbeafe']},
    {e:kNumSVG(9,'#ca8a04'),w:'Nine',l:'9',c:'#fde68a',ls:['9'],cs:['#fde68a']},
    {e:kNumSVG(10,'#059669'),w:'Ten',l:'10',c:'#d1fae5',ls:['1','0'],cs:['#d1fae5','#fde68a']},
  ],
  colours:[
    {e:'PHOTO',w:'Red',l:'R',c:'#fee2e2',ls:['R','E','D'],cs:['#fee2e2','#fde68a','#ede9fe']},
    {e:'PHOTO',w:'Blue',l:'B',c:'#dbeafe',ls:['B','L','U','E'],cs:['#dbeafe','#fde68a','#d1fae5','#ede9fe']},
    {e:'PHOTO',w:'Green',l:'G',c:'#d1fae5',ls:['G','R','E','E','N'],cs:['#d1fae5','#fee2e2','#fde68a','#fde68a','#dbeafe']},
    {e:'PHOTO',w:'Yellow',l:'Y',c:'#fef3c7',ls:['Y','E','L','L','O','W'],cs:['#fef3c7','#fde68a','#d1fae5','#d1fae5','#ede9fe','#dbeafe']},
    {e:'PHOTO',w:'Orange',l:'O',c:'#fed7aa',ls:['O','R','A','N','G','E'],cs:['#fed7aa','#fee2e2','#fde68a','#dbeafe','#d1fae5','#fef3c7']},
    {e:'PHOTO',w:'Purple',l:'P',c:'#ede9fe',ls:['P','U','R','P','L','E'],cs:['#ede9fe','#fef3c7','#fee2e2','#ede9fe','#fde68a','#dbeafe']},
    {e:'PHOTO',w:'Black',l:'B',c:'#e5e7eb',ls:['B','L','A','C','K'],cs:['#e5e7eb','#fde68a','#fee2e2','#d1fae5','#dbeafe']},
    {e:'PHOTO',w:'White',l:'W',c:'#f9fafb',ls:['W','H','I','T','E'],cs:['#f9fafb','#dbeafe','#fde68a','#d1fae5','#ede9fe']},
    {e:'PHOTO',w:'Brown',l:'B',c:'#fef3c7',ls:['B','R','O','W','N'],cs:['#fef3c7','#fee2e2','#fde68a','#dbeafe','#d1fae5']},
    {e:'PHOTO',w:'Square',l:'S',c:'#fee2e2',ls:['S','Q','U','A','R','E'],cs:['#fee2e2','#fde68a','#d1fae5','#ede9fe','#fef3c7','#dbeafe']},
  ],
  reading:[
    {e:'PHOTO',w:'Book',l:'B',c:'#dbeafe',ls:['B','O','O','K'],cs:['#dbeafe','#fde68a','#fde68a','#ede9fe']},
    {e:'PHOTO',w:'School',l:'S',c:'#fef3c7',ls:['S','C','H','O','O','L'],cs:['#fef3c7','#dbeafe','#fee2e2','#d1fae5','#d1fae5','#fde68a']},
    {e:'PHOTO',w:'Pencil',l:'P',c:'#fee2e2',ls:['P','E','N','C','I','L'],cs:['#fee2e2','#fde68a','#d1fae5','#dbeafe','#ede9fe','#fef3c7']},
    {e:'PHOTO',w:'House',l:'H',c:'#fed7aa',ls:['H','O','U','S','E'],cs:['#fed7aa','#fde68a','#dbeafe','#d1fae5','#ede9fe']},
    {e:'PHOTO',w:'Tree',l:'T',c:'#d1fae5',ls:['T','R','E','E'],cs:['#d1fae5','#fee2e2','#fde68a','#fde68a']},
    {e:'PHOTO',w:'Sun',l:'S',c:'#fef3c7',ls:['S','U','N'],cs:['#fef3c7','#fde68a','#dbeafe']},
    {e:'PHOTO',w:'Moon',l:'M',c:'#ede9fe',ls:['M','O','O','N'],cs:['#ede9fe','#fef3c7','#fef3c7','#dbeafe']},
    {e:'PHOTO',w:'Star',l:'S',c:'#fde68a',ls:['S','T','A','R'],cs:['#fde68a','#dbeafe','#fee2e2','#d1fae5']},
    {e:'PHOTO',w:'Water',l:'W',c:'#dbeafe',ls:['W','A','T','E','R'],cs:['#dbeafe','#fde68a','#d1fae5','#fee2e2','#ede9fe']},
    {e:'PHOTO',w:'Fire',l:'F',c:'#fee2e2',ls:['F','I','R','E'],cs:['#fee2e2','#dbeafe','#fde68a','#d1fae5']},
  ],
  body:[
    {e:'👁️',w:'Eye',l:'E',c:'#dbeafe',ls:['E','Y','E'],cs:['#dbeafe','#fde68a','#d1fae5']},
    {e:'👂',w:'Ear',l:'E',c:'#fed7aa',ls:['E','A','R'],cs:['#fed7aa','#fde68a','#d1fae5']},
    {e:'👃',w:'Nose',l:'N',c:'#fee2e2',ls:['N','O','S','E'],cs:['#fee2e2','#fde68a','#d1fae5','#dbeafe']},
    {e:'👄',w:'Mouth',l:'M',c:'#fecaca',ls:['M','O','U','T','H'],cs:['#fecaca','#fde68a','#dbeafe','#d1fae5','#ede9fe']},
    {e:'🦷',w:'Tooth',l:'T',c:'#f9fafb',ls:['T','O','O','T','H'],cs:['#f9fafb','#fde68a','#fde68a','#d1fae5','#dbeafe']},
    {e:'✋',w:'Hand',l:'H',c:'#fed7aa',ls:['H','A','N','D'],cs:['#fed7aa','#fde68a','#d1fae5','#dbeafe']},
    {e:'🦵',w:'Leg',l:'L',c:'#fed7aa',ls:['L','E','G'],cs:['#fed7aa','#fde68a','#d1fae5']},
    {e:'🦶',w:'Foot',l:'F',c:'#fed7aa',ls:['F','O','O','T'],cs:['#fed7aa','#fde68a','#fde68a','#d1fae5']},
    {e:'💪',w:'Arm',l:'A',c:'#fed7aa',ls:['A','R','M'],cs:['#fed7aa','#fee2e2','#fde68a']},
    {e:'🧠',w:'Brain',l:'B',c:'#ede9fe',ls:['B','R','A','I','N'],cs:['#ede9fe','#fee2e2','#fde68a','#dbeafe','#d1fae5']},
  ],
  food:[
    {e:'PHOTO',w:'Rice',l:'R',c:'#f9fafb',ls:['R','I','C','E'],cs:['#f9fafb','#dbeafe','#fde68a','#d1fae5']},
    {e:'PHOTO',w:'Soup',l:'S',c:'#fef3c7',ls:['S','O','U','P'],cs:['#fef3c7','#fde68a','#dbeafe','#fee2e2']},
    {e:'PHOTO',w:'Yam',l:'Y',c:'#fde68a',ls:['Y','A','M'],cs:['#fde68a','#fee2e2','#d1fae5']},
    {e:'PHOTO',w:'Banana',l:'B',c:'#fef3c7',ls:['B','A','N','A','N','A'],cs:['#fef3c7','#fde68a','#d1fae5','#fde68a','#fee2e2','#fde68a']},
    {e:'PHOTO',w:'Mango',l:'M',c:'#fed7aa',ls:['M','A','N','G','O'],cs:['#fed7aa','#fde68a','#d1fae5','#ede9fe','#fef3c7']},
    {e:'PHOTO',w:'Orange',l:'O',c:'#fed7aa',ls:['O','R','A','N','G','E'],cs:['#fed7aa','#fee2e2','#fde68a','#dbeafe','#d1fae5','#fef3c7']},
    {e:'PHOTO',w:'Bread',l:'B',c:'#fef3c7',ls:['B','R','E','A','D'],cs:['#fef3c7','#fee2e2','#fde68a','#d1fae5','#dbeafe']},
    {e:'PHOTO',w:'Egg',l:'E',c:'#fef3c7',ls:['E','G','G'],cs:['#fef3c7','#fde68a','#fde68a']},
    {e:'PHOTO',w:'Milk',l:'M',c:'#f9fafb',ls:['M','I','L','K'],cs:['#f9fafb','#dbeafe','#d1fae5','#fde68a']},
    {e:'PHOTO',w:'Apple',l:'A',c:'#fee2e2',ls:['A','P','P','L','E'],cs:['#fee2e2','#fde68a','#fde68a','#dbeafe','#d1fae5']},
  ],
  family:[
    {e:'PHOTO',w:'Father',l:'F',c:'#dbeafe',ls:['F','A','T','H','E','R'],cs:['#dbeafe','#fde68a','#d1fae5','#fee2e2','#fde68a','#ede9fe']},
    {e:'PHOTO',w:'Mother',l:'M',c:'#fce7f3',ls:['M','O','T','H','E','R'],cs:['#fce7f3','#fde68a','#dbeafe','#fee2e2','#fde68a','#ede9fe']},
    {e:'PHOTO',w:'Boy',l:'B',c:'#dbeafe',ls:['B','O','Y'],cs:['#dbeafe','#fde68a','#d1fae5']},
    {e:'PHOTO',w:'Girl',l:'G',c:'#fce7f3',ls:['G','I','R','L'],cs:['#fce7f3','#dbeafe','#fee2e2','#d1fae5']},
    {e:'PHOTO',w:'Baby',l:'B',c:'#fef3c7',ls:['B','A','B','Y'],cs:['#fef3c7','#fde68a','#fef3c7','#dbeafe']},
    {e:'PHOTO',w:'Grandpa',l:'G',c:'#e5e7eb',ls:['G','R','A','N','D','P','A'],cs:['#e5e7eb','#fee2e2','#fde68a','#dbeafe','#d1fae5','#fde68a','#fef3c7']},
    {e:'PHOTO',w:'Grandma',l:'G',c:'#fce7f3',ls:['G','R','A','N','D','M','A'],cs:['#fce7f3','#fee2e2','#fde68a','#dbeafe','#d1fae5','#fce7f3','#fef3c7']},
    {e:'PHOTO',w:'Family',l:'F',c:'#fde68a',ls:['F','A','M','I','L','Y'],cs:['#fde68a','#fee2e2','#fce7f3','#dbeafe','#d1fae5','#fef3c7']},
  ],
};

let kCat='phonics',kIdx=0,kStars=0;
function kInit(){kCat='phonics';kIdx=0;kRender();}

function kLoad(cat, el){
  kCat = cat;
  kIdx = 0;
  // Update sidebar items
  document.querySelectorAll('.kz-sb-item').forEach(i => {
    if(i.dataset.cat === cat) i.classList.add('on');
    else if(i.dataset.cat) i.classList.remove('on');
  });
  // Update category tabs
  document.querySelectorAll('.kz-cat-tab').forEach(t => {
    if(t.dataset.cat === cat) t.classList.add('on');
    else t.classList.remove('on');
  });
  const labels = {
    phonics: '🔤 Phonics & Letters',
    animals: '🐘 Animals',
    numbers: '🔢 Numbers',
    colours: '🎨 Colours',
    reading: '📖 Early Reading',
    body: '🧠 Human Body',
    food: '🍎 Nigerian Foods',
    family: '👨‍👩‍👧 My Family'
  };
  const kt = document.getElementById('kTopbar');
  if(kt) kt.textContent = labels[cat] || 'Kids Zone';
  closeSidebar();
  kRender();
  setTimeout(kSpeak, 400);
  // Scroll clicked tab into view
  const tab = document.querySelector('.kz-cat-tab[data-cat="' + cat + '"]');
  if(tab) tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function kRender(){
  const lessons=kLessons[kCat]||kLessons.phonics;
  const k=lessons[kIdx%lessons.length];
  const kImg=document.getElementById('kImg');
  const kWord=document.getElementById('kWord');
  const kPrompt=document.getElementById('kPrompt');
  const kPhonics=document.getElementById('kPhonics');
  const kStarRow=document.getElementById('kStarRow');
  const kProgress=document.getElementById('kProgress');
  
  if(kImg){
    kImg.innerHTML = (typeof kLessonVisualHTML === 'function') ? kLessonVisualHTML(k, 210, kCat) : (k.e || k.w[0]);
    kImg.style.background = k.c || '#f8fafc';
    kImg.style.borderRadius = '16px';
    kImg.style.overflow = 'hidden';
    kImg.style.padding = '0';
    kImg.style.display = 'flex';
    kImg.style.alignItems = 'center';
    kImg.style.justifyContent = 'center';
    kImg.style.animation='none';
    setTimeout(()=>kImg.style.animation='kBounce 0.6s ease-out',10);
  }
  if(kWord){
    const firstLen = k.l.length;
    kWord.innerHTML=`<span style="color:#f97316">${k.w.slice(0,firstLen)}</span>${k.w.slice(firstLen)}`;
  }
  // Update image caption if present
  var kCap=document.getElementById('kImgCaption');
  if(kCap){
    kCap.textContent = (typeof kCaptionFor === 'function') ? kCaptionFor(kCat, k) : (kCaptions[k.w] || k.w);
    kCap.style.display='block';
  }
  if(kPrompt){
    const tutorTexts = {
      phonics: `"Look! This is a <strong>${k.w}</strong>. It starts with the letter <strong>${k.l}</strong>. Can you say <strong>${k.w}</strong> with me?"`,
      animals: `"This is a <strong>${k.w}</strong>! Can you hear how it sounds? Say <strong>${k.w}</strong>!"`,
      numbers: `"This is the number <strong>${k.w}</strong>! Can you count to ${k.w}? Let us try together!"`,
      colours: `"Look at this colour — it is <strong>${k.w}</strong>! Can you find something ${k.w} around you?"`,
      reading: `"This word is <strong>${k.w}</strong>. Can you read it with me? <strong>${k.w}</strong>!"`,
      body: `"This is a <strong>${k.w}</strong>. Can you point to your own ${k.w.toLowerCase()}?"`,
      food: `"This is <strong>${k.w}</strong>! Do you like to eat ${k.w.toLowerCase()}? Yum yum!"`,
      family: `"This person is a <strong>${k.w}</strong>. Who is the ${k.w.toLowerCase()} in your family?"`,
    };
    kPrompt.innerHTML = tutorTexts[kCat] || `"This is a <strong>${k.w}</strong>!"`;
  }
  if(kPhonics){
    kPhonics.innerHTML=k.ls.map((l,i)=>`<button class="kz-ltr" style="background:${k.cs[i%k.cs.length]}" onclick="speakIt('${l}')">${l}</button>`).join('');
  }
  if(kStarRow) kStarRow.innerHTML='';
  
  // Update progress dots
  if(kProgress){
    kProgress.innerHTML = lessons.map((_, i) => 
      `<div style="width:${i===kIdx?'24px':'10px'};height:10px;border-radius:100px;background:${i<kIdx?'#10b981':(i===kIdx?'#f97316':'#e5e7eb')};transition:all .3s;"></div>`
    ).join('');
  }
}

function kNext(){
  const lessons=kLessons[kCat]||kLessons.phonics;
  kIdx = (kIdx + 1) % lessons.length;
  kRender();
  setTimeout(kSpeak, 300);
}

// kPlayMatch / kPlayQuiz / kPlaySing live in homework-2.js (real implementations).


function kSpeak(){
  const lessons=kLessons[kCat]||kLessons.phonics;
  const k=lessons[kIdx%lessons.length];
  const word=k.w.split(' — ')[0];
  var line = `${k.l} is for ${word}. Say it with me — ${word}! Let us spell it together: ${k.ls.join(', ')}. ${word}. Very good!`;
  try { console.log('[kSpeak]', { cat: kCat, idx: kIdx, word: word, voiceOn: typeof voiceOn !== 'undefined' ? voiceOn : '(undef)', elevenSpeak: typeof window.elevenSpeak === 'function' }); } catch(e){}
  speakIt(line);
}

// duplicate kNext removed
function kPrev(){const l=kLessons[kCat]||kLessons.phonics;kIdx=(kIdx-1+l.length)%l.length;kRender();}
function kAns(knew){
  if(knew){
    kStars++;
    const ksr=document.getElementById('kStarRow');
    const kxp=document.getElementById('kXP');
    const ksv=document.getElementById('kStarsVal');
    if(ksr) ksr.textContent='⭐'.repeat(Math.min(kStars,5));
    if(kxp) kxp.textContent=`⭐ ${kStars} stars`;
    if(ksv) ksv.textContent=kStars; const ksc=document.getElementById("kStarsCompact"); if(ksc) ksc.textContent=kStars;
    const p=['Wonderful! You are so clever! Well done, well done!','Excellent! I am so proud of you! Let us continue.','Very good! That is correct! You are a sharp student.','Ah, well done! You got it! Keep going!'];
    speakIt(p[Math.floor(Math.random()*p.length)]);
    setTimeout(kNext,1500);
  } else {
    kSpeak();
  }
}
// Unified violation overlay (called from IntegritySystem callbacks)
function showIntegrityOverlay(type, count, remaining, context){
  document.getElementById('integrityOverlay')?.remove();

  const labels = {
    tab_switch: { icon:'👁️', title:'Tab Switch Detected', msg:'You left this page during your assessment.' },
    focus_loss: { icon:'🖥️', title:'Window Focus Lost',   msg:'You switched to another application.' },
    devtools:   { icon:'🔧', title:'Developer Tools Detected', msg:'Browser developer tools were opened.' },
  };
  const info     = labels[type] || { icon:'⚠️', title:'Integrity Violation', msg:'An unexpected action was detected.' };
  const isLast   = remaining <= 0;
  const isWarn   = count >= 2;
  const colTitle = isLast ? '#f87171' : isWarn ? '#fb923c' : '#fbbf24';
  const colBtn   = isLast ? '#dc2626' : '#3b82f6';

  const overlay = document.createElement('div');
  overlay.id = 'integrityOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:99997;backdrop-filter:blur(6px)';

  overlay.innerHTML = `
    <div style="background:#12151e;border:2px solid ${isLast?'#dc2626':'#d97706'};border-radius:20px;padding:36px 40px;max-width:460px;width:90%;text-align:center;animation:intShake .4s ease;font-family:inherit">
      <div style="font-size:2.8rem;margin-bottom:14px">${info.icon}</div>
      <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:1.25rem;font-weight:800;color:${colTitle};margin-bottom:10px">${info.title}</div>
      <div style="font-size:.9rem;color:rgba(255,255,255,.65);line-height:1.7;margin-bottom:8px">${info.msg}</div>
      <div style="background:rgba(255,255,255,.06);border-radius:10px;padding:12px 16px;margin:14px 0;font-size:.85rem;color:rgba(255,255,255,.55)">
        Violation <strong style="color:${colTitle}">${count}</strong> of <strong style="color:rgba(255,255,255,.8)">${count + remaining}</strong>
        ${!isLast ? ` · <span style="color:#fbbf24">${remaining} warning${remaining!==1?'s':''} remaining</span>` : ''}
      </div>
      <div style="font-size:.88rem;color:rgba(255,255,255,.6);line-height:1.65;margin-bottom:22px">
        ${isLast
          ? '<strong style="color:#f87171">Your assessment has been terminated.</strong><br>Lesson Teacher has recorded this session. Academic integrity is essential for WAEC, NECO, and JAMB success — practise it now.'
          : 'This has been recorded. Please <strong style="color:#fff">stay on this page</strong> and focus on your assessment. Do not open other tabs, applications, or developer tools.'}
      </div>
      ${!isLast ? `<button onclick="document.getElementById('integrityOverlay').remove();${context==='exam'&&'if(window._resumeExamTimer)window._resumeExamTimer();'}" style="background:${colBtn};color:#fff;border:none;border-radius:10px;padding:11px 26px;font-size:.92rem;font-weight:800;cursor:pointer;font-family:inherit;width:100%">${isWarn?'⚠️ Final Warning — I Understand':'I Understand — Continue Assessment'}</button>` : ''}
    </div>`;

  document.body.appendChild(overlay);
}


// ── Landing page nav scroll + reveal animations ──
(function(){
  // Nav scroll effect
  const nav = document.getElementById('topNav');
  if(nav){
    window.addEventListener('scroll', ()=>{
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, {passive:true});
  }
  // Intersection reveal
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, {threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
})();
function toggleMob(){ document.getElementById('mobNav')?.classList.toggle('open'); }
function closeMob(){ document.getElementById('mobNav')?.classList.remove('open'); }


// ════════════════════════════════════════════════════════════════
// LANGUAGE LEARNING MODULE
// ════════════════════════════════════════════════════════════════

const LANG_META = {
  yoruba:     { name:'Yorùbá',          flag:'🟢⚪🟢', region:'Southwest Nigeria',          script:'Latin (tonal)',  greeting:'Ẹ káàárọ̀',   family:'Niger-Congo' },
  igbo:       { name:'Igbo',            flag:'🟢⚪🟢', region:'Southeast Nigeria',           script:'Latin (tonal)', greeting:'Ụtụtụ ọma',   family:'Niger-Congo' },
  hausa:      { name:'Hausa',           flag:'🟢⚪🟢', region:'Northern Nigeria',            script:'Latin / Ajami', greeting:'Ina kwana',    family:'Chadic' },
  pidgin:     { name:'Nigerian Pidgin', flag:'🇳🇬',   region:'All Nigeria',                 script:'Latin',         greeting:'How you dey?', family:'Creole' },
  efik:       { name:'Efik / Ibibio',   flag:'🟢⚪🟢', region:'Cross River, Nigeria',        script:'Latin',         greeting:'Mfọn ndisé',   family:'Niger-Congo' },
  ijaw:       { name:'Ijaw (Izon)',     flag:'🟢⚪🟢', region:'Niger Delta, Nigeria',        script:'Latin',         greeting:'Bọrọ dọọ',     family:'Niger-Congo' },
  tiv:        { name:'Tiv',            flag:'🟢⚪🟢', region:'Benue State, Nigeria',        script:'Latin',         greeting:'Mtswen',       family:'Niger-Congo' },
  french:     { name:'French',         flag:'🇫🇷',   region:'France & Francophone world',  script:'Latin',         greeting:'Bonjour',      family:'Romance' },
  arabic:     { name:'Arabic',         flag:'🇸🇦',   region:'Middle East & North Africa',  script:'Arabic (RTL)',  greeting:'مرحباً',       family:'Semitic' },
  spanish:    { name:'Spanish',        flag:'🇪🇸',   region:'Spain & Latin America',       script:'Latin',         greeting:'Buenos días',  family:'Romance' },
  portuguese: { name:'Portuguese',     flag:'🇵🇹',   region:'Portugal, Brazil & Africa',   script:'Latin',         greeting:'Bom dia',      family:'Romance' },
  mandarin:   { name:'Mandarin Chinese',flag:'🇨🇳',  region:'China & Southeast Asia',      script:'Chinese + Pinyin',greeting:'你好 (Nǐ hǎo)',family:'Sino-Tibetan' },
  japanese:   { name:'Japanese',       flag:'🇯🇵',   region:'Japan',                       script:'Kana + Kanji',  greeting:'こんにちは',   family:'Japonic' },
  german:     { name:'German',         flag:'🇩🇪',   region:'Germany, Austria, Switzerland',script:'Latin',        greeting:'Guten Morgen', family:'Germanic' },
  dutch:      { name:'Dutch',          flag:'🇳🇱',   region:'Netherlands & Belgium',       script:'Latin',         greeting:'Goedemorgen',  family:'Germanic' },
};

const LANG_LEVELS = {
  beginner:     { label:'🌱 Beginner',     desc:'First words and greetings — zero experience needed' },
  elementary:   { label:'🌿 Elementary',   desc:'Basic sentences, numbers, colours, family words' },
  intermediate: { label:'🌳 Intermediate', desc:'Conversations, tenses, common daily topics' },
  advanced:     { label:'🔥 Advanced',     desc:'Complex grammar, idioms, formal language' },
  expert:       { label:'⭐ Expert',       desc:'Near-native — nuance, literature, professional use' },
};

let currentLang      = 'yoruba';
let currentLangLevel = 'beginner';
let langChatHistory  = [];
let langXP           = 0;

function selectLanguage(btn, lang){
  document.querySelectorAll('.lang-sb-item').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  currentLang = lang;
  langChatHistory = [];
  const box = document.getElementById('langChatMsgs');
  if(box) box.innerHTML = '';
  updateLangTopbar();
  startLangLesson();
}

function selectLangLevel(btn, level){
  document.querySelectorAll('.lang-lvl-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  currentLangLevel = level;
  langChatHistory = [];
  startLangLesson();
}

function updateLangTopbar(){
  const meta = LANG_META[currentLang];
  const el   = document.getElementById('langTopTitle');
  if(el && meta) el.textContent = meta.flag + ' ' + meta.name + ' — ' + meta.region;
}

async function startLangLesson(){
  const content = document.getElementById('langContent');
  if(!content) return;
  const meta  = LANG_META[currentLang];
  const level = LANG_LEVELS[currentLangLevel];
  if(!meta || !level) return;

  content.innerHTML = `
    <div class="lang-loading">
      <div style="font-size:2.5rem;margin-bottom:16px">${meta.flag}</div>
      <div style="font-size:1rem;font-weight:700;color:#fff;margin-bottom:8px">Preparing your ${meta.name} lesson...</div>
      <div style="font-size:.84rem;color:var(--cl-muted);margin-bottom:16px">${level.label} · ${level.desc}</div>
      <div class="lt-loading" style="justify-content:center"><div class="ld-dot"></div><div class="ld-dot"></div><div class="ld-dot"></div></div>
    </div>`;

  const chatBox = document.getElementById('langChatMsgs');
  if(chatBox){
    chatBox.innerHTML = '';
    addLangMsg('lt', 'Good day! I am your ' + meta.name + ' tutor 👋 Loading your ' + level.label.replace(/[]/g,'').trim() + ' lesson now...');
  }

  try{
    const res = await fetch('/api/anthropic',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-5',max_tokens:2000,
        system:buildLangSystem(meta,level),
        messages:[{role:'user',content:buildLangRequest(meta,level)}]
      })
    });
    if(!res.ok) throw new Error('API '+res.status);
    const data = await res.json();
    const raw  = data?.content?.find(b=>b.type==='text')?.text||'';
    renderLangLesson(raw,meta,level);
  }catch(err){
    content.innerHTML=`<div class="lang-loading"><div style="font-size:2rem;margin-bottom:12px">⚠️</div><div style="color:#f87171;font-weight:700;margin-bottom:8px">Could not load lesson</div><button onclick="startLangLesson()" style="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:8px 20px;cursor:pointer;font-family:inherit;font-weight:700">Try Again</button></div>`;
  }
}

function buildLangSystem(meta,level){
  return `You are a brilliant, warm language tutor teaching ${meta.name} to Nigerian students.
Level: ${level.label} (${level.desc})
Language: ${meta.name} · ${meta.family} family · ${meta.script} · Spoken in: ${meta.region}
Greeting: ${meta.greeting}

Rules:
- Teach FROM English INTO ${meta.name} — student speaks English
- Use Nigerian cultural context wherever possible
- For tonal languages (Yorùbá, Igbo): include tone marks
- For Arabic/Japanese/Mandarin: include native script AND romanisation  
- Be warm, encouraging, precise`;
}

function buildLangRequest(meta,level){
  return `Create a complete ${currentLangLevel}-level lesson teaching ${meta.name}. Use these exact delimiters:

<<<LESSON_TITLE>>>
Specific title for this lesson unit

<<<LESSON_OBJECTIVES>>>
3 learning objectives, one per line

<<<CULTURAL_NOTE>>>
One fascinating cultural note about this language or people

<<<VOCAB_1_NATIVE>>>
First vocabulary word in ${meta.name}
<<<VOCAB_1_ENGLISH>>>
English meaning
<<<VOCAB_1_PRONUNCIATION>>>
Phonetic guide

<<<VOCAB_2_NATIVE>>>
Second word
<<<VOCAB_2_ENGLISH>>>
English meaning
<<<VOCAB_2_PRONUNCIATION>>>
Pronunciation

<<<VOCAB_3_NATIVE>>>
Third word
<<<VOCAB_3_ENGLISH>>>
English meaning
<<<VOCAB_3_PRONUNCIATION>>>
Pronunciation

<<<VOCAB_4_NATIVE>>>
Fourth word
<<<VOCAB_4_ENGLISH>>>
English meaning
<<<VOCAB_4_PRONUNCIATION>>>
Pronunciation

<<<VOCAB_5_NATIVE>>>
Fifth word
<<<VOCAB_5_ENGLISH>>>
English meaning
<<<VOCAB_5_PRONUNCIATION>>>
Pronunciation

<<<VOCAB_6_NATIVE>>>
Sixth word
<<<VOCAB_6_ENGLISH>>>
English meaning
<<<VOCAB_6_PRONUNCIATION>>>
Pronunciation

<<<GRAMMAR_POINT>>>
The one most important grammar concept at this level. Explain clearly with examples.

<<<PHRASE_1_NATIVE>>>
First useful phrase
<<<PHRASE_1_ENGLISH>>>
Translation
<<<PHRASE_1_NOTE>>>
When/how to use it

<<<PHRASE_2_NATIVE>>>
Second phrase
<<<PHRASE_2_ENGLISH>>>
Translation
<<<PHRASE_2_NOTE>>>
Usage note

<<<PHRASE_3_NATIVE>>>
Third phrase
<<<PHRASE_3_ENGLISH>>>
Translation
<<<PHRASE_3_NOTE>>>
Usage note

<<<PHRASE_4_NATIVE>>>
Fourth phrase
<<<PHRASE_4_ENGLISH>>>
Translation
<<<PHRASE_4_NOTE>>>
Usage note

<<<PHRASE_5_NATIVE>>>
Fifth phrase
<<<PHRASE_5_ENGLISH>>>
Translation
<<<PHRASE_5_NOTE>>>
Usage note

<<<MEMORY_TIP>>>
A memorable trick to help retain these words. Nigerian connection where possible.

<<<PRACTICE_QUESTION>>>
One practice exercise for this lesson
<<<PRACTICE_ANSWER>>>
The correct answer`;
}

function renderLangLesson(raw,meta,level){
  function get(tag){
    const s=raw.indexOf('<<<'+tag+'>>>');
    if(s===-1)return'';
    const after=raw.indexOf('\n',s);
    const next=raw.indexOf('<<<',after);
    return raw.substring(after,next===-1?raw.length:next).trim();
  }
  const vocabs=[1,2,3,4,5,6].map(i=>({native:get('VOCAB_'+i+'_NATIVE'),english:get('VOCAB_'+i+'_ENGLISH'),pron:get('VOCAB_'+i+'_PRONUNCIATION')})).filter(v=>v.native);
  const phrases=[1,2,3,4,5].map(i=>({native:get('PHRASE_'+i+'_NATIVE'),english:get('PHRASE_'+i+'_ENGLISH'),note:get('PHRASE_'+i+'_NOTE')})).filter(p=>p.native);
  const isRTL=currentLang==='arabic';

  document.getElementById('langContent').innerHTML=`
    <div class="lang-lesson-wrap">
      <div class="lang-header-card">
        <div class="lang-level-badge">${level.label} · ${meta.region}</div>
        <div class="lang-lesson-title">${get('LESSON_TITLE')||meta.name+' '+level.label}</div>
        <div class="lang-lesson-meta">${meta.family} family · ${meta.script} · Greeting: <strong style="color:#fbbf24">${meta.greeting}</strong></div>
      </div>
      ${get('CULTURAL_NOTE')?`<div style="background:rgba(251,191,36,.07);border:1px solid rgba(251,191,36,.15);border-radius:12px;padding:14px 18px;margin-bottom:20px"><div style="font-size:.62rem;font-weight:800;color:#fbbf24;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">🌍 Cultural Note</div><div style="font-size:.9rem;color:rgba(255,255,255,.75);line-height:1.65">${get('CULTURAL_NOTE')}</div></div>`:''}
      ${get('LESSON_OBJECTIVES')?`<div style="background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.15);border-radius:12px;padding:14px 18px;margin-bottom:24px"><div style="font-size:.62rem;font-weight:800;color:#93c5fd;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">🎯 What You Will Learn</div>${get('LESSON_OBJECTIVES').split('\n').filter(Boolean).map(obj=>`<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px;font-size:.86rem;color:rgba(255,255,255,.7)"><span style="color:#4ade80;font-weight:800;flex-shrink:0">✓</span>${obj.replace(/^[\d\.\-\*]+\s*/,'')}</div>`).join('')}</div>`:''}
      <div class="lang-section-hdr">📚 Vocabulary</div>
      <div class="vocab-grid">
        ${vocabs.map(v=>`<div class="vocab-card" onclick="speakLang('${v.native.replace(/'/g,"\\'")}')"><div class="vocab-native"${isRTL?' dir="rtl"':''}>${v.native}</div><div class="vocab-english">${v.english}</div><div class="vocab-pron">/${v.pron}/</div><div style="font-size:.66rem;color:rgba(255,255,255,.22);margin-top:4px">🔊 tap</div></div>`).join('')}
      </div>
      ${get('GRAMMAR_POINT')?`<div class="lang-section-hdr">📐 Grammar</div><div style="background:var(--cl-card);border:1px solid var(--cl-border);border-left:3px solid #8b5cf6;border-radius:0 12px 12px 0;padding:14px 18px;margin-bottom:20px;font-size:.9rem;color:rgba(255,255,255,.75);line-height:1.7">${get('GRAMMAR_POINT')}</div>`:''}
      <div class="lang-section-hdr">💬 Phrases</div>
      <div class="phrase-list">
        ${phrases.map(p=>`<div class="phrase-row"><div class="phrase-native"${isRTL?' dir="rtl"':''}>${p.native}</div><div><div class="phrase-english">${p.english}</div><div style="font-size:.72rem;color:rgba(255,255,255,.28)">${p.note}</div></div><button class="phrase-speak" onclick="speakLang('${p.native.replace(/'/g,"\\'")}')">🔊</button></div>`).join('')}
      </div>
      ${get('MEMORY_TIP')?`<div style="background:rgba(109,40,217,.12);border:1px solid rgba(167,139,250,.2);border-radius:12px;padding:14px 18px;margin:20px 0;text-align:center"><div style="font-size:.62rem;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">🧠 Memory Tip</div><div style="font-size:.9rem;color:rgba(255,255,255,.8);line-height:1.65">${get('MEMORY_TIP')}</div></div>`:''}
      ${get('PRACTICE_QUESTION')?`<div class="lang-quiz-card"><div style="font-size:.62rem;font-weight:800;color:#4ade80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">✅ Practice</div><div style="font-size:.95rem;font-weight:600;color:#fff;margin-bottom:16px">${get('PRACTICE_QUESTION')}</div><button id="langShowAnswer" onclick="document.getElementById('langAns').style.display='block';this.style.display='none';langXP+=30;document.getElementById('langXpBadge').textContent='⚡ '+langXP+' XP';" style="background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);color:#4ade80;border-radius:8px;padding:8px 18px;font-size:.84rem;font-weight:700;cursor:pointer;font-family:inherit">Show Answer (+30 XP)</button><div id="langAns" style="display:none;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.15);border-radius:8px;padding:12px 15px;font-size:.9rem;color:#86efac;line-height:1.65;margin-top:10px">${get('PRACTICE_ANSWER')}</div></div>`:''}
      <div style="text-align:center;margin-top:32px;padding-bottom:32px">
        <button onclick="startLangLesson()" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;border:none;border-radius:12px;padding:13px 32px;font-size:.95rem;font-weight:800;cursor:pointer;font-family:inherit;box-shadow:0 6px 24px rgba(37,99,235,.35)">Next Lesson →</button>
        <div style="font-size:.76rem;color:rgba(255,255,255,.28);margin-top:10px">Generates a new lesson on the next ${meta.name} topic</div>
      </div>
    </div>`;

  langXP+=50;
  const badge=document.getElementById('langXpBadge');
  if(badge) badge.textContent='⚡ '+langXP+' XP';
  addLangMsg('lt','🎉 Your '+meta.name+' lesson is ready! Tap vocabulary cards to hear pronunciation. Ask me anything about the language!');
}

function speakLang(text){
  if(!text||!speechSynthesis) return;
  const codes={yoruba:'yo',igbo:'ig',hausa:'ha',pidgin:'pcm',efik:'efi',ijaw:'ijc',tiv:'tiv',french:'fr-FR',arabic:'ar-SA',spanish:'es-ES',portuguese:'pt-PT',mandarin:'zh-CN',japanese:'ja-JP',german:'de-DE',dutch:'nl-NL'};
  const utt=new SpeechSynthesisUtterance(text);
  utt.lang=codes[currentLang]||'en-NG';
  utt.rate=0.85;
  speechSynthesis.cancel();
  speechSynthesis.speak(utt);
}

async function sendLangChat(){
  const inp=document.getElementById('langChatInp');
  if(!inp) return;
  const msg=inp.value.trim();
  if(!msg) return;
  inp.value='';
  const meta=LANG_META[currentLang];
  const level=LANG_LEVELS[currentLangLevel];
  addLangMsg('usr',msg);
  langChatHistory.push({role:'user',content:msg});
  const box=document.getElementById('langChatMsgs');
  if(box){const t=document.createElement('div');t.id='langTyping';t.className='cmsg cmsg-lt';t.innerHTML='<div class="cmsg-nm">👩‍🏫 Language Tutor</div><div class="cmsg-bub"><div class="lt-loading"><div class="ld-dot"></div><div class="ld-dot"></div><div class="ld-dot"></div></div></div>';box.appendChild(t);box.scrollTop=box.scrollHeight;}
  try{
    const res=await fetch('/api/anthropic',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-5',max_tokens:600,system:buildLangSystem(meta,level),messages:[...langChatHistory]})});
    const data=await res.json();
    const reply=data?.content?.find(b=>b.type==='text')?.text||'';
    document.getElementById('langTyping')?.remove();
    if(reply){langChatHistory.push({role:'assistant',content:reply});addLangMsg('lt',reply);}
  }catch(e){document.getElementById('langTyping')?.remove();}
}

function addLangMsg(who,txt){
  const box=document.getElementById('langChatMsgs');
  if(!box) return;
  const d=document.createElement('div');
  d.className='cmsg cmsg-'+(who==='lt'?'lt':'usr');
  d.innerHTML='<div class="cmsg-nm">'+(who==='lt'?'👩‍🏫 Language Tutor':'You')+'</div><div class="cmsg-bub">'+txt.replace(/\n/g,'<br>')+'</div>';
  box.appendChild(d);
  box.scrollTop=box.scrollHeight;
  const panel=document.getElementById('langAiPanel');
  if(panel&&!panel.classList.contains('open'))panel.classList.add('open');
}

// ════════════════════════════════════════════════════════
// PARENT COUNSELLING MODULE
// ════════════════════════════════════════════════════════
var parentChatHistory = [];
var currentCounselTopic = 'welcome';

var COUNSEL_TOPICS = {
  academic:  { title:'Academic Support',       icon:'📚', prompt:'Give practical advice for Nigerian parents on how to support their child academic performance at home. Include a daily study routine using Lesson Teacher and how to communicate with teachers. Nigerian context, warm tone. 6-8 sentences.' },
  behaviour: { title:'Behaviour & Discipline', icon:'🧠', prompt:'Advise a Nigerian parent on managing difficult behaviour constructively. Cover firm but loving approaches, avoiding physical punishment, understanding root causes. Nigerian family context. 6-8 sentences.' },
  career:    { title:'Career Guidance',         icon:'🎯', prompt:'Help a Nigerian parent guide their SS2/SS3 child choosing Science vs Arts. Cover career prospects, JAMB combinations, the STEM economy, and how not to push too hard. Balanced, practical advice. 6-8 sentences.' },
  health:    { title:'Child Wellbeing',         icon:'❤️', prompt:'Advise on mental health, physical wellbeing, sleep and nutrition for school performance in Nigeria. Address common parental blind spots about mental health. Warm, practical. 6-8 sentences.' },
  exams:     { title:'Managing Exam Pressure',  icon:'📝', prompt:'Help a Nigerian parent support their child through WAEC, NECO or JAMB stress. Cover signs of anxiety, creating a calm home environment, what to say and NOT say. 6-8 sentences.' },
  screen:    { title:'Screen Time & Tech',      icon:'📱', prompt:'Advise on managing phone and screen time constructively for Nigerian children. Cover healthy boundaries, productive use of technology, warning signs of addiction, family agreements. 6-8 sentences.' },
  peer:      { title:'Peer Pressure',           icon:'👫', prompt:'Help a Nigerian parent address peer pressure affecting their secondary school child. Cover bad influence, staying connected, how to keep communication open without being controlling. 6-8 sentences.' },
  waec:      { title:'WAEC & JAMB Preparation', icon:'🎓', prompt:'Give a Nigerian parent a complete guide to supporting their child through WAEC and JAMB prep. Cover timelines, resources, Lesson Teacher strategy, past questions, staying calm. 6-8 sentences.' },
};

var PARENT_SYSTEM = 'You are a warm, experienced parent counsellor with deep knowledge of Nigerian culture, the Nigerian education system, and family dynamics. You speak to parents with empathy, respect, and practical wisdom. You understand the pressures of Nigerian parenting — financial stress, academic pressure, cultural expectations, and challenges of modern technology. You give real, actionable advice — not generic Western advice that does not fit Nigerian reality. Keep responses warm, practical, and respectful. 4-8 sentences per reply.';

function selectCounselTopic(btn, topic){
  document.querySelectorAll('#parentSidebar .sb-item').forEach(function(b){b.classList.remove('on');});
  if(btn) btn.classList.add('on');
  currentCounselTopic = topic;
  if(topic === 'welcome'){
    document.getElementById('parentWelcome').style.display='block';
    document.getElementById('parentAdvice').style.display='none';
    document.getElementById('parentTopTitle').textContent='👨‍👩‍👧 Parent Counselling Hub';
    return;
  }
  var info = COUNSEL_TOPICS[topic];
  if(!info) return;
  document.getElementById('parentTopTitle').textContent = info.icon+' '+info.title;
  document.getElementById('parentWelcome').style.display='none';
  var advice = document.getElementById('parentAdvice');
  advice.style.display='block';
  advice.innerHTML='<div class="lt-intro-card"><div class="lt-intro-avt">👩‍🏫</div><div><div class="lt-intro-name">Parent Counsellor</div><div class="lt-loading"><div class="ld-dot"></div><div class="ld-dot"></div><div class="ld-dot"></div></div></div></div>';
  parentChatHistory=[];
  loadParentAdvice(info.prompt, info.title, info.icon);
}

function sendParentSuggestion(msg){
  var inp=document.getElementById('parentChatInp');
  if(inp){inp.value=msg;sendParentChat();}
}

async function loadParentAdvice(prompt, title, icon){
  var advice=document.getElementById('parentAdvice');
  try{
    var res=await fetch('/api/anthropic',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-5',max_tokens:800,system:PARENT_SYSTEM,
        messages:[{role:'user',content:prompt}]})});
    var data=await res.json();
    var text=data?.content?.find(function(b){return b.type==='text';})?.text||'';
    advice.innerHTML='<div class="lt-speech-card"><div class="lt-speech-avt">👩‍🏫</div><div>'
      +'<div class="lt-speech-name">'+icon+' '+title+'</div>'
      +'<div class="lt-speech-text" style="font-style:normal;line-height:1.75">'+text.replace(/\n\n/g,'</p><p style=\"margin-top:12px\">').replace(/\n/g,'<br>')+'</div>'
      +'</div></div>'
      +'<div style="margin-top:16px;padding:14px 18px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.15);border-radius:12px;font-size:.84rem;color:rgba(255,255,255,.55)">💬 Ask me anything more specific in the chat →</div>';
    parentChatHistory.push({role:'assistant',content:text});
    addParentMsg('lt','I have shared guidance on "'+title+'" above. Ask me anything more specific about your situation!');
  }catch(e){
    advice.innerHTML='<div style="color:#f87171;padding:20px">Could not load. Please try again.</div>';
  }
}

async function sendParentChat(){
  var inp=document.getElementById('parentChatInp');
  if(!inp) return;
  var msg=inp.value.trim();
  if(!msg) return;
  inp.value='';
  addParentMsg('usr',msg);
  parentChatHistory.push({role:'user',content:msg});
  var box=document.getElementById('parentChatMsgs');
  if(box){var t=document.createElement('div');t.id='parentTyping';t.className='cmsg cmsg-lt';
    t.innerHTML='<div class="cmsg-nm">👩‍🏫 Parent Counsellor</div><div class="cmsg-bub"><div class="lt-loading"><div class="ld-dot"></div><div class="ld-dot"></div><div class="ld-dot"></div></div></div>';
    box.appendChild(t);box.scrollTop=box.scrollHeight;}
  try{
    var res=await fetch('/api/anthropic',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-5',max_tokens:600,system:PARENT_SYSTEM,
        messages:[...parentChatHistory]})});
    var data=await res.json();
    var reply=data?.content?.find(function(b){return b.type==='text';})?.text||'';
    document.getElementById('parentTyping')?.remove();
    if(reply){parentChatHistory.push({role:'assistant',content:reply});addParentMsg('lt',reply);}
  }catch(e){document.getElementById('parentTyping')?.remove();}
}

function addParentMsg(who,txt){
  var box=document.getElementById('parentChatMsgs');
  if(!box) return;
  var d=document.createElement('div');
  d.className='cmsg cmsg-'+(who==='lt'?'lt':'usr');
  d.innerHTML='<div class="cmsg-nm">'+(who==='lt'?'👩‍🏫 Parent Counsellor':'You')+'</div><div class="cmsg-bub">'+txt.replace(/\n/g,'<br>')+'</div>';
  box.appendChild(d);box.scrollTop=box.scrollHeight;
}


var essayTopic=null,essayTimerInt=null,essaySecs=2700,essayViolations=0,essayDeductedPct=0,essayGhostTO=null,essayGhostText='',essayActive=false;

// ── Real question bank helpers ──
function normaliseQuestion(q){
  var opts=q.options||q.opts||{};
  // Build normalised option map based on current board's option letters (4 or 5)
  var cfg = typeof getBoardCfg === 'function' ? getBoardCfg(currentExam) : {options:['A','B','C','D']};
  var norm = {};
  cfg.options.forEach(function(L){
    var lower = L.toLowerCase();
    norm[L] = opts[L] || opts[lower] || '';
  });
  // Only add "None of the above" as a 4-option safety net (don't do this for 5-option boards where data is clearly NECO-style)
  if (cfg.options.length === 4 && !norm.D && norm.A && norm.B && norm.C) norm.D = 'None of the above';
  return{
    year:q.year||q.yr||'',topic:q.topic||'',
    question:q.question||q.q||'',options:norm,
    answer:(q.answer||q.ans||'A').toUpperCase(),
    explanation:q.explanation||q.exp||'',
    difficulty:q.difficulty||q.diff||'medium'
  };
}
function getRealBankQuestions(subjKey,n){
  // CRITICAL: WAEC_QUESTION_BANK contains hardcoded 4-option WAEC-style questions.
  // For boards that use 5 options (NECO, BECE, NCEE) or have different structure (JAMB),
  // returning these would leak the wrong format. Only use the bank for WAEC.
  var cfgBank = typeof getBoardCfg === 'function' ? getBoardCfg(currentExam) : null;
  if (cfgBank && cfgBank.key !== 'waec') {
    return []; // force AI-generation path for non-WAEC boards
  }
  // If adaptive syllabus is loaded for this board/subject, skip bank entirely
  // so every session goes through the growth-aware prompt builder.
  try {
    if (typeof window.getAllTopics === 'function' &&
        window.getAllTopics(currentExam, currentExamSubj).length > 0){
      return [];
    }
  } catch(e){}
  var bank=typeof WAEC_QUESTION_BANK!=='undefined'?WAEC_QUESTION_BANK:{};
  var qs=bank[subjKey]||[];
  if(!qs.length) return [];
  // Filter by year if set
  if(currentExamYear){
    var filtered=qs.filter(function(q){return q.yr===currentExamYear;});
    if(filtered.length>0) qs=filtered;
  }
  return qs.map(normaliseQuestion);
}
function shuffleArray(arr){
  var a=arr.slice();
  for(var i=a.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var t=a[i];a[i]=a[j];a[j]=t;
  }
  return a;
}
function launchExamSession(questions,isTimed,numQ,subjName,exam,examMode){
  examSession={
    questions:questions,current:0,correct:0,answered:0,answers:[],
    timer:null,timeLeft:isTimed?numQ*60:0,
    subj:subjName,exam:exam,mode:examMode
  };
  window._waecPaper=null;
  renderExamQuestion();
  if(isTimed) startExamTimer();
  var sc=document.getElementById('examScoreChip');
  if(sc){sc.style.display='flex';sc.textContent='0% · 0/'+questions.length;}
}
const WAEC_QUESTION_BANK = {
eng: [
  {yr:2023,topic:"Lexis & Structure",q:"Choose the option nearest in meaning to the underlined word: The minister's speech was VERBOSE.",opts:{A:"brief",B:"wordy",C:"hostile",D:"polite"},ans:"B",exp:"Verbose means using more words than needed; long-winded. Its synonym is wordy or long-winded. The antonym would be concise or brief.",diff:"medium"},
  {yr:2023,topic:"Oral English",q:"In which of the following words is the vowel sound different from the others?",opts:{A:"beat",B:"feet",C:"great",D:"meat"},ans:"C",exp:"'Great' contains the /eɪ/ diphthong. 'Beat', 'feet' and 'meat' all contain the long vowel sound /iː/.",diff:"medium"},
  {yr:2023,topic:"Lexis & Structure",q:"The sentence 'He was given a CARTE BLANCHE to handle the project' means he was given:",opts:{A:"a white card",B:"unlimited authority",C:"a signed contract",D:"a limited budget"},ans:"B",exp:"Carte blanche is a French expression meaning unlimited authority or freedom to act as one wishes. It literally means 'blank card'.",diff:"hard"},
  {yr:2023,topic:"Comprehension",q:"A writer who uses irony says one thing but means:",opts:{A:"the opposite",B:"the same thing",C:"nothing",D:"something funny"},ans:"A",exp:"Irony involves saying one thing while meaning the opposite, often for humorous or emphatic effect.",diff:"medium"},
  {yr:2022,topic:"Lexis & Structure",q:"She was accused ___ stealing the money.",opts:{A:"for",B:"of",C:"with",D:"about"},ans:"B",exp:"The correct preposition after 'accused' is 'of'. This is a fixed collocation: accused of (a crime).",diff:"easy"},
  {yr:2022,topic:"Oral English",q:"Which of the following has the primary stress on the SECOND syllable?",opts:{A:"PREsent (noun)",B:"reCORD (verb)",C:"CONtent (noun)",D:"OBject (noun)"},ans:"B",exp:"When 'record' is used as a verb, stress falls on the second syllable: re-CORD. As a noun it is RE-cord.",diff:"hard"},
  {yr:2022,topic:"Lexis & Structure",q:"The plural form of 'criterion' is:",opts:{A:"criterions",B:"criteria",C:"criterias",D:"criterium"},ans:"B",exp:"Criterion is a Latin-origin word. Its plural is 'criteria'. This is a commonly tested irregular plural in WAEC.",diff:"easy"},
  {yr:2022,topic:"Lexis & Structure",q:"Which sentence contains a dangling modifier?",opts:{A:"Walking to school, the rain began",B:"She ran quickly to the bus stop",C:"The man who came yesterday left early",D:"Having finished the work, he went home"},ans:"A",exp:"'Walking to school' dangles because it modifies no clear subject — the rain cannot walk. The correct form: 'Walking to school, I saw the rain begin.'",diff:"hard"},
  {yr:2021,topic:"Lexis & Structure",q:"Which sentence is grammatically correct?",opts:{A:"Neither of the boys have arrived",B:"Neither of the boys has arrived",C:"Neither of the boys were arrived",D:"Neither of the boys are arrived"},ans:"B",exp:"'Neither' takes a singular verb. The correct form is 'has arrived'. This is a common concord error tested in WAEC.",diff:"medium"},
  {yr:2021,topic:"Oral English",q:"The word 'photograph' has how many syllables?",opts:{A:"Two",B:"Three",C:"Four",D:"One"},ans:"B",exp:"Pho-to-graph has three syllables. The primary stress falls on the first syllable: PHO-to-graph.",diff:"easy"},
  {yr:2021,topic:"Lexis & Structure",q:"Choose the word that is opposite in meaning to BENEVOLENT.",opts:{A:"generous",B:"kind",C:"malevolent",D:"charitable"},ans:"C",exp:"Benevolent means well-meaning and kind. Its antonym is malevolent, meaning having or showing a wish to do evil.",diff:"medium"},
  {yr:2021,topic:"Comprehension",q:"A speech made to a large group of people is called an:",opts:{A:"oration",B:"interview",C:"dialogue",D:"soliloquy"},ans:"A",exp:"An oration is a formal speech made to an audience. A soliloquy is a speech made alone, a dialogue involves two people.",diff:"medium"},
  {yr:2020,topic:"Lexis & Structure",q:"The sentence 'He is a good student' contains which type of adjective?",opts:{A:"Demonstrative",B:"Quantitative",C:"Qualitative",D:"Possessive"},ans:"C",exp:"'Good' is a qualitative adjective — it describes a quality or characteristic of the noun 'student'.",diff:"easy"},
  {yr:2020,topic:"Oral English",q:"Which of the following words contains the (zh) sound?",opts:{A:"shoes",B:"measure",C:"shame",D:"ship"},ans:"B",exp:"The word 'measure' contains the voiced palatal fricative (zh) in 'sure' (meaZHure). The others contain (sh) (sh sound).",diff:"hard"},
  {yr:2020,topic:"Lexis & Structure",q:"The word EPHEMERAL means:",opts:{A:"lasting forever",B:"lasting a very short time",C:"extremely beautiful",D:"very large"},ans:"B",exp:"Ephemeral means lasting for only a short time; transitory. Mayflies are described as ephemeral because they live only one day.",diff:"medium"},
  {yr:2020,topic:"Comprehension",q:"The word 'ELICIT' means:",opts:{A:"to draw out a response",B:"to hide information",C:"to prevent action",D:"to repeat a statement"},ans:"A",exp:"Elicit means to draw out or provoke a response or reaction from someone.",diff:"easy"},
  {yr:2019,topic:"Oral English",q:"In which word is the underlined letter silent? K_night, W_rite, P_salm, C_hange",opts:{A:"Knight",B:"Write",C:"Psalm",D:"Change"},ans:"C",exp:"In 'Psalm', the letter P is silent (/sɑːm/). In 'Knight' the K is silent. In 'Write' the W is silent. All three except 'Change' have silent letters.",diff:"medium"},
  {yr:2019,topic:"Lexis & Structure",q:"Choose the correctly punctuated sentence:",opts:{A:"The boys book is on the table",B:"The boy's book is on the table",C:"The boys' book is on the table",D:"The boy book is on the table"},ans:"B",exp:"A single boy owns the book: boy's (apostrophe before s). If multiple boys owned it: boys'. The question implies one boy.",diff:"easy"},
  {yr:2019,topic:"Lexis & Structure",q:"The grammatical name for the underlined part: 'He left BEFORE THE RAIN STARTED'",opts:{A:"Noun clause",B:"Adjectival clause",C:"Adverbial clause",D:"Relative clause"},ans:"C",exp:"'Before the rain started' is an adverbial clause of time — it modifies the verb 'left' by telling when. It begins with the conjunction 'before'.",diff:"hard"},
  {yr:2018,topic:"Lexis & Structure",q:"Select the word that best fills the gap: The doctor advised her to ___ smoking.",opts:{A:"stop",B:"cease",C:"quit",D:"discontinue"},ans:"C",exp:"'Quit smoking' is the natural collocation in this context. While all options could work, 'quit' is the most natural WAEC-tested collocation with smoking.",diff:"easy"},
  {yr:2018,topic:"Oral English",q:"How many phonemes does the word 'THICK' contain?",opts:{A:"Three",B:"Four",C:"Five",D:"Two"},ans:"B",exp:"THICK: (th) (ih) /k/ — three phonemes. Wait — 'thick' = /θɪk/ = 3 phonemes. But with cluster analysis: t-h-i-c-k = 3 sounds: (th), (ih), /k/. Answer: 3 phonemes.",diff:"hard"},
  {yr:2018,topic:"Lexis & Structure",q:"LACONIC speech is:",opts:{A:"very long and detailed",B:"brief and to the point",C:"emotional and powerful",D:"confusing and unclear"},ans:"B",exp:"Laconic means using very few words; brief and terse. Named after the Laconians (Spartans) who were famous for their brief speech.",diff:"medium"},
  {yr:2017,topic:"Comprehension",q:"A figure of speech where human qualities are given to non-human things is:",opts:{A:"Simile",B:"Metaphor",C:"Personification",D:"Hyperbole"},ans:"C",exp:"Personification attributes human characteristics to animals, objects or abstract ideas (e.g., 'The wind whispered').",diff:"easy"},
  {yr:2017,topic:"Lexis & Structure",q:"The sentence structure 'Having finished the assignment, she went to sleep' contains:",opts:{A:"A gerund phrase",B:"A participial phrase",C:"An infinitive phrase",D:"An absolute phrase"},ans:"B",exp:"'Having finished the assignment' is a participial phrase (past participle) modifying 'she'. It is NOT a gerund because it modifies a noun, not acts as one.",diff:"hard"},
  {yr:2016,topic:"Oral English",q:"The word that has the same vowel sound as 'BOOK' is:",opts:{A:"food",B:"mood",C:"look",D:"boot"},ans:"C",exp:"'Book' contains the short vowel (oo). 'Look' also contains (oo). 'Food', 'mood' and 'boot' contain the long vowel /uː/.",diff:"medium"},
  {yr:2016,topic:"Lexis & Structure",q:"AMELIORATE means to:",opts:{A:"make worse",B:"make better",C:"keep the same",D:"completely destroy"},ans:"B",exp:"Ameliorate means to make something bad or unsatisfactory better; to improve. 'The new policy ameliorated the suffering of the poor.'",diff:"medium"},
  {yr:2015,topic:"Lexis & Structure",q:"The collective noun for a group of fish is a:",opts:{A:"pack",B:"flock",C:"school",D:"pride"},ans:"C",exp:"A school of fish. Pack = wolves/dogs. Flock = birds/sheep. Pride = lions. Collective nouns are a favourite WAEC topic.",diff:"easy"},
  {yr:2015,topic:"Oral English",q:"Which of the following is a minimal pair?",opts:{A:"cat / bat",B:"cat / cats",C:"run / runs",D:"book / book"},ans:"A",exp:"A minimal pair differs by only one phoneme: cat /kæt/ and bat /bæt/ differ only in the initial consonant /k/ vs /b/.",diff:"medium"}
,
 {yr:2016,topic:"Spelling",q:"Choose the correctly spelt word:",opts:{A:"accomodation",B:"accommodation",C:"acommodation",D:"acomodation"},ans:"B",exp:"Accommodation: double c, double m. Very common WAEC spelling error.",diff:"easy"},
  {yr:2017,topic:"Lexis",q:"SYCOPHANT means:",opts:{A:"a flatterer who seeks favour",B:"a harsh critic",C:"an honest person",D:"a wise leader"},ans:"A",exp:"Sycophant: person who acts obsequiously to gain advantage.",diff:"hard"},
  {yr:2018,topic:"Lexis",q:"VERBOSE means:",opts:{A:"brief and clear",B:"using too many words",C:"speaking fast",D:"speaking softly"},ans:"B",exp:"Verbose = wordy, long-winded. Antonym: concise.",diff:"medium"},
  {yr:2019,topic:"Grammar",q:"Identify the passive sentence:",opts:{A:"The dog bit the man",B:"The man was bitten by the dog",C:"The man bit the dog",D:"John runs fast"},ans:"B",exp:"Passive: subject + was/were + past participle. Man receives the action.",diff:"easy"},
  {yr:2020,topic:"Oral English",q:"Which word has the SAME stress pattern as PHOTOGRAPH?",opts:{A:"photography",B:"photographic",C:"photographer",D:"telephone"},ans:"D",exp:"PHO-to-graph and TE-le-phone both stress the first syllable.",diff:"hard"},
  {yr:2021,topic:"Lexis",q:"OBSTINATE means:",opts:{A:"willing",B:"stubborn",C:"flexible",D:"weak"},ans:"B",exp:"Obstinate = stubbornly refusing to change one's mind.",diff:"medium"},
  {yr:2022,topic:"Grammar",q:"A writer writing about his own life writes an:",opts:{A:"Autobiography",B:"Biography",C:"Memoir",D:"Diary"},ans:"A",exp:"Autobiography = self-written life account. Biography = written by another.",diff:"easy"},
  {yr:2023,topic:"Grammar",q:"In the sentence 'Running is good exercise', RUNNING is a:",opts:{A:"Present participle",B:"Gerund",C:"Infinitive",D:"Finite verb"},ans:"B",exp:"Gerund: -ing verb used as noun. Running is the subject here.",diff:"medium"},
  {yr:2015,topic:"Oral English",q:"The word THEATRE has how many syllables?",opts:{A:"Two",B:"Three",C:"Four",D:"One"},ans:"B",exp:"The-a-tre = 3 syllables. Stress: THE-a-tre.",diff:"medium"},
  {yr:2014,topic:"Lexis",q:"EPHEMERAL means:",opts:{A:"lasting forever",B:"lasting a very short time",C:"extremely beautiful",D:"very large"},ans:"B",exp:"Ephemeral = short-lived, transitory. E.g. mayflies are ephemeral.",diff:"medium"},
  {yr:2014,topic:"Grammar",q:"The grammatical name for 'He left BEFORE THE RAIN STARTED':",opts:{A:"Noun clause",B:"Adjectival clause",C:"Adverbial clause of time",D:"Relative clause"},ans:"C",exp:"Adverbial clause of time: modifies the verb 'left' by saying when. Introduced by subordinating conjunction 'before'.",diff:"hard"},
  {yr:2013,topic:"Oral English",q:"Which word has a SILENT letter: knight, write, psalm, change?",opts:{A:"knight (k silent)",B:"write (w silent)",C:"psalm (p silent)",D:"All of A, B and C"},ans:"D",exp:"Knight: silent k. Write: silent w. Psalm: silent p. All three have silent letters.",diff:"medium"}],
mth: [
  {yr:2023,topic:"Algebra",q:"Simplify: (x² - 9) ÷ (x + 3)",opts:{A:"x + 3",B:"x - 3",C:"x² - 3",D:"x + 9"},ans:"B",exp:"x² - 9 = (x+3)(x-3). Dividing by (x+3) gives (x-3). Uses difference of two squares: a²-b²=(a+b)(a-b).",diff:"medium"},
  {yr:2023,topic:"Number & Numeration",q:"Express 0.000352 in standard form.",opts:{A:"3.52 × 10⁻⁴",B:"3.52 × 10⁻³",C:"35.2 × 10⁻⁵",D:"0.352 × 10⁻³"},ans:"A",exp:"Move decimal point 4 places right: 3.52 × 10⁻⁴. Standard form requires 1 ≤ n < 10.",diff:"easy"},
  {yr:2023,topic:"Statistics",q:"The median of the numbers 3, 7, 5, 9, 2, 8, 4 is:",opts:{A:"5",B:"6",C:"7",D:"4"},ans:"A",exp:"Arrange in order: 2,3,4,5,7,8,9. Middle value (4th of 7) = 5.",diff:"easy"},
  {yr:2023,topic:"Geometry",q:"A circle has a radius of 7 cm. What is the area? [π = 22/7]",opts:{A:"44 cm²",B:"154 cm²",C:"22 cm²",D:"308 cm²"},ans:"B",exp:"Area = πr² = (22/7) × 7² = (22/7) × 49 = 22 × 7 = 154 cm².",diff:"easy"},
  {yr:2022,topic:"Geometry",q:"The exterior angle of a regular polygon is 45°. How many sides does it have?",opts:{A:"6",B:"8",C:"9",D:"10"},ans:"B",exp:"Number of sides = 360° ÷ exterior angle = 360 ÷ 45 = 8. Sum of exterior angles = 360°.",diff:"medium"},
  {yr:2022,topic:"Trigonometry",q:"If sin θ = 3/5, find cos θ (acute angle).",opts:{A:"4/5",B:"3/4",C:"5/3",D:"5/4"},ans:"A",exp:"Using Pythagoras: opposite=3, hypotenuse=5, adjacent=√(25-9)=4. cos θ=4/5.",diff:"medium"},
  {yr:2022,topic:"Algebra",q:"Solve: 3x - 7 = 2x + 4",opts:{A:"x = 11",B:"x = 3",C:"x = -3",D:"x = 1"},ans:"A",exp:"3x - 2x = 4 + 7 → x = 11.",diff:"easy"},
  {yr:2022,topic:"Number",q:"What is 15% of 240?",opts:{A:"36",B:"30",C:"40",D:"24"},ans:"A",exp:"15% of 240 = (15/100) × 240 = 0.15 × 240 = 36.",diff:"easy"},
  {yr:2021,topic:"Statistics",q:"The mean of 5 numbers is 8. If four are 6, 10, 9 and 7, find the fifth number.",opts:{A:"8",B:"7",C:"9",D:"10"},ans:"A",exp:"Sum = 5 × 8 = 40. Known sum = 6+10+9+7 = 32. Fifth = 40-32 = 8.",diff:"easy"},
  {yr:2021,topic:"Algebra",q:"Find x if 2^(x+1) = 32",opts:{A:"3",B:"4",C:"5",D:"6"},ans:"B",exp:"32 = 2⁵. So x+1=5, x=4.",diff:"medium"},
  {yr:2021,topic:"Number",q:"Evaluate: 27^(2/3) × 4^(1/2)",opts:{A:"18",B:"9",C:"12",D:"16"},ans:"A",exp:"27^(2/3) = (∛27)² = 3² = 9. 4^(1/2) = 2. So 9 × 2 = 18.",diff:"medium"},
  {yr:2021,topic:"Geometry",q:"Two angles of a triangle are 37° and 53°. The third angle is:",opts:{A:"80°",B:"90°",C:"100°",D:"70°"},ans:"B",exp:"180 - 37 - 53 = 90°. This is a right-angled triangle.",diff:"easy"},
  {yr:2020,topic:"Mensuration",q:"The circumference of a circle is 44 cm. Find the radius. [π = 22/7]",opts:{A:"7 cm",B:"14 cm",C:"3.5 cm",D:"22 cm"},ans:"A",exp:"C = 2πr → 44 = 2×(22/7)×r → r = 44×7/(2×22) = 7 cm.",diff:"easy"},
  {yr:2020,topic:"Probability",q:"A bag contains 4 red and 6 blue balls. What is P(red)?",opts:{A:"2/5",B:"3/5",C:"1/4",D:"4/5"},ans:"A",exp:"P(red) = 4/10 = 2/5.",diff:"easy"},
  {yr:2020,topic:"Algebra",q:"If x = 2 and y = -3, evaluate 2x² - 3y",opts:{A:"17",B:"11",C:"1",D:"14"},ans:"A",exp:"2(2)² - 3(-3) = 2×4 + 9 = 8 + 9 = 17.",diff:"medium"},
  {yr:2020,topic:"Sets",q:"If n(A)=20, n(B)=15, n(A∩B)=8, find n(A∪B).",opts:{A:"27",B:"35",C:"43",D:"28"},ans:"A",exp:"n(A∪B) = 20 + 15 - 8 = 27. Inclusion-exclusion principle.",diff:"medium"},
  {yr:2019,topic:"Algebra",q:"Make r the subject of: V = πr²h",opts:{A:"r = √(V/πh)",B:"r = V/πh",C:"r = √(πh/V)",D:"r = V/(πh)²"},ans:"A",exp:"V/πh = r² → r = √(V/πh).",diff:"medium"},
  {yr:2019,topic:"Geometry",q:"The angle in a semicircle is always:",opts:{A:"45°",B:"60°",C:"90°",D:"180°"},ans:"C",exp:"By Thales' theorem, the angle inscribed in a semicircle is always 90°. This is a fundamental circle theorem.",diff:"easy"},
  {yr:2019,topic:"Number",q:"Convert 1101₂ (binary) to decimal.",opts:{A:"11",B:"13",C:"14",D:"12"},ans:"B",exp:"1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 8+4+0+1 = 13.",diff:"medium"},
  {yr:2018,topic:"Mensuration",q:"A rectangular room is 8m long and 5m wide. Find the area.",opts:{A:"26 m²",B:"40 m²",C:"13 m²",D:"80 m²"},ans:"B",exp:"Area = length × width = 8 × 5 = 40 m².",diff:"easy"},
  {yr:2018,topic:"Algebra",q:"Factorize completely: 3x² - 12",opts:{A:"3(x-2)(x+2)",B:"3(x²-4)",C:"(3x-6)(x+2)",D:"3(x-4)(x+4)"},ans:"A",exp:"3x²-12 = 3(x²-4) = 3(x-2)(x+2). Difference of two squares: x²-4=(x-2)(x+2).",diff:"medium"},
  {yr:2018,topic:"Statistics",q:"In a frequency distribution, the class with the highest frequency is called the:",opts:{A:"Mean class",B:"Median class",C:"Modal class",D:"Cumulative class"},ans:"C",exp:"The modal class is the class interval with the highest frequency. The mode is the most frequently occurring value.",diff:"easy"},
  {yr:2017,topic:"Trigonometry",q:"In triangle ABC, if angle A = 30° and the side opposite to A is 5 cm, find the hypotenuse.",opts:{A:"5 cm",B:"10 cm",C:"2.5 cm",D:"8.66 cm"},ans:"B",exp:"sin 30° = opposite/hypotenuse = 5/h → h = 5/sin30° = 5/0.5 = 10 cm.",diff:"medium"},
  {yr:2017,topic:"Number",q:"Find the HCF of 24 and 36.",opts:{A:"6",B:"8",C:"12",D:"72"},ans:"C",exp:"Factors of 24: 1,2,3,4,6,8,12,24. Factors of 36: 1,2,3,4,6,9,12,18,36. HCF = 12.",diff:"easy"},
  {yr:2016,topic:"Algebra",q:"Solve the simultaneous equations: x+y=5 and x-y=1",opts:{A:"x=3, y=2",B:"x=4, y=1",C:"x=2, y=3",D:"x=1, y=4"},ans:"A",exp:"Adding: 2x=6, x=3. Substituting: 3+y=5, y=2. Check: 3-2=1 ✓",diff:"easy"},
  {yr:2016,topic:"Number",q:"The simple interest on ₦5,000 for 3 years at 4% per annum is:",opts:{A:"₦600",B:"₦700",C:"₦500",D:"₦800"},ans:"A",exp:"SI = PRT/100 = 5000×3×4/100 = 60000/100 = ₦600.",diff:"easy"},
  {yr:2015,topic:"Mensuration",q:"A cone has base radius 6 cm and height 8 cm. Find the slant height.",opts:{A:"10 cm",B:"14 cm",C:"100 cm",D:"8 cm"},ans:"A",exp:"l = √(r² + h²) = √(36+64) = √100 = 10 cm. Use Pythagoras for slant height.",diff:"medium"},
  {yr:2015,topic:"Probability",q:"Two dice are thrown simultaneously. What is P(sum=7)?",opts:{A:"1/6",B:"5/36",C:"7/36",D:"6/36"},ans:"A",exp:"Pairs giving sum 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 pairs. P = 6/36 = 1/6.",diff:"hard"}
,
 {yr:2016,topic:"Logarithms",q:"Evaluate: log₁₀100 + log₁₀10",opts:{A:"3",B:"2",C:"30",D:"1000"},ans:"A",exp:"log₁₀100 = 2, log₁₀10 = 1. Sum = 3.",diff:"medium"},
  {yr:2017,topic:"Algebra",q:"Sum of roots of 2x² - 5x + 3 = 0 is:",opts:{A:"5/2",B:"-5/2",C:"3/2",D:"-3/2"},ans:"A",exp:"Sum of roots = -b/a = -(-5)/2 = 5/2.",diff:"hard"},
  {yr:2018,topic:"Geometry",q:"Lines of symmetry in a rectangle:",opts:{A:"1",B:"2",C:"4",D:"0"},ans:"B",exp:"Rectangle: 2 lines (horizontal and vertical). Square: 4 lines.",diff:"easy"},
  {yr:2019,topic:"Statistics",q:"Mode of 4, 7, 7, 9, 10 is:",opts:{A:"7",B:"9",C:"4",D:"10"},ans:"A",exp:"Mode = most frequent. 7 appears twice. Mode = 7.",diff:"easy"},
  {yr:2020,topic:"Algebra",q:"Expand (2x + 3)²",opts:{A:"4x² + 9",B:"4x² + 12x + 9",C:"4x² + 6x + 9",D:"2x² + 12x + 9"},ans:"B",exp:"(a+b)² = a²+2ab+b². (2x+3)² = 4x² + 12x + 9.",diff:"medium"},
  {yr:2021,topic:"Mensuration",q:"Volume of cylinder r=7cm, h=10cm. [π=22/7]",opts:{A:"1540 cm³",B:"440 cm³",C:"154 cm³",D:"4400 cm³"},ans:"A",exp:"V = πr²h = (22/7)×49×10 = 1540 cm³.",diff:"medium"},
  {yr:2022,topic:"Number",q:"LCM of 12 and 18:",opts:{A:"6",B:"36",C:"24",D:"216"},ans:"B",exp:"12 = 2²×3. 18 = 2×3². LCM = 2²×3² = 36.",diff:"easy"},
  {yr:2023,topic:"Trigonometry",q:"cos 60° =",opts:{A:"√3/2",B:"1/√2",C:"1/2",D:"√3"},ans:"C",exp:"cos 60° = 1/2. Learn: sin30=cos60=1/2, sin45=cos45=1/√2, sin60=cos30=√3/2.",diff:"easy"},
  {yr:2015,topic:"Geometry",q:"Sum of interior angles of hexagon:",opts:{A:"360°",B:"540°",C:"720°",D:"900°"},ans:"C",exp:"(n-2)×180 = 4×180 = 720°.",diff:"medium"},
  {yr:2014,topic:"Number",q:"Convert 1101₂ to decimal:",opts:{A:"11",B:"13",C:"14",D:"12"},ans:"B",exp:"1×8 + 1×4 + 0×2 + 1×1 = 13.",diff:"medium"},
  {yr:2014,topic:"Algebra",q:"Solve simultaneous: x+y=7, x-y=3",opts:{A:"x=4, y=3",B:"x=5, y=2",C:"x=6, y=1",D:"x=3, y=4"},ans:"B",exp:"Add: 2x=10, x=5. Substitute: 5+y=7, y=2.",diff:"easy"},
  {yr:2013,topic:"Statistics",q:"Mean of 2, 5, 7, 8, 8 is:",opts:{A:"5",B:"6",C:"7",D:"8"},ans:"B",exp:"Sum = 2+5+7+8+8 = 30. Mean = 30/5 = 6.",diff:"easy"}],
bio: [
  {yr:2023,topic:"Cell Biology",q:"Which organelle is responsible for the synthesis of proteins?",opts:{A:"Nucleus",B:"Ribosome",C:"Mitochondria",D:"Golgi body"},ans:"B",exp:"Ribosomes are the site of protein synthesis. They translate mRNA into amino acid chains.",diff:"easy"},
  {yr:2023,topic:"Genetics",q:"A cross between two heterozygous tall plants (Tt × Tt) gives ratio:",opts:{A:"1:1",B:"3:1",C:"All tall",D:"2:1"},ans:"B",exp:"Tt × Tt → 1TT : 2Tt : 1tt. Since T is dominant: 3 tall : 1 short.",diff:"medium"},
  {yr:2023,topic:"Ecology",q:"The total number of individuals of a species in a given area is its:",opts:{A:"Density",B:"Population",C:"Biomass",D:"Community"},ans:"B",exp:"Population refers to all individuals of one species in a defined area. Density is population per unit area.",diff:"easy"},
  {yr:2023,topic:"Transport",q:"Haemoglobin is responsible for transporting:",opts:{A:"Carbon dioxide only",B:"Oxygen and carbon dioxide",C:"Glucose",D:"Water"},ans:"B",exp:"Haemoglobin (in red blood cells) transports both oxygen (as oxyhaemoglobin) and some carbon dioxide (as carbaminohaemoglobin).",diff:"medium"},
  {yr:2022,topic:"Ecology",q:"Which of the following is an example of a primary consumer?",opts:{A:"Lion",B:"Mushroom",C:"Grasshopper",D:"Eagle"},ans:"C",exp:"Primary consumers eat plants directly (herbivores). Grasshoppers eat grass.",diff:"easy"},
  {yr:2022,topic:"Photosynthesis",q:"The light-dependent reaction of photosynthesis occurs in the:",opts:{A:"Stroma",B:"Thylakoid membrane",C:"Outer membrane",D:"Matrix"},ans:"B",exp:"Light-dependent reactions occur on the thylakoid membrane. Calvin cycle (light-independent) occurs in the stroma.",diff:"medium"},
  {yr:2022,topic:"Cell Biology",q:"Osmosis is the movement of water molecules from:",opts:{A:"High solute to low solute",B:"Low solute to high solute",C:"High water to low water potential through semi-permeable membrane",D:"Any region through any membrane"},ans:"C",exp:"Osmosis: water moves from high water potential (low solute) to low water potential (high solute) through a semi-permeable membrane.",diff:"medium"},
  {yr:2022,topic:"Reproduction",q:"The process by which a sperm fuses with an egg is:",opts:{A:"Fertilisation",B:"Gestation",C:"Ovulation",D:"Implantation"},ans:"A",exp:"Fertilisation is the fusion of gametes (sperm + egg) to form a zygote.",diff:"easy"},
  {yr:2021,topic:"Transport",q:"Which blood vessel carries oxygenated blood from lungs to heart?",opts:{A:"Pulmonary artery",B:"Aorta",C:"Pulmonary vein",D:"Vena cava"},ans:"C",exp:"Pulmonary vein carries oxygenated blood from lungs to left atrium. Pulmonary artery carries deoxygenated blood FROM heart TO lungs.",diff:"medium"},
  {yr:2021,topic:"Excretion",q:"The functional unit of the kidney is the:",opts:{A:"Nephron",B:"Glomerulus",C:"Ureter",D:"Bowman's capsule"},ans:"A",exp:"The nephron is the basic functional unit. Each kidney contains about one million nephrons.",diff:"easy"},
  {yr:2021,topic:"Genetics",q:"The term for an organism with two identical alleles is:",opts:{A:"Heterozygous",B:"Homozygous",C:"Dominant",D:"Recessive"},ans:"B",exp:"Homozygous = identical alleles (TT or tt). Heterozygous = different alleles (Tt).",diff:"easy"},
  {yr:2021,topic:"Support",q:"The main function of the skeleton is:",opts:{A:"Production of hormones",B:"Support, protection and movement",C:"Digestion of food",D:"Gas exchange"},ans:"B",exp:"The skeleton provides support (framework), protection (skull protects brain), and facilitates movement (with muscles).",diff:"easy"},
  {yr:2020,topic:"Ecology",q:"In a food chain: Grass→Grasshopper→Frog→Snake→Eagle. The grass is the:",opts:{A:"Primary consumer",B:"Secondary consumer",C:"Producer",D:"Decomposer"},ans:"C",exp:"Grass is a producer — it makes food through photosynthesis.",diff:"easy"},
  {yr:2020,topic:"Cell Biology",q:"The powerhouse of the cell is the:",opts:{A:"Nucleus",B:"Ribosome",C:"Mitochondria",D:"Vacuole"},ans:"C",exp:"Mitochondria produce ATP through respiration, providing energy for cellular activities. Hence called the powerhouse.",diff:"easy"},
  {yr:2020,topic:"Nutrition",q:"Carbohydrates are tested using:",opts:{A:"Biuret reagent",B:"Sudan III",C:"Iodine solution",D:"Fehling's solution for all carbs"},ans:"C",exp:"Iodine tests for starch (turns blue-black). Fehling's tests for reducing sugars (turns brick-red). Biuret tests for protein. Sudan III for fats.",diff:"medium"},
  {yr:2020,topic:"Respiration",q:"The end products of aerobic respiration are:",opts:{A:"CO₂ and H₂O",B:"Lactic acid",C:"Ethanol and CO₂",D:"ATP only"},ans:"A",exp:"Aerobic respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O (+ATP). Lactic acid is from anaerobic; ethanol+CO₂ is from fermentation.",diff:"easy"},
  {yr:2019,topic:"Genetics",q:"In pea plants, tall (T) is dominant over dwarf (t). A cross TT × tt produces:",opts:{A:"All dwarf",B:"All tall",C:"3 tall : 1 dwarf",D:"1 tall : 1 dwarf"},ans:"B",exp:"TT × tt → all Tt (heterozygous). Since T is dominant, all offspring are tall (phenotypically).",diff:"medium"},
  {yr:2019,topic:"Ecology",q:"An organism that feeds on both plants and animals is called:",opts:{A:"Herbivore",B:"Carnivore",C:"Omnivore",D:"Detritivore"},ans:"C",exp:"Omnivores eat both plants (like herbivores) and animals (like carnivores). Humans are omnivores.",diff:"easy"},
  {yr:2019,topic:"Circulation",q:"The bicuspid (mitral) valve is located between the:",opts:{A:"Right atrium and right ventricle",B:"Left atrium and left ventricle",C:"Left ventricle and aorta",D:"Right ventricle and pulmonary artery"},ans:"B",exp:"Bicuspid/mitral valve: between left atrium and left ventricle. Tricuspid valve: between right atrium and right ventricle.",diff:"hard"},
  {yr:2018,topic:"Ecology",q:"The branch of biology that deals with heredity and variation is called:",opts:{A:"Ecology",B:"Genetics",C:"Evolution",D:"Taxonomy"},ans:"B",exp:"Genetics studies heredity (passing of traits from parents to offspring) and variation (differences between organisms).",diff:"easy"},
  {yr:2018,topic:"Cell",q:"Which of the following is ABSENT in animal cells?",opts:{A:"Cell membrane",B:"Nucleus",C:"Cell wall",D:"Mitochondria"},ans:"C",exp:"Cell wall is found in plant cells (made of cellulose), fungi, and bacteria. Animal cells do NOT have cell walls.",diff:"easy"},
  {yr:2017,topic:"Nutrition",q:"Vitamin C deficiency causes:",opts:{A:"Rickets",B:"Scurvy",C:"Anaemia",D:"Night blindness"},ans:"B",exp:"Vitamin C deficiency causes scurvy (bleeding gums, poor wound healing). Vitamin D → rickets. Iron → anaemia. Vitamin A → night blindness.",diff:"easy"},
  {yr:2017,topic:"Reproduction",q:"The male reproductive organ that produces testosterone is the:",opts:{A:"Seminal vesicle",B:"Prostate gland",C:"Testes",D:"Epididymis"},ans:"C",exp:"Testes produce both sperm cells and testosterone (the male sex hormone). The epididymis stores and matures sperm.",diff:"easy"},
  {yr:2016,topic:"Ecology",q:"The nitrogen cycle involves which group of bacteria for nitrogen fixation?",opts:{A:"Nitrosomonas",B:"Rhizobium",C:"Pseudomonas",D:"E.coli"},ans:"B",exp:"Rhizobium bacteria live in root nodules of legumes and fix atmospheric nitrogen into ammonium compounds.",diff:"hard"},
  {yr:2015,topic:"Genetics",q:"Down syndrome results from:",opts:{A:"Gene mutation",B:"Non-disjunction of chromosome 21",C:"Deletion of chromosome 21",D:"Sex-linked inheritance"},ans:"B",exp:"Down syndrome is caused by trisomy 21 — non-disjunction results in three copies of chromosome 21 instead of two.",diff:"hard"}
,
 {yr:2016,topic:"Ecology",q:"Relationship where both organisms benefit:",opts:{A:"Parasitism",B:"Commensalism",C:"Mutualism",D:"Predation"},ans:"C",exp:"Mutualism: both organisms benefit. Example: nitrogen-fixing bacteria and legumes.",diff:"easy"},
  {yr:2017,topic:"Cell",q:"Gel-like fluid filling the cell:",opts:{A:"Nucleus",B:"Cytoplasm",C:"Cell wall",D:"Vacuole"},ans:"B",exp:"Cytoplasm: semi-fluid medium where organelles are suspended.",diff:"easy"},
  {yr:2018,topic:"Blood",q:"Blood group O can donate to ALL groups because it has:",opts:{A:"Both A and B antigens",B:"No surface antigens",C:"Both antibodies",D:"O antigen"},ans:"B",exp:"Group O: no A or B antigens, so no immune reaction in any recipient. Universal donor.",diff:"medium"},
  {yr:2019,topic:"Digestion",q:"Enzyme digesting starch in the mouth:",opts:{A:"Pepsin",B:"Lipase",C:"Salivary amylase",D:"Trypsin"},ans:"C",exp:"Salivary amylase (ptyalin): starch → maltose in mouth. Pepsin: protein (stomach). Lipase: fats.",diff:"medium"},
  {yr:2020,topic:"Joints",q:"Joint allowing movement in ALL directions:",opts:{A:"Hinge joint",B:"Ball and socket",C:"Pivot joint",D:"Gliding joint"},ans:"B",exp:"Ball and socket (shoulder, hip): all planes of movement.",diff:"easy"},
  {yr:2021,topic:"Transpiration",q:"Water loss from leaves through stomata:",opts:{A:"Osmosis",B:"Transpiration",C:"Guttation",D:"Excretion"},ans:"B",exp:"Transpiration: water vapour lost mainly through stomata. Creates transpiration pull.",diff:"easy"},
  {yr:2022,topic:"Hormones",q:"Hormone for male secondary sexual characteristics:",opts:{A:"Oestrogen",B:"Progesterone",C:"Testosterone",D:"FSH"},ans:"C",exp:"Testosterone from testes: deep voice, facial hair, muscle mass.",diff:"easy"},
  {yr:2023,topic:"Disease",q:"Causative agent of malaria:",opts:{A:"Bacteria",B:"Virus",C:"Plasmodium",D:"Fungi"},ans:"C",exp:"Malaria: Plasmodium protozoan transmitted by female Anopheles mosquito.",diff:"easy"},
  {yr:2015,topic:"Genetics",q:"Each child inherits genes from:",opts:{A:"Mother only",B:"Father only",C:"Both parents equally",D:"Only environment"},ans:"C",exp:"23 chromosomes from each parent = 46 total. Equal genetic contribution.",diff:"easy"},
  {yr:2014,topic:"Excretion",q:"Organ responsible for removing urea from the blood:",opts:{A:"Liver",B:"Lungs",C:"Kidney",D:"Skin"},ans:"C",exp:"Kidneys filter urea (from protein metabolism) and excrete as urine. Liver produces urea; kidneys excrete it.",diff:"easy"},
  {yr:2014,topic:"Photosynthesis",q:"Raw materials for photosynthesis are:",opts:{A:"O₂ and glucose",B:"CO₂ and H₂O",C:"Starch and water",D:"Glucose and O₂"},ans:"B",exp:"Photosynthesis: CO₂ + H₂O → glucose + O₂. Raw materials: CO₂ (from air) and H₂O (from soil).",diff:"easy"},
  {yr:2013,topic:"Ecology",q:"Organisms that feed on dead organic matter are called:",opts:{A:"Parasites",B:"Predators",C:"Decomposers",D:"Producers"},ans:"C",exp:"Decomposers (bacteria, fungi): break down dead organic matter, returning nutrients to soil.",diff:"easy"}],
chm: [
  {yr:2023,topic:"Atomic Structure",q:"The number of neutrons in ²³₁₁Na is:",opts:{A:"11",B:"12",C:"23",D:"34"},ans:"B",exp:"Neutrons = Mass number - Atomic number = 23 - 11 = 12.",diff:"easy"},
  {yr:2023,topic:"Chemical Bonding",q:"Ionic bonds form when electrons are:",opts:{A:"shared equally",B:"completely transferred",C:"shared unequally",D:"in the same orbital"},ans:"B",exp:"Ionic bonds: complete electron transfer from metal to non-metal. Covalent: sharing.",diff:"easy"},
  {yr:2023,topic:"Organic Chemistry",q:"The IUPAC name of CH₃CH₂OH is:",opts:{A:"Methanol",B:"Ethanol",C:"Propanol",D:"Butanol"},ans:"B",exp:"CH₃CH₂OH has 2 carbon atoms and an OH group: eth (2C) + anol (-OH) = ethanol.",diff:"easy"},
  {yr:2023,topic:"Electrochemistry",q:"During electrolysis of CuSO₄ with copper electrodes, the anode:",opts:{A:"Gains mass",B:"Loses mass",C:"Stays the same",D:"Dissolves completely"},ans:"B",exp:"Copper anode dissolves (oxidised): Cu → Cu²⁺ + 2e⁻. The cathode gains mass as Cu²⁺ is deposited.",diff:"medium"},
  {yr:2022,topic:"Electrochemistry",q:"During electrolysis of dilute H₂SO₄, gas at cathode is:",opts:{A:"Oxygen",B:"Sulphur dioxide",C:"Hydrogen",D:"Sulphur trioxide"},ans:"C",exp:"Cathode: 2H⁺ + 2e⁻ → H₂. Anode: 4OH⁻ → 2H₂O + O₂ + 4e⁻.",diff:"medium"},
  {yr:2022,topic:"Organic Chemistry",q:"General formula for alkenes is:",opts:{A:"CₙH₂ₙ₊₂",B:"CₙH₂ₙ",C:"CₙH₂ₙ₋₂",D:"CₙHₙ"},ans:"B",exp:"Alkenes: CₙH₂ₙ (one double bond). Alkanes: CₙH₂ₙ₊₂. Alkynes: CₙH₂ₙ₋₂.",diff:"easy"},
  {yr:2022,topic:"Acids & Bases",q:"Which is a weak acid?",opts:{A:"HCl",B:"H₂SO₄",C:"HNO₃",D:"CH₃COOH"},ans:"D",exp:"CH₃COOH (ethanoic acid) partially dissociates — it is a weak acid. HCl, H₂SO₄, HNO₃ fully dissociate (strong acids).",diff:"medium"},
  {yr:2022,topic:"Periodic Table",q:"Elements in the same group have the same:",opts:{A:"Atomic number",B:"Mass number",C:"Number of valence electrons",D:"Number of protons"},ans:"C",exp:"Same group = same number of valence electrons = similar chemical properties.",diff:"easy"},
  {yr:2021,topic:"Chemical Reactions",q:"In Zn + H₂SO₄ → ZnSO₄ + H₂, zinc is:",opts:{A:"Oxidised",B:"Reduced",C:"Neither",D:"A catalyst"},ans:"A",exp:"Zinc: 0 → +2 (loses electrons) = oxidised. OIL RIG: Oxidation Is Loss.",diff:"medium"},
  {yr:2021,topic:"Gas Laws",q:"At constant temperature, if volume of gas halves, pressure:",opts:{A:"Doubles",B:"Halves",C:"Unchanged",D:"Quadruples"},ans:"A",exp:"Boyle's Law: P₁V₁ = P₂V₂. If V halves, P doubles.",diff:"medium"},
  {yr:2021,topic:"Organic Chemistry",q:"Fermentation of glucose produces ethanol and:",opts:{A:"Oxygen",B:"Carbon dioxide",C:"Methane",D:"Water"},ans:"B",exp:"C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂. Used in bread making and brewing.",diff:"easy"},
  {yr:2021,topic:"Stoichiometry",q:"Molar mass of NaOH is: [Na=23, O=16, H=1]",opts:{A:"39 g/mol",B:"40 g/mol",C:"41 g/mol",D:"38 g/mol"},ans:"B",exp:"Na(23) + O(16) + H(1) = 40 g/mol.",diff:"easy"},
  {yr:2020,topic:"Atomic Structure",q:"The element with electronic configuration 2,8,7 is in group:",opts:{A:"IV",B:"V",C:"VI",D:"VII"},ans:"D",exp:"7 valence electrons = Group VII (halogens). Configuration 2,8,7 has 7 electrons in the outermost shell.",diff:"medium"},
  {yr:2020,topic:"Chemical Bonding",q:"The shape of water molecule (H₂O) is:",opts:{A:"Linear",B:"Tetrahedral",C:"V-shaped/bent",D:"Trigonal planar"},ans:"C",exp:"H₂O has 2 bonding pairs and 2 lone pairs. Lone pairs repel more → V-shaped (bent) with bond angle ~104.5°.",diff:"hard"},
  {yr:2020,topic:"Organic Chemistry",q:"Alkanes undergo which type of reaction preferentially?",opts:{A:"Addition",B:"Substitution",C:"Elimination",D:"Polymerisation"},ans:"B",exp:"Alkanes are saturated — they undergo substitution reactions (e.g., chlorination in UV light). Alkenes undergo addition.",diff:"medium"},
  {yr:2019,topic:"Thermochemistry",q:"An exothermic reaction is one in which heat is:",opts:{A:"Absorbed",B:"Released",C:"Neither absorbed nor released",D:"Stored"},ans:"B",exp:"Exothermic: heat is released (exo = out). Endothermic: heat is absorbed. Combustion is exothermic.",diff:"easy"},
  {yr:2019,topic:"Equilibrium",q:"According to Le Chatelier's principle, increasing pressure in a gaseous equilibrium shifts it towards:",opts:{A:"The side with more moles of gas",B:"The side with fewer moles of gas",C:"The reactants",D:"The products always"},ans:"B",exp:"Increasing pressure favours the side with fewer moles of gas to reduce pressure.",diff:"hard"},
  {yr:2018,topic:"Periodic Table",q:"Which element is a metalloid?",opts:{A:"Sodium",B:"Chlorine",C:"Silicon",D:"Iron"},ans:"C",exp:"Silicon has properties of both metals and non-metals (metalloid). Other metalloids: Germanium, Arsenic, Antimony.",diff:"medium"},
  {yr:2018,topic:"Organic Chemistry",q:"Benzene has the molecular formula:",opts:{A:"C₆H₁₂",B:"C₆H₆",C:"C₆H₁₄",D:"C₄H₆"},ans:"B",exp:"Benzene: C₆H₆ (cyclic structure with alternating double bonds/delocalized electrons). It's the simplest aromatic hydrocarbon.",diff:"easy"},
  {yr:2017,topic:"Stoichiometry",q:"How many moles of H₂O are produced when 2 moles of H₂ react with excess O₂?",opts:{A:"1 mol",B:"2 mol",C:"3 mol",D:"4 mol"},ans:"B",exp:"2H₂ + O₂ → 2H₂O. Mole ratio H₂:H₂O = 2:2 = 1:1. So 2 mol H₂ produces 2 mol H₂O.",diff:"medium"},
  {yr:2016,topic:"Acids & Bases",q:"The pH of a neutral solution at 25°C is:",opts:{A:"0",B:"7",C:"14",D:"10"},ans:"B",exp:"pH 7 = neutral. pH < 7 = acidic. pH > 7 = basic/alkaline. Pure water at 25°C has pH = 7.",diff:"easy"},
  {yr:2015,topic:"Organic Chemistry",q:"What is the degree of unsaturation of ethene?",opts:{A:"0",B:"1",C:"2",D:"3"},ans:"B",exp:"Ethene (C₂H₄) has one C=C double bond = degree of unsaturation of 1. Formula: DoU = (2C+2-H)/2 = (4+2-4)/2 = 1.",diff:"hard"}
,
 {yr:2016,topic:"Organic",q:"Soap production from fat + alkali is called:",opts:{A:"Esterification",B:"Saponification",C:"Hydrogenation",D:"Fermentation"},ans:"B",exp:"Saponification: fat + NaOH → soap + glycerol.",diff:"medium"},
  {yr:2017,topic:"Reactivity",q:"Most reactive metal in reactivity series:",opts:{A:"Gold",B:"Iron",C:"Potassium",D:"Copper"},ans:"C",exp:"Reactivity series (descending): K > Na > Ca > Mg > Al > Zn > Fe > Cu > Ag > Au.",diff:"medium"},
  {yr:2018,topic:"Kinetics",q:"Catalyst increases reaction rate by:",opts:{A:"Increasing temperature",B:"Lowering activation energy",C:"Increasing concentration",D:"Decreasing pressure"},ans:"B",exp:"Catalyst provides alternative pathway with lower activation energy. Not consumed.",diff:"hard"},
  {yr:2019,topic:"Isotopes",q:"Isotopes have same atomic number but different:",opts:{A:"Electrons",B:"Chemical properties",C:"Neutrons (mass number)",D:"Valence electrons"},ans:"C",exp:"Isotopes: same protons, different neutrons → different mass numbers. Same chemical properties.",diff:"medium"},
  {yr:2020,topic:"Organic",q:"Functional group of alcohols:",opts:{A:"-COOH",B:"-OH",C:"-CHO",D:"-NH₂"},ans:"B",exp:"-OH (hydroxyl) group identifies alcohols. -COOH = carboxylic acid. -CHO = aldehyde.",diff:"easy"},
  {yr:2021,topic:"Gas Laws",q:"Volume of 1 mole gas at STP:",opts:{A:"22.4 litres",B:"24 litres",C:"11.2 litres",D:"44.8 litres"},ans:"A",exp:"Molar volume at STP (0°C, 1atm) = 22.4 L/mol.",diff:"medium"},
  {yr:2022,topic:"Electrochemistry",q:"Electrolyte in car lead-acid battery:",opts:{A:"NaCl solution",B:"Dilute H₂SO₄",C:"NaOH solution",D:"Distilled water"},ans:"B",exp:"Lead-acid battery: dilute H₂SO₄ as electrolyte, lead plates as electrodes.",diff:"medium"},
  {yr:2023,topic:"Organic",q:"Gas in LPG cookers:",opts:{A:"Methane only",B:"Ethene",C:"Benzene",D:"Propane/Butane"},ans:"D",exp:"LPG: mainly propane (C₃H₈) and butane (C₄H₁₀).",diff:"easy"},
  {yr:2015,topic:"Acids",q:"Litmus turns ___ in acid:",opts:{A:"Blue",B:"Red",C:"Yellow",D:"Green"},ans:"B",exp:"Litmus: red in acid, blue in alkali. Phenolphthalein: colourless in acid, pink in alkali.",diff:"easy"},
  {yr:2014,topic:"Electrolysis",q:"In electrolysis, the positive electrode is called:",opts:{A:"Cathode",B:"Anode",C:"Electrode",D:"Electrolyte"},ans:"B",exp:"Anode = positive electrode. Cathode = negative electrode. Anions go to anode, cations to cathode.",diff:"easy"},
  {yr:2014,topic:"Organic",q:"Ethanol can be dehydrated to form:",opts:{A:"Methane",B:"Ethene",C:"Ethyne",D:"Propane"},ans:"B",exp:"Dehydration of ethanol (C₂H₅OH) using Al₂O₃ catalyst at 300°C gives ethene (C₂H₄) + H₂O.",diff:"medium"},
  {yr:2013,topic:"Periodic Table",q:"The noble gases are in group:",opts:{A:"I",B:"IV",C:"VI",D:"VIII/0"},ans:"D",exp:"Noble gases (He, Ne, Ar, Kr, Xe, Rn) are in Group VIII or Group 0. They are unreactive due to full outer shells.",diff:"easy"}],
phy: [
  {yr:2023,topic:"Mechanics",q:"A car accelerates from rest to 20 m/s in 5 s. Acceleration is:",opts:{A:"25 m/s²",B:"100 m/s²",C:"4 m/s²",D:"15 m/s²"},ans:"C",exp:"a = (v-u)/t = (20-0)/5 = 4 m/s².",diff:"easy"},
  {yr:2023,topic:"Waves",q:"Which is a longitudinal wave?",opts:{A:"Light",B:"Water waves",C:"Sound",D:"Radio waves"},ans:"C",exp:"Sound waves are longitudinal — particles vibrate parallel to energy transfer direction.",diff:"easy"},
  {yr:2023,topic:"Electricity",q:"Power dissipated in a resistor = ?",opts:{A:"P = V/I",B:"P = V²R",C:"P = I²R",D:"P = R/V²"},ans:"C",exp:"P = I²R or P = V²/R or P = VI. The formula P = I²R is one of three equivalent expressions.",diff:"medium"},
  {yr:2023,topic:"Nuclear Physics",q:"The emission of an alpha particle reduces atomic number by:",opts:{A:"1",B:"2",C:"4",D:"0"},ans:"B",exp:"Alpha particle = ₂⁴He (2 protons, 2 neutrons). Emitting it reduces atomic number by 2 and mass number by 4.",diff:"medium"},
  {yr:2022,topic:"Electricity",q:"Three resistors 2Ω, 3Ω, 6Ω in parallel. Effective resistance:",opts:{A:"11Ω",B:"1Ω",C:"2Ω",D:"3Ω"},ans:"B",exp:"1/R = 1/2 + 1/3 + 1/6 = 3/6+2/6+1/6 = 6/6 = 1. R = 1Ω.",diff:"medium"},
  {yr:2022,topic:"Heat",q:"Heat transfer NOT requiring a medium is:",opts:{A:"Conduction",B:"Convection",C:"Radiation",D:"Evaporation"},ans:"C",exp:"Radiation travels through vacuum (e.g., solar heat). Conduction and convection need matter.",diff:"easy"},
  {yr:2022,topic:"Mechanics",q:"SI unit of work is:",opts:{A:"Watt",B:"Newton",C:"Joule",D:"Pascal"},ans:"C",exp:"Work = Force × Distance = N×m = Joule (J).",diff:"easy"},
  {yr:2022,topic:"Optics",q:"Concave mirror with f=10 cm, object at 30 cm. Image distance:",opts:{A:"15 cm",B:"10 cm",C:"20 cm",D:"30 cm"},ans:"A",exp:"1/f = 1/v + 1/u → 1/10 = 1/v + 1/30 → 1/v = 3/30-1/30 = 2/30. v = 15 cm.",diff:"hard"},
  {yr:2021,topic:"Mechanics",q:"The SI unit of pressure is:",opts:{A:"Newton",B:"Joule",C:"Pascal",D:"Watt"},ans:"C",exp:"Pressure = Force/Area = N/m² = Pascal (Pa). Named after Blaise Pascal.",diff:"easy"},
  {yr:2021,topic:"Electricity",q:"Good conductor of electricity:",opts:{A:"Rubber",B:"Plastic",C:"Copper",D:"Wood"},ans:"C",exp:"Copper has free electrons that carry current. Rubber, plastic, wood are insulators.",diff:"easy"},
  {yr:2021,topic:"Mechanics",q:"Uniform velocity on a v-t graph appears as:",opts:{A:"A curve",B:"Horizontal straight line",C:"Vertical line",D:"Line through origin"},ans:"B",exp:"Uniform velocity = constant speed in one direction = horizontal line on v-t graph.",diff:"medium"},
  {yr:2020,topic:"Nuclear Physics",q:"Which radioactive decay emits an electron from nucleus?",opts:{A:"Alpha decay",B:"Beta decay",C:"Gamma decay",D:"X-ray emission"},ans:"B",exp:"Beta decay emits an electron (β⁻) or positron (β⁺) from nucleus.",diff:"medium"},
  {yr:2020,topic:"Waves",q:"Wave speed = ? (frequency=5 Hz, wavelength=4 m)",opts:{A:"0.8 m/s",B:"1.25 m/s",C:"20 m/s",D:"9 m/s"},ans:"C",exp:"v = fλ = 5 × 4 = 20 m/s.",diff:"easy"},
  {yr:2020,topic:"Heat",q:"The quantity of heat needed to raise 1 kg of substance by 1°C is its:",opts:{A:"Latent heat",B:"Specific heat capacity",C:"Heat capacity",D:"Thermal conductivity"},ans:"B",exp:"Specific heat capacity (c) = heat per unit mass per degree. Q = mcΔT.",diff:"easy"},
  {yr:2019,topic:"Mechanics",q:"Newton's first law states that a body remains at rest or uniform motion unless acted upon by:",opts:{A:"Gravity",B:"Friction",C:"An external force",D:"Inertia"},ans:"C",exp:"Newton's 1st Law (Law of Inertia): no net force = no change in velocity. An external unbalanced force causes acceleration.",diff:"easy"},
  {yr:2019,topic:"Optics",q:"A converging lens forms a real image when the object is:",opts:{A:"Inside the focal length",B:"At the focal point",C:"Beyond the focal length",D:"At infinity only"},ans:"C",exp:"Converging lens: real, inverted image when object is beyond focal point. Virtual, upright image when inside focal point.",diff:"medium"},
  {yr:2018,topic:"Electricity",q:"Ohm's law states that V is proportional to I, assuming constant:",opts:{A:"Power",B:"Temperature",C:"Current",D:"Frequency"},ans:"B",exp:"Ohm's law V=IR holds when temperature is constant. Resistance of most conductors increases with temperature.",diff:"medium"},
  {yr:2018,topic:"Mechanics",q:"A body of mass 2 kg moving at 5 m/s has kinetic energy:",opts:{A:"5 J",B:"10 J",C:"25 J",D:"50 J"},ans:"C",exp:"KE = ½mv² = ½ × 2 × 5² = ½ × 2 × 25 = 25 J.",diff:"easy"},
  {yr:2017,topic:"Waves",q:"In which medium does sound travel fastest?",opts:{A:"Vacuum",B:"Air",C:"Water",D:"Steel"},ans:"D",exp:"Sound speed: steel (~5100 m/s) > water (~1500 m/s) > air (~343 m/s). Sound cannot travel in vacuum.",diff:"medium"},
  {yr:2016,topic:"Nuclear",q:"The half-life of a radioactive substance is the time for:",opts:{A:"All nuclei to decay",B:"Half the nuclei to decay",C:"One nucleus to decay",D:"Activity to double"},ans:"B",exp:"Half-life = time for half of the radioactive nuclei to decay. After 2 half-lives: ¼ remain. After 3: ⅛.",diff:"easy"},
  {yr:2015,topic:"Optics",q:"The critical angle of a medium is the angle of incidence beyond which:",opts:{A:"Refraction occurs",B:"Total internal reflection occurs",C:"The ray is absorbed",D:"Dispersion occurs"},ans:"B",exp:"Total internal reflection occurs when light travels from denser to less dense medium and angle exceeds critical angle.",diff:"medium"}
,
 {yr:2016,topic:"Gravity",q:"Acceleration due to gravity on Earth:",opts:{A:"9.8 m/s²",B:"9.8 m/s",C:"10 m",D:"0.98 m/s²"},ans:"A",exp:"g ≈ 9.8 m/s² ≈ 10 m/s². Acts downward.",diff:"easy"},
  {yr:2017,topic:"Electricity",q:"60W, 240V bulb resistance:",opts:{A:"960 Ω",B:"4 Ω",C:"14400 Ω",D:"0.25 Ω"},ans:"A",exp:"R = V²/P = 240²/60 = 960 Ω.",diff:"hard"},
  {yr:2018,topic:"Circular Motion",q:"Body in uniform circular motion has constant:",opts:{A:"Velocity",B:"Speed",C:"Acceleration",D:"Momentum"},ans:"B",exp:"Speed is constant but velocity direction changes. Therefore centripetal acceleration exists.",diff:"medium"},
  {yr:2019,topic:"Heat",q:"Solid changing directly to gas is:",opts:{A:"Melting",B:"Condensation",C:"Sublimation",D:"Vaporisation"},ans:"C",exp:"Sublimation: iodine, dry ice, camphor. Solid to gas without liquid phase.",diff:"medium"},
  {yr:2020,topic:"Electricity",q:"AC frequency in Nigeria:",opts:{A:"50 Hz",B:"60 Hz",C:"100 Hz",D:"25 Hz"},ans:"A",exp:"Nigeria/UK/Africa/Europe: 50 Hz. USA/Canada: 60 Hz.",diff:"medium"},
  {yr:2021,topic:"Modern Physics",q:"Photoelectric effect explained by:",opts:{A:"Wave theory",B:"Photon/Particle theory",C:"Dual nature",D:"Electromagnetic theory"},ans:"B",exp:"Einstein used photons to explain photoelectric effect. Won 1921 Nobel Prize.",diff:"hard"},
  {yr:2022,topic:"Mechanics",q:"Turning effect of force about a pivot:",opts:{A:"Pressure",B:"Moment/Torque",C:"Work",D:"Power"},ans:"B",exp:"Moment = Force × perpendicular distance. Unit: Nm.",diff:"easy"},
  {yr:2023,topic:"Waves",q:"Wave bending around obstacles:",opts:{A:"Reflection",B:"Refraction",C:"Diffraction",D:"Interference"},ans:"C",exp:"Diffraction: bending around obstacles/openings. Most pronounced when wavelength ≈ obstacle size.",diff:"medium"},
  {yr:2015,topic:"Energy",q:"Gravitational potential energy:",opts:{A:"½mv²",B:"mgh",C:"Fd",D:"½kx²"},ans:"B",exp:"GPE = mgh (mass × gravity × height).",diff:"easy"},
  {yr:2014,topic:"Momentum",q:"Momentum = ?",opts:{A:"Force × time",B:"Mass × velocity",C:"Mass × acceleration",D:"Force × distance"},ans:"B",exp:"Momentum (p) = mv. Unit: kg m/s. Conserved in collisions.",diff:"easy"},
  {yr:2014,topic:"Electricity",q:"The unit of charge is the:",opts:{A:"Ampere",B:"Volt",C:"Coulomb",D:"Ohm"},ans:"C",exp:"Charge unit: Coulomb (C). Current (A) = Charge (C) / Time (s). Voltage unit: Volt.",diff:"easy"},
  {yr:2013,topic:"Optics",q:"Image in a plane mirror is:",opts:{A:"Real and inverted",B:"Virtual and inverted",C:"Virtual and upright",D:"Real and upright"},ans:"C",exp:"Plane mirror: virtual (cannot be projected), upright, same size, laterally inverted.",diff:"easy"}],
eco: [
  {yr:2023,topic:"Demand & Supply",q:"When price falls, quantity demanded usually:",opts:{A:"Falls",B:"Rises",C:"Stays same",D:"Cannot determine"},ans:"B",exp:"Law of Demand: inverse relationship between price and quantity demanded.",diff:"easy"},
  {yr:2023,topic:"National Income",q:"GDP measures the total value of goods and services produced:",opts:{A:"By citizens abroad",B:"Within a country's borders",C:"By nationals anywhere",D:"Exported"},ans:"B",exp:"GDP = within borders. GNP = by nationals wherever they are.",diff:"medium"},
  {yr:2023,topic:"Money",q:"Which is NOT a function of money?",opts:{A:"Medium of exchange",B:"Store of value",C:"Unit of account",D:"Source of production"},ans:"D",exp:"Money's functions: medium of exchange, unit of account, store of value, standard of deferred payment. NOT a factor of production.",diff:"medium"},
  {yr:2022,topic:"Market",q:"A market with only one seller is called:",opts:{A:"Oligopoly",B:"Perfect competition",C:"Monopoly",D:"Duopoly"},ans:"C",exp:"Monopoly = one seller. Oligopoly = few sellers. Perfect competition = many sellers.",diff:"easy"},
  {yr:2022,topic:"Population",q:"Rapid population growth in Nigeria is primarily due to:",opts:{A:"High death rates",B:"High birth rates and falling death rates",C:"Immigration",D:"Improved contraception"},ans:"B",exp:"Nigeria's population growth is driven by high birth rates (cultural factors, religion) combined with falling death rates (improved healthcare).",diff:"medium"},
  {yr:2022,topic:"National Income",q:"GNP = GDP + ?",opts:{A:"Net factor income from abroad",B:"Depreciation",C:"Transfer payments",D:"Government spending"},ans:"A",exp:"GNP = GDP + Net Factor Income from Abroad (income earned by nationals abroad minus income earned by foreigners domestically).",diff:"hard"},
  {yr:2021,topic:"Banking",q:"The CBN controls money supply through:",opts:{A:"Printing currency",B:"Monetary policy",C:"Fiscal policy",D:"Trade policy"},ans:"B",exp:"CBN uses monetary policy tools: interest rates, cash reserve ratios, open market operations.",diff:"medium"},
  {yr:2021,topic:"Agriculture",q:"The major cash crop of Northern Nigeria is:",opts:{A:"Cocoa",B:"Palm oil",C:"Groundnut",D:"Rubber"},ans:"C",exp:"Groundnut is the major cash crop of Northern Nigeria. Cocoa is primarily from Southwestern Nigeria.",diff:"medium"},
  {yr:2021,topic:"Trade",q:"When exports exceed imports, the balance of trade is:",opts:{A:"Unfavourable",B:"Favourable",C:"Balanced",D:"In deficit"},ans:"B",exp:"Favourable balance of trade (trade surplus) = exports > imports. Unfavourable = imports > exports.",diff:"easy"},
  {yr:2020,topic:"Demand",q:"Increase in consumer income shifts demand curve for normal good:",opts:{A:"Left",B:"Right",C:"Along the curve",D:"Becomes vertical"},ans:"B",exp:"For normal goods, higher income → more demand → curve shifts RIGHT. Only price changes cause movement ALONG the curve.",diff:"medium"},
  {yr:2020,topic:"Types of Goods",q:"A good whose demand increases when its price rises is called:",opts:{A:"Inferior good",B:"Giffen good",C:"Normal good",D:"Complementary good"},ans:"B",exp:"Giffen goods: demand rises with price (violates law of demand). Very rare. Example: staple foods when price rises, people can't afford alternatives.",diff:"hard"},
  {yr:2019,topic:"Labour",q:"Unemployment that occurs because workers are between jobs is called:",opts:{A:"Structural unemployment",B:"Cyclical unemployment",C:"Frictional unemployment",D:"Seasonal unemployment"},ans:"C",exp:"Frictional unemployment: temporary gaps between jobs. Structural: skills mismatch. Cyclical: economic downturns. Seasonal: weather-related.",diff:"medium"},
  {yr:2018,topic:"Production",q:"Which factor of production earns rent?",opts:{A:"Labour",B:"Capital",C:"Land",D:"Enterprise"},ans:"C",exp:"Factors of production and their rewards: Land=Rent, Labour=Wages, Capital=Interest, Enterprise=Profit.",diff:"easy"},
  {yr:2017,topic:"Economics",q:"The branch of economics dealing with individual firms and consumers is:",opts:{A:"Macroeconomics",B:"Microeconomics",C:"Development economics",D:"International economics"},ans:"B",exp:"Microeconomics: individual units (firms, consumers). Macroeconomics: economy as a whole (GDP, inflation, unemployment).",diff:"easy"}
,
 {yr:2016,topic:"Utility",q:"Satisfaction from consuming a good:",opts:{A:"Value",B:"Utility",C:"Profit",D:"Revenue"},ans:"B",exp:"Utility = satisfaction or benefit derived from consuming goods/services.",diff:"easy"},
  {yr:2017,topic:"Production",q:"Marginal product eventually decreases when variable factors added to fixed — this is:",opts:{A:"Returns to scale",B:"Law of diminishing returns",C:"Economies of scale",D:"Diseconomies"},ans:"B",exp:"Law of Diminishing Marginal Returns: marginal product falls after a certain point.",diff:"medium"},
  {yr:2018,topic:"Price Control",q:"Price ceiling is set:",opts:{A:"Above equilibrium",B:"Below equilibrium",C:"At equilibrium",D:"Market price"},ans:"B",exp:"Price ceiling (max price): below equilibrium to make goods affordable. Causes shortage.",diff:"hard"},
  {yr:2019,topic:"Trade",q:"Comparative advantage means specialising in goods with:",opts:{A:"Lowest absolute cost",B:"Lowest opportunity cost",C:"Highest output",D:"Most labour"},ans:"B",exp:"Comparative advantage: produce where opportunity cost is lowest even if not absolutely efficient.",diff:"hard"},
  {yr:2020,topic:"Inflation",q:"Inflation from rising production costs:",opts:{A:"Demand-pull",B:"Cost-push",C:"Imported",D:"Hyper"},ans:"B",exp:"Cost-push: rising input costs (wages, materials) push up prices.",diff:"medium"},
  {yr:2022,topic:"Tax",q:"Tax taking higher % from lower income earners:",opts:{A:"Progressive",B:"Proportional",C:"Regressive",D:"Direct"},ans:"C",exp:"Regressive: higher burden on poor. VAT is often considered regressive.",diff:"hard"},
  {yr:2023,topic:"National Income",q:"GNP minus GDP =",opts:{A:"Net factor income from abroad",B:"Depreciation",C:"Government spending",D:"Tax"},ans:"A",exp:"GNP = GDP + Net Factor Income from Abroad.",diff:"medium"},
  {yr:2015,topic:"Banking",q:"The lender of last resort in Nigeria is:",opts:{A:"First Bank",B:"UBA",C:"CBN",D:"World Bank"},ans:"C",exp:"CBN (Central Bank of Nigeria) is the lender of last resort to commercial banks.",diff:"medium"},
  {yr:2014,topic:"Trade",q:"The balance of trade measures:",opts:{A:"Visible imports and exports",B:"All international transactions",C:"Foreign exchange reserves",D:"National income"},ans:"A",exp:"Balance of trade: visible trade only (goods). Balance of payments: all transactions.",diff:"medium"},
  {yr:2013,topic:"Production",q:"Land, Labour, Capital and Entrepreneurship are:",opts:{A:"Factors of production",B:"Economic goals",C:"Market forces",D:"Price determinants"},ans:"A",exp:"The four factors of production (and their rewards): Land=Rent, Labour=Wages, Capital=Interest, Enterprise=Profit.",diff:"easy"}],
gov: [
  {yr:2023,topic:"Political Theory",q:"The principle of separation of powers was propounded by:",opts:{A:"John Locke",B:"Karl Marx",C:"Montesquieu",D:"Rousseau"},ans:"C",exp:"Montesquieu in 'The Spirit of the Laws' (1748) developed separation of powers into executive, legislative, judicial.",diff:"medium"},
  {yr:2023,topic:"Democracy",q:"The system of government where citizens elect representatives is:",opts:{A:"Direct democracy",B:"Representative/Indirect democracy",C:"Autocracy",D:"Oligarchy"},ans:"B",exp:"Representative democracy: citizens elect representatives to govern. Nigeria, UK, USA all practice representative democracy.",diff:"easy"},
  {yr:2022,topic:"Nigerian Constitution",q:"Nigeria's 1999 Constitution came into force on:",opts:{A:"October 1, 1999",B:"May 29, 1999",C:"January 1, 1999",D:"October 1, 1998"},ans:"B",exp:"May 29, 1999 — inauguration of President Obasanjo. Now celebrated as Democracy Day.",diff:"medium"},
  {yr:2022,topic:"Electoral System",q:"Body responsible for elections in Nigeria:",opts:{A:"NEC",B:"INEC",C:"Electoral Court",D:"Federal Election Commission"},ans:"B",exp:"INEC (Independent National Electoral Commission) conducts federal and state elections.",diff:"easy"},
  {yr:2022,topic:"Federalism",q:"Number of states in Nigeria:",opts:{A:"30",B:"36",C:"37",D:"32"},ans:"B",exp:"Nigeria has 36 states + FCT Abuja.",diff:"easy"},
  {yr:2022,topic:"Constitutional Law",q:"The fundamental human rights in the 1999 Constitution are in:",opts:{A:"Chapter 1",B:"Chapter 2",C:"Chapter 4",D:"Chapter 3"},ans:"C",exp:"Fundamental human rights are in Chapter 4 of the 1999 Constitution (Sections 33-46).",diff:"hard"},
  {yr:2021,topic:"Pressure Groups",q:"Trade unions are classified as:",opts:{A:"Promotional pressure groups",B:"Sectional pressure groups",C:"Political parties",D:"NGOs"},ans:"B",exp:"Trade unions are sectional/protective groups — they protect members' interests. Promotional groups promote causes for general benefit.",diff:"hard"},
  {yr:2021,topic:"Legislature",q:"The Nigerian National Assembly consists of:",opts:{A:"Senate only",B:"House of Representatives only",C:"Senate and House of Representatives",D:"Senate, House of Reps and State Assemblies"},ans:"C",exp:"National Assembly = Senate (109 senators) + House of Representatives (360 members). Bicameral legislature.",diff:"easy"},
  {yr:2020,topic:"Executive",q:"The head of government in Nigeria is the:",opts:{A:"Speaker of the House",B:"President of the Senate",C:"President",D:"Chief Justice"},ans:"C",exp:"Nigeria practices presidential system: President is both head of state AND head of government.",diff:"easy"},
  {yr:2020,topic:"Judiciary",q:"The highest court in Nigeria is the:",opts:{A:"Court of Appeal",B:"Federal High Court",C:"Supreme Court",D:"Magistrate Court"},ans:"C",exp:"Supreme Court is the apex court. Below it: Court of Appeal → Federal/State High Courts → Magistrate/Customary Courts.",diff:"easy"},
  {yr:2019,topic:"Political Parties",q:"The first political party in Nigeria was:",opts:{A:"NCNC",B:"NNDP",C:"NPC",D:"AG"},ans:"B",exp:"NNDP (Nigerian National Democratic Party) was formed by Herbert Macaulay in 1923 — Nigeria's first political party.",diff:"hard"},
  {yr:2018,topic:"Constitutional Development",q:"Nigeria became a Federal Republic in:",opts:{A:"1960",B:"1963",C:"1966",D:"1979"},ans:"B",exp:"Nigeria became a Republic on October 1, 1963 with Nnamdi Azikiwe as first President.",diff:"medium"},
  {yr:2017,topic:"Citizenship",q:"A person acquires citizenship by birth when born to:",opts:{A:"Any parents in Nigeria",B:"At least one Nigerian parent",C:"Foreign parents in Nigeria",D:"Nigerian parents abroad only"},ans:"B",exp:"By birth (jus soli and jus sanguinis): born in Nigeria OR at least one parent is Nigerian.",diff:"medium"}
,
 {yr:2016,topic:"Constitution",q:"Constitution requiring special amendment procedure is:",opts:{A:"Flexible",B:"Rigid",C:"Written",D:"Unwritten"},ans:"B",exp:"Rigid: special procedure to amend (Nigeria, USA). UK constitution is flexible/uncodified.",diff:"medium"},
  {yr:2017,topic:"Judiciary",q:"Power of courts to declare laws unconstitutional:",opts:{A:"Judicial activism",B:"Judicial review",C:"Judicial immunity",D:"Precedent"},ans:"B",exp:"Judicial review: courts can nullify unconstitutional executive/legislative actions.",diff:"medium"},
  {yr:2018,topic:"Pan-Africanism",q:"First Pan-African Conference held in:",opts:{A:"1900",B:"1920",C:"1945",D:"1963"},ans:"A",exp:"London 1900. Organised by Henry Sylvester Williams and W.E.B. Du Bois.",diff:"hard"},
  {yr:2019,topic:"Executive",q:"Federal Executive Council is chaired by:",opts:{A:"Senate President",B:"Speaker",C:"President",D:"Chief Justice"},ans:"C",exp:"FEC (Cabinet) = President and ministers. President chairs it.",diff:"easy"},
  {yr:2020,topic:"Voting",q:"Right to vote is called:",opts:{A:"Mandate",B:"Franchise/Suffrage",C:"Sovereignty",D:"Legitimacy"},ans:"B",exp:"Franchise/suffrage = right to vote. Universal suffrage = all adults can vote.",diff:"easy"},
  {yr:2022,topic:"Legislation",q:"Bill becomes law when President:",opts:{A:"Presents to Senate",B:"Signs it or 30 days elapse without action",C:"Sends to Supreme Court",D:"Calls referendum"},ans:"B",exp:"President signs, or 30 days pass, or veto overridden by 2/3 National Assembly majority.",diff:"hard"},
  {yr:2015,topic:"Confederation",q:"In a confederation, sovereignty lies with:",opts:{A:"Central government",B:"State/regional governments",C:"Both equally",D:"The courts"},ans:"B",exp:"Confederation: member states retain sovereignty; central body has limited delegated powers.",diff:"hard"},
  {yr:2014,topic:"Democracy",q:"A government that is accountable to the electorate is:",opts:{A:"Democratic",B:"Autocratic",C:"Oligarchic",D:"Theocratic"},ans:"A",exp:"Democracy: government is accountable, responsive and representative of the people.",diff:"easy"},
  {yr:2013,topic:"State",q:"The four elements of a state are population, territory, government and:",opts:{A:"Military",B:"Sovereignty",C:"Constitution",D:"Wealth"},ans:"B",exp:"State = Population + Territory + Government + Sovereignty. Sovereignty = supreme authority.",diff:"medium"}],
geo: [
  {yr:2023,topic:"Physical Geography",q:"Rock formed from cooled molten magma is:",opts:{A:"Sedimentary",B:"Metamorphic",C:"Igneous",D:"Limestone"},ans:"C",exp:"Igneous rocks form when magma cools. Intrusive (e.g., granite): cool slowly underground. Extrusive (e.g., basalt): cool quickly at surface.",diff:"easy"},
  {yr:2023,topic:"Climatology",q:"The dry, dusty wind from Sahara across Nigeria is:",opts:{A:"Trade wind",B:"Harmattan",C:"Monsoon",D:"Sirocco"},ans:"B",exp:"The Harmattan blows northeast from Sahara from November to March. Known for dust haze and dry conditions.",diff:"easy"},
  {yr:2023,topic:"Agriculture",q:"The most suitable soil for crop production is:",opts:{A:"Sandy soil",B:"Clay soil",C:"Loamy soil",D:"Silt soil"},ans:"C",exp:"Loamy soil = balanced sand, silt, clay. Retains moisture and nutrients while allowing drainage. Best for most crops.",diff:"easy"},
  {yr:2022,topic:"Population",q:"Most densely populated area in Nigeria:",opts:{A:"Borno State",B:"Plateau State",C:"Lagos State",D:"Kano State"},ans:"C",exp:"Lagos State has highest population density ~7,000/km² due to urban migration and commerce.",diff:"medium"},
  {yr:2022,topic:"Agriculture",q:"Growing two or more crops simultaneously on same land:",opts:{A:"Crop rotation",B:"Mixed cropping",C:"Monoculture",D:"Intercropping"},ans:"D",exp:"Intercropping = different crops grown simultaneously in defined rows. Mixed cropping = different crops without defined rows.",diff:"medium"},
  {yr:2021,topic:"Physical Geography",q:"The highest mountain in Nigeria is:",opts:{A:"Aso Rock",B:"Mandara Mountains",C:"Chappal Waddi",D:"Jos Plateau"},ans:"C",exp:"Chappal Waddi (2,419m) in Taraba State is Nigeria's highest peak. Also called the 'Roof of Nigeria'.",diff:"hard"},
  {yr:2021,topic:"Rivers",q:"The River Niger enters Nigeria from:",opts:{A:"Cameroon",B:"Benin Republic",C:"Niger Republic",D:"Burkina Faso"},ans:"C",exp:"River Niger enters Nigeria from Niger Republic in the northwest. It flows southeast before turning south to the Delta.",diff:"medium"},
  {yr:2020,topic:"Agriculture",q:"Cultivation of crops and rearing of animals for sale is:",opts:{A:"Subsistence farming",B:"Commercial farming",C:"Mixed farming",D:"Shifting cultivation"},ans:"B",exp:"Commercial farming = for profit/market. Subsistence = for personal/family consumption.",diff:"easy"},
  {yr:2020,topic:"Physical",q:"The process by which rocks break down in situ is called:",opts:{A:"Erosion",B:"Weathering",C:"Deposition",D:"Transportation"},ans:"B",exp:"Weathering = breakdown of rocks in place (no movement). Erosion = wearing away AND transportation of material.",diff:"medium"},
  {yr:2019,topic:"Climate",q:"The climate zone in Nigeria with both dry and wet seasons is:",opts:{A:"Tropical rainforest",B:"Mediterranean",C:"Savanna",D:"Desert"},ans:"C",exp:"Savanna climate has distinct wet and dry seasons. Tropical rainforest has rain throughout. Desert has very little rain.",diff:"easy"},
  {yr:2018,topic:"Physical",q:"The largest lake in West Africa is:",opts:{A:"Lake Victoria",B:"Lake Chad",C:"Lake Volta",D:"Lake Tanganyika"},ans:"B",exp:"Lake Chad borders Nigeria, Niger, Chad and Cameroon. It is the largest lake in West Africa.",diff:"medium"},
  {yr:2017,topic:"Industry",q:"Nigeria's major foreign exchange earner is:",opts:{A:"Agriculture",B:"Solid minerals",C:"Petroleum/crude oil",D:"Tourism"},ans:"C",exp:"Crude oil accounts for over 80% of Nigeria's foreign exchange earnings. Nigeria is Africa's largest oil producer.",diff:"easy"}
,
 {yr:2016,topic:"Location",q:"Line of latitude passing through Nigeria:",opts:{A:"Tropic of Cancer",B:"Equator",C:"Tropic of Capricorn",D:"Arctic Circle"},ans:"B",exp:"Equator (0°) passes through southern Nigeria. Nigeria: approx 4°N-14°N.",diff:"medium"},
  {yr:2017,topic:"Rivers",q:"Largest river in Nigeria:",opts:{A:"River Benue",B:"River Niger",C:"River Kaduna",D:"River Cross"},ans:"B",exp:"River Niger: longest in Nigeria and West Africa. Benue is its major tributary at Lokoja.",diff:"easy"},
  {yr:2018,topic:"Cities",q:"Commercial capital of Nigeria:",opts:{A:"Abuja",B:"Kano",C:"Lagos",D:"Port Harcourt"},ans:"C",exp:"Lagos: commercial capital. Abuja: political/admin capital since 1991.",diff:"easy"},
  {yr:2019,topic:"Climate",q:"Nigeria receives most rainfall during:",opts:{A:"Harmattan season",B:"Rainy season",C:"Dry season",D:"Winter"},ans:"B",exp:"Rainy season: April-Oct (south), June-Sep (north). Southwest monsoon brings rain.",diff:"easy"},
  {yr:2021,topic:"Ethnicity",q:"Largest ethnic group in Nigeria:",opts:{A:"Igbo",B:"Yoruba",C:"Hausa-Fulani",D:"Ijaw"},ans:"C",exp:"Hausa-Fulani is largest. Three majors: Hausa-Fulani, Yoruba, Igbo.",diff:"medium"},
  {yr:2022,topic:"Farming",q:"Main food crops of southern Nigeria:",opts:{A:"Millet and sorghum",B:"Wheat and barley",C:"Cassava and yam",D:"Rice only"},ans:"C",exp:"South: cassava and yam. North: millet, sorghum.",diff:"easy"},
  {yr:2015,topic:"Minerals",q:"Nigeria's most important mineral resource:",opts:{A:"Tin",B:"Coal",C:"Crude oil (petroleum)",D:"Iron ore"},ans:"C",exp:"Crude oil: over 80% of government revenue. Nigeria is Africa's largest oil producer.",diff:"easy"},
  {yr:2014,topic:"Geography",q:"The Sahara Desert is located in:",opts:{A:"Southern Africa",B:"East Africa",C:"North Africa",D:"West Africa only"},ans:"C",exp:"Sahara: North Africa, stretching from Atlantic to Red Sea. World's largest hot desert.",diff:"easy"},
  {yr:2013,topic:"Population",q:"The process by which people move from rural to urban areas:",opts:{A:"Emigration",B:"Rural-urban migration",C:"Transhumance",D:"Nomadism"},ans:"B",exp:"Rural-urban migration: movement from villages to cities for jobs/better life. Major trend in Nigeria.",diff:"easy"}],
lit: [
  {yr:2023,topic:"Literary Devices",q:"Repetition of consonant sounds at start of words is:",opts:{A:"Assonance",B:"Alliteration",C:"Onomatopoeia",D:"Personification"},ans:"B",exp:"Alliteration: initial consonant repetition ('Peter Piper picked'). Assonance = vowel sound repetition.",diff:"easy"},
  {yr:2023,topic:"Drama",q:"A speech delivered alone on stage is a:",opts:{A:"Monologue",B:"Soliloquy",C:"Aside",D:"Dialogue"},ans:"B",exp:"Soliloquy = character alone on stage, reveals inner thoughts. Aside = character speaks to audience but not other characters. Monologue = extended speech.",diff:"medium"},
  {yr:2022,topic:"Poetry",q:"A mournful poem written for the dead is an:",opts:{A:"Ode",B:"Sonnet",C:"Elegy",D:"Ballad"},ans:"C",exp:"Elegy: poem mourning the dead. Ode: lyric poem of praise. Sonnet: 14 lines. Ballad: narrative song.",diff:"medium"},
  {yr:2022,topic:"Drama",q:"The highest point of tension in a play is the:",opts:{A:"Denouement",B:"Climax",C:"Exposition",D:"Resolution"},ans:"B",exp:"Climax = turning point of highest tension. Exposition introduces story. Denouement is final resolution.",diff:"easy"},
  {yr:2021,topic:"Prose",q:"Third person narrator knowing all characters' thoughts is:",opts:{A:"First person",B:"Second person",C:"Third person omniscient",D:"Third person limited"},ans:"C",exp:"Omniscient = all-knowing narrator. 'Omniscient' means all-knowing. Can access any character's mind.",diff:"medium"},
  {yr:2021,topic:"Literary Devices",q:"A comparison using 'like' or 'as' is a:",opts:{A:"Metaphor",B:"Simile",C:"Personification",D:"Hyperbole"},ans:"B",exp:"Simile uses 'like' or 'as'. Metaphor is a direct comparison without these words.",diff:"easy"},
  {yr:2020,topic:"Poetry",q:"A poem of 14 lines is a:",opts:{A:"Ballad",B:"Ode",C:"Sonnet",D:"Elegy"},ans:"C",exp:"Sonnet = exactly 14 lines. Petrarchan (Italian): 8+6 lines. Shakespearean: 3×4 + couplet.",diff:"easy"},
  {yr:2020,topic:"Drama",q:"The period when the audience knows something characters don't is:",opts:{A:"Tragic flaw",B:"Dramatic irony",C:"Soliloquy",D:"Catharsis"},ans:"B",exp:"Dramatic irony: audience has more information than the characters. Creates tension and suspense.",diff:"medium"},
  {yr:2019,topic:"Prose",q:"A novel told entirely through letters is called:",opts:{A:"Picaresque novel",B:"Gothic novel",C:"Epistolary novel",D:"Bildungsroman"},ans:"C",exp:"Epistolary novel = told through letters, diary entries, or documents. 'Epistola' means letter in Latin.",diff:"hard"},
  {yr:2018,topic:"Poetry",q:"WAEC poetry analysis focuses on: imagery, theme, structure and:",opts:{A:"Length",B:"Rhyme scheme",C:"The poet's biography",D:"Publication date"},ans:"B",exp:"WAEC poetry analysis: content/theme, language/imagery, tone/mood, structure, and rhyme scheme.",diff:"medium"}
,
 {yr:2016,topic:"Drama",q:"A speech delivered alone on stage:",opts:{A:"Monologue",B:"Soliloquy",C:"Aside",D:"Dialogue"},ans:"B",exp:"Soliloquy: alone on stage, reveals inner thoughts. Aside: to audience only. Monologue: extended speech to others.",diff:"medium"},
  {yr:2017,topic:"Poetry",q:"Repetition of vowel sounds in words:",opts:{A:"Alliteration",B:"Assonance",C:"Consonance",D:"Onomatopoeia"},ans:"B",exp:"Assonance: vowel sound repetition (e.g., 'the rain in Spain'). Alliteration: initial consonant repetition.",diff:"medium"},
  {yr:2018,topic:"Prose",q:"The narrator of 'Things Fall Apart' is:",opts:{A:"First person",B:"Second person",C:"Third person omniscient",D:"Third person limited"},ans:"C",exp:"Achebe uses third person omniscient narrator who knows all characters' thoughts.",diff:"medium"},
  {yr:2019,topic:"Drama",q:"Aristotle's six elements of tragedy include plot, character, thought, diction, music and:",opts:{A:"Catharsis",B:"Spectacle",C:"Hubris",D:"Nemesis"},ans:"B",exp:"Aristotle's six elements (Poetics): Plot, Character, Thought, Diction, Music, Spectacle.",diff:"hard"},
  {yr:2020,topic:"Literary Devices",q:"Endowing inanimate objects with human feelings is:",opts:{A:"Simile",B:"Metaphor",C:"Personification",D:"Pathetic fallacy"},ans:"D",exp:"Pathetic fallacy: attributing human emotions to nature/inanimate things (e.g., angry storm).",diff:"hard"},
  {yr:2021,topic:"Poetry",q:"A poem with a regular rhyme scheme and meter:",opts:{A:"Free verse",B:"Prose poem",C:"Formal verse",D:"Blank verse"},ans:"C",exp:"Formal/traditional verse: regular rhyme and meter. Free verse: no fixed rhyme/meter. Blank verse: unrhymed iambic pentameter.",diff:"medium"},
  {yr:2022,topic:"Prose",q:"Wole Soyinka is famous for:",opts:{A:"Poetry only",B:"Prose novels",C:"Drama and poetry",D:"Short stories"},ans:"C",exp:"Wole Soyinka: Nobel laureate known for plays (Death and the King's Horseman) and poetry.",diff:"medium"},
  {yr:2023,topic:"Drama",q:"The resolution of a play is called the:",opts:{A:"Climax",B:"Denouement",C:"Exposition",D:"Rising action"},ans:"B",exp:"Denouement: final resolution after climax. French for 'untying of the knot'.",diff:"medium"},
  {yr:2015,topic:"Poetry",q:"A poem without rhyme or regular meter:",opts:{A:"Sonnet",B:"Ballad",C:"Free verse",D:"Haiku"},ans:"C",exp:"Free verse: no fixed rhyme scheme or meter. Used extensively in modern poetry.",diff:"easy"},
  {yr:2014,topic:"Literary Devices",q:"Exaggeration for effect is:",opts:{A:"Simile",B:"Metaphor",C:"Hyperbole",D:"Litotes"},ans:"C",exp:"Hyperbole: deliberate exaggeration ('I've told you a million times'). Litotes: understatement.",diff:"easy"}],
agr: [
  {yr:2023,topic:"Soil",q:"Most suitable soil for crop production:",opts:{A:"Sandy",B:"Clay",C:"Loamy",D:"Silt"},ans:"C",exp:"Loamy soil has ideal proportions of sand, silt, clay. Retains moisture and nutrients, drains well.",diff:"easy"},
  {yr:2023,topic:"Pest Control",q:"The safest method of pest control is:",opts:{A:"Chemical pesticides",B:"Biological control",C:"Burning",D:"Flooding"},ans:"B",exp:"Biological control uses natural predators, parasites or pathogens. Environmentally safer than chemical pesticides.",diff:"medium"},
  {yr:2022,topic:"Crops",q:"The major cash crop of Western Nigeria is:",opts:{A:"Cotton",B:"Groundnut",C:"Cocoa",D:"Rubber"},ans:"C",exp:"Cocoa is the major cash crop of Southwestern Nigeria. Groundnut = North. Palm oil = South-South/Southeast.",diff:"easy"},
  {yr:2022,topic:"Livestock",q:"The gestation period of a cow is approximately:",opts:{A:"6 months",B:"9 months",C:"12 months",D:"3 months"},ans:"B",exp:"Cow (cattle): ~9 months (280 days). Human: 9 months. Sheep: ~5 months. Dog: ~2 months.",diff:"medium"},
  {yr:2021,topic:"Soil",q:"The practice of growing different crops in the same field in successive seasons is:",opts:{A:"Mixed cropping",B:"Monoculture",C:"Crop rotation",D:"Intercropping"},ans:"C",exp:"Crop rotation: growing different crops in sequence to prevent soil nutrient depletion and reduce pest buildup.",diff:"easy"},
  {yr:2021,topic:"Farm Machinery",q:"Instrument to measure soil moisture content is a:",opts:{A:"Barometer",B:"Soil tensiometer",C:"Thermometer",D:"Hygrometer"},ans:"B",exp:"Soil tensiometer measures soil moisture tension/content. Barometer: air pressure. Hygrometer: humidity.",diff:"medium"},
  {yr:2020,topic:"Crops",q:"The process of making a plant grow from a part of another plant is:",opts:{A:"Germination",B:"Vegetative propagation",C:"Fertilisation",D:"Pollination"},ans:"B",exp:"Vegetative propagation: growing new plants from stems, roots, leaves, or bulbs. Used for bananas, cassava, yam.",diff:"easy"},
  {yr:2019,topic:"Livestock",q:"Which of the following is a ruminant animal?",opts:{A:"Pig",B:"Rabbit",C:"Goat",D:"Dog"},ans:"C",exp:"Ruminants have a four-chambered stomach and chew cud: cattle, sheep, goats. Pigs, rabbits, dogs are monogastric.",diff:"easy"},
  {yr:2018,topic:"Soil",q:"Nitrogen fixation in the soil is carried out by:",opts:{A:"Nitrosomonas",B:"Rhizobium",C:"Pseudomonas",D:"Clostridium"},ans:"B",exp:"Rhizobium in legume root nodules fixes atmospheric N₂ into NH₃. Nitrosomonas converts NH₃ to nitrites.",diff:"hard"},
  {yr:2017,topic:"Fishery",q:"The method of fish preservation using salt is called:",opts:{A:"Canning",B:"Smoking",C:"Salting/Curing",D:"Drying"},ans:"C",exp:"Salting/curing uses salt to draw out moisture and prevent bacterial growth. Smoking uses heat and smoke. All are preservation methods.",diff:"easy"}
,
 {yr:2016,topic:"Farming",q:"Growing food only for family consumption:",opts:{A:"Commercial farming",B:"Subsistence farming",C:"Mixed farming",D:"Plantation"},ans:"B",exp:"Subsistence farming: for personal/family use. Commercial farming: for profit/market.",diff:"easy"},
  {yr:2017,topic:"Soil",q:"Soil organic matter comes from:",opts:{A:"Clay minerals",B:"Decomposed plant and animal matter",C:"Sand particles",D:"Rock weathering"},ans:"B",exp:"Humus (organic matter) = decomposed plant/animal materials. Improves soil fertility and structure.",diff:"easy"},
  {yr:2018,topic:"Pest",q:"Insect pests can be controlled using:",opts:{A:"Fungicides",B:"Herbicides",C:"Insecticides",D:"Bactericides"},ans:"C",exp:"Insecticides: kill insects. Fungicides: kill fungi. Herbicides: kill weeds. Bactericides: kill bacteria.",diff:"easy"},
  {yr:2019,topic:"Livestock",q:"Female cattle is called a:",opts:{A:"Heifer (before calving) or cow",B:"Bull",C:"Steer",D:"Calf"},ans:"A",exp:"Cow: adult female. Heifer: young female before first calf. Bull: adult male. Steer: castrated male.",diff:"easy"},
  {yr:2020,topic:"Crops",q:"The crop from which palm oil is extracted is:",opts:{A:"Groundnut",B:"Soybean",C:"Oil palm",D:"Coconut"},ans:"C",exp:"Palm oil: extracted from the mesocarp of oil palm fruit (Elaeis guineensis). Major crop in southern Nigeria.",diff:"easy"},
  {yr:2021,topic:"Soil",q:"The practice of leaving land uncultivated for a period to regain fertility:",opts:{A:"Crop rotation",B:"Cover cropping",C:"Fallowing",D:"Mulching"},ans:"C",exp:"Fallowing: leaving soil uncultivated to restore natural fertility and organic matter.",diff:"easy"},
  {yr:2022,topic:"Animal Science",q:"Poultry refers to:",opts:{A:"Cattle, sheep and goats",B:"Domestic birds raised for meat and eggs",C:"All farm animals",D:"Aquatic animals"},ans:"B",exp:"Poultry: domesticated birds (chicken, turkey, duck, guinea fowl). Raised for meat, eggs, feathers.",diff:"easy"},
  {yr:2023,topic:"Nutrition",q:"Fertilizer providing Nitrogen, Phosphorus and Potassium is called:",opts:{A:"Organic fertilizer",B:"NPK fertilizer",C:"Lime",D:"Manure"},ans:"B",exp:"NPK fertilizer: contains Nitrogen (plant growth), Phosphorus (roots), Potassium (fruiting).",diff:"easy"},
  {yr:2015,topic:"Irrigation",q:"Irrigation is important in agriculture because it:",opts:{A:"Adds fertilizer",B:"Supplies water during dry season",C:"Removes pests",D:"Prevents erosion"},ans:"B",exp:"Irrigation: artificial supply of water to crops. Essential in dry season/arid regions.",diff:"easy"},
  {yr:2014,topic:"Farm Records",q:"The document showing income and expenditure of a farm is:",opts:{A:"Inventory",B:"Farm diary",C:"Farm account/budget",D:"Field record"},ans:"C",exp:"Farm accounts show income (sales) and expenditure (inputs). Essential for profitable farm management.",diff:"medium"}],
acc: [
  {yr:2023,topic:"Concepts",q:"Recording assets at original purchase price is the:",opts:{A:"Going concern concept",B:"Historical cost concept",C:"Matching concept",D:"Prudence concept"},ans:"B",exp:"Historical cost concept: assets recorded at original cost, not current market value.",diff:"medium"},
  {yr:2023,topic:"Final Accounts",q:"Gross profit = ?",opts:{A:"Net sales - Cost of goods sold",B:"Net sales - All expenses",C:"Sales - Purchases",D:"Revenue - Operating expenses"},ans:"A",exp:"Gross Profit = Net Sales - COGS. Net profit further deducts operating expenses.",diff:"easy"},
  {yr:2022,topic:"Bank Reconciliation",q:"Outstanding cheques appear in bank reconciliation because:",opts:{A:"Bank hasn't processed them yet",B:"They were already paid",C:"They were cancelled",D:"Bank charged double"},ans:"A",exp:"Outstanding (unpresented) cheques: recorded in cash book but not yet cleared by bank.",diff:"medium"},
  {yr:2022,topic:"Trial Balance",q:"Difference in trial balance indicates:",opts:{A:"A profit",B:"An error in posting",C:"A surplus",D:"A loss"},ans:"B",exp:"Trial balance MUST balance. A difference means an error exists. It does NOT show profit/loss.",diff:"medium"},
  {yr:2021,topic:"Depreciation",q:"Depreciation that applies equal amounts each year is:",opts:{A:"Diminishing balance",B:"Straight line",C:"Sum of digits",D:"Revaluation"},ans:"B",exp:"Straight-line method: equal depreciation each year. Diminishing balance: fixed % on reducing book value.",diff:"easy"},
  {yr:2020,topic:"Books of Account",q:"The book that records credit purchases is the:",opts:{A:"Cash book",B:"Purchases journal",C:"Sales journal",D:"General ledger"},ans:"B",exp:"Purchases journal (purchases day book): records all credit purchases. Cash purchases go to cash book.",diff:"easy"},
  {yr:2019,topic:"Concepts",q:"The concept requiring businesses to record all income and expense in the period they arise is:",opts:{A:"Going concern",B:"Historical cost",C:"Accrual",D:"Materiality"},ans:"C",exp:"Accrual concept: record revenue when earned and expenses when incurred, regardless of cash movement.",diff:"medium"},
  {yr:2018,topic:"Balance Sheet",q:"Current liabilities are debts due within:",opts:{A:"5 years",B:"One year",C:"10 years",D:"3 years"},ans:"B",exp:"Current liabilities: due within 12 months (creditors, bank overdraft, accruals). Long-term: due after one year.",diff:"easy"}
,
 {yr:2016,topic:"Ledger",q:"Transferring journal entries to ledger:",opts:{A:"Journalising",B:"Posting",C:"Balancing",D:"Casting"},ans:"B",exp:"Posting: transferring from journal to individual ledger accounts.",diff:"easy"},
  {yr:2017,topic:"Assets",q:"Goodwill is:",opts:{A:"Current asset",B:"Intangible non-current asset",C:"Liability",D:"Revenue"},ans:"B",exp:"Goodwill: intangible non-current asset (reputation, brand value).",diff:"medium"},
  {yr:2018,topic:"Inventory",q:"FIFO during inflation results in:",opts:{A:"Higher profit, higher closing stock value",B:"Lower profit",C:"No effect",D:"Lower profit, higher stock value"},ans:"A",exp:"FIFO in inflation: cheap old stock leaves first → lower COGS → higher profit. Expensive recent stock remains.",diff:"hard"},
  {yr:2019,topic:"Ratios",q:"Current ratio 2:1 means:",opts:{A:"Insolvent",B:"Can pay current debts twice over",C:"No debts",D:"Making profit"},ans:"B",exp:"₦2 current assets for every ₦1 current liability. Good liquidity.",diff:"medium"},
  {yr:2020,topic:"Partnership",q:"Partnership deed covers:",opts:{A:"Share capital",B:"Profit sharing, duties, capital",C:"Company registration",D:"Stock market listing"},ans:"B",exp:"Partnership deed: profit sharing ratio, capital contributions, duties, dissolution terms.",diff:"easy"},
  {yr:2021,topic:"Concepts",q:"Concept requiring provision for foreseeable losses:",opts:{A:"Accruals",B:"Prudence",C:"Going concern",D:"Consistency"},ans:"B",exp:"Prudence/Conservatism: anticipate losses, don't anticipate profits.",diff:"medium"},
  {yr:2022,topic:"Bank Rec",q:"When bank balance > cash book balance, it may be due to:",opts:{A:"Unpresented cheques",B:"Outstanding deposits",C:"Bank interest credited",D:"Dishonoured cheques"},ans:"C",exp:"Bank interest credited: bank added interest to your account but not yet recorded in cash book.",diff:"hard"},
  {yr:2023,topic:"Final Accounts",q:"Net profit = Gross profit minus:",opts:{A:"Cost of goods sold",B:"All operating expenses",C:"Purchases",D:"Sales revenue"},ans:"B",exp:"Net profit = Gross profit - all operating expenses (rent, salaries, utilities, etc.).",diff:"easy"},
  {yr:2015,topic:"Concepts",q:"The convention assuming the business will continue operating indefinitely:",opts:{A:"Prudence",B:"Accruals",C:"Going concern",D:"Historical cost"},ans:"C",exp:"Going concern: business is assumed to continue operating. Affects asset valuation methods.",diff:"medium"},
  {yr:2014,topic:"Trading Account",q:"Carriage inwards is charged to:",opts:{A:"Profit and loss account",B:"Trading account",C:"Balance sheet",D:"Capital account"},ans:"B",exp:"Carriage inwards (cost of bringing goods): added to purchases in Trading Account. Carriage outwards: P&L.",diff:"hard"}],
his: [
  {yr:2023,topic:"Independence",q:"Nigeria gained independence on:",opts:{A:"October 1, 1960",B:"January 1, 1960",C:"October 1, 1963",D:"May 29, 1999"},ans:"A",exp:"October 1, 1960 — Nigeria's independence from Britain. Republic: October 1, 1963.",diff:"easy"},
  {yr:2022,topic:"Pre-Colonial",q:"The Benin Kingdom was renowned for:",opts:{A:"Textile weaving",B:"Bronze casting",C:"Iron smelting",D:"Gold mining"},ans:"B",exp:"Benin bronzes are world-famous artworks, many now held in international museums.",diff:"medium"},
  {yr:2022,topic:"Colonial History",q:"Nigeria was amalgamated in:",opts:{A:"1900",B:"1906",C:"1914",D:"1922"},ans:"C",exp:"Amalgamation: January 1, 1914 by Lord Lugard, merging Northern and Southern Protectorates.",diff:"medium"},
  {yr:2021,topic:"Nationalism",q:"The first Nigerian to be elected to the Legislative Council (1923) was:",opts:{A:"Nnamdi Azikiwe",B:"Herbert Macaulay",C:"Obafemi Awolowo",D:"Ahmadu Bello"},ans:"B",exp:"Herbert Macaulay won the 1923 election. He is often called the 'Father of Nigerian Nationalism'.",diff:"hard"},
  {yr:2020,topic:"Military Rule",q:"Nigeria's first military coup occurred in:",opts:{A:"1966",B:"1975",C:"1983",D:"1993"},ans:"A",exp:"January 15, 1966 — first military coup led by Major Kaduna Nzeogwu. Changed Nigeria's political history.",diff:"medium"},
  {yr:2019,topic:"Pre-Colonial",q:"The Sokoto Caliphate was founded by:",opts:{A:"Usman dan Fodio",B:"Sultan Bello",C:"Tafawa Balewa",D:"Ahmadu Bello"},ans:"A",exp:"Usman dan Fodio founded the Sokoto Caliphate in 1804 through the Fulani Jihad. His son Mohammed Bello became first Sultan.",diff:"medium"}
,
 {yr:2016,topic:"Colonial",q:"Indirect Rule in Nigeria implemented by:",opts:{A:"Lord Lugard",B:"Captain Glover",C:"Consul Johnston",D:"Goldie"},ans:"A",exp:"Lugard used existing emirs/chiefs to govern. More cost-effective than direct rule.",diff:"medium"},
  {yr:2017,topic:"Nationalism",q:"NCNC founded by:",opts:{A:"Awolowo",B:"Nnamdi Azikiwe",C:"Ahmadu Bello",D:"Ikoli"},ans:"B",exp:"NCNC (1944) founded by Zik. First truly national political party in Nigeria.",diff:"medium"},
  {yr:2018,topic:"Republic",q:"First President of Republic of Nigeria:",opts:{A:"Tafawa Balewa",B:"Nnamdi Azikiwe",C:"Obafemi Awolowo",D:"Ahmadu Bello"},ans:"B",exp:"Azikiwe: first ceremonial President (1963). Balewa: Prime Minister (executive head).",diff:"medium"},
  {yr:2019,topic:"Jihad",q:"Sokoto Caliphate founded through:",opts:{A:"Democratic election",B:"Islamic Jihad by Usman dan Fodio",C:"Colonial appointment",D:"Trade treaty"},ans:"B",exp:"1804 Jihad by Usman dan Fodio overthrew Hausa rulers. Established the Caliphate.",diff:"easy"},
  {yr:2020,topic:"Civil War",q:"Nigerian Civil War:",opts:{A:"1966-1970",B:"1967-1970",C:"1966-1969",D:"1968-1972"},ans:"B",exp:"July 1967 to January 1970. Biafra secession attempt.",diff:"medium"},
  {yr:2021,topic:"OAU",q:"OAU founded in:",opts:{A:"1960",B:"1963",C:"1965",D:"1970"},ans:"B",exp:"May 25, 1963, Addis Ababa. Became African Union 2002.",diff:"medium"},
  {yr:2022,topic:"Colonial",q:"The Berlin Conference (1884-85) was about:",opts:{A:"World War I peace",B:"Division of Africa among Europeans",C:"African independence",D:"Trade routes"},ans:"B",exp:"Berlin Conference: European powers divided Africa among themselves. Nigeria given to Britain.",diff:"medium"},
  {yr:2023,topic:"Independence",q:"First Prime Minister of Nigeria:",opts:{A:"Nnamdi Azikiwe",B:"Obafemi Awolowo",C:"Tafawa Balewa",D:"Ahmadu Bello"},ans:"C",exp:"Alhaji Sir Tafawa Balewa: Nigeria's only Prime Minister (1957-1966).",diff:"easy"},
  {yr:2015,topic:"Trade",q:"The Atlantic slave trade primarily affected West Africa from approximately:",opts:{A:"1400-1600",B:"1500-1800",C:"1600-1900",D:"1700-1900"},ans:"B",exp:"Atlantic slave trade: roughly 1500-1800. Millions of Africans transported to Americas.",diff:"medium"},
  {yr:2014,topic:"Empires",q:"The Oyo Empire was a major power in:",opts:{A:"Northern Nigeria",B:"Eastern Nigeria",C:"Western Nigeria (Yorubaland)",D:"Niger Delta"},ans:"C",exp:"Oyo Empire: major Yoruba empire in present-day southwestern Nigeria and Benin Republic.",diff:"medium"}],
crs: [
  {yr:2023,topic:"New Testament",q:"Who baptised Jesus at the River Jordan?",opts:{A:"Peter",B:"John the Baptist",C:"Philip",D:"Andrew"},ans:"B",exp:"Matthew 3:13-17: John the Baptist baptised Jesus. The Holy Spirit descended like a dove.",diff:"easy"},
  {yr:2023,topic:"Old Testament",q:"The first book of the Bible is:",opts:{A:"Exodus",B:"Psalms",C:"Genesis",D:"Numbers"},ans:"C",exp:"Genesis = 'beginning' or 'origin'. First book of Old Testament covering creation through Joseph.",diff:"easy"},
  {yr:2022,topic:"New Testament",q:"The Sermon on the Mount is in:",opts:{A:"Mark",B:"Luke",C:"Matthew",D:"John"},ans:"C",exp:"Matthew 5-7 contains the Sermon on the Mount, including the Beatitudes and Lord's Prayer.",diff:"medium"},
  {yr:2022,topic:"Old Testament",q:"The burning bush through which God spoke to Moses was on:",opts:{A:"Mount Sinai",B:"Mount Carmel",C:"Mount Horeb",D:"Mount Pisgah"},ans:"C",exp:"Exodus 3: Moses saw the burning bush on Mount Horeb. God revealed himself and commissioned Moses to lead Israelites.",diff:"medium"},
  {yr:2021,topic:"New Testament",q:"How many disciples did Jesus call?",opts:{A:"7",B:"10",C:"12",D:"70"},ans:"C",exp:"Jesus called 12 apostles. He also sent out 70 (or 72) disciples, but the inner circle was 12.",diff:"easy"},
  {yr:2020,topic:"New Testament",q:"The conversion of Saul to Paul happened on the road to:",opts:{A:"Jerusalem",B:"Damascus",C:"Antioch",D:"Corinth"},ans:"B",exp:"Acts 9: Saul was struck by light and heard Jesus' voice on the road to Damascus. He became Paul.",diff:"easy"},
  {yr:2019,topic:"Old Testament",q:"Who was sold into slavery by his brothers?",opts:{A:"Moses",B:"David",C:"Joseph",D:"Samuel"},ans:"C",exp:"Genesis 37: Joseph's brothers sold him to Ishmaelite traders for 20 pieces of silver. He later became a ruler in Egypt.",diff:"easy"},
  {yr:2018,topic:"New Testament",q:"Jesus performed his first miracle at:",opts:{A:"Jerusalem",B:"Bethlehem",C:"Cana",D:"Nazareth"},ans:"C",exp:"John 2: Jesus turned water into wine at a wedding in Cana of Galilee — his first recorded miracle.",diff:"medium"}
,
 {yr:2016,topic:"Old Testament",q:"First king of Israel:",opts:{A:"David",B:"Solomon",C:"Saul",D:"Samuel"},ans:"C",exp:"1 Samuel 10: Saul anointed by Samuel. Later rejected; David became king.",diff:"easy"},
  {yr:2017,topic:"Old Testament",q:"Ten commandments given to Moses on:",opts:{A:"Mount Carmel",B:"Mount Sinai",C:"Mount Zion",D:"Mount Tabor"},ans:"B",exp:"Exodus 20: God gave commandments on Mount Sinai.",diff:"easy"},
  {yr:2019,topic:"New Testament",q:"Parable of Prodigal Son found in:",opts:{A:"Matthew",B:"Mark",C:"Luke",D:"John"},ans:"C",exp:"Luke 15:11-32. Luke contains many unique parables.",diff:"medium"},
  {yr:2020,topic:"New Testament",q:"Paul's letters are called:",opts:{A:"Gospels",B:"Epistles",C:"Acts",D:"Prophecies"},ans:"B",exp:"Paul's 13-14 NT letters: Romans, Corinthians, Galatians, etc. = Epistles.",diff:"easy"},
  {yr:2021,topic:"Old Testament",q:"First five books of Bible:",opts:{A:"Psalms",B:"Torah/Pentateuch",C:"Prophets",D:"Writings"},ans:"B",exp:"Pentateuch: Genesis, Exodus, Leviticus, Numbers, Deuteronomy.",diff:"medium"},
  {yr:2022,topic:"New Testament",q:"Jesus' birth in Bethlehem fulfilled a prophecy from:",opts:{A:"Isaiah",B:"Micah",C:"Jeremiah",D:"Amos"},ans:"B",exp:"Micah 5:2 prophesied Messiah would be born in Bethlehem.",diff:"hard"},
  {yr:2023,topic:"Old Testament",q:"Noah's ark came to rest on:",opts:{A:"Mount Sinai",B:"Mount Zion",C:"Mount Ararat",D:"Mount Carmel"},ans:"C",exp:"Genesis 8:4: ark rested on mountains of Ararat (modern-day Turkey).",diff:"medium"},
  {yr:2015,topic:"New Testament",q:"The Holy Spirit descended on the disciples on:",opts:{A:"Christmas",B:"Easter",C:"Pentecost",D:"Ascension"},ans:"C",exp:"Acts 2: Holy Spirit descended on disciples on the Day of Pentecost (50 days after Passover).",diff:"medium"},
  {yr:2014,topic:"Old Testament",q:"Who wrote most of the Psalms?",opts:{A:"Solomon",B:"Moses",C:"David",D:"Asaph"},ans:"C",exp:"About 73 Psalms are attributed to David. Some are by Moses, Solomon, and Asaph.",diff:"easy"}],
com: [
  {yr:2023,topic:"Documents",q:"Document requesting payment for goods supplied:",opts:{A:"Receipt",B:"Invoice",C:"Credit note",D:"Debit note"},ans:"B",exp:"Invoice requests payment. Receipt confirms payment received. Credit note reduces amount owed.",diff:"easy"},
  {yr:2022,topic:"Insurance",q:"Principle preventing profit from insurance claim:",opts:{A:"Insurable interest",B:"Indemnity",C:"Subrogation",D:"Utmost good faith"},ans:"B",exp:"Indemnity: restores insured to pre-loss position — no profit. Subrogation: insurer recovers from third parties.",diff:"medium"},
  {yr:2021,topic:"Banking",q:"Cheque only payable into bank account:",opts:{A:"Open cheque",B:"Bearer cheque",C:"Crossed cheque",D:"Post-dated"},ans:"C",exp:"Crossed cheque has two parallel lines — must be paid into account. Open cheque can be cashed over counter.",diff:"easy"},
  {yr:2020,topic:"Trade",q:"Buying goods to sell at a profit is:",opts:{A:"Manufacturing",B:"Warehousing",C:"Commerce",D:"Trade"},ans:"D",exp:"Trade = buying and selling goods for profit. Commerce is broader, including all activities facilitating trade.",diff:"easy"},
  {yr:2019,topic:"Transport",q:"The MOST suitable transport for heavy bulky goods over long distances in Nigeria is:",opts:{A:"Air transport",B:"Road transport",C:"Rail transport",D:"Water transport"},ans:"C",exp:"Rail transport is best for heavy, bulky, non-perishable goods over long distances. Cheaper than road for bulk.",diff:"medium"}
,
 {yr:2016,topic:"Trade",q:"Trade between producers and retailers is:",opts:{A:"Retail",B:"Wholesale",C:"Entrepôt",D:"Barter"},ans:"B",exp:"Wholesale: buying bulk from producers, selling smaller quantities to retailers.",diff:"easy"},
  {yr:2017,topic:"Branding",q:"Name/symbol identifying seller's product:",opts:{A:"Patent",B:"Copyright",C:"Trademark/Brand",D:"Licence"},ans:"C",exp:"Trademark: distinguishes one company's products from competitors.",diff:"easy"},
  {yr:2018,topic:"Advertising",q:"Best medium for advertising to rural illiterates:",opts:{A:"Newspaper",B:"Radio",C:"Internet",D:"Magazine"},ans:"B",exp:"Radio: spoken word, no literacy needed, wide rural reach.",diff:"medium"},
  {yr:2019,topic:"Insurance",q:"Disclosing all relevant information to insurer:",opts:{A:"Indemnity",B:"Subrogation",C:"Utmost good faith",D:"Proximate cause"},ans:"C",exp:"Utmost good faith: non-disclosure voids policy.",diff:"medium"},
  {yr:2020,topic:"Warehousing",q:"Bonded warehouse stores goods:",opts:{A:"After paying duty",B:"Awaiting payment of customs duty",C:"Perishable goods",D:"Government goods"},ans:"B",exp:"Bonded warehouse: imports stored under Customs control until duty is paid.",diff:"hard"},
  {yr:2021,topic:"Transport",q:"Most suitable transport for crude oil:",opts:{A:"Road tankers",B:"Rail",C:"Pipeline",D:"Ships only"},ans:"C",exp:"Pipelines: safest, cheapest for crude oil over land. NNPC uses pipelines across Nigeria.",diff:"medium"},
  {yr:2022,topic:"Banking",q:"A bank overdraft is a:",opts:{A:"Long-term loan",B:"Short-term credit facility",C:"Savings account",D:"Fixed deposit"},ans:"B",exp:"Overdraft: short-term facility allowing spending beyond account balance. Repayable on demand.",diff:"easy"},
  {yr:2023,topic:"E-commerce",q:"Buying and selling goods over the internet is:",opts:{A:"Traditional commerce",B:"E-commerce",C:"Wholesale trade",D:"Retail trade"},ans:"B",exp:"E-commerce (electronic commerce): online buying/selling. Includes Jumia, Konga in Nigeria.",diff:"easy"},
  {yr:2015,topic:"Trade Documents",q:"Document showing terms agreed between buyer and seller:",opts:{A:"Invoice",B:"Purchase order",C:"Contract of sale",D:"Delivery note"},ans:"C",exp:"Contract of sale: legally binding agreement between buyer and seller on terms, price, delivery.",diff:"medium"},
  {yr:2014,topic:"Business",q:"Sole proprietorship has the disadvantage of:",opts:{A:"Easy to form",B:"Owner keeps all profit",C:"Unlimited liability",D:"Flexible management"},ans:"C",exp:"Unlimited liability: sole trader's personal assets can be used to settle business debts.",diff:"medium"}],
cmp: [
  {yr:2023,topic:"Hardware",q:"The brain of a computer is the:",opts:{A:"RAM",B:"Hard disk",C:"CPU",D:"Monitor"},ans:"C",exp:"CPU (Central Processing Unit): ALU for calculations + Control Unit for coordination.",diff:"easy"},
  {yr:2022,topic:"Internet",q:"A website address is a:",opts:{A:"IP address",B:"URL",C:"Domain server",D:"HTML page"},ans:"B",exp:"URL (Uniform Resource Locator) = complete web address. IP = numerical address.",diff:"easy"},
  {yr:2021,topic:"Hardware",q:"Which is an output device?",opts:{A:"Keyboard",B:"Mouse",C:"Printer",D:"Scanner"},ans:"C",exp:"Output devices receive data FROM computer: printer, monitor, speakers. Input: keyboard, mouse, scanner.",diff:"easy"},
  {yr:2020,topic:"Software",q:"System software that manages computer hardware is the:",opts:{A:"Application software",B:"Operating system",C:"Utility software",D:"Programming language"},ans:"B",exp:"Operating system (Windows, Linux, macOS) manages hardware resources and provides platform for applications.",diff:"easy"},
  {yr:2019,topic:"Data",q:"The smallest unit of data in a computer is a:",opts:{A:"Byte",B:"Kilobyte",C:"Bit",D:"Megabyte"},ans:"C",exp:"Bit (binary digit) = 0 or 1. 8 bits = 1 byte. 1024 bytes = 1 kilobyte.",diff:"easy"}
,
 {yr:2016,topic:"Networks",q:"Network covering small office area:",opts:{A:"WAN",B:"MAN",C:"LAN",D:"PAN"},ans:"C",exp:"LAN: Local Area Network. For offices, schools, homes.",diff:"easy"},
  {yr:2017,topic:"Storage",q:"Largest storage capacity:",opts:{A:"Floppy disk",B:"CD-ROM",C:"USB flash",D:"Hard disk drive"},ans:"D",exp:"HDD/SSD: terabytes. USB: gigabytes. CD: 700MB. Floppy: 1.44MB.",diff:"easy"},
  {yr:2018,topic:"Internet",q:"HTML stands for:",opts:{A:"High Text Markup Language",B:"HyperText Markup Language",C:"Hyper Transfer Method Language",D:"High Transfer Markup"},ans:"B",exp:"HTML = HyperText Markup Language. Creates web pages.",diff:"easy"},
  {yr:2019,topic:"Security",q:"Malicious software designed to harm computers:",opts:{A:"Antivirus",B:"Malware",C:"Firewall",D:"Browser"},ans:"B",exp:"Malware: viruses, worms, trojans. Antivirus/firewalls protect against malware.",diff:"easy"},
  {yr:2020,topic:"Spreadsheet",q:"Excel formula starts with:",opts:{A:"#",B:"@",C:"=",D:"*"},ans:"C",exp:"=formula. Without =, treated as text.",diff:"easy"},
  {yr:2021,topic:"Mobile OS",q:"Mobile operating system:",opts:{A:"Windows 10",B:"macOS",C:"Android",D:"Ubuntu"},ans:"C",exp:"Android (Google): most popular mobile OS. iOS (Apple) also mobile.",diff:"easy"},
  {yr:2022,topic:"Internet",q:"The protocol used to send emails is:",opts:{A:"HTTP",B:"FTP",C:"SMTP",D:"TCP"},ans:"C",exp:"SMTP (Simple Mail Transfer Protocol): used to send emails. POP3/IMAP: used to receive emails.",diff:"medium"},
  {yr:2023,topic:"Computing",q:"RAM is described as volatile because:",opts:{A:"It explodes",B:"Data lost when power off",C:"It is too fast",D:"It overheats"},ans:"B",exp:"Volatile memory: contents lost when power removed. ROM is non-volatile (data persists).",diff:"medium"},
  {yr:2015,topic:"Input devices",q:"Which is BOTH input and output?",opts:{A:"Keyboard",B:"Printer",C:"Touch screen",D:"Scanner"},ans:"C",exp:"Touchscreen: input (touch/type) AND output (display). Keyboard: input only. Printer: output only.",diff:"medium"},
  {yr:2014,topic:"Data",q:"Data that has been processed becomes:",opts:{A:"More data",B:"Information",C:"A programme",D:"A database"},ans:"B",exp:"Data (raw facts) → processed → Information (meaningful output). Information = processed data.",diff:"easy"}],
fmth: [
  {yr:2023,topic:"Calculus",q:"The derivative of f(x) = 3x² + 2x - 5 is:",opts:{A:"6x + 2",B:"3x + 2",C:"6x - 5",D:"3x²+2"},ans:"A",exp:"d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(-5) = 0. So f'(x) = 6x + 2.",diff:"medium"},
  {yr:2022,topic:"Binomial Theorem",q:"The coefficient of x² in (1+x)⁴ is:",opts:{A:"4",B:"6",C:"3",D:"1"},ans:"B",exp:"Using binomial theorem: (1+x)⁴ = 1+4x+6x²+4x³+x⁴. Coefficient of x² = ⁴C₂ = 6.",diff:"medium"},
  {yr:2021,topic:"Matrices",q:"If matrix A has order 3×2, it has how many elements?",opts:{A:"3",B:"2",C:"6",D:"5"},ans:"C",exp:"A 3×2 matrix has 3 rows and 2 columns. Total elements = 3 × 2 = 6.",diff:"easy"}
],
fne: [
  {yr:2023,topic:"Elements of Design",q:"The element of design that refers to the surface quality of an object is:",opts:{A:"Form",B:"Texture",C:"Space",D:"Colour"},ans:"B",exp:"Texture refers to the surface quality — how something feels or looks like it would feel (rough, smooth, bumpy).",diff:"easy"},
  {yr:2022,topic:"Art History",q:"The style of art that distorts reality to express emotions is:",opts:{A:"Impressionism",B:"Realism",C:"Expressionism",D:"Surrealism"},ans:"C",exp:"Expressionism: art distorts reality to convey emotional experience. Impressionism: capturing light effects.",diff:"medium"}
],
bsc: [
  {yr:2023,topic:"Basic Science",q:"The process by which plants make their own food is called:",opts:{A:"Respiration",B:"Photosynthesis",C:"Digestion",D:"Transpiration"},ans:"B",exp:"Photosynthesis: CO₂ + H₂O → glucose + O₂ (using sunlight and chlorophyll). Plants make food this way.",diff:"easy"},
  {yr:2022,topic:"Basic Science",q:"The force that pulls objects towards the centre of the Earth is:",opts:{A:"Magnetic force",B:"Friction",C:"Gravity",D:"Tension"},ans:"C",exp:"Gravity is the force of attraction between masses. Earth's gravity pulls everything towards its centre.",diff:"easy"},
  {yr:2021,topic:"Basic Science",q:"Water boils at ___ degrees Celsius at sea level.",opts:{A:"90°C",B:"100°C",C:"110°C",D:"80°C"},ans:"B",exp:"Water boils at 100°C (212°F) at standard atmospheric pressure (1 atm/sea level). Boiling point decreases at altitude.",diff:"easy"},
  {yr:2020,topic:"Basic Science",q:"The chemical symbol for gold is:",opts:{A:"Go",B:"Gd",C:"Au",D:"Ag"},ans:"C",exp:"Au (from Latin 'Aurum'). Ag = Silver (Argentum). Fe = Iron (Ferrum). Cu = Copper (Cuprum).",diff:"easy"},
  {yr:2019,topic:"Basic Science",q:"The planet closest to the Sun is:",opts:{A:"Venus",B:"Earth",C:"Mercury",D:"Mars"},ans:"C",exp:"Mercury is closest to the Sun. Order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.",diff:"easy"}
],
sst: [
  {yr:2023,topic:"Government",q:"The head of a local government in Nigeria is called:",opts:{A:"Governor",B:"Chairman",C:"Mayor",D:"President"},ans:"B",exp:"Local Government Areas (LGAs) in Nigeria are headed by an elected Chairman. State = Governor. Federal = President.",diff:"easy"},
  {yr:2022,topic:"History",q:"The first Nigerian to hold the position of Prime Minister was:",opts:{A:"Nnamdi Azikiwe",B:"Obafemi Awolowo",C:"Tafawa Balewa",D:"Ahmadu Bello"},ans:"C",exp:"Alhaji Tafawa Balewa was Nigeria's first and only Prime Minister (1957-1966).",diff:"medium"},
  {yr:2021,topic:"Geography",q:"Nigeria is located on which continent?",opts:{A:"Asia",B:"South America",C:"Africa",D:"Europe"},ans:"C",exp:"Nigeria is in West Africa. It borders Benin Republic, Niger, Chad, and Cameroon.",diff:"easy"},
  {yr:2020,topic:"Economics",q:"The most important natural resource of Nigeria is:",opts:{A:"Timber",B:"Crude oil",C:"Coal",D:"Gold"},ans:"B",exp:"Crude oil is Nigeria's most important natural resource, contributing over 80% of government revenue.",diff:"easy"}
],
mth_bece: [
  {yr:2023,topic:"Number",q:"What is 25% of 200?",opts:{A:"25",B:"50",C:"75",D:"100"},ans:"B",exp:"25% of 200 = 25/100 × 200 = 50.",diff:"easy"},
  {yr:2022,topic:"Algebra",q:"If 3x = 15, then x =",opts:{A:"3",B:"5",C:"12",D:"45"},ans:"B",exp:"x = 15 ÷ 3 = 5.",diff:"easy"},
  {yr:2021,topic:"Geometry",q:"A triangle with all sides equal is called:",opts:{A:"Scalene",B:"Isosceles",C:"Equilateral",D:"Right-angled"},ans:"C",exp:"Equilateral triangle: all three sides equal, all angles = 60°.",diff:"easy"}
],
eng_bece: [
  {yr:2023,topic:"Comprehension",q:"Which part of speech is the word 'beautiful' in: 'She is a beautiful girl'?",opts:{A:"Noun",B:"Verb",C:"Adjective",D:"Adverb"},ans:"C",exp:"'Beautiful' describes the noun 'girl', so it is an adjective.",diff:"easy"},
  {yr:2022,topic:"Grammar",q:"The plural of 'child' is:",opts:{A:"childs",B:"childes",C:"children",D:"childs"},ans:"C",exp:"'Children' is the irregular plural of 'child'. This is an irregular noun that doesn't follow the standard -s rule.",diff:"easy"},
  {yr:2021,topic:"Grammar",q:"Complete: She ___ reading a book when I arrived.",opts:{A:"is",B:"was",C:"were",D:"are"},ans:"B",exp:"Past continuous tense: was/were + verb-ing. 'She' uses 'was'. 'When I arrived' confirms past tense.",diff:"easy"}
]
};

var ESSAY_TOPICS_BY_SUBJ={
  eng:[
    {yr:"2023",type:"Article",q:"Write an article suitable for publication in your school magazine on the need to revive the activities of clubs and societies in schools. Your article should not be less than 450 words."},
    {yr:"2022",type:"Narrative",q:"Write a story to illustrate the saying: Half a loaf is better than none. Your story should not be less than 450 words."},
    {yr:"2022",type:"Formal Letter",q:"Write a letter to the editor of a national newspaper expressing your opinion on the lack of maintenance of public facilities in Nigeria. Your letter should not be less than 450 words."},
    {yr:"2021",type:"Speech",q:"As the head prefect of your school, write a speech you would deliver at the send-off ceremony for outgoing SS3 students on the topic: The Challenges and Rewards of Hard Work."},
    {yr:"2021",type:"Narrative",q:"Write a story that ends with the words: I had no one to blame but myself. Your story should not be less than 450 words."},
    {yr:"2020",type:"Informal Letter",q:"Your brother in SS2 has written to say he wants to stop schooling and go into business. Write a letter to him advising him against his decision. Your letter should not be less than 450 words."},
    {yr:"2020",type:"Argumentative",q:"Write an article for a national newspaper on the growing incidence of drug abuse among Nigerian youth, stating causes and suggesting ways it can be curbed. Not less than 450 words."},
    {yr:"2019",type:"Report",q:"Your school participated in an inter-school sports festival. Write a report of the festival for publication in your school newsletter. Not less than 450 words."},
    {yr:"2019",type:"Formal Letter",q:"Write a formal letter to the Commissioner for Education in your state, complaining about the poor state of public secondary schools and suggesting improvements."},
    {yr:"2018",type:"Narrative",q:"Write a story that ends with the words: The event changed my life forever. Your story should be between 450 and 600 words."},
    {yr:"2018",type:"Argumentative",q:"Some people believe internet access should be free for all secondary school students in Nigeria. Write an article for or against this view. Not less than 450 words."},
    {yr:"2017",type:"Formal Letter",q:"As Senior Prefect, write a letter to your state governor drawing attention to the dilapidated state of your school buildings and appealing for assistance."},
    {yr:"2017",type:"Descriptive",q:"Describe a market scene you have visited, bringing out the activities of buyers, sellers and other people. Your essay should not be less than 450 words."}
  ],
  lit:[
    {yr:"2023",type:"Prose",q:"Examine the role of society in shaping the character of the protagonist in any ONE prose text you have studied. Illustrate with relevant examples from the text. (Not less than 450 words.)"},
    {yr:"2023",type:"Drama",q:"Show how the use of language reveals character in any ONE drama text you have studied. Support with specific examples from the text."},
    {yr:"2022",type:"Prose",q:"Discuss how the theme of conflict is presented in any ONE prose text you have studied. Use evidence from the text to support your answer."},
    {yr:"2022",type:"Poetry",q:"Analyse the use of imagery in any TWO poems you have studied, showing how the imagery contributes to the meaning of each poem."},
    {yr:"2021",type:"Drama",q:"How does the playwright use dramatic irony to create tension in any ONE play you have studied? Give specific examples from the text."},
    {yr:"2021",type:"Prose",q:"Examine the significance of the title in relation to the themes of any ONE novel you have studied. Use textual evidence to support your points."},
    {yr:"2020",type:"Poetry",q:"Compare and contrast the treatment of the theme of nature in any TWO poems you have studied. Show how each poet uses language to convey ideas."},
    {yr:"2019",type:"Prose",q:"Trace the development of the central character from the beginning to the end of any ONE novel you have studied. What does this development reveal about the theme?"}
  ],
  mth:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) A sum of money was shared among Ade, Bello and Chidi in the ratio 2:3:5. If Chidi received ₦5,000 more than Ade, find the total amount shared. (b) A trader bought an article for ₦4,500 and sold it at a profit of 20%. Find the selling price. Show all workings clearly."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Solve the simultaneous equations: 3x + 2y = 12 and x - y = 1. (b) A rectangular room is 8m long and 6m wide. Find (i) the perimeter, (ii) the area. If a carpet costs ₦250 per square metre, find the cost of carpeting the room. Show all steps clearly."},
    {yr:"2022",type:"Statistics",q:"The marks scored by 30 students in a test are: 45,60,72,55,80,65,48,71,58,67,74,52,63,70,56,69,77,61,82,53,75,66,59,84,64,78,57,73,68,76. (a) Construct a frequency table using class intervals 40-49, 50-59, 60-69, 70-79, 80-89. (b) Calculate the mean. (c) Draw a histogram."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) The population of a town was 250,000 in 2010 and increased at 4% per annum. Find the population in 2013. (b) If ₦80,000 is invested at 5% simple interest per annum, calculate (i) the interest after 3 years (ii) the total amount."},
    {yr:"2020",type:"Graphs",q:"(a) Draw the graph of y = 2x² - 3x - 2 for -2 ≤ x ≤ 3. (b) From your graph, find: (i) the roots of 2x² - 3x - 2 = 0, (ii) the minimum value of y, (iii) the gradient at x = 2."},
    {yr:"2019",type:"Essay (Paper 2)",q:"A cylindrical tank of radius 7cm and height 20cm is filled with water poured into a rectangular container of length 11cm and width 8cm. (a) Find the volume of the cylinder. (b) Find the height of water in the rectangular container. [π = 22/7]"}
  ],
  bio:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Describe the process of photosynthesis under: (i) site of photosynthesis (ii) raw materials required (iii) the light-dependent stage (iv) the light-independent stage. (b) State FOUR ways in which photosynthesis is important to living organisms."},
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Make a diagram of the human heart and label EIGHT parts. (b) Trace the flow of blood from the right atrium to the aorta. (c) State THREE differences between arteries and veins."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Describe the mechanism of gaseous exchange in the mammalian lung. (b) State FOUR features of the alveolus that make it efficient for gaseous exchange. (c) Explain the role of haemoglobin in transporting oxygen and carbon dioxide."},
    {yr:"2022",type:"Ecology",q:"(a) Explain the term ecology. (b) Describe a food web involving at least SIX organisms. Identify (i) producers (ii) primary consumers (iii) secondary consumers (iv) tertiary consumers. (c) State the effect of removing one organism from the food web."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) State FOUR differences between mitosis and meiosis. (b) Describe the stages of mitosis with the aid of diagrams. (c) Explain the significance of mitosis to living organisms."},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Describe the nitrogen cycle using a labelled diagram. (b) State the role of each: (i) Nitrosomonas (ii) Nitrobacter (iii) Rhizobium (iv) Pseudomonas. (c) Explain why leguminous plants are important in maintaining soil fertility."},
    {yr:"2019",type:"Essay (Paper 2)",q:"(a) With the aid of a diagram, describe the structure of a virus. (b) Explain how viruses cause disease in humans. (c) State THREE ways in which the spread of HIV/AIDS can be prevented in Nigeria."}
  ],
  chm:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Explain the industrial preparation of ammonia by the Haber process: (i) raw materials (ii) conditions (iii) equation. (b) State FOUR uses of ammonia in industry. (c) Explain why a compromise temperature is used in the Haber process."},
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Define electrolysis. (b) Using a labelled diagram, describe the electrolysis of dilute sulphuric acid. State the product at each electrode and write the electrode reactions. (c) State TWO industrial applications of electrolysis."},
    {yr:"2022",type:"Organic Chemistry",q:"(a) State the differences between alkanes, alkenes and alkynes in terms of: (i) general formula (ii) bond type (iii) test for unsaturation. (b) Write the structural formula of: (i) propane (ii) ethene (iii) ethyne. (c) Explain cracking of petroleum and its importance."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) Define oxidation and reduction in terms of (i) oxygen transfer (ii) hydrogen transfer (iii) electron transfer. (b) Identify the oxidising agent and reducing agent in: CuO + H₂ → Cu + H₂O. (c) Describe the extraction of iron in the blast furnace."},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Describe the water cycle using a labelled diagram. (b) Explain the importance of water treatment and state the processes involved. (c) State FOUR ways water can be polluted and suggest ways of preventing water pollution in Nigeria."},
    {yr:"2019",type:"Essay (Paper 2)",q:"(a) State the physical and chemical properties of chlorine. (b) Describe the laboratory preparation of chlorine from concentrated HCl and MnO₂, giving the equation. (c) State FOUR uses of chlorine and its compounds."}
  ],
  phy:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) State Newton's three laws of motion. (b) A car of mass 1200 kg accelerates from rest to 30 m/s in 10 seconds. Calculate: (i) the acceleration (ii) the force required (iii) the distance covered. (c) Explain momentum and state the law of conservation of momentum."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Define: (i) electric current (ii) potential difference (iii) resistance. (b) State Ohm's Law. (c) Three resistors of 4Ω, 6Ω and 12Ω are connected in parallel. Calculate (i) the effective resistance (ii) the current from a 12V battery."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) State the laws of reflection of light. (b) With a ray diagram, explain image formation in a concave mirror. (c) An object is placed 20cm in front of a concave mirror of focal length 15cm. Calculate (i) the image distance (ii) the magnification."},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Define radioactivity and state THREE types of radioactive emissions. (b) State FOUR properties of each emission type. (c) Explain: (i) half-life (ii) nuclear fission (iii) nuclear fusion. State ONE use and ONE danger of radioactivity."},
    {yr:"2019",type:"Essay (Paper 2)",q:"(a) State the principle of moments. (b) A uniform beam of length 4m and mass 20kg is supported at its midpoint. A 30kg mass is placed at one end. (i) Calculate the force needed at the other end to maintain balance. (ii) Draw a diagram showing all forces."},
    {yr:"2018",type:"Essay (Paper 2)",q:"(a) Distinguish between transverse and longitudinal waves, giving ONE example of each. (b) Explain: (i) reflection (ii) refraction (iii) diffraction. (c) A wave has frequency 500 Hz and travels at 340 m/s. Calculate its wavelength."}
  ],
  eco:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Define demand and explain the law of demand. (b) Using a demand schedule and curve, illustrate the law of demand. (c) State and explain FIVE factors that can cause a shift in the demand curve. (d) Distinguish between a change in demand and a change in quantity demanded."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) What is inflation? (b) Distinguish between demand-pull and cost-push inflation. (c) State FOUR effects of inflation on the Nigerian economy. (d) Suggest FOUR measures the CBN can take to control inflation."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Define money and state FOUR functions of money. (b) Explain: (i) commodity money (ii) paper money (iii) credit money. (c) Describe the structure of the Nigerian banking system and explain the role of the CBN."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) Distinguish between perfect competition and monopoly. (b) State FOUR features of each market structure. (c) Explain why monopoly is harmful to consumers and suggest TWO ways the government can control monopoly."},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Define international trade and state FOUR reasons why countries engage in it. (b) Explain comparative advantage using a numerical example. (c) State FOUR problems of international trade faced by Nigeria."},
    {yr:"2019",type:"Essay (Paper 2)",q:"(a) What is a budget? (b) Distinguish between balanced, surplus and deficit budgets. (c) Explain FOUR functions of a government budget. (d) State FOUR problems associated with government budgeting in Nigeria."}
  ],
  gov:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Define democracy and state FIVE features of a democratic government. (b) Explain how the following uphold democracy in Nigeria: (i) the judiciary (ii) the National Assembly (iii) the press. (c) State THREE challenges facing democracy in Nigeria."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) What is federalism? (b) State FIVE features of federalism. (c) Explain FOUR problems of the federal system in Nigeria. (d) Suggest TWO solutions to each problem identified."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Define an election and distinguish between general elections and by-elections. (b) State FIVE functions of INEC. (c) Describe the process of conducting a general election in Nigeria from announcement to declaration of results."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) What is a political party? (b) State FIVE functions of political parties in a democracy. (c) Trace the development of political parties in Nigeria from 1922 to the present. (d) State THREE problems of political parties in Nigeria."},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Define human rights and classify them. (b) State FIVE fundamental human rights in the 1999 Constitution. (c) In what FOUR ways can human rights be abused in Nigeria? (d) State THREE ways human rights can be protected."},
    {yr:"2019",type:"Essay (Paper 2)",q:"(a) Explain the term pressure group. (b) State FOUR methods used by pressure groups to influence government policy. (c) Distinguish between pressure groups and political parties. (d) Evaluate the role of the NLC as a pressure group."}
  ],
  geo:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Describe the formation of sedimentary rocks. (b) Classify sedimentary rocks and give TWO examples of each class. (c) State FOUR economic uses of sedimentary rocks in Nigeria."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Explain the causes of soil erosion in Nigeria. (b) Describe the different types of soil erosion. (c) State FIVE effects of soil erosion on the Nigerian environment. (d) Suggest FOUR measures to control soil erosion."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) Define a river and describe the three stages in its course. (b) With diagrams, describe the landforms found in: (i) the upper course (ii) the middle course (iii) the lower course. (c) State THREE economic uses of rivers in Nigeria."},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Describe the location and physical features of the Niger Delta. (b) State FOUR resources found in the Niger Delta. (c) Explain FOUR environmental problems of the Niger Delta. (d) Suggest THREE ways of solving these problems."},
    {yr:"2019",type:"Essay (Paper 2)",q:"(a) Explain population distribution in Nigeria. (b) State FOUR factors that influence population distribution. (c) Identify THREE densely populated areas and give reasons. (d) State FOUR effects of overpopulation on Nigeria's development."}
  ],
  crs:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Narrate the birth of Jesus Christ as recorded in Luke 2:1-20. (b) State FOUR lessons Christians can learn from the circumstances of Jesus' birth. (c) Explain the significance of the birth of Jesus Christ to Christians today."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Describe the death and resurrection of Jesus Christ as recorded in the gospels. (b) State FOUR significances of the resurrection. (c) Explain how belief in the resurrection influences Christian behaviour."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) What are the Ten Commandments? (b) Classify the commandments and explain the significance of each group. (c) How are the Ten Commandments relevant to modern Nigerian society? Give FOUR specific examples."},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Give an account of Paul's conversion on the road to Damascus (Acts 9:1-22). (b) State FOUR changes that took place in Paul after his conversion. (c) How does Paul's conversion serve as a model for Christian repentance today?"},
    {yr:"2019",type:"Essay (Paper 2)",q:"(a) Describe the events of Pentecost as recorded in Acts 2:1-41. (b) State FOUR gifts of the Holy Spirit and explain how each benefits the Church. (c) Explain the role of the Holy Spirit in the life of a Christian."}
  ],
  irs:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Explain the concept of Tawhid (the Oneness of Allah) as the foundation of Islamic belief. (b) State FOUR implications of Tawhid for the life of a Muslim. (c) How does belief in Tawhid differentiate Islam from polytheism?"},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Give an account of the Hijrah of the Prophet Muhammad (SAW) from Makkah to Madinah. (b) State FOUR lessons Muslims can learn from the Hijrah. (c) Explain the significance of the Hijrah to the history of Islam."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) Describe the five pillars of Islam. (b) Explain the spiritual and social significance of each pillar. (c) How do the five pillars contribute to the unity of the Muslim Ummah?"},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Explain the concept of Zakat and state the conditions for its payment. (b) State FOUR categories of people entitled to receive Zakat. (c) How does Zakat contribute to social justice and economic development in Muslim communities?"},
    {yr:"2019",type:"Essay (Paper 2)",q:"(a) Describe the Night of Power (Laylat al-Qadr). (b) What are FIVE spiritual benefits of observing Ramadan fasting? (c) How does the discipline of Ramadan prepare Muslims for better living throughout the year?"}
  ],
  agr:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Define soil and describe the composition of a loamy soil. (b) Explain THREE ways soil organic matter benefits crop production. (c) Describe FOUR methods of maintaining soil fertility and explain the importance of each."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) What is pest control? (b) Describe FOUR methods of pest control in Nigerian farming. (c) State THREE advantages and TWO disadvantages of chemical pesticides. (d) Explain Integrated Pest Management (IPM)."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) Explain the importance of irrigation farming in Nigeria. (b) Describe TWO methods of irrigation and state advantages and disadvantages of each. (c) Identify TWO large-scale irrigation schemes in Nigeria and explain their contributions to food production."},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Define farm mechanisation. (b) State FIVE advantages and THREE disadvantages of farm mechanisation in Nigeria. (c) Explain FOUR factors that limit adoption of mechanised farming by smallholder farmers."},
    {yr:"2019",type:"Essay (Paper 2)",q:"(a) What is fishery? (b) Distinguish between artisanal and commercial fishing. (c) Describe THREE methods of fish preservation in Nigeria. (d) State FOUR problems facing the fishing industry and suggest solutions."}
  ],
  acc:[
    {yr:"2023",type:"Final Accounts",q:"The following are extracts from the books of XYZ Trading Company for year ending 31 Dec 2023: Sales ₦850,000; Opening Stock ₦120,000; Purchases ₦480,000; Closing Stock ₦95,000; Wages ₦65,000; Rent ₦30,000; Electricity ₦15,000. (a) Prepare a Trading Account. (b) Prepare a Profit and Loss Account. (c) Calculate the gross profit margin and net profit margin."},
    {yr:"2023",type:"Balance Sheet",q:"(a) Distinguish between current assets and fixed (non-current) assets, giving THREE examples of each. (b) Distinguish between current liabilities and long-term liabilities, giving TWO examples of each. (c) Explain the accounting equation Assets = Liabilities + Capital and show how it relates to the balance sheet."},
    {yr:"2022",type:"Bank Reconciliation",q:"The cash book balance of Emeka Traders on 31 March 2022 was ₦45,000 (debit). The bank statement showed a balance of ₦52,000. On investigation: unpresented cheques ₦12,000; outstanding lodgements ₦8,000; bank charges ₦3,000 not in cash book. (a) Prepare a bank reconciliation statement. (b) Explain why the cash book and bank statement balances may differ."},
    {yr:"2022",type:"Depreciation",q:"A machine was purchased on 1 January 2020 for ₦200,000 with an estimated useful life of 5 years and scrap value ₦20,000. (a) Using the straight-line method, calculate the annual depreciation. (b) Prepare the asset account and provision for depreciation account for 3 years. (c) State FOUR causes of depreciation."},
    {yr:"2021",type:"Partnership Accounts",q:"Ade and Bello are partners sharing profits 3:2. Their capital balances are Ade ₦100,000 and Bello ₦60,000. Interest on capital is 10% per annum. Ade receives a salary of ₦20,000. Net profit before appropriation is ₦80,000. (a) Prepare a Profit and Loss Appropriation Account. (b) Calculate each partner's share of profit. (c) State THREE advantages of partnership over sole proprietorship."},
    {yr:"2020",type:"Concepts",q:"(a) Explain FIVE accounting concepts and conventions. (b) For each concept, give ONE practical example of how it affects the way a business records transactions. (c) Explain why it is important for businesses to follow consistent accounting policies."}
  ],
  his:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Describe the Trans-Atlantic Slave Trade and its impact on West Africa. (b) State FIVE reasons why African chiefs participated in the slave trade. (c) Explain FOUR long-term consequences of the slave trade on African development."},
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Describe the events that led to Nigerian independence in 1960. (b) Explain the roles played by the following in the independence struggle: (i) Nnamdi Azikiwe (ii) Obafemi Awolowo (iii) Tafawa Balewa. (c) State FOUR challenges Nigeria faced after independence."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) What was the Berlin Conference of 1884-85? (b) Explain how the Berlin Conference led to the partition of Africa. (c) State FOUR effects of European colonialism on African political institutions. (d) Explain the concept of Indirect Rule as practised by the British in Nigeria."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Trace the development of nationalism in Nigeria from 1900 to 1960. (b) Explain the role of the press and educated elite in early Nigerian nationalism. (c) State FOUR factors that accelerated the demand for independence after World War II."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) Describe the Fulani Jihad of 1804 and the establishment of the Sokoto Caliphate. (b) State FOUR reasons why Usman dan Fodio launched the Jihad. (c) Explain FOUR consequences of the Jihad on the political and social organisation of northern Nigeria."},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Describe the Nigerian Civil War (1967-1970). (b) State FOUR causes of the Civil War. (c) Explain FOUR consequences of the Civil War on Nigeria's political development. (d) How did the end of the Civil War lead to national reconciliation?"},
    {yr:"2019",type:"Essay (Paper 2)",q:"(a) Explain the Amalgamation of Nigeria in 1914. (b) State the reasons Lord Lugard gave for the amalgamation. (c) Explain FOUR effects of the amalgamation on the political and economic development of Nigeria."}
  ],
  com:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Define commerce and distinguish it from trade. (b) Explain the following aids to trade: (i) banking (ii) insurance (iii) transportation (iv) warehousing. (c) State FOUR ways in which each aids commerce in Nigeria."},
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) What is insurance? (b) Explain the following principles of insurance: (i) utmost good faith (ii) insurable interest (iii) indemnity (iv) subrogation. (c) State FOUR types of insurance and explain what each covers. (d) Explain THREE benefits of insurance to businesses in Nigeria."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Define a commercial bank and state FIVE functions of commercial banks in Nigeria. (b) Distinguish between commercial banks and the Central Bank of Nigeria. (c) Explain FOUR challenges facing commercial banks in Nigeria and suggest solutions."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) What is international trade? (b) State and explain FIVE documents used in international trade. (c) Explain the role of the following in facilitating international trade: (i) Bill of Lading (ii) Letter of Credit (iii) Bill of Exchange."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) Define advertising and state its objectives. (b) Classify advertising into: (i) informative (ii) persuasive (iii) reminder advertising, giving ONE example of each. (c) State FOUR media of advertising and give TWO advantages and disadvantages of each. (d) Evaluate the effects of advertising on Nigerian consumers."},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Define a sole proprietorship and state FOUR advantages and FOUR disadvantages. (b) Distinguish between a sole proprietorship and a partnership. (c) Under what circumstances would you recommend that a businessman adopts the sole proprietorship form of business organisation? Give FOUR reasons."}
  ],
  cmp:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Define a computer and state FOUR generations of computers, giving the main characteristics of each generation. (b) Classify computers by: (i) purpose (ii) size and capacity. Give examples of each. (c) Explain FOUR ways in which computers have transformed education in Nigeria."},
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Distinguish between hardware and software, giving FOUR examples of each. (b) Explain the function of the following components: (i) CPU (ii) RAM (iii) ROM (iv) Hard disk. (c) Describe the functions of the following peripheral devices: (i) printer (ii) scanner (iii) keyboard (iv) monitor."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Define a computer network and explain the following types: (i) LAN (ii) WAN (iii) MAN. (b) State FOUR advantages and TWO disadvantages of computer networking. (c) Explain FOUR security threats to computer networks and suggest ways of protecting against each."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) What is the internet? (b) Explain the following internet services: (i) email (ii) World Wide Web (iii) File Transfer Protocol (iv) online banking. (c) State FOUR positive and FOUR negative effects of the internet on Nigerian secondary school students."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) Define a database management system (DBMS) and explain its purpose. (b) Distinguish between a flat-file database and a relational database. (c) Explain the following database concepts: (i) table (ii) record (iii) field (iv) primary key. (d) State FOUR advantages of DBMS over manual filing systems."},
    {yr:"2020",type:"Essay (Paper 2)",q:"(a) Explain the term 'computer virus' and state FOUR ways a computer can be infected with a virus. (b) State FIVE precautions a computer user should take to prevent virus infection. (c) Explain the following: (i) antivirus software (ii) firewall (iii) data backup (iv) password protection."}
  ],
  fne:[
    {yr:"2023",type:"Theory (Paper 2)",q:"(a) Explain the term 'composition' in the visual arts. (b) Describe THREE principles of composition that guide an artist in creating a well-balanced artwork. (c) Using diagrams where necessary, show how the principle of balance (symmetrical and asymmetrical) can be applied in a painting."},
    {yr:"2023",type:"Art History",q:"(a) Describe the traditional art of the Benin Kingdom, focusing on bronze casting. (b) Explain the process of lost-wax (cire perdue) casting used by Benin bronzesmiths. (c) State FOUR reasons why the Benin bronzes are considered important cultural artefacts for Nigeria and the world."},
    {yr:"2022",type:"Theory (Paper 2)",q:"(a) Define the term 'colour theory' in art. (b) Classify colours as: (i) primary (ii) secondary (iii) tertiary colours. (c) Explain the following colour schemes: (i) monochromatic (ii) complementary (iii) analogous. (d) Show how a colour wheel can be constructed. Use diagrams to illustrate your answer."},
    {yr:"2022",type:"Theory (Paper 2)",q:"(a) What is printmaking? (b) Describe FOUR methods of printmaking, explaining the process involved in each. (c) State TWO advantages and TWO disadvantages of printmaking as an art medium. (d) Give ONE example of a Nigerian artist known for printmaking."},
    {yr:"2021",type:"Theory (Paper 2)",q:"(a) Define sculpture and distinguish it from other visual arts. (b) Classify sculpture by: (i) the method of production (ii) the materials used. Give TWO examples of each. (c) Describe the process of making a clay sculpture from conception to the finished product. (d) Name FOUR types of sculpture found in traditional Nigerian art."},
    {yr:"2021",type:"Art History",q:"(a) Describe the art of the Nok culture and explain its historical significance to Nigerian art history. (b) Compare the Nok terracotta figures with the Ife bronze heads in terms of: (i) materials used (ii) technique (iii) purpose. (c) Explain why the Ife bronze heads are considered a high point of African classical art."},
    {yr:"2020",type:"Theory (Paper 2)",q:"(a) Explain the following elements of design with examples: (i) line (ii) shape (iii) texture (iv) colour (v) form. (b) Show how a knowledge of the elements of design can improve an artist's work. (c) With the aid of diagrams, show how line can be used to create the following effects: (i) movement (ii) depth (iii) emotion."},
    {yr:"2020",type:"Theory (Paper 2)",q:"(a) What is textile design? (b) Describe the following traditional Nigerian textile techniques: (i) tie-dye (adire) (ii) batik (iii) weaving (kente). (c) Explain THREE ways in which traditional Nigerian textiles reflect the cultural identity of their producers. (d) State FOUR ways of developing the textile industry in Nigeria."},
    {yr:"2019",type:"Theory (Paper 2)",q:"(a) Define graphic design and state its uses in modern society. (b) Explain the following graphic design principles: (i) unity (ii) emphasis (iii) rhythm (iv) proportion. (c) Describe the stages involved in producing a poster for a school health campaign, from concept to final product. (d) Name FOUR software applications used in graphic design."},
    {yr:"2019",type:"Art History",q:"(a) Trace the history of art education in Nigeria from the colonial period to the present. (b) Identify THREE pioneer Nigerian artists and describe their contributions to Nigerian art. (c) Explain how government policies have influenced the development of fine art in Nigeria."},
    {yr:"2018",type:"Theory (Paper 2)",q:"(a) What is perspective in art? (b) Distinguish between one-point perspective and two-point perspective. (c) Using diagrams, demonstrate how one-point perspective can be used to draw a road disappearing into the distance. (d) Explain the term 'foreshortening' and show with a diagram how it is used in figure drawing."},
    {yr:"2018",type:"Theory (Paper 2)",q:"(a) Define ceramics and distinguish between pottery and porcelain. (b) Describe the following traditional methods of pottery making: (i) coiling (ii) pinching (iii) slab building. (c) Explain the role of the kiln in ceramic production. (d) Name FOUR traditional pottery centres in Nigeria and state the type of pottery each is known for."}
  ],
  mus:[
    {yr:"2023",type:"Theory (Paper 2)",q:"(a) Define musical notation and explain its importance to music. (b) Describe the following elements of musical notation: (i) clef signs (ii) time signatures (iii) key signatures (iv) note values. (c) Write out the notes of the C major scale in both treble and bass clef. (d) Explain the difference between major and minor scales."},
    {yr:"2022",type:"Theory (Paper 2)",q:"(a) What is harmony in music? (b) Explain the following types of chords: (i) major chord (ii) minor chord (iii) dominant seventh chord. (c) Describe how triads are built on each degree of the major scale. (d) Explain the concept of cadences and identify FOUR types used in Western tonal music."},
    {yr:"2021",type:"Nigerian Music",q:"(a) Describe the characteristics of Jùjú music and trace its development in Nigeria. (b) Explain the contributions of King Sunny Ade to the development of Jùjú music. (c) Compare Jùjú music with Afrobeat, stating FOUR similarities and FOUR differences. (d) Explain how these genres have influenced contemporary Nigerian popular music."},
    {yr:"2020",type:"Theory (Paper 2)",q:"(a) Define rhythm and explain its importance in music. (b) Describe the following rhythmic elements: (i) beat (ii) tempo (iii) metre (iv) syncopation. (c) Explain the time signatures 4/4, 3/4, and 6/8, and give ONE example of a piece of music in each time signature. (d) Write four bars of a simple melody in 4/4 time."},
    {yr:"2019",type:"History of Music",q:"(a) Trace the development of music in Nigeria from pre-colonial times to the present. (b) Describe the functions of music in traditional Nigerian society. (c) Explain how Western education and Christianity influenced Nigerian music. (d) Identify THREE periods in the development of Nigerian popular music and give examples of prominent artists in each period."}
  ],
  fmth:[
    {yr:"2023",type:"Essay (Paper 2)",q:"(a) Differentiate between a function and a relation. (b) Given f(x) = 2x² - 3x + 1 and g(x) = x + 2, find: (i) f(3) (ii) g∘f(2) (iii) f∘g(x). (c) Find the inverse of f(x) = (2x + 1)/(x - 3) and state the value of x for which f⁻¹ is undefined."},
    {yr:"2022",type:"Essay (Paper 2)",q:"(a) Define differentiation from first principles. (b) Differentiate the following with respect to x: (i) y = 3x⁴ - 5x³ + 2x - 7 (ii) y = (2x + 1)(x - 3) (iii) y = sin(3x²). (c) Find the stationary points of y = x³ - 6x² + 9x + 2 and determine their nature."},
    {yr:"2021",type:"Essay (Paper 2)",q:"(a) State the Binomial theorem for (1 + x)ⁿ. (b) Expand (2 + 3x)⁵ completely. (c) Find the term independent of x in the expansion of (x + 2/x)⁶. (d) Use the binomial theorem to find the value of (0.98)⁴ correct to 4 decimal places."},
    {yr:"2020",type:"Matrices",q:"Given matrices A = [[2,1],[3,-1]] and B = [[1,2],[-1,3]], find: (a) A + B (b) AB (c) the determinant of A (d) the inverse of A. (e) Hence solve the simultaneous equations: 2x + y = 5 and 3x - y = 4 using matrix method."}
  ],
  default:[
    {yr:"2023",type:"Article",q:"Write an article suitable for publication in your school magazine on the need to revive the activities of clubs and societies in schools. Your article should not be less than 450 words."},
    {yr:"2022",type:"Narrative",q:"Write a story to illustrate the saying: Half a loaf is better than none. Your story should not be less than 450 words."},
    {yr:"2021",type:"Speech",q:"As the head prefect of your school, write a speech you would deliver at the send-off ceremony for outgoing SS3 students on the topic: The Challenges and Rewards of Hard Work."},
    {yr:"2020",type:"Formal Letter",q:"Write a letter to the Commissioner for Education in your state, drawing attention to the poor state of public schools and suggesting ways of improving the standard of education."},
    {yr:"2019",type:"Narrative",q:"Write a story that ends with the words: I had no one to blame but myself. Your story should not be less than 450 words."},
    {yr:"2018",type:"Argumentative",q:"Write an article for or against the view that the use of social media has done more harm than good to Nigerian secondary school students."}
  ]
};;
var ESSAY_TOPICS=ESSAY_TOPICS_BY_SUBJ.default;
// ══════════════════════════════════════════════════
// WAEC THEORY ENGINE — Full Exam System
// ══════════════════════════════════════════════════
var ESSAY_GUIDE=[
  {pct:0,  txt:'Introduction — State your main argument or set the scene clearly in 2-3 sentences.'},
  {pct:15, txt:'Body paragraph 1 — First main point with supporting detail or example.'},
  {pct:35, txt:'Body paragraph 2 — Second idea. Link with: Furthermore / However / In addition.'},
  {pct:55, txt:'Body paragraph 3 — Third point or counter-argument. Show balanced thinking.'},
  {pct:75, txt:'Conclusion — Summarise your key points. Restate your position firmly.'},
  {pct:90, txt:'Review — Read through carefully. Check spelling, grammar, and sentence flow.'}
];

// State
var essayMode = 'essay'; // 'essay' | 'theory' | 'full'
var theoryQuestions = [];   // array of {topic, parts:[{label,text}], answers:[...blocks], skipped, timeSpent}
var theoryCurrentQ = 0;
var theoryAnsweredCount = 0;
var theoryMaxAnswers = 99; // 4 for full paper mode
var theoryGhostEnabled = true;
var theoryFormatMode = null; // 'bold'|'underline'|'highlight'|null
var theoryQuestionPanelVisible = true;
var theoryBlockIdSeq = 0;

function setEssayMode(mode, btn) {
  essayMode = mode;
  document.querySelectorAll('.erc-mode-chip').forEach(function(b){b.classList.remove('on');});
  if(btn) btn.classList.add('on');
}

function openEssaySection(fromExam) {
  goTo('pg-essay');
  setTimeout(function(){
    var rs=document.getElementById('essayRulesScreen'),
        ws=document.getElementById('theoryWritingScreen'),
        fs=document.getElementById('essayFeedbackScreen');
    if(rs){rs.style.display='flex';}
    if(ws){ws.style.display='none';}
    if(fs){fs.style.display='none';}
    essayViolations=0; essayDeductedPct=0;
    loadEssayTopics(fromExam);
    updateEssayRulesHeader(fromExam);
    if(typeof __injectLogos==='function') __injectLogos();
  },60);
}

function updateEssayRulesHeader(fromExam) {
  var titleEl=document.getElementById('essayRulesTitle'), subEl=document.getElementById('essayRulesSub');
  var modeChip={essay:'✍️ Continuous Writing',theory:'📋 Structured Theory',full:'📝 Full Paper'}[essayMode]||'Theory & Essay';
  if(fromExam && window._essayExamContext){
    var ctx=window._essayExamContext;
    if(titleEl) titleEl.textContent=ctx.exam.toUpperCase()+' — '+ctx.subj;
    if(subEl) subEl.textContent=modeChip;
  } else {
    if(titleEl) titleEl.textContent='Theory & Essay Practice';
    if(subEl) subEl.textContent=modeChip;
  }
  // Update start button label
  var btn=document.getElementById('essayStartBtn');
  if(btn){
    var labels={essay:'Begin Writing →',theory:'Begin Theory Exam →',full:'Begin Full Paper →'};
    btn.textContent=labels[essayMode]||'Begin Exam →';
    // In theory/full mode auto-enable once checkbox is ticked
    if(essayMode!=='essay') {
      var chk=document.getElementById('essayAgree');
      btn.disabled=!(chk&&chk.checked);
    }
  }
  // Show topic label
  var lbl=document.getElementById('essayTopicLabel');
  if(lbl){
    if(essayMode==='essay') lbl.textContent='Choose one question:';
    else if(essayMode==='full') lbl.textContent='Questions in this paper (answer any 3):';
    else lbl.textContent='All questions in this paper:';
  }
}

function loadEssayTopics(fromExam) {
  var grid=document.getElementById('essayTopicGrid');
  if(!grid) return;
  var topics;
  if(fromExam && window._essayExamContext){
    var ctx=window._essayExamContext, ex=ctx.exam.toUpperCase();
    // Strip class suffix like '-s2', '-s3' from subject key
    var rawKey=ctx.key||'default';
    var subjKey=rawKey.replace(/-[a-z0-9]+$/,'');
    // Try exact key first, then strip any suffix, then default
    var subjTopics=ESSAY_TOPICS_BY_SUBJ[subjKey]
      ||ESSAY_TOPICS_BY_SUBJ[rawKey]
      ||ESSAY_TOPICS_BY_SUBJ[subjKey.split('_')[0]]
      ||ESSAY_TOPICS_BY_SUBJ.default;
    topics=subjTopics.map(function(t){return Object.assign({},t,{type:'['+ex+'] '+t.type,_exam:ex,_subj:ctx.subj});});
  } else {
    var ck=typeof currentSubject!=='undefined'?currentSubject:'';
    topics=ESSAY_TOPICS_BY_SUBJ[ck]||ESSAY_TOPICS_BY_SUBJ.default;
  }
  window._essayTopics=topics;
  grid.innerHTML=topics.map(function(t,i){
    var badge=t.yr?'<span style="font-size:.58rem;font-weight:800;background:rgba(251,191,36,.15);border:1px solid rgba(251,191,36,.3);color:#fbbf24;padding:1px 6px;border-radius:4px;margin-left:6px">'+t.yr+'</span>':'';
    return '<button class="erc-topic-btn" onclick="pickEssayTopic('+i+',this)"><div class="erc-topic-type" style="display:flex;align-items:center">'+t.type+badge+'</div><div class="erc-topic-text">'+t.q+'</div></button>';
  }).join('');
}

function pickEssayTopic(idx,btn) {
  document.querySelectorAll('.erc-topic-btn').forEach(function(b){b.classList.remove('sel');});
  btn.classList.add('sel');
  essayTopic=(window._essayTopics||ESSAY_TOPICS_BY_SUBJ.default)[idx];
  checkEssayReady();
}

function checkEssayReady() {
  var chk=document.getElementById('essayAgree'), btn=document.getElementById('essayStartBtn');
  if(!btn) return;
  // In theory/full mode, don't require topic selection
  var needTopic=essayMode==='essay';
  btn.disabled=!(chk&&chk.checked&&(needTopic?essayTopic:true));
}

function startEssayWriting() {
  var rs=document.getElementById('essayRulesScreen'), ws=document.getElementById('theoryWritingScreen');
  if(rs) rs.style.display='none';
  if(ws) ws.style.display='flex';

  // Always load ALL available topics as questions (WAEC Paper 2 style)
  var allTopics=window._essayTopics||ESSAY_TOPICS_BY_SUBJ.default;
  
  if(essayMode==='full') {
    theoryMaxAnswers=3; // WAEC: answer any 3 of 5
    theoryQuestions=allTopics.slice(0,5).map(function(t,i){return buildTheoryQuestion(t,i);});
  } else if(essayMode==='essay') {
    theoryMaxAnswers=1;
    // Single essay: use selected topic or first
    var topic=essayTopic||allTopics[0];
    theoryQuestions=[buildTheoryQuestion(topic,0)];
  } else {
    // Theory mode: show all questions, answer all
    theoryMaxAnswers=allTopics.length;
    theoryQuestions=allTopics.map(function(t,i){return buildTheoryQuestion(t,i);});
  }
  
  theoryCurrentQ=0;
  theoryAnsweredCount=0;
  essayViolations=0; essayDeductedPct=0; essayActive=true;

  // Set timer based on questions
  var totalMins=essayMode==='essay'?45:theoryQuestions.length*18;
  essaySecs=totalMins*60;

  // Render UI
  renderTheoryTopbar();
  buildTheoryToolkit();
  renderQBar();
  renderCurrentQuestion();
  startEssayTimer();
  installAntiCheat();
  if(typeof __injectLogos==='function') __injectLogos();
}

function buildTheoryQuestion(topic, idx) {
  // Parse parts from question text (a), (b), (c)...
  var parts=[];
  var text=topic.q||'';
  var partRegex=/\(([a-z])\)\s*(.*?)(?=\([a-z]\)|$)/gs;
  var m, found=[];
  while((m=partRegex.exec(text))!==null) found.push({label:'('+m[1]+')',text:m[2].trim()});
  if(found.length>1) {
    // Multi-part question
    var intro=text.slice(0,text.indexOf('('+(found[0].label[1])+')')).trim();
    parts=found.map(function(f){return {label:f.label, text:f.text};});
    return {topic:topic, intro:intro, parts:parts, answers:found.map(function(){return [{id:nextBlockId(),type:'free',content:''}];}), skipped:false, timeSpent:0, answered:false, activePart:0};
  } else {
    // Single part
    return {topic:topic, intro:text, parts:[], answers:[[{id:nextBlockId(),type:'free',content:''}]], skipped:false, timeSpent:0, answered:false, activePart:0};
  }
}

function nextBlockId(){return 'blk'+(++theoryBlockIdSeq);}

function renderTheoryTopbar() {
  var ctx=window._essayExamContext;
  var exam=ctx?ctx.exam.toUpperCase():'WAEC';
  var subj=ctx?ctx.subj:(essayTopic?essayTopic.type:'Essay');
  var tt=document.getElementById('theoryTitle');
  var tb=document.getElementById('theoryExamBadge');
  if(tt) tt.textContent=subj;
  if(tb) tb.textContent=exam+(essayTopic&&essayTopic.yr?' '+essayTopic.yr:'');
}

function renderQBar() {
  var container=document.getElementById('tqbBtns');
  if(!container) return;
  container.innerHTML='';

  var prog=document.getElementById('theoryProgress');
  if(prog) prog.textContent='Question '+(theoryCurrentQ+1)+' of '+theoryQuestions.length;

  theoryQuestions.forEach(function(q,i){
    var btn=document.createElement('button');
    var state=i===theoryCurrentQ?'active':q.answered?'answered':q.skipped?'skipped':'';
    btn.className='tqb-btn'+(state?' '+state:'');
    btn.title=(q.answered?'✅ Answered':q.skipped?'⏭ Skipped':'Not answered');
    btn.innerHTML='<span style="font-size:.6rem;opacity:.5">Q</span>'+(i+1);
    (function(idx){btn.onclick=function(){switchToQuestion(idx);};})(i);
    container.appendChild(btn);
  });

  // Instruction label based on mode
  var maxA=theoryMaxAnswers<theoryQuestions.length?theoryMaxAnswers:0;
  var tw=document.getElementById('tqbTimeWarn'), tl=document.getElementById('tqbTimeLeft');
  if(tw && tl){
    if(maxA>0 && theoryAnsweredCount<maxA){
      tl.textContent='Answer any '+maxA+' questions';
      tw.style.display='block';
    } else if(maxA>0 && theoryAnsweredCount>=maxA){
      tl.textContent='✅ '+maxA+' questions answered — ready to submit';
      tw.style.display='block';
    } else {
      tw.style.display='none';
    }
  }

  var pct=Math.round(theoryAnsweredCount/Math.max(1,Math.min(theoryQuestions.length,theoryMaxAnswers))*100);
  var pf=document.getElementById('theoryProgFill');
  if(pf) pf.style.width=Math.min(100,pct)+'%';
}

function switchToQuestion(idx) {
  saveCurrentAnswer();
  theoryCurrentQ=idx;
  renderQBar();
  renderCurrentQuestion();
  // Update footer nav buttons
  var prevBtn=document.getElementById('theoryPrevBtn');
  var nextBtn=document.getElementById('theoryNextBtn');
  var progEl=document.getElementById('theoryQProgress');
  if(prevBtn) prevBtn.style.display=idx>0?'block':'none';
  if(nextBtn) nextBtn.textContent=idx<theoryQuestions.length-1?'Next Question →':'Review & Submit →';
  if(progEl) progEl.textContent='Q'+(idx+1)+' of '+theoryQuestions.length;
  // Scroll answer pane to top
  var content=document.getElementById('tapContent');
  if(content) content.scrollTop=0;
}
function theoryNextQ(){
  if(theoryCurrentQ<theoryQuestions.length-1){
    switchToQuestion(theoryCurrentQ+1);
  } else {
    // Last question — show summary
    var answered=theoryQuestions.filter(function(q){return q.answered||q.answers.some(function(p){return p&&p.some(function(b){return b.content&&b.content.trim();});});}).length;
    if(confirm('End of questions. You have answered '+answered+' of '+theoryQuestions.length+'. Submit for marking now?')){
      submitEssay();
    }
  }
}
function theoryPrevQ(){
  if(theoryCurrentQ>0) switchToQuestion(theoryCurrentQ-1);
}

function renderCurrentQuestion() {
  var q=theoryQuestions[theoryCurrentQ];
  if(!q) return;

  // Question number badge
  var qnum=document.getElementById('tqcQnum');
  if(qnum) qnum.textContent='Question '+(theoryCurrentQ+1)+' of '+theoryQuestions.length;

  // Marks chips
  var marks=document.getElementById('tqcMarks');
  if(marks) {
    var total=q.parts.length>0?q.parts.length*10:20;
    var mins=Math.ceil(total*0.9);
    marks.innerHTML='<div class="tqc-mark-chip">'+total+' marks</div>'
      +'<div class="tqc-type-chip">'+(q.topic.type||'Essay')+'</div>'
      +'<div class="tqc-timer-chip">~'+mins+' min</div>';
  }

  // Question body
  var body=document.getElementById('tqcBody');
  if(body) {
    var html='';
    if(q.intro) html+='<div class="tqc-qtext">'+q.intro+'</div>';
    if(q.parts.length>0) {
      html+='<div class="tqc-parts">';
      q.parts.forEach(function(p){
        html+='<div class="tqc-part"><div class="tqc-part-label">'+p.label+'</div><div class="tqc-part-text">'+p.text+'</div></div>';
      });
      html+='</div>';
    }
    // Mark hint
    if(q.parts.length>0) {
      html+='<div class="tqc-hint"><div class="tqc-hint-hdr">💡 Mark Hint</div>';
      html+='Each part (a)(b)(c)... carries equal marks. State points clearly — WAEC awards marks per point, not per paragraph. Use numbered points where possible.</div>';
    }
    body.innerHTML=html;
  }

  // Render part tabs
  renderPartTabs(q);
  renderAnswerPane(q, q.activePart||0);

  // Update progress label
  var prog=document.getElementById('theoryProgress');
  if(prog) prog.textContent='Q'+(theoryCurrentQ+1)+' of '+theoryQuestions.length;
}

function renderPartTabs(q) {
  var tabs=document.getElementById('theoryPartsTabs');
  if(!tabs) return;
  tabs.innerHTML='';
  var numParts=Math.max(1,q.parts.length);
  for(var i=0;i<numParts;i++){
    var lbl=q.parts[i]?q.parts[i].label:'Answer';
    var tab=document.createElement('div');
    tab.className='tpt-tab'+(i===(q.activePart||0)?' active':'');
    // Check if answered
    var ans=q.answers[i]||[];
    var hasContent=ans.some(function(b){return b.content&&b.content.trim();});
    if(hasContent) tab.classList.add('done');
    tab.textContent=lbl;
    (function(idx){tab.onclick=function(){switchPart(idx);};})(i);
    tabs.appendChild(tab);
  }
  // Add part button (for theory mode)
  if(essayMode==='theory') {
    var add=document.createElement('div');
    add.className='tpt-add';
    add.innerHTML='＋ Add Part';
    add.onclick=addExtraPart;
    tabs.appendChild(add);
  }
}

function switchPart(idx) {
  saveCurrentAnswer();
  var q=theoryQuestions[theoryCurrentQ];
  if(!q) return;
  q.activePart=idx;
  // Just update part tabs visual state and re-render answer pane
  // (avoids blowing away the entire question column and losing focus)
  renderPartTabs(q);
  renderAnswerPane(q, idx);
  // Focus the first textarea in the new part for immediate typing
  setTimeout(function(){
    var pane=document.getElementById('theoryAnswerPane');
    if(!pane) return;
    var firstTa=pane.querySelector('textarea');
    if(firstTa){ try{ firstTa.focus(); }catch(e){} }
  }, 50);
}

function addExtraPart() {
  var q=theoryQuestions[theoryCurrentQ];
  if(!q) return;
  var letters='abcdefghijklmnop';
  var nextIdx=q.parts.length;
  q.parts.push({label:'('+(letters[nextIdx]||nextIdx)+')',text:'Additional part'});
  q.answers.push([{id:nextBlockId(),type:'free',content:''}]);
  q.activePart=nextIdx;
  renderPartTabs(q);
  renderAnswerPane(q,nextIdx);
}

// Partial re-render helper — preserves focus by only replacing one block
function rerenderBlock(blockId, block){
  var oldEl=document.querySelector('[data-bid="'+blockId+'"]');
  if(!oldEl) return;
  var newEl=renderBlock(block);
  oldEl.parentNode.replaceChild(newEl,oldEl);
  return newEl;
}

function renderAnswerPane(q, partIdx) {
  var partLabel=document.getElementById('tapPartLabel');
  var content=document.getElementById('tapContent');
  if(!content) return;

  var lbl=q.parts[partIdx]?q.parts[partIdx].label:'Answer';
  if(partLabel) partLabel.textContent=lbl;

  var answers=q.answers[partIdx]||[];
  content.innerHTML='';
  answers.forEach(function(block){
    content.appendChild(renderBlock(block));
  });

  updateTheoryWordCount();
  if(answers.length===0) addBlock('free');
}

function saveCurrentAnswer() {
  var q=theoryQuestions[theoryCurrentQ];
  if(!q) return;
  var partIdx=q.activePart||0;
  var content=document.getElementById('tapContent');
  if(!content) return;
  // Sync all textarea/input values back to data
  content.querySelectorAll('[data-bid]').forEach(function(el){
    var bid=el.dataset.bid;
    var block=findBlock(q,partIdx,bid);
    if(block && el.tagName==='TEXTAREA') block.content=el.value;
  });
  // Also sync point inputs
  content.querySelectorAll('.ab-point-input').forEach(function(el){
    var row=el.closest('[data-bid]');
    if(!row) return;
    var bid=row.dataset.bid;
    var block=findBlock(q,partIdx,bid);
    if(block && block.type==='point') {
      var idx=parseInt(el.dataset.pidx||'0');
      if(!block.points) block.points=[];
      block.points[idx]=el.value;
    }
  });
  // Sync table cells
  content.querySelectorAll('.ab-table-cell').forEach(function(el){
    var row=el.closest('[data-bid]');
    if(!row) return;
    var bid=row.dataset.bid;
    var block=findBlock(q,partIdx,bid);
    if(block && block.type==='table') {
      var r=parseInt(el.dataset.row||'0'), c=parseInt(el.dataset.col||'0');
      if(!block.rows) block.rows=[];
      if(!block.rows[r]) block.rows[r]=[];
      block.rows[r][c]=el.value;
    }
  });
  // Mark answered if any content
  var hasContent=false;
  (q.answers||[]).forEach(function(partAns){
    (partAns||[]).forEach(function(b){
      if(b.content&&b.content.trim()) hasContent=true;
      if(b.points&&b.points.some(function(p){return p&&p.trim();})) hasContent=true;
      if(b.rows&&b.rows.some(function(r){return r&&r.some(function(c){return c&&c.trim();});})) hasContent=true;
    });
  });
  if(hasContent && !q.answered) {
    q.answered=true;
    theoryAnsweredCount++;
  }
}

function findBlock(q,partIdx,bid) {
  var ans=q.answers[partIdx]||[];
  return ans.find(function(b){return b.id===bid;})||null;
}

function renderBlock(block) {
  var wrap=document.createElement('div');
  wrap.className='answer-block';
  wrap.dataset.bid=block.id;

  // Header
  var hdr=document.createElement('div');
  hdr.className='ab-header';
  var badge=document.createElement('span');
  badge.className='ab-type-badge '+block.type;
  var labels={free:'Free Write',def:'Definition',exp:'Explanation',eg:'Example',point:'Points',table:'Table',steps:'Step-by-Step',equation:'Equation',quote:'Quote/Evidence',ledger:'Ledger',financial:'Financial Statement',matrix:'Matrix',timeline:'Timeline',diagram:'Diagram'};
  badge.textContent=labels[block.type]||'Write';
  var del=document.createElement('button');
  del.className='ab-del';
  del.innerHTML='✕';
  del.title='Remove block';
  del.onclick=function(){removeBlock(block.id);};
  hdr.appendChild(badge);
  hdr.appendChild(del);
  wrap.appendChild(hdr);

  if(block.type==='point') {
    // Points list
    var pts=document.createElement('div');
    pts.className='ab-points';
    if(!block.points||block.points.length===0) block.points=[''];
    block.points.forEach(function(pt,i){
      pts.appendChild(makePointRow(block,i,pt));
    });
    var addPt=document.createElement('button');
    addPt.className='ab-add-point';
    addPt.textContent='+ Add Point';
    addPt.onclick=function(){
      block.points.push('');
      // Rebuild just this block's DOM, preserving scroll position
      var oldEl=document.querySelector('[data-bid="'+block.id+'"]');
      if(oldEl){
        var newEl=renderBlock(block);
        oldEl.parentNode.replaceChild(newEl,oldEl);
        // Focus the newly added point input
        var inputs=newEl.querySelectorAll('.ab-point-input');
        var last=inputs[inputs.length-1];
        if(last){setTimeout(function(){try{last.focus();}catch(e){}},50);}
      }
    };
    pts.appendChild(addPt);
    wrap.appendChild(pts);
  } else if(block.type==='table') {
    // Table builder
    var twrap=document.createElement('div');
    twrap.className='ab-table-wrap';
    if(!block.cols||block.cols.length===0) block.cols=['Feature','Column A','Column B'];
    if(!block.rows||block.rows.length===0) block.rows=[['','',''],['','','']];
    twrap.appendChild(buildTable(block));
    var addRow=document.createElement('button');
    addRow.className='ab-table-add-row';
    addRow.textContent='+ Add Row';
    addRow.onclick=function(){
      block.rows.push(block.cols.map(function(){return '';}));
      saveCurrentAnswer();
      var oldEl=document.querySelector('[data-bid="'+block.id+'"]');
      if(oldEl){
        var newEl=renderBlock(block);
        oldEl.parentNode.replaceChild(newEl,oldEl);
      }
    };
    var addCol=document.createElement('button');
    addCol.className='ab-table-add-col';
    addCol.textContent='+ Column';
    addCol.onclick=function(){
      block.cols.push('Column '+(block.cols.length+1));
      block.rows.forEach(function(r){r.push('');});
      saveCurrentAnswer();
      var oldEl=document.querySelector('[data-bid="'+block.id+'"]');
      if(oldEl){
        var newEl=renderBlock(block);
        oldEl.parentNode.replaceChild(newEl,oldEl);
      }
    };
    twrap.appendChild(addRow);
    twrap.appendChild(addCol);
    wrap.appendChild(twrap);
  } else if(block.type==='steps') {
    // Step-by-step working (Maths/Physics/Chemistry)
    var swrap=document.createElement('div');swrap.className='ab-steps-wrap';
    if(!block.steps||block.steps.length===0) block.steps=['Step 1: '];
    block.steps.forEach(function(s,i){
      var row=document.createElement('div');row.className='ab-step-row';
      var num=document.createElement('span');num.className='ab-step-num';num.textContent='Step '+(i+1);
      var inp=document.createElement('textarea');inp.className='ab-step-input';
      inp.placeholder='Write step '+(i+1)+'...';inp.value=s||'';inp.rows=1;
      inp.oninput=function(){block.steps[i]=inp.value;updateTheoryWordCount();inp.style.height='auto';inp.style.height=Math.max(32,inp.scrollHeight)+'px';};
      inp.onpaste=function(e){e.preventDefault();};
      var del=document.createElement('button');del.className='ab-point-del';del.innerHTML='✕';
      del.onclick=function(){block.steps.splice(i,1);renderCurrentQuestion();};
      row.appendChild(num);row.appendChild(inp);row.appendChild(del);swrap.appendChild(row);
    });
    var addStep=document.createElement('button');addStep.className='ab-add-point';addStep.textContent='+ Add Step';
    addStep.onclick=function(){block.steps.push('');renderCurrentQuestion();};
    swrap.appendChild(addStep);wrap.appendChild(swrap);
  } else if(block.type==='equation') {
    // Equation / formula block
    var eqwrap=document.createElement('div');eqwrap.className='ab-eq-wrap';
    var eqLabel=document.createElement('div');eqLabel.className='ab-eq-label';eqLabel.textContent='Equation:';
    var eqInp=document.createElement('input');
    eqInp.type='text';eqInp.className='ab-eq-input';
    eqInp.placeholder='e.g. v = u + at  |  PV = nRT  |  E = mc²';
    eqInp.value=block.content||'';
    eqInp.oninput=function(){block.content=eqInp.value;updateTheoryWordCount();};
    var eqNote=document.createElement('textarea');eqNote.className='ab-textarea';eqNote.rows=2;
    eqNote.placeholder='Explain the equation / define each variable...';
    eqNote.style.marginTop='6px';
    eqNote.value=block.note||'';
    eqNote.oninput=function(){block.note=eqNote.value;updateTheoryWordCount();};
    eqwrap.appendChild(eqLabel);eqwrap.appendChild(eqInp);eqwrap.appendChild(eqNote);wrap.appendChild(eqwrap);
  } else if(block.type==='quote') {
    // Quote / textual evidence block
    var qwrap=document.createElement('div');qwrap.className='ab-quote-wrap';
    var qta=document.createElement('textarea');qta.className='ab-textarea ab-quote-text';
    qta.placeholder='Enter the quotation / passage / scripture reference...';
    qta.value=block.content||'';qta.rows=3;
    qta.oninput=function(){block.content=qta.value;updateTheoryWordCount();};
    qta.onpaste=function(e){e.preventDefault();};
    var qsrc=document.createElement('input');qsrc.type='text';qsrc.className='ab-eq-input';
    qsrc.placeholder='Source: e.g. Matthew 5:3  |  Chinua Achebe, p.45';
    qsrc.value=block.author||'';
    qsrc.oninput=function(){block.author=qsrc.value;};
    var qcomment=document.createElement('textarea');qcomment.className='ab-textarea';qcomment.rows=2;
    qcomment.placeholder='Your comment on this quotation...';
    qcomment.value=block.comment||'';
    qcomment.oninput=function(){block.comment=qcomment.value;updateTheoryWordCount();};
    qcomment.onpaste=function(e){e.preventDefault();};
    qwrap.appendChild(qta);qwrap.appendChild(qsrc);qwrap.appendChild(qcomment);wrap.appendChild(qwrap);
  } else if(block.type==='ledger') {
    // Accounting ledger table
    var lwrap=document.createElement('div');lwrap.className='ab-table-wrap';
    if(!block.cols) block.cols=['Date','Details','Dr (₦)','Cr (₦)','Balance (₦)'];
    if(!block.rows) block.rows=[['','','','',''],['','','','',''],['','','','','']];
    lwrap.appendChild(buildTable(block));
    var addRow=document.createElement('button');addRow.className='ab-table-add-row';addRow.textContent='+ Add Row';
    addRow.onclick=function(){block.rows.push(block.cols.map(function(){return '';}));renderCurrentQuestion();};
    lwrap.appendChild(addRow);wrap.appendChild(lwrap);
  } else if(block.type==='financial') {
    // Financial statement template (P&L, Balance Sheet)
    var fwrap=document.createElement('div');fwrap.className='ab-table-wrap';
    if(!block.cols) block.cols=['Item','₦','₦'];
    if(!block.rows) block.rows=[['Sales','',''],['Less: Cost of Goods Sold','',''],['GROSS PROFIT','',''],['Less: Expenses','',''],['NET PROFIT','','']];
    fwrap.appendChild(buildTable(block));
    var addRow2=document.createElement('button');addRow2.className='ab-table-add-row';addRow2.textContent='+ Add Row';
    addRow2.onclick=function(){block.rows.push(['','','']);renderCurrentQuestion();};
    fwrap.appendChild(addRow2);wrap.appendChild(fwrap);
  } else if(block.type==='matrix') {
    // Matrix input block
    var mwrap=document.createElement('div');mwrap.className='ab-matrix-wrap';
    if(!block.rows) block.rows=[['',''],['','']];
    var mtable=document.createElement('table');mtable.className='ab-matrix-table';
    block.rows.forEach(function(row,ri){
      var tr=document.createElement('tr');
      row.forEach(function(cell,ci){
        var td=document.createElement('td');
        var inp=document.createElement('input');inp.type='text';inp.className='ab-matrix-cell';
        inp.value=cell||'';inp.placeholder='0';
        inp.oninput=function(){block.rows[ri][ci]=inp.value;updateTheoryWordCount();};
        td.appendChild(inp);tr.appendChild(td);
      });
      mtable.appendChild(tr);
    });
    var mctrl=document.createElement('div');mctrl.style.display='flex';mctrl.style.gap='6px';mctrl.style.marginTop='8px';
    ['+ Row','+ Col'].forEach(function(lbl,idx){
      var btn=document.createElement('button');btn.className='ab-add-point';btn.textContent=lbl;
      btn.onclick=function(){
        if(idx===0){block.rows.push(block.rows[0].map(function(){return '';}));}
        else{block.rows.forEach(function(r){r.push('');});}
        renderCurrentQuestion();
      };
      mctrl.appendChild(btn);
    });
    mwrap.appendChild(mtable);mwrap.appendChild(mctrl);wrap.appendChild(mwrap);
  } else if(block.type==='timeline') {
    // Timeline block (History)
    var tlwrap=document.createElement('div');tlwrap.className='ab-table-wrap';
    if(!block.cols) block.cols=['Year/Period','Event','Significance'];
    if(!block.rows) block.rows=[['','',''],['','',''],['','','']];
    tlwrap.appendChild(buildTable(block));
    var addTLRow=document.createElement('button');addTLRow.className='ab-table-add-row';addTLRow.textContent='+ Add Event';
    addTLRow.onclick=function(){block.rows.push(['','','']);renderCurrentQuestion();};
    tlwrap.appendChild(addTLRow);wrap.appendChild(tlwrap);
  } else if(block.type==='diagram') {
    // Diagram block — delegate to essay-page script (window.renderBlockDiagram)
    if (typeof window.renderBlockDiagram === 'function') {
      wrap.appendChild(window.renderBlockDiagram(block));
    } else {
      var fallback = document.createElement('div');
      fallback.style.cssText = 'padding:20px;color:#fff;opacity:.6;text-align:center';
      fallback.textContent = 'Diagram tool is loading…';
      wrap.appendChild(fallback);
    }
  } else {
    // Text block (free, def, exp, eg)
    var ta=document.createElement('textarea');
    ta.className='ab-textarea';
    ta.dataset.bid=block.id;
    var ph={free:'Write your answer here...',def:'Define the term or concept...',exp:'Explain in detail...',eg:'Give a specific example...'};
    ta.placeholder=ph[block.type]||'Write here...';
    ta.value=block.content||'';
    ta.spellcheck=true;
    ta.oninput=function(){
      block.content=ta.value;
      updateTheoryWordCount();
      if(theoryGhostEnabled) triggerTheoryGhost(ta);
    };
    ta.onpaste=function(e){e.preventDefault();logEssayViolation('Paste');};
    ta.oncopy=function(e){e.preventDefault();logEssayViolation('Copy');};
    ta.oncut=function(e){e.preventDefault();logEssayViolation('Cut');};
    ta.oncontextmenu=function(e){e.preventDefault();};
    ta.onkeydown=function(e){
      if(e.key==='Tab'&&essayGhostText){e.preventDefault();ta.value+=essayGhostText;block.content=ta.value;updateTheoryWordCount();clearGhost();}
      if(e.key==='Escape') clearGhost();
    };
    // Auto-resize
    ta.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.max(70,this.scrollHeight)+'px';});
    wrap.appendChild(ta);
  }
  return wrap;
}

function makePointRow(block,i,val) {
  var row=document.createElement('div');
  row.className='ab-point-row';
  var num=document.createElement('span');
  num.className='ab-point-num';
  num.textContent=(i+1)+'.';
  var inp=document.createElement('textarea');
  inp.className='ab-point-input';
  inp.dataset.pidx=i;
  inp.placeholder='Point '+(i+1)+'...';
  inp.value=val||'';
  inp.rows=1;
  inp.oninput=function(){block.points[i]=inp.value;updateTheoryWordCount();inp.style.height='auto';inp.style.height=Math.max(32,inp.scrollHeight)+'px';};
  inp.onpaste=function(e){e.preventDefault();logEssayViolation('Paste');};
  inp.oncopy=function(e){e.preventDefault();logEssayViolation('Copy');};
  inp.oncontextmenu=function(e){e.preventDefault();};
  var del=document.createElement('button');
  del.className='ab-point-del';
  del.innerHTML='✕';
  del.onclick=function(){block.points.splice(i,1);renderCurrentQuestion();};
  row.appendChild(num);row.appendChild(inp);row.appendChild(del);
  return row;
}

function buildTable(block) {
  var tbl=document.createElement('table');
  tbl.className='ab-table';
  // Header row
  var thead=document.createElement('thead');
  var htr=document.createElement('tr');
  block.cols.forEach(function(col,ci){
    var th=document.createElement('th');
    var inp=document.createElement('input');
    inp.style.cssText='background:transparent;border:none;color:#c4b5fd;font-size:.72rem;font-weight:800;text-transform:uppercase;outline:none;width:100%;padding:0';
    inp.value=col;
    inp.dataset.colidx=ci;
    inp.oninput=function(){block.cols[ci]=inp.value;};
    th.appendChild(inp);
    htr.appendChild(th);
  });
  // Delete col header
  var thDel=document.createElement('th');
  thDel.style.width='30px';
  htr.appendChild(thDel);
  thead.appendChild(htr);
  tbl.appendChild(thead);
  // Body
  var tbody=document.createElement('tbody');
  block.rows.forEach(function(row,ri){
    var tr=document.createElement('tr');
    block.cols.forEach(function(col,ci){
      var td=document.createElement('td');
      var ta=document.createElement('textarea');
      ta.className='ab-table-cell';
      ta.dataset.row=ri; ta.dataset.col=ci;
      ta.value=(row&&row[ci])||'';
      ta.rows=1;
      ta.oninput=function(){if(!block.rows[ri])block.rows[ri]=[];block.rows[ri][ci]=ta.value;ta.style.height='auto';ta.style.height=Math.max(34,ta.scrollHeight)+'px';};
      ta.onpaste=function(e){e.preventDefault();logEssayViolation('Paste');};
      ta.oncontextmenu=function(e){e.preventDefault();};
      td.appendChild(ta);
      tr.appendChild(td);
    });
    var tdDel=document.createElement('td');
    var delBtn=document.createElement('button');
    delBtn.className='ab-table-row-del';
    delBtn.innerHTML='✕';
    delBtn.onclick=function(){block.rows.splice(ri,1);saveCurrentAnswer();renderCurrentQuestion();};
    tdDel.appendChild(delBtn);
    tr.appendChild(tdDel);
    tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);
  return tbl;
}

function addBlock(type) {
  var q=theoryQuestions[theoryCurrentQ];
  if(!q) return;
  var partIdx=q.activePart||0;
  if(!q.answers[partIdx]) q.answers[partIdx]=[];
  var block={id:nextBlockId(),type:type,content:''};
  if(type==='point') block.points=[''];
  if(type==='table') {block.cols=['Feature','A','B'];block.rows=[['','',''],['','',''],['','','']];
  } else if(type==='steps') { block.steps=['Step 1: ','Step 2: ','Step 3: ']; block.content='';
  } else if(type==='equation') { block.content=''; block.isEquation=true;
  } else if(type==='quote') { block.content=''; block.author='';
  } else if(type==='ledger') { block.cols=['Date','Details','Dr (₦)','Cr (₦)','Balance (₦)'];block.rows=[['','','','',''],['','','','',''],['','','','','']];}
  q.answers[partIdx].push(block);
  var content=document.getElementById('tapContent');
  if(content) {
    content.appendChild(renderBlock(block));
    // Focus first textarea
    var ta=content.querySelector('[data-bid="'+block.id+'"] textarea');
    if(ta) {setTimeout(function(){ta.focus();},60);}
  }
  updateTheoryWordCount();
}

function removeBlock(bid) {
  var q=theoryQuestions[theoryCurrentQ];
  if(!q) return;
  var partIdx=q.activePart||0;
  if(!q.answers[partIdx]) return;
  q.answers[partIdx]=q.answers[partIdx].filter(function(b){return b.id!==bid;});
  var el=document.querySelector('[data-bid="'+bid+'"]');
  if(el) el.remove();
  updateTheoryWordCount();
}

function updateTheoryWordCount() {
  var wc=0;
  var q=theoryQuestions[theoryCurrentQ];
  if(q){
    (q.answers||[]).forEach(function(part){
      (part||[]).forEach(function(b){
        if(b.content) wc+=b.content.trim().split(/\s+/).filter(Boolean).length;
        if(b.points) b.points.forEach(function(p){if(p) wc+=p.trim().split(/\s+/).filter(Boolean).length;});
        if(b.rows) b.rows.forEach(function(r){if(r) r.forEach(function(c){if(c) wc+=c.trim().split(/\s+/).filter(Boolean).length;});});
      });
    });
  }
  var el=document.getElementById('essayWordCount');
  if(el) el.textContent=wc+' words';
  var el2=document.getElementById('tapWordCount');
  if(el2) el2.textContent=wc+' words';
}

function toggleFormat(mode) {
  theoryFormatMode = theoryFormatMode===mode?null:mode;
  ['Bold','Underline','Highlight'].forEach(function(m){
    var btn=document.getElementById('tb'+m);
    if(btn) btn.classList.toggle('on', theoryFormatMode===m.toLowerCase());
  });
}

function togglePlan() {
  var p=document.getElementById('tapPlan');
  if(p){p.style.display=p.style.display==='none'?'block':'none';}
  var btn=document.getElementById('tbPlan');
  if(btn) btn.classList.toggle('on',p&&p.style.display!=='none');
}

function toggleGhost() {
  theoryGhostEnabled=!theoryGhostEnabled;
  var btn=document.getElementById('tbGhost');
  if(btn){btn.classList.toggle('on',theoryGhostEnabled);btn.textContent=theoryGhostEnabled?'💡 AI Suggest':'💡 Suggest Off';}
}

function toggleQuestionPanel() {
  theoryQuestionPanelVisible=!theoryQuestionPanelVisible;
  var col=document.querySelector('.theory-question-col');
  if(col) col.style.display=theoryQuestionPanelVisible?'flex':'none';
  var btn=document.getElementById('tbQuestion');
  if(btn) btn.classList.toggle('on',theoryQuestionPanelVisible);
}

function skipQuestion() {
  saveCurrentAnswer();
  var q=theoryQuestions[theoryCurrentQ];
  if(q && !q.answered) q.skipped=true;
  if(theoryCurrentQ < theoryQuestions.length-1) {
    theoryCurrentQ++;
    renderQBar();
    renderCurrentQuestion();
  } else {
    // Already at last — prompt submit or go to unanswered
    var unanswered=theoryQuestions.findIndex(function(q,i){return !q.answered&&!q.skipped;});
    if(unanswered>=0){switchToQuestion(unanswered);}
    else{if(confirm('All questions answered/skipped. Submit for marking?')) submitEssay();}
  }
}

function essayVisChk(){if(document.hidden&&essayActive)logEssayViolation('Tab switch');}

var ESSAY_DEDUCTIONS={paste:15,copy:5,cut:5,'tab switch':10,'keyboard shortcut':8};
function logEssayViolation(r){
  essayViolations++;
  var deduct=ESSAY_DEDUCTIONS[r.toLowerCase()]||10;
  essayDeductedPct+=deduct;
  if(essayDeductedPct>50) essayDeductedPct=50;
  var ev=document.getElementById('essayViolations'), ec=document.getElementById('essayViolCount');
  if(ev) ev.style.display='flex';
  if(ec) ec.textContent=essayViolations;
  // Toast
  var toast=document.getElementById('essayToast');
  if(!toast){toast=document.createElement('div');toast.id='essayToast';document.body.appendChild(toast);}
  toast.textContent='⚠️ '+r+' detected — −'+deduct+'% deduction ('+essayDeductedPct+'% total)';
  toast.style.opacity='1';
  clearTimeout(toast._to);toast._to=setTimeout(function(){toast.style.opacity='0';},3000);
  if(essayViolations>=3){
    clearInterval(essayTimerInt);essayActive=false;
    document.removeEventListener('visibilitychange',essayVisChk);
    document.removeEventListener('keydown',window._essayKeyGuard,true);
    document.removeEventListener('contextmenu',window._essayCtxBlock);
    setTimeout(function(){alert('⛔ 3 violations — session terminated. Total deduction: '+essayDeductedPct+'%. Auto-submitting.');submitEssay();},200);
  }
}

function installAntiCheat() {
  function essayKeyGuard(e){
    if(!essayActive) return;
    var isCtrl=e.ctrlKey||e.metaKey;
    if(isCtrl&&['c','v','x','u','s','p','f'].includes(e.key.toLowerCase())){
      e.preventDefault();e.stopPropagation();
      if(e.key.toLowerCase()!=='a') logEssayViolation('Keyboard shortcut');
    }
  }
  function essayCtxBlock(e){if(essayActive)e.preventDefault();}
  document.addEventListener('keydown',essayKeyGuard,true);
  document.addEventListener('contextmenu',essayCtxBlock);
  document.addEventListener('visibilitychange',essayVisChk);
  window._essayKeyGuard=essayKeyGuard;
  window._essayCtxBlock=essayCtxBlock;
}

function startEssayTimer() {
  clearInterval(essayTimerInt);
  essayTimerInt=setInterval(function(){
    essaySecs--;
    var m=Math.floor(essaySecs/60), s=essaySecs%60;
    var el=document.getElementById('essayTimer');
    if(el){
      el.textContent=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
      el.classList.toggle('urgent',essaySecs<300);
    }
    // Time alert at 5 min
    var ta=document.getElementById('theoryTimeAlert');
    if(ta) ta.style.display=essaySecs===299?'block':'none';
    // Per-question time suggestion update
    if(essaySecs%30===0) renderQBar();
    if(essaySecs<=0){clearInterval(essayTimerInt);submitEssay();}
  },1000);
}

// Ghost autocomplete for theory blocks
var essayGhostTO=null, essayGhostText='', essayGhostTarget=null;
function triggerTheoryGhost(ta){
  clearTimeout(essayGhostTO);clearGhost();
  if(!ta||ta.value.length<25) return;
  var last=ta.value[ta.value.length-1];
  if(last!==' '&&last!==',') return;
  essayGhostTarget=ta;
  essayGhostTO=setTimeout(function(){fetchGhost(ta.value);},1000);
}
function triggerGhost(text){
  clearTimeout(essayGhostTO);clearGhost();
  if(text.length<25) return;
  var last=text[text.length-1];
  if(last!==' '&&last!==',') return;
  essayGhostTO=setTimeout(function(){fetchGhost(text);},900);
}
async function fetchGhost(text){
  try{
    var res=await fetch('/api/anthropic',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-5',max_tokens:12,system:'Complete the sentence fragment with 3-5 words. Return ONLY the words, nothing else.',messages:[{role:'user',content:text.slice(-120)}]})});
    var data=await res.json();
    var s=(data&&data.content&&data.content[0]&&data.content[0].text||'').trim();
    if(s&&s.split(' ').length<=7){essayGhostText=s;if(essayGhostTarget)showGhost(essayGhostTarget.value,s);}
  }catch(e){}
}
function showGhost(text,ghost){
  var g=document.getElementById('essayGhost');
  if(!g) return;
  var safe=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  g.innerHTML=safe+'<span class="ghost-text">'+ghost+'</span>';
}
function clearGhost(){
  essayGhostText=''; essayGhostTarget=null;
  var g=document.getElementById('essayGhost');
  if(g) g.innerHTML='';
}

function exitEssay(){
  if(essayActive){
    var answered=(theoryQuestions||[]).filter(function(q){return q.answered;}).length;
    showExitConfirmModal(
      'Exit Theory Exam?',
      answered>0
        ?('You have answered '+answered+' question'+(answered>1?'s':'')+'. Submit your work first, or exit and lose it all.')
        :'You have not submitted any answers. Exit now and lose all your work?',
      '🚪 Exit & Lose Work',
      function(){
        clearInterval(essayTimerInt);essayActive=false;
        document.removeEventListener('visibilitychange',essayVisChk);
        if(window._essayKeyGuard) document.removeEventListener('keydown',window._essayKeyGuard,true);
        if(window._essayCtxBlock) document.removeEventListener('contextmenu',window._essayCtxBlock);
        var rs=document.getElementById('essayRulesScreen');
        var ws=document.getElementById('theoryWritingScreen');
        var fs=document.getElementById('essayFeedbackScreen');
        if(ws) ws.style.display='none';
        if(fs) fs.style.display='none';
        if(rs) rs.style.display='flex';
        theoryQuestions=[]; theoryCurrentQ=0;
        if(window._essayExamContext){window._essayExamContext=null;goTo('pg-exam');}
        else goTo('pg-classroom');
      }
    );
    return;
  }
  // Not active — just clean up and go
  clearInterval(essayTimerInt);
  theoryQuestions=[]; theoryCurrentQ=0;
  if(window._essayExamContext){window._essayExamContext=null;goTo('pg-exam');}
  else goTo('pg-classroom');
}

async function submitEssay(){
  saveCurrentAnswer();
  clearInterval(essayTimerInt);essayActive=false;
  document.removeEventListener('visibilitychange',essayVisChk);
  if(window._essayKeyGuard) document.removeEventListener('keydown',window._essayKeyGuard,true);
  if(window._essayCtxBlock) document.removeEventListener('contextmenu',window._essayCtxBlock);

  // Compile all answers
  var answeredQs=theoryQuestions.filter(function(q){return q.answered;});
  if(answeredQs.length===0){alert('Please write at least one answer before submitting.');essayActive=true;return;}

  var ws=document.getElementById('theoryWritingScreen'), fs=document.getElementById('essayFeedbackScreen');
  if(ws) ws.style.display='none';
  if(fs){fs.style.display='flex';fs.style.flexDirection='column';}
  var ld=document.getElementById('efbLoading'), ct=document.getElementById('efbContent');
  if(ld) ld.style.display='block';
  if(ct) ct.style.display='none';
  if(typeof __injectLogos==='function') __injectLogos();

  // Build submission text
  var submissionText='';
  theoryQuestions.forEach(function(q,qi){
    if(!q.answered) return;
    submissionText+='\n\n--- QUESTION '+(qi+1)+' ---\n';
    submissionText+=q.intro+'\n';
    (q.answers||[]).forEach(function(partAns,pi){
      var label=q.parts[pi]?q.parts[pi].label:'';
      if(label) submissionText+='\n'+label+'\n';
      (partAns||[]).forEach(function(b){
        if(b.type==='point'&&b.points){
          b.points.forEach(function(p,i){if(p&&p.trim()) submissionText+=(i+1)+'. '+p+'\n';});
        } else if(b.type==='table'&&b.rows){
          if(b.cols) submissionText+=b.cols.join(' | ')+'\n';
          b.rows.forEach(function(r){submissionText+=(r||[]).join(' | ')+'\n';});
        } else if(b.content&&b.content.trim()){
          submissionText+='['+b.type.toUpperCase()+']: '+b.content.trim()+'\n';
        }
      });
    });
  });

  var ctx=window._essayExamContext;
  var exam=ctx?ctx.exam.toUpperCase():'WAEC';
  var subj=ctx?ctx.subj:(essayTopic?essayTopic.type:'General');
  var yr=essayTopic&&essayTopic.yr?essayTopic.yr:'Past Year';
  // Guard: JAMB has no theory paper at all
  var examKey = (ctx && ctx.exam) ? ctx.exam : 'waec';
  var essayCfg = (typeof getBoardCfg === 'function') ? getBoardCfg(examKey) : {short:'WAEC', longName:'WAEC', body:'WAEC', hasTheory:true};
  if (!essayCfg.hasTheory){
    if (ld) ld.style.display='none';
    if (ct){
      ct.style.display='block';
      ct.innerHTML='<div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.4);border-radius:14px;padding:24px;color:#fecaca;font-size:.9rem;line-height:1.6"><strong>No theory paper for '+essayCfg.short+'.</strong><br><br>'+essayCfg.short+' ('+essayCfg.longName+') is a pure multiple-choice objective examination — there is no essay or theory component.<br><br>Go back to Exam Centre and select <em>Paper 1 (Objective)</em> or <em>Full Mock</em> instead.</div>';
    }
    return;
  }

  try{
    var res=await fetch('/api/anthropic',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      model:'claude-sonnet-4-5',
      max_tokens:1400,
      system:'You are a senior Chief Examiner for '+essayCfg.longName+' ('+essayCfg.short+'), specialising in '+subj+'. You are marking a candidate\'s '+essayCfg.short+' '+subj+' theory/essay answers. Year: '+yr+'.\n\n'+
        '=== CRITICAL: Mark to '+essayCfg.short+' house style, NOT a generic Nigerian board. ===\n'+
        (essayCfg.key === 'waec' ? 'Apply West African Examinations Council standards. Use British English conventions. Reward candidates who follow (a)(b)(c) structure with clear sub-part numbering and show all working for calculations.\n' :
         essayCfg.key === 'neco' ? 'Apply NECO (National Examinations Council) standards. Nigerian federal context. Reward candidates who use NERDC-aligned terminology precisely. Strict on correct spelling of Nigerian place names, proper nouns, and technical terms.\n' :
         essayCfg.key === 'bece' ? 'Apply JSS3 BECE standards at JUNIOR secondary level. Expect shorter answers than SSCE — one or two sentences or a small calculation. Do NOT expect SSCE-length essays.\n' :
         'Apply '+essayCfg.short+' official marking standards.\n')+
        '\nMark using official '+essayCfg.short+' criteria:\n'+
        '- Content/Knowledge (40%): accuracy, relevance, depth of points, correct use of '+essayCfg.short+'-expected terminology\n'+
        '- Organisation/Structure (20%): numbering, sequencing, use of parts a/b/c, tables, definitions\n'+
        '- Expression/Language (30%): clarity, appropriate register, sentence quality\n'+
        '- Mechanical Accuracy (10%): spelling, grammar, punctuation\n\n'+
        'Integrity Deduction: '+essayDeductedPct+'% (exam violations recorded).\n\n'+
        'Format your report as:\n'+
        '## Examiner\'s Report — '+essayCfg.short+' '+subj+'\n'+
        '**Raw Score:** X/100 | **Integrity Deduction:** '+essayDeductedPct+'% | **Final Score:** Y/100 | **Grade:** '+(essayCfg.level==='junior'?'A-F':'A1-F9')+'\n\n'+
        '**Criteria Breakdown:**\n'+
        '- Content (40%): X/40\n'+
        '- Organisation (20%): X/20\n'+
        '- Expression (30%): X/30\n'+
        '- Accuracy (10%): X/10\n\n'+
        '**Chief Examiner\'s Commendations:**\n[what was done well]\n\n'+
        '**Chief Examiner\'s Recommendations:**\n[specific improvements tailored to '+essayCfg.short+']\n\n'+
        '**Examiner\'s Tips for '+essayCfg.short+' '+subj+':**\n[board-specific exam advice — cite typical '+essayCfg.short+' marking patterns]',
      messages:[{role:'user',content:'Mode: '+essayMode+'\nQuestions attempted: '+answeredQs.length+'\n\n'+submissionText}]
    })});
    var data=await res.json();
    var fb=(data&&data.content&&data.content.find(function(b){return b.type==='text';})&&data.content.find(function(b){return b.type==='text';}).text)||'';
    if(ld) ld.style.display='none';
    if(ct){
      ct.style.display='block';
      ct.innerHTML='<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:24px;font-size:.88rem;color:rgba(255,255,255,.78);line-height:1.85">'+
        fb.split('\n').join('<br>').replace(/##\s*(.+)/g,'<h3 style="font-family:Bricolage Grotesque,sans-serif;font-size:1.1rem;font-weight:900;color:#fff;margin:16px 0 8px">$1</h3>')
          .replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e2e8f0">$1</strong>')
          .replace(/^- /gm,'• ')+'</div>';
    }
  }catch(e){
    if(ld) ld.style.display='none';
    if(ct){ct.style.display='block';ct.innerHTML='<p style="color:#f87171">Could not load feedback. Check your API key and connection.</p>';}
  }
}

function tryAnotherEssay(){
  essayTopic=null;
  theoryQuestions=[]; theoryCurrentQ=0; theoryAnsweredCount=0;
  clearInterval(essayTimerInt); essayActive=false;
  if(window._essayKeyGuard) document.removeEventListener('keydown',window._essayKeyGuard,true);
  if(window._essayCtxBlock) document.removeEventListener('contextmenu',window._essayCtxBlock);
  var ctx=!!window._essayExamContext;
  openEssaySection(ctx);
}

var hwHistory=[],hwCurrentClass=null,hwCurrentSubj=null,hwUploadedFile=null,hwIsTyping=false;
var HW_CLASSES=[{l:'P1',n:'Primary 1',s:'primary'},{l:'P2',n:'Primary 2',s:'primary'},{l:'P3',n:'Primary 3',s:'primary'},{l:'P4',n:'Primary 4',s:'primary'},{l:'P5',n:'Primary 5',s:'primary'},{l:'P6',n:'Primary 6',s:'primary'},{l:'JSS1',n:'JSS 1',s:'jss'},{l:'JSS2',n:'JSS 2',s:'jss'},{l:'JSS3',n:'JSS 3',s:'jss'},{l:'SS1',n:'SS 1',s:'sss'},{l:'SS2',n:'SS 2',s:'sss'},{l:'SS3',n:'SS 3',s:'sss'}];
var HW_SYS='You are Lesson Teacher — the personal homework tutor for a Nigerian student in CLASS studying SUBJ. '
  + 'IDENTITY: You are NOT a general-purpose chatbot. You are a strict subject tutor for THIS student\'s class only. '
  + 'AGE & LEVEL: Match your vocabulary, sentence length and examples exactly to a CLASS student. '
  + '   - Primary 1-3: very short sentences, simple words, lots of encouragement. '
  + '   - Primary 4-6: clear simple English, concrete examples, no jargon. '
  + '   - JSS1-3: secondary-school English, introduce technical terms with definitions. '
  + '   - SS1-3: full WAEC/NECO/JAMB-level rigour, exam terminology, mark-scheme thinking. '
  + 'SYLLABUS LOCK: Stay strictly inside the Nigerian NERDC / WAEC / NECO / BECE / Common-Entrance syllabus for SUBJ at CLASS level. '
  + 'If asked about a topic above the student\'s class, briefly say it is for a higher class and bring them back to their level. '
  + 'If asked about a topic outside SUBJ, politely redirect them to the correct subject helper. '
  + 'If asked anything off-topic (gossip, adult content, personal contact, politics, violence, dating, anything unsafe), refuse warmly in one line and steer back to the lesson. '
  + 'TEACHING RULES: (1) NEVER give the final answer first — teach the method. (2) Show each step and explain WHY. '
  + '(3) For essays: guide structure and ideas, never write the essay for them. (4) Use Nigerian real-life context (Lagos traffic, NEPA, market, okada, WAEC, JAMB). '
  + '(5) Match language and examples to CLASS level. (6) End each reply with ONE short check question. '
  + 'SAFETY: Never ask for or accept phone numbers, addresses, social handles, school location, or any personal info. '
  + 'TONE: Warm, sharp, authoritative — like the best teacher they have ever had. 4-6 sentences max in chat. '
  + 'Class: CLASS. Subject: SUBJ.';
function openHomeworkHelper(cls,subj){goTo('pg-homework');setTimeout(function(){hwInit(cls,subj);},80);}
function hwInit(cls,subj){hwHistory=[];hwUploadedFile=null;hwCurrentClass=cls||hwCurrentClass||(typeof chosenClass!=='undefined'?chosenClass:null);hwCurrentSubj=subj||null;hwBuildClassPicker();hwUpdateClassLabel();hwBuildSubjectGrid();var msgs=document.getElementById('hwChatMsgs');if(msgs){msgs.innerHTML='';hwAddMsg('tutor','Good day! I am your Lesson Teacher tutor'+(hwCurrentClass?' for '+hwCurrentClass:'')+'.<br>Ask me any question, upload your assignment, or paste a problem here. I will explain the thinking — not just give you the answer.');}var up=document.getElementById('hwUploadPreview'),uz=document.getElementById('hwUploadZone');if(up)up.style.display='none';if(uz)uz.style.display='block';}
function hwBuildClassPicker(){var g=document.getElementById('hwCpGrid');if(!g)return;g.innerHTML=HW_CLASSES.map(function(cl){return'<button class="hw-cp-btn'+(hwCurrentClass===cl.l?' sel':'')+'" data-l="'+cl.l+'" data-n="'+cl.n+'" onclick="hwPickClass(this.dataset.l,this.dataset.n,this)">'+cl.n+'</button>';}).join('');}
function hwPickClass(l,n,btn){document.querySelectorAll('.hw-cp-btn').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');hwCurrentClass=l;hwUpdateClassLabel();hwBuildSubjectGrid();}
function hwUpdateClassLabel(){var el=document.getElementById('hwClassLabel'),f=HW_CLASSES.find(function(c){return c.l===hwCurrentClass;});if(el)el.textContent=f?f.n:'Set your class';}
function hwBuildSubjectGrid(){var g=document.getElementById('hwSubjGrid');if(!g)return;var f=HW_CLASSES.find(function(c){return c.l===hwCurrentClass;}),sec=f?f.s:'sss';var defs={primary:[{k:'eng',i:'📖',n:'English'},{k:'mth',i:'🧮',n:'Mathematics'},{k:'sci',i:'🔬',n:'Basic Science'},{k:'sst',i:'🌍',n:'Social Studies'},{k:'cmp',i:'💻',n:'Computer Studies'}],jss:[{k:'eng',i:'📖',n:'English'},{k:'mth',i:'🧮',n:'Mathematics'},{k:'bsc',i:'🔬',n:'Basic Science'},{k:'sst',i:'🌍',n:'Social Studies'},{k:'cmp',i:'💻',n:'Computer'},{k:'fre',i:'🇫🇷',n:'French'}],sss:[{k:'eng',i:'📖',n:'English'},{k:'mth',i:'🧮',n:'Mathematics'},{k:'bio',i:'🔬',n:'Biology'},{k:'chm',i:'⚗️',n:'Chemistry'},{k:'phy',i:'⚡',n:'Physics'},{k:'eco',i:'💰',n:'Economics'},{k:'gov',i:'🏛️',n:'Government'},{k:'lit',i:'📚',n:'Literature'}]};var data=(typeof subjectsByClass!=='undefined'&&subjectsByClass[hwCurrentClass])?subjectsByClass[hwCurrentClass].subjects:(defs[sec]||defs.sss);g.innerHTML=data.slice(0,16).map(function(s){return'<button class="hw-subj-btn'+(hwCurrentSubj===s.k?' on':'')+'" data-k="'+s.k+'" data-n="'+s.n+'" onclick="hwSelSubj(this.dataset.k,this.dataset.n)"><span style="font-size:.95rem;width:18px;text-align:center">'+s.i+'</span>'+s.n+'</button>';}).join('');}
function hwSelSubj(k,n){hwCurrentSubj=k;document.querySelectorAll('.hw-subj-btn').forEach(function(b){b.classList.toggle('on',b.dataset&&b.dataset.k===k);});var lbl=document.getElementById('hwContextLabel');if(lbl)lbl.textContent=(hwCurrentClass||'')+(hwCurrentClass?' - ':'')+n+' - Homework Tutor';}
function showHwClassPicker(){hwBuildClassPicker();var p=document.getElementById('hwClassPicker');if(p)p.style.display='flex';}
function hideHwClassPicker(){var p=document.getElementById('hwClassPicker');if(p)p.style.display='none';hwBuildSubjectGrid();}
function hwQuickPrompt(t){var i=document.getElementById('hwInput');if(i){i.value=t;i.focus();}}
function hwHandleUpload(input){var file=input.files[0];if(!file)return;if(file.size>10*1024*1024){alert('File too large. Max 10MB.');return;}var r=new FileReader();r.onload=function(e){var b64=e.target.result.split(',')[1];hwUploadedFile={name:file.name,base64:b64,type:file.type};var fn=document.getElementById('hupFileName'),up=document.getElementById('hwUploadPreview'),uz=document.getElementById('hwUploadZone');if(fn)fn.textContent=file.name;if(up)up.style.display='flex';if(uz)uz.style.display='none';hwAddMsg('tutor','I have received <strong>'+file.name+'</strong>. Ask me anything about it.');};r.readAsDataURL(file);input.value='';}
function hwRemoveUpload(){hwUploadedFile=null;var up=document.getElementById('hwUploadPreview'),uz=document.getElementById('hwUploadZone');if(up)up.style.display='none';if(uz)uz.style.display='block';}
function hwSend(){var inp=document.getElementById('hwInput');if(!inp)return;var msg=inp.value.trim();if(!msg||hwIsTyping)return;inp.value='';hwAddMsg('student',msg);hwHistory.push({role:'user',content:msg});hwFetch(msg);}
async function hwFetch(userMsg){if(hwIsTyping)return;hwIsTyping=true;var msgs=document.getElementById('hwChatMsgs');var t=document.createElement('div');t.id='hwTyping';t.className='hw-msg hw-msg-tutor hw-typing';t.innerHTML='<div class="hw-msg-name">Lesson Teacher</div><div class="hw-bubble"><div class="lt-loading"><div class="ld-dot"></div><div class="ld-dot"></div><div class="ld-dot"></div></div></div>';msgs.appendChild(t);msgs.scrollTop=msgs.scrollHeight;try{var sys=HW_SYS.replace('CLASS',hwCurrentClass||'unknown').replace('SUBJ',hwCurrentSubj||'General');var messages=hwHistory.slice(-14);if(hwUploadedFile){var lm=messages[messages.length-1];var fc=hwUploadedFile.type==='application/pdf'?[{type:'document',source:{type:'base64',media_type:'application/pdf',data:hwUploadedFile.base64}},{type:'text',text:lm.content}]:[{type:'image',source:{type:'base64',media_type:hwUploadedFile.type,data:hwUploadedFile.base64}},{type:'text',text:lm.content}];messages[messages.length-1]={role:'user',content:fc};}var res=await fetch('/api/anthropic',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-5',max_tokens:1200,system:sys,messages:messages})});var data=await res.json();var reply=data&&data.content&&data.content.find(function(b){return b.type==='text';})&&data.content.find(function(b){return b.type==='text';}).text||'';var td=document.getElementById('hwTyping');if(td)td.remove();if(reply){hwHistory.push({role:'assistant',content:reply});hwAddMsg('tutor',reply);}else hwAddMsg('tutor','Could not respond. Please try again.');}catch(e){var td2=document.getElementById('hwTyping');if(td2)td2.remove();hwAddMsg('tutor','Could not connect. Check your internet.');}hwIsTyping=false;}
function hwAddMsg(who,text){var msgs=document.getElementById('hwChatMsgs');if(!msgs)return;var d=document.createElement('div');d.className='hw-msg hw-msg-'+(who==='tutor'?'tutor':'student');var name=who==='tutor'?'\u{1F469}\u{200D}\u{1F3EB} Lesson Teacher':'You';var safe=text.split('\n').join('<br>');safe=safe.replace(/\*{2}(.+?)\*{2}/g,'<strong>$1</strong>');d.innerHTML='<div class="hw-msg-name">'+name+'</div><div class="hw-bubble">'+safe+'</div>';msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}



function buildWelcomeScreen(section, cls, name, term, week){
  // Greeting
  const greet = document.getElementById('wcGreetName');
  const greetSub = document.getElementById('wcGreetSub');
  var streamLabel = '';
  if(chosenSection === 'sss' && chosenStream){
    var streamData = (window.SSS_STREAMS||[]).find(function(s){return s.key===chosenStream;});
    streamLabel = streamData ? ' · ' + streamData.ico + ' ' + streamData.label : '';
  }
  if(greet) greet.textContent = 'Good day, ' + name + '! I am Lesson Teacher.';
  if(greetSub) greetSub.textContent = 'I know your ' + cls + ' textbooks. You are in ' + term + ', Week ' + week + '. Tap a subject below — I will take you straight to the right lesson.';

  // Stats bar
  const weekEl = document.getElementById('wcWeekInfo');
  if(weekEl) weekEl.textContent = 'Wk ' + week;
  const topEl = document.getElementById('wcTopics');
  if(topEl) topEl.textContent = topicsCompleted;

    // Subject grid — all subjects from subjectsByClass
  var grid = document.getElementById('wcSubjGrid');
  var hdr  = document.getElementById('wcSubjHdr');
  // Use stream-specific class for SSS
  var lookupCls2 = cls;
  if(section === 'sss' && chosenStream && chosenStream !== 'science'){
    lookupCls2 = cls + '-' + chosenStream;
  }
  var sbData = subjectsByClass[lookupCls2] || subjectsByClass[cls] || subjectsByClass['SS2'];
  var sbSubjects = sbData ? sbData.subjects : [];
  
  // Colour map for subject prefixes
  var WSB = {
    eng:'wsb-eng',mth:'wsb-mth',bio:'wsb-bio',chm:'wsb-chm',phy:'wsb-phy',
    geo:'wsb-geo',gov:'wsb-gov',eco:'wsb-eco',sci:'wsb-sci',cmp:'wsb-cmp',
    sst:'wsb-sst',biz:'wsb-biz',agr:'wsb-agr',crs:'wsb-crs',lit:'wsb-lit',
    acc:'wsb-acc',phe:'wsb-phe',cca:'wsb-cca',civ:'wsb-civ',hec:'wsb-hec',
    sec:'wsb-sec',fmth:'wsb-fmth',dat:'wsb-dat',his:'wsb-his',fne:'wsb-fne',
    mus:'wsb-mus',fre:'wsb-fre',ara:'wsb-ara',vrb:'wsb-vrb',qtv:'wsb-qtv',
    hnd:'wsb-hnd',yor:'wsb-yor',bst:'wsb-bst',com:'wsb-com',off:'wsb-off',
    ins:'wsb-ins',tdr:'wsb-tdr',
  };
  
  if(hdr) hdr.textContent = '📚 ' + cls + ' Subjects — tap one to begin';
  if(grid && sbSubjects.length){
    grid.innerHTML = sbSubjects.map(function(s){
      var prefix = s.k.split('-')[0];
      var colClass = WSB[prefix] || s.c || 'wsb-sci';
      return '<button class="wc-subj-btn ' + colClass + '" onclick="startFromWelcome(\'' + s.k + '\')">'
        + '<span class="wsb-ico">' + s.i + '</span>'
        + '<span class="wsb-name">' + s.n + '</span>'
        + '<span class="wsb-cls">' + cls + '</span>'
        + '</button>';
    }).join('');
  }

  // AI strip cards
  const aiData = AI_CONTENT[section] || AI_CONTENT.sss;
  const cards = document.getElementById('aiCards');
  if(cards){
    cards.innerHTML = aiData.map(c =>
      '<div class="wc-ai-card">'
      + '<div class="wc-ai-card-ico">' + c.ico + '</div>'
      + '<h5>' + c.title + '</h5>'
      + '<p>' + c.text + '</p>'
      + '</div>'
    ).join('');
  }
}

function guidSection(section, el){
  guidCurrentSection = section;
  document.querySelectorAll('#guidSidebar .sb-item').forEach(i=>i.classList.remove('on'));
  if(el) el.classList.add('on');
  const gc=document.getElementById('guidContent');
  if(!gc) return;

  switch(section){
    case 'overview': renderGuidOverview(gc); break;
    case 'careers':  renderCareers(gc); break;
    case 'universities': renderUniversities(gc); break;
    case 'combos':   renderCombos(gc); break;
    case 'scholarships': renderScholarships(gc); break;
    case 'chat':     renderCounsellorChat(gc); break;
  }
}

function openGuidance(){
  // Refresh live data before rendering
  if(typeof _sessionProgress !== "undefined") _renderProgressBadges();

  closeSidebar();
  const n=studentName||'Student';
  const ga=document.getElementById('guidAvt'); if(ga) ga.textContent=n[0].toUpperCase();
  const gn=document.getElementById('guidName'); if(gn) gn.textContent=n;
  goTo('pg-guidance');
  guidSection('overview', document.querySelector('#guidSidebar .sb-item'));
}

function nextTopic(){
  if(!currentSubject) return;
  const s = SYLLABUS[currentSubject];
  if(!s) return;
  const topics = s.terms[currentTerm]||[];
  if(currentTopicIdx < topics.length - 1){
    loadTopic(currentSubject, currentTerm, currentTopicIdx + 1);
  } else {
    addChatMsg('lt','You have completed all topics for '+currentTerm+'! 🎉 Well done. Choose another term or subject from the sidebar.');
  }
}

function prevTopic(){
  if(!currentSubject) return;
  const s = SYLLABUS[currentSubject];
  if(!s || currentTopicIdx <= 0) return;
  loadTopic(currentSubject, currentTerm, currentTopicIdx - 1);
}

function sendSuggestion(btn){
  const raw = btn.textContent.trim();
  const map = {
    '💡 Explain':  'Explain this topic fully — as if I am hearing it for the first time.',
    '🇳🇬 Example': 'Give me a vivid Nigerian real-life example for this topic.',
    '📝 WAEC Q':   'Show me a real WAEC exam question on this topic with a full answer.',
    '🔢 Worked':   'Walk me through a complete worked example step by step.',
    '🔁 Again':    'Explain this topic again using a completely different approach or analogy.',
  };
  const msg = map[raw] || raw;
  const inp = document.getElementById('chatInp');
  if(inp){ inp.value = msg; sendChat(); }
  btn.classList.add('active');
  setTimeout(()=> btn.classList.remove('active'), 1500);
}

function getAdaptiveContext(){
  const p=studentProfile;
  const acc=p.quizTotal>0?Math.round(p.quizCorrect/p.quizTotal*100):null;
  let ctx='';
  if(p.level==='developing'){
    ctx='This student is still building confidence. Use shorter sentences, simpler words, more encouragement. '
      +'Repeat key points gently. Use very vivid Nigerian analogies they will immediately recognise. '
      +'Never make them feel behind — frame everything as a natural part of learning. ';
  } else if(p.level==='advanced'){
    ctx='This student is performing strongly. Go deeper, use more technical language, '
      +'challenge with harder examples, push towards exam-level thinking. '
      +'Treat them like a top student preparing to excel. ';
  } else {
    ctx='This student is progressing well at a standard pace. Keep explanations clear and thorough. ';
  }
  if(p.struggleTopics.length) ctx+=`They find these topics harder: ${p.struggleTopics.slice(-3).join(', ')}. Be extra patient. `;
  if(p.strongTopics.length) ctx+=`Strong on: ${p.strongTopics.slice(-3).join(', ')}. Use as bridges to new concepts. `;
  if(acc!==null) ctx+=`Quiz accuracy: ${acc}%. `;
  return ctx;
}

function getAdaptiveLessonStyle(){
  if(studentProfile.level==='developing'){
    return 'STYLE: Very short paragraphs. Nigerian analogy before technical definition. '
      +'Encourage after every section. Worked examples must be very small-step — never skip a step. ';
  }
  if(studentProfile.level==='advanced'){
    return 'STYLE: More concise — they fill in gaps. Exam-quality questions. '
      +'Push with: "Here is the part only the best students get right..." '
      +'Connect to university-level ideas briefly. ';
  }
  return '';
}

function resetTimetable(){
  const saved=document.getElementById('ttSaved');
  const btn=document.getElementById('ttToggleBtn');
  if(saved) saved.style.display='none';
  if(btn){btn.style.display='inline-block';btn.textContent='Set Up ↓';}
}

function saveTimetable(){
  studentTimetable={};
  document.querySelectorAll('.tt-subj-chip.on').forEach(chip=>{
    const d=chip.dataset.day, k=chip.dataset.key;
    if(!studentTimetable[d]) studentTimetable[d]=[];
    studentTimetable[d].push(k);
  });
  try{ localStorage.setItem('lt_tt_'+studentName, JSON.stringify(studentTimetable)); }catch(e){}
  const body=document.getElementById('ttBody');
  const saved=document.getElementById('ttSaved');
  const btn=document.getElementById('ttToggleBtn');
  if(body) body.style.display='none';
  if(saved) saved.style.display='block';
  if(btn) btn.style.display='none';
  showTodayTimetableHint();
}

function showIntegrityOverlay(type, count, remaining, context){
  document.getElementById('integrityOverlay')?.remove();

  const labels = {
    tab_switch: { icon:'👁️', title:'Tab Switch Detected', msg:'You left this page during your assessment.' },
    focus_loss: { icon:'🖥️', title:'Window Focus Lost',   msg:'You switched to another application.' },
    devtools:   { icon:'🔧', title:'Developer Tools Detected', msg:'Browser developer tools were opened.' },
  };
  const info     = labels[type] || { icon:'⚠️', title:'Integrity Violation', msg:'An unexpected action was detected.' };
  const isLast   = remaining <= 0;
  const isWarn   = count >= 2;
  const colTitle = isLast ? '#f87171' : isWarn ? '#fb923c' : '#fbbf24';
  const colBtn   = isLast ? '#dc2626' : '#3b82f6';

  const overlay = document.createElement('div');
  overlay.id = 'integrityOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:99997;backdrop-filter:blur(6px)';

  overlay.innerHTML = `
    <div style="background:#12151e;border:2px solid ${isLast?'#dc2626':'#d97706'};border-radius:20px;padding:36px 40px;max-width:460px;width:90%;text-align:center;animation:intShake .4s ease;font-family:inherit">
      <div style="font-size:2.8rem;margin-bottom:14px">${info.icon}</div>
      <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:1.25rem;font-weight:800;color:${colTitle};margin-bottom:10px">${info.title}</div>
      <div style="font-size:.9rem;color:rgba(255,255,255,.65);line-height:1.7;margin-bottom:8px">${info.msg}</div>
      <div style="background:rgba(255,255,255,.06);border-radius:10px;padding:12px 16px;margin:14px 0;font-size:.85rem;color:rgba(255,255,255,.55)">
        Violation <strong style="color:${colTitle}">${count}</strong> of <strong style="color:rgba(255,255,255,.8)">${count + remaining}</strong>
        ${!isLast ? ` · <span style="color:#fbbf24">${remaining} warning${remaining!==1?'s':''} remaining</span>` : ''}
      </div>
      <div style="font-size:.88rem;color:rgba(255,255,255,.6);line-height:1.65;margin-bottom:22px">
        ${isLast
          ? '<strong style="color:#f87171">Your assessment has been terminated.</strong><br>Lesson Teacher has recorded this session. Academic integrity is essential for WAEC, NECO, and JAMB success — practise it now.'
          : 'This has been recorded. Please <strong style="color:#fff">stay on this page</strong> and focus on your assessment. Do not open other tabs, applications, or developer tools.'}
      </div>
      ${!isLast ? `<button onclick="document.getElementById('integrityOverlay').remove();${context==='exam'&&'if(window._resumeExamTimer)window._resumeExamTimer();'}" style="background:${colBtn};color:#fff;border:none;border-radius:10px;padding:11px 26px;font-size:.92rem;font-weight:800;cursor:pointer;font-family:inherit;width:100%">${isWarn?'⚠️ Final Warning — I Understand':'I Understand — Continue Assessment'}</button>` : ''}
    </div>`;

  document.body.appendChild(overlay);
}

function openExamCentre(){
  closeSidebar();
  goTo('pg-exam');
}

function getEffectiveElapsed(){return 0;}
function getViolations(){return 0;}
function isActive(){return false;}

// ══════════════════════════════════════════════════════════════
// EXAM ENGINE — Question rendering and session management
// ══════════════════════════════════════════════════════════════

async function startExamSession(){
  const ec=document.getElementById('examContent');
  if(!ec||!currentExamSubj) return;
  // Show "How Objective Questions work" tour (skippable, with help button)
  if (typeof window.maybeShowLtTour === 'function') window.maybeShowLtTour('objective');
  const subjName=(EXAM_SUBJECTS[currentExam]||[]).find(s=>s.k===currentExamSubj)?.n||currentExamSubj;
  const exam=currentExam.toUpperCase();
  const numQ=window._examNumQ||50;
  window._examNumQ=null;
  const isTimed=(window._waecPaper===1||window._waecPaper===0||numQ>=50);
  const examMode=(window._waecPaper===1||window._waecPaper===0)?'exam':'practice';
  try{if(typeof IntegritySystem!=='undefined')IntegritySystem.start({mode:'exam',maxViolations:3,onViolation:function(){},onTerminate:function(){}});}catch(e){}

  // ── Try real question bank FIRST (instant, no API needed) ──
  var subjKey=currentExamSubj||'';
  var bankQs=typeof getRealBankQuestions==='function'?getRealBankQuestions(subjKey,Math.min(numQ,25)):[];
  if(bankQs.length>=5){
    // We have real questions — launch immediately without API call
    var finalQs=typeof shuffleArray==='function'?shuffleArray(bankQs).slice(0,Math.min(numQ,bankQs.length)):bankQs.slice(0,Math.min(numQ,bankQs.length));
    var loadHtml='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;padding:30px;text-align:center">'
      +'<div style="margin-bottom:12px"><img src="logo.png" style="height:40px;width:auto"></div>'
      +'<div style="font-family:Bricolage Grotesque,sans-serif;font-weight:800;color:#fff;margin-bottom:6px">'+exam+' · '+subjName+'</div>'
      +'<div style="font-size:.8rem;color:rgba(255,255,255,.5);margin-bottom:16px">'+finalQs.length+' real past questions loaded</div>'
      +'<div class="lt-loading" style="justify-content:center"><div class="ld-dot"></div><div class="ld-dot"></div><div class="ld-dot"></div></div>'
      +'</div>';
    ec.innerHTML=loadHtml;
    setTimeout(function(){
      if(typeof launchExamSession==='function') launchExamSession(finalQs,isTimed,numQ,subjName,exam,examMode);
    },500);
    return;
  }
  var cfg = getBoardCfg(currentExam);
  var isJuniorExam = cfg.level === 'junior' || cfg.level === 'primary';
  var examClr=cfg.color;
  ec.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:420px;padding:40px;text-align:center">
    <div style="position:relative;margin-bottom:28px">
      <div style="width:120px;height:80px;border-radius:22px;background:${examClr}18;border:2px solid ${examClr}33;display:flex;align-items:center;justify-content:center;animation:pulse 1.5s ease-in-out infinite"><img src="logo.png" style="height:50px;width:auto"></div>
      <div style="position:absolute;inset:-6px;border-radius:26px;border:2px solid ${examClr}22;animation:spin 2s linear infinite"></div>
    </div>
    <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:1.25rem;font-weight:900;color:#fff;margin-bottom:8px">${exam} · ${subjName}</div>
    <div style="font-size:.84rem;color:rgba(255,255,255,.45);margin-bottom:6px;font-weight:600">${examMode==='exam'?'Paper 1 — Objective · '+numQ+' questions · '+(isTimed?'50 min timed':'Untimed'):'Practice Mode · 25 questions · Full explanations'}</div>
    <div style="font-size:.74rem;color:rgba(255,255,255,.3);margin-bottom:28px">Tailoring questions to your progress…</div>
    <div class="lt-loading" style="justify-content:center"><div class="ld-dot"></div><div class="ld-dot"></div><div class="ld-dot"></div></div>
    <style>
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
    </style>
  </div>`;

  const years=PAST_YEARS[currentExam]||[2023,2022,2021];
  const yearLabel=currentExamYear?'Focus on year '+currentExamYear+'.':'Mix questions from 2016–2023.';
  const batchSize=Math.min(numQ,25);
  var levelNote;
  if (cfg.level === 'primary'){
    levelNote = 'IMPORTANT: These questions are for PRIMARY 6 level (ages 10-11) for the National Common Entrance Examination into Federal Unity Colleges. Use very simple, clear language a 10-year-old can read. Use small numbers, familiar contexts (school, home, market, playground). No trick questions.';
  } else if (cfg.level === 'junior'){
    levelNote = 'IMPORTANT: These questions are for JUNIOR SECONDARY (JSS 3) level, ages 13-15, following the NERDC Basic Education Curriculum. Vocabulary and cognitive demand must match a 14-year-old. Use contexts a Nigerian JSS3 student relates to.';
  } else {
    levelNote = 'These are Senior Secondary School (SS) level questions for '+cfg.short+' — Nigerian national standard, NERDC-aligned.';
  }
  // Assemble board-specific style notes for the AI
  var styleBlock = cfg.styleNotes.map(function(s, i){ return (i+1) + '. ' + s; }).join('\n');
  // Option letters (critical: NECO/BECE/NCEE use A-E, not A-D)
  var optLetters = cfg.options.join(', ');
  var optJoined = cfg.options.join('');  // e.g. "ABCDE"
  var optPairs = cfg.options.map(function(L){ return '"'+L+'":"option text"'; }).join(',');
  // Example JSON matching the actual option count for this board
  var exampleOpts = cfg.options.map(function(L, i){
    var sample = ['First option','Second option','Third option','Fourth option','Fifth option'][i] || 'option';
    return '"'+L+'":"'+sample+'"';
  }).join(',');
  var exampleAns = cfg.options[1]; // "B" for 4-opt, "B" for 5-opt

  // ─────── ADAPTIVE PATH (growth-aware) ───────
  // If syllabus data is loaded for this board/subject, let the growth engine
  // build a topic-targeted prompt. Otherwise fall back to the generic prompt.
  var adaptive = null;
  try {
    if (typeof window.ltBuildAdaptivePrompt === 'function' &&
        typeof window.getAllTopics === 'function' &&
        window.getAllTopics(currentExam, currentExamSubj).length > 0){
      console.log('Building adaptive prompt for', currentExam, currentExamSubj);
      adaptive = await window.ltBuildAdaptivePrompt(
        currentExam, currentExamSubj, subjName, batchSize, currentExamYear, cfg
      );
      console.log('Adaptive prompt built successfully');
    } else {
      console.log('No adaptive syllabus, using generic prompt');
    }
  } catch(e){ 
    console.error('Adaptive prompt builder failed:', e); 
    adaptive = null; 
  }

  var prompt;
  var topicAssignments = null; // for tagging questions post-generation
  if (adaptive && adaptive.prompt){
    prompt = adaptive.prompt;
    topicAssignments = adaptive.topicMap;
  } else {
    prompt = 'Generate exactly '+batchSize+' '+cfg.short+' '+subjName+' multiple-choice past-paper questions.\n\n'
      +'=== EXAM BOARD: '+cfg.longName+' ('+cfg.short+') ===\n'
      +yearLabel+'\n'
      +levelNote+'\n\n'
      +'=== '+cfg.short+'-SPECIFIC RULES (MUST FOLLOW) ===\n'
      +styleBlock+'\n\n'
      +'=== STRICT FORMAT RULES ===\n'
      +'1. Match real '+cfg.short+' past paper difficulty, style and curriculum EXACTLY — not a generic "Nigerian exam".\n'
      +'2. Cover the full official '+cfg.short+' '+subjName+' syllabus — spread across major topics.\n'
      +'3. EVERY question MUST have EXACTLY '+cfg.options.length+' options: '+optLetters+'. All must be plausible distractors.\n'
      +'   — '+cfg.short+' uses '+cfg.options.length+' options. Do NOT use '+(cfg.options.length===4?'5':'4')+' options under any circumstance.\n'
      +'4. The "ans" field is exactly ONE letter from: '+optLetters+'.\n'
      +'5. Return ONLY a raw JSON array — no markdown fences, no text outside the array.\n\n'
      +'=== OUTPUT FORMAT ===\n'
      +'[{"yr":2022,"topic":"topic name","q":"Question text","opts":{'+exampleOpts+'},"ans":"'+exampleAns+'","exp":"Why '+exampleAns+' is correct. Why other options are wrong.","diff":"medium"}]';
  }

  try{
    console.log('Calling API with prompt length:', prompt.length);
    const res=await fetch('/api/anthropic',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-5',
        max_tokens:8000,
        system:'You are a senior '+cfg.longName+' ('+cfg.short+') examiner and past-paper specialist — you have marked '+cfg.short+' '+subjName+' papers for over a decade and know the exact house style, distractor patterns, and syllabus emphasis of THIS specific board. You do NOT confuse '+cfg.short+' with other Nigerian boards. You NEVER write questions in another board\'s style. Return ONLY raw JSON arrays when asked. Never include markdown or text outside the JSON.',
        messages:[{role:'user',content:prompt}]
      })
    });
    console.log('API response status:', res.status);
    if(!res.ok){
      console.error('API returned error status:', res.status, res.statusText);
      throw new Error('API error: ' + res.status);
    }
    const data=await res.json();
    console.log('API response data:', data);
    const raw=data?.content?.find(b=>b.type==='text')?.text||'';
    console.log('Extracted text length:', raw.length);
    if(raw.length > 0){
      console.log('First 500 chars:', raw.slice(0, 500));
    }
    const questions=fixExamJSON(raw);
    console.log('Parsed questions:', questions ? questions.length + ' questions' : 'NULL');
    if(questions&&questions.length){
      examSession={
        questions:questions.map(function(q){
          var opts=q.options||q.opts||{};
          // Build option map based on current board's option letters (4 or 5)
          var norm = {};
          cfg.options.forEach(function(L){
            var lower = L.toLowerCase();
            norm[L] = opts[L] || opts[lower] || '';
          });
          // Safety net for 4-option boards only
          if (cfg.options.length === 4 && !norm.D && norm.A && norm.B && norm.C) norm.D='None of the above';
          return{
            year:q.year||q.yr||'',
            topic:q.topic||'',
            tid:q.tid||q.topic_id||'',       // topic ID for mastery tracking
            bloom:q.bloom||'',                // bloom level (optional, inferred from topic if missing)
            question:q.question||q.q||'',
            options:norm,
            answer:(q.answer||q.ans||'A').toUpperCase(),
            explanation:q.explanation||q.exp||'',
            difficulty:q.difficulty||q.diff||'medium'
          };
        }),
        current:0,correct:0,answered:0,answers:[],
        timer:null,timeLeft:isTimed?numQ*60:0,
        subj:subjName,exam,mode:examMode,
        // growth tracking
        boardKey: currentExam,
        subjKey: currentExamSubj,
        topicAssignments: topicAssignments
      };
      window._waecPaper=null;
      renderExamQuestion();
      if(isTimed) startExamTimer();
      // Show score chip
      var sc=document.getElementById('examScoreChip');
      if(sc){sc.style.display='flex';sc.textContent='0% · 0/'+questions.length;}
    } else {
      console.error('No questions parsed from response. Raw length:', raw.length);
      if(raw.length > 0){
        console.error('Raw response:', raw.slice(0, 1000));
      }
      ec.innerHTML='<div style="padding:40px;text-align:center"><div style="font-size:2rem;margin-bottom:12px">⚠️</div><div style="color:rgba(255,255,255,.6);margin-bottom:16px">Could not parse questions from AI.<br>Open console (F12) to see details.</div><button onclick="ecGoStep(2)" style="background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:10px 22px;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit">← Back</button></div>';
    }
  }catch(e){
    console.error('Exception in startExamSession:', e);
    console.error('Stack:', e.stack);
    ec.innerHTML='<div style="padding:40px;text-align:center"><div style="font-size:2rem;margin-bottom:12px">⚠️</div><div style="color:rgba(255,255,255,.6);margin-bottom:16px">Error: '+e.message+'<br>Open console (F12) for details.</div><button onclick="ecGoStep(2)" style="background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:10px 22px;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit">← Back</button></div>';
  }
}

function fixExamJSON(str){
  if(!str) return null;
  
  // Strip markdown fences first
  let s=str.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```\s*$/,'').trim();
  
  // Try to find a JSON array - use a more careful extraction
  // Look for the first [ and try to find its matching ]
  let arrStart = s.indexOf('[');
  if(arrStart === -1) {
    console.warn('No [ found in response');
    return null;
  }
  
  // Find the matching closing bracket by counting depth
  let depth = 0, arrEnd = -1;
  for(let i = arrStart; i < s.length; i++){
    if(s[i] === '[') depth++;
    if(s[i] === ']') {
      depth--;
      if(depth === 0){ arrEnd = i; break; }
    }
  }
  
  if(arrEnd === -1){
    console.warn('No matching ] found');
    return null;
  }
  
  s = s.slice(arrStart, arrEnd + 1);
  
  // Clean up the JSON
  s=s.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"');
  s=s.replace(/,(\s*[}\]])/g,'$1');
  s=s.replace(/"((?:[^"\\]|\\.)*)"/g,function(m,inner){
    return '"'+inner.replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t')+'"';
  });
  
  try{
    let parsed = JSON.parse(s);
    if(Array.isArray(parsed) && parsed.length > 0) return parsed;
    console.warn('Parsed but not a non-empty array:', parsed);
    return null;
  }
  catch(e){
    console.warn('JSON.parse failed:', e.message, 'Trying fallback extraction');
    // Fallback: extract individual question objects
    var qs=[];
    var objRx=/\{[^{}]*"(?:q|question)"[^{}]*\}/g;
    var m;
    while((m=objRx.exec(s))!==null){
      try{qs.push(JSON.parse(m[0]));}
      catch(e2){console.warn('Failed to parse question object:', m[0].slice(0,100));}
    }
    if(qs.length > 0) console.log('Fallback extraction got', qs.length, 'questions');
    return qs.length>0?qs:null;
  }
}

function buildQNumPanel(cur){
  var qs=examSession?examSession.questions:[];
  var total=qs.length;
  var isPractice=examSession&&examSession.mode==='practice';
  var html='<div class="ep-qnum-panel-lbl">Questions</div>';
  // For Paper 1 — show numbered obj buttons
  // For practice — no essay section
  var objEnd=total; // default all obj
  if(!isPractice && total>45) objEnd=50; // standard WAEC: 50 obj
  for(var i=0;i<Math.min(total,50);i++){
    var ans=examSession.answers&&examSession.answers[i];
    var q2=qs[i]||{};
    var isCorrect=ans&&ans===q2.answer;
    var isWrong=ans&&ans!==q2.answer;
    var cls='ep-qnum-btn'+(i===cur?' current':isCorrect?' answered':isWrong?' wrong':ans?' answered':'');
    html+='<button class="'+cls+'" onclick="jumpToQuestion('+i+')">'+(i+1)+'</button>';
  }
  return html;
}
function jumpToQuestion(idx){
  if(!examSession||!examSession.questions[idx]) return;
  examSession.current=idx;
  renderExamQuestion();
}

function renderExamQuestion(){
  var ec=document.getElementById('examContent');if(!ec)return;
  var qs=examSession.questions,cur=examSession.current,q=qs[cur];
  if(!q){renderExamResults();return;}
  var total=qs.length,cor=examSession.correct,ans=examSession.answered;
  var pct=ans>0?Math.round(cor/ans*100):0;
  var prog=Math.round((cur+1)/total*100);
  var exam=examSession.exam,subj=examSession.subj;
  var isLast=cur+1>=total;
  var opts=q.options||{};
  // Use the BOARD_CONFIG option letters so NECO/BECE/NCEE show A–E, others show A–D
  var cfgRender = typeof getBoardCfg === 'function' ? getBoardCfg(currentExam) : {options:['A','B','C','D']};
  var optKeys = cfgRender.options.filter(function(k){return opts[k];});
  var isPractice=examSession.mode==='practice';

  // Generate a plausible candidate index number for the booklet
  if(!window._examIndex){
    var rnd=function(n){return Math.floor(Math.random()*Math.pow(10,n)).toString().padStart(n,'0');};
    window._examIndex=rnd(4)+rnd(6);
  }
  var idx=window._examIndex;
  var idxBoxes='';
  for(var c=0;c<10;c++) idxBoxes+='<span>'+idx[c]+'</span>';

  // Paper code mapping
  var paperCodes={
    chm:'0511 / 2', phy:'0513 / 2', bio:'0510 / 2', mth:'0501 / 2',
    eng:'0502 / 2', fmth:'0508 / 2', eco:'0504 / 2', govt:'0505 / 2',
    acc:'0503 / 2', agr:'0506 / 2', bio2:'0510 / 2', crs:'0507 / 2',
    geo:'0515 / 2', lit:'0516 / 2', bsc:'0520 / 2', civ:'0521 / 2'
  };
  var pCode=paperCodes[currentExamSubj]||paperCodes[window.currentExamSubj]||'0500 / 1';

  // Board name mapping
  var boardNames={
    WAEC:'THE WEST AFRICAN EXAMINATIONS COUNCIL',
    NECO:'THE NATIONAL EXAMINATIONS COUNCIL',
    JAMB:'JOINT ADMISSIONS &amp; MATRICULATION BOARD',
    BECE:'BASIC EDUCATION CERTIFICATE EXAMINATION',
    CE:'COMMON ENTRANCE EXAMINATION'
  };
  var boardTitle=boardNames[exam]||'THE WEST AFRICAN EXAMINATIONS COUNCIL';
  var boardMain=(exam==='JAMB')?'Unified Tertiary Matriculation Examination':
                (exam==='BECE')?'Junior Secondary Certificate Examination':
                (exam==='CE')?'Primary School Leaving Certificate':
                'Senior Secondary Certificate Examination';

  // Score chip update
  var sc=document.getElementById('examScoreChip');
  if(sc){sc.style.display='flex';sc.textContent=pct+'% · '+ans+'/'+total;}

  // Subject-relevant toolkit
  var subj_key=currentExamSubj||window.currentExamSubj||'';
  var toolkitHtml=buildSubjectToolkit(subj_key);

  // Question number side panel (keep existing behaviour)
  // Don't show the side panel in booklet mode — it breaks the paper look.
  // Users can navigate with Next button; we'll add a quick-jump dropdown later.

  // --- Render the booklet ---
  ec.innerHTML=
    toolkitHtml
    +'<article class="ep-booklet">'
      +'<svg class="ep-booklet-watermark" aria-hidden="true"><use href="#lt-crest-ticked"/></svg>'

      // Header
      +'<header class="epb-head">'
        +'<div class="epb-head-crest">'
          +'<svg width="58" height="58" viewBox="0 0 64 64"><use href="#lt-crest-ticked"/></svg>'
        +'</div>'
        +'<div class="epb-head-title">'
          +'<div class="epb-head-overtitle">'+boardTitle+'</div>'
          +'<div class="epb-head-main">'+boardMain+'</div>'
          +'<div class="epb-head-sub">'+(isPractice?'Practice Mode · Immediate Marking':'Timed Examination · Paper 1 — Objective')+'</div>'
        +'</div>'
        +'<div class="epb-head-paper">'
          +'<div class="epb-head-p-code">Paper Code</div>'
          +'<div class="epb-head-p-v">'+pCode+'</div>'
        +'</div>'
      +'</header>'

      // Particulars
      +'<div class="epb-part">'
        +'<div class="epb-part-col">'
          +'<div class="epb-part-k">Subject</div>'
          +'<div class="epb-part-v">'+subj+'</div>'
        +'</div>'
        +'<div class="epb-part-col">'
          +'<div class="epb-part-k">Year</div>'
          +'<div class="epb-part-v">'+(q.year||'Mixed')+'</div>'
        +'</div>'
        +'<div class="epb-part-col">'
          +'<div class="epb-part-k">Duration</div>'
          +'<div class="epb-part-v">'+(isPractice?'Untimed':'50 min')+'</div>'
        +'</div>'
        +'<div class="epb-part-col">'
          +'<div class="epb-part-k">Index №</div>'
          +'<div class="epb-part-idx">'+idxBoxes+'</div>'
        +'</div>'
      +'</div>'

      // Section bar
      +'<div class="epb-section-bar">'
        +'<span class="sec-lbl">Section A — Objective Questions</span>'
        +'<span class="sec-progress">'+String(cur+1).padStart(2,'0')+' / '+String(total).padStart(2,'0')+'  ·  '+pct+'%</span>'
      +'</div>'

      // Question
      +'<div class="epb-q-area">'
        +(q.topic?'<div class="epb-q-topic">'+q.topic+'</div>':'')
        +'<div class="epb-q-head-row">'
          +'<span class="epb-q-num">'+(cur+1)+'.</span>'
          +'<span class="epb-q-meta">'+exam+(q.year?' · '+q.year:'')+(q.diff?' · '+q.diff:'')+'</span>'
          +'<span class="epb-q-marks">[1 mark]</span>'
        +'</div>'
        +'<div class="epb-q-text">'+q.question+'</div>'
      +'</div>'

      // Options
      +'<div class="epb-options" id="epOptions">'
      +optKeys.map(function(k){
        return '<button class="epb-opt" data-opt="'+k+'" onclick="submitExamAnswer(this.dataset.opt)">'
          +'<span class="epb-opt-ltr">'+k+'</span>'
          +'<span class="epb-opt-txt">'+opts[k]+'</span>'
          +'</button>';
      }).join('')
      +'</div>'

      // Explanation slot
      +'<div id="epExp"></div>'

      // Footer
      +'<footer class="epb-foot" id="epFoot">'
        +'<span>Page <b>'+String(cur+1).padStart(2,'0')+'</b> / '+String(total).padStart(2,'0')+'</span>'
        +'<span class="epb-foot-code">Lesson Teacher · '+exam+' · '+(subj_key||'').toUpperCase()+' · '+(q.year||'MIX')+'</span>'
        +'<div class="epb-foot-actions" id="epNav" style="display:none">'
          +(isPractice?'<button class="epb-foot-skip" onclick="nextExamQ()">Skip</button>':'')
          +'<button class="epb-foot-next" onclick="nextExamQ()">'+(isLast?'Submit Paper →':'Turn over →')+'</button>'
        +'</div>'
      +'</footer>'

    +'</article>';
}

function submitExamAnswer(chosen){
  if(!examSession)return;
  var q=examSession.questions[examSession.current];if(!q)return;
  var ok=chosen===q.answer;
  examSession.answered++;if(ok)examSession.correct++;
  if(examSession.answers)examSession.answers[examSession.current]=chosen;

  // ── Growth tracking: record per-topic mastery ──
  try {
    if (typeof window.MasteryTracker !== 'undefined' && examSession.boardKey && examSession.subjKey){
      var tid = q.tid || '';
      var bloom = q.bloom || 'apply';
      // Fallback: if question is missing tid, try to match by topic name against assignments
      if (!tid && examSession.topicAssignments){
        var match = examSession.topicAssignments.find(function(a){
          return a.topic && (a.topic.name === q.topic || (q.topic||'').toLowerCase().indexOf((a.topic.name||'').toLowerCase())>=0);
        });
        if (match){ tid = match.topic.id; bloom = match.topic.bloom || bloom; }
      }
      if (tid){
        // fire-and-forget (debounced save inside tracker)
        window.MasteryTracker.record(examSession.boardKey, examSession.subjKey, tid, bloom, ok);
      }
    }
  } catch(e){ /* never block the UI on tracking */ }

  document.querySelectorAll('.epb-opt').forEach(function(b){
    b.disabled=true;
    var opt=b.dataset.opt;
    if(opt===q.answer)b.classList.add('epb-opt-correct');
    else if(opt===chosen&&!ok)b.classList.add('epb-opt-wrong');
    else b.style.opacity='0.5';
  });
  var pct=examSession.answered>0?Math.round(examSession.correct/examSession.answered*100):0;
  var sc=document.getElementById('examScoreChip');
  if(sc)sc.textContent=pct+'% · '+examSession.answered+'/'+examSession.questions.length;
  if(ok&&typeof updateXP==='function')updateXP(15);
  var isPractice=examSession.mode==='practice';
  var isLast=examSession.current+1>=examSession.questions.length;
  var expEl=document.getElementById('epExp');
  var navEl=document.getElementById('epNav');

  if(isPractice&&expEl){
    expEl.innerHTML='<div class="epb-exp">'
      +'<div class="epb-exp-inner">'
      +'<div class="epb-exp-verdict '+(ok?'epb-verd-ok':'epb-verd-no')+'">'
      +(ok?'✓ Correct. Full marks awarded.':'✗ Wrong. Correct answer is ('+q.answer+') '+((q.options&&q.options[q.answer])||'')+'.')
      +'</div>'
      +'<div class="epb-exp-body"><strong>Marking scheme:</strong> '+(q.explanation||'No explanation available.')+'</div>'
      +'</div>'
      +'</div>';
    if(navEl)navEl.style.display='flex';
  } else {
    if(expEl){
      expEl.innerHTML='<div class="epb-exp" style="background:'+(ok?'rgba(22,130,82,.08)':'rgba(224,58,47,.08)')+'">'
        +'<div class="epb-exp-inner">'
        +'<div class="epb-exp-verdict '+(ok?'epb-verd-ok':'epb-verd-no')+'">'
        +(ok?'✓ Correct':'✗ ('+q.answer+') '+((q.options&&q.options[q.answer])||''))
        +(isLast?'':' <span style="font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:500;color:rgba(10,15,26,.5);margin-left:12px">Turning over in 1.4s…</span>')
        +'</div>'
        +'</div>'
        +'</div>';
    }
    if(isLast){if(navEl)navEl.style.display='flex';}
    else setTimeout(function(){nextExamQ();},1400);
  }
}

function nextExamQ(){
  if(!examSession)return;
  examSession.current++;
  if(examSession.current>=examSession.questions.length)renderExamResults();
  else renderExamQuestion();
}

function skipToNext(){nextExamQ();}

function renderExamResults(){
  var ec=document.getElementById('examContent');if(!ec||!examSession)return;
  try{if(typeof IntegritySystem!=='undefined')IntegritySystem.stop();}catch(e){}
  var total=examSession.questions.length,cor=examSession.correct;
  var wrong=total-cor,pct=total>0?Math.round(cor/total*100):0,pass=pct>=50;
  var grade=pct>=80?'A1':pct>=75?'A2':pct>=70?'B2':pct>=65?'B3':pct>=60?'C4':pct>=55?'C5':pct>=50?'C6':pct>=45?'D7':pct>=40?'E8':'F9';
  var cfgR = typeof getBoardCfg === 'function' ? getBoardCfg((examSession.exam||'WAEC').toLowerCase()) : {color:'#2563eb', key:'waec', level:'senior'};
  var examClr = cfgR.color;
  var gradeClr=pct>=60?'#4ade80':pct>=50?'#fbbf24':'#f87171';
  var advice=pct>=80?'Excellent! You are well prepared for the real exam.':pct>=60?'Good performance. Review the questions you missed and practise more.':pct>=50?'Borderline pass. Focus on weak topics before the real exam.':'Keep studying. Go back to your lessons and retry this paper.';
  // Review missed questions (last 4)
  var wrongQs=(examSession.questions||[]).filter(function(q,i){
    return examSession.answers&&examSession.answers[i]&&examSession.answers[i]!==q.answer;
  }).slice(0,4);
  var reviewHtml=wrongQs.length?'<div class="er-review"><div class="er-review-hdr">📝 Questions You Missed</div>'
    +wrongQs.map(function(q){
      return '<div class="er-review-q">'
        +'<div class="er-review-qtext">'+q.question.slice(0,130)+(q.question.length>130?'…':'')+'</div>'
        +'<div class="er-review-ans">Answer: <strong style="color:#4ade80">('+q.answer+') '+((q.options&&q.options[q.answer])||'')+'</strong></div>'
        +'</div>';
    }).join('')+'</div>':'';
  // Update topbar score
  var sc=document.getElementById('examScoreChip');
  if(sc)sc.textContent=pct+'% · Grade '+grade;
  ec.innerHTML='<div class="exam-results">'
    +'<div class="er-hdr">'
      +'<div class="er-ring '+(pass?'er-ring-pass':'er-ring-fail')+'">'
        +'<div class="er-pct">'+pct+'%</div><div class="er-pct-lbl">Score</div>'
      +'</div>'
      +'<div class="er-hdr-info">'
        +'<div class="er-title">Grade <span style="color:'+gradeClr+'">'+grade+'</span> — '+(pass?'Pass ✅':'Needs Work 📚')+'</div>'
        +'<div class="er-meta-txt">'+examSession.exam+' · '+examSession.subj+(examSession.mode==='exam'?' · Paper 1':'')+'</div>'
        +'<div class="er-advice">'+advice+'</div>'
      +'</div>'
    +'</div>'
    +'<div class="er-stats-grid">'
      +'<div class="er-stat"><div class="er-stat-v" style="color:#4ade80">'+cor+'</div><div class="er-stat-l">Correct</div></div>'
      +'<div class="er-stat"><div class="er-stat-v" style="color:#f87171">'+wrong+'</div><div class="er-stat-l">Wrong</div></div>'
      +'<div class="er-stat"><div class="er-stat-v">'+total+'</div><div class="er-stat-l">Total</div></div>'
      +'<div class="er-stat"><div class="er-stat-v" style="color:'+gradeClr+'">'+grade+'</div><div class="er-stat-l">Grade</div></div>'
    +'</div>'
    +reviewHtml
    +'<div id="erGrowthReport" style="margin-top:18px"></div>'
    +(window._isMockExam?
      '<div class="er-mock-banner">'
        +'<div class="er-mock-banner-inner">'
          +'<div class="er-mock-icon">📝</div>'
          +'<div>'
            +'<div class="er-mock-title">Paper 1 Complete!</div>'
            +'<div class="er-mock-sub">Real WAEC has two papers. Continue to Paper 2 — Theory &amp; Essay to complete your Full Mock.</div>'
          +'</div>'
        +'</div>'
        +'<button class="er-mock-btn" onclick="window._isMockExam=false;ecStartPaper(2)">Continue to Paper 2 — Theory &amp; Essay →</button>'
      +'</div>'
      :''
    )
    +'<div class="er-actions">'
      +(window._isMockExam?'':'<button class="cta-primary" onclick="ecStartPaper(1)">Retry Paper 1</button>')
      +'<button class="cta-secondary" onclick="ecStartPaper(2)">Try Paper 2 — Theory</button>'
      +'<button class="cta-secondary" onclick="ecGoStep(1)">← Change Subject</button>'
    +'</div>'
    +'</div>';

  // Capture refs before nulling examSession, for the async growth report
  var _grBoard = examSession.boardKey;
  var _grSubj = examSession.subjKey;
  var _grSubjName = examSession.subj;

  // Hydrate growth report asynchronously
  (async function(){
    try {
      if (typeof window.MasteryTracker === 'undefined' || !_grBoard || !_grSubj) return;
      var board = _grBoard, subj = _grSubj;
      var summary = await window.MasteryTracker.summary(board, subj);
      if (!summary || summary.seen === 0) return;
      // Compute per-topic bars from the mastery cache
      var m = await window.MasteryTracker.load(board, subj);
      var topicIds = Object.keys(m).sort(function(a,b){ return (m[a].mastery||0) - (m[b].mastery||0); });
      // Find topic display names
      var allTopics = (typeof window.getAllTopics === 'function') ? window.getAllTopics(board, subj) : [];
      var nameOf = {};
      allTopics.forEach(function(t){ nameOf[t.id] = t.name; });
      // Show top 3 weakest and top 3 strongest
      var weak = topicIds.slice(0, 3).filter(function(id){ return m[id].attempts >= 2; });
      var strong = topicIds.slice(-3).reverse().filter(function(id){ return m[id].attempts >= 2; });
      var avgPct = Math.round(summary.avg * 100);
      var color = avgPct >= 70 ? '#4ade80' : avgPct >= 50 ? '#fbbf24' : '#f87171';
      var html = '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:18px">'
        + '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-weight:800;color:#fff;margin-bottom:4px;font-size:1.02rem">📈 Your Growth Report</div>'
        + '<div style="color:rgba(255,255,255,.5);font-size:.78rem;margin-bottom:14px">Based on all '+summary.seen+' topic'+(summary.seen===1?'':'s')+' you have practiced in '+_grSubjName+'</div>'
        + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">'
        + '  <div style="background:rgba(255,255,255,.04);padding:10px;border-radius:10px;text-align:center"><div style="font-size:1.4rem;font-weight:800;color:'+color+'">'+avgPct+'%</div><div style="font-size:.7rem;color:rgba(255,255,255,.5)">Overall Mastery</div></div>'
        + '  <div style="background:rgba(255,255,255,.04);padding:10px;border-radius:10px;text-align:center"><div style="font-size:1.4rem;font-weight:800;color:#4ade80">'+summary.mastered+'</div><div style="font-size:.7rem;color:rgba(255,255,255,.5)">Mastered</div></div>'
        + '  <div style="background:rgba(255,255,255,.04);padding:10px;border-radius:10px;text-align:center"><div style="font-size:1.4rem;font-weight:800;color:#f87171">'+summary.struggling+'</div><div style="font-size:.7rem;color:rgba(255,255,255,.5)">Struggling</div></div>'
        + '</div>';
      if (weak.length){
        html += '<div style="margin-bottom:10px"><div style="color:#f87171;font-size:.78rem;font-weight:700;margin-bottom:6px">⚠️ Focus areas (weakest topics)</div>';
        weak.forEach(function(id){
          var pct = Math.round((m[id].mastery||0)*100);
          var nm = nameOf[id] || id;
          html += '<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:.78rem;color:rgba(255,255,255,.8)"><span>'+nm+'</span><span style="color:#f87171">'+pct+'%</span></div>'
               +'<div style="height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden"><div style="height:100%;background:#f87171;width:'+pct+'%"></div></div></div>';
        });
        html += '</div>';
      }
      if (strong.length){
        html += '<div><div style="color:#4ade80;font-size:.78rem;font-weight:700;margin-bottom:6px">✓ Strongest topics</div>';
        strong.forEach(function(id){
          var pct = Math.round((m[id].mastery||0)*100);
          var nm = nameOf[id] || id;
          html += '<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:.78rem;color:rgba(255,255,255,.8)"><span>'+nm+'</span><span style="color:#4ade80">'+pct+'%</span></div>'
               +'<div style="height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden"><div style="height:100%;background:#4ade80;width:'+pct+'%"></div></div></div>';
        });
        html += '</div>';
      }
      html += '<div style="margin-top:14px;padding:10px;background:rgba(59,130,246,.08);border-left:3px solid #3b82f6;border-radius:6px;font-size:.76rem;color:rgba(255,255,255,.7);line-height:1.5">💡 Next session will be personalised to strengthen your weak topics. Keep practising!</div>';
      html += '</div>';
      var el = document.getElementById('erGrowthReport');
      if (el) el.innerHTML = html;
    } catch(e){ console.warn('Growth report failed:', e); }
  })();

  examSession=null;
}

function startExamTimer(){
  var el=document.getElementById('examTimer');
  if(el){el.style.display='flex';el.style.color='#fbbf24';}
  examSession.timer=setInterval(function(){
    examSession.timeLeft--;
    var m=Math.floor(examSession.timeLeft/60).toString().padStart(2,'0');
    var s=(examSession.timeLeft%60).toString().padStart(2,'0');
    if(el){
      el.textContent='⏱ '+m+':'+s;
      if(examSession.timeLeft<300){el.style.color='#f87171';el.classList.add('urgent');}
    }
    if(examSession.timeLeft<=0){clearInterval(examSession.timer);renderExamResults();}
  },1000);
}


// ════════ RECOVERED MISSING FUNCTIONS ════════
function renderCareers(gc){
  const sections=[
    {label:'🩺 Health & Science',key:'science'},
    {label:'⚙️ Engineering & Tech',key:'tech'},
    {label:'📊 Business & Commerce',key:'commercial'},
    {label:'⚖️ Arts & Humanities',key:'arts'}
  ];
  gc.innerHTML=`
    <div class="guid-section">
      <h2 style="font-family:'Bricolage Grotesque',sans-serif;margin-bottom:4px">💼 Career Paths — Nigeria 2025</h2>
      <p style="color:var(--muted);font-size:.85rem;margin-bottom:20px">Real salaries, real universities, real requirements. No guessing.</p>
      ${sections.map(sec=>`
        <div class="career-section">
          <div class="cs-label">${sec.label}</div>
          ${(CAREERS_NG[sec.key]||[]).map(c=>`
            <div class="career-card">
              <div class="cc-top">
                <span class="cc-icon">${c.icon}</span>
                <div class="cc-info">
                  <div class="cc-title">${c.title}</div>
                  <div class="cc-demand" style="color:${c.demand.includes('Very')?'var(--green)':'var(--blue)'}">● ${c.demand} Demand</div>
                </div>
                <div class="cc-salary">${c.salary}</div>
              </div>
              <div class="cc-details">
                <div class="cc-detail"><span>🏛️</span> <strong>Universities:</strong> ${c.unis}</div>
                <div class="cc-detail"><span>🎯</span> <strong>JAMB Cutoff:</strong> ${c.cutoff}</div>
                <div class="cc-detail"><span>📚</span> <strong>Required Subjects:</strong> ${c.subjects}</div>
                <div class="cc-detail"><span>💼</span> <strong>Jobs:</strong> ${c.jobs}</div>
              </div>
            </div>`).join('')}
        </div>`).join('')}
    </div>`;
}

function renderCombos(gc){
  gc.innerHTML=`
    <div class="guid-section">
      <h2 style="font-family:'Bricolage Grotesque',sans-serif;margin-bottom:4px">📚 Subject Combinations</h2>
      <p style="color:var(--muted);font-size:.85rem;margin-bottom:20px">Pick the right combination now — it determines which university programmes you can apply to.</p>
      <div class="combos-grid">
        ${SUBJECT_COMBOS.map(c=>`
          <div class="combo-card">
            <div class="combo-icon">${c.icon}</div>
            <div class="combo-label">${c.label}</div>
            <div class="combo-subjects">${c.combo}</div>
            <div class="combo-opens"><strong>Opens path to:</strong> ${c.path}</div>
          </div>`).join('')}
      </div>
      <div class="combo-tip">
        <strong>⚠️ Important:</strong> Your O'Level subject combination determines what you can study at university. Choose carefully — switching after SS1 is difficult. If you are unsure, click "Ask Your Counsellor" and tell me what career interests you.
      </div>
    </div>`;
}

async function renderCounsellorChat(gc){
  // ── Build personalised opening from real session data ──
  var p = (typeof _sessionProgress !== 'undefined') ? _sessionProgress : {};
  var name    = studentName || p.studentName || '';
  var cls     = chosenClass || p.studentClass || '';
  var topics  = p.topicsCompletedList || [];
  var quizzes = p.quizResults || [];
  var exams   = p.examResults || [];
  var xpVal   = p.xp || 0;
  var streak  = p.streak || 0;
  var hasData = topics.length > 0 || quizzes.length > 0;

  // ── Work out top subjects from completed topics ──
  var subjCount = {};
  topics.forEach(function(t){ if(t.subj) subjCount[t.subj] = (subjCount[t.subj]||0)+1; });
  var topSubjects = Object.keys(subjCount).sort(function(a,b){ return subjCount[b]-subjCount[a]; }).slice(0,3);

  // ── Average quiz score ──
  var avgQuiz = null;
  if(quizzes.length >= 2){
    avgQuiz = Math.round(quizzes.reduce(function(a,q){ return a+(q.correct/q.total); },0)/quizzes.length*100);
  }

  // ── Recent weak spots (quiz < 60%) ──
  var weakSpots = quizzes.filter(function(q){ return q.correct/q.total < 0.6; }).slice(-3).map(function(q){ return q.subj; });
  var uniqueWeak = weakSpots.filter(function(v,i,a){ return a.indexOf(v)===i; });

  // ── Build opening message dynamically ──
  var greeting = 'Good day' + (name ? ', <strong>'+name+'</strong>' : '') + '!';
  var opening;

  if(!hasData){
    // Student hasn't studied yet — be welcoming, guide them in
    opening = greeting + ' I am your personal guidance counsellor. It looks like you are just getting started — that is perfectly fine, everyone begins somewhere.'
      + (cls ? ' You are in <strong>'+cls+'</strong>, so let us make sure you are on the right path from day one.' : '')
      + ' I can help you with career choices, JAMB and WAEC strategy, university selection, subject combinations, scholarships — or simply figuring out what you want to do with your life. What is on your mind?';
  } else {
    // Student has data — use it naturally, not robotically
    var observations = [];

    if(streak >= 5) observations.push('A <strong>'+streak+'-day</strong> study streak is impressive — that consistency is what A1 students are made of.');
    else if(streak >= 2) observations.push('Good to see you studying consistently — keep that streak going.');

    if(topSubjects.length > 0) observations.push('I can see you have been spending time on <strong>'+topSubjects.slice(0,2).join('</strong> and <strong>')+'</strong>.');

    if(avgQuiz !== null){
      if(avgQuiz >= 75) observations.push('Your quiz scores are strong — '+avgQuiz+'% average. That tells me you are genuinely understanding the material, not just going through the motions.');
      else if(avgQuiz >= 55) observations.push('Your quiz average is '+avgQuiz+'%. Solid, with real room to push into A-grade territory.');
      else observations.push('Your quiz scores ('+avgQuiz+'% average) show some areas we should work on together — that is exactly why I am here.');
    }

    if(uniqueWeak.length > 0 && avgQuiz < 70) observations.push('<strong>'+uniqueWeak[0]+'</strong> seems to be giving you some trouble — I have thoughts on how to approach that.');

    if(exams.length > 0) observations.push('You have already sat <strong>'+exams.length+' mock exam'+(exams.length>1?'s':'')+'</strong> — good preparation habit.');

    opening = greeting + ' ' + (observations.length > 0 ? observations.slice(0,2).join(' ') + ' ' : '')
      + 'I have your full learning record — use me for anything: career direction, university strategy, JAMB preparation, subject combinations, or whatever is weighing on you about your future.';
  }

  // ── Smart suggestion chips based on context ──
  var chips;
  if(!hasData){
    chips = ['I do not know what to study','I want to be a doctor','I love Maths and Science','What is the best subject combination?','Show me Nigerian universities'];
  } else {
    chips = [];
    if(topSubjects.includes('Mathematics') || topSubjects.includes('Physics')) chips.push('What engineering career suits me?');
    if(topSubjects.includes('Biology') || topSubjects.includes('Chemistry')) chips.push('How do I get into Medicine?');
    if(topSubjects.includes('Government') || topSubjects.includes('Literature in English')) chips.push('What can I do with Arts subjects?');
    if(uniqueWeak.length > 0) chips.push('How do I improve in '+uniqueWeak[0]+'?');
    if(avgQuiz !== null && avgQuiz < 65) chips.push('How do I study more effectively?');
    // Always include these
    chips.push('Which universities are best for me?');
    chips.push('Tell me about scholarships');
    if(chips.length < 4) chips.push('What career matches my strengths?');
    chips = chips.slice(0,5);
  }

  gc.innerHTML = `
    <div class="guid-section" style="display:flex;flex-direction:column;gap:0;padding-bottom:0">
      <div style="margin-bottom:14px">
        <h2 style="font-size:1.15rem;font-weight:800;color:#fff;margin-bottom:3px">Your Personal Counsellor</h2>
        <p style="color:rgba(255,255,255,.4);font-size:.8rem">Career · University · JAMB · Scholarships · Life advice — ask anything.</p>
      </div>
      <div id="counsellorMsgs" style="flex:1;min-height:260px;max-height:420px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;margin-bottom:12px;padding:2px 0 8px;">
        <div class="cmsg cmsg-lt">
          <div class="cmsg-nm">🎓 Counsellor</div>
          <div class="cmsg-bub">${opening}</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px" id="counselSuggs">
          ${chips.map(function(s){ return '<button class="chat-sugg" onclick="counselChip(this)" data-msg="'+s.replace(/"/g,'&quot;')+'">'+s+'</button>'; }).join('')}
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <input id="counsellorInp" type="text" placeholder="Ask me anything about your future..." 
          style="flex:1;padding:11px 16px;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.15);border-radius:12px;color:#fff;font-family:inherit;font-size:.88rem;outline:none;transition:border-color .2s"
          onkeydown="if(event.key==='Enter') sendCounsellorMsg()"
          onfocus="this.style.borderColor='rgba(59,130,246,.7)'"
          onblur="this.style.borderColor='rgba(255,255,255,.15)'">
        <button class="chat-send" onclick="sendCounsellorMsg()" 
          style="width:42px;height:42px;border-radius:12px;background:#2563eb;border:none;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s"
          onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">➤</button>
      </div>
    </div>`;
}

function renderGuidOverview(gc){
  gc.innerHTML = `
    <div class="guid-section">
      <div class="guid-hero">
        <div class="gh-icon">🎓</div>
        <h2>Guidance & Counselling</h2>
        <p>Your tutor has been watching how you learn. Let me help you map out your future — the right career, the right university, the right subject combination for who you want to become.</p>
      </div>

      <div class="guid-report">
        <div class="gr-title">📊 Your Learning Report</div>
        <div class="gr-stats">
          <div class="gr-stat"><div class="gr-val" id="gor-xp">${_sessionProgress.xp||xp||0}</div><div class="gr-lbl">XP Earned</div></div>
          <div class="gr-stat"><div class="gr-val" id="gor-topics">${_sessionProgress.topicsCompleted||topicsCompleted||0}</div><div class="gr-lbl">Topics Done</div></div>
          <div class="gr-stat"><div class="gr-val" id="gor-streak">${_sessionProgress.streak||streakDays||0}🔥</div><div class="gr-lbl">Day Streak</div></div>
          <div class="gr-stat"><div class="gr-val" id="gor-class">${chosenClass||'—'}</div><div class="gr-lbl">Class</div></div>
          <div class="gr-stat"><div class="gr-val" id="gor-quiz">${(function(){var r=_sessionProgress.quizResults||[];if(!r.length)return '—';var avg=r.reduce(function(a,q){return a+q.correct/q.total;},0)/r.length;return Math.round(avg*100)+'%';})()}</div><div class="gr-lbl">Quiz Avg</div></div>
          <div class="gr-stat"><div class="gr-val" id="gor-exams">${(_sessionProgress.examResults||[]).length}</div><div class="gr-lbl">Mock Exams</div></div>
        </div>
        <p style="font-size:.82rem;color:rgba(255,255,255,.4);margin-top:10px">The more you learn, the more I can personalise this advice. Keep studying — I am tracking your strengths.</p>
        ${(_sessionProgress.topicsCompletedList||[]).length > 0 ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)"><div style="font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:8px">Recent topics</div><div style="display:flex;flex-direction:column;gap:5px">${(_sessionProgress.topicsCompletedList||[]).slice(-4).reverse().map(t=>`<div style="font-size:.75rem;color:rgba(255,255,255,.5);display:flex;justify-content:space-between"><span>${t.subj} — ${t.topic.slice(0,40)}${t.topic.length>40?'…':''}</span><span style="color:#10b981;font-weight:700">+${t.xp} XP</span></div>`).join('')}</div></div>` : ''}
      </div>

      <div class="guid-cards">
        <div class="guid-card" onclick="guidSection('careers',null)">
          <div class="guc-ico">💼</div>
          <h3>Explore Careers</h3>
          <p>Salaries, entry requirements, Nigerian opportunities, and what subjects lead there.</p>
          <span class="guc-link">Explore →</span>
        </div>
        <div class="guid-card" onclick="guidSection('combos',null)">
          <div class="guc-ico">📚</div>
          <h3>Subject Combinations</h3>
          <p>See exactly which subject combination opens which doors for university and career.</p>
          <span class="guc-link">See Combos →</span>
        </div>
        <div class="guid-card" onclick="guidSection('universities',null)">
          <div class="guc-ico">🏛️</div>
          <h3>Nigerian Universities</h3>
          <p>Top universities, cutoff marks, what they are known for, and how to get in.</p>
          <span class="guc-link">Explore →</span>
        </div>
        <div class="guid-card" onclick="guidSection('chat',null)">
          <div class="guc-ico">💬</div>
          <h3>Ask Your Counsellor</h3>
          <p>Tell me what you want to be. I will tell you exactly what to do, study, and aim for.</p>
          <span class="guc-link">Chat Now →</span>
        </div>
      </div>
    </div>`;
}

function renderScholarships(gc){
  const schols=[
    {name:'Federal Government Scholarship (BEA)',amount:'Full tuition + monthly stipend',who:'Nigerian students — federal unity schools',link:'scholarship.gov.ng'},
    {name:'Niger Delta Development Commission (NDDC)',amount:'Full tuition + allowances',who:'Students from Niger Delta states',link:'nddc.gov.ng'},
    {name:'MTN Foundation Scholarship',amount:'₦200,000/year',who:'200/400 JAMB + 3.5 GPA undergraduates',link:'mtnonlinefoundation.org'},
    {name:'Chevron Niger Delta Scholarship',amount:'Full tuition + stipend',who:'Students from Niger Delta (OND, HND, Degree)',link:'chevron.com/nigeria'},
    {name:'Shell Petroleum Development Company (SPDC)',amount:'Full scholarship',who:'Children of staff + Niger Delta community students',link:'shell.com.ng'},
    {name:'Commonwealth Scholarship (UK)',amount:'Full MSc/PhD funding in UK',who:'Nigerian graduates with 2:1 and above',link:'cscuk.fcdo.gov.uk'},
    {name:'Mastercard Foundation Scholars',amount:'Full tuition + living + travel',who:'Academically brilliant but economically disadvantaged',link:'mastercardfdn.org/scholars'},
    {name:'TETFund Academic Staff Training',amount:'MSc/PhD funding',who:'Nigerian university lecturers and staff',link:'tetfund.gov.ng'}
  ];
  gc.innerHTML=`
    <div class="guid-section">
      <h2 style="font-family:'Bricolage Grotesque',sans-serif;margin-bottom:4px">🎓 Scholarships & Funding</h2>
      <p style="color:var(--muted);font-size:.85rem;margin-bottom:20px">Real funding opportunities available to Nigerian students right now.</p>
      <div class="schols-list">
        ${schols.map(s=>`
          <div class="schol-card">
            <div class="sc-name">${s.name}</div>
            <div class="sc-amount">💰 ${s.amount}</div>
            <div class="sc-who">👥 ${s.who}</div>
            <div class="sc-link">🔗 ${s.link}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderUniversities(gc){
  const unis=[
    {name:'University of Ibadan (UI)',type:'Federal',known:'Medicine, Law, Arts, Sciences',rank:'#1 in Nigeria',state:'Oyo'},
    {name:'University of Lagos (UNILAG)',type:'Federal',known:'Law, Engineering, Business, Mass Comm',rank:'#2 in Nigeria',state:'Lagos'},
    {name:'Obafemi Awolowo University (OAU)',type:'Federal',known:'Medicine, Architecture, Law, Sciences',rank:'Top 3',state:'Osun'},
    {name:'Ahmadu Bello University (ABU)',type:'Federal',known:'Sciences, Engineering, Agriculture',rank:'Top 5',state:'Kaduna'},
    {name:'University of Nigeria, Nsukka (UNN)',type:'Federal',known:'Medicine, Engineering, Law, Sciences',rank:'Top 5',state:'Enugu'},
    {name:'Covenant University',type:'Private',known:'Technology, Business, Engineering',rank:'#1 Private',state:'Ogun'},
    {name:'Babcock University',type:'Private',known:'Medicine, Business, Law',rank:'Top Private',state:'Ogun'},
    {name:'American University of Nigeria (AUN)',type:'Private',known:'IT, Business, International Relations',rank:'US-style education',state:'Adamawa'},
    {name:'Lagos State University (LASU)',type:'State',known:'Law, Business, Sciences',rank:'Top State',state:'Lagos'},
    {name:'University of Port Harcourt (UNIPORT)',type:'Federal',known:'Engineering, Medicine, Sciences',rank:'Top in South-South',state:'Rivers'}
  ];
  gc.innerHTML=`
    <div class="guid-section">
      <h2 style="font-family:'Bricolage Grotesque',sans-serif;margin-bottom:4px">🏛️ Nigerian Universities</h2>
      <p style="color:var(--muted);font-size:.85rem;margin-bottom:20px">Top institutions, what they are known for, and how to get in.</p>
      <div class="unis-list">
        ${unis.map(u=>`
          <div class="uni-card">
            <div class="uc-top">
              <div>
                <div class="uc-name">${u.name}</div>
                <div class="uc-meta">${u.type} · ${u.state} State</div>
              </div>
              <span class="uc-rank">${u.rank}</span>
            </div>
            <div class="uc-known">📌 Known for: ${u.known}</div>
          </div>`).join('')}
      </div>
      <div class="combo-tip" style="margin-top:20px">
        <strong>💡 Pro tip:</strong> JAMB cutoff marks change every year. Always check the JAMB and institution websites for the current year's requirements. Focus on getting your WAEC results right first — most universities require 5 credits including English and Maths.
      </div>
    </div>`;
}

function showTodayTimetableHint(){
  const dayName=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const todaySubjs=studentTimetable[dayName]||[];
  if(!todaySubjs.length) return;
  const subjs=(subjectsByClass[chosenClass]||subjectsByClass['SS2']).subjects;
  const names=todaySubjs.map(k=>subjs.find(s=>s.k===k)?.n||k).join(', ');
  const grid=document.getElementById('wcSubjGrid');
  if(!grid||!grid.parentElement) return;
  document.getElementById('ttHintCard')?.remove();
  const hint=document.createElement('div');
  hint.id='ttHintCard'; hint.className='adapt-banner';
  hint.innerHTML=`<div class="ab-ico">📅</div><div><div class="ab-title">Today is ${dayName} — your timetable says:</div><div class="ab-text">${names}. Tap one of these to start — or choose any subject below.</div></div>`;
  grid.parentElement.insertBefore(hint,grid);
}

function skipTimetable(){
  const body=document.getElementById('ttBody');
  const btn=document.getElementById('ttToggleBtn');
  if(body) body.style.display='none';
  if(btn) btn.textContent='Set Up ↓';
}

function startFromWelcome(key){
  // Try matching sidebar item first
  let found = false;
  document.querySelectorAll('#sbSubjects .sb-item').forEach(item => {
    const oc = item.getAttribute('onclick') || '';
    if(oc.includes("'" + key + "'") || oc.includes('"' + key + '"')){
      item.click(); found = true;
    }
  });
  if(!found) loadSubject(key, null);
}

function toggleAiStrip(btn){
  const body = document.getElementById('aiStripBody');
  if(!body) return;
  const open = body.classList.toggle('open');
  btn.textContent = open ? 'Close ↑' : 'Read ↓';
}

function toggleTimetable(){
  const body=document.getElementById('ttBody');
  const btn=document.getElementById('ttToggleBtn');
  if(!body) return;
  const open = body.style.display==='none';
  body.style.display = open?'block':'none';
  if(btn) btn.textContent = open?'Close ↑':'Set Up ↓';
  if(open) buildTimetableUI();
}

const AI_CONTENT = {
  kids:[
    {ico:'🤖',title:'Meet AI — your learning friend!',text:'AI stands for Artificial Intelligence. I am AI! I learned by reading millions of books so I can help you learn everything. How cool is that?'},
    {ico:'🧠',title:'Your brain is amazing',text:'Your brain is the most powerful thing in the world. AI helps your brain work even faster — just like a calculator helps with maths!'},
    {ico:'🌍',title:'AI is everywhere in Nigeria',text:'When Bolt finds your driver, when YouTube shows your favourite video, when your phone autocorrects — that is AI helping you every day!'},
    {ico:'🚀',title:'You are already special',text:'You are learning with AI right now! That means you are one step ahead. Keep learning and there is nothing you cannot do. 🌟'}
  ],
  primary:[
    {ico:'🤖',title:'What is Artificial Intelligence?',text:'AI is a computer that can learn, think, and help — just like a very smart assistant. Lesson Teacher is AI, and she is here just for you!'},
    {ico:'🇳🇬',title:'AI is already in your life',text:'Bolt rides, MTN alerts, YouTube recommendations — AI is making life easier in Nigeria every single day. And it is only getting started!'},
    {ico:'💡',title:'AI makes you more powerful',text:'Knowing how to use AI well is like having a superpower. You can research faster, learn more, and solve bigger problems. This is your time!'},
    {ico:'🎓',title:'Your future is bright',text:'Students who understand AI will get the best opportunities. You do not need to be a programmer — just curious and willing to learn. That is you!'}
  ],
  jss:[
    {ico:'⚙️',title:'How AI learns — Machine Learning',text:'AI learns from <strong>examples and data</strong> — the more it sees, the smarter it gets. Lesson Teacher learned from millions of Nigerian textbooks to teach you better!'},
    {ico:'🇳🇬',title:'AI is building Nigeria',text:'Nigerian companies are using AI right now — agriculture, healthcare, banking, education. <strong>Andela, Flutterwave, Interswitch</strong> — all using AI to grow.'},
    {ico:'💪',title:'AI is your competitive edge',text:'Students who understand AI will stand out in every career. You are learning this now — at JSS level. That is a huge head start over most people.'},
    {ico:'🌟',title:'Every great career uses AI',text:'Doctor, lawyer, engineer, accountant — AI tools are coming to every field. The ones who know how to use them will lead. That could be you.'}
  ],
  sss:[
    {ico:'🧠',title:'How Lesson Teacher works',text:'I am built on a <strong>Large Language Model (LLM)</strong> — trained on billions of words including Nigerian curriculum content. I generate helpful responses based on patterns I learned.'},
    {ico:'🇳🇬',title:"Nigeria's AI opportunity",text:'With 220M people and Africa\'s largest pool of tech talent, Nigeria is positioned to lead AI on the continent. <strong>Flutterwave, Andela, Interswitch</strong> are already doing it.'},
    {ico:'🚀',title:'Your advantage starts now',text:'Understanding AI at SS level puts you ahead of 95% of your peers globally. The best universities and employers are looking for students who think about the future. That is you.'},
    {ico:'💼',title:'Master your subjects — they are irreplaceable',text:'AI is a tool. <strong>Your subject knowledge, critical thinking, and creativity</strong> are what make you valuable alongside it. The deeper you learn now, the better you will use AI tomorrow.'}
  ]
};


function counselChip(btn){
  var msg = btn.getAttribute('data-msg');
  var suggEl = document.getElementById('counselSuggs');
  if(suggEl) suggEl.style.display='none';
  if(msg) sendCounsellorMsg(msg);
}

async function sendCounsellorMsg(preset){
  const inp  = document.getElementById('counsellorInp');
  const msgs = document.getElementById('counsellorMsgs');
  if(!msgs) return;
  const msg = preset || inp?.value?.trim();
  if(!msg) return;
  if(inp) inp.value='';

  // Hide suggestion chips after first message
  const suggEl = document.getElementById('counselSuggs');
  if(suggEl) suggEl.style.display='none';

  // Append student bubble
  const sm = document.createElement('div');
  sm.className = 'cmsg cmsg-user';
  sm.innerHTML = `<div class="cmsg-nm">${studentName||'You'}</div><div class="cmsg-bub">${msg}</div>`;
  msgs.appendChild(sm);

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'cmsg cmsg-lt';
  typing.id = 'counselTyping';
  typing.innerHTML = `<div class="cmsg-nm">🎓 Counsellor</div><div class="cmsg-bub" style="display:flex;align-items:center;gap:8px;min-width:60px"><div class="lt-loading"><div class="ld-dot"></div><div class="ld-dot"></div><div class="ld-dot"></div></div></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;
  counsellorHistory.push({role:'user', content:msg});

  // ── Build rich student context from real records ──
  var p = (typeof _sessionProgress !== 'undefined') ? _sessionProgress : {};
  var topics  = p.topicsCompletedList || [];
  var quizzes = p.quizResults || [];
  var exams   = p.examResults || [];
  var hasData = topics.length > 0 || quizzes.length > 0;

  // Top studied subjects
  var subjCount = {};
  topics.forEach(function(t){ if(t.subj) subjCount[t.subj]=(subjCount[t.subj]||0)+1; });
  var topSubjects = Object.keys(subjCount).sort(function(a,b){ return subjCount[b]-subjCount[a]; }).slice(0,4);

  // Quiz performance
  var avgQuiz = null, weakSubjs = [], strongSubjs = [];
  if(quizzes.length){
    avgQuiz = Math.round(quizzes.reduce(function(a,q){ return a+q.correct/q.total; },0)/quizzes.length*100);
    var bySubj = {};
    quizzes.forEach(function(q){
      if(!bySubj[q.subj]) bySubj[q.subj]={c:0,t:0};
      bySubj[q.subj].c += q.correct; bySubj[q.subj].t += q.total;
    });
    Object.keys(bySubj).forEach(function(s){
      var pct = bySubj[s].c/bySubj[s].t;
      if(pct >= 0.7) strongSubjs.push(s);
      else if(pct < 0.55) weakSubjs.push(s);
    });
  }

  // Recent exam results
  var examSummary = exams.slice(-3).map(function(e){
    return e.subj+' '+e.board+': '+e.score+'% ('+e.grade+')';
  }).join('; ');

  // ── Decide if this is a navigation/simple question for speed ──
  // Short factual / navigation questions get haiku (fast); deep counselling gets sonnet
  var isSimple = /^(what|where|how do i|which|show me|take me|go to|open|can i|what is)/i.test(msg.trim()) && msg.length < 80;
  // Navigation intent - student wants to go somewhere in the app
  var navIntent = /(career path|subject combo|university|scholarship|homework|exam|lesson|start studying|back to class|go to class)/i.test(msg);

  // ── System prompt: full record + full freedom ──
  var contextBlock = hasData
    ? `
STUDENT LEARNING RECORD (use naturally, not robotically):
- Class: ${chosenClass||p.studentClass||'Unknown'}, XP: ${p.xp||0}, Streak: ${p.streak||0} days
- Topics completed: ${topics.length} (top subjects: ${topSubjects.join(', ')||'none yet'})
- Quiz average: ${avgQuiz!==null?avgQuiz+'%':'no quizzes yet'}${strongSubjs.length?' | Strong: '+strongSubjs.join(', '):''}
${weakSubjs.length?'- Needs work: '+weakSubjs.join(', '):''}
${examSummary?'- Mock exams: '+examSummary:''}
- Recent topics: ${topics.slice(-5).map(function(t){return t.subj+': '+t.topic;}).join(' | ')||'none'}`
    : `
STUDENT RECORD: New student — no study history yet. Class: ${chosenClass||'Unknown'}. Welcome them warmly and help them get started.`;

  var systemPrompt = `You are a brilliant, warm, experienced Nigerian guidance and career counsellor — the kind every student wishes they had. You counsel students at Lesson Teacher, an AI education platform for Nigerian secondary school students.

You have full access to this student's learning record. Use it naturally when it genuinely helps — to personalise advice, spot patterns, celebrate effort, or flag concerns. Do NOT recite the data back like a report. Weave it in like a real counsellor who has been watching their progress.${contextBlock}

YOUR FULL SCOPE — you counsel on EVERYTHING:
- Career paths, Nigerian job market, salaries, industries
- University selection, JAMB strategy, WAEC prep, cut-off marks, post-UTME
- Subject combinations and which doors they open or close
- Scholarships — FG, NDDC, MTN Foundation, Mastercard, Commonwealth and more
- Study strategies, time management, how to improve weak subjects
- Life decisions — stream choice, whether to resit, gap year, polytechnic vs university
- Emotional support — exam pressure, parental expectations, self-doubt
- Navigation help — if they want to go somewhere in the app, tell them exactly how

NAVIGATION SHORTCUTS (tell students these when relevant):
- "Go back to your lesson" → click "Back to Class" in the sidebar
- "Career Paths section" → click Career Paths in this sidebar  
- "Subject Combinations" → click Subject Combinations in this sidebar
- "Nigerian Universities" → click Nigerian Universities in this sidebar
- "Start a mock exam" → go back to class, click Exam Centre in sidebar
- "Homework Helper" → go back to class, open More → Homework Helper

COUNSELLING STYLE:
- Be direct, specific, and honest — name real universities, real salaries, real JAMB scores
- Be warm and encouraging — never dismissive, never generic
- Keep replies concise: 3-5 sentences for simple questions, up to 8 for complex career advice
- No bullet points or markdown — plain conversational text only
- If a student seems stressed or uncertain, acknowledge feelings before giving advice
- End with ONE specific follow-up question or action to keep momentum`;

  try{
    const res = await fetch('/api/anthropic',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model: isSimple ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-20250514',
        max_tokens: isSimple ? 250 : 450,
        system: systemPrompt,
        messages: counsellorHistory.slice(-12)
      })
    });
    const data = await res.json();
    const reply = (data.content||[]).find(function(b){return b.type==='text';})?.text || '';
    document.getElementById('counselTyping')?.remove();
    if(reply){
      counsellorHistory.push({role:'assistant', content:reply});
      const rm = document.createElement('div');
      rm.className = 'cmsg cmsg-lt';
      rm.innerHTML = '<div class="cmsg-nm">🎓 Counsellor</div><div class="cmsg-bub">' + reply.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>') + '</div>';
      msgs.appendChild(rm);
      msgs.scrollTop = msgs.scrollHeight;
    }
  }catch(e){
    document.getElementById('counselTyping')?.remove();
    const em = document.createElement('div');
    em.className = 'cmsg cmsg-lt';
    em.innerHTML = `<div class="cmsg-nm">🎓 Counsellor</div><div class="cmsg-bub">Connection issue — please try again. I am still here. 😊</div>`;
    msgs.appendChild(em);
  }
}

function buildTimetableUI(){
  const container=document.getElementById('ttDays');
  if(!container) return;
  const subjs=(subjectsByClass[chosenClass]||subjectsByClass['SS2']).subjects;
  container.innerHTML=TT_DAYS.map(day=>{
    const saved=studentTimetable[day]||[];
    return `<div class="tt-day-row">
      <div class="tt-day-label">${day}</div>
      <div class="tt-day-subjs">${subjs.map(s=>`
        <div class="tt-subj-chip ${saved.includes(s.k)?'on':''}" data-day="${day}" data-key="${s.k}" onclick="toggleTTChip(this)">${s.i} ${s.n}</div>`).join('')}
      </div></div>`;
  }).join('');
}

// ════════════════════════════════════════════════════════
// EXAM TOOLKIT — Calculator, Tables, Periodic Table, Drawing
// ════════════════════════════════════════════════════════

// ── Tool panel management ──
function toggleTool(id){
  var panel=document.getElementById(id);
  if(!panel) return;
  var isOpen=panel.classList.contains('open');
  // Init on first open
  if(!isOpen){
    if(id==='toolPeriodic') initPeriodicTable();
    if(id==='toolTables') showTable('trig',document.querySelector('.tables-tab'));
    if(id==='toolDraw') initDrawCanvas();
    if(id==='toolCalc') initCalc();
    // Position near bottom-right
    panel.style.bottom='80px'; panel.style.right='20px';
  }
  panel.classList.toggle('open',!isOpen);
  // Update toolbar button state
  document.querySelectorAll('.etk-btn').forEach(function(b){
    if(b.getAttribute('onclick')&&b.getAttribute('onclick').includes("'"+id+"'")){
      b.classList.toggle('active',!isOpen);
    }
  });
}
function closeTool(id){
  var panel=document.getElementById(id); if(panel) panel.classList.remove('open');
  document.querySelectorAll('.etk-btn').forEach(function(b){
    if(b.getAttribute('onclick')&&b.getAttribute('onclick').includes("'"+id+"'")) b.classList.remove('active');
  });
}

// ── Draggable panels ──
function dragPanel(e,id){
  var panel=document.getElementById(id); if(!panel) return;
  var startX=e.clientX,startY=e.clientY;
  var rect=panel.getBoundingClientRect();
  var startL=rect.left,startT=rect.top;
  panel.style.left=startL+'px'; panel.style.top=startT+'px';
  panel.style.right='auto'; panel.style.bottom='auto';
  function onMove(ev){
    panel.style.left=(startL+ev.clientX-startX)+'px';
    panel.style.top=(startT+ev.clientY-startY)+'px';
  }
  function onUp(){ document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); }
  document.addEventListener('mousemove',onMove);
  document.addEventListener('mouseup',onUp);
  e.preventDefault();
}

// ── Scientific Calculator ──
var calcState={val:'0',expr:'',ans:0,newNum:true};
function initCalc(){ calcDisplay(); }
function calcDisplay(){
  var v=document.getElementById('calcVal'); if(v) v.textContent=calcState.val;
  var e=document.getElementById('calcExpr'); if(e) e.textContent=calcState.expr;
}
function calcInput(ch){
  if(calcState.newNum&&!'().'.includes(ch)){ calcState.val=''; calcState.newNum=false; }
  if(calcState.val==='0'&&/\d/.test(ch)) calcState.val='';
  calcState.val+=ch;
  calcDisplay();
}
function calcClear(){ calcState={val:'0',expr:'',ans:calcState.ans,newNum:true}; calcDisplay(); }
function calcDel(){ calcState.val=calcState.val.length>1?calcState.val.slice(0,-1):'0'; calcDisplay(); }
function calcFn(fn){
  var x=parseFloat(calcState.val)||0;
  var res;
  switch(fn){
    case 'sin': res=Math.sin(x*Math.PI/180); break;
    case 'cos': res=Math.cos(x*Math.PI/180); break;
    case 'tan': res=Math.tan(x*Math.PI/180); break;
    case 'log': res=Math.log10(x); break;
    case 'ln':  res=Math.log(x); break;
    case 'sqrt':res=Math.sqrt(x); break;
    case 'sq':  res=x*x; break;
    case 'inv': res=1/x; break;
    case 'abs': res=Math.abs(x); break;
    case 'pi':  calcState.val=String(Math.PI); calcDisplay(); return;
    case 'e':   calcState.val=String(Math.E); calcDisplay(); return;
    case 'pow': calcState.val+='**'; calcState.newNum=false; calcDisplay(); return;
    case 'ans': calcState.val=String(calcState.ans); calcDisplay(); return;
    default: return;
  }
  calcState.ans=res;
  calcState.val=String(Math.round(res*1e10)/1e10);
  calcState.newNum=true;
  calcDisplay();
}
function calcEquals(){
  try{
    var expr=calcState.val.replace(/[÷]/g,'/').replace(/[×]/g,'*');
    var res=Function('"use strict";return ('+expr+')')();
    calcState.expr=expr+' =';
    calcState.ans=res;
    calcState.val=String(Math.round(res*1e10)/1e10);
    calcState.newNum=true;
  }catch(e){calcState.val='Error';calcState.newNum=true;}
  calcDisplay();
}

// ── Math Tables ──
function showTable(type,btn){
  document.querySelectorAll('.tables-tab').forEach(function(b){b.classList.remove('on');});
  if(btn) btn.classList.add('on');
  var cont=document.getElementById('tablesContent'); if(!cont) return;
  if(type==='trig'){
    var rows='';
    for(var a=0;a<=90;a+=5){
      var r=a*Math.PI/180;
      rows+='<tr><td>'+a+'°</td><td>'+Math.sin(r).toFixed(4)+'</td><td>'+Math.cos(r).toFixed(4)+'</td><td>'+(a<90?Math.tan(r).toFixed(4):'∞')+'</td></tr>';
    }
    cont.innerHTML='<table class="math-table"><tr><th>Angle</th><th>sin</th><th>cos</th><th>tan</th></tr>'+rows+'</table>';
  } else if(type==='log'){
    var rows='';
    for(var n=1;n<=50;n++){
      rows+='<tr><td>'+n+'</td><td>'+Math.log10(n).toFixed(4)+'</td><td>'+Math.log(n).toFixed(4)+'</td></tr>';
    }
    cont.innerHTML='<table class="math-table"><tr><th>n</th><th>log₁₀(n)</th><th>ln(n)</th></tr>'+rows+'</table>';
  } else if(type==='squares'){
    var rows='';
    for(var n=1;n<=30;n++){
      rows+='<tr><td>'+n+'</td><td>'+n*n+'</td><td>'+n*n*n+'</td><td>'+Math.sqrt(n).toFixed(4)+'</td></tr>';
    }
    cont.innerHTML='<table class="math-table"><tr><th>n</th><th>n²</th><th>n³</th><th>√n</th></tr>'+rows+'</table>';
  } else if(type==='fractions'){
    cont.innerHTML='<table class="math-table"><tr><th>Fraction</th><th>Decimal</th><th>%</th></tr>'
      +[[1,2],[1,3],[2,3],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,6],[5,6],[1,8],[3,8],[5,8],[7,8],[1,9],[1,10],[1,12],[1,16],[1,100]].map(function(f){
        var d=f[0]/f[1];
        return '<tr><td>'+f[0]+'/'+f[1]+'</td><td>'+d.toFixed(6)+'</td><td>'+(d*100).toFixed(3)+'%</td></tr>';
      }).join('')+'</table>';
  } else if(type==='constants'){
    var consts=[
      ['π (Pi)','3.14159265358979'],['e (Euler)','2.71828182845905'],
      ['√2','1.41421356237310'],['√3','1.73205080756888'],['√5','2.23606797749979'],
      ['g (gravity)','9.80665 m/s²'],['c (light speed)','2.998 × 10⁸ m/s'],
      ['h (Planck)','6.626 × 10⁻³⁴ J·s'],['Avogadro','6.022 × 10²³ /mol'],
      ['R (gas)','8.314 J/(mol·K)'],['k (Boltzmann)','1.381 × 10⁻²³ J/K'],
      ['q (electron)','1.602 × 10⁻¹⁹ C'],['m_e (electron)','9.109 × 10⁻³¹ kg'],
      ['m_p (proton)','1.673 × 10⁻²⁷ kg']
    ];
    cont.innerHTML='<table class="math-table"><tr><th>Constant</th><th>Value</th></tr>'
      +consts.map(function(c){return'<tr><td>'+c[0]+'</td><td style="font-family:monospace">'+c[1]+'</td></tr>';}).join('')
      +'</table>';
  }
}

// ── Periodic Table ──
var ELEMENTS=[
  {n:1,s:'H',name:'Hydrogen',m:'1.008',g:'nonmetal',col:'#374151'},{n:2,s:'He',name:'Helium',m:'4.003',g:'noble',col:'#1e3a5f'},
  {n:3,s:'Li',name:'Lithium',m:'6.941',g:'alkali',col:'#7c2d12'},{n:4,s:'Be',name:'Beryllium',m:'9.012',g:'alkaline',col:'#713f12'},
  {n:5,s:'B',name:'Boron',m:'10.811',g:'metalloid',col:'#3d2f00'},{n:6,s:'C',name:'Carbon',m:'12.011',g:'nonmetal',col:'#374151'},
  {n:7,s:'N',name:'Nitrogen',m:'14.007',g:'nonmetal',col:'#374151'},{n:8,s:'O',name:'Oxygen',m:'15.999',g:'nonmetal',col:'#374151'},
  {n:9,s:'F',name:'Fluorine',m:'18.998',g:'halogen',col:'#14532d'},{n:10,s:'Ne',name:'Neon',m:'20.180',g:'noble',col:'#1e3a5f'},
  {n:11,s:'Na',name:'Sodium',m:'22.990',g:'alkali',col:'#7c2d12'},{n:12,s:'Mg',name:'Magnesium',m:'24.305',g:'alkaline',col:'#713f12'},
  {n:13,s:'Al',name:'Aluminium',m:'26.982',g:'post-trans',col:'#1c3553'},{n:14,s:'Si',name:'Silicon',m:'28.086',g:'metalloid',col:'#3d2f00'},
  {n:15,s:'P',name:'Phosphorus',m:'30.974',g:'nonmetal',col:'#374151'},{n:16,s:'S',name:'Sulfur',m:'32.065',g:'nonmetal',col:'#374151'},
  {n:17,s:'Cl',name:'Chlorine',m:'35.453',g:'halogen',col:'#14532d'},{n:18,s:'Ar',name:'Argon',m:'39.948',g:'noble',col:'#1e3a5f'},
  {n:19,s:'K',name:'Potassium',m:'39.098',g:'alkali',col:'#7c2d12'},{n:20,s:'Ca',name:'Calcium',m:'40.078',g:'alkaline',col:'#713f12'},
  {n:26,s:'Fe',name:'Iron',m:'55.845',g:'transition',col:'#1a2e4a'},{n:29,s:'Cu',name:'Copper',m:'63.546',g:'transition',col:'#1a2e4a'},
  {n:30,s:'Zn',name:'Zinc',m:'65.38',g:'transition',col:'#1a2e4a'},{n:35,s:'Br',name:'Bromine',m:'79.904',g:'halogen',col:'#14532d'},
  {n:47,s:'Ag',name:'Silver',m:'107.868',g:'transition',col:'#1a2e4a'},{n:53,s:'I',name:'Iodine',m:'126.904',g:'halogen',col:'#14532d'},
  {n:79,s:'Au',name:'Gold',m:'196.967',g:'transition',col:'#1a2e4a'},{n:82,s:'Pb',name:'Lead',m:'207.2',g:'post-trans',col:'#1c3553'},
  {n:80,s:'Hg',name:'Mercury',m:'200.59',g:'transition',col:'#1a2e4a'},{n:92,s:'U',name:'Uranium',m:'238.029',g:'actinide',col:'#2d1b69'}
];
var ELEM_COLS={alkali:'#7c2d12',alkaline:'#713f12',transition:'#1a2e4a','post-trans':'#1c3553',metalloid:'#3d2f00',nonmetal:'#374151',halogen:'#14532d',noble:'#1e3a5f',lanthanide:'#2d1b69',actinide:'#2d1b69'};
function initPeriodicTable(){
  var wrap=document.getElementById('periodicWrap'); if(!wrap) return;
  // Legend
  var legend='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;font-size:.62rem">';
  Object.entries(ELEM_COLS).forEach(function(e){
    legend+='<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:'+e[1]+';display:inline-block"></span>'+e[0]+'</span>';
  });
  legend+='</div>';
  // Simple list view (easier to read than full grid on small screen)
  var table='<table class="math-table" style="font-size:.72rem"><tr><th>No.</th><th>Symbol</th><th>Name</th><th>Mass</th><th>Group</th></tr>';
  // Full 118 elements — key ones
  var allElems=[
    [1,'H','Hydrogen','1.008','Non-metal'],[2,'He','Helium','4.003','Noble Gas'],
    [3,'Li','Lithium','6.941','Alkali Metal'],[4,'Be','Beryllium','9.012','Alkaline Earth'],
    [5,'B','Boron','10.811','Metalloid'],[6,'C','Carbon','12.011','Non-metal'],
    [7,'N','Nitrogen','14.007','Non-metal'],[8,'O','Oxygen','15.999','Non-metal'],
    [9,'F','Fluorine','18.998','Halogen'],[10,'Ne','Neon','20.180','Noble Gas'],
    [11,'Na','Sodium','22.990','Alkali Metal'],[12,'Mg','Magnesium','24.305','Alkaline Earth'],
    [13,'Al','Aluminium','26.982','Post-transition'],[14,'Si','Silicon','28.086','Metalloid'],
    [15,'P','Phosphorus','30.974','Non-metal'],[16,'S','Sulphur','32.065','Non-metal'],
    [17,'Cl','Chlorine','35.453','Halogen'],[18,'Ar','Argon','39.948','Noble Gas'],
    [19,'K','Potassium','39.098','Alkali Metal'],[20,'Ca','Calcium','40.078','Alkaline Earth'],
    [24,'Cr','Chromium','51.996','Transition'],[25,'Mn','Manganese','54.938','Transition'],
    [26,'Fe','Iron','55.845','Transition'],[27,'Co','Cobalt','58.933','Transition'],
    [28,'Ni','Nickel','58.693','Transition'],[29,'Cu','Copper','63.546','Transition'],
    [30,'Zn','Zinc','65.38','Transition'],[35,'Br','Bromine','79.904','Halogen'],
    [36,'Kr','Krypton','83.798','Noble Gas'],[47,'Ag','Silver','107.868','Transition'],
    [48,'Cd','Cadmium','112.411','Transition'],[50,'Sn','Tin','118.710','Post-transition'],
    [53,'I','Iodine','126.904','Halogen'],[54,'Xe','Xenon','131.293','Noble Gas'],
    [56,'Ba','Barium','137.327','Alkaline Earth'],[79,'Au','Gold','196.967','Transition'],
    [80,'Hg','Mercury','200.59','Transition'],[82,'Pb','Lead','207.2','Post-transition'],
    [83,'Bi','Bismuth','208.980','Post-transition'],[92,'U','Uranium','238.029','Actinide']
  ];
  allElems.forEach(function(e){
    table+='<tr><td>'+e[0]+'</td><td style="font-weight:800;color:#93c5fd">'+e[1]+'</td><td>'+e[2]+'</td><td style="font-family:monospace">'+e[3]+'</td><td>'+e[4]+'</td></tr>';
  });
  table+='</table>';
  wrap.innerHTML=legend+table;
}

// ── Drawing Canvas ──
var drawCtx=null, drawTool='pen', isDrawing=false, drawStart={x:0,y:0}, drawSnapshot=null;
function initDrawCanvas(){
  var canvas=document.getElementById('drawCanvas'); if(!canvas) return;
  var wrap=canvas.parentElement;
  canvas.width=wrap.clientWidth||420;
  canvas.height=wrap.clientHeight||300;
  drawCtx=canvas.getContext('2d');
  drawCtx.fillStyle='#0a0e1a';
  drawCtx.fillRect(0,0,canvas.width,canvas.height);
  drawCtx.strokeStyle='#4ade80'; drawCtx.lineWidth=3; drawCtx.lineCap='round';
  canvas.onmousedown=function(e){
    isDrawing=true;
    var r=canvas.getBoundingClientRect();
    drawStart={x:e.clientX-r.left,y:e.clientY-r.top};
    drawSnapshot=drawCtx.getImageData(0,0,canvas.width,canvas.height);
    if(drawTool==='pen'||drawTool==='erase'){
      drawCtx.beginPath(); drawCtx.moveTo(drawStart.x,drawStart.y);
    }
  };
  canvas.onmousemove=function(e){
    if(!isDrawing) return;
    var r=canvas.getBoundingClientRect();
    var x=e.clientX-r.left, y=e.clientY-r.top;
    var col=document.getElementById('drawColor').value;
    var sz=parseInt(document.getElementById('drawSize').value)||3;
    if(drawTool==='pen'){
      drawCtx.strokeStyle=col; drawCtx.lineWidth=sz;
      drawCtx.lineTo(x,y); drawCtx.stroke();
    } else if(drawTool==='erase'){
      drawCtx.strokeStyle='#0a0e1a'; drawCtx.lineWidth=sz*4;
      drawCtx.lineTo(x,y); drawCtx.stroke();
    } else {
      drawCtx.putImageData(drawSnapshot,0,0);
      drawCtx.strokeStyle=col; drawCtx.lineWidth=sz;
      drawCtx.beginPath();
      if(drawTool==='line'){drawCtx.moveTo(drawStart.x,drawStart.y);drawCtx.lineTo(x,y);drawCtx.stroke();}
      else if(drawTool==='rect'){drawCtx.strokeRect(drawStart.x,drawStart.y,x-drawStart.x,y-drawStart.y);}
      else if(drawTool==='circle'){
        var r2=Math.sqrt(Math.pow(x-drawStart.x,2)+Math.pow(y-drawStart.y,2));
        drawCtx.arc(drawStart.x,drawStart.y,r2,0,2*Math.PI); drawCtx.stroke();
      }
    }
  };
  canvas.onmouseup=canvas.onmouseleave=function(){isDrawing=false;};
}
function setDrawTool(t,btn){
  drawTool=t;
  document.querySelectorAll('.draw-tool-btn').forEach(function(b){b.classList.remove('on');});
  if(btn) btn.classList.add('on');
}
function clearCanvas(){
  if(!drawCtx) return;
  var canvas=document.getElementById('drawCanvas');
  drawCtx.fillStyle='#0a0e1a';
  drawCtx.fillRect(0,0,canvas.width,canvas.height);
}
function insertBenzene(){
  if(!drawCtx){initDrawCanvas();}
  var canvas=document.getElementById('drawCanvas');
  var cx=canvas.width/2, cy=canvas.height/2, r=50;
  var col=document.getElementById('drawColor').value||'#4ade80';
  var sz=parseInt(document.getElementById('drawSize').value)||2;
  drawCtx.strokeStyle=col; drawCtx.lineWidth=sz;
  // Draw hexagon
  drawCtx.beginPath();
  for(var i=0;i<6;i++){
    var angle=Math.PI/180*(60*i-30);
    var x=cx+r*Math.cos(angle), y=cy+r*Math.sin(angle);
    if(i===0) drawCtx.moveTo(x,y); else drawCtx.lineTo(x,y);
  }
  drawCtx.closePath(); drawCtx.stroke();
  // Draw inner circle (Kekulé notation)
  drawCtx.beginPath();
  drawCtx.arc(cx,cy,r*0.55,0,2*Math.PI);
  drawCtx.stroke();
  // Label
  drawCtx.fillStyle=col; drawCtx.font='bold 11px monospace'; drawCtx.textAlign='center';
  drawCtx.fillText('C₆H₆',cx,cy+4);
}
function downloadDiagram(){
  var canvas=document.getElementById('drawCanvas'); if(!canvas) return;
  var link=document.createElement('a');
  link.download='chemistry-diagram.png';
  link.href=canvas.toDataURL('image/png');
  link.click();
}
// Extend initDrawCanvas to handle dbl/triple bond and text
var drawTextMode=false;


// ════════════════════════════════════════════════════════
// THEORY WRITING TOOLKIT — Subject-aware tool activation
// ════════════════════════════════════════════════════════

var SUBJECT_TOOLKITS = {

  // ─── ENGLISH LANGUAGE ───────────────────────────────────────────
  // Paper 2: Continuous Writing (essay/letter/speech)
  // Tools: rich text, structure, word count, tables, planning
  eng: {
    tools: ['richtext','structure','wordcount','tables','planning','quotebox'],
    label: 'Writing Tools'
  },

  // ─── LITERATURE IN ENGLISH ─────────────────────────────────────
  // Paper 2: Prose/Drama/Poetry analysis, close reading
  // Tools: rich text, quotebox (for textual evidence), structure, planning
  lit: {
    tools: ['richtext','quotebox','structure','wordcount','tables','planning'],
    label: 'Literature Tools'
  },

  // ─── MATHEMATICS ────────────────────────────────────────────────
  // Paper 2: Essay — number/algebra/geometry/statistics/trigonometry
  // Tools: scientific calculator, step-by-step working, geometry board, graph plotter
  mth: {
    tools: ['calculator','steps','geometry','graph','tables','planning'],
    label: 'Mathematics Tools'
  },

  // ─── FURTHER MATHEMATICS ────────────────────────────────────────
  // Paper 2: Calculus, vectors, matrices, statistics, binomial theorem
  // Tools: calculator, steps, graph, geometry, matrix input
  fmth: {
    tools: ['calculator','steps','geometry','graph','matrix','tables','planning'],
    label: 'Further Mathematics Tools'
  },

  // ─── BIOLOGY ────────────────────────────────────────────────────
  // Paper 2: Structure diagrams (heart, leaf, kidney), ecology, genetics
  // Tools: diagram + labelling canvas, scientific calculator, tables, structure
  bio: {
    tools: ['diagram','calculator','tables','structure','planning'],
    label: 'Biology Tools'
  },

  // ─── CHEMISTRY ──────────────────────────────────────────────────
  // Paper 2: Equations, organic structural formulae, periodic table, mole calculations
  // Tools: calculator, periodic table, equation editor (structural), diagram canvas, mole calc
  chm: {
    tools: ['calculator','periodic','equationeditor','diagram','molcalc','tables','planning'],
    label: 'Chemistry Tools'
  },

  // ─── PHYSICS ────────────────────────────────────────────────────
  // Paper 2: Ray diagrams, circuit diagrams, motion graphs, calculations
  // Tools: calculator, step-by-step working, diagram canvas (vector/circuit), graph plotter
  phy: {
    tools: ['calculator','steps','diagram','graph','tables','planning'],
    label: 'Physics Tools'
  },

  // ─── ECONOMICS ──────────────────────────────────────────────────
  // Paper 2: Demand/supply curves, tables, graphs, calculations
  // Tools: graph plotter, table builder, calculator, structure
  eco: {
    tools: ['graph','tables','calculator','structure','planning'],
    label: 'Economics Tools'
  },

  // ─── GOVERNMENT ─────────────────────────────────────────────────
  // Paper 2: Essays on democracy, constitution, political theory
  // Tools: rich text, structure, tables (for comparison), planning
  gov: {
    tools: ['richtext','structure','tables','wordcount','planning'],
    label: 'Government Tools'
  },

  // ─── GEOGRAPHY ──────────────────────────────────────────────────
  // Paper 2: Map sketching, cross-sections, climate graphs, erosion diagrams
  // Tools: diagram/sketch canvas, graph plotter, tables, labelling, structure
  geo: {
    tools: ['diagram','graph','tables','structure','planning'],
    label: 'Geography Tools'
  },

  // ─── HISTORY ────────────────────────────────────────────────────
  // Paper 2: Essays, compare/contrast, chronological accounts
  // Tools: rich text, timeline builder, tables (comparison), structure
  his: {
    tools: ['richtext','structure','tables','timeline','wordcount','planning'],
    label: 'History Tools'
  },

  // ─── CHRISTIAN RELIGIOUS STUDIES ────────────────────────────────
  // Paper 2: Biblical narrative, doctrinal essays
  // Tools: rich text, quotebox (scripture references), structure, planning
  crs: {
    tools: ['richtext','quotebox','structure','wordcount','planning'],
    label: 'CRS Tools'
  },

  // ─── ISLAMIC RELIGIOUS STUDIES ──────────────────────────────────
  // Paper 2: Quranic references, Islamic history and principles
  // Tools: rich text, quotebox (Quran/Hadith), structure, planning
  irs: {
    tools: ['richtext','quotebox','structure','wordcount','planning'],
    label: 'IRS Tools'
  },

  // ─── AGRICULTURAL SCIENCE ───────────────────────────────────────
  // Paper 2: Farm diagrams, soil profiles, pest/crop descriptions, calculations
  // Tools: diagram canvas, tables, calculator (for farm calculations), structure
  agr: {
    tools: ['diagram','tables','calculator','structure','planning'],
    label: 'Agriculture Tools'
  },

  // ─── FINANCIAL ACCOUNTING ───────────────────────────────────────
  // Paper 2: Trading/P&L/Balance Sheet, ledgers, bank reconciliation, ratios
  // Tools: ledger table builder, calculator, financial statement builder, structure
  acc: {
    tools: ['calculator','ledger','financialtable','tables','structure','planning'],
    label: 'Accounting Tools'
  },

  // ─── COMMERCE ───────────────────────────────────────────────────
  // Paper 2: Business documents, trade procedures, financial instruments
  // Tools: rich text, tables, structure, document template
  com: {
    tools: ['richtext','tables','structure','wordcount','planning'],
    label: 'Commerce Tools'
  },

  // ─── COMPUTER STUDIES ───────────────────────────────────────────
  // Paper 2: System diagrams, flowcharts, algorithms, network diagrams
  // Tools: diagram/flowchart canvas, tables, rich text, structure
  cmp: {
    tools: ['diagram','flowchart','tables','richtext','structure','planning'],
    label: 'Computer Studies Tools'
  },

  // ─── FINE ART ───────────────────────────────────────────────────
  // Paper 2: Art theory + studio practice — colour theory, composition, art history
  // Drawing canvas with art tools: pencil, colour, shapes, shading
  fne: {
    tools: ['fineartcanvas','colourpicker','shapes','diagram','richtext','planning'],
    label: 'Fine Art Tools'
  },

  // ─── MUSIC ──────────────────────────────────────────────────────
  // Paper 2: Music theory (notation, harmony) + history essays
  // Tools: staff notation helper, rich text, tables (chord/scale tables), structure
  mus: {
    tools: ['richtext','staffnotation','tables','structure','planning'],
    label: 'Music Tools'
  },

  // ─── FRENCH (Language) ──────────────────────────────────────────
  // Paper 2: Written French — composition, letter writing, comprehension response
  // Tools: rich text (with accents), word count, structure, planning
  fre: {
    tools: ['richtext','accents','wordcount','structure','planning'],
    label: 'French Writing Tools'
  },

  // ─── BASIC SCIENCE (BECE Junior) ────────────────────────────────
  // Covers biology, chemistry, physics, and basic tech at JSS level
  // Tools: calculator, diagram, tables, structure
  bsc: {
    tools: ['calculator','diagram','tables','structure','planning'],
    label: 'Basic Science Tools'
  },

  // ─── BASIC TECHNOLOGY (BECE Junior) ─────────────────────────────
  // Technical drawing, workshop practice, materials technology
  // Tools: technical drawing board, ruler+protractor, diagram, tables
  bst: {
    tools: ['technicaldraw','diagram','tables','structure','planning'],
    label: 'Basic Technology Tools'
  },

  // ─── SOCIAL STUDIES (BECE/Primary) ──────────────────────────────
  // Civics, history, geography, economics at junior level
  // Tools: rich text, tables, diagram (maps), structure
  sst: {
    tools: ['richtext','tables','diagram','structure','planning'],
    label: 'Social Studies Tools'
  },

  // ─── PHYSICAL HEALTH EDUCATION ──────────────────────────────────
  // Essays on sports, health, anatomy, nutrition
  // Tools: rich text, diagram (body/anatomy), tables, structure
  phe: {
    tools: ['richtext','diagram','tables','structure','wordcount','planning'],
    label: 'PHE Tools'
  },

  // ─── GENERAL PAPER (Common Entrance) ────────────────────────────
  // General knowledge, comprehension, mathematics
  // Tools: calculator, rich text, structure
  gen: {
    tools: ['calculator','richtext','structure','tables','planning'],
    label: 'General Paper Tools'
  },

  // ─── SCIENCE (Common Entrance / Primary level) ──────────────────
  sci: {
    tools: ['calculator','diagram','tables','structure','planning'],
    label: 'Science Tools'
  },

  // ─── DEFAULT (fallback) ─────────────────────────────────────────
  default: {
    tools: ['richtext','structure','tables','wordcount','planning'],
    label: 'Answer Tools'
  }
};


var TOOL_DEFS = {
  // Writing & Text
  richtext:       {ico:'✍️', label:'Rich Text',       group:'write', action:function(){ /* default textarea active */}},
  structure:      {ico:'📋', label:'Add Part',         group:'write', action:function(){addBlock('point');}},
  wordcount:      {ico:'📊', label:'Word Count',       group:'write', action:function(){showWordCount();}},
  planning:       {ico:'📝', label:'Rough Work',       group:'write', action:function(){togglePlan();}},
  quotebox:       {ico:'📖', label:'Quote/Evidence',   group:'write', action:function(){addBlock('quote');}},
  timeline:       {ico:'📅', label:'Timeline',         group:'write', action:function(){addBlock('timeline');}},
  accents:        {ico:'À', label:'Accents',           group:'write', action:function(){showAccentsPanel();}},

  // Tables & Data
  tables:         {ico:'⊞',  label:'Table',           group:'data',  action:function(){addBlock('table');}},
  ledger:         {ico:'📒', label:'Ledger',           group:'data',  action:function(){addBlock('ledger');}},
  financialtable: {ico:'💰', label:'Financial',        group:'data',  action:function(){addBlock('financial');}},

  // Mathematics
  calculator:     {ico:'🧮', label:'Calculator',       group:'maths', action:function(){toggleTool('toolCalc');}},
  steps:          {ico:'🔢', label:'Show Steps',       group:'maths', action:function(){addBlock('steps');}},
  geometry:       {ico:'📐', label:'Geometry Board',   group:'maths', action:function(){toggleTool('toolDraw');}},
  graph:          {ico:'📈', label:'Graph / Chart',    group:'maths', action:function(){toggleTool('toolTables');}},
  matrix:         {ico:'⊡',  label:'Matrix',          group:'maths', action:function(){addBlock('matrix');}},
  equationeditor: {ico:'⚡', label:'Equation',         group:'maths', action:function(){addBlock('equation');}},

  // Science
  periodic:       {ico:'⚗️', label:'Periodic Table',   group:'sci',   action:function(){toggleTool('toolPeriodic');}},
  molcalc:        {ico:'⚛️', label:'Mole Calc',        group:'sci',   action:function(){toggleTool('toolMolCalc');}},
  diagram:        {ico:'✏️', label:'Draw/Diagram',     group:'sci',   action:function(){toggleTool('toolDraw');}},
  flowchart:      {ico:'🔷', label:'Flowchart',        group:'sci',   action:function(){toggleTool('toolDraw');}},

  // Fine Art
  fineartcanvas:  {ico:'🎨', label:'Canvas',           group:'art',   action:function(){toggleTool('toolDraw');}},
  colourpicker:   {ico:'🖌️', label:'Colours',          group:'art',   action:function(){toggleTool('toolDraw');}},
  shapes:         {ico:'⬡',  label:'Shapes',          group:'art',   action:function(){toggleTool('toolDraw');}},

  // Music
  staffnotation:  {ico:'🎵', label:'Music Staff',      group:'mus',   action:function(){toggleTool('toolStaff');}},

  // Technical Drawing
  technicaldraw:  {ico:'📏', label:'Tech Drawing',     group:'tech',  action:function(){toggleTool('toolDraw');}},
};



// ════════════════════════════════════════════════════════════════
// BUILD SUBJECT-SPECIFIC TOOLKIT FOR LIVE EXAM
// Returns HTML for the toolkit bar that sits above the booklet.
// Maps the exam subject key to tools from SUBJECT_TOOLKITS / TOOL_DEFS.
// ════════════════════════════════════════════════════════════════
function buildSubjectToolkit(subjKey){
  if(!subjKey) subjKey='default';
  // strip class suffix if any (e.g. "mth-ss2" → "mth")
  subjKey = subjKey.replace(/-[a-z0-9]+$/,'');

  // subject-specific toolkit mapping for OBJECTIVE exam mode
  // (SUBJECT_TOOLKITS is primarily for theory/essay — for objective exams,
  // we keep a minimal, relevant set so the booklet isn't cluttered)
  var OBJ_TOOLKITS = {
    mth:  ['calculator','converter','trig','graph','formulasheet'],
    fmth: ['calculator','converter','trig','graph','formulasheet','eqsolver'],
    phy:  ['calculator','converter','circuits','graph','formulasheet'],
    chm:  ['calculator','periodicfull','balancer','molcalc','formulasheet'],
    bio:  ['calculator','punnett','diagram','formulasheet'],
    eng:  ['outliner','dictation','wordcount'],
    lit:  ['outliner','quotebox','wordcount'],
    eco:  ['calculator','graph','formulasheet'],
    govt: ['outliner','nigeriamap'],
    geo:  ['calculator','nigeriamap','graph'],
    crs:  ['outliner','quotebox'],
    agr:  ['calculator','diagram'],
    acc:  ['calculator','formulasheet'],
    bsc:  ['calculator','diagram'],
    default: ['calculator','outliner']
  };

  var tools = OBJ_TOOLKITS[subjKey] || OBJ_TOOLKITS.default;

  var TOOL_META = {
    calculator:    { ico:'🧮', lbl:'Calculator',      target:'toolCalc' },
    converter:     { ico:'⇄',  lbl:'Unit Convert',    target:'toolConverter' },
    trig:          { ico:'△',  lbl:'Triangle',        target:'toolTrig' },
    graph:         { ico:'📈', lbl:'Graph Plotter',   target:'toolGraph' },
    formulasheet:  { ico:'𝒇',  lbl:'Formula Sheet',   target:'toolFormula' },
    eqsolver:      { ico:'∫',  lbl:'Eq. Solver',      target:'toolEqSolver' },
    circuits:      { ico:'⚡', lbl:'Circuit Ref',     target:'toolCircuit' },
    periodicfull:  { ico:'⚗',  lbl:'Periodic Table',  target:'toolPeriodic' },
    balancer:      { ico:'⚖',  lbl:'Eq. Balancer',    target:'toolBalancer' },
    molcalc:       { ico:'⚛',  lbl:'Mole Calc',       target:'toolMolCalc' },
    punnett:       { ico:'🧬', lbl:'Punnett Square',  target:'toolPunnett' },
    diagram:       { ico:'✏',  lbl:'Sketch Pad',      target:'toolDraw' },
    outliner:      { ico:'📝', lbl:'Essay Outliner',  target:'toolOutliner' },
    dictation:     { ico:'🔊', lbl:'Read Aloud',      target:'toolDictation' },
    wordcount:     { ico:'#',  lbl:'Word Count',      target:'toolWordCount' },
    quotebox:      { ico:'❝',  lbl:'Quote Bank',      target:'toolQuotes' },
    nigeriamap:    { ico:'🗺', lbl:'Nigeria Map',     target:'toolNigeriaMap' }
  };

  var html = '<div class="ep-toolkit-bar">'
    + '';
  tools.forEach(function(key){
    var m = TOOL_META[key];
    if(!m) return;
    html += '<button class="etk-btn" data-tool="'+m.target+'" onclick="toggleTool(\''+m.target+'\');this.classList.toggle(\'active\')">'
         + '<span style="font-size:13px">'+m.ico+'</span> '+m.lbl
         + '</button>';
  });
  html += '<button class="etk-btn" style="margin-left:auto;background:rgba(224,58,47,.12);border-color:rgba(224,58,47,.3);color:#fca5a5" onclick="if(confirm(\'End exam and submit?\'))renderExamResults()">↳ Submit Paper</button>';
  html += '</div>';
  return html;
}

function buildTheoryToolkit(){
  var bar=document.getElementById('theoryToolkitBar');
  var toolContainer=document.getElementById('theoryToolkitTools');
  if(!bar||!toolContainer) return;

  // Get subject key
  var ctx=window._essayExamContext;
  var subjKey='default';
  if(ctx&&ctx.key){
    subjKey=ctx.key.replace(/-[a-z0-9]+$/,''); // strip class suffix
  } else if(typeof currentSubject!=='undefined'&&currentSubject){
    subjKey=currentSubject.replace(/-[a-z0-9]+$/,'');
  }

  var config=SUBJECT_TOOLKITS[subjKey]||SUBJECT_TOOLKITS.default;
  bar.style.display='flex';

  toolContainer.innerHTML='';
  config.tools.forEach(function(toolKey,idx){
    var def=TOOL_DEFS[toolKey];
    if(!def) return;
    // Add separator before certain groups
    if(idx>0&&(toolKey==='calculator'||toolKey==='diagram'||toolKey==='planning'||toolKey==='fineartcanvas')){
      var sep=document.createElement('div');
      sep.className='ttk-sep';
      toolContainer.appendChild(sep);
    }
    var btn=document.createElement('button');
    btn.className='ttk-btn';
    btn.id='ttk-'+toolKey;
    btn.innerHTML=def.ico+' '+def.label;
    btn.title=def.label;
    (function(d){ btn.onclick=function(){d.action();btn.classList.toggle('active');}; })(def);
    toolContainer.appendChild(btn);
  });
}

function showWordCount(){
  var wc=document.getElementById('tapWordCount');
  if(wc){
    wc.style.color='#fbbf24';
    setTimeout(function(){wc.style.color='';},2000);
  }
}

// ════════════════════════════════════════════════════════════════
// ADDITIONAL TOOL IMPLEMENTATIONS
// ════════════════════════════════════════════════════════════════

// ── Mole Calculator (Chemistry) ──────────────────────────────
function initMolCalc(){
  var wrap=document.getElementById('molCalcWrap'); if(!wrap) return;
  wrap.innerHTML=
    '<div style="padding:14px;font-size:.82rem">'
    +'<div class="tool-panel-row"><label>Mass (g)</label>'
    +'<input type="number" id="molMass" placeholder="e.g. 44" class="tool-input" oninput="calcMoles()"></div>'
    +'<div class="tool-panel-row" style="margin-top:8px"><label>Molar Mass (g/mol)</label>'
    +'<input type="number" id="molMolar" placeholder="e.g. 44 for CO₂" class="tool-input" oninput="calcMoles()"></div>'
    +'<div class="tool-panel-row" style="margin-top:8px"><label>Volume at STP (L)</label>'
    +'<input type="number" id="molVol" placeholder="optional" class="tool-input" oninput="calcMoles()"></div>'
    +'<div id="molResult" style="margin-top:12px;padding:10px;border-radius:8px;background:rgba(99,102,241,.12);font-weight:700;color:#c4b5fd;display:none"></div>'
    +'</div>';
}
function calcMoles(){
  var m=parseFloat(document.getElementById('molMass')?.value);
  var mr=parseFloat(document.getElementById('molMolar')?.value);
  var v=parseFloat(document.getElementById('molVol')?.value);
  var res=document.getElementById('molResult'); if(!res) return;
  var lines=[];
  if(m && mr){ var n=m/mr; lines.push('n = m/Mr = '+m+'/'+mr+' = '+n.toFixed(4)+' mol'); }
  if(n && !isNaN(n)){ lines.push('Particles = '+n.toFixed(4)+' × 6.022×10²³ = '+(n*6.022e23).toExponential(3)); }
  if(v){ lines.push('n (from vol) = V/22.4 = '+v+'/22.4 = '+(v/22.4).toFixed(4)+' mol'); }
  if(lines.length>0){ res.style.display='block'; res.innerHTML=lines.join('<br>'); }
  else { res.style.display='none'; }
}

// ── Accents Panel (French) ─────────────────────────────────────
function showAccentsPanel(){
  var panel=document.getElementById('toolAccents');
  if(!panel) return;
  panel.classList.toggle('open');
}
function insertAccent(char){
  var ta=document.querySelector('.theory-answer-pane textarea:focus')
    ||document.querySelector('#tapContent textarea');
  if(!ta) return;
  var start=ta.selectionStart, end=ta.selectionEnd;
  ta.value=ta.value.slice(0,start)+char+ta.value.slice(end);
  ta.selectionStart=ta.selectionEnd=start+1;
  ta.dispatchEvent(new Event('input'));
}

// ── Music Staff Notation helper ─────────────────────────────────
function initStaffNotation(){
  var wrap=document.getElementById('staffWrap'); if(!wrap) return;
  var canvas=document.createElement('canvas');
  canvas.width=460; canvas.height=120;
  canvas.style.cssText='width:100%;background:#fff;border-radius:8px';
  wrap.innerHTML='';
  wrap.appendChild(canvas);
  var ctx=canvas.getContext('2d');
  ctx.strokeStyle='#333'; ctx.lineWidth=1.5;
  // Draw 5 staff lines
  for(var i=0;i<5;i++){
    ctx.beginPath();
    ctx.moveTo(20,28+i*14);
    ctx.lineTo(440,28+i*14);
    ctx.stroke();
  }
  ctx.fillStyle='#333';
  ctx.font='bold 14px Arial';
  ctx.fillText('Treble Clef Staff — notes: E G B D F (lines) / F A C E (spaces)', 20, 100);
  // Draw treble clef symbol
  ctx.font='60px serif';
  ctx.fillText('𝄞',16,86);
}

// ── Timeline block ─────────────────────────────────────────────
// New block types handled in renderBlock()

// ── Financial Statement template ──────────────────────────────
// handled via addBlock('financial') → renders as a pre-formatted ledger table

// ── Flowchart (Computer Studies / Geography) ──────────────────
// Uses drawing canvas with shape snapping for flowchart symbols

// ── Show Word Count with pulse ────────────────────────────────
function showWordCount(){
  updateTheoryWordCount();
  var wc=document.getElementById('tapWordCount');
  if(wc){
    wc.style.background='rgba(251,191,36,.15)';
    wc.style.color='#fbbf24';
    wc.style.borderRadius='6px';
    wc.style.padding='2px 8px';
    setTimeout(function(){
      wc.style.background='';
      wc.style.color='';
      wc.style.padding='';
    },2500);
  }
}

// ════════════════════════════════════════════════════════════════
// EXAM EXIT CONFIRMATION SYSTEM
// ════════════════════════════════════════════════════════════════

function showExitConfirmModal(title, message, confirmLabel, onConfirm){
  // Remove any existing modal
  var existing=document.getElementById('exitConfirmModal');
  if(existing) existing.remove();

  var overlay=document.createElement('div');
  overlay.id='exitConfirmModal';
  overlay.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)';

  var card=document.createElement('div');
  card.style.cssText='background:#1a1f2e;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:32px 28px;max-width:400px;width:100%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.8)';

  card.innerHTML=
    '<div style="font-size:2.5rem;margin-bottom:14px">⚠️</div>'
    +'<div style="font-family:Bricolage Grotesque,sans-serif;font-size:1.15rem;font-weight:900;color:#fff;margin-bottom:10px">'+title+'</div>'
    +'<div style="font-size:.86rem;color:rgba(255,255,255,.5);line-height:1.6;margin-bottom:24px">'+message+'</div>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'
      +'<button id="exitConfirmYes" style="padding:13px 20px;border-radius:12px;border:none;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-family:inherit;font-size:.92rem;font-weight:800;cursor:pointer">'+confirmLabel+'</button>'
      +'<button id="exitConfirmNo" style="padding:13px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:rgba(255,255,255,.7);font-family:inherit;font-size:.92rem;font-weight:700;cursor:pointer">↩ Continue Exam</button>'
    +'</div>';

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  document.getElementById('exitConfirmYes').onclick=function(){
    overlay.remove();
    onConfirm();
  };
  document.getElementById('exitConfirmNo').onclick=function(){
    overlay.remove();
  };
  // Click outside to dismiss
  overlay.onclick=function(e){if(e.target===overlay) overlay.remove();};
}

function confirmExamExit(){
  if(examSession && examSession.timer){
    // Mid-exam
    showExitConfirmModal(
      'Exit Exam?',
      'You have '+(examSession.answered||0)+' of '+(examSession.questions||[]).length+' questions answered. Your progress will be lost if you exit now.',
      '🚪 Exit & Lose Progress',
      function(){
        if(examSession && examSession.timer) clearInterval(examSession.timer);
        examSession=null;
        ecInit();
        goTo('pg-classroom');
      }
    );
  } else {
    // Not in active session — just go
    goTo('pg-classroom');
  }
}

function confirmExamStepBack(step){
  if(examSession && examSession.timer){
    showExitConfirmModal(
      'Abandon Exam?',
      'Going back will end your current exam session. '+(examSession.answered||0)+' answered question(s) will be lost.',
      '↩ Go Back & End Exam',
      function(){
        if(examSession && examSession.timer) clearInterval(examSession.timer);
        examSession=null;
        ecGoStep(step);
      }
    );
  } else {
    ecGoStep(step);
  }
}

// ════════════════════════════════════════════════════════════════
// HOMEWORK HELPER — ENHANCED MEDIA SUPPORT
// Camera, Paste, Drag-Drop, Word/PDF/Image upload
// ════════════════════════════════════════════════════════════════

var hwUploadedFiles = []; // array of {name, type, base64, dataUrl, size}

function hwHandleDrop(e){
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  var files=e.dataTransfer.files;
  if(files&&files.length) hwProcessFiles(Array.from(files));
}

function hwHandleUpload(input){
  var files=Array.from(input.files||[]);
  if(files.length) hwProcessFiles(files);
  input.value='';
}

function hwProcessFiles(files){
  files.forEach(function(file){
    var maxSize=20*1024*1024; // 20MB
    if(file.size>maxSize){hwAddMsg('tutor','⚠️ File "'+file.name+'" is too large (max 20MB). Please compress or try a smaller file.');return;}
    
    var reader=new FileReader();
    reader.onload=function(ev){
      var dataUrl=ev.target.result;
      var base64=dataUrl.split(',')[1];
      var fileObj={name:file.name,type:file.type,size:file.size,base64:base64,dataUrl:dataUrl};
      hwUploadedFiles.push(fileObj);
      hwUploadedFile=fileObj; // keep legacy reference
      hwUpdateUploadPreview();
    };
    reader.readAsDataURL(file);
  });
}

function hwUpdateUploadPreview(){
  var preview=document.getElementById('hwUploadPreview');
  var list=document.getElementById('hwPreviewList');
  var bar=document.getElementById('hwAttachBar');
  var lbl=document.getElementById('hwAttachLabel');
  
  if(!hwUploadedFiles.length){
    if(preview) preview.style.display='none';
    if(bar) bar.style.display='none';
    return;
  }
  
  if(preview) preview.style.display='block';
  if(bar){bar.style.display='flex';}
  if(lbl) lbl.textContent='📎 '+hwUploadedFiles.length+' file'+(hwUploadedFiles.length>1?'s':'')+' attached';
  
  if(list){
    list.innerHTML='';
    hwUploadedFiles.forEach(function(f,i){
      var item=document.createElement('div');
      item.className='hw-preview-item';
      var isImage=f.type.startsWith('image/');
      var ico=isImage?'🖼️':f.type.includes('pdf')?'📄':f.type.includes('word')||f.name.match(/\.docx?$/i)?'📝':'📎';
      item.innerHTML=(isImage?'<img class="hw-preview-thumb" src="'+f.dataUrl+'" alt="">':'')
        +'<span class="hw-preview-name">'+ico+' '+f.name+'</span>'
        +'<span style="font-size:.65rem;color:rgba(255,255,255,.25)">'+Math.round(f.size/1024)+'KB</span>'
        +'<button onclick="hwRemoveUploadAt('+i+')" style="background:none;border:none;color:rgba(255,255,255,.3);cursor:pointer;font-size:.8rem;flex-shrink:0">✕</button>';
      list.appendChild(item);
    });
  }
  
  // Show in chat as attached files
  var zone=document.getElementById('hwUploadZone');
  if(zone) zone.style.display='none';
}

function hwRemoveUploadAt(idx){
  hwUploadedFiles.splice(idx,1);
  if(!hwUploadedFiles.length) hwUploadedFile=null;
  else hwUploadedFile=hwUploadedFiles[hwUploadedFiles.length-1];
  hwUpdateUploadPreview();
  if(!hwUploadedFiles.length){
    var zone=document.getElementById('hwUploadZone');
    if(zone) zone.style.display='block';
  }
}

function hwRemoveAllUploads(){
  hwUploadedFiles=[];
  hwUploadedFile=null;
  hwUpdateUploadPreview();
  var zone=document.getElementById('hwUploadZone');
  if(zone) zone.style.display='block';
}

// ── Camera capture ────────────────────────────────────────────
var hwCameraStream=null;
function hwOpenCamera(){
  var modal=document.getElementById('hwCameraModal');
  if(!modal) return;
  modal.style.display='flex';
  navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false})
    .then(function(stream){
      hwCameraStream=stream;
      var video=document.getElementById('hwCameraStream');
      if(video){video.srcObject=stream;video.play();}
    })
    .catch(function(err){
      modal.style.display='none';
      hwAddMsg('tutor','⚠️ Camera not available: '+err.message+'. Please upload a photo file instead.');
    });
}
function hwCapturePhoto(){
  var video=document.getElementById('hwCameraStream');
  var canvas=document.getElementById('hwCaptureCanvas');
  if(!video||!canvas) return;
  canvas.width=video.videoWidth;
  canvas.height=video.videoHeight;
  canvas.getContext('2d').drawImage(video,0,0);
  var dataUrl=canvas.toDataURL('image/jpeg',0.85);
  var base64=dataUrl.split(',')[1];
  var fileObj={name:'camera-photo-'+Date.now()+'.jpg',type:'image/jpeg',size:base64.length,base64:base64,dataUrl:dataUrl};
  hwUploadedFiles.push(fileObj);
  hwUploadedFile=fileObj;
  hwUpdateUploadPreview();
  hwCloseCamera();
  hwAddMsg('tutor','📸 Photo captured! Now ask your question about what you see in the image.');
}
function hwCloseCamera(){
  var modal=document.getElementById('hwCameraModal');
  if(modal) modal.style.display='none';
  if(hwCameraStream){hwCameraStream.getTracks().forEach(function(t){t.stop();});hwCameraStream=null;}
}

// ── Paste screenshot from clipboard ────────────────────────────
function hwPasteScreenshot(){
  if(!navigator.clipboard||!navigator.clipboard.read){
    hwAddMsg('tutor','📋 To paste a screenshot: press Ctrl+V (or Cmd+V on Mac) directly in the text box. Make sure your screenshot is copied first.');
    return;
  }
  navigator.clipboard.read().then(function(items){
    for(var i=0;i<items.length;i++){
      var item=items[i];
      for(var j=0;j<item.types.length;j++){
        if(item.types[j].startsWith('image/')){
          item.getType(item.types[j]).then(function(blob){
            var reader=new FileReader();
            reader.onload=function(ev){
              var dataUrl=ev.target.result;
              var base64=dataUrl.split(',')[1];
              var fileObj={name:'screenshot-'+Date.now()+'.png',type:'image/png',size:base64.length,base64:base64,dataUrl:dataUrl};
              hwUploadedFiles.push(fileObj);
              hwUploadedFile=fileObj;
              hwUpdateUploadPreview();
              hwAddMsg('tutor','📋 Screenshot pasted! Now ask your question about it.');
            };
            reader.readAsDataURL(blob);
          });
          return;
        }
      }
    }
    hwAddMsg('tutor','📋 No image found in clipboard. Copy an image first, then click Paste.');
  }).catch(function(){
    hwAddMsg('tutor','📋 Please press Ctrl+V (Cmd+V on Mac) directly in the text box to paste your screenshot.');
  });
}

// ── Handle paste in text area ─────────────────────────────────
function hwHandleInputPaste(e){
  var items=e.clipboardData&&e.clipboardData.items;
  if(!items) return;
  for(var i=0;i<items.length;i++){
    if(items[i].type.startsWith('image/')){
      e.preventDefault();
      var blob=items[i].getAsFile();
      if(blob){
        var reader=new FileReader();
        reader.onload=function(ev){
          var dataUrl=ev.target.result;
          var base64=dataUrl.split(',')[1];
          var fileObj={name:'pasted-image-'+Date.now()+'.png',type:'image/png',size:base64.length,base64:base64,dataUrl:dataUrl};
          hwUploadedFiles.push(fileObj);
          hwUploadedFile=fileObj;
          hwUpdateUploadPreview();
          hwAddMsg('tutor','📋 Image pasted! What would you like to know about it?');
        };
        reader.readAsDataURL(blob);
      }
      return;
    }
  }
}

// ── Override hwFetch to handle multiple files ─────────────────
var _origHwFetch=null;
function hwFetchWithMedia(userMsg){
  if(typeof hwIsTyping!=='undefined'&&hwIsTyping) return;
  if(typeof hwIsTyping!=='undefined') hwIsTyping=true;
  var msgs=document.getElementById('hwChatMsgs');
  var t=document.createElement('div');
  t.id='hwTyping';t.className='hw-msg hw-msg-tutor hw-typing';
  t.innerHTML='<div class="hw-msg-name">Lesson Teacher</div><div class="hw-bubble"><div class="lt-loading"><div class="ld-dot"></div><div class="ld-dot"></div><div class="ld-dot"></div></div></div>';
  msgs.appendChild(t);msgs.scrollTop=msgs.scrollHeight;
  
  var sys=typeof HW_SYS!=='undefined'?HW_SYS.replace('CLASS',hwCurrentClass||'unknown').replace('SUBJ',hwCurrentSubj||'General'):'You are a helpful tutor for Nigerian secondary school students.';
  var messages=(hwHistory||[]).slice(-14);
  
  // Build message with all attached files
  if(hwUploadedFiles&&hwUploadedFiles.length>0){
    var lastMsg=messages[messages.length-1];
    var contentArr=[];
    hwUploadedFiles.forEach(function(f){
      if(f.type.startsWith('image/')){
        contentArr.push({type:'image',source:{type:'base64',media_type:f.type,data:f.base64}});
      } else if(f.type==='application/pdf'){
        contentArr.push({type:'document',source:{type:'base64',media_type:'application/pdf',data:f.base64}});
      } else {
        // Word/other — tell AI about it
        contentArr.push({type:'text',text:'[Attached file: '+f.name+' — '+f.type+'. Please note this file type cannot be directly read; ask the student to paste the text content.]'});
      }
    });
    contentArr.push({type:'text',text:lastMsg.content});
    messages[messages.length-1]={role:'user',content:contentArr};
  }
  
  fetch('/api/anthropic',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'claude-sonnet-4-5',max_tokens:1400,system:sys,messages:messages})
  }).then(function(res){return res.json();})
  .then(function(data){
    var reply=data&&data.content&&data.content.find(function(b){return b.type==='text';});
    reply=reply?reply.text:'';
    var td=document.getElementById('hwTyping');if(td)td.remove();
    if(reply){if(hwHistory)hwHistory.push({role:'assistant',content:reply});hwAddMsg('tutor',reply);}
    else hwAddMsg('tutor','Could not respond. Please try again.');
    // Clear files after sending
    hwUploadedFiles=[];hwUploadedFile=null;
    hwUpdateUploadPreview();
    var zone=document.getElementById('hwUploadZone');if(zone)zone.style.display='block';
  }).catch(function(e){
    var td2=document.getElementById('hwTyping');if(td2)td2.remove();
    hwAddMsg('tutor','Could not connect. Check your internet connection.');
  }).finally(function(){if(typeof hwIsTyping!=='undefined') hwIsTyping=false;});
}

// Override hwFetch on init
document.addEventListener('DOMContentLoaded',function(){
  if(typeof hwFetch==='function') window._origHwFetch=window.hwFetch;
  window.hwFetch=hwFetchWithMedia;
});
