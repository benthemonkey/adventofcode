import fs from "fs";
const inp = fs.readFileSync(__dirname + "/input.txt", "utf8");
// const inp = 'zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw'

function diffLetters(str, num) {
  for (let i = 1; i < num; i++) {
    if (str[0] === str[i]) {
      return false;
    }
  }

  return num === 2 ? true : diffLetters(str.substring(1), num - 1);
}

function run(count) {
  let iter = 0;
  let _inp = inp;

  while (!diffLetters(_inp, count) && iter < 10000) {
    iter++;
    _inp = _inp.substring(1);
  }

  return iter + count;
}

console.log("part 1: ", run(4));
console.log("part 2: ", run(14));
