# NammaSafe (ResolveTrack) · Civic Grievance Redressal & Cadre Accountability Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Mission](https://img.shields.io/badge/Mission-Karnataka_Sakala_Act-orange.svg)]()
[![Build Status](https://img.shields.io/badge/Build-Passing_0_Errors-brightgreen.svg)]()

> **NammaSafe (ResolveTrack)** is an enterprise-grade civic grievance redressal, officer workload distribution, automated escalation intelligence, and citizen feedback platform engineered for public administration, municipal corporations, and state government departments across Karnataka.

---

## 🏛️ Platform Architecture & 5 Core Modules

NammaSafe unites citizen participation with administrative accountability across five production-grade modules:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 NammaSafe Architecture                                 │
├──────────────────────────┬──────────────────────────────┬──────────────────────────────┤
│  1. Citizen Intake       │  2. Workload & Reassignment  │  3. Overdue & Escalation     │
│  - 4-Section Registration│  - Cadre Capacity Gauges     │  - SLA Breach Monitoring     │
│  - Dynamic 11 Sectors    │  - Overload Warning Triggers │  - Level 1-3 Escalations     │
│  - GPS & File Attachment │  - 4-Step Reassignment Modal │  - Statutory Penalty Ledger  │
├──────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│  4. Reminder Centre      │  5. Citizen Tracking & CSAT  │  6. Resolution Audit Dossier │
│  - Omnichannel Dispatch  │  - Mobile Identity Gate      │  - 11-Tab Dossier Inspector  │
│  - Bilingual Templates   │  - 7-Stage Visual Lifecycle  │  - Immutable Audit Gazette   │
│  - Fallback Retry Queue  │  - 4-Criteria CSAT & Reopen  │  - Explainable Health Scores │
├──────────────────────────┴──────────────────────────────┴──────────────────────────────┤
│  7. Department Performance & Ministry Scorecards                                       │
│  - Weighted Composite Ranking (35% Res + 30% SLA + 20% CSAT + 15% Inverted Overdue)    │
│  - Side-by-Side Multi-Department Comparison Matrix & Comparative Recharts Bar Charts   │
│  - Nodal Cadre Caseload Adherence & Turnaround Speed Analytics                         │
│  - Automated CSV Exporters & Official Gazette Ministry Scorecard Printer               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Platform Modules in Detail

### 1. Complaint Registration & Management
- **Section A: Citizen Identification**: Full name, 10-digit mobile number, email, gender, postal address, Karnataka district selector (auto-syncing taluks), ward, and PIN code.
- **Section B: Grievance Scrutiny**: 11 statutory categories (Roads & Infrastructure, Water Supply, Electricity, Sanitation, Public Health, Education, Revenue & Land Records, Public Distribution System, Municipal Services, Transportation, Other Government Services), auto-mapped departments, and perceived urgency.
- **Section C: Supporting Evidence**: Drag-and-drop file upload simulator supporting JPEG, PNG, and PDF files.
- **Section D: Statutory Legal Declaration**: Citizen legal affirmation and privacy consent with double-click submission guards.
- **Canonical Sequential Tracking IDs**: Auto-generated sequential tokens (`RTK-2026-000001`, `RTK-2026-000002`...) with instant clipboard copy and printable gazette receipts.

### 2. Officer Workload & Nodal Reassignment
- **Cadre Capacity Distribution**: Real-time visual workload distribution classifying officers into *Balanced*, *High Workload*, *Overloaded*, or *Available Capacity*.
- **Configurable Workload Thresholds**: Clear indicators preventing overburdening nodal officers while prioritizing unassigned grievances.
- **4-Step Guided Reassignment**: Evaluates departmental affinity, active caseloads, previous assignments, and requires administrative supervisor sign-off with audit logging.

### 3. Overdue Complaints & Intelligent Escalation Management
- **Proactive SLA Clock**: Color-coded countdown timers flagging complaints approaching their follow-up deadlines (24h/48h).
- **Statutory Liability Exposure**: Calculates accrued daily fines under Section 8 of the Karnataka Sakala Mission.
- **Level 1–3 Hierarchical Escalation**: Automated promotion of stalled dockets from Nodal Officer (L1) to Executive Engineer / Zonal Commissioner (L2) and Principal Secretary (L3).

### 4. Intelligent Reminder Centre
- **Autonomous Dispatch Scheduler**: Tracks upcoming, due-today, and missed deadlines across municipal cadres.
- **Omnichannel Simulation**: Real-time logging of SMS, Email, WhatsApp, and IVR notifications.
- **Bilingual Template Interpolation**: Dynamic generation of English and Kannada notifications with custom placeholders (`{complaint_id}`, `{citizen_name}`, `{days_overdue}`).
- **Retry Queue & Delivery Diagnostics**: Automated handling of failed delivery attempts with delivery log inspection.

### 5. Citizen Tracking & Feedback Portal
- **Citizen Home Portal (`/citizen`)**: Bilingual hero banner (English/Kannada), Sakala Mission benchmarks, 4-step civic guide, 11 sector routing links, 5-question interactive FAQ accordion, and 24x7 emergency helplines directory (112, 100, 1912, 1533, 1098).
- **Two-Factor Identity Verification (`/citizen/track`)**: Dual verification requiring BOTH Complaint Tracking ID (`RTK-2026-XXXXXX` or `GRV-2024-XXXX`) AND the registered 10-digit mobile phone number.
- **7-Stage Visual Lifecycle Stepper**: Clear progress tracking through *Registered* → *Under Verification* → *Verified* → *Cadre Assigned* → *In Progress* → *Resolution Ready* → *Closed/Reopened*.
- **Citizen Activity Timeline**: Chronological events stream with automatic masking of internal confidential notes and supervisor scrutiny.
- **Additional Information Workflow**: Responsive prompt when officers request documents, complete with explanation input, evidence file upload, and instant status reactivation.
- **Multi-Category Citizen Notification Stream**: 8 notification categories (*Registration, Verification, Assignment, Info Request, Escalation, Resolution, Feedback, Reopened*) with unread badges and mark-as-read actions.
- **Resolution Review & 4-Criteria CSAT Feedback**:
  - **Confirm Resolution**: Citizens formally accept the redressal, recording statutory closure dates and launching the 4-criteria CSAT rating.
  - **Request Further Action (Reopen)**: Citizens dispute substandard work by selecting defect categories, writing explanations, and attaching photo proof. Preserves original Tracking ID, alerts supervisors, and increments assigned officer caseload.
  - **Structured CSAT**: 4 independent 5-star criteria (*Overall Satisfaction, Resolution Quality, Officer Responsiveness, Redressal Timeliness*), category choice, written comments, anonymous submission toggle, and duplicate prevention.
- **"My Complaints" Citizen Ledger**: Instant overview of all past grievances registered under the verified phone number with one-click status inspection.

### 6. Complaint Details & Resolution Audit
- **Prominent Intelligence Header**: Real-time display of Tracking ID, Title, Status, Priority, Registration & Last Updated timestamps, Assigned Department, and Assigned Nodal Officer with quick action bar (*Edit Complaint, Assign/Reassign Officer, Update Status, Add Officer Action, Issue Reminder, Submit Resolution, Citizen Review, Print Gazette*).
- **Explainable Health Indicators**: Transparent rule-based indicators for *Deadline Health (Green/Amber/Red)*, *Follow-up Health (On Track/Due Today/Overdue)*, *Escalation Risk (Low/Moderate/High/Critical)*, *Citizen Satisfaction*, and *Resolution Progress (0–100%)* with granular justifications.
- **11-Tab Comprehensive Information Sections**:
  - `1. Overview`: Core metadata, district/ward jurisdiction, GIS coordinates, language preference, submission channel.
  - `2. Citizen Info`: Protected complainant details with role-based Aadhaar / PII data masking toggle.
  - `3. Dept & Cadre`: Department SLAs, assigned nodal officer, designation, active caseload meter, and rebalancing audit records.
  - `4. Officer Actions`: Field inspections, contractor notices, material procurements, and laboratory sampling notes with documents.
  - `5. Reminders`: Omnichannel notification history, delivery status, and retriggering actions.
  - `6. Escalations`: Hierarchical Level 1–3 escalation triggers and accrued statutory liability under Section 8.
  - `7. Communications`: Comprehensive SMS, Email, and WhatsApp audit trail with gateway delivery status.
  - `8. Resolution & CSAT`: Remediation summary, category, completion date, technical documents, citizen acceptance status, 4-criteria CSAT ratings, and reopen history.
  - `9. Complete Timeline`: Filterable 19-event lifecycle activity ledger sorted chronologically by date and actor.
  - `10. Audit Gazette`: Strictly append-only, tamper-evident log distinguishing certified events from simulated dispatches.
  - `11. Document Vault`: Centralized storage for photographic evidence, PDF inspection reports, and resolution certificates.
- **Centralized Complaint Audit Search (`/admin/complaint-audit`)**: Multi-dimensional search across tracking tokens, citizen identities, departments, nodal officers, statuses, priorities, and filing date ranges with sorting and pagination.

### 7. Department Performance & Ministry Scorecards
- **Ministry Executive Telemetry**: 8 interactive KPI cards (*Total Intake, Resolved Redressals, Active Field Load, Overdue Violations, Resolution Rate %, Average Turnaround Days, Active Escalations, Verified CSAT Rating*) with safe mathematical calculations and clear denominators.
- **Official Performance Roster & Composite Score**: Ranking table with weighted formula: `Composite = (Resolution Rate × 35%) + (SLA Compliance × 30%) + (CSAT / 5.0 × 100 × 20%) + ((100 - Overdue Rate) × 15%)`. Categorizes departments into *Excellent (≥85)*, *Good (70–84.9)*, *Needs Improvement (50–69.9)*, and *Critical (<50)* tiers.
- **Side-by-Side Department Comparison**: Interactive comparison tool allowing administrators to select 2 to 5 departments to benchmark side-by-side using comparative Recharts bar charts and tabular metrics.
- **Nodal Cadre Caseload & Turnaround Analytics**: Comprehensive officer performance monitoring tracking assigned caseloads, resolution rates, follow-up checkpoint compliance, and workload balance status (*Balanced*, *High Workload*, *Overloaded*).
- **Statutory SLA & Escalation Dashboard**: Detailed breakdown of tickets within deadline, approaching SLA (<24h), and overdue breaches, including accrued Section 8 statutory penalty calculations.
- **Verified CSAT & Public Trust Index**: Star rating distribution breakdown (1 to 5 Stars), positive/negative sentiment percentages, and department-wise satisfaction scores excluding missing feedback.
- **Longitudinal Trend Analysis**: Time-series visualization grouping live complaint timestamps into monthly trajectories for intake, resolution, and overdue backlog.
- **Enterprise CSV Exporters & Printable Gazette**: One-click demonstration export to CSV for department scorecards, officer caseloads, overdue audit logs, and citizen CSAT surveys, plus official printable gazette layouts.

### 8. Kannada & English Multilingual Support + Language Detection & Translation Aid
- **Bilingual Global UI (`en` / `kn`)**: Instant switcher (`270+` paired English & Kannada keys, `47` standardized Karnataka civic glossary terms, bilingual notification templates, `Noto Sans Kannada` font rendering) with `localStorage` persistence.
- **Deterministic Script Detection & Translation Aid (`languageDetector.js`)**: Automatically identifies whether incoming citizen text is English, Kannada (`\u0C80-\u0CFF`), or Bilingual Mixed as citizens type, and provides officers an explainable rule-based English/Kannada keyword summary side-by-side in Complaint Details without overwriting original citizen text.

### 9. Complaint Intelligence & Smart Decision Support (`/admin/complaint-intelligence`)
- **Transparent Heuristic Engine (`intelligenceEngine.js`)**: Zero external/paid AI dependencies; computes explainable Department suggestions, Category predictions, Priority urgency rules, Duplicate & Similar ticket detection, 0–100 Complaint Health Scores, Escalation Risk queues, and Officer Suitability scores.
- **Human-in-the-Loop Governance**: Recommendations never mutate tickets automatically; administrators review, accept, or override recommendations with complete decision audit logs.

### 10. Pilot Use Case — Police Department & Public Safety (SOLVATHON 2026 Aligned)
- **Dedicated Police Pilot Category & Roster**: Covers *Cybercrime and online fraud*, *Financial fraud*, *Lost property*, *Public safety and traffic-related complaints*, and *Complaints involving individuals* mapped to `Home Affairs & Public Safety` (`dept-8`, `RTK-2026-000062`–`000066`).
- **Strict Non-FIR / Tracking-Only Advisory**: Prominent statutory boundary banners confirm that the platform supports grievance registration, follow-up, reminders, and SLA tracking only—allegations, offences, and FIR decisions rest strictly with authorized Police officials.

### 11. Role-Based Access Control (RBAC) & Local Persistence
- **Route & Action Guards (`RoleGuard.jsx`)**: Protects `/admin/*`, `/supervisor/*`, and `/officer/*` layouts and blocks unauthorized mutations inside state handlers.
- **Reload-Safe Local Store + Seed Reset**: Persists registered tickets, assignments, reminders, escalations, CSAT ratings, and audit logs to `localStorage` (`resolvetrack_demo_state_v2`) with one-click reset inside `/admin/settings`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18 (Hooks, Context API, Suspense) |
| **Build Tool & Bundler** | Vite 5 (Fast HMR, optimized tree-shaken production rollup) |
| **Styling & Design System** | Tailwind CSS 3.4 (Civic Government SaaS design tokens, Deep Navy `#0f172a`, Teal `#0d9488`, Amber `#d97706`, Rose `#e11d48`) |
| **Data Visualizations** | Recharts (Responsive bar charts, pie breakdowns, and SLA compliance gauges) |
| **Typography & Icons** | Plus Jakarta Sans, Inter, Noto Sans Kannada, JetBrains Mono, Google Material Symbols |
| **State Management** | Centralized React shared state (`ComplaintContext.jsx`) synced with `localStorage` (`66` seed dockets including Police Pilot cases, CSAT records, and audit streams) |
| **Testing** | Node.js verification suites + headless Chromium CDP 25-scenario end-to-end test matrix |

---

## 📂 Project Directory Structure

```text
NammaSafe/
├── public/                       # Static public assets & favicons
├── src/
│   ├── assets/                   # Brand assets and images
│   ├── components/
│   │   ├── common/               # Shared UI (Navbar, Sidebar, DataTable, StatusBadge, PriorityBadge, Breadcrumb)
│   │   ├── complaints/           # ComplaintDetailsModal (9-Tab Dossier Inspector)
│   │   └── modals/               # NodalReassignmentModal (4-Step Guided Reassignment)
│   ├── context/
│   │   ├── AuthContext.jsx       # Multi-role RBAC (Citizen, Administrator, Officer, Supervisor)
│   │   ├── ComplaintContext.jsx  # Unified platform state, lifecycle methods & citizen portal API
│   │   └── LanguageContext.jsx   # English & Kannada bilingual localization
│   ├── data/
│   │   ├── auditLogsData.js      # Immutable audit gazette records (Sakala compliance)
│   │   ├── citizenNotificationsData.js # Seed citizen multi-category notification records
│   │   ├── complaintCategories.js# 11 Government categories, subcategories & Karnataka districts
│   │   ├── complaintsData.js     # 61+ realistic mock grievance dockets with full audit trails
│   │   ├── departmentsData.js    # Departmental metadata, SLAs, and contact emails
│   │   ├── feedbackData.js       # Seed 4-criteria CSAT ratings and comments
│   │   ├── officersData.js       # Officer roster, active caseloads, capacity thresholds
│   │   ├── overdueComplaints.js  # Overdue dockets & follow-up schedules
│   │   ├── reminderRecords.js    # Multi-channel reminder audit trail
│   │   └── reminderTemplates.js  # Bilingual English/Kannada reminder notification templates
│   ├── layouts/                  # Role-based layouts (AdminLayout, CitizenLayout, SupervisorLayout, OfficerLayout)
│   ├── pages/
│   │   ├── admin/                # AllComplaintsView, PendingComplaintsView, OfficerWorkloadView, ComplaintAuditSearchView
│   │   ├── citizen/              # CitizenHome, RegisterComplaint, TrackComplaint, CitizenFeedbackPage
│   │   ├── officer/              # OfficerDashboard, AssignedComplaintsView, ComplaintDetailView
│   │   └── supervisor/           # ReminderCentre, OverdueEscalations, SupervisorDashboardView
│   ├── utils/
│   │   ├── analyticsCalculations.js # Statistical, composite scoring, CSAT & CSV export engines
│   │   ├── constants.js          # Status matrix, valid transitions, priority configs
│   │   └── trackingIdGenerator.js# RTK-2026-XXXXXX sequential generator
│   ├── App.jsx                   # Central declarative router
│   ├── index.css                 # Custom civic styles & Tailwind directives
│   └── main.jsx                  # Application entry point
├── scratch/                      # Automated validation test scripts
├── package.json                  # NPM scripts and dependencies
├── tailwind.config.js            # Tailwind typography, theme extensions & color scales
├── vite.config.js                # Vite build and dev configuration
└── README.md                     # Comprehensive platform documentation
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Nagesh-Shimpi/NammaSafe.git
   cd NammaSafe
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application launches on `http://localhost:3000/`.

4. **Production Build & Verification**:
   ```bash
   npm run build
   ```
   Generates optimized, production-ready static assets in `/dist`.

---

## 🧪 Interactive Routes & User Roles

Switch roles easily using the top-bar profile switcher or navigate directly:

| Route | Primary Audience | Key Functionality |
|---|---|---|
| `/citizen` | Citizen | Citizen landing portal with bilingual guide, FAQ accordion, sector directory & helplines |
| `/citizen/track` | Citizen | Dual identity verification gate, 7-stage lifecycle stepper, timeline, alerts & CSAT |
| `/citizen/feedback/:id` | Citizen | Dedicated CSAT verification (4 criteria) & dispute reopening workflow |
| `/citizen/register` | Citizen | 4-section grievance registration form with token acknowledgement |
| `/admin/all-complaints` | Administrator | Central management ledger with 8 summary KPI cards and 11-tab dossier inspector |
| `/admin/complaints/:id` | Admin / Officer / Supervisor | Comprehensive 11-tab complaint audit dossier with explainable health scores |
| `/admin/complaint-audit` | Administrator / Supervisor | Centralized multi-dimensional audit search with filters, sorting, and pagination |
| `/admin/pending-complaints` | Administrator | Triage & verification desk to certify, request info, or reject dockets |
| `/admin/officer-workload` | Administrator / Supervisor | Cadre workload distribution analytics & 4-step guided nodal reassignment |
| `/supervisor/reminder-centre`| Supervisor | Intelligent reminder centre with omnichannel dispatch & retry queue |
| `/supervisor/overdue-monitoring` | Supervisor | Overdue tracking, Level 1–3 escalations & statutory penalty ledger |

---

## 🔒 Security, Compliance & Data Governance

- **Aadhaar / PII Data Masking**: Citizen phone numbers and personal IDs are automatically masked (`+91 98402 •••• 1928`) in administrative and public audit views.
- **Confidential Note Shielding**: Internal supervisory discussions, fraud investigations, and confidential notes are automatically suppressed from public citizen timelines.
- **Audit Gazette Integrity**: Rejected complaints, reopenings, and officer actions are never silently deleted; every transaction is chronologically recorded with responsible user stamps.
- **Immutable Tracking Tokens**: Reopening a complaint or requesting further action strictly preserves the original tracking ID (`RTK-2026-XXXXXX` / `GRV-2024-XXXX`).
- **Strict Status Transitions**: The application enforces the Karnataka Redressal State Machine:
  `NEWLY_REGISTERED` → `PENDING_VERIFICATION` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` / `REOPENED`.

---

## 📄 License & Attribution

Developed under the **MIT License**. Created for modernizing digital governance, civic transparency, and citizen grievance redressal platforms in Karnataka.
