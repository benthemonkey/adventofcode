import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 150;
const sample2Sol = 900;

function parse(line: string) {
  const [cmd, val] = line.split(" ");
  return {
    type: cmd === "forward" ? "x" : "y",
    val: parseInt(val, 10) * (cmd === "up" ? -1 : 1),
  };
}

function partOne(rawLines: string[]) {
  const { x, y } = rawLines.reduce(
    (acc, line) => {
      const { type, val } = parse(line);
      acc[type] += val;
      return acc;
    },
    { x: 0, y: 0 }
  );
  return x * y;
}

function partTwo(rawLines: string[]) {
  const { depth, x } = rawLines.reduce(
    (acc, line) => {
      const { type, val } = parse(line);
      acc[type] += val;
      if (type === "x") {
        acc.depth += acc.y * val;
      }
      return acc;
    },
    { x: 0, y: 0, depth: 0 }
  );
  return depth * x;
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
