import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 739785;
const sample2Sol = 444356092776315;

class D100 {
  value = 0;

  roll() {
    this.value++;
    return ((this.value - 1) % 100) + 1;
  }
}

function parse(line: string): number {
  return parseInt(line[line.length - 1].replace("0", "10"));
}

function runGame(
  player1Start: number,
  player2Start: number
): { score1: number; score2: number; dieCount: number } {
  const die = new D100();
  let player1Pos = player1Start - 1;
  let player1Score = 0;
  let player2Pos = player2Start - 1;
  let player2Score = 0;
  let iter = 0;
  while (iter < 100000) {
    iter++;
    const move1 = die.roll() + die.roll() + die.roll();
    player1Pos = (player1Pos + move1) % 10;
    player1Score += player1Pos + 1;

    if (player1Score >= 1000) break;

    const move2 = die.roll() + die.roll() + die.roll();
    player2Pos = (player2Pos + move2) % 10;
    player2Score += player2Pos + 1;

    if (player2Score >= 1000) break;
  }

  return { score1: player1Score, score2: player2Score, dieCount: die.value };
}

function partOne(rawLines: string[]) {
  const [pos1, pos2] = rawLines.map(parse);
  const { score1, score2, dieCount } = runGame(pos1, pos2);
  return Math.min(score1, score2) * dieCount;
}

const d3Table = [0, 0, 0, 1, 3, 6, 7, 6, 3, 1];

type State = {
  players: { pos: number; score: number }[];
  universes: number;
  activePlayer: number;
};

function DFSGame(player1Start: number, player2Start: number) {
  const queue: State[] = [
    {
      players: [
        {
          pos: player1Start - 1,
          score: 0,
        },
        { pos: player2Start - 1, score: 0 },
      ],
      universes: 1,
      activePlayer: 0,
    },
  ];
  let p1Wins = 0;
  let p2Wins = 0;

  while (queue.length > 0) {
    const { players, universes, activePlayer } = queue.pop()!;

    if (players[0].score >= 21) {
      p1Wins += universes;
      continue;
    }
    if (players[1].score >= 21) {
      p2Wins += universes;
      continue;
    }

    const { pos, score } = players[activePlayer];

    _.range(3, 10).forEach((roll) => {
      const nextPos = (pos + roll) % 10;
      const nextPlayer = {
        pos: nextPos,
        score: score + nextPos + 1,
      };

      const nextPlayers =
        activePlayer === 0
          ? [nextPlayer, players[1]]
          : [players[0], nextPlayer];

      queue.push({
        players: nextPlayers,
        universes: universes * d3Table[roll],
        activePlayer: (activePlayer + 1) % 2,
      });
    });
  }

  return Math.max(p1Wins, p2Wins);
}

function partTwo(rawLines: string[]) {
  const [pos1, pos2] = rawLines.map(parse);
  return DFSGame(pos1, pos2);
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
