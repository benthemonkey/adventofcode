import fs from "fs/promises";
import _ from "lodash";
import { traverseGrid, validNeighbors } from "../../utils/grid";
const sampleSol = 15;
const sample2Sol = 1134;

function parse(str: string): number[] {
  return str.split("").map((x) => parseInt(x, 10));
}

function findLowPoints(grid: number[][]): number[] {
  const out: number[] = [];

  traverseGrid(grid, (val, coord) => {
    if (validNeighbors(grid, coord).every(([x, y]) => grid[y][x] > val))
      out.push(val);
  });

  return out;
}

function partOne(rawLines: string[]) {
  const grid = rawLines.map(parse);
  const lowPoints = findLowPoints(grid);
  return _.sum(lowPoints) + lowPoints.length;
}

function floodSearch(
  grid: number[][],
  _visited: Record<string, boolean>,
  x: number,
  y: number
): { visited: Record<string, boolean>; size: number } {
  const visited = { ..._visited };

  const queue: { key: string; x: number; y: number }[] = [
    { key: [x, y].join(":"), x, y },
  ];
  let size = 0;

  while (queue.length) {
    const item = queue.shift()!;

    if (visited[item.key]) continue;
    visited[item.key] = true;
    size++;

    validNeighbors(grid, [item.x, item.y]).forEach((coord) => {
      queue.push({ key: coord.join(":"), x: coord[0], y: coord[1] });
    });
  }

  return { visited, size };
}

function findBasins(grid: number[][]): number[] {
  let visited: Record<string, boolean> = {};
  const basins: number[] = [];

  traverseGrid(grid, (val, coord) => {
    if (val === 9) visited[coord.join(":")] = true;
  });

  traverseGrid(grid, (val, coord) => {
    const key = coord.join(":");
    if (visited[key]) return;

    const { visited: _visited, size } = floodSearch(
      grid,
      visited,
      coord[0],
      coord[1]
    );
    visited = _visited;
    basins.push(size);
  });

  return basins;
}

function partTwo(rawLines: string[]) {
  const grid = rawLines.map(parse);

  return _.takeRight(
    findBasins(grid).sort((a, b) => a - b),
    3
  ).reduce((acc, val) => acc * val);
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
