import fs from "fs/promises";
const sampleSol = 2;
const sample2Sol = 1;

const lineRegexp = /(?<min>\d+)-(?<max>\d+) (?<letter>\w): (?<input>\w+)$/;

interface Password {
  min: number;
  max: number;
  letter: string;
  input: string;
}

function parse(line: string): Password {
  const res = line.match(lineRegexp);

  if (!res || !res.groups) throw new Error("failed to parse " + line);

  return {
    min: parseInt(res.groups.min, 10),
    max: parseInt(res.groups.max, 10),
    letter: res.groups.letter,
    input: res.groups.input,
  };
}

function isValid(pw: Password) {
  const count = pw.input.split("").filter((x) => x === pw.letter).length;

  return count >= pw.min && count <= pw.max;
}

function partOne(rawLines: string[]) {
  return rawLines.reduce(
    (valid, line) => valid + (isValid(parse(line)) ? 1 : 0),
    0
  );
}

function myXor(a, b) {
  return (a && !b) || (!a && b);
}

function isValid2(pw: Password) {
  return myXor(
    pw.input[pw.min - 1] === pw.letter,
    pw.input[pw.max - 1] === pw.letter
  );
}

function partTwo(rawLines: string[]) {
  return rawLines.reduce(
    (valid, line) => valid + (isValid2(parse(line)) ? 1 : 0),
    0
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
