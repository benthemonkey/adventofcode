import fs from "fs/promises";
const sampleSol = 114;
const sample2Sol = 2;

function diffDown(seq: number[]): number[] {
  return seq.slice(1).map((x, ind) => x - seq[ind]);
}

function getNext(seq: number[]): number {
  let x = seq[seq.length - 1];
  let copy = seq.slice();

  while (!copy.every((x) => x === 0)) {
    copy = diffDown(copy);
    x += copy[copy.length - 1];
  }

  return x;
}

function getPrevious(seq: number[]): number {
  let x = seq[0];
  let copy = seq.slice();
  let i = 0;

  while (!copy.every((x) => x === 0)) {
    copy = diffDown(copy);

    if (i % 2 === 0) {
      x -= copy[0];
    } else {
      x += copy[0];
    }

    i++;
  }

  return x;
}

function parse(line: string): number[] {
  return line.split(" ").map((x) => parseInt(x, 10));
}

function partOne(rawLines: string[]) {
  return rawLines
    .map(parse)
    .map((x) => getNext(x))
    .reduce((a, b) => a + b);
}

function partTwo(rawLines: string[]) {
  console.log(getPrevious(parse(rawLines[1])));

  console.log(rawLines.map(parse).map((x) => getPrevious(x)));
  return rawLines
    .map(parse)
    .map((x) => getPrevious(x))
    .reduce((a, b) => a + b);
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
