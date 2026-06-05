import { defineConfig } from "vitepress"

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
  base: "/cf-docs/",
  themeConfig: {
    siteTitle: "Gears Docs",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Docs", link: "/intro/introduction", activeMatch: '/intro/' },
      { text: "Reference", link: "/reference/api-reference", activeMatch: '/reference/' },
      {
        text: "Examples", items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "API examples", link: "/api-examples" }
        ],
      },
    ],

    sidebar: {
      "/intro": [
        {
          text: "Intro",
          collapsed: false,
          items: [
            { text: "What is Gears?", link: "/intro/introduction" },
            { text: "Getting Started", link: "/intro/getting-started" },
            { text: "Architecture", link: "/intro/architecture" },
            { text: "Manifest", link: "/intro/manifest" },
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
