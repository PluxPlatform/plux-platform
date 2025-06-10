import { ExportConfig, NodeInfo } from "../pageInfo";
import { exportReactTsx } from "./React";
import { exportUniApp } from "./UniApp";
import { exportVueTsx } from "./Vue";
import { exportVueTemplate } from "./VueTemplate";

enum ExportType {
  react = "react",
  vue = "vue",
  vueTemplate = "vueTemplate",
  UniApp = "UniApp",
  all = "all",
}
export const exportCode = (
  type: keyof typeof ExportType,
  json: NodeInfo,
  config: ExportConfig
) => {
  const prams = {
    json,
    config,
  };
  if (type === "all") {
    return {
      react: exportReactTsx(prams),
      vue: exportVueTsx(prams),
      vueTemplate: exportVueTemplate(prams),
      UniApp: exportUniApp(prams),
    };
  }

  switch (type) {
    case "react":
      return exportReactTsx(prams);
    case "vue":
      return exportVueTsx(prams);
    case "vueTemplate":
      return exportVueTemplate(prams);
    case "UniApp":
      return exportUniApp(prams);
    default:
      return exportVueTsx(prams);
  }
};
