import * as commandLineUsage from 'command-line-usage';
import { Command, CommandResult } from "./command.js";
import { CommandLineOptions } from 'command-line-args';

export class HelpCommand implements Command {
  name = 'help';
  aliases = [];
  
  description = 'Shows this help message, or help for a specific command';
  
  args = [{
    name: 'command',
    description: 'The command to display help for',
    defaultOption: true,
  }];
  
  commands: Map<String, Command> = new Map();
  
  constructor(commands: Map<String, Command>) {
    this.commands = commands;
  }
  
  generateGeneralUsage() {
    return commandLineUsage.default([
      {
        header: 'Available Commands',
        content: Array.from(new Set(this.commands.values())).map((command) => {
          return {name: command.name, summary: command.description};
        }),
      },
      {header: 'Global Options', optionList: []},
      {
        content:
              'Run `mailing-toolkit help <command>` for help with a specific command.',
        raw: true,
      }
    ]);
  }
  
  async generateCommandUsage(command: Command) {
    const usageGroups: commandLineUsage.Section[] = [
      {
        header: `mailing-toolkit ${command.name}`,
        content: command.description,
      },
      {header: 'Command Options', optionList: command.args},
    ];
  
    if (command.aliases.length > 0) {
      usageGroups.splice(1, 0, {header: 'Alias(es)', content: command.aliases});
    }
  
    return commandLineUsage.default(usageGroups);
  }
  
  async run(options: CommandLineOptions): Promise<void | CommandResult> {
    const commandName: string = options['command'];
    if (!commandName) {
      console.debug(
        'no command given, printing general help...', {options: options});
      console.log(this.generateGeneralUsage());
      return;
    }
  
    const command = this.commands.get(commandName);
    if (!command) {
      console.error(`'${commandName}' is not an available command.`);
      console.log(this.generateGeneralUsage());
      return;
    }
  
    console.debug(`printing help for command '${commandName}'...`);
    console.log(await this.generateCommandUsage(command));
  }
}