import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 26397;
const sample2Sol = 288957;

const ScoreTable: Record<TypeCloseChar, number> = {
  ")": 3,
  "]": 57,
  "}": 1197,
  ">": 25137,
};
const ScoreTable2: Record<TypeCloseChar, number> = {
  ")": 1,
  "]": 2,
  "}": 3,
  ">": 4,
};

const Pairs: Record<TypeOpenChar, TypeCloseChar> = {
  "(": ")",
  "[": "]",
  "{": "}",
  "<": ">",
};

type TypeOpenChar = "(" | "[" | "{" | "<";
type TypeCloseChar = ")" | "]" | "}" | ">";
type TypeChar = TypeOpenChar | TypeCloseChar;

function findSyntaxError(_str: string): {
  stack: TypeOpenChar[];
  err: TypeCloseChar | null;
} {
  const str = _str as unknown as TypeChar[]; // coercing type
  const stack: TypeOpenChar[] = [];

  for (let i = 0; i < str.length; i++) {
    if (str[i] in Pairs) {
      stack.push(str[i] as TypeOpenChar);
    } else {
      if (stack.length === 0) {
        throw new Error("Invalid line");
      }
      const expected = Pairs[_.last(stack)!];
      if (str[i] !== expected) {
        return { stack, err: str[i] as TypeCloseChar };
      }
      stack.pop();
    }
  }
  return { stack, err: null };
}

function partOne(rawLines: string[]) {
  return rawLines.map(findSyntaxError).reduce((acc, { err }) => {
    if (err === null) return acc;
    return acc + ScoreTable[err];
  }, 0);
}

function partTwo(rawLines: string[]) {
  const allScores = rawLines.reduce((acc, str) => {
    const { stack, err } = findSyntaxError(str);
    if (err) return acc;
    const score = stack.reduceRight(
      (acc2, char) => acc2 * 5 + ScoreTable2[Pairs[char]],
      0
    );
    acc.push(score);
    return acc;
  }, [] as number[]);
  return allScores.sort((a, b) => a - b)[Math.floor(allScores.length / 2)];
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
