/**
 * Platform Abstraction Adapter
 *
 * Provides a unified API for device capabilities across Web browsers and native Android (CapacitorJS).
 * In Phase M1, the web fallback implementations here will seamlessly delegate to
 * @capacitor/filesystem / MediaStore and @capacitor/camera without touching UI components.
 */

export const platform = {
  isNative(): boolean {
    return false; // Set to true when running inside Capacitor Android in Phase M1
  },

  /**
   * Saves a QRIS Data URL image to the device.
   * On Web: Triggers an automatic download anchor tag.
   * On Android (Phase M1): Saves directly to Android MediaStore Gallery.
   */
  async saveQrisImage(dataUrl: string, filename: string): Promise<void> {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Copies text (such as exact Rupiah payable amount) to system clipboard.
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  },
};
