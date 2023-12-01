import fs from "fs/promises";
const sampleSol = 142;
const sample2Sol = 281;

const replacements: [string, number][] = [
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
];

const replacementsReverse: [string, number][] = replacements.map(
  ([search, replace]) => [search.split("").reverse().join(""), replace]
);

function parse(line: string): number {
  const first = /\D*(\d)/.exec(line);
  const last = /\D*(\d)/.exec(line.split("").reverse().join(""));
  return first && last ? parseInt(first[1] + last["1"], 10) : -1;
}

function partOne(rawLines: string[]) {
  return rawLines.reduce((acc, line) => acc + parse(line), 0);
}

function parse2(line: string): number {
  let start: number | null = null;
  let searchStart = line;
  let end: number | null = null;
  let searchEnd = line.split("").reverse().join("");

  while (start === null && searchStart.length > 0) {
    const numValue = parseInt(searchStart[0]);

    if (numValue > 0) {
      start = numValue;
      break;
    }

    for (let i = 0; i < replacements.length; i++) {
      if (searchStart.startsWith(replacements[i][0])) {
        start = replacements[i][1];
        break;
      }
    }

    searchStart = searchStart.substring(1);
  }

  while (end === null && searchEnd.length > 0) {
    const numValue = parseInt(searchEnd[0]);

    if (numValue > 0) {
      end = numValue;
      break;
    }

    for (let i = 0; i < replacementsReverse.length; i++) {
      if (searchEnd.startsWith(replacementsReverse[i][0])) {
        end = replacementsReverse[i][1];
        break;
      }
    }

    searchEnd = searchEnd.substring(1);
  }

  if (start && end) {
    return parseInt(start.toString() + end.toString());
  } else {
    return 0;
  }
}

function partTwo(rawLines: string[]) {
  return rawLines.reduce((acc, line) => acc + parse2(line), 0);
}

(async function main() {
  const sample = await fs
    .readFile(__dirname + "/sample.txt", "utf8")
    .then((txt) => txt.split("\n"));
  const sample2 = await fs
    .readFile(__dirname + "/sample2.txt", "utf8")
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

  const test2 = await partTwo(sample2);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(input);
  console.log("part 2 sol:", sol2);
})();
