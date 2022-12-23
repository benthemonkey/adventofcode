import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 58;
const sample2Sol = 0;

class SeaFloor {
  sea: string[][];
  next: string[][];
  width: number;
  height: number;
  constructor(sea) {
    this.sea = sea;
    this.next = _.cloneDeep(sea);
    this.width = sea[0].length;
    this.height = sea.length;
  }

  commit() {
    this.sea = this.next;
    this.next = _.cloneDeep(this.next);
  }

  getAtPos(row, col) {
    return this.sea[row % this.height][col % this.width];
  }

  setAtPos(row, col, val) {
    this.next[row % this.height][col % this.width] = val;
  }

  move(row, col) {
    const val = this.getAtPos(row, col);

    switch (val) {
      case "v":
        this.setAtPos(row, col, ".");
        this.setAtPos(row + 1, col, val);
        break;
      case ">":
        this.setAtPos(row, col, ".");
        this.setAtPos(row, col + 1, val);
        break;
      default:
        console.log("error, tried to move bad cell");
        process.exit(1);
    }
  }

  runDir(dir: "v" | ">"): boolean {
    let committedChange = false;

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const val = this.getAtPos(i, j);
        const nextVal = this.getAtPos(
          i + (dir === "v" ? 1 : 0),
          j + (dir === ">" ? 1 : 0)
        );

        if (val === dir && nextVal === ".") {
          this.move(i, j);
          committedChange = true;
        }
      }
    }

    this.commit();

    return committedChange;
  }

  run(): boolean {
    const rightMoved = this.runDir(">");
    const downMovevd = this.runDir("v");
    return rightMoved || downMovevd;
  }
}

function partOne(rawLines: string[]) {
  const input = rawLines.map((x) => x.split(""));

  const MAX_ITERS = 10000;
  const sea = new SeaFloor(input);

  let iter = 0;
  let committedChange = true;

  while (iter < MAX_ITERS && committedChange) {
    committedChange = sea.run();
    iter++;
  }

  return iter;
}

function partTwo(rawLines: string[]) {
  return 0;
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
