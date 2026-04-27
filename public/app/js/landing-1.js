
    // Scroll-triggered reveal for showcase sections
    (function(){
      if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.sc-pro-reveal').forEach(function(el){ el.classList.add('in-view'); });
        return;
      }
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });
      document.querySelectorAll('.sc-pro-reveal').forEach(function(el){ obs.observe(el); });
    })();
  