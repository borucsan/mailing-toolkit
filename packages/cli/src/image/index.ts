import Jimp from "jimp";

export async function createEmptyImage(width: number, height: number, color: string, output: string) {
  console.debug("createEmptyImage", width, height, color, output);
  return new Promise((resolve) => {
    new Jimp(width, height, color, async (er, i) => {
      console.debug(er);
      i.opacity(0);
      const o = `${output}.${i.getExtension()}`
        .replace("{{width}}", width.toString())
        .replace("{{height}}", height.toString());
      await i.writeAsync(o);
      console.debug(`File saved to: ${o}`);
      resolve(i);
    });
  });
}