import type { BossSkillId } from "./bossSkills";

export type BossTelegraphStyle = "dash" | "fan" | "summon" | "needle" | "orbit" | "phase";

export type BossVfxProfile = {
  skillId: BossSkillId | "orbit" | "phase";
  telegraphStyle: BossTelegraphStyle;
  primaryColor: number;
  accentColor: number;
  hitColor: number;
  telegraphDepth: number;
  impactDepth: number;
};

export const BOSS_VFX: Record<BossSkillId | "orbit" | "phase", BossVfxProfile> = {
  dash: {
    skillId: "dash",
    telegraphStyle: "dash",
    primaryColor: 0xff7687,
    accentColor: 0xffd1d6,
    hitColor: 0xff4f64,
    telegraphDepth: 12,
    impactDepth: 16
  },
  fanStrike: {
    skillId: "fanStrike",
    telegraphStyle: "fan",
    primaryColor: 0x8ff4ff,
    accentColor: 0xe8fcff,
    hitColor: 0x5edfff,
    telegraphDepth: 12,
    impactDepth: 17
  },
  summon: {
    skillId: "summon",
    telegraphStyle: "summon",
    primaryColor: 0xb86bff,
    accentColor: 0xe8c8ff,
    hitColor: 0x9b4dff,
    telegraphDepth: 11,
    impactDepth: 15
  },
  needleStorm: {
    skillId: "needleStorm",
    telegraphStyle: "needle",
    primaryColor: 0xff2f86,
    accentColor: 0xff9bd2,
    hitColor: 0xff5aa8,
    telegraphDepth: 12,
    impactDepth: 16
  },
  orbit: {
    skillId: "orbit",
    telegraphStyle: "orbit",
    primaryColor: 0xff2f86,
    accentColor: 0xffb8da,
    hitColor: 0xff5aa8,
    telegraphDepth: 13,
    impactDepth: 16
  },
  phase: {
    skillId: "phase",
    telegraphStyle: "phase",
    primaryColor: 0xff2f86,
    accentColor: 0xfff0f7,
    hitColor: 0xff5aa8,
    telegraphDepth: 14,
    impactDepth: 18
  }
};

export function bossVfxFor(skillId: BossSkillId | "orbit" | "phase"): BossVfxProfile {
  return BOSS_VFX[skillId];
}
