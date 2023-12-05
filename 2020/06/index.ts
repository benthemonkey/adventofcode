import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 11;
const sample2Sol = 6;

function parse(line: string): number {
  return _.uniq(line.replace(/\n/g, "").split("")).length;
}

function partOne(rawLines: string[]) {
  return _.sum(rawLines.map(parse));
}

function parse2(line: string): number {
  const answerGroups = line.split("\n");

  if (answerGroups.length === 1) {
    return answerGroups[0].length;
  }

  let count = 0;
  for (let i = 0; i < answerGroups[0].length; i++) {
    if (
      answerGroups
        .slice(1)
        .every((group) => group.indexOf(answerGroups[0][i]) !== -1)
    )
      count++;
  }

  return count;
}

function partTwo(rawLines: string[]) {
  return _.sum(rawLines.map(parse2));
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
