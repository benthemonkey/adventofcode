import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 8;
const sample2Sol = 8;

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
  po: number; // previous orientation
}

function nextPosition(
  grid: string[][],
  { x, y, o }: Position,
  startingPos: Position[] = []
): Position {
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

  if (nextValue === "S") {
    return startingPos.find(({ po }) => po === o) as Position;
  } else if (orientationChange === -2) {
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
        const validOrientations: number[] = [];
        for (let o = 0; o < 4; o++) {
          let pos: Position | null = null;
          try {
            pos = nextPosition(grid, { x, y, o, po: -1 });
          } catch (e) {
            // ignore
          }
          if (pos !== null) validOrientations.push(o);
        }

        return [
          { x, y, o: validOrientations[0], po: (validOrientations[1] + 2) % 4 },
          { x, y, o: validOrientations[1], po: (validOrientations[0] + 2) % 4 },
        ];
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

  let pos = startingPos[0],
    i = 0;

  do {
    pos = nextPosition(grid, pos, startingPos);
    i++;
  } while (
    !(startingPos[0].x === pos.x && startingPos[0].y === pos.y) &&
    i < 10000000
  );

  return i / 2;
}

function getVerticalO(pos: Position): number {
  if (pos.o % 2 == 0 && pos.po % 2 === 0) {
    throw new Error("passed bad position");
  }

  if (pos.o % 2 === 0) return pos.o;
  return pos.po;
}

function partTwo(rawLines: string[]) {
  const grid = rawLines.map((x) => x.split(""));

  const startingPos = getStartingPositions(grid);

  if (startingPos === null) {
    throw new Error("Failed to find starting pos");
  }

  let pos = startingPos[0],
    i = 0;

  const positions: Position[] = [pos];
  do {
    pos = nextPosition(grid, pos, startingPos);
    positions.push(pos);
    i++;
  } while (
    !(startingPos[0].x === pos.x && startingPos[0].y === pos.y) &&
    i < 10000000
  );

  const lookUp = positions.reduce((acc, pos) => {
    acc[`${pos.x}:${pos.y}`] = pos;
    return acc;
  }, {} as Record<string, Position>);
  let interior = 0;
  let out = "";
  let print = "";
  for (let y = 0; y < grid.length; y++) {
    let isOdd = false;
    let lastPO = null;
    let inSegment = false;
    for (let x = 0; x < grid[0].length; x++) {
      const pos = lookUp[`${x}:${y}`];
      if (pos) {
        const val = grid[pos.y][pos.x];

        print += val;
        if (pos.o % 2 === 0 && pos.po % 2 === 0) {
          isOdd = !isOdd;
          out += isOdd ? "^" : "V";
        } else if (!inSegment) {
          lastPO = getVerticalO(pos);
          inSegment = true;
          out += "?";
        } else {
          if (pos.o % 2 === 1 && pos.po % 2 === 1) {
            out += "-";
          } else {
            const newPO = getVerticalO(pos);

            if (newPO === lastPO) {
              isOdd = !isOdd;
              out += isOdd ? "^" : "V";
            } else {
              out += "U";
            }
            inSegment = false;
            lastPO = null;
          }
        }
      } else if (isOdd) {
        interior++;
        out += "O";
      } else {
        print += " ";
        out += ".";
      }
    }
    out += "\n";
    print += "\n";
  }
  // console.log(print);
  // console.log(out);
  return interior;
}

(async function main() {
  const sample = await fs
    .readFile(__dirname + "/sample.txt", "utf8")
    .then((txt) => txt.split("\n"));
  const sample2 = await fs
    .readFile(__dirname + "/sample2.txt", "utf8")
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

  const test2 = await partTwo(sample2);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(input);
  console.log("part 2 sol:", sol2);
})();
