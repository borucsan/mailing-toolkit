import { CommandLineOptions, OptionDefinition } from "command-line-args";
import { Command, CommandResult } from "./command";
import WatchTrigger from "../triggers/watch";
import { ESLintLintProcessor } from "../linter";
import KeyTrigger from "../triggers/key";
import Pipeline, {InputFilesProcessor, Payload } from "../pipeline";


export default class Validate implements Command {
    name = 'validate';
    aliases = ["lint"];

    description = 'Validate mailing with eslint';

    args: OptionDefinition[] =  [
        {
            name: 'input',
            type: String,
            alias: 'i',
            multiple: true,
            defaultValue: ["**/*.{html,htm}"],
        },
        {
            name: 'fix',
            type: Boolean,
            defaultValue: false,
        },
        {
            name: 'watch',
            type: Boolean,
            alias: 'w',
            defaultValue: false,
        }
    ]

    static eslintPipeline = Pipeline.create()
    .add(new InputFilesProcessor())
    .add(new ESLintLintProcessor());

    static eslintFixPipeline = Pipeline.create()
    .add(new InputFilesProcessor())
    .add(new ESLintLintProcessor({fix: true}));

    async run(options: CommandLineOptions): Promise<void | CommandResult> {
        if(options.watch) {
            console.debug('Watch mode');
            const keyTrigger = new KeyTrigger();
            const watcher = new WatchTrigger(options.input);
            keyTrigger.on('keypress', async (key) => {
                const payload = Payload.fromCli(options);
                if(key.ctrl && key.name === 'c') {
                    watcher.close();
                    process.exit(0);
                } else if(key.name === 'return') {
                    await Validate.eslintPipeline.process(payload);
                } else if(key.name === 'f') {
                    payload.set('fix', true);
                    await Validate.eslintFixPipeline.process(payload);
                }
            });

            watcher
            .on('ready', async () => {
                Validate.eslintPipeline.process(Payload.fromCli(options));
            })
            .on('change', async () => {
                Validate.eslintPipeline.process(Payload.fromCli(options));
            });
        } else {
            await Validate.eslintPipeline.process(Payload.fromCli(options));
        }
        
        
    }
}