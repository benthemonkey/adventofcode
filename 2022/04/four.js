const fs = require("fs");
const lines = fs.readFileSync("four.txt", "utf8").split("\n");

let count = 0;
lines.forEach((line) => {
  const [x, y] = line
    .split(",")
    .map((x) => x.split("-").map((y) => parseInt(y, 10)));

  if ((x[0] <= y[1] && x[1] >= y[0]) || (x[0] >= y[1] && x[1] <= y[0])) {
    console.log(x, y);
    count++;
  }
});

console.log(count);
