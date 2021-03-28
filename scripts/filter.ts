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
}

export default (ifcfg: FilterConfig) =>
  ({
    name: "vite:electron:filter",
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
            code: `"use strict";var _ref, _ref2, _ref3, _globalThis$require;var _require$ = (_ref = (_ref2 = (_ref3 = (_globalThis$require = globalThis.require) !== null && _globalThis$require !== void 0 ? _globalThis$require : global.require) !== null && _ref3 !== void 0 ? _ref3 : window.require) !== null && _ref2 !== void 0 ? _ref2 : (void 0).require) !== null && _ref !== void 0 ? _ref : function () {throw new Error("Not support CommonJS!");};export default _require$('${d.groups?.name}');`,
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

export const BuildFilter = (include: string[]) => {
  const resolved = include.map((v) => require.resolve(v));
  const cjsOpts = {
    requireReturnsDefault: (i) => include.lastIndexOf(i) != -1,
    transformMixedEsModules: true,
    esmExternals: include,
    ignore: include,
  };
  let aliaslist = {};
  include.map((v) => (aliaslist[v] = "__vite-browser-external:" + v));
  return {
    name: "vite:electron:build:filter",
    enforce: "pre",
    apply: "build",
    config(c) {
      console.log(
        chalk.cyan.bold("  vite:electron:build:filter"),
        "\t",
        "Register Alias..."
      );
      if (c.resolve == undefined) {
        c.resolve = { alias: aliaslist };
        return c;
      } else if (c.resolve.alias instanceof Array) {
        c.resolve.alias = { ...aliaslist, ...c.resolve.alias };
        return c;
      }

      console.log(
        chalk.cyan.bold("\n  vite:electron:build:filter"),
        "\t",
        "Injecting CommonJS Plugin...\n"
      );
      if (c.build == undefined) {
        c.build = {
          commonjsOptions: cjsOpts,
        };
        return c;
      }

      if (typeof c.build.commonjsOptions == "object") {
        c.build.commonjsOptions = {
          ...c.build.commonjsOptions,
          ...cjsOpts,
        };
      }
    },
    load(id) {
      if (/^__vite-browser-external:(.*?)$/.test(id)) {
        console.log(
          chalk.cyan.bold("\n  vite:electron:build:filter"),
          "\t",
          "Resolving External Module...\n"
        );
        let ma = id.match(/^__vite-browser-external:(.*?)$/);
        console.log(
          chalk.cyan.bold("\n  vite:electron:build:filter"),
          "\t",
          "Resolved to",
          ma[1],
          "\n"
        );
        id = ma[1];
        if (include.lastIndexOf(id) != -1) {
          let n = include.lastIndexOf(id);
          return `"use strict";var _ref, _ref2, _ref3, _globalThis$require;var _require$ = (_ref = (_ref2 = (_ref3 = (_globalThis$require = globalThis.require) !== null && _globalThis$require !== void 0 ? _globalThis$require : global.require) !== null && _ref3 !== void 0 ? _ref3 : window.require) !== null && _ref2 !== void 0 ? _ref2 : (void 0).require) !== null && _ref !== void 0 ? _ref : function () {throw new Error("Not support CommonJS!");};export default _require$('${include[n]}');`;
        }
      }
    },

    transform(_, id) {
      let p = path.normalize(id);
      if (resolved.lastIndexOf(id) != -1) {
        console.log(
          chalk.cyan.bold("\n  vite:electron:build:filter"),
          "\t",
          "Resolving External Module...\n"
        );
        let n = resolved.lastIndexOf(id);
        console.log(
          chalk.cyan.bold("\n  vite:electron:build:filter"),
          "\t",
          "Resolved to",
          include[n],
          "\n"
        );

        return {
          code: `"use strict";var _ref, _ref2, _ref3, _globalThis$require;var _require$ = (_ref = (_ref2 = (_ref3 = (_globalThis$require = globalThis.require) !== null && _globalThis$require !== void 0 ? _globalThis$require : global.require) !== null && _ref3 !== void 0 ? _ref3 : window.require) !== null && _ref2 !== void 0 ? _ref2 : (void 0).require) !== null && _ref !== void 0 ? _ref : function () {throw new Error("Not support CommonJS!");};export default _require$('${include[n]}');`,
        };
      } else if (include.lastIndexOf(p) != -1) {
        console.log(
          chalk.cyan.bold("\n  vite:electron:build:filter"),
          "\t",
          "Resolving External Module...\n"
        );
        let n = include.lastIndexOf(p);
        console.log(
          chalk.cyan.bold("\n  vite:electron:build:filter"),
          "\t",
          "Resolved to",
          include[n],
          "\n"
        );
        return {
          code: `"use strict";var _ref, _ref2, _ref3, _globalThis$require;var _require$ = (_ref = (_ref2 = (_ref3 = (_globalThis$require = globalThis.require) !== null && _globalThis$require !== void 0 ? _globalThis$require : global.require) !== null && _ref3 !== void 0 ? _ref3 : window.require) !== null && _ref2 !== void 0 ? _ref2 : (void 0).require) !== null && _ref !== void 0 ? _ref : function () {throw new Error("Not support CommonJS!");};export default _require$('${include[n]}');`,
        };
      } else if (include.lastIndexOf(id) != -1) {
        console.log(
          chalk.cyan.bold("\n  vite:electron:build:filter"),
          "\t",
          "Resolving External Module...\n"
        );
        let n = include.lastIndexOf(id);
        console.log(
          chalk.cyan.bold("  vite:electron:build:filter"),
          "\t",
          "Resolved to",
          include[n],
          "\n"
        );
        return {
          code: `"use strict";var _ref, _ref2, _ref3, _globalThis$require;var _require$ = (_ref = (_ref2 = (_ref3 = (_globalThis$require = globalThis.require) !== null && _globalThis$require !== void 0 ? _globalThis$require : global.require) !== null && _ref3 !== void 0 ? _ref3 : window.require) !== null && _ref2 !== void 0 ? _ref2 : (void 0).require) !== null && _ref !== void 0 ? _ref : function () {throw new Error("Not support CommonJS!");};export default _require$('${include[n]}');`,
        };
      } else if (resolved.lastIndexOf(p) != -1) {
        console.log(
          chalk.cyan.bold("  vite:electron:build:filter"),
          "\t",
          "Resolving External Module...\n"
        );
        let n = resolved.lastIndexOf(p);
        console.log(
          chalk.cyan.bold("  vite:electron:build:filter"),
          "\t",
          "Resolved to",
          include[n],
          "\n"
        );
        return {
          code: `"use strict";var _ref, _ref2, _ref3, _globalThis$require;var _require$ = (_ref = (_ref2 = (_ref3 = (_globalThis$require = globalThis.require) !== null && _globalThis$require !== void 0 ? _globalThis$require : global.require) !== null && _ref3 !== void 0 ? _ref3 : window.require) !== null && _ref2 !== void 0 ? _ref2 : (void 0).require) !== null && _ref !== void 0 ? _ref : function () {throw new Error("Not support CommonJS!");};export default _require$('${include[n]}');`,
        };
      }
    },
  } as Plugin;
};
