import axios from "axios";
import ProjectConfig from "../config/index.js";
import { Payload, Processor } from "../pipeline/index.js";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import { Address } from "nodemailer/lib/mailer/index.js";

export const SARE_API_BASE_URL = "https://s.enewsletter.pl/api/v1/";

interface Prop {
  prop1?: string
  prop2?: string
  prop3?: string
  prop4?: string
  prop5?: string
  prop6?: string
  prop7?: string
  prop8?: string
  prop9?: string
}

export interface EmailData {
  email: string
  subject: string
  from: string
  campaign?: string
  newsletter?: number
  encoding?: 'UTF-8' | 'ISO-8859-2'
  replyto?: string
  use_name?: boolean
  format?: 'txt' | 'html' | 'txt,html'
  format_txt?: 'txt' | 'html,txt'
  attached_images?: boolean
  trace_txt_clicks?: boolean
  smime?: boolean
  preheader?: string
  html?: string
  txt?: string
  only_confirmed?: boolean
  prop?: Prop
  prop_cust?: Record<string, unknown> // Using Record for an object with any key.
  UUID?: string
  attachments?: Array<[string, string]> // Assuming the pair of [filename, base64content]
  cc?: string[]
  bcc?: string[]
}

export type SareSendMailTransactionalRequest = EmailData[];

const readFileAsync = promisify(fs.readFile);

export class SareApiSendMailProcessor implements Processor {
  private uri = "/send/mail/transactional";
  async process(payload: Payload) {
    const config = payload.getConfig() as ProjectConfig;
    const to = payload.get<string[] | Address[] | string | Address>("to");
    const from = payload.get<string | Address>("from");
    const subject = payload.get<string>("subject");
    const uid = config.get<string>("send.sare.uid");
    const apiKey = config.get<string>("send.sare.apiKey");
    const newslettersIds = payload.get<string[]>("newsletters");
    const url = `${SARE_API_BASE_URL}${uid}${this.uri}`;
    const newsletters: SareSendMailTransactionalRequest = newslettersIds.map((id) => {
      const newsletter: Partial<EmailData> = {
        from: typeof from === "string" ? from : from?.address,
        subject,
        newsletter: parseInt(id),
      };

      if (Array.isArray(to)) {
        const email = to.shift();
        newsletter.email = (typeof email === "string" ? email : email?.address) as string;
        newsletter.cc = to.map((to) => typeof to === "string" ? to : to?.address);
      } else {
        newsletter.email = (typeof to === "string" ? to : to?.address) as string;
      }


      return newsletter as EmailData;
    });

    try {
      const response = await axios.post(url, newsletters, {
        headers: {
          "Content-Type": "application/json",
          apiKey
        },
      });
      console.debug(response.data.response);
      return { ok: true, message: "" };
    }catch (error) {
      console.error(error);
      return { ok: false, message: `Error: ${error}` };
    }
  }
}

export class SareApiUploadNewsletterProcessor implements Processor {
  private uri = "/newsletter/import/temporary";
  async process(payload: Payload) {
    const archives = payload.get<string[]>("archives");
    const config = payload.getConfig() as ProjectConfig;
    const uid = config.get<string>("send.sare.uid");
    const apiKey = config.get<string>("send.sare.apiKey");
    const url = `${SARE_API_BASE_URL}${uid}${this.uri}`;

    const responses = await Promise.all(archives.map(async (archive) => {
      const newsletter = await readFileAsync(path.resolve(archive));
      const bodyFormData = new FormData();
      bodyFormData.append("newsletter", newsletter, path.basename(archive));
      bodyFormData.append("name", path.basename(archive));
      bodyFormData.append("description", "From CLI");
      try {
        const response = await axios.post(url, bodyFormData, {
          headers: {
            "Content-Type": "multipart/form-data" ,
            apiKey,
          },
        });
        if(response.status === 200) {
          return response.data?.response;
        } else {
          throw new Error("Invalid status code");
        }
      }catch (e) {
        const err = e as any;
        console.error("err", err.response.data);
        throw e;
      }
    }));
    payload.set("newsletters", responses);
  }
}


export class SareApiMoveNewsletterToReadyProcessor implements Processor {
  private uri = "/newsletter/set_ready/";
  async process(payload: Payload) {
    const newsletters = payload.get<string[]>("newsletters");
    const config = payload.getConfig() as ProjectConfig;
    const uid = config.get<string>("send.sare.uid");
    const apiKey = config.get<string>("send.sare.apiKey");

    const responses = await Promise.all(newsletters.map(async (newsletter) => {
      const url = `${SARE_API_BASE_URL}${uid}${this.uri}${newsletter}`;
      try {
        const response = await axios.post(url, {}, {
          headers: {
            apiKey,
          },
        });

        if(response.status === 200) {
          return response.data?.response;
        } else {
          throw new Error("Invalid status code");
        }
      } catch (e) {
        const err = e as any;
        console.error("err", err.response.data);
        return e;
      }
    }));
    console.debug(responses);
    payload.set("newsletters", responses);
  }
}