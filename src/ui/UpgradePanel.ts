import Phaser from "phaser";
import type { UpgradeOption } from "../data/upgrades";
import { t } from "../i18n";
import { TITLE_FONT, UI_FONT } from "./textStyle";
import { isNarrowViewport, isTouchDevice, safeInset } from "../utils/display";

const DESKTOP_CARD_HEIGHT = 252;
const MOBILE_CARD_HEIGHT = 172;

export class UpgradePanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly cards: Phaser.GameObjects.Container[] = [];
  private currentOptions: UpgradeOption[] = [];
  private currentPick?: (option: UpgradeOption) => void;
  private cardScroll?: Phaser.GameObjects.Container;
  private cardScrollBaseY = 0;
  private cardScrollY = 0;
  private cardScrollMax = 0;
  private cardScrollBounds?: Phaser.Geom.Rectangle;
  private cardScrollPointerId = -1;
  private cardScrollDragStartY = 0;
  private cardScrollDragStartScroll = 0;
  private cardScrollDragging = false;

  constructor(private readonly scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(1000).setScrollFactor(0).setVisible(false);
  }

  show(
    options: UpgradeOption[],
    onPick: (option: UpgradeOption) => void,
    rerolls = 0,
    onReroll?: () => void,
    banishCharges = 0,
    onBanish?: (option: UpgradeOption) => void
  ): void {
    this.clear();
    this.currentOptions = options;
    this.currentPick = onPick;
    const { width, height } = this.scene.scale;
    const mobile = isNarrowViewport(width) || isTouchDevice();
    const insetTop = safeInset("top");
    const insetBottom = safeInset("bottom");
    const panelWidth = Math.min(mobile ? width - 20 : 1080, width - (mobile ? 20 : 48));

    this.container.setVisible(true);
    this.container.add(this.scene.add.rectangle(width / 2, height / 2, width, height, 0x05080f, 0.82));

    if (mobile) {
      this.showMobileLayout(options, onPick, rerolls, onReroll, banishCharges, onBanish, {
        width,
        height,
        panelWidth,
        insetTop,
        insetBottom
      });
      return;
    }

    const panelHeight = Math.min(440, height - 120);
    this.container.add(
      this.scene.add
        .rectangle(width / 2, height * 0.52, panelWidth, panelHeight, 0x0d1018, 0.94)
        .setStrokeStyle(2, 0x5f4a2a, 0.92)
    );
    this.container.add(
      this.scene.add.rectangle(width / 2, height * 0.52 - panelHeight / 2 + 1, panelWidth - 4, 3, 0xc9a24d, 0.55)
    );
    this.container.add(
      this.scene.add
        .text(width / 2, height * 0.2, t("manualTitle"), {
          fontFamily: TITLE_FONT,
          fontSize: "34px",
          color: "#f7efd8"
        })
        .setPadding(0, 8, 0, 8)
        .setOrigin(0.5)
    );
    this.container.add(
      this.scene.add
        .text(width / 2, height * 0.265, t("manualHint"), {
          fontFamily: UI_FONT,
          fontSize: "15px",
          color: "#aac7d8"
        })
        .setPadding(0, 4, 0, 4)
        .setOrigin(0.5)
    );
    this.addCategoryLegend(width, height * 0.305, false);
    this.container.add(
      this.scene.add
        .text(width / 2, height * 0.335, t("upgradeKeyHint"), {
          fontFamily: UI_FONT,
          fontSize: "13px",
          color: "#6f8296"
        })
        .setOrigin(0.5)
    );

    this.addFooterActions(width, height, rerolls, onReroll, banishCharges, false);

    const cardWidth = Math.min(300, (panelWidth - 64) / 3);
    const cardGap = Math.max(16, (panelWidth - cardWidth * 3) / 4);
    const cardY = height * 0.54;

    options.forEach((option, index) => {
      const x = width / 2 + (index - 1) * (cardWidth + cardGap);
      this.cards.push(
        this.createCard(option, index, x, cardY, cardWidth, DESKTOP_CARD_HEIGHT, false, banishCharges, onPick, onBanish)
      );
    });
  }

  hide(): void {
    this.teardownCardScroll();
    this.clear();
    this.container.setVisible(false);
  }

  pickByIndex(index: number): void {
    const option = this.currentOptions[index];
    if (option && this.currentPick) {
      this.currentPick(option);
    }
  }

  private showMobileLayout(
    options: UpgradeOption[],
    onPick: (option: UpgradeOption) => void,
    rerolls: number,
    onReroll: (() => void) | undefined,
    banishCharges: number,
    onBanish: ((option: UpgradeOption) => void) | undefined,
    layout: {
      width: number;
      height: number;
      panelWidth: number;
      insetTop: number;
      insetBottom: number;
    }
  ): void {
    const { width, height, panelWidth, insetTop, insetBottom } = layout;
    const footerReserve = insetBottom + (rerolls > 0 && onReroll ? 78 : 52);
    const headerBottom = insetTop + 92;
    const scrollTop = headerBottom + 6;
    const scrollHeight = Math.max(120, height - scrollTop - footerReserve - 8);
    const scrollBottom = scrollTop + scrollHeight;
    const cardWidth = panelWidth - 12;
    const cardHeight = MOBILE_CARD_HEIGHT;
    const cardGap = 10;

    this.container.add(
      this.scene.add
        .rectangle(width / 2, (scrollTop + scrollBottom) / 2, panelWidth, scrollHeight + 12, 0x0d1018, 0.94)
        .setStrokeStyle(2, 0x5f4a2a, 0.92)
    );
    this.container.add(
      this.scene.add
        .text(width / 2, insetTop + 18, t("manualTitle"), {
          fontFamily: TITLE_FONT,
          fontSize: "24px",
          color: "#f7efd8"
        })
        .setPadding(0, 4, 0, 4)
        .setOrigin(0.5)
    );
    this.container.add(
      this.scene.add
        .text(width / 2, insetTop + 48, t("manualHint"), {
          fontFamily: UI_FONT,
          fontSize: "12px",
          color: "#aac7d8",
          align: "center",
          wordWrap: { width: panelWidth - 24 }
        })
        .setPadding(0, 2, 0, 2)
        .setOrigin(0.5)
    );
    this.addCategoryLegend(width, insetTop + 72, true);

    this.cardScroll = this.scene.add.container(width / 2, scrollTop).setDepth(1001);
    this.container.add(this.cardScroll);
    this.cardScrollBaseY = scrollTop;
    this.cardScrollY = 0;

    const maskShape = this.scene.make.graphics({});
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(width / 2 - cardWidth / 2, scrollTop, cardWidth, scrollHeight);
    this.cardScroll.setMask(maskShape.createGeometryMask());
    this.cardScrollBounds = new Phaser.Geom.Rectangle(width / 2 - cardWidth / 2, scrollTop, cardWidth, scrollHeight);

    let cursorY = cardHeight / 2;
    options.forEach((option, index) => {
      this.cards.push(
        this.createCard(option, index, 0, cursorY, cardWidth, cardHeight, true, banishCharges, onPick, onBanish, this.cardScroll)
      );
      cursorY += cardHeight + cardGap;
    });
    this.cardScrollMax = Math.max(0, cursorY - cardGap - scrollHeight + 8);
    this.bindCardScrollHandlers();

    const footerY = height - footerReserve + 12;
    this.addFooterActions(width, footerY, rerolls, onReroll, banishCharges, true);
  }

  private addFooterActions(
    width: number,
    y: number,
    rerolls: number,
    onReroll: (() => void) | undefined,
    banishCharges: number,
    mobile: boolean
  ): void {
    if (rerolls > 0 && onReroll) {
      const reroll = this.scene.add
        .text(width / 2, y, t("rerollUpgrades", { count: rerolls }), {
          fontFamily: UI_FONT,
          fontSize: mobile ? "14px" : "16px",
          color: "#10121f",
          backgroundColor: "#8ff4ff",
          padding: { left: mobile ? 14 : 18, right: mobile ? 14 : 18, top: 8, bottom: 8 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      reroll.on("pointerdown", () => onReroll());
      this.container.add(reroll);
    }
    this.container.add(
      this.scene.add
        .text(width / 2, y + (rerolls > 0 && onReroll ? 34 : 0), t("banishRemaining", { count: banishCharges }), {
          fontFamily: UI_FONT,
          fontSize: mobile ? "12px" : "13px",
          color: banishCharges > 0 ? "#ffcf9f" : "#6f7d91"
        })
        .setOrigin(0.5)
    );
  }

  private bindCardScrollHandlers(): void {
    this.scene.input.on("pointerdown", this.handleCardScrollPointerDown, this);
    this.scene.input.on("pointermove", this.handleCardScrollPointerMove, this);
    this.scene.input.on("pointerup", this.handleCardScrollPointerUp, this);
    this.scene.input.on("wheel", this.handleCardScrollWheel, this);
  }

  private teardownCardScroll(): void {
    this.scene.input.off("pointerdown", this.handleCardScrollPointerDown, this);
    this.scene.input.off("pointermove", this.handleCardScrollPointerMove, this);
    this.scene.input.off("pointerup", this.handleCardScrollPointerUp, this);
    this.scene.input.off("wheel", this.handleCardScrollWheel, this);
    this.cardScroll = undefined;
    this.cardScrollBounds = undefined;
    this.cardScrollPointerId = -1;
    this.cardScrollDragging = false;
    this.cardScrollY = 0;
    this.cardScrollMax = 0;
  }

  private handleCardScrollPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!this.cardScroll || !this.cardScrollBounds) {
      return;
    }
    if (!this.cardScrollBounds.contains(pointer.x, pointer.y)) {
      return;
    }
    this.cardScrollPointerId = pointer.id;
    this.cardScrollDragStartY = pointer.y;
    this.cardScrollDragStartScroll = this.cardScrollY;
    this.cardScrollDragging = false;
  };

  private handleCardScrollPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.cardScroll || pointer.id !== this.cardScrollPointerId) {
      return;
    }
    const delta = this.cardScrollDragStartY - pointer.y;
    if (!this.cardScrollDragging && Math.abs(delta) < 10) {
      return;
    }
    this.cardScrollDragging = true;
    this.setCardScroll(this.cardScrollDragStartScroll + delta);
  };

  private handleCardScrollPointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.id === this.cardScrollPointerId) {
      this.cardScrollPointerId = -1;
      this.cardScrollDragging = false;
    }
  };

  private handleCardScrollWheel = (
    _pointer: Phaser.Input.Pointer,
    _objects: unknown,
    _dx: number,
    dy: number
  ): void => {
    if (!this.cardScroll || !this.container.visible) {
      return;
    }
    this.setCardScroll(this.cardScrollY + dy * 0.35);
  };

  private setCardScroll(next: number): void {
    if (!this.cardScroll) {
      return;
    }
    this.cardScrollY = Phaser.Math.Clamp(next, 0, this.cardScrollMax);
    this.cardScroll.setY(this.cardScrollBaseY - this.cardScrollY);
  }

  private createCard(
    option: UpgradeOption,
    index: number,
    x: number,
    y: number,
    cardWidth: number,
    cardHeight: number,
    mobile: boolean,
    banishCharges: number,
    onPick: (option: UpgradeOption) => void,
    onBanish?: (option: UpgradeOption) => void,
    host?: Phaser.GameObjects.Container
  ): Phaser.GameObjects.Container {
    const theme = this.cardTheme(option.kind);
    const card = this.scene.add.container(x, y);
    card.setSize(cardWidth, cardHeight);
    card.setInteractive(
      new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight),
      Phaser.Geom.Rectangle.Contains
    );

    const iconY = mobile ? -46 : -58;
    const iconSize = mobile ? 44 : 56;
    const titleSize = mobile ? "14px" : "16px";
    const bodySize = mobile ? "11px" : "12px";
    const recipeSize = mobile ? "10px" : "11px";
    const categorySize = mobile ? "11px" : "13px";
    const categoryBarY = -cardHeight / 2 + (mobile ? 12 : 14);
    const categoryBarH = mobile ? 22 : 26;

    const bg = this.scene.add
      .rectangle(0, 0, cardWidth, cardHeight, theme.fill, 0.98)
      .setStrokeStyle(option.kind === "evolution" ? 3 : 2, theme.stroke);
    const innerFrame = this.scene.add
      .rectangle(0, 0, cardWidth - 10, cardHeight - 10, theme.fill, 0.35)
      .setStrokeStyle(1, theme.stroke, 0.22);
    const categoryBar = this.scene.add
      .rectangle(0, categoryBarY, cardWidth - 16, categoryBarH, theme.accent, 0.32)
      .setStrokeStyle(1, theme.stroke, 0.75);
    const categoryText = this.scene.add
      .text(-cardWidth / 2 + 18, categoryBarY, theme.categoryLabel, {
        fontFamily: TITLE_FONT,
        fontSize: categorySize,
        color: theme.titleColor,
        fontStyle: "700"
      })
      .setOrigin(0, 0.5);
    const keySeal = this.scene.add
      .circle(cardWidth / 2 - 18, categoryBarY, mobile ? 12 : 14, theme.sealFill, 0.96)
      .setStrokeStyle(2, theme.stroke);
    const indexText = this.scene.add
      .text(cardWidth / 2 - 18, categoryBarY, `${index + 1}`, {
        fontFamily: TITLE_FONT,
        fontSize: mobile ? "13px" : "15px",
        color: "#f7efd8",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    const iconKey = this.scene.textures.exists(option.iconKey) ? option.iconKey : "icon-upgrade-default";
    const iconHalo = this.scene.add.circle(0, iconY, mobile ? 28 : 36, theme.halo, 0.96).setStrokeStyle(2, theme.stroke, 0.88);
    const icon = this.scene.add.image(0, iconY, iconKey).setDisplaySize(iconSize, iconSize);

    const title = this.scene.add
      .text(0, mobile ? -8 : -4, option.title, {
        fontFamily: UI_FONT,
        fontSize: titleSize,
        color: theme.titleColor,
        align: "center",
        lineSpacing: mobile ? 2 : 3,
        wordWrap: { width: cardWidth - 28 }
      })
      .setOrigin(0.5, 0);
    const divider = this.scene.add
      .rectangle(0, title.y + title.height + (mobile ? 4 : 8), cardWidth - 36, 1, theme.stroke, 0.45)
      .setOrigin(0.5, 0);
    const description = this.scene.add
      .text(0, divider.y + (mobile ? 6 : 10), option.description, {
        fontFamily: UI_FONT,
        fontSize: bodySize,
        color: "#c8d4e0",
        align: "center",
        lineSpacing: mobile ? 3 : 5,
        wordWrap: { width: cardWidth - 30 }
      })
      .setOrigin(0.5, 0);

    const recipe = option.recommendationReason ?? option.recipeHint ?? option.progressText ?? "";
    const recipeY = description.y + description.height + (mobile ? 4 : 10);
    const recipeText = recipe
      ? this.scene.add
          .text(0, recipeY, recipe, {
            fontFamily: UI_FONT,
            fontSize: recipeSize,
            color: theme.recipeColor,
            align: "center",
            lineSpacing: 2,
            wordWrap: { width: cardWidth - 28 }
          })
          .setOrigin(0.5, 0)
      : undefined;

    const parts: Phaser.GameObjects.GameObject[] = [
      bg,
      innerFrame,
      categoryBar,
      categoryText,
      keySeal,
      indexText,
      iconHalo,
      icon,
      title,
      divider,
      description
    ];

    if (this.shouldShowBadge(option)) {
      parts.push(
        this.scene.add
          .text(0, cardHeight / 2 - (mobile ? 38 : 46), option.badgeText ?? "", {
            fontFamily: UI_FONT,
            fontSize: mobile ? "10px" : "11px",
            color: theme.badgeTextColor,
            backgroundColor: theme.badgeBgColor,
            padding: { left: 6, right: 6, top: 2, bottom: 2 }
          })
          .setOrigin(0.5, 0)
      );
    }

    if (option.recommendedText) {
      parts.push(
        this.scene.add
          .text(0, categoryBarY + (mobile ? 18 : 28), option.recommendedText, {
            fontFamily: UI_FONT,
            fontSize: mobile ? "10px" : "11px",
            color: "#111421",
            backgroundColor: "#84f7b2",
            padding: { left: 6, right: 6, top: 2, bottom: 2 }
          })
          .setOrigin(0.5, 0)
      );
    }

    if (recipeText) {
      parts.push(recipeText);
    }

    if (option.banishable && banishCharges > 0 && onBanish) {
      const banishButton = this.scene.add
        .text(0, cardHeight / 2 - (mobile ? 14 : 18), t("sealUpgrade"), {
          fontFamily: UI_FONT,
          fontSize: mobile ? "11px" : "12px",
          color: "#ffe09a",
          backgroundColor: "#472331",
          padding: { left: 8, right: 8, top: 3, bottom: 3 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      banishButton.on(
        "pointerdown",
        (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event?: Phaser.Types.Input.EventData) => {
          event?.stopPropagation();
          onBanish(option);
        }
      );
      parts.push(banishButton);
    }

    card.add(parts);
    card.on("pointerover", () => {
      bg.setStrokeStyle(3, theme.hoverStroke);
      this.scene.tweens.add({ targets: card, scaleX: 1.03, scaleY: 1.03, duration: 90, ease: "Sine.easeOut" });
    });
    card.on("pointerout", () => {
      bg.setStrokeStyle(option.kind === "evolution" ? 3 : 2, theme.stroke);
      this.scene.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 90, ease: "Sine.easeOut" });
    });
    card.on("pointerdown", () => onPick(option));
    if (host) {
      host.add(card);
    } else {
      this.container.add(card);
    }
    return card;
  }

  private addCategoryLegend(width: number, y: number, mobile: boolean): void {
    const items = [
      { label: t("forms"), color: "#b8d4f0" },
      { label: t("martialSkills"), color: "#f7c66b" },
      { label: t("evolutionBadge"), color: "#ffe09a" },
      { label: t("buildPaths"), color: "#d8b4ff" }
    ];
    if (mobile) {
      const gap = 8;
      const rowWidth = width - 32;
      let cursorX = width / 2 - rowWidth / 2;
      let rowY = y;
      let rowUsed = 0;
      for (const item of items) {
        const pill = this.scene.add
          .text(0, 0, item.label, {
            fontFamily: UI_FONT,
            fontSize: "10px",
            color: item.color,
            backgroundColor: "#121820cc",
            padding: { left: 6, right: 6, top: 2, bottom: 2 }
          })
          .setOrigin(0, 0.5);
        if (rowUsed + pill.width > rowWidth && rowUsed > 0) {
          rowY += 18;
          cursorX = width / 2 - rowWidth / 2;
          rowUsed = 0;
        }
        pill.setPosition(cursorX, rowY);
        cursorX += pill.width + gap;
        rowUsed += pill.width + gap;
        this.container.add(pill);
      }
      return;
    }

    const gap = 18;
    const totalWidth = items.reduce((sum, item) => sum + item.label.length * 13 + 16, 0) + gap * (items.length - 1);
    let cursor = width / 2 - totalWidth / 2;
    for (const item of items) {
      const pill = this.scene.add
        .text(cursor, y, item.label, {
          fontFamily: UI_FONT,
          fontSize: "12px",
          color: item.color,
          backgroundColor: "#121820cc",
          padding: { left: 8, right: 8, top: 3, bottom: 3 }
        })
        .setOrigin(0, 0.5);
      cursor += pill.width + gap;
      this.container.add(pill);
    }
  }

  private shouldShowBadge(option: UpgradeOption): boolean {
    if (!option.badgeText) {
      return false;
    }
    if (option.kind === "weapon" && option.badgeText === t("forms")) {
      return false;
    }
    if (option.kind === "skill" && option.badgeText === t("martialSkills")) {
      return false;
    }
    return option.kind === "evolution" || option.kind === "standaloneSkill" || option.badgeText === t("comboBadge");
  }

  private clear(): void {
    this.teardownCardScroll();
    this.cards.length = 0;
    this.currentOptions = [];
    this.container.removeAll(true);
  }

  private cardTheme(kind: UpgradeOption["kind"]): {
    fill: number;
    stroke: number;
    hoverStroke: number;
    titleColor: string;
    recipeColor: string;
    halo: number;
    sealFill: number;
    accent: number;
    categoryLabel: string;
    badgeBgColor: string;
    badgeTextColor: string;
  } {
    if (kind === "weapon") {
      return {
        fill: 0x0e141f,
        stroke: 0x6f8aa8,
        hoverStroke: 0x9ec8e8,
        titleColor: "#b8d4f0",
        recipeColor: "#9ec8e8",
        halo: 0x121a28,
        sealFill: 0x1a2a3d,
        accent: 0x6f8aa8,
        categoryLabel: t("forms"),
        badgeBgColor: "#1a2a3dcc",
        badgeTextColor: "#e8f4ff"
      };
    }
    if (kind === "skill") {
      return {
        fill: 0x18120e,
        stroke: 0xc9a24d,
        hoverStroke: 0xffd36a,
        titleColor: "#f7c66b",
        recipeColor: "#e8c878",
        halo: 0x241a12,
        sealFill: 0x3a2818,
        accent: 0xc9a24d,
        categoryLabel: t("martialSkills"),
        badgeBgColor: "#3a2818cc",
        badgeTextColor: "#ffe9c2"
      };
    }
    if (kind === "evolution") {
      return {
        fill: 0x241a12,
        stroke: 0xffd36a,
        hoverStroke: 0xffe9a8,
        titleColor: "#ffe09a",
        recipeColor: "#ffe09a",
        halo: 0x2a2018,
        sealFill: 0x4a3018,
        accent: 0xffd36a,
        categoryLabel: t("evolutionBadge"),
        badgeBgColor: "#ffe09a",
        badgeTextColor: "#1b1720"
      };
    }
    if (kind === "standaloneSkill") {
      return {
        fill: 0x14242a,
        stroke: 0x8ff4ff,
        hoverStroke: 0xb8f7ff,
        titleColor: "#b8f7ff",
        recipeColor: "#b8f7ff",
        halo: 0x1a3344,
        sealFill: 0x1a3344,
        accent: 0x8ff4ff,
        categoryLabel: t("standaloneBadge"),
        badgeBgColor: "#8ff4ff",
        badgeTextColor: "#101a20"
      };
    }
    if (kind === "build") {
      return {
        fill: 0x17131f,
        stroke: 0xb86bff,
        hoverStroke: 0xd8b4ff,
        titleColor: "#e8d4ff",
        recipeColor: "#d8b4ff",
        halo: 0x241a30,
        sealFill: 0x332448,
        accent: 0xb86bff,
        categoryLabel: t("buildPaths"),
        badgeBgColor: "#d8b4ff",
        badgeTextColor: "#17131f"
      };
    }
    return {
      fill: 0x1b1720,
      stroke: 0x84f7b2,
      hoverStroke: 0xb8ffd8,
      titleColor: "#d8e2eb",
      recipeColor: "#aac7d8",
      halo: 0x22302a,
      sealFill: 0x2a3a32,
      accent: 0x84f7b2,
      categoryLabel: t("upgradeCategoryStat"),
      badgeBgColor: "#84f7b2",
      badgeTextColor: "#10121f"
    };
  }
}
