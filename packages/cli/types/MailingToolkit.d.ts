import { Command } from "./types/command";
export declare class MailingToolkit {
    commands: Map<string, Command>;
    private args;
    constructor(args: string[]);
    addCommand(command: Command): void;
    run(): Promise<void | import("./types/command").CommandResult> | undefined;
    static init(args: string[]): MailingToolkit;
}
