import type { Plugin } from "vite";
import Watcher from "./watcher";
import Filter, { FilterConfig } from "./filter";
import SKIP_MODULES from "./externalist";
import path from "path";
import builder from "./builder";
import electronBuilder from "electron-builder";
import fs from "fs-extra";
import { BuildFilter } from "./filter";
import chalk from "chalk";

export interface ServeHookOptions {
  filter?: FilterConfig;
}

export { SKIP_MODULES };

export const SKIP_DIR = ((d) => [
  path.resolve(d, "src/app"),
  path.resolve(d, "scripts"),
  path.resolve(d, "node_modules"),
  path.resolve(d, "src/app/**/*.*"),
  path.resolve(d, "scripts/**/*.*"),
  path.resolve(d, "node_modules/**/*.*"),
  path.resolve(d, "main.js"),
  path.resolve(d, "preload.js"),
  path.resolve(d, "dist/**/*.*"),
  path.resolve(d, "temp/**/*.*"),
  path.resolve(d, "dist"),
  path.resolve(d, "temp"),
  path.resolve(d, "build"),
  path.resolve(d, "build/**/*.*"),
])(process.cwd());

export const serveHook: (
  opts?: ServeHookOptions,
  bopts?: BuildHookOptions
) => Plugin[] = (opts = {}, bopts = {}) => {
  return [
    {
      name: "vite:electron:pre-serve-hook",
      enforce: "pre",
      apply: "serve",
      config: (c) => {
        if (c.optimizeDeps == undefined) c.optimizeDeps = {};
        c.optimizeDeps.exclude = SKIP_MODULES;
        if (c.server == undefined) c.server = {};
        if (c.server.watch == undefined) c.server.watch = {};
        if (c.server.watch.ignored != undefined) {
          if (typeof c.server.watch.ignored == "string") {
            c.server.watch.ignored = [c.server.watch.ignored, ...SKIP_DIR];
          } else if (c.server.watch.ignored instanceof Array) {
            c.server.watch.ignored = [...c.server.watch.ignored, ...SKIP_DIR];
          }
        } else {
          c.server.watch.ignored = SKIP_DIR;
        }
        return c;
      },
    },
    {
      name: "vite:electron:serve-hook",
      enforce: "post",
      apply: "serve",
      configureServer: (s) => {
        s.httpServer.on("listening", () => Watcher(s, bopts));
      },
    },
    Filter({
      ...opts.filter,
      include: [...(opts?.filter?.include ?? []), ...SKIP_MODULES],
    }),
  ];
};

export interface BuildHookOptions {
  preload?: string;
}

export const buildHook: (
  opts?: BuildHookOptions,
  s?: ServeHookOptions
) => Plugin[] = (opt = {}, s = {}) => {
  const SKIP = [...(s?.filter?.include ?? []), ...SKIP_MODULES];
  return [
    BuildFilter(SKIP),
    {
      name: "vite:electron-builder:hook",
      apply: "build",
      config(c) {
        if (c.build == undefined) c.build = {};
        c.build.outDir = "build";
        return c;
      },
      resolveId(source, importer, options) {
        console.log(source, importer, options);
        return false;
      },
      async transform(_, id) {
        if (SKIP.indexOf(id) > -1) {
          return {
            code:
              "const __esModule = false; export {__esModule}; const o = " +
              (s.filter.requireFn ?? "globalThis.require") +
              "('" +
              id +
              "'); export {o as default};",
          };
        }
      },
      async closeBundle() {
        console.log("");
        console.log(
          "  " + chalk.cyanBright.bold("vite:electron:build:hook"),
          "\tRenderer Builded"
        );
        await builder("prod", opt);
        console.log(
          "  " + chalk.cyanBright.bold("vite:electron:build"),
          "\t Write `package.json`"
        );
        let s = JSON.parse(
          fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8")
        );
        delete s["scripts"];
        fs.writeFileSync(
          path.resolve(process.cwd(), "build", "package.json"),
          JSON.stringify(s)
        );
        return;
      },
    },
  ];
};

export interface HookOptions {
  serve?: ServeHookOptions;
  build?: BuildHookOptions;
}

export default function ViteElectron(o: HookOptions = {}) {
  return [
    {
      name: "vite:electron",
    },
    ...serveHook(o.serve, o.build),
    ...buildHook(o.build, o.serve),
  ];
}
