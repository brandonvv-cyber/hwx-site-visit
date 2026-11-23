/* Custom sauna designer for the shop counter. Same questions and options as the "Hydroworx Sauna Designer" (24 Sep 2026):
   type, size, front and door, benches, inside finish, outside finish, heater and extras. No Sage, no prices: the office prices it after the site visit.
   Sizing logic is the designer's own (net volume + 1.2 m3 per m2 of glass for the heater, SAU-HTR-03, PROPOSED). Nothing here is a CONFIRMED rule. */
(function () {
  const STYLES = [
    { id: "builtin", name: "Indoor built-in", blurb: "Built in place against existing walls, on a tiled floor. No base frame." },
    { id: "cabin", name: "Indoor cabin", blurb: "Freestanding framed cabin on its own base, clad on every side." },
    { id: "outdoor", name: "Outdoor cabin", blurb: "Treated frame, weather cladding and a mono-pitch IBR roof with gutter." }
  ];
  const PRESETS = [
    { id: "xs", label: "1-2 people", W: 1500, D: 1200, H: 2100 }, { id: "s", label: "3-4 people", W: 2000, D: 1800, H: 2100 },
    { id: "m", label: "4-6 people", W: 2300, D: 2300, H: 2100 }, { id: "l", label: "6-8 people", W: 2800, D: 2500, H: 2100 },
    { id: "xl", label: "Commercial", W: 3500, D: 3000, H: 2100 }
  ];
  const FRONTS = [
    { id: "glass", name: "Full glass front", blurb: "8 mm toughened fixed panels and a glass door on pivot hinges." },
    { id: "timber", name: "Timber front", blurb: "Clad front wall with a 700 mm glass door." }
  ];
  const BENCHES = [
    { id: "single", name: "Single bench", blurb: "One 550 deep bench on the back wall, seat at 500." },
    { id: "twotier", name: "Two tiers", blurb: "Upper 480 deep at 900, lower 400 deep at 500." },
    { id: "lshape", name: "L-shape", blurb: "Back bench plus a side bench, both seats at 500." }
  ];
  const LININGS = [
    { id: "spruce", name: "Nordic spruce", color: "#E6D1A6", note: "Pale, even grain" }, { id: "obeche", name: "Obeche", color: "#EBD59C", note: "Stays cool to the touch" },
    { id: "cedar", name: "Cedar", color: "#B06A45", note: "Rich red, aromatic" }, { id: "bass", name: "American basswood", color: "#EDDFBF", note: "Creamy and knot-free" },
    { id: "pine", name: "Pine", color: "#DDB97F", note: "Classic, lowest cost" }, { id: "luna", name: "Luna thermo-wood", color: "#8C5E3C", note: "Dark, heat-treated" }
  ];
  const BENCHWOODS = [
    { id: "abachi", name: "Abachi", color: "#EDD7A0", note: "Traditional bench wood" }, { id: "spruce", name: "Spruce", color: "#E6D1A6", note: "Matches spruce walls" },
    { id: "cedar", name: "Cedar", color: "#B06A45", note: "Warm red" }, { id: "bass", name: "Basswood", color: "#EDDFBF", note: "Smooth, pale" }
  ];
  const CLADDINGS = [
    { id: "pine13", name: "Pine T&G 13x102", color: "#D4AC72", t: 0.013, indoor: true, note: "Indoor only" }, { id: "tpine", name: "Treated pine 21x100", color: "#C3A46B", t: 0.021, note: "Budget outdoor" },
    { id: "balau68", name: "Balau 19x68", color: "#7B4B2F", t: 0.019, note: "Hardwood, narrow boards" }, { id: "balau90", name: "Balau 19x90", color: "#74462C", t: 0.019, note: "Hardwood, wide boards" },
    { id: "cedar", name: "Cedar 21x100", color: "#A8633F", t: 0.021, note: "Weathers silver" }
  ];
  const FLOORS = { tile: { name: "Ceramic tile", blurb: "74 mm screed, membrane, anti-slip tile." }, ply: { name: "Plywood deck", blurb: "18 mm ply on the base frame." }, tg: { name: "Pine T&G floor", blurb: "22 mm tongue-and-groove boards." } };
  const FLOORS_BY_STYLE = { builtin: ["tile", "tg"], cabin: ["ply", "tg"], outdoor: ["tg"] };
  const HEATERS = [
    { kw: 4.5, max: 4.5, w: .30, d: .30 }, { kw: 6, max: 8.5, w: .33, d: .33 }, { kw: 9, max: 13.5, w: .35, d: .40 },
    { kw: 12, max: 18.5, w: .40, d: .45 }, { kw: 15, max: 24.5, w: .45, d: .45 }, { kw: 22, max: 1e9, w: .50, d: .50 }
  ];
  const SAGE_HEATER = { 6: "SAO6", 9: "SAO9C", 12: "SAO12" };   // the heaters Sage lists today; SAO12 is an open item (SAU-HTR-11)
  const by = a => Object.fromEntries(a.map(x => [x.id, x]));
  const STY = by(STYLES), CLAD = by(CLADDINGS), LIN = by(LININGS), BW = by(BENCHWOODS), FRT = by(FRONTS), BEN = by(BENCHES);
  const mm = m => Math.round(m * 1000), r1 = n => (Math.round(n * 10) / 10).toFixed(1);

  function newDesign() {
    return { style: "cabin", existing: { back: true, left: false, right: false }, preset: "s", W: 2000, D: 1800, H: 2100, front: "glass", door: "left", bench: "twotier",
      lining: "spruce", benchWood: "abachi", floor: "ply", cladding: "pine13", heater: "auto", led: true, lamps: 2, bucket: true, gauge: true };
  }
  function normalize(d) {
    const allowed = FLOORS_BY_STYLE[d.style] || ["ply"]; if (!allowed.includes(d.floor)) d.floor = allowed[0];
    if (d.style === "outdoor" && CLAD[d.cladding] && CLAD[d.cladding].indoor) d.cladding = "balau68";
    if (!CLAD[d.cladding]) d.cladding = d.style === "outdoor" ? "balau68" : "pine13";
    if (!LIN[d.lining]) d.lining = "spruce"; if (!BW[d.benchWood]) d.benchWood = "abachi";
    const p = PRESETS.find(p => p.W === d.W && p.D === d.D && p.H === d.H); d.preset = p ? p.id : "custom";
    d.lamps = Math.max(0, Math.min(3, +d.lamps || 0)); d.existing = d.existing || { back: true, left: false, right: false };
    return d;
  }
  function geom(d) {
    const outdoor = d.style === "outdoor", builtin = d.style === "builtin", W = d.W / 1000, D = d.D / 1000, H = d.H / 1000;
    const frame = outdoor ? 0.114 : 0.076, lin = 0.014, clad = CLAD[d.cladding] || CLADDINGS[0], cladT = clad.t;
    const ex = builtin ? { back: !!d.existing.back, left: !!d.existing.left, right: !!d.existing.right } : { back: false, left: false, right: false };
    const wt = s => (ex[s] ? 0 : cladT) + frame + lin, tB = wt("back"), tL = wt("left"), tR = wt("right"), glassFront = d.front === "glass";
    const tF = glassFront ? 0.076 : cladT + frame + lin;
    const floorH = builtin ? (d.floor === "tile" ? 0.094 : 0.060) : (outdoor ? 0.136 : 0.094), pitch = outdoor ? 8 * Math.PI / 180 : 0, tanP = Math.tan(pitch);
    const roofT = outdoor ? 0 : 0.012, ceilT = outdoor ? lin : frame + lin + roofT, Wi = W - tL - tR, Di = D - tB - tF, Hi = H - floorH - ceilT;
    const HiAvg = Hi + (outdoor ? (tF + Di / 2) * tanP : 0), xL = -W / 2 + tL, xR = W / 2 - tR, zB = -D / 2 + tB, zF = D / 2 - tF, warnings = [];
    if (Wi < 0.9 || Di < 0.8) warnings.push("The inside is very small. Check the outside size.");
    if (Hi < 1.85) warnings.push("Inside height is only " + mm(Hi) + " mm. Aim for at least 1900 mm.");
    const doorW = 0.70, glass = { panels: [], area: 0, doorW };
    if (glassFront) {
      const post = 0.076, mull = 0.038, x0 = -W / 2 + post, openW = W - 2 * post, remaining = openW - doorW, n = remaining > 0.3 ? Math.max(1, Math.ceil(remaining / 0.75)) : 0, pw = n ? (remaining - n * mull) / n : 0;
      const gTop = H - roofT - 0.076, sillTop = floorH + 0.038, doorBot = floorH + 0.010, fixedH = gTop - sillTop, doorH = gTop - doorBot - 0.01, seq = [];
      if (d.door === "left") { seq.push("door"); for (let i = 0; i < n; i++) seq.push("m", "p"); }
      else if (d.door === "right") { for (let i = 0; i < n; i++) seq.push("p", "m"); seq.push("door"); }
      else { const a = Math.floor(n / 2), b = n - a; for (let i = 0; i < a; i++) seq.push("p", "m"); seq.push("door"); for (let i = 0; i < b; i++) seq.push("m", "p"); }
      let x = x0; for (const s of seq) { if (s === "door") { glass.panels.push({ type: "door", x0: x, x1: x + doorW }); x += doorW; } else if (s === "m") { glass.panels.push({ type: "mullion", x0: x, x1: x + mull }); x += mull; } else { glass.panels.push({ type: "fixed", x0: x, x1: x + pw }); x += pw; } }
      glass.area = n * (pw + 0.024) * (fixedH + 0.024) + doorW * doorH;
    } else {
      const doorH = Math.min(1.9, H - floorH - 0.25), dx = d.door === "left" ? xL + 0.14 + doorW / 2 : d.door === "right" ? xR - 0.14 - doorW / 2 : 0;
      glass.panels.push({ type: "door", x0: dx - doorW / 2, x1: dx + doorW / 2 }); glass.area = doorW * doorH;
    }
    const volume = Math.max(0, Wi * Di * HiAvg), effVol = volume + glass.area * 1.2, auto = HEATERS.find(h => effVol <= h.max);
    const chosen = d.heater === "auto" ? auto : (HEATERS.find(h => String(h.kw) === String(d.heater)) || auto), hSide = d.door === "right" ? "left" : "right";
    const hx0 = hSide === "right" ? xR - 0.10 - chosen.w : xL + 0.10, hz1 = zF - 0.12, hz0 = hz1 - chosen.d;
    const heater = Object.assign({}, chosen, { auto: auto.kw, side: hSide, x0: hx0, x1: hx0 + chosen.w, z0: hz0, z1: hz1 });
    if (d.heater !== "auto" && chosen.kw < auto.kw) warnings.push(chosen.kw + " kW is below the " + auto.kw + " kW this room needs.");
    const benches = [], nearX = hSide === "right" ? heater.x0 - 0.5 : heater.x1 + 0.5;
    const mkX = (label, z0, depth, seat, stop) => {
      let a = xL, b = xR; if (stop) { if (hSide === "right") b = Math.min(b, nearX); else a = Math.max(a, nearX); }
      const len = b - a; if (len < 0.5) { warnings.push(label + ": not enough room beside the heater."); return null; }
      const bb = { label, axis: "x", x0: a, x1: b, z0, z1: z0 + depth, depth, seat, len }; benches.push(bb); return bb;
    };
    if (d.bench === "twotier") {
      if (Di < 1.22) warnings.push("Two tiers need about " + mm(1.22 + tB + tF) + " mm outside depth. A single bench fits better.");
      if (Hi < 1.9) warnings.push("Only " + mm(Hi - 0.9) + " mm headroom above the upper bench. Aim for 1000 mm.");
      mkX("Upper bench", zB, 0.48, 0.90, zB + 0.48 > heater.z0 - 0.1); mkX("Lower bench", zB + 0.48, 0.40, 0.50, true);
    } else {
      mkX(d.bench === "lshape" ? "Back bench" : "Bench", zB, 0.55, 0.50, zB + 0.55 > heater.z0 - 0.1);
      if (d.bench === "lshape") {
        const onLeft = hSide === "right", z0 = zB + 0.55, z1 = zF - 0.6, len = z1 - z0;
        if (len >= 0.5) { const x0 = onLeft ? xL : xR - 0.48; benches.push({ label: "Side bench", axis: "z", x0, x1: x0 + 0.48, z0, z1, depth: 0.48, seat: 0.50, len }); } else warnings.push("Side bench: not enough depth for an L-shape.");
      }
    }
    const benchLen = benches.reduce((s, b) => s + b.len, 0), seats = Math.max(1, Math.floor(benchLen / 0.6));
    const cladOn = !(builtin && ex.back && ex.left && ex.right && glassFront);
    return { W, D, H, outdoor, builtin, glassFront, ex, tB, tL, tR, tF, Wi, Di, Hi, volume, effVol, xL, xR, zB, zF, glass, heater, benches, seats, warnings, cladOn };
  }

  /* top-down plan, back wall at the top, front and door at the bottom */
  function planSvg(d, g, px) {
    const W = d.W, D = d.D, pad = 150, vw = W + pad * 2, vh = D + pad + 330, X = x => (x * 1000 + W / 2) + pad, Y = z => (z * 1000 + D / 2) + pad, fs = Math.max(55, Math.round(Math.max(W, D) / 28));
    const lin = LIN[d.lining], bw = BW[d.benchWood], cl = CLAD[d.cladding], s = [];
    s.push(`<rect x="${pad}" y="${pad}" width="${W}" height="${D}" fill="${g.cladOn ? cl.color : "#cfcfc9"}" stroke="#444" stroke-width="12"/>`);
    s.push(`<rect x="${X(g.xL)}" y="${Y(g.zB)}" width="${(g.xR - g.xL) * 1000}" height="${(g.zF - g.zB) * 1000}" fill="${lin.color}" stroke="#444" stroke-width="8"/>`);
    for (const b of g.benches) {
      s.push(`<rect x="${X(b.x0)}" y="${Y(b.z0)}" width="${(b.x1 - b.x0) * 1000}" height="${(b.z1 - b.z0) * 1000}" fill="${bw.color}" stroke="#5a3b1d" stroke-width="8"/>`);
      const n = b.axis === "x" ? Math.floor((b.z1 - b.z0) / 0.1) : Math.floor((b.x1 - b.x0) / 0.1);
      for (let i = 1; i < n; i++) s.push(b.axis === "x" ? `<line x1="${X(b.x0)}" x2="${X(b.x1)}" y1="${Y(b.z0) + i * 100}" y2="${Y(b.z0) + i * 100}" stroke="#5a3b1d" stroke-opacity=".35" stroke-width="4"/>` : `<line y1="${Y(b.z0)}" y2="${Y(b.z1)}" x1="${X(b.x0) + i * 100}" x2="${X(b.x0) + i * 100}" stroke="#5a3b1d" stroke-opacity=".35" stroke-width="4"/>`);
    }
    const h = g.heater; s.push(`<rect x="${X(h.x0)}" y="${Y(h.z0)}" width="${(h.x1 - h.x0) * 1000}" height="${(h.z1 - h.z0) * 1000}" rx="14" fill="#b45c16" stroke="#6f3608" stroke-width="8"/>`);
    s.push(`<text x="${(X(h.x0) + X(h.x1)) / 2}" y="${(Y(h.z0) + Y(h.z1)) / 2 + fs * .3}" font-size="${fs * .8}" fill="#fff" text-anchor="middle" font-weight="700">${h.kw}</text>`);
    const fy = Y(g.zF) - 2, ft = g.tF * 1000 + 6;   // the front wall band
    for (const p of g.glass.panels) {
      if (p.type === "door") {
        const dx0 = X(p.x0), dx1 = X(p.x1);
        s.push(`<rect x="${dx0}" y="${fy}" width="${dx1 - dx0}" height="${ft}" fill="#ffffff" stroke="#444" stroke-width="6"/>`);
        s.push(`<text x="${(dx0 + dx1) / 2}" y="${fy + ft + fs * 1.1}" font-size="${fs * .8}" fill="#0E6461" text-anchor="middle" font-weight="700">DOOR</text>`);
      } else if (p.type === "fixed") s.push(`<rect x="${X(p.x0)}" y="${fy}" width="${(p.x1 - p.x0) * 1000}" height="${ft}" fill="#9fd3e6" stroke="#2c6f86" stroke-width="5"/>`);
      else s.push(`<rect x="${X(p.x0)}" y="${fy}" width="${(p.x1 - p.x0) * 1000}" height="${ft}" fill="#555"/>`);
    }
    s.push(`<text x="${pad + W / 2}" y="${vh - 40}" font-size="${fs}" fill="#4A5652" text-anchor="middle">${d.W} mm wide (front at the bottom)</text>`);
    s.push(`<text transform="translate(${pad - 40} ${pad + D / 2}) rotate(-90)" font-size="${fs}" fill="#4A5652" text-anchor="middle">${d.D} mm deep</text>`);
    if (g.builtin) for (const k of ["back", "left", "right"]) if (g.ex[k]) { const t = { back: [pad, pad - 38, W, 22], left: [pad - 38, pad, 22, D], right: [pad + W + 16, pad, 22, D] }[k]; s.push(`<rect x="${t[0]}" y="${t[1]}" width="${t[2]}" height="${t[3]}" fill="#888"/>`); }
    const size = px ? `width="${px}" height="${Math.round(px * vh / vw)}"` : `style="width:100%;height:auto;background:#fff;border:2px solid #cfd7d3;border-radius:10px"`;
    return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" ${size} font-family="Arial, Helvetica, sans-serif" role="img" aria-label="Plan of the sauna from above"><rect width="${vw}" height="${vh}" fill="#fff"/>${s.join("")}</svg>`;
  }

  /* The sentence that goes on the quote, and the extra detail for the office */
  function describe(d, g) {
    const fl = { tile: "ceramic tile", ply: "plywood deck", tg: "pine T&G" }[d.floor] || FLOORS[d.floor].name.toLowerCase(), extras = [d.led ? "LED strip under the bench" : "", d.lamps ? d.lamps + " wall lamp" + (d.lamps > 1 ? "s" : "") : "", d.bucket ? "bucket and ladle" : "", d.gauge ? "thermo-hygrometer" : ""].filter(Boolean);
    const desc = "Custom " + STY[d.style].name.toLowerCase() + " sauna, " + d.W + " x " + d.D + " x " + d.H + " mm outside";
    const parts = [
      FRT[d.front].name + ", door " + (d.door === "centre" ? "in the centre" : "on the " + d.door) + ".",
      BEN[d.bench].name + " (about " + g.seats + " seats).",
      "Inside: " + LIN[d.lining].name + " lining, " + BW[d.benchWood].name + " benches, " + fl + " floor.",
      g.cladOn ? "Outside: " + CLAD[d.cladding].name + " cladding" + (d.style === "outdoor" ? " and a mono-pitch IBR roof with gutter." : ".") : "Built against existing walls (no outside cladding).",
      g.heater.kw + " kW electric heater with digital controller" + (extras.length ? "; " + extras.join(", ") : "") + "."
    ];
    const sage = SAGE_HEATER[g.heater.kw];
    return { desc, note: parts.join(" "), heaterNote: "Heater " + g.heater.kw + " kW" + (sage ? " = " + sage + " in Sage" : " has no Sage code yet: office to source") + (g.heater.kw === 12 ? " (SAU-HTR-11 open item)" : "") + "; room " + r1(g.volume) + " m3, sized " + r1(g.effVol) + " m3 with the glass." };
  }

  window.HWXSauna = { STYLES, PRESETS, FRONTS, BENCHES, LININGS, BENCHWOODS, CLADDINGS, FLOORS, FLOORS_BY_STYLE, HEATERS, STY, CLAD, LIN, BW, FRT, BEN, newDesign, normalize, geom, planSvg, describe, mm, r1 };
})();
