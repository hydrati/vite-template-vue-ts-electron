import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";
import viteElectron from "./scripts/hooks";

// https://vitejs.dev/config/

const config = defineConfig({
  plugins: [
    vue(),
    jsx(),
    viteElectron({
      build: {
        preload: "preload.ts",
      },
    }),
  ],
});

export default config;
