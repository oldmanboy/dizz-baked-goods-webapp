import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, Clock, QrCode } from 'lucide-react';
import { platform } from '../utils/platform.js';

interface QrisPaymentViewProps {
  orderCode: string;
  subtotal: number;
  uniqueCode: number;
  totalAmount: number;
  qrisQrDataUrl: string;
  expiresAt: string;
}

export const QrisPaymentView: React.FC<QrisPaymentViewProps> = ({
  orderCode,
  subtotal,
  uniqueCode,
  totalAmount,
  qrisQrDataUrl,
  expiresAt,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopyAmount = async () => {
    const success = await platform.copyToClipboard(totalAmount.toString());
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQr = async () => {
    await platform.saveQrisImage(qrisQrDataUrl, `QRIS_${orderCode}.png`);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const formattedSubtotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalAmount);

  return (
    <div className="bg-white rounded-2xl p-6 border border-amber-900/10 shadow-sm space-y-5">
      {/* Header and Countdown */}
      <div className="flex items-center justify-between border-b border-amber-900/10 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            Order Reference
          </span>
          <p className="font-mono text-xs font-bold text-stone-800">{orderCode}</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>Pay within: {timeLeft}</span>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-2">
        <div className="p-3 bg-white rounded-2xl border-2 border-amber-900/20 shadow-md">
          {qrisQrDataUrl ? (
            <img
              src={qrisQrDataUrl}
              alt="Dynamic QRIS Payment Code"
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center bg-stone-100 text-stone-400">
              <QrCode className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* 1-Tap Download Button for Mobile "Scan from Gallery" */}
        <button
          type="button"
          onClick={handleDownloadQr}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-900/10 hover:bg-amber-900/15 text-amber-950 text-xs font-bold transition-colors"
        >
          {downloaded ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4 text-amber-800" />}
          <span>{downloaded ? 'Saved to Device!' : 'Download QR Image (For Gallery Scan)'}</span>
        </button>
      </div>

      {/* Amount Breakdown Card */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-600">
          <span>Bakes Subtotal</span>
          <span>{formattedSubtotal}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
          <span>Unique Verification Code</span>
          <span>+Rp {uniqueCode}</span>
        </div>
        <div className="border-t border-amber-900/10 pt-2 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase">Exact Total to Transfer</span>
            <div className="font-serif text-lg sm:text-xl font-bold text-amber-950">
              {formattedTotal}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyAmount}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-900/20 text-amber-950 text-xs font-bold shadow-xs hover:bg-stone-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-800" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Helpful Mobile Banking Guide */}
      <div className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/60 space-y-1">
        <p className="font-bold text-stone-700">📱 How to Pay on the Same Phone:</p>
        <p>1. Tap <strong>"Download QR Image"</strong> above.</p>
        <p>2. Open your mobile banking (BCA, Livin', BRImo) or e-wallet (GoPay, OVO, ShopeePay).</p>
        <p>3. Tap QRIS &gt; select <strong>"Scan from Gallery / Photo"</strong>.</p>
        <p>4. The exact amount <strong>{formattedTotal}</strong> is auto-filled. Complete payment, take a screenshot, and upload below.</p>
      </div>
    </div>
  );
};
