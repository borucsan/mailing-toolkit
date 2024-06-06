import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { OptionDefinition as DescriptionOptionDefinition} from "command-line-usage";
import { Command, CommandResult } from "./command.js";
import KeyTrigger from "../triggers/key.js";
import { startDevServer } from "@web/dev-server";
import { globSync } from "glob";
import Validate from "./validate.js";
import { Payload } from "../pipeline/index.js";
import WatchTrigger from "../triggers/watch.js";


export default class Start implements Command {
  name = 'start';
  aliases = [""];

  description = 'Start the mailing toolkit';

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

  async run(options: CommandLineOptions): Promise<void | CommandResult> {
    const files = globSync([...options.input]);
        
    const server = await startDevServer({
      config: {
        rootDir: process.cwd(),
        watch: true,
        open: files[0] ? files[0] : false,
      },
      readCliArgs: false,
      readFileConfig: false,
    });

    const keyTrigger = new KeyTrigger();
    const watcher = new WatchTrigger(options.input);
    watcher
      .on('ready', async () => {
        Validate.eslintPipeline.process(Payload.fromCli(options));
      })
      .on('change', async () => {
        Validate.eslintPipeline.process(Payload.fromCli(options));
      });
    keyTrigger.addBinding({
      name: "q",
      description: "close application",
      callback: async () => {
        server.stop();
        keyTrigger.close();
        process.exit(0);
      }
    });
    keyTrigger.addBinding({
      name: "f",
      description: "Fix the input files",
      callback: async () => {
        const payload = Payload.fromCli(options);
        payload.set('fix', true);
        await Validate.eslintFixPipeline.process(payload);
      }
    });
    keyTrigger.listen();
  }
}
