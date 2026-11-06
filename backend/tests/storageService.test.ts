import { describe, it, expect } from 'vitest';
import { sanitizeForSpreadsheet } from '../src/schemas/orderSchemas.js';

describe('Storage Service & Formula Injection Sanitizer', () => {
  it('escapes dangerous spreadsheet formula prefixes with a single quote', () => {
    expect(sanitizeForSpreadsheet('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(sanitizeForSpreadsheet('+cmd|/c calc')).toBe("'+cmd|/c calc");
    expect(sanitizeForSpreadsheet('-10+20')).toBe("'-10+20");
    expect(sanitizeForSpreadsheet('@HYPERLINK("evil.com")')).toBe("'@HYPERLINK(\"evil.com\")");
    expect(sanitizeForSpreadsheet('\tTabExploit')).toBe("'\tTabExploit");
    expect(sanitizeForSpreadsheet('\rReturnExploit')).toBe("'\rReturnExploit");
  });

  it('leaves safe bakery customer strings untouched', () => {
    expect(sanitizeForSpreadsheet('Siti Nurhaliza')).toBe('Siti Nurhaliza');
    expect(sanitizeForSpreadsheet('Jl. Senopati No. 12, Jakarta Selatan')).toBe(
      'Jl. Senopati No. 12, Jakarta Selatan'
    );
    expect(sanitizeForSpreadsheet('Tolong potong rotinya jadi 10 slice')).toBe(
      'Tolong potong rotinya jadi 10 slice'
    );
  });

  it('handles null, undefined, or empty strings gracefully', () => {
    expect(sanitizeForSpreadsheet('')).toBe('');
    expect(sanitizeForSpreadsheet(null)).toBe('');
    expect(sanitizeForSpreadsheet(undefined)).toBe('');
  });
});
