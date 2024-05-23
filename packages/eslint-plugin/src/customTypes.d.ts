declare module "inline-style-parser" {
    import { Declaration as orgDeclaration } from "inline-style-parser";
    export interface Declaration extends orgDeclaration{
        property: string;
        value: string;
    }
    export default function parse(css: string): Declaration[];
}