import path from 'path';
import fs from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { ReceiptData } from '../types/domain.js';

export class ReceiptService {
  private storageDir: string;
  private receiptsDir: string;

  constructor(storageDir: string) {
    this.storageDir = storageDir;
    this.receiptsDir = path.join(this.storageDir, 'receipts');
  }

  public async init(): Promise<void> {
    await fs.mkdir(this.receiptsDir, { recursive: true });
  }

  /**
   * Validates binary magic bytes and re-encodes image to a sanitized WebP file.
   * Strips all EXIF metadata, GPS coordinates, and potential polyglot script payloads.
   */
  public async sanitizeAndSaveReceipt(
    buffer: Buffer,
    orderCode: string
  ): Promise<ReceiptData> {
    await this.init();

    // 1. Authoritative Magic Bytes Check
    const detected = await fileTypeFromBuffer(buffer);
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!detected || !validMimes.includes(detected.mime)) {
      throw new Error(
        'Security rejection: Uploaded file is not a valid JPEG, PNG, or WebP image.'
      );
    }

    // 2. Transcode through Sharp to strip metadata and enforce safe WebP format
    const sanitizedFilename = `${orderCode}_${uuidv4().substring(0, 8)}.webp`;
    const targetPath = path.join(this.receiptsDir, sanitizedFilename);

    const processedBuffer = await sharp(buffer)
      .rotate() // Auto-orient based on EXIF before stripping
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    await fs.writeFile(targetPath, processedBuffer);

    return {
      filename: sanitizedFilename,
      mimetype: 'image/webp',
      sizeBytes: processedBuffer.length,
      storedPath: path.relative(this.storageDir, targetPath),
    };
  }
}
