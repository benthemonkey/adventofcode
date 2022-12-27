import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 5934;
const sample2Sol = 26984457539;

function parse(str: string): number[] {
  const countLookup = str
    .split(",")
    .map((x) => parseInt(x, 10))
    .reduce((acc, bioclock) => {
      acc[bioclock] = (acc[bioclock] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return new Array(9).fill("").map((x, i) => countLookup[i] || 0);
}

function simulate(_schools: number[]): number[] {
  const schools = _schools.slice();
  const breedToday = schools.shift()!;
  schools[6] += breedToday;
  schools.push(breedToday);

  return schools;
}

function partOne(rawLines: string[]) {
  let schools = parse(rawLines[0]);

  for (let i = 0; i < 80; i++) {
    schools = simulate(schools);
  }
  return _.sum(schools);
}

function partTwo(rawLines: string[]) {
  let schools = parse(rawLines[0]);

  for (let i = 0; i < 256; i++) {
    schools = simulate(schools);
  }
  return _.sum(schools);
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
