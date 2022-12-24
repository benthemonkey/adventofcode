import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 4512;
const sample2Sol = 1924;

class Board {
  grid: number[];
  marked: Record<number, boolean> = {};
  rowCounts: number[] = [0, 0, 0, 0, 0];
  colCounts: number[] = [0, 0, 0, 0, 0];

  constructor(grid: number[][]) {
    this.grid = _.flatten(grid);
  }

  mark(num: number) {
    const ind = this.grid.indexOf(num);
    if (ind !== -1) {
      this.marked[num] = true;
      this.colCounts[ind % 5]++;
      this.rowCounts[Math.floor(ind / 5)]++;
    }
  }

  didWin(): boolean {
    return (
      this.colCounts.some((x) => x === 5) || this.rowCounts.some((x) => x === 5)
    );
  }

  score(called: number): number {
    return called * _.sum(this.grid.filter((x) => !this.marked[x]));
  }
}

function parseBoard(str: string): Board {
  const grid = str.split("\n").map((line) => {
    const row: number[] = [];
    for (let i = 0; i < 5; i++) {
      row.push(parseInt(line[i * 3] + line[i * 3 + 1], 10));
    }
    return row;
  });

  return new Board(grid);
}

function parse(inp: string[]): { draw: number[]; boards: Board[] } {
  const [rawDraw, ...rawBoards] = inp;
  return {
    draw: rawDraw.split(",").map((x) => parseInt(x, 10)),
    boards: rawBoards.map(parseBoard),
  };
}

function tests() {
  const grid = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25],
  ];
  const winningDraws = [
    [1, 6, 11, 16, 21],
    [5, 10, 15, 20, 25],
    [16, 17, 18, 19, 20],
  ];

  winningDraws.forEach((draws) => {
    const board = new Board(grid);
    draws.forEach(board.mark, board);

    if (!board.didWin())
      throw new Error("Failed test with draws " + draws.join());
  });
}

function partOne(rawLines: string[]) {
  const { draw, boards } = parse(rawLines);

  for (let i = 0; i < draw.length; i++) {
    const drawnNumber = draw[i];

    for (let j = 0; j < boards.length; j++) {
      boards[j].mark(drawnNumber);

      if (boards[j].didWin()) {
        return boards[j].score(drawnNumber);
      }
    }
  }

  return 0;
}

function partTwo(rawLines: string[]) {
  const { draw, boards } = parse(rawLines);

  let remainingBoards = boards;

  for (let i = 0; i < draw.length; i++) {
    const drawnNumber = draw[i];

    remainingBoards = remainingBoards.filter((board) => {
      board.mark(drawnNumber);
      return !board.didWin() || remainingBoards.length === 1;
    });

    if (remainingBoards.length === 1 && remainingBoards[0].didWin()) {
      return remainingBoards[0].score(drawnNumber);
    }
  }

  return 0;
}

(async function main() {
  const sample = await fs
    .readFile(__dirname + "/sample.txt", "utf8")
    .then((txt) => txt.split("\n\n"));
  const input = await fs
    .readFile(__dirname + "/input.txt", "utf8")
    .then((txt) => txt.split("\n\n"));

  tests();

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
