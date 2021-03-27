import HelloWorld from "../components/HelloWorld";
import { defineComponent } from "vue";
import Electron from "electron";
import Logo from "../assets/logo.png";

export default defineComponent({
  name: "Home",
  setup() {
    const sendMessage = () => {
      Electron.ipcRenderer.send("msg");
    };

    return () => (
      <>
        <img alt="Vue logo" src={Logo} />
        <HelloWorld msg="Hello Vue 3 + TypeScript + Vite + Electron" />
        <button onClick={sendMessage}>Send Message!</button>
      </>
    );
  },
});
