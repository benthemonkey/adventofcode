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
type Warp = {
  warpOrientation: number;
  warpPosition: Position;
  linked?: boolean;
};
type WarpSpace = { str: Space; warps: Warp[] };
type ThreeDSpace = Space | WarpSpace;

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

function threeDRows(rows: Space[][]): ThreeDSpace[][] {
  const sideLength = rows.length / 3;
  const out = _.cloneDeep(rows) as ThreeDSpace[][];
  // handle x-axis warps
  for (let i = 0; i < sideLength; i++) {
    // top-top edge F
    out[0][i + sideLength * 2] = {
      str: rows[0][i + sideLength * 2],
      warps: [
        {
          warpOrientation: 3,
          warpPosition: {
            coord: [sideLength - i - 1, sideLength],
            orientation: 1,
          },
        },
      ],
    };

    // left-top G
    out[sideLength][sideLength + i] = {
      str: rows[sideLength][sideLength + i],
      warps: [
        {
          warpOrientation: 3,
          warpPosition: {
            coord: [sideLength * 2, i],
            orientation: 0,
          },
        },
      ],
    };
    // left-bottom C
    out[sideLength * 2 - 1][sideLength + i] = {
      str: rows[sideLength * 2 - 1][sideLength + i],
      warps: [
        {
          warpOrientation: 1,
          warpPosition: {
            coord: [sideLength * 2, sideLength * 3 - i - 1],
            orientation: 0,
          },
        },
      ],
    };

    // back-bottom D
    out[sideLength * 2 - 1][i] = {
      str: rows[sideLength * 2 - 1][i],
      warps: [
        {
          warpOrientation: 1,
          warpPosition: {
            coord: [sideLength * 3 - i - 1, sideLength * 3 - 1],
            orientation: 3,
          },
        },
      ],
    };

    // right-bottom E
    out[sideLength * 3 - 1][sideLength * 3 + i] = {
      str: rows[sideLength * 3 - 1][sideLength * 3 + i],
      warps: [
        {
          warpOrientation: 1,
          warpPosition: {
            coord: [0, sideLength * 2 - 1 - i],
            orientation: 0,
          },
        },
      ],
    };

    // top-right A
    if (i === sideLength - 1) {
      (out[sideLength - i - 1][sideLength * 3 - 1] as WarpSpace).warps.push({
        warpOrientation: 0,
        warpPosition: {
          coord: [sideLength * 4 - 1, sideLength * 2 + i],
          orientation: 2,
        },
      });
    } else {
      out[sideLength - i - 1][sideLength * 3 - 1] = {
        str: rows[sideLength - i - 1][sideLength * 3 - 1],
        warps: [
          {
            warpOrientation: 0,
            warpPosition: {
              coord: [sideLength * 4 - 1, sideLength * 2 + i],
              orientation: 2,
            },
          },
        ],
      };
    }
    // front-right B
    out[sideLength + i][sideLength * 3 - 1] = {
      str: rows[sideLength + i][sideLength * 3 - 1],
      warps: [
        {
          warpOrientation: 0,
          warpPosition: {
            coord: [sideLength * 4 - i - 1, sideLength * 2],
            orientation: 1,
          },
        },
      ],
    };
  }

  // now go through and doubly-link everything
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[0].length; j++) {
      if (typeof out[i][j] !== "string") {
        const space = out[i][j] as WarpSpace;
        space.warps.forEach(({ warpOrientation, warpPosition, linked }) => {
          if (linked) return;
          const currentVal = out[warpPosition.coord[1]][warpPosition.coord[0]];
          const warp: Warp = {
            warpOrientation: (warpPosition.orientation + 2) % 4,
            warpPosition: {
              coord: [j, i],
              orientation: (warpOrientation + 2) % 4,
            },
            linked: true,
          };

          if (typeof currentVal === "string") {
            out[warpPosition.coord[1]][warpPosition.coord[0]] = {
              str: currentVal,
              warps: [warp],
            };
          } else {
            (
              out[warpPosition.coord[1]][warpPosition.coord[0]] as WarpSpace
            ).warps.push(warp);
          }
        });
      }
    }
  }
  console.log(
    out.map((row) =>
      row
        .map((x) => {
          if (typeof x !== "string") {
            return _.padEnd(
              x.warps.reduce(
                (acc, w) => acc + w.warpOrientation.toString(),
                ""
              ),
              2
            );
          } else {
            return x + " ";
          }
        })
        .join(" ")
    ).join("\n")
  );

  return out;
}

const ORIENTATION_TO_MOVEMENT = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

function findNextPosition(position: Position, rows: ThreeDSpace[][]): Position {
  const { coord, orientation } = position;
  const movement = ORIENTATION_TO_MOVEMENT[orientation];

  if (typeof rows[coord[1]][coord[0]] !== "string") {
    const doTheWarp = (rows[coord[1]][coord[0]] as WarpSpace).warps.find(
      (warp) => warp.warpOrientation === orientation
    );
    if (doTheWarp) {
      return doTheWarp.warpPosition;
    }
  }

  return {
    coord: [
      (coord[0] + movement[0] + rows[0].length) % rows[0].length,
      (coord[1] + movement[1] + rows.length) % rows.length,
    ],
    orientation,
  };
}

function move(position: Position, rows: ThreeDSpace[][]): Position {
  let currentPosition = position;
  let keepGoing = true;

  while (keepGoing) {
    const nextPosition = findNextPosition(currentPosition, rows);
    let nextSpace = rows[nextPosition.coord[1]][nextPosition.coord[0]];
    if (typeof nextSpace !== "string") {
      nextSpace = (nextSpace as WarpSpace).str;
    }

    if (nextSpace === ".") {
      keepGoing = false;
    } else if (nextSpace === "#") {
      return position;
    }
    currentPosition = nextPosition;
  }
  return currentPosition;
}

async function print(position: Position, rows: ThreeDSpace[][]) {
  const orientationToChar = [">", "V", "<", "^"];
  let out = "=====\n\n";
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[0].length; j++) {
      if (position.coord[0] === j && position.coord[1] === i) {
        out += chalk.yellow(orientationToChar[position.orientation]);
      } else {
        if (typeof rows[i][j] === "string") {
          out += rows[i][j];
        } else {
          out += (rows[i][j] as WarpSpace).str;
        }
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

async function run(rows: ThreeDSpace[][], directions: Direction[]) {
  const sideLength = rows.length / 3;
  let position: Position = { coord: [sideLength * 2, 0], orientation: 0 };

  for (let i = 0; i < directions.length; i++) {
    for (let j = 0; j < directions[i].val; j++) {
      position = move(position, rows);
      // await print(position, rows);
    }
    position.orientation = (position.orientation + directions[i].dir) % 4;
    // await print(position, rows);
  }

  console.log(position);
  return (
    1000 * (position.coord[1] + 1) +
    4 * (position.coord[0] - sideLength + 1) +
    position.orientation
  );
}

function partOne(inp: string[]) {
  const { rows, directions } = parse(inp[0], inp[1]);

  return run(rows, directions);
}

// warning - mutates
function fixInputToMatchSample(rows: Space[][]): Space[][] {
  const sideLength = rows.length / 4;
  for (let i = 0; i < rows.length; i++) {
    rows[i].unshift(...new Array(sideLength).fill(" "));
  }
  for (let y = 0; y < sideLength; y++) {
    for (let x = 0; x < sideLength; x++) {
      // shift right face
      rows[sideLength * 3 - y - 1][sideLength * 4 - x - 1] =
        rows[y][sideLength * 3 + x];
      rows[y][sideLength * 3 + x] = " ";

      // shift left face
      rows[sideLength + x][sideLength * 2 - y - 1] =
        rows[sideLength * 2 + y][sideLength + x];
      rows[sideLength * 2 + y][sideLength + x] = " ";

      // shift back face
      rows[sideLength + x][sideLength - y - 1] =
        rows[sideLength * 3 + y][sideLength + x];
      rows[sideLength * 3 + y][sideLength + x] = " ";
    }
  }
  for (let i = 0; i < sideLength; i++) {
    rows.pop();
  }
  return rows;
}

async function partTwo(inp: string[]) {
  const { rows, directions } = parse(inp[0], inp[1]);

  // shift input to match the shape of the sample cube. sue me.
  // change this part to fit your input
  const transformed = fixInputToMatchSample(rows);
  console.log(transformed.map(row => row.join('')).join('\n'))
  const cubeRows = threeDRows(transformed);
  // console.log(cubeRows);

  return run(cubeRows, directions);
}

(async function main() {
  // const test1 = await partOne(sample);
  // console.log("part 1 sample", test1);
  // if (test1 !== sampleSol) {
  //   console.log("Failed the part 1 test");
  //   process.exit(1);
  // }

  // const sol1 = await partOne(inp);
  // console.log("part 1 sol:", sol1);

  // const test2 = await partTwo(sample);
  // console.log("part 2 sample", test2);
  // if (test2 !== sample2Sol) {
  //   console.log("Failed the part 2 test");
  //   process.exit(1);
  // }

  const sol2 = await partTwo(inp);
  console.log("part 2 sol:", sol2);
})();
