# Green Project: Bookmark Manager

Build a bookmark manager from scratch. By the end of this guide you will have a running Gears application with a REST API backed by a database, complete with OData filtering and pagination.

## What you'll build

A **bookmarks** module that:

- Stores bookmarks (URL, title, description) in a database
- Exposes CRUD endpoints via REST
- Supports OData filtering, ordering, and pagination on list queries
- Publishes an SDK so other modules can consume bookmarks programmatically

## 1. Create the workspace

```bash
cargo gears new bookmarks-app
cd bookmarks-app
```

This scaffolds:

```
bookmarks-app/
  Cargo.toml            # Workspace manifest
  Gears.toml            # Gears orchestration manifest
  Dockerfile
  config/
    quickstart.yml      # Default runtime config
  modules/
    hello-world/        # Starter module
```

Verify everything compiles:

```bash
cargo gears run
```

You should see a repeated "hello world" message. Press `Ctrl+C` to stop.

## 2. Generate the bookmarks module

```bash
cargo gears generate module --template api-db-handler --name bookmarks
```

This creates `modules/bookmarks/` with the full DDD-light layout:

```
modules/bookmarks/
  Cargo.toml
  src/
    lib.rs
    gear.rs               # #[toolkit::gear(...)] declaration
    api/rest/
      dto.rs              # REST DTOs
      handlers.rs         # Axum handlers
      routes.rs           # OperationBuilder route registration
    domain/
      service.rs          # Business logic
      error.rs            # DomainError enum
      local_client.rs     # SDK trait impl (in-process)
    infra/storage/
      entity.rs           # SeaORM entities
      mapper.rs           # Entity <-> model conversions
      migrations/         # Database migrations
  sdk/
    Cargo.toml
    src/
      lib.rs
      api.rs              # Public SDK trait
      models.rs           # Transport-agnostic models
      errors.rs           # Transport-agnostic errors
```

For a deeper look at this layout, see [Modules](/intro/core/modules) and [Gear Layout & SDK Pattern](/toolkit/02_gear_layout_and_sdk_pattern).

## 3. Generate a database config

The default `quickstart.yml` has no database section. Generate one:

```bash
cargo gears generate config --template db --name quickstart
```

::: warning
This fails if `config/quickstart.yml` already exists. Remove or rename the old file first, then run the command again.
:::

The generated config includes a PostgreSQL connection:

```yaml
database:
  servers:
    main:
      engine: postgres
      host: localhost
      port: 5432
      user: postgres
      password: ${DB_PASSWORD}
      dbname: app
```

Set the password for your local database:

```bash
export DB_PASSWORD=your_password
```

## 4. Register the module

```bash
cargo gears config mod add bookmarks -c ./config/quickstart.yml
cargo gears config mod db add bookmarks -c ./config/quickstart.yml --server main
```

The first command registers the module in the runtime config. The second wires it to the `main` database server so it receives a connection during startup.

## 5. Define the SDK

The SDK is the public contract other modules use to interact with bookmarks. It must stay free of infrastructure types (no SeaORM, no Axum).

### Models (`modules/bookmarks/sdk/src/models.rs`)

```rust
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct Bookmark {
    pub id: Uuid,
    pub url: String,
    pub title: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct CreateBookmark {
    pub url: String,
    pub title: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone)]
pub struct UpdateBookmark {
    pub title: Option<String>,
    pub description: Option<String>,
}
```

### Errors (`modules/bookmarks/sdk/src/errors.rs`)

```rust
use thiserror::Error;
use uuid::Uuid;

#[derive(Debug, Error)]
pub enum BookmarkError {
    #[error("bookmark {0} not found")]
    NotFound(Uuid),
    #[error("internal error: {0}")]
    Internal(String),
}
```

### API trait (`modules/bookmarks/sdk/src/api.rs`)

```rust
use async_trait::async_trait;
use toolkit_sdk::Page;
use toolkit_security::SecurityContext;
use uuid::Uuid;

use crate::errors::BookmarkError;
use crate::models::{Bookmark, CreateBookmark, UpdateBookmark};

#[async_trait]
pub trait BookmarkApi: Send + Sync {
    async fn create(
        &self,
        ctx: &SecurityContext,
        input: CreateBookmark,
    ) -> Result<Bookmark, BookmarkError>;

    async fn get(
        &self,
        ctx: &SecurityContext,
        id: Uuid,
    ) -> Result<Bookmark, BookmarkError>;

    async fn list(
        &self,
        ctx: &SecurityContext,
        query: toolkit_odata::ODataQuery,
    ) -> Result<Page<Bookmark>, BookmarkError>;

    async fn update(
        &self,
        ctx: &SecurityContext,
        id: Uuid,
        input: UpdateBookmark,
    ) -> Result<Bookmark, BookmarkError>;

    async fn delete(
        &self,
        ctx: &SecurityContext,
        id: Uuid,
    ) -> Result<(), BookmarkError>;
}
```

Every method takes `&SecurityContext` as its first parameter -- this is how identity and authorization flow through the system. See [SDK](/intro/core/sdk) for the rationale.

## 6. Define the database entity

### Entity (`modules/bookmarks/src/infra/storage/entity.rs`)

```rust
use chrono::{DateTime, Utc};
use sea_orm::entity::prelude::*;
use toolkit_db_macros::Scopable;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "bookmarks")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub url: String,
    pub title: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Scopable)]
#[secure(tenant_col = "tenant_id", resource_col = "id", no_owner, no_type)]
pub struct ScopedBookmark;

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
```

The `#[derive(Scopable)]` tells `SecureConn` which columns to use for tenant filtering. See [Database](/intro/core/database) for details on the secure ORM.

### Migration (`modules/bookmarks/src/infra/storage/migrations/m20250101_000001_create_bookmarks.rs`)

```rust
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Bookmarks::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Bookmarks::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(Bookmarks::TenantId).uuid().not_null())
                    .col(ColumnDef::new(Bookmarks::Url).string().not_null())
                    .col(ColumnDef::new(Bookmarks::Title).string().not_null())
                    .col(ColumnDef::new(Bookmarks::Description).string().null())
                    .col(ColumnDef::new(Bookmarks::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(Bookmarks::UpdatedAt).timestamp_with_time_zone().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_bookmarks_tenant_id")
                    .table(Bookmarks::Table)
                    .col(Bookmarks::TenantId)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Bookmarks::Table).to_owned())
            .await
    }
}

#[derive(Iden)]
enum Bookmarks {
    Table,
    Id,
    TenantId,
    Url,
    Title,
    Description,
    CreatedAt,
    UpdatedAt,
}
```

::: tip
Always add an index on `tenant_id` -- the secure ORM injects tenant filters on every query.
:::

## 7. Implement the domain service

The service contains business logic and delegates storage to the repository pattern. Repository methods accept `&impl DBRunner`, making them reusable across transactional and non-transactional contexts.

### Service (`modules/bookmarks/src/domain/service.rs`)

```rust
use chrono::Utc;
use std::sync::Arc;
use toolkit_db::SecureConn;
use toolkit_security::SecurityContext;
use toolkit_odata::ODataQuery;
use toolkit_sdk::Page;
use uuid::Uuid;

use bookmarks_sdk::{
    errors::BookmarkError,
    models::{Bookmark, CreateBookmark, UpdateBookmark},
};

use crate::infra::storage::{entity, repository};

pub struct Service {
    db: Arc<SecureConn>,
}

impl Service {
    pub fn new(db: Arc<SecureConn>) -> Self {
        Self { db }
    }

    pub async fn create(
        &self,
        ctx: &SecurityContext,
        input: CreateBookmark,
    ) -> Result<Bookmark, BookmarkError> {
        let scope = ctx.access_scope();
        let now = Utc::now();
        let model = entity::ActiveModel {
            id: sea_orm::Set(Uuid::new_v4()),
            tenant_id: sea_orm::Set(scope.tenant_id()),
            url: sea_orm::Set(input.url),
            title: sea_orm::Set(input.title),
            description: sea_orm::Set(input.description),
            created_at: sea_orm::Set(now),
            updated_at: sea_orm::Set(now),
        };
        let result = repository::insert(&*self.db, &scope, model).await?;
        Ok(result.into())
    }

    pub async fn get(
        &self,
        ctx: &SecurityContext,
        id: Uuid,
    ) -> Result<Bookmark, BookmarkError> {
        let scope = ctx.access_scope();
        repository::find_by_id(&*self.db, &scope, id)
            .await?
            .map(Into::into)
            .ok_or(BookmarkError::NotFound(id))
    }

    pub async fn list(
        &self,
        ctx: &SecurityContext,
        query: ODataQuery,
    ) -> Result<Page<Bookmark>, BookmarkError> {
        let scope = ctx.access_scope();
        repository::find_all(&*self.db, &scope, query).await
    }

    pub async fn update(
        &self,
        ctx: &SecurityContext,
        id: Uuid,
        input: UpdateBookmark,
    ) -> Result<Bookmark, BookmarkError> {
        let scope = ctx.access_scope();
        let existing = repository::find_by_id(&*self.db, &scope, id)
            .await?
            .ok_or(BookmarkError::NotFound(id))?;

        let mut active: entity::ActiveModel = existing.into();
        if let Some(title) = input.title {
            active.title = sea_orm::Set(title);
        }
        if let Some(desc) = input.description {
            active.description = sea_orm::Set(Some(desc));
        }
        active.updated_at = sea_orm::Set(Utc::now());

        let result = repository::update(&*self.db, &scope, active).await?;
        Ok(result.into())
    }

    pub async fn delete(
        &self,
        ctx: &SecurityContext,
        id: Uuid,
    ) -> Result<(), BookmarkError> {
        let scope = ctx.access_scope();
        repository::delete(&*self.db, &scope, id).await
    }
}
```

## 8. Wire up REST endpoints

### DTOs (`modules/bookmarks/src/api/rest/dto.rs`)

```rust
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use toolkit_odata_macros::ODataFilterable;
use uuid::Uuid;

use bookmarks_sdk::models;

#[derive(Debug, Serialize, Deserialize, ODataFilterable)]
pub struct BookmarkDto {
    pub id: Uuid,
    pub url: String,
    pub title: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<models::Bookmark> for BookmarkDto {
    fn from(b: models::Bookmark) -> Self {
        Self {
            id: b.id,
            url: b.url,
            title: b.title,
            description: b.description,
            created_at: b.created_at,
            updated_at: b.updated_at,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateBookmarkDto {
    pub url: String,
    pub title: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBookmarkDto {
    pub title: Option<String>,
    pub description: Option<String>,
}
```

The `#[derive(ODataFilterable)]` generates a `BookmarkDtoFilterField` enum used for type-safe filter parsing and OpenAPI schema generation. See [OData](/intro/core/odata) for details.

### Routes (`modules/bookmarks/src/api/rest/routes.rs`)

```rust
use axum::http::StatusCode;
use toolkit::rest::OperationBuilder;
use toolkit_sdk::Page;

use super::dto::{BookmarkDto, BookmarkDtoFilterField, CreateBookmarkDto, UpdateBookmarkDto};
use super::handlers;

pub fn register(router: &mut Router, openapi: &mut OpenApi) {
    OperationBuilder::get("/bookmarks/v1/bookmarks")
        .operation_id("bookmarks.list")
        .authenticated()
        .no_license_required()
        .handler(handlers::list)
        .json_response_with_schema::<Page<BookmarkDto>>(openapi, StatusCode::OK, "Bookmarks")
        .with_odata_filter::<BookmarkDtoFilterField>()
        .with_odata_orderby::<BookmarkDtoFilterField>()
        .standard_errors(openapi)
        .register(router, openapi);

    OperationBuilder::post("/bookmarks/v1/bookmarks")
        .operation_id("bookmarks.create")
        .authenticated()
        .no_license_required()
        .handler(handlers::create)
        .json_request::<CreateBookmarkDto>()
        .json_response_with_schema::<BookmarkDto>(openapi, StatusCode::CREATED, "Bookmark")
        .standard_errors(openapi)
        .register(router, openapi);

    OperationBuilder::get("/bookmarks/v1/bookmarks/:id")
        .operation_id("bookmarks.get")
        .authenticated()
        .no_license_required()
        .handler(handlers::get)
        .json_response_with_schema::<BookmarkDto>(openapi, StatusCode::OK, "Bookmark")
        .standard_errors(openapi)
        .register(router, openapi);

    OperationBuilder::patch("/bookmarks/v1/bookmarks/:id")
        .operation_id("bookmarks.update")
        .authenticated()
        .no_license_required()
        .handler(handlers::update)
        .json_request::<UpdateBookmarkDto>()
        .json_response_with_schema::<BookmarkDto>(openapi, StatusCode::OK, "Bookmark")
        .standard_errors(openapi)
        .register(router, openapi);

    OperationBuilder::delete("/bookmarks/v1/bookmarks/:id")
        .operation_id("bookmarks.delete")
        .authenticated()
        .no_license_required()
        .handler(handlers::delete)
        .standard_errors(openapi)
        .register(router, openapi);
}
```

Every route declares its auth posture (`.authenticated()`) and whether a license is required. See [REST / gRPC Host](/intro/core/rest-grpc-host) for the full `OperationBuilder` API.

### Handlers (`modules/bookmarks/src/api/rest/handlers.rs`)

```rust
use axum::extract::{Extension, Path, Query};
use axum::Json;
use std::sync::Arc;
use toolkit_canonical_errors::ApiResult;
use toolkit_odata::ODataQuery;
use toolkit_security::SecurityContext;
use toolkit_sdk::Page;
use uuid::Uuid;

use super::dto::{BookmarkDto, CreateBookmarkDto, UpdateBookmarkDto};
use crate::domain::service::Service;

pub async fn list(
    Extension(ctx): Extension<SecurityContext>,
    Extension(svc): Extension<Arc<Service>>,
    Query(query): Query<ODataQuery>,
) -> ApiResult<Json<Page<BookmarkDto>>> {
    let page = svc.list(&ctx, query).await?;
    Ok(Json(page.map(BookmarkDto::from)))
}

pub async fn create(
    Extension(ctx): Extension<SecurityContext>,
    Extension(svc): Extension<Arc<Service>>,
    Json(body): Json<CreateBookmarkDto>,
) -> ApiResult<Json<BookmarkDto>> {
    let bookmark = svc.create(&ctx, body.into()).await?;
    Ok(Json(BookmarkDto::from(bookmark)))
}

pub async fn get(
    Extension(ctx): Extension<SecurityContext>,
    Extension(svc): Extension<Arc<Service>>,
    Path(id): Path<Uuid>,
) -> ApiResult<Json<BookmarkDto>> {
    let bookmark = svc.get(&ctx, id).await?;
    Ok(Json(BookmarkDto::from(bookmark)))
}

pub async fn update(
    Extension(ctx): Extension<SecurityContext>,
    Extension(svc): Extension<Arc<Service>>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateBookmarkDto>,
) -> ApiResult<Json<BookmarkDto>> {
    let bookmark = svc.update(&ctx, id, body.into()).await?;
    Ok(Json(BookmarkDto::from(bookmark)))
}

pub async fn delete(
    Extension(ctx): Extension<SecurityContext>,
    Extension(svc): Extension<Arc<Service>>,
    Path(id): Path<Uuid>,
) -> ApiResult<()> {
    svc.delete(&ctx, id).await?;
    Ok(())
}
```

Handlers are thin -- they extract context and inputs from the request, delegate to the service, and convert the result to a DTO. All error handling flows through `ApiResult`, which converts domain errors into [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) Problem Details responses.

## 9. Declare the gear

### Gear declaration (`modules/bookmarks/src/gear.rs`)

```rust
#[toolkit::gear(
    name = "bookmarks",
    capabilities = [db, rest],
    client = bookmarks_sdk::BookmarkApi,
)]
pub struct BookmarksGear {
    service: Arc<Service>,
}
```

The `capabilities = [db, rest]` tells the runtime this module participates in the database migration and REST route registration [lifecycle phases](/intro/life-cycle). The `client` field registers the SDK trait in `ClientHub` so other modules can resolve it.

## 10. Build and run

```bash
cargo gears build
cargo gears run
```

The runtime will:

1. Run database migrations (creating the `bookmarks` table)
2. Register REST routes under `/bookmarks/v1/bookmarks`
3. Start the HTTP server

## 11. Test with curl

```bash
# Create a bookmark
curl -X POST http://localhost:8080/bookmarks/v1/bookmarks \
  -H "Content-Type: application/json" \
  -d '{"url": "https://rust-lang.org", "title": "Rust", "description": "The Rust programming language"}'

# List bookmarks with OData filter
curl "http://localhost:8080/bookmarks/v1/bookmarks?\$filter=title eq 'Rust'&\$top=10"

# Get a bookmark by ID
curl http://localhost:8080/bookmarks/v1/bookmarks/<id>

# Update a bookmark
curl -X PATCH http://localhost:8080/bookmarks/v1/bookmarks/<id> \
  -H "Content-Type: application/json" \
  -d '{"description": "A systems programming language"}'

# Delete a bookmark
curl -X DELETE http://localhost:8080/bookmarks/v1/bookmarks/<id>
```

## 12. Run lint and tests

```bash
cargo gears lint              # formatting + Clippy
cargo gears test              # run test suite with nextest
```

See the [Manifest](/intro/manifest#lint-policy) page for lint and test configuration options.

## What you've built

```
bookmarks-app/
  Gears.toml
  config/quickstart.yml
  modules/
    hello-world/              # Starter module (can be removed)
    bookmarks/
      src/
        gear.rs               # Gear declaration with db + rest
        api/rest/             # DTOs, handlers, routes
        domain/               # Service, errors, local client
        infra/storage/        # Entity, mapper, migrations
      sdk/
        src/                  # Public API trait + models
```

Your application follows the Gears architecture:

- **SDK first** -- the public contract is defined before implementation
- **Secure by default** -- `SecureConn` enforces tenant isolation at the query level
- **Transport agnostic** -- the SDK trait works identically for in-process and gRPC consumers
- **OpenAPI generated** -- `OperationBuilder` produces a full OpenAPI spec alongside the routes

## Next steps

- **[Brown Project](./brown-project)** -- extend this app with a link-checker background worker and inter-module communication
- [Toolkit documentation](/toolkit/) -- deep-dive into each pattern
- [API Reference](/reference/api-reference) -- browse the toolkit crate sources
