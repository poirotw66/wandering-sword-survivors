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
    collectionButton: "武學圖鑑",
    collectionTitle: "江湖藏經閣",
    backToMenu: "返回",
    recordBookTitle: "通關紀錄",
    martialCodexTitle: "武學圖鑑",
    ultimateCodexTitle: "武林絕學",
    bossCodexTitle: "宿敵名錄",
    lockedCodexItem: "尚未見聞",
    collectionRecordLine: "最高聲望 {best}   累積聲望 {total}\n最高難度 {difficulty}   最快通關 {fastest}",
    collectionBuildLine: "常用流派 {favoriteBuild}   已得成就 {achievements}",
    legacyLine: "本場傳承：{unlocked}\n難度 {difficulty}   獎勵倍率 {reward}%\n累積聲望 {totalRenown}   已悟絕學 {ultimates}   已破宿敵 {bosses}\n常用流派：{favoriteBuild}",
    metaBonusLine: "{title}  開局加成：氣血 +{hp} / 移速 +{speed} / 拾取 +{pickup} / 刷新 +{rerolls}",
    difficultyButton: "難度 {level}\n{reward}%",
    difficultyLocked: "難度 {level}\n聲望 {renown}",
    difficultyHint: "累積聲望或突破更高難度，可解鎖下一階江湖。",
    rerollUpgrades: "重抽機緣 x{count}",
    runStartBonus: "{title}入局，江湖難度 {difficulty}",
    renownTitleWanderer: "江湖浪客",
    renownTitleHero: "少俠有名",
    renownTitleMaster: "一代宗師",
    renownTitleLegend: "武林神話",
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
    bossWarning: "五嶽風雲起：{name} 現身",
    devHud: "測試  {seconds}秒  x{scale}\nF1 切換  L 升級  B Boss  N +60秒",
    devOn: "測試",
    devOff: "正式",
    elite: "精英",
    eliteQingcheng: "青城精銳",
    eliteDemonic: "魔教影刺",
    eliteSongshan: "嵩山鐵衛",
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
    zixiaDescription: "招式範圍 +{area}%，傷害小幅提升",
    windStepDescription: "身法 {current} -> {next}，閃避提升",
    hunyuanDescription: "氣血上限 +{hp}，招式傷害提升",
    iceHeartDescription: "暴擊 +{crit}%，行氣更穩",
    vajraDescription: "氣血上限 +{hp}，拳掌威力提升",
    yijinDescription: "氣血上限 +{hp}，並回復氣血",
    cosmosDescription: "冷卻大幅降低，招式速度提升",
    formlessDescription: "所有傷害與招式範圍提升",
    marrowDescription: "大幅回復氣血，拾取範圍提升",
    freewindDescription: "身法、閃避與拾取範圍大幅提升",
    evolutionTitle: "領悟武林絕學：{name}",
    standaloneSkillTitle: "孤本心法：{name}",
    standaloneSkillHint: "不可結合招式，但效果更強。",
    evolutionBadge: "絕學",
    comboBadge: "可結合",
    standaloneBadge: "孤本",
    readyToEvolve: "已達條件，可領悟。",
    readyToEvolveShort: "可領悟",
    standaloneNoRecipe: "不參與絕學配方",
    recipeProgress: "配方進度 {current}/{total}",
    recipeHint: "{weapon} {weaponLevel}/{requiredWeapon} + {skill} {skillLevel}/{requiredSkill}\n可成：{art}",
    evolutionRoutes: "武學路線",
    evolution_voidDuguSword: "獨孤破式劍",
    evolution_windClearSwordArray: "清風十三劍陣",
    evolution_starDrainingPalm: "吸星摧心掌",
    evolution_drunkenShadowNineSwords: "醉裡破式九劍",
    evolution_starReturningOriginField: "吸星歸元大法",
    evolution_violetMistBlossomSword: "紫霞落英神劍",
    evolution_shadowlessGaleSlash: "狂風無影劍",
    evolution_taiyueMountainSealingForm: "太岳鎮嶽劍",
    evolution_coldPondMirrorSword: "寒潭照影十三劍",
    evolution_vajraHundredStepQuake: "金剛百步伏魔拳",
    evolution_voidDuguSwordDescription: "華山劍氣化為寬幅劍芒，穿透與暴擊裂空大幅提升。",
    evolution_windClearSwordArrayDescription: "希夷劍環化成劍陣，劍輪數量與護身範圍提升。",
    evolution_starDrainingPalmDescription: "劈空掌挾吸星內勁，命中時吸取氣血並牽引敵群。",
    evolution_drunkenShadowNineSwordsDescription: "破式一劍醉意連斬，鎖定多名敵人並追加爆發。",
    evolution_starReturningOriginFieldDescription: "吸星漩勁化為歸元力場，持續更久並回復氣血。",
    evolution_violetMistBlossomSwordDescription: "飛花回旋，紫霞內勁使二段傷害提升。",
    evolution_shadowlessGaleSlashDescription: "移動蓄風勢，滿勢後追加無影斬。",
    evolution_taiyueMountainSealingFormDescription: "三峰重劍落地鎮嶽，擊退並破防。",
    evolution_coldPondMirrorSwordDescription: "劍影留寒潭，減速敵人並留下殘影劍痕。",
    evolution_vajraHundredStepQuakeDescription: "拳勁化震波，直線穿透並短暫護體。",
    weapon_magicBolt: "華山劍氣",
    weapon_orbitBlade: "希夷劍環",
    weapon_flameWave: "劈空掌",
    weapon_thunderStrike: "破式一劍",
    weapon_starVortex: "吸星漩勁",
    weapon_blossomBlade: "落英飛花劍",
    weapon_galeSword: "狂風奪命劍",
    weapon_taiyuePeak: "太岳三青峰",
    weapon_coldPondSword: "寒潭映月劍",
    weapon_vajraFist: "百步穿雲拳",
    skill_duguNineSwords: "獨孤劍意",
    skill_starAbsorption: "吸星化功訣",
    skill_huashanFootwork: "華山清風步",
    skill_wineSwordHeart: "醉劍心訣",
    skill_zixiaDivineSkill: "紫霞神功",
    skill_windChasingStep: "追風逐影步",
    skill_hunyuanQi: "混元一氣功",
    skill_iceHeart: "冰心凝神訣",
    skill_vajraDemonSubduing: "金剛伏魔功",
    skill_yijinManual: "易筋鍛骨篇",
    skill_cosmosBreathing: "乾坤吐納訣",
    skill_formlessSutra: "無相心經",
    skill_marrowCleansing: "洗髓經",
    skill_freewindMethod: "逍遙御風訣",
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
    potentialEvolutionToast: "可悟絕學：{name}",
    bossDefeatedReward: "{name} 伏誅，江湖聲望大振，真氣 +{exp}",
    achievementToast: "達成：{name}",
    recordLine: "最高難度 {difficulty}   最快通關 {fastest}\n成就 {achievements}",
    achievement_firstRival: "初破敵陣",
    achievement_midBoss: "五分定勝",
    achievement_greatBoss: "劍宗試煉",
    achievement_megaBoss: "魔教破關",
    achievement_finalBoss: "笑傲江湖",
    achievement_renown10000: "萬點聲望",
    achievement_firstEvolution: "初悟絕學",
    achievement_voidDuguSword: "劍破長空",
    achievement_threeEvolutions: "一局三絕",
    achievement_fiveEvolutions: "十絕入門",
    achievement_rareManual: "孤本奇緣",
    achievement_mixedMastery: "博採眾長"
  },
  en: {
    title: "Wandering Sword Survivors",
    playerName: "Linghu Chong",
    menuSubtitle: "Linghu Chong enters the jianghu alone.",
    menuPitch: "Cut through rival sects, gather jade qi, and master lost sword forms.",
    controls: "WASD / Arrow keys to move\nChoose martial arts with mouse or 1-3",
    startRun: "Start Run",
    collectionButton: "Martial Codex",
    collectionTitle: "Jianghu Archive",
    backToMenu: "Back",
    recordBookTitle: "Run Records",
    martialCodexTitle: "Martial Codex",
    ultimateCodexTitle: "Ultimate Arts",
    bossCodexTitle: "Rival Register",
    lockedCodexItem: "Unknown",
    collectionRecordLine: "Best Renown {best}   Total Renown {total}\nHighest Difficulty {difficulty}   Fastest Clear {fastest}",
    collectionBuildLine: "Favorite Path {favoriteBuild}   Achievements {achievements}",
    legacyLine: "This run's legacy: {unlocked}\nDifficulty {difficulty}   Reward {reward}%\nTotal Renown {totalRenown}   Ultimate Arts {ultimates}   Rivals Broken {bosses}\nFavorite Path: {favoriteBuild}",
    metaBonusLine: "{title}  Start bonuses: HP +{hp} / Speed +{speed} / Pickup +{pickup} / Reroll +{rerolls}",
    difficultyButton: "Diff {level}\n{reward}%",
    difficultyLocked: "Diff {level}\nRenown {renown}",
    difficultyHint: "Gain total renown or clear higher tiers to unlock harder jianghu trials.",
    rerollUpgrades: "Reroll Fate x{count}",
    runStartBonus: "{title} enters Difficulty {difficulty}",
    renownTitleWanderer: "Wandering Blade",
    renownTitleHero: "Known Young Hero",
    renownTitleMaster: "Martial Master",
    renownTitleLegend: "Jianghu Legend",
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
    bossWarning: "Wuyue storm rises: {name} appears",
    devHud: "DEV  {seconds}s  x{scale}\nF1 toggle  L level  B boss  N +60s",
    devOn: "DEV",
    devOff: "LIVE",
    elite: "Elite",
    eliteQingcheng: "Qingcheng Elite",
    eliteDemonic: "Demonic Shadow",
    eliteSongshan: "Songshan Guard",
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
    zixiaDescription: "Area +{area}%, damage slightly increased",
    windStepDescription: "Move speed {current} -> {next}, dodge increased",
    hunyuanDescription: "Max HP +{hp}, martial damage increased",
    iceHeartDescription: "Crit +{crit}%, smoother cooldown flow",
    vajraDescription: "Max HP +{hp}, fist and palm power increased",
    yijinDescription: "Max HP +{hp}, recover HP",
    cosmosDescription: "Cooldown greatly reduced, projectile speed increased",
    formlessDescription: "All damage and martial area increased",
    marrowDescription: "Recover HP and increase pickup range",
    freewindDescription: "Move speed, dodge, and pickup range greatly increased",
    evolutionTitle: "Master Ultimate Art: {name}",
    standaloneSkillTitle: "Rare Manual: {name}",
    standaloneSkillHint: "Cannot evolve a form, but grants stronger effects.",
    evolutionBadge: "Ultimate",
    comboBadge: "Combo",
    standaloneBadge: "Rare",
    readyToEvolve: "Requirements met. Ready to master.",
    readyToEvolveShort: "Ready",
    standaloneNoRecipe: "Does not join an ultimate-art recipe",
    recipeProgress: "Recipe progress {current}/{total}",
    recipeHint: "{weapon} {weaponLevel}/{requiredWeapon} + {skill} {skillLevel}/{requiredSkill}\nBecomes: {art}",
    evolutionRoutes: "Martial Routes",
    evolution_voidDuguSword: "Void-Cleaving Dugu Sword",
    evolution_windClearSwordArray: "Wind-Clear Thirteen Sword Array",
    evolution_starDrainingPalm: "Star-Draining Heart Palm",
    evolution_drunkenShadowNineSwords: "Drunken Form-Breaking Nine Swords",
    evolution_starReturningOriginField: "Star-Returning Origin Field",
    evolution_violetMistBlossomSword: "Violet Mist Blossom Divine Sword",
    evolution_shadowlessGaleSlash: "Shadowless Gale Sword",
    evolution_taiyueMountainSealingForm: "Taiyue Mountain-Sealing Sword",
    evolution_coldPondMirrorSword: "Cold Pond Mirror Thirteen Swords",
    evolution_vajraHundredStepQuake: "Vajra Hundred-Step Demon Fist",
    evolution_voidDuguSwordDescription: "Sword Qi becomes a wide blade of intent with greater pierce and crit rifts.",
    evolution_windClearSwordArrayDescription: "The circling guard becomes a wider sword array with more blades.",
    evolution_starDrainingPalmDescription: "Palm waves drain HP and pull enemy groups with star force.",
    evolution_drunkenShadowNineSwordsDescription: "A drunken sword chain targets multiple foes with burst slashes.",
    evolution_starReturningOriginFieldDescription: "The vortex becomes a longer origin field that restores HP.",
    evolution_violetMistBlossomSwordDescription: "Blossoms return with violet inner-force follow-up damage.",
    evolution_shadowlessGaleSlashDescription: "Movement stores gale force for a shadowless bonus slash.",
    evolution_taiyueMountainSealingFormDescription: "Heavy sword peaks knock back and break defenses.",
    evolution_coldPondMirrorSwordDescription: "Sword shadows leave cold zones and mirror cuts.",
    evolution_vajraHundredStepQuakeDescription: "Fist force becomes a piercing quake with brief protection.",
    weapon_magicBolt: "Sword Qi",
    weapon_orbitBlade: "Circling Sword Guard",
    weapon_flameWave: "Breaking Palm Wave",
    weapon_thunderStrike: "Nine Swords Flash",
    weapon_starVortex: "Star Absorption Field",
    weapon_blossomBlade: "Falling Blossom Blades",
    weapon_galeSword: "Gale Swift Sword",
    weapon_taiyuePeak: "Three Peaks of Taiyue",
    weapon_coldPondSword: "Cold Pond Sword Shadow",
    weapon_vajraFist: "Hundred-Step Divine Fist",
    skill_duguNineSwords: "Dugu Nine Swords",
    skill_starAbsorption: "Star Absorption Inner Force",
    skill_huashanFootwork: "Huashan Cloud Steps",
    skill_wineSwordHeart: "Wine-Tempered Sword Heart",
    skill_zixiaDivineSkill: "Violet Mist Divine Skill",
    skill_windChasingStep: "Chasing Wind Shadow Step",
    skill_hunyuanQi: "Hunyuan One-Qi Skill",
    skill_iceHeart: "Ice Heart Focus Method",
    skill_vajraDemonSubduing: "Vajra Demon-Subduing Skill",
    skill_yijinManual: "Tendon-Bone Forging Manual",
    skill_cosmosBreathing: "Cosmos Breathing Method",
    skill_formlessSutra: "Formless Heart Sutra",
    skill_marrowCleansing: "Marrow-Cleansing Classic",
    skill_freewindMethod: "Freewind Wandering Method",
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
    potentialEvolutionToast: "Can master: {name}",
    bossDefeatedReward: "{name} falls. Renown surges, qi +{exp}",
    achievementToast: "Achievement: {name}",
    recordLine: "Highest Difficulty {difficulty}   Fastest Clear {fastest}\nAchievements {achievements}",
    achievement_firstRival: "First Rival Broken",
    achievement_midBoss: "Five-Minute Victory",
    achievement_greatBoss: "Sword Elder Trial",
    achievement_megaBoss: "Demonic Gate Broken",
    achievement_finalBoss: "Jianghu Mastered",
    achievement_renown10000: "Ten Thousand Renown",
    achievement_firstEvolution: "First Ultimate Art",
    achievement_voidDuguSword: "Sword Breaks the Sky",
    achievement_threeEvolutions: "Three Arts in One Run",
    achievement_fiveEvolutions: "Initiate of Ten Arts",
    achievement_rareManual: "Rare Manual Encounter",
    achievement_mixedMastery: "Broad Mastery"
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
