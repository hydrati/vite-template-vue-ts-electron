import { defineComponent } from "vue";
import { RouterView } from 'vue-router';
import fs from 'fs';
console.log(fs);
import "./assets/styles/global.css";

export default defineComponent({
  name: "App",
  setup() {
    return () => <RouterView />;
  }
});