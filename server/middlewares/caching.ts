import type { MiddlewareHandler } from "hono/types";

export const cacheDocument: MiddlewareHandler = (c, next) => {
  c.res.headers.append("Cache-Control", "no-cache");
  return next();
};

export const cacheResource: MiddlewareHandler = (c, next) => {
  c.res.headers.append("Cache-Control", "public, max-age=31536000, immutable");
  return next();
};
