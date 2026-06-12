import { defineConfig } from "vitepress"

const toolkit = {
  text: "Toolkit",
  collapsed: false,
  items: [
    { text: "Overview", link: "/toolkit/" },
    { text: "Gear Overview", link: "/toolkit/00_gear_overview" },
    { text: "ToolKit Overview", link: "/toolkit/01_overview" },
    { text: "Gear Layout & SDK Pattern", link: "/toolkit/02_gear_layout_and_sdk_pattern" },
    { text: "ClientHub & Plugins", link: "/toolkit/03_clienthub_and_plugins" },
    { text: "REST Operation Builder", link: "/toolkit/04_rest_operation_builder" },
    { text: "Errors (RFC 9457)", link: "/toolkit/05_errors_rfc9457" },
    { text: "AuthN/AuthZ & Secure ORM", link: "/toolkit/06_authn_authz_secure_orm" },
    { text: "OData Pagination & Filtering", link: "/toolkit/07_odata_pagination_select_filter" },
    { text: "Lifecycle & Stateful Tasks", link: "/toolkit/08_lifecycle_stateful_tasks" },
    { text: "OoP gRPC SDK Pattern", link: "/toolkit/09_oop_grpc_sdk_pattern" },
    { text: "Checklists & Templates", link: "/toolkit/10_checklists_and_templates" },
    { text: "Database Patterns", link: "/toolkit/11_database_patterns" },
    { text: "Unit Testing", link: "/toolkit/12_unit_testing" },
    { text: "E2E Testing", link: "/toolkit/13_e2e_testing" },
  ]
};

const libraries = {
  text: "Libraries",
  collapsed: false,
  items: [
    {
      text: "modkit",
      link: "/reference/modkit",
      items: [
        { text: "modkit-macros", link: "/reference/modkit/modkit-macros" },
        { text: "modkit-sdk", link: "/reference/modkit/modkit-sdk" },
      ],
    },
    { text: "modkit-auth", link: "/reference/modkit/modkit-auth" },
    { text: "modkit-security", link: "/reference/modkit/modkit-security" },
    {
      text: "modkit-errors",
      link: "/reference/modkit/modkit-errors",
      items: [
        { text: "modkit-errors-macro", link: "/reference/modkit/modkit-errors-macro" },
        { text: "modkit-canonical-errors", link: "/reference/modkit/modkit-canonical-errors" },
      ],
    },
    {
      text: "modkit-db",
      link: "/reference/modkit/modkit-db",
      items: [
        { text: "modkit-db-macros", link: "/reference/modkit/modkit-db-macros" },
      ]
    },
    {
      text: "modkit-odata",
      link: "/reference/modkit/modkit-odata",
      items: [
        { text: "modkit-odata-macros", link: "/reference/modkit/modkit-odata-macros" },
      ]
    },
    { text: "modkit-http", link: "/reference/modkit/modkit-http" },
    { text: "modkit-transport-grpc", link: "/reference/modkit/modkit-transport-grpc" },
    { text: "modkit-node-info", link: "/reference/modkit/modkit-node-info" },
    {
      text: "system-sdks", link: "/reference/system-sdks", items: [
        { text: "system-sdk-directory", link: "/reference/system-sdks/system-sdk-directory" },
      ]
    },
  ]
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Gears documentation site",
  description: "Gears docs, tutorials and how-to guides",
  base: "/gears-webdocs/",
  ignoreDeadLinks: true,
  themeConfig: {
    siteTitle: "Gears Docs",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Docs", link: "/intro/introduction", activeMatch: '/intro/' },
      { text: "Toolkit", link: "/toolkit/", activeMatch: '/toolkit/' },
      { text: "Reference", link: "/reference/api-reference", activeMatch: '/reference/' },
      {
        text: "Examples", items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "API examples", link: "/api-examples" }
        ],
      },
    ],

    // https://vitepress.dev/reference/default-theme-sidebar
    sidebar: {
      "/intro": [
        {
          text: "Intro",
          collapsed: false,
          items: [
            { text: "What is Gears?", link: "/intro/introduction" },
            { text: "Getting Started", link: "/intro/getting-started" },
            { text: "Architecture", link: "/intro/architecture" },
            { text: "Lifecycle", link: "/intro/life-cycle" },
            { text: "Manifest", link: "/intro/manifest" },
            { text: "Plugins", link: "/intro/plugins" },
            { text: "FAQ", link: "/intro/faq" },
          ]
        },
        {
          text: "Core concepts",
          collapsed: false,
          items: [
            { text: "Modules", link: "/intro/core/modules" },
            { text: "System Modules", link: "/intro/core/system-modules" },
            { text: "SDK", link: "/intro/core/sdk" },
            { text: "Database", link: "/intro/core/database" },
            { text: "OData", link: "/intro/core/odata" },
            { text: "Rest/gRPC host", link: "/intro/core/rest-grpc-host" },
          ]
        },
        {
          text: "Tutorials",
          collapsed: false,
          items: [
            { text: "Notes app", link: "/intro/tutorials/notes-app" },
          ]
        },
        {
          text: "Resources",
          collapsed: false,
          items: [
            { text: "API reference", link: "/reference/api-reference" },
          ]
        }
      ],
      "/toolkit": [
        toolkit,
      ],
      "/reference": [
        {
          text: "API",
          collapsed: false,
          items: [
            { text: "API reference", link: "/reference/api-reference" },
          ]
        },
        libraries,
      ]
    },

    search: {
      provider: "local",
    },

    editLink: {
      pattern: 'https://github.com/Bechma/cf-docs/edit/dev/docs/:path'
    },

    lastUpdated: {
      text: "Updated at",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short"
      }
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/Bechma" },
    ]
  }
})
