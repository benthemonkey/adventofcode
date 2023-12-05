import { readFile } from "fs/promises";
import _ from "lodash";
const sampleSol = 35;
const sample2Sol = 46;

interface Transform {
  destStart: number;
  srcStart: number;
  len: number;
}

function parsePart(line: string) {
  return line
    .split("\n")
    .slice(1)
    .map((line) => {
      const [destStart, srcStart, len] = line
        .split(" ")
        .map((x) => parseInt(x, 10));

      return {
        destStart,
        srcStart,
        len,
      };
    });
}

function parse(lines: string[]): {
  seeds: number[];
  transforms: Transform[][];
} {
  const seeds = lines[0]
    .substring(7)
    .split(" ")
    .map((x) => parseInt(x, 10));

  return { seeds, transforms: lines.slice(1).map(parsePart) };
}

function runTransform(val: number, transforms: Transform[]) {
  for (let i = 0; i < transforms.length; i++) {
    const t = transforms[i];
    if (val >= t.srcStart && val < t.srcStart + t.len) {
      return val - t.srcStart + t.destStart;
    }
  }

  return val;
}

function partOne(rawLines: string[]) {
  const foo = parse(rawLines);

  let seeds = foo.seeds;

  for (let i = 0; i < foo.transforms.length; i++) {
    seeds = seeds.map((x) => runTransform(x, foo.transforms[i]));
  }

  return Math.min(...seeds);
}

function runTransformRange(
  range: [number, number],
  transform: Transform
): { transformed?: [number, number]; leftovers: [number, number][] } {
  if (
    range[1] >= transform.srcStart &&
    range[0] < transform.srcStart + transform.len
  ) {
    const out: [number, number][] = [];

    if (range[0] < transform.srcStart) {
      out.push([range[0], transform.srcStart - 1]);
    }
    if (range[1] >= transform.srcStart + transform.len) {
      out.push([transform.srcStart + transform.len, range[1]]);
    }

    return {
      transformed: [
        Math.max(transform.srcStart, range[0]) -
          transform.srcStart +
          transform.destStart,
        Math.min(transform.srcStart + transform.len, range[1]) -
          transform.srcStart +
          transform.destStart,
      ],
      leftovers: out,
    };
  }

  return { leftovers: [range] };
}

function runTransformRanges(
  ranges: [number, number][],
  transforms: Transform[]
): [number, number][] {
  let out = ranges;

  const transformedRanges: [number, number][] = [];
  for (let i = 0; i < transforms.length; i++) {
    let nextOut: [number, number][] = [];
    for (let j = 0; j < out.length; j++) {
      const { transformed, leftovers } = runTransformRange(
        out[j],
        transforms[i]
      );

      if (transformed) transformedRanges.push(transformed);
      nextOut = nextOut.concat(leftovers);
    }
    out = nextOut;
  }

  return out.concat(transformedRanges);
}

function partTwo(rawLines: string[]) {
  const foo = parse(rawLines);

  let seeds: [number, number][] = [];

  for (let i = 0; i < foo.seeds.length / 2; i++) {
    seeds.push([foo.seeds[i * 2], foo.seeds[i * 2] + foo.seeds[i * 2 + 1] - 1]);
  }

  for (let i = 0; i < foo.transforms.length; i++) {
    seeds = runTransformRanges(seeds, foo.transforms[i]);
  }

  return _.minBy(seeds, (range) => range[0])?.[0];
}

(async function main() {
  const sample = await readFile(__dirname + "/sample.txt", "utf8").then((txt) =>
    txt.split("\n\n")
  );
  const input = await readFile(__dirname + "/input.txt", "utf8").then((txt) =>
    txt.split("\n\n")
  );

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
