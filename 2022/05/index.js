import fs from "fs";
import _ from "lodash";
const [rawCrates, rawSteps] = fs
  .readFileSync(__dirname + "/input.txt", "utf8")
  .split("\n\n");

const crates = rawCrates.split("\n");
const lastCrates = _.last(crates);
const ids = lastCrates.split(" ").filter(Boolean);
const lastIndexes = ids.map((id) => lastCrates.indexOf(id));
const crates2 = ids.reduce((acc, id) => {
  acc[id] = [];
  return acc;
}, {});

for (let i = crates.length - 2; i >= 0; i--) {
  for (let j = 0; j < ids.length; j++) {
    const id = ids[j];
    const test = crates[i][lastIndexes[j]];
    if (test && test !== " ") {
      crates2[id].push(test);
    }
  }
}

const steps2 = rawSteps.split("\n").map((x) => {
  const regex = /move (\d+) from (\d+) to (\d+)/g;

  return regex.exec(x).slice(1);
});

const cratesPartOne = _.cloneDeep(crates2);
steps2.forEach(([_count, start, end]) => {
  const count = parseInt(_count, 10);
  for (let i = 0; i < count; i++) {
    cratesPartOne[end].push(cratesPartOne[start].pop());
  }
});
console.log("part 1: ", Object.values(cratesPartOne).map(_.last).join(""));

steps2.forEach(([_count, start, end]) => {
  const count = parseInt(_count, 10);
  const pile = [];
  for (let i = 0; i < count; i++) {
    pile.unshift(crates2[start].pop());
  }
  crates2[end].push(...pile);
});

console.log("part 2: ", Object.values(crates2).map(_.last).join(""));
