const state = {
  gold: 0,
  favor: 0,
  income: 0,
  lastTick: Date.now(),
  lastEventAt: 0,
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
    {
      id: "abbey",
      name: "Obsidian Abbey",
      description: "Abbesses collect 28 gold / sec.",
      baseCost: 1450,
      income: 28,
      favorGain: 9,
      owned: 0,
    },
    {
      id: "foundry",
      name: "Midnight Foundry",
      description: "Forge-masters mint 65 gold / sec.",
      baseCost: 4200,
      income: 65,
      favorGain: 14,
      owned: 0,
    },
    {
      id: "observatory",
      name: "Umbral Observatory",
      description: "Star-readers divine 120 gold / sec.",
      baseCost: 9800,
      income: 120,
      favorGain: 22,
      owned: 0,
    },
    {
      id: "citadel",
      name: "Eclipse Citadel",
      description: "Citadel garrisons grant 240 gold / sec.",
      baseCost: 24000,
      income: 240,
      favorGain: 35,
      owned: 0,
    },
  ],
  cardsOwned: {},
  log: [],
};

const workerCards = [
  {
    id: "thrall",
    name: "Vampire Thrall",
    description: "Siphons +6 gold / sec.",
    rarity: "common",
    income: 6,
  },
  {
    id: "troll",
    name: "Bridge Troll",
    description: "Collects +10 gold / sec.",
    rarity: "common",
    income: 10,
  },
  {
    id: "zombie",
    name: "Slave Zombie",
    description: "Shuffles in +14 gold / sec.",
    rarity: "common",
    income: 14,
  },
  {
    id: "wraith",
    name: "Grave Wraith",
    description: "Whispers +24 gold / sec.",
    rarity: "rare",
    income: 24,
  },
  {
    id: "gargoyle",
    name: "Moon Gargoyle",
    description: "Perches for +36 gold / sec.",
    rarity: "rare",
    income: 36,
  },
  {
    id: "witch",
    name: "Coven Witch",
    description: "Brews +55 gold / sec.",
    rarity: "epic",
    income: 55,
  },
  {
    id: "lich",
    name: "Crypt Lich",
    description: "Commands +80 gold / sec.",
    rarity: "epic",
    income: 80,
  },
  {
    id: "phoenix",
    name: "Ash Phoenix",
    description: "Rekindles +120 gold / sec.",
    rarity: "legendary",
    income: 120,
  },
];

const elements = {
  goldValue: document.getElementById("goldValue"),
  favorValue: document.getElementById("favorValue"),
  incomeValue: document.getElementById("incomeValue"),
  harvestButton: document.getElementById("harvestButton"),
  upgradeList: document.getElementById("upgradeList"),
  cardList: document.getElementById("cardList"),
  eventLog: document.getElementById("eventLog"),
  bellProgress: document.getElementById("bellProgress"),
  bellText: document.getElementById("bellText"),
  saveStatus: document.getElementById("saveStatus"),
  resetButton: document.getElementById("resetButton"),
  eventOverlay: document.getElementById("eventOverlay"),
};

const SAVE_KEY = "svendor-idle-save";
const TICK_RATE = 1000;
const BELL_COOLDOWN = 1200;
const EVENT_COOLDOWN = 16000;
const EVENT_CHANCE = 0.12;
let bellReady = true;
let eventActive = false;

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

function getCardIncome() {
  return workerCards.reduce(
    (total, card) => total + card.income * (state.cardsOwned[card.id] || 0),
    0
  );
}

function calculateIncome() {
  const upgradeIncome = state.upgrades.reduce(
    (total, upgrade) => total + upgrade.income * upgrade.owned,
    0
  );
  state.income = upgradeIncome + getCardIncome();
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

function renderCards() {
  elements.cardList.innerHTML = "";
  workerCards.forEach((card) => {
    const entry = document.createElement("div");
    entry.className = "card-entry";

    const title = document.createElement("h3");
    title.textContent = card.name;

    const description = document.createElement("p");
    description.textContent = card.description;

    const rarity = document.createElement("span");
    rarity.className = "rarity";
    rarity.textContent = card.rarity;

    const count = document.createElement("div");
    count.className = "card-count";
    count.textContent = `Owned ${state.cardsOwned[card.id] || 0}`;

    entry.append(title, description, rarity, count);
    elements.cardList.appendChild(entry);
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
  renderCards();
  renderLog();
}

function startCoinShower() {
  if (eventActive) {
    return;
  }
  eventActive = true;
  state.lastEventAt = Date.now();
  elements.eventOverlay.classList.add("active");
  logEvent("A shower of coins spills across the skies.");

  const showerDuration = 9000;
  const spawnInterval = 550;
  const chestChance = 0.35;
  const hasChest = Math.random() < chestChance;
  const showerEnd = Date.now() + showerDuration;

  const spawnCoin = () => {
    const coin = document.createElement("div");
    coin.className = "falling-coin";
    coin.textContent = "🪙";
    coin.style.left = `${Math.random() * 90 + 5}%`;
    const duration = Math.random() * 3 + 6;
    coin.style.animationDuration = `${duration}s`;
    coin.addEventListener("click", (event) => {
      event.stopPropagation();
      const value = 6 + Math.floor(Math.random() * 10);
      state.gold += value;
      logEvent(`Caught ${value} gold from the falling coin.`);
      coin.remove();
      renderResources();
    });
    elements.eventOverlay.appendChild(coin);
    setTimeout(() => coin.remove(), duration * 1000);
  };

  const spawnChest = () => {
    const chest = document.createElement("div");
    chest.className = "falling-chest";
    chest.textContent = "🧰";
    chest.style.left = `${Math.random() * 80 + 10}%`;
    chest.style.animationDuration = "8s";
    chest.addEventListener("click", (event) => {
      event.stopPropagation();
      chest.remove();
      openChest();
    });
    elements.eventOverlay.appendChild(chest);
    setTimeout(() => chest.remove(), 6000);
  };

  const intervalId = setInterval(() => {
    if (Date.now() > showerEnd) {
      clearInterval(intervalId);
      return;
    }
    spawnCoin();
  }, spawnInterval);

  if (hasChest) {
    setTimeout(spawnChest, 1200);
  }

  setTimeout(() => {
    eventActive = false;
    elements.eventOverlay.classList.remove("active");
    elements.eventOverlay.innerHTML = "";
  }, showerDuration + 800);
}

function openChest() {
  const roll = Math.random();
  let rarity = "common";
  if (roll > 0.93) {
    rarity = "legendary";
  } else if (roll > 0.78) {
    rarity = "epic";
  } else if (roll > 0.5) {
    rarity = "rare";
  }

  const candidates = workerCards.filter((card) => card.rarity === rarity);
  const reward = candidates[Math.floor(Math.random() * candidates.length)];
  if (!reward) {
    return;
  }
  state.cardsOwned[reward.id] = (state.cardsOwned[reward.id] || 0) + 1;
  logEvent(`The chest reveals a ${reward.name} (${reward.rarity}).`);
  renderAll();
}

function tick() {
  const now = Date.now();
  const elapsed = (now - state.lastTick) / 1000;
  state.lastTick = now;
  state.gold += state.income * elapsed;
  renderResources();
  renderUpgrades();
  renderCards();
  updateBellProgress();

  if (!eventActive && now - state.lastEventAt > EVENT_COOLDOWN) {
    if (Math.random() < EVENT_CHANCE) {
      startCoinShower();
    }
  }
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  elements.saveStatus.textContent = `Saved at ${new Date().toLocaleTimeString()}.`;
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  workerCards.forEach((card) => {
    state.cardsOwned[card.id] = 0;
  });
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
    state.cardsOwned = saved.cardsOwned ?? state.cardsOwned;
    workerCards.forEach((card) => {
      state.cardsOwned[card.id] = state.cardsOwned[card.id] ?? 0;
    });
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
  workerCards.forEach((card) => {
    state.cardsOwned[card.id] = 0;
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
