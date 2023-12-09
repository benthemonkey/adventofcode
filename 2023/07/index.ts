/* eslint-disable no-unused-vars */
import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 6440;
const sample2Sol = 5905;

const HAND_LEVEL = [
  "high card",
  "one pair",
  "two pair",
  "three of a kind",
  "full house",
  "four of a kind",
  "five of a kind",
];

interface Hand {
  cards: number[];
  bid: number;
}

function getHandStrength(cards: number[]) {
  const sums = _.map(_.groupBy(cards), (x) => x.length).sort();

  if (sums.length === 1) {
    return HAND_LEVEL.indexOf("five of a kind");
  } else if (sums[1] === 4) {
    return HAND_LEVEL.indexOf("four of a kind");
  } else if (_.isEqual([2, 3], sums)) {
    return HAND_LEVEL.indexOf("full house");
  } else if (sums.length === 3 && sums[2] === 3) {
    return HAND_LEVEL.indexOf("three of a kind");
  } else if (sums.length === 3 && sums[2] === 2) {
    return HAND_LEVEL.indexOf("two pair");
  } else if (sums.length === 4) {
    return HAND_LEVEL.indexOf("one pair");
  }

  return HAND_LEVEL.indexOf("high card");
}

const CARD_CONVERT: Record<string, number> = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
};

function hasHigherCard(a: number[], b: number[]) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[i]) {
      return true;
    } else if (a[i] < b[i]) {
      return false;
    }
  }

  throw new Error("identical hands");
}

const comparator =
  (_getHandStrength: (val: number[]) => number) =>
  (a: Hand, b: Hand): -1 | 0 | 1 => {
    const strengthA = _getHandStrength(a.cards);
    const strengthB = _getHandStrength(b.cards);

    if (strengthA !== strengthB) {
      return strengthA > strengthB ? 1 : -1;
    } else {
      return hasHigherCard(a.cards, b.cards) ? 1 : -1;
    }
  };

function parse(line: string): Hand {
  const [cards, bid] = line.split(" ");

  return {
    cards: cards.split("").map((x) => CARD_CONVERT[x] || parseInt(x, 10)),
    bid: parseInt(bid, 10),
  };
}

function partOne(rawLines: string[]) {
  const sortedHands = rawLines.map(parse).sort(comparator(getHandStrength));

  return sortedHands.reduce((acc, hand, index) => {
    return acc + hand.bid * (index + 1);
  }, 0);
}

/**
 * MUTATING CONSTANT FOR PART 2
 */
CARD_CONVERT.J = 1;

function getHandStrengthPart2(cards: number[]) {
  const jokerCount = cards.filter((x) => x === 1).length;
  const otherCards = cards.filter((x) => x !== 1);

  const sums = _.map(_.groupBy(otherCards), (x) => x.length).sort();

  if (sums.length === 1 || jokerCount === 5) {
    return HAND_LEVEL.indexOf("five of a kind");
  } else if (sums.length === 2 && sums[1] + jokerCount === 4) {
    return HAND_LEVEL.indexOf("four of a kind");
  } else if (sums.length === 2) {
    return HAND_LEVEL.indexOf("full house");
  } else if (sums.length === 3 && sums[2] + jokerCount === 3) {
    return HAND_LEVEL.indexOf("three of a kind");
  } else if (sums.length === 3 && sums[2] + jokerCount === 2) {
    return HAND_LEVEL.indexOf("two pair");
  } else if (sums.length === 4 || jokerCount === 1) {
    return HAND_LEVEL.indexOf("one pair");
  }

  return HAND_LEVEL.indexOf("high card");
}

function partTwo(rawLines: string[]) {
  const sortedHands = rawLines
    .map(parse)
    .sort(comparator(getHandStrengthPart2));

  return sortedHands.reduce((acc, hand, index) => {
    return acc + hand.bid * (index + 1);
  }, 0);
}

function tests() {
  const allTrue = [
    getHandStrength([1, 1, 1, 1, 1]) === 6,
    getHandStrength([1, 1, 1, 1, 2]) === 5,
    getHandStrength([1, 1, 1, 2, 2]) === 4,
    getHandStrength([1, 1, 1, 3, 2]) === 3,
    getHandStrength([1, 1, 2, 3, 2]) === 2,
    getHandStrength([1, 2, 3, 4, 4]) === 1,
    getHandStrength([1, 2, 3, 4, 5]) === 0,
    getHandStrengthPart2([1, 1, 1, 1, 1]) === 6,
    getHandStrengthPart2([1, 2, 1, 1, 1]) === 6,
    getHandStrengthPart2([1, 2, 3, 1, 1]) === 5,
    getHandStrengthPart2([13, 10, 1, 1, 10]) === 5,
  ];

  if (!allTrue.every(Boolean)) {
    throw new Error("failed" + JSON.stringify(allTrue));
  }
}

(async function main() {
  tests();

  const sample = await fs
    .readFile(__dirname + "/sample.txt", "utf8")
    .then((txt) => txt.split("\n"));
  const input = await fs
    .readFile(__dirname + "/input.txt", "utf8")
    .then((txt) => txt.split("\n"));

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
