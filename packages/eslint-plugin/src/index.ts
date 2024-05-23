import parser from "@html-eslint/parser";
import html from "@html-eslint/eslint-plugin";
import recommended from "./configs/recommended";
import rules from "./rules";
import { ESLint, Linter, Rule } from "eslint";
import pkg from "../package.json";

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  rules: rules as Record<string, Rule.RuleModule>,
  configs: {
    recommended: [],
    "recommended-legacy": {
      plugins: ["markdown"],
      overrides: [
        {
          files: ["*.md"],
          processor: "markdown/markdown",
        },
        {
          files: ["**/*.md/**"],
          parserOptions: {
            ecmaFeatures: {
              // Adding a "use strict" directive at the top of
              // every code block is tedious and distracting, so
              // opt into strict mode parsing without the
              // directive.
              impliedStrict: true,
            },
          },
          rules: { ...recommended } as Linter.RulesRecord,
        },
      ],
    },
  },
};

Object.assign(plugin.configs, {
  recommended: [
    {
      plugins: {
        "@mailing-eslint": plugin,
        "@html-eslint": html,
      },
    },
    {
      files: ["**/*.html"],
      ignores: ["!**/*.html"],
      languageOptions: {
        parser,
      },
      rules: {
        ...recommended,
      },
    },
  ],
});

export default plugin satisfies ESLint.Plugin;
