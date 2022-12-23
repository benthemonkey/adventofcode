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

  atEdge(pos: Position): boolean {
    return (
      (pos.coord[0] === this.rows[0].length - 1 && pos.orientation === 0) ||
      (pos.coord[1] === this.rows.length - 1 && pos.orientation === 1) ||
      (pos.coord[0] === 0 && pos.orientation === 2) ||
      (pos.coord[1] === 0 && pos.orientation === 3)
    );
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
        // await this.print();
        if (!didMove) break;
      }
      this.traveler.orientation =
        (this.traveler.orientation + directions[i].dir) % 4;
      // await this.print();
    }

    console.log(this.traveler);
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
        rgb: [i * 2, startPos1.coord[0], startPos1.coord[1]],
      };
      this.warps[Cube.getWarpKey(pos2)] = {
        coord: pos1.coord,
        orientation: (pos1.orientation + 2) % 4,
        rgb: [i * 2, startPos1.coord[0], startPos1.coord[1]],
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
      console.log("Doing a round of warp adding");
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
            const nextPos1 = this.findNextPosition({
              coord,
              orientation: checkCoord[0] === 0 ? 0 : 2,
            });
            const nextPos2 = this.findNextPosition({
              coord,
              orientation: checkCoord[1] === 0 ? 1 : 3,
            });
            if (
              this.spaceAtPos(nextPos1) !== " " &&
              this.spaceAtPos(nextPos2) !== " "
            ) {
              const turnRight1 = checkCoord[0] === checkCoord[1];
              const finalCheckCoord1 = {
                coord: nextPos1.coord,
                orientation: (nextPos1.orientation + (turnRight1 ? 1 : 3)) % 4,
              };
              const finalPos1 = this.findNextPosition(finalCheckCoord1);
              const turnRight2 = !turnRight1;
              const finalCheckCoord2 = {
                coord: nextPos2.coord,
                orientation: (nextPos2.orientation + (turnRight2 ? 1 : 3)) % 4,
              };
              const finalPos2 = this.findNextPosition(finalCheckCoord2);

              if (
                !Cube.coordsMatch(finalPos2.coord, nextPos1.coord) &&
                !Cube.coordsMatch(finalPos1.coord, nextPos2.coord)
              ) {
                // we're at a corner!
                console.log(
                  "AT A CORNER",
                  coord,
                  finalCheckCoord1,
                  finalCheckCoord2
                );

                this.addWarpsForCorner(finalCheckCoord1, finalCheckCoord2);
                addedWarp = true;
                break;
              }
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
    for (let i = 0; i < this.rows.length; i++) {
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

  async printWarps() {
    const orientationToChar = [">", "V", "<", "^"];
    const warpsByCoord = Object.keys(this.warps).reduce((acc, key) => {
      const [x, y, o] = key.split(":");
      const newKey = [x, y].join(":");
      if (acc[newKey]) {
        acc[newKey].push({ o, rgb: this.warps[key].rgb });
      } else {
        acc[newKey] = [{ o, rgb: this.warps[key].rgb }];
      }
      return acc;
    }, {});
    let out = "=====\n\n";
    for (let i = 0; i < this.rows.length; i++) {
      for (let j = 0; j < this.rows[0].length; j++) {
        const warp = warpsByCoord[[j, i].join(":")];
        if (warp) {
          let tmp = orientationToChar[warp[0].o];
          if (warp.length > 1) {
            tmp += orientationToChar[warp[1].o];
          } else {
            tmp += "▮";
          }
          out += chalk
            .rgb(...warp[0].rgb)
            .bold(tmp);
        } else {
          out += this.rows[i][j] + " ";
        }
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
  console.log(
    _.orderBy(
      _.map(cube.warps, (val, key) => ({ key: _.padEnd(key, 10), val })),
      ["val.coord[0]", "val.coord[1]"],
      ["asc", "asc"]
    )
      .map(JSON.stringify)
      .join("\n")
  );
  console.log(Object.keys(cube.warps).length);
  await cube.printWarps();
  // const keys = Object.keys(cube.warps).reverse();
  // const initialTraveler = cube.traveler;
  // for (let i = 0; i < keys.length; i++) {
  //   const [x, y, o] = keys[i].split(":").map((z) => parseInt(z, 10));
  //   if (![0, 3].includes(x % cube.sideLength) || ![0, 3].includes(y % cube.sideLength)) continue;
  //   cube.traveler = { coord: [x, y], orientation: o };
  //   console.log(cube.traveler);
  //   await cube.print();
  //   cube.traveler = cube.warps[keys[i]];
  //   console.log(cube.traveler);
  //   await cube.print();
  // }
  // cube.traveler = initialTraveler;

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
