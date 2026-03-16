/* ══════════════════════════════════════════════
   FILE CONTENTS per tab
══════════════════════════════════════════════ */
const FILES = {
  'logic.js': `// ── CodeArena Game Logic ──────────────────────
// Template: Hangman (Syntax Challenge)
// Author: You  |  Difficulty: Medium

const WORDS = [
  { word: "forEach",    hint: "Array iterator method" },
  { word: "callback",   hint: "Function passed as argument" },
  { word: "prototype",  hint: "JS inheritance chain" },
  { word: "closure",    hint: "Function + lexical scope" },
  { word: "hoisting",   hint: "JS var declaration behavior" },
];

let currentWord  = "";
let guessedChars = new Set();
let livesLeft    = 6;
let score        = 0;

function initGame() {
  const entry   = WORDS[Math.floor(Math.random() * WORDS.length)];
  currentWord   = entry.word.toLowerCase();
  guessedChars  = new Set();
  livesLeft     = 6;

  renderDisplay();
  renderKeyboard();
  updateHint(entry.hint);
  console.log("Game initialized ✓");
}

function renderDisplay() {
  const displayEl = document.getElementById("word-display");
  if (!displayEl) return;
  displayEl.innerHTML = currentWord
    .split("")
    .map(ch => guessedChars.has(ch)
      ? \`<span class="revealed">\${ch}</span>\`
      : \`<span class="blank">_</span>\`)
    .join(" ");
}

function handleGuess(char) {
  if (guessedChars.has(char) || livesLeft <= 0) return;
  guessedChars.add(char);

  if (currentWord.includes(char)) {
    score += 10;
    updateScore(score);
    if (isWordComplete()) {
      onWin(); return;
    }
  } else {
    livesLeft--;
    updateLives(livesLeft);
    if (livesLeft <= 0) { onLose(); return; }
  }
  renderDisplay();
}

function isWordComplete() {
  return currentWord.split("").every(ch => guessedChars.has(ch));
}

function onWin()  { showMessage("🎉 Correct! +" + score + " pts", "success"); }
function onLose() { showMessage("💀 The word was: " + currentWord, "fail");   }

// ── Hooks ──
function updateScore(s)  { const el = document.getElementById("score");    if(el) el.textContent = s; }
function updateLives(l)  { const el = document.getElementById("lives");    if(el) el.textContent = "❤️".repeat(l); }
function updateHint(h)   { const el = document.getElementById("hint-txt"); if(el) el.textContent = h; }
function showMessage(m,t){ const el = document.getElementById("message");  if(el){ el.textContent=m; el.className="message "+t; } }

// ── Keyboard ──
function renderKeyboard() {
  const kb = document.getElementById("keyboard");
  if (!kb) return;
  kb.innerHTML = "";
  "abcdefghijklmnopqrstuvwxyz".split("").forEach(ch => {
    const btn = document.createElement("button");
    btn.textContent = ch;
    btn.className   = "key-btn";
    btn.onclick     = () => { handleGuess(ch); btn.disabled = true; };
    kb.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", initGame);`,

  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hangman — CodeArena</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="game-container">
    <header class="game-header">
      <h1>⌨ Syntax Hangman</h1>
      <div class="meta">
        <span>Score: <b id="score">0</b></span>
        <span>Lives: <span id="lives">❤️❤️❤️❤️❤️❤️</span></span>
      </div>
    </header>

    <div class="hint-box">
      Hint: <span id="hint-txt">Loading…</span>
    </div>

    <div id="word-display" class="word-display"></div>
    <div id="message" class="message"></div>
    <div id="keyboard" class="keyboard"></div>

    <button class="reset-btn" onclick="initGame()">↺ New Word</button>
  </div>
  <script src="logic.js"><\/script>
</body>
</html>`,

  'style.css': `/* ── Hangman Game Styles ── */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #0d0d0f;
  color: #d4d4d8;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.game-container {
  background: #111114;
  border: 1px solid #2a2a30;
  border-radius: 12px;
  padding: 32px;
  width: 560px;
  max-width: 95vw;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.game-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #00e5ff;
  text-shadow: 0 0 20px rgba(0,229,255,0.4);
  margin-bottom: 10px;
}

.meta { display: flex; justify-content: center; gap: 24px; font-size: 13px; color: #888; }
.meta b { color: #ccff00; }

.hint-box {
  background: #161619;
  border: 1px solid #2a2a30;
  border-radius: 6px;
  padding: 10px 16px;
  margin: 20px 0;
  font-size: 12px;
  color: #888;
}
.hint-box span { color: #b47eff; }

.word-display {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 8px;
  margin: 24px 0;
  min-height: 56px;
}

.word-display .revealed { color: #ccff00; }
.word-display .blank    { color: #4a4a54; }

.message {
  height: 28px; font-size: 14px; font-weight: 600; margin-bottom: 16px;
}
.message.success { color: #39ff5e; }
.message.fail    { color: #ff3d3d; }

.keyboard {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: 6px; margin-bottom: 20px;
}
.key-btn {
  width: 38px; height: 38px; border-radius: 5px;
  background: #1e1e22; color: #d4d4d8; border: 1px solid #333340;
  font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer;
  transition: all 0.15s;
}
.key-btn:hover:not(:disabled) { background: #252529; color: #00e5ff; border-color: #00e5ff; }
.key-btn:disabled { opacity: 0.25; cursor: not-allowed; }

.reset-btn {
  background: rgba(0,229,255,0.1); color: #00e5ff;
  border: 1px solid rgba(0,229,255,0.35); border-radius: 5px;
  padding: 8px 20px; font-family: inherit; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.18s;
}
.reset-btn:hover { background: rgba(0,229,255,0.2); box-shadow: 0 0 14px rgba(0,229,255,0.2); }`
};

/* ══════════════════════════════════════════════
   EDITOR
══════════════════════════════════════════════ */
const editor   = document.getElementById("code-editor");
const lineNums = document.getElementById("line-nums");
let activeFile = "logic.js";

function getLang(f){ return f.endsWith('.js')?'JavaScript':f.endsWith('.html')?'HTML':'CSS'; }

function loadFile(filename) {
  editor.value = FILES[filename] || "";
  activeFile   = filename;
  updateLineNums();
  document.getElementById("sb-lang").textContent = getLang(filename);
  updatePreview();
  document.querySelectorAll(".editor-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.file === filename);
  });
}

function updateLineNums() {
  const lines = editor.value.split("\n").length;
  lineNums.innerHTML = Array.from({length: lines}, (_,i) => i+1).join("<br>");
}

editor.addEventListener("input", () => {
  FILES[activeFile] = editor.value;
  updateLineNums();
  document.getElementById("unsaved-dot").classList.add("visible");
  schedulePreview();
});

editor.addEventListener("scroll", () => {
  lineNums.scrollTop = editor.scrollTop;
});

editor.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const s = editor.selectionStart, end = editor.selectionEnd;
    editor.value = editor.value.substring(0,s) + "  " + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = s + 2;
    FILES[activeFile] = editor.value;
    updateLineNums();
  }
});

// track cursor position
editor.addEventListener("keyup", updateCursor);
editor.addEventListener("click", updateCursor);
function updateCursor() {
  const txt = editor.value.substring(0, editor.selectionStart);
  const ln = txt.split("\n").length;
  const col = txt.split("\n").pop().length + 1;
  document.querySelector(".statusbar .sb-item:first-child span").textContent = `Ln ${ln}, Col ${col}`;
}

/* ══════════════════════════════════════════════
   LIVE PREVIEW
══════════════════════════════════════════════ */
let previewTimer;
function schedulePreview(immediate=false) {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, immediate ? 0 : 800);
}

function updatePreview() {
  const html = FILES['index.html'];
  const css  = FILES['style.css'];
  const js   = FILES['logic.js'];

  const blob = new Blob([
    html
      .replace('</head>', `<style>${css}</style></head>`)
      .replace('<script src="logic.js"><\/script>', `<script>${js}<\/script>`)
  ], {type: 'text/html'});

  const url = URL.createObjectURL(blob);
  const frame = document.getElementById("preview-frame");
  frame.src = url;

  // update url bar
  const title = document.getElementById("game-title").value
    .toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-_]/g,"");
  document.getElementById("chrome-url").textContent = `codearena.io/preview/${title}`;
}

/* ══════════════════════════════════════════════
   TABS
══════════════════════════════════════════════ */
document.querySelectorAll(".editor-tab").forEach(tab => {
  tab.addEventListener("click", (e) => {
    if (e.target.classList.contains("tab-close")) return;
    loadFile(tab.dataset.file);
  });
});

/* ══════════════════════════════════════════════
   PANEL TABS
══════════════════════════════════════════════ */
document.querySelectorAll(".panel-tab").forEach(t => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".panel-tab").forEach(x => x.classList.remove("active"));
    document.querySelectorAll(".panel-pane").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    document.getElementById("pane-" + t.dataset.tab).classList.add("active");
  });
});

/* ══════════════════════════════════════════════
   DIFFICULTY
══════════════════════════════════════════════ */
document.querySelectorAll(".diff-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    showToast(`Difficulty set to ${this.dataset.d}`, "info");
  });
});

/* ══════════════════════════════════════════════
   LANG TAGS
══════════════════════════════════════════════ */
document.querySelectorAll(".lang-tag").forEach(tag => {
  tag.addEventListener("click", function() {
    document.querySelectorAll(".lang-tag").forEach(t => t.classList.remove("active"));
    this.classList.add("active");
    showToast(`Language set to ${this.dataset.lang}`, "info");
  });
});

/* ══════════════════════════════════════════════
   TEMPLATE SELECTOR
══════════════════════════════════════════════ */
document.getElementById("sel-template").addEventListener("change", function() {
  showToast(`Template changed to: ${this.options[this.selectedIndex].text}`, "info");
});

/* ══════════════════════════════════════════════
   TITLE INPUT
══════════════════════════════════════════════ */
document.getElementById("game-title").addEventListener("input", function() {
  document.getElementById("unsaved-dot").classList.add("visible");
  const slug = this.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-_]/g,"");
  document.getElementById("chrome-url").textContent = `codearena.io/preview/${slug}`;
});

/* ══════════════════════════════════════════════
   RUN BUTTON
══════════════════════════════════════════════ */
document.getElementById("btn-run").addEventListener("click", () => {
  updatePreview();
  showToast("▶ Running game…", "ok");
});

/* ══════════════════════════════════════════════
   SAVE DRAFT
══════════════════════════════════════════════ */
document.getElementById("btn-save").addEventListener("click", () => {
  document.getElementById("save-game-name").textContent = document.getElementById("game-title").value;
  openModal("modal-save");
});
document.getElementById("cancel-save").addEventListener("click", () => closeModal("modal-save"));
document.getElementById("confirm-save").addEventListener("click", () => {
  closeModal("modal-save");
  document.getElementById("unsaved-dot").classList.remove("visible");
  showToast("✔ Draft saved successfully", "ok");
});

/* ══════════════════════════════════════════════
   PUBLISH
══════════════════════════════════════════════ */
document.getElementById("btn-publish").addEventListener("click", () => {
  document.getElementById("pub-title").value = document.getElementById("game-title").value;
  openModal("modal-publish");
});
document.getElementById("cancel-publish").addEventListener("click", () => closeModal("modal-publish"));

document.getElementById("confirm-publish").addEventListener("click", () => {
  const btn = document.getElementById("confirm-publish");
  btn.textContent = "⟳ Deploying…";
  btn.disabled = true;

  setTimeout(() => {
    closeModal("modal-publish");
    btn.textContent = "⬆ Deploy to Library";
    btn.disabled = false;

    const title       = (document.getElementById("pub-title").value || document.getElementById("game-title").value).trim() || "Untitled Game";
    const description = document.getElementById("pub-desc").value.trim();
    const slug        = title.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-_]/g,"") + "-" + Math.floor(Math.random()*9000+1000);

    // ── Determine category from sidebar ──
    const catSelect = document.querySelector('.modal-input[data-field="category"]') ||
                      document.querySelectorAll('.modal-input')[2];
    const catVal    = catSelect?.value || 'syntax';
    const catMap    = { 'Syntax Challenge':'syntax','Logic Puzzle':'logic','Speed Coding':'syntax','Debugging':'logic' };
    const category  = catMap[catVal] || 'syntax';

    // ── Active difficulty & language from sidebar ──
    const diffBtn   = document.querySelector('.diff-btn.active');
    const langTag   = document.querySelector('.lang-tag.active');
    const difficulty= diffBtn?.dataset.d  || 'Medium';
    const language  = langTag?.dataset.lang || 'JS';

    // ── Build game record ──
    const gameRecord = {
      id:          'ca_' + Date.now(),
      title,
      description,
      category,
      difficulty,
      language,
      slug,
      publishedAt: new Date().toISOString(),
      code: {
        js:   FILES['logic.js']   || '',
        html: FILES['index.html'] || '',
        css:  FILES['style.css']  || ''
      }
    };

    // ── Save to localStorage ──
    const STORAGE_KEY = 'codearena_published_games';
    let existing = [];
    try { existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { existing = []; }
    existing.push(gameRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    // ── Show success UI ──
    const link = `codearena.io/g/${slug}`;
    document.getElementById("pub-link").textContent  = link;
    document.getElementById("copy-link").dataset.link = link;
    document.getElementById("unsaved-dot").classList.remove("visible");
    openModal("modal-success");
  }, 1800);
});

document.getElementById("close-success").addEventListener("click", () => {
  closeModal("modal-success");
  // Navigate back to the homepage; the ?published flag triggers a banner + auto-scroll
  const title    = document.getElementById("game-title").value || 'Your game';
  const params   = new URLSearchParams({ published: '1', title });
  window.location.href = `../index.html?${params}`;
});

document.getElementById("copy-link").addEventListener("click", function() {
  const link = this.dataset.link || document.getElementById("pub-link").textContent;
  navigator.clipboard.writeText("https://" + link).catch(() => {});
  this.textContent = "Copied!";
  setTimeout(() => this.textContent = "Copy", 2000);
});

/* ══════════════════════════════════════════════
   PREVIEW TOGGLE
══════════════════════════════════════════════ */
let previewVisible = true;
document.getElementById("btn-preview-toggle").addEventListener("click", () => {
  const p = document.getElementById("panel-right");
  previewVisible = !previewVisible;
  p.style.display = previewVisible ? "" : "none";
  document.getElementById("btn-preview-toggle").textContent = previewVisible ? "⟵ Preview" : "⟶ Preview";
});

/* ══════════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════════ */
function openModal(id) {
  document.getElementById(id).classList.add("open");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}
// close on overlay click
document.querySelectorAll(".modal-overlay").forEach(ov => {
  ov.addEventListener("click", (e) => {
    if (e.target === ov) ov.classList.remove("open");
  });
});

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
let toastTimer;
function showToast(msg, type="ok") {
  const t = document.getElementById("toast");
  const icons = { ok:"✔", info:"ℹ", warn:"⚠", error:"✖" };
  document.getElementById("toast-msg").textContent = msg;
  document.getElementById("toast-icon").textContent = icons[type] || "ℹ";
  t.style.borderColor = type==="ok"?"rgba(57,255,94,0.3)":type==="error"?"rgba(255,61,61,0.3)":"rgba(0,229,255,0.3)";
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 3200);
}
function hideToast() {
  document.getElementById("toast").classList.remove("show");
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
loadFile("logic.js");
schedulePreview(true);
