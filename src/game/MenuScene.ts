import Phaser from "phaser";
import { t, toggleLocale } from "../i18n";
import {
  DIFFICULTY_CONFIGS,
  difficultyDisplays,
  difficultyForLevel,
  metaBonusesFor,
  titleProgressFor,
  unlockedDifficulties
} from "../data/metaProgression";
import {
  DEFAULT_START_STYLE,
  formatNextGoalLine,
  formatStartStyleButton,
  nextRunGoal,
  normalizeStartStyle,
  renownShopSummary,
  startStyleLabel,
  startStyleOptions,
  type StartStyleId
} from "../data/metaChoices";
import { AchievementSystem } from "../systems/AchievementSystem";
import { TITLE_FONT, UI_FONT } from "../ui/textStyle";

export class MenuScene extends Phaser.Scene {
  private selectedDifficulty = 1;
  private selectedStartStyle: StartStyleId = DEFAULT_START_STYLE;

  constructor() {
    super("MenuScene");
  }

  create(): void {
    const { width, height } = this.scale;
    const record = AchievementSystem.readRecord();
    const bonuses = metaBonusesFor(record.totalRenown);
    const titleProgress = titleProgressFor(record.totalRenown);
    const unlocked = unlockedDifficulties(record).map((difficulty) => difficulty.level);
    this.selectedDifficulty = Math.min(
      Math.max(Number(window.localStorage?.getItem("sword-survivors-difficulty") ?? "1"), 1),
      Math.max(...unlocked)
    );
    this.selectedStartStyle = normalizeStartStyle(
      record,
      window.localStorage?.getItem("sword-survivors-start-style")
    );
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0f17);
    this.add.image(width / 2, height * 0.58, "player").setScale(0.34).setAlpha(0.78);
    this.add.image(width / 2 + 86, height * 0.56, "strike").setScale(0.7).setAlpha(0.42).setAngle(22);
    this.add
      .text(width / 2, height * 0.31, t("title"), {
        fontFamily: TITLE_FONT,
        fontSize: "46px",
        color: "#f7efd8"
      })
      .setPadding(0, 10, 0, 10)
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.42, t("menuSubtitle"), {
        fontFamily: UI_FONT,
        fontSize: "20px",
        color: "#aac7d8"
      })
      .setPadding(0, 6, 0, 6)
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.56, t("menuPitch"), {
        fontFamily: UI_FONT,
        fontSize: "18px",
        color: "#d8e2eb",
        align: "center",
        lineSpacing: 8,
        wordWrap: { width: Math.min(620, width - 80) }
      })
      .setPadding(0, 6, 0, 6)
      .setOrigin(0.5);

    this.createMetaPanel(record.totalRenown, bonuses, titleProgress, width, height);

    this.createDifficultyButtons(record.totalRenown, unlocked, width, height);
    this.createStartStyleButtons(record, width, height);

    const start = this.add
      .text(width / 2, height * 0.845, t("startRun"), {
        fontFamily: UI_FONT,
        fontSize: "24px",
        color: "#10121f",
        backgroundColor: "#f7c66b",
        padding: { left: 28, right: 28, top: 12, bottom: 12 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const collection = this.add
      .text(width / 2, height * 0.91, t("collectionButton"), {
        fontFamily: UI_FONT,
        fontSize: "20px",
        color: "#f7c66b",
        backgroundColor: "#192033",
        padding: { left: 22, right: 22, top: 10, bottom: 10 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const language = this.add
      .text(width - 24, 22, t("languageToggle"), {
        fontFamily: UI_FONT,
        fontSize: "16px",
        color: "#f7c66b",
        backgroundColor: "#192033",
        padding: { left: 12, right: 12, top: 8, bottom: 8 }
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height * 0.968, t("controls"), {
        fontFamily: UI_FONT,
        fontSize: "16px",
        color: "#aac7d8",
        align: "center",
        lineSpacing: 6
      })
      .setPadding(0, 6, 0, 6)
      .setOrigin(0.5);

    start.on("pointerdown", () => this.startRun());
    collection.on("pointerdown", () => this.scene.start("CollectionScene"));
    language.on("pointerdown", () => {
      toggleLocale();
      this.scene.restart();
    });
    this.input.keyboard?.once("keydown-SPACE", () => this.startRun());
  }

  private createDifficultyButtons(totalRenown: number, unlocked: number[], width: number, height: number): void {
    const startX = width / 2 - 176;
    const record = AchievementSystem.readRecord();
    difficultyDisplays(record).forEach((difficulty, index) => {
      const isUnlocked = unlocked.includes(difficulty.level);
      const selected = this.selectedDifficulty === difficulty.level;
      const label = isUnlocked
        ? t("difficultyButton", {
            level: difficulty.level,
            reward: Math.round(difficulty.rewardMultiplier * 100),
            hp: Math.round(difficulty.hpMultiplier * 100),
            speed: Math.round(difficulty.speedMultiplier * 100)
          })
        : t("difficultyLocked", { level: difficulty.level, renown: difficulty.renownRequired });
      const button = this.add
        .text(startX + index * 88, height * 0.715, label, {
          fontFamily: UI_FONT,
          fontSize: "12px",
          color: isUnlocked ? (selected ? "#10121f" : "#f7c66b") : "#6f7d91",
          backgroundColor: selected ? "#f7c66b" : "#192033",
          align: "center",
          padding: { left: 8, right: 8, top: 6, bottom: 6 }
        })
        .setOrigin(0.5)
        .setInteractive(isUnlocked ? { useHandCursor: true } : undefined);
      if (isUnlocked) {
        button.on("pointerdown", () => {
          this.selectedDifficulty = difficultyForLevel(difficulty.level).level;
          window.localStorage?.setItem("sword-survivors-difficulty", String(this.selectedDifficulty));
          this.scene.restart();
        });
      }
    });

    if (totalRenown < DIFFICULTY_CONFIGS[DIFFICULTY_CONFIGS.length - 1].renownRequired) {
      this.add
        .text(width / 2, height * 0.685, t("difficultyHint"), {
          fontFamily: UI_FONT,
          fontSize: "13px",
          color: "#aac7d8"
        })
        .setOrigin(0.5);
    }
  }

  private createMetaPanel(
    totalRenown: number,
    bonuses: ReturnType<typeof metaBonusesFor>,
    titleProgress: ReturnType<typeof titleProgressFor>,
    width: number,
    height: number
  ): void {
    const nextText =
      titleProgress.isMaxTitle || !titleProgress.nextTitleKey || titleProgress.nextRenownRequired === undefined
        ? t("titleProgressMax")
        : t("titleProgressNext", {
            title: t(titleProgress.nextTitleKey),
            renown: titleProgress.nextRenownRequired
          });
    const panelWidth = Math.min(720, width - 72);
    const panelY = height * 0.625;
    this.add.rectangle(width / 2, panelY, panelWidth, 116, 0x111421, 0.78).setStrokeStyle(1, 0x5f4a2a, 0.85);
    this.add
      .text(
        width / 2,
        panelY - 50,
        t("metaProgressionLine", {
          title: t(bonuses.titleKey),
          renown: totalRenown,
          next: nextText
        }),
        {
          fontFamily: UI_FONT,
          fontSize: "15px",
          color: "#ffe09a",
          align: "center",
          wordWrap: { width: panelWidth - 32 }
        }
      )
      .setOrigin(0.5, 0);
    this.add
      .text(
        width / 2,
        panelY - 14,
        t("metaBonusLine", {
          title: t(bonuses.titleKey),
          hp: bonuses.maxHp,
          speed: bonuses.moveSpeed,
          pickup: bonuses.pickupRange,
          rerolls: bonuses.rerolls
        }),
        {
          fontFamily: UI_FONT,
          fontSize: "13px",
          color: "#d8e2eb",
          align: "center",
          wordWrap: { width: panelWidth - 32 }
        }
      )
      .setOrigin(0.5, 0);
    this.add
      .text(width / 2, panelY + 16, renownShopSummary(totalRenown), {
        fontFamily: UI_FONT,
        fontSize: "12px",
        color: "#aac7d8",
        align: "center",
        wordWrap: { width: panelWidth - 32 }
      })
      .setOrigin(0.5, 0);
    this.add
      .text(width / 2, panelY + 42, formatNextGoalLine(nextRunGoal(AchievementSystem.readRecord())), {
        fontFamily: UI_FONT,
        fontSize: "12px",
        color: "#ffe09a",
        align: "center",
        wordWrap: { width: panelWidth - 32 }
      })
      .setOrigin(0.5, 0);
  }

  private createStartStyleButtons(record: ReturnType<typeof AchievementSystem.readRecord>, width: number, height: number): void {
    this.add
      .text(width / 2, height * 0.758, startStyleLabel(), {
        fontFamily: UI_FONT,
        fontSize: "13px",
        color: "#aac7d8"
      })
      .setOrigin(0.5);

    const startX = width / 2 - 210;
    startStyleOptions(record).forEach((option, index) => {
      const selected = this.selectedStartStyle === option.id;
      const label = formatStartStyleButton(option);
      const button = this.add
        .text(startX + index * 140, height * 0.792, label, {
          fontFamily: UI_FONT,
          fontSize: "11px",
          color: option.unlocked ? (selected ? "#10121f" : "#f7c66b") : "#6f7d91",
          backgroundColor: selected ? "#f7c66b" : "#192033",
          align: "center",
          padding: { left: 8, right: 8, top: 6, bottom: 6 },
          wordWrap: { width: 118 }
        })
        .setOrigin(0.5)
        .setInteractive(option.unlocked ? { useHandCursor: true } : undefined);
      if (option.unlocked) {
        button.on("pointerdown", () => {
          this.selectedStartStyle = option.id;
          window.localStorage?.setItem("sword-survivors-start-style", option.id);
          this.scene.restart();
        });
      }
    });
  }

  private startRun(): void {
    this.scene.start("GameScene", { difficultyLevel: this.selectedDifficulty, startStyleId: this.selectedStartStyle });
  }
}
