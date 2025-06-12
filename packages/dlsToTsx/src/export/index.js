"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCode = void 0;
const React_1 = require("./React");
const UniApp_1 = require("./UniApp");
const Vue_1 = require("./Vue");
const VueTemplate_1 = require("./VueTemplate");
var ExportType;
(function (ExportType) {
    ExportType["react"] = "react";
    ExportType["vue"] = "vue";
    ExportType["vueTemplate"] = "vueTemplate";
    ExportType["UniApp"] = "UniApp";
    ExportType["all"] = "all";
})(ExportType || (ExportType = {}));
const exportCode = (type, json, config) => {
    const prams = {
        json,
        config,
    };
    if (type === "all") {
        return {
            react: (0, React_1.exportReactTsx)(prams),
            vue: (0, Vue_1.exportVueTsx)(prams),
            vueTemplate: (0, VueTemplate_1.exportVueTemplate)(prams),
            UniApp: (0, UniApp_1.exportUniApp)(prams),
        };
    }
    switch (type) {
        case "react":
            return (0, React_1.exportReactTsx)(prams);
        case "vue":
            return (0, Vue_1.exportVueTsx)(prams);
        case "vueTemplate":
            return (0, VueTemplate_1.exportVueTemplate)(prams);
        case "UniApp":
            return (0, UniApp_1.exportUniApp)(prams);
        default:
            return (0, Vue_1.exportVueTsx)(prams);
    }
};
exports.exportCode = exportCode;
