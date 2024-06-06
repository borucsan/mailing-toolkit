
import fs from 'fs';
import path from 'path';
import { Command } from '../commands/command.js';
import { get as _get} from "lodash-es";

class ProjectConfig {

  private configPath?: string;

  private options?: Record<string, CommandConfig>;

  get path() {
    return this.configPath;
  }

  constructor(...args: [string | Map<string, CommandConfig>, Command[]?]) {
    if (args.length as number === 2 && typeof args[0] === "string" && Array.isArray(args[1])) {
      this.configPath = args[0] as string;
      this.options = Object.fromEntries(new Map<string, CommandConfig>(
        (args[1] as Command[])
          .filter(command => typeof command.config !== "undefined")
          .map((command) => [command.name, command.config as CommandConfig])
      ));

    } else {
      this.options = Object.fromEntries(args[0] as Map<string, CommandConfig>);
    }
  }

  async load(configPath?: string) {
    configPath = configPath || this.configPath;
    if (!configPath) {
      throw new Error('Config path not defined');
    }
    if (!fs.existsSync(configPath)) {
      throw new ConfigNotFoundError('Config file not found');
    }

    const data = fs.readFileSync(configPath, 'utf8');
    const fileConfig = JSON.parse(data);
    Object.entries(this.options ?? {})?.forEach(([key, config]) => {
      if (fileConfig[key]) {
        config.load(fileConfig[key]);
      }
    });
  }

  async save(configPath?: string) {
    configPath = configPath ?? this.configPath;
    if (!configPath) {
      throw new Error('Config path not defined');
    }
    if(!this.options) {
      throw new Error('No options defined');
    }
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync (configPath, { recursive: true });
    }

    const fileConfig: Record<string, unknown> = {};
    Object.entries(this.options).forEach(([key, config]) => {
      fileConfig[key] = config.valueOf();
    });

    fs.writeFileSync(configPath, JSON.stringify(fileConfig, null, 2));
  }

  get<T = unknown>(key: string): T {
    return _get(this.options, key) as T;
  }

  static async getDefaultConfigPath() {
    const envPaths = await import('env-paths');
    const paths = envPaths.default('mailing-toolkit', {suffix: ''});
    const configPath = paths.config;
    return path.resolve(configPath, 'config.json');
  }

  static async init(commands: Command[]) {
    const configPath = await ProjectConfig.getDefaultConfigPath();
    const config = new ProjectConfig(configPath, commands);
    try {
      await config.load();
    } catch (error) {
      console.error('Error loading config:', error);
      if (error instanceof ConfigNotFoundError) {
        console.error('Creating new config file');
        await config.save();
      }
    }
    return config;
  }
}

export class ConfigNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigNotFoundError';
  }
}
export abstract class CommandConfig<T = Record<string, any>> {
    abstract load(options: T): void;
    abstract validate(options: T): boolean;
    abstract valueOf(): T;
}

export default ProjectConfig;