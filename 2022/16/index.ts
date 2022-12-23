import fs from "fs";
import _ from "lodash";
const sample = fs.readFileSync(__dirname + "/sample.txt", "utf8").split("\n");
const sampleSol = 1651;
const sample2Sol = 1707;
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8").split("\n");

type Node = {
  id: string;
  flowRate: number;
  edges: string[];
  distances: Record<string, number>;
};
type State = {
  totalPressure: number;
  time: number;
  node: Node;
  visited: string[];
};
type State2 = {
  totalPressure: number;
  time: number;
  node: Node;
  elephantNode: Node;
  elephantTime: number;
  elephantIsDone: boolean;
  visited: Record<string, boolean>;
};

function parse(lines: string[]): {
  nodes: Record<string, Node>;
  primaryNodes: Node[];
} {
  let startNode;
  const { nodes, primaryNodes } = lines.reduce(
    (acc, line) => {
      const regex =
        /Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.+)$/gm;

      const out = regex.exec(line);
      if (!out) {
        throw new Error("fail");
      }
      const node = {
        id: out[1],
        flowRate: parseInt(out[2], 10),
        edges: out[3].split(", "),
        distances: {},
      };
      if (node.id === "AA") {
        startNode = node;
      }
      if (node.flowRate > 0) {
        acc.primaryNodes.push(node);
      }
      acc.nodes[out[1]] = node;
      return acc;
    },
    { nodes: {}, primaryNodes: [] } as {
      nodes: Record<string, Node>;
      primaryNodes: Node[];
    }
  );

  return {
    nodes,
    primaryNodes: [startNode, ...primaryNodes],
  };
}

function traverseGraph(
  nodes: Record<string, Node>,
  start: Node
): Record<string, number> {
  const visited: Record<string, number> = {};
  const queue: { node: Node; depth: number }[] = [{ node: start, depth: 0 }];

  while (queue.length) {
    const { node, depth } = queue.shift()!;

    if (typeof visited[node.id] !== "number") {
      visited[node.id] = depth;
    }

    node.edges.forEach((edge) => {
      if (typeof visited[edge] !== "number") {
        queue.push({ node: nodes[edge], depth: depth + 1 });
      }
    });
  }

  return _.pickBy(visited, (val, key) => nodes[key].flowRate > 0);
}

function traverseWeightedGraph(nodes: Record<string, Node>, start: Node) {
  let queue: State[] = [
    { node: start, time: 0, totalPressure: 0, visited: [] },
  ];
  const minutes = 30;
  const nodeList = Object.keys(nodes);
  let maxPressure = 0;

  while (queue.length) {
    const { node, time, totalPressure, visited } = queue.shift()!;

    if (maxPressure < totalPressure) {
      // console.log("new max pressure", totalPressure);
      maxPressure = totalPressure;
    }

    if (Object.keys(visited).length === nodeList.length) {
      continue;
    }

    nodeList.forEach((edge) => {
      if (!visited.includes(edge)) {
        const nextVisited = [...visited, edge];
        const nextTime = time + node.distances[edge] + 1;
        const addedPressure =
          nodes[edge].flowRate * Math.max(0, minutes - nextTime);

        if (addedPressure !== 0) {
          queue.push({
            node: nodes[edge],
            time: nextTime,
            totalPressure: totalPressure + addedPressure,
            visited: nextVisited,
          });
        }
      }
    });

    queue = _.orderBy(queue, ["totalPressure"], ["desc"]);
  }

  return maxPressure;
}

function traverseWeightedGraph2(nodes: Record<string, Node>, start: Node) {
  let queue: State2[] = [
    {
      node: start,
      elephantNode: start,
      time: 0,
      elephantTime: 0,
      totalPressure: 0,
      visited: {},
      elephantIsDone: false,
    },
  ];
  const minutes = 26;
  const nodeList = Object.keys(nodes);
  let maxPressure = 0;

  while (queue.length) {
    const {
      node,
      elephantNode,
      time,
      elephantTime,
      totalPressure,
      visited,
      elephantIsDone,
    } = queue.shift()!;

    if (maxPressure < totalPressure) {
      // console.log("new max pressure", totalPressure);
      maxPressure = totalPressure;
    }

    if (Object.keys(visited).length === nodeList.length) {
      continue;
    }

    // figure out if we can beat the best score in a perfect world
    const bestPossibleScore =
      totalPressure +
      (minutes - Math.min(time, elephantTime) - 1) *
        nodeList.reduce((acc, _node) => {
          if (!visited[_node]) {
            return acc + nodes[_node].flowRate;
          }
          return acc;
        }, 0);

    if (bestPossibleScore < maxPressure) {
      continue;
    }

    for (let i = 0; i < nodeList.length; i++) {
      const meEdge = nodeList[i];
      if (visited[meEdge]) continue;

      const nextVisited = { ...visited, [meEdge]: true };
      const nextTime = time + node.distances[meEdge] + 1;
      const addedPressure =
        nodes[meEdge].flowRate * Math.max(0, minutes - nextTime);

      if (elephantIsDone) {
        queue.push({
          node: nodes[meEdge],
          elephantNode,
          time: nextTime,
          elephantTime,
          totalPressure: totalPressure + addedPressure,
          visited: nextVisited,
          elephantIsDone: true,
        });
      }

      for (let j = 0; j < nodeList.length; j++) {
        const elephantEdge = nodeList[j];
        if (nextVisited[elephantEdge]) continue;

        const nextElephantVisited = { ...nextVisited, [elephantEdge]: true };
        const nextElephantTime =
          elephantTime + elephantNode.distances[elephantEdge] + 1;
        const addedElephantPressure =
          nodes[elephantEdge].flowRate *
          Math.max(0, minutes - nextElephantTime);

        // try this
        if (
          Object.keys(nextElephantVisited).length < nodeList.length - 1 &&
          (addedPressure === 0 || addedElephantPressure === 0)
        ) {
          continue;
        }
        if (addedPressure + addedElephantPressure === 0) continue;

        queue.push({
          node: nodes[meEdge],
          elephantNode: nodes[elephantEdge],
          time: nextTime,
          elephantTime: nextElephantTime,
          totalPressure: totalPressure + addedPressure + addedElephantPressure,
          visited:
            addedElephantPressure === 0 ? nextVisited : nextElephantVisited,
          elephantIsDone: addedElephantPressure === 0,
        });
      }
    }

    queue = _.orderBy(queue, ["totalPressure"], ["desc"]);
  }

  return maxPressure;
}

function partOne(inp) {
  const { nodes, primaryNodes } = parse(inp);

  for (let i = 0; i < primaryNodes.length; i++) {
    primaryNodes[i].distances = traverseGraph(nodes, primaryNodes[i]);
  }

  const primaryNodeLookup = _.pickBy(nodes, (x) => x.flowRate > 0);

  return traverseWeightedGraph(primaryNodeLookup, primaryNodes[0]);
}

function partTwo(inp) {
  const { nodes, primaryNodes } = parse(inp);

  for (let i = 0; i < primaryNodes.length; i++) {
    primaryNodes[i].distances = traverseGraph(nodes, primaryNodes[i]);
  }

  const primaryNodeLookup = _.pickBy(nodes, (x) => x.flowRate > 0);

  return traverseWeightedGraph2(primaryNodeLookup, primaryNodes[0]);
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
