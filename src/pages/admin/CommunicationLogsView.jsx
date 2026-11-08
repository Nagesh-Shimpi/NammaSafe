import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';

export const CommunicationLogsView = () => {
  const { communications } = useComplaints();
  const { lang } = useLanguage();

  const [activeChannel, setActiveChannel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredLogs = communications.filter((item) => {
    const matchesChannel = activeChannel === 'ALL' || item.channel === activeChannel;
    const matchesSearch =
      item.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bodySnippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const getChannelBadge = (channel) => {
    switch (channel) {
      case 'WHATSAPP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
            <span className="material-symbols-outlined text-sm">chat</span>
            WhatsApp
          </span>
        );
      case 'EMAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-mono text-[11px] font-bold">
            <span className="material-symbols-outlined text-sm">mail</span>
            Email
          </span>
        );
      case 'SMS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-mono text-[11px] font-bold">
            <span className="material-symbols-outlined text-sm">sms</span>
            SMS Gateway
          </span>
        );
      case 'IVR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-mono text-[11px] font-bold">
            <span className="material-symbols-outlined text-sm">phone_in_talk</span>
            IVR Voice Blast
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-[11px] font-bold">
            <span className="material-symbols-outlined text-sm">notifications</span>
            In-App
          </span>
        );
    }
  };

  const handleSimulateResend = (log) => {
    showToast(`Simulation: Resent ${log.channel} dispatch for token ${log.token} to mock recipient.`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-lg border border-outline/30 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="font-body text-body-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header and Breadcrumbs */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Admin Command', to: '/admin/overview' },
            { label: 'Omnichannel Communication Audit Logs' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              {lang === 'kn' ? 'ಸರ್ಕಾರಿ ಸಂವಹನ ಲಾಗ್‌ಗಳು ಮತ್ತು ಇವಿಆರ್ ರೆಕಾರ್ಡ್ಸ್' : 'Omnichannel Communication Audit Logs'}
            </h1>
            <p className="font-body text-body-sm text-secondary">
              Statutory verification records for automated citizen alerts, nodal show-cause notices, and escalation dispatch logs.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Statutory Demonstration Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-700 text-xl shrink-0 mt-0.5">
          verified
        </span>
        <div className="text-body-xs font-body">
          <strong className="font-bold">DEMONSTRATION SIMULATION ENVIRONMENT:</strong> The communication records, WhatsApp read receipts, SMS carrier timestamps, and IVRS call transcripts presented below are generated exclusively for government prototype demonstration purposes. No real external cellular network dispatches have occurred.
        </div>
      </div>

      {/* Omnichannel Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">Total Dispatched</span>
          <div className="font-headline text-headline-sm font-extrabold text-on-surface mt-1">
            2,481 Dispatches
          </div>
          <span className="font-mono text-[10px] text-emerald-700 font-semibold">99.4% Gateway Delivery</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">WhatsApp Business Read Rate</span>
          <div className="font-headline text-headline-sm font-extrabold text-emerald-700 mt-1">
            88.2% Read
          </div>
          <span className="font-mono text-[10px] text-secondary">Avg 4.2m till open</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">IVRS Voice Completions</span>
          <div className="font-headline text-headline-sm font-extrabold text-primary mt-1">
            614 Calls
          </div>
          <span className="font-mono text-[10px] text-secondary">Bilingual Kannada/English</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">Official GovMail SMTP</span>
          <div className="font-headline text-headline-sm font-extrabold text-purple-700 mt-1">
            412 Notices
          </div>
          <span className="font-mono text-[10px] text-secondary">Section 8 Statutory Archive</span>
        </div>
      </div>

      {/* Filters and Channel Tabs */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'WHATSAPP', 'SMS', 'EMAIL', 'IVR', 'IN_APP'].map((channel) => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`px-3 py-1.5 rounded-xl font-body text-label-sm font-semibold transition-all ${
                activeChannel === channel
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              {channel === 'ALL' ? 'All Channels' : channel}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search token, recipient, or text..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Communications Ledger Table */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                <th className="py-3 px-3.5">Log ID / Token</th>
                <th className="py-3 px-3.5">Channel</th>
                <th className="py-3 px-3.5">Recipient</th>
                <th className="py-3 px-3.5">Subject & Preview</th>
                <th className="py-3 px-3.5">Dispatched Timestamp</th>
                <th className="py-3 px-3.5">Carrier Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body text-body-sm">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-secondary">
                    No communication records found for the selected channel filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-3.5 align-middle">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-on-surface">{log.id}</span>
                        <span className="font-mono text-[10px] text-primary">{log.token}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 align-middle">
                      {getChannelBadge(log.channel)}
                    </td>
                    <td className="py-3 px-3.5 align-middle font-body text-xs font-semibold text-on-surface">
                      {log.recipient}
                    </td>
                    <td className="py-3 px-3.5 align-middle max-w-xs">
                      <p className="font-body text-xs font-bold text-on-surface truncate">
                        {log.subject}
                      </p>
                      <p className="font-body text-[11px] text-secondary truncate">
                        {log.bodySnippet}
                      </p>
                    </td>
                    <td className="py-3 px-3.5 align-middle font-mono text-xs text-secondary whitespace-nowrap">
                      {log.sentAt}
                    </td>
                    <td className="py-3 px-3.5 align-middle">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[10px] font-bold text-secondary">
                        {log.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedLog(log)}
                          title="Inspect Payload"
                          className="p-1 rounded hover:bg-surface-container text-secondary hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </button>
                        <button
                          onClick={() => handleSimulateResend(log)}
                          title="Simulate Resend"
                          className="p-1 rounded hover:bg-surface-container text-secondary hover:text-emerald-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">replay</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Payload Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Communication Dispatch Payload: ${selectedLog.id}`}
        >
          <div className="flex flex-col gap-4 font-body">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-container-low text-xs font-mono">
              <div>
                <span className="text-secondary block">Associated Token:</span>
                <span className="font-bold text-primary">{selectedLog.token}</span>
              </div>
              <div>
                <span className="text-secondary block">Channel Gateway:</span>
                <span className="font-bold text-on-surface">{selectedLog.channelLabel}</span>
              </div>
              <div>
                <span className="text-secondary block">Recipient Identity:</span>
                <span className="font-bold text-on-surface">{selectedLog.recipient}</span>
              </div>
              <div>
                <span className="text-secondary block">Delivery Timestamp:</span>
                <span className="font-bold text-on-surface">{selectedLog.sentAt}</span>
              </div>
            </div>

            <div>
              <span className="text-label-sm font-semibold text-secondary block mb-1">
                Subject Line
              </span>
              <p className="font-body text-body-sm font-bold text-on-surface p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                {selectedLog.subject}
              </p>
            </div>

            <div>
              <span className="text-label-sm font-semibold text-secondary block mb-1">
                Full Message Payload / Transcript
              </span>
              <div className="p-3 rounded-xl bg-surface border border-outline-variant/30 font-body text-body-sm text-on-surface leading-relaxed">
                {selectedLog.bodySnippet}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-body text-body-xs">
              <span className="font-bold">Cryptographic Carrier Receipt:</span> SHA-256 digital signature recorded on state audit ledger for legal evidentiary admissibility under Section 65B of Evidence Act.
            </div>

            <div className="flex justify-end pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-body text-label-md font-bold shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

