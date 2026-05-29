(() => {
  const canvas      = document.getElementById('skyCanvas');
  const tooltip     = document.getElementById('tooltip');
  const placeholder = document.getElementById('placeholder');
  const infoBox     = document.getElementById('info-box');
  const form        = document.getElementById('controls');
  const exportBtn   = document.getElementById('exportBtn');

  let lastParams   = null;
  let cityName     = '';   // last selected city name, for PDF footer

  // ── Default date/time to now ─────────────────────────────
  function setNow() {
    const now = new Date();
    document.getElementById('date').value = now.toLocaleDateString('en-CA');
    document.getElementById('time').value =
      String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  }
  setNow();

  // ── Collect form values ──────────────────────────────────
  function getParams() {
    const lat     = parseFloat(document.getElementById('lat').value);
    const lng     = parseFloat(document.getElementById('lng').value);
    const dateStr = document.getElementById('date').value;
    const timeStr = document.getElementById('time').value || '00:00';
    const date    = new Date(`${dateStr}T${timeStr}:00`);
    return {
      lat, lng, date,
      showGrid:      document.getElementById('showGrid').checked,
      showMilkyWay:  document.getElementById('showMilkyWay').checked,
      showNames:     document.getElementById('showNames').checked,
      showConLines:  document.getElementById('showConLines').checked,
      showConLabels: document.getElementById('showConLabels').checked,
    };
  }

  // ── Render ───────────────────────────────────────────────
  function doRender() {
    const params = getParams();
    if (isNaN(params.lat) || isNaN(params.lng) || isNaN(params.date.getTime())) {
      alert('Please fill in valid location and date values.');
      return;
    }
    lastParams = params;
    placeholder.classList.add('hidden');

    const { lst, visible } = Renderer.render(canvas, params);

    const lstH  = lst / 15;
    const lstHH = Math.floor(lstH);
    const lstMM = Math.round((lstH - lstHH) * 60);

    document.getElementById('info-location').innerHTML =
      `<span>Lat ${params.lat.toFixed(4)}°  Lon ${params.lng.toFixed(4)}°</span>`;
    document.getElementById('info-time').innerHTML =
      `<span>${params.date.toLocaleString()}</span>`;
    document.getElementById('info-lst').innerHTML =
      `LST <span>${String(lstHH).padStart(2,'0')}h ${String(lstMM).padStart(2,'0')}m</span>`;
    document.getElementById('info-stars').innerHTML =
      `<span>${visible}</span> stars above horizon`;

    infoBox.hidden  = false;
    exportBtn.hidden = false;
  }

  form.addEventListener('submit', e => { e.preventDefault(); doRender(); });
  document.getElementById('nowBtn').addEventListener('click', setNow);

  document.getElementById('geoBtn').addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    const btn    = document.getElementById('geoBtn');
    const origHTML = btn.innerHTML;

    function setLoading(on) {
      btn.disabled  = on;
      btn.innerHTML = on
        ? '<span class="spinner" style="width:13px;height:13px;border-width:2px;flex-shrink:0"></span> Locating…'
        : origHTML;
    }

    function onError(err) {
      setLoading(false);
      let msg = 'Could not retrieve your location.';
      if (err) {
        if (err.code === 1) msg = 'Location access was denied.\n\nIf you opened this as a local file, browsers block geolocation on file:// pages. Use the city search instead, or serve the app via a local server (e.g. "npx serve .").';
        else if (err.code === 2) msg = 'Your location is currently unavailable. Check that Location Services are enabled on your device.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again.';
      } else {
        msg = 'Location request timed out.\n\nIf you opened this as a local file, try the city search instead.';
      }
      alert(msg);
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      pos => {
        setLoading(false);
        document.getElementById('lat').value = pos.coords.latitude.toFixed(4);
        document.getElementById('lng').value = pos.coords.longitude.toFixed(4);
        cityName = '';
      },
      onError,
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
    );
  });

  ['showGrid','showMilkyWay','showNames','showConLines','showConLabels'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      if (lastParams) doRender();
    });
  });

  // ── Tooltip ──────────────────────────────────────────────
  canvas.addEventListener('mousemove', e => {
    if (!lastParams) return;
    const rect = canvas.getBoundingClientRect();
    const hit  = Renderer.hitTest(canvas, e.clientX - rect.left, e.clientY - rect.top, lastParams);
    if (hit) {
      const { star } = hit;
      let text = star.name ? `<strong>${star.name}</strong>  ` : '';
      text += `mag ${star.mag.toFixed(2)}  alt ${star.alt.toFixed(1)}°  az ${star.az.toFixed(1)}°`;
      tooltip.innerHTML = text;
      tooltip.hidden    = false;
      const tx = Math.min(e.clientX - rect.left + 12, canvas.offsetWidth  - tooltip.offsetWidth  - 4);
      const ty = Math.max(e.clientY - rect.top  - 28, 4);
      tooltip.style.left = tx + 'px';
      tooltip.style.top  = ty + 'px';
    } else {
      tooltip.hidden = true;
    }
  });
  canvas.addEventListener('mouseleave', () => { tooltip.hidden = true; });

  // ── Resize re-render ─────────────────────────────────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (lastParams) doRender(); }, 200);
  });

  // ══════════════════════════════════════════════════════════
  // CITY SEARCH
  // ══════════════════════════════════════════════════════════
  const cityInput   = document.getElementById('citySearch');
  const cityResults = document.getElementById('cityResults');
  let   searchTimer = null;
  let   activeIndex = -1;

  cityInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = cityInput.value.trim();
    if (q.length < 2) { hideDropdown(); return; }
    cityInput.classList.add('searching');
    searchTimer = setTimeout(() => searchCity(q), 380);
  });

  cityInput.addEventListener('keydown', e => {
    const items = cityResults.querySelectorAll('.search-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      highlightItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      highlightItem(items);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      items[activeIndex].click();
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  document.addEventListener('click', e => {
    if (!cityInput.contains(e.target) && !cityResults.contains(e.target)) hideDropdown();
  });

  function highlightItem(items) {
    items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    if (items[activeIndex]) items[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  async function searchCity(query) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=0`;
      const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      cityInput.classList.remove('searching');
      showResults(data);
    } catch {
      cityInput.classList.remove('searching');
      showResults([]);
    }
  }

  function showResults(results) {
    activeIndex = -1;
    cityResults.innerHTML = '';
    cityResults.hidden    = false;

    if (!results.length) {
      const el = document.createElement('div');
      el.className = 'search-empty';
      el.textContent = 'No places found';
      cityResults.appendChild(el);
      return;
    }

    results.forEach(place => {
      const el  = document.createElement('div');
      el.className = 'search-item';

      // Shorten display_name: keep first two comma-separated parts
      const parts = place.display_name.split(',');
      const short = parts.slice(0, 3).join(',').trim();

      el.innerHTML = `
        <span class="place-name">${escHtml(short)}</span>
        <span class="place-coords">${parseFloat(place.lat).toFixed(4)}°, ${parseFloat(place.lon).toFixed(4)}°</span>
      `;
      el.addEventListener('click', () => {
        document.getElementById('lat').value = parseFloat(place.lat).toFixed(4);
        document.getElementById('lng').value = parseFloat(place.lon).toFixed(4);
        cityInput.value = short;
        cityName = short;
        hideDropdown();
      });
      cityResults.appendChild(el);
    });
  }

  function hideDropdown() {
    cityResults.hidden = true;
    cityResults.innerHTML = '';
    activeIndex = -1;
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ══════════════════════════════════════════════════════════
  // PDF EXPORT
  // ══════════════════════════════════════════════════════════
  const modal        = document.getElementById('export-modal');
  const modalCancel  = document.getElementById('modalCancel');
  const modalClose   = document.getElementById('modalClose');
  const modalExport  = document.getElementById('modalExport');
  const spinner      = document.getElementById('export-spinner');
  const pdfTitleEl   = document.getElementById('pdfTitle');
  const pdfSubtitleEl= document.getElementById('pdfSubtitle');

  // Pre-fill title/subtitle when modal opens
  exportBtn.addEventListener('click', () => {
    if (!lastParams) return;
    // Pre-fill title with city name if available, else coordinates
    if (!pdfTitleEl.value) {
      pdfTitleEl.value = cityName
        ? `Night Sky over ${cityName.split(',')[0].trim()}`
        : `Night Sky`;
    }
    if (!pdfSubtitleEl.value) {
      const p = lastParams;
      const location = cityName
        ? cityName.split(',').slice(0,2).join(',').trim()
        : `${p.lat.toFixed(4)}°, ${p.lng.toFixed(4)}°`;
      const dateStr = p.date.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
      const timeStr = p.date.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
      pdfSubtitleEl.value = `${location} · ${dateStr} · ${timeStr}`;
    }
    modal.hidden = false;
    pdfTitleEl.focus();
    pdfTitleEl.select();
  });

  function closeModal() {
    modal.hidden = true;
    spinner.hidden = true;
    modalExport.disabled = false;
  }
  modalCancel.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  modalExport.addEventListener('click', () => {
    const title    = pdfTitleEl.value.trim();
    const subtitle = pdfSubtitleEl.value.trim();
    if (!title) { pdfTitleEl.focus(); pdfTitleEl.style.borderColor = '#e05555'; return; }
    pdfTitleEl.style.borderColor = '';
    generatePDF(title, subtitle);
  });

  async function generatePDF(title, subtitle) {
    spinner.hidden  = false;
    modalExport.disabled = true;

    // Defer to next frame so spinner renders
    await new Promise(r => setTimeout(r, 30));

    try {
      // Load jsPDF on demand
      const jsPDF = await loadJsPDF();

      // Render star map at 1200 × 1200 px off-screen
      const MAP_PX   = 1200;
      const offCanvas = Renderer.renderOffscreen(lastParams, MAP_PX);
      const mapImg    = offCanvas.toDataURL('image/png');

      // A4 in mm
      const PAGE_W = 210, PAGE_H = 297;
      const MARGIN  = 18;   // mm

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // ── Background ──────────────────────────────────────
      doc.setFillColor(5, 5, 16);
      doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

      // ── Decorative top bar ───────────────────────────────
      doc.setFillColor(20, 20, 50);
      doc.rect(0, 0, PAGE_W, 10, 'F');

      // ── Title ────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(232, 234, 248);
      doc.text(title, PAGE_W / 2, 24, { align: 'center', maxWidth: PAGE_W - MARGIN * 2 });

      let cursorY = 34;

      // ── Subtitle ─────────────────────────────────────────
      if (subtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(160, 170, 220);
        const lines = doc.splitTextToSize(subtitle, PAGE_W - MARGIN * 2 - 10);
        doc.text(lines, PAGE_W / 2, cursorY, { align: 'center' });
        cursorY += lines.length * 6 + 4;
      }

      // ── Divider line ─────────────────────────────────────
      cursorY += 4;
      doc.setDrawColor(30, 30, 70);
      doc.setLineWidth(0.3);
      doc.line(MARGIN, cursorY, PAGE_W - MARGIN, cursorY);
      cursorY += 6;

      // ── Star map image (square, centered) ────────────────
      const mapW = PAGE_W - MARGIN * 2;
      const mapH = mapW;  // square
      const mapX = MARGIN;
      const mapY = cursorY;

      // Clip to circle by drawing a white filled circle mask in the doc
      // jsPDF supports SVG path clipping — use addImage first, then overlay circle border
      doc.addImage(mapImg, 'PNG', mapX, mapY, mapW, mapH);

      // Circle border overlay
      doc.setDrawColor(80, 100, 180);
      doc.setLineWidth(0.5);
      doc.circle(PAGE_W / 2, mapY + mapH / 2, mapW / 2, 'S');

      // Cardinal direction labels
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(107, 127, 212);
      const cx = PAGE_W / 2, cy = mapY + mapH / 2, cr = mapW / 2;
      const dirs = [['N', cx, mapY + 3.5], ['S', cx, mapY + mapH - 1.5],
                    ['E', cx + cr - 2.5, cy + 1.5], ['W', cx - cr + 2, cy + 1.5]];
      dirs.forEach(([d, x, y]) => doc.text(d, x, y, { align: 'center' }));

      cursorY = mapY + mapH + 6;

      // ── Footer info ──────────────────────────────────────
      const p = lastParams;
      const loc = cityName
        ? cityName.split(',').slice(0,2).join(',').trim()
        : `${p.lat.toFixed(4)}°, ${p.lng.toFixed(4)}°`;
      const footerText = `${loc}  ·  ${p.date.toLocaleString()}  ·  Lat ${p.lat.toFixed(2)}°  Lon ${p.lng.toFixed(2)}°`;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 90, 130);
      doc.text(footerText, PAGE_W / 2, cursorY + 3, { align: 'center', maxWidth: PAGE_W - MARGIN * 2 });

      // ── Bottom bar ────────────────────────────────────────
      doc.setFillColor(20, 20, 50);
      doc.rect(0, PAGE_H - 8, PAGE_W, 8, 'F');
      doc.setFontSize(7);
      doc.setTextColor(60, 70, 110);
      doc.text('Generated by StarMap', PAGE_W / 2, PAGE_H - 2.5, { align: 'center' });

      // ── Save ─────────────────────────────────────────────
      const filename = `starmap_${title.replace(/[^a-z0-9]/gi,'_').toLowerCase()}.pdf`;
      doc.save(filename);

    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      spinner.hidden  = false;
      spinner.hidden  = true;
      modalExport.disabled = false;
      closeModal();
    }
  }

  function loadJsPDF() {
    if (window.jspdf) return Promise.resolve(window.jspdf.jsPDF);
    return new Promise((resolve, reject) => {
      const s   = document.createElement('script');
      s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload  = () => resolve(window.jspdf.jsPDF);
      s.onerror = () => reject(new Error('Could not load jsPDF'));
      document.head.appendChild(s);
    });
  }
})();
