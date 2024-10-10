// https://github.com/denoland/deno/issues/25341
declare module "react" {
  // @ts-types="npm:types-react@rc"
  import React from "npm:react@19.0.0-rc-1460d67c-20241003";
  export = React;
}