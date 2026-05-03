// ── LOGIN ────────────────────────────────────────────────────
const validPasswords = ['1234', 'anveshan', 'password'];
const loginBtn  = document.getElementById('login-btn');
const passInput = document.getElementById('password-input');
const loginErr  = document.getElementById('login-error');

function doLogin() {
  const val = passInput.value.trim();
  if (validPasswords.includes(val)) {
    loginErr.textContent = '';
    document.getElementById('login-screen').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('desktop').classList.add('visible');
    }, 800);
  } else {
    loginErr.textContent = 'Incorrect password. Try "1234" or "anveshan".';
    passInput.style.borderColor = 'rgba(248,113,113,0.5)';
    setTimeout(() => passInput.style.borderColor = '', 1200);
  }
}
loginBtn.addEventListener('click', doLogin);
passInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

// ── CLOCK ────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.getHours().toString().padStart(2,'0') + ':' +
    now.getMinutes().toString().padStart(2,'0');
}
updateClock(); setInterval(updateClock, 30000);

// ── WINDOW MANAGER ──────────────────────────────────────────
let zCounter = 10;
const openWindows = {};
const savedPositions = {};

function bringToFront(id) {
  document.querySelectorAll('.window').forEach(w => { w.classList.remove('focused'); w.style.zIndex = 10; });
  const win = document.getElementById('win-' + id);
  if (win) { win.style.zIndex = ++zCounter; win.classList.add('focused'); }
}

function openApp(id) {
  if (openWindows[id]) {
    const win = document.getElementById('win-' + id);
    if (win) { win.classList.remove('minimized'); bringToFront(id); }
    return;
  }
  openWindows[id] = true;
  const container = document.getElementById('window-container');
  const win = document.createElement('div');
  win.className = 'window focused';
  win.id = 'win-' + id;
  win.style.zIndex = ++zCounter;

  const positions = {
    terminal: { top: 60,  left: 40,  width: 540, height: 320 },
    notes:    { top: 80,  left: 200, width: 440, height: 360 },
    music:    { top: 70,  left: 480, width: 300, height: 380 },
    files:    { top: 100, left: 100, width: 500, height: 340 },
    browser:  { top: 50,  left: 60,  width: 700, height: 480 },
  };
  const pos = positions[id] || { top: 80, left: 80, width: 480, height: 340 };
  win.style.top    = pos.top    + 'px';
  win.style.left   = pos.left   + 'px';
  win.style.width  = pos.width  + 'px';
  win.style.height = pos.height + 'px';

  const titles = {
    terminal: '💻  Terminal', notes: '📝  Notes',
    music: '🎵  Music Player', files: '📁  Files', browser: '🌐  Nova Browser',
  };

  win.innerHTML = `
    <div class="window-titlebar" id="tb-${id}">
      <div class="win-controls">
        <button class="wc-btn wc-close" title="Close"    onclick="closeApp('${id}')"></button>
        <button class="wc-btn wc-min"   title="Minimize" onclick="minimizeApp('${id}')"></button>
        <button class="wc-btn wc-max"   title="Maximize" onclick="toggleMaximize('${id}')"></button>
      </div>
      <div class="window-title" id="wtitle-${id}">${titles[id] || id}</div>
      <div class="win-controls-spacer"></div>
    </div>
    <div class="window-content" id="wc-${id}" style="overflow:hidden"></div>
    <div class="resize-handle" id="rh-${id}"></div>`;

  container.appendChild(win);
  makeDraggable(win, document.getElementById('tb-' + id));
  makeResizable(win, document.getElementById('rh-' + id));
  win.addEventListener('mousedown', () => bringToFront(id));

  const content = document.getElementById('wc-' + id);
  content.style.height = '100%';
  if      (id === 'terminal') renderTerminal(content);
  else if (id === 'notes')    renderNotes(content);
  else if (id === 'music')    renderMusic(content);
  else if (id === 'files')    renderFiles(content);
  else if (id === 'browser')  renderBrowser(content, id);
}

function toggleMaximize(id) {
  const win = document.getElementById('win-' + id);
  if (!win) return;
  const rh = document.getElementById('rh-' + id);
  if (win.dataset.maximized === 'true') {
    const s = savedPositions[id];
    win.style.transition   = 'all 0.2s ease';
    win.style.top          = s.top    + 'px';
    win.style.left         = s.left   + 'px';
    win.style.width        = s.width  + 'px';
    win.style.height       = s.height + 'px';
    win.style.borderRadius = '16px';
    if (rh) rh.style.display = '';
    win.dataset.maximized = 'false';
    setTimeout(() => { win.style.transition = ''; }, 220);
  } else {
    savedPositions[id] = {
      top: parseInt(win.style.top), left: parseInt(win.style.left),
      width: parseInt(win.style.width), height: parseInt(win.style.height),
    };
    win.style.transition   = 'all 0.2s ease';
    win.style.top          = '28px';
    win.style.left         = '0px';
    win.style.width        = window.innerWidth + 'px';
    win.style.height       = (window.innerHeight - 28) + 'px';
    win.style.borderRadius = '0px';
    if (rh) rh.style.display = 'none';
    win.dataset.maximized = 'true';
    setTimeout(() => { win.style.transition = ''; }, 220);
  }
  bringToFront(id);
}

function closeApp(id) {
  const win = document.getElementById('win-' + id);
  if (win) {
    win.style.transition = 'opacity 0.15s, transform 0.15s';
    win.style.opacity = '0'; win.style.transform = 'scale(0.9)';
    setTimeout(() => { win.remove(); delete openWindows[id]; delete savedPositions[id]; }, 150);
  }
}
function minimizeApp(id) {
  const win = document.getElementById('win-' + id);
  if (win) win.classList.add('minimized');
}
function lockScreen() {
  document.getElementById('desktop').classList.remove('visible');
  const ls = document.getElementById('login-screen');
  ls.style.display = 'flex'; ls.style.opacity = '1'; ls.style.transform = 'scale(1)';
  ls.classList.remove('fade-out');
  document.getElementById('password-input').value = '';
  document.querySelectorAll('.window').forEach(w => w.remove());
  Object.keys(openWindows).forEach(k => delete openWindows[k]);
  Object.keys(savedPositions).forEach(k => delete savedPositions[k]);
}

// ── DRAGGABLE / RESIZABLE ────────────────────────────────────
function makeDraggable(win, handle) {
  let drag = false, ox, oy;
  handle.addEventListener('mousedown', e => {
    if (win.dataset.maximized === 'true') return;
    drag = true; ox = e.clientX - win.offsetLeft; oy = e.clientY - win.offsetTop; e.preventDefault();
  });
  document.addEventListener('mousemove', e => { if (!drag) return; win.style.left = Math.max(0, e.clientX - ox) + 'px'; win.style.top = Math.max(28, e.clientY - oy) + 'px'; });
  document.addEventListener('mouseup', () => { drag = false; });
}
function makeResizable(win, handle) {
  let resizing = false, sx, sy, sw, sh;
  handle.addEventListener('mousedown', e => { resizing = true; sx = e.clientX; sy = e.clientY; sw = win.offsetWidth; sh = win.offsetHeight; e.preventDefault(); e.stopPropagation(); });
  document.addEventListener('mousemove', e => { if (!resizing) return; win.style.width = Math.max(380, sw + e.clientX - sx) + 'px'; win.style.height = Math.max(260, sh + e.clientY - sy) + 'px'; });
  document.addEventListener('mouseup', () => { resizing = false; });
}

// ── TERMINAL ────────────────────────────────────────────────
function renderTerminal(el) {
  el.style.height = '100%';
  const history = [
    { prompt: 'anveshan@nova:~$ ', cmd: 'ls',       out: 'Documents  Downloads  Music  Pictures  Projects' },
    { prompt: 'anveshan@nova:~$ ', cmd: 'whoami',   out: 'anveshan' },
    { prompt: 'anveshan@nova:~$ ', cmd: 'uname -r', out: 'WebOS Nova 1.0.0 (x86_64)' },
    { prompt: 'anveshan@nova:~$ ', cmd: 'uptime',   out: 'up 4:20, 1 user, load average: 0.12, 0.08, 0.05' },
  ];
  const cmds = {
    'ls': 'Documents  Downloads  Music  Pictures  Projects',
    'whoami': 'anveshan', 'pwd': '/home/anveshan', 'date': new Date().toDateString(),
    'echo hello': 'hello', 'clear': '__clear__',
    'help': 'Available: ls, whoami, pwd, date, echo, clear, neofetch',
    'neofetch': 'anveshan@nova<br>OS: WebOS Nova 1.0.0<br>Uptime: 4h 20m<br>Shell: bash<br>Theme: Dark Indigo',
  };
  el.innerHTML = `<div class="terminal-body" id="term-body">
    ${history.map(l => `<div class="terminal-line"><span class="prompt">${l.prompt}</span><span class="cmd">${l.cmd}</span></div><div class="terminal-line out">${l.out}</div>`).join('')}
    <div class="terminal-input-row"><span class="prompt">anveshan@nova:~$ </span><input class="terminal-input" id="term-input" spellcheck="false" autocomplete="off" /></div>
  </div>`;
  const body = el.querySelector('#term-body');
  const input = el.querySelector('#term-input');
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const val = input.value.trim(); input.value = '';
    if (!val) return;
    const cmdRow = document.createElement('div');
    cmdRow.innerHTML = `<div class="terminal-line"><span class="prompt">anveshan@nova:~$ </span><span class="cmd">${val}</span></div>`;
    body.insertBefore(cmdRow, body.querySelector('.terminal-input-row'));
    const out = cmds[val] || `bash: ${val}: command not found`;
    if (out === '__clear__') { body.querySelectorAll('.terminal-line').forEach(l => l.remove()); return; }
    const outRow = document.createElement('div');
    outRow.innerHTML = `<div class="terminal-line out">${out}</div>`;
    body.insertBefore(outRow, body.querySelector('.terminal-input-row'));
    body.scrollTop = body.scrollHeight;
  });
  setTimeout(() => input.focus(), 100);
}

// ── NOTES ────────────────────────────────────────────────────
function renderNotes(el) {
  const notes = [
    { title: 'Meeting Notes', body: 'Discussed Q4 roadmap and feature prioritization.\n\nKey decisions:\n- Launch v2.0 by December\n- Focus on performance\n- Improve onboarding flow' },
    { title: 'Ideas 💡',      body: 'WebOS project ideas:\n\n• Add notification system\n• Dark/light theme toggle\n• Calendar widget\n• Browser app integration' },
    { title: 'Shopping List', body: '✓ Coffee beans\n□ Mechanical keyboard\n□ Desk lamp\n□ Monitor stand\n□ Cable management' },
  ];
  let active = 0;
  function draw() {
    el.innerHTML = `<div class="notes-body">
      <div class="notes-sidebar">${notes.map((n,i) => `<div class="note-item ${i===active?'active':''}" data-idx="${i}">${n.title}</div>`).join('')}</div>
      <div class="notes-editor"><textarea spellcheck="false">${notes[active].body}</textarea></div>
    </div>`;
    el.querySelectorAll('.note-item').forEach(item => item.addEventListener('click', () => { active = parseInt(item.dataset.idx); draw(); }));
    el.querySelector('textarea').addEventListener('input', e => { notes[active].body = e.target.value; });
  }
  draw();
}

// ── MUSIC ────────────────────────────────────────────────────
function renderMusic(el) {
  let playing = false, progress = 0, timer = null;
  const songs = [
    { title: 'Midnight Drive', artist: 'Lo-Fi City',    emoji: '🌙', dur: 214 },
    { title: 'Neon Rain',      artist: 'Synthwave Bros', emoji: '🌧️', dur: 187 },
    { title: 'Binary Sunrise', artist: 'CodeBeats',      emoji: '☀️', dur: 243 },
  ];
  let si = 0;
  const fmt = s => Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0');
  function draw() {
    const song = songs[si], pct = (progress / song.dur * 100).toFixed(1);
    el.innerHTML = `<div class="music-body">
      <div class="album-art ${playing?'playing':''}">${song.emoji}</div>
      <div style="text-align:center"><div class="song-title">${song.title}</div><div class="song-artist">${song.artist}</div></div>
      <div style="width:100%">
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="progress-times"><span>${fmt(progress)}</span><span>${fmt(song.dur)}</span></div>
      </div>
      <div class="music-controls">
        <button class="music-btn" id="prev-btn">⏮</button>
        <button class="music-btn play-btn" id="play-btn">${playing?'⏸':'▶'}</button>
        <button class="music-btn" id="next-btn">⏭</button>
      </div>
      <div style="display:flex;align-items:center;gap:8px;width:100%">
        <span style="font-size:12px;color:rgba(255,255,255,0.4)">🔈</span>
        <input type="range" min="0" max="100" value="80" style="flex:1" />
        <span style="font-size:12px;color:rgba(255,255,255,0.4)">🔊</span>
      </div>
    </div>`;
    el.querySelector('#play-btn').onclick = () => { playing = !playing; if (playing) timer = setInterval(tick, 1000); else clearInterval(timer); draw(); };
    el.querySelector('#prev-btn').onclick = () => { si = (si-1+songs.length)%songs.length; progress=0; draw(); };
    el.querySelector('#next-btn').onclick = () => { si = (si+1)%songs.length; progress=0; draw(); };
  }
  function tick() { progress++; if (progress >= songs[si].dur) { progress=0; si=(si+1)%songs.length; } draw(); if (!playing) clearInterval(timer); }
  draw();
}

// ── FILES ────────────────────────────────────────────────────
function renderFiles(el) {
  const items = [
    {name:'Documents',icon:'📂'},{name:'Downloads',icon:'📥'},
    {name:'Music',icon:'🎵'},{name:'Pictures',icon:'🖼️'},
    {name:'Projects',icon:'📦'},{name:'Desktop',icon:'🖥️'},
    {name:'report.pdf',icon:'📄'},{name:'notes.txt',icon:'📝'},
    {name:'photo.jpg',icon:'🖼️'},{name:'app.js',icon:'📜'},
    {name:'data.csv',icon:'📊'},{name:'archive.zip',icon:'🗜️'},
  ];
  el.innerHTML = `
    <div class="files-toolbar">
      <span style="font-size:16px;cursor:pointer;color:rgba(255,255,255,0.5)">←</span>
      <span style="font-size:16px;cursor:pointer;color:rgba(255,255,255,0.5)">→</span>
      <span class="files-path">/home/anveshan</span>
    </div>
    <div class="files-grid">${items.map(f=>`<div class="file-item"><div class="file-icon">${f.icon}</div><div class="file-name">${f.name}</div></div>`).join('')}</div>`;
}

// ── BROWSER ─────────────────────────────────────────────────
function renderBrowser(el, winId) {
  // Tab state
  const tabs = [
    { id: 1, title: 'New Tab', favicon: '🌐', url: '', page: 'newtab' },
  ];
  let activeTab = 1;
  let tabIdCounter = 2;

  const quicklinks = [
    { icon: '🔍', label: 'Search', url: 'https://google.com' },
    { icon: '📰', label: 'News',   url: 'https://news.ycombinator.com' },
    { icon: '🐙', label: 'GitHub', url: 'https://github.com' },
    { icon: '📺', label: 'YouTube',url: 'https://youtube.com' },
    { icon: '🗺️', label: 'Maps',   url: 'https://maps.google.com' },
  ];

  function getTab(id) { return tabs.find(t => t.id === id); }

  function navigate(url, tabId) {
    const tab = getTab(tabId || activeTab);
    if (!tab) return;
    let finalUrl = url.trim();
    if (!finalUrl) return;
    // treat as search if no dot / protocol
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = 'https://www.google.com/search?q=' + encodeURIComponent(finalUrl);
      }
    }
    tab.url   = finalUrl;
    tab.page  = 'loading';
    tab.title = new URL(finalUrl).hostname.replace('www.','');
    tab.favicon = '🌐';
    render();
    // simulate load bar then show error (iframes from other origins are blocked)
    setTimeout(() => {
      tab.page = 'error';
      render();
    }, 1200);
  }

  function newTab(url) {
    const id = tabIdCounter++;
    tabs.push({ id, title: 'New Tab', favicon: '🌐', url: url || '', page: url ? 'loading' : 'newtab' });
    activeTab = id;
    render();
    if (url) navigate(url, id);
  }

  function closeTab(id) {
    const idx = tabs.findIndex(t => t.id === id);
    if (tabs.length === 1) { closeApp(winId); return; }
    tabs.splice(idx, 1);
    if (activeTab === id) activeTab = tabs[Math.max(0, idx - 1)].id;
    render();
  }

  function render() {
    const tab = getTab(activeTab);
    el.innerHTML = `
      <div class="browser-shell">
        <!-- Tabs -->
        <div class="browser-tabs">
          ${tabs.map(t => `
            <div class="browser-tab ${t.id === activeTab ? 'active' : ''}" data-tabid="${t.id}">
              <span class="tab-favicon">${t.favicon}</span>
              <span class="tab-title">${t.title}</span>
              <button class="tab-close" data-closeid="${t.id}" title="Close tab">×</button>
            </div>`).join('')}
          <button class="tab-new" id="btn-newtab" title="New tab">+</button>
        </div>

        <!-- Toolbar -->
        <div class="browser-toolbar">
          <button class="browser-nav-btn" id="btn-back" title="Back">‹</button>
          <button class="browser-nav-btn" id="btn-fwd"  title="Forward">›</button>
          <button class="browser-nav-btn" id="btn-reload" title="Reload">↻</button>
          <div class="browser-address-wrap">
            <span class="browser-lock">${tab && tab.url.startsWith('https://') ? '🔒' : tab && tab.url ? '⚠' : ''}</span>
            <input class="browser-address" id="browser-addr"
              value="${tab ? tab.url : ''}"
              placeholder="Search or enter URL…" />
          </div>
          <button class="browser-go-btn" id="btn-go">→</button>
        </div>

        <!-- Viewport -->
        <div class="browser-viewport" id="bvp-${winId}">
          ${tab && tab.page === 'newtab' ? `
            <div class="browser-newtab">
              <div class="newtab-logo">
                <div class="nt-icon">✦</div>
                <span>Nova Browser</span>
              </div>
              <div class="newtab-search">
                <input id="nt-search" placeholder="Search the web or enter a URL…" />
                <button class="newtab-search-btn" id="nt-go">→</button>
              </div>
              <div class="newtab-quicklinks">
                ${quicklinks.map(q => `<div class="quicklink" data-qlurl="${q.url}"><span class="ql-icon">${q.icon}</span><span class="ql-label">${q.label}</span></div>`).join('')}
              </div>
            </div>` : ''}
          ${tab && tab.page === 'loading' ? `
            <div class="browser-newtab" style="gap:12px">
              <div style="font-size:28px;animation:spin 1s linear infinite">🌐</div>
              <div style="color:rgba(255,255,255,0.4);font-size:13px;">Connecting to ${tab ? tab.url : ''}…</div>
              <div class="browser-loadbar" style="width:60%;opacity:1"></div>
            </div>` : ''}
          ${tab && tab.page === 'error' ? `
            <div class="browser-error visible">
              <div class="err-icon">🔌</div>
              <div class="err-title">Can't reach this page</div>
              <div class="err-msg">Nova Browser can't load external sites directly — cross-origin restrictions apply.<br><br>URL: <span style="color:rgba(79,160,229,0.8);font-family:'DM Mono',monospace;font-size:11px">${tab ? tab.url : ''}</span></div>
              <button class="err-retry" id="btn-retry">Try Again</button>
            </div>` : ''}
        </div>

        <!-- Status bar -->
        <div class="browser-statusbar">
          <span class="browser-status-text" id="browser-status">
            ${tab && tab.url ? tab.url : 'Nova Browser — Ready'}
          </span>
        </div>
      </div>`;

    // Update window title
    const wtitle = document.getElementById('wtitle-' + winId);
    if (wtitle && tab) wtitle.textContent = `🌐  ${tab.title || 'Nova Browser'}`;

    // Events: tabs
    el.querySelectorAll('.browser-tab[data-tabid]').forEach(t => {
      t.addEventListener('mousedown', e => {
        if (e.target.classList.contains('tab-close') || e.target.dataset.closeid) return;
        activeTab = parseInt(t.dataset.tabid); render();
      });
    });
    el.querySelectorAll('[data-closeid]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); closeTab(parseInt(btn.dataset.closeid)); });
    });
    const btnNewTab = el.querySelector('#btn-newtab');
    if (btnNewTab) btnNewTab.addEventListener('click', () => newTab());

    // Events: nav buttons
    const addr  = el.querySelector('#browser-addr');
    const btnGo = el.querySelector('#btn-go');
    const btnReload = el.querySelector('#btn-reload');
    if (btnGo)    btnGo.addEventListener('click', () => { if (addr) navigate(addr.value); });
    if (addr)     addr.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(addr.value); });
    if (btnReload && tab && tab.url) btnReload.addEventListener('click', () => navigate(tab.url));

    // Events: newtab search
    const ntSearch = el.querySelector('#nt-search');
    const ntGo     = el.querySelector('#nt-go');
    if (ntGo)     ntGo.addEventListener('click', () => { if (ntSearch) navigate(ntSearch.value); });
    if (ntSearch) ntSearch.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(ntSearch.value); });

    // Events: quicklinks
    el.querySelectorAll('.quicklink[data-qlurl]').forEach(q => {
      q.addEventListener('click', () => navigate(q.dataset.qlurl));
    });

    // Events: retry
    const retryBtn = el.querySelector('#btn-retry');
    if (retryBtn && tab) retryBtn.addEventListener('click', () => navigate(tab.url));
  }

  render();
}