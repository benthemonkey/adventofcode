// I couldn't get this day myself. I had to borrow @romellem's solution https://github.com/romellem/advent-of-code/pull/181/files

import fs from "fs/promises";
// import _ from "lodash";
// const sampleSol = parseInt("11111111111110", 2);
// const sample2Sol = 0;

// type State = Record<string, number>;

// function runInstruction(line: string, state: State): State {
//   const nextState = { ...state };
//   const [instr, a, b] = line.split(" ");
//   const _b = ["w", "x", "y", "z"].includes(b) ? state[b] : parseInt(b, 10);

//   switch (instr) {
//     case "inp":
//       nextState[a] = _b;
//       break;
//     case "add":
//       nextState[a] = state[a] + _b;
//       break;
//     case "mul":
//       nextState[a] = state[a] * _b;
//       break;
//     case "div":
//       nextState[a] = Math.floor(state[a] / _b);
//       break;
//     case "mod":
//       nextState[a] = state[a] % _b;
//       break;
//     case "eql":
//       nextState[a] = state[a] === _b ? 1 : 0;
//       break;
//   }

//   return nextState;
// }

// function symbolicInstruction(
//   line: string,
//   state: Record<string, string>
// ): Record<string, string> {
//   const nextState = { ...state };
//   let [instr, a, b] = line.split(" ");

//   if (["w", "x", "y", "z"].includes(b))
//     b = state[b] === "0" ? "0" : "(" + state[b] + ")";

//   switch (instr) {
//     case "inp":
//       nextState[a] =
//         a +
//         (state[a].length === 1 ? "1" : parseInt(state[a].substr(1), 10) + 1);
//       console.log(nextState[a]);
//       break;
//     case "add":
//       if (state[a] === "0") nextState[a] = b;
//       else if (b !== "0") nextState[a] += " + " + b;
//       break;
//     case "mul":
//       if (state[a] === "0" || b === "0") {
//         nextState[a] = "0";
//       } else {
//         nextState[a] += " * " + b;
//       }
//       break;
//     case "div":
//       if (state[a] !== "0" && b !== "1") nextState[a] += " / " + b;
//       break;
//     case "mod":
//       if (state[a] !== "0") nextState[a] += " % " + b;
//       break;
//     case "eql":
//       nextState[a] += " = " + b;
//       break;
//   }

//   return nextState;
// }

// function addInput(rawLines: string[], input: number): string[] {
//   const inputStrs = input.toString().split("");
//   // console.log(input, inputStrs);

//   return rawLines.map((line) => {
//     if (line.startsWith("inp")) {
//       return `${line} ${inputStrs.shift()}`;
//     }

//     return line;
//   });
// }

// function tmp(rawLines: string[]) {
//   let state: Record<string, string> = { w: "0", x: "0", y: "0", z: "0" };

//   for (let i = 0; i < rawLines.length; i++) {
//     state = symbolicInstruction(rawLines[i], state);
//     // console.log([state.w, state.x, state.y, state.z, rawLines[i]].join("\t\t"));
//   }

//   console.log(state.z);
// }

interface Constraint {
  left: number;
  right: number;
  value: number;
}

function interpretInput(rawLines: string[]): Constraint[] {
  const extracts: { trunc: boolean; xval: number; yval: number }[] = [];
  for (let i = 0; i < rawLines.length; i += 18) {
    extracts.push({
      trunc: rawLines[i + 4].endsWith("26"),
      xval: parseInt(rawLines[i + 5].split(" ")[2], 10),
      yval: parseInt(rawLines[i + 15].split(" ")[2], 10),
    });
  }

  const out: Constraint[] = [];
  const stack: { value: number; i: number }[] = [];

  for (let i = 0; i < extracts.length; i++) {
    const { trunc, xval, yval } = extracts[i];

    if (!trunc) {
      stack.push({ value: yval, i });
    } else {
      const head = stack.pop();
      // i = head.i + (head.value + value)
      head &&
        out.push({
          left: i,
          right: head.i,
          value: head.value + xval,
        });
    }
  }

  return out;
}

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const isValidDigit = (digit: number) => digit >= 1 && digit <= 9;

function getNumberFromRestraints(restraints: Constraint[], isMax = true) {
  const result = Array(14).fill(0);
  for (const restraint of restraints) {
    const right_input = (isMax ? Math.max : Math.min)(
      ...digits.filter((d) => isValidDigit(restraint.value + d))
    );
    const left_input = right_input + restraint.value;
    result[restraint.left] = left_input;
    result[restraint.right] = right_input;
  }

  return result.join("");
}

function partOne(rawLines: string[]) {
  const restraints = interpretInput(rawLines);

  return getNumberFromRestraints(restraints);
}

function partTwo(rawLines: string[]) {
  const restraints = interpretInput(rawLines);

  return getNumberFromRestraints(restraints, false);
}

(async function main() {
  const input = await fs
    .readFile(__dirname + "/input.txt", "utf8")
    .then((txt) => txt.split("\n"));

  const sol1 = await partOne(input);
  console.log("part 1 sol:", sol1);

  const sol2 = await partTwo(input);
  console.log("part 2 sol:", sol2);
})();
