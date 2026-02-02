const state = {
  gold: 0,
  favor: 0,
  income: 0,
  lastTick: Date.now(),
  upgrades: [
    {
      id: "chapel",
      name: "Nocturne Chapel",
      description: "Pilgrims bring 1 gold / sec.",
      baseCost: 25,
      income: 1,
      favorGain: 1,
      owned: 0,
    },
    {
      id: "crypt",
      name: "Silent Crypt",
      description: "Whispers grant 4 gold / sec.",
      baseCost: 120,
      income: 4,
      favorGain: 2,
      owned: 0,
    },
    {
      id: "cathedral",
      name: "Gothic Cathedral",
      description: "The choir sustains 12 gold / sec.",
      baseCost: 480,
      income: 12,
      favorGain: 5,
      owned: 0,
    },
  ],
  log: [],
};

const elements = {
  goldValue: document.getElementById("goldValue"),
  favorValue: document.getElementById("favorValue"),
  incomeValue: document.getElementById("incomeValue"),
  harvestButton: document.getElementById("harvestButton"),
  upgradeList: document.getElementById("upgradeList"),
  eventLog: document.getElementById("eventLog"),
  bellProgress: document.getElementById("bellProgress"),
  bellText: document.getElementById("bellText"),
  saveStatus: document.getElementById("saveStatus"),
  resetButton: document.getElementById("resetButton"),
};

const SAVE_KEY = "svendor-idle-save";
const TICK_RATE = 1000;
const BELL_COOLDOWN = 1200;
let bellReady = true;

function formatNumber(value) {
  return Math.floor(value).toLocaleString();
}

function logEvent(message) {
  state.log.unshift({ message, time: new Date().toLocaleTimeString() });
  state.log = state.log.slice(0, 6);
  renderLog();
}

function getUpgradeCost(upgrade) {
  return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.owned));
}

function calculateIncome() {
  state.income = state.upgrades.reduce(
    (total, upgrade) => total + upgrade.income * upgrade.owned,
    0
  );
}

function renderResources() {
  elements.goldValue.textContent = formatNumber(state.gold);
  elements.favorValue.textContent = formatNumber(state.favor);
  elements.incomeValue.textContent = formatNumber(state.income);
}

function renderUpgrades() {
  elements.upgradeList.innerHTML = "";
  state.upgrades.forEach((upgrade) => {
    const cost = getUpgradeCost(upgrade);
    const card = document.createElement("div");
    card.className = "upgrade-card";

    const title = document.createElement("h3");
    title.textContent = upgrade.name;

    const description = document.createElement("p");
    description.textContent = `${upgrade.description} Owned: ${upgrade.owned}`;

    const button = document.createElement("button");
    button.className = "ghost";
    button.textContent = `Invest ${cost}g`;
    button.disabled = state.gold < cost;
    button.addEventListener("click", () => buyUpgrade(upgrade.id));

    card.append(title, description, button);
    elements.upgradeList.appendChild(card);
  });
}

function renderLog() {
  elements.eventLog.innerHTML = "";
  if (state.log.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "The realm is silent. Begin your reign.";
    elements.eventLog.appendChild(empty);
    return;
  }

  state.log.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `[${entry.time}] ${entry.message}`;
    elements.eventLog.appendChild(item);
  });
}

function updateBellProgress() {
  if (bellReady) {
    elements.bellProgress.style.width = "100%";
    elements.bellText.textContent = "Bell ready.";
    return;
  }

  const elapsed = Date.now() - state.lastBell;
  const progress = Math.min(elapsed / BELL_COOLDOWN, 1);
  elements.bellProgress.style.width = `${progress * 100}%`;
  elements.bellText.textContent = "The bell tolls...";
  if (progress >= 1) {
    bellReady = true;
  }
}

function harvest() {
  if (!bellReady) {
    return;
  }
  bellReady = false;
  state.lastBell = Date.now();
  const gain = 8 + state.favor * 0.2;
  const favorGain = 1 + Math.floor(state.income / 10);
  state.gold += gain;
  state.favor += favorGain;
  logEvent(`Collected ${Math.floor(gain)} gold and ${favorGain} favor.`);
  renderAll();
}

function buyUpgrade(id) {
  const upgrade = state.upgrades.find((item) => item.id === id);
  if (!upgrade) {
    return;
  }
  const cost = getUpgradeCost(upgrade);
  if (state.gold < cost) {
    return;
  }
  state.gold -= cost;
  upgrade.owned += 1;
  state.favor += upgrade.favorGain;
  logEvent(`Raised ${upgrade.name}. Favor +${upgrade.favorGain}.`);
  calculateIncome();
  renderAll();
}

function renderAll() {
  calculateIncome();
  renderResources();
  renderUpgrades();
  renderLog();
}

function tick() {
  const now = Date.now();
  const elapsed = (now - state.lastTick) / 1000;
  state.lastTick = now;
  state.gold += state.income * elapsed;
  renderResources();
  renderUpgrades();
  updateBellProgress();
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  elements.saveStatus.textContent = `Saved at ${new Date().toLocaleTimeString()}.`;
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    renderAll();
    return;
  }
  try {
    const saved = JSON.parse(raw);
    state.gold = saved.gold ?? state.gold;
    state.favor = saved.favor ?? state.favor;
    state.income = saved.income ?? state.income;
    state.lastTick = Date.now();
    state.upgrades = saved.upgrades ?? state.upgrades;
    state.log = saved.log ?? [];
    renderAll();
  } catch (error) {
    console.error("Failed to load save", error);
  }
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  state.gold = 0;
  state.favor = 0;
  state.income = 0;
  state.upgrades.forEach((upgrade) => {
    upgrade.owned = 0;
  });
  state.log = [];
  logEvent("The chronicle begins anew.");
  renderAll();
}

elements.harvestButton.addEventListener("click", harvest);
elements.resetButton.addEventListener("click", resetGame);

loadGame();
logEvent("Night falls over the dominion.");

setInterval(tick, TICK_RATE);
setInterval(saveGame, 10000);
