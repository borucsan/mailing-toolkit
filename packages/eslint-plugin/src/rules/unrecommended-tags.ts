import { RuleModule } from "../models";

const MESSAGE_IDS = {
  NO_P_TAG: "noPtag",
};

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Suggestions for best practices to avoid incompatible tags.",
      category: "Best Practice",
      recommended: true,
    },
    messages: {
      [MESSAGE_IDS.NO_P_TAG]:
        "Should not use <p> tag. Gmail adds margins to <p> tags.",
    },
  },
  create(context) {
    return {
      Tag(node) {
        if (node.name === "p") {
          context.report({
            node: node,
            messageId: MESSAGE_IDS.NO_P_TAG,
          });
        }
      },
    };
  },
} satisfies RuleModule;
