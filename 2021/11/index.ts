import fs from "fs/promises";
import { traverseGrid, validNeighbors } from "../../utils/grid";
const sampleSol = 1656;
const sample2Sol = 195;

function parse(rawLines: string[]): number[][] {
  return rawLines.map((line) => line.split("").map((x) => parseInt(x, 10)));
}

// mutates grid
function increment(grid: number[][]): number {
  const queue: number[][] = [];

  traverseGrid(grid, (val, coord) => {
    grid[coord[1]][coord[0]] = val + 1;
    if (val + 1 === 10) {
      queue.push(...validNeighbors(grid, coord, { includeDiagonals: true }));
    }
  });

  while (queue.length) {
    const flashedCoord = queue.shift()!;
    const val = ++grid[flashedCoord[1]][flashedCoord[0]];

    if (val === 10) {
      queue.push(
        ...validNeighbors(grid, flashedCoord, { includeDiagonals: true })
      );
    }
  }

  let flashed = 0;
  traverseGrid(grid, (val, coord) => {
    if (val >= 10) {
      flashed++;
      grid[coord[1]][coord[0]] = 0;
    }
  });

  return flashed;
}

function partOne(rawLines: string[]) {
  const grid = parse(rawLines);
  let flashed = 0;

  for (let i = 0; i < 100; i++) {
    flashed += increment(grid);
  }

  return flashed;
}

function partTwo(rawLines: string[]) {
  const grid = parse(rawLines);
  const total = grid[0].length * grid.length;
  let iter = 0;

  let allFlashed = false;
  while (!allFlashed) {
    iter++;
    const flashed = increment(grid);
    if (flashed === total) {
      allFlashed = true;
    }
  }

  return iter;
}

(async function main() {
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

  const test2 = await partTwo(sample);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(input);
  console.log("part 2 sol:", sol2);
})();
