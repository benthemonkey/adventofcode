import fs from "fs/promises";
const sampleSol = 2;
const sample2Sol = 4;

const REQUIRED_FIELDS = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"];

function parse(line: string): Record<string, string> {
  return line.split(/[ \n]/).reduce((acc, x) => {
    const [key, val] = x.split(":");
    acc[key] = val;
    return acc;
  }, {} as Record<string, string>);
}

function partOne(rawLines: string[]) {
  const creds = rawLines.map(parse);
  return creds.filter((cred) => REQUIRED_FIELDS.every((field) => cred[field]))
    .length;
}

const makeNumberValidator = (min: number, max: number) => (x: string) => {
  const val = parseInt(x, 10);
  return Boolean(val) && min <= val && val <= max;
};

const HEX_REGEX = /^#[0-9a-f]{6}$/;
const ID_REGEX = /^[0-9]{9}$/;
const FIELD_VALIDATION = {
  byr: makeNumberValidator(1920, 2002),
  iyr: makeNumberValidator(2010, 2020),
  eyr: makeNumberValidator(2020, 2030),
  hgt(x: string) {
    const strVal = x.substring(0, x.length - 2);
    if (x.endsWith("cm")) {
      return makeNumberValidator(150, 193)(strVal);
    } else {
      return makeNumberValidator(59, 76)(strVal);
    }
  },
  hcl(x: string) {
    return HEX_REGEX.test(x);
  },
  ecl(x: string) {
    return ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"].includes(x);
  },
  pid(x: string) {
    return ID_REGEX.test(x);
  },
};

function partTwo(rawLines: string[]) {
  const creds = rawLines.map(parse);
  return creds.filter((cred) =>
    REQUIRED_FIELDS.every(
      (field) => cred[field] && FIELD_VALIDATION[field](cred[field])
    )
  ).length;
}

(async function main() {
  const sample = await fs
    .readFile(__dirname + "/sample.txt", "utf8")
    .then((txt) => txt.split("\n\n"));
  const sample2 = await fs
    .readFile(__dirname + "/sample2.txt", "utf8")
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

  const test2 = await partTwo(sample2);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(input);
  console.log("part 2 sol:", sol2);
})();
