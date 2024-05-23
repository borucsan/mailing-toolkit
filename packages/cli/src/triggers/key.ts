import keypress, { Key } from 'keypress';

class KeyTrigger {
    constructor() {
        if (!process.stdin.setRawMode) {
            throw new Error('Raw mode not supported');
        }
        keypress(process.stdin);

        process.stdin.setRawMode(true);
        process.stdin.resume();
    }

    on(event: 'keypress', cb: (key: Key, ch?: string) => Promise<void>) {
        process.stdin.on(event, async (ch, key) => {
            console.debug("keypress", key, ch);
            await cb(key, ch);
        });
    }

    close() {
    }
}

export default KeyTrigger;