import fs from "fs/promises";
const sampleSol = 590784;
const sample2Sol = 2758514936282235;

//on x=-46..4,y=-37..14,z=-41..4

const PARSE_REGEXP =
  /(?<onOff>on|off) x=(?<x0>-?\d+)\.\.(?<x1>-?\d+),y=(?<y0>-?\d+)\.\.(?<y1>-?\d+),z=(?<z0>-?\d+)\.\.(?<z1>-?\d+)/;

type Cuboid = {
  state: number;
  x: number[];
  y: number[];
  z: number[];
};

function parse(line: string): Cuboid {
  const res = PARSE_REGEXP.exec(line);

  if (!res || !res.groups) throw new Error("failed to parse " + line);

  const { onOff, x0, x1, y0, y1, z0, z1 } = res.groups!;

  return {
    state: onOff === "on" ? 1 : 0,
    x: [parseInt(x0, 10), parseInt(x1, 10)],
    y: [parseInt(y0, 10), parseInt(y1, 10)],
    z: [parseInt(z0, 10), parseInt(z1, 10)],
  };
}

// clearly we're gonna need to store this more efficiently than individual cuboids...

// cuts a subcuboid out and makes the larger cuboid into 4-6
function splitCube(cub: Cuboid, subCub: Cuboid): Cuboid[] {
  const cubes: Cuboid[] = [];

  if (cub.x[0] !== subCub.x[0]) {
    cubes.push({
      ...cub,
      x: [cub.x[0], subCub.x[0] - 1],
    });
  }
  if (cub.x[1] !== subCub.x[1]) {
    cubes.push({
      ...cub,
      x: [subCub.x[1] + 1, cub.x[1]],
    });
  }
  if (cub.y[0] !== subCub.y[0]) {
    cubes.push({
      ...cub,
      x: subCub.x,
      y: [cub.y[0], subCub.y[0] - 1],
    });
  }
  if (cub.y[1] !== subCub.y[1]) {
    cubes.push({
      ...cub,
      x: subCub.x,
      y: [subCub.y[1] + 1, cub.y[1]],
    });
  }
  if (cub.z[0] !== subCub.z[0]) {
    cubes.push({
      ...cub,
      x: subCub.x,
      y: subCub.y,
      z: [cub.z[0], subCub.z[0] - 1],
    });
  }
  if (cub.z[1] !== subCub.z[1]) {
    cubes.push({
      ...cub,
      x: subCub.x,
      y: subCub.y,
      z: [subCub.z[1] + 1, cub.z[1]],
    });
  }

  return cubes;
}

// cub1 is the new operation and should not be modified
function addCuboids(cub1: Cuboid, cub2: Cuboid): Cuboid[] {
  if (
    cub1.x[0] > cub2.x[1] ||
    cub1.x[1] < cub2.x[0] ||
    cub1.y[0] > cub2.y[1] ||
    cub1.y[1] < cub2.y[0] ||
    cub1.z[0] > cub2.z[1] ||
    cub1.z[1] < cub2.z[0]
  ) {
    return [cub2];
  }

  const intersection: Cuboid = {
    state: cub1.state,
    x: [Math.max(cub1.x[0], cub2.x[0]), Math.min(cub1.x[1], cub2.x[1])],
    y: [Math.max(cub1.y[0], cub2.y[0]), Math.min(cub1.y[1], cub2.y[1])],
    z: [Math.max(cub1.z[0], cub2.z[0]), Math.min(cub1.z[1], cub2.z[1])],
  };

  return splitCube(cub2, intersection);
}

function run(steps: Cuboid[]): Cuboid[] {
  let cubes: Cuboid[] = [];

  for (let i = 0; i < steps.length; i++) {
    const nextCubes = steps[i].state === 0 ? [] : [steps[i]];
    for (let j = 0; j < cubes.length; j++) {
      nextCubes.push(...addCuboids(steps[i], cubes[j]));
    }
    cubes = nextCubes;
  }

  return cubes;
}

function count(cuboids: Cuboid[]): number {
  return cuboids.reduce((acc, c) => {
    if (c.state === 0) return acc;

    return (
      acc +
      (c.x[1] - c.x[0] + 1) * (c.y[1] - c.y[0] + 1) * (c.z[1] - c.z[0] + 1)
    );
  }, 0);
}

function partOne(rawLines: string[]) {
  const steps = rawLines
    .map(parse)
    .filter((c) =>
      [...c.x, ...c.y, ...c.z].every((val) => val >= -50 && val <= 50)
    );

  const cuboids = run(steps);

  return count(cuboids);
}

function partTwo(rawLines: string[]) {
  const steps = rawLines.map(parse);

  const cuboids = run(steps);

  return count(cuboids);
}

(async function main() {
  const sample = await fs
    .readFile(__dirname + "/sample.txt", "utf8")
    .then((txt) => txt.split("\n"));
  const sample2 = await fs
    .readFile(__dirname + "/sample2.txt", "utf8")
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

  const test2 = await partTwo(sample2);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(input);
  console.log("part 2 sol:", sol2);
})();
