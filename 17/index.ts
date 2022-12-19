import fs from "fs";
import chalk from "chalk";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8");
const sampleSol = 3068;
const sample2Sol = 1514285714288;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8");

const shapes = [
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
  ],
];

class Screen {
  maxY = 0;
  currentShape = 0;
  rockCount = 0;
  currentMove = 0;
  width: number;
  shapes: number[][][];
  moves: ("<" | ">")[];
  shapePos: number[] = [2, 3];
  occupied: Record<number, Record<number, boolean>> = {};

  constructor(width: number, _shapes: number[][][], moves: ("<" | ">")[]) {
    this.width = width;
    this.shapes = _shapes;
    this.moves = moves;
  }

  print() {
    let out = "\n\n\n|";
    const shape = this.shapeAtPos();
    for (let i = this.maxY + 5; i >= 0; i--) {
      for (let j = 0; j < this.width; j++) {
        if (this.occupied[i]?.[j]) {
          out += "@";
        } else if (shape.some(([x, y]) => x === j && y === i)) {
          out += chalk.green("#");
        } else {
          out += ".";
        }
      }
      out += "|\n|";
    }
    console.log(out);
  }

  shapeAtPos(pos: number[] = this.shapePos): number[][] {
    return this.shapes[this.currentShape].map(([x, y]) => [
      x + pos[0],
      y + pos[1],
    ]);
  }

  cementShape() {
    const shape = this.shapeAtPos();
    for (let i = 0; i < shape.length; i++) {
      const [x, y] = shape[i];
      if (!this.occupied[y]) this.occupied[y] = {};
      this.occupied[y][x] = true;

      if (y > this.maxY) {
        this.maxY = y;
      }
    }

    this.shapePos = [2, 4 + this.maxY];
    this.currentShape = (this.currentShape + 1) % this.shapes.length;
    this.rockCount++;
  }

  collides(pos: number[]): boolean {
    return this.shapeAtPos(pos).some(
      ([x, y]) => this.occupied[y]?.[x] || y < 0 || x === this.width || x < 0
    );
  }

  run(): string {
    let atRest = false;

    while (!atRest) {
      const gas = this.moves[this.currentMove];
      const shiftPos = [
        this.shapePos[0] + (gas === "<" ? -1 : 1),
        this.shapePos[1],
      ];
      if (!this.collides(shiftPos)) {
        this.shapePos = shiftPos;
      }
      this.currentMove = (this.currentMove + 1) % this.moves.length;

      const downPos = [this.shapePos[0], this.shapePos[1] - 1];
      if (this.collides(downPos)) {
        const signature = [
          this.currentShape,
          this.currentMove,
          this.shapePos[0],
          this.shapePos[1] - this.maxY,
        ].join(";");
        this.cementShape();
        atRest = true;
        return signature;
      } else {
        this.shapePos = downPos;
      }
    }
    return "";
  }
}

async function partOne(inp) {
  const moves = inp.split("");
  const screen = new Screen(7, shapes, moves);

  for (let i = 0; i < 2022; i++) {
    screen.run();
  }
  return screen.maxY + 1;
}

function partTwo(inp) {
  const moves = inp.split("");
  const screen = new Screen(7, shapes, moves);
  const rockCount = 1000000000000;
  const initialIters = 1000;
  const signatureLength = 20;
  const signature: string[] = [];
  const testSignature: string[] = [];
  let cycleStartingY = 0;

  for (let i = 0; i < rockCount; i++) {
    const thumb = screen.run();

    if (i < initialIters - signatureLength) {
      continue;
    } else if (i < initialIters) {
      signature.push(thumb);
      if (i + 1 === initialIters) cycleStartingY = screen.maxY;
      continue;
    } else {
      testSignature.push(thumb);
      if (testSignature.length <= signatureLength) continue;
    }

    testSignature.shift();
    if (signature.every((sig, ind) => sig === testSignature[ind])) {
      const cycleLength = i - initialIters + 1;
      const diffY = screen.maxY - cycleStartingY;

      const remainingIters = (rockCount - i) % cycleLength;
      const tmp = (rockCount - i - remainingIters) / cycleLength;
      const addToMaxY = tmp * diffY;

      for (let j = 0; j < remainingIters; j++) {
        screen.run();
      }

      return screen.maxY + addToMaxY;
    }
  }
  return 0;
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
    console.log("off by", sample2Sol - test2);
    process.exit(1);
  }

  const sol2 = await partTwo(inp);
  console.log("part 2 sol:", sol2);
})();
