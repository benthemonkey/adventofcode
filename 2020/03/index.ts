import fs from "fs/promises";
const sampleSol = 7;
const sample2Sol = 336;

function countTrees(rawLines: string[], right: number, down: number) {
  const rowLength = rawLines[0].length;
  let trees = 0;
  for (let i = 0; i < Math.floor(rawLines.length / down); i++) {
    if (rawLines[i * down][(i * right) % rowLength] === "#") trees++;
  }

  return trees;
}

function partOne(rawLines: string[]) {
  return countTrees(rawLines, 3, 1);
}

const slopes = [
  [1, 1],
  [3, 1],
  [5, 1],
  [7, 1],
  [1, 2],
];
function partTwo(rawLines: string[]) {
  return slopes.reduce(
    (acc, [right, down]) => acc * countTrees(rawLines, right, down),
    1
  );
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
