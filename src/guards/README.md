## `src/guards`

This folder contains **route guards**: small components that decide whether a route tree can render (usually based on authentication) and otherwise redirect.

Guards are used by the router (`src/navigator`) to keep access control consistent across the app.

## Rules when editing this folder

- **Keep guards thin**: only access checks + redirects (no feature logic, no data fetching).
- **Accept `children`**: guards wrap route trees and should render `children` when allowed.
- **Export via the barrel**: expose guards from `src/guards/index.ts`.

