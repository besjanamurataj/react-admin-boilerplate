## `src/modules`

This folder contains **feature modules** used by pages when a screen becomes too complex.

## When to create a module

- A page has **complex business logic** (multi-step flows, heavy state, lots of branching).
- Logic needs to be **shared** across multiple pages/screens.
- You want a feature to expose a **clean, reusable API** (components/hooks) to pages.

## Rules when editing this folder

- **Keep modules feature-scoped**: don’t create “mega modules” that mix unrelated features.
- **Use services for API calls**: call APIs via `src/services` (don’t inline HTTP clients in modules).
- **Reuse UI primitives**: prefer `src/components/ui` for consistent styling and behavior.
- **Every Module has the same bussiness logic as a Page**
