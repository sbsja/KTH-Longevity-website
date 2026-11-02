/**
 * Logo motion lab: concept selection, the player (one concept at a time, with a
 * predictable lifecycle: create → play / pause / seek / restart → dispose), the optional
 * "settle into header" ending, presentation modes, shortlist and status messages.
 */
import { Stage } from "./lib/stage.js";
import { concepts, byId } from "./concepts/index.js";

const gsap = window.gsap;
const $ = (sel) => document.querySelector(sel);
const SHORTLIST_KEY = "kthl.logoMotion.shortlist";
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");

const params = new URLSearchParams(location.search);
const state = {
  conceptId: byId[params.get("concept")] ? params.get("concept") : "strands",
  context: params.get("context") === "home" ? "home" : "logo",
  device: params.get("device") === "phone" ? "phone" : "desktop",
  speed: 1,
  still: REDUCED.matches,
  settle: params.get("settle") === "1",
};

const ui = {
  stageEl: $("#stage"),
  region: $("#stage-region"),
  conceptList: $("#concept-list"),
  shortlistNote: $("#shortlist-note"),
  replayOverlay: $("#replay-overlay"),
  stageNote: $("#stage-note"),
  btnReplay: $("#btn-replay"),
  btnToggle: $("#btn-toggle"),
  btnToggleLabel: $("#btn-toggle-label"),
  btnRestart: $("#btn-restart"),
  timeNow: $("#time-now"),
  timeTotal: $("#time-total"),
  scrubber: $("#scrubber"),
  scrubMarks: $("#scrub-marks"),
  speedNote: $("#speed-note"),
  stillToggle: $("#still-toggle"),
  settleToggle: $("#settle-toggle"),
  settleWrap: $("#settle-toggle-wrap"),
  status: $("#status"),
  aboutTitle: $("#about-heading"),
  aboutDuration: $("#about-duration"),
  aboutDesc: $("#about-desc"),
  aboutApproach: $("#about-approach"),
  aboutStrengths: $("#about-strengths"),
  aboutLimits: $("#about-limits"),
  aboutFidelity: $("#about-fidelity"),
};

/* ---------------- shortlist (this browser only) ---------------- */
function readShortlist() {
  try {
    const v = JSON.parse(localStorage.getItem(SHORTLIST_KEY) || "[]");
    return Array.isArray(v) ? v.filter((id) => byId[id]) : [];
  } catch {
    return [];
  }
}
function writeShortlist(ids) {
  try {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable: the toggle still works for this page view */
  }
}
function renderShortlistNote() {
  const ids = readShortlist();
  const names = concepts.filter((c) => ids.includes(c.id)).map((c) => `${c.number} ${c.name}`);
  ui.shortlistNote.textContent = names.length
    ? `Shortlisted: ${names.join(", ")}. Saved in this browser only; the website is not affected.`
    : "Shortlist concepts to compare later. Saved in this browser only; the website is not affected.";
}

/* ---------------- player ---------------- */
class Player {
  constructor(stage) {
    this.stage = stage;
    this.master = null;
    this.instance = null;
    this.concept = null;
    this.token = 0;
    this.introDuration = 0;
    this.loading = false;
  }

  dispose() {
    if (this.master) {
      this.master.kill();
      this.master = null;
    }
    if (this.instance) {
      try {
        this.instance.timeline?.kill();
        this.instance.dispose?.();
      } catch (err) {
        console.warn("dispose failed", err);
      }
      this.instance = null;
    }
  }

  /** Switch to a concept: tear the old one down completely, build the new one, show its still frame. */
  async load(concept) {
    const token = ++this.token;
    this.loading = true;
    this.dispose();
    this.concept = concept;
    const { stage } = this;
    stage.rebuildLogo();
    stage.setLabelsVisible(Boolean(concept.needsLabels));
    stage.setRoute("Route: / (home)");
    const ctx = { gsap, geometry: stage.geometry, device: state.device, context: state.context, forceSvgBeads: params.has("svgbeads") };
    let instance;
    try {
      instance = await concept.create(stage, ctx);
    } catch (err) {
      console.error(`Concept "${concept.id}" failed to initialise`, err);
      setStatus(`Concept ${concept.number} could not start: ${err.message}`);
      this.loading = false;
      return;
    }
    if (token !== this.token) {
      // superseded by a faster switch: discard without touching the stage
      instance.timeline?.kill();
      instance.dispose?.();
      return;
    }
    this.instance = instance;
    const master = gsap.timeline({ paused: true, onUpdate: syncUi, onComplete: syncUi });
    instance.timeline.paused(false);
    master.add(instance.timeline, 0);
    this.introDuration = instance.timeline.duration();
    if (state.settle && state.context === "home") this.addSettle(master, this.introDuration);
    master.timeScale(state.speed);
    this.master = master;
    master.progress(1).pause(); // the still frame: the finished logo
    this.loading = false;
    if (instance.note) setStatus(instance.note);
    onLoaded();
  }

  /** Optional ending: the completed logo moves and scales into the header's logo slot. */
  addSettle(master, at) {
    const { stage } = this;
    const slot = stage.headerSlot();
    const img = stage.headerLogo?.querySelector("img");
    if (!slot || !img) return;
    const { root, place } = stage.logo;
    const scale = slot.height / place.height;
    master.set(img, { opacity: 0 }, 0);
    master.fromTo(
      root,
      { x: 0, y: 0, scale: 1, transformOrigin: "0 0" },
      { x: slot.x - place.x, y: slot.y - place.y, scale, duration: 0.7, ease: "power3.inOut", immediateRender: false },
      Math.max(0, at - 0.05),
    );
    // the header's own image takes over at the end: identical framing, identical pixels
    master.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "none", immediateRender: false }, at + 0.51);
    master.fromTo(root, { opacity: 1 }, { opacity: 0, duration: 0.14, ease: "none", immediateRender: false }, at + 0.51);
  }

  get duration() {
    return this.master ? this.master.duration() : 0;
  }
  get time() {
    return this.master ? this.master.time() : 0;
  }
  get playing() {
    return Boolean(this.master && this.master.isActive());
  }

  replay() {
    this.master?.restart();
  }
  toggle() {
    if (!this.master) return;
    if (this.playing) this.master.pause();
    else if (this.master.progress() >= 1) this.master.restart();
    else this.master.play();
  }
  firstFrame() {
    this.master?.pause(0);
  }
  seek(t) {
    if (!this.master) return;
    this.master.pause();
    this.master.time(Math.min(Math.max(0, t), this.master.duration()));
  }
  setSpeed(s) {
    this.master?.timeScale(s);
  }
  finishNow() {
    this.master?.progress(1).pause();
  }
}

/* ---------------- UI ---------------- */
let stage;
let player;

function setStatus(text) {
  ui.status.textContent = text || "";
}

function fmt(seconds) {
  return seconds.toFixed(2);
}

function syncUi() {
  if (!player?.master) return;
  const t = player.time;
  const total = player.duration;
  ui.scrubber.max = total.toFixed(3);
  ui.scrubber.value = t.toFixed(3);
  ui.scrubber.style.setProperty("--fill", `${total ? (t / total) * 100 : 0}%`);
  ui.scrubber.setAttribute("aria-valuetext", `${fmt(t)} of ${fmt(total)} seconds`);
  ui.timeNow.textContent = fmt(t);
  ui.timeTotal.textContent = fmt(total);
  const playing = player.playing;
  ui.btnToggle.setAttribute("aria-pressed", String(playing));
  ui.btnToggleLabel.textContent = playing ? "Pause" : "Play";
  ui.replayOverlay.hidden = playing;
}

function renderSpeedNote() {
  if (!player?.master) return;
  const intro = player.introDuration;
  const total = player.duration;
  const settleText = total > intro + 0.001 ? ` plus ${fmt(total - intro)} s to settle into the header` : "";
  ui.speedNote.textContent =
    state.speed === 1
      ? `Design duration ${fmt(intro)} s${settleText}. Speed changes playback only, not the design.`
      : `Design duration ${fmt(intro)} s${settleText}. At ${state.speed}× it plays in ${fmt(total / state.speed)} s; the design is unchanged.`;
}

function renderScrubMarks() {
  ui.scrubMarks.replaceChildren();
  if (!player?.master) return;
  const total = player.duration;
  const intro = player.introDuration;
  const mark = (t, label) => {
    const s = document.createElement("span");
    s.style.left = `${(t / total) * 100}%`;
    s.textContent = label;
    ui.scrubMarks.append(s);
  };
  mark(0, "0");
  if (total > intro + 0.001) mark(intro, `${fmt(intro)} intro ends`);
  mark(total, `${fmt(total)} s`);
}

function renderAbout(concept) {
  ui.aboutTitle.textContent = `${concept.number} · ${concept.name}`;
  ui.aboutDuration.textContent = `Intended duration ${concept.duration.toFixed(1)} s${concept.approximated ? " · approximated" : ""}`;
  ui.aboutDesc.textContent = concept.description;
  ui.aboutApproach.textContent = concept.approach;
  ui.aboutStrengths.textContent = concept.strengths;
  ui.aboutLimits.textContent = concept.limitations;
  const f = stage.geometry.fidelity;
  ui.aboutFidelity.textContent =
    `Final frame in every concept: the supplied PNG (lettering and symbol, background made transparent). ` +
    `Animated strokes use a vector trace of the two curves checked against the PNG: mean difference ${f.meanAbsError255} of 255 over the symbol area, ` +
    `${f.pixelsOver16} of ${f.pixelsCompared} pixels differ by more than 16 (anti-aliased edges). The symbol is ${stage.geometry.onTop} over ${stage.geometry.order[0]} at the crossing.`;
}

function renderStageNote() {
  if (state.still) {
    ui.stageNote.hidden = false;
    ui.stageNote.textContent = REDUCED.matches
      ? "Your system prefers reduced motion, so the lab opened on the still preview: the finished logo, no animation. Replay plays the sample on request."
      : "Still preview: the finished logo and no animation, as visitors who prefer reduced motion would see it. Replay plays the sample on request.";
  } else {
    ui.stageNote.hidden = true;
  }
}

function applyStill() {
  renderStageNote();
  const still = state.still;
  ui.scrubber.disabled = still;
  ui.btnRestart.disabled = still;
  for (const r of document.querySelectorAll('input[name="speed"]')) r.disabled = still;
  if (still) player.finishNow();
  syncUi();
}

function onLoaded() {
  ui.scrubber.max = player.duration.toFixed(3);
  renderSpeedNote();
  renderScrubMarks();
  applyStill();
  syncUi();
  updateUrl();
}

function updateUrl() {
  const q = new URLSearchParams();
  q.set("concept", state.conceptId);
  if (state.context === "home") q.set("context", "home");
  if (state.device === "phone") q.set("device", "phone");
  if (state.settle) q.set("settle", "1");
  if (params.has("svgbeads")) q.set("svgbeads", "1");
  history.replaceState(null, "", `?${q}`);
}

function requestMotion() {
  // An explicit Play / Replay in this motion-testing lab may start the sample even under reduced motion.
  if (state.still) {
    state.still = false;
    ui.stillToggle.checked = false;
    applyStill();
    setStatus("Playing on request. Visitors who prefer reduced motion would keep the still frame.");
  }
}

function buildConceptList() {
  const shortlist = readShortlist();
  ui.conceptList.replaceChildren();
  for (const c of concepts) {
    const label = document.createElement("label");
    label.className = "concept" + (c.id === state.conceptId ? " is-selected" : "");
    label.dataset.concept = c.id;
    label.innerHTML = `
      <input class="concept-radio" type="radio" name="concept" value="${c.id}" ${c.id === state.conceptId ? "checked" : ""} aria-describedby="meta-${c.id}" />
      <span class="concept-n" aria-hidden="true">${c.number}</span>
      <span class="concept-name">${c.name}</span>
      <span class="concept-meta" id="meta-${c.id}">${c.duration.toFixed(1)} s${c.uses3d ? " · WebGL" : ""}</span>
      <span class="shortlist" title="Shortlist">
        <input type="checkbox" class="shortlist-input" aria-label="Shortlist ${c.number} ${c.name}" ${shortlist.includes(c.id) ? "checked" : ""} />
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path class="star-fill" d="M10 2.4l2.3 4.8 5.2.7-3.8 3.6.9 5.2L10 14.2l-4.6 2.5.9-5.2L2.5 7.9l5.2-.7z" fill="currentColor" />
          <path d="M10 2.4l2.3 4.8 5.2.7-3.8 3.6.9 5.2L10 14.2l-4.6 2.5.9-5.2L2.5 7.9l5.2-.7z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
        </svg>
      </span>`;
    const radio = label.querySelector(".concept-radio");
    radio.addEventListener("change", () => selectConcept(c.id));
    const star = label.querySelector(".shortlist-input");
    star.addEventListener("change", () => {
      const ids = new Set(readShortlist());
      if (star.checked) ids.add(c.id);
      else ids.delete(c.id);
      writeShortlist(concepts.map((k) => k.id).filter((id) => ids.has(id)));
      renderShortlistNote();
    });
    ui.conceptList.append(label);
  }
  renderShortlistNote();
}

async function selectConcept(id) {
  state.conceptId = id;
  for (const l of ui.conceptList.querySelectorAll(".concept")) l.classList.toggle("is-selected", l.dataset.concept === id);
  const radio = ui.conceptList.querySelector(`input[value="${id}"]`);
  if (radio && !radio.checked) radio.checked = true;
  renderAbout(byId[id]);
  setStatus("");
  await player.load(byId[id]);
}

async function relayout() {
  stage.setLayout({ device: state.device, context: state.context });
  ui.stageEl.dataset.device = state.device;
  ui.stageEl.dataset.context = state.context;
  ui.settleToggle.disabled = state.context !== "home";
  ui.settleWrap.title = state.context === "home" ? "" : "Available in Homepage context";
  await player.load(byId[state.conceptId]);
}

function wireControls() {
  ui.btnReplay.addEventListener("click", () => {
    requestMotion();
    player.replay();
    syncUi();
  });
  ui.replayOverlay.addEventListener("click", () => {
    requestMotion();
    player.replay();
    syncUi();
  });
  ui.btnToggle.addEventListener("click", () => {
    requestMotion();
    player.toggle();
    syncUi();
  });
  ui.btnRestart.addEventListener("click", () => {
    player.firstFrame();
    syncUi();
  });
  ui.scrubber.addEventListener("input", () => {
    player.seek(parseFloat(ui.scrubber.value));
    syncUi();
  });
  for (const r of document.querySelectorAll('input[name="speed"]')) {
    r.addEventListener("change", () => {
      state.speed = parseFloat(r.value);
      player.setSpeed(state.speed);
      renderSpeedNote();
    });
  }
  for (const r of document.querySelectorAll('input[name="context"]')) {
    if (r.value === state.context) r.checked = true;
    r.addEventListener("change", () => {
      state.context = r.value;
      relayout();
    });
  }
  for (const r of document.querySelectorAll('input[name="device"]')) {
    if (r.value === state.device) r.checked = true;
    r.addEventListener("change", () => {
      state.device = r.value;
      relayout();
    });
  }
  ui.stillToggle.checked = state.still;
  ui.stillToggle.addEventListener("change", () => {
    state.still = ui.stillToggle.checked;
    applyStill();
    setStatus("");
  });
  ui.settleToggle.checked = state.settle;
  ui.settleToggle.addEventListener("change", () => {
    state.settle = ui.settleToggle.checked;
    player.load(byId[state.conceptId]);
  });
  REDUCED.addEventListener("change", () => {
    if (REDUCED.matches && !state.still) {
      state.still = true;
      ui.stillToggle.checked = true;
      applyStill();
    }
  });
  // keyboard: space toggles, R replays, when focus is not on a control
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (["input", "button", "select", "textarea", "a"].includes(tag)) return;
    if (e.key === " ") {
      e.preventDefault();
      requestMotion();
      player.toggle();
      syncUi();
    } else if (e.key.toLowerCase() === "r") {
      requestMotion();
      player.replay();
      syncUi();
    }
  });
}

async function init() {
  const geometry = await (await fetch("/geometry/logo-geometry.json")).json();
  await document.fonts.ready;
  await new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = "/assets/logo-mark.png";
  });
  stage = new Stage(ui.region, geometry);
  player = new Player(stage);
  stage.onNavigate((href, label) => {
    player.finishNow();
    stage.setRoute(`Route: ${href} (simulated)`);
    setStatus(
      `Simulated navigation to ${label} (${href}): the intro finished immediately and the header stayed usable. In production the intro would not replay when a visitor returns to the home page in the same session.`,
    );
    syncUi();
  });
  buildConceptList();
  wireControls();
  renderAbout(byId[state.conceptId]);
  await relayout();
  // debugging and test hooks (read-only use)
  window.__lab = { get player() { return player; }, get stage() { return stage; }, state, concepts };
}

init().catch((err) => {
  console.error(err);
  setStatus(`The lab could not start: ${err.message}`);
});
