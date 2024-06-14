import Jimp from "jimp";
import { Payload, Processor } from "../pipeline/index.js";
import { globSync } from "glob";
import fs from "fs";
import path from "path";
import { parse } from "es-html-parser";
import { findTagNodeInAST } from "../utils/ast.js";
import { getItemsIn1NotIn2 } from "../utils/arrays.js";
import chalkTemplate from "chalk-template";

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

export class CreateEmptyImageProcessor implements Processor {
  async process(payload: Payload) {
    const width = payload.get<number>("width");
    const height = payload.get<number>("height");
    const color = payload.get<string>("color");
    const output = payload.get<string>("output") ?? `./images/s{{width}}x{{height}}`;
    await createEmptyImage(width, height, color, output);
  };
  
}

export class CollectFilesProcessor implements Processor {
  private update: boolean;
  constructor(update = false) {
    this.update = update;
  }

  async process(payload: Payload) {
    const pattern = /^images\/s\d+x\d+.png/;
    const files = payload.get<string[]>("files");
    files.forEach((file) => {
      const htmlPath = path.resolve(process.cwd(), file);
      const dirName = path.dirname(htmlPath);
      const content = fs.readFileSync(file, 'utf-8');
      const {ast} = parse(content);
      const tags = findTagNodeInAST(ast, 'img');
      const imagesFromHtml = tags.map((tag) => {
        return tag.attributes.find((attr) => attr.key.value === 'src')?.value?.value;
      }).filter(src => src && pattern.test(src)) as string[];

      const imagesInFolder = globSync('images/s*.png', {cwd: dirName});
      
      const obsoleteImages = getItemsIn1NotIn2(imagesInFolder, imagesFromHtml);
      const newImages = getItemsIn1NotIn2(imagesFromHtml, imagesInFolder);
      console.log(chalkTemplate`Status for space images in {bold ${file}}: {green ${newImages.length}} new, {red ${obsoleteImages.length}} obsolete, {blue ${imagesInFolder.length}} in folder,`);
      if(this.update) {
        obsoleteImages.forEach((img) => {
          fs.unlinkSync(path.resolve(dirName, img));
        });
        console.log('Obsolete images removed');
  
        newImages.forEach((img) => {
          const [width, height] = img.match(/\d+/g) as string[];
          createEmptyImage(parseInt(width), parseInt(height), '0x0', path.resolve(dirName, img));
        });
      }
    });
  }
}