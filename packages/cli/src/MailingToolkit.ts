import commandLineCommands from "command-line-commands"
import commandLineArgs = require('command-line-args')
import { Command } from "./types/command";
import SpaceImage from "./commands/SpaceImage";

export class MailingToolkit {

    commands: Map<string, Command> = new Map();
    private args: string[];

    constructor(args: string[]) {
        this.args = args;
    }

    addCommand(command: Command) {
        this.commands.set(command.name, command);
    
        command.aliases.forEach((alias) => {
          console.debug('adding alias', alias);
          this.commands.set(alias, command);
        });
      }

    run() {
        const commandNames = Array.from(this.commands.keys());

        try {
           const { command: name, argv } = commandLineCommands(commandNames, this.args);

          const command =  this.commands.get(name ?? "");

          if (!command) {
            throw new TypeError('command is null');
          }

          const options = commandLineArgs(command.args, { camelCase: true, argv });

          return command.run(options);

          } catch (error) {
          }
    }

    static init(args: string[]) {
        const mt = new MailingToolkit(args);

        mt.addCommand(new SpaceImage());

        return mt;
    }
}