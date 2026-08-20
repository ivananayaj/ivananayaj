const KEY = "srt-v2-state";
const SCHEMA = 1;

const state = {
  catalog: null,
  tab: "read",
  era: "all",
  q: "",
  spoilers: true,
  user: {
    schemaVersion: SCHEMA,
    readIssueIds: [],
    ownedCollectionIds: [],
    currentlyReading: null,
    notes: {},
    ratings: {},
    lastBackup: null,
  },
};

function loadUser() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && raw.schemaVersion === SCHEMA) Object.assign(state.user, raw);
  } catch {}
}
function saveUser() {
  localStorage.setItem(KEY, JSON.stringify(state.user));
}

const $ = (s) => document.querySelector(s);

function toast(msg, undo) {
  const el = $("#toast");
  el.hidden = false;
  el.textContent = msg;
  if (undo) {
    const b = document.createElement("button");
    b.className = "btn ghost";
    b.style.marginLeft = "8px";
    b.textContent = "Undo";
    b.onclick = undo;
    el.append(" ", b);
  }
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (el.hidden = true), 4000);
}

function issues() {
  return state.catalog.issues;
}
function collections() {
  return state.catalog.collections;
}
function byId(id) {
  return issues().find((i) => i.id === id);
}
function isRead(id) {
  return state.user.readIssueIds.includes(id);
}
function ownable(c) {
  return c.type !== "gap";
}
function isOwned(id) {
  return state.user.ownedCollectionIds.includes(id);
}
function nextUnread() {
  return issues()
    .slice()
    .sort((a, b) => a.readingOrder - b.readingOrder)
    .find((i) => !isRead(i.id) && i.priority !== "optional");
}
function nextThree() {
  return issues()
    .slice()
    .sort((a, b) => a.readingOrder - b.readingOrder)
    .filter((i) => !isRead(i.id))
    .slice(0, 3);
}
function label(i) {
  return `${i.series} #${i.number}`;
}
function posterText(i) {
  return `#${i.number}`;
}

function toggleRead(id) {
  const had = isRead(id);
  state.user.readIssueIds = had
    ? state.user.readIssueIds.filter((x) => x !== id)
    : [...state.user.readIssueIds, id];
  if (!had && !state.user.currentlyReading) state.user.currentlyReading = id;
  saveUser();
  render();
  toast(had ? "Marked unread" : `Read ${label(byId(id))}`, () => toggleRead(id));
}

function toggleOwn(id) {
  const c = collections().find((x) => x.id === id);
  if (!ownable(c)) return;
  const had = isOwned(id);
  state.user.ownedCollectionIds = had
    ? state.user.ownedCollectionIds.filter((x) => x !== id)
    : [...state.user.ownedCollectionIds, id];
  saveUser();
  render();
  toast(had ? "Removed from shelf" : `Owned ${c.title}`, () => toggleOwn(id));
}

function markRest(collectionId) {
  const c = collections().find((x) => x.id === collectionId);
  const add = c.issueIds.filter((id) => !isRead(id));
  state.user.readIssueIds.push(...add);
  saveUser();
  render();
  toast(`Marked ${add.length} issues read`);
}

function meters() {
  const total = issues().length;
  const read = state.user.readIssueIds.filter((id) => byId(id)).length;
  const books = collections().filter(ownable);
  const owned = books.filter((c) => isOwned(c.id)).length;
  $("#meters").innerHTML = `
    <div class="meter"><span>Issues read</span><b>${read} / ${total}</b>
      <div class="bar"><i style="width:${(read / total) * 100}%"></i></div></div>
    <div class="meter"><span>Books owned</span><b>${owned} / ${books.length}</b>
      <div class="bar"><i style="width:${(owned / books.length) * 100}%;background:#e6c36a"></i></div></div>`;
}

function tonightHTML() {
  const n = nextUnread();
  if (!n) {
    return `<article class="tonight"><p class="kicker">Tonight</p>
      <h2>You finished the spine.</h2>
      <p class="why">Brand New Day through Spider-Geddon is checked. Explore packs are next.</p></article>`;
  }
  const spoiler = state.spoilers && n.spoiler;
  const q = nextThree();
  return `<article class="tonight">
    <p class="kicker">Tonight</p>
    <h2>${label(n)}</h2>
    <p class="why ${spoiler ? "spoiler" : ""}">${n.title}${n.blurb ? " — " + n.blurb : ""}</p>
    ${spoiler ? `<button class="reveal" type="button" data-act="spoilers">Reveal spoiler blurbs</button>` : ""}
    <div class="actions">
      <button class="btn primary" data-act="read" data-id="${n.id}">Mark read</button>
      <button class="btn" data-act="current" data-id="${n.id}">Set as current</button>
      ${n.priority === "optional" ? "" : `<button class="btn ghost" data-act="skip-opt">Hide optional tonight</button>`}
    </div>
    <ul class="queue">${q
      .map(
        (i) =>
          `<li><span>${label(i)}</span><span>${i.arc} · ${i.priority}</span></li>`
      )
      .join("")}</ul>
  </article>`;
}

function issueRow(i) {
  const spoiler = state.spoilers && i.spoiler && !isRead(i.id);
  return `<article class="issue" data-id="${i.id}">
    <div class="poster" style="filter:hue-rotate(${(i.readingOrder * 11) % 340}deg)">${posterText(i)}</div>
    <div class="meta">
      <h3>${label(i)}</h3>
      <p>${i.title} · ${i.arc}</p>
      <p class="pri ${i.priority}">${i.priority}${i.eventTags?.length ? " · " + i.eventTags.join(", ") : ""}</p>
      ${i.blurb ? `<p class="blurb ${spoiler ? "spoiler" : ""}">${i.blurb}</p>` : ""}
    </div>
    <div class="toggles">
      <button class="read ${isRead(i.id) ? "on" : ""}" data-act="read" data-id="${i.id}">Read</button>
    </div>
  </article>`;
}

function filteredIssues() {
  const q = state.q.trim().toLowerCase();
  return issues().filter((i) => {
    if (state.era !== "all" && i.era !== state.era) return false;
    if (!q) return true;
    const hay = `${i.series} ${i.number} ${i.title} ${i.arc} ${i.blurb}`.toLowerCase();
    return hay.includes(q) || `#${i.number}`.includes(q);
  });
}

function renderRead() {
  const eras = state.catalog.eras
    .map(
      (e) =>
        `<button class="chip ${state.era === e.id ? "on" : ""}" data-act="era" data-id="${e.id}">${e.label}</button>`
    )
    .join("");
  const list = filteredIssues();
  $("#view-read").innerHTML =
    tonightHTML() +
    `<div class="filters">
      <button class="chip ${state.era === "all" ? "on" : ""}" data-act="era" data-id="all">All eras</button>
      ${eras}
    </div>
    <p class="why">${list.length} issues in this view · progress is always ${state.user.readIssueIds.length} / ${issues().length}</p>
    ${list.map(issueRow).join("")}`;
}

function renderCollect() {
  $("#view-collect").innerHTML = collections()
    .map((c) => {
      const n = c.issueIds.length;
      const r = c.issueIds.filter(isRead).length;
      const gap = c.type === "gap";
      return `<article class="book">
        <div class="poster" style="filter:hue-rotate(${c.coverHue}deg)">${c.type}</div>
        <div>
          <h3>${c.title}</h3>
          <p>${c.year}${c.msrp ? ` · $${c.msrp} <span class="pri">as of ${c.msrpAsOf}</span>` : ""} · ${r}/${n} issues read</p>
          <p>${c.blurb || ""}</p>
          ${gap ? `<p class="gap-note">Gap — you cannot own a hole in the line. Buy trades or singles.</p>` : ""}
          <div class="toggles">
            <button class="own ${isOwned(c.id) ? "on" : ""}" data-act="own" data-id="${c.id}" ${gap ? "disabled" : ""}>Own</button>
            <button class="btn" data-act="mark-rest" data-id="${c.id}">Mark remaining read</button>
            ${c.links?.gcd ? `<a class="btn ghost" href="${c.links.gcd}" target="_blank" rel="noopener">Open in GCD</a>` : ""}
          </div>
        </div>
      </article>`;
    })
    .join("");
}

function renderExplore() {
  const tags = [...new Set(issues().flatMap((i) => i.eventTags || []))];
  $("#view-explore").innerHTML = `
    <div class="panel">
      <h2>Events are filters, not apps</h2>
      <p class="why">Civil War / Secret Wars packs are not in this spine build. Tagged extras already in the catalog:</p>
      <div class="filters">${tags
        .map((t) => `<button class="chip" data-act="search" data-id="${t}">${t}</button>`)
        .join("")}</div>
    </div>
    <div class="panel">
      <h2>Family tree / Web of Destiny</h2>
      <p class="why">Held until every node is an issue id from this catalog. A poster that drifts from the checklist is how the old site rots.</p>
    </div>`;
}

function renderMe() {
  const u = state.user;
  $("#view-me").innerHTML = `
    <div class="panel">
      <h2>This device</h2>
      <p>schema v${u.schemaVersion}. Last backup: ${u.lastBackup || "never"}.</p>
      <div class="actions">
        <button class="btn primary" data-act="backup">Backup JSON</button>
        <label class="btn">Restore<input type="file" accept="application/json" id="restore" hidden /></label>
        <button class="btn ghost" data-act="reset">Reset local data</button>
      </div>
    </div>
    <div class="panel">
      <h2>Reading comfort</h2>
      <button class="btn" data-act="spoilers">${state.spoilers ? "Spoilers hidden" : "Spoilers shown"}</button>
    </div>
    <div class="panel">
      <h2>Why two meters</h2>
      <p class="why">Issues read never goes up when you buy a book. Books owned never goes up when you finish an issue. That was the old site’s core lie.</p>
    </div>`;
  $("#restore")?.addEventListener("change", restoreFile);
}

function backup() {
  state.user.lastBackup = new Date().toISOString();
  saveUser();
  const blob = new Blob([JSON.stringify(state.user, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "spidey-tracker-backup.json";
  a.click();
  toast("Backup downloaded");
  render();
}

function restoreFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.schemaVersion !== SCHEMA) throw new Error("schema");
      state.user = { ...state.user, ...data };
      saveUser();
      render();
      toast("Restore complete");
    } catch {
      toast("Could not restore that file");
    }
  };
  reader.readAsText(file);
}

function render() {
  meters();
  document.querySelectorAll(".tabs button").forEach((b) => {
    b.classList.toggle("on", b.dataset.tab === state.tab);
  });
  ["read", "collect", "explore", "me"].forEach((t) => {
    $(`#view-${t}`).classList.toggle("hidden", state.tab !== t);
  });
  if (state.tab === "read") renderRead();
  if (state.tab === "collect") renderCollect();
  if (state.tab === "explore") renderExplore();
  if (state.tab === "me") renderMe();
}

document.addEventListener("click", (e) => {
  const tab = e.target.closest("[data-tab]");
  if (tab) {
    state.tab = tab.dataset.tab;
    render();
    return;
  }
  const act = e.target.closest("[data-act]");
  if (!act) return;
  const { act: name, id } = act.dataset;
  if (name === "read") toggleRead(id);
  if (name === "own") toggleOwn(id);
  if (name === "mark-rest") markRest(id);
  if (name === "era") {
    state.era = id;
    render();
  }
  if (name === "search") {
    state.q = id;
    $("#search").value = id;
    state.tab = "read";
    render();
  }
  if (name === "current") {
    state.user.currentlyReading = id;
    saveUser();
    toast("Currently reading set");
  }
  if (name === "spoilers") {
    state.spoilers = !state.spoilers;
    render();
  }
  if (name === "backup") backup();
  if (name === "reset") {
    if (confirm("Clear read/own data on this device?")) {
      localStorage.removeItem(KEY);
      loadUser();
      state.user = {
        schemaVersion: SCHEMA,
        readIssueIds: [],
        ownedCollectionIds: [],
        currentlyReading: null,
        notes: {},
        ratings: {},
        lastBackup: null,
      };
      saveUser();
      render();
    }
  }
});

$("#search").addEventListener("input", (e) => {
  state.q = e.target.value;
  if (state.tab !== "read") state.tab = "read";
  render();
});

loadUser();
const catalogUrl = new URL("../data/catalog.json", import.meta.url);
const res = await fetch(catalogUrl);
state.catalog = await res.json();
render();
