import createRuleTester from "../rule-tester";
import  rule from "../../src/rules/valign";

const ruleTester = createRuleTester();

ruleTester.run("valign", rule, {
    valid: [
      {
        code: `<table><tr><td valign="top" style="vertical-align:top;">Cell Valid 1</td></tr></table>`,
      },
    ],
    invalid: [
        {
          code: `<table><tr><td valign="top">Cell Invalid</td></tr></table>`,
          output:`<table><tr><td valign="top" style="vertical-align: top;">Cell Invalid</td></tr></table>`,
          errors: [
            {
                message: "If valign attribute is used, vertical-align style should be used as well.",
            },
          ],
        },
        {
          code: `<table><tr><td valign="top" style="padding-top: 20px;">Cell Invalid 2</td></tr></table>`,
          output:`<table><tr><td valign="top" style="padding-top: 20px; vertical-align: top;">Cell Invalid 2</td></tr></table>`,
          errors: [
            {
                message: "If valign attribute is used, vertical-align style should be used as well.",
            },
          ],
        },
        {
          code: `<table><tr><td style="padding-top: 20px; vertical-align: top;">Cell Invalid 3</td></tr></table>`,
          output:`<table><tr><td valign="top" style="padding-top: 20px; vertical-align: top;">Cell Invalid 3</td></tr></table>`,
          errors: [
            {
                message: "If vertical-align style is used, valign attribute should be used as well.",
            },
          ],
        },
        {
          code: `<table><tr><td valign="middle" style="padding-top: 20px; vertical-align: top;">Cell Invalid 3</td></tr></table>`,
          errors: [
            {
                message: "valign attribute value and vertical-align style value should be the same.",
            },
          ],
        },
    ]
});