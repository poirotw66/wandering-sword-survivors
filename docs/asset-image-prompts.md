# Wuxia Asset Image Prompts

AI image generation prompts for missing game assets. Style reference: `public/assets/sprites/wuxia/enemy-green.png`, `hero-linghu.png`, and `public/assets/icons/wuxia/icon-weapon-bolt.png`.

## Gap Summary

| Category | Have | Missing | Output path |
| --- | --- | --- | --- |
| Minion sprites | 3 (`enemy-green`, `enemy-purple`, `enemy-red`) | 13 | `public/assets/sprites/wuxia/{spriteKey}.png` |
| Boss sprites | 1 (`boss-master` fallback) | 5 | `public/assets/sprites/wuxia/{spriteKey}.png` |
| Upgrade icons | 37 | 1 | `public/assets/icons/wuxia/icon-marrow-cleansing.png` |

`atlas-transparent.png` already contains some characters; cut and wire those before regenerating overlapping designs.

---

## Shared Style Prefix (minions)

Paste at the start of every minion prompt:

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art
```

## Shared Style Prefix (bosses)

```text
2D game BOSS character sprite, chibi SD but slightly larger and more ornate than minions, Chinese wuxia fantasy, dramatic pose, strong silhouette readable at small size, glowing aura hints, transparent background, no text, no watermark, mobile ARPG boss sprite
```

## Shared Style Prefix (icons)

```text
2D mobile RPG skill icon, square format, ornate antique gold decorative frame with corner filigree, dark navy background inside frame, centered symbolic object, glowing magical aura, high detail digital painting, no text, no watermark, wuxia cultivation manual icon style
```

## Shared Negative Prompt

```text
realistic proportions, photorealistic, 3D render, blurry, low resolution, cropped limbs, multiple characters, background scenery, text, logo, watermark, western medieval armor, gun, modern clothing, gore, blood splatter, chibi inconsistency, deformed hands, extra fingers
```

## Technical Specs

| Type | Size | Layout | Filename |
| --- | --- | --- | --- |
| Minion | 512×512 px | Full body, 10% padding below feet | `{spriteKey}.png` |
| Boss | 768×768 px | Full body, slightly more aura | `{spriteKey}.png` |
| Icon | 512×512 px | Centered symbol inside frame | `icon-marrow-cleansing.png` |

---

## Minion Sprites (13 missing)

### 1. Huashan Sword Trainee — `enemy-huashan.png`

- **Game id:** `huashanSwordsman`
- **Name (zh-TW):** 華山劍徒
- **Palette:** cyan `#9ee7ff`, cream white

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Young Huashan sect sword disciple, teal-white hanfu robes, light cyan sash, straight jian sword held forward, agile lean build, sharp confident eyes, flowing ponytail, elegant sword sect aesthetic, palette: cyan #9ee7ff and cream white
```

### 2. Hengshan Guard Nun — `enemy-hengshan.png`

- **Game id:** `hengshanNun`
- **Name (zh-TW):** 恆山持戒尼
- **Palette:** ice blue `#b8f7ff`, white

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Hengshan Buddhist nun warrior, pale blue-grey nun robes with white cowl, wooden prayer staff held diagonally, calm defensive stance, shaved head or short hair under veil, serene but firm expression, palette: ice blue #b8f7ff and white
```

### 3. Taishan Acolyte — `enemy-taishan.png`

- **Game id:** `taishanAcolyte`
- **Name (zh-TW):** 泰山門徒
- **Palette:** gold `#d9b45f`, dark brown

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Taishan sect martial acolyte, golden-brown heavy robes, broad shoulders, thick saber (dao) at side, sturdy grounded stance, short topknot, disciplined temple guard look, palette: gold #d9b45f and dark brown
```

### 4. River Bandit — `enemy-river-bandit.png`

- **Game id:** `riverBandit`
- **Name (zh-TW):** 江湖水匪
- **Palette:** brown `#b9824d`, muddy green

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. River bandit outlaw, rugged brown leather vest over dark shirt, bandana headband, small hand axe, scruffy appearance, crouching aggressive pose, wet-river pirate vibe, palette: brown #b9824d and muddy green accents
```

### 5. Medicine Valley Heretic — `enemy-medicine-heretic.png`

- **Game id:** `medicineHeretic`
- **Name (zh-TW):** 藥谷邪醫
- **Palette:** toxic green `#84f7b2`, sickly yellow `#caff6e`

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Corrupt medicine valley heretic doctor, dark green scholar robes stained with herbs, sinister smile, holding glass medicine bottle and bone-handled scalpel, hunched scheming pose, palette: toxic green #84f7b2 and sickly yellow #caff6e
```

### 6. Sun Moon Cultist — `enemy-sun-moon.png`

- **Game id:** `sunMoonCultist`
- **Name (zh-TW):** 日月教眾
- **Palette:** dark purple `#2b2036`, magenta `#ff73d2`

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Sun Moon cult follower, black-purple cult robes with pink crescent moon emblem on chest, dual curved daggers, masked lower face, fanatical cultist stance, palette: dark purple #2b2036 and magenta #ff73d2
```

### 7. Imperial Brocade Guard — `enemy-royal-guard.png`

- **Game id:** `royalGuard`
- **Name (zh-TW):** 錦衣衛士
- **Palette:** navy `#27415f`, gold `#ffd36a`

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Imperial brocade guard elite soldier, dark blue armored hanfu with golden brocade patterns, tall imposing build, long spear, winged hat silhouette, royal authority, palette: navy #27415f and gold #ffd36a
```

### 8. Wudang Taoist — `enemy-wudang.png`

- **Game id:** `wudangMonk`
- **Name (zh-TW):** 武當道士
- **Palette:** sky blue `#7ec8e3`, cream

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Wudang Taoist monk, light cyan Taoist robe with yin-yang collar patch, holding a folding fan in tai chi guard pose, calm flowing movement, long hair bun with hairpin, palette: sky blue #7ec8e3 and cream
```

### 9. Shaolin Monk — `enemy-shaolin.png`

- **Game id:** `shaolinMonk`
- **Name (zh-TW):** 少林武僧
- **Palette:** saffron `#ffb347`, warm beige

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Shaolin warrior monk, orange Buddhist kasaya over grey monk clothes, bald head, muscular stocky build, bare fists in martial arts stance, prayer beads on wrist, palette: saffron orange #ffb347 and warm beige
```

### 10. Emei Sword Maiden — `enemy-emei.png`

- **Game id:** `emeiDisciple`
- **Name (zh-TW):** 峨眉劍姬
- **Palette:** soft violet `#f4b8ff`, white

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Emei sword maiden, elegant light purple-white female hanfu, slim agile build, long thin needle-sword (emeici), graceful fencing pose, jade hair ornament, palette: soft violet #f4b8ff and white
```

### 11. Beggar Sect Scout — `enemy-beggar.png`

- **Game id:** `beggarSect`
- **Name (zh-TW):** 丐幫弟子
- **Palette:** earthy brown `#8b7355`, tan `#d4a574`

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Beggar sect disciple, patched grey-brown ragged robes, straw sandals, holding wooden dog-beating staff, several cloth patches, playful roguish grin, palette: earthy brown #8b7355 and tan #d4a574
```

### 12. Northern Steppe Raider — `enemy-northern-rider.png`

- **Game id:** `northernRider`
- **Name (zh-TW):** 塞北馬賊
- **Palette:** dusty orange `#c67b4e`, gold trim

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Northern steppe horse raider, fur-trimmed leather coat, fur hat, curved whip in hand, wind-swept scarf, nomadic bandit stance as if just dismounted, palette: dusty orange #c67b4e and gold trim
```

### 13. Five Poisons Cultist — `enemy-poison-cult.png`

- **Game id:** `poisonMaster`
- **Name (zh-TW):** 五毒教徒
- **Palette:** dark green `#2a3a1f`, toxic lime `#6ecf4a`

```text
2D game character sprite, chibi SD proportions (large head, small body), Chinese wuxia martial arts fantasy, clean bold outlines, cel-shaded with soft gradients, vibrant colors, heroic lighting, single character centered, 3/4 view facing right, dynamic combat-ready pose, transparent background, no text, no watermark, no UI frame, mobile ARPG sprite style, consistent with existing wuxia survivor game art. Five Poisons cultist, dark olive-green robes with venom vial belt, snake and scorpion motifs, holding bubbling poison flask, sinister hood partially covering face, palette: dark green #2a3a1f and toxic lime #6ecf4a
```

---

## Boss Sprites (5 missing)

### 1. Rival Sect Captain — `boss-rival-captain.png`

- **Game id:** `minorBoss`
- **Name (zh-TW):** 敵派執令
- **Palette:** coral `#ff8f70`, gold `#ffd36a`

```text
2D game BOSS character sprite, chibi SD but slightly larger and more ornate than minions, Chinese wuxia fantasy, dramatic pose, strong silhouette readable at small size, glowing aura hints, transparent background, no text, no watermark, mobile ARPG boss sprite. Rival sect captain boss, crimson-orange commander armor over sect robes, battle banner pole with sect flag behind shoulder, captain insignia, aggressive dash-ready pose, palette: coral #ff8f70 and gold #ffd36a, menacing but not final-boss scale
```

### 2. Renegade Master — `boss-renegade-master.png`

- **Game id:** `midBoss`
- **Name (zh-TW):** 叛門宗師
- **Palette:** crimson `#ff4f64`, black `#2b2036`

```text
2D game BOSS character sprite, chibi SD but slightly larger and more ornate than minions, Chinese wuxia fantasy, dramatic pose, strong silhouette readable at small size, glowing aura hints, transparent background, no text, no watermark, mobile ARPG boss sprite. Renegade martial master boss, torn dark red master robes, wide flowing sleeves, dual palm strike pose with red qi energy, scarred face, fallen hero turned villain, palette: crimson #ff4f64 and black #2b2036
```

### 3. Grand Sword Elder — `boss-grand-elder.png`

- **Game id:** `greatBoss`
- **Name (zh-TW):** 劍宗長老
- **Palette:** cream `#f7efd8`, gold `#d9b45f`

```text
2D game BOSS character sprite, chibi SD but slightly larger and more ornate than minions, Chinese wuxia fantasy, dramatic pose, strong silhouette readable at small size, glowing aura hints, transparent background, no text, no watermark, mobile ARPG boss sprite. Grand sword elder boss, white-gold elder robes, long white beard, massive ornate jian, sword qi aura, dignified towering stance, ancient sword patriarch, palette: cream #f7efd8 and gold #d9b45f
```

### 4. Demonic Sect Overlord — `boss-demonic-overlord.png`

- **Game id:** `megaBoss`
- **Name (zh-TW):** 魔教霸主
- **Palette:** void black `#2b2036`, violet `#b86bff`

```text
2D game BOSS character sprite, chibi SD but slightly larger and more ornate than minions, Chinese wuxia fantasy, dramatic pose, strong silhouette readable at small size, glowing aura hints, transparent background, no text, no watermark, mobile ARPG boss sprite. Demonic sect overlord boss, black-purple demonic armor robes, purple evil aura vortex, horned shoulder pauldrons, commanding dark lord pose, palette: void black #2b2036 and violet #b86bff, mid-game major villain
```

### 5. Eastern Invincible — `boss-eastern-invincible.png`

- **Game id:** `finalBoss`
- **Name (zh-TW):** 東方不敗
- **Palette:** hot pink `#ff2f86`, cream `#f7efd8`

```text
2D game BOSS character sprite, chibi SD but slightly larger and more ornate than minions, Chinese wuxia fantasy, dramatic pose, strong silhouette readable at small size, glowing aura hints, transparent background, no text, no watermark, mobile ARPG boss sprite. Eastern Invincible final boss, extravagant pink-magenta silk robes, golden needle and folding fan weapons, androgynous charismatic supreme martial artist, butterfly and peony motifs, overwhelming pink qi aura, palette: hot pink #ff2f86 and cream #f7efd8, most ornate boss design
```

---

## Upgrade Icon (1 missing)

### Marrow Cleansing Manual — `icon-marrow-cleansing.png`

- **Skill id:** `marrowCleansing` (洗髓經)
- **Palette:** jade green `#84f7b2`, gold accents

```text
2D mobile RPG skill icon, square format, ornate antique gold decorative frame with corner filigree, dark navy background inside frame, centered symbolic object, glowing magical aura, high detail digital painting, no text, no watermark, wuxia cultivation manual icon style. Glowing jade human spine and meridian diagram floating above an ancient scroll, green-gold cleansing qi spiraling around bones, symbol of marrow washing internal cultivation technique, palette: jade green #84f7b2 and gold accents, mystical body refinement theme
```

---

## Optional: Regenerate Existing Minions

These three PNGs already exist. Regenerate only if you want a unified batch style.

| File | Game id | Name (zh-TW) | Key prompt terms |
| --- | --- | --- | --- |
| `enemy-green.png` | `slime` | 青城弟子 | green masked assassin, dual daggers, Qingcheng sect |
| `enemy-purple.png` | `bat` | 魔教刺客 | purple cult assassin, fast crouching pose, demonic sect |
| `enemy-red.png` | `golem` | 嵩山高手 | red headband brawler, muscular Songshan expert, fists |

---

## Production Workflow

1. Generate one test asset first (`enemy-huashan.png`) and compare against `enemy-green.png`.
2. Use `enemy-green.png` as a style reference image in your generator.
3. Keep the shared negative prompt on every run.
4. Export as PNG with transparent background at the sizes above.
5. Save using the exact `spriteKey` filename from `src/data/enemies.ts`.
6. Drop files into `public/assets/sprites/wuxia/` or `public/assets/icons/wuxia/`.
7. `BootScene` loads PNG when present; procedural fallbacks are skipped automatically.

## Priority

| Priority | Category | Count |
| --- | --- | --- |
| P0 | Minion sprites | 13 |
| P1 | Boss sprites | 5 |
| P2 | Upgrade icon | 1 |
