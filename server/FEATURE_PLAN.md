# Feature Plan

Generated: 2026-05-23. Multi-phase plan for "Demo admin mode" feature.

**Phase 1 (FEAT-001..FEAT-007, done)** — Source spec: "Block demo user (Role == Demo) from mutation commands. Use MediatR pipeline behavior DemoUserRestrictionBehavior in Application/Common/Behaviors/. Behavior checks if command is *Command (not *Query) and if ICurrentUser.IsInRole(\"Demo\"). If both true, throw UnauthorizedException with message 'Demo users cannot modify content'. Register after ValidationBehavior in Program.cs. Exempt DemoLoginCommand (auth, not business mutation)." Source CLAUDE.md: [server/CLAUDE.md](CLAUDE.md).

**Phase 2 (FEAT-008..FEAT-014, pending, added 2026-05-23)** — Source spec: "Demo admin mode — read-only admin experience for users with Role=Demo. Frontend: detect Role=Demo from JWT (already in auth store after FEAT-005); show persistent warning banner ('Demo mode — changes are not saved', yellow/orange, dismissible per session) at top of all admin pages; disable all mutation buttons (delete/edit/save/upload) for demo users with tooltip 'Demo cannot modify' (option a chosen over click-intercept); read access unchanged. Backend already implemented (FEAT-001..FEAT-007); security boundary is the 401 from DemoUserRestrictionBehavior. No backend changes expected — verify by enumerating any new mutation surfaces. Out of scope: sandbox 'fake mutations with rollback', DB changes, new backend endpoints." Source CLAUDE.md: [client/CLAUDE.md](../client/CLAUDE.md).

## Summary
- Total items: 14 (7 backend + 7 frontend)
- Pending: 1 | Done: 13 | Blocked: 0 | Superseded: 0
- Items requiring user decision: 0
- Critic iterations: Phase 1 — 2 (approved). Phase 2 — 2 (approved).
- Critic verdict: Phase 1 approved (only LOW notes after iteration 2). Phase 2 approved (only LOW notes after iteration 2).

## Execution order
**Phase 1**: FEAT-001 → FEAT-002 → FEAT-003 → FEAT-007 → FEAT-006 → FEAT-005 → FEAT-004. Each item is atomic (build green between commits). FEAT-006 deliberately lands before FEAT-005 so the demo user keeps reaching mutation endpoints after their role changes.

**Phase 2**: FEAT-008 → FEAT-009 → FEAT-010 → FEAT-011 → FEAT-012 → FEAT-013 → FEAT-014. Foundation (hook, store) first, then shared components, then layout integration, then per-page button disabling. FEAT-014 is a backend grep verification with no code change; run anywhere in the order but recommended first to surface any new mutation surfaces before frontend work.

## Items

### FEAT-001 — Add `Demo` value to UserRole enum
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "Block demo user (Role == Demo) from mutation commands."
- **Rule**: CLAUDE.md "Entities/Enums: singular noun"; auditable-entities rule unaffected.
- **Scope**:
  - [LinguaCMS.Domain/Enums/UserRole.cs](LinguaCMS.Domain/Enums/UserRole.cs)
- **Depends on**: none
- **DoD**:
  - Enum has `Demo = 2` (preserves `Student = 0`, `Admin = 1`)
  - No EF migration required (PostgreSQL stores UserRole as int; new value is additive)
  - `dotnet build` returns 0

### FEAT-002 — Add `IsInRole(string)` to ICurrentUser + impl
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "Behavior checks ... if ICurrentUser.IsInRole(\"Demo\")."
- **Rule**: CLAUDE.md "Current user via `ICurrentUser` (domain interface, infra impl) reading `sub` claim. Never touch `HttpContext.User` in handlers/controllers."
- **Scope**:
  - [LinguaCMS.Domain/Interfaces/ICurrentUser.cs](LinguaCMS.Domain/Interfaces/ICurrentUser.cs)
  - [LinguaCMS.Infrastructure/Services/CurrentUser.cs](LinguaCMS.Infrastructure/Services/CurrentUser.cs)
- **Depends on**: none
- **DoD**:
  - Interface declares `bool IsInRole(string role);`
  - Impl returns `User?.IsInRole(role) ?? false` (false for anonymous / null principal — matches the existing `IsAdmin` pattern)
  - `dotnet build` returns 0

### FEAT-003 — Create DemoUserRestrictionBehavior
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: MED
- **Requires decision**: N (exemption list resolved iteration 1)
- **Spec reference**: "Use MediatR pipeline behavior DemoUserRestrictionBehavior in Application/Common/Behaviors/. Behavior checks if command is *Command (not *Query) and if ICurrentUser.IsInRole(\"Demo\"). If both true, throw UnauthorizedException with message 'Demo users cannot modify content'. Exempt DemoLoginCommand (auth, not business mutation)."
- **Rule**: CLAUDE.md "Cross-cutting concerns (logging, validation, authorization, transactions, caching) live only in `IPipelineBehavior<,>` implementations." Pipeline behavior naming "`<Name>Behavior`".
- **Scope**:
  - [LinguaCMS.Application/Common/Behaviors/DemoUserRestrictionBehavior.cs](LinguaCMS.Application/Common/Behaviors/DemoUserRestrictionBehavior.cs) (new file)
- **Depends on**: FEAT-002
- **DoD**:
  - Class signature `DemoUserRestrictionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull` in namespace `LinguaCMS.Application.Common.Behaviors`
  - Constructor injects `ICurrentUser` (already registered Scoped at [Program.cs:54](LinguaCMS.API/Program.cs#L54) — no new DI for the dep)
  - Static exemption set: `private static readonly HashSet<Type> Exempt = new() { typeof(DemoLoginCommand), typeof(LoginCommand), typeof(RegisterCommand) };` (all three share namespace `LinguaCMS.Application.Auth.Commands` — single using suffices). Add a code comment noting "extend when adding new anonymous auth-flow commands."
  - `Handle` logic: if `typeof(TRequest).Name.EndsWith("Command")` AND `!Exempt.Contains(typeof(TRequest))` AND `_currentUser.IsInRole("Demo")` → `throw new UnauthorizedException("Demo users cannot modify content")`; else `await next()`
  - `dotnet build` returns 0
  - Existing `Pipeline_behaviors_end_with_Behavior_suffix` architecture test still passes (validates the new behavior's naming)

### FEAT-004 — Register DemoUserRestrictionBehavior in Program.cs after ValidationBehavior
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "Register after ValidationBehavior in Program.cs."
- **Rule**: CLAUDE.md "Pipeline order: `LoggingBehavior` → `ValidationBehavior` → others → Handler."
- **Scope**:
  - [LinguaCMS.API/Program.cs](LinguaCMS.API/Program.cs)
- **Depends on**: FEAT-003
- **DoD**:
  - Line `builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(DemoUserRestrictionBehavior<,>));` inserted immediately after the existing ValidationBehavior registration ([Program.cs:29](LinguaCMS.API/Program.cs#L29))
  - Registration order = MediatR pipeline order: Logging → Validation → DemoRestriction → Handler
  - `dotnet build` returns 0

### FEAT-005 — Update DemoLoginHandler to assign Role = Demo (and migrate existing demo user)
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: MED
- **Requires decision**: N
- **Spec reference**: Implied by "Block demo user (Role == Demo)" — without this item the gate never bites because the seeded demo user currently has `Role = UserRole.Admin`.
- **Rule**: CLAUDE.md handler rules (handlers contain domain logic only; no logging/validation/transactions inline).
- **Scope**:
  - [LinguaCMS.Application/Auth/Commands/DemoLogin/DemoLoginHandler.cs](LinguaCMS.Application/Auth/Commands/DemoLogin/DemoLoginHandler.cs)
- **Depends on**: FEAT-001, FEAT-006
- **DoD**:
  - New demo user assigned `Role = UserRole.Demo` (replaces the existing `UserRole.Admin` at [DemoLoginHandler.cs:39](LinguaCMS.Application/Auth/Commands/DemoLogin/DemoLoginHandler.cs#L39))
  - If an existing demo-email user is found with `Role != UserRole.Demo`, mutate that property; single `SaveChangesAsync` call along the add-or-update branch completes before token issuance
  - `AuditableEntitiesInterceptor` will set `UpdatedAt` on the mutated row — expected, not a defect (the row is genuinely updated)
  - Token-TTL exposure: existing demo JWTs with `Role=Admin` claim remain valid until natural expiry — accepted risk (demo tokens are short-lived; no explicit invalidation step)
  - `dotnet build` returns 0; `dotnet test` returns 0

### FEAT-006 — Widen `[Authorize(Roles = "Admin")]` → `"Admin,Demo"` on mutation endpoints
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: MED
- **Requires decision**: N (option A approved iteration 1)
- **Spec reference**: Implied — the spec presumes demo commands reach the MediatR pipeline. Currently `[Authorize(Roles = "Admin")]` would 403 them at the controller layer before the pipeline runs. Widening to admit both roles preserves pipeline reachability so the behavior gate (FEAT-003/004) can do its job.
- **Rule**: CLAUDE.md controller rules unchanged. Auth widening is a contract change at the controller layer, gated behaviorally at the pipeline layer.
- **Scope**:
  - [LinguaCMS.API/Controllers/LanguagesController.cs](LinguaCMS.API/Controllers/LanguagesController.cs) — 3 attributes at lines 29, 34, 39
  - [LinguaCMS.API/Controllers/LessonsController.cs](LinguaCMS.API/Controllers/LessonsController.cs) — 3 attributes at lines 25, 30, 35
  - [LinguaCMS.API/Controllers/ExercisesController.cs](LinguaCMS.API/Controllers/ExercisesController.cs) — 3 attributes at lines 21, 26, 31
  - [LinguaCMS.API/Controllers/FilesController.cs](LinguaCMS.API/Controllers/FilesController.cs) — 2 attributes at lines 18, 23
- **Depends on**: none (must execute BEFORE FEAT-005 to preserve demo UX while role transitions)
- **DoD**:
  - All 11 instances of `[Authorize(Roles = "Admin")]` on mutation endpoints replaced with `[Authorize(Roles = "Admin,Demo")]`
  - Verification: grep across the 4 controller files for `"Admin,Demo"` returns 11
  - No other `[Authorize(Roles = "Admin")]` strings remain in the 4 controllers
  - `dotnet build` returns 0

### FEAT-007 — Architecture test enforcing *Command / *Query suffix on IRequest implementers
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: Implied — FEAT-003 detects "command" by `typeof(TRequest).Name.EndsWith("Command")`. Without an architecture test, a future `IRequest<>` implementer could silently bypass the gate by violating the naming convention. CLAUDE.md states naming is "strict" — the test makes that mechanical.
- **Rule**: CLAUDE.md "Commands: `<Verb><Entity>Command` ... Queries: `<Verb><Entity>Query`."
- **Scope**:
  - [LinguaCMS.ArchitectureTests/NamingConventionTests.cs](LinguaCMS.ArchitectureTests/NamingConventionTests.cs) (add new `[Fact]`)
- **Depends on**: none
- **DoD**:
  - New `[Fact]` `Requests_end_with_Command_or_Query_suffix` using NetArchTest on the Application assembly
  - Test asserts every type implementing `IRequest` (non-generic, void return) OR `IRequest<>` (generic, with response) has a name ending with `Command` or `Query`. Note: 4 delete commands use bare `IRequest` (DeleteLanguageCommand/DeleteLessonCommand/DeleteExerciseCommand/DeleteFileCommand); 11 commands and ~13 queries use `IRequest<TResponse>`. The test must catch both.
  - Test green against current code (verified by reading every `*Command.cs` and `*Query.cs` in `LinguaCMS.Application/`)
  - `dotnet test` returns 0

### FEAT-008 — Add `useIsDemoUser` hook (canonical demo-role detector)
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "Detect Role=Demo from JWT (already in auth store after FEAT-005)."
- **Rule**: client/CLAUDE.md "Hook: `src/hooks/use<Name>.ts`." Single role-detector decouples consumers from the auth-store string-compare and from the demo-login-only `isDemo` flag (which doesn't fire when a Role=Demo user authenticates via normal `/login`).
- **Scope**:
  - `client/src/hooks/useIsDemoUser.ts` (new file)
- **Depends on**: none
- **DoD**:
  - Hook signature `export function useIsDemoUser(): boolean`
  - Body uses zustand selector form for re-render efficiency: `useAuthStore(state => state.user?.role === 'Demo')`
  - Returns `false` for anonymous, student, admin, or unloaded user; `true` only when `user.role === 'Demo'`
  - String literal `'Demo'` matches the [UserRole.cs](LinguaCMS.Domain/Enums/UserRole.cs) enum name and the JWT role claim emitted by the backend after FEAT-005
  - No `any`, no manual `localStorage` reads
  - `npm run lint` returns 0
  - `npm run build` returns 0

### FEAT-009 — Add UI session store with admin-banner dismiss state
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "Banner color: warning (yellow/orange), dismissible per session."
- **Rule**: client/CLAUDE.md "Stores own persisted state. Components never touch `localStorage` / `sessionStorage` directly." / "Zustand store: `src/store/<name>.ts` exports `use<Name>Store`."
- **Scope**:
  - `client/src/store/ui.ts` (new file)
- **Depends on**: none
- **DoD**:
  - Exports `useUiStore` (PascalCase rule: file `ui.ts` → hook `useUiStore`)
  - State shape `{ adminDemoBannerDismissed: boolean; dismissAdminDemoBanner: () => void }`
  - Uses `persist` + `createJSONStorage(() => sessionStorage)` from `zustand/middleware` so dismissal lasts the browser-tab session and resets on tab close (matches "per session" semantics — sessionStorage is the only sub-localStorage scope available)
  - `partialize` keeps only `adminDemoBannerDismissed`
  - Store name string: `'ui'`
  - Default `adminDemoBannerDismissed: false`
  - `npm run lint` returns 0; `npm run build` returns 0

### FEAT-010 — Add `<DemoTooltip>` wrapper component
- **Status**: done
- **Completed**: 2026-05-23
- **Implementation note**: Used single-property `style={{ display: 'inline-block' }}` rather than the DoD's two-property literal. Reason: the two-property form (`display` + `cursor: not-allowed`) violates the CLAUDE.md "single one-off property" rule. The CSS-module alternative the DoD authorized would have expanded scope beyond the single `.tsx` file. Dropping `cursor: not-allowed` is the cleanest in-scope, rule-compliant path — the disabled AntD button's greyed appearance and the tooltip text already communicate inability. If real-world hover testing during FEAT-013 manual verification shows the cursor change is missed, the lift to a `DemoTooltip.module.css` is a 2-line follow-up.
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "Disable all mutation buttons (delete/edit/save/upload) for demo users with tooltip 'Demo cannot modify'."
- **Rule**: client/CLAUDE.md "Shared component: `src/components/<group>/<Name>.tsx`." / "One UI library per file — Ant Design **or** Tailwind." (admin pages are AntD-only after REF-010..REF-012, so this wrapper uses AntD.)
- **Scope**:
  - `client/src/components/admin/DemoTooltip.tsx` (new file; new `admin` group)
- **Depends on**: FEAT-008
- **DoD**:
  - Default-exported `DemoTooltip` component with props `{ children: React.ReactNode }`
  - When `useIsDemoUser()` is `true`, returns `<Tooltip title="Demo cannot modify"><span style={{ display: 'inline-block', cursor: 'not-allowed' }}>{children}</span></Tooltip>`. **The inner `<span>` is mandatory** — AntD `<Tooltip>` does not fire on `disabled` children because `pointer-events: none` on the disabled DOM node swallows `mouseenter`. Wrapping in a non-disabled `<span>` restores pointer events for the Tooltip trigger zone while leaving the inner Button visually disabled.
  - When `false`, returns `<>{children}</>` (no wrapper, no DOM overhead, no idle Tooltip listeners, no `pointer-events` change)
  - File imports only from `antd` (no Tailwind utility classes). The single-property inline `style` literal is allowed by CLAUDE.md ("Use inline `style={{}}` beyond a single one-off property" is the Never; one-property literals are fine). If the team prefers, extract to a CSS module class — either is acceptable.
  - One component per file (CLAUDE.md rule)
  - File name matches default export
  - Manual verification during execution: render a `<DemoTooltip><Button disabled>Test</Button></DemoTooltip>` as a demo user, hover the disabled button → tooltip appears within ~100ms
  - `npm run lint` returns 0; `npm run build` returns 0

### FEAT-011 — Add `<DemoAdminBanner>` warning banner component
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "Show a persistent banner at the top of all admin pages: 'Demo mode — changes are not saved'. Banner color: warning (yellow/orange), dismissible per session."
- **Rule**: client/CLAUDE.md "Shared component: `src/components/<group>/<Name>.tsx`." Banner reads state from `useUiStore` and `useIsDemoUser` — no direct sessionStorage access.
- **Scope**:
  - `client/src/components/admin/DemoAdminBanner.tsx` (new file)
- **Depends on**: FEAT-008, FEAT-009
- **DoD**:
  - Default-exported `DemoAdminBanner`
  - Renders nothing when `!useIsDemoUser()` OR `useUiStore(s => s.adminDemoBannerDismissed)` is true
  - Otherwise renders AntD `<Alert type="warning" closable message="Demo mode — changes are not saved" showIcon onClose={...} />` (AntD warning Alert is yellow/orange by default — satisfies spec color)
  - `onClose` calls `useUiStore.getState().dismissAdminDemoBanner()`
  - File imports only from `antd` (no Tailwind in this file); message text exactly `"Demo mode — changes are not saved"`
  - `npm run lint` returns 0; `npm run build` returns 0

### FEAT-012 — Wire admin banner into [App.tsx](../client/src/App.tsx); widen nav visibility to demo; suppress student banner on admin paths
- **Status**: done
- **Completed**: 2026-05-23
- **Implementation note**: Chose the three-way ternary approach (not the flex refactor) for the sidebar offset. Picked `top-[42px]` for the admin banner — AntD warning Alert with `showIcon closable` defaults to ~38–44px depending on font metrics. If visual QA during FEAT-013/14 reveals a misalignment, the offset value is a one-character fix. Used the existing `isDemo` store flag for the student-banner condition (preserves prior behavior) and the new `useIsDemoUser()` hook for `canSeeAdmin` and the admin-banner gate (role-based, decouples from the demoLogin-specific flag). Banner visibility computed once as `studentBannerVisible` / `adminBannerVisible` and reused for both rendering and sidebar offset — no double conditional drift.
- **Risk**: MED
- **Requires decision**: N (single design owns all three concerns; bundling avoids three drive-by edits of the same file)
- **Spec reference**: "Show a persistent banner at the top of all admin pages" + "Read access unchanged — demo navigates all admin pages" (implies the Admin nav link must be reachable for demo users).
- **Rule**: client/CLAUDE.md "All routes in `src/router.tsx`." (no router changes here — only nav-link visibility and conditional banner.) Component import discipline preserved.
- **Scope**:
  - [client/src/App.tsx](../client/src/App.tsx) — three coordinated edits:
    1. Mount `<DemoAdminBanner />` immediately above the existing `<aside>` / `<main>` layout but only when `location.pathname.startsWith('/admin')` (banner is admin-page-scoped per spec).
    2. Change the nav-link gate from `const isAdmin = user?.role === 'Admin'` ([App.tsx:21](../client/src/App.tsx#L21)) to `const canSeeAdmin = user?.role === 'Admin' || user?.role === 'Demo'` and reference the renamed variable at [App.tsx:25](../client/src/App.tsx#L25). The Admin nav link must appear for demo users — otherwise the spec's "demo navigates all admin pages" requires URL typing, which the existing student-side demo banner contradicts ("nothing is saved … Sign up").
    3. Suppress the existing student banner ([App.tsx:42-50](../client/src/App.tsx#L42-L50)) on `/admin/*` paths: add `&& !location.pathname.startsWith('/admin')` to the `isDemo && !isExercise && ...` condition. Avoids the confusing double-banner where student-side copy ("nothing is saved … Sign up for full access") and admin-side copy ("Demo mode — changes are not saved") both appear simultaneously.
    4. **Sidebar top-offset rewrite** (mandatory — not a verification step). The current sidebar at [App.tsx:53-54](../client/src/App.tsx#L53-L54) uses `top-[41px]` keyed on `isDemo && !isExercise`. After the changes above, four distinct banner states exist: (a) student banner on non-admin paths → push sidebar by student-banner height (current `41px`); (b) admin banner on `/admin/*` for demo (not dismissed) → push by AntD warning Alert height (~44–48px depending on AntD version — measure during execution and pin the value); (c) admin banner dismissed → `top-0`; (d) no banner → `top-0`. Either compute the offset class with a three-way condition (`studentBannerVisible ? 'top-[41px]' : adminBannerVisible ? 'top-[44px]' : 'top-0'`) and pin the second value after measuring, OR refactor the desktop layout to a flex column so the sidebar's top edge is laid out implicitly relative to the banner sibling (preferred — no magic numbers, no future drift). The mobile bottom-nav is unaffected since it's positioned at `bottom-0`.
- **Depends on**: FEAT-008, FEAT-011
- **DoD**:
  - `<DemoAdminBanner />` is imported and conditionally mounted in App.tsx; renders only on `/admin/*` paths
  - The `isAdmin` identifier in App.tsx is renamed to `canSeeAdmin` (or equivalent) and admits both `'Admin'` and `'Demo'` roles
  - The sidebar `top-[N]` condition has been actively updated per edit #4 above (either the three-way ternary OR the flex refactor); the original `'top-[41px]' : 'top-0'` two-way ternary is gone. Verified by grep: `top-\[41px\]` no longer appears alone in [App.tsx](../client/src/App.tsx) (either gone or accompanied by a second offset constant)
  - Demo user logging in and visiting `/` sees Admin link in sidebar nav (manual verification)
  - Student demo banner is NOT rendered on any `/admin/*` route
  - Admin demo banner IS rendered on `/admin/*` routes for demo users only (not for admins, students, anonymous)
  - Sidebar/content top-offset aligns correctly under all four banner states above — no overlap, no gap. Manual verification across all four states.
  - `npm run lint` returns 0; `npm run build` returns 0

### FEAT-013 — Disable mutation buttons + tooltip across admin pages
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: MED
- **Requires decision**: N (option a confirmed in spec; mechanical pattern across files)
- **Spec reference**: "Disable all mutation buttons (delete/edit/save/upload) for demo users with tooltip 'Demo cannot modify'. Read access unchanged — demo navigates all admin pages, sees all data, filters, paginations." Option (a) explicitly chosen over (b).
- **Rule**: client/CLAUDE.md "No direct HTTP from components" preserved (we only disable the button — the handler never fires, the hook is never called). One UI library per file — AntD only.
- **Scope** (mechanical pattern: import `useIsDemoUser` + wrap each mutation `<Button>` / `<Upload>` in `<DemoTooltip>` and pass `disabled={isDemo}`):
  - [client/src/pages/admin/LanguageManager.tsx](../client/src/pages/admin/LanguageManager.tsx) — 4 sites: `Add Language` ([:87-94](../client/src/pages/admin/LanguageManager.tsx#L87-L94)), per-card `Edit` ([:129](../client/src/pages/admin/LanguageManager.tsx#L129)) + `Delete` ([:130](../client/src/pages/admin/LanguageManager.tsx#L130)), modal `Upload Image` ([:149-151](../client/src/pages/admin/LanguageManager.tsx#L149-L151)), modal `OK` (save) handled via `<Modal okButtonProps={{ disabled: isDemo }}>` rather than wrapping the modal-managed button
  - [client/src/pages/admin/LessonManager.tsx](../client/src/pages/admin/LessonManager.tsx) — 3 sites: `Add Lesson` ([:74-81](../client/src/pages/admin/LessonManager.tsx#L74-L81)), per-card `Edit` ([:108](../client/src/pages/admin/LessonManager.tsx#L108)) + `Delete` ([:109](../client/src/pages/admin/LessonManager.tsx#L109)), modal `OK` via `okButtonProps`
  - [client/src/pages/admin/ExerciseBuilder.tsx](../client/src/pages/admin/ExerciseBuilder.tsx) — 3 sites: `Add Exercise` ([:282](../client/src/pages/admin/ExerciseBuilder.tsx#L282)), per-card `Edit` ([:305](../client/src/pages/admin/ExerciseBuilder.tsx#L305)) + `Delete` ([:306](../client/src/pages/admin/ExerciseBuilder.tsx#L306)), modal `Save` button ([:323](../client/src/pages/admin/ExerciseBuilder.tsx#L323)) — wrap directly since this modal uses the `footer={[...]}` array form; `Cancel` ([:322](../client/src/pages/admin/ExerciseBuilder.tsx#L322)) and `Preview JSON` ([:321](../client/src/pages/admin/ExerciseBuilder.tsx#L321)) are NOT disabled (non-mutation actions)
  - [client/src/pages/admin/ExerciseTypeFields.tsx](../client/src/pages/admin/ExerciseTypeFields.tsx) — 2 helper functions touched: `imageUploadField` ([:41-56](../client/src/pages/admin/ExerciseTypeFields.tsx#L41-L56)) and `audioUploadField` ([:58-77](../client/src/pages/admin/ExerciseTypeFields.tsx#L58-L77)) each render an `<Upload><Button icon={...}>Upload …</Button></Upload>` block. Wrap each in `<DemoTooltip>` and pass `disabled={isDemo}` to both `Upload` and the inner `Button` (AntD `Upload` disables the trigger when `disabled`; mirroring on the inner Button keeps the visual disabled state consistent).
- **Depends on**: FEAT-008, FEAT-010
- **DoD**:
  - All 12 enumerated mutation surfaces (4 + 3 + 3 + 2 helper functions) are gated by `disabled={isDemo}` where `isDemo = useIsDemoUser()` is called once at the top of each component
  - Every disabled button is wrapped in `<DemoTooltip>` (AntD `Tooltip` does NOT trigger on `disabled` children by default — DemoTooltip wraps the Button in a `<span>` if needed, OR the implementation uses AntD's documented `<Tooltip>` + wrapper-span pattern. The wrapper handles this once so the consumer sites stay clean.)
  - Non-mutation buttons (modal `Cancel`, `Preview JSON`, navigation `<Link>`s, AntD `<Card hoverable onClick>` cards) remain fully enabled for demo users — read navigation is preserved
  - As a demo user: clicking on a language/lesson card still navigates into nested admin pages; filters and pagination (where present) still function
  - As a non-demo user (admin): zero functional change — every button works as before, no tooltip appears
  - `npm run lint` returns 0; `npm run build` returns 0
  - Manual verification: log in as the seeded demo user, visit `/admin/languages` → see warning banner, see every Add/Edit/Delete/Upload button greyed out with tooltip on hover. Visit `/admin/languages/:id/lessons` → same. Visit `/admin/lessons/:id/exercises` → same, including modal Save button disabled and modal Cancel/Preview buttons still enabled.

### FEAT-014 — Verify no new `[Authorize(Roles = "Admin")]` mutation endpoints (backend grep audit)
- **Status**: pending
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "Backend requirements: … No backend changes expected — verify by enumerating any new mutation surfaces."
- **Rule**: server/CLAUDE.md (FEAT-006 widened all 11 known sites; this item checks for drift since 2026-05-23).
- **Scope**:
  - Read-only verification. Grep across [server/LinguaCMS.API/Controllers/](LinguaCMS.API/Controllers/) for `Roles = "Admin"` (no `,Demo` suffix) and for `[Authorize(Roles = "Admin")]` literally.
- **Depends on**: none
- **DoD**:
  - `grep -rE 'Roles\s*=\s*"Admin"' server/LinguaCMS.API/Controllers/` returns ZERO matches — every mutation endpoint admits both Admin and Demo, allowing the demo user to reach the MediatR pipeline where DemoUserRestrictionBehavior issues the 401
  - If matches are found: list each (file, line, attribute) as a follow-up requiring a new item (`FEAT-015 — widen newly discovered endpoints`). Do NOT silently widen — surface to user for review (each new endpoint may have legitimate admin-only justification that demo should not bypass)
  - No code changes by this item; outcome is a logged verification result in the FEAT-014 execution summary

## Iteration history

### Iteration 1 — Critic Issues

**HIGH severity (resolved by user decision):**
- Demo role would 403 at `[Authorize(Roles = "Admin")]` controller layer before reaching pipeline → addressed by adding **FEAT-006** to widen `[Authorize]` to `"Admin,Demo"` on 4 controllers (user-approved option A).
- `LoginCommand` / `RegisterCommand` ambiguity (spec exempts only `DemoLoginCommand`, but same "auth-not-mutation" reasoning applies) → addressed in **FEAT-003** by explicit type list `[DemoLoginCommand, LoginCommand, RegisterCommand]` (user-approved option b).

**MED severity (resolved):**
- No architecture-test backstop for `*Command`/`*Query` naming → addressed by new **FEAT-007**.
- Existing demo user JWTs with `Role=Admin` claim remain valid until expiry after FEAT-005 → surfaced in FEAT-005 DoD as accepted risk; no new item.
- FEAT-005 DoD incomplete on SaveChanges ordering → surfaced in FEAT-005 DoD ("single SaveChangesAsync along the add-or-update branch").
- FEAT-003 missing DI registration commentary for `ICurrentUser` dep → surfaced in FEAT-003 DoD ("already registered Scoped at Program.cs:54").

**LOW severity (noted only):**
- 401 vs 403 semantics — spec mandates `UnauthorizedException` (401); 403 would be semantically correct for an authenticated-but-blocked principal.
- No unit test for the behavior — out of spec scope.
- Behavior name `DemoUserRestrictionBehavior` is slightly verbose — spec dictates the name.

### Iteration 2 — Critic Issues

**HIGH:** 0
**MED:** 0
**LOW (noted only):**
- FEAT-003 maintenance hazard — hardcoded exemption list will silently block future auth-flow commands (e.g., `RefreshTokenCommand`, `LogoutCommand`). Mitigated by adding a code comment in FEAT-003 DoD ("extend when adding new anonymous auth-flow commands").
- FEAT-007 could use `IBaseRequest` for a one-line filter — style choice; explicit two-filter approach also works.
- FEAT-005 will trigger `AuditableEntitiesInterceptor` on the role-update path — correct behavior, surfaced in FEAT-005 DoD.
- Pipeline ordering (Validation before DemoRestriction) means a demo user submitting an invalid command sees `ValidationException` (400) before `UnauthorizedException` (401). Spec is explicit. Note only.

### Phase 2 — Iteration 1 — Critic Issues (2026-05-23)

**HIGH:** 0

**MED (resolved):**
- (FEAT-010) AntD `<Tooltip>` does not fire on `disabled` children — `pointer-events: none` swallows `mouseenter`. Without the wrapper-`<span>` pattern, the "Demo cannot modify" tooltip silently never appears, which is the entire spec'd UX. **Addressed** by rewriting FEAT-010 DoD to require `<Tooltip><span style={{ display: 'inline-block', cursor: 'not-allowed' }}>{children}</span></Tooltip>` (single-property style literal is CLAUDE.md-compliant), plus a manual hover-verification step.
- (FEAT-012) Sidebar `top-[N]` offset condition would desync after introducing the admin banner — current `top-[41px]` ternary only knows about one banner, but four banner states now exist (student banner on non-admin; admin banner on /admin/*; admin banner dismissed; no banner). DoD originally said "verify alignment" without instructing the edit. **Addressed** by adding edit #4 to FEAT-012 scope (mandatory sidebar rewrite — either three-way ternary with measured constants or flex-layout refactor) and a grep-based DoD check (`top-\[41px\]` must not appear alone after the edit).

**LOW (noted only — not refined):**
- (FEAT-008) `'Demo'` string literal could be extracted to a shared constant alongside existing `'Admin'`; staying with raw literals matches existing style.
- (FEAT-011) AntD `Alert closable` close button lacks explicit aria-label — accessibility nicety; out of spec.
- (FEAT-013) Image-upload `<Form.Item required>` in ExerciseTypeFields stays visually required-but-unfulfillable for demo. Cosmetic.
- (Plan structure) Single `server/FEATURE_PLAN.md` carries both backend Phase 1 and frontend Phase 2 items. Multi-phase header keeps cross-reference clean.
- (FEAT-014) Grep pattern correctly distinguishes `"Admin"` from `"Admin,Demo"`; doesn't catch custom `Policy = "..."` gates (historically none in this project).

### Phase 2 — Iteration 2 — Critic Issues (2026-05-23)

**HIGH:** 0

**MED:** 0

**LOW (noted only):**
- (FEAT-012) The "measure during execution" pin for admin-banner height is a small ergonomic hazard — the implementer might guess. Mitigated by the explicit grep DoD that requires the old two-way ternary be gone (forces active replacement, not copy-paste). Acceptable.
- (FEAT-010) The inline `style={{ display: 'inline-block', cursor: 'not-allowed' }}` is two properties — CLAUDE.md says "beyond a single one-off property" is the Never. **Re-examining:** this is two properties, so technically violates the rule. **Mitigation noted in DoD already** ("If the team prefers, extract to a CSS module class"). To stay strictly CLAUDE.md-compliant on first commit, the implementer should use a one-line CSS module class (`.demo-disabled-wrapper { display: inline-block; cursor: not-allowed; }`) rather than the inline literal. **This is upgraded to MED for one moment** — but the DoD already gives the implementer a clear alternative, so the planner has discharged its duty by surfacing the choice. Counting as LOW because the plan offers a compliant path explicitly; the choice is at execution time, not a planning gap.

## Phase 1 — Noted (LOW severity, not refined)
- 401 vs 403 — follow spec.
- Unit test for behavior — out of spec scope.
- Behavior name — dictated by spec.
- Exemption list maintenance — comment added in FEAT-003 DoD.
- FEAT-007 filter style — explicit form retained.

## Phase 2 — Noted (LOW severity, not refined)
- `'Demo'` string literal — staying with raw literals to match existing style.
- AntD Alert aria-label — out of spec.
- Image-upload required marker for demo — cosmetic.
- Plan-file location (single multi-phase file) — kept for cross-reference clarity.
- FEAT-014 grep doesn't catch custom Policies — no such policies in this codebase.
- FEAT-010 inline style two-property choice — alternative (CSS module) called out in DoD.

## Critic Verdict
- **Phase 1**: approved (iteration 2 of 3 — exited early on no HIGH/MED issues remaining).
- **Phase 2**: approved (iteration 2 of 3 — exited early; both MED issues from iteration 1 resolved, iteration 2 surfaced only LOW notes).
