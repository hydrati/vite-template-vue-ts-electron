import HelloWorld from "../components/HelloWorld";
import { defineComponent } from "vue";
import Electron from "electron";
import ElectronLogo from "../assets/logo-electron.png";
import Logo from "../assets/logo.png";
console.log(Electron);
export default defineComponent({
  name: "Home",
  setup() {
    const sendMessage = () => {
      Electron.ipcRenderer.send("msg");
    };
    

    return () => (
      <>
        <img alt="Vue logo" src={ElectronLogo} class="logo logo-electron" />
        <img alt="Electron logo" src={Logo} class="logo" />
        <HelloWorld msg="Hello Vue 3 + TypeScript + Vite + Electron" />
        <button onClick={sendMessage}>Send Message!</button>
      </>
    );
  },
});
