// Slow starfield background. Respects prefers-reduced-motion.
(() => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
  const c = document.getElementById('sky');
  if (!c) return;
  const ctx = c.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = { white: '230,234,245', cool: '180,200,255', warm: '255,226,200' };
  let W, H, stars = [], nebula, shoot = null, nextShoot = 9000 + Math.random() * 12000;
  const rand = (a, b) => a + Math.random() * (b - a);

  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    const count = Math.round((W * H) / 3800);
    for (let i = 0; i < count; i++) {
      const d = Math.random();
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: d < 0.75 ? rand(0.3, 0.7) : d < 0.95 ? rand(0.7, 1.1) : rand(1.1, 1.5),
        a: d < 0.75 ? rand(0.15, 0.45) : rand(0.4, 0.8),
        v: 0.004 + d * 0.018, tw: rand(0.0004, 0.0016), ph: Math.random() * 6.28,
        hue: Math.random() < 0.15 ? 'warm' : Math.random() < 0.3 ? 'cool' : 'white'
      });
    }
    nebula = document.createElement('canvas');
    nebula.width = W; nebula.height = H;
    const n = nebula.getContext('2d');
    const blob = (x, y, r, col) => {
      const g = n.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      n.fillStyle = g; n.fillRect(0, 0, W, H);
    };
    const M = Math.max(W, H);
    blob(W * 0.78, H * 0.18, M * 0.45, 'rgba(60, 80, 150, 0.10)');
    blob(W * 0.15, H * 0.85, M * 0.40, 'rgba(90, 60, 130, 0.07)');
    blob(W * 0.55, H * 0.55, M * 0.30, 'rgba(40, 90, 120, 0.04)');
  }

  function frame(now, dt) {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(nebula, 0, 0);
    for (const s of stars) {
      if (!reduced) {
        s.x -= s.v * dt * 0.06; s.y += s.v * dt * 0.015;
        if (s.x < -2) s.x = W + 2;
        if (s.y > H + 2) s.y = -2;
      }
      const tw = reduced ? 1 : 0.65 + 0.35 * Math.sin(now * s.tw + s.ph);
      ctx.fillStyle = `rgba(${colors[s.hue]},${(s.a * tw).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
    }
    if (reduced) return;
    nextShoot -= dt;
    if (!shoot && nextShoot <= 0) {
      shoot = { x: rand(W * 0.3, W), y: rand(0, H * 0.4), life: 0, max: 900, ang: rand(2.5, 2.8), sp: rand(0.45, 0.65) };
      nextShoot = 14000 + Math.random() * 16000;
    }
    if (shoot) {
      shoot.life += dt;
      const p = shoot.life / shoot.max;
      const hx = shoot.x + Math.cos(shoot.ang) * shoot.sp * shoot.life;
      const hy = shoot.y + Math.sin(shoot.ang) * shoot.sp * shoot.life;
      const tx = hx - Math.cos(shoot.ang) * 90, ty = hy - Math.sin(shoot.ang) * 90;
      const g = ctx.createLinearGradient(hx, hy, tx, ty);
      g.addColorStop(0, `rgba(230,236,255,${Math.sin(Math.PI * Math.min(p, 1)) * 0.5})`);
      g.addColorStop(1, 'rgba(230,236,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
      if (p >= 1) shoot = null;
    }
  }

  build();
  let t;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { build(); if (reduced) frame(0, 0); }, 150); });
  if (reduced) { frame(0, 0); return; }
  let last = performance.now();
  (function loop(now) {
    const dt = Math.min(now - last, 50); last = now;
    frame(now, dt);
    requestAnimationFrame(loop);
  })(last);
})();
