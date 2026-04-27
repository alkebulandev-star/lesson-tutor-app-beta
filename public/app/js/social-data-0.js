/* ───────────── SOCIAL DATA LAYER (stub) ─────────────
   Single source of truth for all social features. TODAY this reads/writes
   localStorage. WHEN Lovable Cloud is wired, swap each function body to a
   Supabase call — the signatures stay the same so no UI change needed.

   Tables we'll create later (kept in sync with these names):
     social_profiles   (user_id, display_name, avatar, class_group, school, state, fav_subjects[], bio)
     social_follows    (follower_id, followee_id, created_at)
     social_threads    (id, user_a, user_b, last_msg_at)        -- DM threads
     social_messages   (id, thread_id, from_user, body, redacted, created_at)
     social_reports    (id, reporter_id, target_type, target_id, reason, created_at)
*/
(function(){
  var LS = window.localStorage;
  var KEY_PROFILES  = 'lt_social_profiles_v1';
  var KEY_FOLLOWS   = 'lt_social_follows_v1';
  var KEY_THREADS   = 'lt_social_threads_v1';
  var KEY_MESSAGES  = 'lt_social_messages_v1';
  var KEY_REPORTS   = 'lt_social_reports_v1';
  var KEY_ME        = 'lt_social_me_v1';

  function read(k, dflt){ try { return JSON.parse(LS.getItem(k)) || dflt; } catch(e){ return dflt; } }
  function write(k, v){ try { LS.setItem(k, JSON.stringify(v)); } catch(e){} }
  function uid(){ return 'u_' + Math.random().toString(36).slice(2,10); }
  function now(){ return Date.now(); }

  // ── Seed a few sample classmates so follow/DM screens aren't empty.
  //    Real users will replace these once Cloud is wired. ──
  function seedIfEmpty(){
    var profiles = read(KEY_PROFILES, null);
    if (profiles) return;
    profiles = {};
    var seeds = [
      { name:'Adaeze O.',  avatar:'🦊', classGroup:'seniors', school:'Queens College Lagos', state:'Lagos',     fav:['Maths','Physics'],   bio:'SS2 · loves equations' },
      { name:'Tunde A.',   avatar:'🦅', classGroup:'seniors', school:'Kings College Lagos',  state:'Lagos',     fav:['English','Lit'],     bio:'WAEC season 💪' },
      { name:'Chiamaka N.',avatar:'🦋', classGroup:'juniors', school:'Loyola Jesuit',         state:'FCT - Abuja', fav:['Biology','CRS'],     bio:'JSS3 prefect' },
      { name:'Bola I.',    avatar:'🐯', classGroup:'juniors', school:'Air Force Sec School',  state:'Kaduna',    fav:['Maths','Geography'], bio:'reading is fun' },
      { name:'Ngozi E.',   avatar:'🦄', classGroup:'prep',    school:'Nigerian Tutor Centre', state:'Anambra',   fav:['JAMB','Maths'],      bio:'JAMB warrior 📚' },
      { name:'Femi K.',    avatar:'🐼', classGroup:'kids',    school:'Greensprings',          state:'Lagos',     fav:['English','Art'],     bio:'P5 · I love drawing' },
      { name:'Aisha M.',   avatar:'🐧', classGroup:'kids',    school:'Hillcrest School',      state:'Plateau',   fav:['Maths','Science'],   bio:'P4 · spelling bee champ' },
      { name:'Ibrahim S.', avatar:'🦖', classGroup:'seniors', school:'Federal Govt College',  state:'Kano',      fav:['Chemistry','Maths'], bio:'future doctor' }
    ];
    seeds.forEach(function(s){ var id = uid(); profiles[id] = Object.assign({ id:id, joinedAt: now()-Math.floor(Math.random()*90)*86400000 }, s); });
    write(KEY_PROFILES, profiles);
  }

  // ── Current user (anonymous device session for now) ──
  function getMe(){
    seedIfEmpty();
    var me = read(KEY_ME, null);
    if (!me){
      me = { id: uid(), name:'You', avatar:'🦁', classGroup:'seniors', school:'', state:'Lagos', fav:[], bio:'', joinedAt: now() };
      write(KEY_ME, me);
      var profs = read(KEY_PROFILES, {});
      profs[me.id] = me;
      write(KEY_PROFILES, profs);
    }
    return me;
  }
  function saveMe(patch){
    var me = Object.assign(getMe(), patch);
    write(KEY_ME, me);
    var profs = read(KEY_PROFILES, {});
    profs[me.id] = me;
    write(KEY_PROFILES, profs);
    return me;
  }

  // ── Profiles ──
  function listProfiles(){ seedIfEmpty(); return Object.values(read(KEY_PROFILES, {})); }
  function getProfile(id){ var p = read(KEY_PROFILES, {}); return p[id] || null; }

  // ── Follows ──
  function getFollows(){ return read(KEY_FOLLOWS, []); }
  function isFollowing(a, b){ return getFollows().some(function(f){ return f.from === a && f.to === b; }); }
  function follow(targetId){
    var me = getMe(); if (targetId === me.id) return;
    var f = getFollows();
    if (!f.some(function(x){ return x.from === me.id && x.to === targetId; })){
      f.push({ from: me.id, to: targetId, at: now() });
      write(KEY_FOLLOWS, f);
    }
  }
  function unfollow(targetId){
    var me = getMe();
    write(KEY_FOLLOWS, getFollows().filter(function(x){ return !(x.from === me.id && x.to === targetId); }));
  }
  function followersOf(id){ return getFollows().filter(function(f){ return f.to === id; }).map(function(f){ return getProfile(f.from); }).filter(Boolean); }
  function followingOf(id){ return getFollows().filter(function(f){ return f.from === id; }).map(function(f){ return getProfile(f.to); }).filter(Boolean); }

  // ── DM permissions: same class group only ──
  function canDM(meId, otherId){
    var a = getProfile(meId), b = getProfile(otherId);
    if (!a || !b || a.id === b.id) return { ok:false, reason:'invalid' };
    if (a.classGroup !== b.classGroup) return { ok:false, reason:'Only students in the same class group can DM each other.' };
    return { ok:true };
  }

  // ── Threads + messages ──
  function threadKey(a, b){ return [a, b].sort().join('::'); }
  function getOrCreateThread(meId, otherId){
    var ts = read(KEY_THREADS, {});
    var k = threadKey(meId, otherId);
    if (!ts[k]){ ts[k] = { id:k, a:meId, b:otherId, lastAt: now(), unread:{} }; write(KEY_THREADS, ts); }
    return ts[k];
  }
  function listThreads(meId){
    var ts = Object.values(read(KEY_THREADS, {})).filter(function(t){ return t.a === meId || t.b === meId; });
    ts.sort(function(x,y){ return (y.lastAt||0) - (x.lastAt||0); });
    return ts.map(function(t){
      var otherId = (t.a === meId) ? t.b : t.a;
      return { thread:t, other: getProfile(otherId), lastMsg: lastMessage(t.id) };
    });
  }
  function listMessages(threadId){
    var msgs = read(KEY_MESSAGES, {});
    return (msgs[threadId] || []).slice();
  }
  function lastMessage(threadId){
    var arr = listMessages(threadId);
    return arr.length ? arr[arr.length-1] : null;
  }
  function postMessage(threadId, fromId, body, redacted){
    var msgs = read(KEY_MESSAGES, {});
    if (!msgs[threadId]) msgs[threadId] = [];
    var m = { id: uid(), threadId: threadId, from: fromId, body: body, redacted: !!redacted, at: now() };
    msgs[threadId].push(m);
    write(KEY_MESSAGES, msgs);
    var ts = read(KEY_THREADS, {});
    if (ts[threadId]){ ts[threadId].lastAt = now(); write(KEY_THREADS, ts); }
    return m;
  }

  // ── Reports (moderation queue, used later by parent/teacher dashboard) ──
  function report(targetType, targetId, reason){
    var rs = read(KEY_REPORTS, []);
    rs.push({ id:uid(), reporter: getMe().id, type:targetType, target:targetId, reason:reason||'', at: now() });
    write(KEY_REPORTS, rs);
  }

  /* ───────────── CONTENT FILTER (anti-personal-info) ─────────────
     Auto-redacts personal contact info / meet-up patterns. Same logic
     used by DMs, lobby chat, spectator chat, and profile bio.
     Returns { clean: <string with redactions>, hits: [reasons], blocked: false } */
  function filter(text){
    if (!text) return { clean:'', hits:[], blocked:false };
    var hits = [];
    var s = String(text);

    // Phone numbers (NG-friendly: 070..., +234..., 11-digit, with spaces/dashes)
    s = s.replace(/(?:\+?\d[\s\-().]?){7,}\d/g, function(m){
      // Avoid eating short numbers / years
      var digits = m.replace(/\D/g,''); if (digits.length < 7) return m;
      hits.push('phone'); return '████████';
    });

    // Emails
    s = s.replace(/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/gi, function(){ hits.push('email'); return '████████'; });

    // URLs
    s = s.replace(/\b(?:https?:\/\/|www\.)\S+/gi, function(){ hits.push('link'); return '████████'; });
    s = s.replace(/\b[a-z0-9\-]+\.(?:com|net|org|ng|co|io|me|app|xyz|ly|gg|tv|info|edu)\b/gi, function(){ hits.push('link'); return '████████'; });

    // Social handles & app names paired with handles
    s = s.replace(/(?:^|\s)@[A-Za-z0-9_.]{3,}/g, function(m){ hits.push('handle'); return m.charAt(0)+'████'; });
    s = s.replace(/\b(?:ig|insta|instagram|snap|snapchat|whatsapp|wa|tiktok|tt|telegram|tg|fb|facebook|twitter|x|discord)\s*[:\-=@]?\s*[A-Za-z0-9_.]{3,}/gi, function(){ hits.push('social'); return '████████'; });

    // "Send me your number / call me / text me / dm me your..." patterns
    s = s.replace(/\b(?:send|drop|share|give|text|whatsapp|call|dm|pm)\s+(?:me|us)?\s*(?:your|ur)?\s*(?:number|digits|contact|address|location|pin|bvn|pin code)\b/gi, function(){ hits.push('contact-request'); return '████████'; });
    s = s.replace(/\b(?:meet|see)\s+(?:me|up)\s+(?:at|in|on)\s+\S+/gi, function(){ hits.push('meetup'); return '████████'; });

    // Addresses (very loose: "no 12 something street/road/close/avenue")
    s = s.replace(/\b(?:no\.?|number)\s*\d+\s+[A-Za-z][A-Za-z\s]{2,30}\s+(?:street|st|road|rd|close|avenue|ave|crescent|estate|lane)\b/gi, function(){ hits.push('address'); return '████████'; });

    return { clean: s, hits: Array.from(new Set(hits)), blocked: false };
  }

  // Public API
  window.SocialDB = {
    getMe: getMe, saveMe: saveMe,
    listProfiles: listProfiles, getProfile: getProfile,
    follow: follow, unfollow: unfollow, isFollowing: isFollowing,
    followersOf: followersOf, followingOf: followingOf,
    canDM: canDM,
    getOrCreateThread: getOrCreateThread, listThreads: listThreads,
    listMessages: listMessages, postMessage: postMessage,
    report: report,
    filter: filter
  };
})();
