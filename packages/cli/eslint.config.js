import eslintImport from 'eslint-plugin-import';
import { fixupPluginRules } from "@eslint/compat";
import typescriptParser from '@typescript-eslint/parser';

  export default [
    {
        files: ["src/**/*.ts"],
        plugins: {
          import: fixupPluginRules(eslintImport)
        },
        settings: {
          'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                moduleDirectory: ['node_modules', 'src/'],
            },
          },
        },
        languageOptions: {
          parser: typescriptParser
      },
        rules: {
          "import/no-unresolved": "off",
          "import/no-commonjs": 2,
          "import/extensions": [2, "ignorePackages"],
          'no-var': 'error',
          semi: 'error',
          indent: ['error', 2, { SwitchCase: 1 }],
          'no-multi-spaces': 'error',
          'space-in-parens': 'error',
          'no-multiple-empty-lines': 'error',
          'prefer-const': 'error',
        },
    }
];