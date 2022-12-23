const fs = require("fs");
const inp = fs.readFileSync("./seven.txt", "utf8").split("\n");
const _ = require("lodash");

type TypeDir = {
  name: string;
  size: number;
  files: Record<string, number>;
  children: TypeDir[];
};

const filesystem: TypeDir = {
  size: 0,
  name: "/",
  files: {},
  children: [],
};

function setFileAtPath(
  fs: TypeDir,
  path: string[],
  file: string,
  size: number
) {
  fs.size += size;
  if (path.length === 0) {
    fs.files[file] = size;
    return;
  }

  let dir = fs.children.find((x) => x.name === path[0]);

  if (!dir) {
    dir = { name: path[0], files: {}, children: [], size: 0 };
    fs.children.push(dir);
  }

  return setFileAtPath(dir, path.slice(1), file, size);
}

function sumFoldersAboveSize(filesystem: TypeDir, maxSize: number) {
  let sum = 0;
  if (filesystem.size < maxSize) {
    sum += filesystem.size;
  }

  return (
    sum +
    filesystem.children.reduce((acc, child) => {
      return acc + sumFoldersAboveSize(child, maxSize);
    }, 0)
  );
}

function flattenChildren(obj: TypeDir) {
  const result: { name: string; size: number }[] = [];
  if (obj.children.length > 0) {
    result.push({ name: obj.name, size: obj.size });
    // Flatten each child recursively
    for (const child of obj.children) {
      result.push(...flattenChildren(child));
    }
  } else {
    // If the object doesn't have any children, return its name, size, and files
    result.push({
      name: obj.name,
      size: obj.size,
    });
  }
  return result;
}

function evalCommands(inp: string[]) {
  const dir: string[] = [];

  for (let i = 0; i < inp.length; i++) {
    const cmd = inp[i];

    if (cmd.startsWith("dir") || cmd === "$ ls" || cmd === "$ cd /") {
      continue;
    } else if (cmd === "$ cd ..") {
      dir.pop();
    } else if (cmd.startsWith("$ cd")) {
      dir.push(cmd.substring(5));
    } else {
      const [size, file] = cmd.split(" ");
      setFileAtPath(filesystem, dir, file, parseInt(size, 10));
    }
  }

  // part 1
  // console.log(sumFoldersAboveSize(filesystem, 100000));

  // part 2
  const diff = filesystem.size - 40000000;
  const children = flattenChildren(filesystem);
  const filteredChildren = children.filter((x) => x.size > diff);

  console.log(_.minBy(filteredChildren, "size")?.size);
}

console.log(evalCommands(inp));
