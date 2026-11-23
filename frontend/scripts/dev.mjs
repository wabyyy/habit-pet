// 給組員在自己的電腦預覽：npm run dev。雲端預覽由平台另行管理。
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const base = resolve("src"),
  port = Number(process.env.PORT || 5173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const file = resolve(
        base,
        "." + pathname + (pathname.endsWith("/") ? "index.html" : ""),
      );
      if (!file.startsWith(base + sep)) throw Error();
      if (!(await stat(file)).isFile()) throw Error();
      res.writeHead(200, {
        "content-type": types[extname(file)] || "application/octet-stream",
        "x-content-type-options": "nosniff",
      });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("找不到這個頁面。");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Local preview: http://127.0.0.1:${port}`),
  );
