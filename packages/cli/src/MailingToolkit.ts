import commandLineCommands from "command-line-commands"
import commandLineArgs = require('command-line-args')
import { Command } from "./commands/command";
import SpaceImage from "./commands/spaceImage";
import Serve from "./commands/serve";
import Validate from "./commands/validate";
import Send from "./commands/send";
import MailDev from "./commands/maildev";

export class MailingToolkit {

    commands: Map<string, Command> = new Map();
    private args: string[];

    constructor(args: string[]) {
        this.args = args;
    }

    addCommand(command: Command) {
        this.commands.set(command.name, command);
    
        command.aliases.forEach((alias) => {
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
        mt.addCommand(new Serve());
        mt.addCommand(new Validate());
        mt.addCommand(new Send());
        mt.addCommand(new MailDev());

        return mt;
    }
}