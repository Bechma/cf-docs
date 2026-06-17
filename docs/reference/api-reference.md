# API Reference

## Libraries

![Libraries Dependency Graph](../assets/libs-dependencies.drawio.svg)

The `libs/` directory contains the foundational crates that make up the Toolkit ecosystem. They are organized into functional groups:

### Module System

| Crate | Description |
|---|---|
| `cf-gears-toolkit` | Core module system: inventory-based module registration, `ClientHub` for typed in-process clients, REST/OpenAPI helpers, and runtime lifecycle management. |
| `cf-gears-toolkit-macros` | Proc-macros re-exported by `cf-gears-toolkit`: `#[gear(...)]` for declaring and registering modules, `#[lifecycle(...)]` for generating `Runnable` impls, and `#[grpc_client(...)]` for wrapping tonic clients. |

### Data & Storage

| Crate | Description |
|---|---|
| `cf-gears-toolkit-db` | Database abstractions: typed connection config, SQLx backends (SQLite / Postgres / MySQL), SeaORM integration, a secure-by-default ORM wrapper that enforces tenant isolation at compile time, and a per-module migration runner. |
| `cf-gears-toolkit-db-macros` | Proc-macro derives for the `cf-gears-toolkit-db` secure ORM layer. |

### Networking & Transport

| Crate | Description |
|---|---|
| `cf-gears-toolkit-http` | HTTP client built on hyper/tower: HTTPS with rustls, connection pooling, configurable timeouts, automatic retries with backoff, concurrency limiting, transparent decompression (gzip/brotli/deflate), and redirect following with SSRF protection. |
| `cf-gears-toolkit-transport-grpc` | gRPC transport helpers: attaching and extracting `SecurityContext` via gRPC metadata, and optional Windows named-pipe transport. |

### Error Handling

| Crate | Description |
|---|---|
| `cf-gears-toolkit-canonical-errors` | Canonical error types following the Google AIP-193 model (`InvalidArgument`, `NotFound`, `PermissionDenied`, `Internal`, ...), RFC 9457 Problem Details (`Problem`), validation error types, and error catalog support. |
| `cf-gears-toolkit-canonical-errors-macro` | Proc-macro (`resource_error!`) for declaring resource-scoped error types with generated constructors. |

### Query & Data Access

| Crate | Description |
|---|---|
| `cf-gears-toolkit-odata` | OData query building, filter/pagination primitives, schema utilities (`Schema`, `FieldRef`), and page types (`Page`, `PageInfo`). |
| `cf-gears-toolkit-odata-macros` | Proc-macros for the OData layer. |
| `cf-gears-toolkit-sdk` | Client-side utilities: `WithSecurityContext` for zero-allocation security-context scoping on any client, and a typed OData `QueryBuilder` with compile-time field type checking and deterministic filter hashing for cursor pagination. |

### Security & Authentication

| Crate | Description |
|---|---|
| `cf-gears-toolkit-security` | Core security primitives: `SecurityContext`, `AccessScope`, permission/policy engine interfaces, and binary codec helpers. |
| `cf-gears-toolkit-auth` | Authentication infrastructure: JWT/JWKS validation (`KeyProvider`, `JwksKeyProvider`, background key refresh), outbound OAuth2 client-credentials flow (`Token` with automatic refresh, `BearerAuthLayer` for tower), and auth metrics. |

### Type System

| Crate | Description |
|---|---|
| `cf-gears-toolkit-gts` | Global Type System (GTS): schema-validated type extensibility for plugins and dynamic configuration. |
| `cf-gears-toolkit-gts-macros` | Proc-macros for the GTS layer. |

### Platform & Utilities

| Crate | Description |
|---|---|
| `cf-gears-toolkit-node-info` | Cross-platform system information: hardware-based node UUID (IOKit / machine-id / registry), OS/CPU/memory/GPU/battery/network collection with per-capability cache TTLs, and NVIDIA GPU detection via NVML. |
| `cf-gears-toolkit-utils` | Small utility helpers, currently serde support for `humantime` duration serialization. |

### System SDKs

| Crate | Description |
|---|---|
| `cf-gears-system-sdks` | Umbrella crate that re-exports individual system-module SDKs behind feature flags (e.g. `directory`, `directory_grpc`). |
