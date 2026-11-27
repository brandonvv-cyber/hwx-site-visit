/* Client quote for the shop counter (EC-010 follow-up): a clean A4 page the walk-in client keeps.
   Drawn on a canvas, so the same picture is the on-screen preview, the print-out, the WhatsApp/email PDF and the copy saved in the client folder.
   No libraries: the PDF is one JPEG per page wrapped by hand. */
(function () {
  const W = 1240, H = 1754, M = 70, TEAL = "#0b4f6c", AQUA = "#1caac4", INK = "#12262e", MUTED = "#53686f", LINE = "#c9d6db", SOFT = "#eef5f8";
  const FONT = "Arial, 'Segoe UI', Helvetica, sans-serif";
  const VALID_DAYS = 7;   // assumption: confirm with Brandon
  const TERMS = [
    "This is a guide quotation prepared at our shop from the details you gave us. Equipment, pipe lengths and positions are confirmed on site.",
    "Prices include VAT at 15%. Stock is subject to availability when you order.",
    "Not included unless stated: installation, excavation and trenching, delivery, and the electrical connection (done by a registered electrician with a certificate of compliance).",
  ];
  const CO = { name: "Hydroworx SA (Pty) Ltd", reg: "Reg 2019/529213/07 · VAT 483 029 1920", addr: "Unit 7, 1300 Umgeni Road, Springfield Park, Durban 4001", contact: "Tel 031 285 0263 · WhatsApp 081 535 9997 · enquiries@hydroworx.co.za" };
  const GROUPS = [["pump", "Pump"], ["filter", "Filter"], ["weir", "Weirs (skimmers)"], ["return", "Returns"], ["cover", "Pump cover"], ["control", "Control box and electrical"], ["pipe", "Pipe and fittings"], ["repair", "Repairs and fittings"], ["spa", "Spa"], ["sauna", "Sauna"], ["steam", "Steam room"], ["reticulation", "Water reticulation"], ["feature", "Water features"], ["other", "Other items"]];
  const ICON = { pipe: "pipe", repair: "pump", reticulation: "tap", feature: "fountain", other: "box" };
  const R = n => "R " + (Math.round(n * 100) / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let logoImg = null;
  function loadLogo() {
    if (logoImg) return Promise.resolve(logoImg);
    return new Promise(res => { const i = new Image(); i.onload = () => { logoImg = i; res(i); }; i.onerror = () => res(null); i.src = "logo.jpg"; });
  }

  /* ---------- small drawing helpers ---------- */
  function wrap(ctx, text, maxW) {
    const out = []; let line = "";
    for (const w of String(text).split(/\s+/)) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line); return out.length ? out : [""];
  }
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  function txt(ctx, s, x, y, o) { o = o || {}; ctx.font = (o.bold ? "bold " : "") + (o.size || 24) + "px " + FONT; ctx.fillStyle = o.color || INK; ctx.textAlign = o.align || "left"; ctx.textBaseline = "alphabetic"; ctx.fillText(s, x, y); }

  /* Rough pictures: one simple drawing per kind of equipment (not the exact model). */
  function icon(ctx, kind, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.strokeStyle = TEAL; ctx.fillStyle = SOFT;
    const box = (a, b, c, d, r) => { rr(ctx, a, b, c, d, r || 6); ctx.fill(); ctx.stroke(); };
    if (kind === "pump") { box(8, 38, 46, 34, 8); ctx.beginPath(); ctx.arc(70, 55, 22, 0, 7); ctx.fillStyle = "#cfe8f0"; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(70, 33); ctx.lineTo(70, 12); ctx.lineTo(92, 12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(8, 72); ctx.lineTo(8, 82); ctx.moveTo(54, 72); ctx.lineTo(54, 82); ctx.moveTo(2, 82); ctx.lineTo(60, 82); ctx.stroke(); ctx.beginPath(); ctx.moveTo(18, 50); ctx.lineTo(44, 50); ctx.moveTo(18, 60); ctx.lineTo(44, 60); ctx.stroke(); }
    else if (kind === "filter") { box(24, 22, 52, 62, 22); ctx.beginPath(); ctx.moveTo(24, 38); ctx.lineTo(76, 38); ctx.stroke(); box(42, 6, 16, 14, 4); ctx.beginPath(); ctx.moveTo(76, 62); ctx.lineTo(94, 62); ctx.moveTo(6, 62); ctx.lineTo(24, 62); ctx.stroke(); ctx.beginPath(); ctx.moveTo(40, 92); ctx.lineTo(40, 84); ctx.moveTo(60, 92); ctx.lineTo(60, 84); ctx.stroke(); }
    else if (kind === "weir") { ctx.fillStyle = "#e6dcc8"; ctx.fillRect(4, 30, 30, 60); ctx.strokeRect(4, 30, 30, 60); box(34, 30, 38, 22, 4); ctx.fillStyle = "#bfe3ee"; ctx.fillRect(36, 56, 60, 34); ctx.beginPath(); ctx.moveTo(34, 52); ctx.lineTo(34, 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(40, 66); ctx.quadraticCurveTo(52, 58, 64, 66); ctx.quadraticCurveTo(76, 74, 90, 66); ctx.stroke(); }
    else if (kind === "return") { ctx.fillStyle = "#bfe3ee"; ctx.fillRect(40, 58, 56, 32); ctx.beginPath(); ctx.moveTo(6, 30); ctx.lineTo(46, 30); ctx.lineTo(46, 52); ctx.stroke(); box(34, 24, 12, 12, 3); ctx.beginPath(); ctx.moveTo(52, 44); ctx.lineTo(72, 36); ctx.moveTo(52, 50); ctx.lineTo(80, 50); ctx.moveTo(52, 56); ctx.lineTo(72, 64); ctx.stroke(); }
    else if (kind === "cover") { ctx.fillStyle = "#c9ccc7"; ctx.beginPath(); ctx.moveTo(8, 80); ctx.lineTo(14, 52); ctx.lineTo(34, 36); ctx.lineTo(62, 34); ctx.lineTo(84, 50); ctx.lineTo(92, 80); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(30, 60); ctx.lineTo(44, 54); ctx.moveTo(56, 62); ctx.lineTo(72, 60); ctx.moveTo(40, 72); ctx.lineTo(60, 72); ctx.stroke(); }
    else if (kind === "control") { box(20, 12, 60, 76, 8); box(30, 24, 40, 18, 3); ctx.beginPath(); ctx.arc(38, 62, 6, 0, 7); ctx.arc(62, 62, 6, 0, 7); ctx.stroke(); ctx.fillStyle = AQUA; ctx.beginPath(); ctx.moveTo(54, 26); ctx.lineTo(44, 36); ctx.lineTo(52, 36); ctx.lineTo(46, 42); ctx.stroke(); }
    else if (kind === "spa") { box(6, 44, 88, 40, 12); ctx.fillStyle = "#bfe3ee"; ctx.fillRect(14, 50, 72, 12); ctx.beginPath(); ctx.arc(30, 30, 5, 0, 7); ctx.arc(48, 22, 4, 0, 7); ctx.arc(66, 32, 6, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(6, 84); ctx.lineTo(6, 92); ctx.moveTo(94, 84); ctx.lineTo(94, 92); ctx.stroke(); }
    else if (kind === "sauna") { box(14, 34, 72, 54, 4); ctx.beginPath(); ctx.moveTo(8, 34); ctx.lineTo(50, 12); ctx.lineTo(92, 34); ctx.stroke(); box(60, 52, 18, 36, 3); ctx.beginPath(); ctx.moveTo(24, 50); ctx.lineTo(46, 50); ctx.moveTo(24, 62); ctx.lineTo(46, 62); ctx.moveTo(24, 74); ctx.lineTo(46, 74); ctx.stroke(); }
    else if (kind === "steam") { box(14, 56, 72, 32, 6); for (const dx of [28, 50, 72]) { ctx.beginPath(); ctx.moveTo(dx, 50); ctx.bezierCurveTo(dx - 10, 40, dx + 10, 32, dx, 22); ctx.bezierCurveTo(dx - 8, 14, dx + 6, 10, dx, 4); ctx.stroke(); } }
    else if (kind === "tap") { ctx.beginPath(); ctx.moveTo(10, 40); ctx.lineTo(60, 40); ctx.arcTo(78, 40, 78, 58, 16); ctx.lineTo(78, 62); ctx.stroke(); box(30, 22, 24, 12, 3); ctx.beginPath(); ctx.moveTo(42, 22); ctx.lineTo(42, 12); ctx.moveTo(30, 12); ctx.lineTo(54, 12); ctx.stroke(); ctx.fillStyle = "#bfe3ee"; ctx.beginPath(); ctx.moveTo(78, 70); ctx.quadraticCurveTo(66, 84, 78, 92); ctx.quadraticCurveTo(90, 84, 78, 70); ctx.fill(); ctx.stroke(); }
    else if (kind === "fountain") { ctx.fillStyle = "#bfe3ee"; ctx.fillRect(8, 72, 84, 18); ctx.strokeRect(8, 72, 84, 18); box(44, 56, 12, 16, 3); ctx.beginPath(); ctx.moveTo(50, 56); ctx.quadraticCurveTo(50, 12, 20, 40); ctx.moveTo(50, 56); ctx.quadraticCurveTo(50, 12, 80, 40); ctx.moveTo(50, 56); ctx.lineTo(50, 18); ctx.stroke(); }
    else if (kind === "box") { box(14, 30, 72, 56, 4); ctx.beginPath(); ctx.moveTo(14, 46); ctx.lineTo(86, 46); ctx.moveTo(50, 30); ctx.lineTo(50, 46); ctx.stroke(); }
    else { ctx.lineWidth = 9; ctx.strokeStyle = "#7fb7cb"; ctx.beginPath(); ctx.moveTo(6, 28); ctx.lineTo(60, 28); ctx.arcTo(78, 28, 78, 46, 16); ctx.lineTo(78, 72); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = TEAL; ctx.strokeRect(54, 20, 8, 16); ctx.strokeRect(70, 62, 16, 8); }
    ctx.restore();
  }

  /* Rough plan: the pool, the weirs, the returns, the pump and the pipe run, to scale for the pool and the pump distance. */
  function plan(ctx, x, y, w, h, p) {
    ctx.save(); rr(ctx, x, y, w, h, 14); ctx.fillStyle = SOFT; ctx.fill(); ctx.strokeStyle = LINE; ctx.lineWidth = 2; ctx.stroke();
    let L = p.len, Wd = p.wid, assumed = false;
    if (!(L > 0 && Wd > 0)) { const a = (p.volL / 1000) / 1.4; Wd = Math.sqrt(a / 2); L = 2 * Wd; assumed = true; }
    const dist = Math.max(1.5, p.dist || 6), padX = 36, padY = 78, availW = w - padX * 2, availH = h - padY - 46;
    const sc = Math.min(availW / (L + dist + 1.2), availH / Wd), px = x + padX, py = y + padY + (availH - Wd * sc) / 2, pw = L * sc, ph = Wd * sc;
    ctx.fillStyle = "#bfe3ee"; ctx.strokeStyle = TEAL; ctx.lineWidth = 4; ctx.fillRect(px, py, pw, ph); ctx.strokeRect(px, py, pw, ph);
    ctx.fillStyle = "#e6a23c"; const wn = Math.min(3, Math.max(1, p.weirs || 1)); for (let i = 0; i < wn; i++) { const cy = py + ph * (i + 1) / (wn + 1); ctx.fillRect(px + pw - 8, cy - 12, 14, 24); }
    ctx.fillStyle = TEAL; const rn = Math.min(6, Math.max(1, p.returns || 2)); for (let i = 0; i < rn; i++) { const cy = py + ph * (i + 1) / (rn + 1); ctx.beginPath(); ctx.arc(px + 6, cy, 6, 0, 7); ctx.fill(); }
    const pumpX = px + pw + dist * sc, pumpY = py + ph / 2, bends = { "0-2": 1, "3-5": 3, "6-8": 5, "9+": 7 }[p.bends] || 3;
    ctx.strokeStyle = "#e6a23c"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(px + pw + 6, pumpY);
    const dx = (pumpX - (px + pw + 6)) / (bends + 1); let cx = px + pw + 6, up = true;
    for (let i = 0; i < bends; i++) { cx += dx; const off = Math.min(ph * 0.42, 40) * (up ? -1 : 1); ctx.lineTo(cx, pumpY + (i % 2 ? 0 : off) * (i === bends - 1 ? 0 : 1)); up = !up; }
    ctx.lineTo(pumpX, pumpY); ctx.stroke();
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = TEAL; ctx.lineWidth = 4; rr(ctx, pumpX, pumpY - 22, 44, 44, 8); ctx.fill(); ctx.stroke(); txt(ctx, "P", pumpX + 22, pumpY + 9, { bold: true, size: 26, color: TEAL, align: "center" });
    txt(ctx, "Your pool, indicative plan", x + 18, y + 32, { bold: true, size: 22, color: TEAL });
    txt(ctx, "pool " + (assumed ? "about " : "") + L.toFixed(1) + " x " + Wd.toFixed(1) + " m" + (assumed ? " (shape assumed)" : ""), px, py - 12, { size: 20, color: TEAL });
    txt(ctx, "pump about " + (p.dist || "?") + " m from the pool", x + w / 2, y + h - 40, { size: 20, color: MUTED, align: "center" });
    ctx.font = "18px " + FONT; let lx = x + 18; const ly = y + h - 14;
    [["#e6a23c", "weirs and pipe"], [TEAL, "returns"]].forEach(([c, t]) => { ctx.fillStyle = c; ctx.fillRect(lx, ly - 12, 14, 14); txt(ctx, t, lx + 20, ly, { size: 18, color: MUTED }); lx += 30 + ctx.measureText(t).width + 18; });
    txt(ctx, "Indicative, agreed on site", x + w - 18, ly, { size: 18, color: MUTED, align: "right" });
    ctx.restore();
  }

  function svgImg(svg) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); }); }
  /* ---------- the quote ---------- */
  async function build(d) {
    const logo = await loadLogo(), pages = [], sImg = d.saunaSvg ? await svgImg(d.saunaSvg) : null;
    let cv, ctx, y;
    const newPage = first => {
      cv = document.createElement("canvas"); cv.width = W; cv.height = H; ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); pages.push(cv);
      if (first) {
        if (logo) ctx.drawImage(logo, M, 52, 360, Math.round(360 * logo.height / logo.width)); else txt(ctx, "HYDROWORX", M, 110, { bold: true, size: 50, color: TEAL });
        txt(ctx, "Luxury Water Solutions", M, 52 + 66 + 30, { size: 22, color: MUTED });
        txt(ctx, "QUOTATION", W - M, 92, { bold: true, size: 46, color: TEAL, align: "right" });
        txt(ctx, "Guide quotation prepared at our shop", W - M, 128, { size: 22, color: MUTED, align: "right" });
        ctx.fillStyle = AQUA; ctx.fillRect(M, 176, W - M * 2, 5); y = 220;
      } else { if (logo) ctx.drawImage(logo, M, 40, 200, Math.round(200 * logo.height / logo.width)); txt(ctx, "Quotation for " + d.client.name + " (continued)", W - M, 76, { size: 22, color: MUTED, align: "right" }); ctx.fillStyle = AQUA; ctx.fillRect(M, 110, W - M * 2, 4); y = 150; }
    };
    newPage(true);
    // client and quote details
    const colW = (W - M * 2 - 30) / 2;
    ctx.fillStyle = SOFT; rr(ctx, M, y, colW, 215, 12); ctx.fill(); rr(ctx, M + colW + 30, y, colW, 215, 12); ctx.fill();
    txt(ctx, "PREPARED FOR", M + 20, y + 36, { bold: true, size: 18, color: TEAL });
    txt(ctx, d.client.name, M + 20, y + 74, { bold: true, size: 30 });
    ctx.font = "22px " + FONT; let cy = y + 108; for (const l of wrap(ctx, d.client.address, colW - 40).slice(0, 2)) { txt(ctx, l, M + 20, cy, { size: 22, color: MUTED }); cy += 28; }
    if (d.client.phone) { txt(ctx, d.client.phone, M + 20, cy, { size: 22, color: MUTED }); cy += 28; }
    if (d.client.email) txt(ctx, d.client.email, M + 20, cy, { size: 22, color: MUTED });
    const x2 = M + colW + 50; txt(ctx, "QUOTE DETAILS", x2, y + 36, { bold: true, size: 18, color: TEAL });
    const kv = [["Date", d.date], ["Valid until", d.validUntil], ["Reference", d.ref]]; if (d.sageRef) kv.push(["Sage quote no.", d.sageRef]); if (d.staff) kv.push(["Prepared by", d.staff]);
    kv.forEach((r, i) => { txt(ctx, r[0], x2, y + 74 + i * 33, { size: 22, color: MUTED }); txt(ctx, r[1], x2 + 190, y + 74 + i * 33, { size: 22, bold: true }); });
    y += 215 + 30;
    // pool summary and rough plan
    if (d.plan) {
      const ph = 300, pw = 600;
      plan(ctx, W - M - pw, y, pw, ph, d.plan);
      txt(ctx, "WHAT WE WORKED OUT", M, y + 30, { bold: true, size: 18, color: TEAL });
      const rows = d.summary || []; rows.forEach((r, i) => { txt(ctx, r[0], M, y + 76 + i * 42, { size: 22, color: MUTED }); txt(ctx, r[1], M + 240, y + 76 + i * 42, { size: 22, bold: true }); });
      y += ph + 30;
    }
    // custom sauna: rough plan picture beside the key facts
    if (sImg) {
      const iw = 460, ih =Math.round(iw * sImg.height / sImg.width), bh = Math.max(ih, 260) + 30;
      if (y + bh > H - 150) newPage(false);
      ctx.drawImage(sImg, W - M - iw, y, iw, ih); ctx.strokeStyle = LINE; ctx.lineWidth = 2; ctx.strokeRect(W - M - iw, y, iw, ih);
      txt(ctx, "YOUR SAUNA, PLAN VIEW", M, y + 30, { bold: true, size: 18, color: TEAL });
      (d.saunaRows || []).forEach((r, i) => { txt(ctx, r[0], M, y + 76 + i * 42, { size: 22, color: MUTED }); txt(ctx, r[1], M + 240, y + 76 + i * 42, { size: 22, bold: true }); });
      txt(ctx, "Indicative plan, confirmed after the site visit", M, y + ih - 6, { size: 18, color: MUTED });
      y += bh;
    }
    // equipment by group
    const rowFont = "23px " + FONT, cDesc = M + 100, wDesc = 520, cQty = 790, cUnit = 970, cTot = W - M;
    const head = () => { ctx.fillStyle = TEAL; rr(ctx, M, y, W - M * 2, 46, 8); ctx.fill(); txt(ctx, "Item", cDesc, y + 31, { bold: true, size: 20, color: "#fff" }); txt(ctx, "Qty", cQty, y + 31, { bold: true, size: 20, color: "#fff", align: "center" }); txt(ctx, "Price each", cUnit, y + 31, { bold: true, size: 20, color: "#fff", align: "right" }); txt(ctx, "Total", cTot - 14, y + 31, { bold: true, size: 20, color: "#fff", align: "right" }); y += 46 + 8; };
    head();
    for (const [key, title] of GROUPS) {
      const g = d.lines.filter(l => l.grp === key); if (!g.length) continue;
      if (y + 150 > H - 150) { newPage(false); head(); }
      icon(ctx, ICON[key] || key, M + 6, y + 6, 78); txt(ctx, title, cDesc, y + 40, { bold: true, size: 26, color: TEAL });
      ctx.strokeStyle = LINE; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cDesc, y + 56); ctx.lineTo(W - M, y + 56); ctx.stroke(); y += 78;
      for (const l of g) {
        ctx.font = rowFont; const lines = wrap(ctx, l.desc, wDesc), noteL = l.note ? wrap(ctx, l.note, wDesc) : [], rh = Math.max(46, lines.length * 30 + noteL.length * 26 + 16);
        if (y + rh > H - 150) { newPage(false); head(); }
        lines.forEach((t, i) => txt(ctx, t, cDesc, y + 28 + i * 30, { size: 23 }));
        noteL.forEach((t, i) => txt(ctx, t, cDesc, y + 28 + lines.length * 30 + i * 26 - 2, { size: 19, color: MUTED }));
        txt(ctx, String(l.qty), cQty, y + 28, { size: 23, align: "center" });
        if (l.price != null) { txt(ctx, R(l.unit), cUnit, y + 28, { size: 23, align: "right" }); txt(ctx, R(l.total), cTot - 14, y + 28, { size: 23, bold: true, align: "right" }); }
        else txt(ctx, "Price on request", cTot - 14, y + 28, { size: 21, align: "right", color: MUTED });
        y += rh;
      }
      y += 8;
    }
    // totals
    if (y + 250 > H - 150) newPage(false);
    const tx0 = 560;
    y += 6; ctx.strokeStyle = TEAL; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx0, y); ctx.lineTo(W - M, y); ctx.stroke(); y += 6;
    [["Subtotal excluding VAT", R(d.ex), false], ["VAT 15%", R(d.vat), false], ["TOTAL INCLUDING VAT", R(d.total), true]].forEach(r => { txt(ctx, r[0], tx0, y + 36, { size: r[2] ? 26 : 23, bold: r[2], color: r[2] ? TEAL : INK }); txt(ctx, r[1], cTot - 14, y + 36, { size: r[2] ? 32 : 23, bold: r[2], align: "right", color: r[2] ? TEAL : INK }); y += r[2] ? 54 : 40; });
    if (d.onRequest) { txt(ctx, d.onRequest + " item" + (d.onRequest > 1 ? "s are" : " is") + " marked \"price on request\" and not in the total. We will confirm the price.", W - M, y + 20, { size: 20, color: "#b3261e", align: "right" }); y += 36; }
    y += 30;
    // optional extras: shown, not added to the total
    if (d.optional && d.optional.length) {
      if (y + 120 > H - 150) newPage(false);
      txt(ctx, "OPTIONAL EXTRAS (not included in the total above)", M, y + 20, { bold: true, size: 18, color: TEAL }); y += 34;
      for (const o of d.optional) {
        ctx.font = rowFont; const ol = wrap(ctx, o.desc, 760), nl = o.note ? wrap(ctx, o.note, 760) : [], rh = Math.max(44, ol.length * 30 + nl.length * 26 + 14);
        if (y + rh > H - 150) newPage(false);
        ol.forEach((t, i) => txt(ctx, t, M + 10, y + 28 + i * 30, { size: 23 }));
        nl.forEach((t, i) => txt(ctx, t, M + 10, y + 28 + ol.length * 30 + i * 26 - 2, { size: 19, color: MUTED }));
        txt(ctx, o.price != null ? R(o.total) : "Price on request", cTot - 14, y + 28, { size: o.price != null ? 23 : 21, bold: o.price != null, align: "right", color: o.price != null ? INK : MUTED });
        ctx.strokeStyle = LINE; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(M, y + rh - 4); ctx.lineTo(W - M, y + rh - 4); ctx.stroke(); y += rh;
      }
      y += 24;
    }
    // terms
    ctx.font = "20px " + FONT; const tl = []; TERMS.forEach(t => wrap(ctx, "• " + t, W - M * 2).forEach((s, i) => tl.push(i ? "   " + s : s)));
    if (y + tl.length * 28 + 60 > H - 120) newPage(false);
    txt(ctx, "TERMS", M, y + 20, { bold: true, size: 18, color: TEAL }); y += 44; tl.forEach(s => { txt(ctx, s, M, y, { size: 20, color: MUTED }); y += 28; });
    // footers
    pages.forEach((p, i) => { const c = p.getContext("2d"); c.fillStyle = AQUA; c.fillRect(M, H - 118, W - M * 2, 3); txt(c, CO.name + " · " + CO.reg, M, H - 84, { size: 19, color: MUTED }); txt(c, CO.addr, M, H - 56, { size: 19, color: MUTED }); txt(c, CO.contact, M, H - 28, { size: 19, color: MUTED }); txt(c, "Page " + (i + 1) + " of " + pages.length, W - M, H - 28, { size: 19, color: MUTED, align: "right" }); });
    return pages;
  }

  /* ---------- PDF: one JPEG per A4 page ---------- */
  function jpegBytes(cv) { const b = atob(cv.toDataURL("image/jpeg", 0.85).split(",")[1]), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function pdf(pages) {
    const enc = new TextEncoder(), parts = [], offs = []; let len = 0;
    const push = x => { const b = typeof x === "string" ? enc.encode(x) : x; parts.push(b); len += b.length; };
    const n = pages.length, kids = pages.map((_, i) => (3 + i * 3) + " 0 R").join(" ");
    push("%PDF-1.4\n%âãÏÓ\n");
    offs[1] = len; push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    offs[2] = len; push("2 0 obj\n<< /Type /Pages /Kids [" + kids + "] /Count " + n + " >>\nendobj\n");
    pages.forEach((cv, i) => {
      const pg = 3 + i * 3, ct = pg + 1, im = pg + 2, jb = jpegBytes(cv), content = "q 595.28 0 0 841.89 0 0 cm /Im0 Do Q";
      offs[pg] = len; push(pg + " 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 " + im + " 0 R >> >> /Contents " + ct + " 0 R >>\nendobj\n");
      offs[ct] = len; push(ct + " 0 obj\n<< /Length " + content.length + " >>\nstream\n" + content + "\nendstream\nendobj\n");
      offs[im] = len; push(im + " 0 obj\n<< /Type /XObject /Subtype /Image /Width " + cv.width + " /Height " + cv.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jb.length + " >>\nstream\n"); push(jb); push("\nendstream\nendobj\n");
    });
    const total = 3 + n * 3, xref = len; let x = "xref\n0 " + total + "\n0000000000 65535 f \n";
    for (let i = 1; i < total; i++) x += String(offs[i]).padStart(10, "0") + " 00000 n \n";
    push(x + "trailer\n<< /Size " + total + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");
    return new Blob(parts, { type: "application/pdf" });
  }
  function b64(blob) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(blob); }); }

  window.HWXQuote = { build, pdf, b64, VALID_DAYS, GROUPS, R };
})();
