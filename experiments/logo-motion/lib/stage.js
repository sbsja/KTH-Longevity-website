/**
 * The stage: a simulated viewport with a fixed virtual size (1440 × 900 desktop,
 * 390 × 844 phone) scaled to fit the lab's stage box, containing the common background,
 * optionally the site's header and section labels, and the logo composition that every
 * concept animates.
 *
 * The logo composition is an SVG whose viewBox is the mark box of the supplied PNG
 * (x 175–838, y 172–308), so every concept works in the PNG's own pixel coordinates:
 *   <image .png-word>    the wordmark pixels of the PNG (background made transparent)
 *   <image .png-symbol>  the crossing symbol pixels of the PNG
 *   <g .vector>          the animation-only vector strokes (geometry/logo-geometry.json)
 * The final frame of every concept is png-word + png-symbol at full opacity, vector hidden.
 */

export const LAYOUTS = {
  desktop: { width: 1440, height: 900, markWidth: 560, gutter: 40, headerH: 72 },
  phone: { width: 390, height: 844, markWidth: 300, gutter: 16, headerH: 72 },
};

export const SECTIONS = [
  { id: "about", label: "About", href: "/about/" },
  { id: "events", label: "Events", href: "/events/" },
  { id: "projects", label: "Projects", href: "/projects/" },
  { id: "jobs", label: "Job board", href: "/jobs/" },
  { id: "newsletter", label: "Newsletter", href: "/newsletter/" },
  { id: "contact", label: "Contact", href: "/contact/" },
];

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK = "http://www.w3.org/1999/xlink";
export const LOGO_MARK_URL = "/assets/logo-mark.png";
export const LOGO_PNG_URL = "/site/brand/kth-longevity-logo.png";

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of children) if (c) node.append(c);
  return node;
}

export function svgEl(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "href") {
      node.setAttribute("href", v);
      node.setAttributeNS(XLINK, "xlink:href", v);
    } else if (k === "text") node.textContent = v;
    else node.setAttribute(k, String(v));
  }
  for (const c of children) if (c) node.append(c);
  return node;
}

export class Stage {
  constructor(region, geometry) {
    this.region = region;
    this.geometry = geometry;
    this.layout = { device: "desktop", context: "logo" };
    this.k = 1;
    this.viewport = null;
    this.logo = null;
    this.labelsVisible = false;
    this._onNavigate = null;
    this._ro = new ResizeObserver(() => this.fit());
    this._ro.observe(region);
  }

  get L() {
    return LAYOUTS[this.layout.device];
  }
  get isPhone() {
    return this.layout.device === "phone";
  }
  get isContext() {
    return this.layout.context === "home";
  }

  setLayout(next) {
    this.layout = { ...this.layout, ...next };
    this.build();
  }

  onNavigate(cb) {
    this._onNavigate = cb;
  }

  /* ---------------- building ---------------- */

  build() {
    const { width: W, height: H } = this.L;
    this.region.replaceChildren();
    const vp = el("div", { class: `viewport viewport--${this.layout.device} viewport--${this.isContext ? "home" : "logo"}` });
    vp.style.width = `${W}px`;
    vp.style.height = `${H}px`;
    this.viewport = vp;

    vp.append(el("div", { class: "sim-backdrop", "aria-hidden": "true" }));
    this.fxUnder = svgEl("svg", { class: "fx-layer fx-layer--under", viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
    vp.append(this.fxUnder);
    this.hero = el("div", { class: "hero" });
    vp.append(this.hero);
    this.glLayer = el("div", { class: "gl-layer", "aria-hidden": "true" });
    vp.append(this.glLayer);
    this.fxOver = svgEl("svg", { class: "fx-layer", viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
    vp.append(this.fxOver);

    if (this.isContext) vp.append(this.buildHeader());
    this.sections = this.buildSections();
    if (this.sections) vp.append(this.sections);
    if (this.isContext) {
      this.route = el("div", { class: "sim-route sim-mono", text: "Route: / (home)" });
      vp.append(this.route);
    } else this.route = null;

    vp.append(el("div", { class: "sim-vignette", "aria-hidden": "true" }), el("div", { class: "sim-grain", "aria-hidden": "true" }));
    this.region.append(vp);
    this.rebuildLogo();
    this.fit();
  }

  buildHeader() {
    const header = el("header", { class: "sim-header" });
    this.headerLogo = el("a", { class: "sim-logo", href: "/", "aria-label": "KTH Longevity, home (simulated)" }, [
      el("span", { class: "frame", "aria-hidden": "true" }, [el("img", { src: LOGO_PNG_URL, alt: "", width: 1008, height: 480, decoding: "async" })]),
    ]);
    this.headerLogo.addEventListener("click", (e) => {
      e.preventDefault();
      this._onNavigate?.("/", "Home");
    });
    header.append(this.headerLogo);
    if (this.isPhone) {
      header.append(
        el("div", { class: "sim-end" }, [
          el("button", { type: "button", class: "sim-menu", "aria-expanded": "false", "aria-label": "Menu (simulated, inert)" }, [
            el("span", { class: "sim-burger", "aria-hidden": "true" }, [el("i"), el("i")]),
            el("span", { class: "sim-mono", text: "Menu" }),
          ]),
        ]),
      );
      return header;
    }
    const list = el("ul", { class: "sim-list" });
    for (const s of SECTIONS) {
      const link = el("a", { class: "sim-link", href: s.href, "data-section": s.id }, [el("span", { class: "sim-label-text", text: s.label })]);
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this._onNavigate?.(s.href, s.label);
      });
      const item = el("li", { class: "sim-item" }, [link]);
      if (s.id === "events") {
        item.append(
          el("button", { type: "button", class: "sim-disclosure", "aria-label": "Show event pages (simulated, inert)", tabindex: "-1" }, [
            svgEl("svg", { width: 14, height: 14, viewBox: "0 0 14 14", "aria-hidden": "true" }, [
              svgEl("path", { d: "m3 5 4 4 4-4", fill: "none", stroke: "currentColor", "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round" }),
            ]),
          ]),
        );
      }
      list.append(item);
    }
    header.append(el("nav", { class: "sim-bar", "aria-label": "Primary (simulated)" }, [list]));
    return header;
  }

  /** The six labels when they are not in a desktop header bar. */
  buildSections() {
    if (this.isContext && !this.isPhone) return null; // the header bar carries them
    const { width: W } = this.L;
    const place = this.logoPlacement();
    const wrap = el("div", { class: "sim-sections", "aria-label": "Section labels (simulated)" });
    if (this.isPhone) {
      wrap.classList.add("sim-sections--columns");
      if (this.isContext) wrap.classList.add("sim-sections--panel");
      wrap.style.top = `${Math.round(place.y + place.height + 96)}px`;
    } else {
      wrap.classList.add("sim-sections--row");
      wrap.style.top = `${Math.round(place.y - 150)}px`;
      wrap.style.maxWidth = `${W - 80}px`;
    }
    for (const s of SECTIONS) {
      const a = el("a", { class: "sim-chip sim-mono", href: s.href, "data-section": s.id }, [el("span", { class: "sim-label-text", text: s.label })]);
      a.addEventListener("click", (e) => {
        e.preventDefault();
        this._onNavigate?.(s.href, s.label);
      });
      wrap.append(a);
    }
    // In logo-only mode the labels appear only for the concept that needs them.
    if (!this.isContext) wrap.hidden = !this.labelsVisible;
    return wrap;
  }

  setLabelsVisible(visible) {
    this.labelsVisible = visible;
    if (this.sections && !this.isContext) this.sections.hidden = !visible;
  }

  /** Where the logo sits in the virtual viewport, in virtual pixels. */
  logoPlacement() {
    const { width: W, height: H, markWidth, headerH } = this.L;
    const { markBox } = this.geometry;
    const h = (markWidth * markBox.h) / markBox.w;
    const x = (W - markWidth) / 2;
    let cy;
    if (this.isPhone) cy = 330;
    else cy = this.isContext ? headerH + (H - headerH) * 0.47 : H * 0.49;
    return { x, y: cy - h / 2, width: markWidth, height: h };
  }

  /** Fresh logo composition. Called before every concept so nothing leaks between them. */
  rebuildLogo() {
    this.hero.replaceChildren();
    this.fxUnder.replaceChildren();
    this.fxOver.replaceChildren();
    this.glLayer.replaceChildren();
    const g = this.geometry;
    const place = this.logoPlacement();
    const root = el("div", { class: "logo-root" });
    Object.assign(root.style, { left: `${place.x}px`, top: `${place.y}px`, width: `${place.width}px`, height: `${place.height}px` });

    const mb = g.markBox;
    const split = g.wordmarkBox.x - 8; // between symbol and wordmark
    const svg = svgEl("svg", { class: "logo-svg", viewBox: `${mb.x} ${mb.y} ${mb.w} ${mb.h}`, "aria-hidden": "true" });
    const defs = svgEl("defs");
    defs.append(
      svgEl("clipPath", { id: "clip-symbol" }, [svgEl("rect", { x: mb.x - 40, y: mb.y - 40, width: split - mb.x + 40, height: mb.h + 80 })]),
      svgEl("clipPath", { id: "clip-word" }, [svgEl("rect", { x: split, y: mb.y - 40, width: mb.x + mb.w - split + 40, height: mb.h + 80 })]),
    );
    // feathered wipe for the wordmark: a gradient-filled rect slides across inside a mask
    const feather = 110;
    const wordW = mb.x + mb.w - split + feather;
    const grad = svgEl("linearGradient", { id: "word-wipe-grad", gradientUnits: "objectBoundingBox", x1: 0, y1: 0, x2: 1, y2: 0 }, [
      svgEl("stop", { offset: 0, "stop-color": "#fff" }),
      svgEl("stop", { offset: (wordW - feather) / wordW, "stop-color": "#fff" }),
      svgEl("stop", { offset: 1, "stop-color": "#fff", "stop-opacity": 0 }),
    ]);
    const wipeRect = svgEl("rect", { class: "word-wipe-rect", x: split - wordW, y: mb.y - 40, width: wordW, height: mb.h + 80, fill: "url(#word-wipe-grad)" });
    defs.append(grad, svgEl("mask", { id: "mask-word", maskUnits: "userSpaceOnUse", x: mb.x - 40, y: mb.y - 40, width: mb.w + 80, height: mb.h + 80 }, [wipeRect]));
    svg.append(defs);

    const imgAttrs = { href: LOGO_MARK_URL, x: mb.x, y: mb.y, width: mb.w, height: mb.h, preserveAspectRatio: "none" };
    const pngSymbol = svgEl("image", { ...imgAttrs, class: "png-symbol", "clip-path": "url(#clip-symbol)" });
    const pngWord = svgEl("image", { ...imgAttrs, class: "png-word", "clip-path": "url(#clip-word)" });
    const wordGroup = svgEl("g", { class: "word-group" }, [pngWord]);

    const vector = svgEl("g", { class: "vector" });
    const paths = {};
    for (const name of g.order) {
      const s = g.strokes[name];
      paths[name] = svgEl("path", {
        class: `stroke-${name}`,
        d: s.path,
        fill: "none",
        stroke: s.color,
        "stroke-width": s.width,
        "stroke-linecap": s.cap,
        "stroke-linejoin": "round",
      });
      vector.append(paths[name]);
    }
    // extra layers concepts may draw into, in PNG coordinates
    const under = svgEl("g", { class: "logo-under" });
    const over = svgEl("g", { class: "logo-over" });
    svg.append(under, pngSymbol, wordGroup, vector, over);
    root.append(svg);
    this.hero.append(root);

    this.logo = {
      root,
      svg,
      defs,
      pngSymbol,
      pngWord,
      wordGroup,
      wipeRect,
      wipeFrom: split - wordW,
      wipeTo: split,
      vector,
      navy: paths.navy,
      blue: paths.blue,
      under,
      over,
      place,
      scale: place.width / mb.w,
    };
    return this.logo;
  }

  /* ---------------- geometry helpers ---------------- */

  fit() {
    if (!this.viewport) return;
    const { width: W, height: H } = this.L;
    const rw = this.region.clientWidth;
    const rh = this.region.clientHeight;
    if (!rw || !rh) return;
    const pad = this.isPhone ? 0.94 : 1;
    const k = Math.min((rw / W) * pad, (rh / H) * pad);
    this.k = k;
    const left = (rw - W * k) / 2;
    const top = (rh - H * k) / 2;
    this.viewport.style.transform = `translate(${left}px, ${top}px) scale(${k})`;
  }

  /** PNG pixel coordinates → virtual viewport pixels. */
  pngToViewport(x, y) {
    const { place, scale } = this.logo;
    const mb = this.geometry.markBox;
    return { x: place.x + (x - mb.x) * scale, y: place.y + (y - mb.y) * scale };
  }

  /** Bounding box of a DOM node inside the viewport, in virtual pixels. */
  rectInViewport(node) {
    const r = node.getBoundingClientRect();
    const v = this.viewport.getBoundingClientRect();
    return { x: (r.left - v.left) / this.k, y: (r.top - v.top) / this.k, width: r.width / this.k, height: r.height / this.k };
  }

  /**
   * The six label targets for concept 6: element, bounding rect and the anchor point
   * a line should arrive at (on the edge that faces the logo, never over the text).
   */
  labelTargets() {
    const nodes = this.isContext && !this.isPhone ? [...this.viewport.querySelectorAll(".sim-link")] : this.sections ? [...this.sections.querySelectorAll(".sim-chip")] : [];
    return nodes.map((node, i) => {
      const rect = this.rectInViewport(node);
      let anchor;
      let side;
      if (this.isPhone) {
        // two columns below the logo: arrive at the edge facing the free middle corridor
        const leftColumn = i % 2 === 0;
        side = leftColumn ? "right" : "left";
        anchor = { x: leftColumn ? rect.x + rect.width + 2 : rect.x - 2, y: rect.y + rect.height / 2 };
      } else {
        side = "bottom";
        anchor = { x: rect.x + rect.width / 2, y: rect.y + rect.height + 2 };
      }
      return { id: node.dataset.section, label: node.textContent.trim(), node, rect, anchor, side };
    });
  }

  /** The header's logo frame (where the mark lands when it settles into the header). */
  headerSlot() {
    if (!this.headerLogo) return null;
    const frame = this.headerLogo.querySelector(".frame");
    return this.rectInViewport(frame);
  }

  setHeaderLogoWaiting(waiting) {
    this.headerLogo?.classList.toggle("is-waiting", waiting);
  }

  setRoute(text) {
    if (this.route) this.route.textContent = text;
  }

  dispose() {
    this._ro.disconnect();
    this.region.replaceChildren();
  }
}
