import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 26;
const sample2Sol = 61229;

function parse(str: string) {
  return str
    .split(" | ")
    .map((x) => x.split(" ").map((x) => x.split("").sort().join("")));
}

function partOne(rawLines: string[]) {
  return rawLines
    .map(parse)
    .reduce(
      (acc, x) =>
        acc + x[1].filter((y) => [2, 4, 3, 7].includes(y.length)).length,
      0
    );
}

function intersection(str1: string, str2: string): string[] {
  return str1.split("").filter((s) => str2.includes(s));
}

function solveForValue([input, output]: string[][]): number {
  const byCount = input.reduce((acc, x) => {
    if (!acc[x.length]) {
      acc[x.length] = [];
    }
    acc[x.length].push(x);
    return acc;
  }, {} as Record<string, string[]>);

  // known
  const one = byCount["2"][0];
  const four = byCount["4"][0];
  const seven = byCount["3"][0];
  const eight = byCount["7"][0];

  const { zero, six, nine } = byCount["6"].reduce(
    (acc, str) => {
      // 6 will only intersect once with 1
      if (intersection(str, one).length === 1) {
        acc.six = str;
        // 9 will be the only 6 long input that fully intersects with 4
      } else if (intersection(str, four).length === 4) {
        acc.nine = str;
      } else {
        acc.zero = str;
      }
      return acc;
    },
    { zero: "", six: "", nine: "" }
  );

  const { two, three, five } = byCount["5"].reduce(
    (acc, str) => {
      // 3 is the only 5 long input that fully intersects with 1
      if (intersection(str, one).length === 2) {
        acc.three = str;
        // 5 is a subset of 6
      } else if (intersection(str, six).length === 5) {
        acc.five = str;
      } else {
        acc.two = str;
      }
      return acc;
    },
    { two: "", three: "", five: "" }
  );

  const solution: Record<string, number> = {
    [zero]: 0,
    [one]: 1,
    [two]: 2,
    [three]: 3,
    [four]: 4,
    [five]: 5,
    [six]: 6,
    [seven]: 7,
    [eight]: 8,
    [nine]: 9,
  };

  return output
    .reverse()
    .reduce((acc, val, i) => acc + solution[val] * Math.pow(10, i), 0);
}

function partTwo(rawLines: string[]) {
  return _.sum(rawLines.map(parse).map(solveForValue));
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
