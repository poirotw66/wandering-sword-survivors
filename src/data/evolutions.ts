import type { BuildPathId } from "./buildPaths";
import { SKILL_CONFIGS, type SkillId } from "./skills";
import type { WeaponId } from "./weapons";

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
    requiredWeaponLevel: 5,
    requiredSkillId: "duguNineSwords",
    requiredSkillLevel: 3,
    preferredBuildPathId: "swordSect",
    implemented: true
  },
  windClearSwordArray: {
    id: "windClearSwordArray",
    nameKey: "evolution_windClearSwordArray",
    descriptionKey: "evolution_windClearSwordArrayDescription",
    iconKey: "icon-evolution-wind-array",
    baseWeaponId: "orbitBlade",
    requiredWeaponLevel: 5,
    requiredSkillId: "huashanFootwork",
    requiredSkillLevel: 3,
    preferredBuildPathId: "footworkSect",
    implemented: true
  },
  starDrainingPalm: {
    id: "starDrainingPalm",
    nameKey: "evolution_starDrainingPalm",
    descriptionKey: "evolution_starDrainingPalmDescription",
    iconKey: "icon-evolution-star-palm",
    baseWeaponId: "flameWave",
    requiredWeaponLevel: 5,
    requiredSkillId: "starAbsorption",
    requiredSkillLevel: 3,
    preferredBuildPathId: "qiSect",
    implemented: true
  },
  drunkenShadowNineSwords: {
    id: "drunkenShadowNineSwords",
    nameKey: "evolution_drunkenShadowNineSwords",
    descriptionKey: "evolution_drunkenShadowNineSwordsDescription",
    iconKey: "icon-evolution-drunken-sword",
    baseWeaponId: "thunderStrike",
    requiredWeaponLevel: 5,
    requiredSkillId: "wineSwordHeart",
    requiredSkillLevel: 3,
    preferredBuildPathId: "wineSwordSect",
    implemented: true
  },
  starReturningOriginField: {
    id: "starReturningOriginField",
    nameKey: "evolution_starReturningOriginField",
    descriptionKey: "evolution_starReturningOriginFieldDescription",
    iconKey: "icon-evolution-star-field",
    baseWeaponId: "starVortex",
    requiredWeaponLevel: 5,
    requiredSkillId: "starAbsorption",
    requiredSkillLevel: 3,
    preferredBuildPathId: "qiSect",
    implemented: true
  },
  violetMistBlossomSword: {
    id: "violetMistBlossomSword",
    nameKey: "evolution_violetMistBlossomSword",
    descriptionKey: "evolution_violetMistBlossomSwordDescription",
    iconKey: "icon-evolution-violet-blossom",
    baseWeaponId: "blossomBlade",
    requiredWeaponLevel: 5,
    requiredSkillId: "zixiaDivineSkill",
    requiredSkillLevel: 3,
    preferredBuildPathId: "qiSect",
    implemented: true
  },
  shadowlessGaleSlash: {
    id: "shadowlessGaleSlash",
    nameKey: "evolution_shadowlessGaleSlash",
    descriptionKey: "evolution_shadowlessGaleSlashDescription",
    iconKey: "icon-evolution-gale",
    baseWeaponId: "galeSword",
    requiredWeaponLevel: 5,
    requiredSkillId: "windChasingStep",
    requiredSkillLevel: 3,
    preferredBuildPathId: "footworkSect",
    implemented: true
  },
  taiyueMountainSealingForm: {
    id: "taiyueMountainSealingForm",
    nameKey: "evolution_taiyueMountainSealingForm",
    descriptionKey: "evolution_taiyueMountainSealingFormDescription",
    iconKey: "icon-evolution-taiyue",
    baseWeaponId: "taiyuePeak",
    requiredWeaponLevel: 5,
    requiredSkillId: "hunyuanQi",
    requiredSkillLevel: 3,
    preferredBuildPathId: "swordSect",
    implemented: true
  },
  coldPondMirrorSword: {
    id: "coldPondMirrorSword",
    nameKey: "evolution_coldPondMirrorSword",
    descriptionKey: "evolution_coldPondMirrorSwordDescription",
    iconKey: "icon-evolution-cold-pond",
    baseWeaponId: "coldPondSword",
    requiredWeaponLevel: 5,
    requiredSkillId: "iceHeart",
    requiredSkillLevel: 3,
    preferredBuildPathId: "footworkSect",
    implemented: true
  },
  vajraHundredStepQuake: {
    id: "vajraHundredStepQuake",
    nameKey: "evolution_vajraHundredStepQuake",
    descriptionKey: "evolution_vajraHundredStepQuakeDescription",
    iconKey: "icon-evolution-vajra",
    baseWeaponId: "vajraFist",
    requiredWeaponLevel: 5,
    requiredSkillId: "vajraDemonSubduing",
    requiredSkillLevel: 3,
    preferredBuildPathId: "qiSect",
    implemented: true
  }
};

export function isEvolutionRecipeValid(config: EvolutionConfig): boolean {
  return SKILL_CONFIGS[config.requiredSkillId].kind === "combo";
}
