
// ══════════════ GAME OVERLAY HELPERS ══════════════
function kOpenGame(title, sub){
  document.getElementById('kGameTitle').textContent = title;
  document.getElementById('kGameSub').textContent = sub;
  document.getElementById('kGameOverlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function kCloseGame(){
  document.getElementById('kGameOverlay').style.display = 'none';
  document.body.style.overflow = '';
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (window._kKeyHandler) { document.removeEventListener('keydown', window._kKeyHandler); window._kKeyHandler = null; }
  if (window._kLoop && window._kLoop.playing) { try { kLoopStop(); } catch(e){} }
}

function kAwardStars(count){
  var el = document.getElementById('kStarsVal');
  if (el) {
    var cur = parseInt(el.textContent) || 0;
    el.textContent = cur + count;
    el.style.transform = 'scale(1.3)';
    setTimeout(function(){ el.style.transform = ''; }, 300);
  }
}

function kSpeakText(text){
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  }
}

// ══════════════ DIFFICULTY HELPERS ══════════════
window._kDifficulty = window._kDifficulty || { match: 'easy', quiz: 'easy', sing: 'medium' };

var K_DIFF = {
  match: {
    easy:   { pairs: 4, label: 'Easy',   icon: '🌱', desc: '4 pairs · 8 cards' },
    medium: { pairs: 6, label: 'Medium', icon: '🌟', desc: '6 pairs · 12 cards' },
    hard:   { pairs: 8, label: 'Hard',   icon: '🔥', desc: '8 pairs · 16 cards' }
  },
  quiz: {
    easy:   { questions: 5,  options: 2, label: 'Easy',   icon: '🌱', desc: '5 questions · 2 choices' },
    medium: { questions: 10, options: 4, label: 'Medium', icon: '🌟', desc: '10 questions · 4 choices' },
    hard:   { questions: 15, options: 4, label: 'Hard',   icon: '🔥', desc: '15 questions · 4 choices · faster' }
  },
  sing: {
    easy:   { rate: 0.75, label: 'Slow',   icon: '🐢', desc: 'Sing slowly' },
    medium: { rate: 0.95, label: 'Normal', icon: '🌟', desc: 'Normal pace' },
    hard:   { rate: 1.15, label: 'Fast',   icon: '⚡', desc: 'Sing-along race' }
  }
};

function kDiffPickerHTML(game){
  var current = window._kDifficulty[game] || 'easy';
  var levels = K_DIFF[game];
  var html = '<div style="background:rgba(255,255,255,.04);border-radius:18px;padding:14px;margin-bottom:14px;">';
  html += '<div style="color:rgba(255,255,255,.55);font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;text-align:center;">Choose your level</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
  Object.keys(levels).forEach(function(key){
    var lv = levels[key];
    var on = key === current;
    var bg = on ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'rgba(255,255,255,.06)';
    var col = on ? '#0a1628' : '#fff';
    var border = on ? 'transparent' : 'rgba(255,255,255,.12)';
    html += '<button onclick="kSetDifficulty(\'' + game + '\',\'' + key + '\')" style="background:' + bg + ';color:' + col + ';border:1px solid ' + border + ';padding:10px 6px;border-radius:14px;cursor:pointer;font-family:inherit;text-align:center;">';
    html += '<div style="font-size:1.3rem;line-height:1;margin-bottom:4px;">' + lv.icon + '</div>';
    html += '<div style="font-weight:900;font-size:.85rem;font-family:\'Bricolage Grotesque\',sans-serif;">' + lv.label + '</div>';
    html += '<div style="font-size:.65rem;opacity:.75;margin-top:2px;line-height:1.3;">' + lv.desc + '</div>';
    html += '</button>';
  });
  html += '</div></div>';
  return html;
}

function kSetDifficulty(game, level){
  window._kDifficulty[game] = level;
  try { localStorage.setItem('kDifficulty', JSON.stringify(window._kDifficulty)); } catch(e){}
  if (game === 'match') kMatchStart();
  else if (game === 'quiz') kQuizStart();
  else if (game === 'sing') kSingRender();
}

try { var __kd = JSON.parse(localStorage.getItem('kDifficulty') || 'null'); if (__kd) window._kDifficulty = Object.assign(window._kDifficulty, __kd); } catch(e){}

// ══════════════ GAME 1: MATCHING ══════════════
function kPlayMatch(){
  kOpenGame('🎯 Matching Game', 'Match the picture to the word!');
  kMatchStart();
}

function kMatchStart(){
  var lessons = kLessons[kCat] || kLessons.phonics;
  var diff = K_DIFF.match[window._kDifficulty.match] || K_DIFF.match.easy;
  var nPairs = Math.min(diff.pairs, lessons.length);
  var shuffled = lessons.slice().sort(function(){ return Math.random() - 0.5; }).slice(0, nPairs);
  window._kMatch = {
    pairs: shuffled,
    flipped: [],
    matched: [],
    moves: 0,
    startTime: Date.now(),
    cardOrder: null
  };
  kMatchRender();
}

function kRenderVisual(item, sizePx){
  var size = sizePx || 80;
  if (typeof kLessonVisualHTML === 'function') {
    return kLessonVisualHTML(item, size, (typeof kCat !== 'undefined' ? kCat : ''));
  }
  if (typeof item.e === 'string' && item.e.indexOf('<svg') === 0) return item.e;
  if (typeof kEmoji !== 'undefined' && kEmoji[item.w]) {
    return '<div style="font-size:' + Math.round(size*0.7) + 'px;line-height:1;text-align:center;">' + kEmoji[item.w] + '</div>';
  }
  return '<div style="font-size:' + Math.round(size*0.7) + 'px;line-height:1;">' + (item.e || item.w[0]) + '</div>';
}

function kMatchRender(){
  var m = window._kMatch;
  var cards = [];
  for (var i = 0; i < m.pairs.length; i++) {
    cards.push({ type: 'visual', val: m.pairs[i], pair: i });
    cards.push({ type: 'word', val: m.pairs[i].w, pair: i });
  }
  if (!m.cardOrder) {
    m.cardOrder = [];
    for (var j = 0; j < cards.length; j++) m.cardOrder.push(j);
    m.cardOrder.sort(function(){ return Math.random() - 0.5; });
  }

  var body = document.getElementById('kGameBody');
  var html = '';
  html += kDiffPickerHTML('match');
  html += '<div style="display:flex;justify-content:space-between;background:rgba(255,255,255,.05);padding:14px 18px;border-radius:16px;margin-bottom:16px;">';
  html += '<div><div style="color:rgba(255,255,255,.5);font-size:.7rem;font-weight:700;text-transform:uppercase;">Moves</div><div style="color:#fbbf24;font-size:1.5rem;font-weight:900;font-family:\'Bricolage Grotesque\',sans-serif;">' + m.moves + '</div></div>';
  html += '<div><div style="color:rgba(255,255,255,.5);font-size:.7rem;font-weight:700;text-transform:uppercase;">Matched</div><div style="color:#10b981;font-size:1.5rem;font-weight:900;font-family:\'Bricolage Grotesque\',sans-serif;">' + m.matched.length + '/' + m.pairs.length + '</div></div>';
  html += '<button onclick="kMatchStart();kMatchRender()" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);padding:8px 16px;border-radius:100px;font-size:.82rem;font-weight:700;cursor:pointer;">🔄 Restart</button>';
  html += '</div>';

  var cols = m.pairs.length >= 8 ? 4 : (m.pairs.length >= 6 ? 4 : 4);
  html += '<div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:10px;margin-bottom:16px;">';
  for (var k = 0; k < m.cardOrder.length; k++) {
    var idx = m.cardOrder[k];
    var card = cards[idx];
    var isFlipped = m.flipped.indexOf(idx) !== -1;
    var isMatched = m.matched.indexOf(card.pair) !== -1;
    var show = isFlipped || isMatched;
    var bg = isMatched ? 'linear-gradient(135deg,#10b981,#34d399)' : (show ? '#fff' : 'linear-gradient(135deg,#1e40af,#3b82f6)');
    var content;
    if (!show) {
      content = '?';
    } else if (card.type === 'visual') {
      content = '<div style="width:88%;height:88%;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:12px;background:' + (card.val.c || '#fff') + ';">' + kRenderVisual(card.val, 70) + '</div>';
    } else {
      content = '<div style="font-size:.95rem;color:' + (isMatched ? '#fff' : '#0a1628') + ';font-weight:900;font-family:\'Bricolage Grotesque\',sans-serif;text-align:center;padding:6px;">' + card.val + '</div>';
    }
    var fontSize = show ? '.95rem' : '1.8rem';
    var color = show ? (isMatched ? '#fff' : '#0a1628') : 'rgba(255,255,255,.4)';
    var disabledAttr = (isMatched || isFlipped) ? 'disabled' : '';
    var cursor = (isMatched || isFlipped) ? 'default' : 'pointer';
    html += '<button onclick="kMatchFlip(' + idx + ')" ' + disabledAttr + ' style="aspect-ratio:1;background:' + bg + ';border:none;border-radius:16px;font-size:' + fontSize + ';color:' + color + ';font-weight:900;cursor:' + cursor + ';box-shadow:0 4px 12px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;">' + content + '</button>';
  }
  html += '</div>';

  body.innerHTML = html;

  if (m.matched.length === m.pairs.length) {
    setTimeout(function(){
      var time = Math.round((Date.now() - m.startTime) / 1000);
      var stars = Math.max(1, Math.min(3, Math.floor(30 - m.moves / 2)));
      kAwardStars(stars);
      var winHtml = '<div style="background:linear-gradient(135deg,rgba(16,185,129,.2),rgba(34,211,149,.1));border:1px solid rgba(16,185,129,.4);border-radius:20px;padding:30px;text-align:center;margin-top:16px;">';
      winHtml += '<div style="font-size:4rem;margin-bottom:8px;">🎉</div>';
      winHtml += '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:1.6rem;font-weight:900;color:#fff;margin-bottom:8px;">You Win!</div>';
      winHtml += '<div style="color:#6ee7b7;margin-bottom:16px;">Completed in ' + m.moves + ' moves · ' + time + ' seconds</div>';
      var starHtml = '';
      for (var s = 0; s < 3; s++) starHtml += (s < stars ? '⭐' : '☆');
      winHtml += '<div style="font-size:2.5rem;margin-bottom:16px;">' + starHtml + '</div>';
      winHtml += '<div style="display:flex;gap:10px;justify-content:center;">';
      winHtml += '<button onclick="kMatchStart();kMatchRender()" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0a1628;border:none;padding:12px 24px;border-radius:100px;font-weight:800;cursor:pointer;">🔄 Play Again</button>';
      winHtml += '<button onclick="kCloseGame()" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);padding:12px 24px;border-radius:100px;font-weight:700;cursor:pointer;">Done</button>';
      winHtml += '</div></div>';
      body.innerHTML += winHtml;
    }, 400);
  }
}

function kMatchFlip(idx){
  var m = window._kMatch;
  if (m.flipped.length >= 2) return;
  var cards = [];
  for (var i = 0; i < m.pairs.length; i++) {
    cards.push({ type: 'visual', val: m.pairs[i], pair: i });
    cards.push({ type: 'word', val: m.pairs[i].w, pair: i });
  }
  if (m.flipped.indexOf(idx) !== -1 || m.matched.indexOf(cards[idx].pair) !== -1) return;
  m.flipped.push(idx);
  kMatchRender();

  if (m.flipped.length === 2) {
    m.moves++;
    var a = m.flipped[0], b = m.flipped[1];
    if (cards[a].pair === cards[b].pair) {
      setTimeout(function(){
        m.matched.push(cards[a].pair);
        m.flipped = [];
        kSpeakText(m.pairs[cards[a].pair].w);
        kMatchRender();
      }, 600);
    } else {
      setTimeout(function(){
        m.flipped = [];
        kMatchRender();
      }, 900);
    }
  }
}

// ══════════════ GAME 2: PICTURE QUIZ ══════════════
function kPlayQuiz(){
  kOpenGame('❓ Picture Quiz', 'What is this? Choose the right word!');
  kQuizStart();
}

function kQuizStart(){
  var lessons = kLessons[kCat] || kLessons.phonics;
  var diff = K_DIFF.quiz[window._kDifficulty.quiz] || K_DIFF.quiz.easy;
  if (lessons.length < diff.options) {
    document.getElementById('kGameBody').innerHTML = '<div style="text-align:center;color:rgba(255,255,255,.7);padding:40px;">Not enough items in this category. Try Phonics or Animals!</div>';
    return;
  }
  window._kQuiz = {
    questions: lessons.slice().sort(function(){ return Math.random() - 0.5; }).slice(0, Math.min(diff.questions, lessons.length)),
    index: 0,
    score: 0,
    wrong: 0,
    optionCount: diff.options
  };
  kQuizRender();
}

function kQuizRender(){
  var q = window._kQuiz;
  var lessons = kLessons[kCat] || kLessons.phonics;
  if (q.index >= q.questions.length) {
    var body = document.getElementById('kGameBody');
    var stars = q.score >= q.questions.length - 1 ? 3 : (q.score >= q.questions.length * 0.6 ? 2 : 1);
    kAwardStars(stars);
    var starStr = '';
    for (var i = 0; i < 3; i++) starStr += (i < stars ? '⭐' : '☆');
    var msg = q.score === q.questions.length ? 'Perfect score! 🌟' : (q.score >= q.questions.length * 0.6 ? 'Great job! Keep practising.' : 'Good try! Play again to improve.');
    body.innerHTML = '<div style="background:linear-gradient(135deg,rgba(16,185,129,.15),rgba(34,211,149,.05));border:1px solid rgba(16,185,129,.4);border-radius:20px;padding:30px;text-align:center;">' +
      '<div style="font-size:4rem;margin-bottom:8px;">🎉</div>' +
      '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:1.6rem;font-weight:900;color:#fff;margin-bottom:8px;">Quiz Complete!</div>' +
      '<div style="color:#6ee7b7;font-size:1.1rem;margin-bottom:4px;">You got ' + q.score + ' out of ' + q.questions.length + ' right</div>' +
      '<div style="color:rgba(255,255,255,.5);font-size:.9rem;margin-bottom:16px;">' + msg + '</div>' +
      '<div style="font-size:2.5rem;margin-bottom:16px;">' + starStr + '</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;">' +
      '<button onclick="kQuizStart()" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0a1628;border:none;padding:12px 24px;border-radius:100px;font-weight:800;cursor:pointer;">🔄 Play Again</button>' +
      '<button onclick="kCloseGame()" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);padding:12px 24px;border-radius:100px;font-weight:700;cursor:pointer;">Done</button>' +
      '</div></div>';
    return;
  }

  var current = q.questions[q.index];
  var nWrong = (q.optionCount || 4) - 1;
  var wrongs = lessons.filter(function(l){ return l.w !== current.w; }).sort(function(){ return Math.random() - 0.5; }).slice(0, nWrong);
  var options = [current].concat(wrongs).sort(function(){ return Math.random() - 0.5; });

  var pct = ((q.index + 1) / q.questions.length) * 100;
  var html = '';
  html += kDiffPickerHTML('quiz');
  html += '<div style="background:rgba(255,255,255,.05);padding:12px 18px;border-radius:100px;margin-bottom:20px;display:flex;align-items:center;gap:14px;">';
  html += '<div style="flex:1;height:8px;background:rgba(255,255,255,.1);border-radius:100px;overflow:hidden;"><div style="height:100%;background:linear-gradient(90deg,#fbbf24,#f59e0b);width:' + pct + '%;"></div></div>';
  html += '<div style="color:#fbbf24;font-weight:800;font-size:.9rem;">' + (q.index + 1) + '/' + q.questions.length + '</div></div>';
  html += '<div style="background:#fff;border-radius:32px;padding:30px;text-align:center;margin-bottom:20px;box-shadow:0 12px 32px rgba(0,0,0,.3);">';
  html += '<div style="width:180px;height:180px;margin:0 auto 16px;background:' + (current.c || '#f1f5f9') + ';border-radius:28px;display:flex;align-items:center;justify-content:center;overflow:hidden;">' + kRenderVisual(current, 160) + '</div>';
  html += '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:1.4rem;font-weight:800;color:#1e40af;">What is this?</div>';
  html += '<button onclick="kSpeakText(\'' + current.w + '\')" style="margin-top:12px;background:rgba(30,64,175,.1);color:#1e40af;border:2px solid rgba(30,64,175,.2);padding:8px 18px;border-radius:100px;font-weight:700;font-size:.85rem;cursor:pointer;">🔊 Hear the word</button>';
  html += '</div>';
  var optCols = options.length === 2 ? 2 : 2;
  html += '<div style="display:grid;grid-template-columns:repeat(' + optCols + ',1fr);gap:10px;">';
  for (var i = 0; i < options.length; i++) {
    html += '<button onclick="kQuizAnswer(\'' + options[i].w.replace(/'/g, "\\'") + '\')" style="background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);color:#fff;padding:18px;border-radius:16px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:1.1rem;font-weight:800;cursor:pointer;">' + options[i].w + '</button>';
  }
  html += '</div>';

  document.getElementById('kGameBody').innerHTML = html;
  kSpeakText(current.w);
}

function kQuizAnswer(answer){
  var q = window._kQuiz;
  var current = q.questions[q.index];
  var correct = current.w === answer;
  if (correct) {
    q.score++;
    kSpeakText('Well done!');
  } else {
    q.wrong++;
    kSpeakText('Try again next time');
  }
  var nextLabel = q.index + 1 < q.questions.length ? 'Next Question →' : 'See Results';
  document.getElementById('kGameBody').innerHTML =
    '<div style="text-align:center;padding:40px 20px;">' +
    '<div style="font-size:6rem;margin-bottom:16px;">' + (correct ? '🎉' : '💭') + '</div>' +
    '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:1.8rem;font-weight:900;color:' + (correct ? '#10b981' : '#fbbf24') + ';margin-bottom:8px;">' + (correct ? 'Correct!' : 'Not quite!') + '</div>' +
    '<div style="color:rgba(255,255,255,.85);font-size:1rem;margin-bottom:4px;">' + (correct ? "You're getting it!" : 'This is a <strong>' + current.w + '</strong>') + '</div>' +
    '<div style="width:140px;height:140px;margin:14px auto;background:' + (current.c || '#f1f5f9') + ';border-radius:24px;display:flex;align-items:center;justify-content:center;overflow:hidden;">' + kRenderVisual(current, 120) + '</div>' +
    '<button onclick="window._kQuiz.index++;kQuizRender()" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0a1628;border:none;padding:14px 30px;border-radius:100px;font-weight:800;font-size:1rem;cursor:pointer;">' + nextLabel + '</button>' +
    '</div>';
}

// ══════════════ GAME 3: SING-ALONG ══════════════
var SONGS = {
  abc: {
    title: 'ABC Song', emoji: '🔤', color: '#1e40af',
    lines: [
      { text: 'A, B, C, D, E, F, G', say: 'A B C D E F G' },
      { text: 'H, I, J, K, L, M, N, O, P', say: 'H I J K L M N O P' },
      { text: 'Q, R, S, T, U, V', say: 'Q R S T U V' },
      { text: 'W, X, Y, and Z', say: 'W X Y and Z' },
      { text: 'Now I know my A B Cs', say: 'Now I know my A B Cs' },
      { text: "Next time won't you sing with me?", say: "Next time won't you sing with me" }
    ]
  },
  count: {
    title: 'Counting Song', emoji: '🔢', color: '#059669',
    lines: [
      { text: 'One, two, buckle my shoe', say: 'One two buckle my shoe' },
      { text: 'Three, four, knock at the door', say: 'Three four knock at the door' },
      { text: 'Five, six, pick up sticks', say: 'Five six pick up sticks' },
      { text: 'Seven, eight, lay them straight', say: 'Seven eight lay them straight' },
      { text: 'Nine, ten, a big fat hen!', say: 'Nine ten a big fat hen' }
    ]
  },
  body: {
    title: 'Head, Shoulders, Knees and Toes', emoji: '🧠', color: '#dc2626',
    lines: [
      { text: 'Head, shoulders, knees and toes', say: 'Head shoulders knees and toes' },
      { text: 'Knees and toes!', say: 'Knees and toes' },
      { text: 'Head, shoulders, knees and toes', say: 'Head shoulders knees and toes' },
      { text: 'Knees and toes!', say: 'Knees and toes' },
      { text: 'And eyes and ears and mouth and nose', say: 'And eyes and ears and mouth and nose' },
      { text: 'Head, shoulders, knees and toes', say: 'Head shoulders knees and toes' }
    ]
  },
  colors: {
    title: 'Colours of the Rainbow', emoji: '🌈', color: '#f59e0b',
    lines: [
      { text: 'Red and yellow and pink and green', say: 'Red and yellow and pink and green' },
      { text: 'Purple and orange and blue', say: 'Purple and orange and blue' },
      { text: 'I can sing a rainbow', say: 'I can sing a rainbow' },
      { text: 'Sing a rainbow too!', say: 'Sing a rainbow too' }
    ]
  }
};

function kPlaySing(){
  kOpenGame('🎵 Sing-Along', 'Learn with songs!');
  kSingMenu();
}

function kSingMenu(){
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;">';
  for (var key in SONGS) {
    var s = SONGS[key];
    html += '<button onclick="kSingStart(\'' + key + '\')" style="background:linear-gradient(135deg,' + s.color + ',' + s.color + '88);border:none;color:#fff;padding:28px 20px;border-radius:24px;cursor:pointer;font-family:inherit;box-shadow:0 8px 24px ' + s.color + '44;">';
    html += '<div style="font-size:3rem;margin-bottom:10px;">' + s.emoji + '</div>';
    html += '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-weight:900;font-size:1.05rem;margin-bottom:4px;">' + s.title + '</div>';
    html += '<div style="font-size:.8rem;opacity:.85;">Tap to sing!</div>';
    html += '</button>';
  }
  html += '</div>';
  document.getElementById('kGameBody').innerHTML = html;
}

function kSingStart(key){
  var song = SONGS[key];
  window._kSing = { song: song, index: 0, isPlaying: false };
  kSingRender();
}

function kSingRender(){
  var s = window._kSing;
  var song = s.song;
  var html = '<button onclick="kSingStop();kSingMenu()" style="background:none;border:none;color:rgba(255,255,255,.6);font-size:.85rem;cursor:pointer;margin-bottom:14px;">← Choose another song</button>';
  html += kDiffPickerHTML('sing');
  html += '<div style="background:linear-gradient(135deg,' + song.color + ',' + song.color + 'aa);border-radius:32px;padding:36px 24px;text-align:center;color:#fff;margin-bottom:20px;min-height:280px;display:flex;flex-direction:column;justify-content:center;">';
  html += '<div style="font-size:4rem;margin-bottom:16px;">' + song.emoji + '</div>';
  html += '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:20px;opacity:.9;">' + song.title + '</div>';
  for (var i = 0; i < song.lines.length; i++) {
    var fs = i === s.index ? '1.5rem' : '.95rem';
    var fw = i === s.index ? '900' : '600';
    var cl = i === s.index ? '#fff' : 'rgba(255,255,255,.5)';
    html += '<div id="kSingLine' + i + '" style="font-family:\'Bricolage Grotesque\',sans-serif;font-size:' + fs + ';font-weight:' + fw + ';color:' + cl + ';margin:6px 0;transition:all .3s;">' + song.lines[i].text + '</div>';
  }
  html += '</div>';
  html += '<div style="display:flex;gap:10px;justify-content:center;">';
  html += '<button onclick="kSingPlay()" id="kSingBtn" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0a1628;border:none;padding:14px 30px;border-radius:100px;font-weight:800;font-size:1rem;cursor:pointer;">▶️ Play Song</button>';
  html += '<button onclick="kSingStop();window._kSing.index=0;kSingRender()" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);padding:14px 24px;border-radius:100px;font-weight:700;cursor:pointer;">🔄 Restart</button>';
  html += '</div>';
  document.getElementById('kGameBody').innerHTML = html;
}

function kSingPlay(){
  var s = window._kSing;
  if (s.isPlaying) {
    kSingStop();
    return;
  }
  s.isPlaying = true;
  var btn = document.getElementById('kSingBtn');
  if (btn) btn.innerHTML = '⏸️ Pause';
  kSingNextLine();
}

function kSingStop(){
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (window._kSing) {
    window._kSing.isPlaying = false;
    var btn = document.getElementById('kSingBtn');
    if (btn) btn.innerHTML = '▶️ Play Song';
  }
}

function kSingNextLine(){
  var s = window._kSing;
  if (!s || !s.isPlaying) return;
  if (s.index >= s.song.lines.length) {
    kSingStop();
    kAwardStars(2);
    s.index = 0;
    kSingRender();
    setTimeout(function(){
      var body = document.getElementById('kGameBody');
      if (body) body.insertAdjacentHTML('afterbegin',
        '<div style="background:linear-gradient(135deg,rgba(16,185,129,.2),rgba(34,211,149,.1));border:1px solid rgba(16,185,129,.4);border-radius:16px;padding:16px;text-align:center;margin-bottom:14px;"><div style="font-size:2rem;">🎉</div><div style="font-weight:800;color:#6ee7b7;margin:4px 0;">You finished the song!</div><div style="font-size:1.3rem;">⭐⭐</div></div>');
    }, 300);
    return;
  }
  kSingRender();
  var line = s.song.lines[s.index];
  if (window.speechSynthesis) {
    var utter = new SpeechSynthesisUtterance(line.say);
    var sd = K_DIFF.sing[window._kDifficulty.sing] || K_DIFF.sing.medium;
    utter.rate = sd.rate;
    utter.pitch = 1.2;
    utter.onend = function(){
      if (!s.isPlaying) return;
      s.index++;
      setTimeout(kSingNextLine, 200);
    };
    window.speechSynthesis.speak(utter);
  } else {
    setTimeout(function(){ s.index++; kSingNextLine(); }, 2000);
  }
}

// ══════════════ GAME 4: CHESS TEACHER ══════════════
var CHESS_PIECES = {
  K: { w: '♔', b: '♚', name: 'King' },
  Q: { w: '♕', b: '♛', name: 'Queen' },
  R: { w: '♖', b: '♜', name: 'Rook' },
  B: { w: '♗', b: '♝', name: 'Bishop' },
  N: { w: '♘', b: '♞', name: 'Knight' },
  P: { w: '♙', b: '♟', name: 'Pawn' }
};

var CHESS_LESSONS = [
  { id: 'intro', title: 'Welcome to Chess!',
    teacher: "Hello! Chess is a great game. The board has 64 squares — 32 light and 32 dark. Each player has 16 pieces. The goal is to trap the opponent's King!",
    board: 'start', highlight: [], showButtons: ['next'], question: null },
  { id: 'board', title: 'The Board',
    teacher: "Look carefully. Rows are called ranks (1 to 8). Columns are called files (a to h). The light square is always on the bottom-right!",
    board: 'empty', highlight: [], showButtons: ['next'], question: null },
  { id: 'king', title: 'Meet the King ♔',
    teacher: "This is the King — the most important piece! The King moves ONE square in any direction. Protect him always!",
    board: 'king-demo', highlight: ['c3','c4','c5','d3','d5','e3','e4','e5'], showButtons: ['next'], question: null },
  { id: 'queen', title: 'Meet the Queen ♕',
    teacher: "The Queen is the strongest piece! She moves any number of squares — horizontally, vertically, or diagonally. Treasure her!",
    board: 'queen-demo', highlight: ['d1','d2','d3','d5','d6','d7','d8','a4','b4','c4','e4','f4','g4','h4','a1','b2','c3','e5','f6','g7','h8','a7','b6','c5','e3','f2','g1'], showButtons: ['next'], question: null },
  { id: 'rook', title: 'Meet the Rook ♖',
    teacher: "The Rook moves in straight lines — up, down, left, right. Any number of squares. Two rooks working together are very powerful.",
    board: 'rook-demo', highlight: ['d1','d2','d3','d5','d6','d7','d8','a4','b4','c4','e4','f4','g4','h4'], showButtons: ['next'], question: null },
  { id: 'bishop', title: 'Meet the Bishop ♗',
    teacher: "The Bishop moves only diagonally. Each bishop stays on one colour for the whole game! If it starts on a light square, it only moves on light squares.",
    board: 'bishop-demo', highlight: ['a1','b2','c3','e5','f6','g7','h8','a7','b6','c5','e3','f2','g1'], showButtons: ['next'], question: null },
  { id: 'knight', title: 'Meet the Knight ♘',
    teacher: "The Knight is tricky! It moves in an L-shape: 2 squares one way, then 1 square sideways. It is the only piece that can jump over others!",
    board: 'knight-demo', highlight: ['c2','e2','b3','f3','b5','f5','c6','e6'], showButtons: ['next'], question: null },
  { id: 'pawn', title: 'Meet the Pawn ♙',
    teacher: "The Pawn is the small soldier! It moves ONE square forward. On its first move, it can move 2 squares. It captures diagonally. When it reaches the end, it becomes a Queen!",
    board: 'pawn-demo', highlight: ['d3','d4'], showButtons: ['next'], question: null },
  { id: 'quiz1', title: 'Quick Question!',
    teacher: "Which piece moves in an L-shape?",
    board: 'empty', highlight: [], showButtons: [],
    question: { options: ['King', 'Queen', 'Knight', 'Bishop'], correct: 2,
      correctSay: 'Excellent! The Knight moves in an L-shape and can jump over pieces.',
      wrongSay: 'Think again! Which piece can jump over others?' } },
  { id: 'quiz2', title: 'Quick Question!',
    teacher: "Which is the MOST powerful piece?",
    board: 'empty', highlight: [], showButtons: [],
    question: { options: ['Rook', 'Queen', 'Bishop', 'King'], correct: 1,
      correctSay: 'Correct! The Queen is the most powerful piece because she can move in any direction.',
      wrongSay: 'Close! The Queen moves in any direction — that makes her the most powerful.' } },
  { id: 'check', title: 'Check and Checkmate!',
    teacher: "When your King is attacked, that's CHECK — you must protect him! When he's attacked and cannot escape, that's CHECKMATE — game over! You win by checkmating your opponent.",
    board: 'checkmate-demo', highlight: ['e1'], showButtons: ['next'], question: null },
  { id: 'practice', title: "You're Ready!",
    teacher: "Fantastic! You know all 6 pieces and the goal of chess. Now try playing! Use the Practice Board below. Remember: protect your King, use your Queen wisely, and have fun!",
    board: 'start', highlight: [], showButtons: ['practice', 'restart'], question: null }
];


function kPlayInstrument(){
  kOpenGame('Music Instruments', 'Learn and play real instruments!');
  window._kInstrument = 'piano';
  kEnsureTone();
  kInstrumentRender();
}

var __kAudioCtx = null;
function kGetAudioCtx(){
  if(!__kAudioCtx) __kAudioCtx = new (window.AudioContext||window.webkitAudioContext)();
  return __kAudioCtx;
}

// ── Tone.js sampler loader ──
window._kSamplers = window._kSamplers || {};
window._kToneReady = false;
window._kSamplerStatus = window._kSamplerStatus || { piano:'idle', guitar:'idle', violin:'idle', drums:'idle', bass:'idle', perc:'idle' };

function kUpdateLoadPill(){
  var el = document.getElementById('kLoadPill');
  if (!el) return;
  var s = window._kSamplerStatus;
  var inst = window._kInstrument || 'piano';
  var status = s[inst] || 'idle';
  var labels = {
    idle:    { txt:'⚪ Synth fallback', col:'#64748b' },
    loading: { txt:'⏳ Loading real samples…', col:'#f59e0b' },
    ready:   { txt:'🎼 Real samples ready', col:'#10b981' },
    error:   { txt:'⚠️ Using synth', col:'#dc2626' }
  };
  var info = labels[status] || labels.idle;
  el.textContent = info.txt;
  el.style.background = info.col;
}

function kEnsureTone(){
  if (window.Tone) { kBuildSamplers(); return; }
  if (document.getElementById('toneCdn')) return;
  ['piano','guitar','violin','drums'].forEach(function(k){ window._kSamplerStatus[k] = 'loading'; });
  var s = document.createElement('script');
  s.id = 'toneCdn';
  s.src = 'https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.js';
  s.onload = function(){ kBuildSamplers(); };
  s.onerror = function(){
    console.warn('Tone.js failed — using synth fallback');
    ['piano','guitar','violin','drums'].forEach(function(k){ window._kSamplerStatus[k] = 'error'; });
    kUpdateLoadPill();
  };
  document.head.appendChild(s);
}
function kBuildSamplers(){
  if (!window.Tone || window._kToneReady) return;
  var base = 'https://nbrosowsky.github.io/tonejs-instruments/samples/';
  var defs = {
    piano: { folder:'piano/', urls:{ 'A2':'A2.mp3','A3':'A3.mp3','A4':'A4.mp3','A5':'A5.mp3','C3':'C3.mp3','C4':'C4.mp3','C5':'C5.mp3','C6':'C6.mp3','D#3':'Ds3.mp3','D#4':'Ds4.mp3','D#5':'Ds5.mp3','F#3':'Fs3.mp3','F#4':'Fs4.mp3','F#5':'Fs5.mp3' } },
    guitar: { folder:'guitar-acoustic/', urls:{ 'A2':'A2.mp3','A3':'A3.mp3','A4':'A4.mp3','C3':'C3.mp3','C4':'C4.mp3','C5':'C5.mp3','D3':'D3.mp3','D4':'D4.mp3','E2':'E2.mp3','E3':'E3.mp3','E4':'E4.mp3','G2':'G2.mp3','G3':'G3.mp3','G4':'G4.mp3' } },
    violin: { folder:'violin/', urls:{ 'A3':'A3.mp3','A4':'A4.mp3','A5':'A5.mp3','C4':'C4.mp3','C5':'C5.mp3','E4':'E4.mp3','E5':'E5.mp3','G3':'G3.mp3','G4':'G4.mp3','G5':'G5.mp3' } },
    bass:   { folder:'bass-electric/', urls:{ 'A1':'A1.mp3','A2':'A2.mp3','A3':'A3.mp3','C2':'C2.mp3','C3':'C3.mp3','C4':'C4.mp3','E1':'E1.mp3','E2':'E2.mp3','E3':'E3.mp3','G1':'G1.mp3','G2':'G2.mp3','G3':'G3.mp3' } }
  };
  Object.keys(defs).forEach(function(k){
    if (window._kSamplers[k]) return;
    window._kSamplerStatus[k] = 'loading'; kUpdateLoadPill();
    try {
      window._kSamplers[k] = new Tone.Sampler({
        urls: defs[k].urls,
        baseUrl: base + defs[k].folder,
        release: 1,
        onload: function(){ window._kSamplerStatus[k] = 'ready'; kUpdateLoadPill(); },
        onerror: function(){ window._kSamplerStatus[k] = 'error'; kUpdateLoadPill(); }
      }).toDestination();
    } catch(e){ window._kSamplerStatus[k] = 'error'; }
  });
  // Drums: REAL drum samples from Tone.js drum-samples (CR78 kit) ─ all 6 verified URLs
  try {
    window._kSamplerStatus.drums = 'loading'; kUpdateLoadPill();
    var drumBase = 'https://tonejs.github.io/audio/drum-samples/CR78/';
    var drumLoaded = 0, drumTotal = 6;
    var drumDone = function(){ drumLoaded++; if (drumLoaded >= drumTotal) { window._kSamplerStatus.drums = 'ready'; kUpdateLoadPill(); } };
    window._kSamplers.drums = {
      kick:  new Tone.Player({ url: drumBase + 'kick.mp3',  onload: drumDone, onerror: drumDone }).toDestination(),
      snare: new Tone.Player({ url: drumBase + 'snare.mp3', onload: drumDone, onerror: drumDone }).toDestination(),
      hat:   new Tone.Player({ url: drumBase + 'hihat.mp3', onload: drumDone, onerror: drumDone }).toDestination(),
      tomHi: new Tone.Player({ url: drumBase + 'tom1.mp3',  onload: drumDone, onerror: drumDone }).toDestination(),
      tomLo: new Tone.Player({ url: drumBase + 'tom2.mp3',  onload: drumDone, onerror: drumDone }).toDestination(),
      crash: new Tone.Player({ url: drumBase + 'tom3.mp3',  onload: drumDone, onerror: drumDone }).toDestination()
    };
  } catch(e){ window._kSamplerStatus.drums = 'error'; }
  // ── African / Nigerian percussion (Tone.js synthesis — works offline, instant) ──
  try {
    window._kSamplerStatus.perc = 'loading'; kUpdateLoadPill();
    // Djembe — deep tone + slap (membrane)
    var djembe = new Tone.MembraneSynth({ pitchDecay:0.05, octaves:6, octave:4, envelope:{attack:0.001,decay:0.4,sustain:0.01,release:0.3} }).toDestination();
    djembe.volume.value = -4;
    // Talking drum — pitched membrane that can bend
    var talking = new Tone.MembraneSynth({ pitchDecay:0.08, octaves:4, envelope:{attack:0.002,decay:0.5,sustain:0,release:0.4} }).toDestination();
    talking.volume.value = -6;
    // Shekere — gourd shaker (filtered noise)
    var shekereNoise = new Tone.NoiseSynth({ noise:{type:'pink'}, envelope:{attack:0.005,decay:0.18,sustain:0,release:0.05} }).toDestination();
    shekereNoise.volume.value = -10;
    // Udu — clay-pot bass thump (low membrane)
    var udu = new Tone.MembraneSynth({ pitchDecay:0.02, octaves:2, envelope:{attack:0.001,decay:0.6,sustain:0,release:0.4} }).toDestination();
    udu.volume.value = -3;
    // Cowbell (Agogo)
    var bellOsc = new Tone.MetalSynth({ frequency:560, envelope:{attack:0.001,decay:0.18,release:0.05}, harmonicity:5.1, modulationIndex:32, resonance:4000, octaves:0.5 }).toDestination();
    bellOsc.volume.value = -16;
    window._kPerc = {
      djembeLow:  function(){ djembe.triggerAttackRelease('A2','8n'); },
      djembeHigh: function(){ djembe.triggerAttackRelease('E3','16n'); },
      talkingLow: function(){ talking.triggerAttackRelease('B2','8n'); },
      talkingHigh:function(){ talking.triggerAttackRelease('F#3','16n'); },
      shekere:    function(){ shekereNoise.triggerAttackRelease('16n'); },
      udu:        function(){ udu.triggerAttackRelease('A1','4n'); },
      bell:       function(){ bellOsc.triggerAttackRelease('16n'); }
    };
    window._kSamplerStatus.perc = 'ready';
  } catch(e){ window._kSamplerStatus.perc = 'error'; }
  window._kToneReady = true;
  kUpdateLoadPill();
}

function kPlayPerc(name){
  if (window.Tone && window.Tone.context && window.Tone.context.state !== 'running') {
    Tone.start().catch(function(){});
  }
  if (!window._kPerc) return false;
  var fn = window._kPerc[name];
  if (typeof fn === 'function') { try { fn(); return true; } catch(e){} }
  return false;
}
function kPlayPercPad(name){
  if (kPlayPerc(name)) {
    var nd = document.getElementById('kNoteDisplay');
    if (nd) { nd.textContent = name.toUpperCase(); setTimeout(function(){nd.textContent='';}, 600); }
    return;
  }
  // Fallback synth tone
  var freqs = { djembeLow:90, djembeHigh:180, talkingLow:140, talkingHigh:260, shekere:1200, udu:70, bell:560 };
  kPlayTone(freqs[name]||120, 'sine', 0.25, 0.4);
}

function kPlaySample(instrument, note, duration){
  if (window.Tone && window.Tone.context && window.Tone.context.state !== 'running') {
    Tone.start().catch(function(){});
  }
  var s = window._kSamplers[instrument];
  if (s && s.triggerAttackRelease) {
    try { s.triggerAttackRelease(note, duration || '4n'); return true; } catch(e){}
  }
  return false;
}
function kPlayDrum(name){
  if (window.Tone && window.Tone.context && window.Tone.context.state !== 'running') {
    Tone.start().catch(function(){});
  }
  var d = window._kSamplers.drums;
  if (!d) return false;
  try {
    var p = d[name];
    if (p && p.loaded && typeof p.start === 'function') { p.start(); return true; }
  } catch(e){}
  return false;
}

// ── Public play function (sample first, synth fallback) ──
function kPlayNote(instrument, note, freq, type, dur, vol){
  if (kPlaySample(instrument, note, dur ? dur+'s' : '4n')) {
    var nd = document.getElementById('kNoteDisplay');
    if (nd) { nd.textContent = note; setTimeout(function(){nd.textContent='';}, 600); }
    return;
  }
  kPlayTone(freq, type, dur, vol);
}
function kPlayDrumPad(name, freq, type){
  if (kPlayDrum(name)) {
    var nd = document.getElementById('kNoteDisplay');
    if (nd) { nd.textContent = name.toUpperCase(); setTimeout(function(){nd.textContent='';}, 600); }
    return;
  }
  kPlayTone(freq, type, 0.3, 0.6);
}

function kPlayTone(freq, type, dur, vol){
  try{
    var ctx = kGetAudioCtx();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type||'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol||0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+(dur||0.5));
    osc.start(); osc.stop(ctx.currentTime+(dur||0.5));
    var nd = document.getElementById('kNoteDisplay');
    if(nd){ nd.textContent = kNoteLabel(freq); setTimeout(function(){nd.textContent='';},600); }
  }catch(e){}
}

function kNoteLabel(f){
  var notes=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  var n=Math.round(12*Math.log2(f/261.63));
  return notes[((n%12)+12)%12]+(4+Math.floor(n/12));
}

// ─────── Keyboard ↔ note mappings (used both for highlights & key bindings) ───────
var K_PIANO_KEYS = [
  {n:'C4', f:261.63, key:'a'}, {n:'D4', f:293.66, key:'s'},
  {n:'E4', f:329.63, key:'d'}, {n:'F4', f:349.23, key:'f'},
  {n:'G4', f:392.00, key:'g'}, {n:'A4', f:440.00, key:'h'},
  {n:'B4', f:493.88, key:'j'}, {n:'C5', f:523.25, key:'k'}
];
var K_PIANO_BLACKS = [
  {n:'C#4', f:277.18, pos:0, key:'w'}, {n:'D#4', f:311.13, pos:1, key:'e'},
  {n:'F#4', f:369.99, pos:3, key:'t'}, {n:'G#4', f:415.30, pos:4, key:'y'},
  {n:'A#4', f:466.16, pos:5, key:'u'}
];
var K_GUITAR_STRINGS = [
  {n:'E2', f:82.41,  c:'#d97706', key:'1'}, {n:'A2', f:110,    c:'#b45309', key:'2'},
  {n:'D3', f:146.83, c:'#f59e0b', key:'3'}, {n:'G3', f:196,    c:'#059669', key:'4'},
  {n:'B3', f:246.94, c:'#2563eb', key:'5'}, {n:'E4', f:329.63, c:'#7c3aed', key:'6'}
];
var K_DRUM_PADS = [
  {n:'Kick',  k:'kick',  key:'1', c:'#1d4ed8'}, {n:'Snare', k:'snare', key:'2', c:'#dc2626'},
  {n:'Hi-Hat',k:'hat',   key:'3', c:'#d97706'}, {n:'Tom Hi',k:'tomHi', key:'4', c:'#7c3aed'},
  {n:'Tom Lo',k:'tomLo', key:'5', c:'#059669'}, {n:'Crash', k:'crash', key:'6', c:'#0e7490'}
];
var K_VIOLIN_NOTES = [
  {n:'G3', f:196,    key:'a'}, {n:'A3', f:220,    key:'s'},
  {n:'B3', f:246.94, key:'d'}, {n:'C4', f:261.63, key:'f'},
  {n:'D4', f:293.66, key:'g'}, {n:'E4', f:329.63, key:'h'},
  {n:'F4', f:349.23, key:'j'}, {n:'G4', f:392,    key:'k'}
];
// Bass guitar — 4 strings (E A D G) + extra notes for melodic play
var K_BASS_STRINGS = [
  {n:'E1', f:41.20,  c:'#7c2d12', key:'1'}, {n:'A1', f:55,     c:'#92400e', key:'2'},
  {n:'D2', f:73.42,  c:'#b45309', key:'3'}, {n:'G2', f:98,     c:'#d97706', key:'4'},
  {n:'C3', f:130.81, c:'#059669', key:'5'}, {n:'E3', f:164.81, c:'#2563eb', key:'6'}
];
// African percussion pads
var K_PERC_PADS = [
  {n:'Djembe Low',  k:'djembeLow',   key:'1', c:'#92400e'},
  {n:'Djembe Slap', k:'djembeHigh',  key:'2', c:'#b45309'},
  {n:'Talking Drum',k:'talkingLow',  key:'3', c:'#d97706'},
  {n:'Talking Hi',  k:'talkingHigh', key:'4', c:'#f59e0b'},
  {n:'Shekere',     k:'shekere',     key:'5', c:'#0e7490'},
  {n:'Udu',         k:'udu',         key:'6', c:'#7c3aed'},
  {n:'Agogo Bell',  k:'bell',        key:'7', c:'#dc2626'}
];

// ─────── Visual instrument SVGs ───────
function kInstrumentSVG(kind){
  if (kind === 'guitar') {
    return '<svg viewBox="0 0 320 100" style="width:100%;max-width:320px;height:auto;display:block;margin:0 auto 8px;">'+
      '<ellipse cx="60" cy="50" rx="48" ry="40" fill="#92400e" stroke="#451a03" stroke-width="3"/>'+
      '<circle cx="70" cy="50" r="14" fill="#1c1917"/>'+
      '<rect x="100" y="44" width="180" height="12" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>'+
      '<rect x="280" y="38" width="28" height="24" rx="3" fill="#1c1917"/>'+
      '<line x1="100" y1="46" x2="280" y2="46" stroke="#fde68a" stroke-width="0.8"/>'+
      '<line x1="100" y1="49" x2="280" y2="49" stroke="#fde68a" stroke-width="0.8"/>'+
      '<line x1="100" y1="52" x2="280" y2="52" stroke="#fde68a" stroke-width="0.8"/>'+
      '<line x1="100" y1="55" x2="280" y2="55" stroke="#fde68a" stroke-width="0.8"/>'+
      '</svg>';
  }
  if (kind === 'violin') {
    return '<svg viewBox="0 0 320 100" style="width:100%;max-width:320px;height:auto;display:block;margin:0 auto 8px;">'+
      '<path d="M30 50 Q30 18 60 22 Q80 22 80 40 Q80 50 70 52 Q90 56 90 70 Q90 88 60 88 Q30 88 30 60 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="2"/>'+
      '<rect x="80" y="46" width="180" height="8" fill="#1c1917"/>'+
      '<rect x="260" y="40" width="22" height="20" rx="3" fill="#1c1917"/>'+
      '<line x1="80" y1="48" x2="260" y2="48" stroke="#fde68a" stroke-width="0.6"/>'+
      '<line x1="80" y1="50" x2="260" y2="50" stroke="#fde68a" stroke-width="0.6"/>'+
      '<line x1="80" y1="52" x2="260" y2="52" stroke="#fde68a" stroke-width="0.6"/>'+
      '<line x1="80" y1="54" x2="260" y2="54" stroke="#fde68a" stroke-width="0.6"/>'+
      '<line x1="40" y1="20" x2="300" y2="86" stroke="#fbbf24" stroke-width="1.5" opacity=".7"/>'+
      '</svg>';
  }
  if (kind === 'drums') {
    return '<svg viewBox="0 0 320 110" style="width:100%;max-width:320px;height:auto;display:block;margin:0 auto 8px;">'+
      '<ellipse cx="160" cy="92" rx="80" ry="14" fill="#1e293b"/>'+
      '<rect x="80" y="40" width="160" height="56" rx="6" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>'+
      '<ellipse cx="160" cy="40" rx="80" ry="10" fill="#fafaf9" stroke="#a8a29e" stroke-width="2"/>'+
      '<ellipse cx="50" cy="60" rx="28" ry="6" fill="#1f2937" opacity=".9"/>'+
      '<ellipse cx="50" cy="58" rx="28" ry="6" fill="#facc15" stroke="#854d0e" stroke-width="1"/>'+
      '<ellipse cx="270" cy="55" rx="32" ry="6" fill="#1f2937" opacity=".9"/>'+
      '<ellipse cx="270" cy="53" rx="32" ry="6" fill="#facc15" stroke="#854d0e" stroke-width="1"/>'+
      '<rect x="48" y="58" width="4" height="40" fill="#1f2937"/>'+
      '<rect x="268" y="55" width="4" height="40" fill="#1f2937"/>'+
      '</svg>';
  }
  if (kind === 'piano') {
    return '<svg viewBox="0 0 320 60" style="width:100%;max-width:320px;height:auto;display:block;margin:0 auto 8px;">'+
      '<rect x="0" y="0" width="320" height="60" rx="6" fill="#0f172a"/>'+
      '<rect x="6" y="6" width="308" height="48" rx="4" fill="#1e293b"/>'+
      '<text x="160" y="36" text-anchor="middle" fill="#fbbf24" font-family="Bricolage Grotesque,sans-serif" font-weight="900" font-size="16">🎹 GRAND PIANO</text>'+
      '</svg>';
  }
  if (kind === 'bass') {
    return '<svg viewBox="0 0 320 100" style="width:100%;max-width:320px;height:auto;display:block;margin:0 auto 8px;">'+
      '<ellipse cx="60" cy="50" rx="50" ry="42" fill="#1e3a8a" stroke="#0c1f55" stroke-width="3"/>'+
      '<circle cx="72" cy="50" r="10" fill="#0f172a"/>'+
      '<rect x="100" y="44" width="190" height="14" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>'+
      '<rect x="290" y="36" width="22" height="28" rx="3" fill="#0f172a"/>'+
      '<line x1="100" y1="46" x2="290" y2="46" stroke="#fbbf24" stroke-width="1.2"/>'+
      '<line x1="100" y1="50" x2="290" y2="50" stroke="#fbbf24" stroke-width="1.2"/>'+
      '<line x1="100" y1="54" x2="290" y2="54" stroke="#fbbf24" stroke-width="1.2"/>'+
      '<line x1="100" y1="58" x2="290" y2="58" stroke="#fbbf24" stroke-width="1.2"/>'+
      '<text x="160" y="92" text-anchor="middle" fill="#94a3b8" font-family="Bricolage Grotesque,sans-serif" font-weight="900" font-size="11">BASS GUITAR</text>'+
      '</svg>';
  }
  if (kind === 'perc') {
    return '<svg viewBox="0 0 320 110" style="width:100%;max-width:320px;height:auto;display:block;margin:0 auto 8px;">'+
      // Djembe
      '<path d="M40 20 L80 20 L88 75 Q60 92 32 75 Z" fill="#92400e" stroke="#451a03" stroke-width="2"/>'+
      '<ellipse cx="60" cy="22" rx="20" ry="6" fill="#fef3c7" stroke="#78350f" stroke-width="2"/>'+
      // Talking drum (hourglass)
      '<path d="M120 22 L150 22 L142 50 L150 78 L120 78 L128 50 Z" fill="#b45309" stroke="#451a03" stroke-width="2"/>'+
      '<ellipse cx="135" cy="22" rx="15" ry="4" fill="#fef3c7" stroke="#78350f" stroke-width="1.5"/>'+
      '<ellipse cx="135" cy="78" rx="15" ry="4" fill="#fef3c7" stroke="#78350f" stroke-width="1.5"/>'+
      // Shekere (gourd with beads)
      '<ellipse cx="195" cy="55" rx="22" ry="28" fill="#d97706" stroke="#78350f" stroke-width="2"/>'+
      '<g fill="#fef3c7" stroke="#78350f" stroke-width="0.8">'+
        '<circle cx="180" cy="42" r="3"/><circle cx="195" cy="36" r="3"/><circle cx="210" cy="44" r="3"/>'+
        '<circle cx="178" cy="60" r="3"/><circle cx="212" cy="62" r="3"/>'+
        '<circle cx="186" cy="74" r="3"/><circle cx="204" cy="74" r="3"/>'+
      '</g>'+
      // Udu (clay pot)
      '<path d="M250 80 Q230 80 230 60 Q230 38 268 38 Q300 38 296 62 Q294 80 270 80 Z" fill="#7c2d12" stroke="#3b0a02" stroke-width="2"/>'+
      '<ellipse cx="262" cy="38" rx="6" ry="3" fill="#1c1917"/>'+
      '<text x="160" y="103" text-anchor="middle" fill="#94a3b8" font-family="Bricolage Grotesque,sans-serif" font-weight="900" font-size="10">DJEMBE · TALKING DRUM · SHEKERE · UDU</text>'+
      '</svg>';
  }
  return '';
}

function kInstrumentRender(){
  var inst = window._kInstrument||'piano';
  var body = document.getElementById('kGameBody');

  var tabs = [
    {id:'piano',  label:'🎹 Piano',  col:'#2563eb'},
    {id:'guitar', label:'🎸 Guitar', col:'#b45309'},
    {id:'bass',   label:'🎸 Bass',   col:'#0f766e'},
    {id:'drums',  label:'🥁 Drums',  col:'#7c3aed'},
    {id:'perc',   label:'🪘 Percussion', col:'#d97706'},
    {id:'violin', label:'🎻 Violin', col:'#dc2626'},
    {id:'loop',   label:'🔁 Loop',   col:'#10b981'}
  ];
  var html = '<div id="kNoteDisplay" style="text-align:center;font-size:1.8rem;font-weight:900;color:#fbbf24;min-height:44px;margin-bottom:8px;font-family:Bricolage Grotesque,sans-serif;letter-spacing:.05em;"></div>';
  html += '<div style="text-align:center;margin-bottom:10px;"><span id="kLoadPill" style="display:inline-block;padding:5px 12px;border-radius:100px;font-size:.72rem;font-weight:800;color:#fff;background:#64748b;letter-spacing:.02em;">⚪ Synth fallback</span></div>';
  html += '<div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;justify-content:center;">';
  tabs.forEach(function(t){
    var active = t.id===inst;
    html += '<button onclick="window._kInstrument=\''+t.id+'\';kInstrumentRender();kUpdateLoadPill();" style="padding:8px 14px;border-radius:100px;font-weight:700;font-size:.82rem;cursor:pointer;border:2px solid '+(active?t.col:'rgba(255,255,255,.2)')+';background:'+(active?t.col:'transparent')+';color:white;transition:all .2s;font-family:inherit;">'+t.label+'</button>';
  });
  html += '</div>';

  if (inst === 'loop') {
    body.innerHTML = html + kLoopHTML();
    kLoopAttachKeys();
    kUpdateLoadPill();
    return;
  }

  // Visual illustration of the actual instrument
  html += '<div style="background:linear-gradient(180deg,#0f172a,#1a2332);border-radius:18px;padding:14px;margin-bottom:12px;">';
  html += kInstrumentSVG(inst);

  if(inst==='piano'){
    html += '<div style="display:flex;justify-content:center;"><div style="display:inline-block;position:relative;user-select:none;">';
    html += '<div style="display:flex;gap:2px;">';
    K_PIANO_KEYS.forEach(function(k){
      html += '<div data-pkey="'+k.n+'" onclick="kPlayNote(\'piano\',\''+k.n+'\','+k.f+',\'triangle\',0.6,0.3)" style="width:44px;height:130px;background:white;border-radius:0 0 8px 8px;cursor:pointer;border:1px solid #ccc;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:6px;font-size:9px;color:#9ca3af;font-weight:700;transition:background .05s;" onmousedown="this.style.background=\'#e8e4ff\'" onmouseup="this.style.background=\'white\'" onmouseleave="this.style.background=\'white\'"><span style="font-size:11px;color:#1e293b;background:#fbbf24;border-radius:4px;padding:1px 5px;margin-bottom:4px;">'+k.key.toUpperCase()+'</span>'+k.n+'</div>';
    });
    html += '</div>';
    html += '<div style="position:absolute;top:0;left:2px;right:2px;height:82px;pointer-events:none;">';
    K_PIANO_BLACKS.forEach(function(k){
      var left = k.pos*46 + 28;
      html += '<div data-pkey="'+k.n+'" onclick="event.stopPropagation();kPlayNote(\'piano\',\''+k.n+'\','+k.f+',\'triangle\',0.6,0.3)" style="position:absolute;left:'+left+'px;width:28px;height:82px;background:#1e293b;border-radius:0 0 5px 5px;cursor:pointer;pointer-events:all;z-index:2;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;" onmousedown="this.style.background=\'#4b5563\'" onmouseup="this.style.background=\'#1e293b\'" onmouseleave="this.style.background=\'#1e293b\'"><span style="font-size:9px;color:#0f172a;background:#fbbf24;border-radius:3px;padding:1px 4px;font-weight:700;">'+k.key.toUpperCase()+'</span></div>';
    });
    html += '</div></div></div>';
    html += '<p style="text-align:center;font-size:.78rem;color:rgba(255,255,255,.55);margin-top:10px;">⌨️ Press <b>A S D F G H J K</b> for white keys · <b>W E T Y U</b> for black</p>';

  } else if(inst==='guitar'){
    html += '<p style="color:rgba(255,255,255,.6);font-size:.8rem;margin-bottom:10px;text-align:center;">Tap a string or press <b>1–6</b> to pluck</p>';
    K_GUITAR_STRINGS.forEach(function(s){
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:9px;">';
      html += '<span style="font-size:10px;color:#0f172a;background:#fbbf24;border-radius:4px;padding:2px 6px;font-weight:900;width:18px;text-align:center;">'+s.key+'</span>';
      html += '<span style="font-size:.72rem;color:rgba(255,255,255,.55);width:24px;text-align:right;font-weight:700;">'+s.n+'</span>';
      html += '<div data-gkey="'+s.n+'" onclick="kPlayNote(\'guitar\',\''+s.n+'\','+s.f+',\'sawtooth\',1.0,0.15)" style="flex:1;height:4px;background:'+s.c+';cursor:pointer;border-radius:2px;transition:height .1s,box-shadow .1s;" onmousedown="this.style.height=\'8px\'" onmouseup="this.style.height=\'4px\'" onmouseleave="this.style.height=\'4px\'"></div>';
      html += '</div>';
    });

  } else if(inst==='drums'){
    html += '<p style="color:rgba(255,255,255,.6);font-size:.8rem;margin-bottom:10px;text-align:center;">Tap pads or press <b>1–6</b></p>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">';
    K_DRUM_PADS.forEach(function(p){
      html += '<div data-dkey="'+p.k+'" onclick="kPlayDrumPad(\''+p.k+'\',60,\'sine\')" style="background:'+p.c+';border-radius:14px;padding:18px 10px 14px;text-align:center;cursor:pointer;font-weight:900;font-size:.9rem;color:white;transition:transform .1s;user-select:none;" onmousedown="this.style.transform=\'scale(.94)\'" onmouseup="this.style.transform=\'scale(1)\'" onmouseleave="this.style.transform=\'scale(1)\'"><div style="font-size:11px;color:#0f172a;background:#fbbf24;border-radius:4px;padding:1px 6px;display:inline-block;margin-bottom:6px;">'+p.key+'</div><div>'+p.n+'</div></div>';
    });
    html += '</div>';

  } else if(inst==='violin'){
    html += '<p style="color:rgba(255,255,255,.6);font-size:.8rem;margin-bottom:10px;text-align:center;">Tap or press <b>A S D F G H J K</b> to bow</p>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">';
    K_VIOLIN_NOTES.forEach(function(n){
      html += '<button data-vkey="'+n.n+'" onclick="kPlayNote(\'violin\',\''+n.n+'\','+n.f+',\'sawtooth\',1.2,0.18)" style="padding:10px 14px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:white;cursor:pointer;font-weight:700;font-size:.85rem;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:3px;" onmouseover="this.style.background=\'rgba(220,38,38,.3)\'" onmouseout="this.style.background=\'rgba(255,255,255,.08)\'"><span style="font-size:10px;color:#0f172a;background:#fbbf24;border-radius:3px;padding:1px 5px;">'+n.key.toUpperCase()+'</span>'+n.n+'</button>';
    });
    html += '</div>';

  } else if(inst==='bass'){
    html += '<p style="color:rgba(255,255,255,.6);font-size:.8rem;margin-bottom:10px;text-align:center;">Pluck a bass string or press <b>1–6</b></p>';
    K_BASS_STRINGS.forEach(function(s){
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">';
      html += '<span style="font-size:10px;color:#0f172a;background:#fbbf24;border-radius:4px;padding:2px 6px;font-weight:900;width:18px;text-align:center;">'+s.key+'</span>';
      html += '<span style="font-size:.72rem;color:rgba(255,255,255,.55);width:24px;text-align:right;font-weight:700;">'+s.n+'</span>';
      html += '<div data-bkey="'+s.n+'" onclick="kPlayNote(\'bass\',\''+s.n+'\','+s.f+',\'sawtooth\',1.4,0.22)" style="flex:1;height:6px;background:'+s.c+';cursor:pointer;border-radius:3px;transition:height .1s;box-shadow:0 0 0 1px rgba(0,0,0,.3);" onmousedown="this.style.height=\'12px\'" onmouseup="this.style.height=\'6px\'" onmouseleave="this.style.height=\'6px\'"></div>';
      html += '</div>';
    });

  } else if(inst==='perc'){
    html += '<p style="color:rgba(255,255,255,.6);font-size:.8rem;margin-bottom:10px;text-align:center;">🇳🇬 Nigerian & African percussion. Tap pads or press <b>1–7</b></p>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">';
    K_PERC_PADS.forEach(function(p){
      html += '<div data-pcky="'+p.k+'" onclick="kPlayPercPad(\''+p.k+'\')" style="background:'+p.c+';border-radius:14px;padding:18px 8px 14px;text-align:center;cursor:pointer;font-weight:900;font-size:.82rem;color:white;transition:transform .1s;user-select:none;" onmousedown="this.style.transform=\'scale(.94)\'" onmouseup="this.style.transform=\'scale(1)\'" onmouseleave="this.style.transform=\'scale(1)\'"><div style="font-size:11px;color:#0f172a;background:#fbbf24;border-radius:4px;padding:1px 6px;display:inline-block;margin-bottom:6px;">'+p.key+'</div><div>'+p.n+'</div></div>';
    });
    html += '</div>';
  }

  html += '</div>';
  html += '<div style="background:rgba(255,255,255,.04);border-radius:14px;padding:10px 14px;font-size:.78rem;color:rgba(255,255,255,.6);line-height:1.55;text-align:center;">🎼 Each instrument plays real recorded sounds. Try the <b>🔁 Loop</b> tab to make beats!</div>';
  body.innerHTML = html;
  kAttachInstrumentKeys();
  kUpdateLoadPill();
}

// ─────── Keyboard input ───────
window._kKeyHandler = window._kKeyHandler || null;
function kAttachInstrumentKeys(){
  if (window._kKeyHandler) document.removeEventListener('keydown', window._kKeyHandler);
  window._kKeyHandler = function(ev){
    if (ev.repeat) return;
    var ov = document.getElementById('kGameOverlay');
    if (!ov || ov.style.display === 'none') return;
    var k = (ev.key||'').toLowerCase();
    var inst = window._kInstrument || 'piano';
    var hit = function(sel, flashColor){
      var el = document.querySelector(sel);
      if (!el) return;
      var orig = el.style.background, origH = el.style.height;
      el.style.background = flashColor || '#fde68a';
      if (origH) el.style.height = '8px';
      setTimeout(function(){ el.style.background = orig; if (origH) el.style.height = origH; }, 130);
    };
    if (inst === 'piano') {
      var w = K_PIANO_KEYS.find(function(x){return x.key===k;});
      var b = K_PIANO_BLACKS.find(function(x){return x.key===k;});
      if (w) { kPlayNote('piano', w.n, w.f,'triangle',0.6,0.3); hit('[data-pkey="'+w.n+'"]', '#e8e4ff'); ev.preventDefault(); }
      else if (b) { kPlayNote('piano', b.n, b.f,'triangle',0.6,0.3); hit('[data-pkey="'+b.n+'"]', '#4b5563'); ev.preventDefault(); }
    } else if (inst === 'guitar') {
      var g = K_GUITAR_STRINGS.find(function(x){return x.key===k;});
      if (g) { kPlayNote('guitar', g.n, g.f,'sawtooth',1.0,0.15); hit('[data-gkey="'+g.n+'"]', '#fde68a'); ev.preventDefault(); }
    } else if (inst === 'drums') {
      var d = K_DRUM_PADS.find(function(x){return x.key===k;});
      if (d) { kPlayDrumPad(d.k,60,'sine'); var el=document.querySelector('[data-dkey="'+d.k+'"]'); if(el){el.style.transform='scale(.92)'; setTimeout(function(){el.style.transform='';},120);} ev.preventDefault(); }
    } else if (inst === 'violin') {
      var v = K_VIOLIN_NOTES.find(function(x){return x.key===k;});
      if (v) { kPlayNote('violin', v.n, v.f,'sawtooth',1.2,0.18); hit('[data-vkey="'+v.n+'"]', 'rgba(220,38,38,.4)'); ev.preventDefault(); }
    } else if (inst === 'bass') {
      var bs = K_BASS_STRINGS.find(function(x){return x.key===k;});
      if (bs) { kPlayNote('bass', bs.n, bs.f,'sawtooth',1.4,0.22); hit('[data-bkey="'+bs.n+'"]', '#fde68a'); ev.preventDefault(); }
    } else if (inst === 'perc') {
      var pc = K_PERC_PADS.find(function(x){return x.key===k;});
      if (pc) { kPlayPercPad(pc.k); var el=document.querySelector('[data-pcky="'+pc.k+'"]'); if(el){el.style.transform='scale(.92)'; setTimeout(function(){el.style.transform='';},120);} ev.preventDefault(); }
    }
  };
  document.addEventListener('keydown', window._kKeyHandler);
}

// ─────── 🔁 LOOP STUDIO — kid-friendly step sequencer ───────
// • Choose 1, 2, 4, or 8 bars (8 steps each → up to 64 steps ≈ 60s @100bpm)
// • BPM 60–160, Swing 0–60%, master Volume
// • Per-track Mute/Solo/Volume
// • Repeat-N-times or Loop forever
// • Save/Load patterns (JSON, localStorage + download)
// • Record audio → download .webm
// Afrobeat-friendly minor pentatonic walk (C minor pent with bluesy passing notes)
var K_LOOP_BASS_NOTES = ['C2','C2','Eb2','F2','G2','F2','Eb2','C2','C2','Bb2','G2','F2','Eb2','F2','G2','Bb2'];
var K_LOOP_BASS_F     = [65.41,65.41,77.78,87.31,98,87.31,77.78,65.41,65.41,116.54,98,87.31,77.78,87.31,98,116.54];
// Melodic notes for piano/guitar/violin tracks — C minor pentatonic riff
var K_LOOP_MEL_NOTES  = ['C4','Eb4','F4','G4','Bb4','C5','Bb4','G4','F4','G4','Eb4','C4','Eb4','F4','G4','Bb4'];
var K_LOOP_MEL_F      = [261.63,311.13,349.23,392,466.16,523.25,466.16,392,349.23,392,311.13,261.63,311.13,349.23,392,466.16];
// Master list of every available looper track. `kind` decides how it plays.
// Default-on tracks render even before the user adds them.
var K_LOOP_ALL_TRACKS = [
  // Drum kit
  {id:'kick',   label:'🥁 Kick',     c:'#1d4ed8', kind:'drum',  drum:'kick'},
  {id:'snare',  label:'🪘 Snare',    c:'#dc2626', kind:'drum',  drum:'snare'},
  {id:'hat',    label:'🎩 Hat',      c:'#d97706', kind:'drum',  drum:'hat'},
  {id:'tomHi',  label:'🛢 Tom Hi',   c:'#7c3aed', kind:'drum',  drum:'tomHi'},
  {id:'tomLo',  label:'🛢 Tom Lo',   c:'#5b21b6', kind:'drum',  drum:'tomLo'},
  {id:'crash',  label:'💥 Crash',    c:'#0e7490', kind:'drum',  drum:'crash'},
  // Bass guitar
  {id:'bass',   label:'🎸 Bass Gtr', c:'#10b981', kind:'bass'},
  // Melodic instruments
  {id:'piano',  label:'🎹 Piano',    c:'#facc15', kind:'mel',  mel:'piano'},
  {id:'guitar', label:'🎸 Guitar',   c:'#f59e0b', kind:'mel',  mel:'guitar'},
  {id:'violin', label:'🎻 Violin',   c:'#e11d48', kind:'mel',  mel:'violin'},
  // African percussion
  {id:'djembe', label:'🪘 Djembe',   c:'#92400e', kind:'perc',  perc:'djembeLow'},
  {id:'talking',label:'🪘 Talking',  c:'#b45309', kind:'perc',  perc:'talkingHigh'},
  {id:'shekere',label:'🥥 Shekere',  c:'#0e7490', kind:'perc',  perc:'shekere'},
  {id:'udu',    label:'🏺 Udu',      c:'#7c3aed', kind:'perc',  perc:'udu'},
  {id:'bell',   label:'🔔 Agogo',    c:'#dc2626', kind:'perc',  perc:'bell'}
];
function kLoopTrackById(id){ for (var i=0;i<K_LOOP_ALL_TRACKS.length;i++) if (K_LOOP_ALL_TRACKS[i].id===id) return K_LOOP_ALL_TRACKS[i]; return null; }
function kLoopMakeRow(steps){ var a=[]; for(var i=0;i<steps;i++) a.push(0); return a; }
function kLoopDefault(steps){
  steps = steps || 16;
  var t = {};
  K_LOOP_ALL_TRACKS.forEach(function(tr){ t[tr.id] = kLoopMakeRow(steps); });
  // Afrobeat starter pattern (16 steps = 1 bar of 16th notes)
  // Kick on 1 & 9, with ghost on 11; snare on 5 & 13; hats every 16th (with rest holes)
  if (steps >= 16) {
    t.kick[0]=1;  t.kick[6]=1;  t.kick[8]=1;  t.kick[14]=1;
    t.snare[4]=1; t.snare[12]=1;
    [0,2,3,4,6,7,8,10,11,12,14,15].forEach(function(i){ t.hat[i]=1; });
  } else if (steps >= 8) {
    t.kick[0]=1; t.kick[4]=1;
    t.snare[2]=1; t.snare[6]=1;
    for (var i=0;i<8;i++) t.hat[i]=1;
  }
  return t;
}
window._kLoop = window._kLoop || {
  // Afrobeat default: 1 bar of 16 sixteenth-notes at 105 BPM
  bars: 1, stepsPerBar: 16, steps: 16, bpm: 105, swing: 0, master: 0.85,
  playing: false, idx: 0, timer: null,
  repeat: 0, // 0 = ∞, else number of full passes remaining
  // Which optional tracks the user has added (kick/snare/hat are always on)
  enabled:  { kick:true, snare:true, hat:true, tomHi:false, tomLo:false, crash:false, bass:false, piano:false, guitar:false, violin:false, djembe:false, talking:false, shekere:false, udu:false, bell:false },
  trackVol: { kick:0.9, snare:0.9, hat:0.7, tomHi:0.8, tomLo:0.8, crash:0.6, bass:0.8, piano:0.7, guitar:0.7, violin:0.7, djembe:0.9, talking:0.9, shekere:0.7, udu:0.9, bell:0.7 },
  mute:     {},
  solo:     {},
  rec:      { active:false, mr:null, chunks:[], dest:null, blobUrl:null, startedAt:0 },
  tracks: kLoopDefault(16)
};
// Backfill mute/solo for any newly-added track ids
(function(){ var L = window._kLoop;
  K_LOOP_ALL_TRACKS.forEach(function(t){
    if (!(t.id in L.mute)) L.mute[t.id] = false;
    if (!(t.id in L.solo)) L.solo[t.id] = false;
    if (!(t.id in L.enabled)) L.enabled[t.id] = false;
    if (!L.tracks[t.id]) L.tracks[t.id] = kLoopMakeRow(L.steps);
  });
})();
function kLoopActiveTracks(){
  var L = window._kLoop;
  return K_LOOP_ALL_TRACKS.filter(function(t){ return L.enabled[t.id]; });
}
function kLoopAddTrack(id){
  var L = window._kLoop;
  L.enabled[id] = true;
  if (!L.tracks[id] || L.tracks[id].length !== L.steps) L.tracks[id] = kLoopMakeRow(L.steps);
  if (window._kInstrument === 'loop') kInstrumentRender();
}
function kLoopRemoveTrack(id){
  var L = window._kLoop;
  if (id==='kick'||id==='snare'||id==='hat') return; // core kit stays
  L.enabled[id] = false;
  if (window._kInstrument === 'loop') kInstrumentRender();
}

function kLoopSetBars(n){
  var L = window._kLoop;
  var spb = L.stepsPerBar || 16;
  var newSteps = Math.max(1, n) * spb;
  // Resize tracks while keeping existing hits
  Object.keys(L.tracks).forEach(function(t){
    var cur = L.tracks[t] || [];
    var next = kLoopMakeRow(newSteps);
    for (var i=0;i<Math.min(cur.length,newSteps);i++) next[i] = cur[i];
    L.tracks[t] = next;
  });
  L.bars = n; L.steps = newSteps;
  if (L.playing) { kLoopStop(); kLoopStart(); }
  if (window._kInstrument === 'loop') kInstrumentRender();
}
function kLoopApproxSeconds(){
  var L = window._kLoop;
  // Each step = 16th note → 60 / bpm / 4 sec
  var stepDiv = (L.stepsPerBar || 16) / 4; // 4 beats per bar → division
  return (L.steps * 60 / L.bpm / stepDiv);
}
function kLoopSetStepsPerBar(spb){
  var L = window._kLoop;
  spb = (spb===8 ? 8 : 16);
  if (L.stepsPerBar === spb) return;
  L.stepsPerBar = spb;
  // Re-allocate steps to keep current bar count
  var newSteps = L.bars * spb;
  Object.keys(L.tracks).forEach(function(t){
    var cur = L.tracks[t] || [];
    var next = kLoopMakeRow(newSteps);
    // Stretch/compress: map new index → old proportionally so beats stay aligned
    for (var i=0;i<newSteps;i++){
      var src = Math.round(i * cur.length / newSteps);
      next[i] = cur[src] || 0;
    }
    L.tracks[t] = next;
  });
  L.steps = newSteps;
  if (L.playing) { kLoopStop(); kLoopStart(); }
  if (window._kInstrument === 'loop') kInstrumentRender();
}

function kLoopHTML(){
  var L = window._kLoop;
  var rows = kLoopActiveTracks();
  var sec = kLoopApproxSeconds();
  var h = '<div style="background:linear-gradient(180deg,#0f172a,#1a2332);border-radius:18px;padding:14px;margin-bottom:12px;">';

  // Top transport
  h += '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-bottom:12px;">';
  h += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
  h += '<button onclick="kLoopToggle()" style="background:'+(L.playing?'#dc2626':'#10b981')+';color:#fff;border:none;padding:10px 18px;border-radius:100px;font-weight:900;font-family:inherit;font-size:.92rem;cursor:pointer;">'+(L.playing?'⏸ Stop':'▶ Play')+'</button>';
  h += '<button onclick="kLoopRecToggle()" style="background:'+(L.rec.active?'#dc2626':'rgba(255,255,255,.08)')+';color:#fff;border:1px solid rgba(255,255,255,.2);padding:10px 14px;border-radius:100px;font-weight:800;font-family:inherit;font-size:.82rem;cursor:pointer;">'+(L.rec.active?'⏹ Stop Rec':'🎙️ Record')+'</button>';
  h += '<button onclick="kLoopClear()" style="background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.2);padding:10px 14px;border-radius:100px;font-weight:700;font-family:inherit;font-size:.8rem;cursor:pointer;">🧹 Clear</button>';
  h += '</div>';
  h += '<div style="color:#fbbf24;font-weight:900;font-family:Bricolage Grotesque,sans-serif;font-size:.9rem;">⏱ '+sec.toFixed(1)+'s · '+L.steps+' steps</div>';
  h += '</div>';

  // Length picker
  h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;align-items:center;">';
  h += '<span style="color:rgba(255,255,255,.55);font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;margin-right:4px;">Length</span>';
  [1,2,4,8].forEach(function(n){
    var on = L.bars===n;
    var label = n===1 ? '1 bar (~5s)' : n+' bars (~'+(n*5)+'s)';
    h += '<button onclick="kLoopSetBars('+n+')" style="background:'+(on?'linear-gradient(135deg,#fbbf24,#f59e0b)':'rgba(255,255,255,.06)')+';color:'+(on?'#0f172a':'#fff')+';border:1px solid '+(on?'transparent':'rgba(255,255,255,.15)')+';padding:7px 12px;border-radius:100px;font-family:inherit;font-weight:800;font-size:.74rem;cursor:pointer;">'+label+'</button>';
  });
  h += '</div>';

  // Sliders row: BPM / Swing / Volume
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px;background:rgba(255,255,255,.04);border-radius:12px;padding:10px;">';
  h += '<div><div style="font-size:.7rem;color:rgba(255,255,255,.6);font-weight:800;margin-bottom:4px;">BPM <span id="kLoopBpmVal" style="color:#fbbf24;float:right;">'+L.bpm+'</span></div><input type="range" min="60" max="160" value="'+L.bpm+'" oninput="kLoopBpm(this.value)" style="width:100%;"/></div>';
  h += '<div><div style="font-size:.7rem;color:rgba(255,255,255,.6);font-weight:800;margin-bottom:4px;">Swing <span id="kLoopSwingVal" style="color:#fbbf24;float:right;">'+L.swing+'%</span></div><input type="range" min="0" max="60" value="'+L.swing+'" oninput="kLoopSwing(this.value)" style="width:100%;"/></div>';
  h += '<div><div style="font-size:.7rem;color:rgba(255,255,255,.6);font-weight:800;margin-bottom:4px;">Volume <span id="kLoopVolVal" style="color:#fbbf24;float:right;">'+Math.round(L.master*100)+'%</span></div><input type="range" min="0" max="100" value="'+Math.round(L.master*100)+'" oninput="kLoopMaster(this.value)" style="width:100%;"/></div>';
  h += '</div>';

  // Save / Load / Export
  h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">';
  h += '<button onclick="kLoopSavePattern()" style="background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.2);padding:7px 12px;border-radius:100px;font-family:inherit;font-weight:800;font-size:.74rem;cursor:pointer;">💾 Save Pattern</button>';
  h += '<button onclick="kLoopLoadPattern()" style="background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.2);padding:7px 12px;border-radius:100px;font-family:inherit;font-weight:800;font-size:.74rem;cursor:pointer;">📂 Load Pattern</button>';
  h += '<button onclick="kLoopExportJSON()" style="background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.2);padding:7px 12px;border-radius:100px;font-family:inherit;font-weight:800;font-size:.74rem;cursor:pointer;">⬇️ Download .json</button>';
  h += '<input type="file" id="kLoopFile" accept="application/json" style="display:none" onchange="kLoopImportJSON(event)"/>';
  h += '<button onclick="document.getElementById(\'kLoopFile\').click()" style="background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.2);padding:7px 12px;border-radius:100px;font-family:inherit;font-weight:800;font-size:.74rem;cursor:pointer;">⬆️ Import .json</button>';
  h += '<span id="kLoopRecLabel" style="margin-left:auto;align-self:center;color:rgba(255,255,255,.55);font-size:.72rem;font-weight:700;"></span>';
  h += '</div>';

  // ── Add-instrument tray ──
  h += '<div style="background:rgba(16,185,129,.08);border:1px dashed rgba(16,185,129,.35);border-radius:12px;padding:8px 10px;margin-bottom:10px;">';
  h += '<div style="font-size:.7rem;color:#a7f3d0;font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">➕ Add instruments to your loop</div>';
  h += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
  K_LOOP_ALL_TRACKS.forEach(function(t){
    var on = L.enabled[t.id];
    var locked = (t.id==='kick'||t.id==='snare'||t.id==='hat');
    if (on) {
      h += '<button onclick="'+(locked?'':'kLoopRemoveTrack(\''+t.id+'\')')+'" title="'+(locked?'Always in your kit':'Remove track')+'" style="background:'+t.c+';color:#fff;border:none;padding:6px 10px;border-radius:100px;font-family:inherit;font-weight:800;font-size:.72rem;cursor:'+(locked?'default':'pointer')+';opacity:'+(locked?'.85':'1')+';">'+t.label+(locked?'':' ✕')+'</button>';
    } else {
      h += '<button onclick="kLoopAddTrack(\''+t.id+'\')" style="background:rgba(255,255,255,.06);color:#fff;border:1px dashed rgba(255,255,255,.3);padding:6px 10px;border-radius:100px;font-family:inherit;font-weight:700;font-size:.72rem;cursor:pointer;">+ '+t.label+'</button>';
    }
  });
  h += '</div></div>';

  // ── Live Play strip — actually play notes from your keyboard ──
  var liveTrk = L.liveTrack && kLoopTrackById(L.liveTrack);
  var melodicEnabled = K_LOOP_ALL_TRACKS.filter(function(t){ return L.enabled[t.id]; });
  h += '<div style="background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.3);border-radius:12px;padding:10px 12px;margin-bottom:10px;">';
  h += '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:'+(liveTrk?'10px':'0')+';">';
  h += '<div style="font-size:.7rem;color:#bfdbfe;font-weight:900;text-transform:uppercase;letter-spacing:.06em;">🎹 Live Play</div>';
  h += '<select onchange="kLoopSetLiveTrack(this.value)" style="background:rgba(15,23,42,.7);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:100px;padding:6px 12px;font-family:inherit;font-weight:700;font-size:.74rem;cursor:pointer;">';
  h += '<option value="">— pick instrument —</option>';
  melodicEnabled.forEach(function(t){
    h += '<option value="'+t.id+'"'+(L.liveTrack===t.id?' selected':'')+'>'+t.label+'</option>';
  });
  h += '</select>';
  if (liveTrk){
    h += '<button onclick="kLoopToggleRecord()" style="background:'+(L.liveRec?'#dc2626':'rgba(255,255,255,.08)')+';color:#fff;border:1px solid '+(L.liveRec?'#dc2626':'rgba(255,255,255,.2)')+';padding:6px 12px;border-radius:100px;font-family:inherit;font-weight:800;font-size:.72rem;cursor:pointer;">'+(L.liveRec?'⏺ Recording (R)':'🎙 Record into loop (R)')+'</button>';
    h += '<span style="font-size:.7rem;color:rgba(255,255,255,.55);">Press a key below — or use your keyboard. Hits get written into the current step while ▶ playing.</span>';
  } else {
    h += '<span style="font-size:.7rem;color:rgba(255,255,255,.55);">Choose any instrument you\'ve added to the loop, then play it from your keyboard. Notes are no longer fixed — pitch follows the key you press.</span>';
  }
  h += '</div>';
  if (liveTrk){
    var rows = kLoopLiveKeysFor(L.liveTrack);
    h += '<div style="display:flex;flex-wrap:wrap;gap:5px;">';
    rows.forEach(function(r,idx){
      h += '<button id="kLiveKey_'+idx+'" onclick="kLoopLivePlay('+JSON.stringify(r).replace(/"/g,'&quot;')+')" style="background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.18);padding:6px 9px;border-radius:8px;font-family:inherit;font-weight:800;font-size:.72rem;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:42px;transition:background .1s;">';
      h += '<span style="background:#fbbf24;color:#0f172a;border-radius:4px;padding:0 5px;font-size:.65rem;">'+r.key.toUpperCase()+'</span>';
      h += '<span style="font-size:.66rem;color:rgba(255,255,255,.7);">'+r.label+'</span>';
      h += '</button>';
    });
    h += '</div>';
  }
  h += '</div>';

  // Step header — wraps every bar (8 or 16 steps) for clear afrobeat phrasing
  var spbView = L.stepsPerBar || 16;
  var rowChunks = Math.ceil(L.steps / spbView);
  var beatDiv = spbView / 4; // every 4th of a bar = beat
  for (var rc=0; rc<rowChunks; rc++) {
    var startIdx = rc*spbView;
    var endIdx   = Math.min(startIdx+spbView, L.steps);
    var thisCols = endIdx - startIdx;
    if (rc===0) {
      h += '<div style="display:grid;grid-template-columns:84px repeat('+thisCols+',1fr);gap:4px;margin-bottom:4px;">';
      h += '<div style="font-size:.6rem;color:rgba(255,255,255,.4);font-weight:800;text-transform:uppercase;align-self:end;">Bar 1</div>';
      for (var s=startIdx;s<endIdx;s++){
        var posInBar = s - startIdx;
        var beatStrong = (posInBar % beatDiv === 0);
        var beatNum = Math.floor(posInBar / beatDiv) + 1;
        var label = beatStrong ? beatNum : '·';
        h += '<div id="kLoopHead'+s+'" style="text-align:center;font-size:.62rem;color:'+(beatStrong?'#fbbf24':'rgba(255,255,255,.4)')+';font-weight:'+(beatStrong?'900':'700')+';padding:2px 0;border-radius:6px;">'+label+'</div>';
      }
      h += '</div>';
    } else {
      h += '<div style="display:grid;grid-template-columns:84px repeat('+thisCols+',1fr);gap:4px;margin:8px 0 4px;border-top:1px dashed rgba(255,255,255,.12);padding-top:6px;">';
      h += '<div style="font-size:.6rem;color:rgba(255,255,255,.4);font-weight:800;text-transform:uppercase;align-self:end;">Bar '+(rc+1)+'</div>';
      for (var s2=startIdx;s2<endIdx;s2++){
        var posInBar2 = s2 - startIdx;
        var bs = (posInBar2 % beatDiv === 0);
        var bn = Math.floor(posInBar2 / beatDiv) + 1;
        var lab = bs ? bn : '·';
        h += '<div id="kLoopHead'+s2+'" style="text-align:center;font-size:.62rem;color:'+(bs?'#fbbf24':'rgba(255,255,255,.4)')+';font-weight:'+(bs?'900':'700')+';padding:2px 0;border-radius:6px;">'+lab+'</div>';
      }
      h += '</div>';
    }
    rows.forEach(function(r){
      h += '<div style="display:grid;grid-template-columns:84px repeat('+thisCols+',1fr);gap:4px;margin-bottom:4px;align-items:center;">';
      if (rc===0) {
        // Track header with mute/solo/volume
        var muted = L.mute[r.id], solo = L.solo[r.id];
        h += '<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">';
        h += '<div style="color:#fff;font-size:.74rem;font-weight:800;">'+r.label+'</div>';
        h += '<div style="display:flex;gap:3px;">';
        h += '<button title="Mute" onclick="kLoopMute(\''+r.id+'\')" style="background:'+(muted?'#dc2626':'rgba(255,255,255,.08)')+';color:#fff;border:none;padding:2px 6px;border-radius:6px;font-size:.62rem;font-weight:800;cursor:pointer;font-family:inherit;">M</button>';
        h += '<button title="Solo" onclick="kLoopSolo(\''+r.id+'\')" style="background:'+(solo?'#fbbf24':'rgba(255,255,255,.08)')+';color:'+(solo?'#0f172a':'#fff')+';border:none;padding:2px 6px;border-radius:6px;font-size:.62rem;font-weight:800;cursor:pointer;font-family:inherit;">S</button>';
        h += '</div></div>';
      } else {
        h += '<div style="color:rgba(255,255,255,.5);font-size:.7rem;font-weight:700;">'+r.label+'</div>';
      }
      for (var s3=startIdx;s3<endIdx;s3++){
          var trkArr = L.tracks[r.id] || (L.tracks[r.id] = kLoopMakeRow(L.steps));
          var on = trkArr[s3];
          var posIB = s3 - startIdx;
          var bg = on ? r.c : (posIB % beatDiv === 0 ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.05)');
        h += '<button onclick="kLoopToggleStep(\''+r.id+'\','+s3+')" style="aspect-ratio:1;background:'+bg+';border:1px solid '+(on?r.c:'rgba(255,255,255,.1)')+';border-radius:7px;cursor:pointer;transition:all .12s;padding:0;" id="kLoopCell_'+r.id+'_'+s3+'"></button>';
      }
      h += '</div>';
    });
  }

  h += '</div>';
  h += '<div style="background:rgba(255,255,255,.04);border-radius:14px;padding:10px 14px;font-size:.78rem;color:rgba(255,255,255,.6);line-height:1.55;text-align:center;">🎶 Tap cells to add beats. <b>Space</b> to play/stop. Use <b>🎙 Record</b> to save your song as audio.</div>';
  return h;
}
function kLoopToggleStep(track, step){
  var L = window._kLoop;
  if (!L.tracks[track]) L.tracks[track] = kLoopMakeRow(L.steps);
  L.tracks[track][step] = L.tracks[track][step] ? 0 : 1;
  var cell = document.getElementById('kLoopCell_'+track+'_'+step);
  var trkDef = kLoopTrackById(track);
  var trkColor = trkDef ? trkDef.c : '#fbbf24';
  if (cell) {
    if (L.tracks[track][step]) { cell.style.background = trkColor; cell.style.borderColor = trkColor; }
    else { cell.style.background = (step%4===0?'rgba(255,255,255,.10)':'rgba(255,255,255,.05)'); cell.style.borderColor = 'rgba(255,255,255,.1)'; }
  }
  if (L.tracks[track][step]) {
    kLoopPlayHit(trkDef || {id:track,kind:'drum',drum:track}, step);
  }
}
// Play a single hit for any track type (used by sequencer + manual toggle)
function kLoopPlayHit(trk, step, overrideNote){
  if (!trk) return;
  var L = window._kLoop;
  var cell = (L && L.tracks && L.tracks[trk.id]) ? L.tracks[trk.id][step] : 1;
  if (trk.kind === 'drum') {
    kPlayDrumPad(trk.drum, 60, 'sine');
  } else if (trk.kind === 'perc') {
    kPlayPercPad(trk.perc);
  } else if (trk.kind === 'bass') {
    // If the cell stores a chosen note (from live play), use that. Otherwise
    // walk the default afrobeat bass riff so existing patterns still sound right.
    var bNote = overrideNote || (typeof cell === 'string' ? cell : null);
    if (bNote) {
      var bf = kLoopFreqOf(bNote) || 65.41;
      kPlayNote('bass', bNote, bf, 'sawtooth', 0.45, 0.3);
    } else {
      var bi = step % K_LOOP_BASS_NOTES.length;
      kPlayNote('bass', K_LOOP_BASS_NOTES[bi], K_LOOP_BASS_F[bi], 'sawtooth', 0.45, 0.3);
    }
  } else if (trk.kind === 'mel') {
    var oscType = trk.mel === 'violin' ? 'sawtooth' : (trk.mel === 'guitar' ? 'sawtooth' : 'triangle');
    var mNote = overrideNote || (typeof cell === 'string' ? cell : null);
    if (mNote) {
      var mf = kLoopFreqOf(mNote) || 261.63;
      kPlayNote(trk.mel, mNote, mf, oscType, 0.45, 0.22);
    } else {
      var mi = step % K_LOOP_MEL_NOTES.length;
      kPlayNote(trk.mel, K_LOOP_MEL_NOTES[mi], K_LOOP_MEL_F[mi], oscType, 0.45, 0.22);
    }
  }
}

// ─────── Live Play helpers ───────
// Build one big lookup: note name → frequency (for any pitched instrument).
window._kLoopFreqMap = (function(){
  var m = {};
  K_PIANO_KEYS.forEach(function(k){ m[k.n]=k.f; });
  K_PIANO_BLACKS.forEach(function(k){ m[k.n]=k.f; });
  K_VIOLIN_NOTES.forEach(function(k){ m[k.n]=k.f; });
  K_GUITAR_STRINGS.forEach(function(k){ m[k.n]=k.f; });
  K_BASS_STRINGS.forEach(function(k){ m[k.n]=k.f; });
  for (var i=0;i<K_LOOP_BASS_NOTES.length;i++) m[K_LOOP_BASS_NOTES[i]] = K_LOOP_BASS_F[i];
  for (var j=0;j<K_LOOP_MEL_NOTES.length;j++)  m[K_LOOP_MEL_NOTES[j]]  = K_LOOP_MEL_F[j];
  return m;
})();
function kLoopFreqOf(note){ return window._kLoopFreqMap[note] || null; }

// Returns the keymap rows for the currently-selected live-play instrument.
function kLoopLiveKeysFor(trackId){
  var trk = kLoopTrackById(trackId); if (!trk) return [];
  if (trk.kind === 'drum') return K_DRUM_PADS.map(function(p){ return { key:p.key, label:p.n, kind:'drum', drum:p.k }; });
  if (trk.kind === 'perc') return K_PERC_PADS.map(function(p){ return { key:p.key, label:p.n, kind:'perc', perc:p.k }; });
  if (trk.kind === 'bass') return K_BASS_STRINGS.map(function(p){ return { key:p.key, label:p.n, kind:'bass', note:p.n, freq:p.f }; });
  if (trk.kind === 'mel'){
    if (trk.mel === 'violin') return K_VIOLIN_NOTES.map(function(p){ return { key:p.key, label:p.n, kind:'mel', mel:trk.mel, note:p.n, freq:p.f }; });
    if (trk.mel === 'guitar') return K_GUITAR_STRINGS.map(function(p){ return { key:p.key, label:p.n, kind:'mel', mel:trk.mel, note:p.n, freq:p.f }; });
    // Piano (and default) — combine white + black keys
    var rows = K_PIANO_KEYS.map(function(p){ return { key:p.key, label:p.n, kind:'mel', mel:trk.mel, note:p.n, freq:p.f }; });
    K_PIANO_BLACKS.forEach(function(p){ rows.push({ key:p.key, label:p.n+' ♯', kind:'mel', mel:trk.mel, note:p.n, freq:p.f }); });
    return rows;
  }
  return [];
}

function kLoopSetLiveTrack(id){
  var L = window._kLoop;
  L.liveTrack = id || null;
  // Auto-enable that track in the loop so it's audible / has a row to record into
  if (id && !L.enabled[id]) { L.enabled[id] = true; if (!L.tracks[id] || L.tracks[id].length !== L.steps) L.tracks[id] = kLoopMakeRow(L.steps); }
  if (window._kInstrument === 'loop') kInstrumentRender();
}
function kLoopToggleRecord(){
  var L = window._kLoop;
  L.liveRec = !L.liveRec;
  if (window._kInstrument === 'loop') kInstrumentRender();
}
function kLoopLivePlay(entry){
  if (!entry) return;
  var L = window._kLoop;
  // Always sound the note
  if (entry.kind === 'drum') kPlayDrumPad(entry.drum, 60, 'sine');
  else if (entry.kind === 'perc') kPlayPercPad(entry.perc);
  else if (entry.kind === 'bass') kPlayNote('bass', entry.note, entry.freq, 'sawtooth', 0.45, 0.3);
  else if (entry.kind === 'mel') {
    var oscType = entry.mel === 'violin' ? 'sawtooth' : (entry.mel === 'guitar' ? 'sawtooth' : 'triangle');
    kPlayNote(entry.mel, entry.note, entry.freq, oscType, 0.45, 0.22);
  }
  // If recording AND looper is playing, stamp the hit on the current step
  if (L.liveRec && L.playing && L.liveTrack) {
    var step = (L.idx - 1 + L.steps) % L.steps; // last triggered step
    if (!L.tracks[L.liveTrack]) L.tracks[L.liveTrack] = kLoopMakeRow(L.steps);
    // Drums/perc just get a "1"; pitched tracks store the chosen note string
    L.tracks[L.liveTrack][step] = (entry.kind==='drum'||entry.kind==='perc') ? 1 : entry.note;
    var cell = document.getElementById('kLoopCell_'+L.liveTrack+'_'+step);
    var col = (kLoopTrackById(L.liveTrack)||{}).c || '#fbbf24';
    if (cell) { cell.style.background = col; cell.style.borderColor = col; }
  }
}
function kLoopBpm(v){ window._kLoop.bpm = parseInt(v,10); var el=document.getElementById('kLoopBpmVal'); if(el) el.textContent=v; if(window._kLoop.playing){ kLoopStop(); kLoopStart(); } kLoopUpdateLength(); }
function kLoopSwing(v){ window._kLoop.swing = parseInt(v,10); var el=document.getElementById('kLoopSwingVal'); if(el) el.textContent=v+'%'; }
function kLoopMaster(v){ window._kLoop.master = parseInt(v,10)/100; var el=document.getElementById('kLoopVolVal'); if(el) el.textContent=v+'%'; if (window.Tone && window.Tone.Destination) { try { Tone.Destination.volume.value = (window._kLoop.master<=0.001 ? -60 : 20*Math.log10(window._kLoop.master)); } catch(e){} } }
function kLoopMute(t){ window._kLoop.mute[t] = !window._kLoop.mute[t]; if (window._kInstrument === 'loop') kInstrumentRender(); }
function kLoopSolo(t){ window._kLoop.solo[t] = !window._kLoop.solo[t]; if (window._kInstrument === 'loop') kInstrumentRender(); }
function kLoopUpdateLength(){
  // Update displayed length pill
  if (window._kInstrument === 'loop') {
    var lab = document.querySelector('#kGameBody div[style*="⏱"]');
    // simple re-render keeps it in sync
    kInstrumentRender();
  }
}
function kLoopClear(){
  var L = window._kLoop;
  L.tracks = kLoopDefault(L.steps);
  // Empty out everything (don't seed default beat after manual clear)
  Object.keys(L.tracks).forEach(function(t){ for(var i=0;i<L.steps;i++) L.tracks[t][i]=0; });
  if (window._kInstrument === 'loop') kInstrumentRender();
}
function kLoopToggle(){ if (window._kLoop.playing) kLoopStop(); else kLoopStart(); kInstrumentRender(); }
function kLoopAnyAudible(track){
  var L = window._kLoop;
  var soloOn = false;
  Object.keys(L.solo).forEach(function(k){ if (L.solo[k]) soloOn = true; });
  if (soloOn) return L.solo[track];
  return !L.mute[track];
}
function kLoopStart(){
  var L = window._kLoop;
  if (window.Tone && window.Tone.context && window.Tone.context.state !== 'running') Tone.start().catch(function(){});
  L.playing = true; L.idx = 0;
  // Step duration depends on grid: 16th-note grid → /4, 8th-note grid → /2
  var stepDiv = (L.stepsPerBar || 16) / 4;
  var stepMs = 60000 / L.bpm / stepDiv;
  var swingDelay = stepMs * (L.swing/100) * 0.5;
  L.timer = setInterval(function(){
    var i = L.idx;
    // Visual playhead — only highlight current
    for (var s=0;s<L.steps;s++){
      var head = document.getElementById('kLoopHead'+s);
      if (head) {
        if (s===i){ head.style.background='#fbbf24'; head.style.color='#0f172a'; }
        else { head.style.background='transparent'; head.style.color=(s%4===0?'#fbbf24':'rgba(255,255,255,.4)'); }
      }
    }
    var fire = function(){
      kLoopActiveTracks().forEach(function(trk){
        var arr = L.tracks[trk.id]; if (!arr) return;
        if (arr[i] && kLoopAnyAudible(trk.id)) kLoopPlayHit(trk, i);
      });
    };
    // Apply swing on odd 8ths
    if (swingDelay > 0 && (i % 2 === 1)) setTimeout(fire, swingDelay); else fire();
    L.idx = (i + 1) % L.steps;
    // Repeat handling
    if (L.idx === 0 && L.repeat > 0) {
      L.repeat--;
      if (L.repeat <= 0) { kLoopStop(); kInstrumentRender(); }
    }
  }, stepMs);
}
function kLoopStop(){
  var L = window._kLoop;
  L.playing = false;
  if (L.timer) { clearInterval(L.timer); L.timer = null; }
  for (var s=0;s<L.steps;s++){
    var head = document.getElementById('kLoopHead'+s);
    if (head) { head.style.background='transparent'; head.style.color=(s%4===0?'#fbbf24':'rgba(255,255,255,.4)'); }
  }
}
function kLoopAttachKeys(){
  if (window._kKeyHandler) document.removeEventListener('keydown', window._kKeyHandler);
  window._kKeyHandler = function(ev){
    if (ev.repeat) return;
    var ov = document.getElementById('kGameOverlay');
    if (!ov || ov.style.display === 'none') return;
    var key = (ev.key||'').toLowerCase();
    // Don't hijack typing inside any text field
    var t = ev.target;
    if (t && (t.tagName==='INPUT' || t.tagName==='TEXTAREA' || t.isContentEditable)) return;
    // Space = play/stop
    if (key === ' ' || ev.code === 'Space') { ev.preventDefault(); kLoopToggle(); return; }
    // R = toggle live record
    if (key === 'r') { ev.preventDefault(); kLoopToggleRecord(); return; }
    // Live note keys for the currently-selected live-play instrument
    var L = window._kLoop;
    if (!L.liveTrack) return;
    var rows = kLoopLiveKeysFor(L.liveTrack);
    for (var i=0;i<rows.length;i++){
      if (rows[i].key === key) {
        ev.preventDefault();
        kLoopLivePlay(rows[i]);
        // brief visual flash on the matching key
        var btn = document.getElementById('kLiveKey_'+i);
        if (btn){
          var prev = btn.style.background;
          btn.style.background = (kLoopTrackById(L.liveTrack)||{}).c || '#fbbf24';
          btn.style.color = '#0f172a';
          setTimeout(function(){ btn.style.background = prev; btn.style.color=''; }, 110);
        }
        return;
      }
    }
  };
  document.addEventListener('keydown', window._kKeyHandler);
}

// ─────── Save / Load patterns (localStorage + JSON file) ───────
function kLoopSerialize(){
  var L = window._kLoop;
  return { v:2, bars:L.bars, steps:L.steps, bpm:L.bpm, swing:L.swing, master:L.master, enabled:L.enabled, tracks:L.tracks };
}
function kLoopApply(obj){
  if (!obj || !obj.tracks) return false;
  var L = window._kLoop;
  L.bars = obj.bars || 1; L.steps = obj.steps || (L.bars*8);
  L.bpm  = obj.bpm  || 100; L.swing = obj.swing||0; L.master = obj.master||0.85;
  K_LOOP_ALL_TRACKS.forEach(function(tr){
    var t = tr.id;
    L.tracks[t] = (obj.tracks[t] && obj.tracks[t].length===L.steps) ? obj.tracks[t].slice() : kLoopMakeRow(L.steps);
    // Auto-enable any track that has hits in the saved file
    if (obj.tracks[t] && obj.tracks[t].some(function(v){return v;})) L.enabled[t] = true;
  });
  if (obj.enabled) {
    Object.keys(obj.enabled).forEach(function(k){ L.enabled[k] = !!obj.enabled[k]; });
  }
  if (window._kInstrument === 'loop') kInstrumentRender();
  return true;
}
function kLoopSavePattern(){
  try {
    var name = (prompt('Name your pattern:', 'My Beat') || '').trim();
    if (!name) return;
    var all = JSON.parse(localStorage.getItem('kLoopPatterns')||'{}');
    all[name] = kLoopSerialize();
    localStorage.setItem('kLoopPatterns', JSON.stringify(all));
    alert('Saved "'+name+'" 🎉');
  } catch(e){ alert('Could not save.'); }
}
function kLoopLoadPattern(){
  try {
    var all = JSON.parse(localStorage.getItem('kLoopPatterns')||'{}');
    var names = Object.keys(all);
    if (!names.length) return alert('No saved patterns yet.');
    var pick = prompt('Saved patterns:\n• '+names.join('\n• ')+'\n\nType the name to load:');
    if (!pick) return;
    if (!all[pick]) return alert('Not found.');
    kLoopApply(all[pick]);
  } catch(e){ alert('Could not load.'); }
}
function kLoopExportJSON(){
  var data = JSON.stringify(kLoopSerialize(), null, 2);
  var blob = new Blob([data], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a'); a.href = url; a.download = 'my-loop.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
}
function kLoopImportJSON(ev){
  var f = ev.target.files && ev.target.files[0]; if (!f) return;
  var rdr = new FileReader();
  rdr.onload = function(){
    try { kLoopApply(JSON.parse(rdr.result)); alert('Loaded! 🎶'); }
    catch(e){ alert('Invalid pattern file.'); }
  };
  rdr.readAsText(f);
  ev.target.value = '';
}

// ─────── Audio recording (MediaRecorder via Tone.Destination) ───────
function kLoopRecToggle(){
  var L = window._kLoop;
  if (!L.rec.active) kLoopRecStart(); else kLoopRecStop();
  kInstrumentRender();
}
function kLoopRecStart(){
  var L = window._kLoop;
  if (!window.Tone) { alert('Audio engine still loading… try again in a sec.'); return; }
  try {
    if (Tone.context.state !== 'running') Tone.start();
    var ctx = Tone.context.rawContext || Tone.context;
    var dest = ctx.createMediaStreamDestination();
    Tone.Destination.connect(dest);
    var mr = new MediaRecorder(dest.stream);
    L.rec.chunks = [];
    mr.ondataavailable = function(e){ if (e.data && e.data.size) L.rec.chunks.push(e.data); };
    mr.onstop = function(){
      try { Tone.Destination.disconnect(dest); } catch(e){}
      var blob = new Blob(L.rec.chunks, { type: 'audio/webm' });
      var url = URL.createObjectURL(blob);
      L.rec.blobUrl = url;
      var a = document.createElement('a'); a.href = url; a.download = 'my-loop.webm';
      document.body.appendChild(a); a.click(); a.remove();
      var lab = document.getElementById('kLoopRecLabel'); if (lab) lab.textContent = '✅ Saved my-loop.webm';
    };
    mr.start();
    L.rec.mr = mr; L.rec.dest = dest; L.rec.active = true; L.rec.startedAt = Date.now();
    if (!L.playing) kLoopStart();
    var lab2 = document.getElementById('kLoopRecLabel'); if (lab2) lab2.textContent = '🔴 Recording…';
  } catch(e){ console.error(e); alert('Recording not supported on this browser.'); }
}
function kLoopRecStop(){
  var L = window._kLoop;
  if (L.rec.mr && L.rec.mr.state !== 'inactive') L.rec.mr.stop();
  L.rec.active = false;
}

// ═════════════ 🎓 MUSIC SCHOOL — instrument selector + lessons ═════════════
window._kMusic = window._kMusic || { picked: null, step: 0, stars: 0 };

var K_MUSIC_LESSONS = {
  piano: [
    { title:'Meet the Piano', teacher:"This is a piano! White keys play notes C, D, E, F, G, A, B. Press a key to hear it.", action:'tap', target:'C4' },
    { title:'Play "Mary Had a Little Lamb"', teacher:'Try this: E D C D E E E. Tap each key in order!', action:'sequence', notes:['E4','D4','C4','D4','E4','E4','E4'] },
    { title:'Free Play', teacher:"Great job! Now play any tune you like.", action:'free' }
  ],
  guitar: [
    { title:'Meet the Guitar', teacher:'Guitars have 6 strings. The thickest is the lowest sound. Tap each string!', action:'tap-any' },
    { title:'Pluck a chord!', teacher:'Tap strings 4, 3, 2, 1 quickly to play a chord.', action:'sequence', drumKeys:['4','3','2','1'] },
    { title:'Free Play', teacher:'Awesome! Try strumming a song.', action:'free' }
  ],
  drums: [
    { title:'Meet the Drums', teacher:'Press the Kick (1) and Snare (2). Make a beat!', action:'tap-any' },
    { title:'Boom-Bap Beat', teacher:'Try: Kick, Snare, Kick, Snare. (Press 1, 2, 1, 2)', action:'sequence', drumKeys:['1','2','1','2'] },
    { title:'Free Play', teacher:'Now make your own beat!', action:'free' }
  ],
  violin: [
    { title:'Meet the Violin', teacher:'The violin is bowed. Tap the notes to hear them sing.', action:'tap-any' },
    { title:'Play a Scale', teacher:'Play G A B C D E F G in order.', action:'sequence', notes:['G3','A3','B3','C4','D4','E4','F4','G4'] },
    { title:'Free Play', teacher:'Beautiful! Play your own melody.', action:'free' }
  ]
};

function kPlayMusicSchool(){
  kOpenGame('🎓 Music School', 'Pick an instrument and learn step by step');
  window._kMusic = { picked: window._kMusic.picked || null, step: 0, stars: window._kMusic.stars || 0 };
  kMusicRender();
}
function kMusicPick(name){
  window._kMusic.picked = name; window._kMusic.step = 0;
  kMusicRender();
}
function kMusicNext(){
  var m = window._kMusic;
  var lessons = K_MUSIC_LESSONS[m.picked] || [];
  if (m.step < lessons.length-1) { m.step++; kAwardStars(1); m.stars++; }
  else { kAwardStars(2); m.stars+=2; alert('🏆 You finished '+m.picked+' lessons!'); m.picked = null; m.step = 0; }
  kMusicRender();
}
function kMusicBack(){
  window._kMusic.picked = null; window._kMusic.step = 0;
  kMusicRender();
}
function kMusicOpenInstrument(){
  // Jump straight into the chosen instrument inside the Instruments overlay
  var picked = window._kMusic.picked || 'piano';
  window._kInstrument = picked;
  kCloseGame();
  setTimeout(function(){ kPlayInstrument(); window._kInstrument = picked; kInstrumentRender(); }, 60);
}
function kMusicRender(){
  var body = document.getElementById('kGameBody');
  var m = window._kMusic;
  var html = '';

  if (!m.picked) {
    html += '<div style="background:linear-gradient(135deg,#7c3aed,#5b21b6);border-radius:20px;padding:20px;margin-bottom:18px;color:#fff;text-align:center;">';
    html += '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-weight:900;font-size:1.3rem;margin-bottom:6px;">🎼 Choose your instrument!</div>';
    html += '<div style="font-size:.92rem;opacity:.9;">Tap one to start your music lesson.</div>';
    html += '</div>';
    var picks = [
      {id:'piano',  name:'Piano',  emoji:'🎹', col:'#2563eb', desc:'Big and gentle'},
      {id:'guitar', name:'Guitar', emoji:'🎸', col:'#b45309', desc:'Strum the strings'},
      {id:'drums',  name:'Drums',  emoji:'🥁', col:'#7c3aed', desc:'Make a beat'},
      {id:'violin', name:'Violin', emoji:'🎻', col:'#dc2626', desc:'Bow a song'}
    ];
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">';
    picks.forEach(function(p){
      html += '<button onclick="kMusicPick(\''+p.id+'\')" style="background:linear-gradient(135deg,'+p.col+',rgba(0,0,0,.25));border:none;border-radius:18px;padding:18px 12px;cursor:pointer;color:#fff;text-align:center;font-family:inherit;">';
      html += '<div style="font-size:2.6rem;margin-bottom:6px;">'+p.emoji+'</div>';
      html += '<div style="font-family:\'Bricolage Grotesque\',sans-serif;font-weight:900;font-size:1.1rem;">'+p.name+'</div>';
      html += '<div style="font-size:.78rem;opacity:.85;margin-top:2px;">'+p.desc+'</div>';
      html += '</button>';
    });
    html += '</div>';
    body.innerHTML = html;
    return;
  }

  var lessons = K_MUSIC_LESSONS[m.picked] || [];
  var lesson = lessons[m.step] || lessons[0];
  // Progress bar
  html += '<div style="display:flex;gap:4px;margin-bottom:14px;">';
  for (var i=0;i<lessons.length;i++){
    var bg = i<m.step ? '#10b981' : (i===m.step ? '#fbbf24' : 'rgba(255,255,255,.1)');
    html += '<div style="flex:1;height:6px;background:'+bg+';border-radius:100px;"></div>';
  }
  html += '</div>';
  // Teacher card
  html += '<div style="background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:20px;padding:18px 20px;margin-bottom:16px;display:flex;gap:12px;align-items:flex-start;color:#fff;">';
  html += '<div style="font-size:2rem;flex-shrink:0;">👩‍🏫</div>';
  html += '<div><div style="font-family:\'Bricolage Grotesque\',sans-serif;font-weight:900;font-size:1.05rem;margin-bottom:4px;">'+lesson.title+'</div>';
  html += '<div style="opacity:.92;font-size:.9rem;line-height:1.5;">'+lesson.teacher+'</div></div></div>';

  // Hint of the keys to press
  if (lesson.action === 'sequence') {
    var seq = (lesson.notes || lesson.drumKeys || []).join(' → ');
    html += '<div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);border-radius:14px;padding:12px;margin-bottom:14px;text-align:center;font-weight:900;color:#fbbf24;font-family:Bricolage Grotesque,sans-serif;font-size:1.1rem;">'+seq+'</div>';
  }

  html += '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">';
  html += '<button onclick="kMusicOpenInstrument()" style="background:linear-gradient(135deg,#10b981,#34d399);color:#fff;border:none;padding:12px 22px;border-radius:100px;font-weight:900;cursor:pointer;font-family:inherit;">🎵 Open '+m.picked+'</button>';
  html += '<button onclick="kMusicNext()" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0a1628;border:none;padding:12px 22px;border-radius:100px;font-weight:900;cursor:pointer;font-family:inherit;">'+(m.step<lessons.length-1?'Next →':'Finish 🏆')+'</button>';
  html += '<button onclick="kMusicBack()" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);padding:12px 18px;border-radius:100px;font-weight:700;cursor:pointer;font-family:inherit;">← Pick another</button>';
  html += '</div>';

  body.innerHTML = html;

  if (lesson.teacher && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(lesson.teacher);
    u.rate = 0.95; u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  }
}

function kPlayChess(){
  kOpenGame('♟️ Chess Teacher', 'Learn chess step by step');
  window._kChess = { lesson: 0, stars: 0, mode: 'lesson' };
  kChessRender();
}

function kChessRender(){
  var c = window._kChess;
  if (c.mode === 'practice') {
    kChessPracticeRender();
    return;
  }
  var lesson = CHESS_LESSONS[c.lesson];
  var body = document.getElementById('kGameBody');

  var html = '<div style="display:flex;gap:4px;margin-bottom:16px;">';
  for (var i = 0; i < CHESS_LESSONS.length; i++) {
    var bg = i < c.lesson ? '#10b981' : (i === c.lesson ? '#fbbf24' : 'rgba(255,255,255,.1)');
    html += '<div style="flex:1;height:6px;background:' + bg + ';border-radius:100px;"></div>';
  }
  html += '</div>';

  html += '<div style="background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:20px;padding:20px 22px;margin-bottom:20px;display:flex;gap:14px;align-items:flex-start;">';
  html += '<div style="font-size:2.2rem;flex-shrink:0;">👩‍🏫</div>';
  html += '<div><div style="font-family:\'Bricolage Grotesque\',sans-serif;font-weight:900;color:#fff;font-size:1.05rem;margin-bottom:4px;">' + lesson.title + '</div>';
  html += '<div style="color:rgba(255,255,255,.92);font-size:.92rem;line-height:1.55;">' + lesson.teacher + '</div></div></div>';

  html += '<div id="kChessBoard" style="background:#0a1628;border-radius:16px;padding:10px;margin-bottom:16px;">';
  html += kChessBoardHTML(lesson.board, lesson.highlight);
  html += '</div>';

  if (lesson.question) {
    html += '<div style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25);border-radius:16px;padding:18px;margin-bottom:16px;">';
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">';
    for (var qi = 0; qi < lesson.question.options.length; qi++) {
      html += '<button onclick="kChessAnswer(' + qi + ')" style="background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);color:#fff;padding:14px;border-radius:12px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:1rem;font-weight:800;cursor:pointer;">' + lesson.question.options[qi] + '</button>';
    }
    html += '</div></div>';
  }

  html += '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">';
  if (c.lesson > 0) html += '<button onclick="kChessPrev()" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);padding:12px 22px;border-radius:100px;font-weight:700;cursor:pointer;">← Back</button>';
  if (lesson.showButtons.indexOf('next') !== -1) html += '<button onclick="kChessNext()" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0a1628;border:none;padding:12px 26px;border-radius:100px;font-weight:800;cursor:pointer;">Next →</button>';
  if (lesson.showButtons.indexOf('practice') !== -1) html += '<button onclick="kChessStartPractice()" style="background:linear-gradient(135deg,#10b981,#34d399);color:#fff;border:none;padding:12px 26px;border-radius:100px;font-weight:800;cursor:pointer;">Play Chess Now!</button>';
  if (lesson.showButtons.indexOf('restart') !== -1) html += '<button onclick="window._kChess.lesson=0;kChessRender()" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);padding:12px 22px;border-radius:100px;font-weight:700;cursor:pointer;">🔄 Restart</button>';
  html += '</div>';

  body.innerHTML = html;

  if (lesson.teacher && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(lesson.teacher);
    u.rate = 0.9; u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  }
}

function kChessBoardHTML(type, highlights){
  var files = ['a','b','c','d','e','f','g','h'];
  var board = {};
  if (type === 'start') {
    var back = ['R','N','B','Q','K','B','N','R'];
    for (var i = 0; i < 8; i++) {
      board[files[i] + '1'] = { p: back[i], c: 'w' };
      board[files[i] + '2'] = { p: 'P', c: 'w' };
      board[files[i] + '7'] = { p: 'P', c: 'b' };
      board[files[i] + '8'] = { p: back[i], c: 'b' };
    }
  } else if (type === 'king-demo') board['d4'] = { p: 'K', c: 'w' };
  else if (type === 'queen-demo') board['d4'] = { p: 'Q', c: 'w' };
  else if (type === 'rook-demo') board['d4'] = { p: 'R', c: 'w' };
  else if (type === 'bishop-demo') board['d4'] = { p: 'B', c: 'w' };
  else if (type === 'knight-demo') board['d4'] = { p: 'N', c: 'w' };
  else if (type === 'pawn-demo') board['d2'] = { p: 'P', c: 'w' };
  else if (type === 'checkmate-demo') {
    board['e1'] = { p: 'K', c: 'w' };
    board['e8'] = { p: 'R', c: 'b' };
    board['d8'] = { p: 'K', c: 'b' };
  }

  var html = '<div style="display:grid;grid-template-columns:20px repeat(8,1fr);gap:0;max-width:400px;margin:0 auto;">';
  for (var r = 8; r >= 1; r--) {
    html += '<div style="color:rgba(255,255,255,.4);font-size:.65rem;display:flex;align-items:center;justify-content:center;">' + r + '</div>';
    for (var f = 0; f < 8; f++) {
      var sq = files[f] + r;
      var light = (f + r) % 2 === 1;
      var isHighlight = highlights && highlights.indexOf(sq) !== -1;
      var piece = board[sq];
      var bg = isHighlight ? (light ? '#fbbf24' : '#d97706') : (light ? '#f0d9b5' : '#b58863');
      var content = piece ? CHESS_PIECES[piece.p][piece.c] : '';
      var color = piece && piece.c === 'b' ? '#0a1628' : '#fff';
      var shadow = piece && piece.c === 'w' ? '0 1px 2px rgba(0,0,0,.4)' : 'none';
      html += '<div style="aspect-ratio:1;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:clamp(1.4rem,4.5vw,2.4rem);color:' + color + ';text-shadow:' + shadow + ';">' + content + '</div>';
    }
  }
  html += '<div></div>';
  for (var fi = 0; fi < files.length; fi++) {
    html += '<div style="color:rgba(255,255,255,.4);font-size:.65rem;text-align:center;padding-top:2px;">' + files[fi] + '</div>';
  }
  html += '</div>';
  return html;
}

function kChessNext(){
  var c = window._kChess;
  if (c.lesson < CHESS_LESSONS.length - 1) {
    c.lesson++;
    kChessRender();
  }
}

function kChessPrev(){
  var c = window._kChess;
  if (c.lesson > 0) {
    c.lesson--;
    kChessRender();
  }
}

function kChessAnswer(choice){
  var c = window._kChess;
  var lesson = CHESS_LESSONS[c.lesson];
  var correct = choice === lesson.question.correct;

  if (correct) {
    c.stars++;
    kAwardStars(1);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(lesson.question.correctSay);
      u.rate = 0.95; u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    }
    document.getElementById('kGameBody').insertAdjacentHTML('afterbegin',
      '<div style="background:linear-gradient(135deg,#10b981,#34d399);border-radius:16px;padding:18px;text-align:center;margin-bottom:12px;color:#fff;"><div style="font-size:2.2rem;">🎉</div><div style="font-family:\'Bricolage Grotesque\',sans-serif;font-weight:900;font-size:1.1rem;margin-top:4px;">Correct! +1 ⭐</div></div>');
    setTimeout(kChessNext, 2000);
  } else {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      var u2 = new SpeechSynthesisUtterance(lesson.question.wrongSay);
      u2.rate = 0.95; u2.pitch = 1.1;
      window.speechSynthesis.speak(u2);
    }
    document.getElementById('kGameBody').insertAdjacentHTML('afterbegin',
      '<div style="background:linear-gradient(135deg,#f59e0b,#dc2626);border-radius:16px;padding:18px;text-align:center;margin-bottom:12px;color:#fff;"><div style="font-size:2.2rem;">💭</div><div style="font-family:\'Bricolage Grotesque\',sans-serif;font-weight:900;font-size:1.05rem;margin-top:4px;">Try again!</div></div>');
  }
}

function kChessStartPractice(){
  window._kChess.mode = 'practice';
  window._kChessBoard = kChessInitBoard();
  window._kChessTurn = 'w';
  window._kChessSelected = null;
  kChessPracticeRender();
}

function kChessInitBoard(){
  var back = ['R','N','B','Q','K','B','N','R'];
  var files = ['a','b','c','d','e','f','g','h'];
  var board = {};
  for (var i = 0; i < 8; i++) {
    board[files[i] + '1'] = { p: back[i], c: 'w' };
    board[files[i] + '2'] = { p: 'P', c: 'w' };
    board[files[i] + '7'] = { p: 'P', c: 'b' };
    board[files[i] + '8'] = { p: back[i], c: 'b' };
  }
  return board;
}

function kChessPracticeRender(){
  var board = window._kChessBoard;
  var turn = window._kChessTurn;
  var selected = window._kChessSelected;
  var files = ['a','b','c','d','e','f','g','h'];
  var validMoves = selected ? kChessValidMoves(selected, board) : [];

  var turnBg = turn === 'w' ? '#fff' : '#0a1628';
  var turnName = turn === 'w' ? 'White' : 'Black';
  var html = '<div style="display:flex;justify-content:space-between;background:rgba(255,255,255,.05);padding:14px 18px;border-radius:16px;margin-bottom:16px;">';
  html += '<div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:' + turnBg + ';border:2px solid #fbbf24;"></div><div style="color:#fff;font-weight:800;">' + turnName + "'s turn</div></div>";
  html += '<button onclick="kChessStartPractice()" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);padding:8px 16px;border-radius:100px;font-size:.82rem;font-weight:700;cursor:pointer;">🔄 Reset</button></div>';

  html += '<div style="background:#0a1628;border-radius:16px;padding:10px;margin-bottom:16px;"><div style="display:grid;grid-template-columns:20px repeat(8,1fr);gap:0;max-width:440px;margin:0 auto;">';
  for (var r = 8; r >= 1; r--) {
    html += '<div style="color:rgba(255,255,255,.4);font-size:.65rem;display:flex;align-items:center;justify-content:center;">' + r + '</div>';
    for (var f = 0; f < 8; f++) {
      var sq = files[f] + r;
      var light = (f + r) % 2 === 1;
      var piece = board[sq];
      var isSelected = sq === selected;
      var isValid = validMoves.indexOf(sq) !== -1;
      var bg = isSelected ? '#3b82f6' : (isValid ? (light ? '#86efac' : '#22c55e') : (light ? '#f0d9b5' : '#b58863'));
      var content = piece ? CHESS_PIECES[piece.p][piece.c] : (isValid ? '•' : '');
      var textColor = piece ? (piece.c === 'b' ? '#0a1628' : '#fff') : '#0a1628';
      var shadow = piece && piece.c === 'w' ? '0 1px 2px rgba(0,0,0,.4)' : 'none';
      html += '<div onclick="kChessClickSquare(\'' + sq + '\')" style="aspect-ratio:1;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:clamp(1.5rem,5vw,2.6rem);color:' + textColor + ';cursor:pointer;text-shadow:' + shadow + ';transition:background .15s;">' + content + '</div>';
    }
  }
  html += '<div></div>';
  for (var fi = 0; fi < files.length; fi++) {
    html += '<div style="color:rgba(255,255,255,.4);font-size:.65rem;text-align:center;padding-top:2px;">' + files[fi] + '</div>';
  }
  html += '</div></div>';

  var hint = selected ? ('<strong style="color:#fbbf24;">Selected: ' + selected + '.</strong> Tap a green square to move, or tap the same piece to deselect.') : 'Click any of your pieces to see where they can move. Green squares show valid moves!';
  html += '<div style="background:rgba(255,255,255,.04);border-radius:16px;padding:16px;margin-bottom:16px;text-align:center;font-size:.85rem;color:rgba(255,255,255,.8);line-height:1.6;">' + hint + '</div>';
  html += '<div style="display:flex;gap:10px;justify-content:center;"><button onclick="window._kChess.mode=\'lesson\';kChessRender()" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);padding:12px 24px;border-radius:100px;font-weight:700;cursor:pointer;">← Back to Lessons</button></div>';

  document.getElementById('kGameBody').innerHTML = html;
}

function kChessClickSquare(sq){
  var board = window._kChessBoard;
  var turn = window._kChessTurn;
  var selected = window._kChessSelected;
  var piece = board[sq];

  if (selected) {
    if (sq === selected) {
      window._kChessSelected = null;
      kChessPracticeRender();
      return;
    }
    var validMoves = kChessValidMoves(selected, board);
    if (validMoves.indexOf(sq) !== -1) {
      board[sq] = board[selected];
      delete board[selected];
      var rank = parseInt(sq[1]);
      if (board[sq].p === 'P' && (rank === 8 || rank === 1)) board[sq].p = 'Q';
      window._kChessSelected = null;
      window._kChessTurn = turn === 'w' ? 'b' : 'w';
      if (window.speechSynthesis) {
        var u = new SpeechSynthesisUtterance('Good move!');
        u.rate = 1.1; u.pitch = 1.2;
        window.speechSynthesis.speak(u);
      }
      kChessPracticeRender();
    } else if (piece && piece.c === turn) {
      window._kChessSelected = sq;
      kChessPracticeRender();
    }
  } else {
    if (piece && piece.c === turn) {
      window._kChessSelected = sq;
      kChessPracticeRender();
    }
  }
}

function kChessValidMoves(sq, board){
  var piece = board[sq];
  if (!piece) return [];
  var files = ['a','b','c','d','e','f','g','h'];
  var f = files.indexOf(sq[0]);
  var r = parseInt(sq[1]);
  var moves = [];

  function tryMove(ff, rr) {
    if (ff < 0 || ff > 7 || rr < 1 || rr > 8) return 'out';
    var target = files[ff] + rr;
    var p = board[target];
    if (!p) { moves.push(target); return 'empty'; }
    if (p.c !== piece.c) { moves.push(target); return 'capture'; }
    return 'block';
  }

  function slide(df, dr) {
    var ff = f + df, rr = r + dr;
    while (ff >= 0 && ff <= 7 && rr >= 1 && rr <= 8) {
      var res = tryMove(ff, rr);
      if (res === 'block' || res === 'capture') break;
      ff += df; rr += dr;
    }
  }

  switch (piece.p) {
    case 'K':
      for (var df = -1; df <= 1; df++) {
        for (var dr = -1; dr <= 1; dr++) {
          if (df === 0 && dr === 0) continue;
          tryMove(f + df, r + dr);
        }
      }
      break;
    case 'Q':
      slide(1,0); slide(-1,0); slide(0,1); slide(0,-1);
      slide(1,1); slide(1,-1); slide(-1,1); slide(-1,-1);
      break;
    case 'R':
      slide(1,0); slide(-1,0); slide(0,1); slide(0,-1);
      break;
    case 'B':
      slide(1,1); slide(1,-1); slide(-1,1); slide(-1,-1);
      break;
    case 'N':
      var kn = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
      for (var ki = 0; ki < kn.length; ki++) tryMove(f + kn[ki][0], r + kn[ki][1]);
      break;
    case 'P':
      var dir = piece.c === 'w' ? 1 : -1;
      var start = piece.c === 'w' ? 2 : 7;
      if (!board[files[f] + (r+dir)]) {
        moves.push(files[f] + (r+dir));
        if (r === start && !board[files[f] + (r+2*dir)]) moves.push(files[f] + (r+2*dir));
      }
      var caps = [-1, 1];
      for (var ci = 0; ci < caps.length; ci++) {
        var tf = f + caps[ci], tr = r + dir;
        if (tf >= 0 && tf <= 7 && tr >= 1 && tr <= 8) {
          var t = board[files[tf] + tr];
          if (t && t.c !== piece.c) moves.push(files[tf] + tr);
        }
      }
      break;
  }
  return moves;
}
