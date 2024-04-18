"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../image/index");
class SpaceImage {
    name = 'space-img';
    aliases = ["space"];
    description = 'Generate space image';
    args = [
        {
            name: "width",
            type: Number,
            alias: "w"
        },
        {
            name: "height",
            type: Number,
            alias: "h",
            defaultValue: 1
        },
        {
            name: "color",
            alias: "c",
            defaultValue: 0x0
        },
        {
            name: "output",
            alias: "o"
        },
        {
            name: "from-html"
        }
    ];
    async run({ width, height, color, output }) {
        const o = output ?? `./images/s{{width}}x{{height}}`;
        console.debug(width, height, color, output);
        if (width && height) {
            (0, index_1.createEmptyImage)(width, height, color, o);
            return;
        }
    }
}
exports.default = SpaceImage;
//# sourceMappingURL=SpaceImage.js.map