import { CommandLineOptions } from "command-line-args";
import { globSync } from "glob";
import ProjectConfig from "../config/index.js";

export interface Processor {
    process: (payload: Payload) => Promise<any>;
}

export class Payload {
  private payload: Map<string, unknown> = new Map();
  private config?: ProjectConfig;

  constructor(config?: ProjectConfig) {
    this.config = config;
  }

  set(key: string, value: unknown) {
    this.payload.set(key, value);
  }

  get<T = unknown>(key: string) {
    return this.payload.get(key) as T;
  }

  has(key: string) {
    return this.payload.has(key);
  }

  delete(key: string) {
    this.payload.delete(key);
  }

  clear() {
    this.payload.clear();
  }

  getPayloadRaw() {
    return this.payload;
  }

  getConfig() {
    return this.config;
  }

  static create(config?: ProjectConfig) {
    return new Payload(config);
  }
  static fromCli(options: CommandLineOptions, config?: ProjectConfig) {
    const payload = Payload.create(config);
    for (const key in options) {
      payload.set(key, options[key]);
    }
    return payload;
  }
}

export class CallbackProcessor implements Processor {
  private callback: (payload: Payload) => Promise<any>;

  constructor(callback: (payload: Payload) => Promise<any>) {
    this.callback = callback;
  }

  async process(payload: Payload) {
    await this.callback(payload);
  }
}

export class InputFilesProcessor implements Processor {
  private input: string | string[];
  constructor(input: string | string[] = []) {
    this.input = input;
  }

  async process(payload: Payload) {
    const input = payload.get('input') as string | string[];
    payload.set('files', globSync([...this.input, ...input]));
  }
}

class Pipeline implements Processor {
  private processors: Processor[] = [];

  add(processor: Processor) {
    this.processors.push(processor);
    return this;
  }

  async process(payload: Payload) {
    for (const processor of this.processors) {
      await processor.process(payload);
    }
  }

  static create() {
    return new Pipeline();
  }

}

export default Pipeline;