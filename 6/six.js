const fs = require("fs");
const inp = fs.readFileSync("./six.txt", "utf8");
// const inp = 'zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw'

function diffLetters(str, num) {
  console.log(str.substring(0, num), num);
  for (let i = 1; i < num; i++) {
    if (str[0] === str[i]) {
      return false;
    }
  }

  return num === 2 ? true : diffLetters(str.substring(1), num - 1);
}

let iter = 0;
let _inp = inp;

while (!diffLetters(_inp, 14) && iter < 10000) {
  iter++;
  _inp = _inp.substring(1);
}

console.log(iter + 14);
