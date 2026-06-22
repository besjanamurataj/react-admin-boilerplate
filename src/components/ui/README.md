this folder contains **reusable Reac componets** used across pages and modules.
It includes:

- **UI primitives** (building blocks like Button/Input/Card) meant to be reused everywhere.
- **Shared app components** (navigation,menus, reusable section) that are not tied to a single route

## Rules whan editing this folder

-**Na page here**: route-level screens live in `src/pages`.

- **Prefer UI primitive**:build new UI on top of `src/components/ui` for consistent styling/behavior.
- **Keep components reusable**: avoid hardcoding route-specific assumptions (URLs, route params, page-only state).
- **Types props**.export clear Typescript props for every component.
- **Export via the barrel**: expose shared components from `src/components/index.ts` to keep imports consistent.
