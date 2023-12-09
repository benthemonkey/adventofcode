/* eslint-disable */

/**
 * I didn't actually write code per-se. I used trial and error to find the boundaries of when didWin
 * switchs from true->false and false->true then manually calculated the difference.
 */


import fs from "fs/promises";
import _ from "lodash";
const sampleSol = 288;
const sample2Sol = 0;

function parse(line: string): number[] {
  return line.split("").map((x) => parseInt(x, 10));
}

function didWin(time, holdCount, record) {
  return record < holdCount * (time - holdCount);
}

60947882 / 2 + 21294301 - (60947882 / 10 + 3084851);
