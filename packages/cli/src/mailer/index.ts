import nodemailer, { Transporter } from "nodemailer";
import { Payload, Processor } from "../pipeline/index.js";
import { promisify } from "util";
import fs from "fs";
import { parse } from "es-html-parser";
import { findTagNodeInAST } from "../utils/ast.js";
import path from "path";
import { convert } from "html-to-text";
import { formatImageAlt, formatListSection } from "./text-formaters.js";
import { diffChars } from "diff";
import "colors";

const readFileAsync = promisify(fs.readFile);

export class MailerTransporterProcessor implements Processor {
  private transporter?: nodemailer.Transporter;
  constructor(transporter?: nodemailer.Transporter) {
    this.transporter = transporter;
  }

  async process(payload: Payload) {
    const mailOptions = payload.get(
      "mailer.emails"
    ) as nodemailer.SendMailOptions[];
    const transporter =
      (payload.get("mailer.transporter") as Transporter) ?? this.transporter;
    if (!transporter) {
      throw new Error(`Transporter not found`);
    }
    const senders = mailOptions.map((mailOption) =>
      transporter.sendMail(mailOption)
    );
    return Promise.all(senders);
  }
}

export class PrepareMailerProcessor implements Processor {
  async process(payload: Payload) {
    const files = payload.get("files") as string[];
    const htmlTemplates = await Promise.all(
      files.map((file) => {
        const txtPath = file.replace(/\.[^.]+$/, ".txt");
        return Promise.all([
          readFileAsync(file, "utf-8"),
          readFileAsync(txtPath, "utf-8").catch(() => undefined),
        ]).then(([html, txt]) => ({ file, html, txt }));
      })
    );
    const data = htmlTemplates.map(({ file, html, txt }) => {
      const { ast } = parse(html);
      const tags = findTagNodeInAST(ast, "img");
      const imagesData: { src: string; cid: string; img?: Buffer }[] = (
        tags
          .map((tag) => {
            return tag.attributes.find((attr) => attr.key.value === "src")
              ?.value?.value;
          })
          .filter((src) => src) as string[]
      ).map((src) => ({ src, cid: src.replace(/\W/g, "_") }));
      let formattedHtml = html;
      imagesData.forEach(
        (img) =>
          (formattedHtml = formattedHtml.replace(
            new RegExp(img.src, "g"),
            `cid:${img.cid}`
          ))
      );
      return { html: formattedHtml, imagesData, file, txt };
    });
    const promises: Promise<unknown>[] = [];
    data.forEach(({ imagesData, file }) => {
      imagesData.forEach((img) => {
        promises.push(
          readFileAsync(path.resolve(path.dirname(file), img.src)).then(
            (data) => (img.img = data)
          )
        );
      });
    });
    await Promise.all(promises);
    const to = payload.get("to") as string[];
    const from = payload.get("from") as string;
    const subject = payload.get("subject") as string;

    payload.set(
      "mailer.emails",
      data.map(
        ({ html, imagesData, txt }) =>
          ({
            from,
            to,
            subject,
            html,
            txt,
            attachments: imagesData.map((img) => ({
              filename: img.src,
              content: img.img,
              encoding: "base64",
              cid: img.cid,
            })),
          }) as nodemailer.SendMailOptions
      )
    );
  }
}

export class MailingTxtVersionProcessor implements Processor {
  async process(payload: Payload) {
    const files = payload.get("files") as string[];
    const showDiff = payload.get<boolean>("showDiff") ?? false;
    await Promise.all(
      files.map(async (file) => {
        const content = await readFileAsync(file, "utf-8");
        const textVersion = convert(content, {
          formatters: { formatImageAlt, formatListSection },
          selectors: [
            { selector: "a", options: { hideLinkHrefIfSameAsText: true } },
            { selector: "img", format: "formatImageAlt" },
            { selector: "[data-text-version=listSection]", format: "formatListSection" },
          ],
        });
        const txtPath = file.replace(/\.[^.]+$/, ".txt");
        if (fs.existsSync(txtPath)) {
          const textContent = await readFileAsync(txtPath, "utf-8");
          console.debug(`Comparing ${txtPath} with generated text version...`, textVersion);
          if (textContent !== textVersion && showDiff) {
            const diff = diffChars(textContent, textVersion);
            diff.forEach((part) => {
              const text = part.added
                ? part.value.bgGreen
                : part.removed
                  ? part.value.bgRed
                  : part.value;
              process.stderr.write(text);
            });
          }
        }
      })
    );
  }
}
