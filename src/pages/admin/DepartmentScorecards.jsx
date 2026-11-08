import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DEPARTMENTS } from '../../utils/constants';
import { DepartmentBarChart } from '../../components/common/Charts';
import { MetricCard } from '../../components/common/MetricCard';

export const DepartmentScorecards = () => {
  const { lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepts = DEPARTMENTS.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.nameKn.includes(searchTerm) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs max-w-3xl">
          <div className="flex items-center gap-space-xs text-secondary font-mono text-[11px] tracking-wider uppercase">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Ministries & Departments</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Performance Benchmarks & Scorecards</span>
          </div>
          <h1 className="font-headline text-headline-xl text-on-surface tracking-tight font-extrabold flex items-center gap-space-sm">
            <span>Department Performance & Ministry Scorecards</span>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-primary font-mono text-label-sm font-semibold tracking-normal">
              Q3 FY2024-25
            </span>
          </h1>
          <p className="font-body text-body-md text-secondary">
            Comparative redressal efficiency, statutory SLA compliance audits, citizen CSAT satisfaction indexes, and institutional accountability tracking across national ministries.
          </p>
        </div>

        {/* Action Suite */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            onClick={() => alert('Downloading official Gazette Comparative Ranking Report...')}
            className="px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-body text-label-md font-semibold shadow-sm hover:bg-surface-container transition-all flex items-center gap-1.5 border border-outline-variant/40"
          >
            <span className="material-symbols-outlined text-lg text-secondary">download</span>
            <span>Comparative Gazette Report</span>
          </button>
          <button
            onClick={() => alert('Scheduling Apex Performance Hearing with Underperforming Cadres...')}
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-headline text-label-md font-bold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">calendar_clock</span>
            <span>Schedule Performance Hearing</span>
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
        {/* Card 1: Top Ranked */}
        <div className="relative bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs uppercase font-bold tracking-wide">
              Top Ranked Ministry
            </span>
            <span className="material-symbols-outlined text-primary text-2xl">military_tech</span>
          </div>
          <div className="my-3">
            <h3 className="font-headline text-headline-sm font-bold text-on-surface truncate">
              Road Transport & Highways
            </h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-3xl font-extrabold text-primary">94.8</span>
              <span className="font-body text-xs text-secondary">/ 100 Composite</span>
            </div>
          </div>
          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between font-mono text-xs text-secondary">
            <span>SLA Resolved: <strong className="text-on-surface font-bold">96.2%</strong></span>
            <span>Avg: <strong className="text-on-surface font-bold">2.1 Days</strong></span>
          </div>
        </div>

        {/* Card 2: Under Scrutiny Tier */}
        <div className="relative bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-error/30 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-mono text-xs uppercase font-bold tracking-wide flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
              Under Scrutiny Tier
            </span>
            <span className="material-symbols-outlined text-error text-2xl">warning</span>
          </div>
          <div className="my-3">
            <h3 className="font-headline text-headline-sm font-bold text-on-surface truncate">
              Urban Dev. & Municipal Corp
            </h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-3xl font-extrabold text-error">68.4</span>
              <span className="font-body text-xs text-secondary">/ 100 Composite</span>
            </div>
          </div>
          <div className="pt-2 border-t border-error/20 flex items-center justify-between font-mono text-xs text-error font-semibold">
            <span>5,210 Active Load</span>
            <span>412 Overdue Violations</span>
          </div>
        </div>

        {/* Card 3: Aggregate Redressal Index */}
        <div className="relative bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-mono text-xs uppercase font-bold tracking-wide">
              Aggregate Index
            </span>
            <span className="material-symbols-outlined text-secondary text-2xl">insights</span>
          </div>
          <div className="my-3">
            <h3 className="font-headline text-headline-sm font-bold text-on-surface">
              National Redressal Index
            </h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-3xl font-extrabold text-on-surface">88.6%</span>
              <span className="font-mono text-xs text-emerald-700 font-bold ml-1">+3.4% YoY</span>
            </div>
          </div>
          <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden mt-1">
            <div className="bg-primary h-full rounded-full" style={{ width: '88.6%' }} />
          </div>
        </div>

        {/* Card 4: CSAT Rating */}
        <div className="relative bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-xs uppercase font-bold tracking-wide">
              Citizen CSAT
            </span>
            <span className="material-symbols-outlined text-amber-600 text-2xl">star</span>
          </div>
          <div className="my-3">
            <h3 className="font-headline text-headline-sm font-bold text-on-surface">
              Verified CSAT Rating
            </h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-3xl font-extrabold text-amber-600">4.62</span>
              <span className="font-body text-xs text-secondary">/ 5.0 (94.2% Satisfaction)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between font-mono text-xs text-secondary">
            <span>Verified OTP Surveys</span>
            <span className="text-primary font-bold">14,210 Responses</span>
          </div>
        </div>
      </div>

      {/* Chart: Comparative SLA Performance Bar Chart */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
          <div>
            <h2 className="font-headline text-headline-sm font-bold text-on-surface">
              Ministry Redressal Quota vs Target SLA Benchmark (90%)
            </h2>
            <p className="font-body text-body-sm text-secondary">
              Real-time audit performance by ministry portfolio
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-secondary">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Exemplary (&gt;=90%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-tertiary" />Nominal (80-89%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-error" />Under Scrutiny (&lt;80%)</span>
          </div>
        </div>
        <DepartmentBarChart />
      </div>

      {/* Comprehensive 24 Ministry Scorecard Table */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-headline-sm font-bold text-on-surface">
              Ministry Accountability & Scorecard Roster
            </h2>
            <p className="font-body text-body-sm text-secondary">
              Evaluating statutory turnaround, overdue tickets, and public trust indexes
            </p>
          </div>
          <input
            type="text"
            placeholder="Search ministry or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/40 outline-none text-body-sm w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                <th className="py-3 px-4 rounded-l-lg font-semibold">Ministry / Department</th>
                <th className="py-3 px-4 font-semibold">Target SLA</th>
                <th className="py-3 px-4 font-semibold">Active Caseload</th>
                <th className="py-3 px-4 font-semibold">Composite Score</th>
                <th className="py-3 px-4 font-semibold">Accountability Standing</th>
                <th className="py-3 px-4 text-right rounded-r-lg font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filteredDepts.map((d) => (
                <tr key={d.id} className="hover:bg-surface-container-low/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-lg">{d.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">
                          {lang === 'kn' ? d.nameKn : d.name}
                        </span>
                        <span className="font-mono text-xs text-secondary">{d.code} · Central Cadre</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    {d.targetSla} Hours
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <strong className="text-on-surface">{d.active.toLocaleString()}</strong> tickets
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-base ${d.score >= 90 ? 'text-primary' : d.score >= 80 ? 'text-tertiary' : 'text-error'}`}>
                        {d.score}%
                      </span>
                      <div className="w-20 bg-surface-container rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.score >= 90 ? 'bg-primary' : d.score >= 80 ? 'bg-tertiary' : 'bg-error'}`}
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                        d.score >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.score >= 80
                          ? 'bg-surface-container-high text-on-surface-variant'
                          : 'bg-error-container text-on-error-container animate-pulse'
                      }`}
                    >
                      {d.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Opening comprehensive audit dossier for ${d.name}`)}
                      className="px-3 py-1 rounded-lg bg-surface-container-low hover:bg-primary hover:text-on-primary text-on-surface font-body text-label-sm font-semibold transition-colors"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

