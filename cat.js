/* Shop counter categories (spa, sauna, steam room, water reticulation, water features, anything else): quick picks, search and small sizing helpers.
   Items come from catdata.js (every active Sage item, built by shop\build_catalogue.ps1); "Refresh stock" replaces the prices and quantities with the live list.
   Sizing helpers use PROPOSED rules: SAU-HTR-03/-09/-11 and STM-EQP-08/-09 (book 01). Nothing here is a CONFIRMED rule. */
(function () {
  const D = window.HWXCatData || { asof: "", items: [] }, MAP = {};
  D.items.forEach(i => { MAP[i[0]] = { code: i[0], desc: i[1], price: i[2], qty: i[3] }; });
  const get = c => MAP[c] || null;
  function setStock(items) { items.forEach(x => { const m = MAP[x[0]]; if (m) { m.desc = x[1] || m.desc; m.price = x[2]; m.qty = x[3]; } else MAP[x[0]] = { code: x[0], desc: x[1], price: x[2], qty: x[3] }; }); }
  function search(q, n) {
    const t = String(q || "").toLowerCase().split(/\s+/).filter(Boolean); if (!t.length) return [];
    const out = [];
    for (const k in MAP) { const m = MAP[k], c = m.code.toLowerCase(), h = c + " " + m.desc.toLowerCase(); if (t.every(w => h.includes(w))) out.push({ m, s: (c === t[0] ? 0 : c.startsWith(t[0]) ? 1 : 2) + (m.price > 0 ? 0 : 5) + (m.qty > 0 ? 0 : 0.5) }); }
    return out.sort((a, b) => a.s - b.s || a.m.desc.length - b.m.desc.length).slice(0, n || 30).map(x => x.m);
  }

  const CATS = [
    { key: "pool", title: "Pool equipment", sub: "Pump, filter, weirs, returns, pipe and control box worked out for you", icon: "pump" },
    { key: "spa", title: "Spa", sub: "Superior spas with the optional extras", icon: "spa" },
    { key: "sauna", title: "Sauna", sub: "Design a custom sauna step by step, or pick ready-made saunas, heaters and parts", icon: "sauna" },
    { key: "steam", title: "Steam room", sub: "Steam generator sized from the room", icon: "steam" },
    { key: "reticulation", title: "Water reticulation", sub: "Pumps, tanks and water treatment parts", icon: "tap" },
    { key: "feature", title: "Water features", sub: "Nozzles, pumps, lights, rain curtains", icon: "fountain" },
    { key: "other", title: "Anything else", sub: "Search the whole Sage list or type your own item", icon: "box" },
  ];
  const QUICK = {
    spa: [["Other spa items", ["SSASO", "SSMSB", "SC8EC", "SSHR", "SSDSC", "FCSSDE", "EDBBSDS", "EDBBSM", "SESHP"]]],
    sauna: [["Stand-alone saunas", ["SSAC2", "SSAC4"]], ["Heaters", ["SAO6", "SAO9C", "SAO9M", "SAO12"]], ["Controllers and stones", ["SACS", "SACLP", "SAVR"]], ["Lights", ["LSA", "SDL", "SSL"]], ["Glass, vents and fittings", ["SGDP", "SAAWVI", "SAAWVO", "SAAWBR", "SAAWP", "SAAWST", "WSSS", "SEC", "SAL-50mm"]]],
    steam: [["Steam generators and parts", ["STG9", "STG12", "STAAP", "STAMB", "SAG3"]]],
    reticulation: [["Pumps", ["PLX1.1", "PLX1.2", "PLX0.68"]], ["Tanks and treatment", ["BT", "FWBBUVL", "FWBBCB"]]],
    feature: [["Nozzles", ["NOL20", "NOL36", "NOS22", "Nov-37", "NOGV30", "ONC50", "ONS35LED", "ONS55", "ONV43S"]], ["Pumps", ["PHX8810", "PHX8815", "PHX8820", "PHX8825", "PHX8830", "PHX8840", "PHX8860", "PHD20000", "PHD30000", "PP8000", "PP20000"]], ["Lights", ["LO10", "LOCS1LED", "LOCS3LED", "LMPK36S3", "LMPK60C"]], ["Rain curtains", ["WRCC1", "WDRE315L", "WDRE615L"]], ["Filters and control", ["OF1500", "OF3000", "OF6000", "OBF6000", "OFS12", "OAS40", "EDBBWFS"]]],
  };
  const SPA = { Atlantic: { B: "SSRAB", D: "SSRAD", EX: "SSRAEX", EL: "SSRAE" }, Baracuda: { B: "SSRBCB", D: "SSRBCD", EX: "SSRBCEX", EL: "SSRBCEL" }, Buddy: { B: "SSRBB", D: "SSRBD", EX: "SSRBEX", EL: "SSRBEL" }, Caribbean: { B: "SSRCB", D: "SSRCD", EX: "SSRCEX", EL: "SSRCEL" }, Jumbo: { B: "SSRJB", D: "SSRJD", EX: "SSRJEX", EL: "SSRJEL" } };
  const GRADES = [["B", "Base"], ["D", "De Lux"], ["EX", "Executive"], ["EL", "Elite"]];
  const INSTALL = [["Installation, easy site", 7500], ["Installation, medium site", 10500], ["Installation, difficult site", 15500]];   // SPA-QTE-01: ex VAT assumed, tier decided after the site visit
  const HTC = [["HTC", "Under 4 m2"], ["HTCB", "4 to 5 m2"], ["HTCB5", "Over 5 m2"]];

  // Sauna heater from the effective volume (SAU-HTR-03: net volume + 1.2 m3 per m2 of glass, tile or masonry; SAU-HTR-09 COASTS ranges, PROPOSED)
  function sauna(L, W, H, glass) {
    const net = L * W * H, eff = net + 1.2 * (glass || 0); if (!(net > 0)) return { error: "Enter the length, width and height of the room." };
    let code = eff <= 9.1 ? "SAO6" : eff <= 13 ? "SAO9C" : "SAO12", note = "";
    if (eff < 5) note = "Small room: 6 kW is the smallest heater in stock.";
    if (code === "SAO12") note = "SAO12 is not a COASTS model we have identified yet (SAU-HTR-11 is open): ask the office before quoting. Over 13 m3 may need a site visit.";
    return { net: Math.round(net * 10) / 10, eff: Math.round(eff * 10) / 10, code, note };
  }
  // Steam generator from the net volume of the steam enclosure (STM-EQP-08, PROPOSED; sizes 4, 6, 9, 12, 18 kW; 12 kW and up feed two steam heads, STM-EQP-09)
  // Glass front, or cold tile, stone or masonry walls: size up ONE step from the net volume (the rule's own allowance), not a volume allowance.
  function steam(L, W, H, cold) {
    const net = L * W * H; if (!(net > 0)) return { error: "Enter the length, width and ceiling height of the steam room." };
    const SIZES = [4, 6, 9, 12, 18], at = net <= 5 ? 0 : net <= 7 ? 1 : net <= 11 ? 2 : net <= 14 ? 3 : net <= 22 ? 4 : -1;
    if (at < 0) return { error: "That steam room is over 22 m3: needs a site visit." };
    const up = cold && at < 4, kw = SIZES[up ? at + 1 : at], code = kw === 9 ? "STG9" : kw === 12 ? "STG12" : "";
    let note = "Net volume " + (Math.round(net * 10) / 10) + " m3" + (up ? ", sized up one step for the glass or cold surfaces (" + SIZES[at] + " kW to " + kw + " kW)." : cold ? ", already the largest size." : ".");
    if (net < 3) note += " This is below the smallest COASTS range (3 m3): check with the office.";
    if (!code) note += " " + kw + " kW has no Sage code yet (STM-EQP-06): the price comes from the supplier.";
    if (kw >= 12) note += " 12 kW and up feed two steam heads.";
    return { net: Math.round(net * 10) / 10, eff: Math.round(net * 10) / 10, kw, code, note };
  }
  window.HWXCat = { asof: D.asof, get, setStock, search, CATS, QUICK, SPA, GRADES, INSTALL, HTC, sauna, steam };
})();
