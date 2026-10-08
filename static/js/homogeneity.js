(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tv = (v, extra) => `<span class="tv${extra ? " " + extra : ""}" data-v="${v}"><span class="sw"></span>${v}</span>`;
  const pct = (x) => Math.round(x * 100);

  /* ---------- tooltip ---------- */
  const tip = $("#tip");
  function showTip(html, x, y) {
    tip.innerHTML = html; tip.classList.add("on");
    const r = tip.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > window.innerHeight - 8) top = y - r.height - 14;
    tip.style.left = Math.max(8, left) + "px"; tip.style.top = Math.max(8, top) + "px";
  }
  function hideTip() { tip.classList.remove("on"); }
  function bindTip(el, html) {
    el.addEventListener("pointermove", (e) => showTip(html, e.clientX, e.clientY));
    el.addEventListener("pointerleave", hideTip);
    el.addEventListener("focus", () => { const r = el.getBoundingClientRect(); showTip(html, r.left + r.width / 2, r.bottom); });
    el.addEventListener("blur", hideTip);
  }
  window.addEventListener("scroll", hideTip, { passive: true });

  /* ---------- dataset generator (port of generate_dataset.py) ---------- */
  const NW = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten" };
  const SIZES = [4, 5, 6, 8, 10];
  const BINS = ["near_none", "half", "near_all"];
  const BIN_LABEL = { near_none: "1 of N", half: "about half", near_all: "N−1 of N" };
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const verb = (past, base) => ({ pos_pl: past, pos_sg: past, ell_pl: "did not", ell_sg: "did not", neg: "didn't " + base });
  const cop = (c) => ({ pos_pl: "were " + c, pos_sg: "was " + c, ell_pl: "were not", ell_sg: "was not", neg: "weren't " + c });
  const V = (i, np, a, b, an) => [i, np, verb(a, b), an];
  const C = (i, np, c, an) => [i, np, cop(c), an];
  const A = "animate", I = "inanimate";

  const LEX = {
    Action: [
      V("{n} kids heard the joke.", "kids", "laughed", "laugh", A),
      V("{n} students took the exam.", "students", "passed the exam", "pass the exam", A),
      V("{n} runners started the marathon.", "runners", "finished the race", "finish the race", A),
      V("{n} guests were invited to the party.", "guests", "showed up", "show up", A),
      V("{n} dogs heard the doorbell.", "dogs", "barked", "bark", A),
      V("{n} children were offered broccoli at lunch.", "children", "tasted the broccoli", "taste the broccoli", A),
      V("{n} volunteers signed up for the cleanup.", "volunteers", "attended the training", "attend the training", A),
      V("{n} employees received the survey.", "employees", "responded", "respond", A),
      V("{n} players were on the team this season.", "players", "scored a goal", "score a goal", A),
      V("{n} birds were sitting on the fence when the car drove past.", "birds", "flew away", "fly away", A),
      V("{n} passengers were on the delayed flight.", "passengers", "complained", "complain", A),
      V("{n} actors rehearsed the scene.", "actors", "remembered their lines", "remember their lines", A),
      C("{n} candidates applied for the job.", "candidates", "interviewed", A),
      V("{n} babies were at the daycare this morning.", "babies", "cried", "cry", A),
      V("{n} swimmers entered the lake.", "swimmers", "reached the island", "reach the island", A),
      V("{n} neighbors got the invitation.", "neighbors", "replied", "reply", A),
      V("{n} cats were given the new food.", "cats", "ate it", "eat it", A),
      V("{n} climbers attempted the peak.", "climbers", "reached the summit", "reach the summit", A),
      V("{n} tourists visited the museum.", "tourists", "bought souvenirs", "buy souvenirs", A),
      V("{n} students were assigned an essay.", "students", "submitted it on time", "submit it on time", A),
      V("{n} kids were at the swimming lesson.", "kids", "jumped into the pool", "jump into the pool", A),
      V("{n} patients received the vaccine.", "patients", "developed a fever", "develop a fever", A),
      V("{n} musicians were asked to play a solo.", "musicians", "agreed", "agree", A),
      V("{n} hikers set off on the trail.", "hikers", "turned back early", "turn back early", A),
      V("{n} jurors heard the testimony.", "jurors", "took notes", "take notes", A),
    ],
    Property: [
      C("There were {n} trucks in the toy box.", "trucks", "blue", I),
      C("{n} hearts were drawn on the card.", "hearts", "red", I),
      C("There were {n} balloons at the party.", "balloons", "yellow", I),
      C("The shop had {n} umbrellas on display.", "umbrellas", "striped", I),
      C("There were {n} cups on the shelf.", "cups", "made of glass", I),
      C("Leo received {n} letters this week.", "letters", "handwritten", I),
      C("There were {n} tents at the campsite.", "tents", "orange", I),
      C("{n} hats were hanging by the door.", "hats", "made of wool", I),
      C("The collector owned {n} coins from the shipwreck.", "coins", "made of gold", I),
      C("There were {n} cars in the parking lot.", "cars", "electric", I),
      C("The florist prepared {n} bouquets.", "bouquets", "white", I),
      C("Maya bought {n} shirts at the market.", "shirts", "green", I),
      C("{n} doors lined the hallway.", "doors", "painted black", I),
      C("The library received {n} donated books.", "books", "signed by the author", I),
      C("There were {n} chairs around the table.", "chairs", "wooden", I),
      C("The bakery had {n} cakes in the window.", "cakes", "chocolate", I),
      C("The farmer had {n} sheep in the pen.", "sheep", "black", A),
      C("There were {n} horses in the stable.", "horses", "brown", A),
      C("{n} kittens were born last spring.", "kittens", "female", A),
      C("The teacher graded {n} tests.", "tests", "written in pencil", I),
      C("There were {n} stars on the flag design.", "stars", "silver", I),
      C("The museum displayed {n} vases.", "vases", "made of porcelain", I),
      C("There were {n} pillows on the sofa.", "pillows", "square", I),
      C("{n} tulips grew in the pot.", "tulips", "purple", I),
      C("The company had {n} bikes for rent.", "bikes", "fitted with baskets", I),
    ],
    Location: [
      C("Emma had {n} toy cars.", "toy cars", "in the garage", I),
      C("The chef needed {n} knives.", "knives", "in the drawer", I),
      C("{n} cows belonged to the farm.", "cows", "in the barn", A),
      C("The family had {n} suitcases for the trip.", "suitcases", "in the car", I),
      C("The school had {n} buses.", "buses", "parked at the depot", I),
      C("The office had {n} printers.", "printers", "on the second floor", I),
      C("Nora owned {n} bicycles.", "bicycles", "in the shed", I),
      C("{n} children were playing hide-and-seek.", "children", "hiding in the attic", A),
      C("The team had won {n} trophies.", "trophies", "in the display case", I),
      C("The restaurant had {n} crates of wine.", "crates of wine", "in the cellar", I),
      C("{n} ducks lived at the park.", "ducks", "in the pond", A),
      C("The detective found {n} fingerprints.", "fingerprints", "on the window", I),
      C("Sam packed {n} books for the trip.", "books", "in his backpack", I),
      C("The hospital had {n} ambulances.", "ambulances", "at the main entrance", I),
      C("The museum owned {n} paintings.", "paintings", "in storage", I),
      C("{n} boats belonged to the club.", "boats", "in the harbor", I),
      C("The kitchen had {n} plates.", "plates", "in the dishwasher", I),
      C("The zoo had {n} penguins.", "penguins", "in the water", A),
      C("The class had {n} laptops.", "laptops", "on the charging cart", I),
      C("The pilot checked {n} planes.", "planes", "in the hangar", I),
      C("Grandma knitted {n} scarves.", "scarves", "in the closet", I),
      C("The artist had {n} brushes.", "brushes", "in the jar", I),
      C("{n} guests stayed at the hotel.", "guests", "in their rooms", A),
      C("The gardener had {n} plants.", "plants", "on the balcony", I),
      C("The shop had {n} keys.", "keys", "on the hook", I),
    ],
    State: [
      C("{n} puppies were in the basket.", "puppies", "asleep", A),
      C("There were {n} windows in the classroom.", "windows", "open", I),
      C("The house had {n} lamps.", "lamps", "switched on", I),
      C("The building had {n} doors to the street.", "doors", "locked", I),
      C("{n} towels hung on the line.", "towels", "dry", I),
      C("There were {n} candles on the cake.", "candles", "lit", I),
      C("The waiter carried {n} glasses.", "glasses", "full", I),
      C("Leo had {n} phones in the drawer.", "phones", "charged", I),
      C("The bakery had {n} ovens.", "ovens", "hot", I),
      C("{n} bananas were in the bowl.", "bananas", "ripe", I),
      C("The class had {n} hamsters.", "hamsters", "awake", A),
      C("There were {n} parking spots in front of the store.", "parking spots", "empty", I),
      C("The hotel had {n} rooms on the top floor.", "rooms", "occupied", I),
      C("{n} pipes ran under the house.", "pipes", "frozen", I),
      C("The kids built {n} snowmen.", "snowmen", "melting", I),
      C("{n} players were on the bench.", "players", "injured", A),
      C("There were {n} computers in the lab.", "computers", "running", I),
      C("{n} faucets were in the bathroom.", "faucets", "dripping", I),
      C("The fridge had {n} cartons of milk.", "cartons of milk", "expired", I),
      C("There were {n} fields on the farm.", "fields", "flooded", I),
      C("{n} gates surrounded the park.", "gates", "closed", I),
      C("{n} traffic lights were on the avenue.", "traffic lights", "broken", I),
      C("{n} patients were in the ward.", "patients", "feverish", A),
      C("{n} bottles were in the cooler.", "bottles", "cold", I),
      C("{n} soldiers were at the post.", "soldiers", "on duty", A),
    ],
  };

  const kFor = (n, bin) => bin === "near_none" ? 1 : bin === "near_all" ? n - 1 : Math.floor((n + 1) / 2);
  function premise(intro, n, p, world, k) {
    const setup = cap(intro.replace("{n}", NW[n]));
    if (world === "ALL") return `${setup} Every one of them ${p.pos_sg}.`;
    if (world === "NONE") return `${setup} None of them ${p.pos_pl}.`;
    const m = n - k;
    return `${setup} ${cap(NW[k])} of them ${k === 1 ? p.pos_sg : p.pos_pl} and ${NW[m]} ${m === 1 ? p.ell_sg : p.ell_pl}.`;
  }
  const CONDS = [
    ["A", "GAP", "The {np} {pos}.", "Neither", "Target · True = existential reading"],
    ["B", "GAP", "The {np} {neg}.", "Neither", "Target · True = universal reading"],
    ["C", "GAP", "All the {np} {pos}.", "False", "Quantifier baseline"],
    ["D", "GAP", "Not all the {np} {pos}.", "True", "Quantifier baseline; differs from B only in scope of negation"],
    ["E", "ALL", "The {np} {pos}.", "True", "Definite control"],
    ["F", "ALL", "The {np} {neg}.", "False", "Definite control"],
    ["G", "NONE", "The {np} {pos}.", "False", "Definite control"],
    ["H", "NONE", "The {np} {neg}.", "True", "Definite control"],
    ["I", "ALL", "Some of the {np} {pos}.", "True", "Scalar implicature probe · False under some but not all"],
    ["J", "GAP", "Some of the {np} {pos}.", "True", "Existential control"],
  ];
  const hyp = (t, np, p) => t.replace("{np}", np).replace("{pos}", p.pos_pl).replace("{neg}", p.neg);

  const SCN = [];
  Object.entries(LEX).forEach(([cls, entries]) => entries.forEach(([intro, np, p, an], i) => {
    const n = SIZES[i % 5], bin = BINS[i % 3];
    SCN.push({ id: SCN.length + 1, cls, intro, np, p, an, n, bin, k: kFor(n, bin) });
  }));

  /* condition table, illustrated with the hearts scenario */
  const hearts = SCN.find((s) => s.np === "hearts");
  $("#cond-rows").innerHTML = CONDS.map(([g, w, t, gold, role]) =>
    `<tr><td class="grp">${g}</td><td class="mono" style="font-size:13px">${w}</td><td>${esc(hyp(t, hearts.np, hearts.p))}</td><td>${tv(gold)}${g === "I" ? "*" : ""}</td><td style="color:var(--ink-2);font-size:14px">${esc(role)}</td></tr>`).join("");

  /* scenario browser */
  const clsSeg = $("#cls-seg"), sel = $("#scn-select");
  let curCls = "Property", curId = hearts.id;
  Object.keys(LEX).forEach((c) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = c; b.dataset.cls = c;
    b.addEventListener("click", () => { curCls = c; curId = SCN.find((s) => s.cls === c).id; renderBrowser(); });
    clsSeg.appendChild(b);
  });
  sel.addEventListener("change", () => { curId = +sel.value; curCls = SCN[curId - 1].cls; renderBrowser(); });
  $("#scn-prev").addEventListener("click", () => { curId = curId === 1 ? 100 : curId - 1; curCls = SCN[curId - 1].cls; renderBrowser(); });
  $("#scn-next").addEventListener("click", () => { curId = curId === 100 ? 1 : curId + 1; curCls = SCN[curId - 1].cls; renderBrowser(); });
  function renderBrowser() {
    clsSeg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cls === curCls)));
    sel.innerHTML = SCN.filter((s) => s.cls === curCls).map((s) =>
      `<option value="${s.id}"${s.id === curId ? " selected" : ""}>#${String(s.id).padStart(3, "0")} · ${esc(s.np)}: ${esc(s.p.pos_pl)}</option>`).join("");
    const s = SCN[curId - 1];
    $("#scn-meta").innerHTML = `<span>scenario <b>${String(s.id).padStart(3, "0")}</b></span><span>N = <b>${s.n}</b></span><span>k = <b>${s.k}</b> (${BIN_LABEL[s.bin]})</span><span><b>${s.an}</b></span>`;
    $("#scn-premises").innerHTML = ["GAP", "ALL", "NONE"].map((w) =>
      `<p class="premise"><b>${w}</b>${esc(premise(s.intro, s.n, s.p, w, s.k))}</p>`).join("");
    $("#scn-items").innerHTML = CONDS.map(([g, w, t, gold]) =>
      `<tr><td class="grp">${g}_${String(s.id).padStart(3, "0")}</td><td class="mono" style="font-size:12.5px;color:var(--muted)">${w}</td><td>${esc(hyp(t, s.np, s.p))}</td><td>${tv(gold)}</td></tr>`).join("");
  }
  renderBrowser();

  /* ---------- hero: five kids ---------- */
  const laughed = [true, true, true, false, false];
  const FACE_ON = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 16q3-3 6 0M22 16q3-3 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M11 22h18q-1 9-9 9t-9-9z" fill="currentColor"/></svg>';
  const FACE_OFF = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="14.5" cy="16" r="2" fill="currentColor"/><circle cx="25.5" cy="16" r="2" fill="currentColor"/><path d="M13 27h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const kidsEl = $("#kids");
  laughed.forEach((_, i) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "kid";
    b.addEventListener("click", () => { laughed[i] = !laughed[i]; renderWorld(); });
    kidsEl.appendChild(b);
  });
  document.querySelectorAll("[data-preset]").forEach((b) => b.addEventListener("click", () => {
    const k = +b.dataset.preset; laughed.forEach((_, i) => (laughed[i] = i < k)); renderWorld();
  }));
  const kidsPred = verb("laughed", "laugh");
  function renderWorld() {
    [...kidsEl.children].forEach((b, i) => {
      b.setAttribute("aria-pressed", String(laughed[i]));
      b.setAttribute("aria-label", `Kid ${i + 1}: ${laughed[i] ? "laughed" : "did not laugh"}`);
      b.innerHTML = (laughed[i] ? FACE_ON : FACE_OFF) + `<span>${laughed[i] ? "laughed" : "didn't"}</span>`;
    });
    const k = laughed.filter(Boolean).length;
    const world = k === 5 ? "ALL" : k === 0 ? "NONE" : "GAP";
    $("#w-premise").innerHTML = `<b>${world}</b>${esc(premise("{n} kids heard the joke.", 5, kidsPred, world, k))}`;
    const gap = world === "GAP";
    const rows = [
      ["The kids laughed.", world === "ALL" ? "True" : gap ? "Neither" : "False", world === "ALL" ? "True" : "False"],
      ["The kids didn't laugh.", world === "NONE" ? "True" : gap ? "Neither" : "False", world === "NONE" ? "True" : "False"],
      ["All the kids laughed.", world === "ALL" ? "True" : "False"],
      ["Not all the kids laughed.", world === "ALL" ? "False" : "True"],
    ];
    $("#w-rows").innerHTML = rows.map(([h, g, b]) => {
      const bc = b === undefined ? g : b;
      return `<tr><td>${esc(h)}</td><td>${tv(g)}</td><td>${tv(bc, bc !== g ? "lost" : "")}</td></tr>`;
    }).join("");
    $("#w-note").textContent = gap
      ? "Mixed group: both definites fall into the gap. Answering False to both (dashed) is the most common zero-shot pattern for four of seven models."
      : "Uniform group: no gap arises, and the two columns agree. Models are near-perfect here.";
  }
  renderWorld();

  /* ---------- prompts ---------- */
  const BASE = `You are a strict logician. Your task is to determine whether a Hypothesis is true given a Premise.
If the Hypothesis is true given the Premise, output "True".
If the Hypothesis is false given the Premise, output "False".
If the Premise makes the Hypothesis neither clearly true nor clearly false, output "Neither".
Do not use common sense assumptions. Only use the text provided.`;
  const PROMPTS = [
    ["Zero-shot", "Strict logic prompt", "Frames the model as a strict logician that outputs True, False or Neither.",
      `[System]\n${BASE}\n\n[User]\nPremise: {premise} Hypothesis: {hypothesis}\nPlease respond with ONLY one of the following options: "True", "False", or "Neither".`],
    ["DAP", "Definition-aware prompt", "Adds the homogeneity rule for plural definites and its absence for all and not all. Tests missing knowledge against failed application.",
      `[System]\n${BASE.replace("\nDo not use", "\n\nImportant Linguistic Rule: Note the distinction between plural definite descriptions and quantified descriptions.\n- Plural definites (e.g., \"the kids\") are homogeneous: \"The kids laughed\" is true only if all of them laughed, and \"The kids didn't laugh\" is true only if none of them laughed. If some laughed and some did not, both sentences are neither true nor false.\n- Quantifiers (e.g., \"all the kids\", \"not all the kids\") have no such gap: if some laughed and some did not, \"All the kids laughed\" is false and \"Not all the kids laughed\" is true.\nDo not use")}\n\n[User]\nPremise: {premise} Hypothesis: {hypothesis}\nPlease respond with ONLY one of the following options: "True", "False", or "Neither".`],
    ["CoT", "Chain-of-thought prompt", "Asks the model to analyze how many members have the property and what the hypothesis claims, then label. JSON output.",
      `[System]\n${BASE}\n\n[User]\nPremise: {premise}\nHypothesis: {hypothesis}\n\nInstruction: First, analyze how many members of the group in the premise have the property (all, some, or none). Then analyze what the hypothesis claims about the group. Finally, provide your final label (True, False, or Neither).\n\nOutput Requirement: You must output your response in strict JSON format containing exactly two keys:\n1. "reasoning": A string explaining your step-by-step logic.\n2. "label": The final judgment ("True", "False", or "Neither").\n\nDo not include markdown formatting (like \`\`\`json). Return ONLY the JSON object.`],
    ["Enumeration", "Enumeration prompt", "Draws on supervaluation: list each member and whether the property holds for it, then label. JSON output.",
      `[System]\n${BASE}\n\n[User]\nPremise: {premise}\nHypothesis: {hypothesis}\n\nInstruction:\n1. First, go through the members of the group in the premise one by one and state for each whether the property in the hypothesis holds for it.\n2. Based on this list, determine whether the hypothesis is true, false, or neither.\n\nOutput Requirement: You must output your response in strict JSON format containing exactly two keys:\n1. "individuals": a list of strings, one per member of the group.\n2. "label": The final judgment ("True", "False", or "Neither").\n\nDo not include markdown formatting (like \`\`\`json). Return ONLY the JSON object.`],
  ];
  $("#prompts").innerHTML = PROMPTS.map(([k, name, desc, text]) =>
    `<div class="column is-half"><details class="prompt"><summary><b>${esc(name)}</b><span>${esc(desc)}</span><em>Show prompt</em></summary><pre>${esc(text)}</pre></details></div>`).join("");

  /* ---------- results data (paper Tables 3 and 6) ---------- */
  const MODELS = ["Llama-3.1-8B-Instruct", "Mistral-7B-Instruct-v0.3", "Qwen2.5-7B-Instruct", "Yi-1.5-9B-Chat", "deepseek-llm-7b-chat", "gemma-2-9b-it", "glm-4-9b-chat-hf"];
  const SHORT = ["Llama-3.1-8B", "Mistral-7B", "Qwen2.5-7B", "Yi-1.5-9B", "DeepSeek-7B", "Gemma-2-9B", "GLM-4-9B"];
  // Gap, Mixed(N,F), Mixed(F,N), Collapse, Existential, Universal, Inconsistent, CtrlOK
  const PAT = {
    "Zero-shot": [[.02,.35,.01,.54,.08,.00,.00,100],[.00,.02,.00,.63,.07,.27,.01,100],[.01,.38,.00,.58,.03,.00,.00,100],[.01,.50,.00,.10,.39,.00,.00,100],[.06,.30,.07,.26,.14,.17,.00,82],[.15,.68,.06,.07,.02,.02,.00,100],[.08,.09,.04,.51,.19,.09,.00,100]],
    "DAP": [[.00,.01,.00,.99,.00,.00,.00,100],[.00,.01,.00,.75,.01,.23,.00,100],[.04,.53,.01,.40,.01,.01,.00,100],[.56,.33,.00,.00,.10,.01,.00,98],[.00,.01,.00,.78,.10,.11,.00,97],[.05,.56,.10,.26,.00,.03,.00,100],[.09,.21,.00,.53,.13,.04,.00,100]],
    "CoT": [[.03,.14,.19,.54,.04,.06,.00,99],[.00,.01,.10,.55,.07,.26,.01,98],[.00,.17,.01,.77,.03,.02,.00,100],[.03,.26,.05,.39,.26,.01,.00,100],[.01,.00,.02,.44,.15,.34,.04,98],[.01,.42,.02,.33,.15,.07,.00,100],[.00,.09,.00,.84,.05,.02,.00,100]],
    "Enumeration": [[.29,.35,.01,.24,.05,.05,.01,58],[.02,.07,.04,.73,.07,.06,.01,100],[.05,.46,.02,.42,.05,.00,.00,99],[.13,.64,.03,.08,.12,.00,.00,100],[.04,.11,.08,.25,.43,.05,.04,10],[.24,.49,.02,.19,.00,.06,.00,100],[.20,.21,.06,.31,.08,.13,.00,98]],
  };
  // A, B, C, D, Ctrl, EBR, UBR, HGR, BCR, dNA
  const MET = {
    "Zero-shot": [[.37,.03,1,1,1,.08,0,.02,.54,1],[.02,0,1,1,1,.08,.28,0,.63,.72],[.39,.01,1,1,1,.03,0,.01,.58,1],[.51,.02,1,1,1,.39,0,.01,.10,1],[.46,.18,.96,1,.95,.14,.17,.06,.26,.83],[.84,.21,1,.99,1,.02,.02,.15,.07,.97],[.20,.12,1,1,1,.19,.09,.08,.51,.91]],
    "DAP": [[.01,0,1,.94,1,0,0,0,.99,.94],[.01,0,1,1,1,.01,.23,0,.75,.77],[.57,.05,1,1,1,.01,.01,.04,.40,.99],[.90,.61,1,1,.99,.10,.01,.56,0,.99],[.02,0,1,1,.99,.10,.11,0,.78,.89],[.61,.15,1,1,1,0,.03,.05,.26,.97],[.30,.12,1,1,1,.13,.04,.09,.53,.96]],
    "CoT": [[.20,.23,.74,.92,1,.04,.06,.03,.54,.86],[.01,.11,1,.92,.99,.08,.27,0,.55,.65],[.17,.01,1,1,1,.03,.02,0,.77,.98],[.29,.09,1,1,1,.26,.01,.03,.39,.99],[.04,.04,.96,.74,.99,.19,.38,.01,.44,.36],[.43,.03,1,1,1,.15,.07,.01,.33,.93],[.09,0,.98,.96,1,.05,.02,0,.84,.94]],
    "Enumeration": [[.67,.30,.96,.97,.79,.06,.06,.29,.24,.91],[.10,.06,1,.81,1,.08,.07,.02,.73,.74],[.51,.07,1,.99,1,.05,0,.05,.42,.99],[.77,.17,.96,1,1,.12,0,.13,.08,1],[.16,.25,.56,.11,.62,.47,.09,.04,.25,.02],[.78,.26,1,1,1,0,.06,.24,.19,.94],[.45,.27,.99,.99,1,.08,.13,.20,.31,.86]],
  };
  const DEGENERATE = { "Enumeration": 4 };
  const TAKE = {
    "Zero-shot": "The gap rate ranges from 0.00 (Mistral) to 0.15 (gemma-2). For four of seven models the most frequent pattern is False on both sentences. When models do use Neither, they keep it for the positive sentence: the Mixed pattern is almost always (Neither, False).",
    "DAP": "Stating the homogeneity rule gives the largest improvement in the study, for one model only: Yi-1.5 judges both sentences Neither in 56% of scenarios. Llama-3.1 collapses almost completely (BCR 0.99), as do DeepSeek and Mistral.",
    "CoT": "Step-by-step reasoning suppresses the gap for every model (HGR ≤ 0.03) and increases the collapse for five of seven. Rationales restate the hypothesis with an explicit quantifier, turning a homogeneous predication into a bivalent universal claim.",
    "Enumeration": "Listing the members first gives the highest average gap rate, with gains for Llama-3.1, gemma-2, GLM-4 and Yi-1.5. It also destabilizes the controls: Llama-3.1's Ctrl drops to 0.79 and the DeepSeek run degenerates (controls correct in 10 of 100 scenarios).",
  };
  const PATS = [
    { key: "gap", name: "Gap (N, N)", color: "--s-gap", hatch: true, val: (r) => r[0] },
    { key: "mixed", name: "Mixed (one N, one F)", color: "--s-mixed", val: (r) => r[1] + r[2], detail: (r) => `(Neither, False) ${pct(r[1])}% · (False, Neither) ${pct(r[2])}%` },
    { key: "collapse", name: "Collapse (F, F)", color: "--s-collapse", val: (r) => r[3] },
    { key: "univ", name: "Universal (·, T)", color: "--s-univ", val: (r) => r[5] },
    { key: "exist", name: "Existential (T, ·)", color: "--s-exist", val: (r) => r[4] },
    { key: "incons", name: "Inconsistent (T, T)", color: "--s-incons", val: (r) => r[6] },
  ];
  const DESC = {
    gap: "Both sentences Neither: the truth-value gap.",
    mixed: "One sentence Neither, the other False.",
    collapse: "Both sentences False: the bivalence bias.",
    univ: "Negated definite judged True.",
    exist: "Positive definite judged True.",
    incons: "Both judged True.",
  };
  $("#pat-legend").innerHTML = PATS.map((p) => `<span><span class="sw${p.hatch ? " hatch" : ""}" style="background-color:var(${p.color})"></span>${p.name}</span>`).join("");

  function cssColor(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function labelInk(hex) {
    const m = hex.replace("#", ""); if (m.length !== 6) return "#fff";
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16) / 255).map((c) => c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4));
    const L = .2126 * r + .7152 * g + .0722 * b;
    return (1.05) / (L + .05) > (L + .05) / .05 ? "#ffffff" : "#14161c";
  }

  let curPrompt = "Zero-shot";
  const pSeg = $("#prompt-seg");
  Object.keys(PAT).forEach((p) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = p; b.dataset.p = p;
    b.addEventListener("click", () => { curPrompt = p; renderResults(); });
    pSeg.appendChild(b);
  });

  function renderResults() {
    pSeg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === curPrompt)));
    const rows = PAT[curPrompt], met = MET[curPrompt], deg = DEGENERATE[curPrompt];
    const stack = $("#stack"); stack.innerHTML = "";
    rows.forEach((r, mi) => {
      const row = document.createElement("div"); row.className = "srow";
      row.innerHTML = `<div class="lab" title="${MODELS[mi]}">${SHORT[mi]}${deg === mi ? ' <span class="dagger">†</span>' : ""}</div>`;
      const bar = document.createElement("div"); bar.className = "sbar";
      bar.setAttribute("role", "img");
      bar.setAttribute("aria-label", `${MODELS[mi]}: ` + PATS.map((p) => `${p.name} ${pct(p.val(r))}%`).join(", "));
      const total = PATS.reduce((s, p) => s + p.val(r), 0);
      PATS.forEach((p) => {
        const v = p.val(r); if (v <= 0) return;
        const seg = document.createElement("div"); seg.className = "seg-fill" + (p.hatch ? " hatch" : "");
        const fill = cssColor(p.color);
        seg.style.flex = `${v / total} 1 0`;
        seg.style.backgroundColor = fill;
        seg.style.color = labelInk(fill);
        seg.tabIndex = 0;
        if (v >= 0.09) seg.textContent = pct(v);
        bindTip(seg, `<b>${SHORT[mi]}</b> · ${curPrompt}<br>${p.name}: ${pct(v)}% of scenarios${p.detail ? "<br>" + p.detail(r) : ""}<br><span style="opacity:.75">${DESC[p.key]}</span>`);
        bar.appendChild(seg);
      });
      row.appendChild(bar); stack.appendChild(row);
    });
    const mean = (i) => met.reduce((s, r) => s + r[i], 0) / met.length;
    $("#sum-line").innerHTML = `<span>Mean HGR <b>${mean(7).toFixed(2)}</b></span><span>Mean BCR <b>${mean(8).toFixed(2)}</b></span><span>Mean Ctrl <b>${mean(4).toFixed(2)}</b></span><span>Segments: % of 100 scenarios</span>`;
    $("#stack-desc").textContent = TAKE[curPrompt];

    const H = ["A", "B", "C", "D", "Ctrl", "EBR", "UBR", "HGR", "BCR", "ΔNA"];
    const hlColor = { 7: "--s-gap", 8: "--s-collapse" };
    $("#metrics").innerHTML = `<thead><tr><th>Model</th>${H.map((h) => `<th class="n">${h}</th>`).join("")}<th class="n">Ctrl OK</th></tr></thead><tbody>` +
      met.map((r, mi) => `<tr><td class="model">${MODELS[mi]}${deg === mi ? ' <span class="dagger">†</span>' : ""}</td>` +
        r.map((v, i) => hlColor[i]
          ? `<td class="n hl"><span class="barbg" style="width:calc(${v * 100}% - 8px);max-width:calc(100% - 8px);background:var(${hlColor[i]})"></span><span>${v.toFixed(2)}</span></td>`
          : `<td class="n">${v.toFixed(2)}</td>`).join("") +
        `<td class="n">${rows[mi][7]}</td></tr>`).join("") + "</tbody>";
  }
  renderResults();

  /* ---------- findings ---------- */
  const RAT = [[76, 76, 67, 71], [89, 91, 53, 62], [59, 80, 33, 97], [42, 45, 1, 90], [70, 77, 13, 58], [41, 42, 68, 90], [80, 86, 36, 98]];
  const mb = (a, b) => `<div class="mbar"><div class="track"><div class="fill" style="width:${(a / b) * 100}%"></div></div><span class="v">${(a / b).toFixed(2)}</span></div>`;
  const tot = RAT.reduce((s, r) => r.map((v, i) => s[i] + v), [0, 0, 0, 0]);
  $("#rationales").innerHTML = `<div class="rat-row head"><span>CoT, False on…</span><span>A restated as “all”</span><span>B restated as “none”</span></div>` +
    RAT.map((r, i) => `<div class="rat-row"><span>${SHORT[i]}</span><span title="${r[0]}/${r[1]}">${mb(r[0], r[1])}</span><span title="${r[2]}/${r[3]}">${mb(r[2], r[3])}</span></div>`).join("") +
    `<div class="rat-row total"><span>All</span><span>${mb(tot[0], tot[1])}</span><span>${mb(tot[2], tot[3])}</span></div>`;

  // zero-shot, GAP contexts: [TA, NA, NB] per level (Tables 7 and 8)
  const BINDATA = [
    [[0,.33,.03],[.06,.69,.06],[.19,.09,0]],
    [[.06,0,0],[.03,.03,0],[.16,.03,0]],
    [[0,.06,0],[.03,.72,.03],[.06,.44,0]],
    [[.28,.53,0],[.38,.62,.06],[.53,.38,0]],
    [[.06,.64,.08],[.06,.53,.22],[.31,.19,.25]],
    [[.03,.64,.39],[0,.97,.22],[.03,.94,0]],
    [[0,.19,.06],[.09,.38,.31],[.50,.03,0]],
  ];
  const CLSDATA = [
    [[.08,.24,.04],[0,.32,.08],[.08,.44,0],[.16,.48,0]],
    [[.24,0,0],[0,0,0],[.04,.08,0],[.04,0,0]],
    [[.04,.60,0],[0,.16,0],[.04,.40,.04],[.04,.40,0]],
    [[.60,.32,.08],[.12,.84,0],[.52,.32,0],[.32,.56,0]],
    [[.28,.36,.48],[0,.64,0],[.12,.36,0],[.16,.48,.24]],
    [[.04,.88,.12],[0,.84,.20],[0,.96,.16],[.04,.68,.36]],
    [[.36,.40,.24],[0,.16,.08],[.16,.12,.12],[.24,.12,.04]],
  ];
  const GSER = [
    { name: "True on A", color: "--s-exist" },
    { name: "Neither on A", color: "--s-gap" },
    { name: "Neither on B", color: "--s-mixed" },
  ];
  const gLegend = GSER.map((s) => `<span><span class="sw" style="background-color:var(${s.color})"></span>${s.name}</span>`).join("");
  $("#g-legend-1").innerHTML = gLegend; $("#g-legend-2").innerHTML = gLegend;
  const pick = $("#model-pick");
  pick.innerHTML = `<option value="-1">All models (pooled)</option>` + MODELS.map((m, i) => `<option value="${i}">${m}</option>`).join("");
  let curModel = -1;
  pick.addEventListener("change", () => { curModel = +pick.value; renderGroups(); });

  function agg(data) {
    if (curModel >= 0) return data[curModel];
    return data[0].map((lvl, li) => lvl.map((_, si) => data.reduce((s, m) => s + m[li][si], 0) / data.length));
  }
  function grouped(el, levels, vals) {
    const W = Math.max(300, el.clientWidth || 520), Hh = 240, padL = 34, padR = 8, padT = 22, padB = 30;
    const max = Math.max(...vals.flat());
    const ymax = Math.min(100, Math.max(20, Math.ceil((max * 100) / 20) * 20));
    const iw = W - padL - padR, ih = Hh - padT - padB;
    const gw = iw / levels.length, bw = Math.min(30, (gw - 18) / 3), gapB = 2;
    const y = (v) => padT + ih - (v * 100 / ymax) * ih;
    let s = `<svg viewBox="0 0 ${W} ${Hh}" width="${W}" height="${Hh}" role="img" aria-label="Grouped bar chart">`;
    for (let t = 0; t <= ymax; t += 20) {
      const yy = y(t / 100);
      s += `<line x1="${padL}" x2="${W - padR}" y1="${yy}" y2="${yy}" stroke="var(--rule)" stroke-width="1"/>`;
      s += `<text x="${padL - 6}" y="${yy + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${t}</text>`;
    }
    levels.forEach((lv, li) => {
      const gx = padL + li * gw + (gw - (3 * bw + 2 * gapB)) / 2;
      vals[li].forEach((v, si) => {
        const x = gx + si * (bw + gapB), top = y(v), base = y(0), h = base - top, r = Math.min(4, h);
        const d = h > 0 ? `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + bw - r}Q${x + bw},${top} ${x + bw},${top + r}V${base}Z` : "";
        s += `<g class="gbar" tabindex="0" data-tip="<b>${esc(lv)}</b><br>${GSER[si].name}: ${pct(v)}%">`;
        s += `<rect x="${x - 1}" y="${padT}" width="${bw + 2}" height="${ih}" fill="transparent"/>`;
        if (d) s += `<path d="${d}" style="fill:var(${GSER[si].color})"/>`;
        s += `<text x="${x + bw / 2}" y="${top - 5}" text-anchor="middle" font-size="10.5" fill="var(--ink-2)">${pct(v)}</text></g>`;
      });
      s += `<text x="${padL + li * gw + gw / 2}" y="${Hh - 9}" text-anchor="middle" font-size="11.5" fill="var(--ink)">${esc(lv)}</text>`;
    });
    s += `<text x="4" y="12" font-size="10.5" fill="var(--muted)">% of answers</text></svg>`;
    el.innerHTML = s;
    el.querySelectorAll(".gbar").forEach((g) => bindTip(g, g.dataset.tip));
  }
  function renderGroups() {
    grouped($("#chart-bins"), ["1 of N", "about half", "N−1 of N"], agg(BINDATA));
    grouped($("#chart-class"), ["Action", "Property", "Location", "State"], agg(CLSDATA));
  }
  renderGroups();
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(renderGroups, 120); });

  /* copy BibTeX (template behaviour: "Cop" + CSS "ied!") */
  const copyBtn = $("#copy-bib"), copyText = copyBtn.querySelector(".copy-text");
  copyBtn.addEventListener("click", () => {
    const done = () => { copyBtn.classList.add("copied"); copyText.textContent = "Cop";
      setTimeout(() => { copyBtn.classList.remove("copied"); copyText.textContent = "Copy"; }, 2000); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents($("#bibtex-code")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); };
    try { navigator.clipboard.writeText($("#bibtex-code").textContent).then(done, fallback); } catch (e) { fallback(); }
  });

  /* scroll to top */
  const topBtn = $(".scroll-to-top");
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => topBtn.classList.toggle("visible", window.pageYOffset > 300), { passive: true });
})();
