import nodemailer from 'nodemailer';

import { Payload, Processor } from '../pipeline';
import { promisify } from 'util';
import fs from 'fs';
import { parse } from 'es-html-parser';
import { findTagNodeInAST } from '../utils/ast';
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
        const senders = mailOptions.map( (mailOption) =>  this.transporter.sendMail(mailOption));
        return Promise.all(senders);
    }
}

export class PrepareMailerProcessor implements Processor {
    async process(payload: Payload) {
        const files = payload.get('files') as string[];
        const htmlTemplates = await Promise.all(files.map((file) => {
            return readFileAsync(file, 'utf-8').then((content) => ({file, content}));
        }));
        const data = htmlTemplates.map(({file, content}) => {
            const {ast} = parse(content);
            const tags = findTagNodeInAST(ast, 'img');
            const imagesData: {src: string, cid: string, img?: Buffer}[] = (tags.map((tag) => {
                return tag.attributes.find((attr) => attr.key.value === 'src')?.value?.value;
            })
            .filter(src => src) as string[])
            .map((src) => ({src, cid: src.replace(/\W/g, "_")}));
            let formattedHtml = content;
            imagesData.forEach( (img) => formattedHtml = formattedHtml.replace(new RegExp(img.src, "g"), `cid:${img.cid}`) )
            return {html: formattedHtml, imagesData, file}
        });
        const promises: Promise<unknown>[] = [];
        data.forEach(({imagesData, file}) => {
            imagesData.forEach((img) => {
                promises.push(readFileAsync(path.resolve(path.dirname(file), img.src)).then((data) => img.img = data));
            })
        })
        await Promise.all(promises);

        payload.set('mailer.emails', data.map(({html, imagesData}) => ({
                from: 'boruc.san@gmail.com',
                to: 'dawidkarwot@gmail.com',
                subject: 'Test NodeMailer',
                html: html,
                attachments: imagesData.map(img => ({
                    filename: img.src,
                    content: img.img,
                    encoding: 'base64',
                    cid: img.cid,
                })),
        })));
    }
}