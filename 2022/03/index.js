import fs from "fs";
const lines = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

const vals = "0abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function findLetter(input) {
  const first = input.slice(0, input.length / 2);
  const second = input.slice(input.length / 2);

  for (let i = 0; i < first.length; i++) {
    if (second.includes(first[i])) {
      return vals.indexOf(first[i]);
    }
  }
}

function findLetter3(inputs) {
  const first = inputs[0];
  const second = inputs[1];
  const third = inputs[2];

  for (let i = 0; i < first.length; i++) {
    if (second.includes(first[i]) && third.includes(first[i])) {
      return vals.indexOf(first[i]);
    }
  }
}

console.log(
  "part 1: ",
  lines.map(findLetter).reduce((a, b) => a + b)
);

const groups = [];
let temp = [];
for (let i = 0; i < lines.length; i++) {
  temp.push(lines[i]);
  if (temp.length === 3) {
    groups.push(temp);
    temp = [];
  } else if (i + 1 === lines.length) {
    console.log("wrong");
  }
}

console.log(
  "part 2: ",
  groups.map(findLetter3).reduce((a, b) => a + b)
);
