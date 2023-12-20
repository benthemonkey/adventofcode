import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 374;
const sample2Sol = 8410;

function expand(grid: string[][]): string[][] {
  for (let i = grid.length - 1; i >= 0; i--) {
    if (grid.every((x) => x[i] === ".")) {
      grid.forEach((row) => {
        row.splice(i, 0, ".");
      });
    }
    if (grid[i].every((x) => x === ".")) {
      grid.splice(i, 0, new Array(grid.length).fill("."));
    }
  }

  return grid;
}

function getPoints(grid: string[][]): number[][] {
  const out: number[][] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x] === "#") {
        out.push([x, y]);
      }
    }
  }
  return out;
}

function sumDistances(points: number[][]) {
  let sum = 0;

  for (let i = 0; i < points.length - 1; i++) {
    for (let j = i + 1; j < points.length; j++) {
      sum +=
        Math.abs(points[j][1] - points[i][1]) +
        Math.abs(points[i][0] - points[j][0]);
    }
  }

  return sum;
}

function partOne(rawLines: string[]) {
  const grid = rawLines.map((x) => x.split(""));

  const points = getPoints(expand(grid));

  return sumDistances(points);
}

interface Gaps {
  rows: number[];
  columns: number[];
}

function getGaps(grid: string[][]): Gaps {
  const out: Gaps = { rows: [], columns: [] };
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].every((x) => x === ".")) {
      out.rows.push(i);
    }
  }

  for (let i = 0; i < grid[0].length; i++) {
    if (grid.every((x) => x[i] === ".")) {
      out.columns.push(i);
    }
  }

  return out;
}

function sumDistancesTwo(points: number[][], gaps: Gaps, distance: number) {
  let sum = 0;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      sum +=
        Math.abs(points[j][1] - points[i][1]) +
        Math.abs(points[i][0] - points[j][0]);

      const xRange = _.sortBy([points[i][0], points[j][0]]);
      const yRange = _.sortBy([points[i][1], points[j][1]]);

      sum +=
        gaps.columns.filter((x) => x > xRange[0] && x < xRange[1]).length *
        (distance - 1);
      sum +=
        gaps.rows.filter((y) => y > yRange[0] && y < yRange[1]).length *
        (distance - 1);
    }
  }

  return sum;
}

function partTwo(rawLines: string[], distance: number) {
  const grid = rawLines.map((x) => x.split(""));
  const gaps = getGaps(grid);

  const points = getPoints(grid);
  console.log(gaps);
  return sumDistancesTwo(points, gaps, distance);
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

  const test2 = await partTwo(sample, 100);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(input, 1000000);
  console.log("part 2 sol:", sol2);
})();
