import commandLineCommands from "command-line-commands";
import commandLineArgs = require('command-line-args')
import { Command } from "./commands/command.js";
import SpaceImage from "./commands/spaceImage.js";
import Serve from "./commands/serve.js";
import Validate from "./commands/validate.js";
import Send from "./commands/send.js";
import MailDev from "./commands/maildev.js";
import { HelpCommand } from "./commands/help.js";
import { globalArguments, mergeArguments } from "./args/index.js";
import ProjectConfig from "./config/index.js";
import Config from "./commands/config.js";
import Start from "./commands/start.js";
import Text from "./commands/text.js";
import Archive from "./commands/archive.js";

export class MailingToolkit {

  commands: Map<string, Command> = new Map();
  private args: string[];

  constructor(args: string[]) {
    this.args = args;
    this.addCommand(new HelpCommand(this.commands));
  }

  addCommand(command: Command) {
    this.commands.set(command.name, command);
    
    command.aliases.forEach((alias) => {
      this.commands.set(alias, command);
    });
  }

  async run() {
    const commandNames = Array.from(this.commands.keys());
    const helpCommand = this.commands.get('help')!;
    let parsedArgs: { command: string | null; argv: string[] } = { command: null, argv: [] };
    let command: Command;
    let name: string = 'help';
    try {
      parsedArgs = commandLineCommands(commandNames, this.args);
      name = parsedArgs.command ?? 'help';
    } catch (error: any) {
      console.error('Error:', error.name, error.message);
      if (error.name === 'INVALID_COMMAND') {
        if (error.command) {
          console.warn(`'${error.command}' is not an available command.`);
        }
      } else {
        throw error;
      }
    }
    try {
      const { argv } = parsedArgs;
      const config = await ProjectConfig.init(Array.from(this.commands.values()));

      command = this.commands.get(name) ?? helpCommand;

      if (!command) {
        throw new TypeError('command is null');
      }
      const commandDefinitions = mergeArguments(command.args, globalArguments);
      const options = commandLineArgs(commandDefinitions, { camelCase: true, argv });
      const commandOptions = options && (options['_all'] || {});
      if (commandOptions['help']) {
        console.debug(
          `'--help' option found, running 'help' for given command...`);
        return helpCommand.run({command: name}, config);
      }

      return command.run(commandOptions, config);

    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  }

  static init(args: string[]) {
    const mt = new MailingToolkit(args);
    mt.addCommand(new SpaceImage());
    mt.addCommand(new Serve());
    mt.addCommand(new Validate());
    mt.addCommand(new Send());
    mt.addCommand(new MailDev());
    mt.addCommand(new Config());
    mt.addCommand(new Start());
    mt.addCommand(new Text());
    mt.addCommand(new Archive());

    return mt;
  }
}