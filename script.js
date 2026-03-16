/* ════════════════════════════════════════════════════════════════
   CodeArena — script.js
   Full auth system + plan selection + coupon unlock + all game routing
════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   AUTH HELPERS  (localStorage-backed)
───────────────────────────────────────────── */
const AUTH_KEY = 'codearena_user';

function getUser()    { try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; } }
function saveUser(u)  { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }
function clearUser()  { localStorage.removeItem(AUTH_KEY); }
function isLoggedIn() { return !!getUser(); }
function isPremium()  { return getUser()?.plan === 'premium'; }

// Valid coupon codes
const COUPONS = {
  'ARENA2026': 'premium',
  'CODEPRO':   'premium',
  'PREMIUM99': 'premium',
};

const FREE_FEATURES = [
  '✦ All free games (Hangman, Predict the Output, Output Oracle)',
  '✦ Personal session scores & leaderboard',
  '✦ Community game builder access',
  '✦ Filter & browse games library',
  '✦ Real-time community game feed',
];

const PREMIUM_FEATURES = [
  '★ Everything in Free',
  '★ CSS Tic Tac Toe (Flex & Grid modes)',
  '★ All future premium games unlocked',
  '★ Priority leaderboard badge',
  '★ Exclusive hard-mode challenges',
];

/* ─────────────────────────────────────────────
   INJECT AUTH MODALS + STYLES INTO <body>
───────────────────────────────────────────── */
function injectAuthModals() {
  document.body.insertAdjacentHTML('beforeend', `
  <div id="auth-overlay" style="display:none">

    <!-- Step 1: Login / Sign Up -->
    <div class="ca-wrap" id="auth-step-login">
      <div class="ca-modal">
        <button class="ca-x" id="auth-close">✕</button>
        <div class="ca-logo"><span class="code">Code</span><span class="arena">Arena</span></div>
        <p class="ca-sub">Sign in to play games and track your scores</p>
        <div class="ca-tabs">
          <button class="ca-tab active" data-tab="login">Login</button>
          <button class="ca-tab" data-tab="signup">Sign Up</button>
        </div>
        <div id="form-login">
          <div class="ca-field"><label>Email</label><input type="email" id="l-email" placeholder="you@example.com"></div>
          <div class="ca-field"><label>Password</label><input type="password" id="l-pass" placeholder="••••••••"></div>
          <div class="ca-err" id="l-err"></div>
          <button class="ca-primary" id="l-submit">Login →</button>
        </div>
        <div id="form-signup" style="display:none">
          <div class="ca-field"><label>Username</label><input type="text" id="s-name" placeholder="YourCallsign"></div>
          <div class="ca-field"><label>Email</label><input type="email" id="s-email" placeholder="you@example.com"></div>
          <div class="ca-field"><label>Password</label><input type="password" id="s-pass" placeholder="Min 6 characters"></div>
          <div class="ca-err" id="s-err"></div>
          <button class="ca-primary" id="s-submit">Create Account →</button>
        </div>
        <p class="ca-note">No real payments. Demo auth stored locally.</p>
      </div>
    </div>

    <!-- Step 2: Plan Selection -->
    <div class="ca-wrap" id="auth-step-plan" style="display:none">
      <div class="ca-modal ca-modal-wide">
        <div class="ca-logo"><span class="code">Code</span><span class="arena">Arena</span></div>
        <p class="ca-sub" id="plan-greeting">Welcome! Choose your plan to continue.</p>
        <div class="ca-plan-grid">
          <div class="ca-plan">
            <span class="ca-badge free">FREE</span>
            <div class="ca-price">₹0 <span>/ forever</span></div>
            <ul class="ca-features">${FREE_FEATURES.map(f=>`<li>${f}</li>`).join('')}</ul>
            <button class="ca-outline" id="choose-free">Continue Free →</button>
          </div>
          <div class="ca-plan ca-premium">
            <span class="ca-badge prem">PREMIUM</span>
            <div class="ca-price">Coupon <span>required</span></div>
            <ul class="ca-features">${PREMIUM_FEATURES.map(f=>`<li>${f}</li>`).join('')}</ul>
            <div class="ca-coupon-row">
              <input type="text" id="plan-coupon" placeholder="Enter coupon code">
              <button class="ca-primary" id="plan-coupon-btn">Apply</button>
            </div>
            <div class="ca-err" id="plan-coupon-err"></div>
            <p class="ca-hint">Try: <b>ARENA2026</b> or <b>CODEPRO</b></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Upgrade prompt -->
    <div class="ca-wrap" id="auth-step-upgrade" style="display:none">
      <div class="ca-modal">
        <button class="ca-x" id="upgrade-close">✕</button>
        <div class="ca-logo"><span class="code">Code</span><span class="arena">Arena</span></div>
        <div style="text-align:center;font-size:3rem;margin:8px 0">🔒</div>
        <p style="text-align:center;font-family:'Orbitron',monospace;font-weight:900;color:#ccff00;font-size:1.1rem;margin-bottom:6px">Premium Game</p>
        <p class="ca-sub">This game requires a Premium plan.<br>Enter your coupon code to unlock it instantly.</p>
        <div class="ca-coupon-row" style="margin-top:16px">
          <input type="text" id="up-coupon" placeholder="Enter coupon code">
          <button class="ca-primary" id="up-coupon-btn">Unlock</button>
        </div>
        <div class="ca-err" id="up-err"></div>
        <p class="ca-hint" style="margin-top:8px">Try: <b>ARENA2026</b> or <b>CODEPRO</b></p>
        <button class="ca-ghost" id="up-cancel">Maybe Later</button>
      </div>
    </div>

  </div>

  <style>
  #auth-overlay {
    position:fixed;inset:0;z-index:8888;
    background:rgba(0,0,0,.82);backdrop-filter:blur(8px);
    align-items:center;justify-content:center;
  }
  .ca-wrap {
    width:100%;display:flex;align-items:center;
    justify-content:center;padding:20px;
  }
  .ca-modal {
    background:#0f1318;border:1px solid rgba(0,255,255,.22);
    border-radius:16px;padding:36px 32px;width:min(100%,440px);
    position:relative;
    box-shadow:0 0 60px rgba(0,255,255,.07),0 30px 80px rgba(0,0,0,.7);
    animation:caPop .3s cubic-bezier(.34,1.56,.64,1);
  }
  .ca-modal-wide { width:min(100%,820px); }
  @keyframes caPop {
    from{opacity:0;transform:scale(.92) translateY(12px)}
    to  {opacity:1;transform:scale(1)   translateY(0)}
  }
  .ca-x {
    position:absolute;top:14px;right:16px;
    background:none;border:1px solid rgba(255,255,255,.1);
    color:#6b7280;width:30px;height:30px;border-radius:50%;
    cursor:pointer;font-size:.9rem;transition:all .2s;
    display:flex;align-items:center;justify-content:center;
  }
  .ca-x:hover { border-color:#ff4444;color:#ff4444; }
  .ca-logo {
    font-family:'Zolla','Open Sans',sans-serif;
    font-size:1.8rem;font-weight:900;text-align:center;
    margin-bottom:6px;letter-spacing:2px;
  }
  .ca-logo .code  { color:#00ffff;text-shadow:0 0 5px #fff,0 0 10px #00ffff,0 0 30px #00ffff; }
  .ca-logo .arena { color:#ccff00;text-shadow:0 0 5px #fff,0 0 10px #ccff00,0 0 30px #ccff00; }
  .ca-sub  { text-align:center;font-size:.85rem;color:#6b7280;margin-bottom:22px;line-height:1.5; }
  .ca-note { text-align:center;font-size:.68rem;color:#4a4a5a;margin-top:16px; }
  .ca-hint { font-size:.7rem;color:#4a4a5a;font-family:monospace;text-align:center; }
  .ca-hint b { color:#6b7280; }

  .ca-tabs { display:flex;margin-bottom:22px;border:1px solid rgba(0,255,255,.2);border-radius:8px;overflow:hidden; }
  .ca-tab  { flex:1;padding:10px 0;background:transparent;border:none;color:#6b7280;font-weight:700;font-size:.85rem;cursor:pointer;text-transform:uppercase;letter-spacing:.06em;transition:all .2s; }
  .ca-tab.active { background:rgba(0,255,255,.1);color:#00ffff;box-shadow:inset 0 -2px 0 #00ffff; }

  .ca-field { margin-bottom:14px; }
  .ca-field label { display:block;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:5px; }
  .ca-field input, .ca-coupon-row input {
    width:100%;background:#161b24;border:1px solid rgba(0,255,255,.2);
    color:#e8eaf0;padding:10px 14px;border-radius:7px;
    font-size:.9rem;outline:none;transition:border-color .2s;font-family:inherit;
  }
  .ca-field input:focus, .ca-coupon-row input:focus { border-color:#00ffff;box-shadow:0 0 0 2px rgba(0,255,255,.1); }

  .ca-err { font-size:.78rem;color:#ff4444;min-height:16px;margin-bottom:8px;font-family:monospace; }

  .ca-primary {
    width:100%;padding:12px;
    background:linear-gradient(135deg,#00ffff,#00b8d4);
    color:#000;font-weight:800;font-size:.88rem;border:none;border-radius:8px;
    cursor:pointer;text-transform:uppercase;letter-spacing:.08em;transition:all .2s;margin-top:4px;
  }
  .ca-primary:hover { box-shadow:0 0 24px rgba(0,255,255,.5);transform:translateY(-1px); }

  .ca-outline {
    width:100%;padding:11px;background:transparent;
    color:#00ffff;border:2px solid rgba(0,255,255,.4);font-weight:700;
    font-size:.85rem;border-radius:8px;cursor:pointer;
    text-transform:uppercase;letter-spacing:.08em;transition:all .2s;margin-top:auto;
  }
  .ca-outline:hover { background:rgba(0,255,255,.08);border-color:#00ffff; }

  .ca-ghost {
    display:block;width:100%;margin-top:12px;padding:9px;
    background:transparent;border:1px solid rgba(255,255,255,.1);
    color:#6b7280;font-size:.8rem;border-radius:7px;cursor:pointer;
    text-transform:uppercase;letter-spacing:.06em;transition:all .2s;
  }
  .ca-ghost:hover { color:#e8eaf0;border-color:rgba(255,255,255,.3); }

  .ca-plan-grid { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
  @media(max-width:620px){ .ca-plan-grid{ grid-template-columns:1fr; } }

  .ca-plan {
    background:#161b24;border:1px solid rgba(0,255,255,.2);
    border-radius:12px;padding:24px 20px;
    display:flex;flex-direction:column;gap:14px;
  }
  .ca-premium {
    border-color:rgba(204,255,0,.35);
    box-shadow:0 0 28px rgba(204,255,0,.06);
    background:linear-gradient(160deg,#161b24,#1a2010);
  }
  .ca-badge {
    display:inline-block;font-size:.65rem;font-weight:900;
    padding:3px 12px;border-radius:99px;letter-spacing:.12em;text-transform:uppercase;align-self:flex-start;
  }
  .ca-badge.free { background:rgba(0,255,255,.12);color:#00ffff;border:1px solid rgba(0,255,255,.3); }
  .ca-badge.prem { background:rgba(204,255,0,.12);color:#ccff00;border:1px solid rgba(204,255,0,.35); }
  .ca-price { font-family:'Orbitron','Open Sans',monospace;font-size:1.6rem;font-weight:900;color:#e8eaf0; }
  .ca-price span { font-size:.75rem;color:#6b7280; }
  .ca-features { list-style:none;display:flex;flex-direction:column;gap:8px;flex:1; }
  .ca-features li { font-size:.82rem;color:#a0aec0;padding:6px 10px;background:rgba(255,255,255,.03);border-radius:6px;border-left:2px solid rgba(0,255,255,.2); }
  .ca-premium .ca-features li { border-left-color:rgba(204,255,0,.3); }

  .ca-coupon-row { display:flex;gap:8px; }
  .ca-coupon-row input { flex:1;background:#0d1116;border:1px solid rgba(204,255,0,.25);font-family:monospace; }
  .ca-coupon-row input:focus { border-color:#ccff00;box-shadow:0 0 0 2px rgba(204,255,0,.1); }
  .ca-coupon-row .ca-primary { width:auto;padding:9px 16px;font-size:.78rem;margin:0;flex-shrink:0;background:linear-gradient(135deg,#ccff00,#aacc00); }

  /* Navbar user badge */
  .ca-auth-row {
    display:flex;align-items:center;gap:6px;flex-wrap:nowrap;
  }
  .ca-user-badge {
    display:flex;align-items:center;gap:6px;
    background:rgba(0,255,255,.07);border:1px solid rgba(0,255,255,.25);
    border-radius:20px;padding:4px 10px 4px 6px;cursor:default;
    white-space:nowrap;
  }
  .ca-avatar {
    width:26px;height:26px;border-radius:50%;flex-shrink:0;
    background:linear-gradient(135deg,#00ffff,#ccff00);
    display:flex;align-items:center;justify-content:center;
    font-size:.68rem;font-weight:900;color:#000;
  }
  .ca-uname {
    font-size:.72rem;font-weight:700;color:#00ffff;
    max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  }
  .ca-pchip {
    font-size:.55rem;font-weight:700;padding:1px 5px;border-radius:99px;
    text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;
  }
  .ca-pchip.free    { background:rgba(0,255,255,.1);color:#00ffff; }
  .ca-pchip.premium { background:rgba(204,255,0,.15);color:#ccff00; }
  .ca-logout {
    background:none;border:1px solid rgba(255,68,68,.35);color:rgba(255,68,68,.75);
    padding:4px 10px;border-radius:16px;cursor:pointer;
    font-size:.68rem;font-weight:700;text-transform:uppercase;
    letter-spacing:.04em;transition:all .2s;white-space:nowrap;flex-shrink:0;
  }
  .ca-logout:hover { border-color:#ff4444;color:#ff4444;background:rgba(255,68,68,.07); }

  /* Premium lock overlay */
  .prem-lock {
    position:absolute;inset:0;border-radius:20px;z-index:5;
    background:rgba(0,0,0,.58);backdrop-filter:blur(2px);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:6px;cursor:pointer;transition:background .2s;
  }
  .prem-lock:hover { background:rgba(0,0,0,.4); }
  .prem-lock .pl-icon { font-size:2rem; }
  .prem-lock .pl-title { font-size:.75rem;font-weight:700;color:#ccff00;text-transform:uppercase;letter-spacing:.1em;text-shadow:0 0 10px rgba(204,255,0,.5); }
  .prem-lock .pl-sub   { font-size:.65rem;color:rgba(255,255,255,.4); }
  </style>`);
}

/* ─────────────────────────────────────────────
   OVERLAY SHOW / HIDE
───────────────────────────────────────────── */
function showOverlay() { document.getElementById('auth-overlay').style.display = 'flex'; }
function hideOverlay() { document.getElementById('auth-overlay').style.display = 'none'; }

function showStep(id) {
  ['auth-step-login','auth-step-plan','auth-step-upgrade'].forEach(s => {
    document.getElementById(s).style.display = 'none';
  });
  document.getElementById(id).style.display = 'flex';
  showOverlay();
}

/* ─────────────────────────────────────────────
   NAVBAR — update based on auth state
───────────────────────────────────────────── */
function updateNavbar() {
  const auth = document.querySelector('.auth');
  if (!auth) return;
  const user = getUser();
  if (!user) {
    auth.innerHTML = `<button class="login-btn" id="loginNavBtn">Login</button>`;
    document.getElementById('loginNavBtn').addEventListener('click', () => showStep('auth-step-login'));
  } else {
    const initials = (user.name || user.email || 'U').slice(0,2).toUpperCase();
    const plan     = user.plan || 'free';
    auth.innerHTML = `
      <div class="ca-auth-row">
        <div class="ca-user-badge">
          <div class="ca-avatar">${initials}</div>
          <span class="ca-uname">${user.name || user.email}</span>
          <span class="ca-pchip ${plan}">${plan}</span>
        </div>
        <button class="ca-logout" id="logoutBtn">Logout</button>
      </div>`;
    document.getElementById('logoutBtn').addEventListener('click', () => {
      clearUser();
      updateNavbar();
      updatePremiumCards();
      showLandingToast('👋 Logged out. See you soon!');
    });
  }
}

/* ─────────────────────────────────────────────
   PREMIUM CARDS — add/remove lock overlay
───────────────────────────────────────────── */
function updatePremiumCards() {
  document.querySelectorAll('.game-card.premium').forEach(card => {
    card.querySelector('.prem-lock')?.remove();
    card.style.position = 'relative';
    if (!isPremium()) {
      const ov = document.createElement('div');
      ov.className = 'prem-lock';
      ov.innerHTML = `
        <div class="pl-icon">🔒</div>
        <div class="pl-title">Premium Only</div>
        <div class="pl-sub">${isLoggedIn() ? 'Enter coupon to unlock' : 'Login required'}</div>`;
      ov.addEventListener('click', () => {
        if (!isLoggedIn()) { showStep('auth-step-login'); return; }
        showStep('auth-step-upgrade');
      });
      card.appendChild(ov);
    }
  });
}

/* ─────────────────────────────────────────────
   WIRE LOGIN FORM
───────────────────────────────────────────── */
function wireLoginForm() {
  document.querySelectorAll('.ca-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ca-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.tab;
      document.getElementById('form-login').style.display  = which === 'login'  ? '' : 'none';
      document.getElementById('form-signup').style.display = which === 'signup' ? '' : 'none';
      document.getElementById('l-err').textContent = '';
      document.getElementById('s-err').textContent = '';
    });
  });

  document.getElementById('auth-close').addEventListener('click', hideOverlay);
  document.getElementById('auth-step-login').addEventListener('click', e => {
    if (e.target === e.currentTarget) hideOverlay();
  });

  // ── LOGIN ──
  document.getElementById('l-submit').addEventListener('click', () => {
    const email = document.getElementById('l-email').value.trim();
    const pass  = document.getElementById('l-pass').value;
    const err   = document.getElementById('l-err');
    if (!email || !pass)        { err.textContent = '⚠ Please fill in both fields.'; return; }
    if (!email.includes('@'))   { err.textContent = '⚠ Enter a valid email.'; return; }
    if (pass.length < 6)        { err.textContent = '⚠ Password must be at least 6 characters.'; return; }
    const accs = JSON.parse(localStorage.getItem('ca_accounts') || '{}');
    if (!accs[email])           { err.textContent = '⚠ No account found. Please sign up.'; return; }
    if (accs[email].password !== btoa(pass)) { err.textContent = '⚠ Incorrect password.'; return; }
    const a = accs[email];
    saveUser({ name: a.name, email, plan: a.plan || 'free' });
    err.textContent = '';
    document.getElementById('l-email').value = '';
    document.getElementById('l-pass').value  = '';
    hideOverlay();
    updateNavbar();
    updatePremiumCards();
    showLandingToast(`👾 Welcome back, ${a.name || email}!`);
  });

  // ── SIGN UP ──
  document.getElementById('s-submit').addEventListener('click', () => {
    const name  = document.getElementById('s-name').value.trim();
    const email = document.getElementById('s-email').value.trim();
    const pass  = document.getElementById('s-pass').value;
    const err   = document.getElementById('s-err');
    if (!name)                  { err.textContent = '⚠ Username is required.'; return; }
    if (!email.includes('@'))   { err.textContent = '⚠ Enter a valid email.'; return; }
    if (pass.length < 6)        { err.textContent = '⚠ Password must be at least 6 characters.'; return; }
    const accs = JSON.parse(localStorage.getItem('ca_accounts') || '{}');
    if (accs[email])            { err.textContent = '⚠ Email already registered. Please login.'; return; }
    accs[email] = { name, password: btoa(pass), plan: 'free' };
    localStorage.setItem('ca_accounts', JSON.stringify(accs));
    saveUser({ name, email, plan: 'free' });
    err.textContent = '';
    ['s-name','s-email','s-pass'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('plan-greeting').textContent = `Welcome, ${name}! Choose your plan.`;
    showStep('auth-step-plan');
  });

  // Enter key support
  ['l-email','l-pass'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('l-submit').click(); });
  });
  ['s-name','s-email','s-pass'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('s-submit').click(); });
  });
}

/* ─────────────────────────────────────────────
   WIRE PLAN STEP
───────────────────────────────────────────── */
function wirePlanStep() {
  document.getElementById('choose-free').addEventListener('click', () => {
    hideOverlay();
    updateNavbar();
    updatePremiumCards();
    showLandingToast('🎮 Free plan activated! Enjoy your games.');
  });
  document.getElementById('plan-coupon-btn').addEventListener('click', () =>
    applyCoupon('plan-coupon','plan-coupon-err'));
  document.getElementById('plan-coupon').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('plan-coupon-btn').click();
  });
}

/* ─────────────────────────────────────────────
   WIRE UPGRADE STEP
───────────────────────────────────────────── */
function wireUpgradeStep() {
  document.getElementById('upgrade-close').addEventListener('click', hideOverlay);
  document.getElementById('up-cancel').addEventListener('click', hideOverlay);
  document.getElementById('auth-step-upgrade').addEventListener('click', e => {
    if (e.target === e.currentTarget) hideOverlay();
  });
  document.getElementById('up-coupon-btn').addEventListener('click', () =>
    applyCoupon('up-coupon','up-err'));
  document.getElementById('up-coupon').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('up-coupon-btn').click();
  });
}

/* ─────────────────────────────────────────────
   SHARED COUPON LOGIC
───────────────────────────────────────────── */
function applyCoupon(inputId, errId) {
  const code = document.getElementById(inputId).value.trim().toUpperCase();
  const err  = document.getElementById(errId);
  if (!code) { err.textContent = '⚠ Enter a coupon code.'; return; }
  const plan = COUPONS[code];
  if (!plan) { err.textContent = '⚠ Invalid code. Try ARENA2026 or CODEPRO.'; return; }
  const user = getUser();
  user.plan = plan;
  saveUser(user);
  const accs = JSON.parse(localStorage.getItem('ca_accounts') || '{}');
  if (accs[user.email]) { accs[user.email].plan = plan; localStorage.setItem('ca_accounts', JSON.stringify(accs)); }
  err.textContent = '';
  document.getElementById(inputId).value = '';
  hideOverlay();
  updateNavbar();
  updatePremiumCards();
  showLandingToast('🌟 Premium unlocked! All games are now available.');
}

/* ─────────────────────────────────────────────
   GAME ROUTING — ALL PLAY BUTTONS
───────────────────────────────────────────── */
const ROUTES = {
  'hangman':            'hangmanPage/hangman.html',
  'tic tac toe':        'Tictactoe/index.html',
  'predict the output': 'syntax.html',
  'output oracle':      'mcq.html',
};
const PREMIUM_TITLES = ['tic tac toe'];

function wirePlayButtons() {
  // Clone to remove stale listeners
  document.querySelectorAll('.play-btn').forEach(btn => {
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
  });

  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const card  = e.target.closest('.game-card');
      if (!card) return;
      const title = (card.querySelector('h3')?.innerText || '').trim().toLowerCase();
      const isPrem = PREMIUM_TITLES.some(t => title.includes(t));

      // Must be logged in
      if (!isLoggedIn()) { showStep('auth-step-login'); return; }

      // Premium game requires premium plan
      if (isPrem && !isPremium()) { showStep('auth-step-upgrade'); return; }

      // Find route
      const entry = Object.entries(ROUTES).find(([k]) => title.includes(k));
      if (entry) { window.location.href = entry[1]; return; }

      // Community card
      const slug = btn.dataset.slug;
      if (slug) {
        window.location.href = `GameBuilder/gamebuilder.html?${new URLSearchParams({ game: slug })}`;
      }
    });
  });
}

/* ═══════════════════════════════════════════════════
   LOADER
═══════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => { document.getElementById('loader').classList.add('loader-hidden'); }, 1500);
});

/* ═══════════════════════════════════════════════════
   NAVBAR SCROLL REVEAL
═══════════════════════════════════════════════════ */
window.addEventListener("scroll", () => {
  const nb = document.querySelector(".navbar");
  if (nb) nb.classList.toggle("show", window.scrollY > 500);
});

/* ═══════════════════════════════════════════════════
   HORIZONTAL SCROLL
═══════════════════════════════════════════════════ */
const scrollContainer  = document.querySelector('.horizontal-scroll-container');
const horizontalScroll = document.querySelector('.programdiff-scrollbar');

window.addEventListener('scroll', () => {
  if (!scrollContainer || !horizontalScroll) return;
  const top = scrollContainer.offsetTop;
  const h   = scrollContainer.offsetHeight;
  const wh  = window.innerHeight;
  const prog = window.pageYOffset - top;
  if (prog >= 0 && prog <= (h - wh)) {
    const maxH = horizontalScroll.scrollWidth - window.innerWidth + window.innerWidth * 0.1;
    horizontalScroll.style.transform = `translateX(-${(prog / (h - wh)) * maxH}px)`;
  }
});

/* ═══════════════════════════════════════════════════
   COMMUNITY GAMES
═══════════════════════════════════════════════════ */
const STORAGE_KEY = 'codearena_published_games';

function buildCategoryAttr(game) {
  const cats = [];
  if (game.category) cats.push(game.category.toLowerCase());
  const lang = (game.language || '').toLowerCase();
  if (['html','css'].includes(lang)) cats.push('layout');
  if (['js','javascript','python','c++'].includes(lang)) cats.push('syntax','logic');
  return [...new Set(cats)].join(' ') || 'syntax';
}
const GRADIENTS = [
  'linear-gradient(135deg,#001a1a,#00ffff22)',
  'linear-gradient(135deg,#1a1a00,#ccff0022)',
  'linear-gradient(135deg,#1a0030,#b47eff22)',
  'linear-gradient(135deg,#001a0a,#39ff5e22)',
  'linear-gradient(135deg,#1a0800,#ff8c0022)',
];
function langColor(lang) {
  return ({JS:'#f0db4f',JavaScript:'#f0db4f',HTML:'#e44d26',CSS:'#2965f1',Python:'#3572a5','C++':'#f34b7d',SQL:'#e38c00'})[lang] || '#00ffff';
}
function hashStr(s='') { let h=0; for(let i=0;i<s.length;i++) h=(Math.imul(31,h)+s.charCodeAt(i))|0; return h; }
function escHtml(s)    { const d=document.createElement('div');d.textContent=s;return d.innerHTML; }
function escAttr(s)    { return (s||'').replace(/'/g,"\\'"); }
function formatDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short'}); } catch { return ''; }
}

function buildGameCard(game) {
  const card = document.createElement('div');
  card.className    = 'game-card community-game-card';
  card.dataset.category = buildCategoryAttr(game);
  const dc  = game.difficulty==='Easy'?'#39ff5e':game.difficulty==='Hard'?'#ff3d3d':'#ff8c00';
  const gr  = GRADIENTS[Math.abs(hashStr(game.title)) % GRADIENTS.length];
  const ini = (game.title||'G').slice(0,2).toUpperCase();
  const lc  = langColor(game.language);
  card.innerHTML = `
    <div class="card-tag community-tag">Community</div>
    <div style="background:${gr};height:200px;display:flex;align-items:center;justify-content:center;font-size:56px;font-weight:900;color:${lc};text-shadow:0 0 20px ${lc}88;letter-spacing:2px;border-bottom:1px solid rgba(255,255,255,.05)">${ini}</div>
    <div class="game-info">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:3px;background:rgba(255,255,255,.06);color:${lc};border:1px solid ${lc}44;font-family:monospace">${game.language||'JS'}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:3px;background:rgba(255,255,255,.06);color:${dc};border:1px solid ${dc}44;font-family:monospace">${game.difficulty||'Medium'}</span>
        <span style="font-size:10px;color:#555;font-family:monospace;margin-left:auto">${formatDate(game.publishedAt)}</span>
      </div>
      <h3>${escHtml(game.title)}</h3>
      <p>${escHtml(game.description||'A community-created coding challenge.')}</p>
      <div style="display:flex;gap:8px">
        <button class="play-btn" style="flex:1" data-slug="${game.slug}">▶ Play Now</button>
        <button class="play-btn" style="width:44px;font-size:16px;padding:0;border-color:rgba(0,255,255,.3);color:#555" onclick="shareGame('${game.slug}','${escAttr(game.title)}')">⬡</button>
      </div>
    </div>`;
  return card;
}

function loadCommunityGames() {
  let games = [];
  try { games = JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); } catch { games=[]; }
  const grid = document.querySelector('.game-grid');
  if (!grid || !games.length) return;
  grid.querySelectorAll('.community-game-card').forEach(c => c.remove());
  games.slice().reverse().forEach(g => grid.appendChild(buildGameCard(g)));
  if (!grid.querySelector('.community-divider')) {
    const first = grid.querySelector('.community-game-card');
    if (first) {
      const div = document.createElement('div');
      div.className = 'community-divider';
      div.innerHTML = '<span>✦ Community Games</span>';
      div.style.cssText = 'grid-column:1/-1;text-align:center;padding:20px 0 4px;font-family:"Zolla",sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#ccff00;text-shadow:0 0 10px rgba(204,255,0,.4);border-top:1px solid rgba(204,255,0,.15)';
      grid.insertBefore(div, first);
    }
  }
  wirePlayButtons();
}

function shareGame(slug, title) {
  navigator.clipboard.writeText(`${location.origin}${location.pathname}#games`).catch(() => {});
  showLandingToast(`🔗 Link copied for "${title}"!`);
}

function showLandingToast(msg) {
  let t = document.getElementById('landing-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'landing-toast';
    t.style.cssText = 'position:fixed;bottom:28px;right:28px;z-index:9999;background:#111;border:1px solid rgba(0,255,255,.3);color:#e0e0e0;padding:12px 20px;border-radius:8px;font-size:13px;font-family:sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.5);transform:translateX(120%);transition:transform .3s cubic-bezier(.175,.885,.32,1.275)';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.transform = 'translateX(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.transform = 'translateX(120%)'; }, 3200);
}

function checkPublishReturn() {
  const p = new URLSearchParams(location.search);
  if (p.get('published') === '1') {
    showLandingToast(`🚀 "${p.get('title')||'Your game'}" is now live in the Games Library!`);
    history.replaceState({}, '', location.pathname + location.hash);
    setTimeout(() => document.querySelector('.games')?.scrollIntoView({ behavior:'smooth' }), 800);
  }
}

window.addEventListener('storage', e => {
  if (e.key === STORAGE_KEY) {
    loadCommunityGames();
    reApplyActiveFilter();
    showLandingToast('🎮 A new game just landed in the Library!');
  }
});

/* ═══════════════════════════════════════════════════
   DOMContentLoaded
═══════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

  // ── 1. Inject modals ──
  injectAuthModals();
  wireLoginForm();
  wirePlanStep();
  wireUpgradeStep();

  // ── 2. Restore auth state ──
  updateNavbar();
  updatePremiumCards();

  // ── 3. Community games ──
  loadCommunityGames();
  checkPublishReturn();

  // ── 4. Filter buttons ──
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  // ── 5. Play buttons ──
  wirePlayButtons();

  // ── 6. Game Builder CTA ──
  const publishBtn = document.querySelector('.publish-btn');
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      if (!isLoggedIn()) { showStep('auth-step-login'); return; }
      publishBtn.style.transform = "scale(0.95)";
      setTimeout(() => { publishBtn.style.transform = ""; window.location.href = 'GameBuilder/gamebuilder.html'; }, 150);
    });
  }

  // ── 7. Footer back-to-top ──
  document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior:'smooth' });
  });
});

/* ═══════════════════════════════════════════════════
   FILTER HELPERS
═══════════════════════════════════════════════════ */
function applyFilter(val) {
  document.querySelectorAll('.game-card').forEach(card => {
    if (card.classList.contains('community-divider')) return;
    const cats = card.getAttribute('data-category') || '';
    card.classList.toggle('hidden', val !== 'all' && !cats.includes(val));
  });
  const div = document.querySelector('.community-divider');
  if (div) {
    div.style.display = [...document.querySelectorAll('.community-game-card')].some(c => !c.classList.contains('hidden')) ? '' : 'none';
  }
}

function reApplyActiveFilter() {
  const a = document.querySelector('.filter-btn.active');
  if (a) applyFilter(a.getAttribute('data-filter'));
}