# `src/navigator`

This folder contains the app’s **central route table**.

## What `index.tsx` does

`src/navigator/index.tsx` exports `Navigator`, which uses `react-router-dom`’s `useRoutes()` to define all routes in one place.

- **Private routes**: Wrapped with `PrivateGuard` (requires authentication).
- **Public routes**: Wrapped with `PublicGuard` (typically for unauthenticated pages like login).
- **App shell**: Authenticated pages are rendered inside `AppShellLayout`, which also receives `menuItems` for the side navigation.

## Rules when editing this file

- **Use the correct guard**:
  - Use `PrivateGuard` for pages that must be protected.
  - Use `PublicGuard` for pages like `/login` that should not be accessible when already signed in (depending on guard behavior).
- **Keep paths consistent**:
  - If you add a new page route (e.g. `/users`), ensure any `menuItems` entry uses the **same exact path**.
- **Don’t put business logic here**:
  - No data fetching, auth logic, or side effects. Keep this file purely declarative routing.


