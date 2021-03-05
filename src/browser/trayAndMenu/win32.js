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
  const contextMenu = Menu.buildFromTemplate([
    { label: "打开" + app.name, click: showMainWindow },
    { label: "关于" + app.name, click: createAboutWindow },
    { type: "separator" },
    { label: "退出", click: () => app.quit() }
  ]);
  tray.setContextMenu(contextMenu);
}

// 顶部菜单
// electron内置了很多menuItem
function setAppMenu() {
  const appMenu = Menu.buildFromTemplate([]);
  app.applicationMenu = appMenu;
}

// app onReady 的Promise写法
app.whenReady().then(() => {
  setTray();
  setAppMenu();
});
