import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import type { RollupOptions } from "rollup";
import * as babel from "@rollup/plugin-babel";
// import ts from "rollup-plugin-typescript2";
import esbuild from "rollup-plugin-esbuild";
import terser from "rollup-plugin-terser";
import SKIP_MODULES from "./externalist";
import * as path from "path";

let config: RollupOptions = {
  // input: path.resolve(process.cwd(), "src", "app", "app.ts"),
  plugins: [
    nodeResolve({
      browser: false,
    }),
    json({
      compact: false,
    }),
    // ts({
    //   tsconfig: path.resolve(process.cwd(), "tsconfig.app.json")
    // }),
    esbuild({
      include: /\.[tj]sx?$/,
      exclude: /node_modules/,
      minify: true,
      target: "esnext",
      tsconfig: path.resolve(process.cwd(), "tsconfig.app.json"),
      sourceMap: false,
    }),
    babel.babel({
      presets: ["env"],
      plugins: [
        "proposal-nullish-coalescing-operator",
        "proposal-numeric-separator",
        "proposal-optional-chaining",
        "proposal-throw-expressions",
        "syntax-import-meta",
        "syntax-top-level-await",
        "transform-runtime",
      ],
      babelHelpers: "bundled",
    }),
    terser.terser({
      toplevel: false,
      format: {
        comments: false,
      },
    }),
  ],
  treeshake: true,
  external: [...SKIP_MODULES],
  // output: {
  //   file: path.resolve(process.cwd(), "build", "main.js"),
  //   format: "cjs",
  // },
};
export default config;
