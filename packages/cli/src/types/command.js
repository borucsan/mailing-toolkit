"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandResult = void 0;
/**
 * A command may return a CommandResult to indicate an exit code.
 */
class CommandResult {
    exitCode;
    constructor(exitCode) {
        this.exitCode = exitCode;
    }
}
exports.CommandResult = CommandResult;
//# sourceMappingURL=command.js.map