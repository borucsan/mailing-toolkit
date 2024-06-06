import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { Command, CommandResult } from "./command.js";
import maildev from 'maildev';
import { CommandConfig } from "../config/index.js";
import { merge as _merge } from 'lodash-es';

export class MailDevConfig extends CommandConfig<Partial<MailDevOptions>> {
  outgoingHost? = "smtp.gmail.com";
  outgoingUser?: string;
  outgoingPass?: string;
  outgoingSecure = true;
  smtp = 1025;
  ip?: string | undefined;
  outgoingPort?: number | undefined;
  web?: number | undefined;
  webIp?: string | undefined;
  disableWeb?: boolean | undefined;
  silent?: boolean | undefined;
  webUser?: string | undefined;
  webPass?: string | undefined;
  open? = true;

  load(options: Partial<MailDevOptions>): void {
    Object.keys(this).forEach((key) => {
      (this as any)[key] = options[key as keyof MailDevOptions] ?? this[key as keyof MailDevOptions];
    });
  }
  validate(options: Partial<MailDevOptions>): boolean {
    if(options.outgoingHost === "smtp.gmail.com" && options.outgoingSecure === false) {
      throw new Error('Gmail SMTP requires secure connection. Please set outgoingSecure to true');
    }
    return true;
  }

  valueOf(): Partial<MailDevOptions> {
    const value = {} as MailDevConfig;
    Object.keys(this).forEach((key) => {
      (value as any)[key] = this[key as keyof MailDevOptions];
    });

    return value;
  }
}


export default class MailDev implements Command {
  name = 'maildev';
  aliases = [""];

  description = 'Launch the maildev server';

  args: OptionDefinition[] = [
    {
      name: 'outgoing-host',
      type: String,
      alias: 'h',
    },

    {
      name: 'outgoing-user',
      type: String,
      alias: 'u',
    },

    {
      name: 'outgoing-password',
      type: String,
      alias: 'p',
    },
  ];

  config = new MailDevConfig();

  async run(options: CommandLineOptions): Promise<void | CommandResult> {
    const conf = _merge(this.config.valueOf(), options as Partial<MailDevOptions>);
    const server = new maildev(conf);

    server.listen();
  }
}