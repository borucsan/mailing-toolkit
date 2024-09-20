import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { OptionDefinition as DescriptionOptionDefinition} from "command-line-usage";
import { Command, CommandResult } from "./command.js";
import KeyTrigger from "../triggers/key.js";
import { startDevServer } from "@web/dev-server";
import { globSync } from "glob";
import Validate from "./validate.js";
import Pipeline, { InputFilesProcessor, Payload } from "../pipeline/index.js";
import { CollectImageFilesProcessor, SpaceImageProcessor } from "../files/image.js";
import { SendConfig } from "./send.js";
import ProjectConfig from "../config/index.js";
import { SenderEnginePipelineFactory } from "../mailer/engine.js";


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

  async run(options: CommandLineOptions, config: ProjectConfig): Promise<void | CommandResult> {
    const files = globSync([...options.input]);
    const server = await startDevServer({
      config: {
        rootDir: process.cwd(),
        watch: true,
        open: files[0] ? files[0] : false,
      },
      logStartMessage: false,
      readCliArgs: false,
      readFileConfig: false,
    });
    
    const keyTrigger = new KeyTrigger();
    server.fileWatcher
      .on('ready', async () => {
        await Validate.eslintPipeline.process(Payload.fromCli(options));
        await this.spaceImages(options);
      })
      .on('change', async () => {
        await Validate.eslintPipeline.process(Payload.fromCli(options));
        await this.spaceImages(options);
        keyTrigger.createMenu();
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
        await this.spaceImages(options);
      }
    });
    keyTrigger.addBinding({
      name: "u",
      description: "Update space images",
      callback: async () => {
        await this.spaceImages(options, true);
        const payload = Payload.fromCli(options);
        await Validate.eslintFixPipeline.process(payload);
        server.fileWatcher.emit('change');
      }
    });
    keyTrigger.addBinding({
      name: "s",
      description: "send email",
      callback: async () => {
        await this.sendEmail(options, config);
      }
    });
    keyTrigger.listen();
  }
  private async spaceImages(options: CommandLineOptions, fix = false) {
    const pipeline = Pipeline.create();
    pipeline.add(new InputFilesProcessor());
    pipeline.add(new CollectImageFilesProcessor());
    pipeline.add(new SpaceImageProcessor(fix));
    await pipeline.process(Payload.fromCli(options));
  }

  private async sendEmail(options: CommandLineOptions, config: ProjectConfig) {
    const { defaultEngine, to, from} = config.get<SendConfig>('send');
    const engine = options.engine ?? defaultEngine;
    const toEmails = options.to && options.to.length > 0 ? options.to : to;
    const payload = Payload.fromCli({from, engine, to: toEmails, ...options}, config);
    const pipeline = SenderEnginePipelineFactory.get(options.engine, payload);


    await pipeline.process(payload);
  }
}


