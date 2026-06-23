import Phaser from "phaser";
import { formatClock } from "../utils/math";
import { t } from "../i18n";
import { AchievementSystem } from "../systems/AchievementSystem";
import { TITLE_FONT, UI_FONT } from "../ui/textStyle";
import type { EvolutionId } from "../data/evolutions";
import type { SkillId } from "../data/skills";

export type GameOverData = {
  won: boolean;
  score: number;
  kills: number;
  elapsedSec: number;
  highestDifficulty: number;
  achievements: string[];
  evolvedArtsSeen: EvolutionId[];
  standaloneSkillsSeen: SkillId[];
};

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  create(data: GameOverData): void {
    const record = AchievementSystem.saveRun(
      {
        score: data.score,
        elapsedSec: data.elapsedSec,
        highestDifficulty: data.highestDifficulty,
        achievements: data.achievements,
        evolvedArtsSeen: data.evolvedArtsSeen,
        standaloneSkillsSeen: data.standaloneSkillsSeen
      },
      data.won
    );

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0f17, 0.96);
    this.add.image(width / 2, height * 0.54, data.won ? "strike" : "boss-master").setScale(data.won ? 1.1 : 0.34).setAlpha(0.25);
    this.add
      .text(width / 2, height * 0.28, data.won ? t("victoryTitle") : t("defeatTitle"), {
        fontFamily: TITLE_FONT,
        fontSize: "52px",
        color: data.won ? "#f7c66b" : "#ff7687"
      })
      .setPadding(0, 10, 0, 10)
      .setOrigin(0.5);
    this.add
      .text(
        width / 2,
        height * 0.45,
        t("resultLine", {
          time: formatClock(data.elapsedSec),
          kills: data.kills,
          score: data.score,
          best: record.bestRenown
        }),
        {
          fontFamily: UI_FONT,
          fontSize: "21px",
          color: "#d8e2eb",
          align: "center",
          lineSpacing: 14
        }
      )
      .setPadding(0, 8, 0, 8)
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.57,
        t("recordLine", {
          difficulty: record.highestDifficulty,
          fastest: record.fastestClearSec === undefined ? t("none") : formatClock(record.fastestClearSec),
          achievements: record.achievements.length
        }),
        {
          fontFamily: UI_FONT,
          fontSize: "18px",
          color: "#f7c66b",
          align: "center",
          lineSpacing: 12
        }
      )
      .setPadding(0, 8, 0, 8)
      .setOrigin(0.5);

    const restart = this.add
      .text(width / 2, height * 0.68, t("restart"), {
        fontFamily: UI_FONT,
        fontSize: "24px",
        color: "#10121f",
        backgroundColor: "#84f7b2",
        padding: { left: 28, right: 28, top: 12, bottom: 12 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    restart.on("pointerdown", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("GameScene"));
  }
}
