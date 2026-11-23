import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const file = `${path}/${entry.name}`;
    if (entry.isDirectory()) await walk(file);
    else if (file.endsWith(".js") || file.endsWith(".mjs")) {
      const r = spawnSync(process.execPath, ["--check", file], {
        stdio: "inherit",
      });
      if (r.status) process.exit(r.status);
    }
  }
}
await walk("src");
await walk("scripts");
console.log("All JavaScript modules parsed successfully.");
