import chalk from "chalk";
import fs from "fs";
import inquirer from "inquirer";
import _ from "lodash";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n");
const sampleSol = 110;
const sample2Sol = 20;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

class Patch {
  width: number;
  height: number;
  round = 0;
  elves: Record<string, number[]> = {};
  next: Record<string, number[]> = {};
  occupancy: Record<string, number> = {};

  priorities = [3, 1, 2, 0];
  static neighbors = [
    [
      [1, -1],
      [1, 0],
      [1, 1],
    ],
    [
      [-1, 1],
      [0, 1],
      [1, 1],
    ],
    [
      [-1, -1],
      [-1, 0],
      [-1, 1],
    ],
    [
      [-1, -1],
      [0, -1],
      [1, -1],
    ],
  ];
  constructor(ground) {
    for (let i = 0; i < ground.length; i++) {
      for (let j = 0; j < ground[0].length; j++) {
        if (ground[i][j] === "#") {
          this.elves[[j, i].join(":")] = [j, i];
        }
      }
    }
    this.width = ground[0].length;
    this.height = ground.length;
  }

  static addCoords(coord1: number[], coord2: number[]): number[] {
    return [coord1[0] + coord2[0], coord1[1] + coord2[1]];
  }

  elfHasNeighbor(elf: number[]) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        if (this.elves[Patch.addCoords(elf, [j, i]).join(":")]) {
          return true;
        }
      }
    }
    return false;
  }

  getDesiredPos(elf: number[], print = false): number[] | null {
    if (!this.elfHasNeighbor(elf)) {
      if (print) console.log("elf at ", elf, " has no neighbors");
      return null;
    }
    for (let i = 0; i < this.priorities.length; i++) {
      const priority = this.priorities[i];
      if (
        Patch.neighbors[priority].every((coord) => {
          return !this.elves[Patch.addCoords(coord, elf).join(":")];
        })
      ) {
        if (print) console.log("elf at ", elf, " wants to move ", priority);
        return Patch.addCoords(elf, Patch.neighbors[priority][1]);
      }
    }
    return null;
  }

  fillOccupancy() {
    Object.keys(this.elves).forEach((elf) => {
      const nextPos = this.getDesiredPos(this.elves[elf]);
      if (nextPos !== null) {
        this.occupancy[nextPos.join(":")] =
          (this.occupancy[nextPos.join(":")] || 0) + 1;
      }
    });
  }

  fillWillMove(): boolean {
    let didMove = false;
    Object.keys(this.elves).forEach((elf) => {
      const nextPos = this.getDesiredPos(this.elves[elf]);
      if (nextPos !== null && this.occupancy[nextPos.join(":")] === 1) {
        didMove = true;
        this.next[nextPos.join(":")] = nextPos;
      } else {
        this.next[elf] = this.elves[elf];
      }
    });

    return didMove;
  }

  commit() {
    this.elves = this.next;
    this.next = {};
    this.occupancy = {};
    this.priorities.push(this.priorities.shift()!);
  }

  runRound(): boolean {
    this.fillOccupancy();
    const didMove = this.fillWillMove();
    // console.log(this.priorities);
    // console.log(this.occupancy);
    // console.log(this.next);
    this.commit();
    return didMove;
  }

  getBounds(): number[][] {
    const { minX, maxX, minY, maxY } = Object.keys(this.elves).reduce(
      (acc, elf) => {
        acc.minX = Math.min(acc.minX, this.elves[elf][0]);
        acc.maxX = Math.max(acc.maxX, this.elves[elf][0]);
        acc.minY = Math.min(acc.minY, this.elves[elf][1]);
        acc.maxY = Math.max(acc.maxY, this.elves[elf][1]);
        return acc;
      },
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );
    return [
      [minX, maxX],
      [minY, maxY],
    ];
  }

  openSpaces() {
    const [xBounds, yBounds] = this.getBounds();
    return (
      (yBounds[1] - yBounds[0] + 1) * (xBounds[1] - xBounds[0] + 1) -
      Object.keys(this.elves).length
    );
  }

  print() {
    const [xBounds, yBounds] = this.getBounds();

    let out = "======\n\n";
    for (let y = yBounds[0] - 2; y < yBounds[1] + 3; y++) {
      for (let x = xBounds[0] - 2; x < xBounds[1] + 3; x++) {
        if (this.elves[[x, y].join(":")]) {
          out += "#";
        } else {
          out += ".";
        }
      }
      out += "\n";
    }
    console.log(out);
  }
}

function partOne(inp: string[]) {
  const patch = new Patch(inp.map((x) => x.split("")));

  let iter = 0;
  let committedChange = true;

  while (iter < 10 && committedChange) {
    console.log("on iter", iter);
    committedChange = patch.runRound();
    // patch.print();

    iter++;
  }

  return patch.openSpaces();
}

function partTwo(inp: string[]) {
  const patch = new Patch(inp.map((x) => x.split("")));

  let iter = 0;
  let committedChange = true;

  while (iter < 1000 && committedChange) {
    console.log("on iter", iter);
    committedChange = patch.runRound();
    // patch.print();

    iter++;
  }

  return iter;
}

(async function main() {
  const test1 = await partOne(sample);
  console.log("part 1 sample", test1);
  if (test1 !== sampleSol) {
    console.log("Failed the part 1 test");
    process.exit(1);
  }

  const sol1 = await partOne(inp);
  console.log("part 1 sol:", sol1);

  const test2 = await partTwo(sample);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(inp);
  console.log("part 2 sol:", sol2);
})();
