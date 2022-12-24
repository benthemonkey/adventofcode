import chalk from "chalk";
import fs from "fs/promises";
import _ from "lodash";
import { createLogUpdate } from "log-update";
import { keypress } from "../../utils";
const sampleSol = 18;
const sample2Sol = 54;

type Blizzlets = {
  up: number[][];
  down: number[][];
  left: number[][];
  right: number[][];
};

class Blizzard {
  width: number;
  height: number;
  blizzlets: Blizzlets;
  log = createLogUpdate(process.stdout, { showCursor: true });

  static SYMBOL_TO_DIRECTION: Record<string, keyof Blizzlets> = {
    "^": "up",
    ">": "right",
    v: "down",
    "<": "left",
  };

  me: number[] = [0, -1];
  constructor(lines: string[]) {
    this.width = lines[0].length - 2;
    this.height = lines.length - 2;
    this.blizzlets = {
      up: new Array(this.width).fill("").map(() => []),
      left: new Array(this.height).fill("").map(() => []),
      down: new Array(this.width).fill("").map(() => []),
      right: new Array(this.height).fill("").map(() => []),
    };

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const val = lines[i + 1][j + 1];

        if (val === "^" || val === "v") {
          this.blizzlets[Blizzard.SYMBOL_TO_DIRECTION[val]][j].push(i);
        } else if (val === "<" || val === ">") {
          this.blizzlets[Blizzard.SYMBOL_TO_DIRECTION[val]][i].push(j);
        }
      }
    }
  }

  // only examine the blizards that traverse the column and row we care about
  isOccupiedAtIter([x, y]: number[], iter: number): boolean {
    if (y === -1 || y === this.height) return false;
    const iterX = iter % this.width;
    const iterY = iter % this.height;

    return (
      this.blizzlets.left[y].includes((x + iter) % this.width) ||
      this.blizzlets.right[y].includes((x - iterX + this.width) % this.width) ||
      this.blizzlets.up[x].includes((y + iter) % this.height) ||
      this.blizzlets.down[x].includes((y - iterY + this.height) % this.height)
    );
  }

  viableNextMove(coord: number[], delta: number[], iter: number): boolean {
    // waiting at start or end
    if (
      (coord[1] === -1 || coord[1] === this.height) &&
      delta[0] === 0 &&
      delta[1] === 0
    )
      return true;

    const nextCoord = [coord[0] + delta[0], coord[1] + delta[1]];

    if (
      nextCoord[0] < 0 ||
      nextCoord[0] >= this.width ||
      nextCoord[1] < 0 ||
      nextCoord[1] >= this.height
    )
      return false;

    return !this.isOccupiedAtIter(nextCoord, iter);
  }

  distance([x, y]: number[], returning = false): number {
    if (returning) {
      return x + y;
    }
    return this.height - y + this.width - x - 2;
  }

  print(coord: number[], iter: number) {
    let out = "\n#";
    out += coord[1] === -1 ? chalk.green("O") : ".";
    out += new Array(this.width).fill("#").join("") + "\n";

    for (let i = 0; i < this.height; i++) {
      out += "#";
      for (let j = 0; j < this.width; j++) {
        if (j === coord[0] && i === coord[1]) {
          out += chalk.green("O");
        } else if (this.isOccupiedAtIter([j, i], iter)) {
          out += "X";
        } else {
          out += ".";
        }
      }
      out += "#\n";
    }
    out += new Array(this.width).fill("#").join("") + ".#";

    this.log(out);
  }
}

type State = {
  steps: string[];
  coord: number[];
  distance: number;
  time: number;
};

const options: { label: string; delta: number[] }[] = [
  { label: "v", delta: [0, 1] },
  { label: ">", delta: [1, 0] },
  { label: "^", delta: [0, -1] },
  { label: "<", delta: [-1, 0] },
  { label: "w", delta: [0, 0] },
];

function stateSignature(state: State): string {
  return `${state.coord[0]}:${state.coord[1]}:${state.time}`;
}

async function printRoute(
  startCoord: number[],
  route: string[],
  bliz: Blizzard
) {
  let coord = startCoord;
  for (let i = 0; i < route.length; i++) {
    bliz.print(coord, i);
    await keypress();

    const delta = options.find((o) => o.label === route[i])!.delta;
    coord = [coord[0] + delta[0], coord[1] + delta[1]];
  }
  bliz.print(coord, route.length);
}

async function findShortestPath(
  bliz: Blizzard,
  startTime = 0,
  returnTrip = false
) {
  const startCoord = returnTrip ? [bliz.width - 1, bliz.height] : [0, -1];
  const queue: State[] = [
    {
      coord: startCoord,
      steps: [],
      time: startTime,
      distance: bliz.distance(startCoord, returnTrip),
    },
  ];
  const seenStates: Record<string, boolean> = {};
  let minSteps = Infinity;
  let route: string[] = [];

  while (queue.length) {
    const state = queue.shift()!;
    const { coord, steps, time, distance } = state;
    const deltaTime = time - startTime;

    if (distance === 0) {
      if (minSteps > deltaTime) {
        minSteps = deltaTime;
        route = steps;
      }
      continue;
    }

    // we can't possibly beat the best
    if (distance + deltaTime > minSteps) continue;

    const signature = stateSignature(state);
    if (seenStates[signature]) continue;
    seenStates[signature] = true;

    let viableOptions = options;

    // don't wait for more than X turns in a row
    // maybe wait awhile before the first step if nothing else is working
    if (
      coord[1] !== startCoord[1] &&
      steps.length >= 3 &&
      _.takeRight(steps, 3).every((s) => s === "w")
    ) {
      viableOptions = viableOptions.filter((o) => o.label !== "w");
    }

    viableOptions
      .filter(({ delta }) => bliz.viableNextMove(coord, delta, time + 1))
      .forEach(({ label, delta }) => {
        const nextCoord = [coord[0] + delta[0], coord[1] + delta[1]];
        queue.push({
          coord: nextCoord,
          steps: [...steps, label],
          time: time + 1,
          distance: bliz.distance(nextCoord, returnTrip),
        });
      });
  }

  if (process.argv.includes("--print")) {
    await printRoute(startCoord, route, bliz);
  }

  return startTime + minSteps + 1;
}

function partOne(rawLines: string[]) {
  const bliz = new Blizzard(rawLines);

  return findShortestPath(bliz);
}

async function partTwo(rawLines: string[], firstSteps: number) {
  const bliz = new Blizzard(rawLines);

  const returnSteps = await findShortestPath(bliz, firstSteps, true);

  return findShortestPath(bliz, returnSteps);
}

function tests() {
  const bliz = new Blizzard([
    "#.########",
    "#........#",
    "#..>..v..#",
    "#^....<..#",
    "#........#",
    "#........#",
    "########.#",
  ]);

  const allTrue = [
    bliz.isOccupiedAtIter([7, 2], 14),
    !bliz.isOccupiedAtIter([7, 2], 15),
    bliz.isOccupiedAtIter([0, 3], 4),
    !bliz.isOccupiedAtIter([0, 3], 3),
    bliz.isOccupiedAtIter([1, 1], 7),
    bliz.isOccupiedAtIter([1, 1], 15),
    !bliz.isOccupiedAtIter([5, 0], 1),
    bliz.isOccupiedAtIter([5, 0], 4),
  ];

  if (allTrue.some((x) => x === false))
    throw new Error("failed at " + allTrue.indexOf(false));
}

(async function main() {
  tests();

  const sample = await fs
    .readFile(__dirname + "/sample.txt", "utf8")
    .then((txt) => txt.split("\n"));
  const input = await fs
    .readFile(__dirname + "/input.txt", "utf8")
    .then((txt) => txt.split("\n"));

  const test1 = await partOne(sample);
  console.log("part 1 sample", test1);
  if (test1 !== sampleSol) {
    console.log("Failed the part 1 test");
    process.exit(1);
  }

  const sol1 = await partOne(input);
  console.log("part 1 sol:", sol1);

  const test2 = await partTwo(sample, test1);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(input, sol1);
  console.log("part 2 sol:", sol2);
})();
