
// ── DOM ──
const wordDisplayEl = document.getElementById("wordDisplay");
const hintVal = document.getElementById("hintVal");
const guessesVal = document.getElementById("guessesVal");
const keyboardEl = document.getElementById("keyboard");
const canvas = document.getElementById("hangmanCanvas");
const ctx = canvas.getContext("2d");
const resultModal = document.getElementById("resultModal");
const modalEmoji = document.getElementById("modalEmoji");
const modalTitle = document.getElementById("modalTitle");
const modalWord = document.getElementById("modalWord");
const seBase = document.getElementById("seBase");
const seTime = document.getElementById("seTime");
const seWrong = document.getElementById("seWrong");
const seTotal = document.getElementById("seTotal");
const lbBtn = document.getElementById("lbBtn");
const lbModal = document.getElementById("lbModal");
const lbClose = document.getElementById("lbClose");
const lbContent = document.getElementById("lbContent");
const lbClearBtn = document.getElementById("lbClearBtn");
const timerFill = document.getElementById("timerFill");
const timerCount = document.getElementById("timerCount");
const liveScore = document.getElementById("liveScore");
const statWins = document.getElementById("statWins");
const statStreak = document.getElementById("statStreak");
const statBest = document.getElementById("statBest");
const diffBadge = document.getElementById("diffBadge");
const langBtns = document.querySelectorAll(".lang-btn");
const diffBtns = document.querySelectorAll(".diff-btn");

// ── DIFFICULTY CONFIG ──
const DIFF = {
    easy: { time: 120, base: 100, timeBonus: 1, wrongPenalty: 8 },
    medium: { time: 60, base: 250, timeBonus: 4, wrongPenalty: 20 },
    hard: { time: 30, base: 500, timeBonus: 12, wrongPenalty: 40 }
};

// ── QUESTIONS ──
const questions = {
    html: [
        { word: "element", hint: "Basic building block of HTML" },
        { word: "attribute", hint: "Provides extra information about tags" },
        { word: "div", hint: "Generic HTML container element" },
        { word: "semantic", hint: "Tags that describe meaning like header/footer" },
        { word: "anchor", hint: "Tag used to create hyperlinks" },
        { word: "viewport", hint: "Meta tag for responsive design" },
        { word: "doctype", hint: "Declaration at the top of every HTML file" },
        { word: "form", hint: "Container for user input elements" }
    ],
    css: [
        { word: "selector", hint: "Targets elements for styling" },
        { word: "flexbox", hint: "Layout system for rows and columns" },
        { word: "grid", hint: "Two-dimensional layout system" },
        { word: "margin", hint: "Space outside an element" },
        { word: "padding", hint: "Space inside an element" },
        { word: "cascade", hint: "The C in CSS — rules flow downward" },
        { word: "specificity", hint: "Determines which CSS rule wins" },
        { word: "animation", hint: "Keyframe-based motion in CSS" }
    ],
    javascript: [
        { word: "function", hint: "Reusable block of code" },
        { word: "variable", hint: "Stores data values" },
        { word: "callback", hint: "Function passed into another function" },
        { word: "promise", hint: "Handles async operations" },
        { word: "closure", hint: "Function retaining its outer scope" },
        { word: "hoisting", hint: "Declarations moved to top of scope" },
        { word: "prototype", hint: "Mechanism for inheritance in JS" },
        { word: "event", hint: "User interaction handled by listeners" }
    ],
    cpp: [
        { word: "pointer", hint: "Stores a memory address" },
        { word: "class", hint: "Blueprint for objects" },
        { word: "object", hint: "Instance of a class" },
        { word: "inheritance", hint: "Child class inherits parent properties" },
        { word: "template", hint: "Generic programming mechanism in C++" },
        { word: "vector", hint: "Dynamic array from the STL" },
        { word: "iterator", hint: "Object to traverse containers" },
        { word: "namespace", hint: "Avoids naming conflicts in large projects" }
    ]
};

// ── STATE ──
let currentWord = "", wrongGuessCount = 0, correctGuessCount = 0;
let currentCategory = null, currentDiff = null, gameStarted = false;
let timerInterval = null, timeLeft = 0, totalTime = 0;
let sessionScore = 0, sessionWins = 0, sessionStreak = 0, sessionBest = 0;
const maxGuesses = 6;

// ── DRAW HANGMAN (neon canvas) ──
function drawHangman(step) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gallows — cyan
    ctx.strokeStyle = "#00ffff"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.shadowColor = "#00ffff"; ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(10, 210); ctx.lineTo(160, 210);
    ctx.moveTo(50, 210); ctx.lineTo(50, 18);
    ctx.moveTo(50, 18); ctx.lineTo(130, 18);
    ctx.moveTo(130, 18); ctx.lineTo(130, 46);
    ctx.stroke();

    if (step < 1) { ctx.shadowBlur = 0; return; }
    ctx.strokeStyle = "#ccff00"; ctx.shadowColor = "#ccff00"; ctx.shadowBlur = 10; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(130, 66, 20, 0, Math.PI * 2); ctx.stroke(); // head

    if (step < 2) { ctx.shadowBlur = 0; return; }
    ctx.beginPath(); ctx.moveTo(130, 86); ctx.lineTo(130, 148); ctx.stroke(); // body

    if (step < 3) { ctx.shadowBlur = 0; return; }
    ctx.beginPath(); ctx.moveTo(130, 102); ctx.lineTo(100, 132); ctx.stroke(); // L arm

    if (step < 4) { ctx.shadowBlur = 0; return; }
    ctx.beginPath(); ctx.moveTo(130, 102); ctx.lineTo(160, 132); ctx.stroke(); // R arm

    if (step < 5) { ctx.shadowBlur = 0; return; }
    ctx.strokeStyle = "#ff4444"; ctx.shadowColor = "#ff4444"; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(130, 148); ctx.lineTo(105, 188); ctx.stroke(); // L leg

    if (step < 6) { ctx.shadowBlur = 0; return; }
    ctx.beginPath(); ctx.moveTo(130, 148); ctx.lineTo(155, 188); ctx.stroke(); // R leg
    ctx.shadowBlur = 0;
}

// ── TIMER ──
function startTimer(seconds) {
    clearInterval(timerInterval);
    timeLeft = totalTime = seconds;
    updateTimerUI();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) { clearInterval(timerInterval); onTimeout(); }
    }, 1000);
}
function stopTimer() { clearInterval(timerInterval); }
function updateTimerUI() {
    timerCount.textContent = timeLeft + "s";
    const pct = totalTime > 0 ? (timeLeft / totalTime) * 100 : 100;
    timerFill.style.width = pct + "%";
    [timerFill, timerCount].forEach(el => el.classList.remove("warn", "danger"));
    if (timeLeft <= 10) {
        [timerFill, timerCount].forEach(el => el.classList.add("danger"));
    } else if (timeLeft <= Math.floor(totalTime * 0.35)) {
        [timerFill, timerCount].forEach(el => el.classList.add("warn"));
    }
}
function onTimeout() {
    gameStarted = false;
    setKeyboardDisabled(true, false);
    [...currentWord].forEach((letter, i) => {
        if (wordDisplayEl.children[i]) {
            wordDisplayEl.children[i].textContent = letter;
            wordDisplayEl.children[i].classList.add("guessed", "wrong-reveal");
        }
    });
    showResultModal(false, true);
}

// ── KEYBOARD HELPERS ──
function setKeyboardDisabled(disabled, resetStyles = true) {
    keyboardEl.querySelectorAll("button").forEach(btn => {
        btn.disabled = disabled;
        if (resetStyles) btn.classList.remove("used", "correct-key", "wrong-key");
        else if (disabled) btn.classList.add("used");
    });
}

// ── SCORE CALC ──
function calculateScore() {
    const cfg = DIFF[currentDiff];
    const base = cfg.base;
    const tBonus = timeLeft * cfg.timeBonus;
    const penalty = wrongGuessCount * cfg.wrongPenalty;
    const total = Math.max(base + tBonus - penalty, 5);
    return { base, tBonus, penalty, total };
}

// ── RESULT MODAL ──
function showResultModal(isWin, isTimeout = false) {
    stopTimer();
    setKeyboardDisabled(true, false);

    if (isWin) {
        const { base, tBonus, penalty, total } = calculateScore();
        modalEmoji.textContent = "🏆";
        modalTitle.textContent = "You Won!";
        modalTitle.className = "modal-title win";
        seBase.textContent = base + " pts";
        seTime.textContent = "+" + tBonus + " pts";
        seWrong.textContent = "-" + penalty + " pts";
        seTotal.textContent = total + " pts";
        document.getElementById("scoreBlock").style.display = "";
        sessionScore += total;
        sessionWins++;
        sessionStreak++;
        if (total > sessionBest) sessionBest = total;
        updateSessionUI();
        saveScore({ score: total, category: currentCategory, difficulty: currentDiff, word: currentWord });
    } else if (isTimeout) {
        modalEmoji.textContent = "⏰";
        modalTitle.textContent = "Time's Up!";
        modalTitle.className = "modal-title timeout";
        document.getElementById("scoreBlock").style.display = "none";
        sessionStreak = 0;
        updateSessionUI();
    } else {
        modalEmoji.textContent = "💀";
        modalTitle.textContent = "Game Over!";
        modalTitle.className = "modal-title lose";
        document.getElementById("scoreBlock").style.display = "none";
        sessionStreak = 0;
        updateSessionUI();
    }

    modalWord.textContent = currentWord.toUpperCase();
    resultModal.classList.add("show");
}

function updateSessionUI() {
    liveScore.textContent = sessionScore;
    statWins.textContent = sessionWins;
    statStreak.textContent = sessionStreak;
    statBest.textContent = sessionBest;
}

// ── START GAME ──
function startGame() {
    if (!currentCategory || !currentDiff) return;
    gameStarted = true;
    wrongGuessCount = correctGuessCount = 0;
    resultModal.classList.remove("show");

    const pool = questions[currentCategory];
    const q = pool[Math.floor(Math.random() * pool.length)];
    currentWord = q.word;

    hintVal.textContent = q.hint;
    guessesVal.textContent = `0 / ${maxGuesses}`;
    drawHangman(0);

    wordDisplayEl.innerHTML = "";
    for (let i = 0; i < currentWord.length; i++) {
        const li = document.createElement("li");
        li.classList.add("letter");
        wordDisplayEl.appendChild(li);
    }

    setKeyboardDisabled(false, true);
    startTimer(DIFF[currentDiff].time);
}

// ── HANDLE GUESS ──
function handleGuess(button) {
    if (!gameStarted) return;
    const letter = button.textContent.trim().toLowerCase(); // BUG FIX: textContent lowercase
    button.disabled = true;

    let found = false;
    [...currentWord].forEach((l, i) => {
        if (l === letter) {
            found = true;
            const li = wordDisplayEl.children[i];
            li.textContent = l;
            li.classList.add("guessed", "letter-correct-anim");
            correctGuessCount++;
        }
    });

    if (found) {
        button.classList.add("correct-key", "used");
    } else {
        button.classList.add("wrong-key", "used");
        wrongGuessCount++;
        drawHangman(wrongGuessCount);
    }

    guessesVal.textContent = `${wrongGuessCount} / ${maxGuesses}`;
    checkGameStatus();
}

// ── GAME STATUS ──
function checkGameStatus() {
    if (wrongGuessCount === maxGuesses) {
        gameStarted = false;
        [...currentWord].forEach((letter, i) => {
            const li = wordDisplayEl.children[i];
            if (!li.classList.contains("guessed")) {
                li.textContent = letter;
                li.classList.add("guessed", "wrong-reveal");
            }
        });
        showResultModal(false, false);
        return;
    }
    if (correctGuessCount === currentWord.length) {
        gameStarted = false;
        showResultModal(true);
    }
}

// ── LOCALSTORAGE ──
const LS_KEY = "codearena_hangman_scores";
function saveScore(entry) {
    let scores = [];
    try { scores = JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch {}
    const _u = (() => { try { return JSON.parse(localStorage.getItem('codearena_user')); } catch { return null; } })();
    scores.push({ ...entry, date: new Date().toLocaleDateString(), isoDate: new Date().toISOString(), player: _u?.name || _u?.email || 'Anonymous' });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(50);
    localStorage.setItem(LS_KEY, JSON.stringify(scores));
}
function loadScores() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
}

// ── LEADERBOARD RENDER ──
function renderLeaderboard() {
    const scores = loadScores();
    if (!scores.length) {
        lbContent.innerHTML = `<div class="lb-empty">No scores yet — win a game to appear here! 🎮</div>`;
        return;
    }
    const rows = scores.slice(0, 10).map((s, i) => {
        const rankHtml = i < 3 ? `<span class="rank-medal">${["🥇", "🥈", "🥉"][i]}</span>` : `<span class="rank-num">#${i + 1}</span>`;
        const scoreClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "normal";
        return `<tr>
        <td>${rankHtml}</td>
        <td style="font-weight:700;color:var(--cyan);text-transform:uppercase;letter-spacing:.05em">${s.word}</td>
        <td><span class="cat-tag">${s.category}</span></td>
        <td><span class="diff-pip ${s.difficulty}">${s.difficulty}</span></td>
        <td style="color:var(--muted);font-size:.78rem">${s.date}</td>
        <td class="lb-score ${scoreClass}">${s.score}</td>
      </tr>`;
    }).join("");
    lbContent.innerHTML = `
      <table class="lb-table">
        <thead><tr>
          <th>Rank</th><th>Word</th><th>Category</th>
          <th>Difficulty</th><th>Date</th><th style="text-align:right">Score</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-size:.72rem;color:var(--muted);text-align:center;margin-top:14px">
        Top 10 of ${scores.length} score${scores.length !== 1 ? "s" : ""} · Full leaderboard page coming soon!
      </p>`;
}

// ── EVENTS ──

// Keyboard buttons
keyboardEl.querySelectorAll("button").forEach(btn =>
    btn.addEventListener("click", () => handleGuess(btn))
);

// Category buttons
langBtns.forEach(btn => btn.addEventListener("click", () => {
    langBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.lang;
    if (currentDiff) startGame();
}));

// Difficulty buttons
diffBtns.forEach(btn => btn.addEventListener("click", () => {
    diffBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentDiff = btn.dataset.diff;
    diffBadge.textContent = currentDiff[0].toUpperCase() + currentDiff.slice(1);
    diffBadge.className = `diff-badge show ${currentDiff}`;
    if (currentCategory) startGame();
}));

// Play Again
document.querySelectorAll(".play-again-btn").forEach(btn =>
    btn.addEventListener("click", () => {
        resultModal.classList.remove("show");
        startGame();
    })
);


// Close result on backdrop
resultModal.addEventListener("click", e => {
    if (e.target === resultModal) resultModal.classList.remove("show");
});

// Physical keyboard support
document.addEventListener("keydown", e => {
    if (!gameStarted) return;
    const key = e.key.toLowerCase();
    if (!/^[a-z]$/.test(key)) return;
    const btn = [...keyboardEl.querySelectorAll("button")]
        .find(b => b.textContent.trim().toLowerCase() === key && !b.disabled);
    if (btn) handleGuess(btn);
});

// Init
drawHangman(0);
timerCount.textContent = "—";
timerFill.style.width = "100%";



