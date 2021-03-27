import watcher from "chokidar";
import path from "path";
import builder from "./builder";
import emon from "electronmon";
import chalk from "chalk";
import electron from "electron/index";
import type { ViteDevServer } from "vite";
import type { AddressInfo } from "net";
import type { BuildHookOptions } from "./hooks";

export default async function watch(
  r: ViteDevServer,
  o: BuildHookOptions = {}
) {
  let address = r.httpServer.address() as AddressInfo;
  console.log(address);
  await builder("dev", o);

  console.log(
    chalk.cyan.bold("  vite:electron:watcher"),
    "\t",
    "Electron Spawned!"
  );

  process.env.DEV_SERVER_PORT = address.port.toString();
  process.env.NODE_ENV = "development";

  let mon = await emon({
    electronPath: electron as string,
    logLevel: "quiet",
    env: {
      DEV_SERVER_PORT: address.port.toString(),
      NODE_ENV: "development",
    },
  });
  watcher
    .watch(path.resolve(process.cwd(), "src", "app"))
    .on("change", async (e) => {
      console.log(
        chalk.cyan.bold("  vite:electron:watcher"),
        "\t",
        "File Changed:",
        e
      );
      console.log(
        chalk.cyan.bold("  vite:electron:builder"),
        "\t",
        "Rebuilding..."
      );
      await builder("dev");
      console.log(
        chalk.cyan.bold("  vite:electron:watcher"),
        "\t",
        "Reloading..."
      );
      await mon.reload();
    });
}
