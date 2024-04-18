import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { Command, CommandResult } from "../types/command";
export default class SpaceImage implements Command {
    name: string;
    aliases: string[];
    description: string;
    args: OptionDefinition[];
    run({ width, height, color, output }: CommandLineOptions): Promise<void | CommandResult>;
}
