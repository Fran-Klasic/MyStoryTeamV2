// vite.config.ts
import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

function getHtmlInputs(dir = "html", root = dir) {
  const entries: Record<string, string> = {
    main: path.resolve("index.html"), // root index
  };

  function walk(current: string) {
    for (const file of fs.readdirSync(current)) {
      const full = path.join(current, file);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else if (file.endsWith(".html")) {
        const name = path
          .relative(root, full)
          .replace(/\\/g, "/")
          .replace(".html", "");

        entries[name] = path.resolve(full);
      }
    }
  }

  walk(dir);
  return entries;
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: getHtmlInputs(),
    },
  },
});
