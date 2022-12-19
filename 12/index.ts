import fs from "fs";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8");
const sampleSol = 31;
const sample2Sol = 29;
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

function testFunc2(
  grid: number[][],
  x: number,
  y: number
): ("N" | "S" | "E" | "W")[] {
  const allowed: ("N" | "S" | "E" | "W")[] = [];
  const current = grid[x][y];

  if (x !== 0 && grid[x - 1][y] + 1 >= current) {
    allowed.push("N");
  }
  if (x !== grid.length - 1 && grid[x + 1][y] + 1 >= current) {
    allowed.push("S");
  }
  if (y !== 0 && grid[x][y - 1] + 1 >= current) {
    allowed.push("W");
  }
  if (y !== grid[0].length - 1 && grid[x][y + 1] + 1 >= current) {
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
  const preCalcTest = grid.map((row, x) =>
    row.map((val, y) => testFunc(grid, x, y))
  );

  const visited = {};
  // x, y, steps, rating
  const queue: [number, number, number][] = [];
  queue.push([start[0], start[1], 0]);
  // Recursive function to traverse the grid

  let iters = 0;
  while (queue.length > 0) {
    iters++;
    // queue = _.sortBy(queue, (x) => x[3]);
    const [x, y, steps] = queue[0];
    queue.shift();

    if (visited[[x, y].join(",")]) continue;
    visited[[x, y].join(",")] = true;

    // Check if we have reached the destination
    if (x === goal[0] && y === goal[1]) {
      // Update the minimum number of steps
      minSteps = Math.min(minSteps, steps);
      continue;
    }

    if (minSteps < steps) {
      continue;
    }

    // Get the directions we can move in
    const directions = preCalcTest[x][y];

    // Move in each direction we can
    if (directions.includes("N") && !visited[[x - 1, y].join(",")]) {
      queue.push([x - 1, y, steps + 1]);
    }
    if (directions.includes("S") && !visited[[x + 1, y].join(",")]) {
      queue.push([x + 1, y, steps + 1]);
    }
    if (directions.includes("E") && !visited[[x, y + 1].join(",")]) {
      queue.push([x, y + 1, steps + 1]);
    }
    if (directions.includes("W") && !visited[[x, y - 1].join(",")]) {
      queue.push([x, y - 1, steps + 1]);
    }
  }

  return minSteps;
}

function traverseGrid2(
  grid: number[][],
  test: typeof testFunc,
  start: [number, number]
): number {
  // Keep track of the minimum number of steps
  let minSteps = Infinity;
  const preCalcTest = grid.map((row, x) =>
    row.map((val, y) => testFunc2(grid, x, y))
  );

  const visited = {};
  // x, y, steps, rating
  const queue: [number, number, number][] = [];
  queue.push([start[0], start[1], 0]);
  // Recursive function to traverse the grid

  let iters = 0;
  while (queue.length > 0) {
    iters++;
    // queue = _.sortBy(queue, (x) => x[3]);
    const [x, y, steps] = queue[0];
    queue.shift();

    // console.log(x, y, steps);

    if (visited[[x, y].join(",")]) continue;
    visited[[x, y].join(",")] = true;

    // Check if we have reached the destination
    if (grid[x][y] === 1) {
      // Update the minimum number of steps
      minSteps = Math.min(minSteps, steps);
      continue;
    }

    // Get the directions we can move in
    const directions = preCalcTest[x][y];

    // Move in each direction we can
    if (directions.includes("N") && !visited[[x - 1, y].join(",")]) {
      queue.push([x - 1, y, steps + 1]);
    }
    if (directions.includes("S") && !visited[[x + 1, y].join(",")]) {
      queue.push([x + 1, y, steps + 1]);
    }
    if (directions.includes("E") && !visited[[x, y + 1].join(",")]) {
      queue.push([x, y + 1, steps + 1]);
    }
    if (directions.includes("W") && !visited[[x, y - 1].join(",")]) {
      queue.push([x, y - 1, steps + 1]);
    }
  }

  return minSteps;
}

function partOne(inp) {
  const { grid, start, goal } = parse(inp);

  return traverseGrid(grid, testFunc, start, goal);
}

function partTwo(inp) {
  const { grid, start, goal } = parse(inp);

  return traverseGrid2(grid, testFunc, goal);
}

const test1 = partOne(sample);
console.log("part 1 sample", test1);
if (test1 !== sampleSol) {
  console.log("Failed the part 1 test");
  process.exit(1);
}
console.log("part 1 sol:", partOne(inp));

const test2 = partTwo(sample);
console.log("part 2 sample", test2);
if (test2 !== sample2Sol) {
  console.log("Failed the part 2 test");
  process.exit(1);
}

console.log("part 2 sol:", partTwo(inp));
