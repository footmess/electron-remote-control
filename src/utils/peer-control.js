// node事件模块 监听和触发事件
const EventEmitter = require("events");
const peer = new EventEmitter();
// getScreenStream();
// peer.on("robot", (type, data) => {
//   if (type === "mouse") {
//     data.screen = {
//       width: window.screen.width,
//       height: window.screen.height
//     };
//   }
//   // 通过ipcRenderer.send方法发送给主进程
//   // setTimeout(() => {
//   ipcRenderer.send("robot", type, data);
//   // },5000)
// });

const pc = new window.RTCPeerConnection({});
async function createOffer() {
  // 调用createOffer方法创建一个offer
  // 这里offer就是一个SDP
  const offer = await pc.createOffer({
    // 只接受视频
    offerToReceiveAudio: false,
    offerToReceiveVideo: true
  });
  // 调用setLocalDescription方法本地保存SDP
  await pc.setLocalDescription(offer);
  console.log("offer", JSON.stringify(pc.localDescription));
  return pc.localDescription;
}

createOffer();

// 接收傀儡端传来的answer
async function setRemote(answer) {
  await pc.setRemoteDescription(answer);
}

// 把setRemote绑定到window上方便测试
window.setRemote = setRemote;

pc.ontrack = ev => {
  console.log({ ev });
  peer.emit("add-stream", ev.streams[0]);
};

/**
 * 事件中转站
 */
module.exports = peer;
