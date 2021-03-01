/**
 * 傀儡端逻辑
 */
const { desktopCapturer } = require("electron");
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
  console.log("answer", JSON.stringify(pc.localDescription));
  return pc.localDescription;
}

window.createAnswer = createAnswer;
