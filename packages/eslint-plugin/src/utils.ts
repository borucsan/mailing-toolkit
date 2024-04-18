import * as ESHtml from "es-html-parser";

export function findAttr(node: ESHtml.TagNode, attrName: string) {
    return node.attributes.find(
      (attr) => attr.key && attr.key.value.toLowerCase() === attrName.toLowerCase()
    );
  };