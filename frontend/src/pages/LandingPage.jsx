import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, QrCode, FileText, Activity, Wallet, Globe, ArrowRight, Lock, Sparkles, CheckCircle2, Users, HeartHandshake } from 'lucide-react';
import Footer from '../components/Footer';

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800/80">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-teal-500/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Humanitarian Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              {t('hero.badge')}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {t('hero.title')}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-900/20 hover:shadow-teal-900/40 flex items-center justify-center gap-2 transition duration-200"
              >
                {t('hero.ctaPrimary')} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/partners"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition duration-200"
              >
                <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> {t('hero.ctaSecondary')}
              </Link>
            </div>

            {/* Live Impact Stats Banner */}
            <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
                <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">{t('hero.stat1Number')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{t('hero.stat1Label')}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
                <p className="text-3xl font-black text-teal-600 dark:text-teal-400 font-mono">{t('hero.stat2Number')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{t('hero.stat2Label')}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
                <p className="text-3xl font-black text-amber-500 font-mono">{t('hero.stat3Number')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{t('hero.stat3Label')}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works - 4-Step Flow */}
      <section className="py-20 bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('howItWorks.title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Unlike national apps that stop working when crossing borders, IdentiChain is self-sovereign and interoperable everywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative group hover:border-cyan-500 transition">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-lg mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('howItWorks.step1Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('howItWorks.step1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative group hover:border-teal-500 transition">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-lg mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('howItWorks.step2Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('howItWorks.step2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative group hover:border-emerald-500 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('howItWorks.step3Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('howItWorks.step3Desc')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative group hover:border-amber-500 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('howItWorks.step4Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('howItWorks.step4Desc')}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Cross-Border Interoperability Banner */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-semibold">
                Why Existing Systems Fail Refugees
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Built for Cross-Border Displacement Corridors
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                National apps like Ukraine’s Diia stop working once you cross a border. UNHCR’s biometric databases are institution-owned, not refugee-owned. Singpass or DigiLocker don’t function across countries.
              </p>
              
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span><strong>Individual Ownership:</strong> You control document visibility and private keys.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span><strong>Multi-Category Coverage:</strong> Identity, medical records, property deeds & diplomas in one place.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span><strong>Tamper-Proof SHA-256 Ledger:</strong> Verifiable even when paper originals are destroyed in conflict.</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs transition"
                >
                  Create Your Free IdentiChain Account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white">
                    OP
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Oksana Petrenko</h4>
                    <p className="text-xs font-mono text-cyan-400">IDC-8F92-4A71-9B3E</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[11px] font-semibold border border-emerald-800">
                  Verified Refugee Record
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-between">
                  <span className="font-medium text-slate-300">Biometric Ukrainian Passport</span>
                  <span className="text-[10px] font-mono text-cyan-400">SHA256: e3b0c442...</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-between">
                  <span className="font-medium text-slate-300">Asthma Treatment Prescription</span>
                  <span className="text-[10px] font-mono text-teal-400">Moderate Triage</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-800 text-[11px] text-cyan-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Interoperable Node Connected: UNHCR Poland Border Clinic (Krakow Hub)
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
