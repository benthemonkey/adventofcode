import fs from "fs";
import _ from "lodash";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n");
const sampleSol = 3;
const sample2Sol = 1623178306;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

function mix(nums: number[], times = 1): number {
  const list = nums.map((val, ind) => ({ val, ind }));
  for (let i = 0; i < list.length * times; i++) {
    const currentInd = list.findIndex(({ ind }) => ind === i % list.length);
    if (currentInd === -1) throw new Error("didnt find el");
    const [el] = list.splice(currentInd, 1);
    list.splice((currentInd + el.val) % list.length, 0, el);
  }

  const zeroIndex = list.findIndex(({ val }) => val === 0);
  if (zeroIndex === -1) throw new Error("didnt find zero el");
  const keys = [1000, 2000, 3000].map(
    (x) => list[(zeroIndex + x) % list.length].val
  );
  return _.sum(keys);
}

function partOne(inp: string[]) {
  const nums = inp.map((x) => parseInt(x, 10));
  return mix(nums);
}

function partTwo(inp: string[]) {
  const decryptionKey = 811589153;
  const nums = inp.map((x) => parseInt(x, 10) * decryptionKey);
  return mix(nums, 10);
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
