import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 226;
const sample2Sol = 3509;

type Node = {
  big: string[];
  small: string[];
};

function parse(rawLines: string[]) {
  return rawLines.reduce((acc, line) => {
    const [start, end] = line.split("-");

    if (!acc[start]) acc[start] = { big: [], small: [] };
    if (!acc[end]) acc[end] = { big: [], small: [] };

    acc[start][end.toUpperCase() === end ? "big" : "small"].push(end);
    acc[end][start.toUpperCase() === start ? "big" : "small"].push(start);

    return acc;
  }, {} as Record<string, Node>);
}

function findAllPaths(network: Record<string, Node>, partTwo = false): number {
  const smallNodes = Object.keys(network).filter(
    (id) => id.toUpperCase() !== id && id !== "start"
  );
  const queue: {
    node: string;
    remaining: string[];
    doubleSmall?: string;
  }[] = [{ node: "start", remaining: smallNodes }];
  let paths = 0;
  while (queue.length) {
    const { node, remaining, doubleSmall } = queue.shift()!;

    if (node === "end") {
      paths++;
      continue;
    }

    // aparently there's no risk of cycling through big caves
    network[node].big.forEach((id) => {
      // if (path.filter((x) => x === id).length > 5) return;

      queue.push({ node: id, remaining, doubleSmall });
    });

    network[node].small.forEach((id) => {
      if (!remaining.includes(id)) {
        if (partTwo && !doubleSmall && id !== "start") {
          queue.push({
            node: id,
            remaining,
            doubleSmall: id,
          });
        }
        return;
      }

      queue.push({
        node: id,
        remaining: _.without(remaining, id),
        doubleSmall,
      });
    });
  }

  return paths;
}

function partOne(rawLines: string[]) {
  const network = parse(rawLines);
  return findAllPaths(network);
}

function partTwo(rawLines: string[]) {
  const network = parse(rawLines);
  return findAllPaths(network, true);
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
