import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ReceiptUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  onUpload,
  isUploading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Receipt image exceeds 5 MB. Please upload a smaller screenshot.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or capture your payment confirmation screenshot.');
      return;
    }
    setError(null);
    try {
      await onUpload(selectedFile);
    } catch (err: any) {
      setError(err.message || 'Failed to upload receipt. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-amber-900/10 shadow-sm space-y-4">
      <div className="space-y-1">
        <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-800" />
          <span>Upload Payment Proof</span>
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          Upload the transfer receipt from your banking or e-wallet app so the baker can verify and prepare your bread batch.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {previewUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-amber-900/15 bg-stone-50 flex flex-col items-center p-3 space-y-2">
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="max-h-56 rounded-lg object-contain shadow-xs"
            />
            <div className="flex items-center justify-between w-full pt-1 px-1">
              <span className="text-[11px] text-stone-500 truncate max-w-[200px]">
                {selectedFile?.name}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-amber-800 hover:text-amber-900"
              >
                Change photo
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-amber-900/20 hover:border-amber-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer bg-stone-50/50 hover:bg-amber-50/30 transition-all text-center"
          >
            <div className="p-3 rounded-full bg-amber-100/70 text-amber-900">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-stone-800">
                Tap to pick payment screenshot
              </p>
              <p className="text-[11px] text-stone-400">JPG, PNG, or WebP up to 5 MB</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 text-white font-bold text-sm shadow-md transition-all"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying & Saving Receipt...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>I Have Paid — Submit Receipt</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
