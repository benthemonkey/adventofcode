import fs from "fs";

const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n");
const sampleSol = 26;
const sample2Sol = 56000011;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

type Coord = { x: number; y: number };

function parse(line: string): { sensor: Coord; beacon: Coord } {
  const regex =
    /Sensor at x=(-?\d+), y=(-?\d+)\: closest beacon is at x=(-?\d+), y=(-?\d+)/g;
  const out = regex.exec(line);
  if (!out) throw new Error("satisfy typescript");
  return {
    sensor: { x: parseInt(out[1], 10), y: parseInt(out[2], 10) },
    beacon: { x: parseInt(out[3], 10), y: parseInt(out[4], 10) },
  };
}

function distance(one: Coord, two: Coord) {
  return Math.abs(one.x - two.x) + Math.abs(one.y - two.y);
}

function partOne(inp, y) {
  const sensors = inp.map(parse);
  const unavailable: Record<number, boolean> = {};

  for (let i = 0; i < sensors.length; i++) {
    const sensor = sensors[i];
    const dist = distance(sensor.sensor, sensor.beacon);

    for (let j = -y * 50; j < y * 50; j++) {
      if (distance(sensor.sensor, { x: j, y }) <= dist) {
        unavailable[j] = true;
      }
    }
  }

  for (let i = 0; i < sensors.length; i++) {
    if (sensors[i].beacon.y === y) {
      unavailable[sensors[i].beacon.x] = false;
    }
    if (sensors[i].sensor.y === y) {
      unavailable[sensors[i].sensor.x] = false;
    }
  }

  return Object.values(unavailable).filter(Boolean).length;
}

function* area(sensor: Coord, beacon: Coord) {
  const dist = distance(sensor, beacon) + 1;
  for (let i = 0; i <= dist; i++) {
    yield { x: sensor.x - dist + i, y: sensor.y + i };
    yield { x: sensor.x + dist - i, y: sensor.y + i };
    yield { x: sensor.x - dist + i, y: sensor.y - i };
    yield { x: sensor.x + dist - i, y: sensor.y - i };
  }
}

function partTwo(inp, maxVal) {
  const sensors = inp.map(parse);

  for (let i = 0; i < sensors.length; i++) {
    for (const { x, y } of area(sensors[i].sensor, sensors[i].beacon)) {
      if (x < 0 || x > maxVal || y < 0 || y > maxVal) {
        continue;
      }
      let success = true;
      for (let i = 0; i < sensors.length; i++) {
        const sensor = sensors[i];
        const dist = distance(sensor.sensor, sensor.beacon);
        if (distance(sensor.sensor, { x, y }) <= dist) {
          success = false;
          break;
        }
      }
      if (success) {
        return 4000000 * x + y;
      }
    }
  }
}

(async function main() {
  const test1 = await partOne(sample, 10);
  console.log("part 1 sample", test1);
  if (test1 !== sampleSol) {
    console.log("Failed the part 1 test");
    process.exit(1);
  }

  const sol1 = await partOne(inp, 2000000);
  console.log("part 1 sol:", sol1);

  const test2 = await partTwo(sample, 20);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(inp, 4000000);
  console.log("part 2 sol:", sol2);
})();
