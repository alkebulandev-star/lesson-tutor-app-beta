/* ════════════════════════════════════════════════════════════════
   LANDING 3D — Three.js hero scene + GSAP entrance/scroll polish
   Loaded after THREE & GSAP (CDN) on the landing page only.
   ════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (typeof window === 'undefined') return;

  function ready(fn){
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function initThree(){
    if (typeof THREE === 'undefined') { console.warn('[landing-3d] THREE not loaded'); return; }
    var canvas = document.getElementById('hp-3d');
    if (!canvas) return;
    var hero = canvas.parentElement; // .hero-premium

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    camera.position.set(0, 0, 9);

    /* ─── Lights ─── */
    scene.add(new THREE.AmbientLight(0x4060ff, 0.35));
    var key = new THREE.PointLight(0x60a5fa, 2.0, 50); key.position.set(5,6,8); scene.add(key);
    var rim = new THREE.PointLight(0xfbbf24, 1.4, 50); rim.position.set(-7,-3,5); scene.add(rim);
    var fill = new THREE.PointLight(0x10b981, 1.0, 50); fill.position.set(0,-6,4); scene.add(fill);

    /* ─── Hero shape: glowing wireframe knot ─── */
    var knotGroup = new THREE.Group();
    var knotGeo = new THREE.TorusKnotGeometry(1.6, 0.42, 220, 32, 2, 3);
    var knotMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, metalness: 0.85, roughness: 0.18,
      emissive: 0x1d4ed8, emissiveIntensity: 0.35
    });
    var knot = new THREE.Mesh(knotGeo, knotMat);
    knotGroup.add(knot);
    // Wireframe overlay
    var wireMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, wireframe: true, transparent: true, opacity: 0.18 });
    var knotWire = new THREE.Mesh(knotGeo, wireMat); knotWire.scale.setScalar(1.015);
    knotGroup.add(knotWire);
    knotGroup.position.set(3.4, 0.4, -0.5);
    knotGroup.scale.setScalar(0.9);
    scene.add(knotGroup);

    /* ─── Floating icosahedron (gold) ─── */
    var icoGeo = new THREE.IcosahedronGeometry(0.7, 0);
    var icoMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.25, emissive: 0xf59e0b, emissiveIntensity: 0.3, flatShading: true });
    var ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(-3.6, 1.8, 1);
    scene.add(ico);
    var icoEdges = new THREE.LineSegments(new THREE.EdgesGeometry(icoGeo), new THREE.LineBasicMaterial({ color: 0xfde68a, transparent:true, opacity:.45 }));
    ico.add(icoEdges);

    /* ─── Floating ring (emerald) ─── */
    var ringGeo = new THREE.TorusGeometry(0.55, 0.13, 24, 64);
    var ringMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.9, roughness: 0.2, emissive: 0x047857, emissiveIntensity: 0.25 });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(-3.0, -2.2, 1.2);
    scene.add(ring);

    /* ─── Particle starfield (parallax) ─── */
    var starCount = 700;
    var starPos = new Float32Array(starCount * 3);
    var starCol = new Float32Array(starCount * 3);
    for (var i=0;i<starCount;i++){
      var r = 14 + Math.random()*22;
      var th = Math.random()*Math.PI*2;
      var ph = Math.acos(2*Math.random()-1);
      starPos[i*3]   = r*Math.sin(ph)*Math.cos(th);
      starPos[i*3+1] = r*Math.sin(ph)*Math.sin(th)*0.6;
      starPos[i*3+2] = r*Math.cos(ph) - 8;
      // tint: blue→white→gold
      var t = Math.random();
      if (t < 0.55){ starCol[i*3]=0.6; starCol[i*3+1]=0.75; starCol[i*3+2]=1.0; }
      else if (t < 0.85){ starCol[i*3]=1.0; starCol[i*3+1]=1.0; starCol[i*3+2]=1.0; }
      else { starCol[i*3]=1.0; starCol[i*3+1]=0.78; starCol[i*3+2]=0.27; }
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    var starMat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent:true, opacity:.85, sizeAttenuation:true, depthWrite:false });
    var stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ─── Resize ─── */
    function size(){
      var w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // Hide knot side on small screens (mobile shows phone full width)
      var isMobile = w < 960;
      knotGroup.visible = !isMobile;
      ico.visible = !isMobile;
      ring.visible = !isMobile;
    }
    size();
    var ro = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver(size) : null;
    if (ro) ro.observe(hero); else window.addEventListener('resize', size);

    /* ─── Mouse parallax ─── */
    var tx = 0, ty = 0, mx = 0, my = 0;
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width  - 0.5);
      ty = ((e.clientY - r.top)  / r.height - 0.5);
    });

    /* ─── Animate ─── */
    var t0 = performance.now();
    var paused = false;
    document.addEventListener('visibilitychange', function(){ paused = document.hidden; });
    function loop(){
      requestAnimationFrame(loop);
      if (paused) return;
      var t = (performance.now() - t0) * 0.001;
      // Smooth parallax
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      camera.position.x = mx * 1.4;
      camera.position.y = -my * 0.9;
      camera.lookAt(0.4, 0, 0);

      knotGroup.rotation.x = t * 0.35;
      knotGroup.rotation.y = t * 0.28;
      knotWire.rotation.x = -t * 0.05;

      ico.rotation.x = t * 0.6;
      ico.rotation.y = t * 0.45;
      ico.position.y = 1.6 + Math.sin(t*0.9) * 0.35;

      ring.rotation.x = t * 0.5;
      ring.rotation.z = t * 0.7;
      ring.position.x = -2.2 + Math.cos(t*0.6) * 0.3;

      stars.rotation.y = t * 0.02;
      stars.rotation.x = my * 0.15;

      renderer.render(scene, camera);
    }
    loop();
    window.__ltHero3D = { renderer: renderer, scene: scene };
  }

  function initGSAP(){
    if (typeof gsap === 'undefined') return;
    // Hero text staggered fade-up (overrides CSS keyframes for smoother feel)
    var els = document.querySelectorAll('.hp-eyebrow, .hp-h1, .hp-desc, .hp-levels, .hp-ctas, .hp-social');
    if (els.length){
      gsap.set(els, { opacity: 0, y: 30 });
      gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out', delay: 0.1 });
    }
    // Phone mockup pop-in
    var phone = document.querySelector('.hp-visual');
    if (phone){
      gsap.from(phone, { opacity: 0, y: 60, scale: 0.92, duration: 1.1, ease: 'power3.out', delay: 0.25 });
    }
    // Floating cards
    gsap.from('.hp-card', { opacity: 0, scale: 0.7, duration: 0.7, stagger: 0.12, ease: 'back.out(1.6)', delay: 0.7 });

    // Scroll reveal for section blocks below the hero
    if (gsap.utils && typeof IntersectionObserver !== 'undefined'){
      var revealEls = document.querySelectorAll('.feat-card, .pricing-card, .subject-pill, .hp-stat');
      revealEls.forEach(function(el){ el.style.opacity = '0'; el.style.transform = 'translateY(24px)'; });
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if (en.isIntersecting){
            gsap.to(en.target, { opacity:1, y:0, duration:.7, ease:'power3.out' });
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(function(el){ io.observe(el); });
    }
  }

  function boot(){
    // Wait for THREE + GSAP, with a short timeout fallback
    var tries = 0;
    (function wait(){
      tries++;
      if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined'){
        try { initThree(); } catch(e){ console.warn('[landing-3d] three init err', e); }
        try { initGSAP();  } catch(e){ console.warn('[landing-3d] gsap init err', e); }
        return;
      }
      if (tries < 80) setTimeout(wait, 75);
    })();
  }
  ready(boot);
})();
