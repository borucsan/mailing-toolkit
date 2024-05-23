import { RuleModule } from "../models";
import { findAttr } from "../utils";

const MESSAGE_IDS = {
  NO_IMG_ALT: "noImgAlt",
};

export interface RecommendedAttr {
    tagName: string;
    attr: string;
    default: string;
    values?: string[];
    MESSAGE_ID: string;
}

const DEFAULT_RECOMMENDED_ATTRS: RecommendedAttr[] = [
  {
    tagName: "img",
    attr: "alt",
    default: "",
    MESSAGE_ID: MESSAGE_IDS.NO_IMG_ALT,
  },
];

export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce recommended attributes on the element",
      category: "Best Practice",
      recommended: true,
    },
    fixable: "code",
    messages: {
      [MESSAGE_IDS.NO_IMG_ALT]: "Img element should have alt attribute.",
    },
  },
  create(context) {
    return {
      Tag(node) {
        const recommendedAttrs = DEFAULT_RECOMMENDED_ATTRS;
        const tagName = node.name;
        const recommendedAttr = recommendedAttrs.filter(r => r.tagName === tagName);
        if (!recommendedAttr || !recommendedAttr.length) {
          return;
        }
        recommendedAttr.forEach(r => {
            const attr = findAttr(node, r.attr);
            if (!attr) {
              context.report({
                node: node,
                messageId: r.MESSAGE_ID,
                fix(fixer) {
                  return fixer.insertTextBefore(
                    node.openEnd,
                    ` ${r.attr}="${r.default}"`
                  );
                },
              });
            } else if (attr && r.values && r.values.length) {
              const value = attr.value?.value || "";
              if (!r.values.includes(value)) {
                context.report({
                  node: attr,
                  messageId: r.MESSAGE_ID,
                });
              }
            }
        });
        
      },
    };
  },
} satisfies RuleModule;
