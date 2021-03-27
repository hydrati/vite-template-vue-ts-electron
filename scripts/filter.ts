import type { Plugin } from "vite";
import chalk from "chalk";
import path from "path";

export let resolveMap;
export let icfg;
export const nodeMods = [];

export interface FilterConfig {
  include: "$dev" | string[];
  exclude?: string[];
  force?: boolean;
  requireFn?: string;
}

export default (ifcfg: FilterConfig) =>
  ({
    name: "Vitelectron",
    enforce: "pre",
    apply: "serve",

    config(cfg) {
      let alias = {};
      if (ifcfg != undefined) {
        icfg = ifcfg;

        if (ifcfg?.force == true) {
          console.log(
            chalk.cyan.bold("  vite:electron:filter"),
            "\t",
            "Force Mode"
          );
        }

        if (
          ifcfg?.include != undefined &&
          (ifcfg?.include == "$dev" || ifcfg?.include?.includes("$dev"))
        )
          for (const i in globalThis.require(
            path.resolve(process.cwd(), "package.json")
          ).devDependencies) {
            alias[i] = "__vite-browser-external:" + i;
            console.log(
              chalk.cyan.bold("  vite:electron:filter"),
              "\t",
              "External Linked",
              i
            );
          }

        if ((ifcfg.include as any) instanceof Array) {
          let oo = (ifcfg.include as any).filter((v) => v != "$dev");
          if (oo != undefined && oo.length >= 1) {
            for (const i of oo) {
              alias[i] = "__vite-browser-external:" + i;
              console.log(
                chalk.cyan.bold("  vite:electron:filter"),
                "\t",
                "External Linked",
                i
              );
            }
          }
        }

        if (ifcfg?.exclude != undefined && ifcfg?.exclude instanceof Array) {
          for (const k of ifcfg?.exclude) {
            delete alias[k];
            console.log(
              chalk.cyan.bold("  vite:electron:filter"),
              "\t",
              "Exclude:",
              k
            );
          }
        }
      }
      cfg.resolve = cfg.resolve ?? { alias: {} };
      cfg.optimizeDeps = cfg.optimizeDeps ?? {};
      cfg.optimizeDeps.exclude = cfg.optimizeDeps.exclude ?? [];
      cfg.optimizeDeps.exclude = [
        ...cfg.optimizeDeps.exclude,
        ...Object.keys(alias),
      ];
      cfg.resolve.alias = { ...cfg.resolve.alias, ...alias };
      resolveMap = cfg.resolve.alias;
      return cfg;
    },

    transform(_, id) {
      if (/^__vite-browser-external:(.*)$/.test(id)) {
        console.log(
          chalk.cyan.bold("  vite:electron:filter"),
          "\t",
          "Resolving... "
        );
        let d = id.match(/^__vite-browser-external:(?<name>.*)$/);
        if (
          d?.groups?.name != undefined &&
          (Object.keys(resolveMap).includes(d?.groups?.name) ||
            icfg?.force == true)
        ) {
          let res: string | undefined = undefined;
          try {
            res = require.resolve(d?.groups?.name);
          } catch (e) {
            console.log(
              chalk.cyan.bold("  vite:electron:filter"),
              "\t",
              chalk.red("Failed"),
              e
            );
          }
          if (res == undefined) {
            console.error(
              chalk.cyan.bold("  vite:electron:filter"),
              "\t",
              chalk.red("Failed")
            );
          }
          console.log(
            chalk.cyan.bold("  vite:electron:filter"),
            "\t",
            "Resolved:",
            d?.groups?.name + "\n"
          );
          return {
            code:
              "const __esModule = false; export {__esModule}; const o = " +
              (ifcfg.requireFn ?? "globalThis.require") +
              "('" +
              d?.groups?.name +
              "'); export {o as default};",
            map: null,
          };
        }
        console.error(
          chalk.cyan.bold("  vite:electron:filter"),
          "\t",
          chalk.red("Failed")
        );
      }
    },
  } as Plugin);
