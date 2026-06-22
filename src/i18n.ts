import type { EnemyId } from "./data/enemies";
import type { BuildPathId } from "./data/buildPaths";
import type { SkillId } from "./data/skills";
import type { WeaponId } from "./data/weapons";

export type Locale = "zh-TW" | "en";

const STORAGE_KEY = "sword-survivors-locale";

const messages = {
  "zh-TW": {
    title: "笑傲江湖倖存者",
    playerName: "令狐沖",
    menuSubtitle: "令狐沖獨入江湖。",
    menuPitch: "斬破各派圍攻，收聚玉魄真氣，領悟失傳劍法。",
    controls: "WASD / 方向鍵移動\n滑鼠或 1-3 領悟武學",
    startRun: "踏入江湖",
    languageToggle: "English",
    victoryTitle: "劍意縱橫",
    defeatTitle: "江湖未平",
    resultLine: "令狐沖撐過 {time}   擊敗 {kills}\n聲望 {score}   最高 {best}",
    restart: "再闖江湖",
    hp: "氣血",
    renown: "聲望",
    defeated: "擊敗",
    forms: "招式",
    martialSkills: "心法",
    none: "尚未領悟",
    innerForce: "內力",
    martialLayers: "武學層數",
    paused: "暫停",
    pauseHint: "按 Esc 重返江湖",
    manualTitle: "秘笈展開",
    manualHint: "選擇一項領悟，推進令狐沖的武學道路",
    bossWarning: "{minute}:00  {name} 現身江湖",
    devHud: "測試  {seconds}秒  x{scale}\nF1 切換  L 升級  B Boss  N +60秒",
    devOn: "測試",
    devOff: "正式",
    elite: "精英",
    unlock: "領悟 {name}",
    learn: "參悟 {name}",
    weaponLevel: "{name} 第 {level} 重",
    skillLevel: "{name} 第 {level} 重",
    addWeapon: "新增「{name}」作為可用武學",
    improveWeapon: "目前第 {level} 重；提升傷害、數量或冷卻",
    damageTitle: "劍意",
    damageDescription: "傷害 {current}% -> {next}%",
    cooldownTitle: "行氣如流",
    cooldownDescription: "武學運轉加快 10%",
    speedTitle: "輕身步法",
    speedDescription: "身法 {current} -> {next}",
    pickupTitle: "聽風辨氣",
    pickupDescription: "拾取範圍 {current} -> {next}",
    healTitle: "調息歸元",
    healDescription: "回復 25 氣血，並提升 10 氣血上限",
    duguDescription: "劍法傷害 +16%，劍氣範圍 +{aura}%",
    starAbsorptionSkillDescription: "氣血上限 +14，回復 {heal} 氣血",
    footworkDescription: "身法 {current} -> {next}，拾取範圍 +12",
    wineHeartDescription: "冷卻 -7%，招式速度 +{speed}%",
    weapon_magicBolt: "劍氣",
    weapon_orbitBlade: "護體劍輪",
    weapon_flameWave: "破掌氣浪",
    weapon_thunderStrike: "九劍一閃",
    weapon_starVortex: "吸星力場",
    skill_duguNineSwords: "獨孤九劍",
    skill_starAbsorption: "吸星內力",
    skill_huashanFootwork: "華山雲步",
    skill_wineSwordHeart: "酒劍心",
    enemy_slime: "青城弟子",
    enemy_bat: "魔教刺客",
    enemy_golem: "嵩山高手",
    enemy_minorBoss: "敵派執令",
    enemy_midBoss: "叛門宗師",
    enemy_greatBoss: "劍宗長老",
    enemy_megaBoss: "魔教霸主",
    enemy_finalBoss: "東方不敗",
    buildUnlock: "走上「{name}」",
    buildLevel: "{name} 第 {level} 重",
    buildPaths: "流派",
    buildSwordTitle: "劍宗流",
    buildQiTitle: "氣宗流",
    buildFootworkTitle: "身法流",
    buildWineTitle: "酒劍流",
    buildSwordDescription: "傷害 +{damage}%，暴擊 +{crit}%，劍宗第 {level} 重",
    buildQiDescription: "範圍 +{area}%，吸血調息 +{leech}",
    buildFootworkDescription: "移速 +{speed}，閃避 +{dodge}%，拾取 +{pickup}",
    buildWineDescription: "冷卻 -{cooldown}%，連擊 +{combo}%，爆發 +{burst}%",
    skillUnlockedToast: "解鎖心法：{name}",
    achievementToast: "達成：{name}",
    recordLine: "最高難度 {difficulty}   最快通關 {fastest}\n成就 {achievements}",
    achievement_firstRival: "初破敵陣",
    achievement_midBoss: "五分定勝",
    achievement_greatBoss: "劍宗試煉",
    achievement_megaBoss: "魔教破關",
    achievement_finalBoss: "笑傲江湖",
    achievement_renown10000: "萬點聲望"
  },
  en: {
    title: "Wandering Sword Survivors",
    playerName: "Linghu Chong",
    menuSubtitle: "Linghu Chong enters the jianghu alone.",
    menuPitch: "Cut through rival sects, gather jade qi, and master lost sword forms.",
    controls: "WASD / Arrow keys to move\nChoose martial arts with mouse or 1-3",
    startRun: "Start Run",
    languageToggle: "繁體中文",
    victoryTitle: "Sword Roams Free",
    defeatTitle: "The Jianghu Prevails",
    resultLine: "Linghu Chong survived {time}   Defeated {kills}\nRenown {score}   Best {best}",
    restart: "Roam Again",
    hp: "HP",
    renown: "Renown",
    defeated: "Defeated",
    forms: "Forms",
    martialSkills: "Martial Skills",
    none: "None",
    innerForce: "Inner Force",
    martialLayers: "Martial Layers",
    paused: "Paused",
    pauseHint: "Press Esc to return to the jianghu",
    manualTitle: "A Secret Manual Opens",
    manualHint: "Choose one insight to deepen Linghu Chong's path",
    bossWarning: "{minute}:00  {name} enters the field",
    devHud: "DEV  {seconds}s  x{scale}\nF1 toggle  L level  B boss  N +60s",
    devOn: "DEV",
    devOff: "LIVE",
    elite: "Elite",
    unlock: "Unlock {name}",
    learn: "Learn {name}",
    weaponLevel: "{name} Lv.{level}",
    skillLevel: "{name} Lv.{level}",
    addWeapon: "Add {name} to your arsenal",
    improveWeapon: "Current Lv.{level}; improve damage, count, or cooldown",
    damageTitle: "Sword Intent",
    damageDescription: "Damage {current}% -> {next}%",
    cooldownTitle: "Flowing Meridian",
    cooldownDescription: "Martial arts recover 10% faster",
    speedTitle: "Lightness Step",
    speedDescription: "Move speed {current} -> {next}",
    pickupTitle: "Qi Sense",
    pickupDescription: "Pickup range {current} -> {next}",
    healTitle: "Inner Breath",
    healDescription: "Recover 25 HP and gain +10 max HP",
    duguDescription: "Sword damage +16%, sword aura +{aura}%",
    starAbsorptionSkillDescription: "Max HP +14, recover {heal} HP",
    footworkDescription: "Move speed {current} -> {next}, pickup range +12",
    wineHeartDescription: "Cooldown -7%, projectile speed +{speed}%",
    weapon_magicBolt: "Sword Qi",
    weapon_orbitBlade: "Circling Sword Guard",
    weapon_flameWave: "Breaking Palm Wave",
    weapon_thunderStrike: "Nine Swords Flash",
    weapon_starVortex: "Star Absorption Field",
    skill_duguNineSwords: "Dugu Nine Swords",
    skill_starAbsorption: "Star Absorption Inner Force",
    skill_huashanFootwork: "Huashan Cloud Steps",
    skill_wineSwordHeart: "Wine-Tempered Sword Heart",
    enemy_slime: "Qingcheng Disciple",
    enemy_bat: "Demonic Cult Assassin",
    enemy_golem: "Songshan Expert",
    enemy_minorBoss: "Rival Sect Captain",
    enemy_midBoss: "Renegade Master",
    enemy_greatBoss: "Grand Sword Elder",
    enemy_megaBoss: "Demonic Sect Overlord",
    enemy_finalBoss: "Eastern Invincible",
    buildUnlock: "Enter {name}",
    buildLevel: "{name} Lv.{level}",
    buildPaths: "Build Paths",
    buildSwordTitle: "Sword Sect",
    buildQiTitle: "Qi Sect",
    buildFootworkTitle: "Footwork Path",
    buildWineTitle: "Wine Sword Path",
    buildSwordDescription: "Damage +{damage}%, crit +{crit}%, Sword Sect Lv.{level}",
    buildQiDescription: "Area +{area}%, inner-force leech +{leech}",
    buildFootworkDescription: "Move speed +{speed}, dodge +{dodge}%, pickup +{pickup}",
    buildWineDescription: "Cooldown -{cooldown}%, combo +{combo}%, burst +{burst}%",
    skillUnlockedToast: "Skill unlocked: {name}",
    achievementToast: "Achievement: {name}",
    recordLine: "Highest Difficulty {difficulty}   Fastest Clear {fastest}\nAchievements {achievements}",
    achievement_firstRival: "First Rival Broken",
    achievement_midBoss: "Five-Minute Victory",
    achievement_greatBoss: "Sword Elder Trial",
    achievement_megaBoss: "Demonic Gate Broken",
    achievement_finalBoss: "Jianghu Mastered",
    achievement_renown10000: "Ten Thousand Renown"
  }
} as const;

type MessageKey = keyof (typeof messages)["en"];
type Vars = Record<string, string | number>;

let currentLocale: Locale = readInitialLocale();

export function locale(): Locale {
  return currentLocale;
}

export function setLocale(nextLocale: Locale): void {
  currentLocale = nextLocale;
  if (typeof window !== "undefined") {
    window.localStorage?.setItem(STORAGE_KEY, nextLocale);
  }
}

export function toggleLocale(): Locale {
  const nextLocale = currentLocale === "zh-TW" ? "en" : "zh-TW";
  setLocale(nextLocale);
  return nextLocale;
}

export function t(key: MessageKey, vars: Vars = {}): string {
  const template = messages[currentLocale][key] ?? messages.en[key];
  let text = String(template);
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

export function missingLocaleKeys(): string[] {
  const englishKeys = Object.keys(messages.en);
  const zhKeys = new Set(Object.keys(messages["zh-TW"]));
  return englishKeys.filter((key) => !zhKeys.has(key));
}

export function weaponName(id: WeaponId): string {
  return t(`weapon_${id}` as MessageKey);
}

export function skillName(id: SkillId): string {
  return t(`skill_${id}` as MessageKey);
}

export function enemyName(id: EnemyId): string {
  return t(`enemy_${id}` as MessageKey);
}

export function buildPathName(id: BuildPathId): string {
  const keys: Record<BuildPathId, MessageKey> = {
    swordSect: "buildSwordTitle",
    qiSect: "buildQiTitle",
    footworkSect: "buildFootworkTitle",
    wineSwordSect: "buildWineTitle"
  };
  return t(keys[id]);
}

export function achievementName(id: string): string {
  return t(`achievement_${id}` as MessageKey);
}

function readInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return "zh-TW";
  }

  const params = new URLSearchParams(window.location.search);
  const requested = params.get("lang");
  if (requested === "en" || requested === "zh-TW") {
    window.localStorage?.setItem(STORAGE_KEY, requested);
    return requested;
  }

  const stored = window.localStorage?.getItem(STORAGE_KEY);
  return stored === "en" || stored === "zh-TW" ? stored : "zh-TW";
}
