import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { Command, CommandResult } from "./command";
import { createEmptyImage } from "../image/index";
import fs from "fs";
import path from "path";
import { parse } from "es-html-parser";
import { findTagNodeInAST } from "../utils/ast";
import { globSync } from "glob";
import { getItemsIn1NotIn2 } from "../utils/arrays";

export default class SpaceImage implements Command {
    name = 'space-img';
    aliases = ["space"];

    description = 'Generate space image';

    args: OptionDefinition[] =  [
        {
            name: "width",
            type: Number,
            alias: "w"
        },
        {
            name: "height",
            type: Number,
            alias: "h",
            defaultValue: 1
        },
        {
            name: "color",
            alias: "c",
            defaultValue: 0x0
        },
        {
            name: "output",
            alias: "o"
        },

        {
            name: "input",
            alias: "i",
            type: String,
            defaultOption: true,
            defaultValue: "index.html"
        }
    ]

    async run({ width, height, color, output, input }: CommandLineOptions): Promise<void | CommandResult> {
        const o = output ?? `./images/s{{width}}x{{height}}`;
        const root = process.cwd();
        console.debug(width, height, color, output, input);
        if(width && height) {
            createEmptyImage(width, height, color, o);
            return;
        } else if(input) {
            const pattern = /^images\/s\d+x\d+.png/;
            const filePath = path.resolve(input);
            const content = fs.readFileSync(filePath, 'utf-8');
            const {ast} = parse(content);
            const tags = findTagNodeInAST(ast, 'img');
            const imagesFromHtml = tags.map((tag) => {
                return tag.attributes.find((attr) => attr.key.value === 'src')?.value?.value;
            }).filter(src => src && pattern.test(src)) as string[];

            const imagesInFolder = globSync('images/s*.png');
            const obsoleteImages = getItemsIn1NotIn2(imagesInFolder, imagesFromHtml);
            const newImages = getItemsIn1NotIn2(imagesFromHtml, imagesInFolder);
            console.log('Status:', newImages, obsoleteImages, imagesInFolder, imagesFromHtml);

            obsoleteImages.forEach((img) => {
                fs.unlinkSync(path.resolve(root, img));
            });
            console.log('Obsolete images removed');

            newImages.forEach((img) => {
                const [width, height] = img.match(/\d+/g) as string[];
                createEmptyImage(parseInt(width), parseInt(height), color, path.resolve(root, img));
            });

            console.log('New images created'); 
        }
        
    }
}