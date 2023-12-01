import fs from "fs/promises";
const sampleSol = 514579;
const sample2Sol = 241861950;

function partOne(rawLines: string[]) {
  const options = rawLines.map((x) => parseInt(x, 10));

  for (let i = 0; i < options.length - 1; i++) {
    for (let j = i + 1; j < options.length; j++) {
      if (options[i] + options[j] === 2020) return options[i] * options[j];
    }
  }
  return -1;
}

function partTwo(rawLines: string[]) {
  const options = rawLines.map((x) => parseInt(x, 10));

  for (let i = 0; i < options.length - 2; i++) {
    for (let j = i + 1; j < options.length - 1; j++) {
      if (options[i] + options[j] < 2020) {
        for (let k = j + 1; k < options.length; k++) {
          if (options[i] + options[j] + options[k] === 2020)
            return options[i] * options[j] * options[k];
        }
      }
    }
  }
  return 0;
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
