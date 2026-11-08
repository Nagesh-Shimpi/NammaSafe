import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';

const INITIAL_FOLLOWUPS = [
  {
    id: 'TSK-101',
    token: 'GRV-2024-8841',
    citizenName: 'Sunil Mehta',
    citizenPhone: '+91 98402 11928',
    type: 'SITE_INSPECTION',
    title: 'Site Visit: Cross-leakage joint inspection with drainage team',
    dueDate: 'Today · 03:00 PM',
    priority: 'HIGH',
    isDone: false,
    notes: 'Confirm water sample clarity test results before certifying pipeline'
  },
  {
    id: 'TSK-102',
    token: 'GRV-2024-8839',
    citizenName: 'Pooja Hegde',
    citizenPhone: '+91 98801 44520',
    type: 'CALL_CITIZEN',
    title: 'Callback: Verify road patch quality on NH-48 Service Road',
    dueDate: 'Today · 05:00 PM',
    priority: 'CRITICAL',
    isDone: false,
    notes: 'Citizen requested direct confirmation that asphalt layer adheres to IRC-37 code'
  },
  {
    id: 'TSK-103',
    token: 'GRV-2024-8835',
    citizenName: 'Farhan Akhtar',
    citizenPhone: '+91 97412 88120',
    type: 'VENDOR_MEETING',
    title: 'Contractor Audit: Smart meter test bench certification',
    dueDate: 'Tomorrow · 11:00 AM',
    priority: 'MEDIUM',
    isDone: true,
    notes: 'Vendor submitted test slip; upload calibration certificate to portal'
  },
  {
    id: 'TSK-104',
    token: 'GRV-2024-8818',
    citizenName: 'Ananya Sharma',
    citizenPhone: '+91 99001 23456',
    type: 'DOCUMENT_REVIEW',
    title: 'Property Tax Khata Record Reconciliation with SAS database',
    dueDate: 'Tomorrow · 04:30 PM',
    priority: 'HIGH',
    isDone: false,
    notes: 'Verify e-Swathu extract clearance before updating resolution'
  }
];

export const FollowUpManagementView = () => {
  const { lang } = useLanguage();
  const [tasks, setTasks] = useState(INITIAL_FOLLOWUPS);
  const [filter, setFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.isDone;
        showToast(`Task ${t.id} marked as ${nextState ? 'Completed' : 'Pending'}.`);
        return { ...t, isDone: nextState };
      }
      return t;
    }));
  };

  const handleSimulateCall = (task) => {
    showToast(`Simulation: Placed direct citizen verification callback to ${task.citizenPhone}.`);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'PENDING') return !t.isDone;
    if (filter === 'COMPLETED') return t.isDone;
    return true;
  });

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
            { label: 'Officer Workspace', to: '/officer/dashboard' },
            { label: 'Follow-up & Field Action Management' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              {lang === 'kn' ? 'ಫಾಲೋ-ಅಪ್ ಮತ್ತು ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳ ನಿರ್ವಹಣೆ' : 'Daily Follow-up & Field Action Management'}
            </h1>
            <p className="font-body text-body-sm text-secondary">
              Statutory verification checkpoints, on-site inspections, and citizen resolution callbacks.
            </p>
          </div>
        </div>
      </div>

      {/* Task Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-body text-label-sm text-secondary font-semibold">Today's Scheduled Actions</span>
            <div className="font-headline text-headline-sm font-extrabold text-on-surface mt-1">
              {tasks.filter(t => !t.isDone).length} Actions Left
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">checklist</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-body text-label-sm text-secondary font-semibold">Completed Today</span>
            <div className="font-headline text-headline-sm font-extrabold text-emerald-700 mt-1">
              {tasks.filter(t => t.isDone).length} Tasks Done
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">task_alt</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-body text-label-sm text-secondary font-semibold">Critical SLA Cutoffs</span>
            <div className="font-headline text-headline-sm font-extrabold text-error mt-1">
              1 Imminent Task
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-error-container/30 text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl animate-pulse">crisis_alert</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl font-body text-label-xs font-bold transition-all ${
                filter === f
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              {f === 'ALL' ? 'All Follow-ups' : f}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-secondary">
          Cadre: Er. Sandeep Kulkarni (GAZ-9014)
        </span>
      </div>

      {/* Checklist Grid */}
      <div className="flex flex-col gap-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              task.isDone
                ? 'bg-surface-container-low/60 border-outline-variant/20 opacity-75'
                : 'bg-surface-container-lowest border-outline-variant/30 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3.5 flex-1">
              <button
                onClick={() => toggleTask(task.id)}
                className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                  task.isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-outline-variant/60 hover:border-primary'
                }`}
              >
                {task.isDone && <span className="material-symbols-outlined text-sm font-bold">check</span>}
              </button>

              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${task.isDone ? 'line-through text-secondary' : 'text-primary'}`}>
                    #{task.token}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary-fixed/30 font-mono text-[10px] font-bold text-secondary-fixed">
                    {task.type.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-secondary">
                    Due: {task.dueDate}
                  </span>
                </div>

                <h4 className={`font-body text-body-md font-bold text-on-surface ${task.isDone ? 'line-through text-secondary' : ''}`}>
                  {task.title}
                </h4>

                <p className="font-body text-body-xs text-secondary">
                  Citizen: <strong>{task.citizenName}</strong> · Phone: {task.citizenPhone}
                </p>

                {task.notes && (
                  <p className="font-body text-body-xs text-on-surface-variant bg-surface-container-low p-2 rounded-lg mt-1 border border-outline-variant/20">
                    <strong className="text-secondary">Inspection Guidance:</strong> {task.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <button
                onClick={() => handleSimulateCall(task)}
                className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body text-label-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-base">call</span>
                Simulate Call
              </button>

              <button
                onClick={() => toggleTask(task.id)}
                className={`px-3 py-1.5 rounded-xl font-body text-label-xs font-bold transition-colors ${
                  task.isDone
                    ? 'bg-surface-container text-secondary'
                    : 'bg-primary hover:bg-primary/90 text-on-primary shadow-xs'
                }`}
              >
                {task.isDone ? 'Reopen Task' : 'Mark Completed'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

