import Router from './router';
import State from './state';
import { createApp } from "vue";
import App from "./App";

createApp(App)
  .use(Router)
  .use(State)
  .mount("#app");
