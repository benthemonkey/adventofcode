// grabbed from https://stackoverflow.com/questions/19687407/press-any-key-to-continue-in-nodejs
export const keypress = async (): Promise<void> => {
  process.stdin.setRawMode(true);
  return new Promise((resolve) =>
    process.stdin.once("data", (data) => {
      const byteArray = [...data];
      if (byteArray.length > 0 && byteArray[0] === 3) {
        console.log("^C");
        process.exit(1);
      }
      process.stdin.setRawMode(false);
      resolve();
    })
  );
};

export const sleep = (ms = 300): Promise<void> => {
  return new Promise((res) => setTimeout(res, ms));
};
