import _ from "lodash";
export function traverseGrid(
  grid: number[][],
  func: (val: number, coord: number[]) => void
): void {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const val = grid[i][j];
      func(val, [j, i]);
    }
  }
}

const NeighborsWithDiagonals = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

const NeighborsDirect = [
  [0, -1],
  [-1, 0],
  [1, 0],
  [0, 1],
];

export function isValidCoord<T>(grid: T[][], coord: number[]) {
  return (
    coord[0] >= 0 &&
    coord[0] < grid[0].length &&
    coord[1] >= 0 &&
    coord[1] < grid.length
  );
}

export function validNeighbors<T>(
  grid: T[][],
  coord: number[],
  opt: { includeDiagonals?: boolean } = {}
): number[][] {
  return (opt.includeDiagonals ? NeighborsWithDiagonals : NeighborsDirect)
    .map(([dx, dy]) => [coord[0] + dx, coord[1] + dy])
    .filter((c) => isValidCoord(grid, c));
}

type BFSQueue<T> = {
  val: T;
  coord: number[];
  score: number;
  path: string[];
}[];

interface BFSOptions<T> {
  startCoord?: number[];
  sortQueue?: <U>(q: BFSQueue<U>) => BFSQueue<U>;
  sortAfterIters?: number;
  shouldSkip?: (
    bestScore: number,
    thisScore: number,
    coord: number[]
  ) => boolean;
  filterNeighbors?: (
    neighborCoords: number[][],
    thisVal: T,
    coord: number[]
  ) => number[][];
  isNewScoreBetter?: (oldScore: number, newScore: number) => boolean;
}

const defaultOptions: Required<BFSOptions<unknown>> = {
  startCoord: [0, 0],
  sortQueue: (q) => _.sortBy(q, "score"),
  sortAfterIters: 1,
  shouldSkip: () => false,
  filterNeighbors: (n) => n,
  isNewScoreBetter: (a, b) => a > b,
};

export function gridBFS<T = number>(
  grid: T[][],
  getScore: (
    oldScore: number | undefined,
    thisVal: T,
    coord: number[]
  ) => number,
  isDone: (thisVal: T, coord: number[]) => boolean,
  options: BFSOptions<T> = {}
): number | null {
  const optsWithDefaults = { ...defaultOptions, ...options };
  const {
    startCoord,
    sortQueue,
    sortAfterIters,
    shouldSkip,
    filterNeighbors,
    isNewScoreBetter,
  } = optsWithDefaults;
  const shortest: Record<string, number> = { [startCoord.join(":")]: 0 };
  let endCoord = undefined;
  let queue: BFSQueue<T> = [
    {
      val: grid[startCoord[1]][startCoord[0]],
      coord: startCoord,
      score: 0,
      path: [startCoord.join(":")],
    },
  ];
  let iter = 0;
  let skipped = 0;

  while (queue.length) {
    iter++;
    const { val, coord, score, path } = queue.shift()!;
    const key = coord.join(":");

    if (shortest[key] && !isNewScoreBetter(shortest[key], score)) {
      skipped++;
      continue;
    }
    shortest[key] = score;

    if (isDone(val, coord)) {
      endCoord = coord;
      continue;
    }

    if (endCoord && shouldSkip(shortest[endCoord.join(":")], score, coord)) {
      // skipped++;
      continue;
    }

    const neighborCoords = filterNeighbors(
      validNeighbors(grid, coord),
      val,
      coord
    );

    neighborCoords.forEach((neighborCoord) => {
      const valAtCoord = grid[neighborCoord[1]][neighborCoord[0]];
      queue.push({
        val: valAtCoord,
        coord: neighborCoord,
        score: getScore(score, valAtCoord, neighborCoord),
        path: [...path, neighborCoord.join(":")],
      });
    });

    // console.log(
    //   iter,
    //   queue.length,
    //   skipped,
    //   endCoord && shortest[endCoord.join(":")]
    // );
    if (iter % 100000 === 0) console.log(queue.length, skipped);
    // if (iter % 10000 === 0) {
    if (iter % sortAfterIters === 0) {
      queue = sortQueue(queue);
    }
    // }
  }

  if (!endCoord) return null;

  return shortest[endCoord.join(":")];
}
