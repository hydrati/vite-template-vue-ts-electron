import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "HelloWorld",
  props: {
    msg: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const count = ref(0);
    const countButtonClick = () => count.value++;

    return () => (
      <>
        <h1>{props.msg}</h1>

        <p>
          Recommended IDE setup:
          <a href="https://code.visualstudio.com/" target="_blank">
            VSCode
          </a>
          &nbsp;+&nbsp;
          <a
            href="https://marketplace.visualstudio.com/items?itemName=octref.vetur"
            target="_blank"
          >
            Vetur
          </a>
          &nbsp;or&nbsp;
          <a href="https://github.com/johnsoncodehk/volar" target="_blank">
            Volar
          </a>
          &nbsp;(if using&nbsp;
          <code>&lt;script setup&gt;</code>&nbsp;)
        </p>

        <p>
          See <code>README.md</code> for more information.
        </p>

        <p>
          <a href="https://vitejs.dev/guide/features.html" target="_blank">
            Vite Docs
          </a>{" "}
          |&nbsp;
          <a href="https://v3.vuejs.org/" target="_blank">
            Vue 3 Docs
          </a>
        </p>

        <button onClick={countButtonClick}>count is: {count.value}</button>
        <p>
          Edit&nbsp;
          <code>components/HelloWorld.tsx</code> to test hot module replacement.
        </p>
      </>
    );
  },
});
