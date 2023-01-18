import fs from "fs/promises";
import { MinHeap } from "abstract-astar";
// const sampleSol = 12521;
// const sample2Sol = 44169;

const ENERGY_COST: Record<string, number> = {
  A: 1,
  B: 10,
  C: 100,
  D: 1000,
};

interface State {
  rooms: string[][];
  hallway: string[];
  lockedRooms: number[];
  steps: string[];
  energy: number;
}
interface StateWithMinEnergy extends State {
  minEnergy: number;
}
// #01#2#3#4#56#
// #...........#
// ###B#C#B#D###
//   #A#D#C#A#
//   #########

// #01#2#3#4#56#
// #.....B.D...#
// ###B#C#.#.###
//   #A#D#C#A#
//   #########

const travel = [
  { distance: [2, 4, 6, 8], open: [[1], [1, 2], [1, 2, 3], [1, 2, 3, 4]] },
  { distance: [1, 3, 5, 7], open: [[], [2], [2, 3], [2, 3, 4]] },
  { distance: [1, 1, 3, 5], open: [[], [], [3], [3, 4]] },
  { distance: [3, 1, 1, 3], open: [[2], [], [], [4]] },
  { distance: [5, 3, 1, 1], open: [[2, 3], [3], [], []] },
  { distance: [7, 5, 3, 1], open: [[2, 3, 4], [3, 4], [4], []] },
  { distance: [8, 6, 4, 2], open: [[2, 3, 4, 5], [3, 4, 5], [4, 5], [5]] },
];

function arraySet<T>(arr: T[], index: number, val: T): T[] {
  const newArr = arr.slice();
  newArr[index] = val;

  return newArr;
}

function desiredRoom(val: string): number {
  const r = "ABCD".indexOf(val);
  if (r === -1)
    throw new Error("Tried to find desired room for invalid val: " + val);
  return r;
}

function* addNextStates(state: State, roomSize: number): Generator<State> {
  const { rooms, hallway, lockedRooms, energy, steps } = state;

  if (lockedRooms.every((x) => x === roomSize)) return;

  for (let hIndex = 0; hIndex < hallway.length; hIndex++) {
    const val = hallway[hIndex];
    if (val === "") continue;
    const { open } = travel[hIndex];

    const r = desiredRoom(val);
    if (
      rooms[r].length === roomSize ||
      rooms[r].some((x) => x !== val) ||
      open[r].some((o) => hallway[o] !== "")
    )
      continue;
    const nextEnergy =
      energy +
      ENERGY_COST[val] * distanceHallwayToRoom(state, hIndex, r, roomSize);
    const nextLockedRooms = arraySet(lockedRooms, r, rooms[r].length + 1);
    yield {
      hallway: arraySet(hallway, hIndex, ""),
      rooms: arraySet(rooms, r, rooms[r].concat(val)),
      lockedRooms: nextLockedRooms,
      energy: nextEnergy,
      steps: steps.concat(
        `${val} in hl ${hIndex} to rm ${r}, E: ${nextEnergy}, ${nextLockedRooms.join()}`
      ),
    };
  }

  for (let r = 0; r < rooms.length; r++) {
    const room = rooms[r];
    if (lockedRooms[r] === room.length || room.length === 0) continue;

    for (let hIndex = 0; hIndex < travel.length; hIndex++) {
      const { open } = travel[hIndex];
      if (hallway[hIndex] !== "" || open[r].some((o) => hallway[o] !== ""))
        continue;

      const nextRoom = room.slice();
      const val = nextRoom.pop()!;
      const nextEnergy =
        energy +
        ENERGY_COST[val] * distanceRoomToHallway(state, r, hIndex, roomSize);
      yield {
        hallway: arraySet(hallway, hIndex, val),
        rooms: arraySet(rooms, r, nextRoom),
        lockedRooms,
        energy: nextEnergy,
        steps: steps.concat(
          `${val} in rm ${r} to hl ${hIndex}, E: ${nextEnergy}, ${lockedRooms.join()}`
        ),
      };
    }
  }
}

function distanceHallwayToRoom(
  state: State,
  h: number,
  r: number,
  roomSize: number
): number {
  return travel[h].distance[r] + roomSize - state.rooms[r].length;
}

function distanceRoomToHallway(
  state: State,
  r: number,
  h: number,
  roomSize: number
): number {
  return travel[h].distance[r] + roomSize - state.rooms[r].length + 1;
}

function theoreticalEnergy(state: State, roomSize: number): number {
  // pretend rooms always have their top spot open
  const fakeState = {
    ...state,
    rooms: new Array(4).fill("").map(() => new Array(roomSize - 1).fill("")),
  };
  let estimatedEnergy = state.energy;

  state.hallway.forEach((val, h) => {
    if (val !== "") {
      estimatedEnergy +=
        ENERGY_COST[val] *
        distanceHallwayToRoom(fakeState, h, desiredRoom(val), roomSize);
    }
  });
  state.rooms.forEach((room, r) => {
    room.forEach((val, ind) => {
      const desiredR = desiredRoom(val);
      if (desiredR === r) return;

      const h = r + 1 + (desiredR > r ? 1 : 0);
      // account for being lower in the room
      const extraDist = room.length - 1 - ind;
      const dist =
        distanceRoomToHallway(state, r, h, roomSize) +
        distanceHallwayToRoom(fakeState, h, desiredR, roomSize) +
        extraDist;

      estimatedEnergy += ENERGY_COST[val] * dist;
    });
  });

  return estimatedEnergy;
}

function findMinEnergy(startingRooms: string[][]): number {
  const queue = new MinHeap<StateWithMinEnergy>((item) => item.minEnergy);
  const roomSize = startingRooms[0].length;
  const initialState: State = {
    rooms: startingRooms,
    hallway: ["", "", "", "", "", "", ""],
    lockedRooms: [0, 0, 0, 0],
    energy: 0,
    steps: [],
  };

  queue.insert({
    ...initialState,
    minEnergy: theoreticalEnergy(initialState, roomSize),
  });

  let minEnergy = Infinity;
  let minSteps: string[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const state = queue.removeMinimum();

    if (!state) break;

    if (
      state.rooms.every(
        (room) => room.length === roomSize && room[0] === room[1]
      )
    ) {
      if (state.energy < minEnergy) {
        minEnergy = state.energy;
        minSteps = state.steps;
        // console.log("found new minEnergy", minEnergy);
      }
      continue;
    }
    if (state.energy > minEnergy) continue;

    for (const nextState of addNextStates(state, roomSize)) {
      queue.insert({
        ...nextState,
        minEnergy: theoreticalEnergy(nextState, roomSize),
      });
    }

    // if (iter % 100000 === 0) {
    //   console.log(queue._heapArray.length, minEnergy, skipped);
    // }
  }

  console.log(
    "final minsteps\n\n",
    minSteps.map((x, i) => `${i}: ${x}`).join("\n")
  );
  return minEnergy;
}

function parse(rawInput: string): string[][] {
  const lines = rawInput.split("\n");

  const out: string[][] = [[], [], [], []];
  for (let i = 2; i < 6; i++) {
    if (!lines[i + 1]) continue;
    [3, 5, 7, 9].forEach((x, y) => out[y].unshift(lines[i][x]));
  }
  return out;
}

function partOne(rawInput: string) {
  const rooms = parse(rawInput);
  return findMinEnergy(rooms);
}

function partTwo(rawInput: string) {
  const updatedInput = rawInput.split("\n");
  updatedInput.splice(3, 0, "  #D#C#B#A#", "  #D#B#A#C#");
  const rooms = parse(updatedInput.join("\n"));
  return findMinEnergy(rooms);
}

function tests(rawInput: string) {
  const rooms = parse(rawInput);

  const testEnergy = theoreticalEnergy(
    {
      rooms,
      hallway: ["", "", "", "", "", "", ""],
      energy: 0,
      lockedRooms: [],
      steps: [],
    },
    2
  );

  if (testEnergy !== 7489) throw new Error("failed test " + testEnergy);
}

(async function main() {
  const sample = await fs.readFile(__dirname + "/sample.txt", "utf8");
  const input = await fs.readFile(__dirname + "/input.txt", "utf8");

  tests(sample);

  console.log(
    "the samples run so much slower than the actual inputs, they are skipped."
  );

  // const test1 = await partOne(sample);
  // console.log("part 1 sample", test1);
  // if (test1 !== sampleSol) {
  //   console.log("Failed the part 1 test");
  //   process.exit(1);
  // }

  const sol1 = await partOne(input);
  console.log("part 1 sol:", sol1);

  // const test2 = await partTwo(sample);
  // console.log("part 2 sample", test2);
  // if (test2 !== sample2Sol) {
  //   console.log("Failed the part 2 test");
  //   process.exit(1);
  // }

  const sol2 = await partTwo(input);
  console.log("part 2 sol:", sol2);
})();
