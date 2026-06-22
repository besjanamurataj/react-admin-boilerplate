## `src/layouts`

This folder contains **layout shells** that wrap pages with shared structure (navigation, headers/sidebars/footers, overall spacing).

Layouts define the shared app **frame** around a page and render page content via `children`.

## Rules when editing this folder

- **Structure only**: keep layouts focused on UI chrome; business logic and API calls belong in pages/modules (and `src/services`).
- **Accept `children`**: layouts should stay generic and not hardcode page-specific UI.
- **Reuse UI primitives**: prefer `src/components/ui` instead of re-implementing buttons/inputs, etc.
- **Keep state minimal**: only layout-level state (e.g. sidebar toggle), not feature state.
- **Export via the barrel**: expose layouts from `src/layouts/index.ts` for consistent imports.

