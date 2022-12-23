import fs from "fs";
const lines = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

let count1 = 0;
let count2 = 0;
lines.forEach((line) => {
  const [x, y] = line
    .split(",")
    .map((x) => x.split("-").map((y) => parseInt(y, 10)));

  if ((x[0] <= y[0] && x[1] >= y[1]) || (x[0] >= y[0] && x[1] <= y[1])) {
    count1++;
  }
  if ((x[0] <= y[1] && x[1] >= y[0]) || (x[0] >= y[1] && x[1] <= y[0])) {
    count2++;
  }
});

console.log("part 1: ", count1);
console.log("part 2: ", count2);
