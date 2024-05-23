import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { Command, CommandResult } from "./command";
import { startDevServer } from '@web/dev-server';
import KeyTrigger from "../triggers/key";


export default class Serve implements Command {
    name = 'serve';
    aliases = [""];

    description = 'Launch the server';

    args: OptionDefinition[] =  [
    ]

    async run({}: CommandLineOptions): Promise<void | CommandResult> {
        console.debug('Serve');
        const path = process.cwd();
        let target = undefined;
        
        const server = await startDevServer({
            config: {
                rootDir: path,
                watch: true,
                open: true,
            },
            readCliArgs: false,
            readFileConfig: false,
        });
        console.debug('Server started',  target);

        const keyTrigger = new KeyTrigger();

        keyTrigger.on('keypress', async (key) => {
            if(key.ctrl && key.name === 'c') {
                server.stop();
                process.exit(0);
            }
        });
    }
}