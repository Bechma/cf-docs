# ModKit

ModKit is the library ecosystem that powers Gears modules. It provides the runtime substrate -- module registration, database access, HTTP/gRPC transport, security primitives, error handling, and query building -- so that module developers can focus on business logic.

All ModKit crates are prefixed with `cf-modkit` and designed to work together through the Gears toolkit.

## Crate map

| Group | Crates | Purpose |
|---|---|---|
| **Module system** | [modkit](./modkit/modkit-macros), [modkit-macros](./modkit/modkit-macros), [modkit-sdk](./modkit/modkit-sdk) | Gear registration, `ClientHub`, lifecycle macros, and client-side query builders |
| **Data & storage** | [modkit-db](./modkit/modkit-db), [modkit-db-macros](./modkit/modkit-db-macros) | SeaORM integration, `SecureConn`, tenant-scoped queries, migrations |
| **Networking** | [modkit-http](./modkit/modkit-http), [modkit-transport-grpc](./modkit/modkit-transport-grpc) | HTTP client with retries and SSRF protection, gRPC security context propagation |
| **Errors** | [modkit-errors](./modkit/modkit-errors), [modkit-errors-macro](./modkit/modkit-errors-macro), [modkit-canonical-errors](./modkit/modkit-canonical-errors) | RFC 9457 Problem Details, canonical error types (AIP-193), `resource_error!` macro |
| **Query & data access** | [modkit-odata](./modkit/modkit-odata), [modkit-odata-macros](./modkit/modkit-odata-macros) | OData filter/pagination primitives and proc-macros |
| **Security** | [modkit-auth](./modkit/modkit-auth), [modkit-security](./modkit/modkit-security) | JWT/JWKS validation, OAuth2 client-credentials, `SecurityContext`, `AccessScope` |
| **Platform** | [modkit-node-info](./modkit/modkit-node-info) | System information (hardware UUID, OS, CPU, GPU, network) |

For the full library reference with detailed descriptions, see the [API reference](/reference/api-reference).

## How the pieces fit together

A typical module uses ModKit crates at every layer:

- **Gear declaration** -- `modkit-macros` provides `#[toolkit::gear(...)]` and `#[lifecycle(...)]`
- **REST routes** -- The core `modkit` crate provides `OperationBuilder` for type-safe route registration with integrated OpenAPI, auth, and error schemas
- **Database** -- `modkit-db` provides `SecureConn` and `SecureTx` for tenant-scoped queries, plus a per-module migration runner
- **Error handling** -- `modkit-errors` defines the `Problem` type (RFC 9457) and `modkit-canonical-errors` provides standard HTTP error constructors
- **Inter-module calls** -- `modkit-sdk` provides `WithSecurityContext` for scoping any client, and `QueryBuilder` for typed OData queries
- **Auth** -- `modkit-auth` handles JWT validation and token refresh; `modkit-security` provides `SecurityContext` and `AccessScope` types used throughout

## Getting started with ModKit

Modules don't depend on ModKit crates directly. Instead, they depend on `cf-gears-toolkit`, which re-exports the relevant ModKit types through a unified prelude. The toolkit feature flags control which capabilities are available:

```toml
[dependencies]
cf-gears-toolkit = { workspace = true, features = ["http", "db"] }
```
