# Toolkit Libraries

The Toolkit is the library ecosystem that powers Gears modules. It provides the runtime substrate -- module registration, database access, HTTP/gRPC transport, security primitives, error handling, and query building -- so that module developers can focus on business logic.

All Toolkit crates are prefixed with `cf-gears-toolkit` and designed to work together.

## Crate map

| Group | Crates | Purpose |
|---|---|---|
| **Module system** | [toolkit](./modkit/modkit-macros), [toolkit-macros](./modkit/modkit-macros), [toolkit-sdk](./modkit/modkit-sdk) | Gear registration, `ClientHub`, lifecycle macros, and client-side query builders |
| **Data & storage** | [toolkit-db](./modkit/modkit-db), [toolkit-db-macros](./modkit/modkit-db-macros) | SeaORM integration, `SecureConn`, tenant-scoped queries, migrations |
| **Networking** | [toolkit-http](./modkit/modkit-http), [toolkit-transport-grpc](./modkit/modkit-transport-grpc) | HTTP client with retries and SSRF protection, gRPC security context propagation |
| **Errors** | [toolkit-canonical-errors](./modkit/modkit-canonical-errors), [toolkit-canonical-errors-macro](./modkit/modkit-errors-macro) | RFC 9457 Problem Details, canonical error types (AIP-193), `resource_error!` macro |
| **Query & data access** | [toolkit-odata](./modkit/modkit-odata), [toolkit-odata-macros](./modkit/modkit-odata-macros) | OData filter/pagination primitives and proc-macros |
| **Security** | [toolkit-auth](./modkit/modkit-auth), [toolkit-security](./modkit/modkit-security) | JWT/JWKS validation, OAuth2 client-credentials, `SecurityContext`, `AccessScope` |
| **Type system** | [toolkit-gts](./modkit/modkit-macros), [toolkit-gts-macros](./modkit/modkit-macros) | Global Type System (GTS) for schema-validated extensibility |
| **Platform** | [toolkit-node-info](./modkit/modkit-node-info) | System information (hardware UUID, OS, CPU, GPU, network) |

For the full library reference with detailed descriptions, see the [API reference](/reference/api-reference).

## How the pieces fit together

A typical module uses Toolkit crates at every layer:

- **Gear declaration** -- `toolkit-macros` provides `#[toolkit::gear(...)]` and `#[lifecycle(...)]`
- **REST routes** -- The core `toolkit` crate provides `OperationBuilder` for type-safe route registration with integrated OpenAPI, auth, and error schemas
- **Database** -- `toolkit-db` provides `SecureConn` and `SecureTx` for tenant-scoped queries, plus a per-module migration runner
- **Error handling** -- `toolkit-canonical-errors` defines the `Problem` type (RFC 9457) and provides standard HTTP error constructors
- **Inter-module calls** -- `toolkit-sdk` provides `WithSecurityContext` for scoping any client, and `QueryBuilder` for typed OData queries
- **Auth** -- `toolkit-auth` handles JWT validation and token refresh; `toolkit-security` provides `SecurityContext` and `AccessScope` types used throughout

## Getting started

Modules don't depend on Toolkit crates individually. Instead, they depend on `cf-gears-toolkit`, which re-exports the relevant types through a unified prelude. The toolkit feature flags control which capabilities are available:

```toml
[dependencies]
cf-gears-toolkit = { workspace = true, features = ["http", "db"] }
```
