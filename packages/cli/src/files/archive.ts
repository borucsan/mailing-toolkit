import { Payload, Processor } from "../pipeline/index.js";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import prompt from "prompt";
import {nanoid} from "nanoid";

export class ArchiveMailProcessor implements Processor {
  async process(payload: Payload) {
    const files = payload.get<string[]>("files");
    const archiveNameRegex = payload.getConfig()?.get<string>("archive.archiveNameRegex");
    const archives = await Promise.all(files.map(async (file) => {
      return await this.createArchive(file, archiveNameRegex);
    }));

    payload.set("archives", archives);
  }
  private async createArchive(file: string, archiveNameRegex?: string): Promise<string> {
    let defaultName = nanoid(10);
    const htmlPath = path.resolve(process.cwd(), file);
    if (archiveNameRegex) {
      const regex = new RegExp(archiveNameRegex);
      console.debug("Using regex", regex, htmlPath.match(regex));
      defaultName = htmlPath.match(regex)?.[0].replaceAll('/', '') ?? defaultName;
    }
    let fileName = defaultName;
    try {
      fileName = await new Promise((resolve) => {
        prompt.start();
        prompt.get([{
          name: 'name',
          default: defaultName.replace(/[^a-zA-Z0-9\-]/g, "_"),
          pattern: /^[a-zA-Z0-9\s\-]+$/,
          description: 'File name:',
          required: true
        }], (err, result) => {
          if (err) {
            throw err;
          }
          resolve(result.name.toString());
        });
      });
    } catch (e: any) {
      console.warn("Error", e.message);
      fileName = defaultName;
    }
    fileName = fileName.replace(/\s/g, "_");
    const dirName = path.dirname(htmlPath);
    const zipFile = `${dirName}/${fileName}.zip`;

    const output = fs.createWriteStream(zipFile);
    const archive = archiver('zip', {
      zlib: { level: 6 } // Sets the compression level.
    });

    archive.on('warning', function (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    });
    archive.on('error', function (err) {
      throw err;
    });
    archive.pipe(output);

    archive.append(fs.createReadStream(file), { name: 'index.html' });
    const txtPath = file.replace(/\.[^.]+$/, ".txt");
    if (fs.existsSync(txtPath)) {
      archive.append(fs.createReadStream(txtPath), { name: 'index.txt' });
    }
    if (fs.existsSync(dirName + '/images')) {
      archive.directory(dirName + '/images', 'images');
    }
    await archive.finalize();
    console.debug(`Created archive ${zipFile} for`, file);
    return zipFile;
  }
}