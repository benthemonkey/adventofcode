import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 8;
const sample2Sol = 0;

// 0 - up
// 1 - right
// 2 - down
// 3 - left

const FACING_TO_CONNECTING_PIPES = [
  ["7", "|", "F"],
  ["J", "-", "7"],
  ["L", "|", "J"],
  ["F", "-", "L"],
];

interface Position {
  x: number;
  y: number;
  o: number;
  po: number;
}

function nextPosition(grid: string[][], { x, y, o }: Position): Position {
  const connecting = FACING_TO_CONNECTING_PIPES[o];

  const nextCoord = [
    [x, y - 1],
    [x + 1, y],
    [x, y + 1],
    [x - 1, y],
  ][o];

  if (
    nextCoord[0] < 0 ||
    nextCoord[0] >= grid[0].length ||
    nextCoord[1] < 0 ||
    nextCoord[1] >= grid.length
  ) {
    throw new Error(
      "invalid connection" + JSON.stringify({ x, y, o, nextCoord })
    );
  }
  const nextValue = grid[nextCoord[1]][nextCoord[0]];
  const orientationChange = connecting.indexOf(nextValue) - 1;

  if (orientationChange === -2 && nextValue !== "S") {
    throw new Error(
      "invalid connection" + JSON.stringify({ x, y, o, nextCoord, nextValue })
    );
  }

  return {
    x: nextCoord[0],
    y: nextCoord[1],
    o: (o + orientationChange + 4) % 4,
    po: o,
  };
}

function getStartingPositions(grid: string[][]): Position[] | null {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x] === "S") {
        const out: Position[] = [];

        for (let o = 0; o < 4; o++) {
          let pos: Position | null = null;
          try {
            pos = nextPosition(grid, { x, y, o, po: -1 });
          } catch (e) {
            console.log(e);
            // ignore
          }
          if (pos === null) continue;

          if (FACING_TO_CONNECTING_PIPES[o].includes(grid[pos.y][pos.x])) {
            const orientationChange =
              FACING_TO_CONNECTING_PIPES[o].indexOf(grid[pos.y][pos.x]) - 1;
            out.push({ x, y, o, po: (o - orientationChange + 4) % 4 });
          }
        }

        return out;
      }
    }
  }

  return null;
}

function partOne(rawLines: string[]) {
  const grid = rawLines.map((x) => x.split(""));

  const startingPos = getStartingPositions(grid);

  if (startingPos === null) {
    throw new Error("Failed to find starting pos");
  }

  let pos = nextPosition(grid, startingPos[0]),
    i = 1;

  while (
    !(startingPos[0].x === pos.x && startingPos[0].y === pos.y) &&
    i < 10000000
  ) {
    pos = nextPosition(grid, pos);
    i++;
  }

  return i / 2;
}

function partTwo(rawLines: string[]) {
  const grid = rawLines.map((x) => x.split(""));

  const startingPos = getStartingPositions(grid);

  if (startingPos === null) {
    throw new Error("Failed to find starting pos");
  }

  let pos = nextPosition(grid, startingPos[0]),
    i = 1;

  const positions = [startingPos[0], pos];
  while (
    !(startingPos[0].x === pos.x && startingPos[0].y === pos.y) &&
    i < 10000000
  ) {
    pos = nextPosition(grid, pos);
    positions.push(pos);
    i++;
  }

  const lookUp = positions.reduce((acc, pos) => {
    acc[`${pos.x}:${pos.y}`] = pos;
    return acc;
  }, {} as Record<string, Position>);
  const printMap: string[] = [];
  const isOdd = false;
  const interior = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const pos = lookUp[`${x}:${y}`];
      if (pos) {
        row += grid[y][x];
      } else {
        row += "X";
      }
    }
    printMap.push(row);
  }

  console.log(printMap.join("\n"));
  return 0;
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
