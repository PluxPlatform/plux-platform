"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const prettier_1 = require("prettier");
const export_1 = require("./src/export");
/**
 * @param jsonPath 可以是一个json字符串，也可以是一个json文件的路径
 * @param output 输出文件路径
 */
const JSONToJsx = async (jsonPath = "test.json", outputReact = "/Volumes/codes/xn/amis-cg/site/src/components/test.tsx", outPutVue = "/Volumes/codes/xn/amis-cg/site-vue/src/view/test.tsx") => {
    let json = {};
    try {
        json = JSON.parse(jsonPath);
    }
    catch (error) {
        json = JSON.parse((0, fs_1.readFileSync)(jsonPath, "utf-8"));
    }
    const reactCode = (0, export_1.exportCode)("react", json, {
        componentName: "Test",
        exportDefault: true,
    });
    const formatted = await (0, prettier_1.format)(reactCode, { parser: "babel" });
    (0, fs_1.writeFileSync)(outputReact, formatted);
};
JSONToJsx();
