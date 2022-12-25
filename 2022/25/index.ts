import fs from "fs/promises";
import _ from "lodash";
const sampleSol = "2=-1=0";

const VALS = ["0", "1", "2", "=", "-", "0"];

function parse(str: string) {
  return str
    .split("")
    .map((y) => parseInt(y.replace("-", "-1").replace("=", "-2"), 10))
    .reverse()
    .reduce((acc, y, i) => acc + Math.pow(5, i) * y, 0);
}
function encode(x: number) {
  const str = x.toString(5).split("").reverse();
  const { val: val, remainder: remainder } = str.reduce(
    (acc, digit) => {
      const raw = parseInt(digit, 10) + acc.remainder;
      return { val: [VALS[raw], ...acc.val], remainder: raw > 2 ? 1 : 0 };
    },
    {
      val: [],
      remainder: 0,
    } as {
      val: string[];
      remainder: number;
    }
  );
  if (remainder === 1) val.unshift("1");

  return val.join("");
}

function partOne(rawLines: string[]) {
  return encode(_.sum(rawLines.map(parse)));
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
})();
