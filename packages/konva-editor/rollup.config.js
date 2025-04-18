import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import livereload from "rollup-plugin-livereload";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";

const production = !process.env.ROLLUP_WATCH;
// const path =
//   "/Volumes/codes/project/build-energy-data-system_-front/src/views/KonvaStage/konvaEditor";
const path = "dist";
export default {
  input: "src/index.ts",
  output: [
    {
      file: `${path}/index.js`,
      format: "umd",
      name: "KonvaEditor",
      sourcemap: true,
    },
    {
      file: `${path}/index.esm.js`,
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({
      target: "es5",
    }),
    resolve(),
    commonjs(),
    copy({
      targets: [{ src: "src/assets/*", dest: `${path}/assets` }],
    }),

    !production && livereload("dist"),
    production && terser(),
  ],
};
