// node事件模块 监听和触发事件
const EventEmitter = require("events");
const peer = new EventEmitter();
const { ipcRenderer } = require("electron");
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

// docs: https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/onicecandidate
// WebRTC中可以通过onicecandidate这个事件去拿到对应的iceEvent
pc.onicecandidate = function(event) {
  if (event.candidate) {
    // https://www.electronjs.org/docs/api/ipc-renderer#ipcrenderersendchannel-args
    ipcRenderer.send("forward", "control-candidate", event.candidate.toJSON());
  }
};

// 监听主进程传来的candidate channel
ipcRenderer.on("candidate", (e, candidate) => {
  addIceCandidate(candidate);
});

// candidate缓冲池
let candidates = [];
// 添加candidate
async function addIceCandidate(candidate) {
  // 需要判断candidate的值，有可能是null
  if (candidate) {
    candidates.push(candidate);
  }
  // docs: https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/addIceCandidate
  // 需要判断RTCPeerConnection的remoteDescription是否已经设置 否则会报InvalidStateError
  if (pc.remoteDescription && pc.remoteDescription.type) {
    for (let i = 0; i < candidates.length; i++) {
      await pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
    }
    candidates = [];
  }
}

// 调用createOffer方法创建一个offer 发起连接
async function createOffer() {
  // 这里offer就是一个SDP
  const offer = await pc.createOffer({
    // 只接受视频
    offerToReceiveAudio: false,
    offerToReceiveVideo: true
  });
  // 调用setLocalDescription方法本地保存SDP
  await pc.setLocalDescription(offer);
  // console.log("offer", JSON.stringify(pc.localDescription));
  return pc.localDescription;
}

createOffer().then(offer => {
  ipcRenderer.send("forward", "offer", { type: offer.type, sdp: offer.sdp });
});

// 接收傀儡端传来的answer
async function setRemote(answer) {
  await pc.setRemoteDescription(answer);
}
ipcRenderer.on("answer", (e, answer) => {
  console.log({ e, answer });
  setRemote(answer);
});

pc.ontrack = ev => {
  console.log({ ev });
  peer.emit("add-stream", ev.streams[0]);
};

/**
 * 事件中转站
 */
module.exports = peer;
