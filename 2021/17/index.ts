import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 45;
const sample2Sol = 112;

type Ranges = { xRange: number[]; yRange: number[] };

function fy(vyi: number, t: number): number {
  return (vyi + 0.5) * t - (t * t) / 2;
}
function fx(vxi: number, t: number): number {
  if (vxi === 0) return 0;
  const terminalT = Math.min(Math.abs(vxi), t);
  const vxiSign = Math.abs(vxi) / vxi;

  return vxi * terminalT - _.sum(_.range(0, terminalT * vxiSign, vxiSign));
}

const AreaRegExp =
  /target area: x=(?<x0>-?\d+)\.\.(?<x1>-?\d+), y=(?<y0>-?\d+)\.\.(?<y1>-?\d+)/;

function parse(line: string): Ranges {
  const res = AreaRegExp.exec(line);
  if (!res) throw new Error("Bad input");

  return {
    xRange: [res?.groups?.x0, res?.groups?.x1].map((x) =>
      x ? parseInt(x, 10) : 0
    ),
    yRange: [res?.groups?.y0, res?.groups?.y1].map((x) =>
      x ? parseInt(x, 10) : 0
    ),
  };
}

function findTimesInRangeY(
  vy: number,
  yRange: number[],
  maxV: number
): number[] {
  const times = [];
  for (let t = 0; t < maxV * 3; t++) {
    const val = fy(vy, t);
    if (val >= yRange[0] && val <= yRange[1]) {
      times.push(t);
    }
  }
  return times;
}

function isViableVxAtT(vx: number, t: number, xRange: number[]) {
  const val = fx(vx, t);

  return val >= xRange[0] && val <= xRange[1];
}

function findViableVxInRangeAtT(t: number, xRange: number[]): boolean {
  const xSign = Math.abs(xRange[0]) / xRange[0];
  for (let vx = 0; vx <= xRange[1]; vx += xSign) {
    if (isViableVxAtT(vx, t, xRange)) return true;
  }
  return false;
}

function findMaxY({ xRange, yRange }: Ranges): number {
  const actualMax = Math.max(Math.abs(yRange[0]), Math.abs(yRange[1]));
  for (let vy = actualMax; vy >= 0; vy--) {
    const t = findTimesInRangeY(vy, yRange, actualMax);
    if (t.length > 0) {
      if (findViableVxInRangeAtT(t[0], xRange)) {
        return fy(vy, vy);
      }
    }
  }
  return 0;
}

function findAllViable({ xRange, yRange }: Ranges): number {
  const actualMax = Math.max(Math.abs(yRange[0]), Math.abs(yRange[1]));
  const minVY = Math.min(0, yRange[0], yRange[1]);
  const found: Record<string, boolean> = {};
  for (let vy = actualMax; vy >= minVY; vy--) {
    const ts = findTimesInRangeY(vy, yRange, actualMax);
    ts.forEach((t) => {
      const xSign = Math.abs(xRange[0]) / xRange[0];
      for (let vx = 0; vx <= xRange[1] + t; vx += xSign) {
        if (isViableVxAtT(vx, t, xRange)) {
          found[[vx, vy].join(":")] = true;
        }
      }
    });
  }
  return Object.keys(found).length;
}

function partOne(rawLines: string[]) {
  const ranges = parse(rawLines[0]);
  return findMaxY(ranges);
}
// bad: 4551
function partTwo(rawLines: string[]) {
  const ranges = parse(rawLines[0]);
  return findAllViable(ranges);
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
