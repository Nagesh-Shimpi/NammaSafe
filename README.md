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
├──────────────────────────┴──────────────────────────────┴──────────────────────────────┤
│  4. Intelligent Reminder Centre                         │  5. Citizen Tracking & CSAT  │
│  - Omnichannel Auto-Dispatch (SMS, Email, WhatsApp)     │  - Mobile Identity Gate      │
│  - Bilingual Templates (English & ಕನ್ನಡ)                 │  - 7-Stage Visual Lifecycle  │
│  - Failure Fallback & Retry Queues                      │  - 4-Criteria CSAT & Reopen  │
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

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18 (Hooks, Context API, Suspense) |
| **Build Tool & Bundler** | Vite 5 (Fast HMR, optimized tree-shaken production rollup) |
| **Styling & Design System** | Tailwind CSS 3.4 (Civic Government SaaS design tokens, Deep Navy `#0f172a`, Teal `#0d9488`, Amber `#d97706`, Rose `#e11d48`) |
| **Data Visualizations** | Recharts (Responsive bar charts, pie breakdowns, and SLA compliance gauges) |
| **Typography & Icons** | Plus Jakarta Sans, Inter, JetBrains Mono, Google Material Symbols |
| **State Management** | Centralized in-memory shared state (`ComplaintContext.jsx`) with 61+ seed dockets, CSAT records, and notification streams |
| **Testing** | Node.js verification scripts for data models, identity validation, and workflow state transitions |

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
│   │   ├── admin/                # AllComplaintsView, PendingComplaintsView, OfficerWorkloadView
│   │   ├── citizen/              # CitizenHome, RegisterComplaint, TrackComplaint, CitizenFeedbackPage
│   │   ├── officer/              # OfficerDashboard, AssignedComplaintsView, ComplaintDetailView
│   │   └── supervisor/           # ReminderCentre, OverdueEscalations, SupervisorDashboardView
│   ├── utils/
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
| `/admin/all-complaints` | Administrator | Central management ledger with 8 summary KPI cards and 9-tab dossier inspector |
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
