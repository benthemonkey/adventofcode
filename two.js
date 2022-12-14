const fs = require("fs");
const lines = fs.readFileSync("two.txt", "utf8").split("\n");

// 0 rock
// 1 paper
// 2 scissors

const letterToPoint = {
  A: 0,
  B: 1,
  C: 2,
  X: 0,
  Y: 1,
  Z: 2,
};

const human = ["rock", "paper", "scissors"];

function didWin(them, me) {
  return (them + 1) % 3 === me;
}
function choicePoints(me) {
  return me + 1;
}
function outcomePoints(them, me) {
  if (them === me) {
    return 3;
  } else if (didWin(them, me)) {
    return 6;
  }
  return 0;
}

function partOne(lines) {
  let total = 0;

  lines.forEach((line) => {
    const [themStr, meStr] = line.split(" ");
    const them = letterToPoint[themStr];
    const me = letterToPoint[meStr];

    total += choicePoints(me) + outcomePoints(them, me);
  });

  console.log(total);
}

function fixOutcome(them, outcome) {
  if (outcome === "Y") {
    return them;
  } else if (outcome === "Z") {
    return (them + 1) % 3;
  }
  return (them + 2) % 3;
}

function partTwo(lines) {
  let total = 0;

  lines.forEach((line) => {
    const [themStr, meStr] = line.split(" ");
    const them = letterToPoint[themStr];
    const me = fixOutcome(them, meStr);

    total += choicePoints(me) + outcomePoints(them, me);
  });

  console.log(total);
}

partTwo(lines);
