import fs from "fs/promises";

const sampleSol = 4361;
const sample2Sol = 467835;

const DIGITS = "0123456789";
const NON_SYMBOLS = DIGITS + ".";

interface EnginePart {
  x: number;
  y: number;
  digitCount: number;
  value: number;
}

function getAdjacentCells(
  grid: string[][],
  { x, y, digitCount }: EnginePart
): string[] {
  const out: string[] = [];

  const minX = Math.max(x - 1, 0);
  const maxX = Math.min(grid[0].length - 1, x + digitCount + 1);

  if (y > 0) {
    out.push(...grid[y - 1].slice(minX, maxX));
  }

  if (y < grid.length - 1) {
    out.push(...grid[y + 1].slice(minX, maxX));
  }

  if (x > 0) out.push(grid[y][x - 1]);
  if (x + digitCount < grid[0].length - 1) out.push(grid[y][x + digitCount]);

  return out;
}

function getEngineParts(grid: string[][]): EnginePart[] {
  const enginerParts: EnginePart[] = [];

  for (let y = 0; y < grid.length; y++) {
    let x = 0;

    while (x < grid[0].length) {
      let addToX = 1;
      if (DIGITS.includes(grid[y][x])) {
        let val = grid[y][x];
        if (x + 1 < grid[0].length && DIGITS.includes(grid[y][x + 1])) {
          val += grid[y][x + 1];
          addToX++;
        }
        if (x + 2 < grid[0].length && DIGITS.includes(grid[y][x + 2])) {
          val += grid[y][x + 2];
          addToX++;
        }

        enginerParts.push({ x, y, digitCount: addToX, value: parseInt(val) });
      }

      x += addToX;
    }
  }

  return enginerParts;
}

function partOne(rawLines: string[]) {
  const grid = rawLines.map((x) => x.split(""));
  const enginerParts = getEngineParts(grid);

  return enginerParts.reduce((acc, enginePart) => {
    const adjacentCells = getAdjacentCells(grid, enginePart);
    if (adjacentCells.some((cell) => !NON_SYMBOLS.includes(cell))) {
      return acc + enginePart.value;
    }
    return acc;
  }, 0);
}

function getAdjacentGears(
  grid: string[][],
  { x, y, digitCount }: EnginePart
): string[] {
  const out: string[] = [];

  const getKey = (x, y) => `${x}-${y}`;

  const minX = Math.max(x - 1, 0);
  const maxX = Math.min(grid[0].length - 1, x + digitCount + 1);

  if (y > 0) {
    for (let i = minX; i < maxX; i++) {
      if (grid[y - 1][i] === "*") out.push(getKey(i, y - 1));
    }
  }

  if (y < grid.length - 1) {
    for (let i = minX; i < maxX; i++) {
      if (grid[y + 1][i] === "*") out.push(getKey(i, y + 1));
    }
  }

  if (x > 0 && grid[y][x - 1] === "*") out.push(getKey(x - 1, y));
  if (x + digitCount < grid[0].length - 1 && grid[y][x + digitCount] === "*")
    out.push(getKey(x + digitCount, y));

  return out;
}

function partTwo(rawLines: string[]) {
  const grid = rawLines.map((x) => x.split(""));
  const enginerParts = getEngineParts(grid);

  const gears = enginerParts.reduce((acc, enginePart) => {
    const adjacentGears = getAdjacentGears(grid, enginePart);
    adjacentGears.forEach((gear) => {
      if (!acc[gear]) acc[gear] = [];

      acc[gear].push(enginePart.value);
    });

    return acc;
  }, {} as Record<string, number[]>);

  return Object.values(gears).reduce((acc, values) => {
    if (values.length === 2) return acc + values[0] * values[1];
    return acc;
  }, 0);
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
