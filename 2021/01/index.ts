import fs from "fs";
import _ from "lodash";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n");
const sampleSol = 7;
const sample2Sol = 5;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

function partOne(inp: string[]) {
  return inp.reduce(
    (acc, val) => {
      const num = parseInt(val, 10);
      if (num > acc.lastVal) {
        acc.count++;
      }
      acc.lastVal = num;
      return acc;
    },
    { lastVal: Infinity, count: 0 }
  ).count;
}

function partTwo(inp: string[]) {
  return inp.reduce(
    (acc, val) => {
      const num = parseInt(val, 10);
      if (acc.window.length === 3) {
        if (_.sum(acc.window) < _.sum([...acc.window.slice(1), num])) {
          acc.count++;
        }
        acc.window.shift()!;
      }
      acc.window.push(num);
      return acc;
    },
    { window: [] as number[], count: 0 }
  ).count;
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
