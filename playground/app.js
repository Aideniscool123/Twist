import { Machine } from "../src/runtime/machine.js";
import { TwistRuntimeError } from "../src/runtime/errors.js";
import { formatValue, typeOf } from "../src/runtime/values.js";
import { HIGHEST_MOOD, LOWEST_MOOD } from "../src/runtime/mood.js";
import { validateProgram } from "../src/language/validate.js";
import { INSTRUCTIONS, Category } from "../src/language/instructions.js";
import { sass } from "../src/language/sass.js";
import { escapeHtml, highlightProgram } from "./highlight.js";
import { EXAMPLES } from "./examples.js";

const $ = (id) => document.getElementById(id);

const els = {
  source: $("source"),
  highlight: $("highlight"),
  gutter: $("gutter"),
  currentLine: $("current-line"),
  problems: $("problems"),
  checkStatus: $("check-status"),
  runStatus: $("run-status"),
  output: $("output"),
  input: $("input"),
  cells: $("cells"),
  mood: $("mood"),
  moodFace: $("mood-face"),
  moodName: $("mood-name"),
  moodLevel: $("mood-level"),
  direction: $("direction"),
  steps: $("steps"),
  calls: $("calls"),
  jumps: $("jumps"),
  swaps: $("swaps"),
  run: $("run"),
  play: $("play"),
  step: $("step"),
  stop: $("stop"),
  reset: $("reset"),
  calm: $("calm"),
  seed: $("seed"),
  speed: $("speed"),
  examples: $("examples"),
  theme: $("theme"),
  share: $("share"),
  reference: $("reference"),
  referenceToggle: $("reference-toggle"),
  referenceClose: $("reference-close"),
  referenceSearch: $("reference-search"),
  referenceBody: $("reference-body"),
  toast: $("toast"),
};

const FACES = { [-3]: "🤬", [-2]: "😡", [-1]: "😒", 0: "😎", 1: "🙂", 2: "😄", 3: "🤩" };
const STORAGE_KEY = "twist-program";
const MAX_STEPS = 1_000_000;
const STEPS_PER_FRAME = 20_000;

const state = {
  machine: null,
  check: null,
  timer: null,
  lastCells: new Map(),
  lastMood: 0,
  finished: false,
};

function storage(action, key, value) {
  try {
    if (action === "get") return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch {
  }
  return null;
}

let toastTimer;
function toast(text) {
  els.toast.textContent = text;
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.hidden = true;
  }, 2200);
}

function setPill(el, text, kind = "") {
  el.textContent = text;
  el.className = `pill ${kind}`.trim();
}

function lineHeight() {
  return parseFloat(getComputedStyle(els.source).lineHeight) || 22;
}

function syncScroll() {
  const { scrollTop, scrollLeft } = els.source;
  els.highlight.scrollTop = scrollTop;
  els.highlight.scrollLeft = scrollLeft;
  els.gutter.scrollTop = scrollTop;
  placeCurrentLine();
}

function renderEditor() {
  const source = els.source.value;
  els.highlight.innerHTML = `${highlightProgram(source)}<div class="line"> </div>`;
  const count = source.split("\n").length;
  els.gutter.innerHTML = Array.from({ length: count + 1 }, (_, i) => `<div>${i < count ? i + 1 : ""}</div>`).join("");
  markLines();
  syncScroll();
}

function markLines() {
  const errorLines = new Set((state.check?.errors ?? []).map((error) => error.line));
  const current = state.machine && !state.machine.halted ? state.machine.current?.line : undefined;

  [...els.gutter.children].forEach((div, i) => {
    div.classList.toggle("has-error", errorLines.has(i + 1));
    div.classList.toggle("is-current", current === i + 1);
  });
  [...els.highlight.children].forEach((div, i) => div.classList.toggle("has-error", errorLines.has(i + 1)));
  placeCurrentLine();
}

function placeCurrentLine() {
  const line = state.machine && !state.machine.halted ? state.machine.current?.line : undefined;
  if (line === undefined) {
    els.currentLine.hidden = true;
    return;
  }
  els.currentLine.hidden = false;
  els.currentLine.style.top = `${12 + (line - 1) * lineHeight() - els.source.scrollTop}px`;
}

function scrollLineIntoView(line) {
  const top = 12 + (line - 1) * lineHeight();
  const { scrollTop, clientHeight } = els.source;
  if (top < scrollTop + 20 || top > scrollTop + clientHeight - 40) {
    els.source.scrollTop = Math.max(0, top - clientHeight / 2);
  }
}

function goToLine(line) {
  const lines = els.source.value.split("\n");
  const start = lines.slice(0, line - 1).reduce((sum, text) => sum + text.length + 1, 0);
  els.source.focus();
  els.source.setSelectionRange(start, start + (lines[line - 1]?.length ?? 0));
  scrollLineIntoView(line);
  syncScroll();
}

function check() {
  state.check = validateProgram(els.source.value);
  const { ok, errors, instructions } = state.check;
  if (ok) {
    setPill(els.checkStatus, `${instructions.length} instruction${instructions.length === 1 ? "" : "s"} · looks fine`, "good");
  } else {
    setPill(els.checkStatus, `${errors.length} problem${errors.length === 1 ? "" : "s"}`, "bad");
  }
  els.problems.innerHTML = errors
    .slice(0, 8)
    .map((error) => `<li data-line="${error.line}"><b>line ${error.line}</b>${escapeHtml(sass(error.message))}</li>`)
    .join("");
  markLines();
}

let checkTimer;
function onEdit() {
  if (state.machine) stopAndForget();
  renderEditor();
  clearTimeout(checkTimer);
  checkTimer = setTimeout(() => {
    check();
    storage("set", STORAGE_KEY, els.source.value);
  }, 150);
}

function loadSource(text) {
  els.source.value = text.replace(/\r\n/g, "\n");
  stopAndForget();
  renderEditor();
  check();
  storage("set", STORAGE_KEY, els.source.value);
  els.source.scrollTop = 0;
  syncScroll();
}

function onKeyDown(event) {
  if (event.key === "Tab" && !event.shiftKey) {
    event.preventDefault();
    const { selectionStart, selectionEnd, value } = els.source;
    els.source.value = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
    els.source.selectionStart = els.source.selectionEnd = selectionStart + 2;
    onEdit();
  } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    runAll();
  } else if (event.key === "." && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    stepOnce();
  }
}

function appendOutput(text, kind) {
  const atBottom = els.output.scrollHeight - els.output.scrollTop - els.output.clientHeight < 30;
  if (kind) {
    const before = els.output.textContent;
    const span = document.createElement("span");
    span.className = kind;
    const gap = before !== "" && !before.endsWith("\n") ? "\n" : "";
    span.textContent = `${gap}${text}\n`;
    els.output.append(span);
  } else {
    const last = els.output.lastChild;
    if (last && last.nodeType === Node.TEXT_NODE) last.appendData(text);
    else els.output.append(document.createTextNode(text));
  }
  if (atBottom) els.output.scrollTop = els.output.scrollHeight;
}

let pendingOutput = "";
function flushOutput() {
  if (pendingOutput) {
    appendOutput(pendingOutput);
    pendingOutput = "";
  }
}

function inputReader() {
  const lines = els.input.value.split("\n");
  if (lines.at(-1) === "") lines.pop();
  return () => (lines.length > 0 ? lines.shift() : null);
}

function startMachine() {
  check();
  if (!state.check.ok) {
    const first = state.check.errors[0];
    toast(`Fix line ${first.line} first`);
    goToLine(first.line);
    return false;
  }

  els.output.textContent = "";
  state.lastCells = new Map();
  state.finished = false;
  const seedText = els.seed.value.trim();
  state.machine = new Machine(
    { instructions: state.check.instructions, labels: state.check.labels },
    {
      input: inputReader(),
      output: (text) => {
        pendingOutput += text;
      },
      note: (text) => {
        flushOutput();
        appendOutput(text, "note");
      },
      calm: els.calm.checked,
      seed: seedText === "" ? undefined : Number(seedText),
      maxSteps: MAX_STEPS,
    },
  );
  return true;
}

function advance(count) {
  const { machine } = state;
  try {
    for (let i = 0; i < count; i += 1) {
      if (!machine.step()) {
        finish();
        return false;
      }
    }
    return true;
  } catch (error) {
    flushOutput();
    if (!(error instanceof TwistRuntimeError)) throw error;
    appendOutput(`line ${error.line}: ${sass(error.reason)}`, "error");
    finish(error);
    return false;
  } finally {
    flushOutput();
  }
}

function finish(error) {
  flushOutput();
  state.finished = true;
  stopTimer();
  const { steps } = state.machine;
  if (error) setPill(els.runStatus, "crashed", "bad");
  else setPill(els.runStatus, "finished", "good");
  appendOutput(`${error ? "stopped" : "done"} after ${steps.toLocaleString("en-US")} step${steps === 1 ? "" : "s"}`, "done");
  renderState();
}

function stopTimer() {
  if (state.timer !== null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
  updateButtons();
}

function stopAndForget() {
  stopTimer();
  state.machine = null;
  state.finished = false;
  setPill(els.runStatus, "ready");
  renderState();
}

function runAll() {
  stopTimer();
  if (!startMachine()) return;
  setPill(els.runStatus, "running…", "busy");
  const loop = () => {
    if (advance(STEPS_PER_FRAME)) {
      renderState();
      state.timer = setTimeout(loop, 0);
    }
  };
  state.timer = setTimeout(loop, 0);
  updateButtons();
}

function watchDelay() {
  const speed = Number(els.speed.value);
  return Math.round(1000 / 1.9 ** (speed - 1));
}

function watch() {
  stopTimer();
  if (!state.machine || state.finished) {
    if (!startMachine()) return;
  }
  setPill(els.runStatus, "watching…", "busy");
  const tick = () => {
    if (advance(1)) {
      renderState(true);
      state.timer = setTimeout(tick, watchDelay());
    }
  };
  state.timer = setTimeout(tick, 0);
  updateButtons();
}

function stepOnce() {
  stopTimer();
  if (!state.machine || state.finished) {
    if (!startMachine()) return;
    setPill(els.runStatus, "stepping", "busy");
    renderState(true);
    return;
  }
  if (advance(1)) {
    setPill(els.runStatus, "stepping", "busy");
    renderState(true);
  }
}

function stop() {
  stopTimer();
  if (state.machine && !state.finished) {
    setPill(els.runStatus, "paused");
    renderState(true);
  }
}

function updateButtons() {
  const running = state.timer !== null;
  els.stop.disabled = !running;
  els.run.disabled = running;
  els.play.disabled = running;
}

function renderState(follow = false) {
  const machine = state.machine;
  const mood = machine?.mood ?? 0;

  els.moodFace.textContent = FACES[mood];
  els.moodName.textContent = machine?.moodName ?? "chill";
  els.moodLevel.style.left = `${((mood - LOWEST_MOOD) / (HIGHEST_MOOD - LOWEST_MOOD)) * 100}%`;
  if (mood !== state.lastMood) {
    els.mood.classList.remove("changed");
    void els.mood.offsetWidth;
    els.mood.classList.add("changed");
    state.lastMood = mood;
  }

  const up = machine?.direction === -1;
  els.direction.textContent = up ? "↑ up" : "↓ down";
  els.direction.classList.toggle("up", up);
  els.steps.textContent = (machine?.steps ?? 0).toLocaleString("en-US");
  els.calls.textContent = machine?.callStack.length ?? 0;
  els.jumps.textContent = (machine?.jumps ?? 0).toLocaleString("en-US");

  const swaps = machine ? [...machine.swaps.entries()] : [];
  els.swaps.hidden = swaps.length === 0;
  els.swaps.innerHTML = `Swapped: ${swaps.map(([code, job]) => `<code>${code} → ${job}</code>`).join(" ")}`;

  renderCells();
  markLines();
  if (follow && machine && !machine.halted && machine.current) scrollLineIntoView(machine.current.line);
}

function renderCells() {
  const cells = state.machine?.snapshot() ?? [];
  const html = cells.map(([index, value]) => {
    const text = formatValue(value, true);
    const changed = state.lastCells.get(index) !== text;
    return `<div class="cell ${typeOf(value)}${changed ? " flash" : ""}">
      <div class="cell-name"><span>#${index}</span><span class="cell-type">${typeOf(value)}</span></div>
      <div class="cell-value">${escapeHtml(text)}</div>
    </div>`;
  });
  els.cells.innerHTML = html.join("");
  state.lastCells = new Map(cells.map(([index, value]) => [index, formatValue(value, true)]));
}

function renderReference(filter = "") {
  const query = filter.trim().toLowerCase();
  const matches = (instruction) =>
    !query ||
    [instruction.code, instruction.name, instruction.category, instruction.summary].some((text) =>
      text.toLowerCase().includes(query),
    );

  els.referenceBody.innerHTML = Object.values(Category)
    .map((category) => {
      const list = INSTRUCTIONS.filter((instruction) => instruction.category === category && matches(instruction));
      if (list.length === 0) return "";
      return `<h3 class="cat-${category}">${category}</h3>${list
        .map(
          (instruction) => `<div class="instruction" tabindex="0" role="button" data-example="${escapeHtml(instruction.example)}" title="Insert this example">
            <code class="cat-${category}">${instruction.code}</code>
            <span class="name">${escapeHtml(instruction.name)}</span>
            <span class="summary">${escapeHtml(instruction.summary)}</span>
            <span class="example">${escapeHtml(instruction.example)}</span>
          </div>`,
        )
        .join("")}`;
    })
    .join("") || `<p class="hint">Nothing matches. Twist has a lot of instructions, but not that one.</p>`;
}

function toggleReference(open = els.reference.hidden) {
  els.reference.hidden = !open;
  els.referenceToggle.setAttribute("aria-expanded", String(open));
  if (open) els.referenceSearch.focus();
}

function insertExample(example) {
  const { selectionStart, value } = els.source;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEnd = value.indexOf("\n", selectionStart);
  const end = lineEnd === -1 ? value.length : lineEnd;
  const lineIsBlank = value.slice(lineStart, end).trim() === "";
  const insert = lineIsBlank ? example : `\n${example}`;
  const at = lineIsBlank ? lineStart : end;
  els.source.value = value.slice(0, at) + insert + value.slice(lineIsBlank ? end : at);
  const caret = at + insert.length;
  els.source.setSelectionRange(caret, caret);
  els.source.focus();
  onEdit();
  toast(`Added ${example.split(" ")[0]}`);
}

function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (set) return set;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  storage("set", "twist-theme", next);
}

function encodeProgram(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeProgram(code) {
  const binary = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (ch) => ch.charCodeAt(0)));
}

async function share() {
  const url = `${location.origin}${location.pathname}#code=${encodeProgram(els.source.value)}`;
  history.replaceState(null, "", url);
  try {
    await navigator.clipboard.writeText(url);
    toast("Link copied");
  } catch {
    toast("Link is in the address bar");
  }
}

async function loadExample(file) {
  try {
    const response = await fetch(`../examples/${file}`);
    if (!response.ok) throw new Error(response.statusText);
    loadSource(await response.text());
    const example = EXAMPLES.find((item) => item.file === file);
    els.input.value = example?.input ? `${example.input.join("\n")}\n` : "";
    toast(`Loaded ${file}`);
  } catch {
    toast(`Couldn't load ${file}`);
  }
}

const STARTER = `; Welcome to Twist! Press Run (or Ctrl+Enter).
; ps1 prints, ps3 plants a value in a cell, ad1 adds.
ps1 "Counting to 3, the Twist way:"
ps3 #0 1
@loop:
ad3 #0              ; announce cell #0
ad1 #0 1
ps3 #1 #0
gt1 #1 3            ; #1 = 1 once #0 is past 3
jz1 #1 @loop
ty1                 ; be nice to Twist
ps1 "Done! Try the Examples menu, or Instructions."
`;

function init() {
  for (const { file, title } of EXAMPLES) {
    const option = document.createElement("option");
    option.value = file;
    option.textContent = title;
    els.examples.append(option);
  }

  const hash = new URLSearchParams(location.hash.slice(1)).get("code");
  let initial = storage("get", STORAGE_KEY) ?? STARTER;
  if (hash) {
    try {
      initial = decodeProgram(hash);
    } catch {
      toast("That link looks broken");
    }
  }
  loadSource(initial);
  renderReference();
  renderState();
  updateButtons();

  els.source.addEventListener("input", onEdit);
  els.source.addEventListener("scroll", syncScroll);
  els.source.addEventListener("keydown", onKeyDown);
  els.run.addEventListener("click", runAll);
  els.play.addEventListener("click", watch);
  els.step.addEventListener("click", stepOnce);
  els.stop.addEventListener("click", stop);
  els.reset.addEventListener("click", () => {
    stopAndForget();
    els.output.textContent = "";
  });
  els.problems.addEventListener("click", (event) => {
    const item = event.target.closest("li[data-line]");
    if (item) goToLine(Number(item.dataset.line));
  });
  els.examples.addEventListener("change", () => {
    if (els.examples.value) loadExample(els.examples.value);
    els.examples.value = "";
  });
  els.theme.addEventListener("click", toggleTheme);
  els.share.addEventListener("click", share);
  els.referenceToggle.addEventListener("click", () => toggleReference());
  els.referenceClose.addEventListener("click", () => toggleReference(false));
  els.referenceSearch.addEventListener("input", () => renderReference(els.referenceSearch.value));
  els.referenceBody.addEventListener("click", (event) => {
    const item = event.target.closest("[data-example]");
    if (item) insertExample(item.dataset.example);
  });
  els.referenceBody.addEventListener("keydown", (event) => {
    const item = event.target.closest("[data-example]");
    if (item && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      insertExample(item.dataset.example);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.reference.hidden) toggleReference(false);
  });
  window.addEventListener("resize", placeCurrentLine);
}

init();
