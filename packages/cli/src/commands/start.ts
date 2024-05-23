import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { Command, CommandResult } from "./command";
import KeyTrigger from "../triggers/key";


export default class Start implements Command {
    name = 'start';
    aliases = [""];

    description = 'Start the mailing toolkit';

    args: OptionDefinition[] =  [
    ]

    async run({}: CommandLineOptions): Promise<void | CommandResult> {
        const keyTrigger = new KeyTrigger();

        keyTrigger.on('keypress', async (key) => {
            if(key.ctrl && key.name === 'c') {
                process.exit(0);
            }
        });
    }
}