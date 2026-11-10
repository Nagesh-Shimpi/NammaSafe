import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useComplaints } from '../../context/ComplaintContext';

export const SystemSettings = () => {
  const { lang, t } = useLanguage();
  const { complaints, reminders, escalations, auditLogs, resetDemoState } = useComplaints();
  const [saved, setSaved] = useState(false);
  const [resetMessage, setResetMessage] = useState(false);

  const [settings, setSettings] = useState({
    autoEscalateHoursTier1: 24,
    autoEscalateHoursTier2: 48,
    autoEscalateHoursTier3: 72,
    enableSmsAlerts: true,
    enableWhatsAppAlerts: true,
    enableShowCausePdf: true,
    dailyOfficerPenalty: 250,
    activeLanguageDefault: 'en'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-headline-xl font-bold text-on-surface">
          System Administration & Statutory Rules
        </h1>
        <p className="font-body text-body-md text-secondary mt-1">
          Configure statutory escalation intervals, SLA thresholds, multi-channel dispatch rules, and language engine preferences.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span className="font-semibold text-body-sm">
            Statutory governance parameters successfully synchronized across 24 ministries.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Section 1: SLA Escalation Matrix */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
          <h2 className="font-headline text-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">timer</span>
            <span>Statutory Escalation Timeline (Public Services Guarantee Act)</span>
          </h2>
          <p className="font-body text-body-sm text-secondary">
            Autonomous chronometric triggers for moving unaddressed grievances to supervisory ombudsmen.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1.5">
                Tier 1 Nodal Warning (Grace Expired)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.autoEscalateHoursTier1}
                  onChange={(e) => setSettings({ ...settings, autoEscalateHoursTier1: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/50 outline-none font-mono"
                />
                <span className="font-mono text-xs text-secondary">Hours</span>
              </div>
            </div>

            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1.5">
                Tier 2 Zonal Commissioner Escalation
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.autoEscalateHoursTier2}
                  onChange={(e) => setSettings({ ...settings, autoEscalateHoursTier2: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/50 outline-none font-mono"
                />
                <span className="font-mono text-xs text-secondary">Hours</span>
              </div>
            </div>

            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1.5">
                Tier 3 District Magistrate Summon
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.autoEscalateHoursTier3}
                  onChange={(e) => setSettings({ ...settings, autoEscalateHoursTier3: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/50 outline-none font-mono text-error font-bold"
                />
                <span className="font-mono text-xs text-secondary">Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Section 8 Penalty Assessment */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
          <h2 className="font-headline text-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600">gavel</span>
            <span>Section 8 Default Officer Delay Penalty</span>
          </h2>
          <div className="flex items-center justify-between">
            <div className="max-w-lg">
              <span className="font-bold text-on-surface block">Statutory Daily Fine Deduction</span>
              <span className="text-secondary text-body-sm">
                Daily penalty deducted directly from nodal officer treasury salary for unjustified delay beyond Tier 3.
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-on-surface">₹</span>
              <input
                type="number"
                value={settings.dailyOfficerPenalty}
                onChange={(e) => setSettings({ ...settings, dailyOfficerPenalty: e.target.value })}
                className="w-24 h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/50 outline-none text-right font-bold text-primary"
              />
              <span className="text-xs text-secondary">/ day</span>
            </div>
          </div>
        </div>

        {/* Section 3: Multi-Channel Dispatch Channels */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
          <h2 className="font-headline text-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">outgoing_mail</span>
            <span>Omnichannel Dispatch Gates</span>
          </h2>

          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low cursor-pointer">
              <div>
                <span className="font-bold text-on-surface block">Automated Citizen SMS Gateway (NIC State Gate)</span>
                <span className="text-secondary text-xs">Immediate SMS notification on registration, assignment, and resolution.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableSmsAlerts}
                onChange={(e) => setSettings({ ...settings, enableSmsAlerts: e.target.checked })}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low cursor-pointer">
              <div>
                <span className="font-bold text-on-surface block">Meta WhatsApp Enterprise Verification Bot</span>
                <span className="text-secondary text-xs">Sends high-priority interactive photo evidence and OTP feedback cards.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableWhatsAppAlerts}
                onChange={(e) => setSettings({ ...settings, enableWhatsAppAlerts: e.target.checked })}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low cursor-pointer">
              <div>
                <span className="font-bold text-on-surface block">Auto-generate Judicial Signed Show-Cause PDF</span>
                <span className="text-secondary text-xs">Digitally signs statutory notices with official ombudsman seal upon Tier 3 breach.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableShowCausePdf}
                onChange={(e) => setSettings({ ...settings, enableShowCausePdf: e.target.checked })}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-outline-variant/20">
          <div className="text-xs font-mono text-secondary bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-outline-variant/30">
            Local Persisted Store: <strong>{complaints.length}</strong> grievances ·{' '}
            <strong>{reminders.length}</strong> reminders ·{' '}
            <strong>{escalations.length}</strong> escalations ·{' '}
            <strong>{auditLogs.length}</strong> audit logs
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset local demo storage back to initial seed dataset (including Police Pilot cases)?')) {
                  resetDemoState();
                  setResetMessage(true);
                  setTimeout(() => setResetMessage(false), 3500);
                }
              }}
              className="px-4 py-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-headline text-label-md font-bold transition-all"
            >
              Reset Demo Seed Data
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary text-on-primary font-headline text-label-md font-bold shadow-md hover:bg-primary-container transition-all"
            >
              Save & Publish Configuration
            </button>
          </div>
        </div>

        {resetMessage && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-base">restart_alt</span>
            <span>Demo storage restored cleanly to canonical initial seed state.</span>
          </div>
        )}
      </form>
    </div>
  );
};

