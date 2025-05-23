import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface SaveFileOptions {
  folder: string;
  extension?: string;
  baseDir?: string;
  fileName?: string;
}

export async function saveFile(
  buffer: Buffer,
  options: SaveFileOptions,
): Promise<string> {
  const {
    folder,
    extension = "bin",
    baseDir = "./public/uploads",
    fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`,
  } = options;

  const dirPath = path.join(baseDir, folder);
  const filePath = path.join(dirPath, fileName);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, buffer);
  return `/uploads/${folder}/${fileName}`;
}

export function base64ToBuffer(base64String: string): Buffer {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}
