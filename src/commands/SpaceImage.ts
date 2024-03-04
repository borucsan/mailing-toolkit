import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { Command, CommandResult } from "../types/command";
import { createEmptyImage } from "../image/index";

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
            name: "from-html"
        }
        
    ]

    async run({width, height, color, output}: CommandLineOptions): Promise<void | CommandResult> {
        const o = output ?? `./images/s{{width}}x{{height}}`;
        console.debug(width, height, color, output);
        if(width && height) {
            createEmptyImage(width, height, color, o);
            return;
        }
        
    }
}