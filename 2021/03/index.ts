import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 198;
const sample2Sol = 230;

function sumRows(rows: string[][]): number[] {
  const out = new Array(rows[0].length).fill(0);
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[0].length; j++) {
      if (rows[i][j] === "1") out[j]++;
    }
  }
  return out;
}

function partOne(rawLines: string[]) {
  const rows = rawLines.map((x) => x.split(""));
  const binary = sumRows(rows).reduce((acc, val) => {
    return acc + (val > rows.length / 2 ? "1" : "0");
  }, "");
  const gamma = parseInt(binary, 2);
  const epsilon = Math.pow(2, binary.length) - 1 - gamma;
  return gamma * epsilon;
}

function partTwo(rawLines: string[]) {
  const rows = rawLines.map((x) => x.split(""));
  let oxygenRows = rows;
  let co2Rows = rows;
  for (let i = 0; i < rows[0].length; i++) {
    const seekingO =
      sumRows(oxygenRows)[i] >= oxygenRows.length / 2 ? "1" : "0";
    const seekingCO2 = sumRows(co2Rows)[i] >= co2Rows.length / 2 ? "0" : "1";

    if (oxygenRows.length > 1) {
      oxygenRows = oxygenRows.filter((row) => row[i] === seekingO);
    }
    if (co2Rows.length > 1) {
      co2Rows = co2Rows.filter((row) => row[i] === seekingCO2);
    }
    if (oxygenRows.length === 1 && co2Rows.length === 1) break;
  }
  const oxygen = parseInt(oxygenRows[0].join(""), 2);
  const co2 = parseInt(co2Rows[0].join(""), 2);

  return oxygen * co2;
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
