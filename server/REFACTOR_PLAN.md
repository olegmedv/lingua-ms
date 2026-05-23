# Refactor Plan

Generated: 2026-05-23. Re-audited: 2026-05-23 (6th pass, post auditable-entities rule). Source: server/CLAUDE.md.

## Summary
- Total items: 29
- Pending: 6 | Done: 18 | Blocked: 0 | Superseded: 5
- Items requiring user decision: 6 (all already done/superseded — REF-024 / REF-026 / REF-029 pre-approved 2026-05-23)
- Ambiguous rules (not audited): 0
- Workflow rules out of audit scope: 10

## Pre-approvals (2026-05-23)
User pre-approved all open decisions to unblock the execute-plan loop:
- **REF-024**: Option B — custom model binder; empty-file check moves to FluentValidation validator on `UploadFileCommand`. Keeps `LinguaCMS.Application` free of `IFormFile` / ASP.NET types.
- **REF-025**: default approach — `GetDemoLanguageQuery` becomes `IRequest<LanguageDto>` (non-nullable); handler throws `NotFoundException`; middleware translates to 404. No alternatives existed.
- **REF-026**: UserStats **included** in full audit (no exemption). Migration defaults: `CreatedAt` via `HasDefaultValueSql("now() at time zone 'utc'")`; `IsDeleted` via `HasDefaultValue(false)`; `UpdatedAt` / `DeletedAt` nullable, no default.
- **REF-027**: `SaveChangesInterceptor` in `LinguaCMS.Data/Interceptors/`; `IAuditable` marker interface in `LinguaCMS.Domain/Interfaces/`; remove all manual `CreatedAt = DateTime.UtcNow` from handlers and Program.cs seeding.
- **REF-028**: soft delete pattern `entity.IsDeleted = true; entity.DeletedAt = DateTime.UtcNow;` in all three delete handlers; no `_db.Remove()` calls remain.
- **REF-029**: `HasQueryFilter(x => !x.IsDeleted)` on all six user-facing entity configurations (including UserStats).

## Re-audit notes (2026-05-23, 6th pass)
- CLAUDE.md gained one new code-shape rule in commit `ecfafb9`: **Auditable entities** — user-facing persisted entities must declare `CreatedAt` / `UpdatedAt` / `IsDeleted` / `DeletedAt`; `CreatedAt`/`UpdatedAt` are maintained by a single `SaveChanges` interceptor in `LinguaCMS.Data` (handlers never set them manually); deletes are soft (`entity.IsDeleted = true; entity.DeletedAt = DateTime.UtcNow;` — never `_db.Remove()` / `_db.RemoveRange()`); every entity's EF configuration calls `HasQueryFilter(x => !x.IsDeleted)`; lookup entities are exempted with a comment in the configuration.
- Per-entity audit against the new rule (every file in [LinguaCMS.Domain/Entities/](LinguaCMS.Domain/Entities/)):
  - [AppUser.cs](LinguaCMS.Domain/Entities/AppUser.cs) — has `CreatedAt`; missing `UpdatedAt`, `IsDeleted`, `DeletedAt`.
  - [Language.cs](LinguaCMS.Domain/Entities/Language.cs) — has `CreatedAt`; missing `UpdatedAt`, `IsDeleted`, `DeletedAt`.
  - [Lesson.cs](LinguaCMS.Domain/Entities/Lesson.cs) — has `CreatedAt`; missing `UpdatedAt`, `IsDeleted`, `DeletedAt`.
  - [Exercise.cs](LinguaCMS.Domain/Entities/Exercise.cs) — no audit fields at all.
  - [LessonProgress.cs](LinguaCMS.Domain/Entities/LessonProgress.cs) — has `CompletedAt` (semantically distinct from `CreatedAt`); no `CreatedAt`, `UpdatedAt`, `IsDeleted`, `DeletedAt`.
  - [UserStats.cs](LinguaCMS.Domain/Entities/UserStats.cs) — no audit fields. Borderline classification: `SubmitProgressHandler` mutates it on every progress submission, so it IS user-modified (not lookup data). Recommended: include in full audit; alternative is to declare exemption with a comment as a denormalized aggregate. Decision required.
- No `SaveChangesInterceptor` / `ISaveChangesInterceptor` implementation exists anywhere in the solution. `RegisterHandler`, `CreateLanguageHandler`, `CreateLessonHandler`, and the admin-seeding block in [Program.cs](LinguaCMS.API/Program.cs) all set `CreatedAt = DateTime.UtcNow` manually — once the interceptor lands, these manual assignments must be removed.
- Three delete handlers use hard delete: [DeleteLanguageHandler.cs:16](LinguaCMS.Application/Languages/Commands/DeleteLanguage/DeleteLanguageHandler.cs#L16) (`_db.Languages.Remove(lang)`), [DeleteLessonHandler.cs:16](LinguaCMS.Application/Lessons/Commands/DeleteLesson/DeleteLessonHandler.cs#L16) (`_db.Lessons.Remove(lesson)`), [DeleteExerciseHandler.cs:41](LinguaCMS.Application/Exercises/Commands/DeleteExercise/DeleteExerciseHandler.cs#L41) (`_db.Exercises.Remove(exercise)`). All three violate the soft-delete mandate.
- No EF configuration under [LinguaCMS.Data/Configurations/](LinguaCMS.Data/Configurations/) calls `HasQueryFilter(...)`. No exemption comments either.
- These violations are not independent — they cannot all be applied atomically (e.g., `HasQueryFilter(x => !x.IsDeleted)` won't compile until `IsDeleted` exists on the entity). They split per the skill's grouping rules into four items, with strict ordering: **add properties + migration (REF-026) → interceptor + remove manual sets (REF-027) → soft-delete handlers (REF-028) → query filters (REF-029)**.
- Re-verified the two pending items from the 5th pass: REF-024 ([FilesController.Upload](LinguaCMS.API/Controllers/FilesController.cs)) and REF-025 ([LanguagesController.GetDemo](LinguaCMS.API/Controllers/LanguagesController.cs)) still violate the controller-thinness rule. Quoted bodies unchanged from 5th-pass capture.
- Per-rule sweep of the remaining 15 code-shape rules — clean (no new violations beyond the new auditable-entities rule).
- One earlier audit had a (false) claim that `LinguaCMS.Infrastructure.csproj` was missing references to `LinguaCMS.Application` and `LinguaCMS.Data`. Re-checked: the CLAUDE.md graph "Infrastructure → Domain, Application, Data, ExternalServices.*.Providers" describes the *allowed* upstream set, not a required set. Current Infrastructure references only Domain — a subset of the allowed deps and no forbidden refs. Not a violation; not recorded as an item.
- IDs preserved: REF-001..REF-025. IDs issued: REF-026, REF-027, REF-028, REF-029.
- 0 items silently resolved between audits.

## Re-audit notes (2026-05-23, 5th pass)
- REF-023 verified done: `c.SupportNonNullableReferenceTypes()` present at [LinguaCMS.API/Program.cs:58](LinguaCMS.API/Program.cs#L58).
- Per-rule sweep of the 16 code-shape rules surfaced two violations of the "Controllers contain only `IMediator.Send(...)`" rule that prior audit passes missed:
  - `FilesController.Upload` performs empty-file validation and `IFormFile.OpenReadStream()` extraction before the Send call.
  - `LanguagesController.GetDemo` performs null-to-NotFound translation after the Send call (handler returns `LanguageDto?`; controller maps null → 404).
- Why missed earlier: REF-016 audited `LanguagesController` only for the `User.IsInRole` issue in `GetAll`; the `GetDemo` body was outside its scope. REF-018 audited the file-handling refactor focused on `ExercisesController.Delete` and the `IFileStorage` introduction; `FilesController.Upload`'s validation/binding logic was not enumerated in REF-018 DoD.
- These are violations of an **existing** rule, not a new rule. Per the skill rules (same rule + different fix per file → N items), they become two separate items: REF-024 (Files/Upload) and REF-025 (Languages/GetDemo).
- IDs preserved: REF-001..REF-023. IDs issued: REF-024, REF-025.
- 0 items silently resolved between audits.

## Re-audit notes (2026-05-23, 4th pass)
- CLAUDE.md gained one new code-shape rule in commit `ab7c124`: **OpenAPI schema accuracy** — Swashbuckle must be configured to honor C# nullability annotations and `[Required]` attributes.
- Audited against the new rule: `LinguaCMS.API/Program.cs` calls `AddSwaggerGen(...)` but does **not** call `c.SupportNonNullableReferenceTypes()`. Without it, Swashbuckle emits every reference type as `nullable: true, required: false` regardless of C# annotations — exactly the "all-fields-optional schema drift" the rule prohibits.
- DTOs themselves are compliant: non-nullable references use `string` with `= string.Empty` defaults (`RegisterRequest`, `LoginRequest`, `AuthResponse`, `UserDto`, `LanguageDto`, `CreateLanguageRequest`, `UpdateLanguageRequest`, `LessonDto`, `CreateLessonRequest`, `UpdateLessonRequest`, `ExerciseDto`, `CreateExerciseRequest`, `UpdateExerciseRequest`, `ProgressDto`, `SubmitProgressRequest`, `StatsDto`, `UploadFileResponse`); nullable references use `string?`. The schema drift is purely a Swagger-config gap, not a DTO-annotation gap.
- 1 new code-shape violation → REF-023 issued. Highest pre-existing ID was REF-022.
- All 22 existing items retain their status from the 2026-05-23 3rd-pass audit (17 done, 5 superseded). Per skill rules, done items are not re-checked.
- IDs preserved: REF-001..REF-022. IDs issued: REF-023.
- 0 items silently resolved between audits.

## Re-audit notes (2026-05-23, 3rd pass)
- All 22 existing items remain pending — verified one-by-one against current source.
- 0 items silently resolved between audits.
- 0 new code-shape violations discovered beyond REF-001..REF-022.
- IDs preserved: REF-001..REF-022.
- CLAUDE.md was tightened: both previously-ambiguous rules ("Cross-cutting only in behaviors" and "Catch exceptions to hide them") now have concrete wording. Ambiguous count: 2 → 0.
  - Cross-cutting is now enumerated as a closed set: logging, validation, authorization, transactions, caching.
  - Catch rule is now: "No empty `catch` blocks. No `catch (Exception)` outside `<Sln>.API/Middleware/`."
- Verified the new explicit cross-cutting rule against current handlers: no `ILogger<>`, `IValidator<>`, `.ValidateAsync()`, `BeginTransaction()`, or cache calls in any handler. Compliant — no new item needed.
- Verified the new explicit catch rule: the only catch-block offender is the empty catch in `DeleteExerciseHandler` (already REF-020). No `catch (Exception)` exists outside `LinguaCMS.API/Middleware/`. Compliant.
- REF-020's rule citation updated to reference the new concrete wording.
- Entities (`AppUser`, `Language`, `Lesson`, `Exercise`, `LessonProgress`, `UserStats`) remain clean — auto-properties with declarative initializers only.
- `LinguaCMS.Application/Extensions/QueryableExtensions.cs` remains a thin utility (single static `FirstOrNotFoundAsync`) — not a repository.

## Items

### REF-001 — Add Directory.Packages.props for central package management
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "Versions in `Directory.Packages.props`."
- **Scope**:
  - `Directory.Packages.props` (new file at server/)
  - `LinguaCMS.API/LinguaCMS.API.csproj`
  - `LinguaCMS.Application/LinguaCMS.Application.csproj`
  - `LinguaCMS.Domain/LinguaCMS.Domain.csproj`
  - `LinguaCMS.Infrastructure/LinguaCMS.Infrastructure.csproj`
- **Depends on**: none
- **DoD**:
  - `Directory.Packages.props` exists at server/ with `ManagePackageVersionsCentrally=true` and every `<PackageVersion>` referenced elsewhere
  - No `<PackageReference ... Version="..." />` attribute remains in any csproj
  - `dotnet build` returns 0

### REF-002 — Add Directory.Build.props with Nullable/ImplicitUsings/TreatWarningsAsErrors
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: HIGH
- **Requires decision**: Y
- **Rule**: "`Directory.Build.props` enables `Nullable` / `ImplicitUsings` / `TreatWarningsAsErrors`."
- **Scope**:
  - `Directory.Build.props` (new file at server/)
  - `LinguaCMS.API/LinguaCMS.API.csproj`
  - `LinguaCMS.Application/LinguaCMS.Application.csproj`
  - `LinguaCMS.Domain/LinguaCMS.Domain.csproj`
  - `LinguaCMS.Infrastructure/LinguaCMS.Infrastructure.csproj`
- **Depends on**: none
- **DoD**:
  - `Directory.Build.props` enables `Nullable=enable`, `ImplicitUsings=enable`, `TreatWarningsAsErrors=true`
  - Per-csproj `<Nullable>` and `<ImplicitUsings>` declarations removed (deduped)
  - `dotnet build` returns 0 (warnings, including nullable-reference warnings, may need to be fixed before turning on `TreatWarningsAsErrors` — split into a follow-up item if blocking)

### REF-003 — Create LinguaCMS.Data project; move AppDbContext + migrations; realign project references
- **Status**: done
- **Completed**: 2026-05-23
- **Re-audit note (2026-05-23)**: merged with REF-004 and REF-005. The original three-item split was unbuildable atomically (circular deps between REF-003 namespace change and REF-005 caller updates; migration usings also tied to the namespace, pulling REF-004 in). User approved merge.
- **Risk**: HIGH
- **Requires decision**: N
- **Rule**: "`<Sln>.Data` → Domain. `AppDbContext`, EF configurations, migrations, seeders." / "AppDbContext, EF configs, or migrations outside `<Sln>.Data`" (Never).
- **Scope**:
  - `LinguaCMS.Data/LinguaCMS.Data.csproj` (new)
  - `LinguaCMS.Data/AppDbContext.cs` (moved from `LinguaCMS.Infrastructure/Data/AppDbContext.cs`)
  - `LinguaCMS.sln` (add project)
  - `LinguaCMS.Infrastructure/LinguaCMS.Infrastructure.csproj` (remove EF/Npgsql refs once they belong to Data)
- **Depends on**: REF-001
- **DoD**:
  - `LinguaCMS.Data` project exists, targets net9.0, references `LinguaCMS.Domain` only
  - `AppDbContext` lives at `LinguaCMS.Data/AppDbContext.cs` with namespace `LinguaCMS.Data`
  - `LinguaCMS.Infrastructure/Data/` no longer exists
  - `dotnet build` returns 0 (callers temporarily allowed to reference Data via REF-005)

### REF-004 — Move migrations from LinguaCMS.Infrastructure to LinguaCMS.Data
- **Status**: superseded
- **Superseded by**: REF-003 (merged 2026-05-23 — migration namespaces are tied to AppDbContext's namespace, so the move must be atomic).
- **Risk**: MED
- **Requires decision**: N
- **Rule**: "Migration | `<Sln>.Data/Migrations/<auto>.cs`" / "AppDbContext, EF configs, or migrations outside `<Sln>.Data`" (Never).
- **Scope**:
  - `LinguaCMS.Data/Migrations/20260213061349_InitialCreate.cs`
  - `LinguaCMS.Data/Migrations/20260213061349_InitialCreate.Designer.cs`
  - `LinguaCMS.Data/Migrations/20260329202558_AddIsDemoToLanguage.cs`
  - `LinguaCMS.Data/Migrations/20260329202558_AddIsDemoToLanguage.Designer.cs`
  - `LinguaCMS.Data/Migrations/AppDbContextModelSnapshot.cs`
  - `LinguaCMS.Infrastructure/Migrations/*` (deleted)
- **Depends on**: REF-003
- **DoD**:
  - All migration files live under `LinguaCMS.Data/Migrations/` with namespace `LinguaCMS.Data.Migrations`
  - `LinguaCMS.Infrastructure/Migrations/` no longer exists
  - `dotnet ef migrations list -p LinguaCMS.Data -s LinguaCMS.API` shows both migrations
  - `dotnet build` returns 0

### REF-005 — Realign project references to CLAUDE.md dependency graph
- **Status**: superseded
- **Superseded by**: REF-003 (merged 2026-05-23 — caller using-directive updates and project-reference realignment are inseparable from the AppDbContext namespace change in REF-003).
- **Risk**: HIGH
- **Requires decision**: N
- **Rule**: "`<Sln>.Application` → Domain, Data." / "`<Sln>.Infrastructure` → Domain, Application, Data, `ExternalServices.*.Providers`." (Application currently references Infrastructure — inverted.)
- **Scope**:
  - `LinguaCMS.Application/LinguaCMS.Application.csproj`
  - `LinguaCMS.Infrastructure/LinguaCMS.Infrastructure.csproj`
  - `LinguaCMS.API/LinguaCMS.API.csproj`
  - Every `.cs` file currently `using LinguaCMS.Infrastructure.Data;` (all handlers in `LinguaCMS.Application/**` plus `Program.cs`) — update to `using LinguaCMS.Data;`
- **Depends on**: REF-003
- **DoD**:
  - `LinguaCMS.Application.csproj` references only `LinguaCMS.Domain` and `LinguaCMS.Data` (no Infrastructure ref)
  - `LinguaCMS.Infrastructure.csproj` references `LinguaCMS.Domain`, `LinguaCMS.Application`, `LinguaCMS.Data`
  - `LinguaCMS.API.csproj` references all four internal projects (Domain, Data, Application, Infrastructure)
  - `LinguaCMS.Domain.csproj` references nothing
  - `dotnet build` returns 0

### REF-006 — Extract inline EF configurations into per-entity Configuration classes
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "EF configuration | `<Sln>.Data/Configurations/<Entity>Configuration.cs`" + "Logic in controllers, entities, or EF configurations" (Never — keep configs declarative; move OnModelCreating fluent calls to per-entity classes).
- **Scope**:
  - `LinguaCMS.Data/Configurations/AppUserConfiguration.cs` (new)
  - `LinguaCMS.Data/Configurations/LanguageConfiguration.cs` (new)
  - `LinguaCMS.Data/Configurations/LessonConfiguration.cs` (new)
  - `LinguaCMS.Data/Configurations/ExerciseConfiguration.cs` (new)
  - `LinguaCMS.Data/Configurations/LessonProgressConfiguration.cs` (new)
  - `LinguaCMS.Data/Configurations/UserStatsConfiguration.cs` (new)
  - `LinguaCMS.Data/AppDbContext.cs` (`OnModelCreating` becomes `modelBuilder.ApplyConfigurationsFromAssembly(...)`)
- **Depends on**: REF-003
- **DoD**:
  - Six `IEntityTypeConfiguration<T>` classes exist, one per entity, in `LinguaCMS.Data/Configurations/`
  - `AppDbContext.OnModelCreating` contains only a single `ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly)` call
  - `dotnet ef migrations add NoOpAfterConfigExtraction` produces an empty migration (no schema drift) — then delete the empty migration
  - `dotnet build` returns 0

### REF-007 — Apply one-public-type-per-file across all multi-type source files
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "One public type per file." / "File name == primary public type name (exact casing)." / "Command record and Handler in same file" (Never).
- **Scope** (29 files; each is split so every public type lives in its own file named exactly after the type):
  - `LinguaCMS.Application/Exceptions/ApiExceptions.cs` → `NotFoundException.cs`, `ConflictException.cs`, `UnauthorizedException.cs`
  - `LinguaCMS.Application/Auth/Models/AuthDtos.cs` → `RegisterRequest.cs`, `LoginRequest.cs`, `AuthResponse.cs`, `UserDto.cs`
  - `LinguaCMS.Application/Languages/Models/LanguageDtos.cs` → `LanguageDto.cs`, `CreateLanguageRequest.cs`, `UpdateLanguageRequest.cs`
  - `LinguaCMS.Application/Lessons/Models/LessonDtos.cs` → `LessonDto.cs`, `CreateLessonRequest.cs`, `UpdateLessonRequest.cs`
  - `LinguaCMS.Application/Exercises/Models/ExerciseDtos.cs` → `ExerciseDto.cs`, `CreateExerciseRequest.cs`, `UpdateExerciseRequest.cs`
  - `LinguaCMS.Application/Progress/Models/ProgressDtos.cs` → `ProgressDto.cs`, `SubmitProgressRequest.cs`, `StatsDto.cs`
  - `LinguaCMS.Application/Auth/Commands/RegisterCommand.cs` → `RegisterCommand.cs` + `RegisterHandler.cs`
  - `LinguaCMS.Application/Auth/Commands/LoginCommand.cs` → `LoginCommand.cs` + `LoginHandler.cs`
  - `LinguaCMS.Application/Auth/Commands/DemoLoginCommand.cs` → `DemoLoginCommand.cs` + `DemoLoginHandler.cs`
  - `LinguaCMS.Application/Auth/Queries/GetMeQuery.cs` → `GetMeQuery.cs` + `GetMeHandler.cs`
  - `LinguaCMS.Application/Languages/Commands/CreateLanguageCommand.cs` → `+ CreateLanguageHandler.cs`
  - `LinguaCMS.Application/Languages/Commands/UpdateLanguageCommand.cs` → `+ UpdateLanguageHandler.cs`
  - `LinguaCMS.Application/Languages/Commands/DeleteLanguageCommand.cs` → `+ DeleteLanguageHandler.cs`
  - `LinguaCMS.Application/Languages/Queries/GetLanguagesQuery.cs` → `+ GetLanguagesHandler.cs`
  - `LinguaCMS.Application/Languages/Queries/GetLanguageByIdQuery.cs` → `+ GetLanguageByIdHandler.cs`
  - `LinguaCMS.Application/Languages/Queries/GetDemoLanguageQuery.cs` → `+ GetDemoLanguageHandler.cs`
  - `LinguaCMS.Application/Lessons/Commands/CreateLessonCommand.cs` → `+ CreateLessonHandler.cs`
  - `LinguaCMS.Application/Lessons/Commands/UpdateLessonCommand.cs` → `+ UpdateLessonHandler.cs`
  - `LinguaCMS.Application/Lessons/Commands/DeleteLessonCommand.cs` → `+ DeleteLessonHandler.cs`
  - `LinguaCMS.Application/Lessons/Queries/GetLessonsQuery.cs` → `+ GetLessonsHandler.cs`
  - `LinguaCMS.Application/Lessons/Queries/GetLessonByIdQuery.cs` → `+ GetLessonByIdHandler.cs`
  - `LinguaCMS.Application/Exercises/Commands/CreateExerciseCommand.cs` → `+ CreateExerciseHandler.cs`
  - `LinguaCMS.Application/Exercises/Commands/UpdateExerciseCommand.cs` → `+ UpdateExerciseHandler.cs`
  - `LinguaCMS.Application/Exercises/Commands/DeleteExerciseCommand.cs` → `DeleteExerciseCommand.cs` + `DeleteExerciseHandler.cs` + `DeleteExerciseResult.cs`
  - `LinguaCMS.Application/Exercises/Queries/GetExercisesQuery.cs` → `+ GetExercisesHandler.cs`
  - `LinguaCMS.Application/Progress/Commands/SubmitProgressCommand.cs` → `+ SubmitProgressHandler.cs`
  - `LinguaCMS.Application/Progress/Queries/GetMyProgressQuery.cs` → `+ GetMyProgressHandler.cs`
  - `LinguaCMS.Application/Progress/Queries/GetStatsQuery.cs` → `+ GetStatsHandler.cs`
- **Depends on**: none
- **DoD**:
  - Every `.cs` file under `LinguaCMS.Application/` contains exactly one public type
  - Every file name exactly matches its single public type name (e.g., `LanguageDto.cs` contains only `LanguageDto`)
  - Namespaces preserved (no consumer updates needed)
  - `dotnet build` returns 0

### REF-008 — Move every command/query into a per-verb subfolder
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "Command + Handler | `<Sln>.Application/<Entity>/Commands/<Verb><Entity>/<Verb><Entity>Command.cs` + `<Verb><Entity>Handler.cs`" / same for Query.
- **Scope** (22 verbs; each becomes its own subfolder containing the command/query file + handler file split out in REF-007):
  - `LinguaCMS.Application/Auth/Commands/Register/` (RegisterCommand.cs, RegisterHandler.cs)
  - `LinguaCMS.Application/Auth/Commands/Login/`
  - `LinguaCMS.Application/Auth/Commands/DemoLogin/`
  - `LinguaCMS.Application/Auth/Queries/GetMe/`
  - `LinguaCMS.Application/Languages/Commands/CreateLanguage/`
  - `LinguaCMS.Application/Languages/Commands/UpdateLanguage/`
  - `LinguaCMS.Application/Languages/Commands/DeleteLanguage/`
  - `LinguaCMS.Application/Languages/Queries/GetLanguages/`
  - `LinguaCMS.Application/Languages/Queries/GetLanguageById/`
  - `LinguaCMS.Application/Languages/Queries/GetDemoLanguage/`
  - `LinguaCMS.Application/Lessons/Commands/CreateLesson/`
  - `LinguaCMS.Application/Lessons/Commands/UpdateLesson/`
  - `LinguaCMS.Application/Lessons/Commands/DeleteLesson/`
  - `LinguaCMS.Application/Lessons/Queries/GetLessons/`
  - `LinguaCMS.Application/Lessons/Queries/GetLessonById/`
  - `LinguaCMS.Application/Exercises/Commands/CreateExercise/`
  - `LinguaCMS.Application/Exercises/Commands/UpdateExercise/`
  - `LinguaCMS.Application/Exercises/Commands/DeleteExercise/` (+ DeleteExerciseResult.cs from REF-007 stays here)
  - `LinguaCMS.Application/Exercises/Queries/GetExercises/`
  - `LinguaCMS.Application/Progress/Commands/SubmitProgress/`
  - `LinguaCMS.Application/Progress/Queries/GetMyProgress/`
  - `LinguaCMS.Application/Progress/Queries/GetStats/`
- **Depends on**: REF-007
- **DoD**:
  - For each verb V there exists a folder named V containing exactly `V<Entity>Command.cs` (or Query) and `V<Entity>Handler.cs`
  - No bare `*Command.cs`/`*Handler.cs` files remain directly under `<Entity>/Commands/` or `<Entity>/Queries/` (they live one level deeper)
  - Namespaces may stay flat (`...Commands.Register` is optional) — but if updated, every consumer using-statement is updated too
  - `dotnet build` returns 0

### REF-009 — Add FluentValidation + ValidationBehavior to MediatR pipeline
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: MED
- **Requires decision**: Y
- **Rule**: "MediatR + FluentValidation auto-scan via `AddMediatR` / `AddValidatorsFromAssembly`. No manual registration." / "Pipeline order: `LoggingBehavior` → `ValidationBehavior` → others → Handler."
- **Scope**:
  - `Directory.Packages.props` (add FluentValidation + FluentValidation.DependencyInjectionExtensions versions)
  - `LinguaCMS.Application/LinguaCMS.Application.csproj` (add `<PackageReference>`s without Version, per REF-001)
  - `LinguaCMS.Application/Common/Behaviors/ValidationBehavior.cs` (new)
  - `LinguaCMS.API/Program.cs` (call `AddValidatorsFromAssembly(typeof(RegisterCommand).Assembly)`; register `ValidationBehavior` after `LoggingBehavior`)
- **Depends on**: REF-001
- **Decision needed**: user must approve adding the FluentValidation NuGet package (per CLAUDE.md "Never add NuGet package without user approval"). User must also confirm whether existing manual checks (e.g., `ConflictException` for duplicate email) should remain or move into validators.
- **DoD**:
  - FluentValidation packages installed
  - `ValidationBehavior` throws `FluentValidation.ValidationException` (or aggregated via custom exception) when any validator fails
  - Pipeline registration order in Program.cs: `LoggingBehavior` → `ValidationBehavior` → Handler
  - `AddValidatorsFromAssembly` is called once over the Application assembly; no manual `services.AddScoped<IValidator<X>, ...>()` registrations exist
  - `dotnet build` returns 0

### REF-010 — Add LoggingBehavior pipeline behavior
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "Pipeline order: `LoggingBehavior` → `ValidationBehavior` → others → Handler. Cross-cutting only in behaviors." / "Pipeline behavior | `<Sln>.Application/Common/Behaviors/<Name>Behavior.cs`".
- **Scope**:
  - `LinguaCMS.Application/Common/Behaviors/LoggingBehavior.cs` (new)
  - `LinguaCMS.API/Program.cs` (register as first `IPipelineBehavior<,>`)
- **Depends on**: none (independent of REF-009; if REF-009 lands first, register before ValidationBehavior)
- **DoD**:
  - `LoggingBehavior<TRequest, TResponse>` implements `IPipelineBehavior<TRequest, TResponse>` and logs request name + duration via `ILogger<LoggingBehavior<TRequest, TResponse>>`
  - Registered in DI as the first pipeline behavior
  - `dotnet build` returns 0

### REF-011 — Add EFCore.NamingConventions + snake_case migration
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: HIGH
- **Requires decision**: Y
- **Rule**: "Snake_case DB via `EFCore.NamingConventions`. No `.ToTable()` / `.HasColumnName()` for casing."
- **Scope**:
  - `Directory.Packages.props` (add EFCore.NamingConventions)
  - `LinguaCMS.Data/LinguaCMS.Data.csproj` (add package ref)
  - `LinguaCMS.API/Program.cs` (chain `.UseSnakeCaseNamingConvention()` on `AddDbContext` options)
  - `LinguaCMS.Data/Migrations/<auto>_SnakeCaseRename.cs` (new — generated)
- **Depends on**: REF-001, REF-003
- **Decision needed**: user must approve the NuGet package add **and** the snake_case schema rename. Deployed databases will need to run the rename migration; the migration must `RENAME TABLE` and `RENAME COLUMN` rather than drop/recreate to preserve data.
- **DoD**:
  - `Microsoft.EntityFrameworkCore.UseSnakeCaseNamingConvention()` is configured
  - All entity configurations are free of any `.ToTable("...")` or `.HasColumnName("...")` calls that exist only to override casing
  - A new migration renames every PascalCase table/column to snake_case (e.g., `Languages` → `languages`, `IsPublished` → `is_published`)
  - `dotnet ef migrations script <previous> <new>` shows only `RENAME` operations, no destructive `DROP`
  - `dotnet build` returns 0

### REF-012 — Auth refactor: IJwtTokenService + ICurrentUser interfaces; thin AuthController (merged with REF-014, REF-015)
- **Status**: done
- **Completed**: 2026-05-23
- **Re-audit note (2026-05-23)**: merged with REF-014 and REF-015. The three items were inseparable: REF-012 deletes API/Services/JwtTokenService.cs but AuthController references it concretely (REF-015 scope); both JwtTokenService and CurrentUser need ASP.NET Core / JWT packages in Infrastructure that weren't part of any single item's scope. User approved merge.
- **Risk**: MED
- **Requires decision**: N
- **Rule**: "Domain interface | `<Sln>.Domain/Interfaces/I<Name>.cs`" / "Domain interface impl | `<Sln>.Infrastructure/Services/<Name>Service.cs`" / "Domain interface implementation outside `<Sln>.Infrastructure` or `<Sln>.ExternalServices.*.Providers`" (Never). JwtTokenService currently lives in `LinguaCMS.API/Services/` and is consumed by `AuthController` directly.
- **Scope**:
  - `LinguaCMS.Domain/Interfaces/IJwtTokenService.cs` (new)
  - `LinguaCMS.Infrastructure/Services/JwtTokenService.cs` (moved from `LinguaCMS.API/Services/JwtTokenService.cs`)
  - `LinguaCMS.API/Services/JwtTokenService.cs` (deleted; `Services/` folder removed if empty)
  - `LinguaCMS.API/Program.cs` (DI registration moved to an Infrastructure DI-extension or registered under the Infrastructure namespace)
- **Depends on**: REF-005
- **DoD**:
  - `IJwtTokenService` defined in `LinguaCMS.Domain/Interfaces/`
  - Implementation in `LinguaCMS.Infrastructure/Services/JwtTokenService.cs` injects `IConfiguration`
  - `LinguaCMS.API/Services/` directory no longer exists
  - `dotnet build` returns 0

### REF-013 — Move PasswordHasher to Infrastructure as IPasswordHasher implementation
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: Y
- **Rule**: "Domain interface | `<Sln>.Domain/Interfaces/I<Name>.cs`" / "Domain interface impl | `<Sln>.Infrastructure/Services/<Name>Service.cs`". `PasswordHasher` is currently a static utility in `LinguaCMS.Application/Common/` consumed by handlers and Program.cs seeding code; per the architecture it belongs to Infrastructure behind a domain interface.
- **Scope**:
  - `LinguaCMS.Domain/Interfaces/IPasswordHasher.cs` (new)
  - `LinguaCMS.Infrastructure/Services/PasswordHasher.cs` (moved + made non-static)
  - `LinguaCMS.Application/Common/PasswordHasher.cs` (deleted)
  - `LinguaCMS.Application/Auth/Commands/Register/RegisterHandler.cs`, `Login/LoginHandler.cs`, `DemoLogin/DemoLoginHandler.cs` (inject `IPasswordHasher`)
  - `LinguaCMS.API/Program.cs` (admin seeding uses injected `IPasswordHasher`; DI registration)
- **Depends on**: REF-005, REF-007, REF-008
- **Decision needed**: user must confirm the seeding-on-startup admin block in `Program.cs` should resolve `IPasswordHasher` from the service provider rather than keep the static helper (alternative: keep `PasswordHasher` as a `static` utility in `LinguaCMS.Infrastructure` and skip the interface — but that conflicts with the "domain interface impl in Infrastructure" pattern).
- **DoD**:
  - `IPasswordHasher` interface defined with `Hash(string)` and `Verify(string, string)`
  - Implementation registered as singleton in DI
  - No code references the old `LinguaCMS.Application.Common.PasswordHasher`
  - `dotnet build` returns 0

### REF-014 — Introduce ICurrentUser domain interface + Infrastructure implementation
- **Status**: superseded
- **Superseded by**: REF-012 (merged 2026-05-23 — Infrastructure needs ASP.NET Core access for IHttpContextAccessor, an unstated scope expansion; rolled into the auth refactor).
- **Risk**: MED
- **Requires decision**: N
- **Rule**: "Current user via `ICurrentUser` (domain interface, infra impl) reading `sub` claim. Never touch `HttpContext.User` in handlers/controllers." / "Read claims / `HttpContext` / env vars in handlers" (Never).
- **Scope**:
  - `LinguaCMS.Domain/Interfaces/ICurrentUser.cs` (new — exposes `UserId`, `Role`, `IsAdmin`)
  - `LinguaCMS.Infrastructure/Services/CurrentUser.cs` (new — reads `IHttpContextAccessor` and the `sub` / `NameIdentifier` claim)
  - `LinguaCMS.API/Program.cs` (registers `IHttpContextAccessor` + `ICurrentUser` scoped)
- **Depends on**: REF-005
- **DoD**:
  - `ICurrentUser` defined in Domain with no ASP.NET types
  - `CurrentUser` in Infrastructure depends only on `IHttpContextAccessor`
  - Registered in DI; resolvable from any handler
  - `dotnet build` returns 0

### REF-015 — Thin AuthController: move token generation & claim access into handlers
- **Status**: superseded
- **Superseded by**: REF-012 (merged 2026-05-23 — see REF-012 re-audit note).
- **Risk**: MED
- **Requires decision**: N
- **Rule**: "Controllers contain only `IMediator.Send(...)`, HTTP attributes, `ActionResult<T>` return." / "Never touch `HttpContext.User` in handlers/controllers."
- **Scope**:
  - `LinguaCMS.API/Controllers/AuthController.cs` (remove `JwtTokenService` dependency, claims access, post-Send mutation)
  - `LinguaCMS.Application/Auth/Commands/Register/RegisterHandler.cs` (inject `IJwtTokenService`; populate `AuthResponse.Token`)
  - `LinguaCMS.Application/Auth/Commands/Login/LoginHandler.cs` (same)
  - `LinguaCMS.Application/Auth/Commands/DemoLogin/DemoLoginHandler.cs` (same)
  - `LinguaCMS.Application/Auth/Queries/GetMe/GetMeQuery.cs` (drop `UserId` param; handler reads `ICurrentUser.UserId`)
  - `LinguaCMS.Application/Auth/Queries/GetMe/GetMeHandler.cs` (inject `ICurrentUser`)
- **Depends on**: REF-012, REF-014, REF-007, REF-008
- **DoD**:
  - `AuthController` constructor takes only `IMediator`; each action body is a single `_mediator.Send(...)` followed by `Ok(...)`
  - No `using System.Security.Claims` and no `User.FindFirstValue` in any controller file
  - `dotnet build` returns 0

### REF-016 — Thin LanguagesController: remove User.IsInRole; admin filter moves into handler
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "Controllers contain only `IMediator.Send(...)`, HTTP attributes, `ActionResult<T>` return." / "Never touch `HttpContext.User` in handlers/controllers."
- **Scope**:
  - `LinguaCMS.API/Controllers/LanguagesController.cs` (remove `User.IsInRole("Admin")` line)
  - `LinguaCMS.Application/Languages/Queries/GetLanguages/GetLanguagesQuery.cs` (drop the `IsAdmin` parameter)
  - `LinguaCMS.Application/Languages/Queries/GetLanguages/GetLanguagesHandler.cs` (inject `ICurrentUser` and apply admin filter internally)
- **Depends on**: REF-014, REF-007, REF-008
- **DoD**:
  - `LanguagesController.GetAll` body is a single `Ok(await _mediator.Send(new GetLanguagesQuery()))`
  - No `User.*` access in `LanguagesController`
  - `dotnet build` returns 0

### REF-017 — Thin ProgressController: drop UserId param; handlers use ICurrentUser
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "Controllers contain only `IMediator.Send(...)`, HTTP attributes, `ActionResult<T>` return." / "Never touch `HttpContext.User` in handlers/controllers."
- **Scope**:
  - `LinguaCMS.API/Controllers/ProgressController.cs` (remove `UserId` getter and all `User.FindFirstValue` access)
  - `LinguaCMS.Application/Progress/Commands/SubmitProgress/SubmitProgressCommand.cs` (drop `UserId`)
  - `LinguaCMS.Application/Progress/Commands/SubmitProgress/SubmitProgressHandler.cs` (inject `ICurrentUser`)
  - `LinguaCMS.Application/Progress/Queries/GetMyProgress/GetMyProgressQuery.cs` (drop `UserId`)
  - `LinguaCMS.Application/Progress/Queries/GetMyProgress/GetMyProgressHandler.cs` (inject `ICurrentUser`)
  - `LinguaCMS.Application/Progress/Queries/GetStats/GetStatsQuery.cs` (drop `UserId`)
  - `LinguaCMS.Application/Progress/Queries/GetStats/GetStatsHandler.cs` (inject `ICurrentUser`)
- **Depends on**: REF-014, REF-007, REF-008
- **DoD**:
  - `ProgressController` has no `User.*` access and no `UserId` helper
  - `dotnet build` returns 0

### REF-018 — File handling refactor: IFileStorage, thin ExercisesController.Delete, mediator-based FilesController (merged with REF-019)
- **Status**: done
- **Completed**: 2026-05-23
- **Re-audit note (2026-05-23)**: merged with REF-019. Both items share the IFileStorage interface and benefit from a single atomic introduction; user approved merge.
- **Risk**: MED
- **Requires decision**: Y
- **Rule**: "Controllers contain only `IMediator.Send(...)`, HTTP attributes, `ActionResult<T>` return." / "Logic in controllers, entities, or EF configurations" (Never).
- **Scope**:
  - `LinguaCMS.API/Controllers/ExercisesController.cs` (remove `IWebHostEnvironment` dependency and the post-Send file-deletion loop)
  - `LinguaCMS.Domain/Interfaces/IFileStorage.cs` (new — abstracts the local uploads directory)
  - `LinguaCMS.Infrastructure/Services/LocalFileStorage.cs` (new — depends on `IWebHostEnvironment` or `IHostEnvironment` + path config)
  - `LinguaCMS.Application/Exercises/Commands/DeleteExercise/DeleteExerciseHandler.cs` (inject `IFileStorage`; perform deletes inside the handler; drop the `DeleteExerciseResult`)
  - `LinguaCMS.Application/Exercises/Commands/DeleteExercise/DeleteExerciseResult.cs` (deleted — no longer needed)
- **Depends on**: REF-005, REF-007, REF-008
- **Decision needed**: user must approve the `IFileStorage` shape (paths, error semantics) and confirm Infrastructure may take a transitive ASP.NET Core dep on `IWebHostEnvironment` (alternative: pass the uploads root via `IOptions<UploadsOptions>` and avoid ASP.NET in Infrastructure).
- **DoD**:
  - `ExercisesController.Delete` body is a single `_mediator.Send(...)` followed by `NoContent()`
  - `ExercisesController` constructor takes only `IMediator`
  - File deletion happens entirely inside the handler
  - `dotnet build` returns 0

### REF-019 — Refactor FilesController to mediator-based commands with typed responses
- **Status**: superseded
- **Superseded by**: REF-018 (merged 2026-05-23 — share IFileStorage; atomic introduction is cleaner).
- **Risk**: HIGH
- **Requires decision**: Y
- **Rule**: "Controllers contain only `IMediator.Send(...)`, HTTP attributes, `ActionResult<T>` return." / "Controller action that doesn't dispatch through `IMediator`" (Never). / "`dynamic` / `object` / untyped dictionaries on API boundaries" (Never — `ActionResult<object>` violates). / "Logic in controllers, entities, or EF configurations" (Never).
- **Scope**:
  - `LinguaCMS.API/Controllers/FilesController.cs` (rewrite as thin mediator dispatch)
  - `LinguaCMS.Application/Files/Commands/UploadFile/UploadFileCommand.cs` + `UploadFileHandler.cs` (new)
  - `LinguaCMS.Application/Files/Commands/DeleteFile/DeleteFileCommand.cs` + `DeleteFileHandler.cs` (new)
  - `LinguaCMS.Application/Files/Models/UploadFileResponse.cs` (new — replaces anonymous `{ url }`)
  - `LinguaCMS.Application/Files/Models/UploadFileRequest.cs` (new — wraps `IFormFile` or stream + extension)
  - `IFileStorage` (reused from REF-018 if landed)
- **Depends on**: REF-005, REF-018
- **Decision needed**: user must approve treating "Files" as an entity area in Application (no DB entity exists today). Alternative: keep file IO in Infrastructure-only service and have a single dedicated `IFileStorageService` invoked from a controller — but that still requires removing the bare-`object` return and dispatching through MediatR per the rule.
- **DoD**:
  - `FilesController` constructor takes only `IMediator`
  - Upload action returns `ActionResult<UploadFileResponse>` (not `ActionResult<object>`)
  - Delete action returns `ActionResult` (not `IActionResult`) and dispatches through MediatR
  - No `System.IO.File` or `Directory` access in any controller
  - `dotnet build` returns 0

### REF-020 — Remove silent catch in DeleteExerciseHandler
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "No empty `catch` blocks. No `catch (Exception)` outside `<Sln>.API/Middleware/`. Let middleware handle global error translation." (Never)
- **Scope**:
  - `LinguaCMS.Application/Exercises/Commands/DeleteExercise/DeleteExerciseHandler.cs` (the `catch { /* ignore parse errors */ }` block, currently line 37 of `DeleteExerciseCommand.cs` before split)
- **Depends on**: REF-007, REF-008 (so the file path stabilises)
- **DoD**:
  - The empty catch block is removed; if `JsonDocument.Parse` failure must be tolerated, narrow to `catch (JsonException)` and re-throw as a domain exception (or just propagate so the middleware returns 500)
  - No `catch { }` remains in the file
  - `dotnet build` returns 0

### REF-021 — Add explicit [FromBody] to controller body parameters
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "All endpoints typed end-to-end. Strongly-typed `[FromBody]` Request, explicit `ActionResult<TResponse>`."
- **Scope**:
  - `LinguaCMS.API/Controllers/AuthController.cs` (Register, Login)
  - `LinguaCMS.API/Controllers/LanguagesController.cs` (Create, Update)
  - `LinguaCMS.API/Controllers/LessonsController.cs` (Create, Update)
  - `LinguaCMS.API/Controllers/ExercisesController.cs` (Create, Update)
  - `LinguaCMS.API/Controllers/ProgressController.cs` (Submit)
- **Depends on**: none (does not conflict with REF-015–REF-019)
- **DoD**:
  - Every action method parameter typed as a `*Request` DTO is decorated `[FromBody]`
  - `dotnet build` returns 0

### REF-022 — Create LinguaCMS.ArchitectureTests project with NetArchTest assertions
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: MED
- **Requires decision**: Y
- **Rule**: "Enforce via `NetArchTest`, not via review." (Implies an executable, asserting architecture rules; today no tests project exists.)
- **Scope**:
  - `LinguaCMS.ArchitectureTests/LinguaCMS.ArchitectureTests.csproj` (new — xUnit + NetArchTest.Rules)
  - `LinguaCMS.ArchitectureTests/ProjectDependencyTests.cs` (asserts each project's allowed/forbidden references match the CLAUDE.md table)
  - `LinguaCMS.ArchitectureTests/NamingConventionTests.cs` (Command/Query/Handler/Validator/Behavior/Controller suffixes)
  - `LinguaCMS.ArchitectureTests/ControllerRulesTests.cs` (controllers depend only on `IMediator` — no `IWebHostEnvironment`, no `System.IO`)
  - `LinguaCMS.ArchitectureTests/EntityRulesTests.cs` (entities have no methods / no constructors with params / no expression-bodied members)
  - `LinguaCMS.ArchitectureTests/DataLocationTests.cs` (`AppDbContext`, EF configs, migrations all live in `LinguaCMS.Data`)
  - `LinguaCMS.sln` (add project)
- **Depends on**: REF-001, REF-005
- **Decision needed**: user must approve adding `NetArchTest.Rules` + `xunit` + `xunit.runner.visualstudio` + `Microsoft.NET.Test.Sdk` NuGet packages, and confirm test project naming (`LinguaCMS.ArchitectureTests` vs `LinguaCMS.Tests.Architecture`).
- **DoD**:
  - `dotnet test` runs and the architecture suite passes (or fails honestly, exposing remaining violations as test failures rather than as PR review nits)
  - Test project lives in `server/LinguaCMS.ArchitectureTests/`
  - `dotnet build` returns 0

### REF-023 — Configure Swashbuckle to honor C# nullability + [Required] in OpenAPI schema
- **Status**: done
- **Completed**: 2026-05-23
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "Swashbuckle is configured to honor C# nullability annotations and `[Required]` attributes. Non-nullable reference types in DTOs produce `required: true, nullable: false` in the schema. Nullable reference types produce `nullable: true`. The generated frontend client must reflect the true runtime contract — no all-fields-optional schema drift."
- **Scope**:
  - `LinguaCMS.API/Program.cs` (the `AddSwaggerGen(c => ...)` block at lines 56–77)
- **Depends on**: none
- **DoD**:
  - `AddSwaggerGen` configuration calls `c.SupportNonNullableReferenceTypes()` (and any equivalent needed to propagate `[Required]` — Swashbuckle 6.x picks up `[Required]` natively once the non-nullable-reference-types switch is on)
  - `dotnet build` returns 0
  - Spot-check the regenerated `/swagger/v1/swagger.json`: at least one previously-string-with-default DTO property (e.g., `RegisterRequest.Email`) is emitted as `nullable: false` and listed in the schema's `required` array; at least one nullable property (e.g., `LanguageDto.ImageUrl`) is emitted as `nullable: true` and absent from `required`
  - Frontend OpenAPI codegen consumes the regenerated schema and produces required/non-nullable types for the affected fields (validated by the frontend client build — out of scope for this item's commit, but follows naturally)

### REF-024 — Thin FilesController.Upload: move empty-file check and IFormFile binding out of the controller
- **Status**: pending
- **Risk**: MED
- **Requires decision**: N (pre-approved 2026-05-23 — **Option B**)
- **Rule**: "Controllers contain **only** `IMediator.Send(...)`, HTTP attributes, `ActionResult<T>` return."
- **Scope**:
  - `LinguaCMS.API/Controllers/FilesController.cs` (the `Upload` action body — currently performs `if (file.Length == 0) return BadRequest(...)` and `await using var stream = file.OpenReadStream();` before the Send call)
  - `LinguaCMS.API/ModelBinders/UploadFileModelBinder.cs` (new — converts the incoming `IFormFile` from the form into a `UploadFileCommand` instance: `new UploadFileCommand(file.OpenReadStream(), file.FileName, file.Length)`)
  - `LinguaCMS.Application/Files/Commands/UploadFile/UploadFileCommand.cs` (gain a `long Length` field so the validator can assert non-empty without re-reading the stream)
  - `LinguaCMS.Application/Files/Commands/UploadFile/UploadFileHandler.cs` (unchanged behavior; may need the new field if it logs size)
  - `LinguaCMS.Application/Files/Commands/UploadFile/UploadFileValidator.cs` (new — `RuleFor(x => x.Length).GreaterThan(0).WithMessage("Empty file")`)
- **Depends on**: REF-018 (done)
- **Pre-approved decision (2026-05-23)**: **Option B — custom model binder**. Selected because it keeps `LinguaCMS.Application` free of ASP.NET Core types (`IFormFile` lives in `Microsoft.AspNetCore.Http.Features`), preserving the CLAUDE.md dependency graph "Application → Domain, Data" with no ASP.NET reference. Empty-file check moves into a FluentValidation validator on `UploadFileCommand`, processed by the existing `ValidationBehavior` pipeline behavior (REF-009).
- **DoD**:
  - `FilesController.Upload` body is a single expression: `=> Ok(await _mediator.Send(...))` or equivalent one-line dispatch
  - The empty-file check no longer lives in the controller; it lives in either a validator (preferred) or the handler
  - No `IFormFile.OpenReadStream()` or `IFormFile.Length` access in any controller file
  - `dotnet build` returns 0
  - `dotnet test` returns 0 with test count ≥ baseline

### REF-025 — Thin LanguagesController.GetDemo: move null-to-404 mapping into the handler
- **Status**: pending
- **Risk**: LOW
- **Requires decision**: N
- **Rule**: "Controllers contain **only** `IMediator.Send(...)`, HTTP attributes, `ActionResult<T>` return."
- **Scope**:
  - `LinguaCMS.API/Controllers/LanguagesController.cs` (the `GetDemo` action — currently has `var lang = ...; if (lang == null) return NotFound(); return Ok(lang);`)
  - `LinguaCMS.Application/Languages/Queries/GetDemoLanguage/GetDemoLanguageQuery.cs` (return type changes from `LanguageDto?` to `LanguageDto`)
  - `LinguaCMS.Application/Languages/Queries/GetDemoLanguage/GetDemoLanguageHandler.cs` (replace `if (lang == null) return null;` with `throw new NotFoundException(...)`)
- **Depends on**: none
- **DoD**:
  - `LanguagesController.GetDemo` body is a single expression-bodied `=> Ok(await _mediator.Send(new GetDemoLanguageQuery()))`
  - `GetDemoLanguageQuery` implements `IRequest<LanguageDto>` (non-nullable)
  - Handler throws `NotFoundException` when no demo language exists; `ExceptionHandlerMiddleware` translates it to 404 (pattern already established elsewhere)
  - `dotnet build` returns 0
  - `dotnet test` returns 0 with test count ≥ baseline

### REF-026 — Add audit fields (CreatedAt, UpdatedAt, IsDeleted, DeletedAt) to user-facing entities + EF migration
- **Status**: pending
- **Risk**: MED
- **Requires decision**: Y
- **Rule**: "user-facing persisted entities (those modified by user actions: Languages, Lessons, Exercises, Users, Progress, etc.) declare `CreatedAt DateTime` (UTC, set on insert), `UpdatedAt DateTime?` (UTC, set on every update), `IsDeleted bool` (default false), `DeletedAt DateTime?` (default null)."
- **Scope**:
  - `LinguaCMS.Domain/Entities/AppUser.cs` (add `UpdatedAt`, `IsDeleted`, `DeletedAt`; existing `CreatedAt` stays)
  - `LinguaCMS.Domain/Entities/Language.cs` (add `UpdatedAt`, `IsDeleted`, `DeletedAt`; existing `CreatedAt` stays)
  - `LinguaCMS.Domain/Entities/Lesson.cs` (add `UpdatedAt`, `IsDeleted`, `DeletedAt`; existing `CreatedAt` stays)
  - `LinguaCMS.Domain/Entities/Exercise.cs` (add all four: `CreatedAt`, `UpdatedAt`, `IsDeleted`, `DeletedAt`)
  - `LinguaCMS.Domain/Entities/LessonProgress.cs` (add `CreatedAt`, `UpdatedAt`, `IsDeleted`, `DeletedAt`; keep `CompletedAt` — it's a domain concept, not the audit timestamp)
  - `LinguaCMS.Domain/Entities/UserStats.cs` (add all four audit properties — per pre-approved decision below, UserStats is **included** in the full audit, not exempted)
  - `LinguaCMS.Data/Migrations/<auto>_AddAuditFields.cs` (new — CLI-generated; never hand-edit per CLAUDE.md)
  - `LinguaCMS.Data/AppDbContextModelSnapshot.cs` (auto-updated by migration generator)
- **Depends on**: none
- **Pre-approved decision (2026-05-23)**:
  - **UserStats classification**: **included in full audit** (no exemption). All six entities — AppUser, Language, Lesson, Exercise, LessonProgress, UserStats — gain the four properties.
  - **Migration defaults for existing rows**: in EF configuration, set `CreatedAt` column default to `HasDefaultValueSql("now() at time zone 'utc'")` so the migration emits a `DEFAULT` clause that backfills existing rows on apply. `IsDeleted` column default `false` via `HasDefaultValue(false)`. `UpdatedAt` and `DeletedAt` stay nullable with no default (NULL for existing rows). After the migration runs, drop the `HasDefaultValueSql` from the configuration in a follow-up only if desired — for now leave it in place so the DB constraint stays declared.
- **DoD**:
  - Every in-scope entity declares the four properties as plain auto-properties (`public DateTime CreatedAt { get; set; }`, `public DateTime? UpdatedAt { get; set; }`, `public bool IsDeleted { get; set; }`, `public DateTime? DeletedAt { get; set; }`) — no method bodies, no expression-bodied members (per the existing entity rule)
  - `dotnet ef migrations add AddAuditFields -p LinguaCMS.Data -s LinguaCMS.API` produces a migration that adds the new columns with non-destructive defaults
  - `dotnet build` returns 0
  - `dotnet test` returns 0 with test count ≥ baseline

### REF-027 — Add SaveChanges interceptor for CreatedAt/UpdatedAt; remove manual assignments from handlers & seeding
- **Status**: pending
- **Risk**: MED
- **Requires decision**: N
- **Rule**: "`CreatedAt`/`UpdatedAt` maintained by a single `SaveChanges` interceptor in `<Sln>.Data` — handlers never set them manually."
- **Scope**:
  - `LinguaCMS.Data/Interceptors/AuditableEntitiesInterceptor.cs` (new — `SaveChangesInterceptor` subclass; on `SavingChanges`/`SavingChangesAsync`, walks `ChangeTracker.Entries()`, sets `CreatedAt = DateTime.UtcNow` on entries in `Added` state, `UpdatedAt = DateTime.UtcNow` on entries in `Modified` state — for entities exposing the four audit properties)
  - `LinguaCMS.Domain/Interfaces/IAuditable.cs` (new — marker interface declaring the four properties; lets the interceptor identify in-scope entities without reflection-by-name)
  - `LinguaCMS.Domain/Entities/AppUser.cs`, `Language.cs`, `Lesson.cs`, `Exercise.cs`, `LessonProgress.cs`, (optionally `UserStats.cs`) — implement `IAuditable`
  - `LinguaCMS.API/Program.cs` — register the interceptor (`services.AddSingleton<AuditableEntitiesInterceptor>();`) and chain it on the DbContext options (`options.AddInterceptors(sp.GetRequiredService<AuditableEntitiesInterceptor>())` inside `AddDbContext((sp, options) => ...)`)
  - `LinguaCMS.Application/Auth/Commands/Register/RegisterHandler.cs` — remove `CreatedAt = DateTime.UtcNow` from the `AppUser` initializer
  - `LinguaCMS.Application/Languages/Commands/CreateLanguage/CreateLanguageHandler.cs` — remove `CreatedAt = DateTime.UtcNow`
  - `LinguaCMS.Application/Lessons/Commands/CreateLesson/CreateLessonHandler.cs` — remove `CreatedAt = DateTime.UtcNow`
  - `LinguaCMS.API/Program.cs` (admin-seeding block) — remove manual `CreatedAt = DateTime.UtcNow` on the seeded `AppUser`
  - Entity files in REF-026 scope — drop the `= DateTime.UtcNow` declarative initializer on `CreatedAt` since the interceptor is now authoritative (declarative init would still produce a sensible value on instantiation, but it shadows the interceptor's invariant of "value set at insert time")
- **Depends on**: REF-026
- **DoD**:
  - Exactly one `ISaveChangesInterceptor` implementation exists in the solution, located in `LinguaCMS.Data/Interceptors/`
  - The interceptor sets `CreatedAt` only on `EntityState.Added` and `UpdatedAt` only on `EntityState.Modified`
  - No `CreatedAt = ...` or `UpdatedAt = ...` assignment exists anywhere outside the interceptor (verified by grep)
  - `Program.cs` calls `AddInterceptors(...)` (or equivalent) inside the `AddDbContext` configuration
  - `dotnet build` returns 0
  - `dotnet test` returns 0 with test count ≥ baseline

### REF-028 — Convert hard delete to soft delete in DeleteLanguage, DeleteLesson, DeleteExercise handlers
- **Status**: pending
- **Risk**: MED
- **Requires decision**: N
- **Rule**: "`IsDeleted`/`DeletedAt` set by Delete handlers (`entity.IsDeleted = true; entity.DeletedAt = DateTime.UtcNow;`), never `_db.Remove()` or `_db.RemoveRange()`."
- **Scope**:
  - `LinguaCMS.Application/Languages/Commands/DeleteLanguage/DeleteLanguageHandler.cs` (line 16: replace `_db.Languages.Remove(lang);` with `lang.IsDeleted = true; lang.DeletedAt = DateTime.UtcNow;`)
  - `LinguaCMS.Application/Lessons/Commands/DeleteLesson/DeleteLessonHandler.cs` (line 16: same pattern with `lesson`)
  - `LinguaCMS.Application/Exercises/Commands/DeleteExercise/DeleteExerciseHandler.cs` (line 41: same pattern with `exercise` — keep the surrounding file-deletion logic that REF-018 introduced)
- **Depends on**: REF-026
- **DoD**:
  - No `_db.<Set>.Remove(...)` or `_db.<Set>.RemoveRange(...)` call exists in any user-facing delete handler (verified by grep over `LinguaCMS.Application/**/Delete*Handler.cs`)
  - Each delete handler sets `IsDeleted = true; DeletedAt = DateTime.UtcNow;` on the target entity and calls `_db.SaveChangesAsync(cancellationToken)`
  - After REF-029 lands, existing queries (e.g., `GetLanguagesHandler`) continue to return only non-deleted rows because the global query filter handles the predicate — verify by spot-reading two query handlers
  - `dotnet build` returns 0
  - `dotnet test` returns 0 with test count ≥ baseline

### REF-029 — Add HasQueryFilter(x => !x.IsDeleted) to user-facing EF configurations
- **Status**: pending
- **Risk**: MED
- **Requires decision**: N (pre-approved 2026-05-23 — all six entities get the filter)
- **Rule**: "Every entity has a global EF query filter `HasQueryFilter(x => !x.IsDeleted)` so queries skip soft-deleted rows by default. Internal-only / lookup entities (enum-like reference data, never user-modified) are exempt — declare exemption in the entity's EF configuration with a comment."
- **Scope**:
  - `LinguaCMS.Data/Configurations/AppUserConfiguration.cs` (add `builder.HasQueryFilter(x => !x.IsDeleted);`)
  - `LinguaCMS.Data/Configurations/LanguageConfiguration.cs` (same)
  - `LinguaCMS.Data/Configurations/LessonConfiguration.cs` (same)
  - `LinguaCMS.Data/Configurations/ExerciseConfiguration.cs` (same)
  - `LinguaCMS.Data/Configurations/LessonProgressConfiguration.cs` (same)
  - `LinguaCMS.Data/Configurations/UserStatsConfiguration.cs` (same — UserStats is in full audit per REF-026 pre-approval, no exemption)
- **Depends on**: REF-026
- **Pre-approved decision (2026-05-23)**: every user-facing entity — including UserStats — gets `HasQueryFilter(x => !x.IsDeleted)`. No exemptions.
- **DoD**:
  - Every in-scope entity's EF configuration calls `HasQueryFilter(x => !x.IsDeleted)` (verified by grep)
  - Any exempt entity's EF configuration includes the exemption comment with rationale
  - After this item + REF-028 land, a `_db.Languages.Where(...)` style query in a handler returns no soft-deleted rows by default; an explicit `IgnoreQueryFilters()` is required to see deleted rows
  - `dotnet build` returns 0
  - `dotnet test` returns 0 with test count ≥ baseline

## Out of audit scope (workflow rules)

These rules govern agent behavior or process, not codebase state. They cannot be verified by scanning source. Listed for transparency — the agent must still follow them when working.

- "`dotnet build` → must return 0." — build command / definition of done
- "`dotnet test` → must pass (architecture + unit tests)." — workflow gate
- "Domain or EF change → `dotnet ef migrations add <Name>`, then `dotnet build` again." — workflow recipe
- "**Definition of Done**: build green, tests green. Partial = not done." — process
- "`dotnet run` (build only)." (Never) — runtime behavior of the agent
- "Edit applied migrations (add a new one to fix)." (Never) — git history / migration hygiene
- "New NuGet package without user approval." (Never) — process gate (this audit lists three items that will trigger it: REF-009 FluentValidation, REF-011 EFCore.NamingConventions, REF-022 NetArchTest/xUnit)
- "Migration | `<Sln>.Data/Migrations/<auto>.cs` (CLI-generated only)" — process (forbids hand-writing migration files)
- "Enforce via `NetArchTest`, not via review." — partly workflow (tells reviewers how to verify); the *implementation* of the test project is captured as REF-022
- "Manual MediatR / FluentValidation DI registration." (Never) — process rule for Program.cs registration shape. Currently MediatR uses auto-scan (`AddMediatR(... RegisterServicesFromAssembly ...)`) — compliant. REF-009 specifies `AddValidatorsFromAssembly` for FluentValidation when introduced.
- "When a domain interface has multiple implementations, selection happens at DI registration via an `IConfiguration` key." — process rule for future development. All current domain interfaces (planned: `IJwtTokenService`, `IPasswordHasher`, `ICurrentUser`, `IFileStorage`) are single-implementation, so the rule does not currently bind.

## Ambiguous rules (require user clarification)

None — both prior ambiguous rules ("Cross-cutting only in behaviors" and "Catch exceptions to hide them") were resolved by the 2026-05-23 CLAUDE.md tightening (cross-cutting now enumerates a closed set; catch rule now forbids empty catch and `catch (Exception)` outside Middleware).
