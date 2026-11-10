import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useComplaints } from '../../context/ComplaintContext';
import { COMPLAINT_CATEGORIES } from '../../data/complaintCategories';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';

export const CitizenHome = () => {
  const { lang, setLanguage, t } = useLanguage();
  const { metrics, complaints } = useComplaints();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const faqs = [
    {
      qEn: 'How do I track my submitted grievance?',
      qKn: 'ನನ್ನ ಸಲ್ಲಿಕೆಯಾದ ದೂರನ್ನು ನಾನು ಹೇಗೆ ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು?',
      aEn: 'Every successfully submitted grievance receives a unique tracking token (e.g., RTK-2026-000001). Visit the "Track Complaint" page, enter your Tracking ID and your registered 10-digit mobile number to view real-time inspection updates and timelines.',
      aKn: 'ಪ್ರತಿ ಯಶಸ್ವಿ ದೂರನ್ನು ಸಲ್ಲಿಸಿದ ನಂತರ ವಿಶಿಷ್ಟ ಟ್ರ್ಯಾಕಿಂಗ್ ಟೋಕನ್ (ಉದಾ: RTK-2026-000001) ನೀಡಲಾಗುತ್ತದೆ. "ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ" ಪುಟಕ್ಕೆ ಭೇಟಿ ನೀಡಿ ನಿಮ್ಮ ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ ಮತ್ತು ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ ನೈಜ-ಸಮಯದ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.'
    },
    {
      qEn: 'What happens if the nodal officer fails to resolve within the SLA window?',
      qKn: 'ನಿಗದಿತ ಗಡುವಿನೊಳಗೆ ನೋಡಲ್ ಅಧಿಕಾರಿ ಸಮಸ್ಯೆಯನ್ನು ಬಗೆಹರಿಸದಿದ್ದರೆ ಏನಾಗುತ್ತದೆ?',
      aEn: 'Under Section 8 of the Karnataka Guarantee of Services to Citizens (Sakala) Act 2011, grievances that cross their statutory deadline automatically trigger Level 1–3 hierarchical escalations to Supervisory Engineers and District Magistrates with mandatory daily accountability penalties.',
      aKn: 'ಕರ್ನಾಟಕ ಸಕಾಲ ಕಾಯ್ದೆಯನ್ವಯ, ನಿಗದಿತ ಅವಧಿ ಮೀರಿದ ದೂರುಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹಿರಿಯ ಮೇಲ್ವಿಚಾರಣಾ ಇಂಜಿನಿಯರ್‌ಗಳು ಮತ್ತು ಜಿಲ್ಲಾಧಿಕಾರಿಗಳಿಗೆ ಹಂತ 1-3 ರ ಅಡಿಯಲ್ಲಿ ವರ್ಗಾವಣೆಯಾಗುತ್ತವೆ.'
    },
    {
      qEn: 'Can I reopen a complaint if the physical resolution on the ground is unsatisfactory?',
      qKn: 'ಪರಿಹಾರವು ತೃಪ್ತಿಕರವಾಗಿಲ್ಲದಿದ್ದರೆ ದೂರನ್ನು ಮರುತೆರೆಯಬಹುದೇ?',
      aEn: 'Yes! ResolveTrack enforces a strict Citizen Verification requirement. When an officer reports completion, the ticket is not automatically closed. You can inspect the submitted completion proof and choose either "Accept Resolution" or "Request Further Action" with written reasons and photos.',
      aKn: 'ಖಂಡಿತವಾಗಿ! ಅಧಿಕಾರಿ ಪರಿಹಾರ ವರದಿ ಸಲ್ಲಿಸಿದ ನಂತರ, ನೀವು ಪರಿಶೀಲಿಸಿ ತೃಪ್ತರಾಗದಿದ್ದರೆ "ಹೆಚ್ಚಿನ ಕ್ರಮಕ್ಕಾಗಿ ವಿನಂತಿ" (Reopen) ಆಯ್ಕೆ ಮಾಡಿ ಫೋಟೋ ಸಮೇತ ಮರುಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಬಹುದು.'
    },
    {
      qEn: 'What documents are required to file a civic complaint?',
      qKn: 'ದೂರು ದಾಖಲಿಸಲು ಯಾವ ದಾಖಲೆಗಳು ಬೇಕಾಗುತ್ತವೆ?',
      aEn: 'No physical paperwork is mandatory. You only need your verified contact details and a clear description of the civic issue. Optionally, you can attach site photographs, electricity bills, or revenue receipts (JPG, PNG, PDF) to accelerate zonal triage.',
      aKn: 'ಯಾವುದೇ ಕಡ್ಡಾಯ ಕಾಗದಪತ್ರಗಳ ಅಗತ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ಸಂಪರ್ಕ ವಿವರಗಳು ಮತ್ತು ಸಮಸ್ಯೆಯ ಸ್ಪಷ್ಟ ವಿವರಣೆ ಸಾಕು. ಸ್ಥಳದ ಫೋಟೋ ಅಥವಾ ವಿದ್ಯುತ್ ಬಿಲ್ಲುಗಳನ್ನು ಐಚ್ಛಿಕವಾಗಿ ಲಗತ್ತಿಸಬಹುದು.'
    },
    {
      qEn: 'Can I submit anonymous feedback after resolution?',
      qKn: 'ಪರಿಹಾರದ ನಂತರ ಅನಾಮಧೇಯ ಪ್ರತಿಕ್ರಿಯೆ ನೀಡಬಹುದೇ?',
      aEn: 'Yes. When filling out the 4-criteria CSAT feedback form, you can toggle the "Submit Anonymously" option. Your rating and comments will be delivered directly to the departmental audit desk without disclosing your identity.',
      aKn: 'ಹೌದು. ಪ್ರತಿಕ್ರಿಯೆ ನಮೂನೆಯಲ್ಲಿ "ಅನಾಮಧೇಯವಾಗಿ ಸಲ್ಲಿಸಿ" ಆಯ್ಕೆಯನ್ನು ಬಳಸಬಹುದು. ನಿಮ್ಮ ಗುರುತನ್ನು ಮರೆಮಾಚಿ ಇಲಾಖಾ ಮೇಲ್ವಿಚಾರಕರಿಗೆ ರೇಟಿಂಗ್ ತಲುಪಿಸಲಾಗುತ್ತದೆ.'
    }
  ];

  const helpSteps = [
    {
      step: '1',
      titleEn: 'Register Grievance',
      titleKn: 'ದೂರು ದಾಖಲಿಸಿ',
      descEn: 'Fill out the simple 4-section form with your location and issue details.',
      descKn: 'ನಿಮ್ಮ ಸ್ಥಳ ಮತ್ತು ಸಮಸ್ಯೆಯ ವಿವರಗಳೊಂದಿಗೆ ಸರಳ ನಮೂನೆಯನ್ನು ಭರ್ತಿ ಮಾಡಿ.',
      icon: 'edit_document'
    },
    {
      step: '2',
      titleEn: 'Receive Tracking ID',
      titleKn: 'ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ ಪಡೆಯಿರಿ',
      descEn: 'Get an immutable digital token (RTK-2026-XXXXXX) with instant SMS confirmation.',
      descKn: 'ತ್ವರಿತ ಎಸ್‌ಎಂಎಸ್ ದೃಢೀಕರಣದೊಂದಿಗೆ ವಿಶಿಷ್ಟ ಟೋಕನ್ ಪಡೆಯಿರಿ.',
      icon: 'qr_code_2'
    },
    {
      step: '3',
      titleEn: 'Field Inspection',
      titleKn: 'ಸ್ಥಳ ಪರಿಶೀಲನೆ',
      descEn: 'Assigned nodal engineers inspect the site and upload work completion evidence.',
      descKn: 'ನಿಯೋಜಿತ ಎಂಜಿನಿಯರ್‌ಗಳು ಸ್ಥಳಕ್ಕೆ ಭೇಟಿ ನೀಡಿ ಕಾಮಗಾರಿ ನಡೆಸಿ ಸಾಕ್ಷ್ಯ ಅಪ್‌ಲೋಡ್ ಮಾಡುತ್ತಾರೆ.',
      icon: 'engineering'
    },
    {
      step: '4',
      titleEn: 'Citizen Verification',
      titleKn: 'ನಾಗರಿಕ ದೃಢೀಕರಣ',
      descEn: 'Confirm physical resolution on site or reopen if dissatisfied. Rate your experience.',
      descKn: 'ಪರಿಹಾರವನ್ನು ಪರಿಶೀಲಿಸಿ ಅನುಮೋದಿಸಿ ಅಥವಾ ಮರುಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಿ. ರೇಟಿಂಗ್ ನೀಡಿ.',
      icon: 'verified'
    }
  ];

  const helplines = [
    { name: 'Sakala Citizen Helpline', number: '080-44554455', icon: 'support_agent', hours: '24x7 Toll Free' },
    { name: 'BESCOM Power Redressal', number: '1912', icon: 'bolt', hours: 'Toll Free · 24 Hours' },
    { name: 'BWSSB Drinking Water', number: '1916', icon: 'water_drop', hours: 'Toll Free' },
    { name: 'Municipal BBMP Sahaya', number: '1533', icon: 'domain', hours: 'Emergency Control' },
    { name: 'Emergency Police & Fire', number: '112', icon: 'local_police', hours: 'Instant Dispatch' }
  ];

  return (
    <div className="space-y-12">
      {/* =================================================================== */}
      {/* 1. HERO CIVIC BANNER WITH BILINGUAL TOGGLE & INSTANT SHORTCUTS */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 sm:p-10 lg:p-14 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">

          {/* Statutory Sub-banner & Language Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-mono text-xs font-bold border border-teal-500/30">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Karnataka Sakala Redressal Mandate · Act 2011</span>
            </div>

            {/* In-banner Language Switcher */}
            <LanguageSwitcher />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-headline leading-tight tracking-tight text-white">
            {lang === 'kn'
              ? 'ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ನಿವಾರಣೆ ಮತ್ತು ನೈಜ-ಸಮಯದ ಮೇಲ್ವಿಚಾರಣೆ'
              : 'Direct Civic Grievance Redressal & Accountable Resolution'}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {lang === 'kn'
              ? 'ನಿಮ್ಮ ದೂರುಗಳನ್ನು ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ನೋಡಲ್ ಅಧಿಕಾರಿಗಳಿಗೆ ನೇರವಾಗಿ ಸಲ್ಲಿಸಿ. ಪ್ರತಿ ದೂರಿಗೂ ಕಡ್ಡಾಯ ಕಾಲಮಿತಿ ಮತ್ತು ಎಸ್‌ಎಂಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್ ನೀಡಲಾಗುತ್ತದೆ.'
              : 'Empowering Karnataka citizens with transparent grievance intake, automated nodal engineer routing, binding statutory resolution timelines, and citizen-first verification.'}
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              to="/citizen/register"
              className="px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-headline font-bold text-sm shadow-lg hover:shadow-teal-500/25 transition-all flex items-center gap-2 group"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              <span>{lang === 'kn' ? 'ಹೊಸ ದೂರು ದಾಖಲಿಸಿ' : 'Register New Complaint'}</span>
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>

            <Link
              to="/citizen/track"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-headline font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
              <span>{lang === 'kn' ? 'ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Existing Complaint'}</span>
            </Link>
          </div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* =================================================================== */}
      {/* 2. FOUR QUICK TELEMETRY METRIC CARDS */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'kn' ? 'ಎಸ್‌ಎಲ್‌ಎ ಅನುಸರಣಾ ದರ' : 'Statutory SLA Compliance'}
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-headline text-teal-700 mt-1">94.2%</p>
          <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
            {lang === 'kn' ? 'ಕರ್ನಾಟಕ ಸಕಾಲ ಗುರಿ ಸಾಧಿಸಲಾಗಿದೆ' : 'Karnataka Sakala Target Met'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'kn' ? 'ಸಕ್ರಿಯ ದೂರುಗಳ ಸಂಖ್ಯೆ' : 'Active Grievance Pool'}
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-headline text-slate-900 mt-1">{complaints.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {lang === 'kn' ? 'ಲೈವ್ ಡಿಜಿಟಲ್ ದಾಖಲೆಗಳು' : 'Live Digital Records'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'kn' ? 'ಸರಾಸರಿ ಪರಿಹಾರ ವೇಗ' : 'Avg Redressal Speed'}
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-headline text-teal-700 mt-1">
            {lang === 'kn' ? '2.4 ದಿನಗಳು' : '2.4 Days'}
          </p>
          <span className="text-[11px] font-semibold text-teal-700 mt-1 block">
            {lang === 'kn' ? 'ಸ್ಥಳೀಯ ಗುರಿ: 48 ಗಂಟೆಗಳು' : 'Field Turnaround Target: 48h'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'kn' ? 'ನಾಗರಿಕ ತೃಪ್ತಿ ಅಂಕ (CSAT)' : 'Citizen CSAT Rating'}
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-headline text-amber-600 mt-1 flex items-center gap-1">
            <span>4.8</span>
            <span className="material-symbols-outlined text-2xl text-amber-500 fill-current">star</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {lang === 'kn' ? 'ಪರಿಶೀಲಿಸಿದ ನಾಗರಿಕ ಪ್ರತಿಕ್ರಿಯೆಗಳಿಂದ' : 'From Verified Citizen Audits'}
          </span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. CITIZEN HELP: HOW IT WORKS STEPPER */}
      {/* =================================================================== */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider font-mono">
            {lang === 'kn' ? 'ನಾಗರಿಕ ಮಾರ್ಗದರ್ಶಿ ಸೂಚಿ' : 'Citizen Guidance Matrix'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 mt-1">
            {lang === 'kn' ? 'ದೂರು ಪರಿಹಾರ ಪ್ರಕ್ರಿಯೆ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?' : 'How Does Grievance Redressal Work?'}
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            {lang === 'kn'
              ? 'ದೂರು ದಾಖಲಿಸುವುದರಿಂದ ಹಿಡಿದು ಅಂತಿಮ ಸ್ಥಳ ಪರಿಶೀಲನೆಯವರೆಗೆ, ಪ್ರತಿಯೊಂದು ಹಂತವನ್ನು ಕಾನೂನುಬದ್ಧ ಸೇವಾ ಮಟ್ಟಗಳೊಂದಿಗೆ ಪಾರದರ್ಶಕವಾಗಿ ಪರಿಶೋಧಿಸಲಾಗುತ್ತದೆ.'
              : 'From filing to final on-site verification, every step is transparently audited with binding departmental service levels.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {helpSteps.map((s) => (
            <div key={s.step} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-xl">{s.icon}</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-full">
                    {lang === 'kn' ? `ಹಂತ ${s.step}` : `Step ${s.step}`}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base font-headline">
                  {lang === 'kn' ? s.titleKn : s.titleEn}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {lang === 'kn' ? s.descKn : s.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. OPERATIONAL CATEGORIES DIRECT ACCESS */}
      {/* =================================================================== */}
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider font-mono">
              {lang === 'kn' ? `${COMPLAINT_CATEGORIES.length} ನಾಗರಿಕ ಸೇವಾ ವಿಭಾಗಗಳು` : `${COMPLAINT_CATEGORIES.length} Civic Sectors`}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 mt-1">
              {lang === 'kn' ? 'ಪ್ರಮುಖ ಸೇವಾ ವಿಭಾಗಗಳು' : 'Select Department Category to File'}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              {lang === 'kn'
                ? 'ಸಂಬಂಧಿತ ಇಲಾಖೆಗೆ ನೇರವಾಗಿ ದೂರು ದಾಖಲಿಸಲು ಒಂದು ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
                : 'Select a sector to instantly launch the intake form pre-mapped to the designated department.'}
            </p>
          </div>
          <Link
            to="/citizen/register"
            className="text-teal-700 font-bold text-xs hover:underline hidden sm:flex items-center gap-1"
          >
            <span>{lang === 'kn' ? 'ಎಲ್ಲಾ ಇಲಾಖೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : 'View All Departments'}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COMPLAINT_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/citizen/register?category=${encodeURIComponent(cat.name)}`}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                    {lang === 'kn' ? `ಗಡುವು: ${cat.defaultSlaHours} ಗಂ` : `SLA: ${cat.defaultSlaHours}h Target`}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {lang === 'kn' ? cat.nameKn : cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {cat.subcategories.slice(0, 3).join(' · ')}...
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>{t('navRegister')}</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      {/* =================================================================== */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider font-mono">
            {lang === 'kn' ? 'ಜ್ಞಾನ ಕೋಶ' : 'Knowledge Base'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 mt-1">
            {lang === 'kn' ? 'ಸಾಮಾನ್ಯವಾಗಿ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            {lang === 'kn'
              ? 'ದೂರು ಟ್ರ್ಯಾಕಿಂಗ್, ಕಾನೂನುಬದ್ಧ ಗಡುವುಗಳು, ಮರುತೆರೆಯುವಿಕೆ ಮತ್ತು ನಾಗರಿಕ ಹಕ್ಕುಗಳ ಕುರಿತ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಗಳು.'
              : 'Answers to common queries regarding tracking, statutory deadlines, reopenings, and grievance rights.'}
          </p>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="w-full text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-teal-700 transition-colors"
                >
                  <span>{lang === 'kn' ? faq.qKn : faq.qEn}</span>
                  <span className="material-symbols-outlined text-slate-400 shrink-0">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pr-6 animate-in fade-in">
                    {lang === 'kn' ? faq.aKn : faq.aEn}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 6. EMERGENCY HELPLINES & CONTACT INFORMATION */}
      {/* =================================================================== */}
      <div className="bg-slate-900 text-white p-6 sm:p-10 rounded-3xl shadow-lg border border-slate-800 space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider font-mono">
            {lang === 'kn' ? 'ತುರ್ತು ಸಂಪರ್ಕಗಳು' : 'Emergency Contacts'}
          </span>
          <h2 className="text-2xl font-bold font-headline text-white mt-1">
            {lang === 'kn' ? 'ಸಂಪರ್ಕ ಮತ್ತು 24x7 ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳು' : 'Contact Information & 24x7 Helplines'}
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {lang === 'kn'
              ? 'ನಿಮ್ಮ ಸಮಸ್ಯೆ ತಕ್ಷಣದ ಅಪಾಯ ಅಥವಾ ಆರೋಗ್ಯ ತುರ್ತುಸ್ಥಿತಿಯಾಗಿದ್ದರೆ, ನೇರವಾಗಿ ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳಿಗೆ ಕರೆ ಮಾಡಿ.'
              : 'If your civic issue represents an immediate physical hazard or health crisis, contact emergency helplines directly.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {helplines.map((h, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-lg">{h.icon}</span>
                </div>
                <p className="text-xs font-bold text-slate-200">{h.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{h.hours}</p>
              </div>
              <p className="text-lg font-mono font-extrabold text-teal-300 mt-3">{h.number}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenHome;


