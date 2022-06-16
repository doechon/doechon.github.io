import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input: "js/app.js",
  output: { file: "bundle.js" },
  plugins: [resolve({ browser: true }), terser()],
};
