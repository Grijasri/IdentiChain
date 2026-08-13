import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, ShieldCheck, Globe } from 'lucide-react';

export default function QRModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const qrData = JSON.stringify({
    digitalId: user.digitalId,
    name: user.name,
    countryOfOrigin: user.countryOfOrigin || 'Ukraine',
    issuer: 'IdentiChain Global Ledger Node #1',
  });

  const handleDownload = () => {
    const svg = document.getElementById('digital-id-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `IdentiChain_Digital_ID_${user.digitalId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> W3C DID Cryptographic Identity
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h3>
          <p className="text-sm font-mono text-cyan-600 dark:text-cyan-400 font-semibold mt-1">
            {user.digitalId}
          </p>
        </div>

        {/* QR Frame */}
        <div className="mt-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <div className="p-3 bg-white rounded-xl shadow-md">
            <QRCodeSVG
              id="digital-id-qr-svg"
              value={qrData}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="flex items-center justify-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-teal-500" /> Origin: {user.countryOfOrigin || 'Ukraine'} • Location: {user.currentLocation || 'Krakow, Poland'}
            </p>
            <p className="text-[11px] text-slate-400">Offline Verifiable by Partner NGOs, Border Authorities & Clinics</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium text-sm transition"
          >
            <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Save PNG
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Card
          </button>
        </div>
      </div>
    </div>
  );
}
