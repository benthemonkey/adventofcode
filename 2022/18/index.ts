import fs from "fs";
import _ from "lodash";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n");
const sampleSol = 64;
const sample2Sol = 58;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

type Plane = Record<string, number[]>;

function makePlanes(coords: number[][]): Plane[] {
  const xyPlane: Plane = {};
  const xzPlane: Plane = {};
  const yzPlane: Plane = {};

  coords.forEach(([x, y, z]) => {
    xyPlane[`${x}:${y}`] = _.sortBy((xyPlane[`${x}:${y}`] || []).concat(z));
    xzPlane[`${x}:${z}`] = _.sortBy((xzPlane[`${x}:${z}`] || []).concat(y));
    yzPlane[`${y}:${z}`] = _.sortBy((yzPlane[`${y}:${z}`] || []).concat(x));
  });

  return [xyPlane, xzPlane, yzPlane];
}

function adjacencyWithinPlane(plane: Plane) {
  return Object.values(plane).reduce((acc, column) => {
    let adjacents = 0;
    for (let i = 0; i < column.length - 1; i++) {
      if (column[i] + 1 === column[i + 1]) adjacents++;
    }
    return acc + adjacents;
  }, 0);
}

function partOne(inp: string[]) {
  const coords = inp.map((s) => s.split(",").map((x) => parseInt(x, 10)));

  const [xyPlane, xzPlane, yzPlane] = makePlanes(coords);

  const allAdj = [xyPlane, xzPlane, yzPlane].reduce((acc, plane) => {
    return acc + adjacencyWithinPlane(plane);
  }, 0);

  return coords.length * 6 - allAdj * 2;
}

function flood(coords: number[][]): number {
  const [xyPlane, xzPlane, yzPlane] = makePlanes(coords);
  const maxCoord =
    1 + coords.reduce((acc, coord) => Math.max(...coord, acc), 0);
  const minCoord =
    -1 + coords.reduce((acc, coord) => Math.min(...coord, acc), Infinity);
  const occupied: Record<string, boolean> = {};
  console.log(minCoord, maxCoord);

  const queue: number[][] = [[minCoord, minCoord, minCoord]];
  let surface = 0;

  while (queue.length > 0) {
    const point = queue.shift()!;
    const [x, y, z] = point;

    if (occupied[point.join(":")]) continue;

    occupied[point.join(":")] = true;
    [-1, 1].forEach((move) => {
      const tx = x + move;
      const ty = y + move;
      const tz = z + move;

      // x
      if (tx >= minCoord && tx <= maxCoord) {
        if (yzPlane[`${y}:${z}`]?.includes(tx)) {
          surface++;
        } else {
          queue.push([tx, y, z]);
        }
      }

      // y
      if (ty >= minCoord && ty <= maxCoord) {
        if (xzPlane[`${x}:${z}`]?.includes(ty)) {
          surface++;
        } else {
          queue.push([x, ty, z]);
        }
      }

      // z
      if (tz >= minCoord && tz <= maxCoord) {
        if (xyPlane[`${x}:${y}`]?.includes(tz)) {
          surface++;
        } else {
          queue.push([x, y, tz]);
        }
      }
    });
  }

  return surface;
}

function partTwo(inp) {
  // look for cubes adjacent to all
  const coords = inp.map((s) => s.split(",").map((x) => parseInt(x, 10)));

  return flood(coords);
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
