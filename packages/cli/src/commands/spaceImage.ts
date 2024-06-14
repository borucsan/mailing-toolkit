import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { OptionDefinition as DescriptionOptionDefinition} from "command-line-usage";
import { Command, CommandResult } from "./command.js";
import { CollectFilesProcessor, CreateEmptyImageProcessor } from "../image/index.js";
import Pipeline, { InputFilesProcessor, Payload } from "../pipeline/index.js";

export default class SpaceImage implements Command {
  name = 'space-img';
  aliases = ["space"];

  description = 'Generate space image';

  args: (OptionDefinition & DescriptionOptionDefinition)[] = [
    {
      name: "width",
      type: Number,
      alias: "w"
    },
    {
      name: "height",
      type: Number,
      alias: "h",
      defaultValue: 1
    },
    {
      name: "color",
      alias: "c",
      defaultValue: 0x0
    },
    {
      name: "output",
      alias: "o"
    },
    {
      name: "update",
      type: Boolean,
      alias: "u",
      defaultValue: false
    },
    {
      name: 'input',
      description: 'The input files to process',
      type: String,
      alias: 'i',
      multiple: true,
      defaultValue: ["**/*.{html,htm}"],
    },
  ];

  async run(options: CommandLineOptions): Promise<void | CommandResult> {
    const pipeline = Pipeline.create();
    if(options.width && options.height) {
      pipeline.add(new CreateEmptyImageProcessor());
      pipeline.process(Payload.fromCli(options));
      return;
    } else if(options.input) {
      pipeline.add(new InputFilesProcessor());
      pipeline.add(new CollectFilesProcessor(options.update));
      pipeline.process(Payload.fromCli(options));
    }
  }
}