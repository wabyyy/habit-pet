import { cp, mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("src", "dist", { recursive: true });
await build({
  entryPoints: ["src/main.js"],
  outfile: "dist/main.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
});
await build({
  entryPoints: ["src/styles.css"],
  outfile: "dist/styles.css",
  bundle: true,
  minify: true,
  target: "es2022",
});
console.log("Built browser application and stylesheet: dist/");
