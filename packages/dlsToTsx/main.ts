import { readFileSync, writeFileSync } from "fs";
import { format } from "prettier";
import { exportCode } from "./src/export";
import { NodeInfo } from "./src/pageInfo";

/**
 * @param jsonPath 可以是一个json字符串，也可以是一个json文件的路径
 * @param output 输出文件路径
 */
const JSONToJsx = async (
  jsonPath: string = "test.json",
  outputReact: string = "/Volumes/codes/xn/amis-cg/site/src/components/test.tsx",
  outPutVue: string = "/Volumes/codes/xn/amis-cg/site-vue/src/view/test.tsx"
) => {
  let json = {};
  try {
    json = JSON.parse(jsonPath);
  } catch (error) {
    json = JSON.parse(readFileSync(jsonPath, "utf-8"));
  }
  const reactCode = exportCode("react", json as NodeInfo, {
    componentName: "Test",
    exportDefault: true,
  });
  const formatted = await format(reactCode as string, { parser: "babel" });
  writeFileSync(outputReact, formatted);
};
JSONToJsx();
