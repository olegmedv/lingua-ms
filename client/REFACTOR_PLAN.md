# Refactor Plan

Generated: 2026-05-23. Re-audited: 2026-05-23. Source: `client/CLAUDE.md`.

## Summary
- Total items: 16
- Pending: 12 | Done: 4 | Blocked: 0
- Items requiring user decision: 12
- Ambiguous rules (not audited): 0
- Workflow rules out of audit scope: 6

Re-audit notes: REF-013 moved from `pending` → `done` (silently resolved — see notes). The previously ambiguous "Constants" rule is now sharper in CLAUDE.md (primitives vs. complex data); audited under the new wording, current code is compliant.

## Items

### REF-001 — Set up OpenAPI codegen and generate `src/api/generated/`
- **Status**: pending
- **Risk**: HIGH
- **Requires decision**: Y
- **Rule**: "API types and services are **generated** from backend OpenAPI. Never hand-written." / "Generator: `openapi-typescript-codegen` (or equivalent). Output: `src/api/generated/`." / "Script: `npm run generate-api` pulls from `${VITE_API_URL}/swagger/v1/swagger.json`."
- **Scope**:
  - [package.json](package.json) — add `openapi-typescript-codegen` (or equivalent) dev dep and `generate-api` npm script (requires user approval per "Add a new dependency without user approval" — see workflow rules)
  - `src/api/generated/` — new directory, populated by codegen (do not hand-edit)
- **Depends on**: none
- **DoD**:
  - `npm run generate-api` exists in [package.json](package.json) and produces files under `src/api/generated/`
  - Generated services read `VITE_API_URL` (via [src/config.ts](src/config.ts)) and use a token resolver
  - `npm run build` returns 0
- **Notes**: blocks REF-002, REF-003, REF-004, REF-005. The server must expose `/swagger/v1/swagger.json` at codegen time. User decision needed on (a) which codegen library, (b) where to commit/gitignore generated output.

### REF-002 — Replace hand-written `src/types/api.ts` with generated DTOs
- **Status**: pending
- **Risk**: HIGH
- **Requires decision**: Y
- **Rule**: "No manual API request/response types. Everything from `src/api/generated/`." / "Non-API domain types: `src/types/<name>.ts`."
- **Scope**:
  - [src/types/api.ts](src/types/api.ts) — delete (hand-writes `User`, `AuthResponse`, `Language`, `Lesson`, `Exercise`, `Progress`, `Stats`)
  - [src/store/auth.ts](src/store/auth.ts) — switch type imports to `src/api/generated/`
  - [src/pages/student/Dashboard.tsx](src/pages/student/Dashboard.tsx)
  - [src/pages/student/LessonTree.tsx](src/pages/student/LessonTree.tsx)
  - [src/pages/student/ExercisePlayer.tsx](src/pages/student/ExercisePlayer.tsx)
  - [src/pages/student/Profile.tsx](src/pages/student/Profile.tsx)
  - [src/pages/demo/DemoLessonTree.tsx](src/pages/demo/DemoLessonTree.tsx)
  - [src/pages/admin/LanguageManager.tsx](src/pages/admin/LanguageManager.tsx)
  - [src/pages/admin/LessonManager.tsx](src/pages/admin/LessonManager.tsx)
  - [src/pages/admin/ExerciseBuilder.tsx](src/pages/admin/ExerciseBuilder.tsx)
- **Depends on**: REF-001
- **DoD**:
  - [src/types/api.ts](src/types/api.ts) is deleted
  - No file imports `../types/api` or `../../types/api`
  - Every former type comes from `src/api/generated/`
  - `npm run build` returns 0

### REF-003 — Introduce hooks layer; pages call hooks, hooks call generated services
- **Status**: pending
- **Risk**: HIGH
- **Requires decision**: Y
- **Rule**: "No direct HTTP from components. Components call hooks; hooks call generated services."
- **Scope**:
  - `src/hooks/use<Name>.ts` — new files (one hook per resource: e.g. `useLanguages`, `useLessons`, `useExercises`, `useProgress`, `useStats`)
  - [src/pages/student/Dashboard.tsx](src/pages/student/Dashboard.tsx)
  - [src/pages/student/LessonTree.tsx](src/pages/student/LessonTree.tsx)
  - [src/pages/student/ExercisePlayer.tsx](src/pages/student/ExercisePlayer.tsx)
  - [src/pages/student/Profile.tsx](src/pages/student/Profile.tsx)
  - [src/pages/demo/DemoLessonTree.tsx](src/pages/demo/DemoLessonTree.tsx)
  - [src/pages/admin/LanguageManager.tsx](src/pages/admin/LanguageManager.tsx)
  - [src/pages/admin/LessonManager.tsx](src/pages/admin/LessonManager.tsx)
  - [src/pages/admin/ExerciseBuilder.tsx](src/pages/admin/ExerciseBuilder.tsx)
- **Depends on**: REF-001
- **DoD**:
  - No page or component imports `../api/client` or `../../api/client`
  - Every remote data access in pages flows through a `src/hooks/use*.ts` file
  - `npm run build` returns 0
- **Notes**: TanStack Query is "optional" per CLAUDE.md — user must decide whether to introduce it or write thin hooks over the generated services. The decision affects the shape of every new hook.

### REF-004 — Remove hand-written `src/api/client.ts` and `src/api/endpoints.ts`
- **Status**: pending
- **Risk**: MED
- **Requires decision**: Y
- **Rule**: "API types and services are **generated** from backend OpenAPI. Never hand-written." / "Hand-written API wrapper: `src/api/client.ts`." (the wrapper exists as a slot, but its current contents duplicate generator output and must be retired once consumers migrate)
- **Scope**:
  - [src/api/client.ts](src/api/client.ts) — delete (hand-written fetch wrapper)
  - [src/api/endpoints.ts](src/api/endpoints.ts) — delete (hand-written endpoint catalogue)
  - [src/store/auth.ts](src/store/auth.ts) — rewrite login/register/demoLogin/loadUser to call generated `AuthService`
- **Depends on**: REF-002, REF-003
- **DoD**:
  - Both files deleted
  - `npm run build` returns 0
  - No imports reference the removed paths
- **Notes**: User decision required on whether to keep `src/api/client.ts` as an empty slot for future hand-written extras or remove the file entirely.

### REF-005 — Confine all `localStorage` access to the auth store; generated client pulls token via store
- **Status**: pending
- **Risk**: MED
- **Requires decision**: Y
- **Rule**: "Stores own persisted state. Components never touch `localStorage` / `sessionStorage` directly." / "Read `localStorage` / `sessionStorage` outside a store." (Never list)
- **Scope**:
  - [src/api/client.ts](src/api/client.ts) — 3 `localStorage` reads (removed by REF-004; ensure no replacement re-introduces direct access)
  - [src/store/auth.ts](src/store/auth.ts) — 10 `localStorage.*` calls; replace with `zustand/middleware` `persist` or single-point setter
  - `src/api/generated/` token resolver — wire to `useAuthStore.getState().token`
- **Depends on**: REF-004
- **DoD**:
  - `grep -rE "localStorage|sessionStorage" src/` returns matches only in [src/store/auth.ts](src/store/auth.ts) (and only if `persist` middleware is not used)
  - Generated client's TOKEN resolver reads from auth store, not directly from `localStorage`
  - `npm run build` returns 0

### REF-006 — Rename auth store export `useAuth` → `useAuthStore`
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "Stores: file lowercase (`auth.ts`), exported hook `use<Pascal>Store` (`useAuthStore`)."
- **Scope**:
  - [src/store/auth.ts](src/store/auth.ts) — rename `useAuth` export
  - [src/App.tsx](src/App.tsx)
  - [src/pages/Login.tsx](src/pages/Login.tsx)
  - [src/pages/Register.tsx](src/pages/Register.tsx)
  - [src/pages/student/Dashboard.tsx](src/pages/student/Dashboard.tsx)
  - [src/pages/student/LessonTree.tsx](src/pages/student/LessonTree.tsx)
  - [src/pages/student/Profile.tsx](src/pages/student/Profile.tsx)
- **Depends on**: none
- **DoD**:
  - `src/store/auth.ts` exports `useAuthStore` (not `useAuth`)
  - `grep -nE "useAuth\b" src/` returns no matches outside the export site
  - `npm run build` returns 0

### REF-007 — Move `Login.tsx` and `Register.tsx` into `src/pages/auth/`
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "Page: `src/pages/<area>/<PageName>.tsx`."
- **Scope**:
  - [src/pages/Login.tsx](src/pages/Login.tsx) → `src/pages/auth/Login.tsx`
  - [src/pages/Register.tsx](src/pages/Register.tsx) → `src/pages/auth/Register.tsx`
  - [src/router.tsx](src/router.tsx) — update both imports
- **Depends on**: none
- **DoD**:
  - No `.tsx` file directly under `src/pages/` (every page sits under a `<area>/` subfolder)
  - `npm run build` returns 0

### REF-008 — Move `ProgressBar.tsx` into a `src/components/<group>/` subfolder
- **Status**: pending
- **Risk**: LOW
- **Requires decision**: Y
- **Rule**: "Shared component: `src/components/<group>/<Name>.tsx`."
- **Scope**:
  - [src/components/ProgressBar.tsx](src/components/ProgressBar.tsx) → `src/components/<group>/ProgressBar.tsx`
  - [src/pages/student/ExercisePlayer.tsx](src/pages/student/ExercisePlayer.tsx) — update import
  - [src/components/ui/index.ts](src/components/ui/index.ts) — only if user chooses the `ui/` group
- **Depends on**: none
- **DoD**:
  - No `.tsx` file directly under `src/components/`
  - `npm run build` returns 0
- **Notes**: User decision — place under `ui/` (lightweight presentational) or create a new group such as `progress/`.

### REF-009 — Resolve unregistered demo files (`src/DemoApp.tsx`, `src/pages/demo/DemoLessonTree.tsx`)
- **Status**: pending
- **Risk**: LOW
- **Requires decision**: Y
- **Rule**: "Add a page not registered in `src/router.tsx`." (Never list)
- **Scope**:
  - [src/DemoApp.tsx](src/DemoApp.tsx) — page-like layout shell, no importers, not in router
  - [src/pages/demo/DemoLessonTree.tsx](src/pages/demo/DemoLessonTree.tsx) — page, not in router (router only redirects `/demo*` → `/login`)
  - [src/router.tsx](src/router.tsx) — only if user chooses to register
- **Depends on**: none
- **DoD**:
  - Either both files are deleted (and any importers removed) OR both are registered in [src/router.tsx](src/router.tsx)
  - `npm run build` returns 0
- **Notes**: `/demo` is currently redirected to `/login` ([src/router.tsx:31-32](src/router.tsx#L31-L32)), suggesting deletion is correct. Note that [src/pages/student/ExercisePlayer.tsx:59](src/pages/student/ExercisePlayer.tsx#L59) still navigates to `/demo/lessons/.../complete` from demo mode — that destination is also unregistered. The user owns the product decision (delete the dead demo paths or build them out).

### REF-010 — `LanguageManager.tsx`: pick one UI library (AntD ↔ Tailwind)
- **Status**: pending
- **Risk**: MED
- **Requires decision**: Y
- **Rule**: "One UI library per file — Ant Design **or** Tailwind. If `antd` is imported in a file, that file uses only AntD layout/spacing (no Tailwind utility classes)."
- **Scope**:
  - [src/pages/admin/LanguageManager.tsx](src/pages/admin/LanguageManager.tsx) — imports `antd` (`Modal`, `Form`, `Input`, `Switch`, `Upload`, `Button`) and also uses Tailwind classes (`p-6 md:p-10`, `grid gap-3`, `flex justify-between`, etc.)
- **Depends on**: none
- **DoD**:
  - File either imports `antd` and contains no Tailwind utility classes, OR drops `antd` imports in favor of Tailwind/headless equivalents
  - `npm run build` returns 0

### REF-011 — `LessonManager.tsx`: pick one UI library
- **Status**: pending
- **Risk**: MED
- **Requires decision**: Y
- **Rule**: Same as REF-010.
- **Scope**:
  - [src/pages/admin/LessonManager.tsx](src/pages/admin/LessonManager.tsx) — imports `antd` and uses Tailwind classes
- **Depends on**: none
- **DoD**:
  - File uses exactly one UI library
  - `npm run build` returns 0

### REF-012 — `ExerciseBuilder.tsx`: pick one UI library
- **Status**: pending
- **Risk**: HIGH
- **Requires decision**: Y
- **Rule**: Same as REF-010.
- **Scope**:
  - [src/pages/admin/ExerciseBuilder.tsx](src/pages/admin/ExerciseBuilder.tsx) — imports `antd` (`Button, Modal, Form, Input, InputNumber, Select, Upload, message, Space, Divider`) and uses Tailwind classes
- **Depends on**: none
- **DoD**:
  - File uses exactly one UI library
  - `npm run build` returns 0
- **Notes**: largest of the three; may invalidate or subsume REF-014 and REF-016 depending on how rewriting proceeds.

### REF-013 — `Flashcard.tsx`: remove multi-property inline `style={{}}`
- **Status**: done
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "Use inline `style={{}}` beyond a single one-off property." (Never list)
- **Scope**:
  - [src/components/exercises/Flashcard.tsx](src/components/exercises/Flashcard.tsx#L34) — `style={{ perspective: 1000 }}` (single)
  - [src/components/exercises/Flashcard.tsx](src/components/exercises/Flashcard.tsx#L38) — `style={{ backfaceVisibility: 'hidden' }}` (single)
  - [src/components/exercises/Flashcard.tsx](src/components/exercises/Flashcard.tsx#L40) — `style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}` (single — value depends on state, cannot move to CSS class)
- **Depends on**: none
- **DoD**:
  - Every `style={{}}` in the file has at most one property OR is replaced by Tailwind / CSS class
  - `npm run build` returns 0
- **Notes**: silently resolved between audits — re-audit confirmed every `style={{}}` literal in this file holds exactly one property. The rule "beyond a single one-off property" is read per-element, so the file is compliant. No code change was needed; the prior audit flagged it for human review and the resolution is "no action".

### REF-014 — `ExerciseBuilder.tsx`: remove multi-property inline `style={{}}`
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "Use inline `style={{}}` beyond a single one-off property." (Never list)
- **Scope**:
  - [src/pages/admin/ExerciseBuilder.tsx](src/pages/admin/ExerciseBuilder.tsx#L234) — `<code style={{ userSelect: 'all', cursor: 'copy' }}>` (two properties)
  - [src/pages/admin/ExerciseBuilder.tsx](src/pages/admin/ExerciseBuilder.tsx#L237) — `<code style={{ userSelect: 'all', cursor: 'copy' }}>` (two properties)
- **Depends on**: none
- **DoD**:
  - No `style={{}}` with more than one property remains in the file
  - `npm run build` returns 0
- **Notes**: may be subsumed by REF-012 if the UI library rewrite removes these elements.

### REF-015 — `WordBank.tsx`: split into one component per file
- **Status**: pending
- **Risk**: LOW
- **Requires decision**: Y
- **Rule**: "One component per file."
- **Scope**:
  - [src/components/exercises/WordBank.tsx](src/components/exercises/WordBank.tsx) — currently defines `SortableWord` (line 18), `BankWord` (line 29), and `WordBank` (line 47)
- **Depends on**: none
- **DoD**:
  - File defines exactly one component (`WordBank`)
  - `SortableWord` and `BankWord` extracted to their own files under `src/components/<group>/`
  - `npm run build` returns 0
- **Notes**: User decision — where to place the extracted helpers (a new `wordbank/` subgroup, or alongside `exercises/`).

### REF-016 — `ExerciseBuilder.tsx`: split into one component per file
- **Status**: pending
- **Risk**: MED
- **Requires decision**: Y
- **Rule**: "One component per file."
- **Scope**:
  - [src/pages/admin/ExerciseBuilder.tsx](src/pages/admin/ExerciseBuilder.tsx) — defines `TypeFields` (line 110) alongside the page-default `ExerciseBuilder` (line 268)
- **Depends on**: none
- **DoD**:
  - File defines exactly one component
  - `TypeFields` extracted to a separate file (likely `src/components/<group>/TypeFields.tsx` or `src/pages/admin/ExerciseTypeFields.tsx`)
  - `npm run build` returns 0
- **Notes**: may be subsumed by REF-012 if rewriting the UI library reshapes the form structure entirely.

## Out of audit scope (workflow rules)

These rules govern agent behavior or process, not codebase state. They are valid rules but cannot be verified by scanning source. Listed for transparency only — the agent must still follow them when working.

- "If a backend type is missing on the frontend, regenerate — do not transcribe" — process: how to react to a type miss
- "`npm run generate-api` if backend OpenAPI changed" — build command
- "`npm run lint` → must pass" — build command
- "`npm run build` (`tsc -b && vite build`) → must succeed" — build command
- "**Definition of Done**: lint green, build green. Partial = not done." — definition-of-done process rule
- "Add a new dependency without user approval" — process rule (listed in Never)

## Ambiguous rules (require user clarification)

None. The previously-ambiguous "Constants: SCREAMING_SNAKE_CASE" rule has been sharpened in [CLAUDE.md](CLAUDE.md) to distinguish module-level primitive constants (`SCREAMING_SNAKE_CASE`, e.g. `API_URL`) from module-level objects/arrays/complex data (`camelCase`, e.g. `adminCards`, `exerciseTypes`). Audited against the new wording — current code is compliant:
- [src/config.ts:1](src/config.ts#L1) `API_URL` — primitive, SCREAMING_SNAKE_CASE ✓
- [src/pages/admin/AdminDashboard.tsx:4](src/pages/admin/AdminDashboard.tsx#L4) `adminCards` — array, camelCase ✓
- [src/pages/admin/ExerciseBuilder.tsx:11](src/pages/admin/ExerciseBuilder.tsx#L11) `exerciseTypes` — array, camelCase ✓
- [src/pages/admin/ExerciseBuilder.tsx:22](src/pages/admin/ExerciseBuilder.tsx#L22) `defaultInstructions` — object, camelCase ✓
- [src/components/ui/Button.tsx:10](src/components/ui/Button.tsx#L10) `styles` — object, camelCase ✓
- [src/components/ui/Badge.tsx:3](src/components/ui/Badge.tsx#L3) `variantStyles` — object, camelCase ✓
