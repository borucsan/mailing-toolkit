"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmptyImage = void 0;
const jimp_1 = __importDefault(require("jimp"));
async function createEmptyImage(width, height, color, output) {
    console.debug("createEmptyImage", width, height, color, output);
    return new Promise((resolve) => {
        new jimp_1.default(width, height, color, async (er, i) => {
            console.debug(er);
            i.opacity(0);
            let o = `${output}.${i.getExtension()}`
                .replace("{{width}}", width.toString())
                .replace("{{height}}", height.toString());
            await i.writeAsync(o);
            console.debug(`File saved to: ${o}`);
            resolve(i);
        });
    });
}
exports.createEmptyImage = createEmptyImage;
//# sourceMappingURL=index.js.map