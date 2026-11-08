import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { MetricCard } from '../../components/common/MetricCard';
import { VelocityAreaChart, DepartmentBarChart, CategoryPieChart } from '../../components/common/Charts';
import { DISTRICTS, DEPARTMENTS } from '../../utils/constants';

export const AnalyticsDashboard = () => {
  const { metrics, complaints } = useComplaints();
  const { lang, t } = useLanguage();
  const [selectedTimeRange, setSelectedTimeRange] = useState('30D');

  const districtDistribution = [
    { name: 'Bengaluru Urban', count: 18420, rate: '94.2%', avgDays: '2.1' },
    { name: 'Mysuru', count: 6840, rate: '92.8%', avgDays: '2.4' },
    { name: 'Belagavi', count: 5910, rate: '86.4%', avgDays: '3.6' },
    { name: 'Hubballi-Dharwad', count: 5210, rate: '88.1%', avgDays: '3.1' },
    { name: 'Mangaluru', count: 4890, rate: '95.6%', avgDays: '1.9' },
    { name: 'Kalaburagi', count: 4120, rate: '82.5%', avgDays: '4.2' },
    { name: 'Tumakuru', count: 2901, rate: '89.4%', avgDays: '2.8' },
  ];

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-secondary font-mono text-[11px] uppercase tracking-wider">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">National Telemetry & Analytics</span>
          </div>
          <h1 className="font-headline text-headline-xl text-on-surface tracking-tight font-extrabold mt-1">
            Grievance Redressal Analytics & Intelligence
          </h1>
          <p className="font-body text-body-md text-secondary">
            Multi-dimensional comparative metrics, statutory SLA adherence, and district-level redressal velocities.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/40 text-xs font-mono">
          {['7D', '30D', '90D', 'YTD'].map(range => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${selectedTimeRange === range
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-secondary hover:text-on-surface'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <MetricCard
          title="Total Resolved Cases"
          value={metrics.resolved.toLocaleString()}
          trend="+12.4% vs prev period"
          trendPositive={true}
          icon="verified"
          badgeText="94.2% CSAT"
          badgeColor="bg-emerald-100 text-emerald-800 font-bold"
        />
        <MetricCard
          title="First Contact Resolution (FCR)"
          value={metrics.firstContactResolution}
          trend="+3.1% lift"
          trendPositive={true}
          icon="speed"
          badgeText="Target 40% Met"
          progressPercent={42}
        />
        <MetricCard
          title="Citizen Reopen Rate"
          value="3.4%"
          trend="-0.8% drop"
          trendPositive={true}
          icon="published_with_changes"
          accentColor="tertiary"
          badgeText="Low Dispute Risk"
        />
        <MetricCard
          title="Avg Redressal Speed"
          value="2.4 Days"
          trend="0.6d faster"
          trendPositive={true}
          icon="timer"
          badgeText="SLA: <= 3.0d"
          badgeColor="bg-primary-fixed text-on-primary-fixed-variant font-bold"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Velocity Chart (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div>
                <h2 className="font-headline text-headline-sm font-bold text-on-surface">
                  Intake vs Resolution Velocity
                </h2>
                <p className="font-body text-body-sm text-secondary">
                  Continuous inflow trend compared with verified closure rates
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">
                Peak: 312/day
              </span>
            </div>
            <VelocityAreaChart />
          </div>
        </div>

        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div>
                <h2 className="font-headline text-headline-sm font-bold text-on-surface">
                  Grievance Breakdown by Sector
                </h2>
                <p className="font-body text-body-sm text-secondary">
                  Distribution of total registered caseload
                </p>
              </div>
              <span className="material-symbols-outlined text-secondary">pie_chart</span>
            </div>
            <CategoryPieChart />
          </div>
        </div>
      </div>

      {/* District-wise Redressal Telemetry Table */}
      <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
        <div>
          <h2 className="font-headline text-headline-sm font-bold text-on-surface">
            District Performance & Redressal Standings
          </h2>
          <p className="font-body text-body-sm text-secondary">
            Zonal ombudsman oversight across Karnataka and national administrative regions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                <th className="py-3 px-4 rounded-l-lg font-semibold">District Name</th>
                <th className="py-3 px-4 font-semibold">Total Intake</th>
                <th className="py-3 px-4 font-semibold">SLA Adherence Rate</th>
                <th className="py-3 px-4 font-semibold">Avg. Resolution Time</th>
                <th className="py-3 px-4 text-right rounded-r-lg font-semibold">Accountability Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {districtDistribution.map((d, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">location_on</span>
                    <span>{d.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium">
                    {d.count.toLocaleString()} cases
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-primary">{d.rate}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {d.avgDays} Days
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${parseFloat(d.rate) >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                        }`}
                    >
                      {parseFloat(d.rate) >= 90 ? 'Exemplary' : 'Nominal Triage'}
                    </span>
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

