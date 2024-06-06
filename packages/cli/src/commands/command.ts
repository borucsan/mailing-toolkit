import {CommandLineOptions, OptionDefinition} from 'command-line-args';
import { OptionDefinition as DescriptionOptionDefinition} from "command-line-usage";
import ProjectConfig, { CommandConfig } from '../config/index.js';

export interface Command {
    name: string;
    aliases: string[];
    description: string;
    args: (OptionDefinition & DescriptionOptionDefinition)[];
    run(options: CommandLineOptions, config: ProjectConfig): Promise<CommandResult|void>;

    config?: CommandConfig;
  }
  
/**
   * A command may return a CommandResult to indicate an exit code.
   */
export class CommandResult {
  constructor(public exitCode: number) {
  }
}