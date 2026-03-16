/* ════════════════════════════════════════════════════════════
   auth-widget.js  —  CodeArena shared auth widget
   Drop this script into any game page to get:
   • A login button / user badge in the page header
   • Login / sign-up modal (same as index.html)
   • Logout, plan chip, and session restore

   USAGE:  <script src="../auth-widget.js" defer></script>
   Then place  <div class="ca-auth-target"></div>  wherever you
   want the login button to appear in the header.
════════════════════════════════════════════════════════════ */

(function () {

  /* ── Auth helpers ── */
  const KEY = 'codearena_user';
  const getUser    = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
  const saveUser   = u => localStorage.setItem(KEY, JSON.stringify(u));
  const clearUser  = () => localStorage.removeItem(KEY);
  const isLoggedIn = () => !!getUser();

  const COUPONS = { 'ARENA2026':'premium', 'CODEPRO':'premium', 'PREMIUM99':'premium' };

  /* ── Inject styles ── */
  const STYLE = `
  .ca-auth-row {
    display:flex;align-items:center;gap:6px;flex-wrap:nowrap;
  }
  .ca-user-badge {
    display:flex;align-items:center;gap:6px;
    background:rgba(0,255,255,.07);border:1px solid rgba(0,255,255,.25);
    border-radius:20px;padding:4px 10px 4px 6px;cursor:default;white-space:nowrap;
  }
  .ca-avatar {
    width:26px;height:26px;border-radius:50%;flex-shrink:0;
    background:linear-gradient(135deg,#00ffff,#ccff00);
    display:flex;align-items:center;justify-content:center;
    font-size:.68rem;font-weight:900;color:#000;
  }
  .ca-uname { font-size:.72rem;font-weight:700;color:#00ffff;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
  .ca-pchip { font-size:.55rem;font-weight:700;padding:1px 5px;border-radius:99px;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap; }
  .ca-pchip.free    { background:rgba(0,255,255,.1);color:#00ffff; }
  .ca-pchip.premium { background:rgba(204,255,0,.15);color:#ccff00; }
  .ca-widget-login-btn {
    padding:7px 16px;border-radius:20px;border:1px solid #00ffff;
    background:transparent;color:#00ffff;cursor:pointer;font-size:.8rem;
    font-weight:700;text-transform:uppercase;letter-spacing:.06em;
    transition:.25s;white-space:nowrap;font-family:inherit;
  }
  .ca-widget-login-btn:hover { background:#00ffff;color:#000;box-shadow:0 0 12px #00ffff; }
  .ca-logout {
    background:none;border:1px solid rgba(255,68,68,.35);color:rgba(255,68,68,.75);
    padding:4px 10px;border-radius:16px;cursor:pointer;font-size:.68rem;
    font-weight:700;text-transform:uppercase;letter-spacing:.04em;
    transition:all .2s;white-space:nowrap;flex-shrink:0;font-family:inherit;
  }
  .ca-logout:hover { border-color:#ff4444;color:#ff4444;background:rgba(255,68,68,.07); }

  /* ── Modal overlay ── */
  #ca-widget-overlay {
    position:fixed;inset:0;z-index:9000;
    background:rgba(0,0,0,.82);backdrop-filter:blur(8px);
    display:none;align-items:center;justify-content:center;
  }
  .ca-wrap {
    width:100%;display:flex;align-items:center;justify-content:center;padding:20px;
  }
  .ca-modal {
    background:#0f1318;border:1px solid rgba(0,255,255,.22);
    border-radius:16px;padding:36px 32px;width:min(100%,440px);
    position:relative;
    box-shadow:0 0 60px rgba(0,255,255,.07),0 30px 80px rgba(0,0,0,.7);
    animation:caPop .3s cubic-bezier(.34,1.56,.64,1);
    font-family:'Zolla','Open Sans','Segoe UI',sans-serif;
    color:#e8eaf0;
  }
  @keyframes caPop { from{opacity:0;transform:scale(.92) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .ca-x {
    position:absolute;top:14px;right:16px;background:none;
    border:1px solid rgba(255,255,255,.1);color:#6b7280;
    width:30px;height:30px;border-radius:50%;cursor:pointer;
    font-size:.9rem;transition:all .2s;display:flex;align-items:center;justify-content:center;
  }
  .ca-x:hover { border-color:#ff4444;color:#ff4444; }
  .ca-logo {
    font-size:1.8rem;font-weight:900;text-align:center;
    margin-bottom:6px;letter-spacing:2px;
    font-family:'Zolla','Open Sans',sans-serif;
  }
  .ca-logo .code  { color:#00ffff;text-shadow:0 0 5px #fff,0 0 10px #00ffff,0 0 30px #00ffff; }
  .ca-logo .arena { color:#ccff00;text-shadow:0 0 5px #fff,0 0 10px #ccff00,0 0 30px #ccff00; }
  .ca-sub  { text-align:center;font-size:.85rem;color:#6b7280;margin-bottom:22px;line-height:1.5; }
  .ca-note { text-align:center;font-size:.68rem;color:#4a4a5a;margin-top:16px; }
  .ca-tabs { display:flex;margin-bottom:22px;border:1px solid rgba(0,255,255,.2);border-radius:8px;overflow:hidden; }
  .ca-tab  { flex:1;padding:10px 0;background:transparent;border:none;color:#6b7280;
             font-weight:700;font-size:.85rem;cursor:pointer;text-transform:uppercase;
             letter-spacing:.06em;transition:all .2s;font-family:inherit; }
  .ca-tab.active { background:rgba(0,255,255,.1);color:#00ffff;box-shadow:inset 0 -2px 0 #00ffff; }
  .ca-field { margin-bottom:14px; }
  .ca-field label { display:block;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:5px; }
  .ca-field input {
    width:100%;background:#161b24;border:1px solid rgba(0,255,255,.2);color:#e8eaf0;
    padding:10px 14px;border-radius:7px;font-size:.9rem;outline:none;transition:border-color .2s;
    font-family:inherit;
  }
  .ca-field input:focus { border-color:#00ffff;box-shadow:0 0 0 2px rgba(0,255,255,.1); }
  .ca-err { font-size:.78rem;color:#ff4444;min-height:16px;margin-bottom:8px;font-family:monospace; }
  .ca-primary {
    width:100%;padding:12px;background:linear-gradient(135deg,#00ffff,#00b8d4);
    color:#000;font-weight:800;font-size:.88rem;border:none;border-radius:8px;
    cursor:pointer;text-transform:uppercase;letter-spacing:.08em;transition:all .2s;margin-top:4px;
    font-family:inherit;
  }
  .ca-primary:hover { box-shadow:0 0 24px rgba(0,255,255,.5);transform:translateY(-1px); }
  .ca-toast-w {
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:#111;border:1px solid rgba(0,255,255,.3);color:#e0e0e0;
    padding:11px 18px;border-radius:8px;font-size:12px;
    box-shadow:0 8px 30px rgba(0,0,0,.5);
    transform:translateX(130%);transition:transform .3s cubic-bezier(.175,.885,.32,1.275);
    font-family:'Open Sans','Segoe UI',sans-serif;
  }
  .ca-toast-w.show { transform:translateX(0); }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  /* ── Inject modal HTML ── */
  document.body.insertAdjacentHTML('beforeend', `
  <div id="ca-widget-overlay">
    <div class="ca-wrap" id="wg-step-login">
      <div class="ca-modal">
        <button class="ca-x" id="wg-close">✕</button>
        <div class="ca-logo"><span class="code">Code</span><span class="arena">Arena</span></div>
        <p class="ca-sub">Sign in to save scores and access all games</p>
        <div class="ca-tabs">
          <button class="ca-tab active" data-tab="login">Login</button>
          <button class="ca-tab" data-tab="signup">Sign Up</button>
        </div>
        <div id="wg-form-login">
          <div class="ca-field"><label>Email</label><input type="email" id="wg-l-email" placeholder="you@example.com"></div>
          <div class="ca-field"><label>Password</label><input type="password" id="wg-l-pass" placeholder="••••••••"></div>
          <div class="ca-err" id="wg-l-err"></div>
          <button class="ca-primary" id="wg-l-submit">Login →</button>
        </div>
        <div id="wg-form-signup" style="display:none">
          <div class="ca-field"><label>Username</label><input type="text" id="wg-s-name" placeholder="YourCallsign"></div>
          <div class="ca-field"><label>Email</label><input type="email" id="wg-s-email" placeholder="you@example.com"></div>
          <div class="ca-field"><label>Password</label><input type="password" id="wg-s-pass" placeholder="Min 6 characters"></div>
          <div class="ca-err" id="wg-s-err"></div>
          <button class="ca-primary" id="wg-s-submit">Create Account →</button>
        </div>
        <p class="ca-note">Demo auth — stored locally. No real data sent.</p>
      </div>
    </div>
  </div>
  <div class="ca-toast-w" id="ca-wg-toast"></div>`);

  /* ── Toast ── */
  function wgToast(msg) {
    const t = document.getElementById('ca-wg-toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 3000);
  }

  /* ── Show / hide overlay ── */
  const overlay = document.getElementById('ca-widget-overlay');
  function showModal() { overlay.style.display = 'flex'; }
  function hideModal() { overlay.style.display = 'none'; }

  document.getElementById('wg-close').addEventListener('click', hideModal);
  document.getElementById('wg-step-login').addEventListener('click', e => {
    if (e.target === e.currentTarget) hideModal();
  });

  /* ── Tab switching ── */
  document.querySelectorAll('#wg-step-login .ca-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#wg-step-login .ca-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.tab;
      document.getElementById('wg-form-login').style.display  = which === 'login'  ? '' : 'none';
      document.getElementById('wg-form-signup').style.display = which === 'signup' ? '' : 'none';
      document.getElementById('wg-l-err').textContent = '';
      document.getElementById('wg-s-err').textContent = '';
    });
  });

  /* ── Login ── */
  document.getElementById('wg-l-submit').addEventListener('click', () => {
    const email = document.getElementById('wg-l-email').value.trim();
    const pass  = document.getElementById('wg-l-pass').value;
    const err   = document.getElementById('wg-l-err');
    if (!email || !pass)         { err.textContent = '⚠ Fill in both fields.'; return; }
    if (!email.includes('@'))    { err.textContent = '⚠ Enter a valid email.'; return; }
    if (pass.length < 6)         { err.textContent = '⚠ Password must be 6+ chars.'; return; }
    const accs = JSON.parse(localStorage.getItem('ca_accounts') || '{}');
    if (!accs[email])             { err.textContent = '⚠ No account found. Sign up first.'; return; }
    if (accs[email].password !== btoa(pass)) { err.textContent = '⚠ Incorrect password.'; return; }
    const a = accs[email];
    saveUser({ name: a.name, email, plan: a.plan || 'free' });
    err.textContent = '';
    document.getElementById('wg-l-email').value = '';
    document.getElementById('wg-l-pass').value  = '';
    hideModal();
    renderWidget();
    wgToast(`👾 Welcome back, ${a.name || email}!`);
  });

  /* ── Sign Up ── */
  document.getElementById('wg-s-submit').addEventListener('click', () => {
    const name  = document.getElementById('wg-s-name').value.trim();
    const email = document.getElementById('wg-s-email').value.trim();
    const pass  = document.getElementById('wg-s-pass').value;
    const err   = document.getElementById('wg-s-err');
    if (!name)                   { err.textContent = '⚠ Username required.'; return; }
    if (!email.includes('@'))    { err.textContent = '⚠ Valid email required.'; return; }
    if (pass.length < 6)         { err.textContent = '⚠ Password must be 6+ chars.'; return; }
    const accs = JSON.parse(localStorage.getItem('ca_accounts') || '{}');
    if (accs[email])              { err.textContent = '⚠ Email already registered.'; return; }
    accs[email] = { name, password: btoa(pass), plan: 'free' };
    localStorage.setItem('ca_accounts', JSON.stringify(accs));
    saveUser({ name, email, plan: 'free' });
    err.textContent = '';
    ['wg-s-name','wg-s-email','wg-s-pass'].forEach(id => document.getElementById(id).value = '');
    hideModal();
    renderWidget();
    wgToast(`🎮 Account created! Welcome, ${name}!`);
  });

  /* ── Enter key support ── */
  ['wg-l-email','wg-l-pass'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('wg-l-submit').click();
    });
  });
  ['wg-s-name','wg-s-email','wg-s-pass'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('wg-s-submit').click();
    });
  });

  /* ── Render the widget into .ca-auth-target ── */
  function renderWidget() {
    const targets = document.querySelectorAll('.ca-auth-target');
    if (!targets.length) return;

    const user = getUser();

    targets.forEach(target => {
      if (!user) {
        target.innerHTML = `<button class="ca-widget-login-btn" id="ca-wg-login-btn">Login</button>`;
        target.querySelector('#ca-wg-login-btn').addEventListener('click', showModal);
      } else {
        const initials = (user.name || user.email || 'U').slice(0,2).toUpperCase();
        const plan     = user.plan || 'free';
        target.innerHTML = `
          <div class="ca-auth-row">
            <div class="ca-user-badge">
              <div class="ca-avatar">${initials}</div>
              <span class="ca-uname">${user.name || user.email}</span>
              <span class="ca-pchip ${plan}">${plan}</span>
            </div>
            <button class="ca-logout ca-wg-logout">Logout</button>
          </div>`;
        target.querySelector('.ca-wg-logout').addEventListener('click', () => {
          clearUser();
          renderWidget();
          wgToast('👋 Logged out. See you soon!');
        });
      }
    });
  }

  /* ── Init on DOM ready ── */
  function init() {
    renderWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();