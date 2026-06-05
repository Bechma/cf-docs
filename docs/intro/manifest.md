# Manifest

`Gears.toml` is the orchestration manifest used by `cargo gears`. It defines workspace defaults, the available apps and environments, the runtime config used by each environment, the selected modules, and the run, build, lint, and test policies.

The default manifest file name is `Gears.toml`. Apps are declared under `[apps.<app>.<env>]`. Each environment must define `config` and can also define `modules`, `run`, `build`, `lint`, and `test`.

Workspace fields include:

- `version`, currently `1`
- `root`, an optional workspace root override
- `config-dir`, which defaults to `config`
- `generated-dir`, which defaults to `.gears`
- `global_env`, an optional shared environment block

Module references support two sources:

- `local`: `name`, with optional `version` and `package`
- `remote`: `name`, `version`, `package`, and optional `registry`

Optional template registries can also be declared under `templates` for modules, configs, and agents.

```toml
[workspace]
version = 1
config-dir = "config"
generated-dir = ".gears"

[apps.quickstart.dev]
config = "quickstart.yml"
modules = [
  { source = "local", name = "hello-world" },
  { source = "remote", name = "api-gateway", package = "cf-api-gateway", version = "0.1" }
]
```

Use `cargo gears manifest validate` to validate the manifest and `cargo gears manifest ls` to inspect the declared entries. If the manifest contains only one app, the CLI can infer it automatically. If a `dev` environment exists, it is selected by default.

# Build Policy

Build settings live under `[apps.<app>.<env>.build]`.

- `name`: overrides the generated project name. If omitted, the default is `<app>-<env>`
- `profile`: build profile, either `debug`, `release`, or a custom profile name
- `clean`: when set, removes `Cargo.lock` before building

# Lint Policy

Lint settings live under `[apps.<app>.<env>.lint]`.

- `ref`: reuse the lint policy from another environment
- `clippy`: enables or disables Clippy checks, default `true`
- `fmt`: enables or disables formatting checks, default `true`
- `feature-set-test`: enables feature-set validation, default `true`
- `dylint`: optional Dylint settings with `enabled` and `skip`

# Run Policy

Run settings live under `[apps.<app>.<env>.run]`.

- `watch.enabled`: enables watch mode, default `true`
- `watch.include`: replaces the default watch set when provided
- `watch.exclude`: removes paths from the effective watch set
- `fips`: enables FIPS-related build features, default `false`
- `otel`: enables OpenTelemetry-related build features, default `false`

# Test Policy

Test settings live under `[apps.<app>.<env>.test]`.

- `ref`: reuse the test policy from another environment
- `runner`: `nextest` or `cargo`, with `nextest` as the default
- `feature-set`: per-module feature matrices to test
- `custom-command`: optional custom test command

Each `feature-set` entry supports these modes:

- `default-features`
- `all-features`
- `no-default-features`
- `features`, with an explicit `features = ["..."]` list
