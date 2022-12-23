import fs from "fs";
import _ from "lodash";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n\n");
const sampleSol = 10605;
const sample2Sol = 2713310158;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n\n");

type TypeMonkey = {
  id: number;
  items: number[];
  operation: (val: number) => number;
  test: number;
  ifTrueThrowTo: number;
  ifFalseThrowTo: number;
  inspected: number;
};

function postInpsectionStep(val: number): number {
  return Math.floor(val / 3);
}

function operationFactory(rawOperation: string) {
  return (val: number) => {
    const old = val;
    const newVal = eval(rawOperation.substring(17));

    return newVal;
  };
}

function doRound(
  monkeys: TypeMonkey[],
  postInpsectionStep: (val: number, monkey: TypeMonkey) => number
): TypeMonkey[] {
  for (let i = 0; i < monkeys.length; i++) {
    const monkey = monkeys[i];

    while (monkey.items.length > 0) {
      let item = monkey.items.shift()!;
      item = monkey.operation(item);
      monkey.inspected++;
      item = postInpsectionStep(item, monkey);

      if (item % monkey.test === 0) {
        monkeys[monkey.ifTrueThrowTo].items.push(item);
      } else {
        monkeys[monkey.ifFalseThrowTo].items.push(item);
      }
    }
  }

  return monkeys;
}

function parse(rawMonkey: string): TypeMonkey {
  const [rawId, rawitems, rawOperation, rawTest, rawTrue, rawFalse] = rawMonkey
    .split("\n")
    .map(_.trim);

  const testVal = parseInt(rawTest.split(" ")[3], 10);

  return {
    id: parseInt(rawId.replace(":", "").substring(7), 10),
    items: rawitems
      .substring(15)
      .split(", ")
      .map((x) => parseInt(x, 10)),
    operation: operationFactory(rawOperation),
    test: testVal,
    ifTrueThrowTo: parseInt(rawTrue.substring(24), 10),
    ifFalseThrowTo: parseInt(rawFalse.substring(25), 10),
    inspected: 0,
  };
}

function partOne(inp: string[]) {
  let monkeys = inp.map(parse);

  for (let i = 0; i < 20; i++) {
    monkeys = doRound(monkeys, postInpsectionStep);
  }

  const topMonkeys = _.sortBy(monkeys.map((x) => x.inspected));
  return topMonkeys.pop()! * topMonkeys.pop()!;
}

function partTwo(inp: string[]) {
  let monkeys = inp.map(parse);

  const highestVal = monkeys.reduce((acc, m) => acc * m.test, 1);

  for (let i = 0; i < 10000; i++) {
    monkeys = doRound(monkeys, (x, monkey) => x % highestVal);
  }

  const topMonkeys = _.sortBy(monkeys.map((x) => x.inspected));
  return topMonkeys.pop()! * topMonkeys.pop()!;
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
