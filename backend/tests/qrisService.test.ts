import { describe, it, expect } from 'vitest';
import {
  QrisService,
  calculateCrc16CcittFalse,
  parseTLV,
} from '../src/services/qrisService.js';

describe('QRIS Service & EMVCo TLV Engine', () => {
  // Standard valid Indonesian QRIS test payload
  const samplePayload =
    '00020101021126580014ID.LINKAJA.WWW01189360091430000000000208123456780303UMI51440014ID.DANA.WWW01189360091530000000000208123456780303UMI5204581253033605802ID5916DIZZ BAKED GOODS6007JAKARTA61051234062070703A0163044F2A';

  it('correctly calculates CRC-16/CCITT-FALSE checksum', () => {
    // "123456789" with standard CRC-16 CCITT False yields 0x29B1
    const testData = '123456789';
    const crc = calculateCrc16CcittFalse(testData);
    expect(crc).toBe('29B1');
  });

  it('validates a correct static QRIS payload on initialization', () => {
    expect(() => new QrisService(samplePayload)).not.toThrow();
  });

  it('parses TLV tags accurately from raw string', () => {
    const tags = parseTLV(samplePayload);
    const tagMap = new Map(tags.map((t) => [t.tag, t.value]));

    expect(tagMap.get('00')).toBe('01');
    expect(tagMap.get('01')).toBe('11'); // Static
    expect(tagMap.get('53')).toBe('360'); // IDR
    expect(tagMap.get('58')).toBe('ID'); // Indonesia
    expect(tagMap.get('59')).toBe('DIZZ BAKED GOODS');
  });

  it('mutates Static (010211) to Dynamic (010212) and injects exact Tag 54 amount', () => {
    const service = new QrisService(samplePayload);
    const amount = 85024;
    const dynamicQris = service.generateDynamicQris(amount);

    const tags = parseTLV(dynamicQris);
    const tagMap = new Map(tags.map((t) => [t.tag, t.value]));

    // Tag 01 must be 12 (Dynamic)
    expect(tagMap.get('01')).toBe('12');

    // Tag 54 must be exact amount string
    expect(tagMap.get('54')).toBe('85024');

    // Checksum must be mathematically valid
    const payloadWithoutCrc = dynamicQris.substring(0, dynamicQris.length - 4);
    const expectedCrc = calculateCrc16CcittFalse(payloadWithoutCrc);
    expect(tagMap.get('63')).toBe(expectedCrc);
  });

  it('rejects invalid, negative, or zero amounts', () => {
    const service = new QrisService(samplePayload);
    expect(() => service.generateDynamicQris(0)).toThrow();
    expect(() => service.generateDynamicQris(-5000)).toThrow();
    expect(() => service.generateDynamicQris(12.34)).toThrow();
  });
});
