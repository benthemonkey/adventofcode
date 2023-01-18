import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 35;
const sample2Sol = 3351;

function parse(line: string): string[] {
  return line.replace(/\./g, "0").replace(/#/g, "1").split("\n");
}

function pad(grid: string[], val = "0"): string[] {
  const newRow = new Array(grid[0].length + 4).fill(val).join("");
  return [
    newRow,
    newRow,
    ...grid.map((x) => `${val}${val}${x}${val}${val}`),
    newRow,
    newRow,
  ];
}

function enhance(_image: string[], algo: string, index: number): string[] {
  let val = "0";
  if (algo[0] === "1" && algo[511] === "1") {
    val = "1";
  } else if (algo[0] === "1") {
    val = index % 2 === 0 ? "0" : "1";
  }
  const image = pad(_image, val);
  const out = [] as string[];
  for (let i = 0; i < image.length - 2; i++) {
    let line = "";
    for (let j = 0; j < image[0].length - 2; j++) {
      const binaryStr = _.range(i, i + 3)
        .map((_i) => image[_i].substring(j, j + 3))
        .join("");
      const binary = parseInt(binaryStr, 2);
      if (binary > 512) throw new Error("invalid pixel value: " + binary);
      line += algo[binary];
    }
    out.push(line);
  }

  return out;
}

function enhanceTimes(image: string[], algo: string, times: number) {
  let out = image;
  for (let i = 0; i < times; i++) {
    out = enhance(out, algo, i);
  }

  return out;
}

function countOnes(image: string[]): number {
  return image.reduce(
    (acc, line) => acc + line.split("").filter((x) => x === "1").length,
    0
  );
}

// function print(image: string[]) {
//   console.log(image.join("\n").replace(/0/g, ".").replace(/1/g, "#"));
// }

function partOne([rawAlgo, rawImage]: string[]) {
  const algo = parse(rawAlgo)[0];
  const image = parse(rawImage);
  return countOnes(enhanceTimes(image, algo, 2));
}

function partTwo([rawAlgo, rawImage]: string[]) {
  const algo = parse(rawAlgo)[0];
  const image = parse(rawImage);
  return countOnes(enhanceTimes(image, algo, 50));
}

(async function main() {
  const sample = await fs
    .readFile(__dirname + "/sample.txt", "utf8")
    .then((txt) => txt.split("\n\n"));
  const input = await fs
    .readFile(__dirname + "/input.txt", "utf8")
    .then((txt) => txt.split("\n\n"));

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
