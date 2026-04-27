/* ───────────── SOCIAL UI ─────────────
   Profile editor, People (follow/unfollow), Inbox (DMs with auto-redaction).
   All data goes through window.SocialDB so swapping to Lovable Cloud later
   is mechanical. Class-group gate enforced for DMs. */
(function(){
  if (!window.SocialDB){ console.error('[social-ui] SocialDB not loaded'); return; }

  var CLASS_LABEL = { kids:'🧒 Kids', juniors:'📘 Juniors (JSS)', seniors:'🎓 Seniors (SSS)', prep:'🏆 Exam Prep' };
  var CLASS_LIST = [
    { id:'kids', name:'Kids (Pre-Primary · P1-6)' },
    { id:'juniors', name:'Juniors (JSS 1-3)' },
    { id:'seniors', name:'Seniors (SSS 1-3)' },
    { id:'prep', name:'Exam Prep (WAEC · NECO · JAMB)' }
  ];

  function injectStyles(){
    if (document.getElementById('social-styles')) return;
    var s = document.createElement('style'); s.id = 'social-styles';
    s.textContent = ''
      + '#pg-social{position:fixed;inset:0;overflow-y:auto;background:radial-gradient(900px 500px at 90% -10%,rgba(59,130,246,.18),transparent 60%),radial-gradient(800px 500px at 0% 100%,rgba(16,185,129,.14),transparent 60%),#070b18;color:#fff;font-family:Inter,system-ui,sans-serif;display:none;z-index:50}'
      + '#pg-social.active{display:block}'
      + '.sc-wrap{max-width:1080px;margin:0 auto;padding:18px 18px 80px}'
      + '.sc-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}'
      + '.sc-back{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff;padding:8px 14px;border-radius:100px;font-weight:700;font-size:.82rem;cursor:pointer}'
      + '.sc-title{font-family:"Bricolage Grotesque",sans-serif;font-weight:900;font-size:1.4rem;display:flex;gap:8px;align-items:center}'
      + '.sc-tabs{display:flex;gap:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:5px;border-radius:14px;margin-bottom:16px;overflow-x:auto}'
      + '.sc-tab{flex:1;min-width:110px;background:transparent;border:none;color:rgba(255,255,255,.7);padding:10px 14px;border-radius:10px;font-weight:800;font-size:.85rem;cursor:pointer;font-family:inherit;white-space:nowrap}'
      + '.sc-tab.on{background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;box-shadow:0 6px 18px rgba(59,130,246,.35)}'
      + '.sc-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:16px;margin-bottom:14px}'
      + '.sc-row{display:flex;align-items:center;gap:12px;padding:10px 6px;border-bottom:1px dashed rgba(255,255,255,.06)}'
      + '.sc-row:last-child{border-bottom:none}'
      + '.sc-av{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#a855f7);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}'
      + '.sc-av.lg{width:72px;height:72px;font-size:1.9rem}'
      + '.sc-name{font-weight:800;font-size:.95rem}'
      + '.sc-meta{font-size:.72rem;color:rgba(255,255,255,.55)}'
      + '.sc-tagrow{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}'
      + '.sc-tag{background:rgba(96,165,250,.15);color:#bfdbfe;border:1px solid rgba(96,165,250,.3);padding:3px 9px;border-radius:100px;font-size:.7rem;font-weight:700}'
      + '.sc-btn{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.16);padding:8px 14px;border-radius:100px;font-weight:800;font-size:.78rem;cursor:pointer;font-family:inherit;white-space:nowrap}'
      + '.sc-btn:hover{background:rgba(255,255,255,.14)}'
      + '.sc-btn.primary{background:linear-gradient(135deg,#3b82f6,#2563eb);border-color:transparent}'
      + '.sc-btn.success{background:linear-gradient(135deg,#10b981,#059669);border-color:transparent}'
      + '.sc-btn.ghost{background:rgba(255,255,255,.04)}'
      + '.sc-btn.danger{background:rgba(220,38,38,.18);color:#fecaca;border-color:rgba(220,38,38,.4)}'
      + '.sc-input,.sc-textarea,.sc-select{width:100%;background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:10px 12px;font-size:.9rem;font-family:inherit;box-sizing:border-box}'
      + '.sc-textarea{min-height:80px;resize:vertical}'
      + '.sc-label{display:block;font-size:.75rem;font-weight:700;color:rgba(255,255,255,.7);margin-bottom:4px;margin-top:10px}'
      + '.sc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}'
      + '.sc-empty{text-align:center;padding:30px;color:rgba(255,255,255,.55);font-size:.88rem}'
      + '.sc-safety{background:linear-gradient(135deg,rgba(16,185,129,.14),rgba(59,130,246,.1));border:1px solid rgba(16,185,129,.35);color:#a7f3d0;padding:10px 14px;border-radius:12px;font-size:.78rem;margin-bottom:14px;display:flex;gap:8px;align-items:flex-start}'
      // ── Inbox / DMs ──
      + '.sc-thread-list{display:flex;flex-direction:column;gap:6px}'
      + '.sc-thread{display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;cursor:pointer;transition:background .15s}'
      + '.sc-thread:hover{background:rgba(255,255,255,.08)}'
      + '.sc-thread-preview{font-size:.78rem;color:rgba(255,255,255,.55);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}'
      + '.sc-chat-modal{position:fixed;inset:0;background:rgba(5,10,22,.92);backdrop-filter:blur(8px);z-index:99996;display:flex;align-items:stretch;justify-content:center;padding:0}'
      + '.sc-chat-card{background:#0b1222;width:100%;max-width:560px;height:100vh;display:flex;flex-direction:column;color:#fff}'
      + '@media (min-width:780px){.sc-chat-modal{padding:30px}.sc-chat-card{height:auto;max-height:90vh;border-radius:18px;border:1px solid rgba(255,255,255,.1);box-shadow:0 30px 80px rgba(0,0,0,.6)}}'
      + '.sc-chat-h{display:flex;align-items:center;gap:10px;padding:14px;border-bottom:1px solid rgba(255,255,255,.08)}'
      + '.sc-chat-h .sc-x{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.6);font-size:1.4rem;cursor:pointer}'
      + '.sc-chat-feed{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:linear-gradient(180deg,rgba(255,255,255,.02),transparent)}'
      + '.sc-msg{max-width:78%;padding:8px 12px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:.88rem;line-height:1.4;word-wrap:break-word}'
      + '.sc-msg.me{align-self:flex-end;background:linear-gradient(135deg,#3b82f6,#2563eb);border-color:transparent}'
      + '.sc-msg.sys{align-self:center;background:rgba(99,102,241,.12);border-color:rgba(99,102,241,.3);color:#c7d2fe;font-size:.74rem;text-align:center;padding:6px 12px;border-radius:10px}'
      + '.sc-msg.redacted{outline:1px dashed rgba(245,158,11,.5);outline-offset:2px}'
      + '.sc-msg-time{font-size:.62rem;color:rgba(255,255,255,.5);margin-top:3px}'
      + '.sc-redact-note{align-self:center;font-size:.7rem;color:#fcd34d;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);padding:4px 10px;border-radius:100px}'
      + '.sc-chat-in{display:flex;gap:6px;padding:12px;border-top:1px solid rgba(255,255,255,.08)}'
      + '.sc-chat-in input{flex:1;background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:100px;padding:10px 14px;font-size:.88rem;font-family:inherit}'
      + '.sc-chat-in button{background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;border:none;padding:10px 16px;border-radius:100px;font-weight:800;font-size:.82rem;cursor:pointer}'
      + '.sc-chat-rules{font-size:.7rem;color:rgba(255,255,255,.55);text-align:center;padding:6px 12px 0}';
    document.head.appendChild(s);
  }

  function injectPage(){
    if (document.getElementById('pg-social')) return;
    var pg = document.createElement('div');
    pg.id = 'pg-social'; pg.className = 'page';
    pg.innerHTML = ''
      + '<div class="sc-wrap">'
      +   '<div class="sc-top">'
      +     '<button class="sc-back" onclick="SocialUI.goBack()">← Back</button>'
      +     '<div class="sc-title">👥 Study Circle</div>'
      +     '<div style="width:60px"></div>'
      +   '</div>'
      +   '<div class="sc-safety"><span>🛡️</span><div><b>Safe & monitored.</b> No phone numbers, addresses, social handles, links or meet-ups in chat. They\'re auto-redacted. This is a study circle, not social media.</div></div>'
      +   '<div class="sc-tabs" id="scTabs">'
      +     '<button class="sc-tab on" data-tab="profile" onclick="SocialUI.tab(\'profile\')">👤 My Profile</button>'
      +     '<button class="sc-tab" data-tab="people" onclick="SocialUI.tab(\'people\')">🔎 People</button>'
      +     '<button class="sc-tab" data-tab="following" onclick="SocialUI.tab(\'following\')">⭐ Following</button>'
      +     '<button class="sc-tab" data-tab="inbox" onclick="SocialUI.tab(\'inbox\')">💬 Inbox</button>'
      +   '</div>'
      +   '<div id="scBody"></div>'
      + '</div>';
    document.body.appendChild(pg);
  }

  // Escape HTML defensively
  function esc(s){ return String(s||'').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function ago(t){ if(!t)return ''; var s=Math.floor((Date.now()-t)/1000); if(s<60)return s+'s'; if(s<3600)return Math.floor(s/60)+'m'; if(s<86400)return Math.floor(s/3600)+'h'; return Math.floor(s/86400)+'d'; }

  var state = { tab: 'profile' };

  window.SocialUI = {
    open: function(){
      injectStyles(); injectPage();
      document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
      document.getElementById('pg-social').classList.add('active');
      this.tab(state.tab);
    },
    goBack: function(){
      var p = document.getElementById('pg-social'); if (p) p.classList.remove('active');
      var landing = document.getElementById('pg-landing'); if (landing) landing.classList.add('active');
    },
    tab: function(id){
      state.tab = id;
      document.querySelectorAll('#scTabs .sc-tab').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-tab') === id); });
      var body = document.getElementById('scBody');
      if (id === 'profile')   body.innerHTML = renderProfile();
      if (id === 'people')    body.innerHTML = renderPeople();
      if (id === 'following') body.innerHTML = renderFollowing();
      if (id === 'inbox')     body.innerHTML = renderInbox();
    },
    saveProfile: function(){
      var name = document.getElementById('scInName').value.trim() || 'You';
      var avatar = (document.getElementById('scInAv').value || '🦁').slice(0,2);
      var classGroup = document.getElementById('scInClass').value;
      var school = document.getElementById('scInSchool').value.trim();
      var state2 = document.getElementById('scInState').value.trim();
      var bioRaw = document.getElementById('scInBio').value.trim();
      var bioFiltered = SocialDB.filter(bioRaw);
      var fav = Array.from(document.querySelectorAll('.sc-fav-chip.on')).map(function(b){ return b.getAttribute('data-fav'); });
      SocialDB.saveMe({ name:name, avatar:avatar, classGroup:classGroup, school:school, state:state2, bio:bioFiltered.clean, fav:fav });
      this.tab('profile');
      var note = document.createElement('div');
      note.textContent = bioFiltered.hits.length ? '✓ Saved (your bio had personal info — auto-redacted)' : '✓ Profile saved';
      note.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:10px 18px;border-radius:100px;font-weight:700;z-index:99999;box-shadow:0 10px 30px rgba(0,0,0,.4)';
      document.body.appendChild(note);
      setTimeout(function(){ note.remove(); }, 2200);
    },
    toggleFav: function(btn){ btn.classList.toggle('on'); btn.style.background = btn.classList.contains('on') ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,.06)'; btn.style.borderColor = btn.classList.contains('on') ? 'transparent' : 'rgba(255,255,255,.14)'; },
    follow: function(id, btn){ SocialDB.follow(id); btn.outerHTML = '<button class="sc-btn ghost" onclick="SocialUI.unfollow(\''+id+'\', this)">Following ✓</button>'; },
    unfollow: function(id, btn){ SocialDB.unfollow(id); btn.outerHTML = '<button class="sc-btn primary" onclick="SocialUI.follow(\''+id+'\', this)">+ Follow</button>'; },
    openChat: function(otherId){ openChatModal(otherId); },
    report: function(targetType, targetId){
      var why = prompt('Report this '+targetType+'. Why?'); if (!why) return;
      SocialDB.report(targetType, targetId, why);
      alert('Thanks — reported. A moderator will review.');
    }
  };

  function renderProfile(){
    var me = SocialDB.getMe();
    var followers = SocialDB.followersOf(me.id).length;
    var following = SocialDB.followingOf(me.id).length;
    var FAVS = ['Maths','English','Physics','Chemistry','Biology','Geography','History','CRS','IRS','Lit','Economics','Govt','Agric','ICT','Art','French','Yoruba','Igbo','Hausa'];
    return ''
      + '<div class="sc-card">'
      +   '<div style="display:flex;gap:14px;align-items:center;margin-bottom:6px">'
      +     '<div class="sc-av lg">'+esc(me.avatar)+'</div>'
      +     '<div style="flex:1"><div style="font-family:\'Bricolage Grotesque\',sans-serif;font-weight:900;font-size:1.3rem">'+esc(me.name)+'</div>'
      +     '<div class="sc-meta">'+(CLASS_LABEL[me.classGroup]||'')+(me.school?' · '+esc(me.school):'')+(me.state?' · '+esc(me.state):'')+'</div>'
      +     '<div class="sc-meta" style="margin-top:4px"><b style="color:#fff">'+followers+'</b> followers · <b style="color:#fff">'+following+'</b> following</div></div>'
      +   '</div>'
      +   (me.bio ? '<div style="margin-top:8px;font-size:.88rem;line-height:1.45">'+esc(me.bio)+'</div>' : '')
      + '</div>'
      + '<div class="sc-card">'
      +   '<div style="font-weight:800;margin-bottom:8px">Edit profile</div>'
      +   '<label class="sc-label">Display name</label><input class="sc-input" id="scInName" maxlength="24" value="'+esc(me.name)+'">'
      +   '<label class="sc-label">Avatar (emoji)</label><input class="sc-input" id="scInAv" maxlength="2" value="'+esc(me.avatar)+'">'
      +   '<label class="sc-label">Class group</label><select class="sc-select" id="scInClass">'+CLASS_LIST.map(function(c){ return '<option value="'+c.id+'"'+(c.id===me.classGroup?' selected':'')+'>'+c.name+'</option>'; }).join('')+'</select>'
      +   '<label class="sc-label">School (optional)</label><input class="sc-input" id="scInSchool" maxlength="80" value="'+esc(me.school||'')+'" placeholder="e.g. Kings College Lagos">'
      +   '<label class="sc-label">State</label><input class="sc-input" id="scInState" maxlength="40" value="'+esc(me.state||'')+'" placeholder="e.g. Lagos">'
      +   '<label class="sc-label">Favourite subjects</label>'
      +   '<div class="sc-tagrow" style="margin-bottom:6px">'+FAVS.map(function(f){ var on = (me.fav||[]).indexOf(f) !== -1; return '<button class="sc-fav-chip '+(on?'on':'')+'" data-fav="'+f+'" onclick="SocialUI.toggleFav(this)" style="background:'+(on?'linear-gradient(135deg,#3b82f6,#2563eb)':'rgba(255,255,255,.06)')+';color:#fff;border:1px solid '+(on?'transparent':'rgba(255,255,255,.14)')+';padding:5px 11px;border-radius:100px;font-size:.74rem;font-weight:700;cursor:pointer;font-family:inherit">'+f+'</button>'; }).join('')+'</div>'
      +   '<label class="sc-label">Short bio (no personal info — auto-filtered)</label><textarea class="sc-textarea" id="scInBio" maxlength="160" placeholder="What you love about studying...">'+esc(me.bio||'')+'</textarea>'
      +   '<div style="margin-top:12px;display:flex;gap:8px"><button class="sc-btn primary" onclick="SocialUI.saveProfile()">Save profile</button></div>'
      + '</div>';
  }

  function renderPeople(){
    var me = SocialDB.getMe();
    var people = SocialDB.listProfiles().filter(function(p){ return p.id !== me.id; });
    // Suggest same class group first
    people.sort(function(a,b){ return (a.classGroup === me.classGroup ? -1 : 1) - (b.classGroup === me.classGroup ? -1 : 1); });
    return '<div class="sc-card"><div style="font-weight:800;margin-bottom:10px">Students you might know <span style="font-weight:600;color:rgba(255,255,255,.55);font-size:.78rem">· same class group shown first</span></div>'
      + '<div class="sc-grid">'
      + people.map(function(p){
          var following = SocialDB.isFollowing(me.id, p.id);
          var sameClass = p.classGroup === me.classGroup;
          var btn = following
            ? '<button class="sc-btn ghost" onclick="SocialUI.unfollow(\''+p.id+'\', this)">Following ✓</button>'
            : '<button class="sc-btn primary" onclick="SocialUI.follow(\''+p.id+'\', this)">+ Follow</button>';
          var dmBtn = sameClass
            ? '<button class="sc-btn" onclick="SocialUI.openChat(\''+p.id+'\')">💬 DM</button>'
            : '<button class="sc-btn" disabled style="opacity:.4;cursor:not-allowed" title="Different class group">💬 DM</button>';
          return '<div class="sc-card" style="margin:0">'
            + '<div style="display:flex;gap:10px;align-items:center"><div class="sc-av">'+esc(p.avatar)+'</div>'
            + '<div style="flex:1;min-width:0"><div class="sc-name">'+esc(p.name)+'</div><div class="sc-meta">'+(CLASS_LABEL[p.classGroup]||'')+(p.school?' · '+esc(p.school):'')+'</div></div></div>'
            + (p.bio ? '<div class="sc-meta" style="margin-top:6px;color:rgba(255,255,255,.7)">'+esc(p.bio)+'</div>' : '')
            + '<div class="sc-tagrow">'+(p.fav||[]).slice(0,4).map(function(f){return '<span class="sc-tag">'+esc(f)+'</span>';}).join('')+'</div>'
            + '<div style="display:flex;gap:6px;margin-top:10px">'+btn+dmBtn+'<button class="sc-btn ghost" onclick="SocialUI.report(\'profile\', \''+p.id+'\')" title="Report">⚑</button></div>'
            + '</div>';
        }).join('')
      + '</div></div>';
  }

  function renderFollowing(){
    var me = SocialDB.getMe();
    var list = SocialDB.followingOf(me.id);
    if (!list.length) return '<div class="sc-card"><div class="sc-empty">You\'re not following anyone yet. Switch to <b>People</b> and tap +Follow.</div></div>';
    return '<div class="sc-card"><div style="font-weight:800;margin-bottom:8px">You follow '+list.length+' '+(list.length===1?'student':'students')+'</div>'
      + list.map(function(p){
          var sameClass = p.classGroup === me.classGroup;
          var dmBtn = sameClass
            ? '<button class="sc-btn primary" onclick="SocialUI.openChat(\''+p.id+'\')">💬 DM</button>'
            : '<button class="sc-btn" disabled style="opacity:.4;cursor:not-allowed" title="Different class group">💬 DM</button>';
          return '<div class="sc-row">'
            + '<div class="sc-av">'+esc(p.avatar)+'</div>'
            + '<div style="flex:1;min-width:0"><div class="sc-name">'+esc(p.name)+'</div><div class="sc-meta">'+(CLASS_LABEL[p.classGroup]||'')+(p.school?' · '+esc(p.school):'')+'</div></div>'
            + dmBtn
            + '<button class="sc-btn ghost" onclick="SocialUI.unfollow(\''+p.id+'\', this); setTimeout(function(){SocialUI.tab(\'following\');},10)">Unfollow</button>'
            + '</div>';
        }).join('')
      + '</div>';
  }

  function renderInbox(){
    var me = SocialDB.getMe();
    var threads = SocialDB.listThreads(me.id);
    if (!threads.length) return '<div class="sc-card"><div class="sc-empty">No conversations yet. Visit <b>People</b> or <b>Following</b> and tap 💬 DM on someone in your class group.</div></div>';
    return '<div class="sc-card"><div style="font-weight:800;margin-bottom:8px">Your conversations</div>'
      + '<div class="sc-thread-list">'
      + threads.map(function(t){
          if (!t.other) return '';
          var preview = t.lastMsg ? (t.lastMsg.from === me.id ? 'You: ' : '') + (t.lastMsg.body || '') : 'Say hi 👋';
          return '<div class="sc-thread" onclick="SocialUI.openChat(\''+t.other.id+'\')">'
            + '<div class="sc-av">'+esc(t.other.avatar)+'</div>'
            + '<div style="flex:1;min-width:0"><div class="sc-name">'+esc(t.other.name)+' <span class="sc-meta" style="font-weight:600">· '+(CLASS_LABEL[t.other.classGroup]||'')+'</span></div>'
            + '<div class="sc-thread-preview">'+esc(preview)+'</div></div>'
            + '<div class="sc-meta">'+ago(t.thread.lastAt)+'</div>'
            + '</div>';
        }).join('')
      + '</div></div>';
  }

  /* ───────────── DM CHAT MODAL ───────────── */
  function openChatModal(otherId){
    var me = SocialDB.getMe();
    var other = SocialDB.getProfile(otherId);
    if (!other) return;
    var perm = SocialDB.canDM(me.id, other.id);
    if (!perm.ok){ alert(perm.reason); return; }
    var thread = SocialDB.getOrCreateThread(me.id, other.id);

    var m = document.createElement('div');
    m.className = 'sc-chat-modal';
    m.id = 'scChatModal';
    m.innerHTML = ''
      + '<div class="sc-chat-card">'
      +   '<div class="sc-chat-h">'
      +     '<div class="sc-av">'+esc(other.avatar)+'</div>'
      +     '<div><div class="sc-name">'+esc(other.name)+'</div><div class="sc-meta">'+(CLASS_LABEL[other.classGroup]||'')+'</div></div>'
      +     '<button class="sc-btn ghost" style="margin-left:auto" onclick="SocialUI.report(\'message\', \''+thread.id+'\')">⚑ Report</button>'
      +     '<button class="sc-x" onclick="document.getElementById(\'scChatModal\').remove()">×</button>'
      +   '</div>'
      +   '<div class="sc-chat-feed" id="scChatFeed"></div>'
      +   '<div class="sc-chat-rules">🛡️ Auto-filter: phone numbers, addresses, social handles & links are blocked out.</div>'
      +   '<div class="sc-chat-in">'
      +     '<input id="scChatIn" placeholder="Message about studies… (no personal info)" maxlength="500" />'
      +     '<button onclick="window._scSend()">Send</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(m);

    function paint(){
      var feed = document.getElementById('scChatFeed'); if (!feed) return;
      var msgs = SocialDB.listMessages(thread.id);
      if (!msgs.length){
        feed.innerHTML = '<div class="sc-msg sys">Conversation started — keep it about studies. No personal info.</div>';
      } else {
        feed.innerHTML = msgs.map(function(msg){
          if (msg.from === me.id){
            var rNote = msg.redacted ? '<div class="sc-redact-note">⚠️ Personal info auto-removed before sending</div>' : '';
            return rNote + '<div class="sc-msg me '+(msg.redacted?'redacted':'')+'">'+esc(msg.body)+'<div class="sc-msg-time" style="color:rgba(255,255,255,.7)">'+ago(msg.at)+' ago</div></div>';
          }
          return '<div class="sc-msg '+(msg.redacted?'redacted':'')+'">'+esc(msg.body)+'<div class="sc-msg-time">'+ago(msg.at)+' ago</div></div>';
        }).join('');
      }
      feed.scrollTop = feed.scrollHeight;
    }
    paint();

    window._scSend = function(){
      var input = document.getElementById('scChatIn');
      if (!input) return;
      var raw = (input.value || '').trim();
      if (!raw) return;
      var f = SocialDB.filter(raw);
      SocialDB.postMessage(thread.id, me.id, f.clean, f.hits.length > 0);
      input.value = '';
      paint();
    };
    var inEl = document.getElementById('scChatIn');
    if (inEl){ inEl.addEventListener('keydown', function(e){ if (e.key==='Enter'){ e.preventDefault(); window._scSend(); }}); inEl.focus(); }
  }

  // Public entry point
  window.openSocial = function(){ window.SocialUI.open(); };
})();
