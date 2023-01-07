import fs from "fs/promises";
import { gridBFS } from "../../utils/grid";
const sampleSol = 40;
const sample2Sol = 315;

function parse(rawLines: string[]): number[][] {
  return rawLines.map((line) => line.split("").map((x) => parseInt(x, 10)));
}

function thisGridBFS(grid: number[][]): number | null {
  return gridBFS(
    grid,
    (totalRisk, risk) => (totalRisk || 0) + risk,
    (val, coord) =>
      coord[0] === grid[0].length - 1 && coord[1] === grid.length - 1,
    {
      shouldSkip(bestScore, thisScore, coord) {
        return (
          bestScore <
          thisScore + grid.length + grid[0].length - coord[0] - coord[1] - 2
        );
      },
    }
  );
}

function partOne(rawLines: string[]) {
  const grid = parse(rawLines);
  return thisGridBFS(grid);
}

function partTwo(rawLines: string[]) {
  const bumpCell = (index: number) => (cell: number) =>
    ((cell + index) % 10) + (cell + index >= 10 ? 1 : 0);
  const grid = parse(rawLines);
  const bigGrid = grid.map((row) => {
    return new Array(5).fill("").reduce((acc, x, index) => {
      acc = acc.concat(row.map(bumpCell(index)));
      return acc;
    }, []);
  });
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < grid.length; j++) {
      bigGrid.push(bigGrid[i * grid.length + j].map(bumpCell(1)));
    }
  }

  return thisGridBFS(bigGrid);
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
