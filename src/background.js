"use strict";

import { app, protocol, BrowserWindow, globalShortcut } from "electron";
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const handleIPC = require("./ipc");
const {
  create: createMainWindow,
  show: showMainWindow,
  close: closeMainWindow
} = require("./windows/main");
const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

app.allowRendererProcessReuse = false;
// 获取实例锁
const appLock = app.requestSingleInstanceLock();

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  } else {
    console.log("active");
    showMainWindow();
  }
});

if (!appLock) {
  app.quit();
} else {
  // 主进程监听是否有第二个实例
  // https://www.electronjs.org/docs/api/app#apprequestsingleinstancelock
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    console.log({ event, commandLine, workingDirectory });
    showMainWindow();
  });
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", () => {
    createMainWindow();
    handleIPC();
    require("./robot.js")();
  });
}

app.on("before-quit", () => {
  closeMainWindow();
});

app.on("will-quit", () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
