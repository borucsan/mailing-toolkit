import { ESLint, Linter } from "eslint";

import mailing from "@mailing-toolkit/eslint-plugin";
import { Payload, Processor } from "../pipeline/index.js";

export class ESLintLintProcessor implements Processor {
  private eslint;
  private formatter?: ESLint.Formatter;
  constructor(options = {} as ESLint.Options) {
    const config = {
      overrideConfigFile: true as any,
      baseConfig: [...mailing.default.configs.recommended] as Linter.Config,
      ...options,
    } as ESLint.Options;
    this.eslint = new ESLint(config);
  }

  async process(payload: Payload) {
    const files = payload.get("files") as string[];
    const fix = payload.get("fix") as boolean;
    console.debug("Lint", files, fix);
    const results = await this.eslint.lintFiles(files);
    if (fix) {
      await ESLint.outputFixes(results);
      payload.set("esLintResults", results);
    }
    if (!this.formatter) {
      this.formatter = await this.eslint.loadFormatter("stylish");
    }
    const formatted = this.formatter.format(results);
    payload.set("esLintResults", formatted);
    console.log(formatted);
  }
}
