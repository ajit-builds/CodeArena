/* ═══════════════════════════════════════════════
   rocket-cursor.js  —  CodeArena
   Drop-in rocket cursor with steam/exhaust trail.
   Usage:  <script src="rocket-cursor.js" defer></script>
   No dependencies. Works on any page.
═══════════════════════════════════════════════ */
(function () {

  /* ── 1. Canvas overlay ── */
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none',
    zIndex: '999998'
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── 2. Rocket SVG rendered to offscreen canvas ── */
  const ROCKET_W = 22;
  const ROCKET_H = 37;

  const rocketCanvas = document.createElement('canvas');
  rocketCanvas.width  = ROCKET_W;
  rocketCanvas.height = ROCKET_H;
  const rc = rocketCanvas.getContext('2d');

  function drawRocketToBuffer() {
    rc.clearRect(0, 0, ROCKET_W, ROCKET_H);

    // Body
    rc.beginPath();
    rc.moveTo(11, 0);
    rc.bezierCurveTo(11, 0, 17, 9, 17, 21);
    rc.lineTo(11, 25);
    rc.lineTo(5, 21);
    rc.bezierCurveTo(5, 9, 11, 0, 11, 0);
    rc.closePath();
    rc.fillStyle = '#00e5ff';
    rc.fill();

    // Body highlight
    rc.beginPath();
    rc.moveTo(11, 0);
    rc.bezierCurveTo(10.2, 4, 9.8, 10, 10.2, 14);
    rc.bezierCurveTo(10.6, 11, 11, 6, 11, 0);
    rc.closePath();
    rc.fillStyle = 'rgba(255,255,255,0.25)';
    rc.fill();

    // Left fin
    rc.beginPath();
    rc.moveTo(5, 20);
    rc.lineTo(0, 30);
    rc.lineTo(6, 24);
    rc.closePath();
    rc.fillStyle = '#0099aa';
    rc.fill();

    // Right fin
    rc.beginPath();
    rc.moveTo(17, 20);
    rc.lineTo(22, 30);
    rc.lineTo(16, 24);
    rc.closePath();
    rc.fillStyle = '#0099aa';
    rc.fill();

    // Porthole outer
    rc.beginPath();
    rc.arc(11, 13, 3.5, 0, Math.PI * 2);
    rc.fillStyle = '#04111a';
    rc.fill();
    rc.strokeStyle = '#ccff00';
    rc.lineWidth = 1.2;
    rc.stroke();

    // Porthole glare
    rc.beginPath();
    rc.arc(9.6, 11.8, 1.2, 0, Math.PI * 2);
    rc.fillStyle = 'rgba(255,255,255,0.35)';
    rc.fill();

    // Engine nozzle
    rc.beginPath();
    rc.moveTo(8, 24);
    rc.lineTo(14, 24);
    rc.lineTo(13, 28);
    rc.lineTo(9, 28);
    rc.closePath();
    rc.fillStyle = '#0077aa';
    rc.fill();
  }

  drawRocketToBuffer();

  /* ── 3. Hide default cursor site-wide ── */
  const styleEl = document.createElement('style');
  styleEl.textContent = '*, *::before, *::after { cursor: none !important; }';
  document.head.appendChild(styleEl);

  /* ── 4. Particle pool ── */
  let particles = [];
  let mx = -200, my = -200;
  let active = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    active = true;
    spawnParticles();
  });

  document.addEventListener('mouseleave', () => { active = false; });

  function spawnParticles() {
    /*
      Rocket is drawn at (mx - 11, my - 2) with rotation -45deg.
      Exhaust exits the nozzle, which is at SVG (11, 26) before rotation.
      With -45deg rotation around center (11, 18.5):
        offset from center = (0, 7.5)
        rotated x = 0·cos(-45) - 7.5·sin(-45) =  5.3
        rotated y = 0·sin(-45) + 7.5·cos(-45) =  5.3
        exhaust in div = (16.3, 23.8) from div top-left
        div top-left = (mx - 11, my - 2)
        exhaust on page ≈ (mx + 5, my + 22)
    */
    const ex = mx + 5;
    const ey = my + 22;

    for (let i = 0; i < 5; i++) {
      const spread = (Math.random() - 0.5) * 1.2;
      const speed  = 0.7 + Math.random() * 2.2;
      const angle  = Math.PI / 4 + spread;   // down-right (exhaust direction)
      const hue    = Math.random();

      particles.push({
        x:    ex + (Math.random() - 0.5) * 6,
        y:    ey + (Math.random() - 0.5) * 6,
        vx:   Math.cos(angle) * speed,
        vy:   Math.sin(angle) * speed,
        life: 0.85 + Math.random() * 0.15,
        r:    1.0 + Math.random() * 2.6,
        hue,
      });
    }
  }

  /* ── 5. Render loop ── */
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Particles */
    particles = particles.filter(p => p.life > 0.02);
    for (const p of particles) {
      p.x    += p.vx;
      p.y    += p.vy;
      p.vx   *= 0.96;
      p.vy   *= 0.96;
      p.life -= 0.028;
      p.r    += 0.08;

      let color;
      if (p.hue < 0.38) {
        color = `rgba(0,229,255,${(p.life * 0.75).toFixed(2)})`;
      } else if (p.hue < 0.65) {
        color = `rgba(204,255,0,${(p.life * 0.65).toFixed(2)})`;
      } else {
        const v = Math.round(160 + 80 * p.life);
        color = `rgba(${v},${v},${v},${(p.life * 0.4).toFixed(2)})`;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    /* Rocket — draw rotated -45deg around nose tip */
    if (active) {
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(-Math.PI / 4);
      ctx.drawImage(rocketCanvas, -11, -2);
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

})();