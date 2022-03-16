// utils functions from:
// https://deno.land/x/denodash@0.1.3
// https://github.com/brianboyko/denodash

import { PlayerId } from "./types/types.ts";

export const randomOf = (max: number): number => Math.floor(Math.random() * max);

export const sample = <T>(array: T[], sampleSize = 1): T[] => {
  const clone = array.slice();
  const l = array.length;
  let r: number; // random number;
  let temp: T; // storage;
  for (let i = 0; i < sampleSize; i++) {
    r = randomOf(l);
    temp = clone[r];
    clone[r] = clone[i];
    clone[i] = temp;
  }
  return clone.slice(0, sampleSize);
};

export const shuffle = <T>(array: T[]): T[] => {
  const clone = array.slice();
  const l = array.length;
  let r: number; // random number;
  let temp: T; // storage;
  for (let i = 0; i < l; i++) {
    r = randomOf(l);
    temp = clone[r];
    clone[r] = clone[i];
    clone[i] = temp;
  }
  return clone;
};

export function updateGameStateWithNewPlayerId(
  origObj: Record<any, any>,
  oldPlayerId: PlayerId,
  newPlayerId: PlayerId,
) {
  const obj = { ...origObj };

  for (const key in obj) {
    if (obj[key] instanceof Array) {
      obj[key] = obj[key].map((o: any) => {
        if (typeof o === "object") {
          return updateGameStateWithNewPlayerId(o, oldPlayerId, newPlayerId);
        } else if (typeof o === "string" && o === oldPlayerId) {
          return newPlayerId;
        }
      });
    } else if (typeof obj[key] === "object") {
      obj[key] = updateGameStateWithNewPlayerId(obj[key], oldPlayerId, newPlayerId);
    } else if (typeof obj[key] === "string" && obj[key] === oldPlayerId) {
      obj[key] = newPlayerId;
    }
  }
  return obj;
}
