import fs from "fs";
import _ from "lodash";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n");
const sampleSol = 33;
const sample2Sol = 3472;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

type State = {
  history: string[];
  ore: number;
  clay: number;
  obsidian: number;
  geodes: number;
  oreRobots: number;
  clayRobots: number;
  obsidianRobots: number;
  geodeRobots: number;
  timeLeft: number;
};
type Plan = {
  id: number;
  oreRobot: number;
  clayRobot: number;
  obsidianRobotOre: number;
  obsidianRobotClay: number;
  geodeRobotOre: number;
  geodeRobotObsidian: number;
};

function parse(inp: string): Plan {
  const regex =
    /Blueprint (\d+): Each ore robot costs (\d+) ore. Each clay robot costs (\d+) ore. Each obsidian robot costs (\d+) ore and (\d+) clay. Each geode robot costs (\d+) ore and (\d+) obsidian./;
  const out = regex.exec(inp);
  if (!out) throw new Error("make typescript happy");

  const [
    id,
    oreRobot,
    clayRobot,
    obsidianRobotOre,
    obsidianRobotClay,
    geodeRobotOre,
    geodeRobotObsidian,
  ] = out.slice(1).map((x) => parseInt(x, 10));

  return {
    id,
    oreRobot,
    clayRobot,
    obsidianRobotOre,
    obsidianRobotClay,
    geodeRobotOre,
    geodeRobotObsidian,
  };
}

function operate(state: State): State {
  return {
    ...state,
    ore: state.ore + state.oreRobots,
    clay: state.clay + state.clayRobots,
    obsidian: state.obsidian + state.obsidianRobots,
    geodes: state.geodes + state.geodeRobots,
    timeLeft: state.timeLeft - 1,
  };
}

function addHistory(state: State, action: string): State {
  return {
    ...state,
    history: [...state.history, action],
  };
}

function maxPossibleGeodes(state: State): number {
  return (
    state.geodes +
    _.sum(
      _.range(state.geodeRobots + state.timeLeft - 1, state.geodeRobots - 1, -1)
    )
  );
}

function maxGeodes(plan: Plan, time: number): number {
  let queue: State[] = [
    {
      history: [],
      ore: 0,
      clay: 0,
      obsidian: 0,
      geodes: 0,
      oreRobots: 1,
      clayRobots: 0,
      obsidianRobots: 0,
      geodeRobots: 0,
      timeLeft: time,
    },
  ];
  const mostExpensiveOre = Math.max(
    plan.oreRobot,
    plan.clayRobot,
    plan.obsidianRobotOre
  );
  let maxG = 0;

  while (queue.length > 0) {
    const s = queue.shift()!;

    if (s.timeLeft === 0) {
      if (s.geodes > maxG) {
        maxG = s.geodes;
      }
      continue;
    }

    // if we somehow made a geode robot every round and arent better than
    // maxG, stop.
    if (maxPossibleGeodes(s) < maxG) {
      continue;
    }

    const waitedLastHistory = _.last(s.history) === "wait";
    const ns = operate(s);

    // it might be best to wait
    queue.push(addHistory(ns, "wait"));
    if (
      s.ore >= plan.oreRobot &&
      s.oreRobots <= mostExpensiveOre &&
      (!waitedLastHistory || s.ore - s.oreRobots < plan.oreRobot)
    ) {
      queue.push(
        addHistory(
          {
            ...ns,
            ore: ns.ore - plan.oreRobot,
            oreRobots: ns.oreRobots + 1,
          },
          "ore"
        )
      );
    }
    if (
      s.ore >= plan.clayRobot &&
      (!waitedLastHistory || s.ore - s.oreRobots < plan.clayRobot)
    ) {
      queue.push(
        addHistory(
          {
            ...ns,
            ore: ns.ore - plan.clayRobot,
            clayRobots: ns.clayRobots + 1,
          },
          "clay"
        )
      );
    }
    if (
      s.ore >= plan.obsidianRobotOre &&
      s.clay >= plan.obsidianRobotClay &&
      (!waitedLastHistory ||
        s.ore - s.oreRobots < plan.obsidianRobotOre ||
        s.clay - s.clayRobots < plan.obsidianRobotClay)
    ) {
      queue.push(
        addHistory(
          {
            ...ns,
            ore: ns.ore - plan.obsidianRobotOre,
            clay: ns.clay - plan.obsidianRobotClay,
            obsidianRobots: ns.obsidianRobots + 1,
          },
          "obs"
        )
      );
    }
    if (
      s.ore >= plan.geodeRobotOre &&
      s.obsidian >= plan.geodeRobotObsidian &&
      (!waitedLastHistory ||
        s.ore - s.oreRobots < plan.geodeRobotOre ||
        s.obsidian - s.obsidianRobots < plan.geodeRobotObsidian)
    ) {
      queue.push(
        addHistory(
          {
            ...ns,
            ore: ns.ore - plan.geodeRobotOre,
            obsidian: ns.obsidian - plan.geodeRobotObsidian,
            geodeRobots: ns.geodeRobots + 1,
          },
          "geo"
        )
      );
    }

    queue = _.sortBy(queue, [
      "geodeRobots",
      "obsidianRobots",
      "clayRobots",
      "oreRobots",
    ]).reverse();
  }

  return maxG;
}

function partOne(inp: string[]) {
  const plans = inp.map(parse);

  let total = 0;
  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    total += plan.id * maxGeodes(plan, 24);
  }

  return total;
}

function partTwo(inp: string[]) {
  const plans = inp.map(parse);

  let total = 1;
  for (let i = 0; i < Math.min(3, plans.length); i++) {
    const plan = plans[i];
    total *= maxGeodes(plan, 32);
  }

  return total;
}

(async function main() {
  const test1 = await partOne(sample);
  console.log("part 1 sample", test1);
  if (test1 !== sampleSol) {
    console.log("Failed the part 1 test");
    process.exit(1);
  }

  const sol1 = await partOne(inp);
  console.log("part 1 sol:", sol1);

  const test2 = await partTwo(sample);
  console.log("part 2 sample", test2);
  if (test2 !== sample2Sol) {
    console.log("Failed the part 2 test");
    process.exit(1);
  }

  const sol2 = await partTwo(inp);
  console.log("part 2 sol:", sol2);
})();
