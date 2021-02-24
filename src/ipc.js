const { ipcMain } = require("electron");
const {
  send: sendMainWindow,
} = require("./windows/main");
const {create:createControlWindow} = require('./windows/control');
/**
* 统一处理ipc事件
**/
module.exports = function() {
  // 处理渲染进程发来的login请求
  ipcMain.handle("login", async () => {
    // 先mock，随机生成6位数
    const code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return code;
  });
  // 监听control事件
  ipcMain.on("control", async (e, remoteCode) => {
    // 先mock
    sendMainWindow("control-state-change", remoteCode, 1);
    createControlWindow();
  });
};
