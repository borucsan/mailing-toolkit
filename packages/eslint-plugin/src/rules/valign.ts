
import { findAttr } from "../utils";
import { Rule } from "eslint";

const MESSAGE_IDS = {
    NO_STYLE_VERTICAL_ALIGN: "noStyleVerticalAlign",
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
                if(valignAttr?.value && !styleAttr?.value?.value?.includes("vertical-align")){
                    context.report({
                        node: valignAttr,
                        messageId: MESSAGE_IDS.NO_STYLE_VERTICAL_ALIGN,
                        fix(fixer) {
                            const css = (styleAttr?.value?.value || "").split(";").filter(function(x){
                                return (x !== (undefined || ''));
                              });
                            css.push("vertical-align:" + valignAttr?.value?.value + ";");                           
                            const cssValue = css.join("; ");
                            if (styleAttr) {
                                return fixer.replaceText(styleAttr, `style="${cssValue}"`);
                            }
                            return fixer.insertTextBefore(node.openEnd, ` style="${cssValue}"`);
                        },
                    })
                    
                }
            }
        }
    }
} satisfies Rule.RuleModule