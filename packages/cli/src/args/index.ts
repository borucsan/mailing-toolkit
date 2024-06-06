import { OptionDefinition } from "command-line-args";

export const globalArguments: OptionDefinition[] = [
  {
    name: 'help',
    type: Boolean,
    group: 'global',
  },
];

export function mergeArguments(...argsGroups: OptionDefinition[][]): OptionDefinition[] {
  const merged = new Map<string, OptionDefinition>();
  argsGroups.flat().forEach((arg) => {
    const existing = merged.get(arg.name);
    merged.set(arg.name, {...existing, ...arg});
  });

  return Array.from(merged.values());
}