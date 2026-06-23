---
id: 003-impact-feedback-build-guide
title: 武林絕學打擊回饋與 Build 引導
status: in-progress
owner: openab
created: 2026-06-23
updated: 2026-06-23
---

# 武林絕學打擊回饋與 Build 引導 Spec

## 1. 目標

在 `002-martial-evolution` 已完成 10 招式與 10 武林絕學後，本階段要讓玩家更清楚地感受到：

- 武林絕學與普通招式的視覺、音效、節奏差異。
- 當前 Build 正在往哪個武學路線發展。
- 升級選項與 HUD 能提示玩家如何湊出絕學。
- Boss 節點與成就能支撐「江湖闖關」的長期目標。

本 spec 不新增大型新系統，優先加強既有內容的爽感、可讀性與回饋。

## 2. 設計原則

- 打擊回饋要服務辨識度，不只是畫面變亮。
- 絕學特效要有各自性格：劍宗銳利、氣宗厚重、身法飄忽、酒劍爆發。
- UI 引導要短、準、遊戲內可理解，避免用教學文字塞滿畫面。
- Build 引導不應強迫玩家，只提高「看得懂自己在湊什麼」。
- 音效需可程式生成或沿用現有 Web Audio，不依賴大型外部音檔。
- 所有新提示與名稱需支援繁中與英文。

## 3. 範圍

### 3.1 In Scope

- 10 個武林絕學的專屬 VFX 色彩與命中特效。
- 領悟武林絕學時的短暫畫面演出。
- 絕學施放、命中、吸血、暴擊、升級的音效差異。
- 升級卡片顯示「可進化配方」與「目前進度」。
- HUD 顯示當前最接近完成的 1 到 3 組絕學配方。
- 心法標示：
  - 可結合心法
  - 孤本心法
  - 已滿級
- 成就：
  - 初悟絕學
  - 一局三絕
  - 十絕入門
  - 孤本奇緣
  - 博採眾長
- Boss 節點回饋：
  - Boss 現身提示更具武俠感
  - 擊敗 Boss 顯示解鎖心法與可能 Build 方向

### 3.2 Out of Scope

- 新角色。
- 新地圖。
- 新敵人種類。
- 永久角色養成樹。
- 外部美術或音訊素材包。
- 手機操作。

## 4. 使用者體驗

### 4.1 領悟武林絕學

當玩家選擇進化卡片時：

1. 遊戲短暫慢動作 250 到 450ms。
2. 角色周圍出現對應流派光圈。
3. 畫面中央顯示：
   - `領悟武林絕學`
   - 絕學名稱
4. 播放專屬領悟音效。
5. HUD 中原招式名稱替換為絕學名稱。

### 4.2 升級卡片 Build 引導

升級卡片應顯示簡短配方資訊：

```text
華山劍氣 第 4 / 5 重
獨孤劍意 第 2 / 3 重
可成：獨孤破式劍
```

卡片分類：

| 類型 | 視覺 |
|---|---|
| 普通招式 | 現有武學卡 |
| 可結合心法 | 心法角標：可結合 |
| 孤本心法 | 藍青色邊框，角標：孤本 |
| 武林絕學 | 金色邊框，標題：領悟武林絕學 |
| 已滿級 | 不進升級池；HUD 中顯示滿級標記 |

### 4.3 HUD Build 追蹤

HUD 新增「武學路線」區塊，顯示最接近完成的 1 到 3 組配方。

排序邏輯：

1. 已擁有招式或心法者優先。
2. 進度百分比高者優先。
3. 已完成但尚未領悟者置頂。
4. 已領悟者移到招式列表，不再佔用追蹤區。

顯示範例：

```text
武學路線
獨孤破式劍  8 / 8  可領悟
吸星摧心掌  6 / 8
清風十三劍陣  4 / 8
```

## 5. 武林絕學 VFX 規劃

| 武林絕學 | 主色 | VFX 方向 |
|---|---|---|
| 獨孤破式劍 | 金白 | 寬幅劍芒、裂空閃光、暴擊時短線碎裂 |
| 清風十三劍陣 | 青白 | 劍環殘影、環形風紋、旋轉加速光帶 |
| 吸星摧心掌 | 紫藍 | 掌波外圈吸附線、命中時小型吸氣粒子 |
| 醉裡破式九劍 | 橙金 | 瞬斬殘影、酒色閃爍、多段斬擊火花 |
| 吸星歸元大法 | 紫金 | 大型漩渦、脈衝光圈、回血綠色細線 |
| 紫霞落英神劍 | 紫粉 | 飛花劍片、回旋尾跡、二段回收光點 |
| 狂風無影劍 | 青綠 | 速度殘影、風線、移動蓄勢滿時閃光 |
| 太岳鎮嶽劍 | 土金 | 落點震波、地裂線、擊退衝擊圈 |
| 寒潭照影十三劍 | 冰藍 | 寒氣區域、鏡面殘影、減速霜紋 |
| 金剛百步伏魔拳 | 金橙 | 拳勁震波、護體光罩、爆點環形衝擊 |

MVP 實作可使用 Phaser Graphics、tween、tint、alpha、scale，不需要新增圖片。

## 6. 音效規劃

沿用或擴充 `AudioFeedbackSystem`，以 Web Audio 產生不同聲響。

### 6.1 音效事件

| 事件 | 說明 |
|---|---|
| `weapon-fired` | 普通招式施放 |
| `evolution-fired` | 武林絕學施放 |
| `evolution-learned` | 領悟絕學 |
| `critical-hit` | 暴擊 |
| `combo-hit` | 連擊 |
| `player-healed` | 吸血或回血 |
| `boss-defeated` | Boss 擊敗 |

### 6.2 音色方向

| 類型 | 音色 |
|---|---|
| 劍法 | 短促高頻、微滑音 |
| 掌法 / 拳法 | 低頻短鼓感、下滑音 |
| 氣宗 | 持續三角波、脈衝感 |
| 身法 | 輕短高頻、快速左右變化 |
| 酒劍 | 不穩定 pitch、雙段爆發 |

## 7. Build 引導資料結構

新增或擴充：

```ts
export type EvolutionProgress = {
  evolutionId: EvolutionId;
  weaponLevel: number;
  requiredWeaponLevel: number;
  skillLevel: number;
  requiredSkillLevel: number;
  canEvolve: boolean;
  alreadyEvolved: boolean;
  progressScore: number;
};
```

建議新增：

```text
src/systems/EvolutionGuideSystem.ts
```

或純資料 helper：

```text
src/data/evolutionProgress.ts
```

用途：

- 升級卡片描述配方進度。
- HUD 顯示最接近完成的配方。
- 測試可直接驗證排序與進度計算。

## 8. UI 改動

### 8.1 UpgradePanel

新增顯示欄位：

- `badgeText?: string`
- `recipeHint?: string`
- `progressText?: string`

升級選項資料建議：

```ts
export type UpgradeOption = {
  id: string;
  kind: "stat" | "weapon" | "skill" | "build" | "evolution" | "standaloneSkill";
  iconKey: string;
  title: string;
  description: string;
  badgeText?: string;
  recipeHint?: string;
  progressText?: string;
  apply: (state: GameState) => void;
};
```

### 8.2 UIScene

新增：

- `evolutionGuideText`
- 顯示 `武學路線` 區塊
- 若螢幕高度不足，Build 路線與心法列表需縮短顯示，不可互相重疊

## 9. 成就規劃

| 成就 | 條件 |
|---|---|
| 初悟絕學 | 第一次領悟任一武林絕學 |
| 劍破長空 | 領悟獨孤破式劍 |
| 一局三絕 | 單局領悟 3 個武林絕學 |
| 十絕入門 | 累積曾領悟 5 種不同武林絕學 |
| 孤本奇緣 | 第一次取得孤本心法 |
| 博採眾長 | 單局同時擁有武林絕學與孤本心法 |

紀錄建議存入既有 run record：

```ts
evolvedArtsSeen: EvolutionId[];
standaloneSkillsSeen: SkillId[];
```

## 10. Boss 節點優化

Boss 現身與擊敗需要更像江湖事件。

### 10.1 現身提示

目前提示：

```text
5:00  敵派執令 現身江湖
```

建議改為：

```text
五嶽風雲起：敵派執令現身
```

### 10.2 擊敗回饋

擊敗 Boss 後顯示：

- 解鎖心法名稱
- 該心法可結合的絕學

範例：

```text
解鎖心法：獨孤劍意
可悟：獨孤破式劍
```

## 11. 測試規劃

新增或擴充 Vitest：

- `computeEvolutionProgress` 能正確計算招式與心法進度。
- 可領悟配方排序在 HUD 追蹤最前面。
- 已領悟配方不出現在 HUD 追蹤。
- 升級選項能提供 `badgeText` 與 `recipeHint`。
- 孤本心法 badge 顯示為孤本，且沒有配方進化提示。
- 領悟絕學後會觸發 `evolution-learned` 事件。
- 成就條件：
  - 初悟絕學
  - 一局三絕
  - 孤本奇緣
- 繁中與英文 key parity 維持一致。

## 12. 實作拆分建議

### Task 1：Build 引導資料與測試

- 新增 `src/data/evolutionProgress.ts`
- 計算 10 組配方進度
- 排序最接近完成的 1 到 3 組
- 補單元測試

### Task 2：升級卡片引導

- `UpgradeOption` 增加 badge 與配方提示
- `UpgradePanel` 顯示角標、配方、進度
- 孤本心法顯示不可結合提示
- 補 UI 資料測試

### Task 3：HUD 武學路線

- `UIScene` 顯示武學路線區塊
- 避免小螢幕文字重疊
- 補 format helper 測試

### Task 4：VFX 與音效

- 擴充 `AudioFeedbackSystem`
- 領悟絕學演出
- 10 絕學專屬施放/命中特效 MVP
- 補 smoke test 或事件測試

### Task 5：成就與 Boss 回饋

- 新增進化與孤本成就
- Boss 擊敗後顯示可悟絕學提示
- 補 persistence 測試

## 13. 驗收標準

- 玩家能在 HUD 看到最接近完成的武林絕學路線。
- 升級卡片能顯示可結合心法、孤本心法、配方進度。
- 領悟武林絕學時有明顯畫面與音效回饋。
- 10 個武林絕學至少有各自可辨識的 VFX 色彩或效果。
- Boss 擊敗後會提示解鎖心法與可悟絕學。
- 新增成就可被觸發並持久化。
- 繁中與英文顯示正常。
- `npm test -- --run` 通過。
- `npm run build` 通過。

## 14. 尚待確認

- 是否要讓玩家手動釘選一條武學路線。
- HUD 武學路線最多顯示 2 條還是 3 條。
- 絕學領悟慢動作是否會影響遊戲節奏。
- 音效是否需要可在設定中關閉。
- 成就是只記錄本機，還是未來會支援帳號或排行榜。
