# AI-Driven Development Flow

## vif Workspace

| Name | Path | Scope |
| --- | --- | --- |
| app | . | src/, public/, package.json, vite.config.ts |
| docs | ./docs | prds/, specs/ |

Current repo: app

## flow_mode

- flow_mode: god

## Test Strategy

- Frontend: TypeScript type check + production build smoke check
- Dependency: npm audit
- Manual: browser playtest checklist in God Mode report

## Git

- Commit work at phase boundaries with concise conventional commit messages.
