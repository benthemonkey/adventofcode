import fs from "fs/promises";
import _ from "lodash";
import { binarySearchInt } from "../../utils";
const sampleSol = 37;
const sample2Sol = 168;

function parse(str: string) {
  return str.split(",").map((x) => parseInt(x, 10));
}

function cost(arr: number[], pos: number): number {
  return arr.reduce((acc, x) => acc + Math.abs(x - pos), 0);
}
function cost2(arr: number[], pos: number): number {
  return arr.reduce(
    (acc, x) => acc + _.sum(_.range(1, Math.abs(x - pos) + 1)),
    0
  );
}

function partOne(rawLines: string[]) {
  const pos = parse(rawLines[0]);

  const bestPos = binarySearchInt((val) => cost(pos, val + 1) - cost(pos, val));
  if (bestPos === null) throw new Error("failed");

  return cost(pos, bestPos);
}

function partTwo(rawLines: string[]) {
  const pos = parse(rawLines[0]);

  const bestPos = binarySearchInt(
    (val) => cost2(pos, val + 1) - cost2(pos, val)
  );
  if (bestPos === null) throw new Error("failed");
  return cost2(pos, bestPos);
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
