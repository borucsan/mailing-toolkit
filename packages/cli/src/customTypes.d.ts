declare module "keypress" {
    export default function keypress(stream: NodeJS.ReadStream): void;

    export interface Key {
        name: string;
        ctrl: boolean;
        meta: boolean;
        shift: boolean;
    }
}