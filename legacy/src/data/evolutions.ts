import type { BuildPathId } from "./buildPaths";
import { SKILL_CONFIGS, type SkillId } from "./skills";
import type { WeaponId } from "./weapons";

export const EVOLUTION_REQUIRED_WEAPON_LEVEL = 5;
export const EVOLUTION_REQUIRED_SKILL_LEVEL = 5;

export type EvolutionId =
  | "voidDuguSword"
  | "windClearSwordArray"
  | "starDrainingPalm"
  | "drunkenShadowNineSwords"
  | "starReturningOriginField"
  | "violetMistBlossomSword"
  | "shadowlessGaleSlash"
  | "taiyueMountainSealingForm"
  | "coldPondMirrorSword"
  | "vajraHundredStepQuake";

export type EvolutionConfig = {
  id: EvolutionId;
  nameKey: string;
  descriptionKey: string;
  iconKey: string;
  baseWeaponId: WeaponId;
  requiredWeaponLevel: number;
  requiredSkillId: SkillId;
  requiredSkillLevel: number;
  preferredBuildPathId?: BuildPathId;
  implemented: boolean;
};

export const EVOLUTION_CONFIGS: Record<EvolutionId, EvolutionConfig> = {
  voidDuguSword: {
    id: "voidDuguSword",
    nameKey: "evolution_voidDuguSword",
    descriptionKey: "evolution_voidDuguSwordDescription",
    iconKey: "icon-evolution-dugu",
    baseWeaponId: "magicBolt",
    requiredWeaponLevel: EVOLUTION_REQUIRED_WEAPON_LEVEL,
    requiredSkillId: "duguNineSwords",
    requiredSkillLevel: EVOLUTION_REQUIRED_SKILL_LEVEL,
    preferredBuildPathId: "swordSect",
    implemented: true
  },
  windClearSwordArray: {
    id: "windClearSwordArray",
    nameKey: "evolution_windClearSwordArray",
    descriptionKey: "evolution_windClearSwordArrayDescription",
    iconKey: "icon-evolution-wind-array",
    baseWeaponId: "orbitBlade",
    requiredWeaponLevel: EVOLUTION_REQUIRED_WEAPON_LEVEL,
    requiredSkillId: "huashanFootwork",
    requiredSkillLevel: EVOLUTION_REQUIRED_SKILL_LEVEL,
    preferredBuildPathId: "footworkSect",
    implemented: true
  },
  starDrainingPalm: {
    id: "starDrainingPalm",
    nameKey: "evolution_starDrainingPalm",
    descriptionKey: "evolution_starDrainingPalmDescription",
    iconKey: "icon-evolution-star-palm",
    baseWeaponId: "flameWave",
    requiredWeaponLevel: EVOLUTION_REQUIRED_WEAPON_LEVEL,
    requiredSkillId: "starAbsorption",
    requiredSkillLevel: EVOLUTION_REQUIRED_SKILL_LEVEL,
    preferredBuildPathId: "qiSect",
    implemented: true
  },
  drunkenShadowNineSwords: {
    id: "drunkenShadowNineSwords",
    nameKey: "evolution_drunkenShadowNineSwords",
    descriptionKey: "evolution_drunkenShadowNineSwordsDescription",
    iconKey: "icon-evolution-drunken-sword",
    baseWeaponId: "thunderStrike",
    requiredWeaponLevel: EVOLUTION_REQUIRED_WEAPON_LEVEL,
    requiredSkillId: "wineSwordHeart",
    requiredSkillLevel: EVOLUTION_REQUIRED_SKILL_LEVEL,
    preferredBuildPathId: "wineSwordSect",
    implemented: true
  },
  starReturningOriginField: {
    id: "starReturningOriginField",
    nameKey: "evolution_starReturningOriginField",
    descriptionKey: "evolution_starReturningOriginFieldDescription",
    iconKey: "icon-evolution-star-field",
    baseWeaponId: "starVortex",
    requiredWeaponLevel: EVOLUTION_REQUIRED_WEAPON_LEVEL,
    requiredSkillId: "starAbsorption",
    requiredSkillLevel: EVOLUTION_REQUIRED_SKILL_LEVEL,
    preferredBuildPathId: "qiSect",
    implemented: true
  },
  violetMistBlossomSword: {
    id: "violetMistBlossomSword",
    nameKey: "evolution_violetMistBlossomSword",
    descriptionKey: "evolution_violetMistBlossomSwordDescription",
    iconKey: "icon-evolution-violet-blossom",
    baseWeaponId: "blossomBlade",
    requiredWeaponLevel: EVOLUTION_REQUIRED_WEAPON_LEVEL,
    requiredSkillId: "zixiaDivineSkill",
    requiredSkillLevel: EVOLUTION_REQUIRED_SKILL_LEVEL,
    preferredBuildPathId: "qiSect",
    implemented: true
  },
  shadowlessGaleSlash: {
    id: "shadowlessGaleSlash",
    nameKey: "evolution_shadowlessGaleSlash",
    descriptionKey: "evolution_shadowlessGaleSlashDescription",
    iconKey: "icon-evolution-gale",
    baseWeaponId: "galeSword",
    requiredWeaponLevel: EVOLUTION_REQUIRED_WEAPON_LEVEL,
    requiredSkillId: "windChasingStep",
    requiredSkillLevel: EVOLUTION_REQUIRED_SKILL_LEVEL,
    preferredBuildPathId: "footworkSect",
    implemented: true
  },
  taiyueMountainSealingForm: {
    id: "taiyueMountainSealingForm",
    nameKey: "evolution_taiyueMountainSealingForm",
    descriptionKey: "evolution_taiyueMountainSealingFormDescription",
    iconKey: "icon-evolution-taiyue",
    baseWeaponId: "taiyuePeak",
    requiredWeaponLevel: EVOLUTION_REQUIRED_WEAPON_LEVEL,
    requiredSkillId: "hunyuanQi",
    requiredSkillLevel: EVOLUTION_REQUIRED_SKILL_LEVEL,
    preferredBuildPathId: "swordSect",
    implemented: true
  },
  coldPondMirrorSword: {
    id: "coldPondMirrorSword",
    nameKey: "evolution_coldPondMirrorSword",
    descriptionKey: "evolution_coldPondMirrorSwordDescription",
    iconKey: "icon-evolution-cold-pond",
    baseWeaponId: "coldPondSword",
    requiredWeaponLevel: EVOLUTION_REQUIRED_WEAPON_LEVEL,
    requiredSkillId: "iceHeart",
    requiredSkillLevel: EVOLUTION_REQUIRED_SKILL_LEVEL,
    preferredBuildPathId: "footworkSect",
    implemented: true
  },
  vajraHundredStepQuake: {
    id: "vajraHundredStepQuake",
    nameKey: "evolution_vajraHundredStepQuake",
    descriptionKey: "evolution_vajraHundredStepQuakeDescription",
    iconKey: "icon-evolution-vajra",
    baseWeaponId: "vajraFist",
    requiredWeaponLevel: EVOLUTION_REQUIRED_WEAPON_LEVEL,
    requiredSkillId: "vajraDemonSubduing",
    requiredSkillLevel: EVOLUTION_REQUIRED_SKILL_LEVEL,
    preferredBuildPathId: "qiSect",
    implemented: true
  }
};

export function isEvolutionRecipeValid(config: EvolutionConfig): boolean {
  return SKILL_CONFIGS[config.requiredSkillId].kind === "combo";
}
