import { ExportConfig, NodeInfo } from "../pageInfo";
import { exportReactTsx } from "./React";
import { exportVueTsx } from "./Vue";
import { exportVueTemplate } from "./VueTemplate";

enum ExportType {
  react = "react",
  vue = "vue",
  vueTemplate = "vueTemplate",
  all = "all",
}
export const exportCode = (
  type: keyof typeof ExportType,
  json: NodeInfo,
  config: ExportConfig
) => {
  const prarms = {
    json,
    config,
  };
  if (type === "all") {
    return {
      react: exportReactTsx(prarms),
      vue: exportVueTsx(prarms),
      vueTemplate: exportVueTemplate(prarms),
    };
  }
  if (type === "vue") {
    return exportVueTsx(prarms);
  } else if (type === "react") {
    return exportReactTsx(prarms);
  } else {
    return exportVueTemplate(prarms);
  }
};
