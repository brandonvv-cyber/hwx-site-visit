/* Repairs and fittings at the counter: tap the fault, check the parts, labour comes from the hours (Sage item LAB).
   Starter list from the symptom guides in the Fault-finding, Repair Quotes and Invoicing SOP (section 5, all PROPOSED). Nothing here is CONFIRMED except what the SOP confirms:
   FLT-QTE-01 call-out fee R650, credited on the invoice if the client goes ahead (NOT built into this screen yet: see the note shown on it).
   PROPOSED, not confirmed by Brandon: every hours figure below, which parts belong to which job, and the "also consider" lists.
   A part that Sage does not have (code missing, or no code) is added as "price from the supplier" for the office. */
(function () {
  const C = () => window.HWXCat;
  const CAPS = ["C12UL", "C16U", "C25U", "C25UL", "C30U", "C30UL"], BEAR = ["B6202", "B6203", "B6205"];
  const GROUPS = [["Pump", "Pool and spa pump"], ["Filter", "Filter and valve"], ["Spa", "Spa"], ["Pool", "Pool equipment"], ["Plumbing", "Leaks and plumbing"], ["Service", "Services"]];
  // parts: code (fixed) or pick (choose one, first with a price is the default); qty default; custom = not in Sage
  const JOBS = [
    { id: "cap", g: "Pump", name: "Replace pump capacitor", sym: "Pump hums or will not start", h: 1, parts: [{ label: "Capacitor (match the motor plate)", pick: CAPS, qty: 1 }], ex: [{ label: "Mechanical seal, Emaux SB", code: "PESBMS", qty: 1 }, { label: "Bearings", pick: BEAR, qty: 2 }] },
    { id: "seal", g: "Pump", name: "Replace pump mechanical seal", sym: "Pump leaks at the shaft", h: 2, parts: [{ label: "Mechanical seal, Emaux SB 3/4", code: "PESBMS", qty: 1 }, { label: "Lid o-ring, Emaux SB", code: "PESBLOR", qty: 1 }], ex: [{ label: "Bearings", pick: BEAR, qty: 2 }, { label: "Capacitor", pick: CAPS, qty: 1 }] },
    { id: "bear", g: "Pump", name: "Replace pump bearings", sym: "Pump noisy or hot", h: 2.5, parts: [{ label: "Bearings (set of 2)", pick: BEAR, qty: 2 }], ex: [{ label: "Mechanical seal, Emaux SB", code: "PESBMS", qty: 1 }, { label: "Capacitor", pick: CAPS, qty: 1 }] },
    { id: "lid", g: "Pump", name: "Pump lid o-ring", sym: "Will not prime, air in the system", h: 0.5, parts: [{ label: "Lid o-ring", pick: ["PESBLOR", "PEEPLOR", "PEAMLOR"], qty: 1 }], ex: [{ label: "Pump basket, Emaux SB", code: "PESBB", qty: 1 }] },
    { id: "bask", g: "Pump", name: "Replace pump basket", sym: "Basket cracked or missing", h: 0.25, parts: [{ label: "Pump basket, Emaux SB", code: "PESBB", qty: 1 }], ex: [{ label: "Lid o-ring, Emaux SB", code: "PESBLOR", qty: 1 }] },
    { id: "uni", g: "Pump", name: "Replace pump unions", sym: "Air leak or drip at the pump", h: 1, parts: [{ label: "Union adaptor 63 mm", code: "PEEPHU63", qty: 2 }, { label: "Union o-ring", code: "PEEPHUOR", qty: 2 }, { label: "Union ring lock nut", code: "PEEPHUR", qty: 2 }], ex: [] },
    { id: "pump", g: "Pump", name: "Swap the pump (same size)", sym: "Pump beyond repair", h: 2, parts: [{ label: "Pump (match the old one)", pick: ["PESB10", "PESB15", "PESB20", "PESB30", "PESP1", "PESP15", "PESS075", "PESS12"], qty: 1 }], ex: [{ label: "Union adaptor 63 mm", code: "PEEPHU63", qty: 2 }, { label: "Solvent cement 237 ml", code: "SCWO237", qty: 1 }, { label: "Capacitor spare", pick: CAPS, qty: 1 }] },
    { id: "sand", g: "Filter", name: "Change filter sand", sym: "Pressure high, dirty water after backwash", h: 2, parts: [{ label: "Silica sand, bags (about 4 for a 650 mm filter)", code: "FMSS", qty: 4 }], ex: [{ label: "Filter neck o-ring, Emaux", code: "FESLO", qty: 1 }, { label: "Filter lateral V1200", code: "FEL1200", qty: 1 }] },
    { id: "mpvg", g: "Filter", name: "Multiport valve gaskets", sym: "Valve leaks or will not hold its position", h: 1.5, parts: [{ label: "Spider gasket", code: "ME2SG", qty: 1 }, { label: "Wagon wheel gasket", code: "MPVWG", qty: 1 }, { label: "Lid o-ring 1.5 in", code: "MELOR", qty: 1 }], ex: [] },
    { id: "mpv", g: "Filter", name: "Replace multiport valve 1.5 in", sym: "Valve cracked or beyond repair", h: 2, parts: [{ label: "Multiport valve 1.5 in side mount", code: "ME112S", qty: 1 }], ex: [{ label: "Solvent cement 237 ml", code: "SCWO237", qty: 1 }, { label: "Filter union 1.5 in with sight glass", code: "FEU112", qty: 1 }] },
    { id: "flid", g: "Filter", name: "Filter lid o-ring", sym: "Leak at the filter lid", h: 0.5, parts: [{ label: "Lid or neck o-ring", pick: ["FSALOR", "FSLORL", "FESLO", "FENOR"], qty: 1 }], ex: [] },
    { id: "cart", g: "Filter", name: "Replace cartridge element", sym: "Weak flow, filter dirty", h: 0.5, parts: [{ label: "Cartridge element (match the filter)", pick: ["FCSSDE", "FCE75E", "FCE50E", "FCE100E", "FCE150E", "FCQE25"], qty: 1 }], ex: [{ label: "Filter cleanse 1 l", code: "CWFC1", qty: 1 }] },
    { id: "light", g: "Spa", name: "Replace spa light", sym: "Spa light not working", h: 1, parts: [{ label: "Spa light (match the old one)", pick: ["LEELX", "LAELB", "LAELRGB", "LAELW"], qty: 1 }], ex: [{ label: "Control unit, ColorTouch and E-Lumen X", code: "LECB", qty: 1 }] },
    { id: "abut", g: "Spa", name: "Replace air button", sym: "Pump or blower will not start from the button", h: 1, parts: [{ label: "Air button, Nixin stainless", code: "NABS", qty: 1 }], ex: [] },
    { id: "elem", g: "Spa", name: "Replace spa heater element", sym: "Spa not heating", h: 2, parts: [{ label: "Heater element (not in Sage: price from the supplier)", custom: true, qty: 1 }], ex: [{ label: "Thermostat and high-limit (not in Sage: price from the supplier)", custom: true, qty: 1 }] },
    { id: "cell", g: "Pool", name: "Replace chlorinator cell", sym: "Salt chlorinator not producing", h: 1.5, parts: [{ label: "Electrolytic cell", code: "CESC", qty: 1 }], ex: [{ label: "Salt cell cleaner 1 l", code: "CBSSC1", qty: 1 }, { label: "Test kit", code: "CSTK", qty: 1 }] },
    { id: "hpf", g: "Pool", name: "Heat pump flow switch", sym: "Heat pump says no flow or will not heat", h: 1.5, parts: [{ label: "Heat pump water flow switch", code: "HPWFS", qty: 1 }], ex: [{ label: "Heat pump controller", code: "HPC", qty: 1 }] },
    { id: "un", g: "Plumbing", name: "Replace a leaking union", sym: "Drip at a union", h: 1, parts: [{ label: "Union (match the pipe size)", pick: ["UP50", "UUP63", "UPH32", "FEU112", "FEU2"], qty: 1 }, { label: "Solvent cement 237 ml", code: "SCWO237", qty: 1 }], ex: [] },
    { id: "bv", g: "Plumbing", name: "Replace a ball valve", sym: "Valve will not close or leaks", h: 1, parts: [{ label: "Ball valve (match the pipe size)", pick: ["PBV32S", "PBV40S", "PBV50S", "PBV63S", "PBV50SU", "PBV50DU", "PBV63SU", "PBV63DU"], qty: 1 }, { label: "Solvent cement 237 ml", code: "SCWO237", qty: 1 }], ex: [{ label: "Straight connector (match the pipe size)", pick: ["PS32", "PS40", "PS50", "PS63"], qty: 2 }] },
    { id: "nrv", g: "Plumbing", name: "Replace non-return valve", sym: "Water runs back, pump loses prime", h: 1, parts: [{ label: "Non-return valve (match the pipe size)", pick: ["PNRV50", "PCV50", "PCV63"], qty: 1 }, { label: "Solvent cement 237 ml", code: "SCWO237", qty: 1 }], ex: [] },
    { id: "cut", g: "Plumbing", name: "Cut out and re-glue a cracked pipe", sym: "Cracked pipe or fitting", h: 1.5, parts: [{ label: "Straight connectors (match the pipe size)", pick: ["PS32", "PS40", "PS50", "PS63"], qty: 2 }, { label: "Pipe, metres (match the size)", pick: ["PP329", "PP409", "PP509", "PP639"], qty: 1 }, { label: "Solvent cement 237 ml", code: "SCWO237", qty: 1 }], ex: [] },
    { id: "putty", g: "Plumbing", name: "Quick leak repair putty", sym: "Small leak, temporary fix", h: 0.5, parts: [{ label: "Quick leak repair putty", code: "QLRP", qty: 1 }], ex: [] },
    { id: "ssmi", g: "Service", name: "Mini spa service", sym: "Filter, spa tabs and floater included", h: 0, parts: [{ label: "Mini spa service (Sage)", code: "SSMIS", qty: 1 }], ex: [] },
    { id: "ssma", g: "Service", name: "Major spa service", sym: "Components included", h: 0, parts: [{ label: "Major spa service (Sage)", code: "SSMAS", qty: 1 }], ex: [] },
    { id: "shp", g: "Service", name: "Service a heat pump", sym: "Yearly service", h: 0, parts: [{ label: "Heat pump service (Sage)", code: "SHP", qty: 1 }], ex: [] },
  ];
  // service-type Sage items: no stock to check
  const SERVICE = ["LAB", "Travel", "SSMIS", "SSMAS", "SHP", "DIS", "DIM", "DIH", "WT", "Con"];

  const has = c => !!(c && C().get(c));
  const priced = c => { const m = c && C().get(c); return !!(m && m.price > 0); };
  const dflt = p => (p.pick.find(priced) || p.pick.find(has) || p.pick[0]);
  const newState = () => ({ g: "Pump", job: "", pick: {}, qty: {}, ex: {}, hours: "", km: "" });
  const jobOf = id => JOBS.find(j => j.id === id) || null;
  const code = (it, st, key) => it.pick ? ((st.pick || {})[key] && it.pick.includes(st.pick[key]) ? st.pick[key] : dflt(it)) : it.code;

  function calc(st) {
    st = st || newState(); const job = jobOf(st.job), lines = []; if (!job) return { job: null, lines, total: 0, unpriced: 0, hours: 0 };
    const add = (it, key, q) => {
      if (q <= 0) return; const c = code(it, st, key), m = c && C().get(c);
      if (c && m) lines.push({ code: c, qty: q, label: it.label, desc: m.desc, price: m.price, onhand: m.qty });
      else lines.push({ code: "", qty: q, label: it.label, desc: it.label, price: null, onhand: null });
    };
    job.parts.forEach((p, i) => add(p, "p" + i, st.qty["p" + i] != null ? +st.qty["p" + i] : p.qty));
    job.ex.forEach((e, i) => { if (st.ex["x" + i]) add(e, "x" + i, st.qty["x" + i] != null ? +st.qty["x" + i] : e.qty); });
    const hours = st.hours === "" || st.hours == null ? job.h : Math.max(0, +String(st.hours).replace(",", ".") || 0);
    if (hours > 0) { const m = C().get("LAB"); lines.push(m ? { code: "LAB", qty: hours, label: "Labour", desc: m.desc, price: m.price, onhand: null } : { code: "", qty: hours, label: "Labour", desc: "Labour", price: null, onhand: null }); }
    const km = Math.max(0, Math.round(+String(st.km || "").replace(",", ".") || 0));
    if (km > 0) { const m = C().get("Travel"); lines.push(m ? { code: "Travel", qty: km, label: "Travel", desc: m.desc, price: m.price, onhand: null } : { code: "", qty: km, label: "Travel (km)", desc: "Travel (km)", price: null, onhand: null }); }
    const total = lines.reduce((s, l) => s + (l.price > 0 ? l.price * l.qty : 0), 0);
    return { job, lines, total, unpriced: lines.filter(l => !(l.price > 0)).length, hours, km };
  }
  window.HWXJobs = { GROUPS, JOBS, SERVICE, newState, jobOf, code, dflt, calc, priced, has };
})();
