if (process.platform === "darwin") {
  require("./darwin.js");
} else if (process.platform === "win32") {
  require("./win32.js");
} else {
  // TODO 其他平台的处理
}
