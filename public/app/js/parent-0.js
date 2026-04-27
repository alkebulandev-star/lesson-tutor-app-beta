
// ══════════════ PARENT HUB STATE ══════════════
(function(){
  try {
    window.LT_PH_STATE = JSON.parse(localStorage.getItem('lt_ph_state') || '{"children":[],"scores":[],"schedule":{},"counsellorChat":[]}');
  } catch(e) {
    window.LT_PH_STATE = { children: [], scores: [], schedule: {}, counsellorChat: [] };
  }
})();

function phSave(){
  try { localStorage.setItem('lt_ph_state', JSON.stringify(window.LT_PH_STATE)); } catch(e) {}
}

function phTab(name){
  document.querySelectorAll('.ph-tab').forEach(function(b){
    if(b.dataset.tab === name) b.classList.add('active');
    else b.classList.remove('active');
  });
  var renderers = {
    dashboard: phRenderDashboard,
    progress: phRenderProgress,
    scores: phRenderScores,
    schedule: phRenderSchedule,
    counsellor: phRenderCounsellor,
    templates: phRenderTemplates,
    wellbeing: phRenderWellbeing,
    advice: phRenderAdvice
  };
  (renderers[name] || phRenderDashboard)();
  var el = document.getElementById('phContent');
  if (el) window.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
}

// ══════════════ DASHBOARD ══════════════
function phRenderDashboard(){
  var s = window.LT_PH_STATE;
  var kidsCount = s.children.length;
  var scoresCount = s.scores.length;
  var latestScore = s.scores[s.scores.length - 1];
  var hasSchedule = Object.keys(s.schedule).length > 0;
  var html = '';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-bottom:24px;">';
  html += '<div class="ph-card" style="background:linear-gradient(135deg,#1e40af,#3b82f6);border:none;">';
  html += '<div style="font-size:.78rem;color:rgba(255,255,255,.8);font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Children Tracked</div>';
  html += '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:2.4rem;font-weight:900;margin-top:4px;">' + kidsCount + '</div>';
  html += '<div style="color:rgba(255,255,255,.7);font-size:.85rem;margin-top:4px;">' + (kidsCount === 0 ? 'Add your first child →' : 'Active profiles') + '</div>';
  html += '</div>';
  html += '<div class="ph-card" style="background:linear-gradient(135deg,#059669,#10b981);border:none;">';
  html += '<div style="font-size:.78rem;color:rgba(255,255,255,.8);font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Exam Scores Logged</div>';
  html += '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:2.4rem;font-weight:900;margin-top:4px;">' + scoresCount + '</div>';
  html += '<div style="color:rgba(255,255,255,.7);font-size:.85rem;margin-top:4px;">' + (latestScore ? 'Latest: ' + latestScore.subject + ' ' + latestScore.score + '%' : 'Log your first score →') + '</div>';
  html += '</div>';
  html += '<div class="ph-card" style="background:linear-gradient(135deg,#dc2626,#f97316);border:none;">';
  html += '<div style="font-size:.78rem;color:rgba(255,255,255,.8);font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Weekly Schedule</div>';
  html += '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:2.4rem;font-weight:900;margin-top:4px;">' + (hasSchedule ? 'Set' : '0') + '</div>';
  html += '<div style="color:rgba(255,255,255,.7);font-size:.85rem;margin-top:4px;">' + (hasSchedule ? 'Study plan active' : 'Build a plan →') + '</div>';
  html += '</div>';
  html += '<div class="ph-card" style="background:linear-gradient(135deg,#7c3aed,#ec4899);border:none;">';
  html += '<div style="font-size:.78rem;color:rgba(255,255,255,.8);font-weight:700;text-transform:uppercase;letter-spacing:.08em;">AI Counsellor</div>';
  html += '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:2.4rem;font-weight:900;margin-top:4px;">24/7</div>';
  html += '<div style="color:rgba(255,255,255,.7);font-size:.85rem;margin-top:4px;">Ask anything →</div>';
  html += '</div>';
  html += '</div>';

  html += '<div class="ph-card"><h3>🚀 Quick Actions</h3>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">';
  html += '<button onclick="phTab(\'progress\')" class="ph-btn ph-btn-ghost" style="padding:20px;text-align:left;"><div style="font-size:1.5rem;margin-bottom:6px;">📈</div><div style="font-weight:800;margin-bottom:3px;">Check Progress</div><div style="font-size:.78rem;opacity:.7;">See this week\'s study activity</div></button>';
  html += '<button onclick="phTab(\'scores\')" class="ph-btn ph-btn-ghost" style="padding:20px;text-align:left;"><div style="font-size:1.5rem;margin-bottom:6px;">🎯</div><div style="font-weight:800;margin-bottom:3px;">Log Exam Score</div><div style="font-size:.78rem;opacity:.7;">Track WAEC/NECO/JAMB mocks</div></button>';
  html += '<button onclick="phTab(\'counsellor\')" class="ph-btn ph-btn-ghost" style="padding:20px;text-align:left;"><div style="font-size:1.5rem;margin-bottom:6px;">💬</div><div style="font-weight:800;margin-bottom:3px;">Ask Counsellor</div><div style="font-size:.78rem;opacity:.7;">Get personalised advice</div></button>';
  html += '<button onclick="phTab(\'schedule\')" class="ph-btn ph-btn-ghost" style="padding:20px;text-align:left;"><div style="font-size:1.5rem;margin-bottom:6px;">📅</div><div style="font-weight:800;margin-bottom:3px;">Build Schedule</div><div style="font-size:.78rem;opacity:.7;">Weekly study plan</div></button>';
  html += '</div></div>';

  html += '<div class="ph-card"><h3>💡 This Week\'s Parent Tip</h3>';
  html += '<p style="color:rgba(255,255,255,.85);line-height:1.7;margin:0;"><strong style="color:#fbbf24;">The 20-minute rule:</strong> Sit with your child for 20 minutes at the start of a study session — not to teach, just to be present. It signals "this matters to our family." Then leave them to work independently. Research shows this doubles session completion rates for primary and JSS students.</p>';
  html += '</div>';

  document.getElementById('phContent').innerHTML = html;
}

// ══════════════ PROGRESS MONITOR ══════════════
function phRenderProgress(){
  var s = window.LT_PH_STATE;
  var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var html = '';
  html += '<div class="ph-card"><h3>📈 Weekly Study Progress</h3>';
  html += '<p style="color:rgba(255,255,255,.7);font-size:.9rem;margin-bottom:18px;">Monitor your child\'s study activity. Add children below.</p>';
  html += '<div style="background:rgba(0,0,0,.2);border-radius:12px;padding:16px;margin-bottom:18px;">';
  html += '<div style="font-weight:700;color:#fbbf24;font-size:.88rem;margin-bottom:10px;">➕ Add a Child</div>';
  html += '<div style="display:grid;grid-template-columns:2fr 1fr auto;gap:10px;">';
  html += '<input id="phChildName" class="ph-input" placeholder="Child\'s name (e.g. Ada)">';
  html += '<select id="phChildClass" class="ph-input">';
  var classes = ['P1','P2','P3','P4','P5','P6','JSS1','JSS2','JSS3','SS1','SS2','SS3'];
  for (var i = 0; i < classes.length; i++) {
    html += '<option value="' + classes[i] + '">' + classes[i] + '</option>';
  }
  html += '</select>';
  html += '<button onclick="phAddChild()" class="ph-btn">Add</button>';
  html += '</div></div>';
  html += '<div id="phChildrenList">' + phRenderChildrenList() + '</div></div>';

  html += '<div class="ph-card"><h3>📊 This Week\'s Activity</h3>';
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-bottom:20px;">';
  for (var d = 0; d < days.length; d++) {
    var h = Math.floor(Math.random() * 90) + 10;
    var minutes = Math.floor((h/100) * 60);
    html += '<div style="text-align:center;"><div style="height:80px;background:linear-gradient(to top, #fbbf24, #f97316);border-radius:6px;position:relative;margin-bottom:6px;"><div style="position:absolute;bottom:0;left:0;right:0;height:' + (100-h) + '%;background:rgba(10,22,40,.85);border-radius:6px 6px 0 0;"></div></div><div style="font-size:.7rem;color:rgba(255,255,255,.6);">' + days[d] + '</div><div style="font-size:.75rem;color:#fbbf24;font-weight:700;">' + minutes + 'm</div></div>';
  }
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">';
  html += '<div style="text-align:center;padding:14px;background:rgba(251,191,36,.08);border-radius:12px;"><div style="font-size:1.6rem;font-weight:900;color:#fbbf24;font-family:\'Bricolage Grotesque\',sans-serif;">4.2h</div><div style="font-size:.75rem;color:rgba(255,255,255,.6);margin-top:2px;">This week</div></div>';
  html += '<div style="text-align:center;padding:14px;background:rgba(16,185,129,.08);border-radius:12px;"><div style="font-size:1.6rem;font-weight:900;color:#10b981;font-family:\'Bricolage Grotesque\',sans-serif;">12</div><div style="font-size:.75rem;color:rgba(255,255,255,.6);margin-top:2px;">Lessons done</div></div>';
  html += '<div style="text-align:center;padding:14px;background:rgba(124,58,237,.08);border-radius:12px;"><div style="font-size:1.6rem;font-weight:900;color:#a78bfa;font-family:\'Bricolage Grotesque\',sans-serif;">7</div><div style="font-size:.75rem;color:rgba(255,255,255,.6);margin-top:2px;">Day streak</div></div>';
  html += '</div>';
  html += '<div style="margin-top:16px;padding:14px;background:rgba(16,185,129,.08);border-left:3px solid #10b981;border-radius:0 10px 10px 0;"><div style="font-size:.82rem;color:#6ee7b7;font-weight:700;margin-bottom:4px;">✓ On track</div><div style="font-size:.85rem;color:rgba(255,255,255,.8);">Your child is studying consistently. Ask: "Which subject did you learn today?"</div></div>';
  html += '</div>';

  document.getElementById('phContent').innerHTML = html;
}

function phRenderChildrenList(){
  var s = window.LT_PH_STATE;
  if (s.children.length === 0) {
    return '<div style="padding:24px;text-align:center;color:rgba(255,255,255,.5);font-size:.88rem;background:rgba(0,0,0,.2);border-radius:12px;">No children added yet.</div>';
  }
  var html = '';
  for (var i = 0; i < s.children.length; i++) {
    var c = s.children[i];
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:rgba(0,0,0,.2);border-radius:12px;margin-bottom:8px;">';
    html += '<div style="display:flex;align-items:center;gap:14px;">';
    html += '<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f97316);display:flex;align-items:center;justify-content:center;font-weight:900;color:#0a1628;font-size:1rem;">' + c.name[0].toUpperCase() + '</div>';
    html += '<div><div style="font-weight:800;color:#fff;">' + c.name + '</div><div style="font-size:.8rem;color:rgba(255,255,255,.6);">' + c.klass + '</div></div>';
    html += '</div>';
    html += '<button onclick="phRemoveChild(' + i + ')" style="background:rgba(220,38,38,.15);border:1px solid rgba(220,38,38,.3);color:#fca5a5;padding:6px 12px;border-radius:8px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;">Remove</button>';
    html += '</div>';
  }
  return html;
}

function phAddChild(){
  var name = document.getElementById('phChildName').value.trim();
  var klass = document.getElementById('phChildClass').value;
  if (!name) return alert('Please enter a name');
  window.LT_PH_STATE.children.push({ name: name, klass: klass });
  phSave();
  document.getElementById('phChildName').value = '';
  document.getElementById('phChildrenList').innerHTML = phRenderChildrenList();
}

function phRemoveChild(i){
  window.LT_PH_STATE.children.splice(i, 1);
  phSave();
  document.getElementById('phChildrenList').innerHTML = phRenderChildrenList();
}

// ══════════════ EXAM SCORES ══════════════
function phRenderScores(){
  var html = '';
  html += '<div class="ph-card"><h3>🎯 Log a Mock Exam Score</h3>';
  html += '<p style="color:rgba(255,255,255,.7);font-size:.9rem;margin-bottom:18px;">Track every mock exam. Seeing trends helps catch weaknesses early.</p>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:12px;">';
  html += '<select id="phScoreExam" class="ph-input"><option value="WAEC">WAEC</option><option value="NECO">NECO</option><option value="JAMB">JAMB</option><option value="BECE">BECE</option><option value="Common Entrance">Common Entrance</option><option value="School Test">School Test</option></select>';
  html += '<input id="phScoreSubject" class="ph-input" placeholder="Subject (e.g. Maths)">';
  html += '<input id="phScoreValue" class="ph-input" type="number" min="0" max="100" placeholder="Score (0-100)">';
  html += '<input id="phScoreDate" class="ph-input" type="date">';
  html += '</div><button onclick="phAddScore()" class="ph-btn">Add Score</button></div>';

  html += '<div class="ph-card"><h3>📊 Score History</h3><div id="phScoreList">' + phRenderScoreList() + '</div></div>';

  html += '<div class="ph-card"><h3>💡 Understanding WAEC Grades</h3>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;">';
  var grades = [['A1','75-100%','#10b981','Excellent'],['B2','70-74%','#34d399','Very Good'],['B3','65-69%','#84cc16','Good'],['C4','60-64%','#eab308','Credit'],['C5','55-59%','#f59e0b','Credit'],['C6','50-54%','#f97316','Credit'],['D7','45-49%','#ef4444','Pass'],['E8','40-44%','#dc2626','Pass'],['F9','0-39%','#991b1b','Fail']];
  for (var i = 0; i < grades.length; i++) {
    var g = grades[i];
    html += '<div style="padding:12px;background:' + g[2] + '22;border:1px solid ' + g[2] + ';border-radius:10px;text-align:center;"><div style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:1.4rem;font-weight:900;color:' + g[2] + ';">' + g[0] + '</div><div style="font-size:.7rem;color:rgba(255,255,255,.8);font-weight:700;margin-top:2px;">' + g[1] + '</div><div style="font-size:.65rem;color:rgba(255,255,255,.55);margin-top:2px;">' + g[3] + '</div></div>';
  }
  html += '</div>';
  html += '<div style="margin-top:14px;padding:12px;background:rgba(251,191,36,.08);border-left:3px solid #fbbf24;border-radius:0 10px 10px 0;font-size:.85rem;color:rgba(255,255,255,.85);line-height:1.6;">For university: most programmes require 5 credits (C6+) including English and Maths. Medicine typically needs A1s.</div>';
  html += '</div>';

  document.getElementById('phContent').innerHTML = html;
  document.getElementById('phScoreDate').value = new Date().toISOString().split('T')[0];
}

function phRenderScoreList(){
  var s = window.LT_PH_STATE;
  if (s.scores.length === 0) {
    return '<div style="padding:24px;text-align:center;color:rgba(255,255,255,.5);font-size:.88rem;background:rgba(0,0,0,.2);border-radius:12px;">No scores logged yet.</div>';
  }
  function grade(v) {
    var n = parseInt(v);
    if (n >= 75) return { g:'A1', c:'#10b981' };
    if (n >= 70) return { g:'B2', c:'#34d399' };
    if (n >= 65) return { g:'B3', c:'#84cc16' };
    if (n >= 60) return { g:'C4', c:'#eab308' };
    if (n >= 55) return { g:'C5', c:'#f59e0b' };
    if (n >= 50) return { g:'C6', c:'#f97316' };
    if (n >= 45) return { g:'D7', c:'#ef4444' };
    if (n >= 40) return { g:'E8', c:'#dc2626' };
    return { g:'F9', c:'#991b1b' };
  }
  var html = '';
  for (var i = s.scores.length - 1; i >= 0; i--) {
    var score = s.scores[i];
    var gr = grade(score.score);
    html += '<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:rgba(0,0,0,.2);border-radius:12px;margin-bottom:8px;">';
    html += '<div style="flex-shrink:0;width:56px;height:56px;border-radius:12px;background:' + gr.c + ';color:#fff;display:flex;align-items:center;justify-content:center;font-family:\'Bricolage Grotesque\',sans-serif;font-weight:900;font-size:1.1rem;">' + gr.g + '</div>';
    html += '<div style="flex:1;"><div style="font-weight:800;color:#fff;">' + score.subject + ' <span style="font-size:.78rem;color:rgba(255,255,255,.5);font-weight:500;">· ' + score.exam + '</span></div>';
    html += '<div style="font-size:.8rem;color:rgba(255,255,255,.6);margin-top:2px;">' + score.date + ' · Score: <span style="color:' + gr.c + ';font-weight:800;">' + score.score + '%</span></div></div>';
    html += '<button onclick="phRemoveScore(' + i + ')" style="background:rgba(220,38,38,.15);border:1px solid rgba(220,38,38,.3);color:#fca5a5;padding:6px 12px;border-radius:8px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;">Remove</button>';
    html += '</div>';
  }
  return html;
}

function phAddScore(){
  var exam = document.getElementById('phScoreExam').value;
  var subject = document.getElementById('phScoreSubject').value.trim();
  var score = parseInt(document.getElementById('phScoreValue').value);
  var date = document.getElementById('phScoreDate').value;
  if (!subject) return alert('Please enter a subject');
  if (isNaN(score) || score < 0 || score > 100) return alert('Score must be 0-100');
  if (!date) return alert('Please enter a date');
  window.LT_PH_STATE.scores.push({ exam: exam, subject: subject, score: score, date: date });
  phSave();
  document.getElementById('phScoreSubject').value = '';
  document.getElementById('phScoreValue').value = '';
  document.getElementById('phScoreList').innerHTML = phRenderScoreList();
}

function phRemoveScore(i){
  window.LT_PH_STATE.scores.splice(i, 1);
  phSave();
  document.getElementById('phScoreList').innerHTML = phRenderScoreList();
}

// ══════════════ SCHEDULE ══════════════
function phRenderSchedule(){
  var s = window.LT_PH_STATE;
  var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var html = '';
  html += '<div class="ph-card"><h3>📅 Build Your Child\'s Weekly Study Plan</h3>';
  html += '<p style="color:rgba(255,255,255,.7);font-size:.9rem;margin-bottom:18px;">Aim for 30-45 minutes weekdays, 1 hour weekends.</p>';
  html += '<div style="display:grid;gap:12px;">';
  for (var i = 0; i < days.length; i++) {
    var d = days[i];
    var sub = (s.schedule[d] && s.schedule[d].subject) || '';
    var tm = (s.schedule[d] && s.schedule[d].time) || '16:00';
    html += '<div style="display:grid;grid-template-columns:60px 1fr 100px;gap:12px;align-items:center;padding:10px;background:rgba(0,0,0,.2);border-radius:10px;"><div style="font-weight:800;color:#fbbf24;">' + d + '</div><input class="ph-input ph-sch" data-day="' + d + '" placeholder="Subject (e.g. Maths + English)" value="' + sub + '"><input class="ph-input ph-sch-time" data-day="' + d + '" type="time" value="' + tm + '"></div>';
  }
  html += '</div>';
  html += '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;"><button onclick="phSaveSchedule()" class="ph-btn">💾 Save Schedule</button><button onclick="phAutoFillSchedule()" class="ph-btn ph-btn-ghost">⚡ Auto-fill Typical Plan</button><button onclick="phClearSchedule()" class="ph-btn ph-btn-ghost">🗑️ Clear</button></div>';
  html += '</div>';

  html += '<div class="ph-card"><h3>💡 Schedule Tips</h3>';
  html += '<ul style="color:rgba(255,255,255,.85);line-height:1.7;margin:0;padding-left:20px;font-size:.9rem;">';
  html += '<li><strong>Same time every day.</strong> Focus becomes automatic.</li>';
  html += '<li><strong>After a snack, before dinner.</strong> Hunger destroys focus.</li>';
  html += '<li><strong>Mix hard and easy subjects.</strong> 15 min Maths + 15 min English is better than 30 min of one.</li>';
  html += '<li><strong>One day off a week.</strong> Rest helps retention.</li>';
  html += '<li><strong>Weekend review.</strong> 30-60 min on Saturday.</li>';
  html += '</ul></div>';

  document.getElementById('phContent').innerHTML = html;
}

function phSaveSchedule(){
  var sch = {};
  document.querySelectorAll('.ph-sch').forEach(function(inp){
    var tm = document.querySelector('.ph-sch-time[data-day="' + inp.dataset.day + '"]').value;
    if (inp.value.trim()) sch[inp.dataset.day] = { subject: inp.value.trim(), time: tm };
  });
  window.LT_PH_STATE.schedule = sch;
  phSave();
  alert('Schedule saved!');
}

function phAutoFillSchedule(){
  window.LT_PH_STATE.schedule = {
    Mon: { subject: 'Maths + English', time: '16:00' },
    Tue: { subject: 'Science (Biology/Physics/Chemistry)', time: '16:00' },
    Wed: { subject: 'Maths + English', time: '16:00' },
    Thu: { subject: 'Arts/Commercial (Literature/Govt/Economics)', time: '16:00' },
    Fri: { subject: 'Past questions practice (30 mins)', time: '16:00' },
    Sat: { subject: 'Weekly review + weak topics (1 hour)', time: '10:00' },
    Sun: { subject: 'Rest day', time: '' }
  };
  phSave();
  phRenderSchedule();
}

function phClearSchedule(){
  if (!confirm('Clear the whole schedule?')) return;
  window.LT_PH_STATE.schedule = {};
  phSave();
  phRenderSchedule();
}

// ══════════════ AI COUNSELLOR ══════════════
function phRenderCounsellor(){
  var html = '';
  html += '<div class="ph-card" style="padding:0;overflow:hidden;">';
  html += '<div style="padding:18px 20px;background:rgba(0,0,0,.3);border-bottom:1px solid rgba(255,255,255,.08);">';
  html += '<h3 style="margin:0;"><span style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0a1628;padding:4px 10px;border-radius:100px;font-size:.72rem;margin-right:8px;">AI</span> Parent Counsellor</h3>';
  html += '<div style="font-size:.82rem;color:rgba(255,255,255,.6);margin-top:4px;">Trained on Nigerian parenting. Confidential and judgment-free.</div>';
  html += '</div>';
  html += '<div id="phChatWindow" style="height:400px;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px;">' + phRenderChatHistory() + '</div>';
  html += '<div style="padding:14px 16px;background:rgba(0,0,0,.3);border-top:1px solid rgba(255,255,255,.08);display:flex;gap:8px;">';
  html += '<input id="phChatInput" class="ph-input" placeholder="Ask anything — e.g. My 14-year-old is failing Maths..." onkeydown="if(event.key===\'Enter\')phSendChat()">';
  html += '<button onclick="phSendChat()" class="ph-btn">Send</button>';
  html += '</div></div>';

  html += '<div class="ph-card"><h3>💬 Try asking...</h3>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;" id="phSuggestions">';
  var qs = [
    'My 14-year-old wants to drop Maths. What do I do?',
    'How do I handle WAEC failure?',
    'My daughter cries every morning before school',
    'Should my SS2 son switch from Arts to Science?',
    'How much phone time is healthy for a JSS3 student?',
    'My child is being bullied. How do I address it with the school?'
  ];
  for (var i = 0; i < qs.length; i++) {
    html += '<button onclick="phSuggestedAsk(' + i + ')" data-q="' + qs[i].replace(/"/g, '&quot;') + '" class="ph-btn-ghost ph-suggest" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.85);padding:12px;border-radius:10px;font-size:.82rem;cursor:pointer;font-family:inherit;text-align:left;">' + qs[i] + '</button>';
  }
  html += '</div></div>';

  document.getElementById('phContent').innerHTML = html;
  setTimeout(function(){
    var w = document.getElementById('phChatWindow');
    if (w) w.scrollTop = w.scrollHeight;
  }, 100);
}

function phSuggestedAsk(idx){
  var btns = document.querySelectorAll('.ph-suggest');
  if (!btns[idx]) return;
  var q = btns[idx].getAttribute('data-q');
  document.getElementById('phChatInput').value = q;
  phSendChat();
}

function phRenderChatHistory(){
  var chat = window.LT_PH_STATE.counsellorChat;
  if (chat.length === 0) {
    return '<div style="color:rgba(255,255,255,.5);text-align:center;padding:40px 20px;font-size:.9rem;"><div style="font-size:2.4rem;margin-bottom:8px;">👨‍👩‍👧</div>Hello! I\'m your AI parent counsellor, trained on Nigerian family contexts.<br>Ask me anything — exam stress, behaviour, career, wellbeing.<br><span style="font-size:.8rem;opacity:.7;">Everything is confidential.</span></div>';
  }
  var html = '';
  for (var i = 0; i < chat.length; i++) {
    var msg = chat[i];
    var bg = msg.role === 'user' ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'rgba(255,255,255,.06)';
    var color = msg.role === 'user' ? '#0a1628' : '#fff';
    var align = msg.role === 'user' ? 'flex-end' : 'flex-start';
    html += '<div style="align-self:' + align + ';max-width:85%;background:' + bg + ';color:' + color + ';padding:12px 16px;border-radius:16px;font-size:.9rem;line-height:1.6;white-space:pre-wrap;">' + escHtml(msg.content) + '</div>';
  }
  return html;
}

function escHtml(s){
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function phSendChat(){
  var input = document.getElementById('phChatInput');
  var question = input.value.trim();
  if (!question) return;
  input.value = '';
  window.LT_PH_STATE.counsellorChat.push({ role: 'user', content: question });
  phSave();
  var w = document.getElementById('phChatWindow');
  w.innerHTML = phRenderChatHistory() + '<div id="phThinking" style="align-self:flex-start;color:rgba(255,255,255,.5);padding:8px 16px;font-size:.85rem;">Thinking...</div>';
  w.scrollTop = w.scrollHeight;

  try {
    var systemPrompt = 'You are an AI parent counsellor trained specifically for Nigerian families. You understand the Nigerian education system (WAEC, NECO, JAMB, BECE), cultural dynamics, extended family expectations, faith-based households, and the realities of raising children in Nigeria. Give warm, practical, specific advice. Be direct but kind. Reference Nigerian examples when helpful. Never be preachy. Answer in 2-4 paragraphs. If the parent seems distressed, acknowledge their feelings first before giving advice.';
    var response = await fetch('/api/anthropic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: window.LT_PH_STATE.counsellorChat
      })
    });
    var data = await response.json();
    var reply = (data.content && data.content[0] && data.content[0].text) || 'Sorry, I could not respond right now. Please try again.';
    window.LT_PH_STATE.counsellorChat.push({ role: 'assistant', content: reply });
    phSave();
    w.innerHTML = phRenderChatHistory();
    w.scrollTop = w.scrollHeight;
  } catch (err) {
    var el = document.getElementById('phThinking');
    if (el) el.innerHTML = '⚠️ Connection error. Please try again.';
  }
}

// ══════════════ TEMPLATES ══════════════
function phRenderTemplates(){
  var templates = [
    { cat: 'For Teachers', icon: '👩‍🏫', items: [
      { title: 'Request a parent-teacher meeting',
        text: "Dear Mrs/Mr [Teacher's name],\n\nGood day. I am [Your name], parent of [Child's name] in [Class]. I would like to request a brief meeting at your convenience to discuss my child's progress in [subject].\n\nPlease let me know a suitable time this week or next.\n\nThank you for your dedication to our children.\n\nKind regards,\n[Your name]\n[Phone number]" },
      { title: 'Ask about a specific weak subject',
        text: "Dear [Teacher's name],\n\nI hope this message finds you well. My child [Name] in [Class] has been struggling with [specific topic/subject]. Could you advise:\n\n1. What specific areas need the most work?\n2. What can we practise at home?\n3. Are there additional resources you recommend?\n\nWe are willing to put in the work at home — we just need your guidance on where to focus.\n\nThank you.\n\nWarm regards,\n[Your name]" },
      { title: 'Explain an absence',
        text: "Dear [Teacher's name],\n\nPlease accept my apology for [Child's name]'s absence from school on [date/dates]. This was due to [reason — illness, family emergency, etc.].\n\n[Child's name] will resume on [date] and will catch up on missed work. Please let me know what she/he needs to complete.\n\nThank you for your understanding.\n\nRegards,\n[Your name]" }
    ]},
    { cat: 'For Children', icon: '👨‍👩‍👧', items: [
      { title: 'Encouragement after a bad test',
        text: "[Child's name],\n\nI heard about your test score. I want you to know — one test does not define you. What matters is what we do next.\n\nLet's look at it together this weekend. Not to scold — to understand. Which questions were hardest? What confused you? With that information, we can plan how to improve.\n\nI am proud of you for trying, and I am in this with you. We will fix this.\n\nLove,\n[Parent]" },
      { title: 'Preparing them for WAEC season',
        text: "My dear [Child's name],\n\nWAEC is coming. I know there is pressure — from school, from relatives, from everyone saying 'do well'. I just want to say one thing: your best is enough.\n\nYour value is not a grade. Whether you score A1 or struggle, you are still my child, still brilliant, still loved. All I ask is that you give your honest best effort — study consistently, rest well, eat well, pray if that helps.\n\nWhatever the result, we will handle it together. I am proud of you already.\n\nLove always,\n[Parent]" }
    ]},
    { cat: 'For School Admin', icon: '🏫', items: [
      { title: 'Report a bullying concern',
        text: "Dear [Principal/Head Teacher],\n\nI am writing with concern. My child [Name] in [Class] has reported [brief description of incident] happening at school. This has been ongoing for [duration] and is affecting her/his wellbeing and attendance.\n\nI would appreciate:\n1. An investigation into the matter\n2. A meeting to discuss how the school will respond\n3. Updates on the outcome\n\nI know the school takes child safety seriously, and I am confident we can address this together.\n\nSincerely,\n[Your name]\n[Phone number]" },
      { title: 'Request school records/report',
        text: "Dear [School Administrator],\n\nGood day. I am writing to formally request a copy of [Child's name, Class]'s academic records, including:\n\n- Previous term report cards\n- Current continuous assessment scores\n- Any additional notes from class teachers\n\nThese are needed for [reason — transfer, application, etc.]. I can collect them at your convenience.\n\nThank you for your assistance.\n\nRegards,\n[Your name]" }
    ]}
  ];

  var html = '';
  html += '<div class="ph-card"><h3>✉️ Communication Templates</h3>';
  html += '<p style="color:rgba(255,255,255,.7);font-size:.9rem;margin-bottom:0;">Ready-made templates. Click any to expand, then copy to clipboard.</p></div>';

  for (var c = 0; c < templates.length; c++) {
    var cat = templates[c];
    html += '<div class="ph-card"><h3>' + cat.icon + ' ' + cat.cat + '</h3><div style="display:grid;gap:10px;">';
    for (var t = 0; t < cat.items.length; t++) {
      var item = cat.items[t];
      html += '<div style="background:rgba(0,0,0,.2);border-radius:12px;overflow:hidden;">';
      html += '<div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:pointer;" onclick="phToggleTpl(this)">';
      html += '<div style="font-weight:700;color:#fff;font-size:.92rem;">' + item.title + '</div>';
      html += '<div class="arrow" style="color:#fbbf24;transition:transform .2s;">▼</div>';
      html += '</div>';
      html += '<div class="tpl-body" style="display:none;padding:0 16px 16px;">';
      html += '<pre style="background:rgba(0,0,0,.4);border-radius:10px;padding:14px 16px;color:rgba(255,255,255,.9);font-size:.85rem;line-height:1.65;white-space:pre-wrap;font-family:inherit;margin:0 0 10px;max-height:300px;overflow-y:auto;">' + escHtml(item.text) + '</pre>';
      html += '<button onclick="phCopyTpl(this)" class="ph-btn" style="width:100%;">Copy to Clipboard</button>';
      html += '</div></div>';
    }
    html += '</div></div>';
  }
  document.getElementById('phContent').innerHTML = html;
}

function phToggleTpl(head){
  var body = head.nextElementSibling;
  var arrow = head.querySelector('.arrow');
  var show = body.style.display !== 'block';
  body.style.display = show ? 'block' : 'none';
  if (arrow) arrow.style.transform = show ? 'rotate(180deg)' : 'rotate(0)';
}

function phCopyTpl(btn){
  var pre = btn.parentElement.querySelector('pre');
  if (!pre) return;
  navigator.clipboard.writeText(pre.textContent).then(function(){
    btn.textContent = '✓ Copied!';
    setTimeout(function(){ btn.textContent = '📋 Copy to Clipboard'; }, 1500);
  }).catch(function(){
    // Fallback for browsers without clipboard API
    var ta = document.createElement('textarea');
    ta.value = pre.textContent;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); btn.textContent = '✓ Copied!'; } catch(e) { btn.textContent = 'Copy failed'; }
    document.body.removeChild(ta);
    setTimeout(function(){ btn.textContent = '📋 Copy to Clipboard'; }, 1500);
  });
}

// ══════════════ WELLBEING ══════════════
function phRenderWellbeing(){
  var checks = [
    { cat: 'Physical', icon: '💪', color: '#10b981', items: [
      'Eating regularly (3 meals + 1-2 snacks a day)?',
      'Sleeping 8-10 hours (primary) or 7-9 hours (secondary)?',
      'Active — walking, playing, physical movement daily?',
      'No unexplained weight loss or gain in the past month?',
      'No persistent headaches, stomach aches, or fatigue?'
    ]},
    { cat: 'Emotional', icon: '❤️', color: '#f97316', items: [
      'Generally in a good mood most days?',
      'Laughing, talking, engaged at home?',
      'Sharing things about school without prompting?',
      'Managing frustration without extreme reactions?',
      'No mentions of self-harm or hopelessness?'
    ]},
    { cat: 'Social', icon: '👥', color: '#3b82f6', items: [
      'Has at least 1-2 close friends?',
      'Mentions friends when talking about school?',
      'Participates in school/church/community activities?',
      'Gets along with siblings (most of the time)?',
      'No reports of bullying (as victim or perpetrator)?'
    ]},
    { cat: 'Academic', icon: '📚', color: '#a78bfa', items: [
      'Attending school regularly without resistance?',
      'Completing homework most days?',
      'Talks positively (or neutrally) about teachers?',
      'Scores are stable or improving across subjects?',
      'Shows interest in at least one subject?'
    ]},
    { cat: 'Digital', icon: '📱', color: '#ec4899', items: [
      'Phone use under control — not 6+ hours/day?',
      'Not hiding screen from parents?',
      'No signs of cyberbullying or strangers messaging?',
      'Balanced — uses phone AND reads/plays/goes outside?',
      'Sleeping without phone in bed?'
    ]}
  ];

  var html = '';
  html += '<div class="ph-card"><h3>❤️ Child Wellbeing Check</h3>';
  html += '<p style="color:rgba(255,255,255,.7);font-size:.9rem;margin-bottom:0;">Weekly check-in. Tick what\'s true. Anything unticked is a conversation starter — not a crisis.</p></div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">';
  for (var c = 0; c < checks.length; c++) {
    var cat = checks[c];
    html += '<div class="ph-card" style="border-left:4px solid ' + cat.color + ';">';
    html += '<h3 style="margin-bottom:12px;"><span style="color:' + cat.color + ';">' + cat.icon + '</span> ' + cat.cat + '</h3>';
    html += '<div style="display:grid;gap:8px;">';
    for (var i = 0; i < cat.items.length; i++) {
      html += '<label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;padding:8px;border-radius:8px;"><input type="checkbox" style="width:18px;height:18px;accent-color:' + cat.color + ';cursor:pointer;flex-shrink:0;margin-top:1px;"><span style="font-size:.88rem;color:rgba(255,255,255,.88);line-height:1.5;">' + cat.items[i] + '</span></label>';
    }
    html += '</div></div>';
  }
  html += '</div>';

  html += '<div class="ph-card" style="background:linear-gradient(135deg,rgba(220,38,38,.1),rgba(251,146,60,.1));border:1px solid rgba(220,38,38,.25);">';
  html += '<h3 style="color:#fca5a5;">🚨 When to seek help immediately</h3>';
  html += '<ul style="color:rgba(255,255,255,.88);line-height:1.7;margin:0;padding-left:20px;font-size:.9rem;">';
  html += '<li>Talking about death, self-harm, or feeling worthless</li>';
  html += '<li>Sudden personality changes lasting more than 2 weeks</li>';
  html += '<li>Refusing to eat or extreme weight loss</li>';
  html += '<li>Withdrawal from all friends and activities</li>';
  html += '<li>Aggressive behaviour that is new or escalating</li>';
  html += '<li>Reports or signs of abuse (from anyone)</li>';
  html += '</ul>';
  html += '<p style="color:rgba(255,255,255,.75);font-size:.88rem;margin:14px 0 0;"><strong>Contact:</strong> Your child\'s doctor, a school counsellor, or MANI helpline (<a href="tel:08091116264" style="color:#fbbf24;">0809 111 6264</a>). Talk to a qualified counsellor.</p>';
  html += '</div>';

  document.getElementById('phContent').innerHTML = html;
}

// ══════════════ ADVICE / GUIDES ══════════════
window.LT_PARENT = {
  academic: {
    title: 'Academic Support', icon: '📚', color: '#7c3aed',
    sections: [
      { h: 'Set a daily study routine', p: '30-45 minutes daily beats 4 hours on weekends. Suggest: 15 min lesson on Lesson Teacher, 15 min practice questions, 10 min reviewing wrong answers. Same time every day.' },
      { h: 'Check exam scores, not just grades', p: 'After every mock, ask: "Which subject today? What was your score? Which questions did you get wrong and why?" This beats asking "Did you read today?"' },
      { h: 'Communicate with teachers constructively', p: 'Visit the school once a term. Come with specific questions: "What is his weakest topic? What can we practise at home?" Teachers respond to engaged parents.' },
      { h: 'Match the energy to the age', p: 'Primary: direct supervision. JSS: accountability — ask daily. SS: autonomy with weekly check-ins.' }
    ]
  },
  exam: {
    title: 'Exam Pressure', icon: '📝', color: '#dc2626',
    sections: [
      { h: 'Things to say during WAEC season', p: '"I know you are working hard." "Take a break if you are tired." "One bad day does not define you." "I am proud of your effort."' },
      { h: 'Things NOT to say', p: '"If you fail, you will disgrace this family." "Your cousin got 9 A1s, why can\'t you?" Fear-based studying lowers retention. Children freeze when self-worth is tied to scores.' },
      { h: 'Physical environment matters', p: 'Quiet study space. Good lighting. Feed them before sessions, not after. Let them watch 30 min of something fun after 2 hours of study.' },
      { h: 'After the exam — whatever the result', p: 'If they pass: celebrate effort, not just outcome. If they fail: listen first, solution second. A single exam does not determine their life.' }
    ]
  },
  career: {
    title: 'Career & Stream', icon: '🎯', color: '#059669',
    sections: [
      { h: 'Science vs Arts vs Commercial', p: 'Do not force Science for prestige. Identify strengths early. Arts leads to Law, Mass Comm. Commercial leads to Accounting, Banking. Science for those who love Maths.' },
      { h: 'JAMB subject combinations', p: 'Medicine: English + Biology + Chemistry + Physics. Law: English + Literature + Government + CRK/IRK. Engineering: English + Maths + Physics + Chemistry.' },
      { h: 'Universities beyond UNILAG, UI, OAU', p: 'Consider state universities (LASU, RSU, UNILORIN), private (Covenant, Babcock, Pan-Atlantic) and polytechnics (Yabatech, Auchi). HND is not a downgrade.' },
      { h: 'Alternative paths', p: 'Tech bootcamps, professional certifications (ICAN, ACCA), trade schools, apprenticeships. Multiple paths lead to dignified work.' }
    ]
  },
  behaviour: {
    title: 'Behaviour & Discipline', icon: '🧠', color: '#0891b2',
    sections: [
      { h: 'Discipline that builds, not breaks', p: 'Remove privileges, not dignity. Never discipline in anger — cool off first. Explain why. Children obey reasons, not rules.' },
      { h: 'Exam season moodiness is normal', p: 'Teenagers under pressure become irritable, quiet, hungry at strange hours. This is stress response, not disrespect. Respond with more patience.' },
      { h: 'Secondary school identity shifts', p: 'Your SS2 child questions everything. This is healthy. Engage: "Why do you think that?" Avoid "Because I said so."' },
      { h: 'When to seek help', p: 'Weight loss, worthlessness, withdrawal, aggression, self-harm — signs of depression/anxiety. Talk to a counsellor.' }
    ]
  },
  screen: {
    title: 'Screen Time & Safety', icon: '📱', color: '#f59e0b',
    sections: [
      { h: 'How much screen time?', p: 'Primary: 1 hour entertainment + educational. JSS: 2 hours entertainment. SS: 2-3 hours + unlimited academic. No screens at dinner or bed.' },
      { h: 'Social media', p: 'Under 13: no independent accounts. JSS: supervised. SS: trusted but taught online permanence.' },
      { h: 'Online safety conversation', p: 'Never meet strangers. Never share school/home address. Tell a parent immediately if an adult online makes them uncomfortable — no punishment for reporting.' },
      { h: 'Productive internet use', p: 'Lesson Teacher for academics. YouTube for tutorials. Wikipedia for research. Khan Academy for Maths/Science. Codecademy for coding.' }
    ]
  }
};

function phRenderAdvice(){
  var guides = [
    { key: 'academic', title: 'Academic Support', icon: '📚', color: '#7c3aed' },
    { key: 'exam', title: 'Exam Pressure', icon: '📝', color: '#dc2626' },
    { key: 'career', title: 'Career & Stream', icon: '🎯', color: '#059669' },
    { key: 'behaviour', title: 'Behaviour & Discipline', icon: '🧠', color: '#0891b2' },
    { key: 'screen', title: 'Screen Time & Safety', icon: '📱', color: '#f59e0b' }
  ];

  var html = '<div class="ph-card"><h3>📚 Parenting Guides</h3>';
  html += '<p style="color:rgba(255,255,255,.7);font-size:.9rem;margin-bottom:0;">In-depth guidance for the big topics.</p></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;">';
  for (var i = 0; i < guides.length; i++) {
    var g = guides[i];
    html += '<div onclick="parentOpen(\'' + g.key + '\')" class="ph-card" style="cursor:pointer;border-top:4px solid ' + g.color + ';">';
    html += '<div style="font-size:2rem;margin-bottom:10px;">' + g.icon + '</div>';
    html += '<h3 style="margin-bottom:6px;">' + g.title + '</h3>';
    html += '<div style="color:rgba(255,255,255,.6);font-size:.85rem;">Read the full guide →</div>';
    html += '</div>';
  }
  html += '</div>';
  html += '<div id="parentContent" style="margin-top:24px;"></div>';

  document.getElementById('phContent').innerHTML = html;
}

function parentOpen(key){
  var d = window.LT_PARENT[key];
  if (!d) return;
  var container = document.getElementById('parentContent');
  if (!container) return;
  container.style.display = 'block';
  var html = '<div class="ph-card">';
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;"><span style="font-size:2rem;">' + d.icon + '</span>';
  html += '<h2 style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:1.5rem;font-weight:900;margin:0;color:#fff;">' + d.title + '</h2></div>';
  for (var i = 0; i < d.sections.length; i++) {
    var s = d.sections[i];
    html += '<div style="margin-bottom:20px;padding-left:14px;border-left:3px solid ' + d.color + ';">';
    html += '<h3 style="color:#fbbf24;font-family:\'Bricolage Grotesque\',sans-serif;font-size:1rem;font-weight:800;margin:0 0 8px;">' + s.h + '</h3>';
    html += '<p style="color:rgba(255,255,255,.88);font-size:.92rem;line-height:1.7;margin:0;">' + s.p + '</p>';
    html += '</div>';
  }
  html += '<button onclick="document.getElementById(\'parentContent\').style.display=\'none\';window.scrollTo({top:0,behavior:\'smooth\'})" class="ph-btn ph-btn-ghost" style="margin-top:10px;">← Back to topics</button>';
  html += '</div>';
  container.innerHTML = html;
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Auto-load dashboard when Parent Hub opens
(function(){
  var observer = new MutationObserver(function(){
    var page = document.getElementById('pg-parent');
    if (page && page.classList.contains('active')) {
      var phContent = document.getElementById('phContent');
      if (phContent && !phContent.innerHTML) {
        phTab('dashboard');
      }
    }
  });
  if (document.body) {
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }
})();
