import _ from "lodash";

type TypeOptions = {
  maxIters?: number;
  initialJump?: number;
  initialGuess?: number;
  debug?: boolean;
};

const defaults: Required<TypeOptions> = {
  maxIters: 100000,
  initialJump: 10,
  initialGuess: 1,
  debug: false,
};

export function binarySearchInt(
  func: (val: number) => number,
  options: TypeOptions = {}
): number | null {
  const { maxIters, initialJump, initialGuess, debug } = {
    ...defaults,
    ...options,
  };
  let iter = 0;
  let guess = initialGuess;
  let jump = initialJump;
  let distance = func(guess);
  let was1lastTime = false;

  while (iter < maxIters) {
    iter++;
    guess += jump;

    const newDistance = func(guess);

    if (newDistance === 0) return guess;

    const accel = Math.abs(distance) - Math.abs(newDistance);
    if (debug) console.log({ guess, distance, newDistance, accel });
    if (accel < 0 || distance * newDistance < 0) {
      if (Math.abs(jump) === 1) {
        if (was1lastTime) {
          return guess;
        } else {
          was1lastTime = true;
        }
      }

      guess -= jump;

      if (accel < 0) {
        jump *= -1;
      }
      jump = jump > 0 ? Math.ceil(jump / 2) : Math.floor(jump / 2);
    } else {
      jump *= 2;
      distance = newDistance;
    }
  }

  return null;
}
