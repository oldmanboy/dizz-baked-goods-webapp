import QRCode from 'qrcode';

export interface TLVTag {
  tag: string;
  length: number;
  value: string;
}

/**
 * Calculates the EMVCo CRC-16/CCITT-FALSE checksum.
 * Polynomial: 0x1021, Initial value: 0xFFFF, Final XOR: 0x0000, Non-reflected.
 */
export function calculateCrc16CcittFalse(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Parses top-level TLV tags from an EMVCo QRIS string.
 */
export function parseTLV(raw: string): TLVTag[] {
  const tags: TLVTag[] = [];
  let index = 0;

  while (index < raw.length) {
    if (index + 4 > raw.length) {
      throw new Error(`Malformed QRIS: Incomplete TLV header at position ${index}`);
    }
    const tag = raw.substring(index, index + 2);
    const lengthStr = raw.substring(index + 2, index + 4);
    const length = parseInt(lengthStr, 10);

    if (isNaN(length) || length < 0) {
      throw new Error(`Malformed QRIS: Invalid length "${lengthStr}" for Tag ${tag}`);
    }

    const valueStart = index + 4;
    const valueEnd = valueStart + length;

    if (valueEnd > raw.length) {
      throw new Error(
        `Malformed QRIS: Value length ${length} overflows remaining payload for Tag ${tag}`
      );
    }

    const value = raw.substring(valueStart, valueEnd);
    tags.push({ tag, length, value });
    index = valueEnd;
  }

  return tags;
}

/**
 * Formats a single TLV tag string: TTLLVVV...
 */
export function formatTLVTag(tag: string, value: string): string {
  const lengthStr = value.length.toString().padStart(2, '0');
  return `${tag}${lengthStr}${value}`;
}

export class QrisService {
  private basePayload: string;

  constructor(basePayload: string) {
    this.basePayload = basePayload.trim();
    this.validateBasePayload();
  }

  /**
   * Validates the base static QRIS on startup:
   * Verifies Tag 00=01, Tag 53=360 (IDR), Tag 58=ID, and CRC16 checksum.
   */
  public validateBasePayload(): void {
    const tags = parseTLV(this.basePayload);
    const tagMap = new Map(tags.map((t) => [t.tag, t.value]));

    if (tagMap.get('00') !== '01') {
      throw new Error('Invalid Static QRIS: Tag 00 must be "01" (Payload Format Indicator)');
    }
    if (tagMap.get('53') !== '360') {
      throw new Error('Invalid Static QRIS: Tag 53 must be "360" (Indonesian Rupiah)');
    }
    if (tagMap.get('58') !== 'ID') {
      throw new Error('Invalid Static QRIS: Tag 58 must be "ID" (Country Code)');
    }

    // Verify existing Tag 63 checksum
    const crcTag = tagMap.get('63');
    if (!crcTag) {
      throw new Error('Invalid Static QRIS: Missing Tag 63 CRC checksum');
    }

    const payloadWithoutCrc = this.basePayload.substring(0, this.basePayload.length - 4);
    const expectedCrc = calculateCrc16CcittFalse(payloadWithoutCrc);
    if (crcTag.toUpperCase() !== expectedCrc.toUpperCase()) {
      throw new Error(
        `Static QRIS CRC Checksum mismatch: Expected ${expectedCrc}, got ${crcTag}`
      );
    }
  }

  /**
   * Converts static QRIS to dynamic QRIS with exact Rupiah amount.
   * - Mutates Tag 01 from "11" (Static) to "12" (Dynamic)
   * - Injects/Replaces Tag 54 with amount in Rupiah
   * - Strips Tag 55-57 (Tip / Convenience Fee)
   * - Preserves Tag 62 (Additional Data) untouched
   * - Re-computes Tag 63 CRC-16
   */
  public generateDynamicQris(amount: number): string {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error(`Invalid QRIS amount: ${amount}. Must be a positive integer.`);
    }

    const tags = parseTLV(this.basePayload);
    const amountStr = amount.toString();
    const mutatedTags: TLVTag[] = [];

    // Tags 55, 56, 57 are tip tags to strip
    const stripTags = new Set(['55', '56', '57', '63']);
    let tag54Inserted = false;

    for (const t of tags) {
      if (stripTags.has(t.tag)) {
        continue;
      }

      if (t.tag === '01') {
        // Mutate Point of Initiation Method: 11 (Static) -> 12 (Dynamic)
        mutatedTags.push({ tag: '01', length: 2, value: '12' });
        continue;
      }

      if (t.tag === '54') {
        // Replace existing Tag 54
        mutatedTags.push({ tag: '54', length: amountStr.length, value: amountStr });
        tag54Inserted = true;
        continue;
      }

      // If we encounter tag after 53 and haven't inserted tag 54 yet, insert it right after 53
      if (t.tag > '53' && !tag54Inserted) {
        mutatedTags.push({ tag: '54', length: amountStr.length, value: amountStr });
        tag54Inserted = true;
      }

      mutatedTags.push(t);
    }

    if (!tag54Inserted) {
      mutatedTags.push({ tag: '54', length: amountStr.length, value: amountStr });
    }

    // Assemble payload without CRC
    let rawPayload = mutatedTags.map((t) => formatTLVTag(t.tag, t.value)).join('');
    rawPayload += '6304';

    // Compute and append CRC16
    const crc = calculateCrc16CcittFalse(rawPayload);
    return `${rawPayload}${crc}`;
  }

  /**
   * Generates a high-contrast PNG Data URL for rendering and download in browser or mobile.
   */
  public async generateQrDataUrl(qrisPayload: string): Promise<string> {
    return QRCode.toDataURL(qrisPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 400,
      color: {
        dark: '#1C1917', // Dark charcoal
        light: '#FFFFFF', // Pure white
      },
    });
  }
}
