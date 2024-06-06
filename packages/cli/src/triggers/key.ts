import chalkTemplate from "chalk-template";
import keypress, { Key } from "keypress";

export interface KeyBinding {
  name?: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  sequence?: string;
  ch?: string;
  description: string;
  callback: () => Promise<void>;
}

class KeyTrigger {
  bindings: KeyBinding[] = [];
  constructor() {
    if (!process.stdin.setRawMode) {
      throw new Error("Raw mode not supported");
    }
    keypress(process.stdin);

    process.stdin.setRawMode(true);
    process.stdin.resume();
  }

  /**
   *
   * @deprecated Use addBinding instead
   */
  on(event: "keypress", cb: (key?: Key, ch?: string) => Promise<void>) {
    process.stdin.on(event, async (ch, key) => {
      console.debug("keypress", key, ch);
      await cb(key, ch);
    });
  }

  addBinding(binding: KeyBinding) {
    this.bindings.push(binding);
  }

  listen() {
    process.stdin.on("keypress", async (c: string, k?: Key) => {
      const binding = this.bindings.find(
        ({ ch, ctrl = false, meta = false, shift = false, name = "" }) => {
          if (c && typeof k == "undefined") {
            return ch === c;
          }

          if (k) {
            return (
              ctrl === k.ctrl &&
              meta === k.meta &&
              shift === k.shift &&
              name === k.name
            );
          }
        }
      );
      if (binding) {
        await binding.callback();
      }
    });
    this.createMenu();
  }
  createMenu() {
    this.bindings.forEach(
      ({
        name,
        ctrl = false,
        meta = false,
        shift = false,
        ch = "",
        description,
      }) => {
        console.log(
          chalkTemplate`press {bold ${ctrl ? "ctrl+" : ""}${
            meta ? "meta+" : ""
          }${shift ? "shift+" : ""}${name ?? ch}} to ${description}`
        );
      }
    );
  }

  close() {}
}

export default KeyTrigger;
