import React from 'react';
import { Shield, Heart, Globe, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">IdentiChain</span>
            <span>— Refugee-Owned Digital Identity & Document Vault</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Cryptographic SHA-256
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> W3C DID Interoperable
            </span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              Built for <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> Displaced Persons
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
