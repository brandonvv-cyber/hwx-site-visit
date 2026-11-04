"use strict";
// HWX spec engine (EC-010, 4 Nov 2026): pool circulation kit from volume, pump position, distance and bends.
// Rules: DR-001 (volume -> turnover -> flow -> pump) and DR-002 (head and pipe friction), both DRAFT. Same brain for the shop counter and, later, the technician app.
// Prices: SNAP is the Sage item list of 19 Oct 2026 (selling price ex VAT, qty on hand); "Refresh stock" replaces it with the latest feed.
(function (root) {
  const SNAP = {"PSP10":["Speck Porpoise 10 .45Kw",4726.68,0],"PSP16":["Speck Porpoise 16 .75Kw",5003.1,1],"PSP22":["Speck Porpoise 22 1.1Kw",6409.68,0],"PESS075":["Pump Emaux SS 0.75Kw 230V",4101.03,0],"PESS12":["pump emaux ss0.97kw 230v 50mmunion 1.5hp",3353.53,0],"PESP15":["Pump Emaux Super Power 1.1KW",6036.12,2],"PESB15":["Pump Emaux SB 1.3Kw 230V",7252.15,0],"PESB20":["pump Emaux SB1.8kw 230v63mm union 2.0HP",7555.91,0],"PESB30":["PUMP EMAUX SB 2.2KW 230V 63MM UNION 3.OHP",9725.97,0],"PQSF7.5":["Quality Superflo Pump 0.75kW",4677,0],"PQSF1.1":["Quality Superflo Pump 1.1kW",4768.54,0],"PWIC30":["InverCaptain Pool Pump 1.1kw 220v",15651.3,0],"PEEPV15WR":["Pump Emaux EPV 1.3kw WIFI",23325.5,1],"PWIC40":["InverCaptain Pool Pump 1.75kW, 220V",18260,0],"FS2":["Sand Filter Speck 2 bag",4721.58,1],"FS3":["Sand Filter Speck 3 Bag",5001.06,0],"FS4":["Sand Filter Speck 4 bag",5572.26,0],"FCQ25":["Cartridge Filter Quality Holder - Cartridge sold separately",1692.54,1],"FCQE25":["Cartirdge Filter Quality 25ft Cartridge Element",550,4],"FES28":["Emaux Fibreglass Sand Filter - 5 Bag (1.5 Side Valve)",8686.53,0],"FES32":["Sand Filter Emaux 800mm dia 8",14413.79,1],"FMSS":["Filter Media Silica Sand",143,4],"WSV":["Weir Speck Vinyl",854.76,0],"WSG":["Weir Speck Gunite",765,0],"NDSS250":["Nixin Dual Suction Skimmer 250mm",2632,2],"AGW":["Aimflow Gunite - White",215.56,6],"NAABS":["Nixin Aimflow \u0026 Adjustable Ball - Stainless Steel",1640,2],"PCR4":["Pool Pump Rock Cover No4",3587.99,1],"EQPDB18VA":["Electrical Quality Pool DB Board 18VA",2448.02,0],"ECB10D":["Circuit Breaker 10A DinRail",64.9,0],"ECB16D":["Circuit Breaker 16 A DinRail",115.74,19],"ECB20D":["Circuit Breaker 20 A DinRail",76.13,3],"ECB25D":["Circuit Breaker 25 A DinRail",74.95,1],"ECB32D":["Circuit Breaker 32 A DinRail",393.12,12],"EPTSD":["Pool Timer - Slimline Dinrail (Hagar -EHN011)",1458,0],"EIS263W":["Waterproof Isolator 2P 63A",267.5,1],"PP509":["PVC Pipe Cl 9 50mm",56,80],"PP639":["PVC Pipe Cl 9 63 mm",54,99],"PP759":["PVC Pipe Cl 9 75mm",94.29,5],"PE9050":["HP PVC Elbow 90 Deg 50mm",53.38,128],"PE9063":["HP PVC Elbow 90 Deg 63mm",112.83,184],"PE9075":["HP PVC Elbow 90 Deg 75mm",125.88,2],"PT50":["HP PVC Tee 50mm",65.38,4],"PT63":["HP PVC Tee 63mm",83.16,22],"PT75":["HP PVC Tee 75mm",194.06,7],"PBV50S":["PVC Ball Valve 50mm std",110.43,42],"PBV63S":["PVC Ball Valve 63mm std",120.36,6],"UPH50":["Union High Pressure 50mm",65.21,3],"UUP63":["Union PVC 63mm",73.95,9],"PNRV50":["PVC Non Return Valve 50mm",477.31,11],"PNRV63":["Emaux non return valve 63mm",348.89,1],"PS50":["HP PVC Straight Connector - 50mm",29.28,9],"PS63":["HP PVC Straight Connector - 63mm",35.43,34],"PS75":["HP PVC Straight Connector - 75mm",95.04,4],"AGA2":["PVC Male Adaptor 50mm x 2 inch",21.37,2],"PMA502":["PVC Male Adaptor 50 X 63 X 2inch",54.31,14],"SCWO473":["Solvent Cement Weld-On 473ml",280,21]};

  // Pump classes with a generic curve Q(H) = Qmax * sqrt(1 - H / Hmax). ASSUMPTION until the maker's curves are loaded (DR-001 open item).
  const CLASSES = [{ kw: 0.45, hmax: 11, qmax: 13 }, { kw: 0.75, hmax: 13.5, qmax: 18 }, { kw: 1.1, hmax: 16, qmax: 22 }, { kw: 1.5, hmax: 17.5, qmax: 26 }, { kw: 2.2, hmax: 20, qmax: 32 }];
  const PUMPS = {   // brand -> [rated kW, Sage code], smallest model at or above the class is offered
    "Speck": [[0.45, "PSP10"], [0.75, "PSP16"], [1.1, "PSP22"]],
    "Emaux": [[0.75, "PESS075"], [0.97, "PESS12"], [1.1, "PESP15"], [1.3, "PESB15"], [1.8, "PESB20"], [2.2, "PESB30"]],
    "Quality": [[0.75, "PQSF7.5"], [1.1, "PQSF1.1"]],
    "WCSA": []
  };
  const VS_PUMPS = [[1.1, "PWIC30"], [1.3, "PEEPV15WR"], [1.75, "PWIC40"]];   // variable speed (DR-001 default for domestic)
  const BAGS_FOR_KW = kw => kw <= 0.55 ? 2 : kw <= 0.75 ? 3 : kw <= 1.1 ? 4 : kw <= 1.5 ? 5 : 8;   // trade pairing, as in the Sage Speck combis (PSC2 = Porpoise 10 + 2 bag, PSCS3 = Porpoise 16 + 3 bag)
  const FILTERS = {
    "Speck": b => b <= 2 ? ["FS2", 2] : b <= 3 ? ["FS3", 3] : b <= 4 ? ["FS4", 4] : null,
    "Quality": b => b <= 3 ? ["FCQ25", 0] : null,                       // cartridge, no sand
    "Emaux fibreglass": b => b <= 5 ? ["FES28", 5] : b <= 8 ? ["FES32", 8] : null,
    "Collar": () => ["", 0]                                             // not in the Sage list
  };
  const PIPE = { 50: { id: 0.0452, pipe: "PP509", elbow: "PE9050", tee: "PT50", valve: "PBV50S", union: "UPH50", nrv: "PNRV50", conn: "PS50", adapt: "AGA2" },
                 63: { id: 0.0570, pipe: "PP639", elbow: "PE9063", tee: "PT63", valve: "PBV63S", union: "UUP63", nrv: "PNRV63", conn: "PS63", adapt: "PMA502" },
                 75: { id: 0.0678, pipe: "PP759", elbow: "PE9075", tee: "PT75", valve: "", union: "", nrv: "", conn: "PS75", adapt: "" } };
  const BENDS = { "0-2": 2, "3-5": 5, "6-8": 8, "9+": 11 };   // DR-002 bands, upper value used
  const FIXED_HEAD = { filter: 5.0, fittings: 2.0 };             // m: sand filter + multiport mid-cycle, valves/NRV/returns. ASSUMPTION (DR-002 open item)

  const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;
  function hw(qm3h, id, len) { const q = qm3h / 3600; return 10.67 * Math.pow(q, 1.852) / (Math.pow(150, 1.852) * Math.pow(id, 4.87)) * len; }   // Hazen-Williams, PVC C = 150
  function qAt(c, h) { return h >= c.hmax ? 0 : c.qmax * Math.sqrt(1 - h / c.hmax); }
  function amps(kw) { return kw * 1000 / (230 * 0.7 * 0.85); }   // single phase 230 V, efficiency 0.7, power factor 0.85
  function item(code, qty, note) { const s = SNAP[code]; return { code, desc: s ? s[0] : "", price: s ? s[1] : 0, onhand: s ? s[2] : null, qty, note: note || (code ? (s ? "" : "Not in the Sage list") : "No Sage code: price from the supplier") }; }

  function run(inp) {
    const notes = [], flags = [];
    const volL = inp.volumeL > 0 ? inp.volumeL : (inp.len > 0 && inp.wid > 0 && inp.depth > 0 ? inp.len * inp.wid * inp.depth * 1000 : 0);
    if (!(volL > 0)) return { error: "Enter the volume, or the length, width and average depth." };
    const turnover = inp.turnover || (inp.use === "commercial" ? 4 : 6);
    const q = volL / 1000 / turnover;                                                 // DR-001 step 1
    const dia = q <= 10 ? 50 : q <= 18 ? 63 : 75, P = PIPE[dia];
    const dist = Math.max(1, +inp.distance || 0), bends = BENDS[inp.bends] || 5, weirs = Math.max(1, +inp.weirs || 1);
    const returns = +inp.returns || (volL <= 40000 ? 2 : volL <= 70000 ? 3 : 4);
    const statik = inp.pos === "above" ? (+inp.height || 0) : inp.pos === "below" ? -(+inp.height || 0) : 0;   // DR-002 Q1
    const eqLen = 2 * dist + 2 * bends * 30 * P.id;                                  // suction + return; each 90 deg bend = 30 x ID; the return run is taken to have as many bends as the suction run
    const fric = hw(q, P.id, eqLen);
    const tdh = Math.max(statik + fric + FIXED_HEAD.filter + FIXED_HEAD.fittings, 3);   // DR-002 total dynamic head
    let ci = CLASSES.findIndex(c => qAt(c, tdh) >= q); if (ci < 0) { ci = CLASSES.length - 1; flags.push("The flow and head are past the domestic pump range: commercial pump needed, ask Brandon (DR-001)."); }
    const cls = CLASSES[ci], next = CLASSES[Math.min(ci + 1, CLASSES.length - 1)];
    if (volL > 150000 || q > 25) flags.push("Over 150 kL or 25 m3/h: treat as a commercial pool (DR-001 flag).");
    if (dia === 75) flags.push("75 mm pipe: valves, unions and NRV are not in the Sage list at 75 mm; price them by hand.");
    if (statik < 0) notes.push("Pump below the water line: flooded suction, easy priming.");
    if (statik > 1.5) flags.push("Pump more than 1.5 m above the water: a self-priming pump and a non-return valve on the suction are needed.");

    // Equipment options (2-3 per tier)
    const cat = [];
    const pumpOpts = [];
    for (const b in PUMPS) {
      const m = PUMPS[b].find(p => p[0] >= cls.kw - 0.001);
      if (b === "WCSA" && !m) { pumpOpts.push(Object.assign(item("", 1, "No WCSA pump in the Sage list: price from WCSA"), { brand: "WCSA", kw: cls.kw })); continue; }
      if (m) pumpOpts.push(Object.assign(item(m[1], 1), { brand: b, kw: m[0] }));
    }
    const vs = VS_PUMPS.find(p => p[0] >= cls.kw - 0.001);
    if (vs) pumpOpts.unshift(Object.assign(item(vs[1], 1, "Variable speed: DR-001 default for domestic (quieter, lower power bill)"), { brand: "Variable speed", kw: vs[0] }));
    cat.push({ key: "pump", name: "Pump", opts: pumpOpts });

    const bags = BAGS_FOR_KW(cls.kw), filtOpts = [];
    for (const b in FILTERS) {
      const f = FILTERS[b](bags); if (!f) continue;
      const o = Object.assign(item(f[0], 1, b === "Collar" ? "Collar filter: not in the Sage list, price from the supplier" : ""), { brand: b, extra: [] });
      if (f[1] > 0) o.extra.push(item("FMSS", f[1], "Filter sand, " + f[1] + " bags"));
      if (b === "Quality") o.extra.push(item("FCQE25", 1, "Cartridge element"));
      filtOpts.push(o);
    }
    cat.push({ key: "filter", name: "Filter (" + bags + " bag size)", opts: filtOpts });
    cat.push({ key: "weir", name: "Weir x " + weirs, opts: [Object.assign(item("WSV", weirs), { brand: "Speck (vinyl)" }), Object.assign(item("WSG", weirs), { brand: "Speck (gunite)" }), Object.assign(item("NDSS250", weirs), { brand: "Nixin" })] });
    cat.push({ key: "return", name: "Returns x " + returns, opts: [Object.assign(item("AGW", returns), { brand: "Aimflow" }), Object.assign(item("NAABS", returns), { brand: "Nixin" })] });
    cat.push({ key: "cover", name: "Pump cover", opts: [Object.assign(item("PCR4", 1), { brand: "Rock" }), Object.assign(item("", 1, "Plastic pump cover: not in the Sage list, price from the supplier"), { brand: "Plastic" }), Object.assign(item("", 1, "Fibreglass pump cover: not in the Sage list, price from the supplier"), { brand: "Fibreglass" }), Object.assign(item("", 0, "No pump cover"), { brand: "None" })] });

    // Control box from the pump current (the chosen pump decides; shop.html calls control() again when the pick changes)
    const pipeM = Math.ceil((2 * dist + 3 * (weirs - 1) + 3 * (returns - 1)) * 1.1 / 6) * 6;
    const lengths = pipeM / 6;
    const fittings = [
      item(P.pipe, pipeM, "Pipe " + dia + " mm, " + lengths + " x 6 m lengths (Sage price taken per metre)"),
      item(P.elbow, bends * 2, "90 deg elbows: " + inp.bends + " bends each way"),
      item(P.tee, (weirs - 1) + (returns - 1)),
      item(P.valve, 2, "Isolating valves, suction and return"),
      item(P.union, 4, "Pump and filter unions"),
      item(P.nrv, 1, "Non-return valve"),
      item(P.conn, Math.max(0, lengths - 1), "Straight connectors at pipe joins"),
      item(P.adapt, 4, "Male adaptors at the pump and filter"),
      item("SCWO473", Math.max(1, Math.ceil(pipeM / 30)), "Solvent cement")
    ].filter(f => f.qty > 0 && f.code);
    if (dia === 75) fittings.push(item("", 2, "75 mm ball valves, unions x4, NRV: price by hand"));

    notes.push("Flow " + r1(q) + " m3/h (" + Math.round(q * 16.67) + " L/min) at " + turnover + " h turnover (DR-001).");
    notes.push("Head " + r1(tdh) + " m = " + r1(statik) + " m static + " + r1(fric) + " m pipe and bends + " + FIXED_HEAD.filter + " m filter + " + FIXED_HEAD.fittings + " m valves and returns (DR-002).");
    notes.push("Pump size " + cls.kw + "-" + next.kw + " kW; variable speed recommended for domestic (DR-001).");
    notes.push("Pipe " + dia + " mm (" + r1(q / 3600 / (Math.PI * P.id * P.id / 4)) + " m/s).");
    return { volL: Math.round(volL), q: r2(q), tdh: r1(tdh), kw: cls.kw, kwNext: next.kw, dia, returns, weirs, pipeM, cat, fittings, notes, flags, control };
  }
  function control(kw) {
    const a = amps(kw), brk = [10, 16, 20, 25].find(b => b >= a * 1.25) || 32, code = { 10: "ECB10D", 16: "ECB16D", 20: "ECB20D", 25: "ECB25D", 32: "ECB32D" }[brk];
    return { amps: r1(a), breaker: brk, cable: brk <= 16 ? "2.5 mm2" : "4 mm2",
      items: [item("EQPDB18VA", 1, "Pool DB board"), item(code, 1, brk + " A breaker for " + r1(a) + " A pump"), item("EPTSD", 1, "Pool timer"), item("EIS263W", 1, "Waterproof isolator at the pump")],
      text: "Pump about " + r1(a) + " A: " + brk + " A breaker, " + (brk <= 16 ? "2.5" : "4") + " mm2 cable, 30 mA earth leakage at the DB, isolator next to the pump." };
  }
  function setStock(items) { for (const r of items) SNAP[r[0]] = [r[1], +r[2] || 0, +r[3] || 0]; }
  root.HWXSpec = { run, control, setStock, SNAP, BENDS };
})(window);
