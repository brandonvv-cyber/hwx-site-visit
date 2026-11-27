/* Pipework and glue at the shop counter: pick the pipe size, the metres and the fittings; the solvent cement is worked out from the joints.
   Prices and stock come from Sage (cat.js). A fitting that Sage does not have in a size is simply not offered in that size.
   Rules: GEN-PIP-01 (Class 9 PVC-U solvent weld, 20 mm is Class 16) CONFIRMED; GEN-PIP-04 (valves inside a pump box or plant room) CONFIRMED.
   PROPOSED, not confirmed by Brandon: the cement allowance per joint (ML below, +25% waste) and labour per joint. */
(function () {
  const C = () => window.HWXCat;
  // Sage codes per pipe size. Pipe is priced per metre in Sage (same convention as the pool pipe list in spec.js).
  const SZ = {
    20: { cls: "Class 16", pipe: "PP2016", e90: "PE9020", e45: "PE4520", tee: "PT20", conn: "PS20", cap: "PEC20", valve: "PBV20S", adapt: "PAS20", clamp: "PCP20" },
    25: { cls: "Class 9", pipe: "PP259", e90: "PE9025", e45: "PE4525", conn: "PS25", adapt: "PMA2532" },
    32: { cls: "Class 9", pipe: "PP329", e90: "PE9032", e45: "PE4532", tee: "PT32", conn: "PS32", cap: "PEC32", valve: "PBV32S", union: "UPH32", adapt: "PAS32", clamp: "PCP32" },
    40: { cls: "Class 9", pipe: "PP409", e90: "PE9040", e45: "PE4540", tee: "PT40", conn: "PS40", cap: "PEC40", valve: "PBV40S", adapt: "PTB40" },
    50: { cls: "Class 9", pipe: "PP509", e90: "PE9050", e45: "PE4550", tee: "PT50", conn: "PS50", cap: "PEC50", valve: "PBV50S", union: "UP50", nrv: "PNRV50", adapt: "AGA2", clamp: "PCP50" },
    63: { cls: "Class 9", pipe: "PP639", e90: "PE9063", e45: "PE4563", tee: "PT63", conn: "PS63", cap: "PEC63", valve: "PBV63S", union: "UUP63", nrv: "PCV63", adapt: "PMA502", clamp: "PCP63" },
    75: { cls: "Class 9", pipe: "PP759", e90: "PE9075", tee: "PT75", conn: "PS75" },
    90: { cls: "Class 9", pipe: "PP909", conn: "PS90", clamp: "PCP90", warn: "Very few 90 mm fittings in Sage: ask the office." },
    110: { cls: "Class 9", pipe: "PP1109", e90: "PE90110", e45: "PE45110", warn: "Sage has no Class 9 110 mm pipe with a metre price: ask the office." },
  };
  // key, name, glued joints per piece, what it is
  const FIT = [
    ["e90", "90° elbow", 2, "Corner"], ["e45", "45° elbow", 2, "Gentle bend"], ["tee", "Tee", 3, "Branch"], ["conn", "Straight connector", 2, "Joins two pipes"],
    ["cap", "End cap", 1, "Blocks an end"], ["valve", "Ball valve", 2, "Isolating valve"], ["union", "Union", 2, "Pump or filter connection"], ["nrv", "Non-return valve", 2, "One-way"],
    ["adapt", "Threaded adaptor", 1, "To a pump, filter or tap"], ["bush", "Reducing bush", 1, "Steps down in size"], ["clamp", "Pipe clamp", 0, "Holds the pipe"],
  ];
  const ML = { 20: 2, 25: 3, 32: 4, 40: 6, 50: 8, 63: 12, 75: 16, 90: 22, 110: 30 };   // ml of cement per glued joint, PROPOSED (a 50 mm pool run of about 30 m works out to one 473 ml can, as spec.js assumes)
  const WASTE = 1.25;
  const SIZES = Object.keys(SZ).map(Number);

  const exists = c => !!(c && C().get(c));
  function bushes(dia) { return SIZES.filter(s => s < dia && exists("PRB" + dia + s)); }
  function code(dia, key, d) {
    if (key === "bush") { const s = d && d.bush && exists("PRB" + dia + d.bush) ? d.bush : bushes(dia)[bushes(dia).length - 1]; return s ? "PRB" + dia + s : ""; }
    const c = (SZ[dia] || {})[key]; return exists(c) ? c : "";
  }
  function newDesign(rate) { return { dia: 50, m: 0, f: { e90: 0, e45: 0, tee: 0, conn: 0, cap: 0, valve: 0, union: 0, nrv: 0, adapt: 0, bush: 0, clamp: 0 }, bush: "", autoConn: true, glue: "auto", labour: false, rate: rate || "" }; }
  function normalize(d) {
    if (!d || typeof d !== "object") d = newDesign();
    if (!SZ[d.dia]) d.dia = 50;
    d.m = Math.max(0, Math.min(2000, Math.round(+d.m || 0)));
    d.f = Object.assign(newDesign().f, d.f || {});
    for (const k in d.f) d.f[k] = Math.max(0, Math.min(500, Math.round(+d.f[k] || 0)));
    if (d.autoConn === undefined) d.autoConn = true;
    if (d.glue !== "none") d.glue = "auto";
    d.labour = !!d.labour; d.rate = d.rate == null ? "" : d.rate;
    const b = bushes(d.dia); if (!b.includes(+d.bush)) d.bush = b.length ? String(b[b.length - 1]) : "";
    return d;
  }
  const money = n => "R " + (Math.round(n * 100) / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Everything the design needs: lines for the basket, joints, cement, total.
  function calc(d) {
    d = normalize(d); const cat = C(), P = SZ[d.dia], lines = [], note = [];
    const autoConn = d.autoConn && d.m > 6 && code(d.dia, "conn") ? Math.ceil(d.m / 6) - 1 : 0;
    let joints = 0;
    const add = (c, q, label) => { if (!c || q <= 0) return; const m = cat.get(c); lines.push({ code: c, qty: q, label, desc: m ? m.desc : c, price: m ? m.price : 0, onhand: m ? m.qty : null }); };
    if (d.m > 0) add(code(d.dia, "pipe"), d.m, "Pipe");
    for (const [k, name, j] of FIT) {
      const q = d.f[k] + (k === "conn" ? autoConn : 0); if (q <= 0) continue;
      const c = code(d.dia, k, d); if (!c) continue;
      add(c, q, name); joints += q * j;
    }
    let ml = 0, cans = [];
    if (d.glue === "auto" && joints > 0) {
      ml = Math.ceil(joints * ML[d.dia] * WASTE);
      let n473 = Math.floor(ml / 473); const rem = ml - n473 * 473;
      let n237 = 0; if (rem > 0) { if (rem <= 237) n237 = 1; else n473++; }
      if (n473) add("SCWO473", n473, "Solvent cement 473 ml");
      if (n237) add("SCWO237", n237, "Solvent cement 237 ml");
    }
    const priced = lines.filter(l => l.price > 0), unpriced = lines.filter(l => !(l.price > 0));
    let total = priced.reduce((s, l) => s + l.price * l.qty, 0), labour = null;
    if (d.labour && joints > 0) {
      const r = parseFloat(String(d.rate).replace(",", "."));
      labour = { joints, price: r > 0 ? r : null, total: r > 0 ? r * joints : null };
      if (labour.total) total += labour.total;
    }
    if (d.m > 0 && d.m % 6) note.push("Pipe is sold in 6 m lengths: " + Math.ceil(d.m / 6) + " lengths for " + d.m + " m. Sage prices it per metre.");
    if (d.f.valve > 0) note.push("Valves must sit inside a pump box or plant room where they can be reached (GEN-PIP-04).");
    if (P.warn) note.push(P.warn);
    return { d, lines, joints, ml, autoConn, total, unpriced: unpriced.length, labour, note };
  }
  window.HWXPipe = { SZ, FIT, SIZES, ML, WASTE, newDesign, normalize, calc, code, bushes, money };
})();
