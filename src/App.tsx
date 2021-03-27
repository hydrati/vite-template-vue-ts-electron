import { defineComponent } from "vue";
import { RouterView } from 'vue-router';
import "./styles/global.css";

export default defineComponent({
  name: "App",
  setup() {
    return () => <RouterView />;
  }
});