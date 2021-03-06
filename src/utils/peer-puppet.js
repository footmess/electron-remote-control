/**
 * 傀儡端逻辑
 */
const { desktopCapturer, ipcRenderer } = require("electron");
// 使用electron模拟控制端收到视频流的过程
// https://www.electronjs.org/docs/api/desktop-capturer?q=getUserMedia
async function getScreenStream() {
  // 获取媒体源信息 electron小于5.0返回callback，大于5.0返回一个promise
  const sources = await desktopCapturer.getSources({ types: ["screen"] });
  // 调用navigator.mediaDevices.getUserMedia()函数获取流
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: sources[1].id,
            maxWidth: window.screen.width,
            maxHeight: window.screen.height
          }
        }
      })
      .then(stream => {
        resolve(stream);
      })
      .catch(err => {
        console.error(err);
        reject(err);
      });
  });
}

const pc = new window.RTCPeerConnection({});
pc.ondatachannel = event => {
  event.channel.onmessage = event => {
    console.log("received", event.data);
    const { type, data } = JSON.parse(event.data);
    if (type === "mouse") {
      data.screen = {
        width: window.screen.width,
        height: window.screen.height
      };
    }
    ipcRenderer.send("robot", type, data);
  };
};
// docs: https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/onicecandidate
// WebRTC中可以通过onicecandidate这个事件去拿到对应的iceEvent 在RTCPeerConnection创建后会自动发起
pc.onicecandidate = function(event) {
  if (event.candidate) {
    // https://www.electronjs.org/docs/api/ipc-renderer#ipcrenderersendchannel-args
    ipcRenderer.send("forward", "puppet-candidate", event.candidate.toJSON());
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

ipcRenderer.on("offer", (e, offer) => {
  createAnswer(offer).then(answer => {
    ipcRenderer.send("forward", "answer", {
      type: answer.type,
      sdp: answer.sdp
    });
  });
});
async function createAnswer(offer) {
  // 调用getScreenStream获取媒体流
  const mediaStream = await getScreenStream();
  for (const track of mediaStream.getTracks()) {
    // 调用addTrack添加轨道
    pc.addTrack(track, mediaStream);
  }
  // 调用setRemoteDescription方法保存控制端SDP
  await pc.setRemoteDescription(offer);
  // 调用setLocalDescription方法保存本地SDP
  await pc.setLocalDescription(await pc.createAnswer());
  return pc.localDescription;
}
