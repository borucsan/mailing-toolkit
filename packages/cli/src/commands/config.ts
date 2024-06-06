import { OptionDefinition, CommandLineOptions } from "command-line-args";
import { OptionDefinition as DescriptionOptionDefinition} from "command-line-usage";

import { Command, CommandResult } from "./command.js";
import ProjectConfig from "../config/index.js";

export default class Config implements Command {
  name = 'config';
  aliases = ["configure"];

  description = 'Update and open configuration of the mailing-toolkit';

  args: (OptionDefinition & DescriptionOptionDefinition)[] = [
        
  ];

  async run(_options: CommandLineOptions, config: ProjectConfig): Promise<void | CommandResult> {
    await config.save();
    const open = await import('open');
    await open.default(`file://${config.path}`);
  }
}