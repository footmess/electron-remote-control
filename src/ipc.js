const { ipcMain, Menu, MenuItem } = require("electron");
const { send: sendMainWindow } = require("./windows/main");
const {
  create: createControlWindow,
  send: sendControlWindow
} = require("./windows/control");
const signal = require("./signal");
/**
 * 统一处理ipcMain事件
 **/
module.exports = function() {
  // 处理渲染进程发来的login请求
  ipcMain.handle("login", async () => {
    // 这里就通过signal来处理业务逻辑
    const { code } = await signal.invoke("login", null, "logined");
    return code;
  });

  // 处理渲染进程发来的handle-context-menu请求
  ipcMain.handle("handle-context-menu", () => {
    const menu = new Menu();
    const menuItem1 = new MenuItem({ label: "复制", role: "copy" });
    const menuItem2 = new MenuItem({ label: "分享" });
    menu.append(menuItem1);
    menu.append(menuItem2);
    menu.popup();
  });

  // 监听control channel，将signal响应事件写在这儿更加清楚
  ipcMain.on("control", async (e, remoteCode) => {
    // 这里就通过signal来处理业务逻辑
    signal.send("control", { remoteCode });
  });
  // 响应事件的触发
  signal.on("controlled", data => {
    sendMainWindow("control-state-change", data.remoteCode, 1);
    createControlWindow();
  });
  signal.on("be-controlled", data => {
    sendMainWindow("control-state-change", data.remoteCode, 2);
  });

  // 监听forward channel转发(relay)的事件
  ipcMain.on("forward", async (e, event, data) => {
    // 这里就通过signal来处理业务逻辑
    signal.send("forward", { event, data });
  });
  // 响应事件的触发
  signal.on("offer", data => {
    sendMainWindow("offer", data);
  });
  signal.on("answer", data => {
    sendControlWindow("answer", data);
  });
  signal.on("control-candidate", data => {
    sendMainWindow("candidate", data);
  });
  signal.on("puppet-candidate", data => {
    sendControlWindow("candidate", data);
  });
};
