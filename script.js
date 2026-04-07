/* ══════════════════════════════════════════════════
   LocalHub — script.js
   Three.js particle network + all interactions
   ══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Custom Cursor ─────────────────────────────── */
  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animateCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .tm-card, .step-card, .b-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  /* ── Navbar ────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveNav();
  });

  /* ── Mobile Menu ───────────────────────────────── */
  const burger  = document.getElementById('burger');
  const mobNav  = document.getElementById('mobNav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobNav.classList.toggle('open');
  });
  mobNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobNav.classList.remove('open');
    });
  });

  /* ── Active nav highlight on scroll ───────────── */
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('.nav-links a');
  function updateActiveNav() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY + 120 >= sec.offsetTop) current = sec.id;
    });
    navAs.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  /* ── Smooth scroll for anchors ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Scroll Reveal ─────────────────────────────── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => entry.target.classList.add('on'), delay);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ── Bento animation trigger ───────────────────── */
  const bentoObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        bentoObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.animatable').forEach(el => bentoObs.observe(el));

  /* ── Counter animation ─────────────────────────── */
  function animCount(el) {
    const target  = parseFloat(el.dataset.count);
    const dec     = parseInt(el.dataset.dec) || 0;
    const dur     = 1800;
    const start   = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = dec ? (target * ease).toFixed(dec) : Math.floor(target * ease);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count]').forEach(el => animCount(el));
        countObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.hero-stats, .dl-stats').forEach(el => countObs.observe(el));

  /* ── Card tilt ─────────────────────────────────── */
  document.querySelectorAll('.tm-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r    = card.getBoundingClientRect();
      const x    = (e.clientX - r.left) / r.width  - 0.5;
      const y    = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── Chip interactive ──────────────────────────── */
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.closest('.chip-row').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  /* ══════════════════════════════════════════════════
     THREE.JS HERO — Particle Network
     ══════════════════════════════════════════════════ */
  initHeroCanvas();

  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const W = () => canvas.parentElement.offsetWidth;
    const H = () => canvas.parentElement.offsetHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 100);
    camera.position.z = 5;

    /* Particles */
    const N   = window.innerWidth < 768 ? 70 : 130;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const vel = [];

    /* purple (0.424, 0.388, 1)  cyan (0, 0.831, 1)  orange (1, 0.42, 0.2) */
    for (let i = 0; i < N; i++) {
      const i3   = i * 3;
      const spread = 7;
      pos[i3]   = (Math.random() - .5) * spread * (W() / H());
      pos[i3+1] = (Math.random() - .5) * spread;
      pos[i3+2] = (Math.random() - .5) * 2;
      vel.push({
        x: (Math.random() - .5) * 0.004,
        y: (Math.random() - .5) * 0.004
      });
      const t = Math.random();
      if (t < 0.6) {
        /* purple → cyan */
        const u = t / 0.6;
        col[i3]   = 0.424 * (1 - u);
        col[i3+1] = 0.388 + (0.831 - 0.388) * u;
        col[i3+2] = 1;
      } else {
        /* orange accent */
        col[i3]   = 1;
        col[i3+1] = 0.42 + Math.random() * 0.1;
        col[i3+2] = 0.2;
      }
    }

    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeom.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true
    });

    const points = new THREE.Points(pGeom, pMat);
    scene.add(points);

    /* Lines */
    const MAX_L = N * 20;
    const lPos  = new Float32Array(MAX_L * 6);
    const lCol  = new Float32Array(MAX_L * 6);
    const lGeom = new THREE.BufferGeometry();
    lGeom.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    lGeom.setAttribute('color',    new THREE.BufferAttribute(lCol, 3));

    const lMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.25
    });

    const linesMesh = new THREE.LineSegments(lGeom, lMat);
    scene.add(linesMesh);

    function buildLines() {
      let count = 0;
      const THRESH = 1.6;
      for (let i = 0; i < N && count < MAX_L; i++) {
        for (let j = i + 1; j < N && count < MAX_L; j++) {
          const dx = pos[i*3]   - pos[j*3];
          const dy = pos[i*3+1] - pos[j*3+1];
          const dz = pos[i*3+2] - pos[j*3+2];
          const d  = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (d < THRESH) {
            const a = (1 - d / THRESH) * 0.6;
            const lc = count * 6;
            lPos[lc]   = pos[i*3];   lPos[lc+1] = pos[i*3+1]; lPos[lc+2] = pos[i*3+2];
            lPos[lc+3] = pos[j*3];   lPos[lc+4] = pos[j*3+1]; lPos[lc+5] = pos[j*3+2];
            /* color purple */
            lCol[lc]   = 0.424*a; lCol[lc+1] = 0.388*a; lCol[lc+2] = a;
            lCol[lc+3] = 0.424*a; lCol[lc+4] = 0.388*a; lCol[lc+5] = a;
            count++;
          }
        }
      }
      lGeom.setDrawRange(0, count * 2);
      lGeom.attributes.position.needsUpdate = true;
      lGeom.attributes.color.needsUpdate    = true;
    }

    /* Mouse parallax */
    let mxN = 0, myN = 0, txN = 0, tyN = 0;
    window.addEventListener('mousemove', e => {
      mxN = (e.clientX / window.innerWidth  - .5) * 2;
      myN = (e.clientY / window.innerHeight - .5) * 2;
    });

    let spreadX = 7 * (W() / H());
    let spreadY = 7;

    /* Animate */
    function tick() {
      requestAnimationFrame(tick);

      txN += (mxN - txN) * 0.04;
      tyN += (myN - tyN) * 0.04;
      camera.position.x =  txN * 0.4;
      camera.position.y = -tyN * 0.3;

      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        pos[i3]   += vel[i].x;
        pos[i3+1] += vel[i].y;
        if (pos[i3]   >  spreadX / 2) pos[i3]   = -spreadX / 2;
        if (pos[i3]   < -spreadX / 2) pos[i3]   =  spreadX / 2;
        if (pos[i3+1] >  spreadY / 2) pos[i3+1] = -spreadY / 2;
        if (pos[i3+1] < -spreadY / 2) pos[i3+1] =  spreadY / 2;
      }
      pGeom.attributes.position.needsUpdate = true;
      buildLines();
      renderer.render(scene, camera);
    }
    tick();

    /* Resize */
    window.addEventListener('resize', () => {
      const w = W(), h = H();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      spreadX = 7 * (w / h);
    });
  }

  /* ══════════════════════════════════════════════════
     DOWNLOAD CANVAS — Ripple rings
     ══════════════════════════════════════════════════ */
  initDlCanvas();

  function initDlCanvas() {
    const canvas = document.getElementById('dlCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      W = canvas.width  = canvas.parentElement.offsetWidth;
      H = canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const rings = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * 1.0,
      y: Math.random() * 1.0,
      r: Math.random() * 80 + 30,
      speed: Math.random() * 0.4 + 0.15,
      alpha: Math.random() * 0.15 + 0.05,
      color: Math.random() > 0.5 ? '108,99,255' : '255,107,53',
      delay: i * 0.5
    }));

    let t = 0;
    function draw() {
      requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      t += 0.01;
      rings.forEach(ring => {
        ctx.beginPath();
        ctx.arc(ring.x * W, ring.y * H, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ring.color},${ring.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ring.r     += ring.speed;
        ring.alpha -= 0.0008;
        if (ring.r > 250 || ring.alpha <= 0) {
          ring.x = Math.random();
          ring.y = Math.random();
          ring.r = Math.random() * 40 + 20;
          ring.alpha = Math.random() * 0.12 + 0.04;
          ring.color = Math.random() > 0.5 ? '108,99,255' : '255,107,53';
        }
      });
    }
    draw();
  }

}); /* end DOMContentLoaded */
