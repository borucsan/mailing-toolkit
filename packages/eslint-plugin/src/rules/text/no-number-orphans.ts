
import { RuleModule } from "../../models";
const MESSAGE_IDS = {
  ORPHANS_DETECTED: "orphansDetected",
};

const regex = new RegExp(/(\d)\s(\d)/g);

export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "",
      recommended: true,
    },
    fixable: "code",
    messages: {
      [MESSAGE_IDS.ORPHANS_DETECTED]: "Text has number orphans",
    },
  },
  create(context) {
    return {
      Text(node) {
            if(regex.test(node.value)) {
                context.report({
                    node,
                    messageId: MESSAGE_IDS.ORPHANS_DETECTED,
                    fix(fixer) {
                      const text = node.value.replace(regex, "$1&nbsp;$2");
                      return fixer.replaceText(node, text);
                    }
                });
            }
      },
    };
  },
} satisfies RuleModule;
