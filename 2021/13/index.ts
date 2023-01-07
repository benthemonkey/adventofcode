import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 17;

function parse([coords, folds]: string[]) {
  return {
    coords: coords
      .split("\n")
      .map((line) => line.split(",").map((x) => parseInt(x, 10))),
    folds: folds.split("\n").map((line) => {
      const [axis, val] = line.split("=");
      return {
        axis: axis[axis.length - 1] as "x" | "y",
        val: parseInt(val, 10),
      };
    }),
  };
}

function fold(
  points: number[][],
  fold: { val: number; axis: "x" | "y" }
): number[][] {
  const lookup: Record<string, boolean> = {};

  return points.reduce((acc, coord) => {
    const primaryIndex = fold.axis === "x" ? 0 : 1;

    const key = coord.join(":");

    if (coord[primaryIndex] < fold.val) {
      if (!lookup[key]) {
        lookup[key] = true;
        acc.push(coord);
      }
    } else {
      const newCoord = coord.slice();
      newCoord[primaryIndex] -= (newCoord[primaryIndex] - fold.val) * 2;
      const newKey = newCoord.join(":");

      if (!lookup[newKey]) {
        lookup[newKey] = true;
        acc.push(newCoord);
      }
    }

    return acc;
  }, [] as number[][]);
}

function partOne(rawLines: string[]) {
  const { coords, folds } = parse(rawLines);
  return fold(coords, folds[0]).length;
}

function print(coords: number[][]): string {
  const maxX = _.maxBy(coords, "[0]")![0];
  const maxY = _.maxBy(coords, "[1]")![1];
  const grid = new Array(maxY + 1)
    .fill("")
    .map(() => new Array(maxX + 1).fill("."));

  coords.forEach(([x, y]) => {
    grid[y][x] = "#";
  });

  return grid.map((line) => line.join("")).join("\n");
}

function partTwo(rawLines: string[]) {
  const { coords, folds } = parse(rawLines);

  const finalCoords = folds.reduce(fold, coords);
  return "\n\n" + print(finalCoords);
}

(async function main() {
  const sample = await fs
    .readFile(__dirname + "/sample.txt", "utf8")
    .then((txt) => txt.split("\n\n"));
  const input = await fs
    .readFile(__dirname + "/input.txt", "utf8")
    .then((txt) => txt.split("\n\n"));

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

  const sol2 = await partTwo(input);
  console.log("part 2 sol:", sol2);
})();
