import { app, BrowserWindow, ipcMain, protocol } from "electron";
import protocolRegister from "./utils/protocolRegister";
import process from "process";
import path from "path";

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "false";

let mainWindow: BrowserWindow;
const myProtocol = protocolRegister("app");
protocol.registerSchemesAsPrivileged([myProtocol.privileged()]);

app.whenReady().then(() => {
  myProtocol.register();
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
      preload: path.resolve(__dirname, "preload.js"),
    },
  });
  if (process.env["NODE_ENV"] == "development") {
    mainWindow.loadURL("http://localhost:" + process.env["DEV_SERVER_PORT"]);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`app://./`);
  }

  ipcMain.on("msg", () => console.log("main: hello!"));
});
