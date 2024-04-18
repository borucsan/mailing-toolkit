const {plugin} = require("@mailing-toolkit/eslint-plugin");
console.debug(plugin);
module.exports = [
    plugin.configs["flat/recommended"],
];