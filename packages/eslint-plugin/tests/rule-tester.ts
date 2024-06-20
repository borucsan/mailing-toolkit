const { RuleTester } = require("eslint");
const htmlEslintParser = require("@html-eslint/parser");

export default function createRuleTester() {
  return new RuleTester({
    languageOptions: {
      parser: htmlEslintParser
    }
  });
};