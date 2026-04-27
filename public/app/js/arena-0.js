/* ════════════════════════════════════════════════════════════════
   LIVE COMPETITION ARENA — multi-game, class-grouped, room-based
   - Class groups: Kids · Juniors (JSS) · Seniors (SS) · WAEC/JAMB Prep
   - Scope: Local · State · Nationwide
   - Games: Quiz Duel, Math Race, Spelling Bee, Memory Match (kids),
            Geography Sprint, Word Builder
   - Leaderboard: weekly + all-time, scoped + class-grouped
   - Firebase-ready: all reads/writes go through ArenaDB.* — swap
     localStorage adapter for Firestore later without touching UI.
   ════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ───────────── 0. DATA MODEL (Firebase-ready) ───────────── */
/*
  Collections (when wired to Firestore):
    arena_profiles  : { uid, name, avatar, classGroup, state, school, xp, wins, losses, createdAt }
    arena_rooms     : { id, classGroup, scope, state?, gameId, hostUid, status, players[], maxPlayers, createdAt, startsAt, prize }
    arena_matches   : { id, roomId, classGroup, scope, gameId, players[], scores{}, winnerUid, finishedAt }
    arena_leaders   : { uid, classGroup, scope, weekKey, xp, wins, name } (denormalised for fast reads)
*/

var LS = {
  PROFILE : 'arena.profile',
  HISTORY : 'arena.history',
  LEADERS : 'arena.leaders'
};

function rid(){ return 'a' + Math.random().toString(36).slice(2,9); }
function nowMs(){ return Date.now(); }
function weekKey(d){ d = d || new Date(); var t = new Date(d.valueOf()); t.setHours(0,0,0,0); var day = (t.getDay()+6)%7; t.setDate(t.getDate()-day); return t.toISOString().slice(0,10); }

var ArenaDB = {
  loadProfile: function(){
    try { return JSON.parse(localStorage.getItem(LS.PROFILE) || 'null'); } catch(e){ return null; }
  },
  saveProfile: function(p){
    try { localStorage.setItem(LS.PROFILE, JSON.stringify(p)); } catch(e){}
  },
  loadLeaders: function(){
    try { return JSON.parse(localStorage.getItem(LS.LEADERS) || '[]'); } catch(e){ return []; }
  },
  saveLeaders: function(arr){
    try { localStorage.setItem(LS.LEADERS, JSON.stringify(arr.slice(0, 500))); } catch(e){}
  },
  recordMatch: function(match){
    var leaders = ArenaDB.loadLeaders();
    var wk = weekKey();
    function bump(uid, name, classGroup, scope, xp, won){
      var key = uid + '|' + classGroup + '|' + scope + '|' + wk;
      var row = leaders.find(function(r){ return r.key === key; });
      if (!row){ row = { key:key, uid:uid, name:name, classGroup:classGroup, scope:scope, weekKey:wk, xp:0, wins:0, plays:0 }; leaders.push(row); }
      row.xp += xp; row.plays += 1; if (won) row.wins += 1; row.name = name;
    }
    match.players.forEach(function(p){
      bump(p.uid, p.name, match.classGroup, match.scope, p.xp, p.uid === match.winnerUid);
    });
    ArenaDB.saveLeaders(leaders);
  },
  topLeaders: function(classGroup, scope, limit){
    var wk = weekKey();
    var rows = ArenaDB.loadLeaders().filter(function(r){
      return r.weekKey === wk && r.classGroup === classGroup && (scope === 'all' || r.scope === scope);
    });
    rows.sort(function(a,b){ return b.xp - a.xp || b.wins - a.wins; });
    return rows.slice(0, limit || 25);
  }
};

/* ───────────── 1. CLASS GROUPS & SCOPES ───────────── */
var CLASS_GROUPS = [
  { id:'kids',    name:'Kids',          sub:'Pre-Primary · Primary 1–6', emoji:'🧒', accent:'#f59e0b' },
  { id:'juniors', name:'Juniors',       sub:'JSS 1–3',                   emoji:'🎒', accent:'#3b82f6' },
  { id:'seniors', name:'Seniors',       sub:'SS 1–3',                    emoji:'🎓', accent:'#10b981' },
  { id:'prep',    name:'Exam Prep',     sub:'WAEC · NECO · JAMB',        emoji:'🏆', accent:'#a855f7' }
];

var SCOPES = [
  { id:'local',      name:'Local',      sub:'Your school / area',      emoji:'🏘️' },
  { id:'state',      name:'State',      sub:'Across your state',        emoji:'🗺️' },
  { id:'nationwide', name:'Nationwide', sub:'All Nigeria',              emoji:'🇳🇬' }
];

var FORMATS = [
  { id:'1v1',     name:'1 vs 1',         sub:'Head-to-head duel',          emoji:'⚔️', size:2,  team:1 },
  { id:'squad',   name:'Squad (3v3)',    sub:'Small team battle',          emoji:'🛡️', size:6,  team:3 },
  { id:'team',    name:'Team vs Team',   sub:'5 vs 5 class showdown',      emoji:'🤝', size:10, team:5 },
  { id:'school',  name:'School vs School', sub:'Represent your school',    emoji:'🏫', size:20, team:10 },
  { id:'ffa',     name:'Free-for-All',   sub:'Up to 8 players, last one standing', emoji:'🎯', size:8,  team:1 }
];

var STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];

/* ───────────── 2. GAME REGISTRY ───────────── */
/* Each game declares which class groups it supports.
   `play(ctx)` returns a Promise resolving to { score, correct, total }. */

var GAMES = [
  {
    id:'quiz-duel', name:'Quiz Duel', emoji:'⚔️',
    desc:'Head-to-head trivia. Fastest correct answer wins the round.',
    groups:['juniors','seniors','prep'], duration:'5 min',
    play: function(ctx){ return playQuizDuel(ctx); }
  },
  {
    id:'math-race', name:'Math Race', emoji:'🧮',
    desc:'Solve as many sums as you can in 60 seconds. Top score wins.',
    groups:['kids','juniors','seniors','prep'], duration:'1 min',
    play: function(ctx){ return playMathRace(ctx); }
  },
  {
    id:'spelling-bee', name:'Spelling Bee', emoji:'🐝',
    desc:'Listen and spell the word. One mistake and you\'re out.',
    groups:['kids','juniors','seniors'], duration:'3 min',
    play: function(ctx){ return playSpellingBee(ctx); }
  },
  {
    id:'memory-match', name:'Memory Match', emoji:'🧠',
    desc:'Find pairs of pictures faster than anyone else. Kids favourite!',
    groups:['kids'], duration:'2 min',
    play: function(ctx){ return playMemoryMatch(ctx); }
  },
  {
    id:'geo-sprint', name:'Geography Sprint', emoji:'🌍',
    desc:'Capitals, states, rivers — Nigeria & the world. Speed counts.',
    groups:['juniors','seniors','prep'], duration:'3 min',
    play: function(ctx){ return playGeoSprint(ctx); }
  },
  {
    id:'word-build', name:'Word Builder', emoji:'🔤',
    desc:'Build the most words from a set of letters before time runs out.',
    groups:['kids','juniors','seniors'], duration:'2 min',
    play: function(ctx){ return playWordBuilder(ctx); }
  }
];

/* ───────────── 3. PROFILE ───────────── */
function getProfile(){
  var p = ArenaDB.loadProfile();
  if (!p){
    p = {
      uid: 'me_' + rid(),
      name: 'Player' + Math.floor(Math.random()*900+100),
      avatar: ['🦁','🐘','🐆','🦅','🦓','🦒','🐢','🐬','🦋','🐝'][Math.floor(Math.random()*10)],
      classGroup: 'juniors',
      state: 'Lagos',
      school: '',
      xp: 0, wins: 0, plays: 0,
      createdAt: nowMs()
    };
    ArenaDB.saveProfile(p);
  }
  return p;
}

function saveProfile(patch){
  var p = Object.assign(getProfile(), patch || {});
  ArenaDB.saveProfile(p);
  return p;
}

/* ───────────── 4. ROOM SIMULATION (local prototype) ───────────── */
/* Until Firebase is wired, rooms are generated with bot players that
   mirror the data shape of real multiplayer matches. */

function botName(){
  var n = ['Ada','Tunde','Chinedu','Aisha','Emeka','Funmi','Ibrahim','Ngozi','Yusuf','Zainab','Kemi','Obi','Halima','Bola','Sade','Musa'];
  var s = ['O.','A.','E.','I.','U.','M.','C.','B.'];
  return n[Math.floor(Math.random()*n.length)] + ' ' + s[Math.floor(Math.random()*s.length)];
}
function botAvatar(){ return ['🦊','🐯','🦅','🐼','🐸','🐵','🐧','🦄','🦖'][Math.floor(Math.random()*9)]; }

function generateRooms(classGroup, scope, state, format){
  var games = GAMES.filter(function(g){ return g.groups.indexOf(classGroup) !== -1; });
  var prizeBase = scope === 'nationwide' ? 5000 : scope === 'state' ? 1500 : 500;
  var rooms = [];
  for (var i=0;i<8;i++){
    var g = games[Math.floor(Math.random()*games.length)];
    // Pick a format for this room — honour the user's selection if any
    var fmt;
    if (format && format !== 'any') {
      fmt = FORMATS.find(function(f){ return f.id === format; }) || FORMATS[0];
    } else {
      fmt = FORMATS[Math.floor(Math.random()*FORMATS.length)];
    }
    var maxPlayers = fmt.size;
    var existing = Math.floor(Math.random()*(maxPlayers-1)) + 1;
    var players = [];
    for (var j=0;j<existing;j++) players.push({ uid:'bot_'+rid(), name:botName(), avatar:botAvatar(), bot:true, state: state || STATES[Math.floor(Math.random()*STATES.length)] });
    // ~40% of rooms are LIVE (in-progress) so users can spectate
    var roll = Math.random();
    var status;
    if (existing >= maxPlayers) status = 'full';
    else if (roll < 0.45) status = 'live';
    else status = 'open';
    var viewers = (status === 'live') ? (3 + Math.floor(Math.random()*120)) : 0;
    // For live rooms, fake a current score for each player
    var scores = {};
    if (status === 'live'){
      players.forEach(function(p){ scores[p.uid] = Math.floor(Math.random()*120); });
    }
    rooms.push({
      id: 'room_'+rid(),
      classGroup: classGroup,
      scope: scope,
      state: scope === 'state' ? state : null,
      gameId: g.id,
      gameName: g.name,
      gameEmoji: g.emoji,
      duration: g.duration,
      players: players,
      maxPlayers: maxPlayers,
      format: fmt.id,
      formatName: fmt.name,
      formatEmoji: fmt.emoji,
      teamSize: fmt.team,
      status: status,
      viewers: viewers,
      scores: scores,
      startedSecAgo: status === 'live' ? (5 + Math.floor(Math.random()*180)) : 0,
      startsIn: 10 + Math.floor(Math.random()*50),
      prize: prizeBase + Math.floor(Math.random()*prizeBase/2),
      createdAt: nowMs()
    });
  }
  return rooms;
}

/* ───────────── 5. UI: PAGE INJECTION ───────────── */

function injectStyles(){
  if (document.getElementById('arena-styles')) return;
  var s = document.createElement('style');
  s.id = 'arena-styles';
  s.textContent = ''
    + '#pg-arena{position:fixed;inset:0;overflow-y:auto;background:radial-gradient(1200px 600px at 10% -10%,rgba(168,85,247,.18),transparent 60%),radial-gradient(800px 500px at 100% 0%,rgba(59,130,246,.18),transparent 60%),#070b18;color:#fff;font-family:Inter,system-ui,sans-serif;display:none;z-index:50}'
    + '#pg-arena.active{display:block}'
    + '.ar-wrap{max-width:1180px;margin:0 auto;padding:18px 18px 80px}'
    + '.ar-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}'
    + '.ar-back{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff;padding:8px 14px;border-radius:100px;font-weight:700;font-size:.82rem;cursor:pointer}'
    + '.ar-back:hover{background:rgba(255,255,255,.14)}'
    + '.ar-title{font-family:"Bricolage Grotesque",sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:-.02em;display:flex;align-items:center;gap:8px}'
    + '.ar-profile{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:100px;padding:6px 14px 6px 6px;cursor:pointer}'
    + '.ar-profile:hover{background:rgba(255,255,255,.1)}'
    + '.ar-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#a855f7);display:flex;align-items:center;justify-content:center;font-size:1.1rem}'
    + '.ar-pname{font-weight:800;font-size:.85rem}'
    + '.ar-pmeta{font-size:.68rem;color:rgba(255,255,255,.55)}'
    + '.ar-hero{background:linear-gradient(135deg,rgba(168,85,247,.2),rgba(59,130,246,.18));border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:18px 20px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}'
    + '.ar-hero-l h2{font-family:"Bricolage Grotesque",sans-serif;font-size:1.35rem;font-weight:900;margin:0 0 4px}'
    + '.ar-hero-l p{font-size:.85rem;color:rgba(255,255,255,.7);margin:0;max-width:520px;line-height:1.45}'
    + '.ar-help{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#fff;padding:10px 18px;border-radius:100px;font-weight:700;font-size:.82rem;cursor:pointer}'
    + '.ar-help:hover{background:rgba(255,255,255,.18)}'
    + '.ar-section-label{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.5);font-weight:800;margin:18px 0 10px}'
    + '.ar-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px}'
    + '.ar-tab{flex:1;min-width:140px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px 14px;text-align:left;cursor:pointer;color:#fff;transition:all .2s}'
    + '.ar-tab:hover{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.07)}'
    + '.ar-tab.on{background:linear-gradient(135deg,rgba(59,130,246,.25),rgba(168,85,247,.18));border-color:rgba(96,165,250,.5);box-shadow:0 0 0 2px rgba(59,130,246,.15)}'
    + '.ar-tab-t{font-weight:800;font-size:.92rem;display:flex;align-items:center;gap:8px}'
    + '.ar-tab-s{font-size:.72rem;color:rgba(255,255,255,.55);margin-top:2px}'
    + '.ar-state-row{display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap}'
    + '.ar-state-row label{font-size:.78rem;color:rgba(255,255,255,.6);font-weight:700}'
    + '.ar-state-row select{background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:8px 12px;font-size:.85rem;font-family:inherit}'
    + '.ar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-top:10px}'
    + '.ar-room{background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px}'
    + '.ar-room-top{display:flex;align-items:center;justify-content:space-between;gap:10px}'
    + '.ar-room-game{display:flex;align-items:center;gap:8px;font-weight:800;font-size:.95rem}'
    + '.ar-room-emoji{font-size:1.4rem;width:34px;height:34px;background:rgba(255,255,255,.08);border-radius:10px;display:flex;align-items:center;justify-content:center}'
    + '.ar-room-prize{background:rgba(245,158,11,.18);color:#fcd34d;border:1px solid rgba(245,158,11,.35);padding:3px 10px;border-radius:100px;font-size:.7rem;font-weight:800}'
    + '.ar-room-meta{display:flex;align-items:center;gap:10px;font-size:.74rem;color:rgba(255,255,255,.6)}'
    + '.ar-room-players{display:flex;gap:-4px}'
    + '.ar-pchip{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.1);border:2px solid #0f172a;display:inline-flex;align-items:center;justify-content:center;font-size:.78rem;margin-left:-6px}'
    + '.ar-pchip:first-child{margin-left:0}'
    + '.ar-room-actions{display:flex;gap:8px;margin-top:auto}'
    + '.ar-join{flex:1;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;border:none;padding:9px 14px;border-radius:10px;font-weight:800;font-size:.85rem;cursor:pointer;font-family:"Bricolage Grotesque",sans-serif}'
    + '.ar-join:hover{filter:brightness(1.1)}'
    + '.ar-join:disabled{opacity:.4;cursor:not-allowed}'
    + '.ar-spec{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.14);padding:9px 12px;border-radius:10px;font-weight:700;font-size:.78rem;cursor:pointer}'
    + '.ar-cta{background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:10px 18px;border-radius:10px;font-weight:800;font-size:.85rem;cursor:pointer}'
    + '.ar-leader{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px;margin-top:14px}'
    + '.ar-lrow{display:grid;grid-template-columns:32px 1fr auto auto;gap:10px;align-items:center;padding:8px 4px;border-bottom:1px dashed rgba(255,255,255,.06);font-size:.85rem}'
    + '.ar-lrow:last-child{border-bottom:none}'
    + '.ar-lrank{font-weight:900;color:#fcd34d;text-align:center}'
    + '.ar-lname{font-weight:700}'
    + '.ar-lstate{font-size:.7rem;color:rgba(255,255,255,.5)}'
    + '.ar-lxp{font-weight:800;color:#60a5fa}'
    + '.ar-empty{padding:30px;text-align:center;color:rgba(255,255,255,.55);font-size:.88rem}'
    + '.ar-modal{position:fixed;inset:0;background:rgba(5,10,22,.85);backdrop-filter:blur(8px);z-index:99995;display:flex;align-items:center;justify-content:center;padding:20px}'
    + '.ar-modal-card{background:linear-gradient(160deg,#0f172a,#1e293b);border:1px solid rgba(255,255,255,.12);border-radius:22px;max-width:560px;width:100%;padding:22px;color:#fff;max-height:90vh;overflow-y:auto;box-shadow:0 30px 80px rgba(0,0,0,.6)}'
    + '.ar-mod-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}'
    + '.ar-mod-t{font-family:"Bricolage Grotesque",sans-serif;font-weight:900;font-size:1.2rem}'
    + '.ar-mod-x{background:none;border:none;color:rgba(255,255,255,.5);font-size:1.4rem;cursor:pointer}'
    + '.ar-form-row{margin-bottom:12px}'
    + '.ar-form-row label{display:block;font-size:.78rem;color:rgba(255,255,255,.7);font-weight:700;margin-bottom:4px}'
    + '.ar-form-row input,.ar-form-row select{width:100%;background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:10px 12px;font-size:.9rem;font-family:inherit;box-sizing:border-box}'
    + '.ar-prize-banner{background:linear-gradient(135deg,rgba(245,158,11,.2),rgba(220,38,38,.15));border:1px solid rgba(245,158,11,.4);border-radius:12px;padding:14px;text-align:center;margin-bottom:12px}'
    + '.ar-prize-banner b{color:#fcd34d;font-size:1.1rem;font-family:"Bricolage Grotesque",sans-serif}'
    + '.ar-game-stage{min-height:280px;background:rgba(0,0,0,.3);border-radius:14px;padding:18px;margin:12px 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center}'
    + '.ar-q{font-size:1.2rem;font-weight:800;font-family:"Bricolage Grotesque",sans-serif;line-height:1.3}'
    + '.ar-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}'
    + '.ar-opt{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff;padding:14px;border-radius:10px;font-weight:700;cursor:pointer;font-size:.95rem;font-family:inherit;text-align:center;transition:all .15s}'
    + '.ar-opt:hover{background:rgba(255,255,255,.14)}'
    + '.ar-opt.right{background:rgba(16,185,129,.3);border-color:#10b981}'
    + '.ar-opt.wrong{background:rgba(220,38,38,.3);border-color:#dc2626}'
    + '.ar-timer{font-size:.85rem;color:rgba(255,255,255,.7);font-weight:800}'
    + '.ar-score-pill{background:rgba(96,165,250,.15);color:#60a5fa;padding:4px 12px;border-radius:100px;font-size:.78rem;font-weight:800;border:1px solid rgba(96,165,250,.3)}'
    + '.ar-mem-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%;max-width:340px;margin:0 auto}'
    + '.ar-mem-card{aspect-ratio:1;background:linear-gradient(135deg,#3b82f6,#1e40af);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;cursor:pointer;transition:transform .2s;user-select:none}'
    + '.ar-mem-card.flip{background:#fff;color:#0f172a}'
    + '.ar-mem-card.matched{background:rgba(16,185,129,.5);cursor:default}'
    + '.ar-input{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#fff;padding:10px 14px;border-radius:10px;font-size:1rem;width:100%;max-width:240px;font-family:inherit;text-align:center;letter-spacing:.05em}'
    + '@media (max-width:600px){.ar-tab{min-width:calc(50% - 4px)}.ar-grid{grid-template-columns:1fr}.ar-opts{grid-template-columns:1fr}}'
    // ── Lobby (waiting room + live chat) ──
    + '.ar-lobby-card{background:linear-gradient(160deg,#0f172a,#1e293b);border:1px solid rgba(255,255,255,.12);border-radius:22px;width:100%;max-width:880px;max-height:92vh;overflow:hidden;display:grid;grid-template-columns:1fr 320px;color:#fff;box-shadow:0 30px 80px rgba(0,0,0,.6)}'
    + '@media (max-width:780px){.ar-lobby-card{grid-template-columns:1fr;max-height:96vh}}'
    + '.ar-lob-main{padding:18px;display:flex;flex-direction:column;gap:12px;overflow-y:auto}'
    + '.ar-lob-h{display:flex;align-items:center;justify-content:space-between;gap:10px}'
    + '.ar-lob-t{font-family:"Bricolage Grotesque",sans-serif;font-weight:900;font-size:1.15rem;display:flex;align-items:center;gap:8px}'
    + '.ar-lob-fmt{display:inline-flex;align-items:center;gap:6px;background:rgba(168,85,247,.18);border:1px solid rgba(168,85,247,.4);color:#e9d5ff;padding:4px 10px;border-radius:100px;font-size:.7rem;font-weight:800}'
    + '.ar-lob-meta{display:flex;flex-wrap:wrap;gap:8px;font-size:.74rem;color:rgba(255,255,255,.7)}'
    + '.ar-lob-meta span{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);padding:4px 10px;border-radius:100px}'
    + '.ar-lob-teams{display:grid;grid-template-columns:1fr 1fr;gap:10px}'
    + '.ar-lob-teams.solo{grid-template-columns:1fr}'
    + '.ar-lob-team{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px}'
    + '.ar-lob-team h4{margin:0 0 8px;font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;color:rgba(255,255,255,.6);display:flex;justify-content:space-between;align-items:center}'
    + '.ar-lob-slot{display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;background:rgba(255,255,255,.03);margin-bottom:6px}'
    + '.ar-lob-slot.you{background:linear-gradient(135deg,rgba(59,130,246,.25),rgba(168,85,247,.18));border:1px solid rgba(96,165,250,.4)}'
    + '.ar-lob-slot.empty{opacity:.5;border:1px dashed rgba(255,255,255,.18);background:transparent}'
    + '.ar-lob-av{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:1rem}'
    + '.ar-lob-pn{font-weight:700;font-size:.86rem}'
    + '.ar-lob-ps{font-size:.66rem;color:rgba(255,255,255,.55)}'
    + '.ar-lob-ready{margin-left:auto;font-size:.68rem;font-weight:800;padding:3px 8px;border-radius:100px}'
    + '.ar-lob-ready.y{background:rgba(16,185,129,.2);color:#6ee7b7;border:1px solid rgba(16,185,129,.4)}'
    + '.ar-lob-ready.n{background:rgba(245,158,11,.18);color:#fcd34d;border:1px solid rgba(245,158,11,.35)}'
    + '.ar-lob-actions{display:flex;gap:8px;margin-top:auto}'
    + '.ar-lob-actions button{flex:1}'
    // chat side
    + '.ar-lob-chat{background:#0b1222;border-left:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;min-height:300px}'
    + '@media (max-width:780px){.ar-lob-chat{border-left:none;border-top:1px solid rgba(255,255,255,.08);max-height:46vh}}'
    + '.ar-lob-chat-h{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);font-weight:800;font-size:.85rem;display:flex;align-items:center;gap:8px}'
    + '.ar-lob-feed{flex:1;padding:12px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;font-size:.83rem}'
    + '.ar-lob-msg{padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);line-height:1.35;max-width:90%}'
    + '.ar-lob-msg b{color:#93c5fd;margin-right:4px}'
    + '.ar-lob-msg.me{background:rgba(59,130,246,.18);border-color:rgba(96,165,250,.35);align-self:flex-end}'
    + '.ar-lob-msg.me b{color:#bfdbfe}'
    + '.ar-lob-msg.sys{background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.28);color:#c7d2fe;font-size:.74rem;text-align:center;align-self:center}'
    + '.ar-lob-chat-in{display:flex;gap:6px;padding:10px;border-top:1px solid rgba(255,255,255,.08)}'
    + '.ar-lob-chat-in input{flex:1;background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:100px;padding:8px 12px;font-size:.84rem;font-family:inherit}'
    + '.ar-lob-chat-in button{background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;border:none;padding:8px 14px;border-radius:100px;font-weight:800;font-size:.78rem;cursor:pointer}'
    + '.ar-lob-quick{display:flex;gap:5px;flex-wrap:wrap;padding:0 10px 10px}'
    + '.ar-lob-quick button{background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.14);padding:4px 9px;border-radius:100px;font-size:.7rem;cursor:pointer}';
  // Live + spectator additions
  s.textContent += ''
    + '.ar-live-bar{display:flex;gap:12px;overflow-x:auto;padding:6px 2px 12px;margin-bottom:10px;scroll-snap-type:x mandatory}'
    + '.ar-live-bar::-webkit-scrollbar{height:6px}.ar-live-bar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:6px}'
    + '.ar-live-card{flex:0 0 240px;scroll-snap-align:start;background:linear-gradient(160deg,rgba(220,38,38,.18),rgba(15,23,42,.6));border:1px solid rgba(239,68,68,.45);border-radius:14px;padding:12px;cursor:pointer;display:flex;flex-direction:column;gap:6px;position:relative;overflow:hidden;transition:transform .15s,box-shadow .15s}'
    + '.ar-live-card:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(239,68,68,.25)}'
    + '.ar-live-card .lc-game{display:flex;align-items:center;gap:8px;font-weight:800;font-size:.92rem}'
    + '.ar-live-card .lc-meta{display:flex;align-items:center;gap:8px;font-size:.7rem;color:rgba(255,255,255,.7)}'
    + '.ar-live-card .lc-watch{margin-top:auto;background:rgba(239,68,68,.85);color:#fff;border:none;padding:7px 10px;border-radius:8px;font-weight:800;font-size:.78rem;cursor:pointer}'
    + '.ar-live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;box-shadow:0 0 0 0 rgba(239,68,68,.7);animation:arPulse 1.4s infinite}'
    + '@keyframes arPulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.6)}70%{box-shadow:0 0 0 8px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}'
    + '.ar-live-badge{display:inline-flex;align-items:center;gap:5px;background:#ef4444;color:#fff;padding:3px 8px;border-radius:100px;font-size:.62rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase}'
    + '.ar-spec-modal{position:fixed;inset:0;z-index:99996;background:rgba(2,6,18,.95);backdrop-filter:blur(8px);display:flex;align-items:stretch;justify-content:stretch}'
    + '.ar-spec-wrap{display:grid;grid-template-columns:1fr 320px;width:100%;height:100%;color:#fff;font-family:Inter,system-ui,sans-serif}'
    + '@media (max-width:840px){.ar-spec-wrap{grid-template-columns:1fr;grid-template-rows:1fr 40vh}}'
    + '.ar-spec-stage{display:flex;flex-direction:column;background:radial-gradient(ellipse 800px 500px at 50% 0%,rgba(168,85,247,.15),transparent 60%),#070b18;padding:18px;overflow:hidden;position:relative}'
    + '.ar-spec-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}'
    + '.ar-spec-title{display:flex;align-items:center;gap:10px;font-family:"Bricolage Grotesque",sans-serif;font-weight:900;font-size:1.1rem}'
    + '.ar-spec-meta{display:flex;align-items:center;gap:8px;font-size:.78rem;color:rgba(255,255,255,.7)}'
    + '.ar-spec-x{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#fff;padding:7px 14px;border-radius:100px;font-weight:700;font-size:.8rem;cursor:pointer}'
    + '.ar-spec-board{flex:1;background:linear-gradient(160deg,rgba(255,255,255,.04),rgba(255,255,255,.01));border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px;overflow-y:auto}'
    + '.ar-spec-row{display:grid;grid-template-columns:30px 36px 1fr 70px 90px;gap:10px;align-items:center;padding:10px 6px;border-bottom:1px dashed rgba(255,255,255,.06)}'
    + '.ar-spec-row:last-child{border-bottom:none}'
    + '.ar-spec-rank{font-weight:900;color:#fcd34d;text-align:center;font-size:.95rem}'
    + '.ar-spec-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#a855f7);display:flex;align-items:center;justify-content:center;font-size:1.05rem}'
    + '.ar-spec-name{font-weight:800;font-size:.92rem}'
    + '.ar-spec-state{font-size:.68rem;color:rgba(255,255,255,.5)}'
    + '.ar-spec-bar{height:8px;background:rgba(255,255,255,.08);border-radius:100px;overflow:hidden}'
    + '.ar-spec-bar > i{display:block;height:100%;background:linear-gradient(90deg,#10b981,#34d399);transition:width .6s ease}'
    + '.ar-spec-score{font-weight:900;color:#34d399;text-align:right;font-family:"Bricolage Grotesque",sans-serif}'
    + '.ar-spec-side{background:#0b1222;border-left:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column}'
    + '.ar-spec-feed{flex:1;padding:14px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;font-size:.84rem}'
    + '.ar-feed-msg{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);line-height:1.4}'
    + '.ar-feed-msg b{color:#93c5fd}'
    + '.ar-feed-msg.right{background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.3);color:#a7f3d0}'
    + '.ar-feed-msg.wrong{background:rgba(239,68,68,.10);border-color:rgba(239,68,68,.28);color:#fecaca}'
    + '.ar-feed-msg.sys{background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.28);color:#c7d2fe;font-size:.76rem;text-align:center}'
    + '.ar-spec-chat{border-top:1px solid rgba(255,255,255,.08);padding:10px;display:flex;gap:6px}'
    + '.ar-spec-chat input{flex:1;background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:100px;padding:8px 12px;font-size:.82rem;font-family:inherit}'
    + '.ar-spec-chat button{background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;border:none;padding:8px 14px;border-radius:100px;font-weight:800;font-size:.78rem;cursor:pointer}'
    + '.ar-spec-quick{display:flex;gap:6px;flex-wrap:wrap;padding:6px 10px 10px}'
    + '.ar-spec-quick button{background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.14);padding:5px 10px;border-radius:100px;font-size:.72rem;cursor:pointer}'
    + '.ar-vbadge{display:inline-flex;align-items:center;gap:5px;font-size:.7rem;color:rgba(255,255,255,.7);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);padding:3px 8px;border-radius:100px}'
    // Anti-cheat banner + spectator extras
    + '.ar-fair{display:flex;align-items:center;gap:8px;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.35);color:#a7f3d0;padding:8px 12px;border-radius:12px;font-size:.78rem;margin-bottom:10px}'
    + '.ar-fair b{font-family:"Bricolage Grotesque",sans-serif}'
    + '.ar-spec-watchers{display:flex;align-items:center;gap:6px;padding:8px 14px;border-bottom:1px solid rgba(255,255,255,.08);font-size:.74rem;color:rgba(255,255,255,.7);overflow-x:auto;white-space:nowrap}'
    + '.ar-spec-watchers .ar-pchip{width:22px;height:22px;font-size:.7rem;border-color:#0b1222}'
    // Floating cheer reactions (stadium feel)
    + '.ar-cheer-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden}'
    + '.ar-cheer{position:absolute;bottom:0;font-size:1.6rem;opacity:0;animation:arCheerUp 2.4s ease-out forwards;will-change:transform,opacity;text-shadow:0 2px 8px rgba(0,0,0,.6)}'
    + '@keyframes arCheerUp{0%{transform:translateY(20px) scale(.4);opacity:0}15%{opacity:1}80%{opacity:1}100%{transform:translateY(-260px) scale(1.2) rotate(8deg);opacity:0}}'
    // Watch button on the lobby
    + '.ar-watch-btn{background:rgba(239,68,68,.18);color:#fecaca;border:1px solid rgba(239,68,68,.4);padding:6px 12px;border-radius:100px;font-weight:800;font-size:.74rem;cursor:pointer;display:inline-flex;align-items:center;gap:6px}'
    + '.ar-watch-btn:hover{background:rgba(239,68,68,.28)}';
  document.head.appendChild(s);
}

function injectPage(){
  if (document.getElementById('pg-arena')) return;
  var pg = document.createElement('div');
  pg.id = 'pg-arena';
  pg.className = 'page';
  pg.innerHTML = ''
    + '<div class="ar-wrap">'
    +   '<div class="ar-top">'
    +     '<button class="ar-back" onclick="ArenaUI.goBack()">← Back</button>'
    +     '<div class="ar-title">🏟️ Live Arena</div>'
    +     '<div class="ar-profile" id="arProfile" onclick="ArenaUI.editProfile()">'
    +       '<div class="ar-avatar" id="arAvatar">🦁</div>'
    +       '<div><div class="ar-pname" id="arPName">Player</div><div class="ar-pmeta" id="arPMeta">— · 0 XP</div></div>'
    +     '</div>'
    +   '</div>'

    +   '<div class="ar-hero">'
    +     '<div class="ar-hero-l">'
    +       '<h2>Compete live. Win gifts. Top the leaderboard.</h2>'
    +       '<p>Educational games against real Nigerian students. Pick your class group and play locally, across your state, or nationwide. Weekend tournaments offer data, airtime and books as prizes.</p>'
    +     '</div>'
    +     '<button class="ar-help" onclick="LtSpot && LtSpot.run(\'arena\',{force:true})">How it works ?</button>'
    +   '</div>'

    +   '<div class="ar-section-label">1. Choose your class group</div>'
    +   '<div class="ar-tabs" id="arenaClassTabs"></div>'

    +   '<div class="ar-section-label">2. Choose competition scope</div>'
    +   '<div class="ar-tabs" id="arenaScopeTabs"></div>'
    +   '<div class="ar-state-row" id="arStateRow" style="display:none">'
    +     '<label>Your state:</label>'
    +     '<select id="arStateSelect"></select>'
    +   '</div>'

    +   '<div class="ar-section-label">3. Choose match format</div>'
    +   '<div class="ar-tabs" id="arenaFormatTabs"></div>'

    +   '<div class="ar-section-label">4. Live rooms <span style="float:right;color:rgba(255,255,255,.4);font-weight:700;text-transform:none;letter-spacing:0">'
    +     '<button class="ar-back" onclick="ArenaUI.refresh()" style="padding:4px 10px;font-size:.72rem">⟳ Refresh</button> '
    +     '<button class="ar-cta" onclick="ArenaUI.createRoom()" style="padding:4px 12px;font-size:.72rem">+ Create room</button>'
    +   '</span></div>'
    +   '<div id="arenaLiveStrip"></div>'
    +   '<div class="ar-grid" id="arenaRoomList"></div>'

    +   '<div class="ar-section-label">🏆 This week\'s leaderboard</div>'
    +   '<div class="ar-leader" id="arenaLeaderboard"></div>'
    + '</div>';
  document.body.appendChild(pg);

  // Class tabs
  var ct = document.getElementById('arenaClassTabs');
  ct.innerHTML = CLASS_GROUPS.map(function(g){
    return '<button class="ar-tab" data-cg="'+g.id+'" onclick="ArenaUI.pickClass(\''+g.id+'\')">'
      + '<div class="ar-tab-t">'+g.emoji+' '+g.name+'</div>'
      + '<div class="ar-tab-s">'+g.sub+'</div></button>';
  }).join('');

  // Scope tabs
  var st = document.getElementById('arenaScopeTabs');
  st.innerHTML = SCOPES.map(function(s){
    return '<button class="ar-tab" data-sc="'+s.id+'" onclick="ArenaUI.pickScope(\''+s.id+'\')">'
      + '<div class="ar-tab-t">'+s.emoji+' '+s.name+'</div>'
      + '<div class="ar-tab-s">'+s.sub+'</div></button>';
  }).join('');

  // Format tabs (1v1 / Squad / Team / School / FFA)
  var ft = document.getElementById('arenaFormatTabs');
  ft.innerHTML = '<button class="ar-tab" data-fmt="any" onclick="ArenaUI.pickFormat(\'any\')">'
    + '<div class="ar-tab-t">✨ Any format</div><div class="ar-tab-s">Show all rooms</div></button>'
    + FORMATS.map(function(f){
        return '<button class="ar-tab" data-fmt="'+f.id+'" onclick="ArenaUI.pickFormat(\''+f.id+'\')">'
          + '<div class="ar-tab-t">'+f.emoji+' '+f.name+'</div>'
          + '<div class="ar-tab-s">'+f.sub+'</div></button>';
      }).join('');

  // State select
  var sel = document.getElementById('arStateSelect');
  sel.innerHTML = STATES.map(function(s){ return '<option value="'+s+'">'+s+'</option>'; }).join('');
  sel.onchange = function(){ saveProfile({ state: sel.value }); ArenaUI.refresh(); };
}

/* ───────────── 6. UI CONTROLLER ───────────── */
var state = { classGroup:null, scope:null, format:'any' };

var ArenaUI = {
  open: function(){
    injectStyles();
    injectPage();
    var p = getProfile();
    document.getElementById('arAvatar').textContent = p.avatar;
    document.getElementById('arPName').textContent = p.name;
    document.getElementById('arPMeta').textContent = (p.state || '—') + ' · ' + p.xp + ' XP · ' + p.wins + 'W';
    document.getElementById('arStateSelect').value = p.state || 'Lagos';
    state.classGroup = p.classGroup || 'juniors';
    state.scope = state.scope || 'local';
    state.format = state.format || 'any';
    ArenaUI._highlightTabs();
    ArenaUI.refresh();
  },
  pickClass: function(id){
    state.classGroup = id;
    saveProfile({ classGroup: id });
    document.getElementById('arPMeta').textContent = (getProfile().state || '—') + ' · ' + getProfile().xp + ' XP · ' + getProfile().wins + 'W';
    ArenaUI._highlightTabs();
    ArenaUI.refresh();
  },
  pickScope: function(id){
    state.scope = id;
    document.getElementById('arStateRow').style.display = (id === 'state') ? 'flex' : 'none';
    ArenaUI._highlightTabs();
    ArenaUI.refresh();
  },
  pickFormat: function(id){
    state.format = id;
    ArenaUI._highlightTabs();
    ArenaUI.refresh();
  },
  _highlightTabs: function(){
    document.querySelectorAll('#arenaClassTabs .ar-tab').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-cg') === state.classGroup);
    });
    document.querySelectorAll('#arenaScopeTabs .ar-tab').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-sc') === state.scope);
    });
    document.querySelectorAll('#arenaFormatTabs .ar-tab').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-fmt') === (state.format||'any'));
    });
  },
  refresh: function(){
    var grid = document.getElementById('arenaRoomList');
    var strip = document.getElementById('arenaLiveStrip');
    if (!state.classGroup || !state.scope){
      grid.innerHTML = '<div class="ar-empty">Pick your class group and scope above to see live rooms.</div>';
      if (strip) strip.innerHTML = '';
      return;
    }
    var st = (state.scope === 'state') ? (getProfile().state || 'Lagos') : null;
    var rooms = generateRooms(state.classGroup, state.scope, st, state.format);
    // ── Live Now carousel (in-progress rooms anyone can spectate) ──
    var liveRooms = rooms.filter(function(r){ return r.status === 'live'; });
    if (strip){
      if (!liveRooms.length){
        strip.innerHTML = '';
      } else {
        strip.innerHTML = ''
          + '<div style="display:flex;align-items:center;justify-content:space-between;margin:14px 0 6px">'
          +   '<div style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:.82rem">'
          +     '<span class="ar-live-dot"></span> <span style="font-family:\'Bricolage Grotesque\',sans-serif;letter-spacing:-.01em">'+liveRooms.length+' games LIVE right now</span>'
          +   '</div>'
          +   '<span class="ar-vbadge">👁 '+liveRooms.reduce(function(a,r){return a+r.viewers;},0).toLocaleString()+' watching</span>'
          + '</div>'
          + '<div class="ar-live-bar">' + liveRooms.map(function(r){
              var pchips = r.players.slice(0,4).map(function(p){return '<span class="ar-pchip">'+p.avatar+'</span>';}).join('');
              return '<div class="ar-live-card" onclick=\'ArenaUI.spectate('+JSON.stringify(r).replace(/'/g,"&#39;")+')\'>'
                + '<div style="display:flex;align-items:center;justify-content:space-between"><span class="ar-live-badge"><span class="ar-live-dot"></span> Live</span><span style="font-size:.7rem;color:#fbbf24;font-weight:800">🎁 ₦'+r.prize.toLocaleString()+'</span></div>'
                + '<div class="lc-game"><span style="font-size:1.3rem">'+r.gameEmoji+'</span>'+r.gameName+'</div>'
                + '<div class="lc-meta">👥 '+r.players.length+' playing · 👁 '+r.viewers+' watching · ⏱ '+Math.floor(r.startedSecAgo)+'s in</div>'
                + '<div class="ar-room-players" style="margin:2px 0">'+pchips+'</div>'
                + '<button class="lc-watch">📺 Watch live</button>'
                + '</div>';
            }).join('') + '</div>';
      }
    }
    // ── Full room grid ──
    grid.innerHTML = rooms.map(function(r){
      var playersHtml = r.players.slice(0,5).map(function(p){
        return '<span class="ar-pchip" title="'+p.name+'">'+p.avatar+'</span>';
      }).join('');
      var more = r.players.length > 5 ? '<span class="ar-pchip">+'+(r.players.length-5)+'</span>' : '';
      var statusBadge = r.status === 'live'
        ? '<span class="ar-live-badge"><span class="ar-live-dot"></span> Live · 👁 '+r.viewers+'</span>'
        : (r.status === 'full' ? '<span class="ar-vbadge">Full</span>' : '<span class="ar-vbadge" style="color:#34d399;border-color:rgba(16,185,129,.35)">● Open · waiting</span>');
      var actionBtn;
      if (r.status === 'live') {
        actionBtn = '<button class="ar-spec" onclick=\'ArenaUI.spectate('+JSON.stringify(r).replace(/'/g,"&#39;")+')\'>📺 Spectate</button>'
                  + '<button class="ar-join" onclick=\'ArenaUI.spectate('+JSON.stringify(r).replace(/'/g,"&#39;")+')\'>Watch & cheer →</button>';
      } else if (r.status === 'full') {
        actionBtn = '<button class="ar-join" disabled>Full</button>';
      } else {
        actionBtn = '<button class="ar-join" onclick=\'ArenaUI.joinRoom('+JSON.stringify(r).replace(/'/g,"&#39;")+')\'>Join →</button>';
      }
      return '<div class="ar-room">'
        + '<div class="ar-room-top">'
        +   '<div class="ar-room-game"><span class="ar-room-emoji">'+r.gameEmoji+'</span>'+r.gameName+'</div>'
        +   '<div class="ar-room-prize">🎁 ₦'+r.prize.toLocaleString()+'</div>'
        + '</div>'
        + '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="ar-vbadge" style="color:#a78bfa;border-color:rgba(167,139,250,.4)">'+(r.formatEmoji||'🎮')+' '+(r.formatName||'Match')+'</span></div>'
        + '<div>'+statusBadge+'</div>'
        + '<div class="ar-room-meta">⏱ '+r.duration+' · 👥 '+r.players.length+'/'+r.maxPlayers+(r.state?' · '+r.state:'')+'</div>'
        + '<div class="ar-room-players">'+playersHtml+more+'</div>'
        + '<div class="ar-room-actions">' + actionBtn + '</div>'
        + '</div>';
    }).join('');

    // Leaderboard
    var leaders = ArenaDB.topLeaders(state.classGroup, state.scope, 10);
    var lb = document.getElementById('arenaLeaderboard');
    if (!leaders.length){
      lb.innerHTML = '<div class="ar-empty">No scores this week yet — be the first! Play a round to appear here.</div>';
    } else {
      lb.innerHTML = leaders.map(function(r,i){
        return '<div class="ar-lrow">'
          + '<div class="ar-lrank">'+(i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1))+'</div>'
          + '<div><div class="ar-lname">'+r.name+'</div><div class="ar-lstate">'+r.classGroup+' · '+r.scope+'</div></div>'
          + '<div class="ar-score-pill">'+r.wins+'W</div>'
          + '<div class="ar-lxp">'+r.xp+' XP</div>'
        + '</div>';
      }).join('');
    }
  },
  joinRoom: function(room){
    var game = GAMES.find(function(g){ return g.id === room.gameId; });
    if (!game) return;
    openLobby(room, game);
  },
  spectate: function(room){
    openSpectator(room);
  },
  goBack: function(){
    var ar = document.getElementById('pg-arena'); if (ar) ar.classList.remove('active');
    // Prefer to return to whatever was last active before arena
    var anyActive = document.querySelector('.page.active');
    if (!anyActive){
      // Default: send the user to the landing page
      var landing = document.getElementById('pg-landing');
      if (landing){ landing.classList.add('active'); }
      else if (typeof window.goTo === 'function'){ try { window.goTo('pg-landing'); } catch(e){} }
    }
    try { history.replaceState({}, '', location.pathname); } catch(e){}
  },
  createRoom: function(){
    if (!state.classGroup || !state.scope){ alert('Pick a class group and scope first'); return; }
    var p = getProfile();
    var m = document.createElement('div');
    m.className = 'ar-modal';
    m.innerHTML = ''
      + '<div class="ar-modal-card">'
      +   '<div class="ar-mod-h"><div class="ar-mod-t">+ Host a new room</div><button class="ar-mod-x" onclick="this.closest(\'.ar-modal\').remove()">×</button></div>'
      +   '<div class="ar-form-row"><label>Match format</label><select id="arNewFmt">'
      +     FORMATS.map(function(f){
              var sel = (f.id === state.format) ? ' selected' : '';
              return '<option value="'+f.id+'"'+sel+'>'+f.emoji+' '+f.name+' — '+f.sub+'</option>';
            }).join('')
      +   '</select></div>'
      +   '<div class="ar-form-row"><label>Game</label><select id="arNewGame">'
      +     GAMES.filter(function(g){return g.groups.indexOf(state.classGroup)!==-1;}).map(function(g){
              return '<option value="'+g.id+'">'+g.emoji+' '+g.name+'</option>';
            }).join('')
      +   '</select></div>'
      +   '<div class="ar-form-row"><label>Room name (optional)</label><input id="arNewName" placeholder="'+(p.school||p.name)+'\'s room"/></div>'
      +   '<div style="font-size:.78rem;color:rgba(255,255,255,.6);margin:6px 0 12px">Your room will appear in the live list for your class group, scope and format. Friends can join from the same screen.</div>'
      +   '<button class="ar-cta" style="width:100%" onclick="ArenaUI._hostRoom()">Create room →</button>'
      + '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function(e){ if (e.target === m) m.remove(); });
  },
  _hostRoom: function(){
    var fmtId = document.getElementById('arNewFmt').value;
    var gameId = document.getElementById('arNewGame').value;
    var nameInput = document.getElementById('arNewName');
    var roomName = (nameInput && nameInput.value || '').trim();
    state.format = fmtId;
    var modal = document.querySelector('.ar-modal'); if (modal) modal.remove();
    ArenaUI._highlightTabs();
    ArenaUI.refresh();
    // Build a fresh hosted room, then drop the host straight into its lobby
    var fmt = FORMATS.find(function(f){ return f.id === fmtId; }) || FORMATS[0];
    var game = GAMES.find(function(g){ return g.id === gameId; }) || GAMES[0];
    var p = getProfile();
    var prizeBase = state.scope === 'nationwide' ? 5000 : state.scope === 'state' ? 1500 : 500;
    var hostedRoom = {
      id: 'room_'+rid(),
      classGroup: state.classGroup,
      scope: state.scope,
      state: state.scope === 'state' ? p.state : null,
      gameId: game.id,
      gameName: game.name,
      gameEmoji: game.emoji,
      duration: game.duration,
      players: [],
      maxPlayers: fmt.size,
      format: fmt.id,
      formatName: fmt.name,
      formatEmoji: fmt.emoji,
      teamSize: fmt.team,
      status: 'open',
      viewers: 0,
      scores: {},
      startsIn: 30,
      prize: prizeBase,
      hostName: roomName || (p.school || p.name) + "'s room",
      isHost: true,
      createdAt: nowMs()
    };
    openLobby(hostedRoom, game);
  },
  editProfile: function(){
    var p = getProfile();
    var m = document.createElement('div');
    m.className = 'ar-modal';
    m.innerHTML = ''
      + '<div class="ar-modal-card">'
      +   '<div class="ar-mod-h"><div class="ar-mod-t">Your Player Profile</div><button class="ar-mod-x" onclick="this.closest(\'.ar-modal\').remove()">×</button></div>'
      +   '<div class="ar-form-row"><label>Display name</label><input id="arEditName" value="'+p.name.replace(/"/g,'')+'" maxlength="20"/></div>'
      +   '<div class="ar-form-row"><label>Avatar</label><input id="arEditAvatar" value="'+p.avatar+'" maxlength="2"/></div>'
      +   '<div class="ar-form-row"><label>Class group</label><select id="arEditClass">'+CLASS_GROUPS.map(function(g){return '<option value="'+g.id+'"'+(g.id===p.classGroup?' selected':'')+'>'+g.emoji+' '+g.name+' — '+g.sub+'</option>';}).join('')+'</select></div>'
      +   '<div class="ar-form-row"><label>State</label><select id="arEditState">'+STATES.map(function(s){return '<option'+(s===p.state?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div>'
      +   '<div class="ar-form-row"><label>School (optional)</label><input id="arEditSchool" value="'+(p.school||'').replace(/"/g,'')+'" placeholder="e.g. Kings College Lagos"/></div>'
      +   '<button class="ar-cta" style="width:100%" onclick="ArenaUI._saveProfileForm()">Save</button>'
      + '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function(e){ if (e.target === m) m.remove(); });
  },
  _saveProfileForm: function(){
    var patch = {
      name: document.getElementById('arEditName').value || 'Player',
      avatar: document.getElementById('arEditAvatar').value || '🦁',
      classGroup: document.getElementById('arEditClass').value,
      state: document.getElementById('arEditState').value,
      school: document.getElementById('arEditSchool').value
    };
    saveProfile(patch);
    state.classGroup = patch.classGroup;
    var modal = document.querySelector('.ar-modal'); if (modal) modal.remove();
    ArenaUI.open();
  }
};

/* ───────────── 6.5 LOBBY (waiting room + live chat) ─────────────
   The lobby is where players gather BEFORE the match starts. Shows
   team slots filling up, a Ready toggle, a Start button, and a live
   chat panel with quick reactions. */
function openLobby(room, game){
  document.querySelectorAll('.ar-modal,#arGameModal,#arLobbyModal').forEach(function(n){ n.remove(); });

  var p = getProfile();
  var fmt = FORMATS.find(function(f){ return f.id === room.format; }) || FORMATS[0];

  var roster = [{ uid:'you', name:p.name, avatar:p.avatar, state:p.state, school:p.school, you:true, ready:false }];
  (room.players || []).forEach(function(pl){
    if (roster.length >= room.maxPlayers) return;
    roster.push({ uid:pl.uid, name:pl.name, avatar:pl.avatar, state:pl.state, bot:true, ready: Math.random() < 0.6 });
  });

  function teamFor(idx){
    if (fmt.team <= 1 || fmt.id === 'ffa') return 0;
    return idx < (room.maxPlayers / 2) ? 0 : 1;
  }

  var m = document.createElement('div');
  m.className = 'ar-modal';
  m.id = 'arLobbyModal';
  m.innerHTML = '<div class="ar-lobby-card"></div>';
  document.body.appendChild(m);
  var card = m.querySelector('.ar-lobby-card');

  function teamBlock(teamIdx){
    var label = (fmt.team <= 1 || fmt.id === 'ffa') ? 'Players' : (teamIdx === 0 ? '🟦 Team A' : '🟥 Team B');
    var slotsHtml = '';
    var filled = 0;
    for (var i=0;i<room.maxPlayers;i++){
      if (teamFor(i) !== teamIdx) continue;
      var pl = roster[i];
      if (pl){
        filled++;
        slotsHtml += '<div class="ar-lob-slot '+(pl.you?'you':'')+'">'
          + '<div class="ar-lob-av">'+pl.avatar+'</div>'
          + '<div><div class="ar-lob-pn">'+pl.name+(pl.you?' (you)':'')+'</div>'
          + '<div class="ar-lob-ps">'+(pl.state||'—')+(pl.school?' · '+pl.school:'')+'</div></div>'
          + '<div class="ar-lob-ready '+(pl.ready?'y':'n')+'">'+(pl.ready?'READY':'…')+'</div>'
          + '</div>';
      } else {
        slotsHtml += '<div class="ar-lob-slot empty">'
          + '<div class="ar-lob-av">＋</div>'
          + '<div><div class="ar-lob-pn">Waiting for player…</div>'
          + '<div class="ar-lob-ps">Open slot</div></div></div>';
      }
    }
    var teamCap = (fmt.team <= 1 || fmt.id === 'ffa') ? room.maxPlayers : (room.maxPlayers/2);
    return '<div class="ar-lob-team"><h4><span>'+label+'</span><span>'+filled+' / '+teamCap+'</span></h4>'+slotsHtml+'</div>';
  }

  function render(){
    var teamsCount = (fmt.team <= 1 || fmt.id === 'ffa') ? 1 : 2;
    var you = roster[0];
    var allReady = roster.length === room.maxPlayers && roster.every(function(r){ return r.ready; });
    var canStart = roster[0].ready && (room.isHost || allReady);

    card.innerHTML = ''
      + '<div class="ar-lob-main">'
      +   '<div class="ar-lob-h">'
      +     '<div class="ar-lob-t">'+game.emoji+' '+game.name+' <span class="ar-lob-fmt">'+fmt.emoji+' '+fmt.name+'</span></div>'
      +     '<button class="ar-mod-x" onclick="ArenaLobby.close()">×</button>'
      +   '</div>'
      +   '<div class="ar-lob-meta">'
      +     '<span>🎁 ₦'+room.prize.toLocaleString()+'</span>'
      +     '<span>🌍 '+(room.scope === 'state' ? room.state : room.scope)+'</span>'
      +     '<span>⏱ '+game.duration+'</span>'
      +     '<span>👥 '+roster.length+' / '+room.maxPlayers+'</span>'
      +     (room.isHost ? '<span style="background:rgba(16,185,129,.15);color:#6ee7b7;border-color:rgba(16,185,129,.4)">👑 You\'re hosting</span>' : '')
      +   '</div>'
      +   '<div class="ar-lob-teams '+(teamsCount===1?'solo':'')+'">'
      +     teamBlock(0)
      +     (teamsCount === 2 ? teamBlock(1) : '')
      +   '</div>'
      +   '<div class="ar-lob-actions">'
      +     '<button class="ar-spec" onclick="ArenaLobby.toggleReady()">'+(you.ready?'✓ Ready':'I\'m ready')+'</button>'
      +     '<button class="ar-watch-btn" onclick="ArenaLobby.watchLive()">👁 Watch a live match</button>'
      +     '<button class="ar-cta" onclick="ArenaLobby.start()" '+(canStart?'':'disabled style="opacity:.5;cursor:not-allowed"')+'>Start match →</button>'
      +   '</div>'
      + '</div>'
      + '<div class="ar-lob-chat">'
      +   '<div class="ar-lob-chat-h">💬 Lobby chat <span style="margin-left:auto;font-size:.7rem;color:rgba(255,255,255,.5);font-weight:600">'+roster.length+' online</span></div>'
      +   '<div class="ar-lob-feed" id="arLobFeed"></div>'
      +   '<div class="ar-lob-quick">'
      +     '<button onclick="ArenaLobby.quick(&quot;GLHF! 🍀&quot;)">GLHF</button>'
      +     '<button onclick="ArenaLobby.quick(&quot;Let&#39;s go! 🔥&quot;)">Let&#39;s go</button>'
      +     '<button onclick="ArenaLobby.quick(&quot;Ready ✅&quot;)">Ready</button>'
      +     '<button onclick="ArenaLobby.quick(&quot;Wait for me 🙏&quot;)">Wait</button>'
      +     '<button onclick="ArenaLobby.quick(&quot;GG 🤝&quot;)">GG</button>'
      +   '</div>'
      +   '<div class="ar-lob-chat-in">'
      +     '<input id="arLobChatIn" placeholder="Say something… (Enter to send)" maxlength="160" />'
      +     '<button onclick="ArenaLobby.send()">Send</button>'
      +   '</div>'
      + '</div>';

    var feed = card.querySelector('#arLobFeed');
    feed.innerHTML = ArenaLobby._feed.map(function(msg){
      if (msg.sys) return '<div class="ar-lob-msg sys">'+msg.text+'</div>';
      return '<div class="ar-lob-msg '+(msg.me?'me':'')+'"><b>'+msg.from+'</b>'+msg.text+'</div>';
    }).join('');
    feed.scrollTop = feed.scrollHeight;

    var input = card.querySelector('#arLobChatIn');
    if (input){
      input.addEventListener('keydown', function(e){
        if (e.key === 'Enter'){ e.preventDefault(); ArenaLobby.send(); }
      });
    }
  }

  window.ArenaLobby = {
    _feed: [],
    _timers: [],
    _push: function(msg){
      this._feed.push(msg);
      if (this._feed.length > 80) this._feed.shift();
      var feed = card.querySelector('#arLobFeed');
      if (feed){
        feed.innerHTML += msg.sys
          ? '<div class="ar-lob-msg sys">'+msg.text+'</div>'
          : '<div class="ar-lob-msg '+(msg.me?'me':'')+'"><b>'+msg.from+'</b>'+msg.text+'</div>';
        feed.scrollTop = feed.scrollHeight;
      }
    },
    toggleReady: function(){
      roster[0].ready = !roster[0].ready;
      this._push({ sys:true, text: roster[0].ready ? 'You are now ready ✅' : 'You are no longer ready' });
      render();
    },
    quick: function(text){ this._push({ from:p.name, text:text, me:true }); },
    send: function(){
      var input = card.querySelector('#arLobChatIn');
      if (!input) return;
      var text = (input.value || '').trim();
      if (!text) return;
      input.value = '';
      var f = (window.SocialDB && SocialDB.filter) ? SocialDB.filter(text) : { clean:text, hits:[] };
      this._push({ from:p.name, text:f.clean, me:true });
      if (f.hits.length){ this._push({ sys:true, text:'⚠️ Personal info auto-removed from your message' }); }
    },
    start: function(){ this.close(true); openGameModal(room, game); },
    watchLive: function(){
      // Spawn a live in-progress room of the same game/format and jump into spectate
      var liveRoom = {
        id: 'live_'+rid(),
        classGroup: room.classGroup,
        scope: room.scope,
        state: room.state,
        gameId: room.gameId,
        gameName: room.gameName,
        gameEmoji: room.gameEmoji,
        duration: room.duration,
        players: [],
        maxPlayers: room.maxPlayers,
        format: room.format,
        formatName: room.formatName,
        formatEmoji: room.formatEmoji,
        teamSize: room.teamSize,
        status: 'live',
        viewers: 12 + Math.floor(Math.random()*180),
        scores: {},
        startedSecAgo: 8 + Math.floor(Math.random()*120),
        prize: room.prize,
        createdAt: nowMs()
      };
      // Fill with bot players to spectate
      var n = Math.max(2, Math.min(room.maxPlayers, fmt.size));
      for (var i=0;i<n;i++){
        var pl = { uid:'bot_'+rid(), name:botName(), avatar:botAvatar(), state:STATES[Math.floor(Math.random()*STATES.length)], bot:true };
        liveRoom.players.push(pl);
        liveRoom.scores[pl.uid] = Math.floor(Math.random()*120);
      }
      this.close(true);
      openSpectator(liveRoom);
    },
    close: function(keepFeed){
      this._timers.forEach(function(t){ clearTimeout(t); clearInterval(t); });
      this._timers = [];
      var n = document.getElementById('arLobbyModal'); if (n) n.remove();
      if (!keepFeed) this._feed = [];
    }
  };

  ArenaLobby._push({ sys:true, text:'Welcome to the '+fmt.name+' lobby — '+room.maxPlayers+' players · ₦'+room.prize.toLocaleString()+' prize' });
  var greetings = ['Hey hey 👋','GL everyone','Naija stand up 🇳🇬','I\'m on mobile o','Quick match abeg','Anyone from Lagos?','First time here','Let\'s warm up'];
  var initialOthers = roster.slice(1);
  initialOthers.slice(0, Math.min(4, initialOthers.length)).forEach(function(pl, i){
    ArenaLobby._timers.push(setTimeout(function(){
      ArenaLobby._push({ from:pl.name, text: greetings[Math.floor(Math.random()*greetings.length)] });
    }, 600 + i*900));
  });

  var fillTimer = setInterval(function(){
    if (roster.length >= room.maxPlayers){ clearInterval(fillTimer); return; }
    var newP = { uid:'bot_'+rid(), name:botName(), avatar:botAvatar(), state:STATES[Math.floor(Math.random()*STATES.length)], bot:true, ready: Math.random() < 0.5 };
    roster.push(newP);
    ArenaLobby._push({ sys:true, text: newP.avatar+' '+newP.name+' joined the lobby' });
    render();
  }, 2200 + Math.random()*1800);
  ArenaLobby._timers.push(fillTimer);

  var chatterTimer = setInterval(function(){
    if (roster.length < 2) return;
    var pl = roster[1 + Math.floor(Math.random()*(roster.length-1))];
    if (!pl) return;
    if (Math.random() < 0.35 && !pl.ready){
      pl.ready = true;
      ArenaLobby._push({ sys:true, text: pl.avatar+' '+pl.name+' is ready' });
      render();
    } else {
      var lines = ['👍','let\'s go','ready when you are','easy win','don\'t lag pls','😅','💪','📚 studied for this'];
      ArenaLobby._push({ from:pl.name, text: lines[Math.floor(Math.random()*lines.length)] });
    }
  }, 3500);
  ArenaLobby._timers.push(chatterTimer);

  render();
}

/* ───────────── 7. GAME MODAL ───────────── */
function openGameModal(room, game){
  var p = getProfile();
  var m = document.createElement('div');
  m.className = 'ar-modal';
  m.id = 'arGameModal';
  m.innerHTML = ''
    + '<div class="ar-modal-card">'
    +   '<div class="ar-mod-h">'
    +     '<div class="ar-mod-t">'+game.emoji+' '+game.name+'</div>'
    +     '<button class="ar-mod-x" onclick="ArenaUI._closeGame()">×</button>'
    +   '</div>'
    +   '<div class="ar-prize-banner">🎁 Prize pool: <b>₦'+room.prize.toLocaleString()+'</b> · '+room.scope+' · '+CLASS_GROUPS.find(function(g){return g.id===room.classGroup;}).name+'</div>'
    +   '<div class="ar-game-stage" id="arGameStage">'
    +     '<div style="font-size:.9rem;color:rgba(255,255,255,.7);max-width:380px">'+game.desc+'</div>'
    +     '<div class="ar-room-players" style="margin:6px 0">'
    +       '<span class="ar-pchip" title="'+p.name+'" style="background:#3b82f6">'+p.avatar+'</span>'
    +       room.players.slice(0,4).map(function(pl){return '<span class="ar-pchip">'+pl.avatar+'</span>';}).join('')
    +     '</div>'
    +     '<button class="ar-join" style="max-width:200px" onclick="ArenaUI._startGame(\''+game.id+'\','+JSON.stringify(room).replace(/"/g,'&quot;').replace(/'/g,"&#39;")+')">Start match →</button>'
    +   '</div>'
    + '</div>';
  document.body.appendChild(m);
  ArenaUI._currentRoom = room;
  ArenaUI._currentGame = game;
}

ArenaUI._closeGame = function(){
  var m = document.getElementById('arGameModal'); if (m) m.remove();
  ArenaUI.refresh();
};
ArenaUI._startGame = function(gameId, roomJson){
  var game = GAMES.find(function(g){ return g.id === gameId; });
  var room = ArenaUI._currentRoom;
  var stage = document.getElementById('arGameStage');
  // ── Live opponent ticker (bots play in parallel; same data shape as
  //    real users will have once accounts/DB are wired) ──
  var oppWrap = document.createElement('div');
  oppWrap.id = 'arOppStrip';
  oppWrap.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:-6px 0 10px;font-size:.74rem';
  var oppState = {};
  room.players.forEach(function(p){
    p._skill = 0.45 + Math.random()*0.45;
    oppState[p.uid] = { score: 0, q: 0 };
  });
  function renderOpp(){
    if (!document.body.contains(oppWrap)) return;
    oppWrap.innerHTML = '<div style="width:100%;text-align:center;color:rgba(255,255,255,.55);font-weight:700;margin-bottom:4px">⚔️ Opponents (live)</div>'
      + room.players.slice(0,5).map(function(p){
        var s = oppState[p.uid];
        return '<div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);padding:5px 10px;border-radius:100px;display:inline-flex;align-items:center;gap:6px">'
          + '<span>'+p.avatar+'</span><b>'+p.name.split(' ')[0]+'</b>'
          + '<span style="color:#34d399;font-weight:800">'+s.score+'</span></div>';
      }).join('');
  }
  setTimeout(function(){ var s = document.getElementById('arGameStage'); if (s && s.parentNode) s.parentNode.insertBefore(oppWrap, s); renderOpp(); }, 0);
  var oppIv = setInterval(function(){
    if (!document.getElementById('arGameModal')){ clearInterval(oppIv); return; }
    room.players.forEach(function(p){
      if (Math.random() < 0.55){
        oppState[p.uid].q++;
        if (Math.random() < p._skill) oppState[p.uid].score += 8 + Math.floor(Math.random()*8);
      }
    });
    renderOpp();
  }, 1600);
  game.play({ stage: stage, room: room, profile: getProfile() }).then(function(result){
    clearInterval(oppIv);
    var me = getProfile();
    // True win = beat the top bot too
    var topBot = 0; for (var k in oppState) if (oppState[k].score > topBot) topBot = oppState[k].score;
    var iWon = (result.score||0) > topBot;
    var xp = Math.max(5, Math.round((result.score||0)));
    me.xp += xp; me.plays += 1; if (iWon) me.wins += 1;
    saveProfile(me);
    var winnerUid = iWon ? me.uid : (room.players[0] ? room.players[0].uid : me.uid);
    ArenaDB.recordMatch({
      id:'mat_'+rid(), roomId: room.id, classGroup: room.classGroup, scope: room.scope, gameId: room.gameId,
      players: [{ uid: me.uid, name: me.name, xp: xp }].concat(room.players.map(function(pp){ return { uid: pp.uid, name: pp.name, xp: oppState[pp.uid] ? oppState[pp.uid].score : 0 }; })),
      winnerUid: winnerUid, finishedAt: nowMs()
    });
    showResult(iWon, result, xp, oppState, room);
  }).catch(function(err){
    clearInterval(oppIv);
    stage.innerHTML = '<div style="color:#fca5a5">Game ended early. '+(err && err.message ? err.message : '')+'</div><button class="ar-join" style="max-width:160px" onclick="ArenaUI._closeGame()">Close</button>';
  });
};

function showResult(iWon, result, xp, oppState, room){
  var stage = document.getElementById('arGameStage');
  if (!stage) return;
  var board = '';
  if (oppState && room){
    var rows = [{ name:'You', score: result.score||0, you:true }]
      .concat(room.players.map(function(p){ return { name:p.name, score: (oppState[p.uid]||{}).score||0, avatar:p.avatar }; }));
    rows.sort(function(a,b){ return b.score - a.score; });
    board = '<div style="width:100%;max-width:340px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px;margin-top:6px">'
      + '<div style="font-weight:800;font-size:.78rem;color:rgba(255,255,255,.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Final scoreboard</div>'
      + rows.map(function(r,i){
          var medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
          return '<div style="display:flex;justify-content:space-between;padding:4px 2px;'+(r.you?'color:#fcd34d;font-weight:800':'')+'"><span>'+medal+' '+(r.avatar||'🧑')+' '+r.name+'</span><b>'+r.score+'</b></div>';
        }).join('') + '</div>';
  }
  stage.innerHTML = ''
    + '<div style="font-size:3rem">'+(iWon?'🏆':'🎯')+'</div>'
    + '<div class="ar-q">'+(iWon?'You won!':'Good game!')+'</div>'
    + '<div style="font-size:.9rem;color:rgba(255,255,255,.7)">Score: <b>'+(result.score||0)+'</b> · +'+xp+' XP</div>'
    + (result.correct!=null ? '<div style="font-size:.82rem;color:rgba(255,255,255,.55)">'+result.correct+' correct of '+result.total+'</div>' : '')
    + board
    + '<div style="display:flex;gap:8px"><button class="ar-spec" onclick="ArenaUI._closeGame()">Back to lobby</button>'
    + '<button class="ar-join" style="max-width:180px" onclick="ArenaUI._closeGame();setTimeout(function(){ArenaUI.refresh();},100)">Play again →</button></div>';
}

/* ───────────── 8. INDIVIDUAL GAMES ───────────── */

function shuffle(a){ a = a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }

function playMathRace(ctx){
  return new Promise(function(resolve){
    var stage = ctx.stage; var score = 0; var correct = 0; var total = 0; var time = 60;
    var lvl = ctx.room.classGroup === 'kids' ? 1 : ctx.room.classGroup === 'juniors' ? 2 : 3;
    function newQ(){
      var a, b, op;
      if (lvl === 1){ a = Math.floor(Math.random()*9)+1; b = Math.floor(Math.random()*9)+1; op = Math.random()<.5?'+':'-'; }
      else if (lvl === 2){ a = Math.floor(Math.random()*30)+5; b = Math.floor(Math.random()*15)+2; op = ['+','-','×'][Math.floor(Math.random()*3)]; }
      else { a = Math.floor(Math.random()*99)+10; b = Math.floor(Math.random()*20)+3; op = ['+','-','×','÷'][Math.floor(Math.random()*4)]; if (op==='÷'){ var ans=Math.floor(Math.random()*12)+2; a = ans*b; } }
      var ans = op==='+'?a+b:op==='-'?a-b:op==='×'?a*b:Math.round(a/b);
      return { q: a+' '+op+' '+b+' = ?', a: ans };
    }
    var q = newQ();
    function render(){
      stage.innerHTML = '<div class="ar-timer">⏱ '+time+'s · <span class="ar-score-pill">'+score+' pts</span></div>'
        + '<div class="ar-q">'+q.q+'</div>'
        + '<input class="ar-input" id="arMathIn" inputmode="numeric" autocomplete="off" placeholder="answer"/>'
        + '<div style="font-size:.78rem;color:rgba(255,255,255,.55)">Press Enter to submit</div>';
      var input = document.getElementById('arMathIn'); input.focus();
      input.onkeydown = function(e){
        if (e.key === 'Enter'){
          total++;
          if (parseInt(input.value,10) === q.a){ score += 10; correct++; }
          q = newQ(); render();
        }
      };
    }
    render();
    var iv = setInterval(function(){ time--; if (time<=0){ clearInterval(iv); resolve({ score: score, correct: correct, total: total, iWon: score >= 80 }); } else render(); }, 1000);
  });
}

function playQuizDuel(ctx){
  var BANK = {
    juniors: [
      { q:'Capital of Nigeria?', opts:['Lagos','Abuja','Ibadan','Kano'], a:1 },
      { q:'How many states does Nigeria have?', opts:['30','35','36','37'], a:2 },
      { q:'Largest river in Nigeria?', opts:['Benue','Niger','Cross','Ogun'], a:1 },
      { q:'Square root of 144?', opts:['10','11','12','14'], a:2 },
      { q:'Plant part that makes food?', opts:['Root','Stem','Leaf','Flower'], a:2 },
      { q:'Author of Things Fall Apart?', opts:['Soyinka','Achebe','Adichie','Okri'], a:1 },
      { q:'H2O is the formula for?', opts:['Salt','Water','Acid','Air'], a:1 }
    ],
    seniors: [
      { q:'sin(90°) equals?', opts:['0','1','-1','½'], a:1 },
      { q:'Newton\'s 2nd law: F = ?', opts:['mv','ma','mg','m/a'], a:1 },
      { q:'pH of pure water?', opts:['5','6','7','8'], a:2 },
      { q:'1914 amalgamation joined?', opts:['North & South','East & West','Yoruba & Igbo','Lagos & Kano'], a:0 },
      { q:'Mitochondria function?', opts:['Photosynthesis','Energy','Storage','Reproduction'], a:1 }
    ],
    prep: [
      { q:'Differential of x³?', opts:['x²','3x²','3x','x³/3'], a:1 },
      { q:'Year Nigeria gained independence?', opts:['1957','1960','1963','1966'], a:1 },
      { q:'Avogadro\'s number ≈?', opts:['6.02×10²³','3.14','9.81','2.71'], a:0 },
      { q:'Speed of light ≈ (m/s)?', opts:['3×10⁵','3×10⁶','3×10⁷','3×10⁸'], a:3 },
      { q:'Currency of Ghana?', opts:['Naira','Cedi','Franc','Rand'], a:1 }
    ],
    kids: [
      { q:'2 + 3 = ?', opts:['4','5','6','7'], a:1 },
      { q:'Which is a fruit?', opts:['Cat','Banana','Car','Hat'], a:1 },
      { q:'Colour of grass?', opts:['Red','Green','Blue','Yellow'], a:1 }
    ]
  };
  return new Promise(function(resolve){
    var pool = shuffle((BANK[ctx.room.classGroup] || BANK.juniors));
    var i = 0, score = 0, correct = 0;
    var stage = ctx.stage;
    function render(){
      if (i >= pool.length){ resolve({ score: score, correct: correct, total: pool.length, iWon: correct >= Math.ceil(pool.length*0.6) }); return; }
      var q = pool[i];
      stage.innerHTML = '<div class="ar-timer">Q '+(i+1)+'/'+pool.length+' · <span class="ar-score-pill">'+score+' pts</span></div>'
        + '<div class="ar-q">'+q.q+'</div>'
        + '<div class="ar-opts">'+q.opts.map(function(o,idx){return '<button class="ar-opt" data-i="'+idx+'">'+o+'</button>';}).join('')+'</div>';
      var t0 = nowMs();
      stage.querySelectorAll('.ar-opt').forEach(function(b){
        b.onclick = function(){
          var picked = parseInt(b.getAttribute('data-i'),10);
          var dt = (nowMs() - t0)/1000;
          if (picked === q.a){
            b.classList.add('right');
            var bonus = Math.max(2, 12 - Math.floor(dt));
            score += 10 + bonus; correct++;
          } else {
            b.classList.add('wrong');
            stage.querySelectorAll('.ar-opt')[q.a].classList.add('right');
          }
          stage.querySelectorAll('.ar-opt').forEach(function(x){ x.disabled = true; });
          setTimeout(function(){ i++; render(); }, 800);
        };
      });
    }
    render();
  });
}

function playSpellingBee(ctx){
  var WORDS = {
    kids: ['cat','sun','milk','book','tree','rice','yam','car','bird','five'],
    juniors: ['knowledge','science','because','beautiful','through','engineer','rhythm','separate','vegetable'],
    seniors: ['parliament','phenomenon','accommodate','conscientious','independence','bureaucracy']
  };
  return new Promise(function(resolve){
    var pool = shuffle(WORDS[ctx.room.classGroup] || WORDS.juniors);
    var i = 0, score = 0, correct = 0;
    var stage = ctx.stage;
    function speak(w){ try{ var u = new SpeechSynthesisUtterance(w); u.rate = .85; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(e){} }
    function render(){
      if (i >= pool.length){ resolve({ score: score, correct: correct, total: pool.length, iWon: correct >= Math.ceil(pool.length*0.7) }); return; }
      var w = pool[i];
      stage.innerHTML = '<div class="ar-timer">Word '+(i+1)+'/'+pool.length+' · <span class="ar-score-pill">'+score+' pts</span></div>'
        + '<div class="ar-q">🔊 Listen and spell</div>'
        + '<button class="ar-spec" id="arSpkBtn">▶ Hear word again</button>'
        + '<input class="ar-input" id="arSpellIn" autocomplete="off" autocapitalize="off" placeholder="type the word"/>'
        + '<div style="font-size:.78rem;color:rgba(255,255,255,.55)">Press Enter</div>';
      document.getElementById('arSpkBtn').onclick = function(){ speak(w); };
      speak(w);
      var inp = document.getElementById('arSpellIn'); inp.focus();
      inp.onkeydown = function(e){
        if (e.key === 'Enter'){
          if (inp.value.trim().toLowerCase() === w.toLowerCase()){ score += 15; correct++; }
          i++; render();
        }
      };
    }
    render();
  });
}

function playMemoryMatch(ctx){
  return new Promise(function(resolve){
    var icons = ['🦁','🐘','🦒','🐢','🐠','🦋','🌻','🍌'];
    var deck = shuffle(icons.concat(icons));
    var stage = ctx.stage;
    var flips = []; var matched = 0; var moves = 0; var t = nowMs();
    function render(){
      stage.innerHTML = '<div class="ar-timer">Moves: '+moves+' · Pairs: '+matched+'/'+icons.length+'</div>'
        + '<div class="ar-mem-grid" id="arMem">'
        + deck.map(function(ic,idx){
            var cls = 'ar-mem-card';
            if (flips.indexOf(idx) !== -1) cls += ' flip';
            if (deck[idx] === '__matched__') cls += ' matched flip';
            var show = (cls.indexOf('flip') !== -1);
            return '<div class="'+cls+'" data-idx="'+idx+'">'+(show ? (deck[idx]==='__matched__'?'✓':deck[idx]) : '?')+'</div>';
          }).join('')
        + '</div>';
      stage.querySelectorAll('.ar-mem-card').forEach(function(c){
        c.onclick = function(){
          var idx = parseInt(c.getAttribute('data-idx'),10);
          if (deck[idx] === '__matched__' || flips.indexOf(idx) !== -1 || flips.length >= 2) return;
          flips.push(idx); render();
          if (flips.length === 2){
            moves++;
            var a = flips[0], b = flips[1];
            if (deck[a] === deck[b]){
              deck[a] = '__matched__'; deck[b] = '__matched__'; matched++; flips = []; render();
              if (matched === icons.length){
                var dt = Math.round((nowMs()-t)/1000);
                var sc = Math.max(20, 200 - moves*4 - dt);
                resolve({ score: sc, correct: matched, total: icons.length, iWon: moves <= icons.length+4 });
              }
            } else {
              setTimeout(function(){ flips = []; render(); }, 700);
            }
          }
        };
      });
    }
    render();
  });
}

function playGeoSprint(ctx){
  var QS = [
    { q:'Capital of Lagos State?', opts:['Lagos','Ikeja','Badagry','Epe'], a:1 },
    { q:'River Niger empties into?', opts:['Atlantic Ocean','Indian Ocean','Lake Chad','Mediterranean'], a:0 },
    { q:'Capital of France?', opts:['Lyon','Paris','Marseille','Nice'], a:1 },
    { q:'Largest desert in Africa?', opts:['Kalahari','Namib','Sahara','Gobi'], a:2 },
    { q:'Capital of Kano State?', opts:['Kano','Wudil','Bichi','Dawakin'], a:0 },
    { q:'Mt Kilimanjaro is in?', opts:['Kenya','Tanzania','Uganda','Ethiopia'], a:1 },
    { q:'Capital of Anambra State?', opts:['Onitsha','Awka','Nnewi','Aguata'], a:1 }
  ];
  return new Promise(function(resolve){
    var pool = shuffle(QS); var i=0, score=0, correct=0, time=90;
    var stage = ctx.stage;
    function render(){
      if (i >= pool.length || time<=0){ resolve({ score:score, correct:correct, total:i, iWon: correct >= Math.ceil(pool.length*0.6) }); return; }
      var q = pool[i];
      stage.innerHTML = '<div class="ar-timer">⏱ '+time+'s · Q '+(i+1)+'/'+pool.length+' · <span class="ar-score-pill">'+score+' pts</span></div>'
        + '<div class="ar-q">'+q.q+'</div>'
        + '<div class="ar-opts">'+q.opts.map(function(o,idx){return '<button class="ar-opt" data-i="'+idx+'">'+o+'</button>';}).join('')+'</div>';
      stage.querySelectorAll('.ar-opt').forEach(function(b){
        b.onclick = function(){
          if (parseInt(b.getAttribute('data-i'),10) === q.a){ score += 12; correct++; b.classList.add('right'); }
          else { b.classList.add('wrong'); stage.querySelectorAll('.ar-opt')[q.a].classList.add('right'); }
          stage.querySelectorAll('.ar-opt').forEach(function(x){ x.disabled = true; });
          setTimeout(function(){ i++; render(); }, 600);
        };
      });
    }
    render();
    var iv = setInterval(function(){ time--; if (time<=0 || i>=pool.length){ clearInterval(iv); } }, 1000);
  });
}

function playWordBuilder(ctx){
  return new Promise(function(resolve){
    var letterSets = ['AEIOSTLN','AEIRSCDM','AEOULNTP','AEISTRPC','AEIOUNRTH'];
    var letters = letterSets[Math.floor(Math.random()*letterSets.length)].split('');
    var DICT = ['rain','tail','tale','tales','trail','snail','slate','stain','satin','rose','dose','dare','dame','sale','seal','tan','sit','let','net','set','line','pile','pale','pane','plate','later','alert','noise','toilet','rate','rates','star','arts','sat','rat'];
    var stage = ctx.stage; var time = 90; var score = 0; var found = [];
    function valid(w){
      w = w.toLowerCase();
      if (w.length < 3) return false;
      if (DICT.indexOf(w) === -1) return false;
      if (found.indexOf(w) !== -1) return false;
      var pool = letters.join('').toLowerCase().split('');
      for (var i=0;i<w.length;i++){
        var idx = pool.indexOf(w[i]);
        if (idx === -1) return false;
        pool.splice(idx,1);
      }
      return true;
    }
    function render(){
      stage.innerHTML = '<div class="ar-timer">⏱ '+time+'s · <span class="ar-score-pill">'+score+' pts</span></div>'
        + '<div class="ar-q">Letters: <span style="letter-spacing:.4em;font-size:1.5rem">'+letters.join('')+'</span></div>'
        + '<input class="ar-input" id="arWordIn" autocomplete="off" autocapitalize="off" placeholder="type a word"/>'
        + '<div style="font-size:.74rem;color:rgba(255,255,255,.55);max-width:300px">Found ('+found.length+'): '+found.join(', ')+'</div>';
      var inp = document.getElementById('arWordIn'); inp.focus();
      inp.onkeydown = function(e){
        if (e.key === 'Enter'){
          var w = inp.value.trim().toLowerCase();
          if (valid(w)){ found.push(w); score += 5 + w.length*2; }
          inp.value = ''; render();
        }
      };
    }
    render();
    var iv = setInterval(function(){ time--; if (time<=0){ clearInterval(iv); resolve({ score:score, correct:found.length, total:found.length, iWon: score >= 60 }); } else render(); }, 1000);
  });
}

/* ───────────── 9. PUBLIC OPEN HOOK ───────────── */

/* ───────────── 8B. SPECTATOR (live watch + chat) ───────────── */
function openSpectator(room){
  // Live spectator: drives the scoreboard from the SAME question bank the
  // real games use, so when accounts/DB land we just swap bot answers for
  // real ones streamed from Firestore. Each tick is a structured event.
  var modal = document.createElement('div');
  modal.className = 'ar-spec-modal';
  modal.innerHTML = ''
    + '<div class="ar-spec-wrap">'
    +   '<div class="ar-spec-stage">'
    +     '<div class="ar-spec-top">'
    +       '<div class="ar-spec-title"><span class="ar-live-badge"><span class="ar-live-dot"></span> Live</span> '+room.gameEmoji+' '+room.gameName+'</div>'
    +       '<div class="ar-spec-meta">'
    +         '<span class="ar-vbadge">👁 <b id="specViewers">'+room.viewers+'</b></span>'
    +         '<span class="ar-vbadge">⏱ <b id="specClock">'+Math.floor(room.startedSecAgo)+'</b>s</span>'
    +         '<span class="ar-vbadge">🎁 ₦'+room.prize.toLocaleString()+'</span>'
    +         '<button class="ar-spec-x" id="specClose">Close</button>'
    +       '</div>'
    +     '</div>'
    +     '<div class="ar-fair">🛡️ <b>Fair-play mode:</b> question text is hidden while the round is live so no one watching can help. The answer is revealed after every player has answered.</div>'
    +     '<div class="ar-spec-board" id="specBoard" style="position:relative"><div class="ar-cheer-layer" id="specCheerLayer"></div></div>'
    +   '</div>'
    +   '<aside class="ar-spec-side">'
    +     '<div style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);font-weight:800;display:flex;align-items:center;gap:8px"><span class="ar-live-dot"></span>Play-by-play & cheer</div>'
    +     '<div class="ar-spec-watchers" id="specWatchers"></div>'
    +     '<div class="ar-spec-feed" id="specFeed"></div>'
    +     '<div class="ar-spec-quick">'
    +       '<button onclick="window._arSpecChat(\'🔥\')">🔥</button>'
    +       '<button onclick="window._arSpecChat(\'👏\')">👏</button>'
    +       '<button onclick="window._arSpecChat(\'GG!\')">GG!</button>'
    +       '<button onclick="window._arSpecChat(\'You got this!\')">You got this!</button>'
    +       '<button onclick="window._arSpecChat(\'😂\')">😂</button>'
    +     '</div>'
    +     '<div class="ar-spec-chat">'
    +       '<input id="specChatIn" placeholder="Send a message…" maxlength="80" />'
    +       '<button onclick="window._arSpecChat()">Send</button>'
    +     '</div>'
    +   '</aside>'
    + '</div>';
  document.body.appendChild(modal);

  var me = getProfile();
  // Other watchers in the room — fake but feels alive (we'll wire to real
  // presence when accounts land).
  var watchers = [];
  for (var w=0; w<Math.min(8, Math.max(2, Math.floor(room.viewers/14))); w++){
    watchers.push({ name:botName(), avatar:botAvatar() });
  }
  function renderWatchers(){
    var el = document.getElementById('specWatchers'); if (!el) return;
    el.innerHTML = '<span style="font-weight:800;color:rgba(255,255,255,.8)">👁 Watching:</span> '
      + '<span class="ar-pchip" title="'+me.name+'" style="background:#3b82f6">'+me.avatar+'</span>'
      + watchers.slice(0,7).map(function(w){ return '<span class="ar-pchip" title="'+w.name+'">'+w.avatar+'</span>'; }).join('')
      + (watchers.length > 7 ? '<span style="margin-left:6px">+'+(watchers.length-7)+' more</span>' : '');
  }
  renderWatchers();

  // Floating cheer reaction layer (stadium feel)
  function flyCheer(emoji){
    var layer = document.getElementById('specCheerLayer'); if (!layer) return;
    var n = document.createElement('div');
    n.className = 'ar-cheer';
    n.textContent = emoji;
    n.style.left = (5 + Math.random()*90) + '%';
    n.style.fontSize = (1.3 + Math.random()*1.2) + 'rem';
    layer.appendChild(n);
    setTimeout(function(){ if (n.parentNode) n.parentNode.removeChild(n); }, 2500);
  }

  var players = room.players.slice();
  // Fresh score baseline
  var scores = {};
  var stats  = {}; // per-player: correct, total, streak
  players.forEach(function(p){
    scores[p.uid] = (room.scores && room.scores[p.uid]) || 0;
    // Each bot has a "skill" 0.45–0.92 → drives answer accuracy and speed
    p._skill = p._skill || (0.45 + Math.random()*0.47);
    stats[p.uid] = { correct: 0, total: 0, streak: 0 };
  });
  var maxFor = function(){ var m = 0; for (var k in scores) if (scores[k]>m) m = scores[k]; return Math.max(m, 100); };

  function renderBoard(){
    var board = document.getElementById('specBoard'); if (!board) return;
    var sorted = players.slice().sort(function(a,b){ return (scores[b.uid]||0) - (scores[a.uid]||0); });
    var top = maxFor();
    board.innerHTML = sorted.map(function(p, i){
      var sc = scores[p.uid] || 0;
      var pct = Math.round((sc/top)*100);
      return '<div class="ar-spec-row">'
        + '<div class="ar-spec-rank">'+(i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1))+'</div>'
        + '<div class="ar-spec-av">'+p.avatar+'</div>'
        + '<div><div class="ar-spec-name">'+p.name+'</div><div class="ar-spec-state">'+(p.state||'')+'</div></div>'
        + '<div class="ar-spec-bar"><i style="width:'+pct+'%"></i></div>'
        + '<div class="ar-spec-score">'+sc+' pts</div>'
        + '</div>';
    }).join('');
  }
  renderBoard();

  // Seed feed
  var feed = document.getElementById('specFeed');
  function pushFeed(html, cls){
    var div = document.createElement('div');
    div.className = 'ar-feed-msg' + (cls?' '+cls:'');
    div.innerHTML = html;
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;
    // Cap to 60 messages
    while (feed.children.length > 60) feed.removeChild(feed.firstChild);
  }
  pushFeed('You\'re now spectating this live match. Cheer them on!', 'sys');
  pushFeed('<b>Match:</b> '+room.gameName+' · prize ₦'+room.prize.toLocaleString(), 'sys');

  // ── Real question bank for this game/class ──
  var qBank = getQuestionBank(room.gameId, room.classGroup);
  var qIdx = 0;
  function nextQ(){ var q = qBank[qIdx % qBank.length]; qIdx++; return q; }
  var currentQ = nextQ();
  // Anti-cheat: never reveal the question text to spectators while live
  pushFeed('<b>Q'+qIdx+'</b> in progress — question hidden 🔒', 'sys');

  // Tick: every ~1.6s a player answers / scores / a viewer joins
  var clockEl = document.getElementById('specClock');
  var viewEl  = document.getElementById('specViewers');
  var clock = Math.floor(room.startedSecAgo);
  var views = room.viewers;
  var EMO = ['🔥','💯','😅','😎','🤯','👏','😂','🙌','🎯'];
  var BOT_CHATS = ['Up Lagos!','Naija no dey carry last 💪','Who else watching?','That last one was tough','Easy money 🤑','GO GO GO!','Spelling Bee is hard sha','Math Race is wild today'];
  var answeredThisQ = {}; // uid -> true once they've buzzed in

  function tick(){
    if (!document.body.contains(modal)) return;
    clock++;
    if (clockEl) clockEl.textContent = clock;
    // Viewer churn
    views += (Math.random()<0.7?1:0) - (Math.random()<0.2?1:0);
    if (views < 0) views = 0;
    if (viewEl) viewEl.textContent = views;
    // A player who hasn't answered the current Q "buzzes in"
    var unanswered = players.filter(function(pp){ return !answeredThisQ[pp.uid]; });
    if (unanswered.length){
      var p = unanswered[Math.floor(Math.random()*unanswered.length)];
      // Speed bonus: earlier buzz, more pts (mirrors playQuizDuel scoring)
      var buzzOrder = players.length - unanswered.length; // 0,1,2…
      var isCorrect = Math.random() < p._skill;
      stats[p.uid].total++;
      if (isCorrect){
        stats[p.uid].correct++;
        stats[p.uid].streak++;
        var bonus = Math.max(2, 12 - buzzOrder*2);
        var delta = 10 + bonus + (stats[p.uid].streak >= 3 ? 5 : 0);
        scores[p.uid] += delta;
        var streakTxt = stats[p.uid].streak >= 3 ? ' 🔥x'+stats[p.uid].streak : '';
        // Anti-cheat: don't print which option they picked while round is live
        pushFeed('<b>'+p.avatar+' '+p.name+'</b> answered correctly · +'+delta+' pts'+streakTxt+' '+EMO[Math.floor(Math.random()*EMO.length)], 'right');
      } else {
        stats[p.uid].streak = 0;
        pushFeed('<b>'+p.avatar+' '+p.name+'</b> answered — wrong · 0 pts', 'wrong');
      }
      answeredThisQ[p.uid] = true;
      renderBoard();
    } else {
      // Round over → NOW it's safe to reveal both Q and A
      pushFeed('Round '+qIdx+' over.<br><b>Q:</b> '+escapeHtml(currentQ.q)+'<br><b>Answer:</b> '+escapeHtml(currentQ.opts ? currentQ.opts[currentQ.a] : (currentQ.a+'')), 'sys');
      currentQ = nextQ();
      answeredThisQ = {};
      pushFeed('<b>Q'+qIdx+'</b> in progress — question hidden 🔒', 'sys');
    }
    // Occasional bot chat
    if (Math.random() < 0.28){
      var who = botName();
      var av = botAvatar();
      pushFeed('<b>'+av+' '+who+':</b> '+ BOT_CHATS[Math.floor(Math.random()*BOT_CHATS.length)]);
      // 50% of bot chats also throw a cheer emoji on stage
      if (Math.random() < 0.5) flyCheer(EMO[Math.floor(Math.random()*EMO.length)]);
    }
    // New watcher joining
    if (Math.random() < 0.18){
      watchers.push({ name:botName(), avatar:botAvatar() });
      renderWatchers();
    }
    setTimeout(tick, 1200 + Math.random()*1100);
  }
  setTimeout(tick, 600);

  // Chat send + cheer reaction
  window._arSpecChat = function(canned){
    var input = document.getElementById('specChatIn');
    var msg = canned || (input ? input.value.trim() : '');
    if (!msg) return;
    var raw = msg.replace(/[<>]/g,'');
    var f = (window.SocialDB && SocialDB.filter) ? SocialDB.filter(raw) : { clean:raw, hits:[] };
    var clean = f.clean;
    pushFeed('<b style="color:#fcd34d">'+me.avatar+' '+me.name+' (you):</b> '+clean);
    if (f.hits.length){ pushFeed('⚠️ Personal info auto-removed from your message','sys'); }
    // Detect emoji-only / short reactions and float them on stage
    var firstChar = Array.from(clean)[0] || '';
    if (/[\p{Emoji}]/u.test(firstChar)) flyCheer(firstChar);
    if (input && !canned) input.value = '';
  };
  var chatIn = document.getElementById('specChatIn');
  if (chatIn){ chatIn.addEventListener('keydown', function(e){ if (e.key==='Enter') window._arSpecChat(); }); }

  // Close
  function closeSpec(){ if (document.body.contains(modal)) document.body.removeChild(modal); window._arSpecChat = null; document.removeEventListener('keydown', escKey); }
  function escKey(e){ if (e.key === 'Escape') closeSpec(); }
  document.getElementById('specClose').onclick = closeSpec;
  document.addEventListener('keydown', escKey);
}

/* ───────────── QUESTION BANK ACCESS (Firestore-ready) ─────────────
   Single source of truth. When DB is wired we'll fetch from
   arena_questions/{gameId}/{classGroup} instead of this in-memory bank.
   Spectator and live matches both call getQuestionBank() so behaviour
   stays identical when bots become real players. */
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
function getQuestionBank(gameId, classGroup){
  // Quiz-style games share the trivia bank used by playQuizDuel
  var QUIZ = {
    juniors: [
      { q:'Capital of Nigeria?', opts:['Lagos','Abuja','Ibadan','Kano'], a:1 },
      { q:'How many states does Nigeria have?', opts:['30','35','36','37'], a:2 },
      { q:'Largest river in Nigeria?', opts:['Benue','Niger','Cross','Ogun'], a:1 },
      { q:'Square root of 144?', opts:['10','11','12','14'], a:2 },
      { q:'Plant part that makes food?', opts:['Root','Stem','Leaf','Flower'], a:2 },
      { q:'Author of Things Fall Apart?', opts:['Soyinka','Achebe','Adichie','Okri'], a:1 },
      { q:'H2O is the formula for?', opts:['Salt','Water','Acid','Air'], a:1 },
      { q:'First president of Nigeria?', opts:['Azikiwe','Balewa','Awolowo','Obasanjo'], a:0 },
      { q:'Which gas do plants release?', opts:['CO₂','Oxygen','Nitrogen','Hydrogen'], a:1 }
    ],
    seniors: [
      { q:'sin(90°) equals?', opts:['0','1','-1','½'], a:1 },
      { q:'Newton\'s 2nd law: F = ?', opts:['mv','ma','mg','m/a'], a:1 },
      { q:'pH of pure water?', opts:['5','6','7','8'], a:2 },
      { q:'1914 amalgamation joined?', opts:['North & South','East & West','Yoruba & Igbo','Lagos & Kano'], a:0 },
      { q:'Mitochondria function?', opts:['Photosynthesis','Energy','Storage','Reproduction'], a:1 },
      { q:'Acid + base →?', opts:['Salt + water','Gas','Oxide','Metal'], a:0 },
      { q:'Ohm\'s law: V = ?', opts:['IR','I/R','I+R','I−R'], a:0 }
    ],
    prep: [
      { q:'Differential of x³?', opts:['x²','3x²','3x','x³/3'], a:1 },
      { q:'Year Nigeria gained independence?', opts:['1957','1960','1963','1966'], a:1 },
      { q:'Avogadro\'s number ≈?', opts:['6.02×10²³','3.14','9.81','2.71'], a:0 },
      { q:'Speed of light ≈ (m/s)?', opts:['3×10⁵','3×10⁶','3×10⁷','3×10⁸'], a:3 },
      { q:'Currency of Ghana?', opts:['Naira','Cedi','Franc','Rand'], a:1 },
      { q:'∫ 2x dx =?', opts:['x²+C','2+C','x+C','2x²+C'], a:0 }
    ],
    kids: [
      { q:'2 + 3 = ?', opts:['4','5','6','7'], a:1 },
      { q:'Which is a fruit?', opts:['Cat','Banana','Car','Hat'], a:1 },
      { q:'Colour of grass?', opts:['Red','Green','Blue','Yellow'], a:1 },
      { q:'How many legs does a dog have?', opts:['2','3','4','5'], a:2 },
      { q:'5 - 2 = ?', opts:['1','2','3','4'], a:2 }
    ]
  };
  var GEO = [
    { q:'Capital of Lagos State?', opts:['Lagos','Ikeja','Badagry','Epe'], a:1 },
    { q:'River Niger empties into?', opts:['Atlantic Ocean','Indian Ocean','Lake Chad','Mediterranean'], a:0 },
    { q:'Capital of France?', opts:['Lyon','Paris','Marseille','Nice'], a:1 },
    { q:'Largest desert in Africa?', opts:['Kalahari','Namib','Sahara','Gobi'], a:2 },
    { q:'Capital of Kano State?', opts:['Kano','Wudil','Bichi','Dawakin'], a:0 },
    { q:'Mt Kilimanjaro is in?', opts:['Kenya','Tanzania','Uganda','Ethiopia'], a:1 },
    { q:'Capital of Anambra State?', opts:['Onitsha','Awka','Nnewi','Aguata'], a:1 }
  ];
  if (gameId === 'geo-sprint') return shuffle(GEO);
  if (gameId === 'math-race'){
    var bank = []; for (var i=0;i<10;i++){
      var a = 5 + Math.floor(Math.random()*40), b = 2 + Math.floor(Math.random()*15);
      bank.push({ q: a+' + '+b+' = ?', opts:[(a+b-1)+'',(a+b)+'',(a+b+1)+'',(a+b+2)+''], a:1 });
    }
    return bank;
  }
  if (gameId === 'spelling-bee'){
    return ['knowledge','science','rhythm','separate','vegetable','engineer','beautiful'].map(function(w){
      return { q:'Spell: "'+w+'"', opts:[w, w.replace(/(.)$/,'$1$1'), w.split('').reverse().join(''), w.toUpperCase()], a:0 };
    });
  }
  return shuffle(QUIZ[classGroup] || QUIZ.juniors);
}

window.openArena = function(){
  // Hide other pages
  document.querySelectorAll('.page.active').forEach(function(p){ p.classList.remove('active'); });
  ArenaUI.open();
  document.getElementById('pg-arena').classList.add('active');
  // History so back button works
  try { history.pushState({pg:'pg-arena'}, '', '#arena'); } catch(e){}
};

// Also wire to goTo so the spotlight system finds it
var origGoTo = window.goTo;
window.goTo = function(pid){
  if (pid === 'pg-arena'){ window.openArena(); return; }
  if (typeof origGoTo === 'function') return origGoTo.apply(this, arguments);
};
if (origGoTo && origGoTo.__lt_spot_wrapped) window.goTo.__lt_spot_wrapped = true;

window.ArenaUI = ArenaUI;
window.ArenaDB = ArenaDB; // exposed so we can later swap to Firestore-backed adapter
})();
