<template>
   <div v-if="controlText === ''">
      <p>你的控制码：{{ localCode }}</p>
      <input type="text" v-model="remoteCode" />
      <button @click="handleClick(remoteCode)">确认</button>
    </div>
    <div v-else>{{ controlText }}</div>
</template>

<script>
// @ is an alias to /src
import { ipcRenderer } from "electron";

export default {
  name: "Home",
  data() {
    return {
      remoteCode: "",
      localCode: "",
      controlText: ""
    };
  },
  mounted() {
    ipcRenderer.on("control-state-change", this.handleControlState);
    // 清除事件监听程序
    // 一次性监听当前组件的beforeDestroy钩子函数 https://cn.vuejs.org/v2/guide/components-edge-cases.html
    this.$once("hook:beforeDestroy", () => {
      ipcRenderer.removeListener(
        "control-state-change",
        this.handleControlState
      );
    });
  },
  created() {
    this.login();
  },
  methods: {
    async login() {
      // 渲染进程通知主进程
      const code = await ipcRenderer.invoke("login");
      this.localCode = code;
    },
    /**
     * control-state-change的事件处理程序
     * 将主进程传来的信息给渲染进程
     **/
    handleControlState(e, name, type) {
      let text = "";
      if (type === 1) {
        // 控制别人
        text = `正在远程控制${name}`;
      } else if (type === 2) {
        // 被控制
        text = `被${name}控制中`;
      }
      this.controlText = text;
    },
    /**
     * 向主进程发起一个IPC请求
     * params code 远端控制码
     **/
    handleClick(code) {
      ipcRenderer.send("control", code);
    }
  }
};
</script>
