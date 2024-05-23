import { CommandLineOptions, OptionDefinition } from "command-line-args";
import nodemailer from 'nodemailer';
import { Command, CommandResult } from "./command";
import Pipeline, { InputFilesProcessor, Payload } from "../pipeline";
import { MailerTransporterProcessor, PrepareMailerProcessor } from "../mailer";


export default class Send implements Command {
    name = 'send';
    aliases = [""];

    description = 'Send test email';

    args: OptionDefinition[] =  [
        {
            name: 'input',
            type: String,
            alias: 'i',
            multiple: true,
            defaultValue: ["**/*.{html,htm}"],
        },
    ]

    async run(options: CommandLineOptions): Promise<void | CommandResult> {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const pipeline = Pipeline.create()
        .add(new InputFilesProcessor())
        .add(new PrepareMailerProcessor())
        .add(new MailerTransporterProcessor(nodemailer.createTransport({
            port: 1025,
        })));


        const payload = Payload.fromCli(options);

        await pipeline.process(payload);
    }
}