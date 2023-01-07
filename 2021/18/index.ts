import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 4140;
const sample2Sol = 3993;

type TypePair = [number | TypePair, number | TypePair];

function parse(line: string): TypePair {
  return eval(line);
}

// mutates
function setAtPath(pair: TypePair, path: number[], val: number | TypePair) {
  let ref: TypePair | number = pair;
  for (let i = 0; i < path.length - 1; i++) {
    if (typeof ref === "number")
      throw new Error("Invalid path. " + JSON.stringify({ pair, path }));
    ref = ref[path[i]];
  }
  if (typeof ref === "number")
    throw new Error("Invalid path. " + JSON.stringify({ pair, path }));

  ref[path[path.length - 1]] = val;
}

function getAtPath(pair: TypePair, path: number[]): TypePair | number {
  const val = _.get(pair, `[${path.join("][")}]`);

  if (typeof val === "undefined")
    throw new Error("Invalid getAtPath: " + JSON.stringify({ pair, path }));

  return val;
}

function addAtPath(pair: TypePair, path: number[], val: number) {
  const oldVal = getAtPath(pair, path);
  if (typeof oldVal !== "number")
    throw new Error(
      "Invalid addition target: " + JSON.stringify({ pair, path })
    );

  setAtPath(pair, path, oldVal + val);
}

function getExplosionPaths(
  pair: TypePair | number,
  path: number[] = []
): number[][] {
  if (typeof pair === "number") return [];
  if (path.length === 4) {
    return [path];
  }

  return [
    ...getExplosionPaths(pair[0], [...path, 0]),
    ...getExplosionPaths(pair[1], [...path, 1]),
  ];
}

function getSplitPaths(
  pair: TypePair | number,
  path: number[] = []
): number[][] {
  if (typeof pair === "number") {
    if (pair >= 10) {
      return [path];
    } else {
      return [];
    }
  }

  return [
    ...getSplitPaths(pair[0], [...path, 0]),
    ...getSplitPaths(pair[1], [...path, 1]),
  ];
}

function getNeighbor(
  pair: TypePair,
  path: number[],
  type: number
): number[] | null {
  const ind = path.lastIndexOf(type ? 0 : 1);
  if (ind === -1) return null;

  const neighborPath = path.slice(0, ind).concat(type);

  while (Array.isArray(getAtPath(pair, neighborPath))) {
    neighborPath.push(type ? 0 : 1);
  }
  return neighborPath;
}

function explode(pair: TypePair, path: number[]) {
  const leftNeighborPath = getNeighbor(pair, path, 0);
  const rightNeighborPath = getNeighbor(pair, path, 1);

  const value = getAtPath(pair, path);
  if (
    typeof value === "number" ||
    typeof value[0] !== "number" ||
    typeof value[1] !== "number"
  )
    throw new Error("Bad explode target");

  if (leftNeighborPath) {
    addAtPath(pair, leftNeighborPath, value[0]);
  }
  if (rightNeighborPath) {
    addAtPath(pair, rightNeighborPath, value[1]);
  }

  setAtPath(pair, path, 0);

  return pair;
}

function split(pair: TypePair, path: number[]) {
  const value = getAtPath(pair, path);
  if (typeof value !== "number") throw new Error("Bad split target");

  setAtPath(pair, path, [Math.floor(value / 2), Math.ceil(value / 2)]);
  return pair;
}

function reduce(pair: TypePair): TypePair {
  let newPair = _.cloneDeep(pair); // remove for performance later
  let atEnd = false;

  while (!atEnd) {
    const explosionPaths = getExplosionPaths(newPair);

    if (explosionPaths.length > 0) {
      newPair = explode(newPair, explosionPaths[0]);
      continue;
    }

    const splitPaths = getSplitPaths(newPair);

    if (splitPaths.length > 0) {
      newPair = split(newPair, splitPaths[0]);
      continue;
    }

    atEnd = true;
  }
  return newPair;
}

function magnitude(pair: TypePair | number): number {
  if (typeof pair === "number") return pair;

  return magnitude(pair[0]) * 3 + magnitude(pair[1]) * 2;
}

function partOne(rawLines: string[]) {
  const lines = rawLines.map(parse);
  const sum = lines.reduce((acc, line) => reduce([acc, line]));

  return magnitude(sum);
}

function generatePermutations(len: number): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len; j++) {
      if (i !== j) out.push([i, j]);
    }
  }
  return out;
}

function partTwo(rawLines: string[]) {
  const lines = rawLines.map(parse);
  const perms = generatePermutations(lines.length).map(([ind1, ind2]) =>
    magnitude(reduce([lines[ind1], lines[ind2]]))
  );
  return Math.max(...perms);
}

function tests() {
  // test explode
  const allTrue = [
    JSON.stringify(explode(parse("[[[[[9,8],1],2],3],4]"), [0, 0, 0, 0])) ===
      "[[[[0,9],2],3],4]",
    JSON.stringify(explode(parse("[7,[6,[5,[4,[3,2]]]]]"), [1, 1, 1, 1])) ===
      "[7,[6,[5,[7,0]]]]",
    JSON.stringify(explode(parse("[[6,[5,[4,[3,2]]]],1]"), [0, 1, 1, 1])) ===
      "[[6,[5,[7,0]]],3]",
    JSON.stringify(
      explode(parse("[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]"), [0, 1, 1, 1])
    ) === "[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]",
    JSON.stringify(
      explode(parse("[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]"), [1, 1, 1, 1])
    ) === "[[3,[2,[8,0]]],[9,[5,[7,0]]]]",
  ];

  if (!allTrue.every(Boolean)) {
    throw new Error("failed test" + JSON.stringify(allTrue));
  }
}

(async function main() {
  tests();
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
