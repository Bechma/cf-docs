# System Modules

System modules are control-plane gears that provide platform-level capabilities. They live under `gears/system/` and have access to privileged lifecycle phases (`pre_init` and `post_init`) through the `SystemCapability`.

## How they differ from regular modules

| | Regular modules | System modules |
|---|---|---|
| **Location** | `gears/` or `modules/` | `gears/system/` |
| **Lifecycle** | `init`, `start`, `stop` | Also `pre_init` and `post_init` |
| **Purpose** | Business logic and domain features | Platform infrastructure (auth, tenancy, gateway) |
| **Dependency direction** | May depend on system module SDKs | Must not depend on regular modules |

System modules run their `pre_init` hooks before any regular module initialization, and `post_init` after all modules have completed `init`. This guarantees that platform services (authentication, tenant resolution, type registry) are available before business modules start.

## Examples of system modules

- **API Gateway** -- Single public entry point for external traffic; owns the Axum router, handles routing, rate limiting, and OpenAPI publication
- **AuthN Resolver** -- Validates tokens (JWT/JWKS), produces `SecurityContext`
- **AuthZ Resolver** -- Evaluates access policies, returns authorization decisions and constraints
- **Tenant Resolver** -- Resolves tenant context from incoming requests
- **Types Registry** -- Manages the Global Type System (GTS) for schema-validated extensibility

## Consuming system modules

Regular modules interact with system modules through their SDKs via `ClientHub`, just like any other inter-module communication:

```rust
let authz = ctx.client_hub().get::<dyn AuthZResolverClient>()?;
let enforcer = PolicyEnforcer::new(authz);
let scope = enforcer.access_scope(ctx, &RESOURCE, action, id).await?;
```

Module developers generally don't interact with system modules directly -- the toolkit wraps common patterns (like `PolicyEnforcer` for authorization) into ergonomic APIs.

## Listing available modules

```bash
cargo gears ls modules           # all modules
cargo gears ls modules --system  # system modules only
cargo gears ls modules --local   # workspace modules only
```

::: tip
For details on ClientHub, plugins, and inter-module communication patterns, see [ClientHub & Plugins](/toolkit/03_clienthub_and_plugins). For authorization patterns with `PolicyEnforcer`, see [AuthN/AuthZ & Secure ORM](/toolkit/06_authn_authz_secure_orm).
:::
