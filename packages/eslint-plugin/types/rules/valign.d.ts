declare const _default: {
    meta: {
        type: string;
        docs: {
            description: string;
            category: string;
            recommended: boolean;
        };
        fixable: string;
        messages: {
            [x: string]: string;
        };
    };
    create(context: import("@html-eslint/eslint-plugin/lib/types").Context): {
        Tag(node: import("@html-eslint/eslint-plugin/lib/types").TagNode): void;
    };
};
export default _default;
