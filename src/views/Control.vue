<template>
  <div class="control-wrap">
    <video id="screen-video" ref="screen-video"></video>
  </div>
</template>

<script>
const peer = require("@/utils/peer-control");
export default {
  name: "Control",
  data() {
    return {
      video: null
    };
  },
  created() {
    peer.on("add-stream", stream => {
      console.log({ stream });
      this.play(stream);
    });
  },
  mounted() {
    this.video = this.$refs["screen-video"];
    // 通过peer监听事件
    window.onkeydown = e => {
      const data = {
        keyCode: e.keyCode,
        key: e.key,
        shift: e.shiftKey,
        meta: e.metaKey,
        ctrl: e.ctrlKey,
        alt: e.altKey
      };
      // 通过peer对象触发事件
      peer.emit("robot", "key", data);
    };
    window.onmouseup = e => {
      // 数据格式 data {clientX,clientY,screen:{width,height},video:{width,height}}
      // 这里只需要把控制端的size传过去 peer对象中会给screen属性赋值
      const data = {
        clientX: e.clientX,
        clientY: e.clientY,
        video: {
          width: this.video.getBoundingClientRect().width,
          height: this.video.getBoundingClientRect().height
        }
      };
      // 通过peer对象触发事件
      peer.emit("robot", "mouse", data);
    };
    this.$once("hook:beforeDestroy", () => {
      window.onkeydown = null;
      window.onmouseup = null;
      this.video = null;
    });
  },
  methods: {
    play(stream) {
      let video = this.$refs["screen-video"];
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
      };
    }
  }
};
</script>

<style lang="scss" scoped>
#screen-video {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
</style>
