import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useComplaints } from '../../context/ComplaintContext';

export const CitizenHome = () => {
  const { t, lang } = useLanguage();
  const { metrics, complaints } = useComplaints();

  const services = [
    {
      title: lang === 'kn' ? 'ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಒಳಚರಂಡಿ' : 'Drinking Water & Sanitation',
      desc: lang === 'kn' ? 'ಪೈಪ್‌ಲೈನ್ ಸೋರಿಕೆ, ಕಲುಷಿತ ನೀರು ಸರಬರಾಜು ಅಥವಾ ಚರಂಡಿ ಸಮಸ್ಯೆಗಳು' : 'Pipeline leaks, contaminated water, or sewage overflow reports',
      icon: 'water_drop',
      color: 'bg-primary/10 text-primary',
      sla: '24-48 Hours'
    },
    {
      title: lang === 'kn' ? 'ರಸ್ತೆಗಳು ಮತ್ತು ಸಾರಿಗೆ' : 'Roads & Infrastructure',
      desc: lang === 'kn' ? 'ರಸ್ತೆ ಗುಂಡಿಗಳು, ಮುರಿದ ಬೀದಿ ದೀಪಗಳು ಅಥವಾ ಹೆದ್ದಾರಿ ಅಪಾಯಗಳು' : 'Dangerous potholes, streetlight failures, or expressway hazards',
      icon: 'traffic',
      color: 'bg-blue-600/10 text-blue-700',
      sla: '48 Hours'
    },
    {
      title: lang === 'kn' ? 'ವಿದ್ಯುತ್ ಸರಬರಾಜು ಮತ್ತು ಮೀಟರ್' : 'Electricity & BESCOM',
      desc: lang === 'kn' ? 'ವಿದ್ಯುತ್ ಕಡಿತ, ತಪ್ಪು ಮೀಟರ್ ಬಿಲ್ಲಿಂಗ್ ಅಥವಾ ಅಪಾಯಕಾರಿ ತಂತಿಗಳು' : 'Power outages, faulty meter billing spikes, or loose wiring',
      icon: 'bolt',
      color: 'bg-amber-500/10 text-amber-700',
      sla: '24 Hours'
    },
    {
      title: lang === 'kn' ? 'ಕಂದಾಯ ಮತ್ತು ಪಾಲಿಕೆ ತೆರಿಗೆ' : 'Revenue & Urban Local Body',
      desc: lang === 'kn' ? 'ಇ-ಖಾತಾ, ಆಸ್ತಿ ತೆರಿಗೆ ರಶೀದಿಗಳು ಅಥವಾ ನಾಗರಿಕ ಪ್ರಮಾಣಪತ್ರಗಳು' : 'Khata extracts, property tax clearance, or municipality clearances',
      icon: 'domain',
      color: 'bg-indigo-600/10 text-indigo-700',
      sla: '72 Hours'
    },
    {
      title: lang === 'kn' ? 'ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ ಮತ್ತು ಪಿಂಚಣಿ' : 'Social Welfare & Pensions',
      desc: lang === 'kn' ? 'ವೃದ್ಧಾಪ್ಯ ಪಿಂಚಣಿ, ವಿಧವಾ ವೇತನ ಅಥವಾ ವಿದ್ಯಾರ್ಥಿವೇತನ ವಿಳಂಬ' : 'Senior citizen pensions, disability allowances, or scholarship delays',
      icon: 'elderly',
      color: 'bg-emerald-600/10 text-emerald-700',
      sla: '7 Days'
    },
    {
      title: lang === 'kn' ? 'ಆಹಾರ ಮತ್ತು ಪಡಿತರ ಚೀಟಿ' : 'Food & Civil Supplies (PDS)',
      desc: lang === 'kn' ? 'ಪಡಿತರ ವಿತರಣೆ ವ್ಯತ್ಯಯ, ಕಾರ್ಡ್ ನವೀಕರಣ ಅಥವಾ ಧಾನ್ಯ ಗುಣಮಟ್ಟ' : 'Ration distribution anomalies, Fair Price Shop delays, or card issues',
      icon: 'local_mall',
      color: 'bg-rose-600/10 text-rose-700',
      sla: '48 Hours'
    }
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Hero Civic Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-inverse-surface via-slate-900 to-primary-container p-8 sm:p-12 text-inverse-on-surface shadow-lg">
        <div className="relative z-10 max-w-3xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/20 text-primary-fixed font-mono text-xs font-bold border border-primary-fixed/30 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Guaranteed Public Service Delivery · Karnataka Sakala Act</span>
          </div>

          <h1 className="font-headline text-headline-xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {lang === 'kn'
              ? 'ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ನಿವಾರಣೆ ಮತ್ತು ನೈಜ-ಸಮಯದ ಮೇಲ್ವಿಚಾರಣೆ'
              : 'Direct Civic Grievance Redressal with Automated Follow-up & Escalation'}
          </h1>

          <p className="font-body text-body-lg text-slate-300 leading-relaxed">
            {lang === 'kn'
              ? 'ನಿಮ್ಮ ದೂರುಗಳನ್ನು ನೇರವಾಗಿ ಸಂಬಂಧಪಟ್ಟ ಇಲಾಖೆಯ ನೋಡಲ್ ಅಧಿಕಾರಿಗೆ ತಲುಪಿಸಿ. ಸ್ವಯಂಚಾಲಿತ ಎಸ್‌ಎಂಎಸ್ ಮತ್ತು ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಸ್ಥಿತಿಯನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.'
              : 'Submit grievances directly to department nodal officers. Every ticket receives an autonomous tracking ID with binding statutory resolution deadlines.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/citizen/register"
              className="px-6 py-3.5 rounded-xl bg-primary text-on-primary font-headline text-label-lg font-bold shadow-lg hover:bg-primary-container transition-all flex items-center gap-2 group"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              <span>{t('registerGrievance')}</span>
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>

            <Link
              to="/citizen/track"
              className="px-6 py-3.5 rounded-xl bg-surface-container-lowest/15 backdrop-blur-md text-white font-headline text-label-lg font-bold border border-white/20 hover:bg-white/25 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              <span>{t('navTrack')}</span>
            </Link>
          </div>
        </div>

        {/* Ambient Decorative Emblem */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Quick Telemetry Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-secondary font-body text-label-sm font-medium">National SLA Compliance</span>
          <div className="font-headline text-3xl font-extrabold text-on-surface mt-2 text-primary">
            {metrics.slaCompliance}
          </div>
          <span className="font-mono text-[11px] text-emerald-700 font-semibold mt-1">
            Target 90.0% met
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-secondary font-body text-label-sm font-medium">Total Cases Resolved</span>
          <div className="font-headline text-3xl font-extrabold text-on-surface mt-2 text-emerald-700">
            {metrics.resolved.toLocaleString()}
          </div>
          <span className="font-mono text-[11px] text-secondary mt-1">
            Across 24 Ministries
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-secondary font-body text-label-sm font-medium">Avg. Redressal Turnaround</span>
          <div className="font-headline text-3xl font-extrabold text-on-surface mt-2">
            2.4 Days
          </div>
          <span className="font-mono text-[11px] text-primary font-semibold mt-1">
            +14.2% faster turnaround
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-secondary font-body text-label-sm font-medium">Citizen CSAT Rating</span>
          <div className="font-headline text-3xl font-extrabold text-on-surface mt-2 flex items-center gap-1 text-amber-600">
            <span>4.6</span>
            <span className="material-symbols-outlined text-2xl text-amber-500 fill-current">star</span>
          </div>
          <span className="font-mono text-[11px] text-secondary mt-1">
            94.2% Verified Satisfaction
          </span>
        </div>
      </div>

      {/* Select Category to Report */}
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-headline text-headline-lg font-bold text-on-surface">
              {lang === 'kn' ? 'ಪ್ರಮುಖ ಸೇವಾ ವಿಭಾಗಗಳು' : 'Select Department Category'}
            </h2>
            <p className="font-body text-body-md text-secondary mt-1">
              {lang === 'kn'
                ? 'ಸಂಬಂಧಿತ ಇಲಾಖೆಯನ್ನು ಆರಿಸಿ ಮತ್ತು ನಿಗದಿತ ಕಾಲಮಿತಿಯೊಳಗೆ ಪರಿಹಾರ ಪಡೆಯಿರಿ'
                : 'Select an operational sector to lodge your grievance with guaranteed statutory resolution window'}
            </p>
          </div>
          <Link
            to="/citizen/register"
            className="text-primary font-body text-label-md font-bold hover:underline hidden sm:inline-flex items-center gap-1"
          >
            <span>View All Sectors</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, idx) => (
            <Link
              key={idx}
              to={`/citizen/register?category=${encodeURIComponent(srv.title)}`}
              className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${srv.color}`}>
                    <span className="material-symbols-outlined text-2xl">{srv.icon}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container font-mono text-[11px] font-semibold text-secondary">
                    SLA: {srv.sla}
                  </span>
                </div>

                <h3 className="font-headline text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  {srv.title}
                </h3>
                <p className="font-body text-body-sm text-secondary mt-2 leading-relaxed">
                  {srv.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-primary font-body text-label-sm font-bold">
                <span>File Grievance Now</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Statutory Guarantee Box */}
      <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-surface text-label-lg">
              Statutory Redressal Guarantee & Anti-Delay Penalty
            </h4>
            <p className="font-body text-body-sm text-secondary mt-0.5">
              Under Section 8 of the Karnataka Guarantee of Services Act, overdue grievances trigger automatic escalation to District Magistrates with daily officer delay penalties.
            </p>
          </div>
        </div>

        <Link
          to="/citizen/track"
          className="px-4 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 hover:bg-surface-container text-on-surface font-body text-label-md font-semibold transition-colors shrink-0 shadow-sm"
        >
          Verify Pending Ticket
        </Link>
      </div>
    </div>
  );
};

