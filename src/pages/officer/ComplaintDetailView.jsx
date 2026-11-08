import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const ComplaintDetailView = () => {
  const { id } = useParams();
  const { complaints, updateComplaintStatus, escalateComplaint } = useComplaints();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const ticket = complaints.find(c => c.token === id || c.id === id || c.trackingId === id || c.legacyToken === id) || complaints[0];

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(ticket?.status || 'IN_PROGRESS');
  const [remarks, setRemarks] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <h2 className="font-headline text-headline-md font-bold">Complaint Not Found</h2>
        <button onClick={() => navigate('/officer/dashboard')} className="mt-4 text-primary font-bold">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    updateComplaintStatus(ticket.token, newStatus, remarks, 'Er. Sandeep Kulkarni (GAZ-9014)');
    setIsUpdateModalOpen(false);
    setRemarks('');
    setActionSuccess(true);
    setTimeout(() => setActionSuccess(false), 4000);
  };

  return (
    <div className="flex flex-col gap-space-lg max-w-6xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-secondary">
          <button onClick={() => navigate(-1)} className="hover:text-primary flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back</span>
          </button>
          <span>/</span>
          <span>Dossier Inspection</span>
          <span>/</span>
          <span className="text-primary font-bold font-mono">#{ticket.token}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-headline text-label-md font-bold shadow-md hover:bg-primary-container transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">edit_note</span>
            <span>Update Status & Record Action</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">task_alt</span>
          <span className="font-semibold text-body-sm">
            Action successfully committed to the immutable audit gazette. Notification dispatched to citizen {ticket.citizenPhone}.
          </span>
        </div>
      )}

      {/* Main Dossier Header Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold text-primary">
              #{ticket.token}
            </span>
            <StatusBadge status={ticket.status} />
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-mono text-[11px] font-bold">
              {ticket.priority} PRIORITY
            </span>
            {ticket.escalationTier !== 'NONE' && (
              <span className="px-2.5 py-0.5 rounded-full bg-error text-on-error font-mono text-[11px] font-bold animate-pulse">
                {ticket.escalationTier} ESCALATED
              </span>
            )}
          </div>

          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            {lang === 'kn' && ticket.titleKn ? ticket.titleKn : ticket.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-secondary text-body-sm">
            <span className="font-semibold text-primary">{ticket.departmentName}</span>
            <span>·</span>
            <span>{ticket.ward}, {ticket.district}</span>
            <span>·</span>
            <span className="font-mono text-xs">{ticket.location}</span>
          </div>
        </div>

        {/* Health Score Gauge Meter */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] uppercase font-bold text-secondary">
              Ticket Health Score
            </span>
            <div
              className={`font-headline text-3xl font-extrabold font-mono mt-1 ${
                ticket.healthScore >= 70
                  ? 'text-emerald-700'
                  : ticket.healthScore >= 40
                  ? 'text-amber-600'
                  : 'text-error'
              }`}
            >
              {ticket.healthScore || 80}/100
            </div>
            <span className="text-[10px] font-mono text-secondary">
              {ticket.healthScore >= 70 ? 'Low Risk' : ticket.healthScore >= 40 ? 'Moderate Alert' : 'Critical Breach Risk'}
            </span>
          </div>
          <div className="w-px h-12 bg-outline-variant/40" />
          <div className="flex flex-col text-xs font-mono">
            <span className="text-secondary">SLA Remaining:</span>
            <span className={`font-bold ${ticket.hoursRemaining < 0 ? 'text-error font-bold' : 'text-on-surface'}`}>
              {ticket.hoursRemaining < 0 ? `Overdue ${Math.abs(ticket.hoursRemaining)}h` : `${ticket.hoursRemaining} Hours`}
            </span>
            <span className="text-secondary text-[10px] mt-0.5">
              Deadline: {new Date(ticket.slaDeadline).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* AI Next Best Action Recommendation Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-tertiary-container/15 via-surface-container-low to-primary-container/10 border border-tertiary/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-on-surface text-label-md">
                GovOps AI Next Best Action Recommendation
              </span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-mono text-[10px] font-bold">
                Predictive Redressal Model
              </span>
            </div>
            <p className="font-body text-body-md text-on-surface-variant mt-1 font-medium">
              {ticket.nextBestAction || 'Summon PWD Contractor for emergency bitumen patching within 6 hours'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setRemarks(`Executed recommended action: ${ticket.nextBestAction}`);
            setIsUpdateModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-tertiary text-on-tertiary font-body text-label-sm font-bold shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          Execute Recommended Action
        </button>
      </div>

      {/* Grid: Complainant Dossier & Evidence (4 cols) + Narrative & Action History (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column: Complainant Details & Evidence (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Citizen Details */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <span className="font-mono text-xs uppercase font-bold text-secondary">
              Complainant Information
            </span>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-mono font-bold flex items-center justify-center text-lg">
                {ticket.citizenName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-on-surface block">{ticket.citizenName}</span>
                <span className="font-mono text-xs text-secondary">{ticket.citizenPhone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-2 font-body text-body-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Verification Status:</span>
                <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  {ticket.citizenIdType || 'Aadhaar Verified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Taluk / Ward:</span>
                <span className="font-semibold text-on-surface">{ticket.ward}</span>
              </div>
            </div>
          </div>

          {/* Audio Evidence & Waveform */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
            <span className="font-mono text-xs uppercase font-bold text-secondary">
              Citizen Audio Proof & Transcript
            </span>
            <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between gap-3">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-lg">
                  {isPlayingAudio ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between font-mono text-xs text-secondary">
                  <span>{isPlayingAudio ? 'Playing...' : '0:18 / 0:42'}</span>
                  <span>Audio Verified</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isPlayingAudio ? 'bg-emerald-500 w-3/4' : 'bg-primary w-2/5'}`}
                  />
                </div>
              </div>
              <span className="material-symbols-outlined text-secondary text-base">volume_up</span>
            </div>

            <p className="font-body text-body-sm text-on-surface-variant italic bg-surface-container-low/60 p-3 rounded-lg border border-outline-variant/20">
              "{ticket.audioTranscript || 'Water coming from tap has foul odor and brown residue since yesterday morning. We have small children in the house.'}"
            </p>
          </div>

          {/* Photographic Attachments */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
            <span className="font-mono text-xs uppercase font-bold text-secondary">
              Geotagged Photographic Proof ({ticket.attachments?.length || 1})
            </span>
            <div className="h-44 rounded-xl bg-slate-900 relative overflow-hidden flex items-center justify-center text-white">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=600&q=80"
                alt="Civic Hazard Proof"
                className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm text-[11px] font-mono flex items-center justify-between">
                <span>12.9716° N, 77.5946° E</span>
                <span className="text-emerald-400 font-bold">Metadata Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Narrative & Immutable Timeline Ledger (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Detailed Narrative */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
            <h3 className="font-headline text-headline-sm font-bold text-on-surface">
              Grievance Narrative & Context
            </h3>
            <p className="font-body text-body-lg text-on-surface leading-relaxed">
              {lang === 'kn' && ticket.descriptionKn ? ticket.descriptionKn : ticket.description}
            </p>
          </div>

          {/* Immutable Action History Timeline */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div>
                <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                  Action History & Immutable Ledger
                </h3>
                <p className="font-body text-body-sm text-secondary">
                  Chronological tamper-evident audit trail of all officer assignments, notes, and status changes
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-surface-container font-mono text-xs font-bold text-secondary">
                {ticket.actions.length} Logs
              </span>
            </div>

            <div className="relative pl-6 sm:pl-8 flex flex-col gap-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/50">
              {ticket.actions.map((act) => (
                <div key={act.id} className="relative flex flex-col gap-1.5">
                  <div className="absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center border-2 border-surface-container-lowest shadow-sm">
                    <span className="material-symbols-outlined text-[10px]">circle</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-headline font-bold text-on-surface text-label-md">
                      {act.user}
                    </span>
                    <span className="font-mono text-xs text-secondary">
                      {act.date}
                    </span>
                  </div>

                  <p className="font-body text-body-md text-on-surface-variant bg-surface-container-low/60 p-3.5 rounded-xl border border-outline-variant/20 leading-relaxed">
                    {act.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Update Modal Dialog */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Record Departmental Action & Update Status"
        subtitle={`Grievance Token #${ticket.token} · ${ticket.departmentName}`}
      >
        <form onSubmit={handleStatusSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block font-body text-label-sm font-bold text-on-surface mb-1.5">
              Select New Operational Status:
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/50 outline-none font-body text-body-md cursor-pointer"
            >
              <option value="IN_PROGRESS">IN PROGRESS (Inspection Crew Dispatched)</option>
              <option value="UNDER_REVIEW">UNDER REVIEW (Tender / Technical Audit)</option>
              <option value="ACTION_TAKEN">ACTION TAKEN (Work Completed on Site)</option>
              <option value="RESOLVED">RESOLVED (Ready for Citizen Verification)</option>
            </select>
          </div>

          <div>
            <label className="block font-body text-label-sm font-bold text-on-surface mb-1.5">
              Officer Inspection Remarks & Action Taken Details:
            </label>
            <textarea
              required
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Completed suction cleaning of the blocked sewer junction and replaced 12 meters of damaged GI pipe. Water tested clear."
              className="w-full p-3 rounded-lg bg-surface-container-low border border-outline-variant/50 outline-none font-body text-body-sm leading-relaxed"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-body-sm text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-lg">sms</span>
              SMS Notification to Citizen ({ticket.citizenPhone})
            </span>
            <span className="font-mono text-xs text-emerald-700 font-bold">Enabled</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-body text-label-sm font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-headline text-label-sm font-bold shadow-md hover:bg-primary-container transition-all"
            >
              Commit Action to Ledger
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

