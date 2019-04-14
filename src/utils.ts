/** Generate a random between min (inclusive) and max (excluded). */
export function genRand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

/** Compute the vector distance between two points. */
export function pointDistance(x1: number, x2: number, y1: number, y2: number): number {
  return Math.floor(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
}
