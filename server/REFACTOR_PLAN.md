# Refactor Plan

Generated: 2026-05-23. Re-audited: 2026-05-23 (3rd pass, post-CLAUDE.md tightening). Source: server/CLAUDE.md.

## Summary
- Total items: 22
- Pending: 20 | Done: 1 | Blocked: 1
- Items requiring user decision: 6
- Ambiguous rules (not audited): 0
- Workflow rules out of audit scope: 10

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
- **Status**: pending
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

### REF-003 — Create LinguaCMS.Data project; move AppDbContext into it
- **Status**: blocked
- **Blocked reason**: scope expansion required — the DoD's "namespace `LinguaCMS.Data`" combined with "dotnet build returns 0" cannot both hold without modifying 20+ Application handlers (all `using LinguaCMS.Infrastructure.Data;` directives) and `LinguaCMS.Application.csproj` / `LinguaCMS.API.csproj`, which are REF-005's scope. REF-005 depends on REF-003 — circular. Re-audit needed: merge REF-003 + REF-005 into a single atomic item, or split the namespace rename into a separate later item and keep the namespace at `LinguaCMS.Infrastructure.Data` during REF-003.
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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

### REF-012 — Move JwtTokenService to Infrastructure; introduce IJwtTokenService domain interface
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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

### REF-018 — Thin ExercisesController.Delete: move file-deletion logic into handler
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
- **Status**: pending
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
