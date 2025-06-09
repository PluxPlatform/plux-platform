interface ThemeCss {
  toolbarControlClassName?: Record<string, string>;
  baseControlClassName?: Record<string, string>;
}

export interface NodeInfo {
  type: string;
  title?: string;
  id: string;
  mode?: "flex";
  name?: string;
  colon?: boolean;
  labelAlign?: "left" | "right";
  dsType?: "api";
  feat?: "Insert";
  options?: {
    label?: string;
    value?: string;
  }[];
  actions?: NodeInfo[];
  onEvent?: Record<
    "click",
    {
      actions: { actionType: string; componentId: string }[];
    }
  >;
  level: "default" | "primary";
  label?: string;
  regions?: "body" | "header" | "toolbar"[];
  resetAfterSubmit?: boolean;
  body?: NodeInfo[];
  themeCss?: ThemeCss;
}
export interface ExportConfig {
  componentName?: string;
  exportDefault?: boolean;
}
