export interface ActiveCode {
  subtotal: number;
  code: number;
  allocatedAt: number;
  expiresAt: number;
  orderCode: string;
}

export class UniqueCodeService {
  private activeCodes: Map<string, ActiveCode> = new Map();
  private ttlMs: number;

  constructor(ttlMinutes = 30) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.activeCodes.entries()) {
      if (item.expiresAt <= now) {
        this.activeCodes.delete(key);
      }
    }
  }

  /**
   * Generates a 2-digit unique code (+1 to +99) for a given subtotal.
   * If all 99 slots for a given subtotal are occupied, throws a friendly capacity error.
   */
  public allocateCode(subtotal: number, orderCode: string): { code: number; expiresAt: Date } {
    this.cleanExpired();

    const usedCodes = new Set<number>();
    for (const item of this.activeCodes.values()) {
      if (item.subtotal === subtotal) {
        usedCodes.add(item.code);
      }
    }

    // Attempt random selection first for unpredictable code distribution
    const availableCodes: number[] = [];
    for (let i = 1; i <= 99; i++) {
      if (!usedCodes.has(i)) {
        availableCodes.push(i);
      }
    }

    if (availableCodes.length === 0) {
      throw new Error(
        'High order volume: All payment verification slots for this amount are temporarily in use. Please wait 5 minutes and try again.'
      );
    }

    const randomIndex = Math.floor(Math.random() * availableCodes.length);
    const chosenCode = availableCodes[randomIndex];

    const now = Date.now();
    const expiresAt = new Date(now + this.ttlMs);

    this.activeCodes.set(orderCode, {
      subtotal,
      code: chosenCode,
      allocatedAt: now,
      expiresAt: expiresAt.getTime(),
      orderCode,
    });

    return { code: chosenCode, expiresAt };
  }

  /**
   * Releases an allocated unique code (e.g. upon payment confirmation or cancellation).
   */
  public releaseCode(orderCode: string): void {
    this.activeCodes.delete(orderCode);
  }
}
