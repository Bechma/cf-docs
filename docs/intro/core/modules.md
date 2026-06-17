# Modules

Modules (also called **gears**) are the primary unit of composition in Gears. Each module is a self-contained Rust crate that encapsulates business logic, exposes a versioned SDK, and declares its runtime capabilities.

## Directory structure

Every module follows a DDD-light layout:

```
modules/<name>/
  Cargo.toml              # Module crate
  src/
    lib.rs                # Re-exports SDK types + gear struct
    gear.rs               # #[toolkit::gear(...)] + capabilities
    config.rs             # Typed config (optional)
    api/rest/
      dto.rs              # REST DTOs
      handlers.rs         # Axum handlers
      routes.rs           # OperationBuilder route registration
    domain/
      service.rs          # Business logic
      error.rs            # DomainError enum
      local_client.rs     # SDK trait impl for in-process calls
    infra/storage/
      entity.rs           # SeaORM entities
      mapper.rs           # Entity <-> SDK model conversions
      migrations/         # SeaORM migrations
  sdk/
    Cargo.toml            # Public API crate
    src/
      lib.rs
      api.rs              # ClientHub trait(s)
      models.rs           # Transport-agnostic domain models
      errors.rs           # Transport-agnostic errors
```

Domain logic lives in `domain/` and is free from transport and infrastructure details. The SDK crate (`sdk/`) defines the public contract that other modules consume.

## Gear declaration

Modules declare themselves and their capabilities with the `#[toolkit::gear(...)]` macro:

```rust
#[toolkit::gear(
    name = "my-gear",
    deps = ["foo", "bar"],
    capabilities = [db, rest],
    client = my_gear_sdk::MyGearApi,
)]
pub struct MyGear { /* ... */ }
```

The runtime discovers registered gears via inventory and wires them automatically based on declared dependencies and capabilities.

## Capabilities

Capabilities determine which lifecycle phases a module participates in:

| Capability | Purpose |
|---|---|
| `db` | Database migrations and scoped connection access |
| `rest` | HTTP/REST route registration via OperationBuilder |
| `grpc` | gRPC service registration |
| `stateful` | Long-running background tasks with lifecycle management |

## Creating a module

```bash
cargo gears generate module --template background-worker
cargo gears config mod add background-worker -c ./config/quickstart.yml
```

The CLI scaffolds the directory structure and registers the module in the workspace. Templates provide pre-built starting points for common patterns.

## Module categories

Gears are organized into categories with strict dependency rules:

- **API Ingress** -- Public entry point (API gateway, routing, auth, rate limiting)
- **Business Logic** -- User-facing SaaS capabilities
- **Gen AI** -- LLM gateway, agents, memory, search
- **Serverless** -- Functions, workflows, runtimes, durable state
- **Core Functionality** -- Shared platform capabilities (audit, jobs, notifications)
- **Core Platform** -- Interfaces and adapters for tenancy, licensing, credentials

Business gears may depend on GenAI, Serverless, and Core gears. No circular or cross-category sideways dependencies are allowed except through SDK contracts.

## Module references

Modules are referenced in `Gears.toml` as either local or remote:

```toml
modules = [
  { source = "local", name = "hello-world" },
  { source = "remote", name = "api-gateway", package = "cf-api-gateway", version = "0.1" }
]
```

Use `cargo gears ls modules` to list available modules in the workspace.

::: tip
For the full toolkit API and architectural patterns, see the [Toolkit](/toolkit/) documentation.
:::
