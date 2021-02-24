// node事件模块 监听和触发事件
const EventEmitter = require("events");
const peer = new EventEmitter();
const { desktopCapturer } = require("electron");
// 使用electron模拟控制端收到视频流的过程
// https://www.electronjs.org/docs/api/desktop-capturer?q=getUserMedia
async function getScreenStream() {
  // 获取媒体源信息 electron小于5.0返回callback，大于5.0返回一个promise
  const sources = await desktopCapturer.getSources({ types: ["screen"] });
  // 调用navigator.mediaDevices.getUserMedia()函数获取流
  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sources[0].id,
          maxWidth: window.screen.width,
          maxHeight: window.screen.height
        }
      }
    })
    .then(stream => {
      peer.emit("add-stream", stream);
    })
    .catch(err => {
      console.error(err);
    });
}
getScreenStream();
module.exports = peer;
