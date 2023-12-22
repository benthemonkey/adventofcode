import fs from "fs/promises";
const sampleSol = 8;
const sample2Sol = 2286;

interface Game {
  red: number;
  green: number;
  blue: number;
}

interface Round {
  roundId: number;
  games: Game[];
}

const CHECKS = {
  red: 12,
  green: 13,
  blue: 14,
};

function isValidGame(round: Round): boolean {
  return ["red", "blue", "green"].every((color) =>
    round.games.every(
      (game) => game[color as keyof Game] <= CHECKS[color as keyof Game]
    )
  );
}

function parse(line: string): Round {
  const [id, games] = line.split(": ");
  const roundId = parseInt(id.split(" ")[1]);

  return {
    roundId,
    games: games.split(";").map((game) =>
      game.split(", ").reduce(
        (acc, draw) => {
          const [quantity, color] = draw.trim().split(" ");

          acc[color as keyof Game] = parseInt(quantity);

          return acc;
        },
        { red: 0, green: 0, blue: 0 }
      )
    ),
  };
}

function partOne(rawLines: string[]) {
  const rounds = rawLines.map(parse);
  return rounds.reduce((acc, round) => {
    if (isValidGame(round)) {
      return acc + round.roundId;
    } else {
      return acc;
    }
  }, 0);
}

function roundPower(round: Round): number {
  const maxes = round.games.reduce(
    (acc, game) => {
      return {
        red: Math.max(acc.red, game.red),
        green: Math.max(acc.green, game.green),
        blue: Math.max(acc.blue, game.blue),
      };
    },
    { red: 0, green: 0, blue: 0 } as Game
  );

  return maxes.red * maxes.green * maxes.blue;
}

function partTwo(rawLines: string[]) {
  const rounds = rawLines.map(parse);
  return rounds.reduce((acc, round) => {
    return acc + roundPower(round);
  }, 0);
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
