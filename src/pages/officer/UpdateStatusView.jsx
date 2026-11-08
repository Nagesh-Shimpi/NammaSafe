import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatusBadge } from '../../components/common/StatusBadge';

export const UpdateStatusView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, updateComplaintStatus } = useComplaints();
  const { lang } = useLanguage();

  const selectedTicket = complaints.find(c => c.token === id || c.id === id) || complaints[0];

  const [status, setStatus] = useState(selectedTicket?.status || 'IN_PROGRESS');
  const [remarks, setRemarks] = useState('');
  const [evidenceName, setEvidenceName] = useState('pipeline_weld_certification.pdf');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    updateComplaintStatus(selectedTicket.token, status, remarks, 'Er. Sandeep Kulkarni (Nodal Lead)');
    showToast(`Status updated successfully for #${selectedTicket.token}.`);
    setTimeout(() => {
      navigate(`/officer/complaints/${selectedTicket.token}`);
    }, 1500);
  };

  if (!selectedTicket) {
    return (
      <div className="py-12 text-center">
        <h2 className="font-headline text-headline-md font-bold">No complaint selected</h2>
        <Link to="/officer/assigned-complaints" className="text-primary font-bold mt-2 inline-block">
          Return to Assigned Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
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
            { label: 'Officer Workspace', to: '/officer/dashboard' },
            { label: 'Assigned Complaints', to: '/officer/assigned-complaints' },
            { label: `Update #${selectedTicket.token}` },
          ]}
        />
        <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight mt-1">
          {lang === 'kn' ? 'ಸ್ಥಿತಿ ಮತ್ತು ಪರಿಹಾರ ವರದಿ ನವೀಕರಣ' : `Update Status: Docket #${selectedTicket.token}`}
        </h1>
        <p className="font-body text-body-sm text-secondary">
          Record official remediation steps taken and attach statutory completion certificates.
        </p>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col gap-5">
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <div>
            <span className="font-mono text-xs font-bold text-primary">#{selectedTicket.token}</span>
            <h3 className="font-body text-body-md font-bold text-on-surface mt-0.5">{selectedTicket.title}</h3>
            <p className="font-body text-body-xs text-secondary mt-0.5">Citizen: {selectedTicket.citizenName} · {selectedTicket.district}</p>
          </div>
          <StatusBadge status={selectedTicket.status} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block font-body text-label-sm font-semibold text-on-surface mb-1.5">
              Select Redressal Status State
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="IN_PROGRESS">IN_PROGRESS (Remediation team actively dispatched)</option>
              <option value="ACTION_TAKEN">ACTION_TAKEN (Civil/Engineering repair work finished)</option>
              <option value="RESOLVED">RESOLVED (Remediation verified & ready for citizen review)</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW (Supervisory audit or laboratory test pending)</option>
            </select>
          </div>

          <div>
            <label className="block font-body text-label-sm font-semibold text-on-surface mb-1.5">
              Official Remediation Remarks / Engineering Report
            </label>
            <textarea
              rows={4}
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Describe repairs undertaken, vendor contract work orders, or preventive interventions performed..."
              className="w-full p-4 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-body text-label-sm font-semibold text-on-surface mb-1.5">
              Attach Remediation Photo / Work Certificate
            </label>
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-outline-variant/60 bg-surface">
              <span className="material-symbols-outlined text-primary text-2xl">upload_file</span>
              <div className="flex-1 font-body text-body-xs">
                <span className="font-bold text-on-surface block">{evidenceName}</span>
                <span className="text-secondary">Simulated document attachment (1.8 MB)</span>
              </div>
              <button
                type="button"
                onClick={() => setEvidenceName(`repair_evidence_${Date.now().toString().slice(-4)}.jpg`)}
                className="px-3 py-1 rounded-lg bg-surface-container font-body text-label-xs font-bold text-primary hover:bg-surface-container-high transition-colors"
              >
                Change File
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Link
              to="/officer/assigned-complaints"
              className="px-4 py-2 rounded-xl hover:bg-surface-container font-body text-label-md font-semibold text-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-md font-bold shadow-xs"
            >
              Submit Status & File Certificate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

