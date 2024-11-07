
import { RuleModule } from "../../models";
import { encode, regexBmpWhitelist } from "../../utils/encoder";
const MESSAGE_IDS = {
  NO_ENCODED_HTML_ENTITY: "noEncodedHtmlEntity",
};
const matchRegex = new RegExp(regexBmpWhitelist);

export default {
  meta: {
    type: "problem",
    docs: {
      description: "",
      recommended: true,
    },
    fixable: "code",
    messages: {
      [MESSAGE_IDS.NO_ENCODED_HTML_ENTITY]: "Text has unencoded HTML entities",
    },
  },
  create(context) {
    return {
      Text(node) {
            if(matchRegex.test(node.value) || /\&(?!.+;)/.test(node.value)) {
                context.report({
                    node,
                    messageId: MESSAGE_IDS.NO_ENCODED_HTML_ENTITY,
                    fix(fixer) {
                      const text = encode(node.value);
                      return fixer.replaceText(node, text);
                    }
                });
            }
      },
    };
  },
} satisfies RuleModule;
