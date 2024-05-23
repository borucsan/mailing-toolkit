import createRuleTester from "../rule-tester";
import  rule from "../../src/rules/align";

const ruleTester = createRuleTester();

ruleTester.run("align", rule, {
    valid: [
      {
        code: `<table><tr><td align="left">Cell Valid 1</td></tr></table>`,
      },{
        code: `<table><tr><td align="right">Cell Valid 2</td></tr></table>`,
      },{
        code: `<table><tr><td align="center">Cell Valid 3</td></tr></table>`,
      },{
        code: `<table><tr><td align="justify" style="text-align: justify;">Cell Valid 4</td></tr></table>`,
      },
      {
        code: `<table><tr><td align="left">Cell Valid 5</td></tr></table>`,
        options: ["onlyTextCell"]
      },
      {
        code: `<table><tr><td><img src="test.jpg"></td></tr></table>`,
        options: ["onlyTextCell"]
      },
      {
        code: `<table><tr><td align="left">Cell Valid 6</td></tr></table>`,
        options: ["all"]
      }
    ],
    invalid: [
        {
          code: `<table><tr><td>Cell Invalid 1</td></tr></table>`,
          output:`<table><tr><td align="left">Cell Invalid 1</td></tr></table>`,
          errors: [
            {
                message: "Align attribute should be used.",
            },
          ],
        },
        {
          code: `<table><tr><td>Cell Invalid 2</td></tr></table>`,
          output:`<table><tr><td align="left">Cell Invalid 2</td></tr></table>`,
          options: ["all"],
          errors: [
            {
                message: "Align attribute should be used.",
            },
          ],
        },
        {
          code: `<table><tr><td>Cell Invalid 3</td></tr></table>`,
          output:`<table><tr><td align="left">Cell Invalid 3</td></tr></table>`,
          options: ["onlyTextCell"],
          errors: [
            {
                message: "Align attribute should be used.",
            },
          ],
        },
        {
          code: `<table><tr><td><img alt="" src="invalid.jpg"></td></tr></table>`,
          output:`<table><tr><td align="left"><img alt="" src="invalid.jpg"></td></tr></table>`,
          errors: [
            {
                message: "Align attribute should be used.",
            },
          ],
        },
        {
          code: `<table><tr><td><img alt="" src="invalid.jpg"></td></tr></table>`,
          output:`<table><tr><td align="left"><img alt="" src="invalid.jpg"></td></tr></table>`,
          options: ["all"],
          errors: [
            {
                message: "Align attribute should be used.",
            },
          ],
        },

        {
          code: `<table><tr><td align="justify">Cell Invalid</td></tr></table>`,
          output:`<table><tr><td align="justify" style="text-align: justify;">Cell Invalid</td></tr></table>`,
          errors: [
            {
                message: "If td element contains align justify, text-align style should be set to justify.",
            },
          ],
        },
        {
          code: `<table><tr><td align="justify">Cell Invalid</td></tr></table>`,
          output:`<table><tr><td align="justify" style="text-align: justify;">Cell Invalid</td></tr></table>`,
          options: ["all"],
          errors: [
            {
                message: "If td element contains align justify, text-align style should be set to justify.",
            },
          ],
        },
        {
          code: `<table><tr><td align="justify">Cell Invalid</td></tr></table>`,
          output:`<table><tr><td align="justify" style="text-align: justify;">Cell Invalid</td></tr></table>`,
          options: ["onlyTextCell"],
          errors: [
            {
                message: "If td element contains align justify, text-align style should be set to justify.",
            },
          ],
        },
    ]
});