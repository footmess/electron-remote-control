// You can mix require and export.
// You can‘t mix import and module.exports.
// import { BrowserWindow } from 'electron'
// import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const {BrowserWindow} = require('electron')
const {createProtocol} = require('vue-cli-plugin-electron-builder/lib')

/**
 * 公共创建窗口的函数 
**/
let win;
function create() {
    // Create the browser window.
    win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: true
      }
    })
  
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
      if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
      createProtocol('app')
      // Load the index.html when not in development
      win.loadURL('app://./index.html')
    }
}

/**
 * 向渲染进程发送数据 
 * 需要通过webContents来转发
**/
function send(channel,...args) {
    win.webContents.send(channel,...args);
}

module.exports = {create,send}