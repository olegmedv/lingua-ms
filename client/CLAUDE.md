# Frontend — CLAUDE.md

You are a React / TypeScript developer. These rules are absolute. The project conforms to the rules, never the reverse. If existing code violates a rule, fix the code. Do not weaken a rule to accommodate code.

## Stack

- React 19, Vite, TypeScript in strict mode
- React Router for routing
- Zustand for client state
- TanStack Query for server state (or equivalent caching layer over generated services)
- One UI library (Ant Design **or** Tailwind — pick one approach per component, do not mix on the same element)

## API contract (single source of truth)

- API types and services are **generated** from the backend's OpenAPI schema. Never written by hand.
- Generator: `openapi-typescript-codegen` (or equivalent producing both types and service classes).
- Command: `npm run generate-api` — pulls from `${VITE_API_URL}/swagger/v1/swagger.json`, outputs to `src/api/generated/`.
- Generated services read `VITE_API_URL` and inject the JWT Bearer token from the auth store automatically.
- If a backend type is missing on the frontend — regenerate. Do not transcribe.

## Folder convention (paths are computable, never guessed)

| Kind | Path |
|---|---|
| Page | `src/pages/<area>/<PageName>.tsx` |
| Shared component | `src/components/<group>/<Name>.tsx` |
| Hook | `src/hooks/use<Name>.ts` |
| Zustand store | `src/store/<name>.ts` — exports `use<Name>Store` |
| Generated API | `src/api/generated/` — read-only, do not edit |
| Hand-written API wrapper (auth header, interceptors) | `src/api/client.ts` |
| Route configuration | `src/router.tsx` |
| Environment / runtime config | `src/config.ts` reading `import.meta.env.VITE_*` |
| Global styles | `src/index.css` |
| Type definitions for non-API domain types | `src/types/<name>.ts` |

## File layout (strict)

- **One component per file.** File name == default export name.
- Sub-components allowed only if private, under 30 LOC, and used only by the parent component in the same file.
- One hook per file. One store per file. One page per file.
- Co-locate component-specific styles in the same file via Tailwind classes, or in a sibling `.module.css` file. No global CSS additions outside `src/index.css`.

## Naming (strict)

- **Components**: `PascalCase`. File name matches export.
- **Hooks**: `useCamelCase`. File `useCamelCase.ts`.
- **Stores**: file name lowercase (`auth.ts`), exported hook `use<Pascal>Store` (`useAuthStore`).
- **Pages**: `PascalCase`, no `Page` suffix.
- **Constants**: `SCREAMING_SNAKE_CASE`.
- **Types / interfaces**: `PascalCase`. Domain types named after the concept (`LessonProgress`), never prefixed with `I`.

## Mandatory rules

- **TypeScript strict mode is on globally.** Never weaken `tsconfig.json` per file or per directory.
- **No manual API request/response types.** All come from `src/api/generated/`.
- **No direct HTTP from components.** Components consume hooks; hooks call generated services.
- **No `fetch` / `axios` inline in components or pages.** Centralize HTTP through generated services.
- **No `any`. No `// @ts-ignore` / `as any` / `as unknown as`** to silence the type checker. If the type is wrong, fix the source.
- **Stores own persisted state.** Components never touch `localStorage` / `sessionStorage` directly — always through the relevant store.
- **Routing is centralized.** Every page is registered in `src/router.tsx`. No ad-hoc `<BrowserRouter>` or route declarations inside components.
- **Environment access is centralized.** All `import.meta.env.VITE_*` reads happen in `src/config.ts`. Components import from `config.ts`, never from `import.meta.env` directly.
- **One UI library per component.** Do not place Ant Design and Tailwind utility classes on the same element. Pick one and commit.

## Workflow

After every change:

1. `npm run generate-api` — if the backend OpenAPI schema changed.
2. `npm run lint` — must pass.
3. `npm run build` — must succeed (`tsc -b && vite build` — typecheck + bundle).

**Definition of Done**: lint green, build green. Not partial.

## Never

- Hand-write request, response, or DTO types that mirror backend types.
- Edit anything inside `src/api/generated/`.
- Add a new dependency without explicit user approval.
- Use `any`, `as any`, `as unknown as`, or `// @ts-ignore` to silence types.
- Call the backend directly via `fetch` or `axios` from a component or page.
- Read `localStorage` / `sessionStorage` outside a store.
- Read `import.meta.env` outside `src/config.ts`.
- Add a page that isn't registered in `src/router.tsx`.
- Introduce a second state-management library alongside Zustand, or a second routing library, or a second UI framework.
- Use inline `style={{}}` for anything beyond a single one-off CSS property.
