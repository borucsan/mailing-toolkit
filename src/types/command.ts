import {CommandLineOptions, OptionDefinition} from 'command-line-args';

export interface Command {
    name: string;
    aliases: string[];
    description: string;
    args: OptionDefinition[];
    run(options: CommandLineOptions): Promise<CommandResult|void>;
  }
  
  /**
   * A command may return a CommandResult to indicate an exit code.
   */
  export class CommandResult {
    constructor(public exitCode: number) {
    }
  }