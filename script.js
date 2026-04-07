/* ══════════════════════════════════════════════════
   LocalHub — script.js
   Three.js Crystalline Cosmos + all interactions
   ══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar ────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveNav();
  });

  /* ── Mobile Menu ───────────────────────────────── */
  const burger = document.getElementById('burger');
  const mobNav = document.getElementById('mobNav');
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

  /* ── Active nav highlight ─────────────────────── */
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

  /* ── Smooth scroll ─────────────────────────────── */
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

  /* ── Bento trigger ─────────────────────────────── */
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
    const target = parseFloat(el.dataset.count);
    const dec    = parseInt(el.dataset.dec) || 0;
    const dur    = 1800;
    const start  = performance.now();
    function step(now) {
      const p    = Math.min((now - start) / dur, 1);
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
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ── Chip interactive ──────────────────────────── */
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.closest('.chip-row').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  /* ══════════════════════════════════════════════════
     THREE.JS HERO — Crystalline Cosmos
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
    const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 200);
    camera.position.set(0, 0, 22);

    /* ── Star field background ────────────────────── */
    const starCount = 600;
    const starPos   = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 80 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i*3+2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.18, color: 0xffffff, transparent: true, opacity: 0.55, sizeAttenuation: true });
    scene.add(new THREE.Points(starGeo, starMat));

    /* ── Central icosahedron wireframe ───────────── */
    const icoGeo  = new THREE.IcosahedronGeometry(4.5, 1);
    const icoMat  = new THREE.MeshBasicMaterial({ color: 0x6c63ff, wireframe: true, transparent: true, opacity: 0.22 });
    const ico     = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    /* ── Inner solid icosahedron with gradient-like effect */
    const icoInnerGeo = new THREE.IcosahedronGeometry(3.2, 0);
    const icoInnerMat = new THREE.MeshBasicMaterial({ color: 0x6c63ff, wireframe: true, transparent: true, opacity: 0.10 });
    const icoInner    = new THREE.Mesh(icoInnerGeo, icoInnerMat);
    scene.add(icoInner);

    /* ── Glowing central sphere ───────────────────── */
    const coreGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x8877ff, transparent: true, opacity: 0.55 });
    const core    = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    /* ── Orbiting torus rings ─────────────────────── */
    const rings = [];
    const ringDefs = [
      { radius: 6.2, tube: 0.04, color: 0x6c63ff, rx: Math.PI / 4,  ry: 0,            rz: 0 },
      { radius: 7.5, tube: 0.03, color: 0x00d4ff, rx: Math.PI / 2,  ry: Math.PI / 6,  rz: 0 },
      { radius: 8.8, tube: 0.03, color: 0xff6b35, rx: Math.PI / 6,  ry: Math.PI / 3,  rz: Math.PI / 5 },
    ];
    ringDefs.forEach(def => {
      const geo  = new THREE.TorusGeometry(def.radius, def.tube, 8, 120);
      const mat  = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.6 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.set(def.rx, def.ry, def.rz);
      scene.add(mesh);
      rings.push(mesh);
    });

    /* ── Orbiting satellite nodes ─────────────────── */
    const NODES = window.innerWidth < 768 ? 40 : 80;
    const nodePos = new Float32Array(NODES * 3);
    const nodeCol = new Float32Array(NODES * 3);
    const nodeVel = [];
    const orbits  = [];

    for (let i = 0; i < NODES; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const incl   = (Math.random() - 0.5) * Math.PI;
      const dist   = 5 + Math.random() * 9;
      const speed  = (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1);
      orbits.push({ angle, incl, dist, speed, axisX: Math.random(), axisY: Math.random(), axisZ: Math.random() });
      nodePos[i*3]   = dist * Math.cos(angle);
      nodePos[i*3+1] = dist * Math.sin(angle) * Math.cos(incl);
      nodePos[i*3+2] = dist * Math.sin(incl);
      const t = Math.random();
      if (t < 0.5) {
        nodeCol[i*3] = 0.424; nodeCol[i*3+1] = 0.388; nodeCol[i*3+2] = 1.0;
      } else if (t < 0.8) {
        nodeCol[i*3] = 0.0;   nodeCol[i*3+1] = 0.831; nodeCol[i*3+2] = 1.0;
      } else {
        nodeCol[i*3] = 1.0;   nodeCol[i*3+1] = 0.42;  nodeCol[i*3+2] = 0.2;
      }
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
    nodeGeo.setAttribute('color',    new THREE.BufferAttribute(nodeCol, 3));
    const nodeMat = new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodePoints);

    /* ── Connection lines between close nodes ─────── */
    const MAX_L = NODES * 15;
    const lPos  = new Float32Array(MAX_L * 6);
    const lCol  = new Float32Array(MAX_L * 6);
    const lGeo  = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    lGeo.setAttribute('color',    new THREE.BufferAttribute(lCol, 3));
    const lMat  = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.18 });
    scene.add(new THREE.LineSegments(lGeo, lMat));

    function buildLines() {
      let count  = 0;
      const THRESH = 3.5;
      for (let i = 0; i < NODES && count < MAX_L; i++) {
        for (let j = i + 1; j < NODES && count < MAX_L; j++) {
          const dx = nodePos[i*3]   - nodePos[j*3];
          const dy = nodePos[i*3+1] - nodePos[j*3+1];
          const dz = nodePos[i*3+2] - nodePos[j*3+2];
          const d  = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (d < THRESH) {
            const a  = (1 - d / THRESH) * 0.5;
            const lc = count * 6;
            lPos[lc]  = nodePos[i*3];   lPos[lc+1] = nodePos[i*3+1]; lPos[lc+2] = nodePos[i*3+2];
            lPos[lc+3]= nodePos[j*3];   lPos[lc+4] = nodePos[j*3+1]; lPos[lc+5] = nodePos[j*3+2];
            lCol[lc]  = nodeCol[i*3]*a; lCol[lc+1] = nodeCol[i*3+1]*a; lCol[lc+2] = nodeCol[i*3+2]*a;
            lCol[lc+3]= nodeCol[j*3]*a; lCol[lc+4] = nodeCol[j*3+1]*a; lCol[lc+5] = nodeCol[j*3+2]*a;
            count++;
          }
        }
      }
      lGeo.setDrawRange(0, count * 2);
      lGeo.attributes.position.needsUpdate = true;
      lGeo.attributes.color.needsUpdate    = true;
    }

    /* ── Floating mini crystals ───────────────────── */
    const crystals = [];
    const crystalDefs = [
      { size: 0.35, color: 0x6c63ff, x: -10, y: 4, z: -2 },
      { size: 0.25, color: 0x00d4ff, x: 10,  y: -3, z: 1 },
      { size: 0.20, color: 0xff6b35, x: -7,  y: -5, z: 3 },
      { size: 0.30, color: 0x8877ff, x: 9,   y: 5,  z: -4 },
      { size: 0.18, color: 0x00d4ff, x: -12, y: 1,  z: -1 },
      { size: 0.22, color: 0xff6b35, x: 11,  y: -6, z: 2 },
    ];
    crystalDefs.forEach(def => {
      const geo  = new THREE.OctahedronGeometry(def.size, 0);
      const mat  = new THREE.MeshBasicMaterial({ color: def.color, wireframe: true, transparent: true, opacity: 0.7 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(def.x, def.y, def.z);
      mesh._baseY = def.y;
      scene.add(mesh);
      crystals.push(mesh);
    });

    /* ── Mouse parallax ───────────────────────────── */
    let mxN = 0, myN = 0, txN = 0, tyN = 0;
    window.addEventListener('mousemove', e => {
      mxN = (e.clientX / window.innerWidth  - 0.5) * 2;
      myN = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* ── Animate ──────────────────────────────────── */
    let t = 0;
    function tick() {
      requestAnimationFrame(tick);
      t += 0.008;

      txN += (mxN - txN) * 0.03;
      tyN += (myN - tyN) * 0.03;
      camera.position.x =  txN * 1.5;
      camera.position.y = -tyN * 1.0;
      camera.lookAt(0, 0, 0);

      /* rotate icosahedron */
      ico.rotation.x += 0.0025;
      ico.rotation.y += 0.0035;
      icoInner.rotation.x -= 0.003;
      icoInner.rotation.y += 0.002;

      /* pulse core */
      const pulse = 1 + 0.12 * Math.sin(t * 2.5);
      core.scale.setScalar(pulse);
      coreMat.opacity = 0.4 + 0.2 * Math.sin(t * 2);

      /* rotate rings */
      rings[0].rotation.z += 0.004;
      rings[1].rotation.x += 0.003;
      rings[1].rotation.y += 0.002;
      rings[2].rotation.z -= 0.0025;
      rings[2].rotation.y += 0.003;

      /* orbit nodes */
      for (let i = 0; i < NODES; i++) {
        orbits[i].angle += orbits[i].speed;
        const { angle, incl, dist, axisX, axisY, axisZ } = orbits[i];
        nodePos[i*3]   = dist * Math.cos(angle) * Math.cos(axisY * t * 0.05);
        nodePos[i*3+1] = dist * Math.sin(angle) * Math.cos(incl) + Math.sin(axisX * t * 0.05) * 0.5;
        nodePos[i*3+2] = dist * Math.sin(incl)  + Math.cos(axisZ * t * 0.04) * 0.5;
      }
      nodeGeo.attributes.position.needsUpdate = true;
      buildLines();

      /* bob crystals */
      crystals.forEach((c, idx) => {
        c.position.y = c._baseY + Math.sin(t + idx * 1.2) * 0.5;
        c.rotation.x += 0.015;
        c.rotation.y += 0.012;
      });

      renderer.render(scene, camera);
    }
    tick();

    /* ── Resize ───────────────────────────────────── */
    window.addEventListener('resize', () => {
      const w = W(), h = H();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  /* ══════════════════════════════════════════════════
     DOWNLOAD CANVAS — 3D Globe with Nodes
     ══════════════════════════════════════════════════ */
  initDlCanvas();

  function initDlCanvas() {
    const canvas = document.getElementById('dlCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const W = () => canvas.parentElement.offsetWidth;
    const H = () => canvas.parentElement.offsetHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 100);
    camera.position.set(0, 0, 10);

    /* Globe wireframe */
    const globeGeo = new THREE.SphereGeometry(3.5, 18, 18);
    const globeMat = new THREE.MeshBasicMaterial({ color: 0x6c63ff, wireframe: true, transparent: true, opacity: 0.15 });
    const globe    = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    /* Glowing outer sphere */
    const outerGeo = new THREE.SphereGeometry(3.8, 32, 32);
    const outerMat = new THREE.MeshBasicMaterial({ color: 0x6c63ff, wireframe: true, transparent: true, opacity: 0.06 });
    scene.add(new THREE.Mesh(outerGeo, outerMat));

    /* Node dots on sphere surface */
    const N = 180;
    const nPos = new Float32Array(N * 3);
    const nCol = new Float32Array(N * 3);
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for (let i = 0; i < N; i++) {
      const y   = 1 - (i / (N - 1)) * 2;
      const r   = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const R   = 3.5;
      nPos[i*3]   = R * r * Math.cos(theta);
      nPos[i*3+1] = R * y;
      nPos[i*3+2] = R * r * Math.sin(theta);
      const t = i / N;
      if (t < 0.5) {
        nCol[i*3] = 0.424; nCol[i*3+1] = 0.388; nCol[i*3+2] = 1.0;
      } else if (t < 0.8) {
        nCol[i*3] = 0.0;   nCol[i*3+1] = 0.831; nCol[i*3+2] = 1.0;
      } else {
        nCol[i*3] = 1.0;   nCol[i*3+1] = 0.42;  nCol[i*3+2] = 0.2;
      }
    }
    const nGeo = new THREE.BufferGeometry();
    nGeo.setAttribute('position', new THREE.BufferAttribute(nPos, 3));
    nGeo.setAttribute('color',    new THREE.BufferAttribute(nCol, 3));
    const nMat = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true });
    const nodeMesh = new THREE.Points(nGeo, nMat);
    scene.add(nodeMesh);

    /* Arc lines between some nodes */
    const arcLines = [];
    for (let i = 0; i < 20; i++) {
      const a = Math.floor(Math.random() * N);
      const b = Math.floor(Math.random() * N);
      const pts = [];
      for (let s = 0; s <= 20; s++) {
        const lp = s / 20;
        const x = nPos[a*3]   * (1-lp) + nPos[b*3]   * lp;
        const y = nPos[a*3+1] * (1-lp) + nPos[b*3+1] * lp;
        const z = nPos[a*3+2] * (1-lp) + nPos[b*3+2] * lp;
        const d = Math.sqrt(x*x+y*y+z*z);
        const bulge = 3.5 + 0.4 * Math.sin(lp * Math.PI);
        pts.push(new THREE.Vector3(x/d*bulge, y/d*bulge, z/d*bulge));
      }
      const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const arcMat = new THREE.LineBasicMaterial({ color: 0x6c63ff, transparent: true, opacity: 0.25 });
      scene.add(new THREE.Line(arcGeo, arcMat));
      arcLines.push({ mat: arcMat });
    }

    /* Floating rings around globe */
    const dlRings = [];
    [4.8, 5.5].forEach((r, i) => {
      const geo = new THREE.TorusGeometry(r, 0.025, 8, 100);
      const mat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0x6c63ff : 0x00d4ff, transparent: true, opacity: 0.35 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = Math.PI / 2 + i * 0.4;
      mesh.rotation.z = i * 0.8;
      scene.add(mesh);
      dlRings.push(mesh);
    });

    let mxN = 0, myN = 0, txN = 0, tyN = 0;
    window.addEventListener('mousemove', e => {
      mxN = (e.clientX / window.innerWidth  - 0.5) * 2;
      myN = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let t = 0;
    function dlTick() {
      requestAnimationFrame(dlTick);
      t += 0.005;
      txN += (mxN - txN) * 0.02;
      tyN += (myN - tyN) * 0.02;
      camera.position.x = txN * 1.5;
      camera.position.y = -tyN * 1.0;
      camera.lookAt(0, 0, 0);

      globe.rotation.y    += 0.004;
      globe.rotation.x    += 0.001;
      nodeMesh.rotation.y += 0.004;
      nodeMesh.rotation.x += 0.001;

      dlRings[0].rotation.z += 0.005;
      dlRings[1].rotation.z -= 0.004;
      dlRings[1].rotation.x += 0.003;

      /* Pulse arc opacities */
      arcLines.forEach((a, i) => {
        a.mat.opacity = 0.1 + 0.2 * Math.abs(Math.sin(t + i * 0.4));
      });

      renderer.render(scene, camera);
    }
    dlTick();

    window.addEventListener('resize', () => {
      const w = W(), h = H();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

}); /* end DOMContentLoaded */
