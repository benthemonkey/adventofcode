import fs from "fs";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n\n");
const sampleSol = 13;
const sample2Sol = 140;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n\n");

type TypeSignal = number | TypeSignal[];
function parse(inp: string): [TypeSignal, TypeSignal] {
  return inp.split("\n").map(eval) as [TypeSignal, TypeSignal];
}

function compare(
  val1: TypeSignal,
  val2: TypeSignal,
  part2 = false
): -1 | 0 | 1 {
  // console.log("comparing", val1, "and", val2);
  const returnOutOfOrder = part2 ? 1 : -1;
  const returnInOrder = part2 ? -1 : 1;
  if (typeof val1 === "number" && typeof val2 === "number") {
    return val1 === val2 ? 0 : val1 > val2 ? returnOutOfOrder : returnInOrder;
  } else if (typeof val1 === "number") {
    return compare([val1], val2, part2);
  } else if (typeof val2 === "number") {
    return compare(val1, [val2], part2);
  } else {
    let output;
    for (let i = 0; i < val1.length; i++) {
      if (typeof val2[i] === "undefined") {
        return returnOutOfOrder;
      }

      output = compare(val1[i], val2[i], part2);
      if (output !== 0) {
        return output;
      }
    }
    if (val2.length > val1.length) {
      return returnInOrder;
    }
    return 0;
  }
}

function partOne(inp: string[]) {
  const tmp = inp.map(parse).map(([val1, val2]) => compare(val1, val2));

  return tmp
    .map((x, index) => (x === 1 ? index + 1 : 0))
    .reduce((x, y) => x + y);
}

function partTwo(inp: string[]) {
  const sorted = parse([...inp, "[[2]]", "[[6]]"].join("\n"))
    .sort((a, b) => compare(a, b, true))
    .map((x) => JSON.stringify(x));
  const one = sorted.indexOf("[[2]]") + 1;
  const two = sorted.indexOf("[[6]]") + 1;

  return one * two;
}

const test1 = partOne(sample);
console.log("part 1 sample", test1);
if (test1 !== sampleSol) {
  console.log("Failed the part 1 test");
  process.exit(1);
}
console.log("part 1 sol:", partOne(inp));

const test2 = partTwo(sample);
console.log("part 2 sample", test2);
if (test2 !== sample2Sol) {
  console.log("Failed the part 2 test");
  process.exit(1);
}

console.log("part 2 sol:", partTwo(inp));
