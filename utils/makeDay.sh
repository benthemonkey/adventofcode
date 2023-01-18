#!/bin/bash
mkdir -p $1
cp -n ./utils/template.ts $1/index.ts
touch $1/sample.txt
touch $1/input.txt