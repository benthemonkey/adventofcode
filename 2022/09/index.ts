import fs from "fs";
const sample = fs.readFileSync(__dirname + "/sample1.txt", "utf8").split("\n");
const sampleSol = 13;
const sample2 = fs.readFileSync(__dirname + "/sample2.txt", "utf8").split("\n");
const sample2Sol = 36;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

function posOrNeg(x: number) {
  if (x === 0) {
    return 0;
  }
  return x / Math.abs(x);
}

function newTailCoord(
  head: [number, number],
  tail: [number, number]
): [number, number] {
  const relX = head[0] - tail[0];
  const relY = head[1] - tail[1];

  if (Math.abs(relX) > 1 || Math.abs(relY) > 1) {
    return [tail[0] + posOrNeg(relX), tail[1] + posOrNeg(relY)];
  }
  return [tail[0], tail[1]];
}

function newHead(head: [number, number], dir: string): [number, number] {
  switch (dir) {
    case "U":
      return [head[0], head[1] + 1];
    case "D":
      return [head[0], head[1] - 1];
    case "L":
      return [head[0] - 1, head[1]];
    case "R":
      return [head[0] + 1, head[1]];
    default:
      throw new Error(dir);
  }
}

function partOne(inp: string[]) {
  const visitedCoords: Record<string, boolean> = { "0,0": true };
  let head: [number, number] = [0, 0];
  let tail: [number, number] = [0, 0];

  for (let i = 0; i < inp.length; i++) {
    const [dir, _count] = inp[i].split(" ");
    const count = parseInt(_count, 10);

    for (let j = 0; j < count; j++) {
      head = newHead(head, dir);
      tail = newTailCoord(head, tail);
      visitedCoords[tail.join(",")] = true;
    }
  }

  return Object.keys(visitedCoords).length;
}

function partTwo(inp: string[]) {
  const visitedCoords: Record<string, boolean> = { "0,0": true };
  const ropes: [number, number][] = new Array(10).fill([0, 0]);
  for (let i = 0; i < inp.length; i++) {
    const [dir, _count] = inp[i].split(" ");
    const count = parseInt(_count, 10);

    for (let j = 0; j < count; j++) {
      ropes[0] = newHead(ropes[0], dir);
      for (let k = 0; k < ropes.length - 1; k++) {
        ropes[k + 1] = newTailCoord(ropes[k], ropes[k + 1]);
        if (k === ropes.length - 2) {
          visitedCoords[ropes[k + 1].join(",")] = true;
        }
      }
    }
  }

  return Object.keys(visitedCoords).length;
}

const test1 = partOne(sample);
console.log("part 1 sample", test1);
if (test1 !== sampleSol) {
  console.log("Failed the part 1 test");
  process.exit(1);
}
console.log("part 1 sol:", partOne(inp));

const test2 = partTwo(sample2);
console.log("part 2 sample", test2);
if (test2 !== sample2Sol) {
  console.log("Failed the part 2 test");
  process.exit(1);
}

console.log("part 2 sol:", partTwo(inp));
