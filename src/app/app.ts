import { app, BrowserWindow, ipcMain, protocol } from "electron";
import process from "process";
import * as path from "path";
import { request } from "http";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "false";
protocol.registerSchemesAsPrivileged([
  {
    privileges: {
      standard: true,
      secure: true,
      bypassCSP: true,
      corsEnabled: true,
    },
    scheme: "app",
  },
]);
app.whenReady().then(() => {
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
  } else {
    protocol.registerFileProtocol("app", (req, cb) => {
      const url = new URL(req.url);

      if (url.pathname == "/")
        cb({ path: path.normalize(`${__dirname}/index.html`) });

      cb({ path: path.normalize(`${__dirname}/${url}`) });
    });
    w.loadURL("app://./");
  }
  ipcMain.on("msg", () => console.log("get message"));
});
