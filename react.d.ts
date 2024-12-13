// https://github.com/denoland/deno/issues/25341
declare module "react" {
  // @ts-types="npm:@types/react@19.0.1"
  import React from "npm:react@19.0.0";
  export = React;
}