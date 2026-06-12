/**
 * Fetches external documentation from the gears-rust repository.
 * Run locally:  bun run docs:fetch
 * CI:           called automatically before build in deploy.yml
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const REPO_RAW =
  "https://raw.githubusercontent.com/constructorfabric/gears-rust/main";
const DOCS_DIR = join(import.meta.dirname, "..", "docs");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function fetchFile(src: string, dest: string): Promise<void> {
  await mkdir(dirname(dest), { recursive: true });
  const url = `${REPO_RAW}/${src}`;
  console.log(`  ↓ ${src}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

async function rewriteLinks(
  filePath: string,
  replacements: [RegExp, string][]
): Promise<void> {
  let content = await readFile(filePath, "utf-8");
  for (const [pattern, replacement] of replacements) {
    content = content.replaceAll(pattern, replacement);
  }
  await writeFile(filePath, content);
}

// ---------------------------------------------------------------------------
// File definitions
// ---------------------------------------------------------------------------
interface FileMapping {
  src: string;
  dest: string;
}

const singleFiles: FileMapping[] = [
  // 1. Architecture Manifest → /intro/architecture.md
  {
    src: "docs/ARCHITECTURE_MANIFEST.md",
    dest: join(DOCS_DIR, "intro", "architecture.md"),
  },
  // 2. Plugins → /intro/plugins.md
  {
    src: "docs/TOOLKIT_PLUGINS.md",
    dest: join(DOCS_DIR, "intro", "plugins.md"),
  },
];

// 3. Toolkit unified system → /toolkit/*.md
const toolkitFiles: string[] = [
  "README.md",
  "00_gear_overview.md",
  "01_overview.md",
  "02_gear_layout_and_sdk_pattern.md",
  "03_clienthub_and_plugins.md",
  "04_rest_operation_builder.md",
  "05_errors_rfc9457.md",
  "06_authn_authz_secure_orm.md",
  "07_odata_pagination_select_filter.md",
  "08_lifecycle_stateful_tasks.md",
  "09_oop_grpc_sdk_pattern.md",
  "10_checklists_and_templates.md",
  "11_database_patterns.md",
  "12_unit_testing.md",
  "13_e2e_testing.md",
];

// 4. Images referenced by the fetched docs
const imageFiles: FileMapping[] = [
  // ARCHITECTURE_MANIFEST.md uses "img/architecture.drawio.png" relative to
  // docs/ in the source repo, but we place it in docs/intro/ so the relative
  // path becomes docs/intro/img/.
  {
    src: "docs/img/architecture.drawio.png",
    dest: join(DOCS_DIR, "intro", "img", "architecture.drawio.png"),
  },
  // toolkit files use "../img/" which resolves to docs/img/ from docs/toolkit/
  {
    src: "docs/img/gear_architecture.drawio.png",
    dest: join(DOCS_DIR, "img", "gear_architecture.drawio.png"),
  },
  {
    src: "docs/img/gears_categories.drawio.png",
    dest: join(DOCS_DIR, "img", "gears_categories.drawio.png"),
  },
];

// 5. Link rewrite rules
// (links to docs outside our site are left as-is; VitePress ignoreDeadLinks
// handles those gracefully)
const introRewrites: [RegExp, string][] = [
  [/\.\/toolkit_unified_system\/README/g, "/toolkit/"],
  [/\.\/toolkit_unified_system\//g, "/toolkit/"],
  [/\.\/ARCHITECTURE_MANIFEST/g, "/intro/architecture"],
  [/\.\/TOOLKIT_PLUGINS/g, "/intro/plugins"],
];

const toolkitRewrites: [RegExp, string][] = [
  [/\.\.\/ARCHITECTURE_MANIFEST/g, "/intro/architecture"],
  [/\.\.\/TOOLKIT_PLUGINS/g, "/intro/plugins"],
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log("⏳ Fetching external docs from gears-rust …");

  // Fetch single files
  for (const { src, dest } of singleFiles) {
    await fetchFile(src, dest);
  }

  // Fetch toolkit files
  for (const file of toolkitFiles) {
    const destName = file === "README.md" ? "index.md" : file;
    await fetchFile(
      `docs/toolkit_unified_system/${file}`,
      join(DOCS_DIR, "toolkit", destName)
    );
  }

  // Fetch images
  for (const { src, dest } of imageFiles) {
    await fetchFile(src, dest);
  }

  // Rewrite cross-references
  console.log("🔗 Rewriting internal cross-references …");

  for (const file of ["architecture.md", "plugins.md"]) {
    const filePath = join(DOCS_DIR, "intro", file);
    await rewriteLinks(filePath, introRewrites);
  }

  const { readdir } = await import("node:fs/promises");
  const tkFiles = await readdir(join(DOCS_DIR, "toolkit"));
  for (const file of tkFiles.filter((f) => f.endsWith(".md"))) {
    await rewriteLinks(join(DOCS_DIR, "toolkit", file), toolkitRewrites);
  }

  console.log("✅ External docs fetched successfully.");
}

main().catch((err) => {
  console.error("❌ Fetch failed:", err);
  process.exit(1);
});
