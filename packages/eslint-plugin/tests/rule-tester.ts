const { RuleTester } = require("eslint");

export default function createRuleTester() {
  return new RuleTester({
    parser: require.resolve("@html-eslint/parser"),
  });
};