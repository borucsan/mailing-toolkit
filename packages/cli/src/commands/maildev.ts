import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { Command, CommandResult } from "./command";
import maildev from 'maildev';


export default class MailDev implements Command {
    name = 'maildev';
    aliases = [""];

    description = 'Launch the maildev server';

    args: OptionDefinition[] =  [
        {
            name: 'outgoing-host',
            type: String,
            alias: 'oh',
            defaultValue: "smtp.gmail.com",
            defaultOption: true,
        },
        {
            name: 'outgoing-user',
            type: String,
            alias: 'ou',
            defaultValue: null,
        },
        {
            name: 'outgoing-password',
            type: String,
            alias: 'op',
            defaultValue: null,
        },
    ]

    async run(options: CommandLineOptions): Promise<void | CommandResult> {
        console.debug('Maildev', options);
        const config: MailDevOptions = {};
        
        const server = new maildev(config);
        
        server.listen();
    }
}