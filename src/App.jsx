import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import { CitizenLayout } from './layouts/CitizenLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { SupervisorLayout } from './layouts/SupervisorLayout';
import { OfficerLayout } from './layouts/OfficerLayout';

// Public / Citizen Pages
import { CitizenHome } from './pages/citizen/CitizenHome';
import { CitizenLogin } from './pages/citizen/CitizenLogin';
import { CitizenAuthRegister } from './pages/citizen/CitizenAuthRegister';
import { RegisterComplaint } from './pages/citizen/RegisterComplaint';
import { TrackComplaint } from './pages/citizen/TrackComplaint';
import { CitizenGrievanceDetail } from './pages/citizen/CitizenGrievanceDetail';
import { CitizenFeedbackPage } from './pages/citizen/CitizenFeedbackPage';

// Administrator Pages
import { NationalCommandCenter } from './pages/admin/NationalCommandCenter';
import { AllComplaintsView } from './pages/admin/AllComplaintsView';
import { PendingComplaintsView } from './pages/admin/PendingComplaintsView';
import { DepartmentManagementView } from './pages/admin/DepartmentManagementView';
import { DepartmentScorecards } from './pages/admin/DepartmentScorecards';
import { OfficerWorkloadView } from './pages/admin/OfficerWorkloadView';
import { CommunicationLogsView } from './pages/admin/CommunicationLogsView';
import { ComplaintIntelligenceView } from './pages/admin/ComplaintIntelligenceView';
import { ResolutionVerificationView } from './pages/admin/ResolutionVerificationView';
import { ComplaintAuditSearchView } from './pages/admin/ComplaintAuditSearchView';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { GrievanceHeatmapView } from './pages/admin/GrievanceHeatmapView';
import { SystemSettings } from './pages/admin/SystemSettings';

// Supervisor Pages
import { SupervisorDashboardView } from './pages/supervisor/SupervisorDashboardView';
import { TeamComplaintsView } from './pages/supervisor/TeamComplaintsView';
import { OverdueEscalations } from './pages/supervisor/OverdueEscalations';
import { OfficerRoster } from './pages/supervisor/OfficerRoster';
import { ResolutionApprovalView } from './pages/supervisor/ResolutionApprovalView';
import { ReminderCentre } from './pages/supervisor/ReminderCentre';

// Department Officer Pages
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { AssignedComplaintsView } from './pages/officer/AssignedComplaintsView';
import { ComplaintDetailView } from './pages/officer/ComplaintDetailView';
import { UpdateStatusView } from './pages/officer/UpdateStatusView';
import { FollowUpManagementView } from './pages/officer/FollowUpManagementView';
import { ActionHistoryView } from './pages/officer/ActionHistoryView';

export function App() {
  const { currentRole } = useAuth();

  return (
    <Routes>
      {/* Root redirect to Citizen view */}
      <Route path="/" element={<Navigate to="/citizen" replace />} />

      {/* 1. Public / Citizen Portal Routes */}
      <Route path="/citizen" element={<CitizenLayout />}>
        <Route index element={<CitizenHome />} />
        <Route path="login" element={<CitizenLogin />} />
        <Route path="auth-register" element={<CitizenAuthRegister />} />
        <Route path="register-account" element={<CitizenAuthRegister />} />
        <Route path="register" element={<RegisterComplaint />} />
        <Route path="track" element={<TrackComplaint />} />
        <Route path="complaints/:id" element={<CitizenGrievanceDetail />} />
        <Route path="feedback/:id" element={<CitizenFeedbackPage />} />
        <Route path="feedback" element={<CitizenFeedbackPage />} />
      </Route>

      {/* 2. Administrator Command Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview" element={<NationalCommandCenter />} />
        <Route path="all-complaints" element={<AllComplaintsView />} />
        <Route path="complaints" element={<AllComplaintsView />} />
        <Route path="complaint-management" element={<AllComplaintsView />} />
        <Route path="complaints/:id" element={<ComplaintDetailView />} />
        <Route path="pending" element={<PendingComplaintsView />} />
        <Route path="pending-complaints" element={<PendingComplaintsView />} />
        <Route path="overdue" element={<OverdueEscalations />} />
        <Route path="overdue-complaints" element={<OverdueEscalations />} />
        <Route path="department-management" element={<DepartmentManagementView />} />
        <Route path="departments" element={<DepartmentScorecards />} />
        <Route path="department-performance" element={<DepartmentScorecards />} />
        <Route path="ministry-scorecards" element={<DepartmentScorecards />} />
        <Route path="officers-directory" element={<OfficerRoster />} />
        <Route path="officer-workload" element={<OfficerWorkloadView />} />
        <Route path="reminders" element={<ReminderCentre />} />
        <Route path="reminder-centre" element={<ReminderCentre />} />
        <Route path="communication-logs" element={<CommunicationLogsView />} />
        <Route path="complaint-intelligence" element={<ComplaintIntelligenceView />} />
        <Route path="complaint-audit" element={<ComplaintAuditSearchView />} />
        <Route path="audit-search" element={<ComplaintAuditSearchView />} />
        <Route path="resolution-verification" element={<ResolutionVerificationView />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="heatmap" element={<GrievanceHeatmapView />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* 3. Supervisor Oversight Routes */}
      <Route path="/supervisor" element={<SupervisorLayout />}>
        <Route index element={<Navigate to="/supervisor/dashboard" replace />} />
        <Route path="dashboard" element={<SupervisorDashboardView />} />
        <Route path="team-complaints" element={<TeamComplaintsView />} />
        <Route path="complaints/:id" element={<ComplaintDetailView />} />
        <Route path="complaint-audit" element={<ComplaintAuditSearchView />} />
        <Route path="overdue-monitoring" element={<OverdueEscalations />} />
        <Route path="escalations" element={<OverdueEscalations />} />
        <Route path="escalation-review" element={<OverdueEscalations />} />
        <Route path="officers" element={<OfficerRoster />} />
        <Route path="officer-performance" element={<OfficerRoster />} />
        <Route path="department-performance" element={<DepartmentScorecards />} />
        <Route path="scorecards" element={<DepartmentScorecards />} />
        <Route path="complaint-intelligence" element={<ComplaintIntelligenceView />} />
        <Route path="resolution-approval" element={<ResolutionApprovalView />} />
        <Route path="reminders" element={<ReminderCentre />} />
        <Route path="reminder-centre" element={<ReminderCentre />} />
      </Route>

      {/* 4. Department Officer Triage Routes */}
      <Route path="/officer" element={<OfficerLayout />}>
        <Route index element={<Navigate to="/officer/dashboard" replace />} />
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="assigned-complaints" element={<AssignedComplaintsView />} />
        <Route path="all-complaints" element={<AllComplaintsView />} />
        <Route path="heatmap" element={<GrievanceHeatmapView />} />
        <Route path="complaints/:id" element={<ComplaintDetailView />} />
        <Route path="update-status/:id" element={<UpdateStatusView />} />
        <Route path="update-status" element={<UpdateStatusView />} />
        <Route path="follow-up-management" element={<FollowUpManagementView />} />
        <Route path="action-history" element={<ActionHistoryView />} />
      </Route>

      {/* Fallback to Citizen Home */}
      <Route path="*" element={<Navigate to="/citizen" replace />} />
    </Routes>
  );
}

export default App;
