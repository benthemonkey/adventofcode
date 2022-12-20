const fs = require("fs");
const input = fs.readFileSync("./one.txt", "utf8");

function elfCals(elf) {
  return elf
    .split("\n")
    .map((x) => parseInt(x, 10))
    .reduce((acc, x) => acc + x);
}

function maxCals(input) {
  const elves = input.split("\n\n");
  let max = 0;
  for (let elf of elves) {
    const elfCal = elfCals(elf);

    if (elfCal > max) {
      max = elfCal;
    }
  }

  return max;
}

function topThreeElves(input) {
  const elves = input.split("\n\n");
  const cals = elves.map(elfCals).sort().reverse();

  return cals[0] + cals[1] + cals[2];
}

console.log(maxCals(input));
console.log(topThreeElves(input));
