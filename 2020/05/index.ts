import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 357;

function parse(line: string): number {
  const row = parseInt(
    line.substring(0, 7).replace(/F/g, "0").replace(/B/g, "1"),
    2
  );
  const column = parseInt(
    line.substring(7).replace(/L/g, "0").replace(/R/g, "1"),
    2
  );

  return row * 8 + column;
}

function partOne(rawLines: string[]) {
  return Math.max(...rawLines.map(parse));
}

function partTwo(rawLines: string[]) {
  const seatIds = _.sortBy(rawLines.map(parse)).reverse();

  const secondToLastRow = seatIds.indexOf(seatIds[0] - (seatIds[0] % 8));

  for (let i = secondToLastRow; i < seatIds.length - 1; i++) {
    if (seatIds[i] - seatIds[i + 1] > 1) {
      return seatIds[i] - 1;
    }
  }
  return -1;
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

  const sol2 = await partTwo(input);
  console.log("part 2 sol:", sol2);
})();
