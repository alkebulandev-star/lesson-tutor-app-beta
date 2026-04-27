
    // Generate twinkling stars
    (function(){
      var container = document.getElementById('hpStars');
      if(!container) return;
      var frag = document.createDocumentFragment();
      for(var i=0; i<40; i++){
        var s = document.createElement('div');
        s.className = 'hp-star';
        s.style.left = Math.random()*100 + '%';
        s.style.top = Math.random()*100 + '%';
        s.style.animationDelay = (Math.random()*3) + 's';
        s.style.animationDuration = (2 + Math.random()*3) + 's';
        frag.appendChild(s);
      }
      container.appendChild(frag);
    })();
  