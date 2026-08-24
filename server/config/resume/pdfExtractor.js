import { PDFParse } from "pdf-parse";
import fs from "fs/promises";

export const extractPdfText = async (filePath) => {
  let parser;

  try {
    const pdfBuffer = await fs.readFile(filePath);

    parser = new PDFParse({
      data: pdfBuffer,
    });

    const result = await parser.getText();

    return result.text;
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};