import chalk from "chalk";
import fs from "fs";
import inquirer from "inquirer";
import _ from "lodash";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n\n");
const sampleSol = 6032;
const sample2Sol = 5031;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n\n");

type Space = " " | "." | "#";
type Direction = { val: number; dir: number };
type Position = { coord: number[]; orientation: number };
type Warps = Record<string, Position>;

class Cube {
  rows: Space[][];
  traveler: Position;
  warps: Warps;
  sideLength: number;
  useWarps: boolean;

  constructor(rows: Space[][], useWarps = false) {
    this.rows = rows;
    this.useWarps = useWarps;
    this.warps = {};
    this.sideLength = rows.length % 3 === 0 ? rows.length / 3 : rows.length / 4;
    this.traveler = { coord: [rows[0].indexOf("."), 0], orientation: 0 };
    this.warpCount = 0;
  }

  static getWarpKey(pos: Position): string {
    return `${pos.coord[0]}:${pos.coord[1]}:${pos.orientation}`;
  }

  static coordsMatch(coord1: number[], coord2: number[]): boolean {
    return coord1[0] === coord2[0] && coord1[1] === coord2[1];
  }

  getWarp(pos: Position): Position | undefined {
    return this.warps[Cube.getWarpKey(pos)];
  }

  static addCoords(coord1: number[], coord2: number[]): number[] {
    return [coord1[0] + coord2[0], coord1[1] + coord2[1]];
  }

  wrapCoord(coord: number[]): number[] {
    return [
      (coord[0] + this.rows[0].length) % this.rows[0].length,
      (coord[1] + this.rows.length) % this.rows.length,
    ];
  }

  spaceAtPos(pos: Position): Space {
    // only allow out of bounds in warp mode
    if (
      this.useWarps &&
      (pos.coord[0] < 0 ||
        pos.coord[0] >= this.rows[0].length ||
        pos.coord[1] < 0 ||
        pos.coord[1] >= this.rows.length)
    ) {
      return " ";
    }

    return this.rows[pos.coord[1]][pos.coord[0]];
  }

  static ORIENTATION_TO_MOVEMENT = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];

  findNextPosition(position: Position): Position {
    const { coord, orientation } = position;
    const movement = Cube.ORIENTATION_TO_MOVEMENT[orientation];
    const warpKey = Cube.getWarpKey(position);
    let nextCoord = Cube.addCoords(coord, movement);

    if (this.useWarps) {
      if (this.warps[warpKey]) {
        return this.warps[warpKey];
      }
    } else {
      nextCoord = this.wrapCoord(nextCoord);
    }

    return {
      coord: nextCoord,
      orientation,
    };
  }

  move(): boolean {
    let currentPosition = this.traveler;
    let keepGoing = true;

    while (keepGoing) {
      const nextPosition = this.findNextPosition(currentPosition);
      const nextSpace = this.spaceAtPos(nextPosition);

      if (nextSpace === ".") {
        keepGoing = false;
      } else if (nextSpace === "#") {
        return false;
      } else if (this.useWarps) {
        console.log("Got stuck", this.traveler);
        keepGoing = false;
      }
      currentPosition = nextPosition;
    }
    this.traveler = currentPosition;
    return true;
  }

  async run(directions: Direction[]): Promise<number> {
    for (let i = 0; i < directions.length; i++) {
      for (let j = 0; j < directions[i].val; j++) {
        const didMove = this.move();
        if (!didMove) break;
      }

      this.traveler = {
        ...this.traveler,
        orientation: (this.traveler.orientation + directions[i].dir) % 4,
      };
    }

    return this.getSecret();
  }

  getIncrementCoord(pos: Position): number[] {
    if (pos.orientation === 0 || pos.orientation == 2) {
      return [0, pos.coord[1] % this.sideLength === 0 ? 1 : -1];
    } else {
      return [pos.coord[0] % this.sideLength === 0 ? 1 : -1, 0];
    }
  }

  addWarpsForCorner(startPos1: Position, startPos2: Position) {
    let pos1 = _.cloneDeep(startPos1);
    let pos2 = _.cloneDeep(startPos2);
    const increment1 = this.getIncrementCoord(startPos1);
    const increment2 = this.getIncrementCoord(startPos2);

    for (let i = 0; i < this.sideLength; i++) {
      this.warps[Cube.getWarpKey(pos1)] = {
        coord: pos2.coord,
        orientation: (pos2.orientation + 2) % 4,
      };
      this.warps[Cube.getWarpKey(pos2)] = {
        coord: pos1.coord,
        orientation: (pos1.orientation + 2) % 4,
      };
      pos1 = {
        ...pos1,
        coord: Cube.addCoords(pos1.coord, increment1),
      };
      pos2 = {
        ...pos2,
        coord: Cube.addCoords(pos2.coord, increment2),
      };
    }
  }

  traverseCorner(
    pos: Position,
    { isClockWise }: { isClockWise: boolean }
  ): {
    firstTraversal: Position;
    secondTraversal: Position;
    gapFacing: Position;
  } | null {
    const firstTraversal = this.findNextPosition(pos);
    if (this.spaceAtPos(firstTraversal) === " ") return null;
    const gapFacing = {
      coord: firstTraversal.coord,
      orientation: (firstTraversal.orientation + (isClockWise ? 1 : 3)) % 4,
    };
    const secondTraversal = this.findNextPosition(gapFacing);

    return { firstTraversal, secondTraversal, gapFacing };
  }

  addWarps() {
    const checkCoords = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ];

    const verticalChecks = this.rows.length / this.sideLength;
    const horizontalChecks = this.rows[0].length / this.sideLength;
    let addedWarp = true;

    while (addedWarp) {
      addedWarp = false;
      for (let y = 0; y < verticalChecks; y++) {
        for (let x = 0; x < horizontalChecks; x++) {
          // find instances where a point can travel in both directions, but then gets stuck
          const cornerStartCoord = [
            this.sideLength * x - 1,
            this.sideLength * y - 1,
          ];
          for (let i = 0; i < checkCoords.length; i++) {
            const checkCoord = checkCoords[i];
            const coord = this.wrapCoord(
              Cube.addCoords(cornerStartCoord, checkCoord)
            );
            if (this.spaceAtPos({ coord, orientation: 0 }) === " ") continue;

            const traversal1 = this.traverseCorner(
              {
                coord,
                orientation: checkCoord[0] === 0 ? 0 : 2,
              },
              { isClockWise: checkCoord[0] === checkCoord[1] }
            );

            const traversal2 = this.traverseCorner(
              {
                coord,
                orientation: checkCoord[1] === 0 ? 1 : 3,
              },
              { isClockWise: checkCoord[0] !== checkCoord[1] }
            );

            if (traversal1 === null || traversal2 === null) continue;

            if (
              !Cube.coordsMatch(
                traversal1.firstTraversal.coord,
                traversal2.secondTraversal.coord
              ) &&
              !Cube.coordsMatch(
                traversal2.firstTraversal.coord,
                traversal1.secondTraversal.coord
              )
            ) {
              // we're at a corner!
              this.addWarpsForCorner(
                traversal1.gapFacing,
                traversal2.gapFacing
              );
              addedWarp = true;
              break;
            }
          }
        }
      }
    }
  }

  getSecret(): number {
    return (
      1000 * (this.traveler.coord[1] + 1) +
      4 * (this.traveler.coord[0] + 1) +
      this.traveler.orientation
    );
  }

  async print() {
    const orientationToChar = [">", "V", "<", "^"];
    let out = "=====\n\n";
    const maxY = Math.min(this.rows.length, this.traveler.coord[1] + 25);
    for (let i = Math.max(0, this.traveler.coord[1] - 25); i < maxY; i++) {
      for (let j = 0; j < this.rows[0].length; j++) {
        if (this.traveler.coord[0] === j && this.traveler.coord[1] === i) {
          out += chalk.yellow(orientationToChar[this.traveler.orientation]);
        } else {
          out += this.rows[i][j];
        }
        out += " ";
      }
      out += "\n";
    }
    console.log(out);
    return await inquirer.prompt([
      { type: "confirm", name: "foo", message: "continue?" },
    ]);
  }
}

function parse(inp: string, path: string) {
  let rows = inp.split("\n").map((x) => x.split("")) as Space[][];
  const maxRow = Math.max(...rows.map((x) => x.length));
  rows = rows.map((row) => {
    if (row.length < maxRow) {
      return [...row, ...new Array(maxRow - row.length).fill(" ")] as Space[];
    } else {
      return row;
    }
  });

  const directions: Direction[] = [];
  let currentVal = "";
  for (let i = 0; i < path.length; i++) {
    const char = path[i];
    if (char === "R" || char === "L") {
      directions.push({
        val: parseInt(currentVal, 10),
        dir: char === "R" ? 1 : 3,
      });
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  if (currentVal.length) {
    directions.push({ val: parseInt(currentVal, 10), dir: 0 });
  }
  return { rows, directions };
}

async function partOne(inp: string[]) {
  const { rows, directions } = parse(inp[0], inp[1]);
  const cube = new Cube(rows);

  return await cube.run(directions);
}

async function partTwo(inp: string[]) {
  const { rows, directions } = parse(inp[0], inp[1]);

  const cube = new Cube(rows, true);
  cube.addWarps();
  return await cube.run(directions);
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
