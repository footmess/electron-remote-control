<template>
  <div class="control-wrap">
    <video id="screen-video" ref="screen-video"></video>
  </div>
</template>

<script>
const peer = require("@/utils/peer-control");
export default {
  name: "Control",
  created() {
    peer.on('add-stream', stream => {
      this.play(stream);
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

<style lang="scss" scoped></style>
