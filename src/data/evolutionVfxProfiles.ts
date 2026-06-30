import type { EvolutionId } from "./evolutions";

export type EvolutionVfxProfile = {
  hitColor: number;
  primaryColor: number;
  flashRgb: [number, number, number];
  burstStyle: "slash" | "ring" | "palm" | "drunken" | "vortex" | "petal" | "gale" | "quake" | "frost" | "vajra";
};

export const EVOLUTION_VFX: Record<EvolutionId, EvolutionVfxProfile> = {
  voidDuguSword: { hitColor: 0xffe09a, primaryColor: 0xfff1d0, flashRgb: [255, 235, 170], burstStyle: "slash" },
  windClearSwordArray: { hitColor: 0xb8ffd8, primaryColor: 0xd8fff0, flashRgb: [180, 255, 220], burstStyle: "ring" },
  starDrainingPalm: { hitColor: 0xb86bff, primaryColor: 0xd8b4ff, flashRgb: [190, 120, 255], burstStyle: "palm" },
  drunkenShadowNineSwords: { hitColor: 0xffa55f, primaryColor: 0xffd36a, flashRgb: [255, 180, 90], burstStyle: "drunken" },
  starReturningOriginField: { hitColor: 0xc9a24d, primaryColor: 0xf7c66b, flashRgb: [220, 170, 90], burstStyle: "vortex" },
  violetMistBlossomSword: { hitColor: 0xffb7d5, primaryColor: 0xf4b8ff, flashRgb: [255, 170, 220], burstStyle: "petal" },
  shadowlessGaleSlash: { hitColor: 0x8ff4ff, primaryColor: 0xb8ffd8, flashRgb: [140, 255, 220], burstStyle: "gale" },
  taiyueMountainSealingForm: { hitColor: 0xffd36a, primaryColor: 0xe8c878, flashRgb: [255, 210, 120], burstStyle: "quake" },
  coldPondMirrorSword: { hitColor: 0x8ff4ff, primaryColor: 0xc8f0ff, flashRgb: [140, 220, 255], burstStyle: "frost" },
  vajraHundredStepQuake: { hitColor: 0xffc070, primaryColor: 0xffe09a, flashRgb: [255, 200, 110], burstStyle: "vajra" }
};

export function evolutionVfxFor(evolutionId: EvolutionId): EvolutionVfxProfile {
  return EVOLUTION_VFX[evolutionId];
}
