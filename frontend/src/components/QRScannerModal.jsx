import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, Search, AlertCircle } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onScanResult }) {
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader-container",
      { fps: 10, qrbox: { width: 220, height: 220 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        try {
          const parsed = JSON.parse(decodedText);
          onScanResult(parsed.digitalId || decodedText);
        } catch (e) {
          onScanResult(decodedText);
        }
        scanner.clear();
        onClose();
      },
      (errorMessage) => {
        // scan frame error ignored
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner clear error", err));
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScanResult(manualInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex p-3 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 mb-2">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Scan Digital ID QR Code</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Position the refugee's QR code card within the frame</p>
        </div>

        {/* Scanner Canvas */}
        <div id="qr-reader-container" className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 min-h-[220px]"></div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 text-center">Or enter Digital ID manually:</p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. IDC-8F92-4A71-9B3E"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium text-sm transition"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
