import type { MiddlewareHandler } from "hono";
import { getConnInfo } from "hono/deno";

/**
 * Adapted from DPP's implementation
 * https://github.com/mattwells19/DevsPlayingPoker/blob/main/server/middlewares/rateLimiter.ts
 */

const rateLimitMap = new Map<string, Array<number>>();

const windowMs = 30 * 1000;
const attempts = 10;

setInterval(() => {
  rateLimitMap.forEach((requestTimestamps, ip) => {
    const timestampsInWindow = requestTimestamps.filter(
      (requestTimestamp) => Date.now() - requestTimestamp < windowMs,
    );

    if (timestampsInWindow.length === 0) {
      rateLimitMap.delete(ip);
    }
  });
}, 30 * 1000);

export const rateLimiter: MiddlewareHandler = (
  c,
  next,
) => {
  const timestamp = Date.now();
  const ip = getConnInfo(c).remote.address!;

  const ipRequestTimestamps = rateLimitMap.get(ip);

  if (ipRequestTimestamps) {
    const timestampsInWindow = ipRequestTimestamps.filter(
      (requestTimestamp) => Date.now() - requestTimestamp < windowMs,
    );
    const attemptsRemaining = attempts - timestampsInWindow.length;

    // Since we're tracking failed attempts as well this is to prevent memory overflow from a barage of bad requests
    // prepend most recent timestamp to maintain sort order (lower index = more recent request)
    const limitedTimestampsInWindow = [timestamp, ...timestampsInWindow].slice(
      0,
      attempts,
    );

    rateLimitMap.set(ip, limitedTimestampsInWindow);

    // https://developer.okta.com/docs/reference/rl-best-practices/
    const nextOpening = Date.now() +
      (windowMs -
        (Date.now() -
          limitedTimestampsInWindow[limitedTimestampsInWindow.length - 1]));

    c.res.headers.append("X-Rate-Limit-Limit", attempts.toString());
    c.res.headers.append("X-Rate-Limit-Remaining", attemptsRemaining.toString());
    c.res.headers.append("X-Rate-Limit-Reset", nextOpening.toString());

    if (attemptsRemaining <= 0) {
      return Promise.resolve(c.text("Too many requests. Try again later.", 429));
    }
  } else {
    rateLimitMap.set(ip, [timestamp]);
  }

  return next();
};
