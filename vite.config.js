import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    base: "/ModPack-Dependency-Visualizer/",
    build: {
        chunkSizeWarningLimit: 1600,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                nested: resolve(__dirname, "graph.html"),
            },
        },
    },
});
