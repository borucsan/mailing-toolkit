import nodemailer, { SendMailOptions, Transporter } from "nodemailer";
import ProjectConfig from '../config/index.js';
import Pipeline, { InputFilesProcessor, Payload } from '../pipeline/index.js';
import { MailerTransporterProcessor, PrepareMailerProcessor } from "./index.js";
import { SendEngine } from "../consts.js";
import { ArchiveMailProcessor } from "../files/archive.js";
import { SareApiMoveNewsletterToReadyProcessor, SareApiSendMailProcessor, SareApiUploadNewsletterProcessor } from "./sare.js";

export interface SenderEngine {
    sendMail(options: SendMailOptions[]): Promise<{ ok: boolean, message: string }>;
}

export class SenderEnginePipelineFactory {
  static get(engine: SendEngine, config: ProjectConfig): Pipeline {
    switch (engine) {
      case SendEngine.Maildev:
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        return Pipeline.create()
          .add(new InputFilesProcessor())
          .add(new PrepareMailerProcessor())
          .add(new MailerTransporterProcessor(nodemailer.createTransport({
            port: config.get<number | undefined>("maildev.port") ?? 1025,
          })));
      case SendEngine.Gmail:
        return Pipeline.create()
          .add(new InputFilesProcessor())
          .add(new PrepareMailerProcessor())
          .add(new MailerTransporterProcessor(nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: config.get<string>("send.gmail.user"),
              pass: config.get<string>("send.gmail.pass"),
            },
          })));
      case SendEngine.SARE:
        return Pipeline.create()
          .add(new InputFilesProcessor())
          .add(new ArchiveMailProcessor())
          .add(new SareApiUploadNewsletterProcessor())
          .add(new SareApiMoveNewsletterToReadyProcessor())
          .add(new SareApiSendMailProcessor());
      default:
        throw new Error(`Engine ${engine} not found`);
    }
  }
}

export class MaildevSenderEngine implements SenderEngine {

  private transporter: Transporter;

  constructor(payload: Payload) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const config = payload.getConfig() as ProjectConfig;
    this.transporter = nodemailer.createTransport({
      port: config.get<number | undefined>("maildev.port") ?? 1025,
    });
  }

  async sendMail(options: SendMailOptions[]) {
    Promise.all(options.map((option) => {
      const r = this.transporter.sendMail(option);
      console.debug(`Mail sent to ${option.to}`, r);
      return r;
    }));
    return { ok: true, message: "" };
  }
}

/* export class SARESenderEngine implements SenderEngine {
  

  constructor(payload: Payload) {
    
    ");
  }
  async sendMail(options: SendMailOptions[]) {
    const url = `${this.baseUrl}${this.uid}${this.sendUri}`;
    const newsletters: SareSendMailTransactionalRequest = options.map((option) => {
      const newsletter: Partial<EmailData> = {
        from: this.overwriteFrom ? typeof option.from === "string" ? option.from : option.from?.address : undefined,
        subject: option.subject,
        html: typeof option.html === "string" ? option.html : option.html?.toString(),
        txt: typeof option.text === "string" ? option.text : option.text?.toString(),
        attached_images: true,
        attachments: option.attachments?.map(a => [a.cid as string, a.content?.toString('base64') as string]) ?? [],
      };

      if (Array.isArray(option.to)) {
        const email = option.to.shift();
        newsletter.email = (typeof email === "string" ? email : email?.address) as string;
        newsletter.cc = option.to.map((to) => typeof to === "string" ? to : to?.address);
      } else {
        newsletter.email = (typeof option.to === "string" ? option.to : option.to?.address) as string;
      }


      return newsletter as EmailData;
    });

    try {
      console.debug(url);
      const response = await axios.post(url, newsletters, {
        headers: {
          "Content-Type": "application/json",
          "apiKey": this.apiKey,
        },
      });
      console.debug(response);
      return { ok: true, message: "" };
    }catch (error) {
      console.error(error);
      return { ok: false, message: `Error: ${error}` };
    }
    
  }
} */