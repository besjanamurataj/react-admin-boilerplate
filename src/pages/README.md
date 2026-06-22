## `src/pages`

This folder contains the app’s **route-level screens** (top-level components rendered by the router).

Pages should be **thin orchestrators**: they compose modules and UI components to form a full screen.

## Rules when editing this folder

- **One page = one folder**: keep each page in its own directory (co-locate styles/tests/helpers if needed).
- **Pages can own API + rendering**: pages may call APIs (via `src/services`) and decide what to render / which components to use.
- **Move complexity to modules**: when business logic becomes complex (multi-step flows, heavy state, shared domain logic), extract it into `src/modules` so the page stays readable.
- **Use shared UI primitives**: prefer `src/components/ui` for consistent styling and behavior.
