/**
 * 所有信令逻辑
 **/
const Websocket = require("ws");
const EventEmitter = require("events");
const signal = new EventEmitter();
// 建立连接
const ws = new Websocket("ws://127.0.0.1:8080");

ws.on("open", () => {
  console.log("success");
});
ws.on("message", function incoming(message) {
  let data = {};
  console.log({ message });
  try {
    data = JSON.parse(message);
  } catch (error) {
    console.log("parse error", error);
  }
  // 触发相应的事件,可以在其他地方通过signal.on监听
  signal.emit(data.event, data.data);
});

/**
 * 封装signal的send方法
 * @params event  str
 * @params data   obj
 **/
function sendData(event, data) {
  console.log("sended", JSON.stringify({ event, data }));
  ws.send(JSON.stringify({ event, data }));
}

/**
 * 封装invoke方法，方便ipcMain中的异步处理
 * @params event   str
 * @params data    obj
 * @params answerData
 */

function invoke(event, data, answerData) {
  return new Promise((resolve, reject) => {
    sendData(event, data);
    // line 21 触发了(emit)事件，正常情况是通过on去响应，这里通过once来只响应一次
    signal.once(answerData, resolve);
    // 通过定时器模拟超时
    setTimeout(() => {
      reject("timeout");
    }, 5000);
  });
}

signal.send = sendData;
signal.invoke = invoke;
module.exports = signal;
