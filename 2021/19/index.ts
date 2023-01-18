import fs from "fs/promises";
import * as math from "mathjs";
import _ from "lodash";
const sampleSol = 79;
const sample2Sol = 3621;

type Sensor = {
  coord: math.Matrix;
  beacons: math.Matrix[];
  signature: Record<string, math.Matrix>;
};

// rotations
const rotX = math.matrix([
  [1, 0, 0],
  [0, 0, 1],
  [0, -1, 0],
]);
const rotY = math.matrix([
  [0, 0, 1],
  [0, 1, 0],
  [-1, 0, 0],
]);
const rotZ = math.matrix([
  [0, 1, 0],
  [-1, 0, 0],
  [0, 0, 1],
]);
const orientations: math.Matrix[] = [
  math.matrix([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]),
  rotY,
  math.multiply(rotY, rotY),
  rotZ,
  math.transpose(rotY),
  math.transpose(rotZ),
];

const allRots = orientations.reduce((acc, mat) => {
  const once = math.multiply(mat, rotX);
  const twice = math.multiply(once, rotX);
  const thrice = math.multiply(twice, rotX);
  return acc.concat(mat, once, twice, thrice);
}, [] as math.Matrix[]);

function parse(scanner: string): math.Matrix[] {
  return scanner
    .split("\n")
    .slice(1)
    .map((line) => math.matrix([line.split(",").map((x) => parseInt(x, 10))]));
}

function getRelDistSignature(
  beacons: math.Matrix[]
): Record<string, math.Matrix> {
  const out: Record<string, math.Matrix> = {};
  const sorted = _.sortBy(
    beacons,
    (m) => m.get([0, 0]) + m.get([0, 1]) + m.get([0, 2])
  );

  for (let i = 0; i < beacons.length; i++) {
    for (let j = i + 1; j < beacons.length; j++) {
      if (i === j) continue;
      out[math.subtract(sorted[i], sorted[j]).toString()] = sorted[i];
    }
  }

  return out;
}

function orient(rest: Sensor[], thisBeacons: math.Matrix[]): Sensor | null {
  for (let i = 0; i < rest.length; i++) {
    const sig = rest[i].signature;
    for (let j = 0; j < allRots.length; j++) {
      const rotated = thisBeacons.map((mat) => math.multiply(mat, allRots[j]));
      const thisSig = getRelDistSignature(rotated);

      const intersection = Object.keys(sig).filter((k) => thisSig[k]);
      if (intersection.length >= 65) {
        const a = sig[intersection[0]];
        const b = thisSig[intersection[0]];
        const c = math.add(rest[i].coord, math.subtract(a, b));
        return { beacons: rotated, coord: c, signature: thisSig };
      }
    }
  }
  return null;
}

function orientAll(sensors: math.Matrix[][]): Sensor[] {
  const completed: Sensor[] = [
    {
      beacons: sensors[0],
      coord: math.matrix([[0, 0, 0]]),
      signature: getRelDistSignature(sensors[0]),
    },
  ];
  const remaining = sensors.slice(1);
  let iter = 0;

  while (remaining.length > 0 && iter < remaining.length) {
    iter++;
    console.log("remaining: ", remaining.length);
    const foundRotation = orient(completed, remaining[0]);
    if (foundRotation === null) {
      remaining.push(remaining.shift()!);
    } else {
      completed.unshift(foundRotation);
      remaining.shift()!;
      iter = 0;
    }
  }
  if (remaining.length > 0) throw new Error("Failed to orient all");

  return completed;
}

function partOne(sensors: Sensor[]) {
  const finalSig = sensors.reduce((acc, sensor) => {
    sensor.beacons.forEach((beacon) => {
      acc[math.add(sensor.coord, beacon).toString()] = true;
    });
    return acc;
  }, {} as Record<string, boolean>);
  return Object.keys(finalSig).length;
}

function partTwo(sensors: Sensor[]) {
  let max = 0;
  for (let i = 0; i < sensors.length; i++) {
    for (let j = i + 1; j < sensors.length; j++) {
      let dist = 0;
      math.subtract(sensors[i].coord, sensors[j].coord).map((val) => {
        dist += Math.abs(val);
      });
      if (dist > max) max = dist;
    }
  }
  return max;
}

(async function main() {
  const sample = await fs
    .readFile(__dirname + "/sample.txt", "utf8")
    .then((txt) => txt.split("\n\n"));
  const input = await fs
    .readFile(__dirname + "/input.txt", "utf8")
    .then((txt) => txt.split("\n\n"));

  const sensorsSample = sample.map(parse);
  const orientedSensorsSample = orientAll(sensorsSample);

  const test1 = partOne(orientedSensorsSample);
  console.log("part 1 sample", test1);
  if (test1 !== sampleSol) {
    console.log("Failed the part 1 test");
    process.exit(1);
  }

  const sensors = input.map(parse);
  const orientedSensors = orientAll(sensors);

  const sol1 = partOne(orientedSensors);
  console.log("part 1 sol:", sol1);

  const test2 = partTwo(orientedSensorsSample);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = partTwo(orientedSensors);
  console.log("part 2 sol:", sol2);
})();
