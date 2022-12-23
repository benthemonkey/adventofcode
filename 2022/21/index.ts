import fs from "fs";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n");
const sampleSol = 152;
const sample2Sol = 301;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

type Line =
  | {
      id: string;
      type: "value";
      value: number;
    }
  | {
      id: string;
      type: "math";
      left: string;
      right: string;
      operator: "/" | "*" | "+" | "-" | "=";
    };

function parse(inp: string): Line {
  const reg =
    /(?<id>\w{4}): ((?<value>\d+)|((?<left>\w{4}) (?<operator>[/*\-+]) (?<right>\w{4})))/gm;

  const out = reg.exec(inp);
  if (!out || !out.groups) throw new Error("failed to parse " + inp);

  let tmp: Line;
  if (out.groups.value) {
    tmp = {
      id: out.groups.id,
      type: "value",
      value: parseInt(out.groups.value, 10),
    };
  } else {
    tmp = {
      id: out.groups.id,
      type: "math",
      left: out.groups.left,
      right: out.groups.right,
      operator: out.groups.operator as "/" | "*" | "+" | "-" | "=",
    };
  }
  return tmp;
}

function doMath(
  left: number,
  right: number,
  operator: "/" | "*" | "+" | "-" | "="
) {
  return eval(`${left} ${operator} ${right}`) as number;
}

function runMonkeys(
  id: string,
  monkeys: Record<string, Line>
): number | number[] {
  const monkey = monkeys[id];
  if (typeof monkey === "undefined") throw new Error("couldnt find" + id);
  if (monkey.type === "value") {
    return monkey.value;
  } else {
    const left = runMonkeys(monkey.left, monkeys) as number;
    const right = runMonkeys(monkey.right, monkeys) as number;

    if (monkey.operator === "=") {
      return [left, right];
    }

    return doMath(left, right, monkey.operator);
  }
}

function partOne(inp: string[]) {
  const monkeys = inp.map(parse).reduce((acc, monkey) => {
    acc[monkey.id] = monkey;
    return acc;
  }, {} as Record<string, Line>);

  return runMonkeys("root", monkeys);
}

function binarySearchInt(func: (val: number) => number): number | null {
  let jump = 10;
  let iter = 0;
  let guess = 1;
  let distance = func(guess);

  while (iter < 100000) {
    iter++;
    guess += jump;

    const newDistance = func(guess);

    if (newDistance === 0) return guess;

    const accel = Math.abs(distance) - Math.abs(newDistance);
    if (accel < 0 || distance * newDistance < 0) {
      guess -= jump;

      if (accel < 0) {
        jump *= -1;
      }
      jump = jump > 0 ? Math.ceil(jump / 2) : Math.floor(jump / 2);
    } else {
      jump *= 2;
      distance = newDistance;
    }
  }

  return null;
}

function partTwo(inp: string[]) {
  const monkeys = inp.map(parse).reduce((acc, monkey) => {
    acc[monkey.id] = monkey;
    return acc;
  }, {} as Record<string, Line>);

  if (monkeys["root"].type === "math") {
    monkeys["root"].operator = "=";
  }

  return binarySearchInt((val: number) => {
    if (monkeys["humn"].type === "value") {
      monkeys["humn"].value = val;
    }
    const [left, right] = runMonkeys("root", monkeys) as number[];
    return left - right;
  });
}

(async function main() {
  const test1 = await partOne(sample);
  console.log("part 1 sample", test1);
  if (test1 !== sampleSol) {
    console.log("Failed the part 1 test");
    process.exit(1);
  }

  const sol1 = await partOne(inp);
  console.log("part 1 sol:", sol1);

  const test2 = await partTwo(sample);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(inp);
  console.log("part 2 sol:", sol2);
})();
