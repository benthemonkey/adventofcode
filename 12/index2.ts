const fs = require("fs");
const _ = require("lodash");
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8");
const sampleSol = 31;
require('console.table');
// const sample2Sol = 0;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8");

const vals = "0abcdefghijklmnopqrstuvwxyz";

function testFunc(
  grid: number[][],
  x: number,
  y: number
): ("N" | "S" | "E" | "W")[] {
  const allowed: ("N" | "S" | "E" | "W")[] = [];
  const current = grid[x][y];

  if (x !== 0 && grid[x - 1][y] - 1 <= current) {
    allowed.push("N");
  }
  if (x !== grid.length - 1 && grid[x + 1][y] - 1 <= current) {
    allowed.push("S");
  }
  if (y !== 0 && grid[x][y - 1] - 1 <= current) {
    allowed.push("W");
  }
  if (y !== grid[0].length - 1 && grid[x][y + 1] - 1 <= current) {
    allowed.push("E");
  }

  return allowed;
}

function parse(inp: string): {
  grid: number[][];
  start: [number, number];
  goal: [number, number];
} {
  let start, goal;

  const grid = inp.split("\n").map((line, x) =>
    line.split("").map((cell, y) => {
      if (cell === "S") {
        start = [x, y];
        return 1;
      } else if (cell === "E") {
        goal = [x, y];
        return 26;
      } else {
        return vals.indexOf(cell);
      }
    })
  );

  return { start, goal, grid };
}

function traverseGrid(
  grid: number[][],
  test: typeof testFunc,
  start: [number, number],
  goal: [number, number]
): number {
  // Keep track of the minimum number of steps
  let minSteps = Infinity;
  const visited = { [start.join(",")]: true };

  const preCalcTest = grid.map((row, x) => row.map((val, y) => testFunc(grid, x, y)));

  // Recursive function to traverse the grid
  function traverse(
    x: number,
    y: number,
    steps: number,
    visited: Record<string, boolean>
  ) {
    // Check if we have reached the destination
    if (x === goal[0] && y === goal[1]) {
      // Update the minimum number of steps
      minSteps = Math.min(minSteps, steps);
      return;
    }

    console.log(steps);

    const newVisited = { ...visited, [[x, y].join(",")]: true };

    // Get the directions we can move in
    const directions = preCalcTest[x][y];

    // Move in each direction we can
    if (directions.includes("N") && !visited[[x - 1, y].join(",")]) {
      traverse(x - 1, y, steps + 1, newVisited);
    }
    if (directions.includes("S") && !visited[[x + 1, y].join(",")]) {
      traverse(x + 1, y, steps + 1, newVisited);
    }
    if (directions.includes("E") && !visited[[x, y + 1].join(",")]) {
      traverse(x, y + 1, steps + 1, newVisited);
    }
    if (directions.includes("W") && !visited[[x, y - 1].join(",")]) {
      traverse(x, y - 1, steps + 1, newVisited);
    }
  }

  // Start traversing the grid from the starting coordinate
  traverse(start[0], start[1], 0, visited);

  // Return the minimum number of steps
  return minSteps;
}

function partOne(inp) {
  const { grid, start, goal } = parse(inp);
  console.table(grid);

  return traverseGrid(grid, testFunc, start, goal);
}

function partTwo(inp) {
  return 0;
}

const test1 = partOne(sample);
console.log("part 1 sample", test1);
if (test1 !== sampleSol) {
  console.log("Failed the part 1 test");
  process.exit(1);
}
console.log("part 1 sol:", partOne(inp));

// const test2 = partTwo(sample);
// console.log("part 2 sample", test2);
// if (test2 !== sample2Sol) {
//   console.log("Failed the part 2 test");
//   process.exit(1);
// }

// console.log("part 2 sol:", partTwo(inp));
