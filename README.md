# Gears Documentation

This repository contains the source code and content for the **Gears Documentation Site**. It is built using **VitePress**, a modern, fast, static site generator.

---

## Table of Contents
1. [What is VitePress?](#what-is-vitepress)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
4. [Development Commands](#development-commands)
5. [How to Add or Edit Content](#how-to-add-or-edit-content)

---

## What is VitePress?

[VitePress](https://vitepress.dev/) is a Vite-powered static site generator (SSG) designed for writing fast, content-centric websites. It is the successor to VuePress and is built on top of Vite and Vue 3.

---

## Prerequisites

Before starting, ensure you have the following installed:
- [Bun](https://bun.sh/)

---

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone git@github.com:constructorfabric/gears-webdocs.git
   cd gears-webdocs
   ```

2. **Install dependencies**:
   Using Bun:
   ```bash
   bun install
   ```

---

## Development Commands

All documentation-related scripts are defined in `package.json` and are run against the `docs` folder.

| Command | Usage | Description |
| :--- | :--- | :--- |
| **Start Development** | `bun run docs:dev` | Launches a local development server at `http://localhost:5173` with instant reloading on changes. |
| **Build Site** | `bun run docs:build` | Compiles Markdown files and assets into optimized static HTML files under `docs/.vitepress/dist`. |
| **Preview Build** | `bun run docs:preview` | Spins up a local server to preview the built static site before deployment. |

---

## How to Add or Edit Content

### 1. Modifying Existing Pages
Simply find the relevant `.md` file in the `docs` directory or its subdirectories (such as `docs/intro` or `docs/reference`) and edit the Markdown content.

### 2. Creating New Pages
1. Create a new `.md` file inside the appropriate directory (e.g., `docs/intro/my-new-page.md`).
2. Add your content. You can use standard Markdown as well as VitePress features like custom alert boxes:
   ```markdown
   ::: info
   This is an information box.
   :::
   ```

### 3. Adding to Navigation and Sidebar
To make your new page accessible, you must register it in the sidebar or navigation bar inside the main config file:
- File path: [`gears-webdocs/docs/.vitepress/config.mts`](gears-webdocs/docs/.vitepress/config.mts)

For example, to add a new page to the `Intro` sidebar category, find the `sidebar` configuration and add a new item under `items`:
```typescript
{ text: "My New Page", link: "/intro/my-new-page" }
```
*(Note: Always omit the `.md` extension in configuration links).*
