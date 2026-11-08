import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export const CitizenFeedbackPage = () => {
  const { id } = useParams();
  const { complaints, verifyResolution } = useComplaints();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [selectedToken, setSelectedToken] = useState(id || complaints[0]?.token || '');
  const ticket = complaints.find(c => c.token === selectedToken || c.id === selectedToken) || complaints[0];

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isReopen, setIsReopen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!ticket) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-headline text-headline-md font-bold">Ticket Not Found</h2>
        <Link to="/citizen/track" className="text-primary font-bold mt-4 inline-block">
          ← Back to Tracking Portal
        </Link>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyResolution(ticket.token, rating, feedback, isReopen);
    setSubmitted(true);
    setTimeout(() => {
      navigate(`/citizen/track?token=${ticket.token}`);
    }, 2500);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: 'Citizen Home', to: '/citizen' },
          { label: 'Tracking Portal', to: '/citizen/track' },
          { label: `Feedback #${ticket.token}` }
        ]}
      />

      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-6">
        <div>
          <span className="font-mono text-xs uppercase font-bold text-primary">
            Citizen Satisfaction Verification
          </span>
          <h1 className="font-headline text-headline-md font-bold text-on-surface mt-1">
            {isReopen ? 'Dispute Resolution & Reopen Grievance' : 'Confirm Resolution & Submit CSAT Feedback'}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 pt-2 border-t border-outline-variant/20">
            <p className="font-body text-body-sm text-secondary">
              Grievance Token: <strong className="font-mono text-primary">#{ticket.token}</strong> · {ticket.title}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="font-body text-label-xs text-secondary font-semibold">Change Ticket:</span>
              <select
                value={ticket.token}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="px-2 py-1 rounded-lg bg-surface border border-outline-variant/40 font-mono text-xs font-bold text-primary focus:outline-none"
              >
                {complaints.map(c => (
                  <option key={c.token} value={c.token}>
                    #{c.token} ({c.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
            <h3 className="font-headline font-bold text-lg">Feedback Successfully Recorded!</h3>
            <p className="text-body-sm">
              Your verification has been logged in the departmental audit record. Redirecting to tracking...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Toggle Resolution vs Reopen */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-surface-container-low rounded-xl border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setIsReopen(false)}
                className={`py-2.5 rounded-lg font-headline text-label-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  !isReopen
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-lg">thumb_up</span>
                <span>Satisfied (Confirm Resolution)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReopen(true)}
                className={`py-2.5 rounded-lg font-headline text-label-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isReopen
                    ? 'bg-error text-on-error shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-lg">replay</span>
                <span>Request Further Action (Reopen)</span>
              </button>
            </div>

            {!isReopen ? (
              <div className="flex flex-col gap-3 p-5 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
                <label className="font-headline text-label-md font-bold text-on-surface">
                  Rate Department Redressal Quality:
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1.5 transition-all ${
                        rating >= star ? 'text-amber-500 scale-110' : 'text-outline/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-4xl fill-current">star</span>
                    </button>
                  ))}
                  <span className="font-mono font-bold text-lg text-on-surface ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-error-container/30 border border-error/30 text-error flex items-start gap-2 text-body-sm">
                <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">warning</span>
                <p>
                  Reopening this grievance will immediately reassign it to the Zonal Commissioner and flag it for statutory supervisory audit.
                </p>
              </div>
            )}

            <div>
              <label className="block font-body text-label-sm font-bold text-on-surface mb-1.5">
                {isReopen ? 'Reason for Reopening & Missing Redressal *' : 'Citizen Comments & Feedback'}
              </label>
              <textarea
                required={isReopen}
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  isReopen
                    ? 'Please describe why the issue is not resolved. e.g. The leak was only temporarily patched and broke again...'
                    : 'Share your experience with the officer response time and work quality...'
                }
                className="w-full p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none font-body text-body-sm leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface font-body text-label-sm font-semibold hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-xl font-headline text-label-md font-bold shadow-md transition-all ${
                  isReopen
                    ? 'bg-error text-on-error hover:bg-error/90'
                    : 'bg-primary text-on-primary hover:bg-primary-container'
                }`}
              >
                {isReopen ? 'Submit Reopen Demand' : 'Confirm Resolution & Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
