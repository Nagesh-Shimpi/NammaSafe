import React, { useState, useMemo, useEffect } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { Modal } from '../common/Modal';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';

const THRESHOLDS = {
  BALANCED: 15,
  HIGH: 25,
  MAX_CAPACITY: 30
};

export const NodalReassignmentModal = ({
  isOpen,
  onClose,
  initialComplaintToken = '',
  initialOfficerId = '',
  onSuccess
}) => {
  const { complaints = [], officers = [], reassignOfficer } = useComplaints();

  const [wizardStep, setWizardStep] = useState(1);
  const [selectedComplaintToken, setSelectedComplaintToken] = useState(initialComplaintToken);
  const [selectedTargetOfficerId, setSelectedTargetOfficerId] = useState('');
  const [reassignmentReason, setReassignmentReason] = useState('Caseload Rebalancing & Bottleneck Mitigation');
  const [reassignmentNotes, setReassignmentNotes] = useState('');
  const [requireSupervisorApproval, setRequireSupervisorApproval] = useState(false);
  const [supervisorApprover, setSupervisorApprover] = useState('Shri Vikram Malhotra, IAS');

  useEffect(() => {
    if (initialComplaintToken) {
      setSelectedComplaintToken(initialComplaintToken);
    } else if (complaints.length > 0 && !selectedComplaintToken) {
      setSelectedComplaintToken(complaints[0].token || complaints[0].id);
    }
  }, [initialComplaintToken, complaints]);

  useEffect(() => {
    setWizardStep(1);
  }, [isOpen]);

  const currentWizardComplaint = useMemo(() => {
    return complaints.find(c => c.token === selectedComplaintToken || c.id === selectedComplaintToken) || complaints[0];
  }, [complaints, selectedComplaintToken]);

  const eligibleOfficersRecommendations = useMemo(() => {
    if (!currentWizardComplaint) return [];
    const sourceOfficerId = currentWizardComplaint.assignedOfficer?.id || initialOfficerId;

    return officers
      .filter(o => o.id !== sourceOfficerId)
      .map(o => {
        let score = 70;
        const reasons = [];

        const isAvailable = o.availability !== 'ON_LEAVE' && (o.activeCaseload || 0) < THRESHOLDS.MAX_CAPACITY;
        if (!isAvailable) {
          score = 0;
        }

        const isDeptMatch = o.departmentId === currentWizardComplaint.departmentId ||
          (o.department && currentWizardComplaint.departmentName && o.department.includes(currentWizardComplaint.departmentName));
        if (isDeptMatch) {
          score += 20;
          reasons.push('Same ministerial department jurisdiction');
        }

        const hasCategoryExp = Array.isArray(o.categoryExperience) &&
          o.categoryExperience.some(cat => cat.toLowerCase().includes((currentWizardComplaint.category || '').toLowerCase()));
        if (hasCategoryExp) {
          score += 15;
          reasons.push(`Direct track record in ${currentWizardComplaint.category}`);
        }

        const caseload = o.activeCaseload || 0;
        if (caseload <= 10) {
          score += 15;
          reasons.push(`Low active caseload (${caseload}/30) with ample capacity headroom`);
        } else if (caseload <= THRESHOLDS.BALANCED) {
          score += 8;
          reasons.push(`Balanced workload (${caseload}/30)`);
        } else if (caseload > THRESHOLDS.HIGH) {
          score -= 30;
        }

        if ((o.slaRate || 0) >= 94) {
          score += 10;
          reasons.push(`High statutory SLA compliance rate (${o.slaRate}%)`);
        }

        const clampedScore = Math.min(99, Math.max(10, score));

        return {
          ...o,
          computedSuitability: isAvailable ? clampedScore : 0,
          isEligible: isAvailable,
          recommendationReasons: reasons.length > 0 ? reasons : ['General administrative cadre eligibility']
        };
      })
      .sort((a, b) => b.computedSuitability - a.computedSuitability);
  }, [officers, currentWizardComplaint, initialOfficerId]);

  useEffect(() => {
    if (eligibleOfficersRecommendations.length > 0 && !selectedTargetOfficerId) {
      const topEligible = eligibleOfficersRecommendations.find(o => o.isEligible);
      if (topEligible) setSelectedTargetOfficerId(topEligible.id);
    }
  }, [eligibleOfficersRecommendations, selectedTargetOfficerId]);

  const currentWizardTargetOfficer = useMemo(() => {
    return officers.find(o => o.id === selectedTargetOfficerId) || eligibleOfficersRecommendations.find(o => o.isEligible);
  }, [officers, selectedTargetOfficerId, eligibleOfficersRecommendations]);

  const handleExecuteReassignment = (e) => {
    if (e) e.preventDefault();
    if (!currentWizardComplaint || !currentWizardTargetOfficer) return;

    const status = requireSupervisorApproval ? 'PENDING_APPROVAL' : 'COMPLETED';
    const approvedBy = requireSupervisorApproval ? 'Pending Ombudsman / Supervisor Clearance' : supervisorApprover;

    const success = reassignOfficer(
      currentWizardComplaint.token || currentWizardComplaint.id,
      currentWizardTargetOfficer.id,
      {
        reason: reassignmentReason,
        initiatedBy: 'Zonal Administrator',
        approvedBy,
        notes: reassignmentNotes || 'Executed via ResolveTrack Nodal Rebalancing Desk.',
        status
      }
    );

    if (success && onSuccess) {
      onSuccess({
        complaint: currentWizardComplaint,
        targetOfficer: currentWizardTargetOfficer,
        requireSupervisorApproval
      });
    }

    onClose();
  };

  if (!isOpen || !currentWizardComplaint) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guided Nodal Reassignment Workflow"
      subtitle={`Redistributing docket #${currentWizardComplaint.token} to optimal cadre nodal officer`}
      maxWidth="max-w-3xl"
    >
      {/* Step Indicator */}
      <div className="mb-6 pb-4 border-b border-slate-200">
        <div className="grid grid-cols-4 gap-2 text-center font-body text-xs">
          <div
            className={`flex flex-col items-center gap-1 pb-2 border-b-2 transition-all ${
              wizardStep >= 1 ? 'border-teal-600 text-teal-700 font-bold' : 'border-slate-200 text-slate-400'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-500 text-teal-700 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span>1. Select Complaint</span>
          </div>
          <div
            className={`flex flex-col items-center gap-1 pb-2 border-b-2 transition-all ${
              wizardStep >= 2 ? 'border-teal-600 text-teal-700 font-bold' : 'border-slate-200 text-slate-400'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-500 text-teal-700 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span>2. AI Recommendation</span>
          </div>
          <div
            className={`flex flex-col items-center gap-1 pb-2 border-b-2 transition-all ${
              wizardStep >= 3 ? 'border-teal-600 text-teal-700 font-bold' : 'border-slate-200 text-slate-400'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-500 text-teal-700 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span>3. Review Shift</span>
          </div>
          <div
            className={`flex flex-col items-center gap-1 pb-2 border-b-2 transition-all ${
              wizardStep >= 4 ? 'border-teal-600 text-teal-700 font-bold' : 'border-slate-200 text-slate-400'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-500 text-teal-700 text-xs font-bold flex items-center justify-center">
              4
            </span>
            <span>4. Statutory Confirm</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Complaint & Reassignment Reason */}
      {wizardStep === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Grievance Dossier
            </label>
            <select
              value={selectedComplaintToken}
              onChange={(e) => setSelectedComplaintToken(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
            >
              {complaints.map((c) => (
                <option key={c.token} value={c.token}>
                  #{c.token} · [{c.priority}] {c.title} (Currently: {c.assignedOfficer?.name || 'Unassigned'})
                </option>
              ))}
            </select>
          </div>

          {/* Complaint Details Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-700">
                  #{currentWizardComplaint.token}
                </span>
                <PriorityBadge priority={currentWizardComplaint.priority} />
                <StatusBadge status={currentWizardComplaint.status} />
              </div>
              <span className="text-xs font-mono text-slate-500">
                SLA: {currentWizardComplaint.hoursRemaining !== undefined ? `${currentWizardComplaint.hoursRemaining}h remaining` : '72h'}
              </span>
            </div>

            <h4 className="font-headline text-sm font-bold text-slate-900 mb-1">
              {currentWizardComplaint.title}
            </h4>
            <p className="font-body text-xs text-slate-600 mb-3">
              {currentWizardComplaint.description || 'Grievance registered via public portal.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Department</span>
                <span className="font-semibold text-slate-800">{currentWizardComplaint.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Category</span>
                <span className="font-semibold text-slate-800">{currentWizardComplaint.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Current Nodal Lead</span>
                <span className="font-semibold text-slate-800">
                  {currentWizardComplaint.assignedOfficer?.name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Reassignment Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Reassignment <span className="text-rose-500">*</span>
            </label>
            <select
              value={reassignmentReason}
              onChange={(e) => setReassignmentReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 mb-2"
            >
              <option value="Caseload Rebalancing & Bottleneck Mitigation">
                Caseload Rebalancing & Bottleneck Mitigation
              </option>
              <option value="Officer on Medical / Statutory Leave">
                Officer on Medical / Statutory Leave
              </option>
              <option value="Subject Matter Technical Expertise Required">
                Subject Matter Technical Expertise Required
              </option>
              <option value="Jurisdictional Boundary Transfer (Zonal Re-alignment)">
                Jurisdictional Boundary Transfer (Zonal Re-alignment)
              </option>
              <option value="Critical SLA Escalation Prevention (Section 8)">
                Critical SLA Escalation Prevention (Section 8)
              </option>
              <option value="Citizen Appeal / Conflict of Interest Recusal">
                Citizen Appeal / Conflict of Interest Recusal
              </option>
            </select>

            <textarea
              value={reassignmentNotes}
              onChange={(e) => setReassignmentNotes(e.target.value)}
              rows={2}
              placeholder="Optional administrative notes or special handover instructions..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <span>Recommend Eligible Officers</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Recommend Eligible Officers */}
      {wizardStep === 2 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-headline text-sm font-bold text-slate-900">
                Recommended Cadre Officers
              </h4>
              <p className="font-body text-xs text-slate-500">
                Ranked by GovOps Affinity Algorithm based on department domain, capacity headroom, and SLA track record.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold border border-teal-200">
              {eligibleOfficersRecommendations.filter(o => o.isEligible).length} Eligible Officers
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
            {eligibleOfficersRecommendations.map((officer) => {
              const isSelected = selectedTargetOfficerId === officer.id;
              const isEligible = officer.isEligible;
              const caseload = officer.activeCaseload || 0;
              const pct = Math.min(100, Math.round((caseload / (officer.maxCapacity || THRESHOLDS.MAX_CAPACITY)) * 100));

              return (
                <div
                  key={officer.id}
                  onClick={() => {
                    if (isEligible) {
                      setSelectedTargetOfficerId(officer.id);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all ${
                    !isEligible
                      ? 'opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed'
                      : isSelected
                      ? 'bg-teal-50/70 border-teal-500 shadow-xs ring-2 ring-teal-500/20 cursor-pointer'
                      : 'bg-white border-slate-200 hover:border-teal-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="targetOfficerModal"
                        checked={isSelected}
                        disabled={!isEligible}
                        onChange={() => setSelectedTargetOfficerId(officer.id)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <img
                        src={officer.avatar}
                        alt={officer.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {officer.name}
                          </h5>
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">
                            ({officer.employeeId || officer.badge})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {officer.designation} · {officer.department}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isEligible ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                            officer.computedSuitability >= 90
                              ? 'bg-teal-100 text-teal-800 border border-teal-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {officer.computedSuitability}% Suitability
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-100 text-rose-800">
                          Ineligible ({officer.availability})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-[11px]">
                        Load: <strong>{caseload}/30</strong> ({pct}%)
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                          officer.availability === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {officer.availability}
                      </span>
                    </div>

                    <div className="text-[11px] text-teal-800 font-medium">
                      ✔ {officer.recommendationReasons?.[0] || 'Eligible cadre officer'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={!selectedTargetOfficerId}
              onClick={() => setWizardStep(3)}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <span>Review Reassignment Shift</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review Reassignment Comparison */}
      {wizardStep === 3 && currentWizardTargetOfficer && (
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="font-headline text-sm font-bold text-slate-900">
              Comparative Cadre Impact Review
            </h4>
            <p className="font-body text-xs text-slate-500">
              Verify the before-and-after caseload reallocation to ensure statutory equilibrium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Officer */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
                Current Responsible Officer
              </div>
              <div className="flex items-center gap-2.5 mb-3">
                <img
                  src={currentWizardComplaint.assignedOfficer?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {currentWizardComplaint.assignedOfficer?.name || 'Current Officer'}
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    {currentWizardComplaint.assignedOfficer?.designation || 'Zonal Officer'}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex justify-between items-center font-mono">
                <span className="text-slate-600">Caseload Shift:</span>
                <span className="font-bold text-slate-800">
                  {currentWizardComplaint.assignedOfficer?.activeCaseload || 15} →{' '}
                  <span className="text-emerald-700">
                    {Math.max(0, (currentWizardComplaint.assignedOfficer?.activeCaseload || 15) - 1)} (-1 docket)
                  </span>
                </span>
              </div>
            </div>

            {/* Target Officer */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40">
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-800 font-bold mb-2 flex items-center justify-between">
                <span>New Nodal Officer</span>
                <span className="material-symbols-outlined text-sm text-teal-600">check_circle</span>
              </div>
              <div className="flex items-center gap-2.5 mb-3">
                <img
                  src={currentWizardTargetOfficer.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
                />
                <div>
                  <h5 className="font-bold text-teal-950 text-xs sm:text-sm">
                    {currentWizardTargetOfficer.name}
                  </h5>
                  <p className="text-[11px] text-teal-700">
                    {currentWizardTargetOfficer.designation}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-teal-200 text-xs flex justify-between items-center font-mono">
                <span className="text-slate-600">Caseload Shift:</span>
                <span className="font-bold text-slate-800">
                  {currentWizardTargetOfficer.activeCaseload || 0} →{' '}
                  <span className="text-teal-700 font-bold">
                    {(currentWizardTargetOfficer.activeCaseload || 0) + 1} (+1 docket)
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-body">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Complaint Token:</span>
              <span className="font-mono font-bold text-teal-700">#{currentWizardComplaint.token}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Grievance Title:</span>
              <span className="font-semibold text-slate-900 max-w-sm truncate">{currentWizardComplaint.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Reassignment Reason:</span>
              <span className="font-semibold text-slate-800">{reassignmentReason}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(4)}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <span>Proceed to Final Authorization</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirm Reassignment */}
      {wizardStep === 4 && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 font-body">
            <h4 className="font-headline text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-lg">gavel</span>
              <span>Statutory Authorization & Handover Mandate</span>
            </h4>
            <p className="text-slate-600">
              Please review statutory authorization settings before updating the official state ledger.
            </p>

            <div className="pt-2 border-t border-slate-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="modalSupervisorCheck"
                checked={requireSupervisorApproval}
                onChange={(e) => setRequireSupervisorApproval(e.target.checked)}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
              />
              <div>
                <label htmlFor="modalSupervisorCheck" className="font-bold text-slate-900 cursor-pointer block">
                  Require Formal Supervisor / Ombudsman Clearance
                </label>
                <p className="text-[11px] text-slate-500">
                  If checked, this transfer will be queued under "Pending Approval" until formally counter-signed by the designated ombudsman.
                </p>
              </div>
            </div>

            {requireSupervisorApproval ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Routing to Approving Authority:
                </label>
                <select
                  value={supervisorApprover}
                  onChange={(e) => setSupervisorApprover(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-slate-800 text-xs font-medium focus:outline-none"
                >
                  <option value="Shri Vikram Malhotra, IAS - Department Head">
                    Shri Vikram Malhotra, IAS - Department Head (MORTH)
                  </option>
                  <option value="Dr. Sudha Chandran, IAS - Nodal Ombudsman">
                    Dr. Sudha Chandran, IAS - Nodal Ombudsman (Jal Shakti)
                  </option>
                  <option value="Apex Redressal Vigilance Directorate">
                    Apex Redressal Vigilance Directorate
                  </option>
                </select>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200 text-teal-900">
                <span className="font-bold block mb-0.5">Direct Administrator Fast-Track Reassignment:</span>
                Executed under Delegated Section 14-B emergency powers. Notifications will dispatch immediately to both officers and the registered citizen.
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-body flex items-start gap-2.5">
            <span className="material-symbols-outlined text-teal-400 text-base mt-0.5">verified_user</span>
            <div>
              <strong>Section 12 Cadre Audit Trail:</strong> This action will be permanently recorded in the immutable ResolveTrack log. Both officers will receive SMS and in-app notifications with the complete case dossier.
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setWizardStep(3)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={handleExecuteReassignment}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-sm">task_alt</span>
              <span>{requireSupervisorApproval ? 'Submit for Supervisor Approval' : 'Authorize & Execute Reassignment'}</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

