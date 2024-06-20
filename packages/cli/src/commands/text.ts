import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { OptionDefinition as DescriptionOptionDefinition} from "command-line-usage";
import { Command, CommandResult } from "./command.js";
import Pipeline, { InputFilesProcessor, Payload } from "../pipeline/index.js";
import { MailingTxtVersionProcessor } from "../mailer/index.js";

export default class Text implements Command {
  name = 'text';
  aliases = ["t"];
  
  description = 'Generate text versions of the input files';
  
  args: (OptionDefinition & DescriptionOptionDefinition)[] = [
    {
      name: 'input',
      description: 'The input files to process',
      type: String,
      alias: 'i',
      defaultValue: ["**/*.{html,htm}"],
    },
  ];
  
  async run(options: CommandLineOptions): Promise<void | CommandResult> {
    const pipeline = Pipeline.create()
      .add(new InputFilesProcessor())
      .add(new MailingTxtVersionProcessor());

    const payload = Payload.fromCli(options);

    await pipeline.process(payload);
  }
}