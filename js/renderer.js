const Renderer = (() => {

  // B-V color index → CSS color
  function starColor(bv) {
    if (bv < -0.15) return '#a8b8ff';
    if (bv < 0.15)  return '#d0dcff';
    if (bv < 0.45)  return '#fff4e8';
    if (bv < 0.75)  return '#ffec80';
    if (bv < 1.20)  return '#ffa050';
    return '#ff6040';
  }

  function starRadius(mag) {
    if (mag < 0)  return 5.5;
    if (mag < 1)  return 4.2;
    if (mag < 2)  return 3.0;
    if (mag < 3)  return 2.2;
    if (mag < 4)  return 1.6;
    if (mag < 5)  return 1.1;
    return 0.8;
  }

  function drawBackground(ctx, cx, cy, radius) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0,   '#0d0d22');
    grad.addColorStop(0.5, '#08081a');
    grad.addColorStop(1,   '#050510');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMilkyWay(ctx, cx, cy, radius, lst, lat) {
    const bands = [
      { ra: 266, dec: -29, width: 0.22 },
      { ra: 83,  dec: -1,  width: 0.16 },
      { ra: 300, dec: 45,  width: 0.14 },
      { ra: 125, dec: -47, width: 0.12 },
    ];
    bands.forEach(b => {
      const pos = Astro.equatorialToHorizontal(b.ra, b.dec, lat, lst);
      if (pos.alt < -30) return;
      const p = Astro.toCanvas(pos.alt, pos.az, cx, cy, radius);
      if (!p) return;
      const r = radius * b.width * (1 - Math.abs(pos.alt) / 180);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      grad.addColorStop(0,   'rgba(160,180,255,0.07)');
      grad.addColorStop(0.5, 'rgba(140,160,240,0.04)');
      grad.addColorStop(1,   'rgba(120,140,220,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawHorizon(ctx, cx, cy, radius, sc) {
    ctx.strokeStyle = 'rgba(107,127,212,0.35)';
    ctx.lineWidth   = 1.2 * sc;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    const altitudes = [30, 60];
    altitudes.forEach(alt => {
      const r = radius * (90 - alt) / 90;
      ctx.strokeStyle = 'rgba(107,127,212,0.1)';
      ctx.lineWidth   = 0.6 * sc;
      ctx.setLineDash([3 * sc, 5 * sc]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(107,127,212,0.35)';
      ctx.font = `${9 * sc}px system-ui`;
      ctx.fillText(`${alt}°`, cx + r + 3 * sc, cy);
    });

    ctx.fillStyle = 'rgba(107,127,212,0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, 2 * sc, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawAltGrid(ctx, cx, cy, radius, sc) {
    [10, 20, 30, 40, 50, 60, 70, 80].forEach(alt => {
      const r = radius * (90 - alt) / 90;
      ctx.strokeStyle = 'rgba(107,127,212,0.08)';
      ctx.lineWidth   = 0.5 * sc;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    for (let az = 0; az < 360; az += 45) {
      const p = Astro.toCanvas(0, az, cx, cy, radius);
      if (p) {
        ctx.strokeStyle = 'rgba(107,127,212,0.07)';
        ctx.lineWidth   = 0.5 * sc;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }
  }

  function buildStarMap(lat, lst) {
    const map  = new Map();
    const seen = new Set();
    STAR_CATALOG.forEach(([hip, ra, dec, mag, bv, name]) => {
      if (seen.has(hip)) return;
      seen.add(hip);
      const pos = Astro.equatorialToHorizontal(ra, dec, lat, lst);
      map.set(hip, { ra, dec, mag, bv, name, alt: pos.alt, az: pos.az });
    });
    return map;
  }

  function constellationColor(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
    return `hsla(${h % 360},60%,72%,0.55)`;
  }

  function drawConstellationLines(ctx, starMap, cx, cy, radius, sc) {
    ctx.save();
    ctx.lineWidth = 0.8 * sc;
    ctx.setLineDash([3 * sc, 4 * sc]);

    CONSTELLATION_DATA.forEach(con => {
      if (!con.lines || !con.lines.length) return;
      ctx.strokeStyle = constellationColor(con.id);
      con.lines.forEach(([h1, h2]) => {
        const s1 = starMap.get(h1);
        const s2 = starMap.get(h2);
        if (!s1 || !s2 || s1.alt < -1 || s2.alt < -1) return;
        const p1 = Astro.toCanvas(s1.alt, s1.az, cx, cy, radius);
        const p2 = Astro.toCanvas(s2.alt, s2.az, cx, cy, radius);
        if (!p1 || !p2) return;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });
    });

    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawConstellationLabels(ctx, lat, lst, cx, cy, radius, sc) {
    ctx.save();
    ctx.font      = `bold ${10 * sc}px system-ui`;
    ctx.textAlign = 'center';

    CONSTELLATION_DATA.forEach(con => {
      if (!con.name) return;
      const pos = Astro.equatorialToHorizontal(con.center[0], con.center[1], lat, lst);
      if (pos.alt < 5) return;
      const p = Astro.toCanvas(pos.alt, pos.az, cx, cy, radius);
      if (!p) return;
      ctx.fillStyle   = constellationColor(con.id);
      ctx.globalAlpha = 0.75;
      ctx.fillText(con.id.replace('_extra', ''), p.x, p.y);
      ctx.globalAlpha = 1;
    });
    ctx.restore();
  }

  function drawStars(ctx, starMap, cx, cy, radius, showNames, sc) {
    starMap.forEach(star => {
      if (star.alt < 0) return;
      const p = Astro.toCanvas(star.alt, star.az, cx, cy, radius);
      if (!p) return;

      const r     = starRadius(star.mag) * sc;
      const color = starColor(star.bv);

      if (star.mag < 2) {
        const glowR = r * (star.mag < 0 ? 7 : star.mag < 1 ? 5.5 : 4);
        const glow  = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        glow.addColorStop(0,   'rgba(255,255,255,0.30)');
        glow.addColorStop(0.3, 'rgba(200,212,255,0.12)');
        glow.addColorStop(1,   'rgba(200,212,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      if (showNames && star.name && star.mag < 2.0) {
        ctx.fillStyle = 'rgba(200,210,255,0.8)';
        ctx.font      = `${9 * sc}px system-ui`;
        ctx.textAlign = 'left';
        ctx.fillText(star.name, p.x + r + 3 * sc, p.y + 3 * sc);
      }
    });
  }

  // Core scene draw — used by both on-screen render and off-screen export.
  // sc = scale factor relative to a 250px-radius reference canvas.
  function _drawScene(ctx, params, cx, cy, radius) {
    const { lat, lng, date,
            showGrid, showMilkyWay, showNames,
            showConLines, showConLabels } = params;
    const sc  = radius / 250;
    const lst = Astro.lst(date, lng);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    drawBackground(ctx, cx, cy, radius);
    if (showMilkyWay) drawMilkyWay(ctx, cx, cy, radius, lst, lat);
    if (showGrid)     drawAltGrid(ctx, cx, cy, radius, sc);

    const starMap = buildStarMap(lat, lst);
    if (showConLines)  drawConstellationLines(ctx, starMap, cx, cy, radius, sc);
    drawStars(ctx, starMap, cx, cy, radius, showNames, sc);
    if (showConLabels) drawConstellationLabels(ctx, lat, lst, cx, cy, radius, sc);

    drawHorizon(ctx, cx, cy, radius, sc);
    ctx.restore();

    return { lst, starMap };
  }

  // Render onto the visible on-screen canvas.
  function render(canvas, params) {
    const size = canvas.offsetWidth;
    const dpr  = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const { lst, starMap } = _drawScene(ctx, params, size / 2, size / 2, size / 2 - 2);

    let visible = 0;
    starMap.forEach(s => { if (s.alt >= 0) visible++; });
    return { lst, visible };
  }

  // Render into a new off-screen canvas at the requested pixel size.
  // No DPR scaling — caller gets a canvas at exactly `size` × `size` px.
  function renderOffscreen(params, size) {
    const off = document.createElement('canvas');
    off.width  = size;
    off.height = size;
    _drawScene(off.getContext('2d'), params, size / 2, size / 2, size / 2 - 2);
    return off;
  }

  // Hit-test: nearest star within 12 CSS px.
  function hitTest(canvas, mouseX, mouseY, { lat, lng, date }) {
    const size    = canvas.offsetWidth;
    const cx      = size / 2;
    const cy      = size / 2;
    const radius  = cx - 2;
    const lst     = Astro.lst(date, lng);
    const starMap = buildStarMap(lat, lst);

    let best = null, bestDist = 12;
    starMap.forEach(star => {
      if (star.alt < 0) return;
      const p = Astro.toCanvas(star.alt, star.az, cx, cy, radius);
      if (!p) return;
      const d = Math.hypot(p.x - mouseX, p.y - mouseY);
      if (d < bestDist) { bestDist = d; best = { star, x: p.x, y: p.y }; }
    });
    return best;
  }

  return { render, renderOffscreen, hitTest };
})();
