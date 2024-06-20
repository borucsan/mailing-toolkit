import parse from "inline-style-parser";
import { findAttr } from "../utils/parser";
import { RuleModule } from "../models";

const MESSAGE_IDS = {
  NO_ATTR_ALIGN: "noAttrAlign",
  NO_STYLE_TEXT_ALIGN_JUSTIFY: "noStyleTextAlignJustify",
};

export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce recommended align attribute on td element",
      category: "Best Practice",
      recommended: true,
    },
    schema: [
      {
        enum: ["all", "onlyTextCell"],
      },
    ],
    fixable: "code",
    messages: {
      [MESSAGE_IDS.NO_ATTR_ALIGN]: "Align attribute should be used.",
      [MESSAGE_IDS.NO_STYLE_TEXT_ALIGN_JUSTIFY]:
        "If td element contains align justify, text-align style should be set to justify.",
    },
  },
  create(context) {
    return {
      Tag(node) {
        if (node.name !== "td") {
          return;
        }
        const alignAttr = findAttr(node, "align");
        const option = context.options[0] || "all";
        const text = node.children.filter((x) => x.type === "Text");
        if (option === "onlyTextCell" && !text.length) {
          return;
        }
        if (!alignAttr) {
          context.report({
            node: node,
            messageId: MESSAGE_IDS.NO_ATTR_ALIGN,
            fix(fixer) {
              return fixer.insertTextAfter(node.openStart, ` align="left"`);
            },
          });
        } else if (alignAttr?.value?.value === "justify") {
          const styleAttr = findAttr(node, "style");
          const css = styleAttr?.value?.value || "";
          const parsedCSS = parse(css);
          const cssProperty = parsedCSS.find(
            (x) => x.property === "text-align"
          );
          if(!cssProperty?.value || cssProperty?.value !== "justify") {
            context.report({
              node: styleAttr ?? alignAttr,
              messageId: MESSAGE_IDS.NO_STYLE_TEXT_ALIGN_JUSTIFY,
              fix(fixer) {
                const cssProps = parsedCSS
                  .filter((x) => x.property !== "text-align")
                  .map((x) => `${x.property}: ${x.value};`);
                cssProps.push(`text-align: justify;`);
                const cssValue = cssProps.join(" ");
                if (styleAttr) {
                  return fixer.replaceText(styleAttr, `style="${cssValue}"`);
                }
                return fixer.insertTextBefore(node.openEnd, ` style="${cssValue}"`);
              },
            });
          }
        }
      },
    };
  },
} satisfies RuleModule;
