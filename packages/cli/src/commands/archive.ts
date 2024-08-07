import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { OptionDefinition as DescriptionOptionDefinition } from "command-line-usage";
import { Command, CommandResult } from "./command.js";
import { ArchiveMailProcessor } from "../files/archive.js";
import Pipeline, { InputFilesProcessor, Payload } from "../pipeline/index.js";
import ProjectConfig, { CommandConfig } from "../config/index.js";

export interface ArchiveConfigValues {
  archiveNameRegex?: string;
}
export class ArchiveConfig extends CommandConfig<ArchiveConfigValues> {
  archiveNameRegex?: string;
  load(options: ArchiveConfigValues): void {
    this.archiveNameRegex = options.archiveNameRegex;

  }
  validate(): boolean {
    return true;
  }
  valueOf(): ArchiveConfigValues {
    return {
      archiveNameRegex: this.archiveNameRegex,
    };
  }
}


export default class Archive implements Command {
  name = 'archive';
  aliases = ["a"];

  description = 'Archive mailing';

  args: (OptionDefinition & DescriptionOptionDefinition)[] = [

    {
      name: 'input',
      description: 'The input files to process',
      type: String,
      alias: 'i',
      multiple: true,
      defaultValue: ["**/*.{html,htm}"],
    },
  ];

  config = new ArchiveConfig();

  async run(options: CommandLineOptions, config: ProjectConfig): Promise<void | CommandResult> {

    const pipeline = Pipeline.create();
    pipeline.add(new InputFilesProcessor());
    pipeline.add(new ArchiveMailProcessor());
    pipeline.process(Payload.fromCli(options, config));
  }
}