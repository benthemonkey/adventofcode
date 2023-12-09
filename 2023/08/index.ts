import fs from "fs/promises";
import { lcm } from "mathjs";
const sampleSol = 6;
const sample2Sol = 6;

interface Node {
  left: string;
  right: string;
}
type Network = Record<string, Node>;

function parse(lines: string): { network: Network; route: string[] } {
  const [rawRoute, rawNetwork] = lines.split("\n\n");

  return {
    route: rawRoute.split(""),
    network: rawNetwork.split("\n").reduce((acc, line) => {
      acc[line.substring(0, 3)] = {
        left: line.substring(7, 10),
        right: line.substring(12, 15),
      };

      return acc;
    }, {} as Network),
  };
}

function getPathLength(
  network: Network,
  route: string[],
  startingPosition: string
) {
  let position = startingPosition;
  let i = 0;

  while (!position.endsWith("Z")) {
    position =
      network[position][route[i % route.length] === "R" ? "right" : "left"];
    i++;
  }
  return i;
}

function partOne(rawLines: string) {
  const { network, route } = parse(rawLines);

  return getPathLength(network, route, "AAA");
}

function partTwo(rawLines: string) {
  const { network, route } = parse(rawLines);

  const isStart = (str: string) => str.endsWith("A");

  const positions = Object.keys(network).filter(isStart);

  const lengths = positions.map((x) => getPathLength(network, route, x));
  if (lengths.length == 1) return lengths[0];

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return lcm(...lengths);
}

(async function main() {
  const sample = await fs.readFile(__dirname + "/sample.txt", "utf8");
  const input = await fs.readFile(__dirname + "/input.txt", "utf8");

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
