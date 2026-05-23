# Feature Plan

Generated: 2026-05-24. Description: "Demo admin mode — users with Role=Demo see and use full admin UI exactly like a regular admin; backend wraps every demo-user mutation in a DB transaction that rolls back at request end; frontend shows persistent dismissible banner 'Demo mode — your changes are not saved' on every admin page. Backend uses a `DemoTransactionRollbackBehavior` pipeline behavior keyed off `ICurrentUser.IsInRole("Demo")`. Frontend detects Role=Demo, shows banner on /admin/*, leaves all buttons/forms enabled. Out of scope: read-side. Exempt: DemoLogin/Login/Register." Source CLAUDE.md: `server/CLAUDE.md`, `client/CLAUDE.md`.

## Summary
- Total items: 12
- Pending: 7 | Done: 5 | Blocked: 0 | Superseded: 0
- Items requiring user decision: 0
- Critic iterations: 3
- Critic verdict: approved (3 LOW notes only, no blockers)

## Discovery (2026-05-24)

Codebase scanned post-revert (commit 2525f30). Previous wrong-direction implementation (FEAT-001..FEAT-014: hard 401 block via `DemoUserRestrictionBehavior`, `DemoTooltip`, disabled buttons, `[Authorize(Roles="Admin,Demo")]`) has been fully reverted. Codebase is a clean slate for this new approach.

- **Related code found**:
  - `server/LinguaCMS.Domain/Enums/UserRole.cs` — enum has only `Student = 0`, `Admin = 1`. **No `Demo` value yet.**
  - `server/LinguaCMS.Domain/Interfaces/ICurrentUser.cs` — exposes `UserId`, `Role`, `IsAdmin`. No `IsDemo`.
  - `server/LinguaCMS.Infrastructure/Services/CurrentUser.cs` — reads `ClaimTypes.Role`, `IsAdmin = User?.IsInRole("Admin")`. Pattern is identical for `IsDemo`.
  - `server/LinguaCMS.Infrastructure/Services/JwtTokenService.cs:23` — issues `new Claim(ClaimTypes.Role, role)` where `role` is `user.Role.ToString()`. New `"Demo"` value will flow through naturally.
  - `server/LinguaCMS.Application/Auth/Commands/DemoLogin/DemoLoginHandler.cs:39` — **currently hardcodes `Role = UserRole.Admin` for the demo user.** Must change to `UserRole.Demo` so JWT contains `"Demo"` claim.
  - `server/LinguaCMS.Application/Common/Behaviors/` — contains `LoggingBehavior.cs`, `ValidationBehavior.cs`. No transaction behavior yet.
  - `server/LinguaCMS.API/Program.cs:28-29` — pipeline registration: `LoggingBehavior` → `ValidationBehavior` → handler. No existing transaction wiring.
  - `server/LinguaCMS.Data/AppDbContext.cs` — clean; no `BeginTransactionAsync` calls anywhere in the codebase (verified by grep). EF Core + Npgsql supports nested-safe `BeginTransactionAsync` per scope.
  - **All mutation commands (15 total)**:
    - **Auth (3, exempt from rollback)**: `RegisterCommand`, `LoginCommand`, `DemoLoginCommand`.
    - **Languages (3)**: `CreateLanguageCommand`, `UpdateLanguageCommand`, `DeleteLanguageCommand`.
    - **Lessons (3)**: `CreateLessonCommand`, `UpdateLessonCommand`, `DeleteLessonCommand`.
    - **Exercises (3)**: `CreateExerciseCommand`, `UpdateExerciseCommand`, `DeleteExerciseCommand`.
    - **Files (2)**: `UploadFileCommand`, `DeleteFileCommand`.
    - **Progress (1)**: `SubmitProgressCommand`.
  - **Authorize(Roles) sites (11 across 5 controllers)**: `LanguagesController` (3), `LessonsController` (3), `ExercisesController` (3), `FilesController` (2). All currently `"Admin"`. `ProgressController` uses class-level `[Authorize]` with no role restriction (any authenticated user can submit progress — Demo already implicitly allowed).
  - `client/src/store/auth.ts` — already has `isDemo: boolean` in persisted state, set by `demoLogin()`. AuthResponse populates `user.role` (string) from backend. **No JWT decoding library needed** — role flows through AuthResponse.
  - `client/src/App.tsx:21` — `isAdmin = user?.role === 'Admin'` controls visibility of Admin nav item. Needs widening for `'Demo'`.
  - `client/src/App.tsx:42-49` — existing generic demo banner ("Sign up for full access") for student demo. Different from this feature's admin-mode banner; admin banner must be conditional on `/admin/*` path.
  - `client/src/pages/admin/*` — 4 admin pages (`AdminDashboard`, `LanguageManager`, `LessonManager`, `ExerciseBuilder`), all AntD-only. No banner mounts currently.
  - `client/src/router.tsx` — admin routes nested under `<App />`. Banner can mount once in `App.tsx` conditional on path, no per-page changes needed.
  - `client/src/api/generated/` — covers all admin mutation endpoints. Regen needed if backend OpenAPI surface changes (it won't for this feature — only enum value `Demo` is added; clients won't break).

- **Related items in existing plans**:
  - `server/REFACTOR_PLAN.md` — 29 items, 24 done, 5 superseded, 0 pending. None touch demo/role/pipeline/transactions.
  - `client/REFACTOR_PLAN.md` — 16 items, all done. None touch demo mode.
  - No prior `FEATURE_PLAN.md` at repo root (previous plan was reverted along with its code).

- **Probable conflicts or extensions**:
  - **`DemoLoginHandler` hardcodes Admin role** — must flip to `UserRole.Demo`. This changes the JWT role claim, and is the linchpin: without it, `ICurrentUser.IsInRole("Demo")` always returns false and the transaction behavior never engages.
  - **`isDemo` store flag vs `role === 'Demo'`** — the store already has an `isDemo` boolean set by the `demoLogin()` action. Going forward, role is the source of truth (it's in the JWT and survives reload). We'll derive demo state from `user?.role === 'Demo'` and stop relying on the separate `isDemo` flag. Keeping both is duplication and risks drift.
  - **File uploads are non-transactional** — `UploadFileCommand` writes to disk via `IFileStorage`. The DB transaction rolls back the `imageUrl` reference in the Lesson row, but the file itself is left on disk (orphaned). This is a known leak inherent to the "fake mutation" approach. Acceptable for a demo seat; flagging as a documented limitation (FEAT-011) rather than blocking the feature.
  - **`[Authorize(Roles="Admin")]` on all admin endpoints** — must broaden to `"Admin,Demo"`. 11 occurrences, mechanical change, same pattern → single item with all files in scope.
  - **Progress endpoints** — `ProgressController` is class-level `[Authorize]` (no role lock). Demo users CAN submit progress today. Their `SubmitProgressCommand` will now be wrapped by the transaction behavior so it rolls back. No controller change needed; behavior covers it.
  - **Validation runs before transaction** — current order `Logging → Validation → Handler`. The transaction behavior must be inserted AFTER validation (so we don't open a transaction for invalid input that would never reach the handler). Order: `Logging → Validation → DemoTransactionRollback → Handler`.

- **No related code found for**:
  - Any existing `DemoTransactionRollbackBehavior`, `DemoUserRestrictionBehavior`, `DemoTooltip`, `DemoAdminBanner`, `DemoModeBanner` — all clean after revert.
  - Any existing `BeginTransactionAsync` usage anywhere in `server/` — no conflicting transaction code.
  - Any `jwt-decode` import or manual JWT parsing in `client/` — none needed; role comes from `AuthResponse`.

## Clarification (2026-05-24)

Auto mode active. The spec is unusually well-defined (rollback approach, banner copy, scope boundaries, exemptions all named explicitly). The few remaining ambiguities are resolved below with documented assumptions. User can override any of these by editing this file before execution.

- **Q1: Where does the `Demo` role get assigned to a user?**
  Discovery context: `DemoLoginHandler` currently hardcodes `Role = UserRole.Admin`. The spec says "users with Role=Demo" — implies the role must be issued somewhere.
  Resolution: Change `DemoLoginHandler` to assign `Role = UserRole.Demo`. No other code path needs to issue Demo (it's the only entry point for demo-mode users; `Login`/`Register` continue to issue `Admin`/`Student` based on existing logic).

- **Q2: Does the transaction wrap ALL `IRequest` types or only `*Command` types?**
  Discovery context: Pipeline behaviors are generic over `TRequest`. Naming convention separates `*Command` (writes) from `*Query` (reads). Spec says queries are out of scope.
  Resolution: Wrap only requests whose `TRequest` type name ends with `Command` (cheap reflection check). Queries pass through untouched. Exempt list (by type): `RegisterCommand`, `LoginCommand`, `DemoLoginCommand` — bypassed via early return.

- **Q3: How is the banner mounted — per-page or once in the layout?**
  Discovery context: All admin routes are children of `<App />` in `router.tsx`. `App.tsx` already conditionally renders the existing generic demo banner.
  Resolution: Mount the admin-mode banner once in `App.tsx`, conditional on `useLocation().pathname.startsWith('/admin')` AND `user?.role === 'Demo'`. Dismissible via AntD `Alert closable`. No per-page changes.

- **Q4: Does the existing `isDemo` boolean in the auth store stay or get replaced?**
  Discovery context: `auth.ts` persists `isDemo` separately from `user.role`. The spec says "detect Role=Demo from JWT".
  Resolution: Derive demo state from `user?.role === 'Demo'`. Remove the separate `isDemo` flag from the store (and from any pages that read it) — single source of truth. This is a small store cleanup; bundle into the auth-store item.

- **Q5: Orphaned files from demo uploads — handle now or defer?**
  Discovery context: `UploadFileCommand` writes to disk; DB rolls back but file persists. Demo user gets "real" file path but DB doesn't keep the reference.
  Resolution: Defer cleanup to a separate documented limitation (FEAT-011). For a demo seat with bounded throughput this is acceptable. A janitor / TTL cleanup is out of scope for the initial feature.

- **Q6: Does the existing generic student-mode demo banner in `App.tsx:42-49` collide with the new admin-mode banner?**
  Discovery context: Existing banner appears for `isDemo && !isExercise` (any path except `/exercise/*`). New banner is for `/admin/*` paths.
  Resolution: They're complementary, not conflicting — on `/admin/*` paths the admin-mode banner shows; on student paths the existing banner shows. Both should not show simultaneously. We'll guard the existing banner with `!pathname.startsWith('/admin')` and let the admin banner own `/admin/*`. Different copy serves different intent.

## Items

### FEAT-001 — Add `Demo = 2` to `UserRole` enum
- **Status**: done
- **Completed**: 2026-05-24
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "users with Role=Demo"
- **Clarification reference**: Q1
- **Rule**: CLAUDE.md server — "Entities/Enums: singular noun"; domain enum lives in `<Sln>.Domain/Enums/`.
- **Scope**:
  - `server/LinguaCMS.Domain/Enums/UserRole.cs`
- **Depends on**: none
- **DoD**:
  - Enum has `Demo = 2` after `Admin = 1`.
  - `dotnet build` returns 0.
  - `dotnet test` (architecture tests) passes.

### FEAT-002 — Switch `DemoLoginHandler` to issue `UserRole.Demo` (including for pre-existing demo rows)
- **Status**: done
- **Completed**: 2026-05-24
- **Risk**: MED (was LOW — raised after Critique 1 HIGH#1: handler must also re-role the pre-existing demo user row, not just newly-created ones)
- **Requires decision**: N
- **Spec reference**: "users with Role=Demo" — and Discovery: `DemoLoginHandler:39` currently hardcodes `Admin`.
- **Clarification reference**: Q1
- **Rule**: CLAUDE.md server — handlers contain domain logic; auth commands exempt from transaction rollback (this handler is itself exempt).
- **Scope**:
  - `server/LinguaCMS.Application/Auth/Commands/DemoLogin/DemoLoginHandler.cs`
- **Depends on**: FEAT-001
- **DoD**:
  - In the `if (user == null)` branch: set `Role = UserRole.Demo` (replacing existing `UserRole.Admin`).
  - In the `else` branch (user found): if `user.Role != UserRole.Demo`, set `user.Role = UserRole.Demo;` and `await _db.SaveChangesAsync(ct);` BEFORE the progress-seeding step. This catches the case where a row was created by an older code path with `Role = Admin`.
  - JWT issued by handler contains `Role` claim = `"Demo"` for BOTH newly-created and pre-existing demo rows.
  - `dotnet build` returns 0; tests green.
  - Manual verification A: hit `/api/auth/demo` against a DB with NO demo row → row created with Role=Demo → JWT role=Demo.
  - Manual verification B: hit `/api/auth/demo` against a DB with an EXISTING demo row of Role=Admin → row re-roled in place to Demo → JWT role=Demo.
  - **Why this matters (rationale)**: without the re-role step, every environment that has ever served `/api/auth/demo` retains an Admin demo user. The `IsInRole("Demo")` check in the transaction behavior then fails for that user, the transaction never opens, and the demo user has real write access to the database — silently defeating the entire feature.

### FEAT-003 — Extend `ICurrentUser` with `IsDemo` and `HasAdminAccess` properties
- **Status**: done
- **Completed**: 2026-05-24
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "rolls back when `ICurrentUser.IsInRole("Demo")`" — the behavior reads demo state via `ICurrentUser`. Also enables FEAT-012 (read-side admin gate widening).
- **Rule**: CLAUDE.md server — domain interface in `<Sln>.Domain/Interfaces/`, impl in `<Sln>.Infrastructure/Services/`. Never touch `HttpContext.User` outside `CurrentUser`.
- **Scope**:
  - `server/LinguaCMS.Domain/Interfaces/ICurrentUser.cs`
  - `server/LinguaCMS.Infrastructure/Services/CurrentUser.cs`
- **Depends on**: FEAT-001
- **DoD**:
  - `ICurrentUser` exposes both:
    - `bool IsDemo { get; }`
    - `bool HasAdminAccess { get; }` — true when role grants admin-like read access (Admin or Demo); used by read handlers that should treat Demo as Admin-equivalent (see FEAT-012).
  - `CurrentUser.IsDemo => User?.IsInRole("Demo") ?? false;` (mirrors `IsAdmin` pattern).
  - `CurrentUser.HasAdminAccess => IsAdmin || IsDemo;` (composed; not duplicating claim reads).
  - `dotnet build` returns 0; tests green.

### FEAT-004 — Add `DemoTransactionRollbackBehavior` pipeline behavior
- **Status**: done
- **Completed**: 2026-05-24
- **Risk**: MED
- **Requires decision**: N
- **Spec reference**: "DemoTransactionRollbackBehavior pipeline behavior that wraps mutation handlers in a transaction and rolls back when `ICurrentUser.IsInRole("Demo")`"
- **Clarification reference**: Q2
- **Rule**: CLAUDE.md server — pipeline behavior in `<Sln>.Application/Common/Behaviors/`, file name `<Name>Behavior.cs`. Cross-cutting concerns (transactions) live only in `IPipelineBehavior<,>`. Handlers must NOT see transaction logic.
- **Scope**:
  - `server/LinguaCMS.Application/Common/Behaviors/DemoTransactionRollbackBehavior.cs`
- **Depends on**: FEAT-001, FEAT-003
- **DoD**:
  - New `DemoTransactionRollbackBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>` where `TRequest : notnull`.
  - Injects `AppDbContext` and `ICurrentUser`.
  - Early-return `await next()` when ANY of:
    - `!currentUser.IsDemo`, OR
    - `typeof(TRequest).Name` does not end with `"Command"` (queries pass through), OR
    - `typeof(TRequest).Name` ∈ `{ "RegisterCommand", "LoginCommand", "DemoLoginCommand" }` (auth exempt — declared as a `static readonly HashSet<string>` constant in the behavior), OR
    - `_db.Database.CurrentTransaction != null` (nested behavior invocation — pass through; EF Core throws on nested `BeginTransactionAsync`). This guard is added per Critique 1 MED#3: defensive against any future handler that uses `IMediator.Send` to chain commands; no current handler does this, but the guard costs nothing and prevents a latent 500.
  - Otherwise: `await using var tx = await _db.Database.BeginTransactionAsync(ct);` → `var response = await next();` → `await tx.RollbackAsync(ct);` → `return response;`. On exception thrown by `next()`, propagate (the `await using` will dispose/rollback the transaction).
  - File contains exactly one public type, matching file name.
  - Architecture test compatibility: `NamingConventionTests.Pipeline_behaviors_end_with_Behavior_suffix` (`NamingConventionTests.cs:33`) matches `Behavior(`\d+)?$`, which accepts the runtime generic name `DemoTransactionRollbackBehavior\`2`. Verified — no test change needed.
  - `dotnet build` returns 0.
  - `dotnet test` (architecture tests including naming convention for `*Behavior`) passes.

### FEAT-005 — Register `DemoTransactionRollbackBehavior` in pipeline
- **Status**: done
- **Completed**: 2026-05-24
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "pipeline behavior that wraps mutation handlers"
- **Rule**: CLAUDE.md server — `Pipeline order: LoggingBehavior → ValidationBehavior → others → Handler`. Insert AFTER validation so invalid input never opens a transaction.
- **Scope**:
  - `server/LinguaCMS.API/Program.cs`
- **Depends on**: FEAT-004
- **DoD**:
  - `Program.cs` adds `builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(DemoTransactionRollbackBehavior<,>));` immediately after the `ValidationBehavior<,>` registration line.
  - `dotnet build` returns 0; tests green.

### FEAT-006 — Broaden `[Authorize(Roles="Admin")]` to `"Admin,Demo"` on admin endpoints
- **Status**: pending
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "all mutation endpoints accept their requests and return success"
- **Rule**: CLAUDE.md server — controllers contain only HTTP attributes + `IMediator.Send`. Attribute change only.
- **Scope** (11 occurrences, identical mechanical change — same operation, same pattern):
  - `server/LinguaCMS.API/Controllers/LanguagesController.cs` (3 sites: POST/PUT/DELETE)
  - `server/LinguaCMS.API/Controllers/LessonsController.cs` (3 sites: POST/PUT/DELETE)
  - `server/LinguaCMS.API/Controllers/ExercisesController.cs` (3 sites: POST/PUT/DELETE)
  - `server/LinguaCMS.API/Controllers/FilesController.cs` (2 sites: POST upload, DELETE)
- **Depends on**: FEAT-001
- **DoD**:
  - All 11 `[Authorize(Roles = "Admin")]` attributes become `[Authorize(Roles = "Admin,Demo")]`.
  - Grep confirms zero remaining `Roles = "Admin"` (sole exception: leave class-level inspection — there are none at class scope today).
  - `dotnet build` returns 0; tests green.
  - Manual: with a Demo JWT, hit POST `/api/languages` and receive 200 (not 401/403).

### FEAT-007 — Regenerate frontend API client to surface new `Demo` enum value
- **Status**: pending
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "detect Role=Demo from JWT" — role is part of generated `UserDto`.
- **Rule**: CLAUDE.md client — "If a backend type is missing on the frontend, regenerate — do not transcribe." Generated output is read-only.
- **Scope**:
  - `client/src/api/generated/` (regenerated wholesale; do not hand-edit)
- **Depends on**: FEAT-001 (backend enum change must be live for swagger.json to emit `Demo`)
- **DoD**:
  - Backend is running locally on `VITE_API_URL`.
  - `cd client && npm run generate-api` completes without errors.
  - Diff in `src/api/generated/` shows `Demo` added to the `Role` enum / string union (or `role` remains a bare `string` if OpenAPI emits it that way — either way, `'Demo'` is a valid value).
  - `npm run lint` and `npm run build` (`tsc -b && vite build`) both pass.

### FEAT-008 — Derive demo state from role in auth store; remove standalone `isDemo` flag
- **Status**: pending
- **Risk**: MED (was LOW — raised after Critique 1 MED#1 scope ambiguity and MED#2 first-paint flicker)
- **Requires decision**: N
- **Spec reference**: "Frontend: detect Role=Demo from JWT" — single source of truth.
- **Clarification reference**: Q4
- **Rule**: CLAUDE.md client — stores own persisted state; one store per file; no `localStorage` outside the store. Generated output is read-only.
- **Scope (exact files — DO NOT touch others)**:
  - `client/src/store/auth.ts` — remove `isDemo` field from `AuthState`, store body, and `partialize`; also EXTEND `partialize` to persist `user` (the role is non-sensitive; the bearer token is already in localStorage). This fixes the first-paint flicker (Critique 1 MED#2).
  - `client/src/App.tsx` — replace `useAuthStore((s) => s.isDemo)` (or equivalent) with derivation `user?.role === 'Demo'`. Existing demo-banner conditional updates accordingly.
- **Out of scope (explicitly NOT touched)** — these reference `LanguageDto.isDemo` (a Language entity flag, **unrelated** to auth-session demo state):
  - `client/src/api/generated/models/LanguageDto.ts`
  - `client/src/api/generated/models/CreateLanguageRequest.ts`
  - `client/src/api/generated/models/UpdateLanguageRequest.ts`
  - `client/src/pages/student/LessonTree.tsx` (reads `language.isDemo`)
  - `client/src/pages/student/ExercisePlayer.tsx` (reads `language.isDemo`)
  - `client/src/pages/admin/LanguageManager.tsx` (CRUDs `language.isDemo`)
- **Depends on**: FEAT-007 (generated `UserDto.role` available)
- **DoD**:
  - `isDemo` removed from `AuthState` interface, from the store body (`set({ ..., isDemo: ... })` calls), and from the `partialize` selector. `partialize` becomes `(state) => ({ token: state.token, user: state.user })`.
  - All auth-store callsites of `isDemo` updated to derive from `user?.role === 'Demo'` (verified by grep returning zero remaining `useAuthStore(...).isDemo` references; only `LanguageDto.isDemo` references survive).
  - `npm run lint` and `npm run build` pass.
  - Manual A (first-paint flicker check): log in as demo, hard-refresh `/admin/languages`, confirm demo banner appears on the FIRST paint (no flicker window where admin UI is visible without the banner) — because `user` is now hydrated from persisted state synchronously, not awaited from `/api/auth/me`.
  - Manual B (state cleanup on logout): logout, confirm `localStorage.getItem('auth')` no longer contains `user`, confirm `/admin` redirects to `/login`.

### FEAT-009 — Create `DemoModeBanner` component
- **Status**: pending
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "persistent dismissible banner 'Demo mode — your changes are not saved' on every admin page"
- **Rule**: CLAUDE.md client — Component: `PascalCase`, file name == default export; one component per file. Admin pages use AntD exclusively; banner must too.
- **Scope**:
  - `client/src/components/admin/DemoModeBanner.tsx`
- **Depends on**: none (pure presentational)
- **DoD**:
  - Default-export `DemoModeBanner` renders AntD `<Alert type="warning" showIcon closable message="Demo mode — your changes are not saved" />`.
  - No props (or minimal optional `className`); component owns its dismissed state via `useState<boolean>(false)`, wired to `Alert.afterClose` to render `null` once closed.
  - No Tailwind utility classes in this file; AntD-only (per CLAUDE.md "one UI library per file").
  - `npm run lint` and `npm run build` pass.
  - **Dismissal-persistence note** (Critique 1 MED#4): Banner is mounted at `App.tsx` scope (parent of admin `<Outlet />` per FEAT-010). React Router swaps `<Outlet />` children on navigation but `App.tsx` stays mounted — therefore `useState` inside `DemoModeBanner` survives navigation between `/admin`, `/admin/languages`, `/admin/lessons/:id/exercises`, etc. A user who dismisses once does NOT see the banner reappear on the next admin sub-route. On logout, the auth gate in App.tsx unmounts the banner (via redirect to `/login`), naturally resetting state for the next session.

### FEAT-010 — Mount banner in `App.tsx` and widen admin nav for Demo role
- **Status**: pending
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "show banner on /admin/*" + "users with Role=Demo see and use full admin UI exactly like a regular admin" (implies admin nav must be visible to Demo users).
- **Clarification reference**: Q3, Q6
- **Rule**: CLAUDE.md client — all routes in `src/router.tsx`; no ad-hoc `<BrowserRouter>` in components; AntD-or-Tailwind per file (App.tsx already established).
- **Scope**:
  - `client/src/App.tsx`
- **Depends on**: FEAT-008 (role-based derivation + `user` persisted in store), FEAT-009 (banner component)
- **DoD**:
  - `App.tsx` reads `useLocation().pathname` and `user?.role`.
  - Path match: use `pathname === '/admin' || pathname.startsWith('/admin/')` (strict prefix, avoids matching a hypothetical `/administrator` — Critique 1 LOW note).
  - When the strict admin-path predicate is true AND `user?.role === 'Demo'` → render `<DemoModeBanner />` once above the routed `<Outlet />`.
  - Existing generic demo banner (currently lines 42–49) is guarded with the negation of the strict admin-path predicate, so the two banners never co-render. The generic banner's existing visibility condition (currently `isDemo && !isExercise`) is updated to `user?.role === 'Demo' && !isExercise && !isAdminPath` after FEAT-008's removal of the `isDemo` flag.
  - Admin nav item shown when `role === 'Admin' || role === 'Demo'` (was `role === 'Admin'` only).
  - `npm run lint` and `npm run build` pass.
  - Manual A (banner present on every admin sub-route): log in as demo, click "Admin" in nav, see new banner on `/admin`, `/admin/languages`, `/admin/languages/:id/lessons`, `/admin/lessons/:id/exercises`.
  - Manual B (dismissal persists across admin nav): on `/admin/languages`, dismiss banner. Navigate to `/admin/languages/:id/lessons` — banner stays dismissed (per FEAT-009 state survival).
  - Manual C (rollback works end-to-end): on `/admin/languages`, click "Create", fill form, submit. Lesson appears in list (session-visible). Refresh — lesson gone (DB rolled back by transaction behavior).
  - Manual D (no first-paint flicker): hard-refresh `/admin/languages` while logged in as demo; banner appears on the first paint (verifies FEAT-008's persisted-user fix).

### FEAT-012 — Widen read-side admin gate in `GetLanguagesHandler` to include Demo role
- **Status**: pending
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: "users with Role=Demo see and use full admin UI **exactly like a regular admin**" — implies same READ access, not just same write paths.
- **Rule**: CLAUDE.md server — handlers contain domain logic; current-user access via `ICurrentUser` only.
- **Scope** (verified by grep — only one read handler in `LinguaCMS.Application/` gates on `IsAdmin`):
  - `server/LinguaCMS.Application/Languages/Queries/GetLanguages/GetLanguagesHandler.cs` (line 24)
- **Depends on**: FEAT-003 (provides `HasAdminAccess`), FEAT-005 (the rollback behavior should be in place before demo users start exercising admin reads)
- **DoD**:
  - `GetLanguagesHandler.cs:24` changes from `if (!_currentUser.IsAdmin)` to `if (!_currentUser.HasAdminAccess)`.
  - Grep across `LinguaCMS.Application/` confirms zero remaining read-side handlers that branch on `_currentUser.IsAdmin` without also accepting Demo. (Current count: one — `GetLanguagesHandler`. If a future audit finds more, add to this item's scope.)
  - `dotnet build` returns 0; tests green.
  - Manual: log in as demo, hit `/api/languages`, response includes unpublished languages identically to an Admin call (same row count, same `isPublished:false` rows present).
  - Manual: from Admin Language Manager page, log in as demo (different session), confirm the same set of languages renders (no missing unpublished drafts).
  - **Why this matters (rationale)**: without it, the demo user lands on `/admin/languages` and sees a strictly smaller list than the Admin sees on the same page — visually obvious off-spec behavior. Mutation endpoints accept the demo user's writes (FEAT-006), but the reads they browse before mutating are filtered. The illusion "exactly like a regular admin" breaks at the first page load.

### FEAT-011 — Document file-upload orphan limitation for demo mode
- **Status**: pending
- **Risk**: LOW
- **Requires decision**: N
- **Spec reference**: Discovery-derived — `UploadFileCommand` writes to disk; transaction rollback leaves orphaned files.
- **Clarification reference**: Q5
- **Rule**: CLAUDE.md does not forbid one-line code comments for "non-obvious WHY". This is a non-obvious cross-cutting side effect.
- **Scope**:
  - `server/LinguaCMS.Application/Common/Behaviors/DemoTransactionRollbackBehavior.cs` (add a brief XML doc comment above the class summarizing scope + the known disk-leak limitation)
- **Depends on**: FEAT-004
- **DoD**:
  - Class has a 2–4 line XML doc comment naming: (a) when wrapping engages (Demo role + `*Command` minus auth exempt set), (b) the known limitation that `UploadFileCommand` writes to disk outside the DB transaction (orphan files acceptable for demo seat).
  - No behavioral code change.
  - `dotnet build` returns 0; tests green.

## Iteration history

### Iteration 1 — Draft
- FEAT-001: Add `Demo = 2` to `UserRole` enum
- FEAT-002: Switch `DemoLoginHandler` to issue `UserRole.Demo`
- FEAT-003: Extend `ICurrentUser` with `IsDemo` property
- FEAT-004: Add `DemoTransactionRollbackBehavior` pipeline behavior
- FEAT-005: Register `DemoTransactionRollbackBehavior` in pipeline
- FEAT-006: Broaden `[Authorize(Roles="Admin")]` to `"Admin,Demo"` on admin endpoints
- FEAT-007: Regenerate frontend API client to surface new `Demo` enum value
- FEAT-008: Derive demo state from role in auth store; remove standalone `isDemo` flag
- FEAT-009: Create `DemoModeBanner` component
- FEAT-010: Mount banner in `App.tsx` and widen admin nav for Demo role
- FEAT-011: Document file-upload orphan limitation for demo mode

### Critique 1 (2026-05-24)
- **HIGH**: FEAT-002 — handler `FirstOrDefaultAsync` returns pre-existing demo row as-is; if its `Role=Admin` from prior runs, JWT still issues "Admin" and the entire feature silently fails. Suggested: also re-role the existing row.
- **MED**: FEAT-008 — `isDemo` scope ambiguous; `LanguageDto.isDemo` is unrelated (Language entity flag). Naive grep would touch wrong files. Suggested: enumerate exact in-scope and out-of-scope files.
- **MED**: FEAT-008 — removing `isDemo` from `partialize` leaves `user` un-persisted; on hard refresh, banner doesn't render until `loadUser()` resolves (~50–300ms flicker). Suggested: also persist `user`.
- **MED**: FEAT-004 — no nested-transaction guard; theoretical (no current handler chains `IMediator.Send`) but cheap to add and future-proofs against EF's `BeginTransactionAsync` throw on nested transactions.
- **MED**: FEAT-009 — dismissal-persistence semantics unclear. Resolution: banner mounts at App scope (parent of `<Outlet />`), so `useState` survives child-route navigation by construction. Document this explicitly.
- **LOW**: FEAT-010 — `pathname.startsWith('/admin')` matches `/administrator/*`. None exist; suggest strict-prefix predicate anyway.
- **LOW**: FEAT-009 — `type="warning"` vs `"info"` is a taste call; either defensible. Spec doesn't pin it.
- **LOW**: FEAT-011 — XML doc comment treads CLAUDE.md "no comments by default" rule; falls inside the carve-out (non-obvious cross-cutting WHY).
- **LOW**: FEAT-007 — Demo enum-widening on TS side may break exhaustive `switch` arms; grep confirms none exist today.

### Iteration 2 — Refined

Addresses Critique 1 issues:
- **HIGH#1 (FEAT-002)** — DoD now requires the `else` (user-found) branch to re-role the row if `user.Role != UserRole.Demo` and SaveChangesAsync before issuing the token. Two manual verifications added (clean DB + pre-existing-row DB). Risk raised LOW → MED.
- **MED#1 (FEAT-008 scope ambiguity)** — Scope replaced with an explicit in-scope file list (`store/auth.ts`, `App.tsx`) and an explicit out-of-scope list naming the six `LanguageDto.isDemo` files that must NOT be touched. DoD pinned to grep returning zero remaining auth-store `isDemo` references.
- **MED#2 (FEAT-008 first-paint flicker)** — `partialize` now also persists `user`. Manual verification A added: hard-refresh `/admin/languages` and confirm banner on first paint. Risk raised LOW → MED.
- **MED#3 (FEAT-004 nested transaction guard)** — Added `_db.Database.CurrentTransaction != null` early-return clause to the behavior's bypass conditions. DoD updated to enumerate this guard. Also documented arch-test compatibility for the generic name suffix (`Behavior\`2`).
- **MED#4 (FEAT-009 dismissal persistence)** — DoD now explicitly notes that the banner mounts at App.tsx scope and that React Router child-route swaps preserve `App`'s `useState`, so dismissal persists across admin sub-routes naturally. Logout unmounts the banner (auth gate), resetting state next session.
- **LOW (FEAT-010 path match)** — Strict predicate `pathname === '/admin' || pathname.startsWith('/admin/')` adopted.
- **LOW (FEAT-009 alert type)** — Left as `"warning"`; spec gives no signal to override.
- **LOW (FEAT-011 doc comment)** — Kept; carve-out applies.
- **LOW (FEAT-007 switch arms)** — Already confirmed no exhaustive `switch (role)` exists; no follow-up needed.

Items unchanged from Iteration 1: FEAT-001, FEAT-003, FEAT-005, FEAT-006, FEAT-007, FEAT-011.
Items modified: FEAT-002 (Risk MED, expanded DoD), FEAT-004 (added nested guard, arch-test note), FEAT-008 (Risk MED, explicit in/out-of-scope, persist `user`), FEAT-009 (clarified dismissal persistence), FEAT-010 (strict path predicate, additional manual verifications).

### Critique 2 (2026-05-24)
- **HIGH**: none. Critique 1 HIGH#1 fully addressed.
- **MED**: missing item — `GetLanguagesHandler.cs:24` gates on `_currentUser.IsAdmin`, filtering non-admins to published languages only. After FEAT-002, demo users (`Role=Demo`, `IsAdmin=false`) would see fewer languages than Admin on the same admin page — breaks "exactly like a regular admin". Verified by grep: only one read handler in the codebase has this pattern. Suggested: add `HasAdminAccess` to `ICurrentUser` and a new FEAT-012 to update the handler.
- **LOW**: navigation edge — dismissal resets when user leaves `/admin/*` and returns (banner unmounts and remounts). Defensible; no DoD change.
- **LOW**: persisting `user` in localStorage exposes id/email/displayName/role. None are secrets; bearer token already there.
- **LOW**: no separate rollback logging; LoggingBehavior captures duration.
- **No-progress / diminishing-returns check**: Iteration 1 had 1H+4M+4L=9 issues; Iteration 2 has 0H+1M+4L=5. Strict reduction; auto-loop continues productively.

### Iteration 3 — Refined

Addresses Critique 2 issues:
- **MED (Read-side admin gate)** — Extended FEAT-003 to also expose `bool HasAdminAccess { get; }` (= `IsAdmin || IsDemo`). Added new **FEAT-012 — Widen read-side admin gate in `GetLanguagesHandler` to include Demo role**, depending on FEAT-003 and FEAT-005. Scope is the single handler line confirmed by grep; DoD includes a forward-looking grep clause to catch any future admin-gated reads. Total items: 11 → 12.
- **LOW (navigation edge)** — Acknowledged in critique log; no item change. Defensible behavior.
- **LOW (localStorage user)** — Acknowledged; no change needed.
- **LOW (rollback logging)** — Acknowledged; deferred to a future observability item if needed.

Items unchanged from Iteration 2: FEAT-001, FEAT-002, FEAT-004, FEAT-005, FEAT-006, FEAT-007, FEAT-008, FEAT-009, FEAT-010, FEAT-011.
Items modified: FEAT-003 (added `HasAdminAccess`).
Items added: FEAT-012.

### Critique 3 (2026-05-24)
- **HIGH**: none.
- **MED**: none. Critique 2's MED (`GetLanguagesHandler` read-gate) fully addressed by FEAT-003 (`HasAdminAccess`) + FEAT-012.
- **LOW**: FEAT-012's dep on FEAT-005 is over-cautious (sequencing preference, not a logical requirement) — outcome unchanged.
- **LOW**: item ordering in file is layer-grouped not strictly numeric (FEAT-012 listed before FEAT-011) — cosmetic, plan-feature's `Order by dependency` spec is respected.
- **LOW**: `HasAdminAccess` naming is one of several defensible choices.
- **Progression**: Iter1 9 → Iter2 5 → Iter3 3 issues. Strict monotonic; no halt condition triggered.

## Critic Verdict: approved

The plan is ready for execution. 12 atomic items, dependency-ordered, all DoDs mechanically checkable. The critic auto-loop exited cleanly on the third iteration with only LOW notes remaining — none warrant a refinement pass.
