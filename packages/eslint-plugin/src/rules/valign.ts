
import { findAttr } from "../utils/parser";
import parse from "inline-style-parser";
import { RuleModule } from "../models";

const MESSAGE_IDS = {
    NO_STYLE_VERTICAL_ALIGN: "noStyleVerticalAlign",
    NO_ATTR_VALIGN: "noAttrValign",
    ATTR_STYLE_DIFF: "attrStyleDiff",
  };

export default {
    meta: {
        type: "suggestion",
        docs: {
            description: "enforce the valign attribute on the td element",
            category: "Best Practice",
            recommended: true,
        },
        fixable: "code",
        messages: {
            [MESSAGE_IDS.NO_STYLE_VERTICAL_ALIGN]:
              "If valign attribute is used, vertical-align style should be used as well.",
            [MESSAGE_IDS.NO_ATTR_VALIGN]:
                "If vertical-align style is used, valign attribute should be used as well.",
            [MESSAGE_IDS.ATTR_STYLE_DIFF]:
                "valign attribute value and vertical-align style value should be the same.",
          },
    },
    create(context) {
        return {
            Tag(node) {
                
                if (node.name !== "td"){
                    return;
                }
                const valignAttr = findAttr(node, "valign");
                const styleAttr = findAttr(node, "style");
                const css = (styleAttr?.value?.value || "");
                const parsedCSS = parse(css);
                const cssProperty = parsedCSS.find((x) => x.property === "vertical-align")
                const attrValue = valignAttr?.value?.value;
                if(attrValue && !cssProperty?.value) {
                    context.report({
                        node: valignAttr,
                        messageId: MESSAGE_IDS.NO_STYLE_VERTICAL_ALIGN,
                        fix(fixer) {       
                            const cssProps = parsedCSS
                            .filter((x) => x.property !== "vertical-align")
                            .map((x) => `${x.property}: ${x.value};`);
                            cssProps.push(`vertical-align: ${attrValue};`);
                            const cssValue = cssProps.join(" ");

                            if (styleAttr) {
                                return fixer.replaceText(styleAttr, `style="${cssValue}"`);
                            }
                            return fixer.insertTextBefore(node.openEnd, ` style="${cssValue}"`);
                        },
                    })
                } else if(!attrValue && cssProperty?.value) {
                    context.report({
                        node,
                        messageId: MESSAGE_IDS.NO_ATTR_VALIGN,
                        fix(fixer) {
                            return fixer.insertTextAfter(node.openStart, ` valign="${cssProperty.value}"`);
                        },
                    })
                } else if(attrValue && cssProperty?.value && attrValue !== cssProperty.value) {
                    context.report({
                        node: valignAttr,
                        messageId: MESSAGE_IDS.ATTR_STYLE_DIFF,
                    })
                }
            }
        }
    }
} satisfies RuleModule;