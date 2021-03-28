import { app, BrowserWindow, ipcMain } from "electron";
import protocolRegister from "./utils/protocolRegister";
import process from "process";
import chalk from "chalk";
import path from "path";

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "false";

const protocol = protocolRegister("app");
protocol.privileged();

app.whenReady().then(() => {
  protocol.register();
  let w = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
      preload: path.resolve(__dirname, "preload.js"),
    },
  });
  if (process.env["NODE_ENV"] == "development") {
    w.loadURL("http://localhost:" + process.env["DEV_SERVER_PORT"]);
    w.webContents.openDevTools();
  } else {
    w.loadURL(`app://./`);
  }

  ipcMain.on("msg", () => console.log("main: hello!"));
});
