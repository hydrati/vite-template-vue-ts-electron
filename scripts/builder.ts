import devConfig from "./rollup.dev.config";
import prodConfig from "./rollup.prod.config";
import { rollup, RollupBuild } from "rollup";
import chalk from "chalk";
import path from "path";
import type { BuildHookOptions } from "./hooks";

export default async function build(
  env: "dev" | "prod",
  opts: BuildHookOptions = {}
) {
  switch (env) {
    case "dev":
      return buildDev(opts);
    case "prod":
      return buildProd(opts);
  }
}

async function buildDev(opts: BuildHookOptions = {}) {
  console.log(
    chalk.cyan.bold("  vite:electron:build"),
    "\t",
    "Building Main Script..",
    chalk.gray("(dev)")
  );
  let b: RollupBuild;
  try {
    b = await rollup({
      ...devConfig,
      input: path.resolve(process.cwd(), "src", "app", "app.ts"),
      onwarn: (e) => {
        console.log(
          chalk.cyan.bold("  vite:electron:build"),
          "\t",
          chalk.yellow("Compile Warning"),
          ":  ",
          e.toString()
        );
      },
    });
    let a = await b.generate({});
    await b.write({
      file: path.resolve(process.cwd(), "main.js"),
      sourcemap: true,
      format: "cjs",
    });
    console.log(
      chalk.cyan.bold("  vite:electron:build"),
      "\t",
      " Main Script Builded",
      chalk.gray("(dev)")
    );
    if (opts.preload != undefined && typeof opts.preload == "string") {
      console.log(
        chalk.cyan.bold("  vite:electron:build"),
        "\t",
        "Building Preload Script...",
        chalk.gray("(dev)")
      );
      b = await rollup({
        ...devConfig,
        input: path.resolve(process.cwd(), "src", "app", opts.preload),
        onwarn: (e) => {
          console.log(
            chalk.cyan.bold("  vite:electron:build"),
            "\t",
            chalk.yellow("Compile Warning"),
            ":  ",
            e.toString()
          );
        },
      });
      let a = await b.generate({});
      await b.write({
        file: path.resolve(process.cwd(), "preload.js"),
        sourcemap: true,
        format: "cjs",
      });
      console.log(
        chalk.cyan.bold("  vite:electron:build"),
        "\t",
        " Preload Script Builded",
        chalk.gray("(dev)")
      );
    }
  } catch (e) {
    console.log(
      chalk.cyan.bold("  vite:electron:build"),
      "\t",
      chalk.red("Compile Error\n"),
      e
    );
  }

  return b;
}

async function buildProd(opts: BuildHookOptions = {}) {
  console.log(
    chalk.cyan.bold("  vite:electron:build"),
    "\t",
    "Building Main Script...",
    chalk.gray("(prod)")
  );
  let b;
  try {
    b = await rollup({
      ...prodConfig,
      input: path.resolve(process.cwd(), "src", "app", "app.ts"),
      onwarn: (e) => {
        console.log(
          chalk.cyan.bold("  vite:electron:build"),
          "\t",
          chalk.yellow("Compile Warning"),
          ":  ",
          e.toString()
        );
      },
    });
    let a = await b.generate({});
    await b.write({
      file: path.resolve(process.cwd(), "build", "main.js"),
      sourcemap: false,
      format: "cjs",
    });
    console.log(
      chalk.cyan.bold("  vite:electron:build"),
      "\t",
      " Main Script Builded",
      chalk.gray("(prod)")
    );
    if (opts.preload != undefined && typeof opts.preload == "string") {
      console.log(
        chalk.cyan.bold("  vite:electron:build"),
        "\t",
        "Building Preload Script...",
        chalk.gray("(prod)")
      );
      b = await rollup({
        input: path.resolve(process.cwd(), "src", "app", opts.preload),
        ...devConfig,
        onwarn: (e) => {
          console.log(
            chalk.cyan.bold("  vite:electron:build"),
            "\t",
            chalk.yellow("Compile Warning"),
            ":  ",
            e.toString()
          );
        },
      });
      let a = await b.generate({});
      await b.write({
        file: path.resolve(process.cwd(), "build", "preload.js"),
        sourcemap: false,
        format: "cjs",
      });
      console.log(
        chalk.cyan.bold("  vite:electron:build"),
        "\t",
        " Preload Script Builded",
        chalk.gray("(prod)")
      );
    }
  } catch (e) {
    console.log(
      chalk.cyan.bold("  vite:electron:build"),
      "\t",
      chalk.red("Compile Error\n"),
      e
    );
  }
  return b;
}
