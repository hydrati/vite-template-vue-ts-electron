import * as path from "path";
import esbuild from "rollup-plugin-esbuild";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import type { RollupOptions } from "rollup";
import SKIP_MODULES from "./externalist";
import { babel } from "@rollup/plugin-babel";
let config: RollupOptions = {
  // input: path.resolve(process.cwd(), "src", "app", "app.ts"),
  plugins: [
    nodeResolve({
      browser: false,
    }),
    json({
      compact: false,
    }),

    esbuild({
      include: /\.[tj]sx?$/,
      exclude: /node_modules/,
      minify: false,
      target: "esnext",
      tsconfig: path.resolve(process.cwd(), "tsconfig.app.json"),
      sourceMap: true,
    }),
    babel({
      presets: ["env"],
      plugins: [
        "proposal-numeric-separator",
        "proposal-throw-expressions",
        "syntax-import-meta",
        "syntax-top-level-await",
      ],
      babelHelpers: "bundled",
    }),
  ],
  treeshake: true,
  external: [...SKIP_MODULES],
  // output: {
  //   file: path.resolve(process.cwd(), "main.js"),
  //   format: "cjs",
  //   sourcemap: true,
  // },
};

export default config;
