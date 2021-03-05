const { app, Menu, Tray } = require("electron");
const { show: showMainWindow } = require("../../windows/main");
const { create: createAboutWindow } = require("../../about");
const path = require("path");

// 原生托盘
let tray;
function setTray() {
  tray = new Tray(path.resolve(__dirname, "./tray.ico"));
  tray.on("click", () => {
    showMainWindow();
  });
  tray.on("right-click", () => {
    // 通过template创建menuItem
    const contextMenu = Menu.buildFromTemplate([
      { label: "显示", click: showMainWindow },
      { label: "退出", click: app.quit }
    ]);
    tray.popUpContextMenu(contextMenu);
  });
}

// 顶部菜单
// electron内置了很多menuItem
function setAppMenu() {
  const appMenu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { label: "About", click: createAboutWindow },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    // 文件菜单,window菜单,edit菜单 才能使用一些特定的快捷键
    { role: "fileMenu" },
    { role: "windowMenu" },
    { role: "editMenu" }
  ]);
  app.applicationMenu = appMenu;
}

// app onReady 的Promise写法
app.whenReady().then(() => {
  setTray();
  setAppMenu();
});
