const SAVE_KEY = "svendor-idle-save";
const TICK_RATE = 1000;
const BELL_COOLDOWN = 1200;
const EVENT_COOLDOWN = 16000;
const EVENT_CHANCE = 0.12;

const UPGRADE_DEFS = [
  {
    id: "chapel",
    name: "Nocturne Chapel",
    description: "Pilgrims bring 1 gold / sec.",
    baseCost: 25,
    income: 1,
    favorGain: 1,
  },
  {
    id: "crypt",
    name: "Silent Crypt",
    description: "Whispers grant 4 gold / sec.",
    baseCost: 120,
    income: 4,
    favorGain: 2,
  },
  {
    id: "cathedral",
    name: "Gothic Cathedral",
    description: "The choir sustains 12 gold / sec.",
    baseCost: 480,
    income: 12,
    favorGain: 5,
  },
  {
    id: "abbey",
    name: "Obsidian Abbey",
    description: "Abbesses collect 28 gold / sec.",
    baseCost: 1450,
    income: 28,
    favorGain: 9,
  },
  {
    id: "foundry",
    name: "Midnight Foundry",
    description: "Forge-masters mint 65 gold / sec.",
    baseCost: 4200,
    income: 65,
    favorGain: 14,
  },
  {
    id: "observatory",
    name: "Umbral Observatory",
    description: "Star-readers divine 120 gold / sec.",
    baseCost: 9800,
    income: 120,
    favorGain: 22,
  },
  {
    id: "citadel",
    name: "Eclipse Citadel",
    description: "Citadel garrisons grant 240 gold / sec.",
    baseCost: 24000,
    income: 240,
    favorGain: 35,
  },
  {
    id: "siegeworks",
    name: "Nether Siegeworks",
    description: "Siege captains deliver 420 gold / sec.",
    baseCost: 58000,
    income: 420,
    favorGain: 50,
  },
  {
    id: "sanctum",
    name: "Veiled Sanctum",
    description: "Veilkeepers ordain 720 gold / sec.",
    baseCost: 130000,
    income: 720,
    favorGain: 80,
  },
];

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

const ritualDefs = [
  {
    id: "moonlit-rite",
    name: "Moonlit Rite",
    description: "Double tribute income for 45s.",
    cost: { favor: 30 },
    duration: 45000,
    cooldown: 120000,
    effect: { incomeMultiplier: 2 },
  },
  {
    id: "blood-oath",
    name: "Blood Oath",
    description: "Clicks grant +150% gold and +10% crit chance for 35s.",
    cost: { favor: 45 },
    duration: 35000,
    cooldown: 150000,
    effect: { clickMultiplier: 2.5, critBonus: 0.1 },
  },
  {
    id: "eclipse-vow",
    name: "Eclipse Vow",
    description: "Earn +25% income and +15 renown on purchases for 90s.",
    cost: { favor: 70, renown: 1 },
    duration: 90000,
    cooldown: 210000,
    effect: { incomeMultiplier: 1.25, renownBonus: 0.15 },
  },
];

const questTemplates = [
  {
    id: "bells",
    title: "Ring the Bells",
    description: "Toll the bell {target} times.",
    type: "click",
    min: 8,
    max: 16,
  },
  {
    id: "builders",
    title: "Raise New Halls",
    description: "Purchase {target} upgrades.",
    type: "upgrade",
    min: 4,
    max: 8,
  },
  {
    id: "omens",
    title: "Summon Omens",
    description: "Recruit {target} workers.",
    type: "worker",
    min: 2,
    max: 5,
  },
  {
    id: "tribute",
    title: "Tribute Overflow",
    description: "Earn {target} gold from tribute.",
    type: "gold",
    min: 600,
    max: 1500,
  },
  {
    id: "influence",
    title: "Influence Rising",
    description: "Generate {target} gold per second.",
    type: "income",
    min: 80,
    max: 180,
  },
];

const achievementDefs = [
  {
    id: "first-tribute",
    name: "First Tribute",
    description: "Collect your first 100 gold.",
    check: (state) => state.totalGoldEarned >= 100,
  },
  {
    id: "nightfall",
    name: "Nightfall Steward",
    description: "Reach 250 gold per second.",
    check: (state) => state.income >= 250,
  },
  {
    id: "master-mason",
    name: "Master Mason",
    description: "Own 12 sanctum upgrades.",
    check: (state) => getUpgradeTotal(state) >= 12,
  },
  {
    id: "legion",
    name: "Shadow Legion",
    description: "Command 8 workers.",
    check: (state) => getWorkerTotal(state) >= 8,
  },
];

const elements = {
  goldValue: document.getElementById("goldValue"),
  favorValue: document.getElementById("favorValue"),
  renownValue: document.getElementById("renownValue"),
  incomeValue: document.getElementById("incomeValue"),
  blessingValue: document.getElementById("blessingValue"),
  harvestButton: document.getElementById("harvestButton"),
  upgradeList: document.getElementById("upgradeList"),
  cardList: document.getElementById("cardList"),
  ritualList: document.getElementById("ritualList"),
  questList: document.getElementById("questList"),
  statsList: document.getElementById("statsList"),
  achievementList: document.getElementById("achievementList"),
  eventLog: document.getElementById("eventLog"),
  bellProgress: document.getElementById("bellProgress"),
  bellText: document.getElementById("bellText"),
  saveStatus: document.getElementById("saveStatus"),
  resetButton: document.getElementById("resetButton"),
  eventOverlay: document.getElementById("eventOverlay"),
  upgradeCount: document.getElementById("upgradeCount"),
  workerCount: document.getElementById("workerCount"),
  summonButton: document.getElementById("summonButton"),
  summonCost: document.getElementById("summonCost"),
  ascendButton: document.getElementById("ascendButton"),
  ascendGain: document.getElementById("ascendGain"),
  settingsToggle: document.getElementById("settingsToggle"),
};

const state = {
  gold: 0,
  favor: 0,
  renown: 0,
  income: 0,
  clickPower: 8,
  critChance: 0.05,
  critMultiplier: 2.2,
  totalGoldEarned: 0,
  totalClicks: 0,
  totalRenownGained: 0,
  playTime: 0,
  lastTick: Date.now(),
  lastSave: Date.now(),
  lastEventAt: 0,
  lastBell: 0,
  upgrades: UPGRADE_DEFS.map((upgrade) => ({ ...upgrade, owned: 0 })),
  cardsOwned: {},
  log: [],
  ritualState: {
    activeId: null,
    endsAt: 0,
    cooldowns: {},
  },
  questState: {
    quests: [],
  },
  achievements: {},
  settings: {
    reducedMotion: false,
  },
};

let bellReady = true;
let eventActive = false;

function formatNumber(value) {
  return Math.floor(value).toLocaleString();
}

function formatTimer(ms) {
  if (ms <= 0) {
    return "Ready";
  }
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function logEvent(message) {
  state.log.unshift({ message, time: new Date().toLocaleTimeString() });
  state.log = state.log.slice(0, 8);
  renderLog();
}

function getUpgradeTotal(currentState = state) {
  return currentState.upgrades.reduce((sum, upgrade) => sum + upgrade.owned, 0);
}

function getWorkerTotal(currentState = state) {
  return Object.values(currentState.cardsOwned).reduce((sum, count) => sum + count, 0);
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

function getRitualEffect() {
  const activeId = state.ritualState.activeId;
  if (!activeId) {
    return { incomeMultiplier: 1, clickMultiplier: 1, critBonus: 0, renownBonus: 0 };
  }
  const ritual = ritualDefs.find((entry) => entry.id === activeId);
  return {
    incomeMultiplier: ritual?.effect.incomeMultiplier ?? 1,
    clickMultiplier: ritual?.effect.clickMultiplier ?? 1,
    critBonus: ritual?.effect.critBonus ?? 0,
    renownBonus: ritual?.effect.renownBonus ?? 0,
  };
}

function calculateIncome() {
  const upgradeIncome = state.upgrades.reduce(
    (total, upgrade) => total + upgrade.income * upgrade.owned,
    0
  );
  const cardIncome = getCardIncome();
  const ritualEffect = getRitualEffect();
  state.income = (upgradeIncome + cardIncome) * ritualEffect.incomeMultiplier * (1 + state.renown * 0.04);
}

function renderResources() {
  elements.goldValue.textContent = formatNumber(state.gold);
  elements.favorValue.textContent = formatNumber(state.favor);
  elements.renownValue.textContent = formatNumber(state.renown);
  elements.incomeValue.textContent = formatNumber(state.income);
  elements.blessingValue.textContent = state.ritualState.activeId
    ? `${ritualDefs.find((ritual) => ritual.id === state.ritualState.activeId)?.name} (${formatTimer(
        state.ritualState.endsAt - Date.now()
      )})`
    : "Dormant";
}

function renderOverview() {
  if (elements.upgradeCount) {
    elements.upgradeCount.textContent = formatNumber(getUpgradeTotal());
  }
  if (elements.workerCount) {
    elements.workerCount.textContent = formatNumber(getWorkerTotal());
  }
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
    button.textContent = `Invest ${formatNumber(cost)}g`;
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
    rarity.className = `rarity rarity--${card.rarity}`;
    rarity.textContent = card.rarity;

    const count = document.createElement("div");
    count.className = "card-count";
    count.textContent = `Owned ${state.cardsOwned[card.id] || 0}`;

    entry.append(title, description, rarity, count);
    elements.cardList.appendChild(entry);
  });
}

function renderRituals() {
  elements.ritualList.innerHTML = "";
  ritualDefs.forEach((ritual) => {
    const entry = document.createElement("div");
    entry.className = "ritual-card";

    const title = document.createElement("h3");
    title.textContent = ritual.name;

    const description = document.createElement("p");
    description.textContent = ritual.description;

    const meta = document.createElement("div");
    meta.className = "ritual-meta";
    const cost = document.createElement("span");
    cost.textContent = `Cost: ${formatNumber(ritual.cost.favor || 0)} favor${
      ritual.cost.renown ? `, ${ritual.cost.renown} renown` : ""
    }`;

    const cooldownLeft = Math.max(0, (state.ritualState.cooldowns[ritual.id] || 0) - Date.now());
    const cooldown = document.createElement("span");
    cooldown.textContent = `Cooldown: ${formatTimer(cooldownLeft)}`;
    meta.append(cost, cooldown);

    const button = document.createElement("button");
    button.className = "primary";
    button.textContent = "Invoke";
    button.disabled = !canActivateRitual(ritual);
    button.addEventListener("click", () => activateRitual(ritual.id));

    entry.append(title, description, meta, button);
    elements.ritualList.appendChild(entry);
  });
}

function renderQuests() {
  elements.questList.innerHTML = "";
  state.questState.quests.forEach((quest) => {
    const entry = document.createElement("div");
    entry.className = `quest-card ${quest.completed ? "is-complete" : ""}`;

    const title = document.createElement("h3");
    title.textContent = quest.title;

    const description = document.createElement("p");
    description.textContent = quest.description;

    const progress = document.createElement("div");
    progress.className = "quest-progress";
    progress.textContent = `${formatNumber(quest.progress)} / ${formatNumber(quest.target)}`;

    const reward = document.createElement("div");
    reward.className = "quest-reward";
    reward.textContent = `Reward: ${formatNumber(quest.reward.gold)}g, ${formatNumber(
      quest.reward.favor
    )} favor${quest.reward.renown ? `, ${quest.reward.renown} renown` : ""}`;

    const button = document.createElement("button");
    button.className = quest.completed ? "primary" : "ghost";
    button.textContent = quest.completed ? "Claim" : "In progress";
    button.disabled = !quest.completed;
    button.addEventListener("click", () => claimQuest(quest.id));

    entry.append(title, description, progress, reward, button);
    elements.questList.appendChild(entry);
  });
}

function renderStats() {
  elements.statsList.innerHTML = "";
  const stats = [
    { label: "Total Gold Earned", value: formatNumber(state.totalGoldEarned) },
    { label: "Total Bells Tolled", value: formatNumber(state.totalClicks) },
    { label: "Renown Earned", value: formatNumber(state.totalRenownGained) },
    { label: "Time Ruled", value: formatTimer(state.playTime * 1000) },
    { label: "Current Tribute / sec", value: formatNumber(state.income) },
    { label: "Critical Chance", value: `${Math.round(state.critChance * 100)}%` },
    { label: "Click Power", value: formatNumber(getClickPower()) },
  ];

  stats.forEach((stat) => {
    const row = document.createElement("div");
    row.className = "stats-row";
    const label = document.createElement("span");
    label.textContent = stat.label;
    const value = document.createElement("span");
    value.textContent = stat.value;
    row.append(label, value);
    elements.statsList.appendChild(row);
  });

  renderAchievements();
}

function renderAchievements() {
  elements.achievementList.innerHTML = "";
  achievementDefs.forEach((achievement) => {
    const unlocked = state.achievements[achievement.id];
    const entry = document.createElement("div");
    entry.className = `achievement-card ${unlocked ? "is-unlocked" : ""}`;

    const title = document.createElement("h3");
    title.textContent = achievement.name;

    const description = document.createElement("p");
    description.textContent = achievement.description;

    const status = document.createElement("span");
    status.className = "achievement-status";
    status.textContent = unlocked ? "Unlocked" : "Locked";

    entry.append(title, description, status);
    elements.achievementList.appendChild(entry);
  });
}

function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item[data-target]");
  const sections = document.querySelectorAll(".page-section");

  const setActive = (targetId) => {
    sections.forEach((section) => {
      section.classList.toggle("is-active", section.id === targetId);
    });
    navItems.forEach((item) => {
      item.classList.toggle("is-active", item.dataset.target === targetId);
    });
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => setActive(item.dataset.target));
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

function getClickPower() {
  const ritualEffect = getRitualEffect();
  return state.clickPower * (1 + state.renown * 0.03) * ritualEffect.clickMultiplier;
}

function harvest() {
  if (!bellReady) {
    return;
  }
  bellReady = false;
  state.lastBell = Date.now();
  const ritualEffect = getRitualEffect();
  const baseGain = getClickPower() + state.favor * 0.15;
  const critChance = Math.min(0.5, state.critChance + ritualEffect.critBonus);
  const isCrit = Math.random() < critChance;
  const gain = baseGain * (isCrit ? state.critMultiplier : 1);
  const favorGain = 1 + Math.floor(state.income / 12);
  state.gold += gain;
  state.favor += favorGain;
  state.totalGoldEarned += gain;
  state.totalClicks += 1;
  logEvent(
    `Collected ${Math.floor(gain)} gold${isCrit ? " (critical)" : ""} and ${favorGain} favor.`
  );
  updateQuestProgress("click", 1);
  updateQuestProgress("gold", gain);
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
  const ritualEffect = getRitualEffect();
  const renownGain = Math.floor((upgrade.favorGain / 12) * (1 + ritualEffect.renownBonus));
  state.favor += upgrade.favorGain;
  if (renownGain > 0) {
    state.renown += renownGain;
    state.totalRenownGained += renownGain;
  }
  logEvent(`Raised ${upgrade.name}. Favor +${upgrade.favorGain}.`);
  updateQuestProgress("upgrade", 1);
  calculateIncome();
  renderAll();
}

function getSummonCost() {
  return Math.floor(20 + Math.pow(getWorkerTotal() + 1, 1.6) * 12);
}

function summonWorker() {
  const cost = getSummonCost();
  if (state.favor < cost) {
    return;
  }
  state.favor -= cost;
  const roll = Math.random();
  let rarity = "common";
  if (roll > 0.94) {
    rarity = "legendary";
  } else if (roll > 0.8) {
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
  logEvent(`An omen reveals a ${reward.name} (${reward.rarity}).`);
  updateQuestProgress("worker", 1);
  calculateIncome();
  renderAll();
}

function canActivateRitual(ritual) {
  const cooldownUntil = state.ritualState.cooldowns[ritual.id] || 0;
  if (Date.now() < cooldownUntil) {
    return false;
  }
  if (state.ritualState.activeId && Date.now() < state.ritualState.endsAt) {
    return false;
  }
  const favorCost = ritual.cost.favor || 0;
  const renownCost = ritual.cost.renown || 0;
  return state.favor >= favorCost && state.renown >= renownCost;
}

function activateRitual(id) {
  const ritual = ritualDefs.find((entry) => entry.id === id);
  if (!ritual || !canActivateRitual(ritual)) {
    return;
  }
  state.favor -= ritual.cost.favor || 0;
  state.renown -= ritual.cost.renown || 0;
  state.ritualState.activeId = ritual.id;
  state.ritualState.endsAt = Date.now() + ritual.duration;
  state.ritualState.cooldowns[ritual.id] = Date.now() + ritual.cooldown;
  logEvent(`The ${ritual.name} echoes across the dominion.`);
  calculateIncome();
  renderAll();
}

function updateRitualState() {
  if (state.ritualState.activeId && Date.now() >= state.ritualState.endsAt) {
    state.ritualState.activeId = null;
    state.ritualState.endsAt = 0;
  }
}

function generateQuest(seedIndex) {
  const template = questTemplates[seedIndex % questTemplates.length];
  const target = Math.floor(
    Math.random() * (template.max - template.min + 1) + template.min
  );
  const reward = {
    gold: Math.floor(target * 18),
    favor: Math.floor(target * 1.5),
    renown: target > 12 ? 1 : 0,
  };

  return {
    id: `${template.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: template.title,
    description: template.description.replace("{target}", formatNumber(target)),
    type: template.type,
    target,
    progress: 0,
    reward,
    completed: false,
  };
}

function initializeQuests() {
  if (state.questState.quests.length > 0) {
    return;
  }
  state.questState.quests = [generateQuest(0), generateQuest(1), generateQuest(2)];
}

function updateQuestProgress(type, amount) {
  state.questState.quests.forEach((quest) => {
    if (quest.type !== type || quest.completed) {
      return;
    }
    if (type === "income") {
      quest.progress = Math.min(quest.target, state.income);
    } else {
      quest.progress = Math.min(quest.target, quest.progress + amount);
    }
    if (quest.progress >= quest.target) {
      quest.completed = true;
      logEvent(`Quest complete: ${quest.title}.`);
    }
  });
  renderQuests();
}

function claimQuest(questId) {
  const questIndex = state.questState.quests.findIndex((quest) => quest.id === questId);
  if (questIndex === -1) {
    return;
  }
  const quest = state.questState.quests[questIndex];
  if (!quest.completed) {
    return;
  }
  state.gold += quest.reward.gold;
  state.favor += quest.reward.favor;
  state.renown += quest.reward.renown;
  state.totalGoldEarned += quest.reward.gold;
  state.totalRenownGained += quest.reward.renown;
  logEvent(`Claimed ${quest.reward.gold} gold and ${quest.reward.favor} favor.`);
  state.questState.quests.splice(questIndex, 1, generateQuest(questIndex));
  calculateIncome();
  renderAll();
}

function checkAchievements() {
  achievementDefs.forEach((achievement) => {
    if (!state.achievements[achievement.id] && achievement.check(state)) {
      state.achievements[achievement.id] = true;
      logEvent(`Achievement unlocked: ${achievement.name}.`);
    }
  });
}

function updateAscension() {
  const potential = Math.floor(state.favor / 250);
  elements.ascendGain.textContent = `${potential} renown`;
  elements.ascendButton.disabled = potential <= 0;
}

function ascend() {
  const renownGain = Math.floor(state.favor / 250);
  if (renownGain <= 0) {
    return;
  }
  state.renown += renownGain;
  state.totalRenownGained += renownGain;
  state.gold = 0;
  state.favor = 0;
  state.upgrades.forEach((upgrade) => {
    upgrade.owned = 0;
  });
  workerCards.forEach((card) => {
    state.cardsOwned[card.id] = 0;
  });
  state.questState.quests = [];
  initializeQuests();
  state.log = [];
  logEvent(`Ascended into renown. ${renownGain} renown gained.`);
  calculateIncome();
  renderAll();
}

function renderAll() {
  calculateIncome();
  renderResources();
  renderOverview();
  renderUpgrades();
  renderCards();
  renderRituals();
  renderQuests();
  renderStats();
  renderLog();
  updateAscension();
  updateSummonCost();
}

function startCoinShower() {
  if (eventActive || state.settings.reducedMotion) {
    return;
  }
  eventActive = true;
  state.lastEventAt = Date.now();
  elements.eventOverlay.classList.add("active");
  logEvent("A shower of coins spills across the skies.");

  const showerDuration = 7000;
  const spawnInterval = 400;
  const chestChance = 0.12;
  const hasChest = Math.random() < chestChance;
  const showerEnd = Date.now() + showerDuration;

  const spawnCoin = () => {
    const coin = document.createElement("div");
    coin.className = "falling-coin";
    coin.textContent = "🪙";
    coin.style.left = `${Math.random() * 90 + 5}%`;
    const duration = Math.random() * 2.5 + 3;
    coin.style.animationDuration = `${duration}s`;
    coin.addEventListener("click", (event) => {
      event.stopPropagation();
      const value = 6 + Math.floor(Math.random() * 10);
      state.gold += value;
      state.totalGoldEarned += value;
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
    chest.style.animationDuration = "6s";
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
    setTimeout(spawnChest, 1600);
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
  updateQuestProgress("worker", 1);
  calculateIncome();
  renderAll();
}

function tick() {
  const now = Date.now();
  const elapsed = (now - state.lastTick) / 1000;
  state.lastTick = now;
  state.playTime += elapsed;
  state.gold += state.income * elapsed;
  state.totalGoldEarned += state.income * elapsed;
  renderResources();
  renderOverview();
  renderUpgrades();
  renderCards();
  renderRituals();
  renderQuests();
  renderStats();
  updateBellProgress();
  updateRitualState();
  checkAchievements();
  updateAscension();

  if (!eventActive && now - state.lastEventAt > EVENT_COOLDOWN) {
    if (Math.random() < EVENT_CHANCE) {
      startCoinShower();
    }
  }

  if (state.income > 0) {
    updateQuestProgress("income", state.income);
  }
}

function saveGame() {
  state.lastSave = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  elements.saveStatus.textContent = `Saved at ${new Date().toLocaleTimeString()}.`;
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  workerCards.forEach((card) => {
    state.cardsOwned[card.id] = 0;
  });
  if (!raw) {
    initializeQuests();
    renderAll();
    return;
  }
  try {
    const saved = JSON.parse(raw);
    state.gold = saved.gold ?? state.gold;
    state.favor = saved.favor ?? state.favor;
    state.renown = saved.renown ?? state.renown;
    state.income = saved.income ?? state.income;
    state.clickPower = saved.clickPower ?? state.clickPower;
    state.critChance = saved.critChance ?? state.critChance;
    state.critMultiplier = saved.critMultiplier ?? state.critMultiplier;
    state.totalGoldEarned = saved.totalGoldEarned ?? state.totalGoldEarned;
    state.totalClicks = saved.totalClicks ?? state.totalClicks;
    state.totalRenownGained = saved.totalRenownGained ?? state.totalRenownGained;
    state.playTime = saved.playTime ?? state.playTime;
    state.lastTick = Date.now();
    state.lastEventAt = saved.lastEventAt ?? 0;
    state.upgrades = UPGRADE_DEFS.map((upgrade) => {
      const savedUpgrade = saved.upgrades?.find((item) => item.id === upgrade.id);
      return { ...upgrade, owned: savedUpgrade?.owned ?? 0 };
    });
    state.log = saved.log ?? [];
    state.cardsOwned = saved.cardsOwned ?? state.cardsOwned;
    state.ritualState = {
      activeId: saved.ritualState?.activeId ?? null,
      endsAt: saved.ritualState?.endsAt ?? 0,
      cooldowns: saved.ritualState?.cooldowns ?? {},
    };
    state.questState = saved.questState ?? state.questState;
    state.achievements = saved.achievements ?? state.achievements;
    state.settings = saved.settings ?? state.settings;
    workerCards.forEach((card) => {
      state.cardsOwned[card.id] = state.cardsOwned[card.id] ?? 0;
    });
    initializeQuests();
    calculateIncome();
    renderAll();
  } catch (error) {
    console.error("Failed to load save", error);
  }
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  state.gold = 0;
  state.favor = 0;
  state.renown = 0;
  state.income = 0;
  state.totalGoldEarned = 0;
  state.totalClicks = 0;
  state.totalRenownGained = 0;
  state.playTime = 0;
  state.upgrades.forEach((upgrade) => {
    upgrade.owned = 0;
  });
  workerCards.forEach((card) => {
    state.cardsOwned[card.id] = 0;
  });
  state.log = [];
  state.questState.quests = [];
  state.ritualState = {
    activeId: null,
    endsAt: 0,
    cooldowns: {},
  };
  state.achievements = {};
  initializeQuests();
  logEvent("The chronicle begins anew.");
  renderAll();
}

function handleSettingsToggle() {
  state.settings.reducedMotion = !state.settings.reducedMotion;
  document.body.classList.toggle("reduced-motion", state.settings.reducedMotion);
  elements.settingsToggle.textContent = state.settings.reducedMotion
    ? "Enable Motion"
    : "Reduce Motion";
}

function applySavedSettings() {
  document.body.classList.toggle("reduced-motion", state.settings.reducedMotion);
  elements.settingsToggle.textContent = state.settings.reducedMotion
    ? "Enable Motion"
    : "Reduce Motion";
}

function setupEventListeners() {
  elements.harvestButton.addEventListener("click", harvest);
  elements.resetButton.addEventListener("click", resetGame);
  elements.summonButton.addEventListener("click", summonWorker);
  elements.ascendButton.addEventListener("click", ascend);
  elements.settingsToggle.addEventListener("click", handleSettingsToggle);
}

setupNavigation();
setupEventListeners();
loadGame();
applySavedSettings();
logEvent("Night falls over the dominion.");

setInterval(tick, TICK_RATE);
setInterval(saveGame, 10000);

function updateSummonCost() {
  const cost = getSummonCost();
  elements.summonCost.textContent = formatNumber(cost);
  elements.summonButton.disabled = state.favor < cost;
}

function renderAllDeferred() {
  renderAll();
}

setInterval(updateSummonCost, 1000);
setInterval(renderAllDeferred, 3000);
