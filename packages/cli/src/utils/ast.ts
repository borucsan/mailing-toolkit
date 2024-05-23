import { NodeTypes } from "es-html-parser";
import { DocumentNode, TagNode } from "es-html-parser/dist/types";

export function findTagNodeInAST(
  ast: TagNode | DocumentNode,
  name: string
): TagNode[] {
  let tags: TagNode[] = [];
  if (ast.children) {
    tags = ast.children
      .filter((node) => node.type === NodeTypes.Tag)
      .map((node) => {
        const tag = node as TagNode;
        if (tag.name === name) {
          return node;
        }
        return findTagNodeInAST(tag, name);
      }).flat() as TagNode[];
  }
  return tags;
}
