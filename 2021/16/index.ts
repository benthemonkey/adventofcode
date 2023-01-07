import fs from "fs/promises";
import _ from "lodash";
const partOneSamples = [
  "8A004A801A8002F478",
  "620080001611562C8802118E34",
  "C0015000016115A2E0802F182340",
  "A0016C880162017C3686B18A3D4780",
];
const sampleSol = [16, 12, 23, 31];
const partTwoSamples = [
  "C200B40A82",
  "04005AC33890",
  "880086C3E88112",
  "CE00C43D881120",
  "D8005AC2A8F0",
  "F600BC2D8F",
  "9C005AC2F8F0",
  "9C0141080250320F1802104A08",
];
const sample2Sol = [3, 54, 7, 9, 1, 0, 0, 1];

function hexToBin(hex: string): string[] {
  return _.flatMap(hex.split(""), (char) =>
    _.padStart(parseInt(char, 16).toString(2), 4, "0").split("")
  );
}

type Output = {
  version: number;
  id: number;
  lengthTypeId?: string;
  value?: number;
  children?: Output[];
};

function parse(bits: string[]): Output {
  const version = parseInt(bits.splice(0, 3).join(""), 2);
  const id = parseInt(bits.splice(0, 3).join(""), 2);

  let value, lengthTypeId, children;
  if (id === 4) {
    let atEnd = false;
    const tmp = [];
    while (!atEnd) {
      atEnd = bits.splice(0, 1)[0] === "0";
      tmp.push(...bits.splice(0, 4));
    }

    value = parseInt(tmp.join(""), 2);
  } else {
    lengthTypeId = bits.splice(0, 1)[0];

    if (lengthTypeId === "0") {
      const subpacketLength = parseInt(bits.splice(0, 15).join(""), 2);

      const currentLength = bits.length;
      children = [];
      while (currentLength - bits.length < subpacketLength) {
        children.push(parse(bits));
      }
    } else {
      const subPacketCount = parseInt(bits.splice(0, 11).join(""), 2);

      children = [];
      for (let i = 0; i < subPacketCount; i++) {
        children.push(parse(bits));
      }
    }
  }

  return { version, id, value, lengthTypeId, children };
}

function sumVersions(parsed: Output): number {
  return parsed.version + _.sum(parsed.children?.map(sumVersions));
}

function calculate(parsed: Output): number {
  let operator: (arr: number[]) => number;

  switch (parsed.id) {
    case 0:
      operator = _.sum;
      break;
    case 1:
      operator = (arr) => arr.reduce((acc, item) => acc * item);
      break;
    case 2:
      operator = (arr) => Math.min(...arr);
      break;
    case 3:
      operator = (arr) => Math.max(...arr);
      break;
    case 5:
      operator = (arr) => (arr.length < 2 || arr[0] <= arr[1] ? 0 : 1);
      break;
    case 6:
      operator = (arr) => (arr.length < 2 || arr[0] >= arr[1] ? 0 : 1);
      break;
    case 7:
      operator = (arr) => (arr.length < 2 || arr[0] !== arr[1] ? 0 : 1);
      break;
    default: // 4
      if (!parsed.value)
        throw new Error("expected value: " + JSON.stringify(parsed, null, 2));
      return parsed.value;
  }

  return parsed.children ? operator(parsed.children.map(calculate)) : 0;
}

function partOne(line: string) {
  const parsed = parse(hexToBin(line));
  return sumVersions(parsed);
}

function partTwo(line: string) {
  const parsed = parse(hexToBin(line));
  return calculate(parsed);
}

(async function main() {
  const input = await fs
    .readFile(__dirname + "/input.txt", "utf8")
    .then((txt) => txt.split("\n"));

  const test1 = partOneSamples.map(partOne);
  console.log("part 1 sample", test1);
  if (!_.isEqual(test1, sampleSol)) {
    console.log("Failed the part 1 test");
    process.exit(1);
  }

  const sol1 = partOne(input[0]);
  console.log("part 1 sol:", sol1);

  const test2 = partTwoSamples.map(partTwo);
  console.log("part 2 sample", test2);
  if (!_.isEqual(test2, sample2Sol)) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = partTwo(input[0]);
  console.log("part 2 sol:", sol2);
})();
