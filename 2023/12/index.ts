import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 21;
const sample2Sol = 525152;

interface Field {
  field: string;
  groups: number[];
}

function parse(line: string): Field {
  const [field, groups] = line.split(" ");

  return {
    field,
    groups: groups.split(",").map((x) => parseInt(x, 10)),
  };
}

const fillField = _.memoize(
  (groupLength: number, fieldLength: number, startInd: number): string => {
    let out = "";

    for (let i = 0; i < startInd; i++) {
      out += ".";
    }
    for (let i = 0; i < groupLength; i++) {
      out += "#";
    }
    for (let i = out.length; i < fieldLength; i++) {
      out += ".";
    }
    return out;
  },
  (a, b, c) => [a, b, c].join(",")
);

function layoutHelper(groups: number[], fieldLength: number): string[] {
  if (groups.length === 1) {
    return new Array(fieldLength - groups[0] + 1)
      .fill("")
      .map((__, ind) => fillField(groups[0], fieldLength, ind));
  } else {
    // fill out "last" position from end to know how many options there are
    const lastPositionOfFirstGroup =
      fieldLength - _.sum(groups) - (groups.length - 1);

    const [group, ...restGroups] = groups;

    const out: string[] = [];
    for (let i = 0; i <= lastPositionOfFirstGroup; i++) {
      const fieldPart = fillField(group, i + group + 1, i);

      layoutHelper(restGroups, fieldLength - fieldPart.length).forEach(
        (childPart) => {
          out.push(fieldPart + childPart);
        }
      );
    }

    return out;
  }
}

function allPossibleLayouts(field: Field): string[] {
  const fieldLength = field.field.length;

  return layoutHelper(field.groups, fieldLength);
}

const isValidLayout = _.memoize(
  (field: string, layout: string): boolean => {
    for (let i = 0; i < layout.length; i++) {
      if (field[i] !== "?" && field[i] !== layout[i]) return false;
    }
    return true;
  },
  (a, b) => a + ":" + b
);

function combinationCount(field: Field): number {
  return allPossibleLayouts(field).filter((layout) =>
    isValidLayout(field.field, layout)
  ).length;
}

function partOne(rawLines: string[]) {
  const fields = rawLines.map(parse);

  return _.sum(fields.map(combinationCount));
}

function validLayoutsRecursive({ field, groups }: Field): number {
  if (groups.length === 1) {
    let out = 0;

    for (let i = 0; i < field.length - groups[0] + 1; i++) {
      if (isValidLayout(field, fillField(groups[0], field.length, i))) out++;
    }

    return out;
  } else {
    // fill out "last" position from end to know how many options there are
    const lastPositionOfFirstGroup =
      field.length - _.sum(groups) - (groups.length - 1);

    const [group, ...restGroups] = groups;

    let out = 0;
    for (let i = 0; i <= lastPositionOfFirstGroup; i++) {
      const fieldPart = fillField(group, i + group + 1, i);

      if (!isValidLayout(field, fieldPart)) {
        continue;
      }
      out += validLayoutsRecursive({
        groups: restGroups,
        field: field.substring(fieldPart.length),
      });
    }

    return out;
  }
}

// this doesn't finish executing... I needed to use someone elses solution :(
function partTwo(rawLines: string[]) {
  const fields = rawLines.map(parse).map(({ field, groups }) => ({
    field: [field, field, field, field, field].join("?"),
    groups: [...groups, ...groups, ...groups, ...groups, ...groups],
  }));

  let out = 0;

  for (let i = 0; i < fields.length; i++) {
    console.log(i, "/", fields.length);
    out += validLayoutsRecursive(fields[i]);
  }

  return out;
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
