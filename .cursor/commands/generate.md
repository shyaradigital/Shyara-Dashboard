# Cursor Generate Rules for Shyara Dashboard (Global Project Rules)

## 🏗️ Project Architecture & Structure

- Every new **feature** must be placed inside `src/features/<feature-name>/`.
- Each feature must follow this internal folder structure:
  - `components/` – UI components for that feature
  - `hooks/` – custom React hooks specific to that feature
  - `services/` – API or business logic
  - `types/` – TypeScript interfaces and types
- Do not place feature logic in shared folders like `src/components/`, `src/lib/`, or `src/hooks/` unless it is clearly generic and reused across features.
- Always use `@/` path aliases (configured in `tsconfig.json`) for imports instead of relative paths.

## 🔐 Role-Based Access Control

- Enforce role checks using `authStore` and `UserRole` enum from `src/config/roles.ts`.
- Never hardcode role strings. Always use the central enum and permission map.
- Only show navigation, content, and actions the current user’s role permits.

## 🎨 UI & Styling

- Use **ShadCN UI** components from `@/components/ui/` where possible to ensure visual consistency.
- Apply **Tailwind CSS** utility classes for styling and responsiveness.
- Always support full responsiveness: test layouts at mobile (`sm`), tablet (`md`), and desktop (`lg`) breakpoints.
- Use the `cn()` utility from `src/lib/utils.ts` to manage conditional classNames.
- Respect the light theme and use the purple primary color as defined in the Tailwind/ShadCN config.

## 🔄 State Management

- Use **Zustand** for any global state and store it inside `src/store/`.
- Feature-specific state should be handled locally within the feature folder using hooks or context.
- Reuse global state where applicable (e.g., user auth, theme, layout) via `authStore` or other global stores.

## 📡 API & Services

- All data fetching or external logic must go into `services/` inside the corresponding feature folder.
- Reusable service utilities (like `apiClient`) can live in `src/services/`.
- Never mix business logic inside components. Use dedicated service and hook layers.

## 📁 Component Reuse & Shared Code

- Only place truly global, shared components inside `src/components/`.
- Shared layout elements (Sidebar, Topbar, Wrappers) go inside `src/components/layout/`.
- Use atomic component design where possible (small, composable, focused components).

## ✨ Development Standards

- All generated code must:
  - Pass ESLint and Prettier formatting rules.
  - Avoid unused imports, dead code, or console logs.
  - Be committed only after pre-commit checks (via Husky) pass.
- Add JSDoc comments for exported functions, especially services and utility logic.

## 📘 Feature Development Workflow

- Every major feature should be initiated in a **new Cursor chat**, named after the feature (e.g., `Invoice Generator`).
- Start by creating the feature folder with empty subfolders: `components/`, `hooks/`, `services/`, `types/`.
- Generate the feature incrementally (UI, services, state, types) within that folder.
- Do not cross-link features unless explicitly meant to be shared (like balance calculations).

## 🧪 Testing & QA (for future CI)

- Write basic unit test files alongside service or hook functions where feasible.
- Name test files as `*.test.ts` or `*.spec.ts`.
- Use mock data or types for testing business logic.

## 📄 Docs & Metadata

- Every feature folder should eventually include a `README.md` or at least inline documentation describing its structure and purpose.
- Update the root `README.md` with new features or architectural changes.
