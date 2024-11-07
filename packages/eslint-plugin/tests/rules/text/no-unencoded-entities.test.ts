import createRuleTester from "../../rule-tester";
import rule from "../../../src/rules/text/no-unencoded-entities";

const ruleTester = createRuleTester();

ruleTester.run("htmlEntities", rule, {
    valid: [
      {
        code: `<table><tr><td align="left">Lorem ipsum</td></tr></table>`,
      },
      {
        code: `<table><tr><td align="left">Weź waść pchłę w dłoń... Zażółć gęślą jaźń</td></tr></table>`,
      }
    ],
    invalid: [
        {
          code: `<table><tr><td align="left">Lorem ipsum ©</td></tr></table>`,
          output:`<table><tr><td align="left">Lorem ipsum &copy;</td></tr></table>`,
          errors: [
            {
                message: "Text has unencoded HTML entities",
            },
          ],
        },
        {
          code: `<table><tr><td align="left">Lorem ipsum &</td></tr></table>`,
          output:`<table><tr><td align="left">Lorem ipsum &amp;</td></tr></table>`,
          errors: [
            {
                message: "Text has unencoded HTML entities",
            },
          ],
        },
        {
          code: `<table><tr><td align="left">Weź waść pchłę w dłoń... Zażółć gęślą jaźń 😀</td></tr></table>`,
          output:`<table><tr><td align="left">Weź waść pchłę w dłoń... Zażółć gęślą jaźń &#x1F600;</td></tr></table>`,
          errors: [
            {
                message: "Text has unencoded HTML entities",
            },
          ],
        },
    ]
});