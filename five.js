const fs = require("fs");
const _ = require("lodash");
const [rawCrates, rawSteps] = fs.readFileSync("five.txt", "utf8").split("\n\n");

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

// steps2.forEach(([_count, start, end]) => {
// 	const count = parseInt(_count, 10);
// 	for (let i = 0; i < count; i++) {
// 		crates2[end].push(crates2[start].pop())
// 	}
// })

steps2.forEach(([_count, start, end]) => {
  const count = parseInt(_count, 10);
  const pile = [];
  for (let i = 0; i < count; i++) {
    pile.unshift(crates2[start].pop());
  }
  crates2[end].push(...pile);
});

console.log(Object.values(crates2).map(_.last).join(""));
