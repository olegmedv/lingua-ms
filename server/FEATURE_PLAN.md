# Feature Plan

Generated: 2026-05-23. Source spec: "Block demo user (Role == Demo) from mutation commands. Use MediatR pipeline behavior DemoUserRestrictionBehavior in Application/Common/Behaviors/. Behavior checks if command is *Command (not *Query) and if ICurrentUser.IsInRole(\"Demo\"). If both true, throw UnauthorizedException with message 'Demo users cannot modify content'. Register after ValidationBehavior in Program.cs. Exempt DemoLoginCommand (auth, not business mutation)." Source CLAUDE.md: [server/CLAUDE.md](CLAUDE.md).

## Summary
- Total items: 7
- Pending: 5 | Done: 2 | Blocked: 0 | Superseded: 0
- Items requiring user decision: 0 (all decisions resolved during iteration 1)
- Critic iterations: 2
- Critic verdict: approved (only LOW notes after iteration 2)

## Execution order
FEAT-001 → FEAT-002 → FEAT-003 → FEAT-007 → FEAT-006 → FEAT-005 → FEAT-004. Each item is atomic (build green between commits). FEAT-006 deliberately lands before FEAT-005 so the demo user keeps reaching mutation endpoints after their role changes.

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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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

## Noted (LOW severity, not refined)
- 401 vs 403 — follow spec.
- Unit test for behavior — out of spec scope.
- Behavior name — dictated by spec.
- Exemption list maintenance — comment added in FEAT-003 DoD.
- FEAT-007 filter style — explicit form retained.

## Critic Verdict
**approved** (iteration 2 of 3 — exited early on no HIGH/MED issues remaining).
