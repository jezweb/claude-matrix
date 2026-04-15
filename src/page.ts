// Content inlined at build time from content.yaml
// To update: edit content.yaml and run `node build.mjs`

interface Line { text: string; type: string; }
interface Tab { label: string; project: string; duration: number; lines: Line[]; }
interface Content { tabs: Tab[]; }

export function generateHtml(content: Content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Claude Code // The Matrix</title>
<meta name="description" content="What people see when they watch you use Claude Code">
<style>
  :root {
    --bg: #1a1b26;
    --bg-tool: #1e2030;
    --bg-user: #1e2030;
    --border: #2a2b3d;
    --text: #c0caf5;
    --text-dim: #565f89;
    --text-muted: #3b3f54;
    --green: #9ece6a;
    --green-bright: #73daca;
    --red: #f7768e;
    --yellow: #e0af68;
    --blue: #7aa2f7;
    --cyan: #7dcfff;
    --purple: #bb9af7;
    --orange: #ff9e64;
    --diff-add-bg: #1a2e1a;
    --diff-add: #9ece6a;
    --diff-del-bg: #2e1a1a;
    --diff-del: #f7768e;
    --tool-green: #41a86e;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Menlo', 'Monaco', 'SF Mono', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    overflow: hidden;
    height: 100vh;
  }

  .shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  /* ── Tabs ── */
  .tabs {
    display: flex;
    background: #15161e;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    flex-shrink: 0;
  }

  .tab {
    padding: 8px 20px;
    font-size: 12px;
    color: var(--text-dim);
    background: #15161e;
    border-right: 1px solid var(--border);
    white-space: nowrap;
    cursor: default;
    transition: color 0.15s, background 0.15s;
  }

  .tab.active {
    color: var(--text);
    background: var(--bg);
    border-bottom: 2px solid var(--tool-green);
  }

  /* ── Scrollable content ── */
  .content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px 20px 60px;
  }

  .content::-webkit-scrollbar { width: 5px; }
  .content::-webkit-scrollbar-track { background: transparent; }
  .content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* ── Line base ── */
  .ln {
    white-space: pre-wrap;
    word-break: break-word;
    min-height: 1.5em;
    opacity: 0;
    animation: show 0.08s ease-out forwards;
  }

  @keyframes show {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ── User prompt ── */
  .ln-user {
    color: var(--text);
    padding: 8px 14px;
    margin: 6px 0;
    background: var(--bg-user);
    border-left: 3px solid var(--blue);
    border-radius: 3px;
  }

  .ln-user::before {
    content: '> ';
    color: var(--blue);
    font-weight: bold;
  }

  /* ── Thinking ── */
  .ln-thinking {
    color: var(--text-dim);
    font-style: italic;
    padding: 2px 0 2px 8px;
  }

  /* ── Tool call header — the key visual ── */
  .ln-tool {
    margin-top: 8px;
    padding: 5px 12px;
    color: var(--text);
    font-size: 13px;
    border-radius: 3px;
  }

  .ln-tool::before {
    content: '● ';
    color: var(--tool-green);
    font-weight: bold;
  }

  /* ── Code (Read output) ── */
  .ln-code {
    color: var(--text);
    padding: 0 0 0 16px;
    font-size: 13px;
  }

  /* ── Diff lines ── */
  .ln-diff-hunk {
    color: var(--cyan);
    padding: 2px 16px;
    margin-top: 4px;
    font-size: 13px;
  }

  .ln-diff-ctx {
    color: var(--text-dim);
    padding: 0 16px;
    font-size: 13px;
  }

  .ln-diff-add {
    color: var(--diff-add);
    background: var(--diff-add-bg);
    padding: 0 16px;
    font-size: 13px;
    display: block;
  }

  .ln-diff-del {
    color: var(--diff-del);
    background: var(--diff-del-bg);
    padding: 0 16px;
    font-size: 13px;
    display: block;
  }

  /* ── Output / terminal ── */
  .ln-output {
    color: var(--text-dim);
    padding: 0 16px;
  }

  .ln-path {
    color: var(--blue);
    padding: 2px 16px;
    font-weight: 600;
    margin-top: 2px;
  }

  .ln-success {
    color: var(--green);
    padding: 0 16px;
  }

  .ln-error {
    color: var(--red);
    padding: 0 16px;
  }

  .ln-warning {
    color: var(--yellow);
    padding: 0 8px;
  }

  .ln-dim {
    color: var(--text-dim);
    padding: 0 16px;
  }

  .ln-blank { min-height: 0.6em; }

  /* ── Response text ── */
  .ln-response {
    color: var(--text);
    padding: 2px 0;
    line-height: 1.65;
  }

  /* Bold in responses */
  .md-bold { font-weight: bold; color: #dce4f5; }

  /* ── Syntax highlighting ── */
  .s-kw { color: var(--purple); }
  .s-ty { color: var(--cyan); }
  .s-str { color: var(--green); }
  .s-num { color: var(--orange); }
  .s-cmt { color: var(--text-dim); font-style: italic; }
  .s-ln { color: var(--text-muted); }

  /* ── Status bar ── */
  .status-bar {
    background: #15161e;
    padding: 5px 16px;
    font-size: 11px;
    color: var(--text-dim);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }

  .bricks {
    display: inline-flex;
    gap: 1px;
    margin: 0 6px;
    vertical-align: middle;
  }

  .bk {
    display: inline-block;
    width: 7px;
    height: 11px;
    background: var(--border);
    transition: background 0.5s;
  }

  .bk.on { background: var(--green); }
  .bk.wn { background: var(--yellow); }
  .bk.dg { background: var(--red); }

  /* ── Prompt input at bottom ── */
  .input-bar {
    background: #15161e;
    border-top: 1px solid var(--border);
    padding: 8px 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
  }

  .input-bar .chevron {
    color: var(--tool-green);
    font-weight: bold;
    font-size: 15px;
  }

  .input-bar .input-text {
    color: var(--text);
    flex: 1;
  }

  .cursor-blink {
    display: inline-block;
    width: 8px;
    height: 16px;
    background: var(--text);
    animation: blink 1s step-end infinite;
    vertical-align: text-bottom;
  }

  @keyframes blink { 50% { opacity: 0; } }

  /* ── Title overlay ── */
  .title-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    background: rgba(26, 27, 38, 0.95);
    opacity: 0;
    pointer-events: none;
    transition: opacity 1.5s ease-in;
  }

  .title-overlay.vis { opacity: 1; }
  .title-overlay.out { opacity: 0; transition: opacity 2s ease-out; }

  .title-overlay h1 {
    font-size: clamp(2rem, 6vw, 5rem);
    color: var(--tool-green);
    text-shadow: 0 0 20px rgba(65, 168, 110, 0.4);
    letter-spacing: 0.25em;
    font-weight: 300;
  }

  .title-overlay .sub {
    font-size: clamp(0.85rem, 1.5vw, 1.3rem);
    color: var(--text-dim);
    letter-spacing: 0.1em;
  }
</style>
</head>
<body>

<div class="title-overlay" id="tov">
  <h1>CLAUDE CODE</h1>
  <div class="sub">what they see when you're building</div>
</div>

<div class="shell">
  <div class="tabs" id="tabs"></div>
  <div class="content" id="out"></div>

  <div class="input-bar">
    <span class="chevron">&gt;</span>
    <span class="input-text" id="input-text"></span>
    <span class="cursor-blink"></span>
  </div>

  <div class="status-bar">
    <span><span style="color:var(--tool-green);">&#9679;</span> Opus 4.6 &middot; <span id="sl-proj">app</span>:main</span>
    <span><span class="bricks" id="bricks"></span><span id="bp">12%</span> &middot; <span id="bf">88k free</span></span>
    <span><span id="bc">$2.16</span> &middot; <span id="bd">0:42</span></span>
  </div>
</div>

<script>
const C = ${JSON.stringify(content)};

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Syntax highlight code lines (Read output)
// Uses a single-pass tokenizer to avoid regex chains corrupting HTML
function syn(raw) {
  if (!raw || !raw.trim()) return '\\u00A0';

  const KW = /^(import|export|from|const|let|var|function|async|await|return|if|else|try|catch|throw|new|typeof|interface|type|default|switch|case|break|for|of|in)$/;
  const TY = /^(string|number|boolean|null|undefined|any|void|D1Database|R2Bucket|KVNamespace|Ai|Env|Context|Response|Request|Promise|Record|EventHandler)$/;

  // Tokenize with a single regex — order matters (first match wins)
  const TOKEN = /(\\/{2}.*$)|('[^']*'|"[^"]*"|\\x60[^\\x60]*\\x60)|(\\b\\d+\\.?\\d*\\b)|(\\b[a-zA-Z_][a-zA-Z0-9_]*\\b)|(\\s*\\d+\\t)|([^a-zA-Z0-9_'"\\x60\\/]+)/gm;

  let result = '';
  let m;
  let lastIndex = 0;

  // Handle line number prefix first
  const lnMatch = raw.match(/^(\\s*\\d+\\t)/);
  let startFrom = 0;
  if (lnMatch) {
    result += '<span class="s-ln">' + esc(lnMatch[1]) + '</span>';
    startFrom = lnMatch[1].length;
  }

  const rest = raw.slice(startFrom);

  // Simple char-by-char tokenizer for the rest
  let i = 0;
  while (i < rest.length) {
    // Comment
    if (rest[i] === '/' && rest[i+1] === '/') {
      result += '<span class="s-cmt">' + esc(rest.slice(i)) + '</span>';
      break;
    }
    // String (single or double quote)
    if (rest[i] === "'" || rest[i] === '"') {
      const q = rest[i];
      let j = i + 1;
      while (j < rest.length && rest[j] !== q) j++;
      j++; // include closing quote
      result += '<span class="s-str">' + esc(rest.slice(i, j)) + '</span>';
      i = j;
      continue;
    }
    // Backtick string
    if (rest.charCodeAt(i) === 96) {
      let j = i + 1;
      while (j < rest.length && rest.charCodeAt(j) !== 96) j++;
      j++;
      result += '<span class="s-str">' + esc(rest.slice(i, j)) + '</span>';
      i = j;
      continue;
    }
    // Word (identifier, keyword, type)
    if (/[a-zA-Z_]/.test(rest[i])) {
      let j = i;
      while (j < rest.length && /[a-zA-Z0-9_]/.test(rest[j])) j++;
      const word = rest.slice(i, j);
      if (KW.test(word)) result += '<span class="s-kw">' + word + '</span>';
      else if (TY.test(word)) result += '<span class="s-ty">' + word + '</span>';
      else result += esc(word);
      i = j;
      continue;
    }
    // Number
    if (/\\d/.test(rest[i])) {
      let j = i;
      while (j < rest.length && /[\\d.]/.test(rest[j])) j++;
      result += '<span class="s-num">' + esc(rest.slice(i, j)) + '</span>';
      i = j;
      continue;
    }
    // Other chars (operators, punctuation, whitespace)
    result += esc(rest[i]);
    i++;
  }

  return result;
}

// Simple markdown bold for responses
function mdBold(raw) {
  let s = esc(raw);
  s = s.replace(/\\*\\*([^*]+)\\*\\*/g, '<span class="md-bold">$1</span>');
  s = s.replace(/\\x60([^\\x60]+)\\x60/g, '<span class="s-str">$1</span>');
  return s;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// DOM
const tabsEl = document.getElementById('tabs');
const out = document.getElementById('out');
const inputText = document.getElementById('input-text');
const slProj = document.getElementById('sl-proj');

// Build tabs
C.tabs.forEach((t, i) => {
  const el = document.createElement('div');
  el.className = 'tab';
  el.textContent = t.label;
  tabsEl.appendChild(el);
});

function setTab(i) {
  tabsEl.querySelectorAll('.tab').forEach((el, j) => el.classList.toggle('active', j === i));
  slProj.textContent = C.tabs[i].label;
}

// Render a line
function addLine(type, text) {
  const div = document.createElement('div');
  div.className = 'ln ln-' + type;

  // innerHTML safe: all content from our own YAML config, no user input
  if (type === 'code') {
    div.innerHTML = syn(text);
  } else if (type === 'response') {
    div.innerHTML = mdBold(text);
  } else if (type === 'tool') {
    div.textContent = text;
  } else if (type === 'blank') {
    div.innerHTML = '\\u00A0';
  } else {
    div.textContent = text;
  }

  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
}

// Timing — varies per type with organic randomness
function delay(type, prevType) {
  // After a tool call, add a "processing" pause
  const toolPause = prevType === 'tool' ? 200 + Math.random() * 400 : 0;

  let base;
  switch (type) {
    case 'user': base = 500; break;
    case 'thinking': base = 60 + Math.random() * 180; break; // variable — sometimes fast, sometimes slow
    case 'tool': base = 300 + Math.random() * 300; break; // pause before each tool call
    case 'blank': base = 40 + Math.random() * 40; break;
    case 'response': base = 30 + Math.random() * 50; break;
    case 'code': base = 15 + Math.random() * 20; break; // fast — dumping file contents
    case 'diff-add': case 'diff-del': base = 12 + Math.random() * 15; break;
    case 'diff-hunk': base = 80; break; // slight pause at hunk headers
    case 'diff-ctx': base = 10; break;
    case 'success': base = 60 + Math.random() * 40; break;
    case 'error': base = 100; break;
    case 'output': case 'dim': base = 25 + Math.random() * 25; break;
    default: base = 20 + Math.random() * 25;
  }

  // Occasional random "thinking" micro-pauses (like the model is processing)
  const microPause = Math.random() < 0.05 ? 300 + Math.random() * 500 : 0;

  return base + toolPause + microPause;
}

// Shuffle array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Play a single tab
async function playTab(i) {
  const tab = C.tabs[i];
  setTab(i);
  out.textContent = '';

  // Type the user prompt into the input bar
  const userLine = tab.lines.find(l => l.type === 'user');
  if (userLine) {
    inputText.textContent = '';
    // Variable typing speed — starts slow, speeds up mid-word, pauses between words
    for (let c = 0; c < userLine.text.length; c++) {
      inputText.textContent = userLine.text.slice(0, c + 1);
      const ch = userLine.text[c];
      const isSpace = ch === ' ';
      await sleep(isSpace ? 40 + Math.random() * 80 : 12 + Math.random() * 30);
    }
    await sleep(300 + Math.random() * 200);
    inputText.textContent = '';
  }

  // Render lines with organic timing
  let prevType = '';
  for (const line of tab.lines) {
    addLine(line.type, line.text);
    await sleep(delay(line.type, prevType));
    prevType = line.type;
  }

  // Brief hold at end — just enough to read the final response
  await sleep(tab.duration + Math.random() * 1000);
}

// Main loop — randomised tab order, never same tab twice in a row
async function loop() {
  let lastTab = -1;

  while (true) {
    // Create a shuffled order, but never repeat the last tab
    let order = shuffle(C.tabs.map((_, i) => i));
    if (order[0] === lastTab) {
      // Swap first with a random other position
      const swapIdx = 1 + Math.floor(Math.random() * (order.length - 1));
      [order[0], order[swapIdx]] = [order[swapIdx], order[0]];
    }

    for (const tabIdx of order) {
      await playTab(tabIdx);
      lastTab = tabIdx;
    }
  }
}

// Title
const tov = document.getElementById('tov');
setTimeout(() => tov.classList.add('vis'), 300);
setTimeout(() => tov.classList.add('out'), 4000);
setTimeout(() => { tov.style.display = 'none'; loop(); }, 6000);

// Context bricks
const bricksEl = document.getElementById('bricks');
const bpEl = document.getElementById('bp');
const bfEl = document.getElementById('bf');
const bcEl = document.getElementById('bc');
const bdEl = document.getElementById('bd');

for (let i = 0; i < 10; i++) {
  const b = document.createElement('span');
  b.className = 'bk';
  bricksEl.appendChild(b);
}

let pct = 8, cost = 1.2;
const t0 = Date.now();

setInterval(() => {
  pct = Math.min(98, pct + 0.15 + Math.random() * 0.5);
  cost += 0.01 + Math.random() * 0.03;
  const el = Math.floor((Date.now() - t0) / 1000);
  const n = Math.floor(pct / 10);

  bricksEl.querySelectorAll('.bk').forEach((b, i) => {
    b.classList.remove('on', 'wn', 'dg');
    if (i < n) b.classList.add(pct > 85 ? 'dg' : pct > 65 ? 'wn' : 'on');
  });

  bpEl.textContent = Math.floor(pct) + '%';
  bfEl.textContent = Math.max(1, Math.floor((100 - pct) * 10)) + 'k free';
  bcEl.textContent = '$' + cost.toFixed(2);
  bdEl.textContent = Math.floor(el / 60) + ':' + String(el % 60).padStart(2, '0');
}, 3000);
</script>
</body>
</html>`;
}
