## `src/libs`

This folder contains **low-level infrastructure wrappers** (HTTP, sockets, third-party adapters).

## Rules when editing this folder

- **No React here**: no components, hooks, or UI concerns.
- **Wrap infrastructure only**: keep this for third-party clients/adapters (HTTP, sockets, storage, etc.).
- **Single instance / entry point**: export one public wrapper per lib.
