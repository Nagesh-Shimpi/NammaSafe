import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export const CitizenGrievanceDetail = () => {
  const { id } = useParams();
  const { complaints } = useComplaints();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const norm = String(id || '').toUpperCase().trim();
  const ticket = complaints.find(
    c =>
      (c.token && c.token.toUpperCase() === norm) ||
      (c.id && c.id.toUpperCase() === norm) ||
      (c.trackingId && c.trackingId.toUpperCase() === norm) ||
      (c.legacyToken && c.legacyToken.toUpperCase() === norm)
  ) || null;

  if (!ticket) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-headline text-headline-md font-bold text-on-surface">Ticket Not Found</h2>
        <Link to="/citizen/track" className="text-primary font-bold mt-4 inline-block">
          ← Back to Tracking Portal
        </Link>
      </div>
    );
  }

  // Mask sensitive citizen data for security compliance
  const maskedPhone = ticket.citizenPhone?.replace(/(\+91 \d{2})\d{4}(\d{4})/, '$1 •••• $2') || '+91 98402 •••• 1928';

  return (
    <div className="max-w-4xl mx-auto py-4 flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: 'Citizen Home', to: '/citizen' },
          { label: 'Tracking Portal', to: '/citizen/track' },
          { label: `Token #${ticket.token}` }
        ]}
      />

      {/* Main Header Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-extrabold text-primary">
              #{ticket.token}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/citizen/feedback/${ticket.token}`}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-headline text-label-sm font-bold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">rate_review</span>
              <span>Verify / Rate Resolution</span>
            </Link>
          </div>
        </div>

        <h1 className="font-headline text-headline-md font-bold text-on-surface">
          {lang === 'kn' && ticket.titleKn ? ticket.titleKn : ticket.title}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-container-low font-body text-body-sm">
          <div>
            <span className="text-secondary text-xs block">Department:</span>
            <strong className="text-on-surface">{ticket.departmentName}</strong>
          </div>
          <div>
            <span className="text-secondary text-xs block">Complainant:</span>
            <strong className="text-on-surface">{ticket.citizenName}</strong>
          </div>
          <div>
            <span className="text-secondary text-xs block">Verified Phone:</span>
            <strong className="font-mono text-on-surface">{maskedPhone}</strong>
          </div>
          <div>
            <span className="text-secondary text-xs block">Jurisdiction:</span>
            <strong className="text-on-surface">{ticket.ward}</strong>
          </div>
        </div>

        {/* Narrative */}
        <div className="pt-2">
          <h3 className="font-headline text-label-lg font-bold text-on-surface mb-1">
            Grievance Description
          </h3>
          <p className="font-body text-body-md text-on-surface leading-relaxed bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/20">
            {lang === 'kn' && ticket.descriptionKn ? ticket.descriptionKn : ticket.description}
          </p>
        </div>

        {/* Resolution summary if available */}
        {ticket.resolutionSummary && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex flex-col gap-1">
            <span className="font-headline font-bold text-label-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600">verified</span>
              Official Department Resolution Summary
            </span>
            <p className="font-body text-body-sm mt-1">
              {ticket.resolutionSummary}
            </p>
          </div>
        )}
      </div>

      {/* Action History Timeline */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-6">
        <h3 className="font-headline text-headline-sm font-bold text-on-surface">
          Official Action History & Timeline Logs
        </h3>

        <div className="relative pl-6 sm:pl-8 flex flex-col gap-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/50">
          {ticket.actions?.map((act) => (
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
              <p className="font-body text-body-sm text-on-surface-variant bg-surface-container-low/60 p-3 rounded-lg border border-outline-variant/20">
                {act.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

