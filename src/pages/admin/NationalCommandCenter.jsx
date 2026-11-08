import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { MetricCard } from '../../components/common/MetricCard';
import { VelocityAreaChart } from '../../components/common/Charts';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DEPARTMENTS } from '../../utils/constants';

export const NationalCommandCenter = () => {
  const { complaints, metrics, escalateComplaint } = useComplaints();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [tableFilter, setTableFilter] = useState('ALL');
  const [tableSearch, setTableSearch] = useState('');

  // Filter complaints for recent register table
  const filteredComplaints = complaints.filter(c => {
    const matchesFilter = tableFilter === 'ALL' || c.status === tableFilter;
    const matchesSearch = tableSearch === '' ||
      c.token.toLowerCase().includes(tableSearch.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(tableSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(tableSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const columns = [
    {
      header: 'Token ID',
      accessor: 'token',
      render: (row) => (
        <div className="flex flex-col">
          <span className={`font-mono font-bold ${row.status === 'OVERDUE' ? 'text-error' : 'text-primary'}`}>
            {row.token}
          </span>
          <span className="text-[10px] text-secondary font-mono">
            {row.citizenIdType}
          </span>
        </div>
      )
    },
    {
      header: 'Citizen & District',
      accessor: 'citizenName',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-on-surface">{row.citizenName}</span>
          <span className="text-secondary text-[12px]">{row.district} · {row.ward}</span>
        </div>
      )
    },
    {
      header: 'Grievance Subject & Department',
      accessor: 'title',
      render: (row) => (
        <div className="flex flex-col max-w-xs">
          <span className="font-medium text-on-surface truncate">
            {lang === 'kn' && row.titleKn ? row.titleKn : row.title}
          </span>
          <span className="text-primary text-[11px] font-semibold">
            {row.departmentName}
          </span>
        </div>
      )
    },
    {
      header: 'Priority / SLA',
      accessor: 'priority',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
            row.hoursRemaining < 0
              ? 'bg-error-container text-on-error-container'
              : row.hoursRemaining <= 4
              ? 'bg-amber-100 text-amber-900'
              : 'bg-surface-container-high text-on-surface'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              row.hoursRemaining < 0 ? 'bg-error animate-ping' : 'bg-primary'
            }`}
          />
          {row.priority} · {row.hoursRemaining < 0 ? `Breached ${Math.abs(row.hoursRemaining)}h` : `${row.hoursRemaining}h left`}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'OVERDUE' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                escalateComplaint(row.token, 'TIER_3', 'Apex Escalation Triggered from Command Desk');
                alert(`Complaint ${row.token} escalated to Tier 3 District Magistrate desk with statutory notice.`);
              }}
              className="px-2.5 py-1 rounded bg-error text-on-error font-body text-label-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Escalate
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/officer/complaints/${row.token}`);
              }}
              className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-primary hover:text-on-primary text-on-surface font-body text-label-sm font-medium transition-colors"
            >
              Details
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Top Header & Real-Time Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-secondary font-mono text-[11px] uppercase tracking-wider">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-semibold">National Overview</span>
            <span className="mx-1 text-outline-variant">·</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Sync active · Telemetry Live
            </span>
          </div>
          <h1 className="font-headline text-headline-xl text-on-surface tracking-tight font-bold">
            National Grievance Command & Redressal Center
          </h1>
        </div>

        {/* Global Quick Action Suite */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            onClick={() => alert('Exporting Official SLA Audit Gazette (PDF / CSV)...')}
            className="px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-body text-label-md font-semibold shadow-sm hover:bg-surface-container transition-all flex items-center gap-1.5 border border-outline-variant/40"
          >
            <span className="material-symbols-outlined text-lg text-secondary">download</span>
            <span>{t('exportReport')}</span>
          </button>

          <button
            onClick={() => navigate('/citizen/register')}
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-headline text-label-md font-bold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>{t('registerGrievance')}</span>
            <span className="px-1.5 py-0.5 rounded bg-on-primary/20 text-on-primary font-mono text-[11px] leading-none ml-1">
              ⌘N
            </span>
          </button>
        </div>
      </div>

      {/* AI Daily Intelligence Digest Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-tertiary-container/15 via-surface-container-low to-primary-container/10 p-space-lg shadow-sm border border-tertiary/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md relative z-10">
          <div className="flex items-start gap-space-md flex-1">
            <div className="w-10 h-10 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>
            <div className="flex flex-col gap-1.5 max-w-4xl">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-headline text-headline-sm text-on-surface font-bold">
                  AI Intelligence Digest
                </span>
                <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-mono text-[10px] uppercase tracking-wide font-bold">
                  Telemetry v2.4
                </span>
                <span className="text-secondary font-body text-label-sm">
                  Processed across 24 Ministries
                </span>
              </div>

              {/* 3 Digest Bullets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-1">
                <div className="flex items-start gap-2 bg-surface-container-lowest/90 p-2.5 rounded-lg shadow-sm border border-outline-variant/30">
                  <span className="w-2 h-2 rounded-full bg-error shrink-0 mt-1.5" />
                  <p className="font-body text-body-sm text-on-surface-variant leading-snug">
                    <strong className="text-on-surface font-semibold">38 complaints</strong> escalated in Sanitation due to monsoon pipeline breach in Sector-4.
                  </p>
                </div>

                <div className="flex items-start gap-2 bg-surface-container-lowest/90 p-2.5 rounded-lg shadow-sm border border-outline-variant/30">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  <p className="font-body text-body-sm text-on-surface-variant leading-snug">
                    <strong className="text-on-surface font-semibold">+14.2% faster turnaround</strong> logged across Public Works highway redressal nodes.
                  </p>
                </div>

                <div className="flex items-start gap-2 bg-surface-container-lowest/90 p-2.5 rounded-lg shadow-sm border border-outline-variant/30">
                  <span className="w-2 h-2 rounded-full bg-tertiary shrink-0 mt-1.5" />
                  <p className="font-body text-body-sm text-on-surface-variant leading-snug">
                    <strong className="text-on-surface font-semibold">2 high-risk repeat</strong> grievances flagged in Power & Energy regional grid substation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch lg:self-center shrink-0 justify-end pt-2 lg:pt-0">
            <button
              onClick={() => navigate('/supervisor/officers')}
              className="px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body text-label-md font-semibold shadow-sm hover:bg-surface-container transition-all flex items-center gap-1.5 border border-outline-variant/40"
            >
              <span className="material-symbols-outlined text-base text-primary">rule</span>
              <span>Review 14 Auto-Assigned</span>
            </button>
            <button
              onClick={() => navigate('/supervisor/reminders')}
              className="px-3.5 py-2 rounded-lg bg-tertiary text-on-tertiary font-body text-label-md font-semibold shadow-sm hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">send_time_extension</span>
              <span>Trigger Bulk Reminders</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Grid KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-md">
        <MetricCard
          title={t('totalComplaints')}
          value={metrics.total.toLocaleString()}
          trend="+8.4%"
          trendPositive={true}
          icon="stacked_bar_chart"
          sparkline={true}
        />
        <MetricCard
          title={t('newComplaints')}
          value={metrics.newToday.toLocaleString()}
          trend="+124 today"
          trendPositive={true}
          icon="mark_chat_unread"
          badgeText="18m avg triage"
        />
        <MetricCard
          title={t('inProgress')}
          value={metrics.inProgress.toLocaleString()}
          icon="hourglass_top"
          accentColor="tertiary"
          progressPercent={68}
          badgeText="68% active audit"
        />
        <MetricCard
          title={t('pendingReview')}
          value={metrics.pending.toLocaleString()}
          icon="assignment_late"
          badgeText="48h SLA gate"
          progressPercent={45}
        />
        <MetricCard
          title={t('overdueTickets')}
          value={metrics.overdue.toLocaleString()}
          icon="crisis_alert"
          isCritical={true}
          trend="32 breached L2"
          trendPositive={false}
          badgeText="High Priority Alert"
          badgeColor="bg-error-container text-on-error-container font-bold"
          onClick={() => navigate('/supervisor/escalations')}
        />
        <MetricCard
          title={t('resolvedTotal')}
          value={metrics.resolved.toLocaleString()}
          icon="verified"
          trend="94.2% CSAT Index"
          trendPositive={true}
          badgeText="+1,120 this week"
          badgeColor="bg-emerald-100 text-emerald-800 font-bold"
        />
      </div>

      {/* Complaint Health Indicators Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md bg-surface-container-low p-space-md rounded-xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold shrink-0">
            <span className="material-symbols-outlined text-xl">verified_user</span>
          </div>
          <div>
            <span className="font-body text-label-sm text-secondary block truncate">National SLA Compliance</span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-bold text-on-surface font-mono text-lg">{metrics.slaCompliance}</span>
              <span className="text-secondary text-[11px]">Target 90%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest shadow-sm">
          <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold shrink-0">
            <span className="material-symbols-outlined text-xl">speed</span>
          </div>
          <div>
            <span className="font-body text-label-sm text-secondary block truncate">First Contact Resolution</span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-bold text-on-surface font-mono text-lg">{metrics.firstContactResolution}</span>
              <span className="text-primary font-mono text-xs">+3.1%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest shadow-sm">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold shrink-0">
            <span className="material-symbols-outlined text-xl">sync_problem</span>
          </div>
          <div>
            <span className="font-body text-label-sm text-secondary block truncate">Escalation Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-bold text-on-surface font-mono text-lg">2.1%</span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-secondary text-[10px] font-mono">Low Risk</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest shadow-sm">
          <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary font-bold shrink-0">
            <span className="material-symbols-outlined text-xl">published_with_changes</span>
          </div>
          <div>
            <span className="font-body text-label-sm text-secondary block truncate">Citizen Re-open Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-bold text-on-surface font-mono text-lg">3.4%</span>
              <span className="text-emerald-700 font-mono text-xs">-0.8% drop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: Inflow Velocity (7 cols) + Department Performance (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Velocity Area Chart */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
              <div>
                <h2 className="font-headline text-headline-sm font-bold text-on-surface">
                  Complaint Inflow & Resolution Velocity
                </h2>
                <p className="font-body text-body-sm text-secondary">
                  30-day telemetry monitoring with real-time intake tracking
                </p>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg text-xs font-mono">
                <span className="px-2.5 py-1 rounded bg-surface-container-lowest text-primary font-bold shadow-sm">
                  Live Intake
                </span>
              </div>
            </div>

            <VelocityAreaChart />
          </div>

          <div className="pt-3 flex items-center justify-between bg-surface-container-low px-4 py-2.5 rounded-lg mt-2 text-body-sm">
            <span className="text-secondary text-xs">Continuous telemetry stream powered by Citizen AI Core</span>
            <button
              onClick={() => navigate('/admin/all-complaints')}
              className="text-primary font-bold text-xs flex items-center gap-1 hover:underline"
            >
              <span>Detailed Inflow Metrics</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right: Department Performance List */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div>
                <h2 className="font-headline text-headline-sm font-bold text-on-surface">
                  Department Performance
                </h2>
                <p className="font-body text-body-sm text-secondary">
                  Redressal quota vs statutory SLA resolution rate
                </p>
              </div>
              <span className="px-2 py-1 rounded bg-surface-container text-secondary font-mono text-[11px] font-bold">
                Active 24
              </span>
            </div>

            <div className="flex flex-col gap-3.5 pt-2">
              {DEPARTMENTS.slice(0, 5).map((dept) => (
                <div key={dept.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-label-md font-semibold text-on-surface truncate">
                      {lang === 'kn' ? dept.nameKn : dept.name}
                    </span>
                    <span
                      className={`font-mono text-label-sm font-bold ${
                        dept.score >= 90 ? 'text-primary' : dept.score >= 80 ? 'text-tertiary' : 'text-error'
                      }`}
                    >
                      {dept.score}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dept.score >= 90 ? 'bg-primary' : dept.score >= 80 ? 'bg-tertiary' : 'bg-error'
                      }`}
                      style={{ width: `${dept.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-secondary font-mono text-[11px]">
                    <span>{dept.active.toLocaleString()} Complaints</span>
                    <span className={dept.score >= 90 ? 'text-primary font-bold' : dept.score < 80 ? 'text-error font-bold' : ''}>
                      {dept.tier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => navigate('/admin/departments')}
              className="w-full py-2.5 rounded-lg bg-surface-container-low text-on-surface font-headline text-label-md font-bold hover:bg-surface-container transition-all flex items-center justify-center gap-1 border border-outline-variant/30"
            >
              <span>{t('viewAllDepartments')}</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Split: Recent Complaints Register (8 cols) & Critical Escalations (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        {/* Left: Recent Complaints Register Table */}
        <div className="xl:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-md">
              <div>
                <h2 className="font-headline text-headline-sm font-bold text-on-surface">
                  Recent Complaints Register
                </h2>
                <p className="font-body text-body-sm text-secondary">
                  National redressed intake with real-time countdown SLA triggers
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Filter token ID..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="h-9 px-3 text-body-sm bg-surface-container-low rounded-lg focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/40 w-36 sm:w-44 font-mono"
                />
                <select
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="h-9 px-2.5 bg-surface-container-low rounded-lg text-body-sm text-on-surface focus:outline-none border border-outline-variant/40 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="ACTION_TAKEN">Action Taken</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredComplaints}
              onRowClick={(row) => navigate(`/officer/complaints/${row.token}`)}
              pageSize={5}
            />
          </div>
        </div>

        {/* Right: Critical Escalations Emergency Card */}
        <div className="xl:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-error/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-error" />
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping" />
                <h2 className="font-headline text-headline-sm font-bold text-on-surface">
                  Critical Escalations
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono text-[11px] font-bold">
                Level 3
              </span>
            </div>
            <p className="font-body text-body-sm text-secondary pb-4">
              Autonomous flags requiring District Magistrate intervention under Sakala Act
            </p>

            <div className="flex flex-col gap-3">
              {complaints.filter(c => c.status === 'OVERDUE' || c.escalationTier !== 'NONE').slice(0, 3).map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/30">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-error">#{item.token}</span>
                    <span className="px-2 py-0.5 rounded bg-error text-on-error font-mono text-[10px] font-bold">
                      Overdue 48h
                    </span>
                  </div>
                  <p className="font-headline font-bold text-on-surface text-body-sm line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-secondary text-[11px] font-mono truncate max-w-[150px]">{item.departmentName}</span>
                    <button
                      onClick={() => navigate(`/supervisor/escalations?token=${item.token}`)}
                      className="px-2.5 py-1 rounded bg-error text-on-error font-body text-label-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      Summon DM
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Deadlines Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2">
                <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                  Follow-up Deadlines
                </h3>
                <span className="text-secondary font-mono text-xs font-bold">Next 24h</span>
              </div>
              <p className="font-body text-body-sm text-secondary pb-4">
                Automated statutory compliance cutoffs
              </p>

              <div className="flex flex-col gap-2.5">
                <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between text-body-sm">
                  <div>
                    <span className="font-bold text-on-surface block">Ward 14 Water Leak Notice</span>
                    <span className="text-xs text-secondary font-mono">Jal Shakti · Er. Sandeep</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-700">4h remaining</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between text-body-sm">
                  <div>
                    <span className="font-bold text-on-surface block">Vidyanagar Meter Audit</span>
                    <span className="text-xs text-secondary font-mono">BESCOM · Naveen Kumar</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-primary">18h remaining</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-outline-variant/20">
              <button
                onClick={() => navigate('/supervisor/reminders')}
                className="text-primary font-bold text-body-sm hover:underline flex items-center gap-1"
              >
                <span>Open Notice Dispatch Engine</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

