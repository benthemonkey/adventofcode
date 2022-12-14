const fs = require("fs");
const inp = fs
  .readFileSync("./eight.txt", "utf8")
  .split("\n")
  .map((x) => x.split(""));

console.log(inp);

const visible = inp.length * 2 + (inp[0].length - 2) * 2;

function isLower(grid, x, y) {
  // Check if the value at the given coordinate is lower than the values
  // to the left, right, up, and down, until the edge of the grid is reached.
  let left = true;
  let right = true;
  let up = true;
  let down = true;
  for (let i = x - 1; i >= 0; i--) {
    if (grid[x][y] <= grid[i][y]) left = false; // left
  }
  for (let i = x + 1; i < grid.length; i++) {
    if (grid[x][y] <= grid[i][y]) right = false; // right
  }
  for (let j = y - 1; j >= 0; j--) {
    if (grid[x][y] <= grid[x][j]) up = false; // up
  }
  for (let j = y + 1; j < grid[0].length; j++) {
    if (grid[x][y] <= grid[x][j]) down = false; // down
  }

  return left || right || up || down;
}

function score(grid, x, y) {
  // Check if the value at the given coordinate is lower than the values
  // to the left, right, up, and down, until the edge of the grid is reached.
  let left = 0;
  let right = 0;
  let up = 0;
  let down = 0;
  for (let i = x - 1; i >= 0; i--) {
    if (grid[x][y] <= grid[i][y]) {
      up++;
      break; // up
    } else {
      up++;
    }
  }
  for (let i = x + 1; i < grid.length; i++) {
    if (grid[x][y] <= grid[i][y]) {
      down++;
      break;
    } else {
      down++; // down
    }
  }
  for (let j = y - 1; j >= 0; j--) {
    if (grid[x][y] <= grid[x][j]) {
      left++;
      break;
    } else {
      left++; // left
    }
  }
  for (let j = y + 1; j < grid[0].length; j++) {
    if (grid[x][y] <= grid[x][j]) {
      right++;
      break;
    } else {
      right++; // right
    }
  }

  return left * right * up * down;
}

// for (let i = 1; i < inp.length - 1; i++) {
// 	for (let j = 1; j < inp[0].length - 1; j++) {
// 		if (isLower(inp, i, j)) {
// 			visible++;
// 		}
// 	}
// }

let max = 0;
for (let i = 1; i < inp.length - 1; i++) {
  for (let j = 1; j < inp[0].length - 1; j++) {
    const _score = score(inp, i, j);
    if (_score > max) {
      max = _score;
    }
  }
}

console.log(max);
