import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { OptionDefinition as DescriptionOptionDefinition} from "command-line-usage";
import { Command, CommandResult } from "./command.js";
import { startDevServer } from '@web/dev-server';
import KeyTrigger from "../triggers/key.js";
import { globSync } from "glob";


export default class Serve implements Command {
  name = 'serve';
  aliases = [""];

  description = 'Launch the server';

  args: (OptionDefinition & DescriptionOptionDefinition)[] = [
    {
      name: 'input',
      description: 'The input files to process',
      type: String,
      alias: 'i',
      defaultValue: ["**/*.{html,htm}"],
    },
  ];

  async run({input}: CommandLineOptions): Promise<void | CommandResult> {
    const files = globSync([...input]);
        
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
    keyTrigger.addBinding({
      name: "c",
      description: "Close the server",
      ctrl: true,
      callback: async () => {
        server.stop();
        keyTrigger.close();
        process.exit(0);
      }
    });
    keyTrigger.listen();
  }
}