import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 13;
const sample2Sol = 30;

interface Card {
  id: string;
  wins: number;
}

function parse(line: string): Card {
  const [cardId, vals] = line.split(": ");
  const [rawWinners, rawCard] = vals.split(" | ");

  const winning = rawWinners
    .split(" ")
    .filter((x) => x)
    .map((x) => parseInt(x.trim(), 10));
  const onCard = rawCard
    .split(" ")
    .filter((x) => x)
    .map((x) => parseInt(x.trim(), 10));

  return {
    id: cardId.substring(4).trim(),
    wins: onCard.filter((x) => winning.includes(x)).length,
  };
}

function partOne(rawLines: string[]) {
  const cards = rawLines.map(parse);

  return cards.reduce((acc, card) => {
    if (card.wins === 0) return acc;

    return acc + Math.pow(2, card.wins - 1);
  }, 0);
}

function partTwo(rawLines: string[]) {
  const cards = rawLines.map(parse);
  const cardHash = cards.reduce((acc, card) => {
    acc[card.id] = card.wins;
    return acc;
  }, {} as Record<string, number>);

  const cardCounts = _.mapValues(cardHash, () => 1);
  const maxKey = parseInt(_.last(cards)?.id || "0");

  for (let i = 1; i <= maxKey; i++) {
    const count = cardCounts[i];
    const wins = cardHash[i];

    for (let j = 0; j < wins; j++) {
      const nextId = i + j + 1;
      if (nextId > maxKey) break;

      cardCounts[nextId] += count;
    }
  }

  return _.sum(_.values(cardCounts));
}

(async function main() {
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
