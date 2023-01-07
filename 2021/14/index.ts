import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 1588;
const sample2Sol = 2188189693529;

function parse(str: string) {
  return str.split("\n").reduce((acc, line) => {
    const [reactants, result] = line.split(" -> ");

    acc[reactants] = result;
    return acc;
  }, {} as Record<string, string>);
}

const addToObject = (obj: Record<string, number>, key: string, val = 1) => {
  obj[key] = (obj[key] || 0) + val;
};

function run(
  start: string[],
  rules: Record<string, string>,
  times: number
): number {
  let pairs: Record<string, number> = {};
  for (let i = 0; i < start.length - 1; i++) {
    addToObject(pairs, start[i] + start[i + 1]);
  }

  let nextPairs: Record<string, number> = {};
  for (let i = 0; i < times; i++) {
    _.map(pairs, (count, key) => {
      const parents = key.split("");
      const child = rules[key];
      addToObject(nextPairs, parents[0] + child, count);
      addToObject(nextPairs, child + parents[1], count);
    });

    pairs = nextPairs;
    nextPairs = {};
  }

  const countsObj = Object.keys(pairs).reduce((acc, key) => {
    addToObject(acc, key[0], pairs[key]);
    addToObject(acc, key[1], pairs[key]);
    return acc;
  }, {} as Record<string, number>);
  countsObj[start[0]]++;
  countsObj[_.last(start)!]++;
  const counts = Object.values(countsObj)
    .map((x) => x / 2)
    .sort((a, b) => a - b);

  return _.last(counts)! - counts[0];
}

function partOne(rawLines: string[]) {
  const str = rawLines[0].split("");
  const rules = parse(rawLines[1]);

  return run(str, rules, 10);
}

function partTwo(rawLines: string[]) {
  const str = rawLines[0].split("");
  const rules = parse(rawLines[1]);

  return run(str, rules, 40);
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
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(input);
  console.log("part 2 sol:", sol2);
})();
