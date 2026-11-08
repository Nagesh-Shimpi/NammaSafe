import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export const ComplaintIntelligenceView = () => {
  const { complaints, departments, autoIdentifyDepartment, checkDuplicate } = useComplaints();
  const { lang } = useLanguage();

  const [selectedTicket, setSelectedTicket] = useState(complaints[0] || null);
  const [testText, setTestText] = useState('Severe water leakage on 12th cross near storm water drain');
  const [identifiedDept, setIdentifiedDept] = useState(null);
  const [duplicateMatch, setDuplicateMatch] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTestClassifier = (e) => {
    e.preventDefault();
    if (!testText.trim()) return;
    const dept = autoIdentifyDepartment(testText);
    const dup = checkDuplicate(testText);
    setIdentifiedDept(dept);
    setDuplicateMatch(dup);
    showToast('GovOps NLP classifier completed semantic inference.');
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
            { label: 'Complaint Intelligence & NLP Diagnostic Matrix' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              {lang === 'kn' ? 'ದೂರು ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಎಐ ವಿಶ್ಲೇಷಣೆ' : 'Complaint Intelligence & Explainable AI Matrix'}
            </h1>
            <p className="font-body text-body-sm text-secondary">
              Predictive health scoring, next-best-action recommendations, duplicate clustering, and bilingual department NLP routing.
            </p>
          </div>

          <Link
            to="/admin/heatmap"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-md font-bold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-lg">map</span>
            Predictive Hotspot Heatmap
          </Link>
        </div>
      </div>

      {/* AI Demonstration Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">
          psychology
        </span>
        <div className="text-body-xs font-body">
          <strong className="font-bold">DEMONSTRATION OF INTELLECTUAL CAPABILITIES:</strong> All AI next-best-actions, health scores, and predictive classification heuristics shown are simulated for this demonstration architecture. Explainability metrics are rendered transparently for audit verification.
        </div>
      </div>

      {/* Grid: Health Score Inspector & Next Best Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Selector & Health Score Breakdown */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <h2 className="font-headline text-title-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">speed</span>
              Explainable Health Score Breakdown
            </h2>

            <select
              value={selectedTicket?.token || ''}
              onChange={(e) => {
                const found = complaints.find(c => c.token === e.target.value);
                if (found) setSelectedTicket(found);
              }}
              className="px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 font-mono text-xs font-bold text-primary focus:outline-none focus:border-primary"
            >
              {complaints.map(c => (
                <option key={c.token} value={c.token}>
                  #{c.token} - {c.title.substring(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          {selectedTicket && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">
                    Token #{selectedTicket.token}
                  </span>
                  <h3 className="font-body text-body-md font-bold text-on-surface mt-0.5">
                    {selectedTicket.title}
                  </h3>
                  <p className="font-body text-body-xs text-secondary mt-1">
                    Department: {selectedTicket.departmentName} · Status: {selectedTicket.status}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono text-2xl font-extrabold text-on-surface">
                      {selectedTicket.healthScore || 85}
                    </span>
                    <span className="font-mono text-xs text-secondary">/100</span>
                    <p className="font-body text-[10px] text-secondary">Aggregate Score</p>
                  </div>
                  <div className="w-14 h-14 rounded-full border-4 border-primary/20 flex items-center justify-center font-mono font-bold text-sm bg-primary/10 text-primary">
                    {selectedTicket.healthScore > 70 ? 'HEALTHY' : 'AT RISK'}
                  </div>
                </div>
              </div>

              {/* Explainable Factor Decomposition */}
              <div className="flex flex-col gap-2.5">
                <span className="font-body text-label-sm font-semibold text-secondary">
                  Transparent Risk Factor Attribution (Weights):
                </span>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-outline-variant/20">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-emerald-600">timer</span>
                      <span>SLA Remaining Window ({selectedTicket.hoursRemaining}h remaining)</span>
                    </div>
                    <span className={selectedTicket.hoursRemaining < 0 ? 'text-error font-bold' : 'text-emerald-700 font-bold'}>
                      {selectedTicket.hoursRemaining < 0 ? '-25 Pts (Breached)' : '+10 Pts (Safe Window)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-outline-variant/20">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-amber-600">priority_high</span>
                      <span>Priority Weight ({selectedTicket.priority})</span>
                    </div>
                    <span className="text-secondary font-bold">
                      {selectedTicket.priority === 'CRITICAL' ? '-20 Pts (Severe Impact)' : selectedTicket.priority === 'HIGH' ? '-10 Pts' : '0 Pts'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-outline-variant/20">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-purple-600">crisis_alert</span>
                      <span>Escalation Tier ({selectedTicket.escalationTier || 'NONE'})</span>
                    </div>
                    <span className="text-secondary font-bold">
                      {selectedTicket.escalationTier !== 'NONE' ? '-30 Pts (Tier 2 Breach)' : '+5 Pts (No Escalation)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-outline-variant/20">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-blue-600">sentiment_neutral</span>
                      <span>NLP Sentiment & Severity Multiplier</span>
                    </div>
                    <span className="text-primary font-bold">
                      0.94 Baseline Index
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Best Action Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-xl">auto_fix_high</span>
              <h2 className="font-headline text-title-md font-bold text-on-surface">
                Suggested Next Action
              </h2>
            </div>

            {selectedTicket ? (
              <div className="mt-4 flex flex-col gap-3 font-body">
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-on-surface">
                  <span className="font-mono text-[10px] uppercase font-bold text-primary tracking-wider block mb-1">
                    Recommendation Engine (94% Confidence)
                  </span>
                  <p className="font-bold text-body-sm text-primary">
                    {selectedTicket.nextBestAction || 'Dispatch zonal technician for on-site pipeline validation and issue water tanker.'}
                  </p>
                </div>

                <div className="text-body-xs text-secondary space-y-1 mt-2">
                  <p>• Estimated SLA turnaround acceleration: <strong className="text-emerald-700">38% faster</strong></p>
                  <p>• Precedent match: <strong className="text-on-surface">42 similar historical cases in Ward 14</strong></p>
                  <p>• Direct Statutory Officer: <strong className="text-on-surface">{selectedTicket.assignedOfficer?.name || 'Nodal Officer'}</strong></p>
                </div>
              </div>
            ) : null}
          </div>

          <button
            onClick={() => showToast(`Automated workflow initiated for ${selectedTicket?.token}: Next best action queued!`)}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-md font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">bolt</span>
            Execute Recommended Action
          </button>
        </div>
      </div>

      {/* NLP Automated Classification & Duplicate Detection Playground */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col gap-5">
        <div className="pb-3 border-b border-outline-variant/20">
          <h2 className="font-headline text-title-md font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">translate</span>
            Bilingual Department NLP & Duplicate Heuristic Sandbox
          </h2>
          <p className="font-body text-body-xs text-secondary mt-0.5">
            Test real-time department identification and semantic duplicate detection in Kannada or English text.
          </p>
        </div>

        <form onSubmit={handleTestClassifier} className="flex flex-col gap-4">
          <div>
            <label className="block font-body text-label-sm font-semibold text-on-surface mb-1.5">
              Enter Citizen Grievance Narrative (English or ಕನ್ನಡ)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Type complaint e.g. ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ or Power transformer sparked..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/40 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-md font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-lg">smart_toy</span>
                Run NLP Inference
              </button>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-body text-label-xs text-secondary font-semibold">Try sample queries:</span>
            {[
              'ಕೊಳಚೆ ನೀರಿನ ಪೈಪ್ ಒಡೆದು ರಸ್ತೆಗೆ ಹರಿಯುತ್ತಿದೆ',
              'NH-48 crater pothole causing vehicle breakdown',
              'Electricity transformer sparking and high voltage surge',
              'Widow pension payment delayed for 3 months'
            ].map((query, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTestText(query)}
                className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface font-body text-[11px] transition-colors"
              >
                "{query.substring(0, 32)}..."
              </button>
            ))}
          </div>

          {/* Inference Results */}
          {identifiedDept && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t border-outline-variant/20">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase font-bold text-primary tracking-wider">
                  Automated Department Match
                </span>
                <div className="font-headline text-title-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                  {identifiedDept.name} ({identifiedDept.code})
                </div>
                <p className="font-body text-body-xs text-secondary">
                  Mandated SLA: {identifiedDept.slaDays || 7} Days · Nodal: {identifiedDept.nodalOfficer || 'Executive Cadre'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                  Duplicate Cluster Detection
                </span>
                {duplicateMatch ? (
                  <div>
                    <div className="font-body text-body-sm font-bold text-amber-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-lg">content_copy</span>
                      High Similarity Match: #{duplicateMatch.token}
                    </div>
                    <p className="font-body text-body-xs text-secondary mt-0.5 line-clamp-1">
                      Existing Title: {duplicateMatch.title}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="font-body text-body-sm font-bold text-emerald-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                      Unique Grievance (Zero Duplicate Clusters Found)
                    </div>
                    <p className="font-body text-body-xs text-secondary mt-0.5">
                      Safe for immediate registration under Sakala Guarantee index.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

