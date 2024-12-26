import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 11;
const sample2Sol = 31;

function parse(line: string): number[] {
  return line.split("   ").map((x) => parseInt(x, 10));
}

function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}

const getLists = _.memoize((rawLines: string[]) => {
  const items = rawLines.map(parse);

  const [list1, list2] = transpose(items);

  list1.sort();
  list2.sort();

  return [list1, list2];
});

function partOne(rawLines: string[]) {
  const [list1, list2] = getLists(rawLines);

  let sum = 0;
  for (let i = 0; i < list1.length; i++) {
    sum += Math.abs(list1[i] - list2[i]);
  }

  return sum;
}

function partTwo(rawLines: string[]) {
  const [list1, list2] = getLists(rawLines);

  let sum = 0;
  for (let i = 0; i < list1.length; i++) {
    const foundAt = _.sortedIndexOf(list2, list1[i]);

    if (foundAt === -1) continue;

    let j = 0;
    while (list2[foundAt + j] === list1[i]) {
      sum += list1[i];
      j++;
    }
  }

  return sum;
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
