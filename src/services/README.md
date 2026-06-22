## `src/services`

This folder contains the app’s **API layer** (domain services).

Each service usually maps to a **backend entity / bounded context** (e.g. Auth, Users) and exposes typed methods that pages/modules can call without dealing with HTTP details.

## Rules when editing this folder

- **One service per backend entity/context**: keep endpoints grouped by domain (Auth, User, etc.).
- **Services call the shared client**: use `HttpClient` from `src/libs/http/http-client.ts` (don’t create new axios instances here).
- **No UI/state in services**: services should only do data access + light mapping (no React state, navigation, toasts, etc.).
- **Keep methods typed**: service methods should return typed data (use `src/types`).
- **Export via the barrel**: add new services to `src/services/index.ts`.
