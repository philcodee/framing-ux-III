/* ============================================================
   ANIMATED VIEW — drag-to-scrub interactive overlay
   Guidelines: Guidelines/animated-view-guidelines.md
   ============================================================ */

(function () {

  /* ── DATA ─────────────────────────────────────────────── */

  const YEARS = [1972, 1980, 1990, 2000, 2010, 2014, 2020];

  const GROUPS = [
    { key: 'white',  label: 'White' },
    { key: 'black',  label: 'Black' },
    { key: 'hisp',   label: 'Hispanic' },
    { key: 'lowinc', label: 'Low-income' },
    { key: 'young',  label: 'Young adults' },
  ];

  const TRUST = {
    white:  [0.54, 0.40, 0.35, 0.36, 0.22, 0.19, 0.17],
    black:  [0.30, 0.22, 0.21, 0.25, 0.14, 0.08, 0.12],
    hisp:   [0.38, 0.28, 0.25, 0.28, 0.17, 0.12, 0.14],
    lowinc: [0.32, 0.24, 0.22, 0.22, 0.13, 0.09, 0.11],
    young:  [0.58, 0.42, 0.32, 0.34, 0.24, 0.20, 0.16],
  };

  const NATIONAL = [0.48, 0.36, 0.31, 0.33, 0.19, 0.18, 0.17];

  const IMAGES = {
    1972: 'images/1972_Events_Collage.jpg',
    1980: 'images/1980_Events_Collage.jpg',
    1990: 'images/1990_decade_montage.png',
    2000: 'images/2000_decade_montage3.png',
    2010: 'images/2010-financial-crisis.png',
    2014: 'images/2014-ferguson-protest.png',
    2020: 'images/2020-blm.jpg',
  };

  const ANNOTATIONS = [
    'High baseline — but already unequal. White and young Americans trusted government at nearly twice the rate of Black and low-income communities.',
    'Watergate\'s aftermath. Trust collapsed across all groups. The gap between White and Black Americans widened rather than closed.',
    'Stabilization — but at a lower floor. Hispanic communities saw no recovery from 1980. Low-income trust held below 25%.',
    'Brief uptick following the 1990s economic expansion. Every group improved slightly — the only decade-start with a positive trend.',
    'The financial crisis erased the recovery. Low-income trust fell to 13%. Young adults — most optimistic in 1972 — dropped to 24%.',
    'Historic low. Only 19% of Americans trusted government most of the time. Black Americans: 8%. This is the floor.',
    'Marginal recovery obscures the damage. The gap between White and Black Americans is structurally unchanged from 1972.',
  ];

  /* ── STATE ─────────────────────────────────────────────── */

  let overlay     = null;
  let trackEl     = null;
  let handleEl    = null;
  let dragging    = false;
  let dragStartX  = 0;
  let dragStartPos = 0;   // 0–1
  let currentPos  = 0;    // 0–1 (continuous, interpolated)
  let snappedIdx  = 0;    // last snapped year index

  let playing       = false;
  let playSpeed     = 1;
  let playRafId     = null;
  let lastTimestamp = null;
  let lastAnnotIdx  = -1;
  // year-segments per second at each speed
  const RATE = { 1: 0.30, 2: 0.65, 3: 1.6 };

  /* ── INTERPOLATION ─────────────────────────────────────── */

  function posToFloat(pos) {
    return Math.max(0, Math.min(1, pos)) * (YEARS.length - 1);
  }

  function floatYear(f) {
    const lo = Math.floor(f), hi = Math.min(lo + 1, YEARS.length - 1);
    const t  = f - lo;
    return Math.round(YEARS[lo] * (1 - t) + YEARS[hi] * t);
  }

  function floatTrust(key, f) {
    const lo = Math.floor(f), hi = Math.min(lo + 1, YEARS.length - 1);
    const t  = f - lo;
    return TRUST[key][lo] * (1 - t) + TRUST[key][hi] * t;
  }

  function floatNational(f) {
    const lo = Math.floor(f), hi = Math.min(lo + 1, YEARS.length - 1);
    const t  = f - lo;
    return NATIONAL[lo] * (1 - t) + NATIONAL[hi] * t;
  }

  function nearestIdx(f) {
    return Math.round(Math.max(0, Math.min(YEARS.length - 1, f)));
  }

  /* ── BUILD OVERLAY ─────────────────────────────────────── */

  function build() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'av-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.hidden = true;

    overlay.innerHTML = `
      <div class="av-topbar">
        <div class="av-topbar-title">Civic Trust in America</div>
        <div class="av-topbar-meta">Pew Research &middot; GSS &middot; ANES<br>1958 &ndash; 2020</div>
      </div>

      <div class="av-stage">

        <!-- Left: full-height image panel -->
        <div class="av-image-panel">
          <img class="av-image" id="avImage" src="" alt="" aria-hidden="true">
        </div>

        <!-- Right: all visualization content -->
        <div class="av-content">

          <div class="av-editorial">
            <div class="av-year-big" id="avYearBig">1972</div>
            <div class="av-annotation" id="avAnnotation"></div>
            <div class="av-event-callout" id="avEventCallout"></div>
          </div>

          <!-- Drag scrubber -->
          <div class="av-scrub-section">
            <div class="av-track-area" id="avTrackArea">
              <div class="av-track-line" id="avTrackLine">
                <div class="av-track-fill" id="avTrackFill"></div>
                <div class="av-handle" id="avHandle"></div>
              </div>
            </div>
            <div class="av-controls">
              <button class="av-play-btn" id="avPlayBtn" aria-label="Play">&#9654; Play</button>
              <div class="av-speed-group">
                <button class="av-speed-btn active" data-speed="1">1&times;</button>
                <button class="av-speed-btn" data-speed="2">2&times;</button>
                <button class="av-speed-btn" data-speed="3">3&times;</button>
              </div>
            </div>
          </div>

          <!-- Fill columns -->
          <div class="av-columns" id="avColumns"></div>

          <!-- Two-column: trust trend + resource deficit -->
          <div class="av-bottom-row">

            <div class="av-trust-panel">
              <div class="av-chart-header">
                <div class="av-chart-label">National trust avg</div>
                <div class="av-chart-val" id="avNatVal">—</div>
              </div>
              <div class="av-chart-wrap">
                <canvas id="avCanvas"></canvas>
                <div class="av-chart-cursor" id="avChartCursor"></div>
              </div>
            </div>

            <div class="av-resource-panel">
              <div class="av-resource-header">
                <div class="av-chart-label">Resource deficit</div>
                <div class="av-resource-year" id="avResourceYear"></div>
              </div>
              <div class="av-resource-row" id="avResourceRow"></div>
            </div>

          </div>

        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    buildColumns();
    buildResourceStrip();
    bindEvents();

    renderAt(0, false);
  }

  /* ── COLUMNS ───────────────────────────────────────────── */

  function buildColumns() {
    const wrap = overlay.querySelector('#avColumns');
    GROUPS.forEach(g => {
      const col = document.createElement('div');
      col.className = 'av-col';
      col.dataset.key = g.key;
      col.innerHTML = `
        <div class="av-col-inner">
          <div class="av-fill-wrap">
            <div class="av-fill" id="avFill-${g.key}"></div>
          </div>
          <div class="av-col-pct" id="avPct-${g.key}">—</div>
        </div>
        <div class="av-col-label">${g.label}</div>
      `;
      wrap.appendChild(col);
    });
  }

  /* ── RESOURCE DEFICIT STRIP ────────────────────────────── */

  /* eslint-disable no-undef */
  function getResources() { try { return typeof resources !== 'undefined' ? resources : null; } catch(e) { return null; } }
  function getRvYears()   { try { return typeof rvYears   !== 'undefined' ? rvYears   : [2000, 2005, 2010, 2015, 2020]; } catch(e) { return [2000, 2005, 2010, 2015, 2020]; } }
  function getTrustEvents(){ try { return typeof trustEvents !== 'undefined' ? trustEvents : {}; } catch(e) { return {}; } }
  /* eslint-enable no-undef */

  function nearestRvYear(year) {
    const rvYrs = getRvYears();
    return rvYrs.reduce((a, b) => Math.abs(b - year) < Math.abs(a - year) ? b : a);
  }

  function buildResourceStrip() {
    const res = getResources();
    if (!res) return;
    const row = overlay.querySelector('#avResourceRow');
    res.forEach(r => {
      const col = document.createElement('div');
      col.className = 'av-res-col';
      col.innerHTML = `
        <div class="av-res-fill-wrap">
          <div class="av-res-fill" id="avRFill-${r.key}"></div>
        </div>
        <div class="av-res-pct" id="avRPct-${r.key}">—</div>
        <div class="av-res-label">${r.label}</div>
      `;
      row.appendChild(col);
    });
  }

  function updateResourceStrip(idx) {
    const res   = getResources();
    const rvYrs = getRvYears();
    if (!res) return;
    const snapYear = YEARS[idx];
    const yearEl   = overlay.querySelector('#avResourceYear');

    if (snapYear < rvYrs[0]) {
      if (yearEl) yearEl.textContent = '';
      res.forEach(r => {
        const fill = overlay.querySelector(`#avRFill-${r.key}`);
        const pct  = overlay.querySelector(`#avRPct-${r.key}`);
        if (fill) fill.style.height = '0%';
        if (pct)  pct.textContent   = '0%';
      });
    } else {
      const rvYear = nearestRvYear(snapYear);
      const rvIdx  = rvYrs.indexOf(rvYear);
      if (yearEl) yearEl.textContent = rvYear;
      res.forEach(r => {
        const val  = r.data.national[rvIdx];
        const fill = overlay.querySelector(`#avRFill-${r.key}`);
        const pct  = overlay.querySelector(`#avRPct-${r.key}`);
        if (fill) fill.style.height = (val * 100) + '%';
        if (pct)  pct.textContent   = Math.round(val * 100) + '%';
      });
    }
  }

  /* ── TRACK EXTRAS: event dots + era labels ─────────────── */


  /* ── PLAYBACK ──────────────────────────────────────────── */

  function setPlayBtn(isPlaying) {
    const btn = overlay && overlay.querySelector('#avPlayBtn');
    if (btn) btn.innerHTML = isPlaying ? '&#10074;&#10074; Pause' : '&#9654; Play';
  }

  function startPlay() {
    if (snappedIdx >= YEARS.length - 1) {
      snappedIdx = 0;
      currentPos = 0;
      lastAnnotIdx = -1;
      renderAt(0, false);
    }
    playing = true;
    lastTimestamp = null;
    setPlayBtn(true);
    playRafId = requestAnimationFrame(playFrame);
  }

  function pausePlay() {
    playing = false;
    if (playRafId) { cancelAnimationFrame(playRafId); playRafId = null; }
    setPlayBtn(false);
  }

  function togglePlay() {
    playing ? pausePlay() : startPlay();
  }

  function playFrame(timestamp) {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const elapsed = (timestamp - lastTimestamp) / 1000; // seconds
    lastTimestamp = timestamp;

    const f    = posToFloat(currentPos);
    const newF = Math.min(f + RATE[playSpeed] * elapsed, YEARS.length - 1);
    currentPos = newF / (YEARS.length - 1);

    const nearIdx = nearestIdx(newF);
    snappedIdx = nearIdx;

    // Trigger annotation + resource update only when crossing into a new year
    const crossedYear = nearIdx !== lastAnnotIdx;
    if (crossedYear) lastAnnotIdx = nearIdx;
    renderAt(newF, !crossedYear);

    if (newF >= YEARS.length - 1) {
      pausePlay();
      return;
    }

    playRafId = requestAnimationFrame(playFrame);
  }

  /* ── DRAG EVENTS ───────────────────────────────────────── */

  function bindEvents() {
    const trackArea = overlay.querySelector('#avTrackArea');

    /* Drag — pointer events on the track area only */
    trackArea.addEventListener('pointerdown', onDragStart);
    document.addEventListener('pointermove', onDragMove, { passive: true });
    document.addEventListener('pointerup',   onDragEnd);

    /* Play button */
    overlay.querySelector('#avPlayBtn').addEventListener('click', togglePlay);

    /* Speed buttons */
    overlay.querySelectorAll('.av-speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        playSpeed = Number(btn.dataset.speed);
        overlay.querySelectorAll('.av-speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // speed change takes effect on next frame automatically
      });
    });

    /* Close — event delegation on overlay so no button reference needed */
    overlay.addEventListener('click', e => {
      if (e.target.closest('.av-back')) closeOverlay();
    });

    document.addEventListener('keydown', onKey);
  }

  function onDragStart(e) {
    if (playing) pausePlay();
    lastAnnotIdx = -1;
    handleEl = overlay.querySelector('#avHandle');
    trackEl  = overlay.querySelector('#avTrackLine');

    /* Snap to clicked position immediately so any point on the track is grabbable */
    const rect     = trackEl.getBoundingClientRect();
    const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    currentPos     = clickPos;
    renderAt(posToFloat(clickPos), true);

    dragging     = true;
    dragStartX   = e.clientX;
    dragStartPos = clickPos;
    handleEl.classList.add('dragging');
    e.preventDefault();
  }

  function onDragMove(e) {
    if (!dragging || !trackEl) return;
    const trackW = trackEl.getBoundingClientRect().width;
    const dx     = e.clientX - dragStartX;
    const dPos   = dx / trackW;
    const newPos = Math.max(0, Math.min(1, dragStartPos + dPos));
    currentPos   = newPos;
    renderAt(posToFloat(newPos), true);
  }

  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    if (handleEl) handleEl.classList.remove('dragging');
    /* Snap to nearest year on release */
    const f   = posToFloat(currentPos);
    const idx = nearestIdx(f);
    snapTo(idx);
  }

  function snapTo(idx) {
    snappedIdx = idx;
    currentPos = idx / (YEARS.length - 1);
    renderAt(idx, false);
  }

  /* ── RENDER ────────────────────────────────────────────── */

  function renderAt(f, interpolating) {
    const yr      = floatYear(f);
    const natVal  = floatNational(f);
    const idx     = nearestIdx(f);
    const snapPct = (idx / (YEARS.length - 1)) * 100;
    const dragPct = (f / (YEARS.length - 1)) * 100;

    /* Handle + track fill */
    const handle = overlay.querySelector('#avHandle');
    handle.style.left = dragPct + '%';
    overlay.querySelector('#avTrackFill').style.width = dragPct + '%';
    overlay.querySelector('#avYearBig').textContent = yr;

    /* Live national value */
    const natEl = overlay.querySelector('#avNatVal');
    if (natEl) natEl.textContent = Math.round(natVal * 100) + '%';

    /* Fill columns */
    GROUPS.forEach(g => {
      const val  = floatTrust(g.key, f);
      const pct  = Math.round(val * 100);
      overlay.querySelector(`#avFill-${g.key}`).style.height = (val * 100) + '%';
      overlay.querySelector(`#avPct-${g.key}`).textContent   = pct + '%';
    });

    /* Chart cursor */
    const cursor = overlay.querySelector('#avChartCursor');
    const canvas = overlay.querySelector('#avCanvas');
    if (canvas) {
      const xPct = (f / (YEARS.length - 1)) * 100;
      cursor.style.left = xPct + '%';
    }

    /* Annotation + event callout — only update on snap or initial */
    if (!interpolating) {
      const ann = overlay.querySelector('#avAnnotation');
      if (ann.dataset.idx !== String(idx)) {
        ann.dataset.idx = idx;
        ann.style.opacity = '0';
        setTimeout(() => {
          ann.textContent = ANNOTATIONS[idx];
          ann.style.opacity = '1';
        }, 120);
      }

      /* Year image */
      updateImage(idx);

      /* Resource deficit strip */
      updateResourceStrip(idx);

      /* Event callout from trustEvents global */
      const callout  = overlay.querySelector('#avEventCallout');
      const events   = getTrustEvents();
      const snapYear = YEARS[idx];
      const ev       = events[snapYear];
      if (callout) {
        if (ev) {
          callout.innerHTML =
            `<span class="av-event-name">${ev.label}</span>` +
            (ev.drop ? `<span class="av-event-drop">${ev.drop}</span>` : '');
          callout.hidden = false;
        } else {
          callout.hidden = true;
        }
      }
    }

    /* Redraw canvas with marker at current position */
    drawCanvas(f);
  }

  /* ── IMAGE ─────────────────────────────────────────────── */

  function updateImage(idx) {
    const img = overlay && overlay.querySelector('#avImage');
    if (!img) return;
    const src = IMAGES[YEARS[idx]] || null;
    if (img.dataset.activeSrc === (src || '')) return;
    img.dataset.activeSrc = src || '';
    img.style.opacity = '0';
    setTimeout(() => {
      if (src) { img.src = src; img.style.opacity = '1'; }
      else      { img.src = '';  img.style.opacity = '0'; }
    }, 180);
  }

  /* ── CANVAS ────────────────────────────────────────────── */

  function drawCanvas(f) {
    const canvas = overlay.querySelector('#avCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr, H = canvas.height / dpr;
    const padX = 16, padT = 14, padB = 28;

    ctx.clearRect(0, 0, W, H);

    function xOf(i)  { return padX + (i / (YEARS.length - 1)) * (W - padX * 2); }
    function yOf(v)  { return padT + (1 - v) * (H - padT - padB); }
    function xOfF(fi){ return padX + (fi / (YEARS.length - 1)) * (W - padX * 2); }
    function yOfF(fi){ return padT + (1 - floatNational(fi)) * (H - padT - padB); }

    /* 50% majority trust reference line */
    const y50 = yOf(0.50);
    ctx.save();
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.moveTo(padX, y50);
    ctx.lineTo(W - padX, y50);
    ctx.strokeStyle = 'rgba(200,184,154,0.13)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    ctx.font = '700 12px "Helvetica Neue", Helvetica, sans-serif';
    ctx.fillStyle = 'rgba(200,184,154,0.35)';
    ctx.textAlign = 'left';
    ctx.fillText('50%', padX, y50 - 5);

    /* Full muted line */
    ctx.beginPath();
    YEARS.forEach((_, i) => {
      i === 0 ? ctx.moveTo(xOf(i), yOf(NATIONAL[i]))
              : ctx.lineTo(xOf(i), yOf(NATIONAL[i]));
    });
    ctx.strokeStyle = 'rgba(200,184,154,0.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* Revealed segment up to current position */
    ctx.beginPath();
    const steps = 40;
    for (let s = 0; s <= steps; s++) {
      const fi2 = (s / steps) * f;
      s === 0 ? ctx.moveTo(xOfF(fi2), yOfF(fi2))
              : ctx.lineTo(xOfF(fi2), yOfF(fi2));
    }
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* Year dots */
    YEARS.forEach((_, i) => {
      const active = i <= nearestIdx(f);
      ctx.beginPath();
      ctx.arc(xOf(i), yOf(NATIONAL[i]), active ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#C0392B' : 'rgba(200,184,154,0.25)';
      ctx.fill();
    });

    /* Year labels on x-axis */
    ctx.font = '700 12px "Helvetica Neue", Helvetica, sans-serif';
    ctx.fillStyle = 'rgba(139,115,85,0.7)';
    ctx.textAlign = 'center';
    YEARS.forEach((yr, i) => {
      ctx.fillText(yr, xOf(i), H - 5);
    });

    /* Moving cursor dot */
    ctx.beginPath();
    ctx.arc(xOfF(f), yOfF(f), 5, 0, Math.PI * 2);
    ctx.fillStyle = '#C0392B';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(xOfF(f), yOfF(f), 3, 0, Math.PI * 2);
    ctx.fillStyle = '#1A1A18';
    ctx.fill();
  }

  /* ── OPEN / CLOSE ──────────────────────────────────────── */

  function openOverlay() {
    if (!overlay) build();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    /* Size canvas — scale by devicePixelRatio to avoid retina blur */
    requestAnimationFrame(() => {
      const canvas = overlay.querySelector('#avCanvas');
      const wrap   = overlay.querySelector('.av-chart-wrap');
      if (canvas && wrap) {
        const dpr     = window.devicePixelRatio || 1;
        canvas.width  = wrap.clientWidth  * dpr;
        canvas.height = wrap.clientHeight * dpr;
        canvas.getContext('2d').scale(dpr, dpr);
      }
      renderAt(snappedIdx, false);
    });
  }

  function closeOverlay() {
    if (!overlay) return;
    pausePlay();
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  function onKey(e) {
    if (!overlay || overlay.hidden) return;
    if (e.key === 'Escape')      closeOverlay();
    if (e.key === ' ')           { e.preventDefault(); togglePlay(); }
    if (e.key === 'ArrowRight' && snappedIdx < YEARS.length - 1) { pausePlay(); snapTo(snappedIdx + 1); }
    if (e.key === 'ArrowLeft'  && snappedIdx > 0)                { pausePlay(); snapTo(snappedIdx - 1); }
  }

  /* ── STYLES ────────────────────────────────────────────── */

  function injectStyles() {
    if (document.getElementById('av-styles')) return;
    const s = document.createElement('style');
    s.id = 'av-styles';
    s.textContent = `
      /* ── Toggle row wrapper (injected by JS) ── */
      .av-toggle-row {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 24px;
      }

      /* ── Animate entry button — matches .vt-btn ── */
      #animateBtn {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        background: #EDE5D8;
        border: none;
        border-top: 2px solid #1A1A18;
        color: #6B6B63;
        padding: 8px 20px;
        cursor: pointer;
        transition: background 0.12s, color 0.12s;
        white-space: nowrap;
      }
      #animateBtn:hover { background: #F5F0E8; color: #1A1A18; }
      #animateBtn .av-btn-icon {
        display: inline-block;
        margin-right: 6px;
        color: #C0392B;
        font-style: normal;
        font-size: 11px;
      }

      /* ── Overlay shell ── */
      .av-overlay {
        position: fixed;
        inset: 0;
        z-index: 200;
        background: #1A1A18;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      /* display:flex overrides UA [hidden]{display:none} — fix it explicitly */
      .av-overlay[hidden] { display: none !important; }

      /* ── Top bar — matches main page header exactly ── */
      .av-topbar {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        padding: clamp(10px, 1.4vh, 18px) 32px;
        border-bottom: 1px solid rgba(200,184,154,0.14);
        flex-shrink: 0;
        gap: 32px;
      }
      .av-topbar-title {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: clamp(28px, 3.25vw, 48px);
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 1;
        color: #fff;
      }
      .av-topbar-meta {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 15px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #C8B89A;
        text-align: right;
        line-height: 1.8;
        flex-shrink: 0;
      }
      .av-back {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #8B7355;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        align-self: flex-start;
        transition: color 0.12s;
      }
      .av-back:hover { color: #E8DDD0; }

      /* ── Stage: two-column root ── */
      .av-stage {
        flex: 1;
        display: flex;
        flex-direction: row;
        overflow: hidden;
        min-height: 0;
      }

      /* ── Left image panel — always square ── */
      .av-image-panel {
        flex: 0 0 min(46%, 1000px);
        aspect-ratio: 1 / 1;
        align-self: flex-start;
        position: relative;
        overflow: hidden;
        background: #111110;
      }
      .av-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        display: block;
        opacity: 0;
        transition: opacity 0.5s ease;
      }

      /* ── Right content column ── */
      .av-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: clamp(16px, 2.5vh, 32px) clamp(20px, 3vw, 40px) 16px;
        gap: clamp(10px, 1.6vh, 20px);
        overflow-y: auto;
      }

      /* ── Scrubber section ── */
      .av-scrub-section {
        width: 100%;
        flex-shrink: 0;
      }
      /* ── Editorial block ── */
      .av-editorial {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: clamp(6px, 1vh, 12px);
        flex-shrink: 0;
      }
      .av-year-big {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: clamp(48px, 6.9vh, 81px);
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 1;
        color: #E8DDD0;
        font-variant-numeric: tabular-nums;
        text-align: left;
      }
      .av-track-area {
        position: relative;
        padding: clamp(10px, 1.4vh, 18px) 0;
        cursor: grab;
        user-select: none;
      }
      .av-track-area:active { cursor: grabbing; }

      /* Track line */
      .av-track-line {
        height: 3px;
        background: rgba(200,184,154,0.15);
        position: relative;
      }
      .av-track-fill {
        position: absolute;
        top: 0; left: 0; bottom: 0;
        width: 0%;
        background: rgba(192,57,43,0.55);
        transition: width 0.15s ease;
      }

      /* Handle — invisible positioning element inside track-line, circle via ::after */
      .av-handle {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 0;
        background: none;
        transform: translateX(-50%);
        pointer-events: none;
        transition: left 0.05s linear;
      }
      .av-handle.dragging { transition: none; }

      /* Large circular drag target centered on the track line */
      .av-handle::after {
        content: '';
        position: absolute;
        top: 50%;
        left: -20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #1A1A18;
        border: 3px solid rgba(200,184,154,0.4);
        transform: translateY(-50%);
        transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
      }
      .av-track-area:hover .av-handle::after {
        border-color: rgba(200,184,154,0.75);
        box-shadow: 0 0 0 8px rgba(200,184,154,0.07);
        transform: translateY(-50%) scale(1.1);
      }
      .av-handle.dragging::after {
        border-color: #C8B89A;
        box-shadow: 0 0 0 13px rgba(200,184,154,0.1);
        transform: translateY(-50%) scale(1.15);
        transition: none;
      }

      /* ── Fill columns ── */
      .av-columns {
        display: flex;
        gap: clamp(8px, 1.2vw, 14px);
        width: 100%;
        flex-shrink: 0;
      }
      .av-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .av-col-inner {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .av-fill-wrap {
        height: clamp(80px, 14vh, 140px);
        background: rgba(255,255,255,0.04);
        position: relative;
        overflow: hidden;
      }
      .av-fill {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 0%;
        background: #C8B89A;
        transition: height 0.15s ease;
      }
      .av-col-pct {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: clamp(13px, 1.4vw, 16px);
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #E8DDD0;
        font-variant-numeric: tabular-nums;
        text-align: center;
        transition: color 0.15s;
      }
      .av-col-label {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: clamp(10px, 1vw, 13px);
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #8B7355;
        text-align: center;
      }

      /* ── Stacked bottom panels ── */
      .av-bottom-row {
        display: flex;
        flex-direction: column;
        gap: clamp(16px, 2.5vh, 28px);
        width: 100%;
        flex-shrink: 0;
      }
      .av-trust-panel {
        width: 100%;
        min-width: 0;
      }
      .av-resource-panel {
        width: 100%;
        min-width: 0;
      }
      .av-chart-header,
      .av-resource-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .av-chart-label {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #8B7355;
      }
      .av-chart-val {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: clamp(20px, 2.5vw, 28px);
        font-weight: 700;
        letter-spacing: -0.04em;
        color: #C0392B;
        font-variant-numeric: tabular-nums;
      }
      .av-resource-year {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: rgba(139,115,85,0.55);
        font-variant-numeric: tabular-nums;
      }
      .av-chart-wrap {
        position: relative;
        height: clamp(70px, 11vh, 110px);
      }
      #avCanvas {
        width: 100%;
        height: 100%;
        display: block;
      }

      /* ── Resource deficit columns ── */
      .av-resource-row {
        display: flex;
        gap: 8px;
        width: 100%;
      }
      .av-res-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .av-res-fill-wrap {
        height: clamp(70px, 12vh, 120px);
        background: rgba(255,255,255,0.04);
        position: relative;
        overflow: hidden;
      }
      .av-res-fill {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 0%;
        background: rgba(192,57,43,0.45);
        transition: height 0.3s ease;
      }
      .av-res-pct {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #C8B89A;
        font-variant-numeric: tabular-nums;
        text-align: center;
      }
      .av-res-label {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #8B7355;
        text-align: center;
      }

      /* ── Annotation — large Helvetica Neue bold, left-aligned ── */
      .av-annotation {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: clamp(20px, 2.6vh, 35px);
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #C8B89A;
        line-height: 1.35;
        text-align: left;
        max-width: 48ch;
        opacity: 1;
        transition: opacity 0.2s ease;
      }

/* ── Event callout ── */
      .av-event-callout {
        display: flex;
        align-items: baseline;
        gap: 16px;
        flex-wrap: wrap;
        padding-top: 2px;
      }
      .av-event-callout[hidden] { display: none; }
      .av-event-name {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 19px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #8B7355;
      }
      .av-event-drop {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 19px;
        font-weight: 700;
        letter-spacing: 0.03em;
        color: rgba(192,57,43,0.85);
      }

      /* ── Playback controls ── */
      .av-controls {
        display: none;
      }
      .av-play-btn {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        background: #C0392B;
        color: #fff;
        border: none;
        padding: 6px 14px;
        cursor: pointer;
        transition: background 0.12s;
        white-space: nowrap;
        min-width: 80px;
      }
      .av-play-btn:hover { background: #a93226; }
      .av-speed-group {
        display: flex;
        gap: 0;
        border-top: 2px solid rgba(200,184,154,0.3);
      }
      .av-speed-btn {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.1em;
        background: none;
        color: #8B7355;
        border: none;
        border-right: 1px solid rgba(200,184,154,0.15);
        padding: 6px 14px;
        cursor: pointer;
        transition: color 0.12s, background 0.12s;
      }
      .av-speed-btn:last-child { border-right: none; }
      .av-speed-btn:hover { color: #E8DDD0; }
      .av-speed-btn.active { color: #E8DDD0; background: rgba(200,184,154,0.08); }

      /* ── Responsive: short viewports ── */
      @media (max-height: 620px) {
        .av-fill-wrap { height: 55px; }
        .av-res-fill-wrap { height: 50px; }
        .av-chart-wrap { height: 55px; }
        .av-editorial { gap: 4px; }
        .av-content { gap: 8px; }
      }

      /* ── Responsive: small (stack) ── */
      @media (max-width: 680px) {
        .av-stage { flex-direction: column; }
        .av-image-panel { flex: none; width: 100%; aspect-ratio: 1 / 1; align-self: auto; }
        .av-content { padding: 16px 16px 12px; gap: 12px; overflow-y: auto; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ── INIT ──────────────────────────────────────────────── */

  function init() {
    injectStyles();
    openOverlay();

    /* Resize canvas when window resizes */
    window.addEventListener('resize', () => {
      if (!overlay || overlay.hidden) return;
      const canvas = overlay.querySelector('#avCanvas');
      const wrap   = overlay.querySelector('.av-chart-wrap');
      if (canvas && wrap) {
        const dpr     = window.devicePixelRatio || 1;
        canvas.width  = wrap.clientWidth  * dpr;
        canvas.height = wrap.clientHeight * dpr;
        canvas.getContext('2d').scale(dpr, dpr);
        drawCanvas(posToFloat(currentPos));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
