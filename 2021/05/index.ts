import fs from "fs/promises";
const sampleSol = 5;
const sample2Sol = 12;

function parse(str: string) {
  return str
    .split(" -> ")
    .map((coord) => coord.split(",").map((x) => parseInt(x, 10)));
}

function makeKey(x: number, y: number) {
  return x + ":" + y;
}

function posOrNeg(x: number) {
  if (x === 0) {
    return 0;
  }
  return x / Math.abs(x);
}

function countOverlaps(lines: number[][][]) {
  const occupied: Record<string, number> = {};
  for (const line of lines) {
    let x = line[0][0];
    const xRate = posOrNeg(line[1][0] - line[0][0]);
    let y = line[0][1];
    const yRate = posOrNeg(line[1][1] - line[0][1]);

    while (x !== line[1][0] + xRate || y !== line[1][1] + yRate) {
      const key = makeKey(x, y);
      occupied[key] = (occupied[key] || 0) + 1;

      x += xRate;
      y += yRate;
    }
  }
  return Object.values(occupied).filter((x) => x > 1).length;
}

function partOne(rawLines: string[]) {
  const lines = rawLines
    .map(parse)
    .filter(([start, end]) => start[0] === end[0] || start[1] === end[1]);
  return countOverlaps(lines);
}

function partTwo(rawLines: string[]) {
  return countOverlaps(rawLines.map(parse));
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
