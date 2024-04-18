import parser from "@html-eslint/parser";
import html from '@html-eslint/eslint-plugin';
import recommended from './configs/recommended';
import * as rules from './rules';

const p = {
    // @ts-ignore
    configs: {
      rules : recommended,
    },
    rules,
  };
  
  Object.assign(p.configs, {
    "flat/recommended": {
      files: ["**/*.html"],
      plugins: {
        "@mailing-eslint": p,
        "@html-eslint": html,
      },
      languageOptions: {
        parser,
      },
      rules: {...recommended},
    },
  });
  
export const plugin = p;