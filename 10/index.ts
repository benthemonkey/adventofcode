const fs = require("fs");
const sample = fs.readFileSync(__dirname + "/sample1.txt", "utf8").split("\n");
const sampleSol = 13140;
const sample2Sol = 0;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

type Item = {
  instruction: string;
  execDelay: number;
};

class Processor {
  queue: Item[];
  register: number;
  cycle: number;

  constructor(queue) {
    this.queue = queue;
    this.register = 1;
    this.cycle = 0;
  }

  processQueue() {
    this.cycle++;
    const item = this.queue[0];
    if (item.execDelay === 0) {
      const cmd = item.instruction.split(" ");
      switch (cmd[0]) {
        case "noop":
          break;
        case "addx":
          // console.log(cmd[1]);
          this.register += parseInt(cmd[1], 10);

          break;
        default:
          throw new Error("unknown: " + cmd.join(" "));
      }
      this.queue.shift();
    } else {
      item.execDelay--;
    }
  }
}

function convertToQueue(instruction): Item {
  let execDelay = 0;
  if (instruction.startsWith("addx")) {
    execDelay = 1;
  }

  return { instruction, execDelay };
}

function partOne(inp) {
  const p = new Processor(inp.map(convertToQueue));

  let result = 0;
  while (p.queue.length && p.cycle < 220) {
    p.processQueue();
    if ((p.cycle + 21) % 40 === 0) {
      console.log(
        "cycle",
        p.cycle + 1,
        "reg",
        p.register,
        "qlen",
        p.queue.length
      );
      result += (p.cycle + 1) * p.register;
    }
  }
  return result;
}

function partTwo(inp) {
  const p = new Processor(inp.map(convertToQueue));
  process.stdout.write("\n\n");

  while (p.queue.length && p.cycle < 240) {
    if (Math.abs(p.register - (p.cycle % 40)) <= 1) {
      process.stdout.write("#");
    } else {
      process.stdout.write(".");
    }
    if ((p.cycle + 1) % 40 === 0) {
      process.stdout.write("\n");
    }
    p.processQueue();
  }
  process.stdout.write("\n\n");
  return 0;
}

const test1 = partOne(sample);
console.log("part 1 sample", test1);
if (test1 !== sampleSol) {
  console.log("Failed the part 1 test");
  process.exit(1);
}
console.log("part 1 sol:", partOne(inp));

const test2 = partTwo(sample);
console.log("part 2 sample", test2);
if (test2 !== sample2Sol) {
  console.log("Failed the part 2 test");
  process.exit(1);
}

console.log("part 2 sol:", partTwo(inp));
