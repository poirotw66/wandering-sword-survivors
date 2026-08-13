# AI-Driven Development Flow

## vif Workspace

| Name | Path | Scope |
| --- | --- | --- |
| app | . | godot/ (primary), legacy/ (Phaser archive), docs/, package.json |
| docs | ./docs | prds/, specs/ |

Current repo: app (Godot remake + legacy Phaser)

## flow_mode

- flow_mode: god

## Test Strategy

- Godot: `npm run godot:test` (headless content/rules) + optional `npm run godot:export-web`
- Legacy Frontend: TypeScript type check + production build smoke check (`npm test` / `npm run build`)
- Dependency: npm audit (legacy)
- Manual: browser playtest checklist in God Mode report

## Git

- Commit work at phase boundaries with concise conventional commit messages.
