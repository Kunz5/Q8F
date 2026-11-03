/* Q8F · a cinematic launcher for Samsung Tizen TVs. Remote-only navigation. */
(function () {
  'use strict';

  // ---------- Data ----------
  // Each app lists candidate IDs; the first one installed on this TV is used.
  // Glass icon colours: c1/c2 brand gradient, light = the brand's glow pooling in the glass.
  // Marks are drawn in SVG (viewBox 0 0 100 100) at `scale` of the icon width.
  var T = 'text-anchor="middle" font-family="Inter Tight, sans-serif" fill="#ffffff"';
  var APPS = [
    { name: 'YouTube', line: 'Videos, music and live streams', ids: ['9Ur5IzDKqV.TizenYouTube', 'com.samsung.tv.cobalt-yt', 'com.samsung.tv.cobalt-yttv'],
      c1: '255,58,78', c2: '178,0,24', light: '255,140,150', glow: '255,40,70', scale: 0.62,
      mark: '<rect x="12" y="25" width="76" height="52" rx="16" fill="#ffffff"/><path d="M43 39 63 51 43 63z" fill="#FF0033"/>' },
    { name: 'JioHotstar', line: 'Cricket, films and series', ids: ['fiZNCxMH9Y.Hotstar'],
      c1: '74,64,220', c2: '10,40,140', light: '80,190,255', glow: '90,140,255', scale: 0.76,
      mark: '<path d="M74 22 76.5 29 83.5 31.5 76.5 34 74 41 71.5 34 64.5 31.5 71.5 29z" fill="#ffffff"/><text x="46" y="48" ' + T + ' font-weight="800" font-size="22">Jio</text><text x="50" y="70" ' + T + ' font-weight="700" font-size="21" letter-spacing="-0.4">Hotstar</text>' },
    { name: 'SonyLIV', line: 'Sport, shows and originals', ids: ['EUKHUxrGQA.SonyLIV'],
      c1: '228,176,80', c2: '40,32,24', light: '255,214,130', glow: '240,180,80', scale: 0.74,
      mark: '<text x="50" y="36" ' + T + ' font-weight="600" font-size="10" letter-spacing="3.5">SONY</text><text x="50" y="70" ' + T + ' font-weight="800" font-size="40" letter-spacing="-1">LIV</text>' },
    { name: 'Prime Video', line: 'Films and series from Amazon', ids: ['org.tizen.primevideo', 'org.tizen.primevideo-dummy'],
      c1: '20,170,230', c2: '8,40,100', light: '120,225,255', glow: '30,170,240', scale: 0.74,
      mark: '<text x="50" y="52" ' + T + ' font-weight="700" font-size="27" letter-spacing="-0.5">prime</text><path d="M26 61Q50 74 74 61" fill="none" stroke="#8ee3ff" stroke-width="4.5" stroke-linecap="round"/><path d="M67 56 75 61 66 65" fill="none" stroke="#8ee3ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' },
    { name: 'Netflix', line: 'Films and series', ids: ['org.tizen.netflix-app', '3201907018807', 'Netflix'],
      c1: '50,8,12', c2: '6,4,6', light: '229,9,20', glow: '229,9,20', scale: 0.6,
      mark: '<rect x="30" y="14" width="14" height="72" fill="#B20710"/><rect x="56" y="14" width="14" height="72" fill="#B20710"/><path d="M30 14H44L70 86H56z" fill="#FF1A2B"/>' }
  ];
  var MORE = [
    { name: 'ZEE5', ids: ['wKDM33Rods.ZEE5'], c1: '170,80,230', c2: '60,14,110', light: '220,160,255', glow: '170,80,230', scale: 0.72,
      mark: '<text x="50" y="60" ' + T + ' font-weight="800" font-size="30" letter-spacing="-0.5">ZEE5</text>' },
    { name: 'Tata Play Binge', ids: ['onyCNTKeg9.TataPlayBinge'], c1: '240,40,130', c2: '110,10,70', light: '255,140,200', glow: '240,40,130', scale: 0.72,
      mark: '<text x="50" y="58" ' + T + ' font-weight="800" font-size="28" letter-spacing="-0.5">binge</text>' },
    { name: 'Stingray Karaoke', ids: ['8QyxFokLmY.YokeeKaraoke'], c1: '20,200,180', c2: '4,70,80', light: '140,255,235', glow: '20,200,180', scale: 0.56,
      mark: '<g fill="none" stroke="#ffffff" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"><rect x="37.5" y="12.5" width="25" height="45.8" rx="12.5"/><path d="M22.9 45.8a27.1 27.1 0 0 0 54.2 0M50 72.9V87.5M37.5 87.5h25"/></g>' }
  ];
  var SAMSUNG = { settings: 'org.tizen.menu', search: 'com.samsung.tv.searchall' };
  // Background library: js/media.js lists every video ('v') and photo ('p') with its caption
  var MEDIA = window.Q8F_MEDIA || [];
  var BG_MODES = ['Mixed · videos and photos', 'Photos only', 'Videos only'];
  var FONTS = [
    { name: 'Modern', css: "'Inter Tight', sans-serif", w: 200, ls: -4 },
    { name: 'Times New Roman', css: "'Times New Roman', Tinos, Times, serif", w: 400, ls: -2 },
    { name: 'Playfair', css: "'Playfair Display', serif", w: 400, ls: -2 },
    { name: 'Bodoni', css: "'Bodoni Moda', serif", w: 400, ls: -2 },
    { name: 'Geometric', css: "'Space Grotesk', sans-serif", w: 300, ls: -3 },
    { name: 'Digital', css: "'JetBrains Mono', monospace", w: 300, ls: -5 }
  ];
  var ICONS = {
    home: '<path d="M3.5 10.5 12 4l8.5 6.5V20h-5.5v-5.5h-6V20H3.5z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20 20"/>',
    apps: '<rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2"/>',
    settings: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'
  };
  var RAIL = [{ k: 'home', label: 'Home' }, { k: 'search', label: 'Search' }, { k: 'apps', label: 'Apps' }, { k: 'settings', label: 'Settings' }];

  // ---------- State (settings persist on the TV) ----------
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem('q8f.settings') || '{}'); } catch (e) {}
  // Where you were last time: a fresh launch resets app state (Samsung lifecycle), so Q8F restores it
  var nav = {};
  try { nav = JSON.parse(localStorage.getItem('q8f.nav') || '{}'); } catch (e) {}
  var S = {
    zone: 'stage', page: [0, 2, 3].indexOf(nav.page) >= 0 ? nav.page : 0, r: 0,
    i: typeof nav.i === 'number' ? nav.i : 2, g: typeof nav.g === 'number' ? nav.g : 0, s: 1,
    confirm: false, cf: 0,
    bg: saved.bg || 0, clock: saved.clock || 0, font: saved.font || 0, motion: saved.motion || 0,
    glass: saved.glass === undefined ? 1 : saved.glass,   // Balanced by default: live blur over video costs every frame
    front: 'A', clip: 0, still: 0, busy: false
  };
  function persist() {
    try { localStorage.setItem('q8f.settings', JSON.stringify({ bg: S.bg, clock: S.clock, font: S.font, motion: S.motion, glass: S.glass })); } catch (e) {}
  }

  var $ = function (id) { return document.getElementById(id); };
  var hasTizen = typeof tizen !== 'undefined';

  // ---------- Resolve installed apps: the launch ID is the first installed candidate ----------
  function resolve(app) {
    app.id = null;
    if (!hasTizen) return;
    for (var k = 0; k < app.ids.length; k++) {
      try { app.id = tizen.application.getAppInfo(app.ids[k]).id; return; } catch (e) {}
    }
  }
  APPS.forEach(resolve); MORE.forEach(resolve);

  // A glass icon: brand gradient + drawn mark. `el` gets the class and colour variables.
  function glassIcon(el, a, size) {
    el.classList.add('gi');
    el.style.setProperty('--c1', a.c1); el.style.setProperty('--c2', a.c2); el.style.setProperty('--light', a.light);
    var m = Math.round(size * a.scale);
    return '<svg viewBox="0 0 100 100" width="' + m + '" height="' + m + '" aria-hidden="true">' + a.mark + '</svg>';
  }

  // ---------- Build the DOM once ----------
  var rail = $('rail'), railItems = $('railItems');
  RAIL.forEach(function (r, k) {
    var b = document.createElement('div');
    b.className = 'item';
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[r.k] + '</svg><span class="lab">' + r.label + '</span>';
    railItems.appendChild(b);
  });
  var stage = $('stage');
  APPS.forEach(function (a, k) {
    var p = document.createElement('div');
    p.className = 'panel';
    p.style.setProperty('--glow', 'rgba(' + a.glow + ',0.7)');
    p.innerHTML = glassIcon(p, a, 220) + '<span class="glow"></span>';
    stage.appendChild(p);
  });
  var dots = $('dots');
  APPS.forEach(function () { dots.appendChild(document.createElement('span')); });
  var grid = $('grid');
  APPS.concat(MORE).forEach(function (a, k) {
    var t = document.createElement('div');
    t.className = 'tile lg g-liquid' + (hasTizen && !a.id ? ' off' : '');
    var ic = document.createElement('div');
    ic.innerHTML = glassIcon(ic, a, 84);
    t.appendChild(ic);
    t.insertAdjacentHTML('beforeend', '<span class="nm">' + a.name + (hasTizen && !a.id ? ' · not installed' : '') + '</span><span class="glow"></span>');
    grid.appendChild(t);
  });
  var rowsEl = $('rows');
  for (var n = 0; n < 8; n++) {
    var row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = '<span class="t"><b></b><i></i></span><span class="v"></span>';
    rowsEl.appendChild(row);
  }

  // ---------- Background: a shuffled, endless mix of videos and photos ----------
  // TVs give apps one hardware video decoder, so all videos share one <video>; a canvas holds the
  // last frame between clips. Photos use two <img> slots that cross-fade with a slow drift.
  var vid = $('vid'), hold = $('hold'), hctx = hold.getContext('2d');
  var imgs = [$('imgA'), $('imgB')], front = 0;
  var order = [], pos = -1, cur = null, photoTimer, watchdog, failures = 0;
  var PHOTO_MS = 12000;
  vid.muted = true; vid.loop = false;

  function play() { try { vid.muted = true; var p = vid.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
  function pool() {
    var want = S.bg === 1 ? 'p' : (S.bg === 2 ? 'v' : null);
    var list = MEDIA.filter(function (m) { return !want || m.t === want; });
    return list.length ? list : MEDIA;
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function caption(m) { $('place').textContent = m.place; $('detail').textContent = m.detail; }
  function nextItem() {
    clearTimeout(photoTimer); clearTimeout(watchdog);
    if (pos >= order.length - 1) {
      var last = cur; order = shuffle(pool()); pos = -1;
      if (order.length > 1 && order[0] === last) order.push(order.shift());   // never repeat back-to-back
    }
    cur = order[++pos];
    if (!cur) return;
    caption(cur);
    if (cur.t === 'v') showVideo(cur); else showPhoto(cur);
  }
  function holdFrame() {
    try { hctx.drawImage(vid, 0, 0, 1920, 1080); } catch (e) {}
    hold.classList.add('snap'); hold.classList.add('on');
    void hold.offsetWidth; hold.classList.remove('snap');
  }
  function showPhoto(m) {
    var back = imgs[1 - front], shown = m;
    back.onload = function () {
      if (cur !== shown) return;
      back.classList.remove('kb'); void back.offsetWidth;
      back.classList.add('on', 'kb');
      imgs[front].classList.remove('on'); front = 1 - front;
      vid.classList.remove('on'); hold.classList.remove('on');
      setTimeout(function () { if (cur && cur.t === 'p') vid.pause(); }, 1600);
      photoTimer = setTimeout(nextItem, PHOTO_MS);
    };
    back.onerror = function () { if (cur === shown) nextItem(); };
    back.src = m.src;
  }
  function showVideo(m) {
    if (vid.classList.contains('on')) holdFrame();
    vid.src = m.src; vid.load(); play();
    watchdog = setTimeout(function () { if (vid.paused || vid.readyState < 3) skipVideo(); }, 5000);
  }
  function skipVideo() {
    if (++failures >= 3) {   // the TV refuses video: fall back to photos only
      S.bg = 1; persist(); toast('Videos can’t play here, showing photographs'); restartBg(); return;
    }
    nextItem();
  }
  vid.addEventListener('playing', function () {
    if (!cur || cur.t !== 'v') return;
    failures = 0; clearTimeout(watchdog);
    vid.classList.add('on'); hold.classList.remove('on');
    imgs[0].classList.remove('on'); imgs[1].classList.remove('on');
  });
  vid.addEventListener('ended', function () { if (cur && cur.t === 'v') nextItem(); });
  vid.addEventListener('error', function () { if (cur && cur.t === 'v') skipVideo(); });

  function restartBg() { order = []; pos = -1; nextItem(); }
  function pauseBg() { vid.pause(); clearTimeout(photoTimer); clearTimeout(watchdog); }
  function resumeBg() {
    if (!cur) return restartBg();
    if (cur.t === 'v') play(); else photoTimer = setTimeout(nextItem, PHOTO_MS);
  }

  // ---------- Clock ----------
  function paintClock() {
    var d = new Date(), t;
    if (S.clock === 0) { var h = d.getHours() % 12; if (h === 0) h = 12; t = h + ':' + ('0' + d.getMinutes()).slice(-2); }
    else t = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    var f = FONTS[S.font], el = $('time');
    el.textContent = t; el.style.fontFamily = f.css; el.style.fontWeight = f.w; el.style.letterSpacing = f.ls + 'px';
    $('date').textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  setInterval(paintClock, 10000);

  // ---------- Settings rows ----------
  function rowsData() {
    return [
      { label: 'Samsung Settings', sub: 'Picture, sound, network, accessibility', value: 'Open  ›' },
      { label: 'Background', sub: MEDIA.length + ' cities and landscapes, shuffled', value: BG_MODES[S.bg] || BG_MODES[0], cyc: 1 },
      { label: 'Clock', sub: 'Time format', value: S.clock === 0 ? '12-hour' : '24-hour', cyc: 1 },
      { label: 'Clock font', sub: 'Typeface for the time', value: FONTS[S.font].name, font: FONTS[S.font].css, cyc: 1 },
      { label: 'Glass', sub: 'Full adds live blur; smoother motion on Balanced', value: S.glass === 0 ? 'Full · heavier' : 'Balanced', cyc: 1 },
      { label: 'Motion', sub: 'Animation strength', value: S.motion === 0 ? 'Full' : 'Reduced', cyc: 1 },
      { label: 'Inputs and sources', sub: 'Not available to apps on this TV', value: 'Use the remote' },
      { label: 'About Q8F', sub: 'QA55Q8FAAULXL · Tizen 10.0 · OK shows frame rate', value: 'Version 1.1' }
    ];
  }
  function change(k, d) {
    if (k === 0) return samsung('settings', 'Samsung Settings');
    if (k === 1) { S.bg = (S.bg + d + 3) % 3; restartBg(); }
    if (k === 2) S.clock = 1 - S.clock;
    if (k === 3) S.font = (S.font + d + FONTS.length) % FONTS.length;
    if (k === 4) S.glass = 1 - S.glass;
    if (k === 5) S.motion = 1 - S.motion;
    persist(); paint(); paintClock();
  }

  // ---------- Frame-rate counter (About → OK) ----------
  var fpsOn = false, fpsFrames = 0, fpsLast = 0, fpsWorst = 0, fpsPrev = 0;
  function fpsLoop(now) {
    if (!fpsOn) return;
    if (fpsPrev) { var dt = now - fpsPrev; if (dt > fpsWorst) fpsWorst = dt; }
    fpsPrev = now; fpsFrames++;
    if (now - fpsLast >= 1000) {
      $('fps').textContent = fpsFrames + ' fps · worst ' + Math.round(fpsWorst) + ' ms';
      fpsFrames = 0; fpsWorst = 0; fpsLast = now;
    }
    requestAnimationFrame(fpsLoop);
  }
  function toggleFps() {
    fpsOn = !fpsOn; $('fps').classList.toggle('on', fpsOn);
    if (fpsOn) { fpsLast = performance.now(); fpsPrev = 0; requestAnimationFrame(fpsLoop); }
  }

  // ---------- Launching ----------
  var hoTimer, toastTimer;
  function handoff(name, note) {
    $('hoName').textContent = 'Opening ' + name; $('hoNote').textContent = note || '';
    $('handoff').classList.add('on'); S.busy = true;
    clearTimeout(hoTimer); hoTimer = setTimeout(endHandoff, 6000);
  }
  function endHandoff() { $('handoff').classList.remove('on'); S.busy = false; }
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('on'); }, 3200);
  }
  function launchId(id, name) {
    if (!hasTizen) { toast(name + ' opens on the TV'); return; }
    if (!id) { toast(name + ' is not installed on this TV'); return; }
    handoff(name, 'Exit the app to come back to Q8F');
    // Opened as an app-control request with a reply listener, the TV treats Q8F as the caller,
    // so leaving the app returns here instead of to Samsung's home. Falls back to a plain launch.
    var plain = function () {
      try {
        tizen.application.launch(id, function () {}, function (e) { endHandoff(); toast('Couldn’t open ' + name + ' (' + e.name + ')'); });
      } catch (e) { endHandoff(); toast('Couldn’t open ' + name); }
    };
    try {
      var ctrl = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/default', null, null, null, null);
      tizen.application.launchAppControl(ctrl, id, function () {}, plain, {
        onsuccess: function () { endHandoff(); },
        onfailure: function () { endHandoff(); }
      });
    } catch (e) { plain(); }
  }
  function samsung(key, name) { launchId(SAMSUNG[key], name); }

  // Pause the city while another app is in front; resume on return
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pauseBg();
    else { endHandoff(); resumeBg(); paintClock(); }
  });

  // ---------- Paint ----------
  function paint() {
    try { localStorage.setItem('q8f.nav', JSON.stringify({ page: S.page, i: S.i, g: S.g })); } catch (e) {}
    $('confirm').classList.toggle('on', S.confirm);
    $('cbStay').classList.toggle('f', S.cf === 0);
    $('cbExit').classList.toggle('f', S.cf === 1);
    var root = $('root');
    root.classList.toggle('reduced', S.motion === 1);
    root.classList.toggle('lite', S.glass === 1);
    var inRail = S.zone === 'rail';
    rail.classList.toggle('open', inRail);
    var items = railItems.children;
    for (var k = 0; k < items.length; k++) {
      items[k].classList.toggle('f', inRail && S.r === k);
      items[k].classList.toggle('cur', !inRail && S.page === k);
    }
    $('pHome').classList.toggle('on', S.page === 0);
    $('pApps').classList.toggle('on', S.page === 2);
    $('pSet').classList.toggle('on', S.page === 3);
    $('caption').style.opacity = S.page === 0 ? 1 : 0;

    var onStage = S.zone === 'stage' && S.page === 0;
    var panels = stage.children;
    for (k = 0; k < panels.length; k++) {
      var d = k - S.i, ad = Math.abs(d), f = onStage && d === 0, a = APPS[k];
      // Flat 2D depth: slide and scale only, which the TV's compositor handles cheaply
      panels[k].style.transform = 'translate3d(' + (d * 285) + 'px,' + (f ? -14 : (ad * 18)) + 'px,0) scale(' + (ad === 0 ? 1.08 : (ad === 1 ? 0.86 : 0.74)) + ')';
      panels[k].style.opacity = ad === 0 ? 1 : (ad === 1 ? 0.88 : (ad === 2 ? 0.58 : 0));
      panels[k].classList.toggle('f', f);
    }
    $('heroName').textContent = APPS[S.i].name; $('heroLine').textContent = APPS[S.i].line;
    $('heroName').style.opacity = $('heroLine').style.opacity = onStage ? 1 : 0.55;
    var ds = dots.children; for (k = 0; k < ds.length; k++) ds[k].classList.toggle('on', k === S.i);

    var onGrid = S.zone === 'stage' && S.page === 2, tiles = grid.children;
    for (k = 0; k < tiles.length; k++) {
      var tf = onGrid && S.g === k;
      tiles[k].style.transform = tf ? 'translate3d(0,-12px,0) scale(1.05)' : 'none';
      tiles[k].classList.toggle('f', tf);
    }

    // Settings rows are only rewritten while Settings is on screen
    if (S.page !== 3) return;
    var onRows = S.zone === 'stage', data = rowsData(), rs = rowsEl.children;
    for (k = 0; k < rs.length; k++) {
      var rf = onRows && S.s === k, r = data[k];
      rs[k].classList.toggle('f', rf);
      rs[k].querySelector('b').textContent = r.label;
      rs[k].querySelector('i').textContent = r.sub;
      var v = rs[k].querySelector('.v');
      v.textContent = (rf && r.cyc) ? '‹  ' + r.value + '  ›' : r.value;
      v.style.fontFamily = r.font || '';
    }
  }

  // ---------- Remote ----------
  var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, ESC: 27 };
  document.addEventListener('keydown', function (e) {
    var k = e.keyCode, back = k === KEY.BACK || k === KEY.ESC;
    if ([37, 38, 39, 40, 13].indexOf(k) < 0 && !back) return;
    e.preventDefault();
    // Exit confirmation: Stay is focused by default; Back means Stay
    if (S.confirm) {
      if (k === KEY.LEFT || k === KEY.RIGHT) S.cf = 1 - S.cf;
      else if (back || (k === KEY.ENTER && S.cf === 0)) S.confirm = false;
      else if (k === KEY.ENTER && S.cf === 1) { try { tizen.application.getCurrentApplication().exit(); } catch (x) {} return; }
      paint(); return;
    }
    if (S.busy) { if (back) endHandoff(); return; }

    if (S.zone === 'rail') {
      if (k === KEY.UP) S.r = Math.max(0, S.r - 1);
      else if (k === KEY.DOWN) S.r = Math.min(3, S.r + 1);
      else if (k === KEY.RIGHT || k === KEY.ENTER) {
        if (S.r === 1) { samsung('search', 'Samsung Search'); return; }
        S.page = S.r; S.zone = 'stage';
      } else if (back) {
        if (S.page !== 0) { S.page = 0; S.r = 0; S.zone = 'stage'; }
        else { S.confirm = true; S.cf = 0; paint(); return; }
      }
      if (S.r !== 1 && S.zone === 'rail') S.page = S.r;
      paint(); return;
    }
    if (back) { S.zone = 'rail'; S.r = S.page; paint(); return; }

    if (S.page === 0) {
      if (k === KEY.LEFT) { if (S.i === 0) { S.zone = 'rail'; S.r = 0; } else S.i--; }
      else if (k === KEY.RIGHT) S.i = Math.min(APPS.length - 1, S.i + 1);
      else if (k === KEY.UP) { S.zone = 'rail'; S.r = 0; }
      else if (k === KEY.DOWN) { S.page = 2; S.g = 0; S.r = 2; }
      else if (k === KEY.ENTER) { var a = APPS[S.i]; launchId(a.id, a.name); return; }
    } else if (S.page === 2) {
      var g = S.g, total = APPS.length + MORE.length;
      if (k === KEY.LEFT) { if (g % 4 === 0) { S.zone = 'rail'; S.r = 2; } else S.g--; }
      else if (k === KEY.RIGHT) S.g = Math.min(total - 1, g + 1);
      else if (k === KEY.UP) { if (g < 4) { S.page = 0; S.r = 0; } else S.g -= 4; }
      else if (k === KEY.DOWN) S.g = Math.min(total - 1, g + 4);
      else if (k === KEY.ENTER) { var t = APPS.concat(MORE)[g]; launchId(t.id, t.name); return; }
    } else if (S.page === 3) {
      if (k === KEY.UP) { if (S.s === 0) { S.zone = 'rail'; S.r = 3; } else S.s--; }
      else if (k === KEY.DOWN) S.s = Math.min(7, S.s + 1);
      else if (k === KEY.LEFT) { if (S.s >= 1 && S.s <= 5) { change(S.s, -1); return; } S.zone = 'rail'; S.r = 3; }
      else if (k === KEY.RIGHT || k === KEY.ENTER) {
        if (S.s <= 5) { change(S.s, 1); return; }
        if (S.s === 7 && k === KEY.ENTER) { toggleFps(); return; }
      }
    }
    paint();
  });

  paint();
  paintClock();
  restartBg();
})();
