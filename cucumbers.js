const _ = require("lodash");

class SeaFloor {
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

  exec(fun) {
    for (let i = 0; i < sea.height; i++) {
      for (let j = 0; j < sea.width; j++) {
        let doExit = fun(i, j);
        if (doExit) {
          return;
        }
      }
    }
  }
}

const fs = require("fs");
const input = fs
  .readFileSync("./cucumbers.txt", "utf8")
  .split("\n")
  .map((x) => x.split(""));

const MAX_ITERS = 10000;
const sea = new SeaFloor(input);

let iter = 0;
let committedChange = true;

while (iter < MAX_ITERS && committedChange) {
  console.log("on iter", iter);
  committedChange = false;

  sea.exec((i, j) => {
    const val = sea.getAtPos(i, j);
    const nextVal = sea.getAtPos(i, j + 1);

    if (val === ">" && nextVal === ".") {
      // console.log('moved', val, nextVal)
      sea.move(i, j);
      committedChange = true;
    }
  });

  sea.commit();
  // console.log(sea.sea);

  sea.exec((i, j) => {
    const val = sea.getAtPos(i, j);
    const nextVal = sea.getAtPos(i + 1, j);

    if (val === "v" && nextVal === ".") {
      sea.move(i, j);
      committedChange = true;
    }
  });

  sea.commit();
  // console.log(sea.sea)
  iter++;
}

console.log("finished at ", iter);
