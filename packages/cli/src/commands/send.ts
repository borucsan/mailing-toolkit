import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { OptionDefinition as DescriptionOptionDefinition} from "command-line-usage";
import { Command, CommandResult } from "./command.js";
import ProjectConfig, { CommandConfig } from "../config/index.js";
import { SendEngine } from "../consts.js";
import { SenderEnginePipelineFactory } from "../mailer/engine.js";
import { Payload } from "../pipeline/index.js";
export interface SendConfigValues {
    defaultEngine: SendEngine;
    to: string[];
    from: string;

    gmail: {
        user: string;
        pass: string;
    }

    sare: {
        uid: string;
        apiKey: string;
        overwriteFrom: boolean;
    }
}
export class SendConfig extends CommandConfig<SendConfigValues>{
  defaultEngine = SendEngine.Maildev;
  to: string[] = [];
  from?: string;

  gmail = {
    user: "",
    pass: "",
  };

  sare = {
    uid: "",
    apiKey: "",
    overwriteFrom: false,
  };

  load(options: SendConfigValues): void {
    this.defaultEngine = options.defaultEngine || this.defaultEngine;
    this.to = options.to || this.to;
    this.gmail = options.gmail || this.gmail;
    this.from = options.from || this.from;
    this.sare = options.sare || this.sare;
  }
  validate(): boolean {
    if([SendEngine.Maildev, SendEngine.Gmail, SendEngine.SARE].indexOf(this.defaultEngine) === -1) {
      throw new Error('Invalid default engine');
    }
    if(this.defaultEngine === "gmail" && (!this.gmail.user || !this.gmail.pass)) {
      throw new Error('Gmail user or pass not set');
    }
    return true;
  }
  valueOf(): SendConfigValues {
    return {
      defaultEngine: this.defaultEngine as SendEngine,
      from: this.from ?? this.gmail.user,
      to: this.to,
      gmail: this.gmail,
      sare: this.sare
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
    },
    {
      name: 'newsletter',
      alias: 'n',
      multiple: true,
      description: 'The newsletter id to send (SARE engine only)',
      type: String,
    }
  ];

  config = new SendConfig();

  async run(options: CommandLineOptions, config: ProjectConfig): Promise<void | CommandResult> {
    const { defaultEngine, to, from} = config.get<SendConfig>('send');
    options.engine = options.engine ?? defaultEngine;
    options.to = options.to && options.to.length > 0 ? options.to : to;
    const payload = Payload.fromCli({from, ...options}, config);
    const pipeline = SenderEnginePipelineFactory.get(options.engine, payload);
    await pipeline.process(payload);
  }
}