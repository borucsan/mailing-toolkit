import createRuleTester from "../rule-tester";
import  rule from "../../src/rules/recommended-attr";

const ruleTester = createRuleTester();

ruleTester.run("recommended-attr", rule, {
    valid: [
      {
        code: `<table><tr><td align="left"><img alt="" src="test.jpg"></td></tr></table>`,
      },
      {
        code: `<table><tr><td align="left"><img alt="Test 2 img" src="test2.jpg"></td></tr></table>`,
      },
    ],
    invalid: [
        {
          code: `<table><tr><td align="left"><img src="test2.jpg"></td></tr></table>`,
          output:`<table><tr><td align="left"><img src="test2.jpg" alt=""></td></tr></table>`,
          errors: [
            {
                message: "Img element should have alt attribute.",
            },
          ],
        },
    ]
});