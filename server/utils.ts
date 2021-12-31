// utils functions from:
// https://deno.land/x/denodash@0.1.3
// https://github.com/brianboyko/denodash

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
