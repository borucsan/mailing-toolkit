import createRuleTester from "../../rule-tester";
import rule from "../../../src/rules/text/no-number-orphans";

const ruleTester = createRuleTester();

ruleTester.run("no-number-orphans", rule, {
    valid: [
      {
        code: `<table><tr><td align="left">kapitał zakładowy w wysokości 147&nbsp;799&nbsp;870&nbsp;zł w całości wpłacony.</td></tr></table>`,
      }
    ],
    invalid: [
        {
          code: `<table><tr><td align="left">zakładowy w wysokości 147 799 870 zł w całości wpłacony</td></tr></table>`,
          output:`<table><tr><td align="left">zakładowy w wysokości 147&nbsp;799&nbsp;870 zł w całości wpłacony</td></tr></table>`,
          errors: [
            {
                message: "Text has number orphans",
            },
          ],
        },
    ]
});