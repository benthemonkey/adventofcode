import fs from "fs";
import _ from "lodash";
import chalk from "chalk";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n");
const sampleSol = 24;
const sample2Sol = 93;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

type Coord = { x: number; y: number };
let part2 = false;

const printCave = (walls: string[]) => {
  let maxY = 0;
  let minX = Infinity;
  let maxX = 0;
  const wallsLookup = {};

  walls.forEach((wall) => {
    const [x, y] = wall.split(",").map((x) => parseInt(x, 10));

    if (minX > x) minX = x;
    if (maxX < x) maxX = x;
    if (maxY < y) maxY = y;
    wallsLookup[wall] = true;
  });

  return (occupied: Record<string, boolean>, sand: Coord) => {
    let out = "\n***************\n\n";

    for (let x = minX; x < maxX; x++) {
      for (let y = 0; y < maxY; y++) {
        if (x === sand.x && y === sand.y) {
          out += chalk.yellow("o");
        } else if (wallsLookup[`${x},${y}`]) {
          out += "X";
        } else if (occupied[`${x},${y}`]) {
          out += "o";
        } else {
          out += ".";
        }
      }
      out += "\n";
    }

    console.log(out);
  };
};

function parse(inp: string[]): { points: string[]; maxY: number } {
  let maxY = 0;
  const points = _.flatMap(inp, (line) => {
    const parts = line
      .split(" -> ")
      .map((part) => part.split(",").map((z) => parseInt(z, 10)));

    const out: string[] = [];

    for (let i = 0; i < parts.length - 1; i++) {
      let [startX, startY] = parts[i];
      const [endX, endY] = parts[i + 1];

      if (startY > maxY) maxY = startY;
      if (endY > maxY) maxY = endY;

      while (startX !== endX || startY !== endY) {
        out.push(`${startX},${startY}`);
        if (startX < endX) startX++;
        if (startX > endX) startX--;
        if (startY < endY) startY++;
        if (startY > endY) startY--;
      }
    }
    out.push(_.last(parts)!.join(","));
    return out;
  });
  return { points, maxY };
}

function coordState(
  occupied: Record<string, boolean>,
  maxY: number,
  x: number,
  y: number
): { state: boolean | null; coord: Coord } {
  let state: boolean | null = null;
  if (y <= maxY) state = !occupied[`${x},${y}`];
  if (part2 && y === maxY) state = false;
  return { state, coord: { x, y } };
}

function moveSand(
  occupied: Record<string, boolean>,
  maxY: number,
  sand: Coord
): Coord | false | null {
  const beneath = coordState(occupied, maxY, sand.x, sand.y + 1);
  const left = coordState(occupied, maxY, sand.x - 1, sand.y + 1);
  const right = coordState(occupied, maxY, sand.x + 1, sand.y + 1);

  if (beneath.state) {
    return beneath.coord;
  } else if (left.state) {
    return left.coord;
  } else if (right.state) {
    return right.coord;
  } else if (beneath.state === false) {
    return false;
  } else {
    return null;
  }
}

async function sandCount(walls: string[], maxY: number) {
  const printer = printCave(walls);
  const occupied = walls.reduce((acc, wall) => {
    acc[wall] = true;
    return acc;
  }, {});

  let sandLanded = true;
  let count = 0;

  while (sandLanded) {
    let sand = { x: 500, y: 0 };
    let sandMoving = true;
    while (sandMoving) {
      const newSand = moveSand(occupied, maxY, sand);

      if (newSand === false) {
        occupied[`${sand.x},${sand.y}`] = true;
        sandMoving = false;
        count++;
        if (sand.x === 500 && sand.y === 0) {
          sandLanded = false;
        }
      } else if (newSand === null) {
        sandMoving = false;
        sandLanded = false;
      } else {
        sand = newSand;
      }

      if (Math.random() < 0.01) {
        printer(occupied, sand);
        await new Promise((res) => setTimeout(res, 100));
      }
    }
  }

  return count;
}

function partOne(inp) {
  const { points, maxY } = parse(inp);
  return sandCount(points, maxY);
}

function partTwo(inp) {
  const { points, maxY } = parse(inp);
  part2 = true;
  return sandCount(points, maxY + 2);
}

(async function main() {
  const test1 = await partOne(sample);
  console.log("part 1 sample", test1);
  if (test1 !== sampleSol) {
    console.log("Failed the part 1 test");
    process.exit(1);
  }

  const sol1 = await partOne(inp);
  console.log("part 1 sol:", sol1);

  const test2 = await partTwo(sample);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(inp);
  console.log("part 2 sol:", sol2);
})();
