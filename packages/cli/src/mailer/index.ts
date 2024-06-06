import nodemailer from 'nodemailer';

import { Payload, Processor } from '../pipeline/index.js';
import { promisify } from 'util';
import fs from 'fs';
import { parse } from 'es-html-parser';
import { findTagNodeInAST } from '../utils/ast.js';
import path from 'path';

const readFileAsync = promisify(fs.readFile);

export class MailerTransporterProcessor implements Processor {
  private transporter: nodemailer.Transporter;
  constructor(transporter: nodemailer.Transporter) {
    this.transporter = transporter;
  }
  async sendMail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    await this.transporter.sendMail(mailOptions);
  }

  async process(payload: Payload) {
    const mailOptions = payload.get('mailer.emails') as nodemailer.SendMailOptions[];
    const senders = mailOptions.map((mailOption) => this.transporter.sendMail(mailOption));
    return Promise.all(senders);
  }
}

export class PrepareMailerProcessor implements Processor {
  async process(payload: Payload) {
    const files = payload.get('files') as string[];
    const htmlTemplates = await Promise.all(files.map((file) => {
      const txtPath = file.replace(/\.[^.]+$/, '.txt');
      return Promise.all([
        readFileAsync(file, 'utf-8'), readFileAsync(txtPath, 'utf-8').catch(() => undefined)]).then(([html, txt]) => ({file, html, txt}));
    }));
    const data = htmlTemplates.map(({file, html, txt}) => {
      const {ast} = parse(html);
      const tags = findTagNodeInAST(ast, 'img');
      const imagesData: {src: string, cid: string, img?: Buffer}[] = (tags.map((tag) => {
        return tag.attributes.find((attr) => attr.key.value === 'src')?.value?.value;
      })
        .filter(src => src) as string[])
        .map((src) => ({src, cid: src.replace(/\W/g, "_")}));
      let formattedHtml = html;
      imagesData.forEach((img) => formattedHtml = formattedHtml.replace(new RegExp(img.src, "g"), `cid:${img.cid}`));
      return {html: formattedHtml, imagesData, file, txt};
    });
    const promises: Promise<unknown>[] = [];
    data.forEach(({imagesData, file}) => {
      imagesData.forEach((img) => {
        promises.push(readFileAsync(path.resolve(path.dirname(file), img.src)).then((data) => img.img = data));
      });
    });
    await Promise.all(promises);
    const to = payload.get('to') as string[];
    const from = payload.get('from') as string;
    const subject = payload.get('subject') as string;

    payload.set('mailer.emails', data.map(({html, imagesData, txt}) => ({
      from,
      to,
      subject,
      html,
      txt,
      attachments: imagesData.map(img => ({
        filename: img.src,
        content: img.img,
        encoding: 'base64',
        cid: img.cid,
      })),
    } as nodemailer.SendMailOptions)));
  }
}

export class MailingTxtVersionProcessor implements Processor {
  async process(payload: Payload) {
    const files = payload.get('files') as string[];
    await Promise.all(files.map((file) => {
      return readFileAsync(file, 'utf-8').then((content) => ({file, content}));
    }));
  }
}