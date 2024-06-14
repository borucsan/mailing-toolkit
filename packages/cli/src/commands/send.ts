import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { OptionDefinition as DescriptionOptionDefinition} from "command-line-usage";
import { Command, CommandResult } from "./command.js";
import Pipeline, { InputFilesProcessor, Payload } from "../pipeline/index.js";
import { MailerTransporterProcessor, PrepareMailerProcessor, PrepareTransportProcessor } from "../mailer/index.js";
import ProjectConfig, { CommandConfig } from "../config/index.js";

export interface SendConfigValues {
    defaultEngine: "maildev" | "gmail";
    to: string[];
    from: string;

    gmail: {
        user: string;
        pass: string;
    }
}
export class SendConfig extends CommandConfig<SendConfigValues>{
  defaultEngine = "maildev";
  to: string[] = [];
  from?: string;

  gmail = {
    user: "",
    pass: "",
  };

  load(options: SendConfigValues): void {
    this.defaultEngine = options.defaultEngine || this.defaultEngine;
    this.to = options.to || this.to;
    this.gmail = options.gmail || this.gmail;
    this.from = options.from || this.from;
  }
  validate(): boolean {
    if(["maildev", "gmail"].indexOf(this.defaultEngine) === -1) {
      throw new Error('Invalid default engine');
    }
    if(this.defaultEngine === "gmail" && (!this.gmail.user || !this.gmail.pass)) {
      throw new Error('Gmail user or pass not set');
    }
    return true;
  }
  valueOf(): SendConfigValues {
    return {
      defaultEngine: this.defaultEngine as "maildev" | "gmail",
      from: this.from ?? this.gmail.user,
      to: this.to,
      gmail: this.gmail,
    };
    
  }
}

export default class Send implements Command {
  name = 'send';
  aliases = [""];

  description = 'Send test email';

  args: (OptionDefinition & DescriptionOptionDefinition)[] = [
    {
      name: 'input',
      description: 'The input files to process',
      type: String,
      alias: 'i',
      multiple: true,
      defaultValue: ["**/*.{html,htm}"],
    },
    {
      name: 'to',
      description: 'The recipients e-mail addresses that will appear on the To: field',
      type: String,
      multiple: true,
      defaultValue: [],
    },
    {
      name: 'from',
      description: 'The sender e-mail address',
      type: String,
    },
    {
      name: 'engine',
      description: 'The e-mail engine to use',
      type: String,
      defaultValue: "maildev",
    },
    {
      name: 'subject',
      description: 'The e-mail subject',
      type: String,
      defaultValue: "Test email",
    }
  ];

  config = new SendConfig();

  async run(options: CommandLineOptions, config: ProjectConfig): Promise<void | CommandResult> {
    const { defaultEngine, to, from} = config.get<SendConfig>('send');
    options.engine = options.engine ?? defaultEngine;
    options.to = options.to && options.to.length > 0 ? options.to : to;
    const pipeline = Pipeline.create()
      .add(new PrepareTransportProcessor())
      .add(new InputFilesProcessor())
      .add(new PrepareMailerProcessor())
      .add(new MailerTransporterProcessor());

    const payload = Payload.fromCli({from, ...options}, config);

    await pipeline.process(payload);
  }
}